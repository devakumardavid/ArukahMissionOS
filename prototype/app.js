const STORAGE_KEY = "arukah-missionos-v1";
const ROLE_KEY = "arukah-active-role";
const TENANT_KEY = "arukah-active-tenant";

const stageOrder = ["submitted", "verification", "approved", "provider-selection", "payment", "impact", "closed"];
const stageLabels = {
  submitted: "Need submitted",
  verification: "Verification",
  approved: "Approved",
  "provider-selection": "Provider selection",
  payment: "Payment",
  impact: "Impact tracking",
  closed: "Case closed",
  "on-hold": "On hold",
  rejected: "Rejected"
};

const roles = {
  superAdmin: {
    label: "Super Admin", name: "David", initials: "DA", icon: "♙",
    description: "Internal platform governance, staff access, configuration, and oversight.",
    responsibilities: ["Manage users and roles", "Configure and govern platform", "Access every workflow action"],
    permissions: ["create", "verify", "approve", "provider", "pay", "impact", "close", "note", "delete", "export", "admin"]
  },
  caseManager: {
    label: "Case Manager", name: "Maya", initials: "MC", icon: "◈",
    description: "Coordinates beneficiaries, verification, providers, and end-to-end case progression.",
    responsibilities: ["Review new submissions", "Coordinate verification and providers", "Track impact and close cases"],
    permissions: ["create", "verify", "approve", "provider", "impact", "close", "note", "export"]
  },
  verifier: {
    label: "Verifier", name: "Samuel", initials: "SV", icon: "⌕",
    description: "Validates identity, evidence, providers, and field-level facts.",
    responsibilities: ["Review supporting documents", "Perform field verification", "Recommend approval or rejection"],
    permissions: ["verify", "note"]
  },
  financeManager: {
    label: "Finance Manager", name: "Priya", initials: "PF", icon: "₹",
    description: "Processes approved payments and protects financial integrity.",
    responsibilities: ["Process provider payments", "Reconcile transactions", "Generate financial reports"],
    permissions: ["pay", "note", "export"]
  },
  donor: {
    label: "Donor", name: "David", initials: "DD", icon: "✦",
    description: "Creates giving missions, funds published causes, and follows verified impact.",
    responsibilities: ["Create and budget missions", "Support approved causes", "Track contribution impact"],
    permissions: ["donor"]
  }
};

const roleDashboardCopy = {
  superAdmin: ["Governance overview", "Good morning, David.", "Monitor the internal platform, its people, and its case integrity."],
  caseManager: ["Case coordination", "Cases that need your care.", "Keep every beneficiary informed and every case moving responsibly."],
  verifier: ["Verification queue", "Evidence before approval.", "Review facts, documents, and providers with care and independence."],
  financeManager: ["Financial operations", "Cases ready for direct payment.", "Process provider payments and maintain a clean reconciliation trail."],
  donor: ["Donor portal", "Welcome back, David.", "Turn your giving goals into focused missions with visible, verified outcomes."]
};

const categoryMeta = {
  "Education": { icon: "✎", color: "#e7f1fc" },
  "Health & Healing": { icon: "✚", color: "#e2f3ee" },
  "Special Needs": { icon: "∞", color: "#f0ebfa" },
  "Livelihood": { icon: "⌁", color: "#fff0d7" },
  "Women Rise": { icon: "✦", color: "#fde9ed" },
  "Elder Care": { icon: "⌂", color: "#edf0e7" },
  "Emergency Relief": { icon: "!", color: "#fde7e3" },
  "Community": { icon: "◎", color: "#e4f1f4" }
};

const seedData = {
  schemaVersion: 5,
  tenants: [
    {
      id: "TENANT-ARUKAH",
      type: "ngo",
      name: "Arukah Missions",
      shortName: "Arukah",
      tagline: "Healing lives. Restoring hope.",
      primaryColor: "#0d766d",
      accentColor: "#e3a72f",
      geography: "Tamil Nadu",
      caseTerm: "Case",
      missionTerm: "Mission",
      approvalThreshold: 50000,
      logoText: "AM",
      status: "active"
    },
    {
      id: "TENANT-CHURCH",
      type: "church",
      name: "Grace Community Church",
      shortName: "Grace Church",
      tagline: "Serving our neighbors with compassion.",
      primaryColor: "#5a4a92",
      accentColor: "#d8a548",
      geography: "Chennai",
      caseTerm: "Care Request",
      missionTerm: "Outreach",
      approvalThreshold: 25000,
      logoText: "GC",
      status: "active"
    },
    {
      id: "TENANT-NGO",
      type: "ngo",
      name: "HopeBridge Foundation",
      shortName: "HopeBridge",
      tagline: "Local action. Lasting dignity.",
      primaryColor: "#176b52",
      accentColor: "#e07a4f",
      geography: "South India",
      caseTerm: "Beneficiary Case",
      missionTerm: "Program",
      approvalThreshold: 100000,
      logoText: "HB",
      status: "active"
    },
    {
      id: "TENANT-FAMILY",
      type: "foundation",
      name: "David Family Foundation",
      shortName: "DFF",
      tagline: "A family legacy of practical generosity.",
      primaryColor: "#8a5d32",
      accentColor: "#d8b56d",
      geography: "India",
      caseTerm: "Grant Request",
      missionTerm: "Family Mission",
      approvalThreshold: 200000,
      logoText: "DF",
      status: "active"
    },
    {
      id: "TENANT-CSR",
      type: "csr",
      name: "Asteria CSR",
      shortName: "Asteria",
      tagline: "Responsible growth. Measurable community impact.",
      primaryColor: "#2457a6",
      accentColor: "#49a7a0",
      geography: "India",
      caseTerm: "CSR Request",
      missionTerm: "CSR Initiative",
      approvalThreshold: 500000,
      logoText: "AC",
      status: "active"
    }
  ],
  tenantPrograms: [
    { id: "PROG-1", tenantId: "TENANT-CHURCH", name: "Mercy Fund", category: "Emergency Relief", budget: 300000, spent: 84000, owner: "Outreach Committee" },
    { id: "PROG-2", tenantId: "TENANT-NGO", name: "Inclusive Childhood", category: "Special Needs", budget: 1200000, spent: 465000, owner: "Program Director" },
    { id: "PROG-3", tenantId: "TENANT-FAMILY", name: "Education Legacy", category: "Education", budget: 500000, spent: 112000, owner: "Foundation Trustees" },
    { id: "PROG-4", tenantId: "TENANT-CSR", name: "Healthy Communities FY27", category: "Health & Healing", budget: 5000000, spent: 1250000, owner: "CSR Committee" },
    { id: "PROG-5", tenantId: "TENANT-ARUKAH", name: "Pilot Case Fund", category: "Community", budget: 1000000, spent: 91000, owner: "Arukah Trustees" }
  ],
  tenantMembers: [
    { id: "MEM-1", tenantId: "TENANT-CHURCH", name: "Pastor Samuel", role: "Trustee", status: "active" },
    { id: "MEM-2", tenantId: "TENANT-CHURCH", name: "Rachel Thomas", role: "Case Manager", status: "active" },
    { id: "MEM-3", tenantId: "TENANT-NGO", name: "Anita Rao", role: "Program Director", status: "active" },
    { id: "MEM-4", tenantId: "TENANT-FAMILY", name: "David Family", role: "Foundation Trustee", status: "active" },
    { id: "MEM-5", tenantId: "TENANT-CSR", name: "Meera Shah", role: "CSR Head", status: "active" },
    { id: "MEM-6", tenantId: "TENANT-ARUKAH", name: "David", role: "Super Admin", status: "active" }
  ],
  missions: [
    {
      id: "AM-1042",
      tenantId: "TENANT-ARUKAH",
      title: "School fees for Anjali",
      beneficiary: "Anjali R.",
      category: "Education",
      location: "Chennai, Tamil Nadu",
      amount: 28500,
      funded: 28500,
      targetDate: "2026-06-25",
      status: "impact",
      urgency: "high",
      summary: "One academic term of school fees for a high-performing student whose family income was interrupted. Payment will go directly to the school.",
      provider: "St. Mary's Matriculation School",
      createdAt: "2026-06-12T09:30:00",
      notes: [
        { text: "Fee statement received and confirmed with the school office.", at: "2026-06-16T10:15:00" },
        { text: "Payment scheduled for this week.", at: "2026-06-17T15:40:00" }
      ]
    },
    {
      id: "AM-1041",
      tenantId: "TENANT-ARUKAH",
      title: "Post-surgery medicines for Ravi",
      beneficiary: "Ravi K.",
      category: "Health & Healing",
      location: "Madurai, Tamil Nadu",
      amount: 12400,
      funded: 8000,
      targetDate: "2026-06-20",
      status: "payment",
      urgency: "urgent",
      summary: "Thirty days of prescribed medication following heart surgery. Prescription and hospital discharge summary have been reviewed.",
      provider: "Apollo Pharmacy, Madurai",
      createdAt: "2026-06-14T14:10:00",
      notes: [{ text: "Prescription verified with treating hospital.", at: "2026-06-17T11:20:00" }]
    },
    {
      id: "AM-1039",
      tenantId: "TENANT-ARUKAH",
      title: "Speech therapy support for Nila",
      beneficiary: "Nila S.",
      category: "Special Needs",
      location: "Coimbatore, Tamil Nadu",
      amount: 36000,
      funded: 36000,
      targetDate: "2026-07-10",
      status: "provider-selection",
      urgency: "normal",
      summary: "Twelve speech therapy sessions for a six-year-old child. The care plan and therapy center estimate are on file.",
      provider: "Bloom Child Development Centre",
      createdAt: "2026-06-08T08:45:00",
      notes: [{ text: "Provider selection completed; payment is the next operational step.", at: "2026-06-15T16:00:00" }]
    },
    {
      id: "AM-1036",
      tenantId: "TENANT-ARUKAH",
      title: "Tailoring machine for Meena",
      beneficiary: "Meena P.",
      category: "Livelihood",
      location: "Trichy, Tamil Nadu",
      amount: 18500,
      funded: 18500,
      targetDate: "2026-06-14",
      status: "closed",
      urgency: "normal",
      summary: "A commercial sewing machine and starter materials to restore stable home-based income.",
      provider: "Sri Lakshmi Sewing Systems",
      createdAt: "2026-05-27T12:00:00",
      notes: [
        { text: "Machine delivered and demonstrated by provider.", at: "2026-06-13T13:30:00" },
        { text: "Receipt and beneficiary impact note stored.", at: "2026-06-14T17:00:00" }
      ]
    },
    {
      id: "AM-1034",
      tenantId: "TENANT-ARUKAH",
      title: "Mobility aid for Joseph",
      beneficiary: "Joseph A.",
      category: "Elder Care",
      location: "Nagercoil, Tamil Nadu",
      amount: 9800,
      funded: 0,
      targetDate: "2026-07-01",
      status: "verification",
      urgency: "normal",
      summary: "A lightweight wheelchair for safe movement at home and to medical appointments.",
      provider: "Not assigned",
      createdAt: "2026-06-15T10:20:00",
      notes: []
    }
  ],
  activities: [
    { icon: "✓", text: "Meena's livelihood case was closed with proof.", at: "2026-06-14T17:00:00" },
    { icon: "₹", text: "Nila's speech therapy provider was selected.", at: "2026-06-15T16:00:00" },
    { icon: "⌕", text: "Ravi's prescription was verified with the hospital.", at: "2026-06-17T11:20:00" },
    { icon: "＋", text: "A new elder-care need was submitted for review.", at: "2026-06-15T10:20:00" }
  ],
  publishedCauses: [
    {
      id: "CAUSE-201",
      tenantId: "TENANT-ARUKAH",
      sourceCaseId: "AM-1039",
      title: "Speech therapy for a young child",
      category: "Special Needs",
      location: "Coimbatore, Tamil Nadu",
      amount: 36000,
      funded: 12000,
      urgency: "normal",
      summary: "Twelve verified speech-therapy sessions to strengthen communication and daily participation.",
      outcome: "Complete a structured twelve-session therapy plan.",
      verified: true,
      publishedAt: "2026-06-16T09:00:00"
    },
    {
      id: "CAUSE-202",
      tenantId: "TENANT-ARUKAH",
      sourceCaseId: "AM-1041",
      title: "Post-surgery medicine support",
      category: "Health & Healing",
      location: "Madurai, Tamil Nadu",
      amount: 12400,
      funded: 8000,
      urgency: "urgent",
      summary: "Thirty days of prescribed recovery medicine confirmed with the treating hospital and pharmacy.",
      outcome: "Complete the prescribed post-surgery medicine course.",
      verified: true,
      publishedAt: "2026-06-17T08:30:00"
    },
    {
      id: "CAUSE-203",
      tenantId: "TENANT-ARUKAH",
      sourceCaseId: "AM-1034",
      title: "Mobility support for an elder",
      category: "Elder Care",
      location: "Nagercoil, Tamil Nadu",
      amount: 9800,
      funded: 0,
      urgency: "normal",
      summary: "A lightweight mobility aid for safe movement at home and access to medical appointments.",
      outcome: "Restore safer independent mobility.",
      verified: true,
      publishedAt: "2026-06-18T10:00:00"
    }
  ],
  donorMissions: [
    {
      id: "MISSION-301",
      tenantId: "TENANT-ARUKAH",
      name: "Family Education & Healing Mission",
      budget: 150000,
      geography: "Tamil Nadu",
      categories: ["Education", "Health & Healing", "Special Needs"],
      goal: "Help children and families access education, medicine, and developmental support.",
      createdAt: "2026-06-10T10:00:00"
    }
  ],
  allocations: [
    { id: "ALLOC-401", missionId: "MISSION-301", causeId: "CAUSE-201", amount: 12000, at: "2026-06-16T14:00:00" },
    { id: "ALLOC-402", missionId: "MISSION-301", causeId: "CAUSE-202", amount: 8000, at: "2026-06-17T12:00:00" }
  ]
};

