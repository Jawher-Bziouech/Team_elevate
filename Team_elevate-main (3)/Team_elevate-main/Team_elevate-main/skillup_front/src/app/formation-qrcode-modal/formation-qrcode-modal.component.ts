import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-formation-qrcode-modal',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './formation-qrcode-modal.component.html',
  styleUrls: ['./formation-qrcode-modal.component.css']
})
export class FormationQrCodeComponent implements OnInit {
  @Input() formation: any;
  @Input() lienPersonnalise?: string;

  ngOnInit() {
    console.log('QR Code Component initialisé', this.formation);
  }

  telechargerQRCode() {
    // Trouver le canvas généré par angularx-qrcode
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qrcode-${this.formation?.titre || 'formation'}.png`;
      link.click();
    }
  }
}