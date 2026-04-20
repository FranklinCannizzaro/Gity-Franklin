import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../Services/data.service';

interface AvailableJob {
  id: string;
  refNummer: string;
  restauration: string;
  icon: string;
  kategorie: 'festsitzend' | 'herausnehmbar' | 'schiene';
  material: string;
  zähne: string;
  dringlichkeit: 'standard' | 'express' | 'same_day';
  dringlichkeitLabel: string;
  preis: number;
  lieferdatum: string;
  lieferzeitH: number;
  praxisName: string;
  praxisOrt: string;
  distanzKm: number;
  ausgestelltVorMin: number;
  annahmeDeadlineMin: number;
  anmerkungen: string;
  scanCount: number;
  fotoCount: number;
  isUrgent: boolean;
}

interface ActiveJob {
  id: string;
  refNummer: string;
  restauration: string;
  icon: string;
  praxisName: string;
  deadline: string;
  deadlineH: number;
  status: 'in_bearbeitung' | 'zur_prüfung' | 'korrektur';
  statusLabel: string;
  fortschritt: number;
  preis: number;
  ungeleseneNachrichten: number;
}

@Component({
  selector: 'app-designer-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designer-hub.component.html',
  styleUrl: './designer-hub.component.css'
})
export class DesignerHubComponent implements OnInit, OnDestroy {

  isOnline = true;
  filterKategorie: string = 'alle';
  filterDringlichkeit: string = 'alle';
  acceptingJobId: string | null = null;
  acceptTimer: any;
  acceptCountdown = 15;

  stats = {
    heuteVerdient: 340,
    dieseWocheVerdient: 1240,
    aktiveAufträge: 3,
    bewertung: 4.97,
    fertiggestellt: 247,
    responseRate: 96
  };

  availableJobs: AvailableJob[] = [
    {
      id: '1', refNummer: 'GF-2025-04852', restauration: 'Krone 14 – Zirkon monolithisch', icon: '👑',
      kategorie: 'festsitzend', material: 'Zirkonoxid (HTZ)', zähne: 'Zahn 14',
      dringlichkeit: 'express', dringlichkeitLabel: 'Express', preis: 145,
      lieferdatum: 'Morgen 12:00', lieferzeitH: 20, praxisName: 'Zahnarztpraxis Weber',
      praxisOrt: 'München', distanzKm: 3.2, ausgestelltVorMin: 8, annahmeDeadlineMin: 7,
      anmerkungen: 'Okklusionskontakte gleichmäßig verteilen. Bukkale Höcker anatomisch gestalten.',
      scanCount: 3, fotoCount: 2, isUrgent: true
    },
    {
      id: '2', refNummer: 'GF-2025-04851', restauration: 'Michigan-Schiene OK – Hartacryl', icon: '🦷',
      kategorie: 'schiene', material: 'Hartacryl (PMMA)', zähne: 'Oberkiefer komplett',
      dringlichkeit: 'standard', dringlichkeitLabel: 'Standard', preis: 120,
      lieferdatum: 'Übermorgen', lieferzeitH: 48, praxisName: 'CMD-Zentrum Müller',
      praxisOrt: 'München', distanzKm: 5.1, ausgestelltVorMin: 25, annahmeDeadlineMin: 35,
      anmerkungen: 'Michigan-Schiene mit Eckzahnführung. Bisshöhe +1.5mm. Frontrampe 30°.',
      scanCount: 2, fotoCount: 1, isUrgent: false
    },
    {
      id: '3', refNummer: 'GF-2025-04850', restauration: 'Modellguss UK – Kennedy Kl. II', icon: '⚙️',
      kategorie: 'herausnehmbar', material: 'Kobalt-Chrom (Co-Cr)', zähne: '36, 37 fehlend',
      dringlichkeit: 'standard', dringlichkeitLabel: 'Standard', preis: 280,
      lieferdatum: 'In 5 Tagen', lieferzeitH: 120, praxisName: 'Prothetik-Praxis Schmidt',
      praxisOrt: 'Augsburg', distanzKm: 12.4, ausgestelltVorMin: 45, annahmeDeadlineMin: 55,
      anmerkungen: 'Freiendsattel distal. Akers-Klammer 34, 35. Lingualbügel UK. Satteldesign mit Zahnaufstellung.',
      scanCount: 4, fotoCount: 3, isUrgent: false
    },
    {
      id: '4', refNummer: 'GF-2025-04849', restauration: 'Veneer 11–21 – e.max', icon: '✨',
      kategorie: 'festsitzend', material: 'Lithiumdisilikat (e.max)', zähne: '11, 21',
      dringlichkeit: 'standard', dringlichkeitLabel: 'Standard', preis: 190,
      lieferdatum: 'In 4 Tagen', lieferzeitH: 96, praxisName: 'Ästhetik Praxis Braun',
      praxisOrt: 'München', distanzKm: 2.8, ausgestelltVorMin: 62, annahmeDeadlineMin: 118,
      anmerkungen: 'VITA 1M1. Konservative Präparation. Mock-up liegt vor. Sehr ästhetischer Patient.',
      scanCount: 3, fotoCount: 5, isUrgent: false
    },
  ];

