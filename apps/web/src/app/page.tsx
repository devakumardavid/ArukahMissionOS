"use client";

import { useMemo, useState } from "react";

type View = "dashboard" | "beneficiaries" | "cases" | "verification" | "payments" | "reports";
type Role = "Super Admin" | "Case Manager" | "Verifier" | "Finance Manager";

const navItems: Array<{ id: View; label: string; icon: IconName; badge?: number }> = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "beneficiaries", label: "Beneficiaries", icon: "people" },
  { id: "cases", label: "Cases", icon: "folder", badge: 8 },
  { id: "verification", label: "Verification", icon: "verify", badge: 3 },
  { id: "payments", label: "Payments", icon: "payment", badge: 2 },
  { id: "reports", label: "Reports", icon: "report" }
];

const cases = [
  { id: "AR-2026-008", title: "Emergency cardiac procedure", person: "Lakshmi N.", category: "Health", amount: "₹86,000", stage: "Verification", urgency: "Urgent", owner: "VK", updated: "18 min ago" },
  { id: "AR-2026-007", title: "School fees for two children", person: "Anjali R.", category: "Education", amount: "₹42,500", stage: "Approval", urgency: "High", owner: "DA", updated: "1 hr ago" },
  { id: "AR-2026-006", title: "Mobility support equipment", person: "Ravi K.", category: "Special needs", amount: "₹64,000", stage: "Payment", urgency: "Normal", owner: "SM", updated: "Yesterday" },
  { id: "AR-2026-005", title: "Tailoring equipment package", person: "Meena P.", category: "Livelihood", amount: "₹31,800", stage: "Impact", urgency: "Normal", owner: "DA", updated: "Yesterday" },
  { id: "AR-2026-004", title: "Rental arrears and relocation", person: "Joseph A.", category: "Emergency", amount: "₹28,000", stage: "Submitted", urgency: "High", owner: "—", updated: "2 days ago" }
];

const beneficiaries = [
  { reference: "BEN-0142", name: "Lakshmi N.", location: "Chennai, Tamil Nadu", cases: 1, status: "Needs review", initials: "LN" },
  { reference: "BEN-0141", name: "Anjali R.", location: "Madurai, Tamil Nadu", cases: 2, status: "Active", initials: "AR" },
  { reference: "BEN-0139", name: "Ravi K.", location: "Coimbatore, Tamil Nadu", cases: 1, status: "Active", initials: "RK" },
  { reference: "BEN-0135", name: "Meena P.", location: "Trichy, Tamil Nadu", cases: 2, status: "Active", initials: "MP" }
];

const roleDescriptions: Record<Role, string> = {
  "Super Admin": "Full operational overview",
  "Case Manager": "Intake and case coordination",
  Verifier: "Assigned verification queue",
  "Finance Manager": "Payments and reconciliation"
};

const publicWebsiteUrl =
  process.env.NEXT_PUBLIC_ARUKAH_WEBSITE_URL ?? "http://localhost:8080";