let state = loadState();
let activeView = "dashboard";
let activeRole = localStorage.getItem(ROLE_KEY) || "superAdmin";
if (!roles[activeRole]) activeRole = "superAdmin";
if (activeRole === "donor") activeView = "donor-home";
let activeTenantId = localStorage.getItem(TENANT_KEY) || "TENANT-ARUKAH";
if (!state.tenants.some(item => item.id === activeTenantId)) activeTenantId = "TENANT-ARUKAH";
let searchTerm = "";
let toastTimer;

const main = document.querySelector("#main-content");
const drawer = document.querySelector("#mission-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const dialog = document.querySelector("#mission-dialog");
const form = document.querySelector("#mission-form");
const donorMissionDialog = document.querySelector("#donor-mission-dialog");
const donorMissionForm = document.querySelector("#donor-mission-form");

function role() {
  return roles[activeRole] || roles.superAdmin;
}

function tenant() {
  return state.tenants.find(item => item.id === activeTenantId) || state.tenants[0];
}

function can(permission) {
  return role().permissions.includes(permission);
}

function tenantCases() {
  return state.missions.filter(item => item.tenantId === activeTenantId);
}

function tenantCauses() {
  return state.publishedCauses.filter(item => item.tenantId === activeTenantId);
}

function tenantDonorMissions() {
  return state.donorMissions.filter(item => item.tenantId === activeTenantId);
}

function visibleMissions() {
  if (activeRole === "donor") return [];
  const missions = tenantCases();
  if (activeRole === "verifier") return missions.filter(m => ["submitted", "verification", "approved", "rejected", "on-hold"].includes(m.status));
  if (activeRole === "financeManager") return missions.filter(m => ["provider-selection", "payment", "impact", "closed"].includes(m.status));
  return missions;
}

function roleBanner() {
  const current = role();
  return `
    <div class="role-banner">
      <div class="avatar">${current.initials}</div>
      <div><strong>${current.label} · ${escapeHTML(tenant().shortName)}</strong><small>${current.description}</small></div>
    </div>`;
}

function applyRoleUI() {
  const current = role();
  document.querySelector("#user-avatar").textContent = current.initials;
  document.querySelector("#user-name").textContent = current.name;
  const isDonor = activeRole === "donor";
  document.querySelectorAll(".internal-nav").forEach(element => element.hidden = isDonor);
  document.querySelectorAll(".donor-nav").forEach(element => element.hidden = !isDonor);
  document.querySelectorAll(".tenant-nav").forEach(element => element.hidden = isDonor);
  document.querySelectorAll(".admin-only").forEach(element => {
    element.hidden = !can("admin");
  });
  document.querySelectorAll("[data-permission]").forEach(element => {
    element.hidden = !can(element.dataset.permission);
  });
  const primaryAction = document.querySelector("#new-mission-button");
  primaryAction.hidden = !(can("create") || isDonor);
  primaryAction.innerHTML = isDonor ? "<span>＋</span> New mission" : "<span>＋</span> New case";
  document.querySelector("#global-search").placeholder = isDonor
    ? "Search causes and missions…"
    : "Search cases, people, providers…";
  const currentTenant = tenant();
  document.querySelector(".brand strong").textContent = currentTenant.shortName;
  document.querySelector(".brand-mark").textContent = currentTenant.logoText;
  document.querySelector(".brand small").textContent = isDonor ? "MissionOS" : organizationTypeLabel(currentTenant.type);
  document.documentElement.style.setProperty("--teal", currentTenant.primaryColor);
  document.documentElement.style.setProperty("--teal-dark", shadeColor(currentTenant.primaryColor, -22));
  document.documentElement.style.setProperty("--gold", currentTenant.accentColor);
  document.querySelector("#tenant-select").hidden = isDonor;
  document.querySelector(".sidebar-card .eyebrow").textContent = isDonor ? "Your giving" : "Pilot objective";
  document.querySelector(".sidebar-card strong").innerHTML = isDonor ? "Purposeful giving.<br>Visible impact." : "Prove the workflow.<br>Earn the trust.";
  document.querySelector(".sidebar-card p").textContent = isDonor
    ? "Fund verified causes through a mission you define."
    : "50–100 real cases before marketplace expansion.";
}

function organizationTypeLabel(type) {
  return {
    church: "Church Management",
    ngo: "NGO Management",
    foundation: "Family Foundation",
    csr: "CSR Portal"
  }[type] || "Organization";
}

function shadeColor(hex, amount) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, (value >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((value >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (value & 0x0000ff) + amount));
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, "0")}`;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(seedData);
    const parsed = JSON.parse(saved);
    if (!parsed.schemaVersion || parsed.schemaVersion < 3) {
      const statusMigration = {
        review: "verification",
        verified: "approved",
        funded: "provider-selection",
        fulfillment: "impact",
        completed: "closed"
      };
      parsed.missions.forEach(item => {
        item.status = statusMigration[item.status] || item.status;
      });
      parsed.schemaVersion = 3;
    }
    if (parsed.schemaVersion < 4) {
      parsed.publishedCauses = structuredClone(seedData.publishedCauses);
      parsed.donorMissions = structuredClone(seedData.donorMissions);
      parsed.allocations = structuredClone(seedData.allocations);
      parsed.schemaVersion = 4;
    }
    if (parsed.schemaVersion < 5) {
      parsed.tenants = structuredClone(seedData.tenants);
      parsed.tenantPrograms = structuredClone(seedData.tenantPrograms);
      parsed.tenantMembers = structuredClone(seedData.tenantMembers);
      parsed.missions.forEach(item => item.tenantId ||= "TENANT-ARUKAH");
      parsed.publishedCauses.forEach(item => item.tenantId ||= "TENANT-ARUKAH");
      parsed.donorMissions.forEach(item => item.tenantId ||= "TENANT-ARUKAH");
      parsed.schemaVersion = 5;
    }
    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(seedData));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateMissionBadge();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatDate(value, options = { day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(value));
}

function relativeTime(value) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function escapeHTML(value = "") {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function iconFor(category) {
  return categoryMeta[category] || { icon: "◇", color: "#eaf1ef" };
}

function statusPill(status) {
  return `<span class="status ${status}">${stageLabels[status] || status}</span>`;
}

function progressFor(mission) {
  const pct = mission.amount ? Math.min(100, Math.round((mission.funded / mission.amount) * 100)) : 0;
  return `
    <div>
      <div class="progress-track"><i style="width:${pct}%"></i></div>
      <div class="progress-label"><span>${formatCurrency(mission.funded)}</span><span>${pct}%</span></div>
    </div>`;
}

function updateMissionBadge() {
  document.querySelector("#mission-count-badge").textContent =
    visibleMissions().filter(m => m.status !== "closed").length;
}

function pageHeader(label, title, description) {
  const today = formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" });
  return `
    <header class="page-header">
      <div>
        <span class="eyebrow">${label}</span>
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
      <span class="date-chip">${today}</span>
    </header>`;
}

function missionRows(missions, limit) {
  const selected = typeof limit === "number" ? missions.slice(0, limit) : missions;
  if (!selected.length) {
    return `<div class="empty-state"><span>◇</span><h3>No cases found</h3><p>There are no cases in this role's queue right now.</p>${can("create") ? '<button class="button primary" data-new-mission>New case</button>' : ""}</div>`;
  }
  return selected.map(mission => {
    const category = iconFor(mission.category);
    return `
      <button class="mission-row" data-mission-id="${mission.id}">
        <span class="category-icon" style="background:${category.color}">${category.icon}</span>
        <span class="mission-main">
          <strong>${escapeHTML(mission.title)}</strong>
          <small>${mission.id} · ${escapeHTML(mission.location)}</small>
        </span>
        <span class="mission-meta">
          <strong>${formatCurrency(mission.amount)}</strong>
          <small>Case amount</small>
        </span>
        <span class="mission-meta">${progressFor(mission)}</span>
        ${statusPill(mission.status)}
        <span class="chevron">›</span>
      </button>`;
  }).join("");
}

