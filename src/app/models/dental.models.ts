// ============================================================
// DentalHub – Medizinisch korrekte Datenmodelle
// Basierend auf DIN EN ISO 9693, FDI-Nomenklatur,
// DGZMK-Richtlinien und Zahntechnik-Standards
// ============================================================

// ─── Zahnschema (FDI) ────────────────────────────────────────
export type FdiTooth =
  11|12|13|14|15|16|17|18|
  21|22|23|24|25|26|27|28|
  31|32|33|34|35|36|37|38|
  41|42|43|44|45|46|47|48;

export type ToothZone = 'festsitzend' | 'herausnehmbar' | 'schiene' | 'implant';

export interface ToothSelection {
  tooth: FdiTooth;
  zone: ToothZone;
  isPontic?: boolean;   // Brückenglied
  isAbutment?: boolean; // Brückenpfeiler
  isImplant?: boolean;
}

// ─── Farben ──────────────────────────────────────────────────
export type VitaClassic = 'A1'|'A2'|'A3'|'A3.5'|'A4'|'B1'|'B2'|'B3'|'B4'|'C1'|'C2'|'C3'|'C4'|'D2'|'D3'|'D4';
export type VitaLinqua = '0M1'|'0M2'|'0M3'|'1M1'|'1M2'|'2L1.5'|'2L2.5'|'2M1'|'2M2'|'2M3'|'2R1.5'|'2R2.5'|'3L1.5'|'3L2.5'|'3M1'|'3M2'|'3M3'|'3R1.5'|'3R2.5'|'4L1.5'|'4L2.5'|'4M1'|'4M2'|'4M3'|'4R1.5'|'4R2.5'|'5M1'|'5M2'|'5M3';
export type Bleach = 'BL1'|'BL2'|'BL3'|'BL4';
export type ShadeSystem = 'VITA_Classic' | 'VITA_3D_Master' | 'Chromascop' | 'Bleach' | 'Individual';

export interface ShadeInfo {
  system: ShadeSystem;
  cervical?: string;
  middle?: string;
  incisal?: string;
  overall?: string;
  stumpffarbe?: string; // Stumpffarbe relevant für transluzente Keramiken
  note?: string;
}

// ─── Okklusionskonzept ───────────────────────────────────────
export type OkklusionsKonzept =
  'eckzahnfuehrung'     | // Lateral: nur Eckzahn, posterior freilaufend
  'gruppenführung'      | // Lateral: mehrere Zähne führen
  'bilateral_balanced'  | // Beidseitig balancierte Okklusion (Totalprothese)
  'lingualisiert'       | // Lingualised occlusion (Totalprothese)
  'monoplaner';           // Monoplane (Totalprothese)

export type PräparationsDesign =
  'hohlkehl'     | // Chamfer – häufigste für Vollkeramik
  'stufe'        | // Shoulder – mit/ohne Abschrägung
  'tangential'   | // Knife edge – nur Metall
  'tiefehohlkehl'; // Deep chamfer

// ─── Materialien ─────────────────────────────────────────────
export interface MaterialOption {
  id: string;
  label: string;
  labelDe: string;
  minStärke: number; // mm
  indikation: string[];
  kontraindikation?: string[];
}

