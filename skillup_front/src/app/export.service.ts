import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { appEvent } from './models/event.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Export vers Excel
   */
  exportToExcel(events: appEvent[], filename: string = 'evenements'): void {
    try {
      // Préparer les données pour Excel
      const data = events.map(event => ({
        'Titre': event.title,
        'Type': event.type,
        'Catégorie': event.category || event.type,
        'Description': event.description,
        'Lieu': event.location,
        'Date début': new Date(event.startDate).toLocaleDateString('fr-FR'),
        'Date fin': new Date(event.endDate).toLocaleDateString('fr-FR'),
        'Capacité': event.capacity,
        'Inscrits': event.registeredCount || 0,
        'Statut': this.getStatusFrench(event.status),
        'Prix': event.price || 0,
        'Organisateur': event.organizer?.name || 'N/A'
      }));

      // Créer une feuille de calcul
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

      // Ajuster la largeur des colonnes
      const maxWidth = 50;
      worksheet['!cols'] = [];
      for (let i = 0; i < Object.keys(data[0] || {}).length; i++) {
        worksheet['!cols'].push({ wch: maxWidth });
      }

      // Créer un classeur
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Événements': worksheet },
        SheetNames: ['Événements']
      };

      // Générer le fichier Excel
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Sauvegarder le fichier
      const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(dataBlob, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);

      console.log('✅ Export Excel réussi');
    } catch (error) {
      console.error('❌ Erreur export Excel:', error);
      throw error;
    }
  }

  /**
   * Export vers PDF
   */
  exportToPDF(events: appEvent[], filename: string = 'evenements'): void {
    try {
      // Créer un nouveau document PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Titre du document
      doc.setFontSize(18);
      doc.text('Liste des événements', 14, 15);

      // Sous-titre avec date
      doc.setFontSize(10);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);

      // Préparer les données pour le tableau
      const tableColumn = [
        'Titre',
        'Type',
        'Lieu',
        'Date début',
        'Inscrits',
        'Capacité',
        'Statut'
      ];

      const tableRows = events.map(event => [
        event.title,
        event.type,
        event.location,
        new Date(event.startDate).toLocaleDateString('fr-FR'),
        `${event.registeredCount || 0}`,
        `${event.capacity}`,
        this.getStatusFrench(event.status)
      ]);

      // Ajouter le tableau au PDF
      autoTable(doc, {
        head: [tableColumn],
body: tableRows as any[][],
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 }
        }
      });

      // Ajouter des statistiques en bas de page
      const finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.text('Résumé statistique:', 14, finalY);
      doc.setFontSize(9);

      const totalEvents = events.length;
      const totalParticipants = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
      const upcomingEvents = events.filter(e => e.status === 'UPCOMING').length;

      doc.text(`Total événements: ${totalEvents}`, 14, finalY + 7);
      doc.text(`Total participants: ${totalParticipants}`, 14, finalY + 14);
      doc.text(`Événements à venir: ${upcomingEvents}`, 14, finalY + 21);

      // Sauvegarder le PDF
      doc.save(`${filename}_${new Date().toISOString().slice(0,10)}.pdf`);

      console.log('✅ Export PDF réussi');
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      throw error;
    }
  }

  /**
   * Export CSV (format universel)
   */
  exportToCSV(events: appEvent[], filename: string = 'evenements'): void {
    try {
      // Préparer les données
      const data = events.map(event => ({
        Titre: event.title,
        Type: event.type,
        Lieu: event.location,
        DateDebut: new Date(event.startDate).toLocaleDateString('fr-FR'),
        DateFin: new Date(event.endDate).toLocaleDateString('fr-FR'),
        Capacite: event.capacity,
        Inscrits: event.registeredCount || 0,
        Statut: this.getStatusFrench(event.status),
        Prix: event.price || 0
      }));

      // Convertir en CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      // Créer et télécharger le fichier
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // \uFEFF pour les accents
      saveAs(blob, `${filename}_${new Date().toISOString().slice(0,10)}.csv`);

      console.log('✅ Export CSV réussi');
    } catch (error) {
      console.error('❌ Erreur export CSV:', error);
      throw error;
    }
  }

  /**
   * Traduire le statut en français
   */
  private getStatusFrench(status?: string): string {
    const statusMap: Record<string, string> = {
      'UPCOMING': 'À venir',
      'ONGOING': 'En cours',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé',
      'DRAFT': 'Brouillon'
    };
    return status ? (statusMap[status] || status) : 'N/A';
  }
}