function renderDashboard() {
  const scopedMissions = visibleMissions();
  const open = scopedMissions.filter(m => m.status !== "closed");
  const completed = scopedMissions.filter(m => m.status === "closed");
  const totalCommitted = scopedMissions.reduce((sum, m) => sum + m.funded, 0);
  const awaiting = scopedMissions.filter(m => ["submitted", "verification"].includes(m.status)).length;
  const verificationRate = scopedMissions.length
    ? Math.round((scopedMissions.filter(m => stageOrder.indexOf(m.status) >= 2).length / scopedMissions.length) * 100)
    : 0;
  const copy = roleDashboardCopy[activeRole];

  main.innerHTML = `
    ${pageHeader(`Module 7 · Dashboard & Reports · ${copy[0]}`, copy[1], copy[2])}
    ${roleBanner()}
    <section class="stats-grid" aria-label="Case summary">
      ${statCard("Active cases", open.length, "◈", `<strong>${awaiting}</strong> awaiting verification`)}
      ${statCard("Payments recorded", formatCurrency(totalCommitted), "₹", "Across pilot cases")}
      ${statCard("Cases closed", completed.length, "✓", "Closed with impact evidence")}
      ${statCard("Pilot progress", `${completed.length}/50`, "◎", "Cases closed toward minimum target")}
    </section>

    <section class="dashboard-grid">
      <div>
        <div class="panel">
          <div class="panel-header">
            <div><h2>Active cases</h2><p>Internal work moving toward responsible closure</p></div>
            <button class="text-button" data-view-link="missions">Open queue →</button>
          </div>
          <div class="mission-list">${missionRows(open, 5)}</div>
        </div>
      </div>

      <div>
        <section class="focus-card panel">
          <span class="eyebrow">This month's focus</span>
          <h2>${roleFocus()[0]}</h2>
          <p>${roleFocus()[1]}</p>
          <button class="button primary small" data-view-link="missions">Review cases</button>
          <div class="focus-stat">
            <div class="focus-ring"><span>${verificationRate}%</span></div>
            <div><strong>Queue health</strong><small>${roleQueueSummary()}</small></div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div><h2>Recent activity</h2><p>Internal case audit trail</p></div>
          </div>
          <div class="activity-list">
            ${state.activities.slice(0, 5).map(activity => `
              <div class="activity-item">
                <span class="activity-dot">${activity.icon}</span>
                <div><p>${escapeHTML(activity.text)}</p><time>${relativeTime(activity.at)}</time></div>
              </div>`).join("")}
          </div>
        </section>
      </div>
    </section>`;
}

function statCard(label, value, icon, foot) {
  return `
    <article class="stat-card">
      <div class="stat-top"><span>${label}</span><i class="stat-icon">${icon}</i></div>
      <strong class="stat-value">${value}</strong>
      <div class="stat-foot">${foot}</div>
    </article>`;
}

function roleFocus() {
  return {
    superAdmin: ["Protect the integrity of the whole.", "Watch access, workflow health, and exceptions without becoming a bottleneck."],
    caseManager: ["Move the right case next.", "Coordinate people and evidence so urgent needs do not stall between teams."],
    verifier: ["Trust is built in the checking.", "Record what you examined and make an independent recommendation."],
    financeManager: ["Every rupee needs a trail.", "Record approved provider payments and reconcile before impact tracking begins."],
  }[activeRole];
}

function roleQueueSummary() {
  const count = activeRole === "financeManager"
    ? tenantCases().filter(m => ["provider-selection", "payment"].includes(m.status)).length
    : tenantCases().filter(m => ["submitted", "verification"].includes(m.status)).length;
  const subject = count === 1 ? "case" : "cases";
  return activeRole === "financeManager"
    ? `${count} ${subject} in the payment queue`
    : `${count} ${subject} ${count === 1 ? "needs" : "need"} verification attention`;
}

function renderMissions() {
  main.innerHTML = `
    ${pageHeader("Module 2 · Cause Management", "Every cause begins as a private case.", "Submit, review, assign, approve or reject, and close support cases without exposing beneficiary data.")}
    ${roleBanner()}
    <div class="toolbar">
      <input id="mission-search" type="search" placeholder="Search cases…" value="${escapeHTML(searchTerm)}">
      <select id="status-filter" aria-label="Filter by status">
        <option value="all">All statuses</option>
        ${stageOrder.map(s => `<option value="${s}">${stageLabels[s]}</option>`).join("")}
        <option value="on-hold">On hold</option>
        <option value="rejected">Rejected</option>
      </select>
      <select id="category-filter" aria-label="Filter by category">
        <option value="all">All categories</option>
        ${Object.keys(categoryMeta).map(c => `<option>${c}</option>`).join("")}
      </select>
      ${can("create") ? '<button class="button primary" data-new-mission>＋ New case</button>' : ""}
    </div>
    <section class="panel table-panel">
      <div class="table-head"><span>Case</span><span>Status</span><span>Amount</span><span>Paid</span><span>Target</span><span></span></div>
      <div id="mission-table"></div>
    </section>`;

  document.querySelector("#mission-search").addEventListener("input", event => {
    searchTerm = event.target.value;
    renderMissionTable();
  });
  document.querySelector("#status-filter").addEventListener("change", renderMissionTable);
  document.querySelector("#category-filter").addEventListener("change", renderMissionTable);
  renderMissionTable();
}

function moduleQueue({ label, title, description, missions, emptyTitle, emptyText, metrics }) {
  return `
    ${pageHeader(label, title, description)}
    ${roleBanner()}
    <section class="stats-grid">
      ${metrics.map(item => statCard(item[0], item[1], item[2], item[3])).join("")}
    </section>
    <section class="panel">
      <div class="panel-header">
        <div><h2>Cases in this queue</h2><p>${description}</p></div>
        <button class="text-button" data-view-link="missions">All cases →</button>
      </div>
      <div class="mission-list">
        ${missions.length ? missionRows(missions) : `<div class="empty-state"><span>✓</span><h3>${emptyTitle}</h3><p>${emptyText}</p></div>`}
      </div>
    </section>`;
}

function renderVerification() {
  const cases = tenantCases();
  const queue = cases.filter(m => ["submitted", "verification", "on-hold"].includes(m.status));
  const highRisk = queue.filter(m => m.urgency === "urgent").length;
  const ready = cases.filter(m => m.status === "verification" && m.notes.length > 0).length;
  main.innerHTML = moduleQueue({
    label: "Module 3 · Verification",
    title: "Verification queue",
    description: "Complete checklists, review documents, record notes, rate risk, and recommend a decision.",
    missions: queue,
    emptyTitle: "Verification queue is clear",
    emptyText: "Newly submitted or returned cases will appear here.",
    metrics: [
      ["Pending verification", queue.length, "⌕", "Submitted, assigned, or on hold"],
      ["Urgent reviews", highRisk, "!", "Cases requiring priority attention"],
      ["With evidence notes", ready, "▤", "Cases with recorded review activity"],
      ["Checklist target", "100%", "✓", "Required before recommendation"]
    ]
  });
}