export const MATERIALIEN: MaterialOption[] = [
  { id:'zirkon_mono',    labelDe:'Zirkonoxid monolithisch (HTZ)', label:'Monolithic Zirconia',    minStärke:0.5,  indikation:['krone','brücke','implantat_krone'] },
  { id:'zirkon_verblendet', labelDe:'Zirkonoxid verblendet',    label:'Layered Zirconia',         minStärke:0.5,  indikation:['krone','brücke'] },
  { id:'emax_presskeramik', labelDe:'Lithiumdisilikat (e.max)', label:'Lithium Disilicate',       minStärke:1.0,  indikation:['krone','veneer','inlay','onlay'], kontraindikation:['brücke_posterior_>3Glieder'] },
  { id:'pfm',            labelDe:'Metall-Keramik (PFM)',         label:'Porcelain Fused to Metal', minStärke:0.5,  indikation:['krone','brücke'] },
  { id:'vollguss',       labelDe:'Vollguss (Edelmetall)',         label:'Full Cast Metal',          minStärke:0.5,  indikation:['krone','inlay','onlay'] },
  { id:'titan',          labelDe:'Titan (Grad 4)',                label:'Titanium Grade 4',         minStärke:0.5,  indikation:['implantat_abutment','modellguss_klammer'] },
  { id:'pmma',           labelDe:'PMMA (Langzeitprovisorium)',    label:'PMMA',                     minStärke:1.0,  indikation:['krone','brücke','provisorium'] },
  { id:'kobaltchrom',    labelDe:'Kobalt-Chrom (Co-Cr)',          label:'Cobalt-Chrome',            minStärke:0.4,  indikation:['modellguss','brücke_rahmen','teleskop'] },
  { id:'hartacryl',      labelDe:'Hart-Acrylat (PMMA)',           label:'Hard Acrylic',             minStärke:2.0,  indikation:['schiene_michigan','totalprothese'] },
  { id:'weichkunststoff', labelDe:'Weichkunststoff (EVA/PETG)',   label:'Soft Polymer',             minStärke:2.0,  indikation:['schiene_weich','sportschutz'] },
  { id:'dual_schiene',   labelDe:'Dual-Schiene (hart/weich)',     label:'Dual Layer Splint',        minStärke:3.0,  indikation:['schiene_dual'] },
];

// ─── RESTAURATIONSTYPEN ──────────────────────────────────────

// 1. FESTSITZEND
export interface KroneConfig {
  typ: 'krone';
  material: string;
  präparation: PräparationsDesign;
  okklusion: OkklusionsKonzept;
  farbe: ShadeInfo;
  stumpfaufbau?: boolean;
  stiftStumpfaufbau?: boolean;
  teleskopkrone?: boolean;
  mindeststärkeOkklusal?: number; // mm
  anmerkungen?: string;
}

export type PonticDesign =
  'hygienisch'    | // Kugelpontic – hygienefreundlichste
  'sattel'        | // Ridge lap – ästhetisch aber schwer zu reinigen
  'modified_ridge'| // Modified ridge lap – Kompromiss
  'linse'         | // Ovate pontic – hohe Ästhetik
  'konvex';         // Buccally convex

export interface BrückeConfig {
  typ: 'brücke';
  material: string;
  ponticDesign: PonticDesign;
  verbindung: 'starr' | 'geschiebe' | 'resilient';
  präparation: PräparationsDesign;
  okklusion: OkklusionsKonzept;
  farbe: ShadeInfo;
  anmerkungen?: string;
}

export interface ImplantatAbutmentConfig {
  typ: 'implantat_abutment';
  implantatSystem: string; // Straumann, Nobel, Camlog, etc.
  implantatDurchmesser?: number;
  material: 'titan' | 'zirkon' | 'titanbase_zirkon';
  kronenMaterial?: string;
  emergenzprofil: 'anatomisch' | 'gerade';
  verschraubt: boolean; // vs. zementiert
  angulation?: number; // Grad-Korrektur
  anmerkungen?: string;
}

export interface VeneerConfig {
  typ: 'veneer';
  material: 'emax_presskeramik' | 'feldspat' | 'zirkon';
  präparation: 'konservativ' | 'minimal' | 'no_prep';
  farbe: ShadeInfo;
  gingivaanpassung?: boolean;
  anmerkungen?: string;
}

export interface InlayOnlayConfig {
  typ: 'inlay_onlay';
  subtyp: 'inlay' | 'onlay' | 'overlay';
  material: string;
  kavitätenklasse: 'I' | 'II_MO' | 'II_DO' | 'II_MOD' | 'V';
  farbe: ShadeInfo;
  anmerkungen?: string;
}

// 2. HERAUSNEHMBAR

// Kennedy-Klassifikation für Modellguss
export type KennedyKlasse =
  'I'    | // Bilateral freie Endlücke
  'II'   | // Unilateral freie Endlücke
  'III'  | // Schaltlücke
  'IV';    // Anteriore Schaltlücke (keine Unterklassen)

export type KlasperTyp =
  'akers'          | // Akers-Klammer (häufigste)
  'ring'           | // Ringklammer (gekippte Molaren)
  'rpi'            | // RPI-System (Gingivaler Annäherung)
  'bonwill'        | // Bonwill (bilateral)
  'ringklammer'    |
  'kombiklammer'   | // Kombinationsklammer
  'rpa';             // RPA (wie RPI aber Akers-Spitze)

