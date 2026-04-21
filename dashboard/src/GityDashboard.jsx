import { useState } from "react";
import {
  LayoutDashboard, FolderOpen, Upload, Users, FileText,
  Bell, Search, Moon, Sun, ArrowUpRight, Plus,
  Settings, TrendingUp, Activity, ChevronRight,
  CheckCircle2, Clock, AlertCircle
} from "lucide-react";

const THEME = {
  light: {
    bg: "#F4F6FA",
    sidebar: "#FFFFFF",
    card: "#FFFFFF",
    header: "#FFFFFF",
    text: "#0D1117",
    textSec: "#6B7280",
    textTer: "#9CA3AF",
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    accent: "#1A3A7A",
    accentBg: "#EEF2FF",
    accentText: "#3B5BDB",
    navActive: "#EEF2FF",
    navActiveTxt: "#1A3A7A",
    inputBg: "#F9FAFB",
    minibar: "#F8F9FB",
  },
  dark: {
    bg: "#070B14",
    sidebar: "#0C1120",
    card: "#111827",
    header: "#0C1120",
    text: "#F1F5F9",
    textSec: "#8B9AB4",
    textTer: "#4B5A6E",
    border: "#1C2A40",
    borderLight: "#161F32",
    accent: "#4D84F5",
    accentBg: "#162244",
    accentText: "#6DA0FF",
    navActive: "#162244",
    navActiveTxt: "#6DA0FF",
    inputBg: "#0F1826",
    minibar: "#0E1929",
  },
};

const NAV = [
  { id: "overview", label: "Übersicht", icon: LayoutDashboard },
  { id: "cases", label: "Fälle", icon: FolderOpen, badge: 12 },
  { id: "uploads", label: "Uploads", icon: Upload, badge: 3 },
  { id: "clients", label: "Kunden", icon: Users },
  { id: "invoices", label: "Rechnungen", icon: FileText },
];

const STATS = [
  { label: "Aktive Fälle", value: "42", delta: "+8%", icon: FolderOpen,
    lightIcon: "#DBEAFE", lightTxt: "#1D4ED8", darkIcon: "#1E3A8A44", darkTxt: "#60A5FA" },
  { label: "Uploads heute", value: "13", delta: "+5",  icon: Upload,
    lightIcon: "#D1FAE5", lightTxt: "#059669", darkIcon: "#06502044", darkTxt: "#34D399" },
  { label: "Kunden", value: "89", delta: "+4 neu", icon: Users,
    lightIcon: "#EDE9FE", lightTxt: "#7C3AED", darkIcon: "#4C1D9544", darkTxt: "#A78BFA" },
  { label: "Ausstehend", value: "€ 14.820", delta: "+12%", icon: Activity,
    lightIcon: "#FEF3C7", lightTxt: "#D97706", darkIcon: "#92400E44", darkTxt: "#FCD34D" },
];

const CASES = [
  { id: "G-0892", patient: "M. Hoffmann", ini: "MH", type: "Kronenrestauration", status: "done", date: "19. Apr", amount: "€ 890" },
  { id: "G-0891", patient: "S. Berger",   ini: "SB", type: "Inlay Keramik",       status: "progress", date: "18. Apr", amount: "€ 620" },
  { id: "G-0890", patient: "T. Neumann",  ini: "TN", type: "Brücke anterior",     status: "progress", date: "17. Apr", amount: "€ 2.340" },
  { id: "G-0889", patient: "A. Fischer",  ini: "AF", type: "Veneer Komposit",     status: "review",   date: "16. Apr", amount: "€ 450" },
  { id: "G-0888", patient: "L. Wagner",   ini: "LW", type: "Implantat-Krone",     status: "done",     date: "15. Apr", amount: "€ 1.780" },
];

const STATUS_META = {
  done:     { label: "Abgeschlossen", lBg: "#DCFCE7", lTxt: "#166534", dBg: "#16653420", dTxt: "#4ADE80", icon: CheckCircle2 },
  progress: { label: "In Bearbeitung", lBg: "#DBEAFE", lTxt: "#1D4ED8", dBg: "#1D4ED820", dTxt: "#60A5FA", icon: Clock },
  review:   { label: "Überprüfung",   lBg: "#FEF9C3", lTxt: "#854D0E", dBg: "#854D0E20", dTxt: "#FDE047", icon: AlertCircle },
};