function renderMissionTable() {
  const table = document.querySelector("#mission-table");
  if (!table) return;
  const statusFilter = document.querySelector("#status-filter").value;
  const categoryFilter = document.querySelector("#category-filter").value;
  const term = searchTerm.trim().toLowerCase();
  const missions = visibleMissions().filter(m => {
    const matchesText = !term || [m.title, m.id, m.beneficiary, m.location, m.provider, m.category]
      .join(" ").toLowerCase().includes(term);
    return matchesText
      && (statusFilter === "all" || m.status === statusFilter)
      && (categoryFilter === "all" || m.category === categoryFilter);
  });

  table.innerHTML = missions.length ? missions.map(mission => {
    const category = iconFor(mission.category);
    return `
      <div class="table-row" data-mission-id="${mission.id}" tabindex="0" role="button">
        <div class="table-title">
          <span class="category-icon" style="background:${category.color}">${category.icon}</span>
          <span><strong>${escapeHTML(mission.title)}</strong><small>${mission.id} · ${escapeHTML(mission.beneficiary)}</small></span>
        </div>
        <div>${statusPill(mission.status)}</div>
        <div><strong>${formatCurrency(mission.amount)}</strong></div>
        <div>${progressFor(mission)}</div>
        <div>${formatDate(mission.targetDate)}</div>
        <div class="chevron">›</div>
      </div>`;
  }).join("") : `<div class="empty-state"><span>⌕</span><h3>No matching cases</h3><p>Adjust the search or filters and try again.</p></div>`;
}

function renderNeeds() {
  const categories = Object.entries(categoryMeta);
  main.innerHTML = `
    ${pageHeader("Needs map", "Where help is being called for.", "See the shape of the pilot caseload across people and categories.")}
    <section class="cards-grid">
      ${categories.map(([category, meta]) => {
        const missions = tenantCases().filter(m => m.category === category);
        const open = missions.filter(m => m.status !== "closed").length;
        const amount = missions.reduce((sum, m) => sum + m.amount, 0);
        return `
          <article class="info-card">
            <span class="category-icon" style="background:${meta.color}">${meta.icon}</span>
            <h3>${category}</h3>
            <p>${categoryDescription(category)}</p>
            <div class="info-card-footer"><span>${open} active need${open === 1 ? "" : "s"}</span><strong>${formatCurrency(amount)}</strong></div>
          </article>`;
      }).join("")}
    </section>`;
}

function categoryDescription(category) {
  return {
    "Education": "School fees, books, uniforms, tutoring, and access to learning.",
    "Health & Healing": "Medical care, medicine, procedures, rehabilitation, and recovery.",
    "Special Needs": "Therapy, assistive tools, and family-centered developmental support.",
    "Livelihood": "Skills and equipment that help restore dignified, stable income.",
    "Women Rise": "Practical support for safety, vocation, and family stability.",
    "Elder Care": "Mobility, nutrition, medication, and essential daily care.",
    "Emergency Relief": "Fast, verified help after crisis, fire, flood, or displacement.",
    "Community": "Small local projects with visible, measurable shared benefit."
  }[category];
}

function renderProviders() {
  const providerMap = new Map();
  tenantCases().filter(m => m.provider && m.provider !== "Not assigned").forEach(m => {
    if (!providerMap.has(m.provider)) providerMap.set(m.provider, { missions: 0, total: 0, categories: new Set() });
    const provider = providerMap.get(m.provider);
    provider.missions += 1;
    provider.total += m.amount;
    provider.categories.add(m.category);
  });
  const providers = [...providerMap.entries()];

  main.innerHTML = `
    ${pageHeader("Module 4 · Provider Management", "Providers who make fulfillment possible.", "Maintain the directory, verification, quotes, estimates, invoices, and delivery confirmation.")}
    <section class="cards-grid">
      ${providers.map(([name, data]) => `
        <article class="info-card">
          <span class="category-icon">⌘</span>
          <h3>${escapeHTML(name)}</h3>
          <p>${[...data.categories].join(" · ")}</p>
          <div class="info-card-footer"><span>${data.missions} case${data.missions === 1 ? "" : "s"}</span><strong>${formatCurrency(data.total)}</strong></div>
        </article>`).join("")}
      <article class="info-card">
        <span class="category-icon" style="background:#f4f5f4">＋</span>
        <h3>Add providers through cases</h3>
        <p>Select a provider inside a case after quotes, identity, and capability have been checked.</p>
        <div class="info-card-footer"><span>Provider registry</span><strong>Growing</strong></div>
      </article>
    </section>`;
}

function renderPayments() {
  const cases = tenantCases();
  const queue = cases.filter(m => ["provider-selection", "payment"].includes(m.status));
  const paid = cases.filter(m => m.funded > 0);
  const reconciled = cases.filter(m => ["impact", "closed"].includes(m.status) && m.funded >= m.amount);
  const utilized = cases.reduce((sum, item) => sum + item.funded, 0);
  main.innerHTML = moduleQueue({
    label: "Module 5 · Payment Tracking",
    title: "Payment requests",
    description: "Approve direct provider payments, record UTR references, match invoices, and reconcile transactions.",
    missions: queue,
    emptyTitle: "No pending payment requests",
    emptyText: "Cases appear after approval and provider selection.",
    metrics: [
      ["Pending requests", queue.length, "₹", "Awaiting payment or completion"],
      ["Funds utilized", formatCurrency(utilized), "↗", "Recorded direct payments"],
      ["Payments recorded", paid.length, "▤", "Cases with payment activity"],
      ["Reconciled cases", reconciled.length, "✓", "Payment complete before impact"]
    ]
  });
}

function renderImpact() {
  const queue = tenantCases().filter(m => ["impact", "closed"].includes(m.status));
  const openImpact = queue.filter(m => m.status === "impact");
  const closed = queue.filter(m => m.status === "closed");
  const evidenceCount = queue.reduce((sum, item) => sum + item.notes.length, 0);
  main.innerHTML = moduleQueue({
    label: "Module 6 · Impact Tracking",
    title: "Impact evidence",
    description: "Capture photos, documents, testimonials, delivery confirmation, and outcome reports before closure.",
    missions: queue,
    emptyTitle: "No cases awaiting impact evidence",
    emptyText: "Paid cases appear here when delivery and outcomes need to be recorded.",
    metrics: [
      ["Awaiting evidence", openImpact.length, "✦", "Paid cases not yet closed"],
      ["Cases closed", closed.length, "✓", "Closure checklist completed"],
      ["Evidence entries", evidenceCount, "▤", "Notes and records across impact cases"],
      ["Closure target", "100%", "◎", "Financial and impact evidence required"]
    ]
  });
}

function renderReports() {
  const scopedMissions = visibleMissions();
  const completed = scopedMissions.filter(m => m.status === "closed");
  const impact = completed.reduce((sum, m) => sum + m.amount, 0);
  const total = scopedMissions.reduce((sum, m) => sum + m.amount, 0);
  main.innerHTML = `
    ${pageHeader("Pilot operations", "Prove the process before scaling it.", "Track throughput, closure evidence, and the operational learning behind the first 50–100 cases.")}
    <section class="report-hero">
      <div>
        <span class="eyebrow">Internal pilot · 2026</span>
        <h2>${completed.length} of 50 minimum pilot cases closed with evidence.</h2>
        <p>${formatCurrency(impact)} has reached documented outcomes. The immediate goal is reliable execution and learning—not a public donor marketplace.</p>
      </div>
      <div class="report-number">
        <strong>${completed.length}</strong>
        <span>cases responsibly closed</span>
      </div>
    </section>
    <section class="stats-grid" style="margin-top:20px">
      ${statCard("Closed-case value", formatCurrency(impact), "✓", "Direct provider payments")}
      ${statCard("Active pipeline", formatCurrency(total - impact), "◈", "Across open cases")}
      ${statCard("Closure evidence", completed.length ? "100%" : "—", "▥", "For closed pilot cases")}
      ${statCard("Need categories", new Set(tenantCases().map(m => m.category)).size, "◎", "Areas of practical care")}
    </section>
    <div class="panel">
      <div class="panel-header">
        <div><h2>Closed cases</h2><p>Internal evidence for process learning and future credibility</p></div>
        ${can("export") ? '<button class="button secondary small" id="export-button">Export data</button>' : ""}
      </div>
      <div class="mission-list">${missionRows(completed)}</div>
    </div>`;
}

function renderRoles() {
  if (!can("admin")) {
    activeView = "dashboard";
    renderDashboard();
    return;
  }
  main.innerHTML = `
    ${pageHeader("Module 1 · User & Access Management", "Four staff roles. One accountable workflow.", "Manage registration, login readiness, roles, permissions, and staff profiles for the internal pilot.")}
    <div class="workflow-strip">
      <div class="workflow-step"><strong>Need</strong><small>Case Manager</small></div>
      <div class="workflow-step"><strong>Verify</strong><small>Verifier</small></div>
      <div class="workflow-step"><strong>Approve</strong><small>Case Manager</small></div>
      <div class="workflow-step"><strong>Provider</strong><small>Case Manager</small></div>
      <div class="workflow-step"><strong>Payment</strong><small>Finance</small></div>
      <div class="workflow-step"><strong>Impact</strong><small>Case Manager</small></div>
      <div class="workflow-step"><strong>Closure</strong><small>Case Manager</small></div>
    </div>
    <section class="cards-grid">
      ${Object.entries(roles).map(([key, item]) => `
        <article class="info-card role-card ${key === activeRole ? "active-role" : ""}">
          ${key === activeRole ? '<span class="status verified role-chip">Current preview</span>' : ""}
          <span class="category-icon">${item.icon}</span>
          <h3>${item.label}</h3>
          <p>${item.description}</p>
          <ul>${item.responsibilities.map(value => `<li>${value}</li>`).join("")}</ul>
          <button class="button secondary small" data-preview-role="${key}">Preview role</button>
        </article>`).join("")}
    </section>`;
}