export type HauptverbinderOberkiefer =
  'vollgaumenplatte'       |
  'bugel_sagittal'         | // Sagittalbügel
  'querbuegel'             | // Querbügel
  'U_foermig'              | // U-förmiger Bügel
  'vordergaumenbuegel';

export type HauptverbinderUnterkiefer =
  'lingualbuegel'    | // Häufigste UK-Option
  'sublingualer_buegel' |
  'lingualplatte'    |
  'labialbuegel';      // Nur bei ungünstiger Situation

export interface ModellgussConfig {
  typ: 'modellguss';
  material: 'kobaltchrom' | 'titan' | 'edelmetall';
  kiefer: 'oberkiefer' | 'unterkiefer' | 'beide';
  kennedyKlasseOK?: KennedyKlasse;
  kennedyKlasseUK?: KennedyKlasse;
  hauptverbinderOK?: HauptverbinderOberkiefer;
  hauptverbinderUK?: HauptverbinderUnterkiefer;
  klaspern: {
    zahn: FdiTooth;
    typ: KlasperTyp;
    retentionsarm: 'bukkal' | 'lingual' | 'palatinal';
  }[];
  okklusaleAuflager: FdiTooth[];
  sattelTyp: 'freiendsattel' | 'schaltlueckensattel';
  zahnaufstellung?: boolean; // Bei Kombinationsarbeit
  zahnMaterial?: 'kunststoff' | 'keramik'; // Prothesenzähne
  verbindungMitFestsitzendem?: boolean; // Kombinationsprothetik
  anmerkungen?: string;
}

export interface TotalprotheseConfig {
  typ: 'totalprothese';
  kiefer: 'oberkiefer' | 'unterkiefer' | 'beide';
  okklusion: OkklusionsKonzept;
  zahnForm: 'anatomisch' | 'halbAnatomisch' | 'monoplan';
  zahnMaterial: 'kunststoff' | 'keramik';
  zahnFarbe: ShadeInfo;
  basisMaterial: 'pmma' | 'polyamid' | 'prothesenacryl';
  gaumenDesign?: 'rugae' | 'glatt'; // Ästhetik
  sofortprothese?: boolean;
  unterfütterung?: boolean;
  anmerkungen?: string;
}

// 3. SCHIENEN (Splints) – medizinisch korrekt nach DGFDT

export type SchienenTyp =
  'michigan'              | // Harte UK/OK-Aufbissschiene, volle Bedeckung
  'relaxierungsschiene'   | // Weiche Schiene, Erstversorgung
  'repositionierungsschiene' | // Disko-Reposition TMJ
  'protrusive'            | // Unterkiefer-Protrusionsschiene (Apnoe)
  'sportschutz'           | // Mundschutz
  'aufbissbehelf';          // Allgemeiner Aufbissbehelf

export interface AufbisschieneConfig {
  typ: 'schiene';
  schienenTyp: SchienenTyp;
  kiefer: 'oberkiefer' | 'unterkiefer';
  material: 'hartacryl' | 'weichkunststoff' | 'dual_schiene' | 'petg';
  bedeckung: 'vollbezahnt' | 'frontzähne' | 'seitenzähne';
  okklusion: 'weitgehend_flach' | 'punktkontakte' | 'individuelle_fuehrung';
  bisshöhenerhöhung: number; // mm
  retentionsart: 'adams_klammer' | 'ballklammer' | 'vakuumtief' | 'thermoplast';
  // Michigan-spezifische Parameter:
  canineGuidance?: boolean; // Eckzahnführung auf Schiene
  anteriorRampAngle?: number; // Frontrampenwinkel
  // Repositionierungsschiene:
  mandibularPosition?: 'protrusiv' | 'lateroprotrusiv_rechts' | 'lateroprotrusiv_links';
  // Protrusive (Apnoe):
  protrusion?: number; // mm Vorverlagerung
  // Stärke
  materialStärke?: number; // mm
  anmerkungen?: string;
}

// ─── UNION TYPE aller Restaurationstypen ────────────────────
export type RestorationConfig =
  | KroneConfig
  | BrückeConfig
  | ImplantatAbutmentConfig
  | VeneerConfig
  | InlayOnlayConfig
  | ModellgussConfig
  | TotalprotheseConfig
  | AufbisschieneConfig;

