package esprit.tn.payment.Service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.publishable-key}")
    private String publishableKey;

    // 1 EUR ≈ 3.3 TND
    private static final double DT_TO_EUR = 3.3;

    public Map<String, Object> createPaymentIntent(double amountDT, String planName, Long userId) throws Exception {
        Stripe.apiKey = secretKey;

        long amountCents = Math.round((amountDT / DT_TO_EUR) * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("eur")
                .putMetadata("planName", planName)
                .putMetadata("userId", String.valueOf(userId))
                .putMetadata("originalAmountDT", String.valueOf(amountDT))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, Object> result = new HashMap<>();
        result.put("clientSecret", intent.getClientSecret());
        result.put("paymentIntentId", intent.getId());
        result.put("publishableKey", publishableKey);
        return result;
    }

    public PaymentIntent verifyPaymentIntent(String paymentIntentId) throws Exception {
        Stripe.apiKey = secretKey;
        return PaymentIntent.retrieve(paymentIntentId);
    }
}