function tenantTypeContent(type) {
  return {
    church: {
      label: "Church Management",
      title: "Compassion organized for your community.",
      description: "Manage benevolence requests, outreach funds, volunteers, pastoral review, and measurable care.",
      pillars: [
        ["Benevolence", "Member and neighborhood care requests"],
        ["Outreach", "Church-led service initiatives"],
        ["Governance", "Pastoral and trustee approvals"],
        ["Stewardship", "Restricted-fund accountability"]
      ]
    },
    ngo: {
      label: "NGO Management",
      title: "Programs, field operations, and outcomes together.",
      description: "Coordinate beneficiaries, programs, grants, verifiers, providers, and donor-ready evidence.",
      pillars: [
        ["Programs", "Budgets and outcome frameworks"],
        ["Field teams", "Assignments and verification"],
        ["Partners", "Providers and implementing NGOs"],
        ["M&E", "Indicators and outcome evidence"]
      ]
    },
    foundation: {
      label: "Family Foundation Portal",
      title: "A giving legacy with discipline and memory.",
      description: "Manage family missions, grant requests, trustee decisions, annual budgets, and generational impact.",
      pillars: [
        ["Family missions", "Shared values and focus areas"],
        ["Grant review", "Trustee decisions and rationale"],
        ["Legacy", "Multi-year giving history"],
        ["Impact", "Family-facing outcome reports"]
      ]
    },
    csr: {
      label: "CSR Portal",
      title: "Community investment that stands up to scrutiny.",
      description: "Plan CSR initiatives, govern approvals, track implementing partners, utilization, outcomes, and compliance.",
      pillars: [
        ["Initiatives", "CSR themes and annual plans"],
        ["Partners", "NGO due diligence and delivery"],
        ["Utilization", "Budget, disbursement, and evidence"],
        ["Compliance", "Committee and audit reporting"]
      ]
    }
  }[type] || {
    label: "Organization Management",
    title: "One operating system for accountable impact.",
    description: "Configure programs, people, workflows, and reporting for your organization.",
    pillars: []
  };
}

function renderTenantOverview() {
  const current = tenant();
  const content = tenantTypeContent(current.type);
  const programs = state.tenantPrograms.filter(item => item.tenantId === current.id);
  const members = state.tenantMembers.filter(item => item.tenantId === current.id);
  const cases = tenantCases();
  const programBudget = programs.reduce((sum, item) => sum + item.budget, 0);
  const programSpent = programs.reduce((sum, item) => sum + item.spent, 0);
  main.innerHTML = `
    ${pageHeader(content.label, content.title, content.description)}
    <section class="tenant-identity">
      <div class="tenant-logo" style="background:${current.primaryColor}">${escapeHTML(current.logoText)}</div>
      <div><span class="eyebrow">${organizationTypeLabel(current.type)}</span><h2>${escapeHTML(current.name)}</h2><p>${escapeHTML(current.tagline)}</p></div>
      <span class="status verified">${current.status}</span>
    </section>
    <section class="stats-grid">
      ${statCard("Programs", programs.length, "◎", "Active organization initiatives")}
      ${statCard("Program budget", formatCurrency(programBudget), "₹", `${formatCurrency(programSpent)} utilized`)}
      ${statCard("Team & trustees", members.length, "♙", "Members in this tenant only")}
      ${statCard(current.caseTerm + "s", cases.length, "◈", "Strictly isolated organization data")}
    </section>
    <section class="cards-grid">
      ${content.pillars.map(([title, text], index) => `
        <article class="info-card">
          <span class="category-icon">${["♡", "◎", "✓", "▥"][index]}</span>
          <h3>${title}</h3><p>${text}</p>
          <div class="info-card-footer"><span>${escapeHTML(current.shortName)}</span><strong>Configured</strong></div>
        </article>`).join("")}
    </section>`;
}

function renderTenantPrograms() {
  const current = tenant();
  const programs = state.tenantPrograms.filter(item => item.tenantId === current.id);
  main.innerHTML = `
    ${pageHeader(`${organizationTypeLabel(current.type)} · Programs`, `${current.missionTerm} portfolio`, `Plan budgets, owners, categories, and utilization for ${current.name}.`)}
    <section class="mission-budget-grid">
      ${programs.map(program => {
        const pct = program.budget ? Math.round(program.spent / program.budget * 100) : 0;
        return `<article class="budget-card">
          <div class="budget-head"><div><span class="eyebrow">${escapeHTML(program.category)}</span><h2>${escapeHTML(program.name)}</h2></div><span class="status verified">Active</span></div>
          <p>Owned by ${escapeHTML(program.owner)}.</p>
          <div class="budget-number"><strong>${formatCurrency(program.budget - program.spent)}</strong><span>remaining of ${formatCurrency(program.budget)}</span></div>
          <div class="progress-track"><i style="width:${Math.min(100, pct)}%"></i></div>
          <div class="budget-meta"><span>${pct}% utilized</span><span>${escapeHTML(current.geography)}</span></div>
        </article>`;
      }).join("") || `<div class="empty-state"><span>◎</span><h3>No programs configured</h3><p>Add the first ${current.missionTerm.toLowerCase()} for this organization.</p></div>`}
    </section>`;
}

function renderTenantMembers() {
  const current = tenant();
  const members = state.tenantMembers.filter(item => item.tenantId === current.id);
  main.innerHTML = `
    ${pageHeader(`${organizationTypeLabel(current.type)} · Governance`, "Team, trustees, and authority.", "Membership and role assignments are isolated within the selected organization.")}
    <section class="panel table-panel">
      <div class="table-head" style="grid-template-columns:1.4fr 1fr 1fr 80px"><span>Member</span><span>Role</span><span>Organization</span><span>Status</span></div>
      ${members.map(member => `<div class="table-row" style="grid-template-columns:1.4fr 1fr 1fr 80px">
        <div class="table-title"><span class="avatar">${member.name.split(" ").map(part => part[0]).slice(0,2).join("")}</span><span><strong>${escapeHTML(member.name)}</strong><small>Tenant member</small></span></div>
        <div>${escapeHTML(member.role)}</div><div>${escapeHTML(current.shortName)}</div><div><span class="status verified">${member.status}</span></div>
      </div>`).join("") || `<div class="empty-state"><span>♙</span><h3>No members configured</h3><p>Invite the first organization administrator.</p></div>`}
    </section>`;
}

function renderWhiteLabel() {
  const current = tenant();
  main.innerHTML = `
    ${pageHeader("White Labeling", "Make MissionOS feel like your organization.", "Configure brand identity, terminology, geography, and approval policy without changing the core trust model.")}
    <section class="brand-studio">
      <form id="brand-form" class="brand-form">
        <label>Organization name<input name="name" value="${escapeHTML(current.name)}" required></label>
        <label>Short name<input name="shortName" value="${escapeHTML(current.shortName)}" required></label>
        <label>Tagline<input name="tagline" value="${escapeHTML(current.tagline)}" required></label>
        <label>Logo initials<input name="logoText" value="${escapeHTML(current.logoText)}" maxlength="3" required></label>
        <label>Primary color<input name="primaryColor" type="color" value="${current.primaryColor}"></label>
        <label>Accent color<input name="accentColor" type="color" value="${current.accentColor}"></label>
        <label>Case terminology<input name="caseTerm" value="${escapeHTML(current.caseTerm)}" required></label>
        <label>Mission terminology<input name="missionTerm" value="${escapeHTML(current.missionTerm)}" required></label>
        <label>Operating geography<input name="geography" value="${escapeHTML(current.geography)}" required></label>
        <label>Approval threshold (₹)<input name="approvalThreshold" type="number" min="0" value="${current.approvalThreshold}" required></label>
        <button class="button primary">Save tenant configuration</button>
      </form>
      <aside class="brand-preview" style="--preview-primary:${current.primaryColor};--preview-accent:${current.accentColor}">
        <div class="brand-preview-bar"><span>${escapeHTML(current.logoText)}</span><strong>${escapeHTML(current.shortName)}</strong></div>
        <div class="brand-preview-body"><span class="eyebrow">${organizationTypeLabel(current.type)}</span><h2>${escapeHTML(current.tagline)}</h2><p>Your ${current.caseTerm.toLowerCase()} and ${current.missionTerm.toLowerCase()} workflows, powered by MissionOS.</p><button>Primary action</button></div>
      </aside>
    </section>`;
}

function missionSpent(missionId) {
  return state.allocations
    .filter(item => item.missionId === missionId)
    .reduce((sum, item) => sum + item.amount, 0);
}

function causeFunded(causeId) {
  return state.allocations
    .filter(item => item.causeId === causeId)
    .reduce((sum, item) => sum + item.amount, 0);
}

function recommendationScore(cause, mission) {
  let score = 30;
  const reasons = ["Verified by Arukah"];
  if (mission.categories.includes(cause.category)) {
    score += 35;
    reasons.push(`Matches ${cause.category} focus`);
  }
  if (cause.location.toLowerCase().includes(mission.geography.toLowerCase())) {
    score += 20;
    reasons.push(`Within ${mission.geography}`);
  }
  if (cause.urgency === "urgent") {
    score += 10;
    reasons.push("Time-sensitive need");
  }
  const available = mission.budget - missionSpent(mission.id);
  const remaining = Math.max(0, cause.amount - causeFunded(cause.id));
  if (remaining <= available) {
    score += 5;
    reasons.push("Fits remaining mission budget");
  }
  return { score: Math.min(100, score), reasons };
}