export default function HomePage() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [role, setRole] = useState<Role>("Case Manager");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cases;
    return cases.filter((item) =>
      [item.id, item.title, item.person, item.category, item.stage].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [query]);

  function navigate(view: View) {
    setActiveView(view);
    setMenuOpen(false);
    setQuery("");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>Arukah</strong>
            <span>MissionOS</span>
          </div>
        </div>

        <nav className="navigation" aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          {navItems.map((item) => (
            <button
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => navigate(item.id)}
              type="button"
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.badge ? <b>{item.badge}</b> : null}
            </button>
          ))}
          <span className="nav-label nav-label-secondary">Arukah</span>
          <a className="nav-item nav-external" href={publicWebsiteUrl}>
            <Icon name="globe" />
            <span>Public website</span>
            <Icon name="external" />
          </a>
        </nav>

        <div className="pilot-card">
          <span className="eyebrow">Pilot progress</span>
          <div className="pilot-number">12 <small>/ 50 cases</small></div>
          <div className="progress-track"><span style={{ width: "24%" }} /></div>
          <p>Closed responsibly with financial and impact evidence.</p>
        </div>

        <div className="user-card">
          <div className="avatar">DD</div>
          <div className="user-details">
            <strong>David</strong>
            <select value={role} onChange={(event) => setRole(event.target.value as Role)} aria-label="Preview staff role">
              {(Object.keys(roleDescriptions) as Role[]).map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <button className="icon-button" aria-label="Account settings" type="button"><Icon name="dots" /></button>
        </div>
      </aside>

      {menuOpen ? <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} /> : null}

      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" type="button">
            <Icon name="menu" />
          </button>
          <div className="search-box">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cases, beneficiaries…"
              aria-label="Search cases and beneficiaries"
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <div className="api-status"><i /> Preview data</div>
            <button className="icon-button notification" aria-label="Notifications" type="button"><Icon name="bell" /><i /></button>
            <button className="primary-button" type="button"><Icon name="plus" /> New case</button>
          </div>
        </header>

        <div className="content">
          {activeView === "dashboard" && <Dashboard role={role} onNavigate={navigate} cases={visibleCases} />}
          {activeView === "cases" && <CasesView cases={visibleCases} />}
          {activeView === "beneficiaries" && <BeneficiariesView query={query} />}
          {activeView === "verification" && <QueueView type="verification" />}
          {activeView === "payments" && <QueueView type="payments" />}
          {activeView === "reports" && <ReportsView />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ role, onNavigate, cases: items }: { role: Role; onNavigate: (view: View) => void; cases: typeof cases }) {
  return (
    <>
      <PageHeading
        eyebrow="Saturday, 20 June"
        title="Good morning, David."
        description={`${roleDescriptions[role]}. Here is what needs attention across Arukah today.`}
      />

      <section className="stat-grid">
        <Stat label="Active cases" value="8" detail="3 need attention" tone="green" icon="folder" />
        <Stat label="Pending verification" value="3" detail="1 urgent case" tone="amber" icon="verify" />
        <Stat label="Ready for payment" value="2" detail="₹92,000 approved" tone="blue" icon="payment" />
        <Stat label="Closed this month" value="4" detail="12 in pilot total" tone="purple" icon="complete" />
      </section>

      <section className="dashboard-layout">
        <div className="panel cases-panel">
          <PanelHeader title="Cases needing attention" subtitle="Prioritized by urgency and time in stage" action="View all cases" onAction={() => onNavigate("cases")} />
          <CaseTable items={items.slice(0, 4)} />
        </div>

        <div className="panel focus-panel">
          <PanelHeader title="Today’s focus" subtitle="Your operational queue" />
          <div className="focus-list">
            <FocusItem icon="verify" tone="amber" title="Complete Lakshmi’s verification" detail="Medical estimate expires in 2 days" />
            <FocusItem icon="payment" tone="blue" title="Review Ravi’s payment" detail="Invoice and approval are complete" />
            <FocusItem icon="impact" tone="green" title="Follow up with Meena" detail="Delivery evidence due today" />
          </div>
          <button className="secondary-button full-width" type="button">Open my work queue <Icon name="arrow" /></button>
        </div>

        <div className="panel activity-panel">
          <PanelHeader title="Recent activity" subtitle="Material actions across the case workflow" action="View audit history" />
          <div className="activity-list">
            <Activity initials="VK" text={<><strong>Vijay</strong> submitted a verification recommendation for <b>AR-2026-007</b></>} time="32 min ago" />
            <Activity initials="SM" text={<><strong>Sarah</strong> recorded provider payment for <b>AR-2026-006</b></>} time="2 hrs ago" />
            <Activity initials="DD" text={<><strong>You</strong> assigned Lakshmi’s case to Vijay</>} time="Yesterday, 4:42 PM" />
          </div>
        </div>

        <div className="panel pipeline-panel">
          <PanelHeader title="Case pipeline" subtitle="Open cases by current stage" />
          <div className="pipeline">
            {[
              ["Submitted", 1, "submitted"],
              ["Verification", 3, "verification"],
              ["Approval", 1, "approval"],
              ["Provider", 1, "provider"],
              ["Payment", 2, "payment"],
              ["Impact", 1, "impact"]
            ].map(([label, value, className]) => (
              <div className="pipeline-row" key={label}>
                <span>{label}</span>
                <div><i className={String(className)} style={{ width: `${Number(value) * 27}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CasesView({ cases: items }: { cases: typeof cases }) {
  return (
    <>
      <PageHeading eyebrow="Case management" title="Cases" description="Track every request from intake through responsible closure.">
        <button className="secondary-button" type="button"><Icon name="filter" /> Filter</button>
        <button className="primary-button" type="button"><Icon name="plus" /> New case</button>
      </PageHeading>
      <div className="view-tabs">
        <button className="active" type="button">Active <span>8</span></button>
        <button type="button">My cases <span>4</span></button>
        <button type="button">Closed <span>12</span></button>
        <button type="button">All cases <span>20</span></button>
      </div>
      <div className="panel full-table">
        <CaseTable items={items} expanded />
        {!items.length ? <div className="empty-state"><Icon name="search" /><h3>No cases match your search</h3><p>Try a beneficiary name, case number, or category.</p></div> : null}
      </div>
    </>
  );
}

function BeneficiariesView({ query }: { query: string }) {
  const filtered = beneficiaries.filter((item) => !query || `${item.name} ${item.reference} ${item.location}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <PageHeading eyebrow="People and families" title="Beneficiaries" description="Private records for the people Arukah serves.">
        <button className="primary-button" type="button"><Icon name="plus" /> New beneficiary</button>
      </PageHeading>
      <section className="beneficiary-grid">
        {filtered.map((item) => (
          <article className="beneficiary-card" key={item.reference}>
            <div className="beneficiary-avatar">{item.initials}</div>
            <div className="beneficiary-copy">
              <span>{item.reference}</span>
              <h3>{item.name}</h3>
              <p><Icon name="pin" /> {item.location}</p>
            </div>
            <StatusPill value={item.status} />
            <div className="beneficiary-footer"><span>{item.cases} active case{item.cases > 1 ? "s" : ""}</span><button type="button">View profile <Icon name="arrow" /></button></div>
          </article>
        ))}
      </section>
    </>
  );
}

function QueueView({ type }: { type: "verification" | "payments" }) {
  const verification = type === "verification";
  return (
    <>
      <PageHeading
        eyebrow={verification ? "Evidence and recommendation" : "Financial operations"}
        title={verification ? "Verification queue" : "Payment queue"}
        description={verification ? "Review assigned cases, evidence, risks, and recommendations." : "Record approved provider payments and maintain a complete reconciliation trail."}
      />
      <section className="stat-grid compact">
        <Stat label={verification ? "Assigned to me" : "Ready for payment"} value={verification ? "3" : "2"} detail={verification ? "1 urgent case" : "₹92,000 total"} tone={verification ? "amber" : "blue"} icon={verification ? "verify" : "payment"} />
        <Stat label={verification ? "Due this week" : "Awaiting reconciliation"} value={verification ? "2" : "1"} detail={verification ? "Oldest: 3 days" : "UTR recorded"} tone="green" icon="clock" />
        <Stat label={verification ? "Completed this month" : "Paid this month"} value={verification ? "6" : "5"} detail="On track for pilot" tone="purple" icon="complete" />
      </section>
      <div className="panel full-table">
        <CaseTable items={verification ? cases.filter((item) => ["Verification", "Submitted"].includes(item.stage)) : cases.filter((item) => item.stage === "Payment")} expanded />
      </div>
    </>
  );
}

function ReportsView() {
  return (
    <>
      <PageHeading eyebrow="Pilot learning" title="Reports" description="Operational visibility grounded in transactional case records." />
      <section className="report-grid">
        {[
          ["Case funnel", "Movement and conversion across every workflow stage", "report"],
          ["Time in stage", "Identify delays in verification, approval, and payment", "clock"],
          ["Financial reconciliation", "Payments, references, invoice matches, and exceptions", "payment"],
          ["Pilot progress", "Responsible closures toward the first 50 cases", "complete"]
        ].map(([title, description, icon]) => (
          <article className="report-card" key={title}>
            <div className="report-icon"><Icon name={icon as IconName} /></div>
            <h3>{title}</h3><p>{description}</p><button type="button">Open report <Icon name="arrow" /></button>
          </article>
        ))}
      </section>
    </>
  );
}

function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children ? <div className="heading-actions">{children}</div> : null}</header>;
}

function PanelHeader({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) {
  return <div className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action ? <button onClick={onAction} type="button">{action} <Icon name="arrow" /></button> : null}</div>;
}

function Stat({ label, value, detail, tone, icon }: { label: string; value: string; detail: string; tone: string; icon: IconName }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} /></div><div><span>{label}</span><strong>{value}</strong><p>{detail}</p></div></article>;
}

function CaseTable({ items, expanded = false }: { items: typeof cases; expanded?: boolean }) {
  return (
    <div className="case-table-wrap">
      <table className="case-table">
        <thead><tr><th>Case</th><th>Beneficiary</th>{expanded ? <th>Category</th> : null}<th>Amount</th><th>Stage</th>{expanded ? <th>Owner</th> : null}<th>Updated</th><th /></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><div className="case-title"><span className={`urgency-dot ${item.urgency.toLowerCase()}`} /><div><strong>{item.title}</strong><small>{item.id}</small></div></div></td>
              <td>{item.person}</td>
              {expanded ? <td>{item.category}</td> : null}
              <td className="amount">{item.amount}</td>
              <td><StagePill stage={item.stage} /></td>
              {expanded ? <td><div className="owner-avatar">{item.owner}</div></td> : null}
              <td className="muted-cell">{item.updated}</td>
              <td><button className="row-action" aria-label={`Open ${item.id}`} type="button"><Icon name="chevron" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StagePill({ stage }: { stage: string }) {
  return <span className={`stage-pill ${stage.toLowerCase().replace(" ", "-")}`}><i />{stage}</span>;
}

function StatusPill({ value }: { value: string }) {
  return <span className={`status-pill ${value === "Active" ? "active" : ""}`}>{value}</span>;
}

function FocusItem({ icon, tone, title, detail }: { icon: IconName; tone: string; title: string; detail: string }) {
  return <div className="focus-item"><div className={`focus-icon ${tone}`}><Icon name={icon} /></div><div><strong>{title}</strong><p>{detail}</p></div><Icon name="chevron" /></div>;
}

function Activity({ initials, text, time }: { initials: string; text: React.ReactNode; time: string }) {
  return <div className="activity-item"><div className="activity-avatar">{initials}</div><div><p>{text}</p><span>{time}</span></div></div>;
}

type IconName = "grid" | "people" | "folder" | "verify" | "payment" | "report" | "dots" | "menu" | "search" | "bell" | "plus" | "complete" | "impact" | "arrow" | "chevron" | "filter" | "pin" | "clock" | "globe" | "external";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    folder: <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" />,
    verify: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
    payment: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M7 15h2" /></>,
    report: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
    dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    complete: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    impact: <><path d="M12 22V8M5 12c0-4 3-7 7-7 0 4-3 7-7 7ZM19 12c0-3-3-6-7-6 0 4 3 7 7 7" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    filter: <path d="M4 5h16M7 12h10M10 19h4" />,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    external: <><path d="M14 5h5v5M10 14 19 5" /><path d="M19 14v5H5V5h5" /></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
