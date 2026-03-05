import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InscriptionService } from '../../services/inscription.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-inscription-formation',
  templateUrl: './inscription-formation.component.html',
  styleUrls: ['./inscription-formation.component.css']
})
export class InscriptionFormationComponent implements OnInit {
  @Input() formation: any;  // ✅ Reçoit la formation depuis la page de détail
  
  inscriptionForm: FormGroup;
  submitted = false;
  loading = false;
  success = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private inscriptionService: InscriptionService,
    public authService: AuthService,
    private router: Router
  ) {
    this.inscriptionForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      acceptConditions: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {}

  get f() { return this.inscriptionForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.inscriptionForm.invalid) return;

    this.loading = true;
    const inscription = {
      nom: this.f['nom'].value,
      prenom: this.f['prenom'].value,
      email: this.f['email'].value,
      telephone: this.f['telephone'].value
    };

    this.inscriptionService.inscrire(this.formation.id, inscription).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.inscriptionForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur';
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.inscriptionForm.reset();
    this.errorMessage = '';
  }
}