// ─── AUFTRAG ─────────────────────────────────────────────────
export type AuftragStatus =
  'entwurf'         |
  'ausgeschrieben'  |
  'angenommen'      |
  'in_bearbeitung'  |
  'zur_prüfung'     |
  'korrektur'       |
  'freigegeben'     |
  'in_produktion'   |
  'geliefert'       |
  'abgeschlossen';

export type Dringlichkeit = 'standard' | 'express' | 'same_day';

export interface ScanDatei {
  id: string;
  filename: string;
  typ: 'oberkiefer' | 'unterkiefer' | 'antagonist' | 'bissregistrat' | 'situtation' | 'einzelstumpf';
  format: 'STL' | 'PLY' | 'OBJ' | 'DCM' | 'IOS';
  uploadedAt: Date;
  url?: string;
  thumbnailUrl?: string;
}

export interface PatientenInfo {
  patientRef: string; // Intern, kein Vollname (DSGVO)
  alter?: number;
  geschlecht?: 'm' | 'w' | 'd';
  besonderheiten?: string; // Allergien, Parafunction, etc.
}

export interface Auftrag {
  id: string;
  refNummer: string; // z.B. "GF-2025-04847"
  status: AuftragStatus;
  createdAt: Date;
  updatedAt: Date;

  // Auftraggeber
  praxisId: string;
  arztId: string;

  // Patient
  patient: PatientenInfo;

  // Restauration
  zähne: ToothSelection[];
  restauration: RestorationConfig;

  // Dateien
  scans: ScanDatei[];
  röntgen?: ScanDatei[];
  fotos?: ScanDatei[];
  modellFotos?: ScanDatei[];

  // Klinische Parameter
  okklusionskonzept?: OkklusionsKonzept;
  bisshöheVerändert?: boolean;
  bisshöheÄnderung?: number; // mm
  okklusionsBeschreibung?: string;
  nachbarInfo?: string; // Besonderheiten Nachbarzähne
  antagonistInfo?: string;

  // Logistik
  dringlichkeit: Dringlichkeit;
  wunschLieferdatum?: Date;
  versandAdresse?: string;

  // Zuweisung
  designerId?: string;
  designerAngenommenAt?: Date;
  designerFertigAt?: Date;

  // Kommentare & Feedback
  anweisungen: string;
  kommentare: AuftragKommentar[];

  // Preisgestaltung
  angebotPreis?: number;
  finalPreis?: number;
  bezahlt?: boolean;

  // Qualitätssicherung
  freigabeAt?: Date;
  freigegebenVon?: string;
  korrekturen: number;
  maxKorrekturen: number;
}

export interface AuftragKommentar {
  id: string;
  autorId: string;
  autorName: string;
  autorRolle: 'arzt' | 'designer' | 'labor' | 'system';
  text: string;
  attachments?: string[];
  createdAt: Date;
}

// ─── DESIGNER ────────────────────────────────────────────────
export type DesignerSpezialisierung =
  | 'festsitzend_kronen_bruecken'
  | 'implantologie'
  | 'ästhetik_veneers'
  | 'herausnehmbar_modellguss'
  | 'totalprothetik'
  | 'kieferorthopädie'
  | 'schienen';

export interface Designer {
  id: string;
  vorname: string;
  nachname: string;
  initials: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;

  spezialisierungen: DesignerSpezialisierung[];
  software: string[]; // exocad, 3Shape, DentalWings, etc.

  bewertung: number;
  anzahlAufträge: number;
  zufriedenheit: number; // %
  avgLieferzeit: number; // Tage

  basisPreis: number; // €
  expressZuschlag: number; // %

  verfügbar: boolean;
  maxParalleleAufträge: number;
  aktuelleAufträge: number;

  zertifikate?: string[];
  beschreibung?: string;
}

// ─── DASHBOARD DATA ──────────────────────────────────────────
export interface DashboardStats {
  aktiveAufträge: number;
  inBearbeitung: number;
  zurPrüfung: number;
  freigegeben: number;
  diesenMonat: number;
  umsatzMonat: number;
  avgLieferzeit: number;
  bewertungDurchschnitt: number;
}