function causeCard(cause, options = {}) {
  const meta = iconFor(cause.category);
  const funded = causeFunded(cause.id);
  const pct = Math.min(100, Math.round((funded / cause.amount) * 100));
  const match = options.mission ? recommendationScore(cause, options.mission) : null;
  return `
    <article class="cause-card">
      <div class="cause-card-top">
        <span class="category-icon" style="background:${meta.color}">${meta.icon}</span>
        <div>${match ? `<span class="match-score">${match.score}% match</span>` : '<span class="verified-mark">✓ Verified</span>'}</div>
      </div>
      <span class="eyebrow">${escapeHTML(cause.category)} · ${escapeHTML(cause.location)}</span>
      <h3>${escapeHTML(cause.title)}</h3>
      <p>${escapeHTML(cause.summary)}</p>
      ${match ? `<div class="match-reasons">${match.reasons.slice(0, 3).map(reason => `<span>${escapeHTML(reason)}</span>`).join("")}</div>` : ""}
      <div class="cause-funding">
        <div class="progress-track"><i style="width:${pct}%"></i></div>
        <div><strong>${formatCurrency(funded)}</strong> of ${formatCurrency(cause.amount)} funded</div>
      </div>
      <button class="button primary small" data-cause-id="${cause.id}">${pct >= 100 ? "View impact" : "Support this cause"}</button>
    </article>`;
}

function renderDonorHome() {
  const donorMissions = tenantDonorMissions();
  const causes = tenantCauses();
  const missionIds = new Set(donorMissions.map(item => item.id));
  const allocations = state.allocations.filter(item => missionIds.has(item.missionId));
  const totalBudget = donorMissions.reduce((sum, item) => sum + item.budget, 0);
  const totalGiven = allocations.reduce((sum, item) => sum + item.amount, 0);
  const supported = new Set(allocations.map(item => item.causeId)).size;
  const leadMission = donorMissions[0];
  const recommendations = leadMission
    ? [...causes].sort((a, b) => recommendationScore(b, leadMission).score - recommendationScore(a, leadMission).score)
    : causes;
  main.innerHTML = `
    ${pageHeader("Donor Portal", "Your generosity has a direction.", "Create missions, fund verified causes, and follow every contribution toward a real outcome.")}
    ${roleBanner()}
    <section class="stats-grid">
      ${statCard("Annual mission budget", formatCurrency(totalBudget), "◎", `${donorMissions.length} active mission${donorMissions.length === 1 ? "" : "s"}`)}
      ${statCard("Allocated", formatCurrency(totalGiven), "₹", `${totalBudget ? Math.round(totalGiven / totalBudget * 100) : 0}% of your mission budgets`)}
      ${statCard("Causes supported", supported, "♡", "Across verified categories")}
      ${statCard("Impact stories", tenantCases().filter(item => item.status === "closed").length, "✦", "Completed outcomes available")}
    </section>
    <section class="panel">
      <div class="panel-header">
        <div><h2>Recommended for your mission</h2><p>Transparent matching based on your categories, geography, urgency, and remaining budget</p></div>
        <button class="text-button" data-view-link="recommendations">See why →</button>
      </div>
      <div class="cause-grid compact">${recommendations.slice(0, 3).map(cause => causeCard(cause, { mission: leadMission })).join("")}</div>
    </section>`;
}

function renderDonorMissions() {
  const donorMissions = tenantDonorMissions();
  main.innerHTML = `
    ${pageHeader("Mission Creation & Budgeting", "Give your compassion a plan.", "Define a goal, annual budget, geography, and focus categories—then allocate only to verified causes.")}
    <div class="toolbar"><button class="button primary" data-new-donor-mission>＋ Create mission</button></div>
    <section class="mission-budget-grid">
      ${donorMissions.map(mission => {
        const spent = missionSpent(mission.id);
        const pct = Math.min(100, Math.round(spent / mission.budget * 100));
        const allocations = state.allocations.filter(item => item.missionId === mission.id);
        return `
          <article class="budget-card">
            <div class="budget-head"><div><span class="eyebrow">${escapeHTML(mission.geography)}</span><h2>${escapeHTML(mission.name)}</h2></div><span class="status verified">Active</span></div>
            <p>${escapeHTML(mission.goal)}</p>
            <div class="budget-number"><strong>${formatCurrency(mission.budget - spent)}</strong><span>remaining of ${formatCurrency(mission.budget)}</span></div>
            <div class="progress-track"><i style="width:${pct}%"></i></div>
            <div class="budget-meta"><span>${pct}% allocated</span><span>${allocations.length} contribution${allocations.length === 1 ? "" : "s"}</span></div>
            <div class="tag-list">${mission.categories.map(item => `<span>${escapeHTML(item)}</span>`).join("")}</div>
            <button class="button secondary small" data-view-link="recommendations">Find matching causes</button>
          </article>`;
      }).join("") || `<div class="empty-state"><span>◎</span><h3>Create your first mission</h3><p>Start with a goal and annual giving budget.</p><button class="button primary" data-new-donor-mission>Create mission</button></div>`}
    </section>`;
}

function renderMarketplace() {
  const term = searchTerm.trim().toLowerCase();
  const causes = tenantCauses().filter(cause =>
    !term || [cause.title, cause.category, cause.location, cause.summary].join(" ").toLowerCase().includes(term)
  );
  main.innerHTML = `
    ${pageHeader("Cause Marketplace", "Verified needs. Protected dignity.", "Browse privacy-safe causes published only after internal verification and approval.")}
    <div class="marketplace-note">Private beneficiary identities, documents, medical information, and exact addresses are never shown here.</div>
    <section class="cause-grid">${causes.length ? causes.map(cause => causeCard(cause)).join("") : '<div class="empty-state"><span>⌕</span><h3>No matching causes</h3><p>Try another category, location, or keyword.</p></div>'}</section>`;
}

function renderRecommendations() {
  const donorMissions = tenantDonorMissions();
  const causes = tenantCauses();
  const mission = donorMissions[0];
  const recommendations = mission
    ? [...causes].sort((a, b) => recommendationScore(b, mission).score - recommendationScore(a, mission).score)
    : causes;
  main.innerHTML = `
    ${pageHeader("AI Recommendations", "Explainable matches—not mysterious choices.", mission ? `Recommendations for ${mission.name}, based on its saved preferences.` : "Create a mission to receive tailored cause recommendations.")}
    <div class="recommendation-explainer">
      <strong>How matching works</strong>
      <span>Category match 35%</span><span>Geography 20%</span><span>Verification baseline 30%</span><span>Urgency 10%</span><span>Budget fit 5%</span>
    </div>
    <section class="cause-grid">${recommendations.map(cause => causeCard(cause, { mission })).join("")}</section>`;
}

function renderDonorImpact() {
  const donorMissions = tenantDonorMissions();
  const missionIds = new Set(donorMissions.map(item => item.id));
  const allocations = state.allocations.filter(item => missionIds.has(item.missionId)).map(allocation => ({
    ...allocation,
    mission: state.donorMissions.find(item => item.id === allocation.missionId),
    cause: state.publishedCauses.find(item => item.id === allocation.causeId),
    source: state.missions.find(item => item.id === state.publishedCauses.find(cause => cause.id === allocation.causeId)?.sourceCaseId)
  }));
  const total = allocations.reduce((sum, item) => sum + item.amount, 0);
  const completed = allocations.filter(item => item.source?.status === "closed");
  main.innerHTML = `
    ${pageHeader("Impact Reports", "Follow the contribution beyond payment.", "See which mission funded each cause and whether delivery and outcome evidence are complete.")}
    <section class="report-hero">
      <div><span class="eyebrow">Your giving journey</span><h2>${formatCurrency(total)} allocated to verified causes.</h2><p>${completed.length} supported cause${completed.length === 1 ? " has" : "s have"} reached documented closure so far.</p></div>
      <div class="report-number"><strong>${completed.length}/${allocations.length}</strong><span>contributions with completed impact</span></div>
    </section>
    <section class="impact-timeline">
      ${allocations.map(item => `
        <article class="impact-entry">
          <span class="activity-dot">${item.source?.status === "closed" ? "✓" : "↗"}</span>
          <div>
            <span class="eyebrow">${escapeHTML(item.mission?.name || "Mission")}</span>
            <h3>${escapeHTML(item.cause?.title || "Cause")}</h3>
            <p>${escapeHTML(item.cause?.outcome || "")}</p>
            <div class="impact-entry-foot"><strong>${formatCurrency(item.amount)}</strong>${statusPill(item.source?.status || "approved")}</div>
          </div>
        </article>`).join("")}
    </section>`;
}

function renderView() {
  const renderers = {
    dashboard: renderDashboard,
    missions: renderMissions,
    verification: renderVerification,
    providers: renderProviders,
    payments: renderPayments,
    impact: renderImpact,
    reports: renderReports,
    roles: renderRoles,
    "donor-home": renderDonorHome,
    "donor-missions": renderDonorMissions,
    marketplace: renderMarketplace,
    recommendations: renderRecommendations,
    "donor-impact": renderDonorImpact,
    "tenant-overview": renderTenantOverview,
    "tenant-programs": renderTenantPrograms,
    "tenant-members": renderTenantMembers,
    "white-label": renderWhiteLabel
  };
  (renderers[activeView] || renderDashboard)();
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.view === activeView);
  });
  applyRoleUI();
  bindDynamicActions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindDynamicActions() {
  document.querySelectorAll("[data-mission-id]").forEach(row => {
    row.addEventListener("click", () => openMission(row.dataset.missionId));
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") openMission(row.dataset.missionId);
    });
  });
  document.querySelectorAll("[data-new-mission]").forEach(button => button.addEventListener("click", openMissionDialog));
  document.querySelectorAll("[data-view-link]").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.viewLink));
  });
  document.querySelector("#export-button")?.addEventListener("click", exportData);
  document.querySelectorAll("[data-preview-role]").forEach(button => {
    button.addEventListener("click", () => setRole(button.dataset.previewRole));
  });
  document.querySelectorAll("[data-new-donor-mission]").forEach(button => {
    button.addEventListener("click", () => donorMissionDialog.showModal());
  });
  document.querySelectorAll("[data-cause-id]").forEach(button => {
    button.addEventListener("click", () => openCause(button.dataset.causeId));
  });
  document.querySelector("#brand-form")?.addEventListener("submit", updateTenantBrand);
}

