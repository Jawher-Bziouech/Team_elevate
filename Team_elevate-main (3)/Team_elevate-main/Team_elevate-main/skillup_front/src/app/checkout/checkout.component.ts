import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

/**
 * Plan configuration: maps plan name → price + displayed benefits.
 * Prices are in Tunisian Dinars (DT). The backend converts to EUR for Stripe.
 */
const PLAN_INFO: Record<string, { label: string; price: number; benefits: string[] }> = {
  BASIC: {
    label: 'Basic',
    price: 9.99,
    benefits: ['Browse all companies', 'See company email addresses', 'View open job positions']
  },
  PRO: {
    label: 'Pro',
    price: 19.99,
    benefits: ['Everything in Basic', 'See company phone numbers', 'Full contact info revealed', 'Access log tracking']
  }
};

// All requests go through the API Gateway (port 9090), not directly to microservices
const GATEWAY_URL = 'http://localhost:9090/api/payments';  // Payment MS (via gateway)

/**
 * Checkout Component — Stripe payment UI for premium plan upgrades.
 *
 * Full payment flow implemented here:
 *
 *   1. ngOnInit:   Read ?plan=BASIC (or PRO) from URL query params
 *   2. ngAfterViewInit:
 *        → POST /api/payments/create-intent  (backend creates Stripe PaymentIntent)
 *        ← receives: clientSecret, paymentIntentId, publishableKey
 *        → loadStripe(publishableKey)         (loads Stripe.js from Stripe's CDN)
 *        → stripe.elements().create('card')   (renders secure hosted card input)
 *        → cardElement.mount('#stripe-card-element')  (injects form into DOM)
 *
 *   3. submit():
 *        → stripe.confirmCardPayment(clientSecret, { card, billingDetails })
 *           Card data is sent directly to Stripe — our server never sees it (PCI safe)
 *        ← Stripe returns paymentIntent.status = "succeeded" / "requires_action" / error
 *
 *   4. On success:
 *        → POST /api/payments/record-stripe   (backend verifies + saves to DB)
 *        → PUT  /users/{id}/upgrade-plan?plan=PRO  (upgrades user's plan in User MS)
 *        ← Shows success screen with payment reference
 *
 * Why Stripe Elements (hosted card UI)?
 *   Stripe renders the card input inside an iframe from stripe.com.
 *   This means the card number never touches our frontend code or our servers.
 *   Stripe handles all PCI-DSS compliance requirements.
 */
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  plan = '';
  planInfo: { label: string; price: number; benefits: string[] } | null = null;

  cardHolder = '';

  // Stripe SDK objects — created lazily in ngAfterViewInit
  private stripe: Stripe | null = null;           // main Stripe instance
  private elements: StripeElements | null = null; // factory for UI widgets
  private cardElement: StripeCardElement | null = null; // the hosted card input

  // UI state flags
  stripeReady = false;    // true once card element is mounted and ready
  processing = false;     // true while awaiting Stripe / backend response
  paymentError = '';      // shown in red below the card form
  success = false;        // true on successful payment — shows confirmation screen
  paymentRef = '';        // Stripe PaymentIntent ID or our DB reference

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Read the plan from URL: /checkout?plan=BASIC
    this.plan = this.route.snapshot.queryParamMap.get('plan') || '';
    this.planInfo = PLAN_INFO[this.plan] || null;
    // Guard: redirect if plan is invalid or user is not logged in
    if (!this.planInfo || !this.authService.isLoggedIn()) {
      this.router.navigate(['/entreprises']);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.planInfo) return;

    /**
     * STEP 1: Call backend to create a Stripe PaymentIntent.
     *
     * We send the plan price and user details. The backend:
     *   - Calls Stripe API → gets a PaymentIntent with a client_secret
     *   - Returns client_secret + publishable key to us
     *
     * Why do we get the publishable key from the backend instead of hardcoding it?
     *   - Keeps the key configurable per environment (dev/prod)
     *   - Backend already has it in application.properties
     */
    this.http.post<any>(`${GATEWAY_URL}/create-intent`, {
      amount: this.planInfo.price,
      planName: this.plan,
      userId: this.authService.getUserId(),
      userName: this.authService.getUsername(),
      userEmail: this.authService.getUsername() + '@skillup.tn'
    }).subscribe({
      next: async (res) => {
        // Store for use in submit()
        this._clientSecret = res.clientSecret;
        this._paymentIntentId = res.paymentIntentId;

        /**
         * STEP 2: Load Stripe.js and mount the card element.
         *
         * loadStripe() fetches the Stripe.js SDK from Stripe's CDN.
         * stripe.elements().create('card') renders a pre-built, PCI-compliant
         * card input form inside an iframe hosted by Stripe.
         *
         * The user types their card number directly into Stripe's iframe —
         * our JavaScript (and our server) never has access to the raw card data.
         */
        this.stripe = await loadStripe(res.publishableKey);
        if (!this.stripe) { this.paymentError = 'Stripe could not be loaded.'; return; }

        this.elements = this.stripe.elements();
        this.cardElement = this.elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#1e293b',
              fontFamily: '"Inter", "Segoe UI", sans-serif',
              '::placeholder': { color: '#94a3b8' },
              iconColor: '#2563eb'
            },
            invalid: { color: '#b91c1c', iconColor: '#b91c1c' }
          },
          hidePostalCode: true
        });

        // Inject the card input widget into the DOM placeholder div
        this.cardElement.mount('#stripe-card-element');
        this.cardElement.on('ready', () => { this.stripeReady = true; });
        // Live card validation feedback (e.g. "Your card number is incomplete")
        this.cardElement.on('change', (event) => {
          this.paymentError = event.error ? event.error.message : '';
        });
      },
      error: (err) => {
        this.paymentError = err?.error?.error || 'Could not initialise payment. Check that the Payment service is running and Stripe keys are configured.';
      }
    });
  }

  // Stored from the create-intent response, used in confirmCardPayment
  private _clientSecret = '';
  private _paymentIntentId = '';

  ngOnDestroy(): void {
    // Clean up the Stripe iframe to prevent memory leaks
    this.cardElement?.destroy();
  }

  async submit(): Promise<void> {
    if (!this.cardHolder.trim()) { this.paymentError = 'Cardholder name is required.'; return; }
    if (!this.stripe || !this.cardElement || !this._clientSecret) {
      this.paymentError = 'Payment not ready. Please wait a moment and try again.';
      return;
    }

    this.processing = true;
    this.paymentError = '';

    /**
     * STEP 3: Confirm the payment with Stripe.
     *
     * stripe.confirmCardPayment() sends the card data from the hosted iframe
     * directly to Stripe's servers (NOT to our backend).
     * Stripe processes the charge and returns the result to our frontend.
     *
     * Possible outcomes:
     *   - paymentIntent.status = "succeeded" → card charged successfully
     *   - error.message = "Your card was declined" → declined by bank
     *   - error.message = "Your card number is incomplete" → input error
     */
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this._clientSecret, {
      payment_method: {
        card: this.cardElement,
        billing_details: { name: this.cardHolder }
      }
    });

    if (error) {
      // Stripe declined or network error — show reason to user
      this.processing = false;
      this.paymentError = error.message || 'Payment failed. Please try again.';
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      /**
       * STEP 4a: Record the payment in our database.
       * We POST the Stripe PaymentIntent ID to our backend, which:
       *   1. Re-verifies the PaymentIntent with Stripe (security check)
       *   2. Saves a Payment record with the Stripe reference (pi_xxxxx)
       */
      this.http.post<any>(`${GATEWAY_URL}/record-stripe`, {
        paymentIntentId: paymentIntent.id,
        userId: this.authService.getUserId(),
        userName: this.authService.getUsername(),
        userEmail: this.authService.getUsername() + '@skillup.tn',
        planName: this.plan,
        amount: this.planInfo!.price
      }).subscribe({
        next: (recorded: any) => {
          this.paymentRef = recorded.paymentReference || paymentIntent!.id;
          // STEP 4b: Upgrade plan via AuthService — stores the new JWT automatically
          // so the updated plan is visible in the header immediately, no re-login needed.
          this.authService.upgradePlan(this.plan as any).subscribe({
            next: () => { this.processing = false; this.success = true; },
            error: () => {
              this.processing = false;
              this.paymentError = `Payment succeeded (ref: ${this.paymentRef}) but plan upgrade failed. Contact support.`;
            }
          });
        },
        error: () => {
          // Record failed but payment succeeded — still try to upgrade plan
          this.authService.upgradePlan(this.plan as any).subscribe({
            next: () => { this.processing = false; this.success = true; this.paymentRef = paymentIntent!.id; },
            error: () => { this.processing = false; this.paymentError = 'Upgrade failed after payment. Contact support with ref: ' + paymentIntent!.id; }
          });
        }
      });
    } else {
      this.processing = false;
      this.paymentError = 'Payment could not be confirmed. Please try again.';
    }
  }

  goBack(): void {
    this.router.navigate(['/entreprises']);
  }
}
