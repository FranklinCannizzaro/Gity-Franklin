import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../Services/data.service';
import { DashboardStats, AuftragStatus } from '../../models/dental.models';

interface RecentOrder {
  id: string;
  refNummer: string;
  patientRef: string;
  restauration: string;
  icon: string;
  status: AuftragStatus;
  statusLabel: string;
  statusClass: string;
  designer?: string;
  updatedMinutesAgo: number;
  previewColor: string;
}

@Component({
  selector: 'app-hub-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hub-dashboard.component.html',
  styleUrl: './hub-dashboard.component.css'
})
export class HubDashboardComponent implements OnInit {

  role = '';
  userName = '';
  stats: DashboardStats = {
    aktiveAufträge: 0, inBearbeitung: 0, zurPrüfung: 0,
    freigegeben: 0, diesenMonat: 0, umsatzMonat: 0,
    avgLieferzeit: 0, bewertungDurchschnitt: 0
  };

  recentOrders: RecentOrder[] = [];
  availableDesigners: any[] = [];
  isLoading = true;

  // Mock data until API endpoints are updated
  mockStats: DashboardStats = {
    aktiveAufträge: 12, inBearbeitung: 7, zurPrüfung: 2,
    freigegeben: 3, diesenMonat: 48, umsatzMonat: 5840,
    avgLieferzeit: 2.4, bewertungDurchschnitt: 4.9
  };

  mockOrders: RecentOrder[] = [
    { id:'1', refNummer:'GF-2025-04847', patientRef:'M. Weber', restauration:'Krone 14 – Zirkon monolithisch', icon:'👑', status:'in_bearbeitung', statusLabel:'In Bearbeitung', statusClass:'status-progress', designer:'Jonas K.', updatedMinutesAgo: 12, previewColor:'#E6F1FB' },
    { id:'2', refNummer:'GF-2025-04848', patientRef:'A. Müller', restauration:'Brücke 22-24 – Metall-Keramik', icon:'🌉', status:'ausgeschrieben', statusLabel:'Neu', statusClass:'status-new', updatedMinutesAgo: 45, previewColor:'#EEEDFE' },
    { id:'3', refNummer:'GF-2025-04845', patientRef:'K. Schmidt', restauration:'Abutment 36 – Titan individuell', icon:'🔩', status:'zur_prüfung', statusLabel:'Prüfung', statusClass:'status-review', designer:'Sara M.', updatedMinutesAgo: 180, previewColor:'#FAEEDA' },
    { id:'4', refNummer:'GF-2025-04840', patientRef:'L. Braun', restauration:'Michigan-Schiene OK – Hartacryl', icon:'🦷', status:'freigegeben', statusLabel:'Freigegeben', statusClass:'status-done', designer:'Thomas R.', updatedMinutesAgo: 1440, previewColor:'#EAF3DE' },
    { id:'5', refNummer:'GF-2025-04838', patientRef:'P. Hofmann', restauration:'Modellguss UK – Kennedy Kl. II', icon:'⚙️', status:'in_bearbeitung', statusLabel:'In Bearbeitung', statusClass:'status-progress', designer:'Maria S.', updatedMinutesAgo: 60, previewColor:'#E1F5EE' },
  ];

  mockDesigners = [
    { name:'Jonas Klein', initials:'JK', color:'#1D9E75', spezialisierung:'Kronen & Brücken', bewertung:4.97, aufträge:247, online:true, preis:95 },
    { name:'Sara Meier',  initials:'SM', color:'#534AB7', spezialisierung:'Ästhetik & Veneers',bewertung:4.99, aufträge:189, online:true, preis:110 },
    { name:'Thomas Roth', initials:'TR', color:'#D85A30', spezialisierung:'Implantologie',     bewertung:4.82, aufträge:312, online:false,preis:80 },
  ];

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.role = this.dataService.role;
    this.userName = this.dataService.firstName;
    this.dataService.updateTitle('Dashboard');

    // Use mock data – replace with real API when backend is updated
    this.stats = this.mockStats;
    this.recentOrders = this.mockOrders;
    this.availableDesigners = this.mockDesigners;
    this.isLoading = false;
  }

  formatTime(minutes: number): string {
    if (minutes < 60) return `vor ${minutes} Min.`;
    if (minutes < 1440) return `vor ${Math.floor(minutes/60)}h`;
    return `vor ${Math.floor(minutes/1440)} Tag(en)`;
  }

  navigateNewOrder() { this.router.navigate(['/create-task-demo']); }
  navigateDesigner() { this.router.navigate(['/designer-list']); }
  navigateOrders(status: string) { this.router.navigate(['/task-list', status]); }
  navigateOrderDetail(id: string) { this.router.navigate(['/task-details'], { queryParams: { id } }); }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  }
}