function setRole(nextRole) {
  if (!roles[nextRole]) return;
  activeRole = nextRole;
  localStorage.setItem(ROLE_KEY, activeRole);
  activeView = activeRole === "donor" ? "donor-home" : "dashboard";
  closeDrawer();
  renderView();
  document.querySelector("#role-select").value = activeRole;
  showToast(`Previewing ${role().label}.`);
}

function refreshTenantSelect() {
  const selector = document.querySelector("#tenant-select");
  selector.innerHTML = state.tenants
    .map(item => `<option value="${item.id}">${escapeHTML(item.shortName)} · ${organizationTypeLabel(item.type)}</option>`)
    .join("");
  selector.value = activeTenantId;
}

function setTenant(nextTenantId) {
  if (!state.tenants.some(item => item.id === nextTenantId)) return;
  activeTenantId = nextTenantId;
  localStorage.setItem(TENANT_KEY, activeTenantId);
  closeDrawer();
  if (activeRole === "donor") activeView = "donor-home";
  else activeView = "tenant-overview";
  renderView();
  refreshTenantSelect();
  showToast(`Switched to ${tenant().name}. Tenant data is isolated.`);
}

function canAccessView(view) {
  const donorViews = ["donor-home", "donor-missions", "marketplace", "recommendations", "donor-impact"];
  if (activeRole === "donor") return donorViews.includes(view);
  if (donorViews.includes(view)) return false;
  const permission = {
    verification: "verify",
    providers: "provider",
    payments: "pay",
    impact: "impact",
    reports: "export",
    roles: "admin",
    "tenant-members": "admin",
    "white-label": "admin"
  }[view];
  return !permission || can(permission);
}

function updateTenantBrand(event) {
  event.preventDefault();
  if (!can("admin")) return;
  const current = tenant();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  Object.assign(current, {
    name: data.name.trim(),
    shortName: data.shortName.trim(),
    tagline: data.tagline.trim(),
    logoText: data.logoText.trim().toUpperCase(),
    primaryColor: data.primaryColor,
    accentColor: data.accentColor,
    caseTerm: data.caseTerm.trim(),
    missionTerm: data.missionTerm.trim(),
    geography: data.geography.trim(),
    approvalThreshold: Number(data.approvalThreshold)
  });
  saveState();
  renderView();
  refreshTenantSelect();
  showToast("Tenant branding and workflow terminology saved.");
}

function switchView(view) {
  if (!canAccessView(view)) {
    showToast(`${role().label} cannot access that module.`);
    return;
  }
  activeView = view;
  searchTerm = "";
  renderView();
  closeMobileMenu();
}

function openCause(id) {
  const cause = tenantCauses().find(item => item.id === id);
  if (!cause) return;
  const source = state.missions.find(item => item.id === cause.sourceCaseId);
  const funded = causeFunded(id);
  const remaining = Math.max(0, cause.amount - funded);
  drawer.innerHTML = `
    <div class="drawer-top">
      <div><span class="eyebrow">${cause.id} · ${escapeHTML(cause.category)}</span><h2>${escapeHTML(cause.title)}</h2><p>${escapeHTML(cause.location)}</p></div>
      <button class="close-button" data-close-drawer aria-label="Close">×</button>
    </div>
    <div class="marketplace-note" style="margin-top:20px">This is a privacy-safe cause. Personal identity and case documents remain restricted to authorized Arukah staff.</div>
    <div class="drawer-summary">${escapeHTML(cause.summary)}</div>
    <div class="drawer-grid">
      <div class="drawer-data"><small>Verified need</small><strong>${formatCurrency(cause.amount)}</strong></div>
      <div class="drawer-data"><small>Still needed</small><strong>${formatCurrency(remaining)}</strong></div>
      <div class="drawer-data"><small>Outcome goal</small><strong>${escapeHTML(cause.outcome)}</strong></div>
      <div class="drawer-data"><small>Current progress</small><strong>${source ? stageLabels[source.status] : "Approved"}</strong></div>
    </div>
    <section class="drawer-section">
      <div class="drawer-section-title"><h3>Funding progress</h3><span class="eyebrow">${Math.round(funded / cause.amount * 100)}%</span></div>
      <div class="progress-track"><i style="width:${Math.min(100, funded / cause.amount * 100)}%"></i></div>
    </section>
    ${remaining > 0 && tenantDonorMissions().length ? `
      <section class="drawer-section">
        <div class="drawer-section-title"><h3>Support through a mission</h3></div>
        <form id="allocation-form" class="allocation-form">
          <label>Mission<select name="missionId">${tenantDonorMissions().map(mission => `<option value="${mission.id}">${escapeHTML(mission.name)} · ${formatCurrency(mission.budget - missionSpent(mission.id))} available</option>`).join("")}</select></label>
          <label>Contribution amount (₹)<input name="amount" type="number" min="100" max="${remaining}" value="${Math.min(5000, remaining)}" required></label>
          <button class="button primary">Allocate funds</button>
        </form>
      </section>` : `<div class="permission-note">${remaining <= 0 ? "This cause is fully funded." : "Create a mission before allocating funds."}</div>`}
    <section class="drawer-section">
      <div class="drawer-section-title"><h3>Trust signals</h3></div>
      <div class="notes">
        <div class="note"><p>✓ Need and amount reviewed by Arukah verification staff.</p></div>
        <div class="note"><p>✓ Payment is directed to the selected service provider.</p></div>
        <div class="note"><p>✓ Impact is tracked through the private source case.</p></div>
      </div>
    </section>`;
  drawer.classList.add("open");
  drawerBackdrop.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  drawer.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);
  drawer.querySelector("#allocation-form")?.addEventListener("submit", event => allocateToCause(event, id));
}

function allocateToCause(event, causeId) {
  event.preventDefault();
  if (activeRole !== "donor") return;
  const data = new FormData(event.currentTarget);
  const mission = tenantDonorMissions().find(item => item.id === data.get("missionId"));
  const cause = tenantCauses().find(item => item.id === causeId);
  const amount = Number(data.get("amount"));
  if (!mission || !cause || !amount) return;
  const budgetRemaining = mission.budget - missionSpent(mission.id);
  const causeRemaining = cause.amount - causeFunded(cause.id);
  if (amount > budgetRemaining || amount > causeRemaining) {
    showToast("That amount exceeds the available mission budget or cause need.");
    return;
  }
  state.allocations.push({
    id: `ALLOC-${Date.now()}`,
    missionId: mission.id,
    causeId,
    amount,
    at: new Date().toISOString()
  });
  saveState();
  closeDrawer();
  renderView();
  showToast(`${formatCurrency(amount)} allocated through ${mission.name}.`);
}

function createDonorMission(event) {
  event.preventDefault();
  if (activeRole !== "donor") return;
  const data = new FormData(event.currentTarget);
  const categories = data.getAll("categories");
  state.donorMissions.unshift({
    id: `MISSION-${Date.now()}`,
    tenantId: activeTenantId,
    name: data.get("name").trim(),
    budget: Number(data.get("budget")),
    geography: data.get("geography").trim(),
    categories,
    goal: data.get("goal").trim(),
    createdAt: new Date().toISOString()
  });
  saveState();
  donorMissionForm.reset();
  donorMissionDialog.close();
  activeView = "donor-missions";
  renderView();
  showToast("Mission created with its annual budget.");
}