// ─── RESTORATION TYPE META ───────────────────────────────────
export interface RestaurationsTypMeta {
  id: string;
  label: string;
  icon: string;
  kategorie: 'festsitzend' | 'herausnehmbar' | 'schiene';
  beschreibung: string;
  typischePreisVon: number;
  typischeLieferzeitTage: number;
  benötigtScans: string[];
  benötigtFotos?: boolean;
  benötigtBissregistrat?: boolean;
  benötigtGegenkiefer?: boolean;
}

export const RESTAURATIONS_TYPEN: RestaurationsTypMeta[] = [
  {
    id: 'krone', label: 'Krone', icon: '👑', kategorie: 'festsitzend',
    beschreibung: 'Vollkrone für stark zerstörte Zähne',
    typischePreisVon: 90, typischeLieferzeitTage: 3,
    benötigtScans: ['oberkiefer', 'unterkiefer', 'antagonist'],
    benötigtBissregistrat: true, benötigtFotos: true, benötigtGegenkiefer: true
  },
  {
    id: 'brücke', label: 'Brücke', icon: '🌉', kategorie: 'festsitzend',
    beschreibung: 'Mehrgliedige Brücke zur Lückenversorgung',
    typischePreisVon: 200, typischeLieferzeitTage: 4,
    benötigtScans: ['oberkiefer', 'unterkiefer', 'antagonist'],
    benötigtBissregistrat: true, benötigtFotos: true, benötigtGegenkiefer: true
  },
  {
    id: 'veneer', label: 'Veneer', icon: '✨', kategorie: 'festsitzend',
    beschreibung: 'Keramikverblendschale für Ästhetik',
    typischePreisVon: 150, typischeLieferzeitTage: 4,
    benötigtScans: ['oberkiefer', 'unterkiefer'],
    benötigtFotos: true, benötigtGegenkiefer: true
  },
  {
    id: 'inlay_onlay', label: 'Inlay / Onlay', icon: '🔲', kategorie: 'festsitzend',
    beschreibung: 'Indirekte Restauration für Kavitäten',
    typischePreisVon: 80, typischeLieferzeitTage: 3,
    benötigtScans: ['oberkiefer', 'unterkiefer'],
    benötigtGegenkiefer: true
  },
  {
    id: 'implantat_abutment', label: 'Implantat-Abutment', icon: '🔩', kategorie: 'festsitzend',
    beschreibung: 'Individuelles CAD/CAM Abutment + Krone',
    typischePreisVon: 180, typischeLieferzeitTage: 4,
    benötigtScans: ['oberkiefer', 'unterkiefer', 'antagonist'],
    benötigtBissregistrat: true, benötigtFotos: true, benötigtGegenkiefer: true
  },
  {
    id: 'modellguss', label: 'Modellguss', icon: '⚙️', kategorie: 'herausnehmbar',
    beschreibung: 'Gegossene Metallarbeit, Teilprothese',
    typischePreisVon: 220, typischeLieferzeitTage: 6,
    benötigtScans: ['oberkiefer', 'unterkiefer'],
    benötigtBissregistrat: true, benötigtFotos: true, benötigtGegenkiefer: true
  },
  {
    id: 'totalprothese', label: 'Totalprothese', icon: '😁', kategorie: 'herausnehmbar',
    beschreibung: 'Vollständige Prothese bei Zahnlosigkeit',
    typischePreisVon: 350, typischeLieferzeitTage: 10,
    benötigtScans: ['oberkiefer', 'unterkiefer'],
    benötigtBissregistrat: true, benötigtFotos: true, benötigtGegenkiefer: true
  },
  {
    id: 'schiene_michigan', label: 'Michigan-Schiene', icon: '🦷', kategorie: 'schiene',
    beschreibung: 'Harte Aufbissschiene bei Bruxismus/CMD',
    typischePreisVon: 120, typischeLieferzeitTage: 3,
    benötigtScans: ['oberkiefer', 'unterkiefer'],
    benötigtBissregistrat: true, benötigtGegenkiefer: true
  },
  {
    id: 'schiene_protrusive', label: 'Protrusionsschiene', icon: '💤', kategorie: 'schiene',
    beschreibung: 'UK-Vorverlagreungsschiene bei Schlafapnoe',
    typischePreisVon: 180, typischeLieferzeitTage: 4,
    benötigtScans: ['oberkiefer', 'unterkiefer'],
    benötigtBissregistrat: true, benötigtGegenkiefer: true
  },
];