const AV_COLORS = [
  { b: "#DBEAFE", t: "#1D4ED8" }, { b: "#D1FAE5", t: "#065F46" },
  { b: "#EDE9FE", t: "#5B21B6" }, { b: "#FEF3C7", t: "#92400E" },
  { b: "#FCE7F3", t: "#9D174D" },
];

const BAR_VALS = [38, 52, 44, 68, 58, 80, 72, 90, 65, 85, 74, 96];

export default function GityDashboard() {
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("overview");
  const c = dark ? THEME.dark : THEME.light;

  const pill = (status) => {
    const m = STATUS_META[status];
    const Icon = m.icon;
    return {
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      background: dark ? m.dBg : m.lBg,
      color: dark ? m.dTxt : m.lTxt,
    };
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: c.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Outfit:wght@300;400;500;600&display=swap');
        .nav-btn:hover { background: ${c.accentBg} !important; }
        .row-tr:hover td { background: ${c.minibar}; }
        .card-hover:hover { border-color: ${dark ? "#2A3D5F" : "#CBD5E1"} !important; }
        .quick-btn:hover { background: ${c.minibar} !important; }
        .icon-btn:hover { background: ${c.minibar} !important; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 4px; }
      `}</style>

      {/* ── SIDEBAR ───────────────────────────────────────── */}
      <aside style={{ width: 236, flexShrink: 0, background: c.sidebar, borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        
        {/* Logo */}
        <div style={{ padding: "24px 20px 22px", borderBottom: `1px solid ${c.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em" }}>G</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color: c.text, letterSpacing: "-0.03em", lineHeight: 1 }}>Gity</div>
              <div style={{ fontSize: 10, color: c.textTer, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>Dental Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "18px 10px 10px" }}>
          <div style={{ fontSize: 10, color: c.textTer, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, padding: "0 8px", marginBottom: 10 }}>Menü</div>
          {NAV.map(({ id, label, icon: Icon, badge }) => {
            const on = active === id;
            return (
              <button key={id} className="nav-btn"
                onClick={() => setActive(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: on ? c.navActive : "transparent",
                  color: on ? c.navActiveTxt : c.textSec,
                  marginBottom: 2, textAlign: "left",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: on ? 500 : 400,
                  transition: "all 0.15s",
                }}
              >
                <Icon size={15} strokeWidth={on ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                  <span style={{ background: on ? c.accent : c.accentBg, color: on ? "#fff" : c.accentText, borderRadius: 10, fontSize: 10.5, fontWeight: 600, padding: "1px 7px", minWidth: 20, textAlign: "center" }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${c.borderLight}` }}>
          <button className="nav-btn" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: c.textSec, fontFamily: "'Outfit', sans-serif", fontSize: 13, marginBottom: 6, transition: "all 0.15s" }}>
            <Settings size={14} strokeWidth={1.8} />
            <span>Einstellungen</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: c.accentText, flexShrink: 0, letterSpacing: "0.02em" }}>DR</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Dr. Richter</div>
              <div style={{ fontSize: 11, color: c.textTer }}>Administrator</div>
            </div>
            <ChevronRight size={12} color={c.textTer} style={{ marginLeft: "auto", flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", background: c.header, borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: c.text, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Guten Morgen, Dr. Richter
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: c.textSec }}>Montag, 20. April 2026 — Ihre tagesaktuelle Übersicht</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 9, padding: "7px 12px", width: 200 }}>
              <Search size={13} color={c.textTer} />
              <input placeholder="Fall, Patient, ID …" style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: c.text, width: "100%", fontFamily: "'Outfit', sans-serif" }} />
            </div>
            <button className="icon-btn" onClick={() => setDark(!dark)}
              style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${c.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: c.textSec, transition: "all 0.15s" }}>
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="icon-btn"
              style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${c.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: c.textSec, position: "relative", transition: "all 0.15s" }}>
              <Bell size={14} />
              <span style={{ position: "absolute", top: 8, right: 8, width: 5, height: 5, borderRadius: "50%", background: "#EF4444" }} />
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, background: c.accent, color: "#fff", border: "none", borderRadius: 9, padding: "8px 15px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em" }}>
              <Plus size={13} strokeWidth={2.5} />
              Neuer Fall
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>

          {/* ── STATS GRID ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="card-hover"
                  style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "18px 18px 15px", cursor: "default", transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: c.textSec, fontWeight: 400 }}>{s.label}</span>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: dark ? s.darkIcon : s.lightIcon, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} color={dark ? s.darkTxt : s.lightTxt} strokeWidth={1.8} />
                    </div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 600, color: c.text, letterSpacing: "-0.03em", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ArrowUpRight size={11} color="#10B981" strokeWidth={2.5} />
                    <span style={{ fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>{s.delta}</span>
                    <span style={{ fontSize: 11.5, color: c.textTer }}>vs. Vormonat</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── CONTENT GRID ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 288px", gap: 16 }}>

            {/* Cases Table */}
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${c.borderLight}` }}>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: c.text }}>Letzte Aufträge</div>
                  <div style={{ fontSize: 12, color: c.textSec, marginTop: 1 }}>5 aktuelle Fälle</div>
                </div>
                <button style={{ fontSize: 12, color: c.accentText, background: c.accentBg, border: "none", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
                  Alle anzeigen →
                </button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: c.minibar }}>
                    {["Fall-ID", "Patient", "Leistung", "Status", "Datum", "Betrag"].map(h => (
                      <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 500, color: c.textTer, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CASES.map((row, i) => {
                    const av = AV_COLORS[i % AV_COLORS.length];
                    const sm = STATUS_META[row.status];
                    const StatusIcon = sm.icon;
                    return (
                      <tr key={row.id} className="row-tr" style={{ borderTop: `1px solid ${c.borderLight}`, cursor: "pointer" }}>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ fontSize: 11.5, color: c.textTer, fontFamily: "'Outfit', monospace", letterSpacing: "0.03em" }}>{row.id}</span>
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 27, height: 27, borderRadius: "50%", background: av.b, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: av.t, flexShrink: 0, letterSpacing: "0.02em" }}>{row.ini}</div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: c.text, whiteSpace: "nowrap" }}>{row.patient}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 13, color: c.textSec, whiteSpace: "nowrap" }}>{row.type}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={pill(row.status)}>
                            <StatusIcon size={10} strokeWidth={2.2} />
                            {sm.label}
                          </span>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: c.textSec, whiteSpace: "nowrap" }}>{row.date}</td>
                        <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: c.text, whiteSpace: "nowrap" }}>{row.amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Quick Actions */}
              <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "16px 16px 8px" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text, marginBottom: 12 }}>Schnellzugriff</div>
                {[
                  { label: "Fall einreichen", desc: "Neuen Auftrag anlegen", icon: FolderOpen },
                  { label: "Datei hochladen",  desc: "STL, DICOM, Fotos", icon: Upload },
                  { label: "Rechnung stellen", desc: "PDF generieren", icon: FileText },
                ].map(({ label, desc, icon: Icon }, i, arr) => (
                  <button key={i} className="quick-btn"
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 0", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${c.borderLight}` : "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: c.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} color={c.accentText} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: c.text, fontFamily: "'Outfit', sans-serif" }}>{label}</div>
                      <div style={{ fontSize: 11, color: c.textTer, marginTop: 1 }}>{desc}</div>
                    </div>
                    <ChevronRight size={12} color={c.textTer} style={{ marginLeft: "auto", flexShrink: 0 }} />
                  </button>
                ))}
              </div>

              {/* Status Overview */}
              <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "16px" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text, marginBottom: 14 }}>Status-Übersicht</div>
                {[
                  { label: "Abgeschlossen", count: 24, pct: 57, color: "#10B981" },
                  { label: "In Bearbeitung",count: 14, pct: 33, color: "#3B82F6" },
                  { label: "Überprüfung",   count:  4, pct: 10, color: "#F59E0B" },
                ].map((s, i, arr) => (
                  <div key={i} style={{ marginBottom: i < arr.length - 1 ? 12 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: c.textSec }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{s.count}</span>
                    </div>
                    <div style={{ height: 4, background: c.borderLight, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 2, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Card */}
              <div style={{ borderRadius: 12, padding: "18px", background: dark ? "linear-gradient(145deg,#1A2B5F,#0D1937)" : "linear-gradient(145deg,#1D3A8A,#152D70)", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                <div style={{ position: "absolute", bottom: -30, left: -10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Monatsumsatz</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: "#FFFFFF", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>€ 38.450</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 16 }}>
                    <ArrowUpRight size={12} color="#34D399" strokeWidth={2.5} />
                    <span style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>+18,3%</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>vs. März 2026</span>
                  </div>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 44 }}>
                    {BAR_VALS.map((h, i) => (
                      <div key={i} style={{ flex: 1, borderRadius: "2px 2px 0 0", background: i === BAR_VALS.length - 1 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.18)", height: `${(h / 96) * 100}%`, transition: "height 0.3s" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Jan</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Apr</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