function openMission(id) {
  const mission = visibleMissions().find(item => item.id === id);
  if (!mission) return;
  const stageIndex = stageOrder.indexOf(mission.status);
  drawer.innerHTML = `
    <div class="drawer-top">
      <div>
        <span class="eyebrow">${mission.id} · ${escapeHTML(mission.category)}</span>
        <h2>${escapeHTML(mission.title)}</h2>
        <p>${escapeHTML(mission.beneficiary)} · ${escapeHTML(mission.location)}</p>
      </div>
      <button class="close-button" data-close-drawer aria-label="Close">×</button>
    </div>
    <div class="drawer-summary">${escapeHTML(mission.summary)}</div>
    <div class="drawer-grid">
      <div class="drawer-data"><small>Approved amount</small><strong>${formatCurrency(mission.amount)}</strong></div>
      <div class="drawer-data"><small>Payment recorded</small><strong>${formatCurrency(mission.funded)}</strong></div>
      <div class="drawer-data"><small>Target date</small><strong>${formatDate(mission.targetDate, { day: "numeric", month: "short", year: "numeric" })}</strong></div>
      <div class="drawer-data"><small>Urgency</small><strong style="text-transform:capitalize">${mission.urgency}</strong></div>
      <div class="drawer-data" style="grid-column:span 2"><small>Provider</small><strong>${escapeHTML(mission.provider)}</strong></div>
    </div>

    <section class="drawer-section">
      <div class="drawer-section-title"><h3>Case workflow</h3>${statusPill(mission.status)}</div>
      <div class="stage-list">
        ${stageOrder.map((stage, index) => `
          <button class="stage ${index <= stageIndex ? "done" : ""} ${index === stageIndex ? "current" : ""}" data-set-stage="${stage}" ${canMoveTo(stage, mission) ? "" : "disabled"}>
            ${stageLabels[stage]}
          </button>`).join("")}
      </div>
      <div class="permission-note">${roleActionNote()}</div>
    </section>

    ${can("provider") && ["approved", "provider-selection"].includes(mission.status) ? `<section class="drawer-section">
      <div class="drawer-section-title"><h3>Provider selection</h3><span class="eyebrow">Internal decision</span></div>
      <form class="note-form" id="provider-form">
        <input name="provider" required value="${escapeHTML(mission.provider === "Not assigned" ? "" : mission.provider)}" placeholder="Selected school, hospital, pharmacy, or vendor">
        <button class="button secondary small">Save</button>
      </form>
    </section>` : ""}

    <section class="drawer-section">
      <div class="drawer-section-title"><h3>Payment</h3><span class="eyebrow">${Math.round((mission.funded / mission.amount) * 100)}%</span></div>
      ${progressFor(mission)}
      ${can("pay") && ["provider-selection", "payment"].includes(mission.status) ? `<form class="note-form" id="funding-form" style="margin-top:12px">
        <input name="funded" type="number" min="0" max="${mission.amount}" value="${mission.funded}" aria-label="Payment amount">
        <button class="button secondary small">Record</button>
      </form>` : ""}
    </section>

    <section class="drawer-section">
      <div class="drawer-section-title"><h3>Case notes & evidence</h3><span class="eyebrow">${mission.notes.length} entries</span></div>
      ${can("note") ? `<form class="note-form" id="note-form">
        <input name="note" required placeholder="Add a verification or impact note…">
        <button class="button primary small">Add</button>
      </form>` : ""}
      <div class="notes">
        ${mission.notes.length ? [...mission.notes].reverse().map(note => `
          <div class="note"><p>${escapeHTML(note.text)}</p><time>${formatDate(note.at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</time></div>
        `).join("") : `<div class="note"><p>No notes yet. Add the first piece of this case's evidence trail.</p></div>`}
      </div>
    </section>

      <div class="drawer-actions">
      ${can("verify") && ["verification", "on-hold"].includes(mission.status) ? '<button class="button danger" id="reject-button">Recommend rejection</button>' : ""}
      ${can("verify") ? `<button class="button secondary" id="hold-button">${mission.status === "on-hold" ? "Resume case" : "Place on hold"}</button>` : ""}
      ${can("delete") ? '<button class="button danger" id="delete-button">Delete</button>' : ""}
    </div>`;

  drawer.classList.add("open");
  drawerBackdrop.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  drawer.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);
  drawer.querySelectorAll("[data-set-stage]").forEach(button => {
    button.addEventListener("click", () => updateStage(id, button.dataset.setStage));
  });
  drawer.querySelector("#note-form")?.addEventListener("submit", event => addNote(event, id));
  drawer.querySelector("#funding-form")?.addEventListener("submit", event => updateFunding(event, id));
  drawer.querySelector("#provider-form")?.addEventListener("submit", event => updateProvider(event, id));
  drawer.querySelector("#hold-button")?.addEventListener("click", () => {
    updateStage(id, mission.status === "on-hold" ? "verification" : "on-hold");
  });
  drawer.querySelector("#delete-button")?.addEventListener("click", () => deleteMission(id));
  drawer.querySelector("#reject-button")?.addEventListener("click", () => updateStage(id, "rejected"));
}

function canMoveTo(stage, mission) {
  const permission = {
    submitted: "create",
    verification: "verify",
    approved: "approve",
    "provider-selection": "provider",
    payment: "pay",
    impact: "impact",
    closed: "close"
  }[stage];
  if (!can(permission)) return false;
  if (can("admin") || !mission) return true;
  const allowedSources = {
    verification: ["submitted", "on-hold"],
    approved: ["verification"],
    "provider-selection": ["approved"],
    payment: ["provider-selection"],
    impact: ["payment"],
    closed: ["impact"]
  };
  return (allowedSources[stage] || []).includes(mission.status);
}

function roleActionNote() {
  return {
    superAdmin: "As Super Admin, you can intervene at every workflow stage. Routine case decisions should still remain with the assigned operational role.",
    caseManager: "You can submit cases, approve verified recommendations, select providers, track impact, and close cases when evidence is complete.",
    verifier: "You can move a submitted case through verification after checking identity, documents, amount, and provider facts.",
    financeManager: "You can record direct provider payments after approval and provider selection are complete."
  }[activeRole];
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawerBackdrop.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateStage(id, status) {
  const mission = state.missions.find(item => item.id === id);
  if (!mission || mission.status === status) return;
  if (status === "rejected" && !can("verify")) {
    showToast(`${role().label} cannot recommend rejection.`);
    return;
  }
  if (!["on-hold", "rejected"].includes(status) && !canMoveTo(status, mission)) {
    showToast(`${role().label} cannot perform that workflow action.`);
    return;
  }
  if (status === "on-hold" && !can("verify")) {
    showToast(`${role().label} cannot place cases on hold.`);
    return;
  }
  mission.status = status;
  if (status === "payment" && mission.funded < mission.amount) mission.funded = mission.amount;
  const text = `${mission.title} moved to ${stageLabels[status].toLowerCase()}.`;
  state.activities.unshift({ icon: status === "closed" ? "✓" : "↗", text, at: new Date().toISOString() });
  saveState();
  renderView();
  openMission(id);
  showToast(`Case moved to ${stageLabels[status]}.`);
}

function addNote(event, id) {
  event.preventDefault();
  if (!can("note")) return;
  const mission = state.missions.find(item => item.id === id);
  const input = new FormData(event.currentTarget).get("note").trim();
  if (!mission || !input) return;
  mission.notes.push({ text: input, at: new Date().toISOString() });
  saveState();
  openMission(id);
  showToast("Case note added.");
}

function updateProvider(event, id) {
  event.preventDefault();
  if (!can("provider")) return;
  const mission = state.missions.find(item => item.id === id);
  const provider = new FormData(event.currentTarget).get("provider").trim();
  if (!mission || !provider) return;
  mission.provider = provider;
  mission.notes.push({ text: `Provider selected: ${provider}.`, at: new Date().toISOString() });
  if (mission.status === "approved") mission.status = "provider-selection";
  saveState();
  renderView();
  openMission(id);
  showToast("Provider selection recorded.");
}

function updateFunding(event, id) {
  event.preventDefault();
  if (!can("pay")) return;
  const mission = state.missions.find(item => item.id === id);
  const funded = Number(new FormData(event.currentTarget).get("funded"));
  if (!mission || Number.isNaN(funded)) return;
  mission.funded = Math.max(0, Math.min(mission.amount, funded));
  if (mission.funded === mission.amount && mission.status === "provider-selection") {
    mission.status = "payment";
  }
  saveState();
  renderView();
  openMission(id);
  showToast("Payment recorded.");
}

function deleteMission(id) {
  if (!can("delete")) return;
  const mission = state.missions.find(item => item.id === id);
  if (!mission || !confirm(`Delete "${mission.title}"? This cannot be undone.`)) return;
  state.missions = state.missions.filter(item => item.id !== id);
  saveState();
  closeDrawer();
  renderView();
  showToast("Case deleted.");
}

function openMissionDialog() {
  if (!can("create")) {
    showToast(`${role().label} cannot create cases.`);
    return;
  }
  const target = new Date();
  target.setDate(target.getDate() + 14);
  form.elements.targetDate.value = target.toISOString().slice(0, 10);
  dialog.showModal();
}

function createMission(event) {
  event.preventDefault();
  if (!can("create")) return;
  const data = Object.fromEntries(new FormData(form));
  const nextNumber = Math.max(1042, ...state.missions.map(m => Number(m.id.split("-")[1]) || 0)) + 1;
  const mission = {
    id: `AM-${nextNumber}`,
    tenantId: activeTenantId,
    title: data.title.trim(),
    beneficiary: data.beneficiary.trim(),
    category: data.category,
    location: data.location.trim(),
    amount: Number(data.amount),
    funded: 0,
    targetDate: data.targetDate,
    status: "submitted",
    urgency: data.urgency,
    summary: data.summary.trim(),
    provider: "Not assigned",
    createdAt: new Date().toISOString(),
    notes: [{ text: "Case created. Verification is the next step.", at: new Date().toISOString() }]
  };
  state.missions.unshift(mission);
  state.activities.unshift({ icon: "＋", text: `${mission.title} was submitted as a new case.`, at: new Date().toISOString() });
  saveState();
  form.reset();
  dialog.close();
  activeView = "missions";
  renderView();
  openMission(mission.id);
  showToast("Case created. Verification can begin.");
}

function exportData() {
  if (!can("export")) return;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `arukah-cases-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Case data exported.");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function closeMobileMenu() {
  document.querySelector("#sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});
document.querySelector("#new-mission-button").addEventListener("click", () => {
  if (activeRole === "donor") donorMissionDialog.showModal();
  else openMissionDialog();
});
document.querySelector("#menu-button").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("open"));
document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => dialog.close()));
document.querySelectorAll("[data-close-donor-dialog]").forEach(button => button.addEventListener("click", () => donorMissionDialog.close()));
drawerBackdrop.addEventListener("click", closeDrawer);
form.addEventListener("submit", createMission);
donorMissionForm.addEventListener("submit", createDonorMission);

document.querySelector("#global-search").addEventListener("input", event => {
  searchTerm = event.target.value;
  if (activeRole === "donor") {
    if (activeView !== "marketplace") activeView = "marketplace";
    renderView();
    return;
  }
  if (searchTerm && activeView !== "missions") {
    activeView = "missions";
    renderView();
  } else if (activeView === "missions") {
    const missionSearch = document.querySelector("#mission-search");
    if (missionSearch) missionSearch.value = searchTerm;
    renderMissionTable();
  }
});

document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#global-search").focus();
  }
  if (event.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
});

document.querySelector("#settings-button").addEventListener("click", () => {
  if (confirm("Reset Case Management to the sample data? Your local changes will be replaced.")) {
    state = JSON.parse(JSON.stringify(seedData));
    saveState();
    renderView();
    showToast("Sample case data restored.");
  }
});

const roleSelect = document.querySelector("#role-select");
roleSelect.innerHTML = Object.entries(roles)
  .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
  .join("");
roleSelect.value = activeRole;
roleSelect.addEventListener("change", event => setRole(event.target.value));

const tenantSelect = document.querySelector("#tenant-select");
refreshTenantSelect();
tenantSelect.addEventListener("change", event => setTenant(event.target.value));

updateMissionBadge();
renderView();