  activeJobs: ActiveJob[] = [
    {
      id: 'a1', refNummer: 'GF-2025-04844', restauration: 'Brücke 22–24 – Zirkon', icon: '🌉',
      praxisName: 'Praxis Dr. Hoffmann', deadline: 'Heute 17:00', deadlineH: 4,
      status: 'in_bearbeitung', statusLabel: 'In Bearbeitung', fortschritt: 60, preis: 210,
      ungeleseneNachrichten: 1
    },
    {
      id: 'a2', refNummer: 'GF-2025-04841', restauration: 'Abutment 36 – Titan', icon: '🔩',
      praxisName: 'Implantologiezentrum Bauer', deadline: 'Morgen 09:00', deadlineH: 18,
      status: 'zur_prüfung', statusLabel: 'Zur Prüfung', fortschritt: 100, preis: 165,
      ungeleseneNachrichten: 0
    },
  ];

  private timerInterval: any;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.dataService.updateTitle('Designer Hub');
    this.startJobCountdowns();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.acceptTimer) clearInterval(this.acceptTimer);
  }

  private startJobCountdowns() {
    this.timerInterval = setInterval(() => {
      this.availableJobs = this.availableJobs.map(j => ({
        ...j,
        ausgestelltVorMin: j.ausgestelltVorMin + 1,
        annahmeDeadlineMin: Math.max(0, j.annahmeDeadlineMin - 1)
      }));
    }, 60000);
  }

  get filteredJobs(): AvailableJob[] {
    return this.availableJobs.filter(j => {
      if (this.filterKategorie !== 'alle' && j.kategorie !== this.filterKategorie) return false;
      if (this.filterDringlichkeit !== 'alle' && j.dringlichkeit !== this.filterDringlichkeit) return false;
      return true;
    });
  }

  startAccept(job: AvailableJob) {
    this.acceptingJobId = job.id;
    this.acceptCountdown = 15;
    this.acceptTimer = setInterval(() => {
      this.acceptCountdown--;
      if (this.acceptCountdown <= 0) {
        this.confirmAccept(job);
      }
    }, 1000);
  }

  confirmAccept(job: AvailableJob) {
    if (this.acceptTimer) clearInterval(this.acceptTimer);
    this.acceptingJobId = null;
    this.availableJobs = this.availableJobs.filter(j => j.id !== job.id);
    this.activeJobs.unshift({
      id: job.id, refNummer: job.refNummer, restauration: job.restauration, icon: job.icon,
      praxisName: job.praxisName, deadline: job.lieferdatum, deadlineH: job.lieferzeitH,
      status: 'in_bearbeitung', statusLabel: 'In Bearbeitung', fortschritt: 0,
      preis: job.preis, ungeleseneNachrichten: 0
    });
    this.stats.aktiveAufträge++;
  }

  cancelAccept() {
    if (this.acceptTimer) clearInterval(this.acceptTimer);
    this.acceptingJobId = null;
  }

  declineJob(job: AvailableJob) {
    this.availableJobs = this.availableJobs.filter(j => j.id !== job.id);
  }

  getDringlichkeitClass(d: string): string {
    const map: any = { standard: 'badge-standard', express: 'badge-express', same_day: 'badge-same-day' };
    return map[d] || '';
  }

  getDeadlineClass(h: number): string {
    if (h <= 4) return 'deadline-urgent';
    if (h <= 12) return 'deadline-warn';
    return '';
  }

  formatVor(min: number): string {
    if (min < 60) return `vor ${min} Min.`;
    return `vor ${Math.floor(min/60)}h`;
  }

  toggleOnline() {
    this.isOnline = !this.isOnline;
  }

  navigateToJob(id: string) {
    this.router.navigate(['/task-details'], { queryParams: { id } });
  }
}
