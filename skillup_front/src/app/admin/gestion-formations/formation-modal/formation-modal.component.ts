import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-formation-modal',
  templateUrl: './formation-modal.component.html',
  styleUrls: ['./formation-modal.component.css']
})
export class FormationModalComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() formationData: any = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  formationForm!: FormGroup;
  categories: string[] = ['devops', 'springboot', 'angular', 'marketing', 'management'];
  showNewCategoryInput = false;
  newCategory = '';
  
  // Propriétés pour l'image
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageError: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    
    // Si c'est une édition, pré-remplir le formulaire
    if (this.isEdit && this.formationData) {
      this.patchFormValues();
      
      // Si une image existe déjà dans les données
      if (this.formationData.imageUrl) {
        this.imagePreview = this.formationData.imageUrl;
      }
    }
  }
  
  initForm(): void {
    this.formationForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      categorie: ['', Validators.required],
      dureeHeures: ['', [Validators.required, Validators.min(1)]],
      prix: ['', [Validators.required, Validators.min(0)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      placesDisponibles: ['', [Validators.required, Validators.min(1)]],
      videoUrl: ['']  

    });
  }
  
  patchFormValues(): void {
    this.formationForm.patchValue({
      titre: this.formationData.titre,
      description: this.formationData.description,
      categorie: this.formationData.categorie,
      dureeHeures: this.formationData.dureeHeures,
      prix: this.formationData.prix,
      dateDebut: this.formatDateForInput(this.formationData.dateDebut),
      dateFin: this.formatDateForInput(this.formationData.dateFin),
      placesDisponibles: this.formationData.placesDisponibles,
      videoUrl: this.formationData.videoUrl || '' 

    });
  }
  
  // Helper pour formater les dates pour l'input type="date"
  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
  
  // Gestionnaires d'événements pour l'image
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  processFile(file: File): void {
    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      this.imageError = 'Veuillez sélectionner une image';
      return;
    }
    
    // Vérifier taille (max 2 Mo)
    if (file.size > 2 * 1024 * 1024) {
      this.imageError = 'Image trop grande (max 2 Mo)';
      return;
    }
    
    this.imageError = null;
    this.selectedFile = file;
    
    // Créer l'aperçu
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  removeImage(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageError = null;
    
    // Réinitialiser l'input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  addNewCategory(): void {
    if (this.newCategory && this.newCategory.trim()) {
      const category = this.newCategory.trim();
      if (!this.categories.includes(category)) {
        this.categories.push(category);
        this.formationForm.patchValue({ categorie: category });
      }
      this.showNewCategoryInput = false;
      this.newCategory = '';
    }
  }
  
 onSubmit(): void {
  if (this.formationForm.invalid) {
    Object.keys(this.formationForm.controls).forEach(key => {
      this.formationForm.get(key)?.markAsTouched();
    });
    return;
  }
  
  const formValue = this.formationForm.value;
  
  if (this.isEdit && this.formationData?.id) {
    formValue.id = this.formationData.id;
  }
  
  // ✅ Envoyer SEULEMENT le JSON (pas de FormData)
  this.activeModal.close({
    isEdit: this.isEdit,
    formValue: formValue,     // ← Utilisé par updateFormationJson()
    imagePreview: this.imagePreview
  });
}
}