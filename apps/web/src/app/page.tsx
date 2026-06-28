"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getCurrentUser,
  readSession,
  saveSession,
  type AuthSession,
  type StaffRole
} from "../lib/auth";
import {
  archiveBeneficiary,
  createBeneficiary,
  deleteCase,
  listCaseCategories,
  listCases,
  listBeneficiaries,
  listIndiaCities,
  listIndiaStates,
  submitPayment,
  submitVerification,
  updateBeneficiary,
  updateCase,
  type Beneficiary,
  type CaseCategory,
  type CreatedCase,
  type IndiaCity,
  type IndiaState,
  type PaymentInput,
  type VerificationInput
} from "../lib/cases";
import { LoginScreen } from "./login-screen";
import { NewCaseDialog } from "./new-case-dialog";
import {
  createSupplier,
  createTeamMember,
  listSuppliers,
  listTeamMembers,
  type Supplier,
  type SupplierInput,
  type TeamMember,
  type TeamMemberInput
} from "../lib/directory";

type View = "dashboard" | "directory" | "beneficiaries" | "cases" | "verification" | "payments" | "reports";
type Role = "Super Admin" | "Case Manager" | "Verifier" | "Finance Manager";
type CaseListTab = "active" | "mine" | "closed" | "all";
type CaseAdvancedFilters = {
  category: string;
  stage: string;
  urgency: string;
};

const navItems: Array<{ id: View; label: string; icon: IconName; badge?: number }> = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "directory", label: "Directory", icon: "people" },
  { id: "beneficiaries", label: "Beneficiaries", icon: "people" },
  { id: "cases", label: "Cases", icon: "folder", badge: 8 },
  { id: "verification", label: "Verification", icon: "verify", badge: 3 },
  { id: "payments", label: "Payments", icon: "payment", badge: 2 },
  { id: "reports", label: "Reports", icon: "report" }
];

type CaseTableItem = {
  recordId: string;
  id: string;
  title: string;
  person: string;
  category: string;
  amount: string;
  stage: string;
  urgency: string;
  owner: string;
  updated: string;
};

const roleDescriptions: Record<Role, string> = {
  "Super Admin": "Full operational overview",
  "Case Manager": "Intake and case coordination",
  Verifier: "Assigned verification queue",
  "Finance Manager": "Payments and reconciliation"
};

const roleLabels: Record<StaffRole, Role> = {
  SUPER_ADMIN: "Super Admin",
  CASE_MANAGER: "Case Manager",
  VERIFIER: "Verifier",
  FINANCE_MANAGER: "Finance Manager"
};

const publicWebsiteUrl =
  process.env.NEXT_PUBLIC_ARUKAH_WEBSITE_URL ?? "http://localhost:8080";

export default function HomePage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const stored = readSession();

    if (!stored) {
      setCheckingSession(false);
      return;
    }

    getCurrentUser(stored.accessToken)
      .then((user) => {
        const refreshed = { ...stored, user };
        saveSession(refreshed);
        setSession(refreshed);
      })
      .catch(() => clearSession())
      .finally(() => setCheckingSession(false));
  }, []);

  function handleAuthenticated(authSession: AuthSession) {
    saveSession(authSession);
    setSession(authSession);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  if (checkingSession) {
    return (
      <main className="session-loading" aria-label="Loading Arukah MissionOS">
        <div className="brand-mark">A</div>
        <span>Opening MissionOS…</span>
      </main>
    );
  }

  if (!session) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  return <MissionWorkspace session={session} onLogout={handleLogout} />;
}

function MissionWorkspace({
  session,
  onLogout
}: {
  session: AuthSession;
  onLogout: () => void;
}) {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [caseRecords, setCaseRecords] = useState<CreatedCase[]>([]);
  const [caseItems, setCaseItems] = useState<CaseTableItem[]>([]);
  const [beneficiaryRecords, setBeneficiaryRecords] = useState<Beneficiary[]>([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(true);
  const [beneficiariesError, setBeneficiariesError] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState("");
  const [directoryPanel, setDirectoryPanel] = useState<"team" | "supplier" | null>(null);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);
  const [beneficiaryPanelMode, setBeneficiaryPanelMode] = useState<"view" | "edit" | "create">("view");
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [states, setStates] = useState<IndiaState[]>([]);
  const [tamilNaduCities, setTamilNaduCities] = useState<IndiaCity[]>([]);
  const [caseTab, setCaseTab] = useState<CaseListTab>("active");
  const [caseFilters, setCaseFilters] = useState<CaseAdvancedFilters>({
    category: "",
    stage: "",
    urgency: ""
  });
  const [caseFiltersOpen, setCaseFiltersOpen] = useState(false);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCaseMode, setSelectedCaseMode] = useState<"view" | "edit">("view");
  const [selectedVerificationCaseId, setSelectedVerificationCaseId] = useState<string | null>(null);
  const [selectedPaymentCaseId, setSelectedPaymentCaseId] = useState<string | null>(null);
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const role = roleLabels[session.user.role];
  const firstName = session.user.displayName.trim().split(/\s+/)[0] ?? "Team";
  const initials = session.user.displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const visibleCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return caseRecords
      .filter((item) => {
        if (caseTab === "active") return !["CLOSED", "REJECTED"].includes(item.stage);
        if (caseTab === "mine") return item.caseManagerId === session.user.id;
        if (caseTab === "closed") return item.stage === "CLOSED";
        return true;
      })
      .filter((item) => {
        if (caseFilters.category && item.category !== caseFilters.category) return false;
        if (caseFilters.stage && item.stage !== caseFilters.stage) return false;
        if (caseFilters.urgency && item.urgency !== caseFilters.urgency) return false;
        return true;
      })
      .filter((item) => {
        if (!normalized) return true;
        return [
          item.caseNumber,
          item.title,
          item.beneficiary.preferredName,
          item.category,
          formatStage(item.stage),
          formatUrgency(item.urgency)
        ].some((value) => value.toLowerCase().includes(normalized));
      })
      .map((item) => mapCaseToTableItem(item, initials));
  }, [caseFilters, caseRecords, caseTab, initials, query, session.user.id]);

  const visibleBeneficiaries = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return beneficiaryRecords;

    return beneficiaryRecords.filter((item) =>
      [
        item.referenceCode,
        item.preferredName,
        item.legalName,
        item.email ?? "",
        item.phone ?? "",
        item.city,
        item.region,
        item.status
      ].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [beneficiaryRecords, query]);

  const verificationQueueCases = useMemo(
    () => filterCasesForQueue(caseRecords, "VERIFICATION", query),
    [caseRecords, query]
  );

  const paymentQueueCases = useMemo(
    () => filterCasesForQueue(caseRecords, "PAYMENT", query),
    [caseRecords, query]
  );

  const caseCounts = useMemo(
    () => ({
      active: caseRecords.filter((item) => !["CLOSED", "REJECTED"].includes(item.stage)).length,
      mine: caseRecords.filter((item) => item.caseManagerId === session.user.id).length,
      closed: caseRecords.filter((item) => item.stage === "CLOSED").length,
      all: caseRecords.length
    }),
    [caseRecords, session.user.id]
  );

  useEffect(() => {
    let active = true;

    setCasesLoading(true);
    setCasesError("");
    setDirectoryLoading(true);
    setDirectoryError("");

    Promise.all([
      listCases(session),
      listCaseCategories(session),
      listBeneficiaries(session),
      listIndiaStates(session),
      listIndiaCities(session, "TN"),
      listTeamMembers(session),
      listSuppliers(session)
    ])
      .then(([response, categoryItems, beneficiaryItems, stateItems, cityItems, teamItems, supplierItems]) => {
        if (!active) return;
        setCategories(categoryItems);
        setBeneficiaryRecords(beneficiaryItems);
        setStates(stateItems);
        setTamilNaduCities(cityItems);
        setTeamMembers(teamItems);
        setSuppliers(supplierItems);
        setCaseRecords(response.data);
        setCaseItems(response.data.map((item) => mapCaseToTableItem(item, initials)));
      })
      .catch((error: Error) => {
        if (!active) return;
        setCasesError(error.message || "Unable to load cases");
        setBeneficiariesError(error.message || "Unable to load beneficiaries");
        setDirectoryError(error.message || "Unable to load directory");
      })
      .finally(() => {
        if (active) {
          setCasesLoading(false);
          setBeneficiariesLoading(false);
          setDirectoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [initials, session]);

  useEffect(() => {
    const created = new URLSearchParams(window.location.search).get("created");

    if (!created) return;

    setActiveView("cases");
    setNotice(`${created} was created successfully.`);
    window.history.replaceState(null, "", window.location.pathname);
    window.setTimeout(() => setNotice(""), 4000);
  }, []);

  async function refreshCasesFromApi() {
    setCasesLoading(true);
    setCasesError("");

    try {
      const response = await listCases(session);
      setCaseRecords(response.data);
      setCaseItems(response.data.map((item) => mapCaseToTableItem(item, initials)));
    } catch (caught) {
      setCasesError(caught instanceof Error ? caught.message : "Unable to load cases");
    } finally {
      setCasesLoading(false);
    }
  }

  function navigate(view: View) {
    setActiveView(view);
    setMenuOpen(false);
    setQuery("");

    if (["dashboard", "cases", "verification", "payments"].includes(view)) {
      void refreshCasesFromApi();
    }
  }

  function handleCaseCreated(created: CreatedCase) {
    setCaseRecords((current) => [created, ...current]);
    setCaseItems((current) => [
      mapCaseToTableItem(created, initials, "Just now"),
      ...current
    ]);
    setNewCaseOpen(false);
    setActiveView("cases");
    setNotice(`${created.caseNumber} was created successfully.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  function handleOpenCase(id: string, mode: "view" | "edit" = "view") {
    setSelectedCaseId(id);
    setSelectedCaseMode(mode);
  }

  async function handleDeleteCase(id: string) {
    const caseRecord = caseRecords.find((item) => item.id === id);

    if (!caseRecord) return;

    const confirmed = window.confirm(
      `Delete ${caseRecord.caseNumber}? This is only allowed for submitted cases without workflow history.`
    );

    if (!confirmed) return;

    try {
      await deleteCase(session, caseRecord.id);
      handleCaseDeleted(caseRecord.id, caseRecord.caseNumber);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Unable to delete case");
      window.setTimeout(() => setNotice(""), 5000);
    }
  }

  function handleCaseUpdated(updated: CreatedCase) {
    setCaseRecords((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
    setCaseItems((current) =>
      current.map((item) =>
        item.recordId === updated.id ? mapCaseToTableItem(updated, initials, "Just now") : item
      )
    );
    setSelectedCaseId(updated.id);
    setNotice(`${updated.caseNumber} was updated successfully.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  async function handleVerificationSubmitted(
    caseId: string,
    input: VerificationInput
  ) {
    const updated = await submitVerification(session, caseId, input);
    handleCaseUpdated(updated);
    setSelectedVerificationCaseId(null);
    setNotice(`${updated.caseNumber} verification was submitted.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  async function handlePaymentSubmitted(caseId: string, input: PaymentInput) {
    const updated = await submitPayment(session, caseId, input);
    handleCaseUpdated(updated);
    setSelectedPaymentCaseId(null);
    setNotice(`${updated.caseNumber} payment was recorded.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  async function handleTeamMemberCreated(input: TeamMemberInput) {
    const created = await createTeamMember(session, input);
    setTeamMembers((current) => [created, ...current]);
    setDirectoryPanel(null);
    setNotice(`${created.displayName} was registered.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  async function handleSupplierCreated(input: SupplierInput) {
    const created = await createSupplier(session, input);
    setSuppliers((current) => [created, ...current]);
    setDirectoryPanel(null);
    setNotice(`${created.name} was registered.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  function handleCaseDeleted(deletedId: string, caseNumber: string) {
    setCaseRecords((current) => current.filter((item) => item.id !== deletedId));
    setCaseItems((current) => current.filter((item) => item.recordId !== deletedId));
    setSelectedCaseId(null);
    setNotice(`${caseNumber} was deleted.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  function openBeneficiary(id: string, mode: "view" | "edit" = "view") {
    setSelectedBeneficiaryId(id);
    setBeneficiaryPanelMode(mode);
  }

  function openNewBeneficiary() {
    setSelectedBeneficiaryId(null);
    setBeneficiaryPanelMode("create");
  }

  function handleBeneficiarySaved(saved: Beneficiary) {
    setBeneficiaryRecords((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];
    });
    setSelectedBeneficiaryId(saved.id);
    setBeneficiaryPanelMode("view");
    setNotice(`${saved.preferredName} was saved successfully.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  async function handleArchiveBeneficiary(id: string) {
    const beneficiary = beneficiaryRecords.find((item) => item.id === id);

    if (!beneficiary) return;

    const confirmed = window.confirm(`Delete ${beneficiary.preferredName}? This removes them from the active beneficiary list.`);
    if (!confirmed) return;

    try {
      await archiveBeneficiary(session, id);
      setBeneficiaryRecords((current) => current.filter((item) => item.id !== id));
      setSelectedBeneficiaryId(null);
      setNotice(`${beneficiary.preferredName} was deleted.`);
      window.setTimeout(() => setNotice(""), 4000);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Unable to delete beneficiary");
      window.setTimeout(() => setNotice(""), 5000);
    }
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
          {navItems.map((item) => {
            const liveBadge =
              item.id === "cases"
                ? caseCounts.active
                : item.id === "verification"
                  ? verificationQueueCases.length
                  : item.id === "payments"
                    ? paymentQueueCases.length
                    : item.badge;

            return (
              <button
                className={`nav-item ${activeView === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => navigate(item.id)}
                type="button"
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {liveBadge ? <b>{liveBadge}</b> : null}
              </button>
            );
          })}
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
          <div className="avatar">{initials}</div>
          <div className="user-details">
            <strong>{session.user.displayName}</strong>
            <span>{role}</span>
          </div>
          <button className="icon-button" aria-label="Sign out" onClick={onLogout} title="Sign out" type="button"><Icon name="logout" /></button>
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
            <div className="api-status connected"><i /> Signed in</div>
            <button className="icon-button notification" aria-label="Notifications" type="button"><Icon name="bell" /><i /></button>
            <a className="primary-button" href="/cases/new"><Icon name="plus" /> New case</a>
          </div>
        </header>

        <div className="content">
          {activeView === "dashboard" && <Dashboard role={role} firstName={firstName} onNavigate={navigate} caseRecords={caseRecords} cases={visibleCases} casesLoading={casesLoading} onDeleteCase={handleDeleteCase} onOpenCase={handleOpenCase} />}
          {activeView === "directory" && (
            <DirectoryView
              error={directoryError}
              loading={directoryLoading}
              onNewSupplier={() => setDirectoryPanel("supplier")}
              onNewTeamMember={() => setDirectoryPanel("team")}
              suppliers={suppliers}
              teamMembers={teamMembers}
            />
          )}
          {activeView === "cases" && (
            <CasesView
              caseCounts={caseCounts}
              caseFilters={caseFilters}
              caseFiltersOpen={caseFiltersOpen}
              caseTab={caseTab}
              cases={visibleCases}
              casesLoading={casesLoading}
              casesError={casesError}
              categories={categories}
              onDeleteCase={handleDeleteCase}
              onNewCase={() => setNewCaseOpen(true)}
              onOpenCase={handleOpenCase}
              onResetFilters={() => setCaseFilters({ category: "", stage: "", urgency: "" })}
              onSetCaseFilters={setCaseFilters}
              onSetCaseFiltersOpen={setCaseFiltersOpen}
              onSetCaseTab={setCaseTab}
            />
          )}
          {activeView === "beneficiaries" && (
            <BeneficiariesView
              beneficiaries={visibleBeneficiaries}
              error={beneficiariesError}
              loading={beneficiariesLoading}
              onArchive={handleArchiveBeneficiary}
              onCreate={openNewBeneficiary}
              onOpen={openBeneficiary}
            />
          )}
          {activeView === "verification" && (
            <QueueView
              cases={verificationQueueCases}
              error={casesError}
              loading={casesLoading}
              onOpenCase={handleOpenCase}
              onRefresh={refreshCasesFromApi}
              onStartPayment={setSelectedPaymentCaseId}
              onStartVerification={setSelectedVerificationCaseId}
              type="verification"
            />
          )}
          {activeView === "payments" && (
            <QueueView
              cases={paymentQueueCases}
              error={casesError}
              loading={casesLoading}
              onOpenCase={handleOpenCase}
              onRefresh={refreshCasesFromApi}
              onStartPayment={setSelectedPaymentCaseId}
              onStartVerification={setSelectedVerificationCaseId}
              type="payments"
            />
          )}
          {activeView === "reports" && (
            <ReportsView
              beneficiaries={beneficiaryRecords}
              cases={caseRecords}
              loading={casesLoading || beneficiariesLoading || directoryLoading}
              suppliers={suppliers}
              teamMembers={teamMembers}
            />
          )}
        </div>
      </main>
      {notice ? <div className="success-toast" role="status">{notice}</div> : null}
      {newCaseOpen ? (
        <NewCaseDialog
          onClose={() => setNewCaseOpen(false)}
          onCreated={handleCaseCreated}
          session={session}
        />
      ) : null}
      {selectedCaseId ? (
        <CaseDetailPanel
          caseRecord={caseRecords.find((item) => item.id === selectedCaseId) ?? null}
          categories={categories}
          initialMode={selectedCaseMode}
          onClose={() => setSelectedCaseId(null)}
          onDeleted={handleCaseDeleted}
          onUpdated={handleCaseUpdated}
          session={session}
        />
      ) : null}
      {selectedVerificationCaseId ? (
        <VerificationWorkflowPanel
          caseRecord={caseRecords.find((item) => item.id === selectedVerificationCaseId) ?? null}
          onClose={() => setSelectedVerificationCaseId(null)}
          onSubmit={handleVerificationSubmitted}
        />
      ) : null}
      {selectedPaymentCaseId ? (
        <PaymentWorkflowPanel
          caseRecord={caseRecords.find((item) => item.id === selectedPaymentCaseId) ?? null}
          onClose={() => setSelectedPaymentCaseId(null)}
          onSubmit={handlePaymentSubmitted}
        />
      ) : null}
      {directoryPanel ? (
        <DirectoryRegistrationPanel
          mode={directoryPanel}
          onClose={() => setDirectoryPanel(null)}
          onCreateSupplier={handleSupplierCreated}
          onCreateTeamMember={handleTeamMemberCreated}
        />
      ) : null}
      {beneficiaryPanelMode === "create" || selectedBeneficiaryId ? (
        <BeneficiaryDetailPanel
          beneficiary={beneficiaryRecords.find((item) => item.id === selectedBeneficiaryId) ?? null}
          initialMode={beneficiaryPanelMode}
          onArchive={handleArchiveBeneficiary}
          onClose={() => {
            setSelectedBeneficiaryId(null);
            setBeneficiaryPanelMode("view");
          }}
          onSaved={handleBeneficiarySaved}
          session={session}
          states={states}
          tamilNaduCities={tamilNaduCities}
        />
      ) : null}
    </div>
  );
}

function mapCaseToTableItem(
  item: CreatedCase,
  currentUserInitials: string,
  updated = formatUpdated(item.updatedAt)
): CaseTableItem {
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: item.currency,
    maximumFractionDigits: 2
  }).format(Number(item.requestedAmountMinor) / 100);

  return {
    recordId: item.id,
    id: item.caseNumber,
    title: item.title,
    person: item.beneficiary.preferredName,
    category: item.category,
    amount,
    stage: formatStage(item.stage),
    urgency: formatUrgency(item.urgency),
    owner:
      item.caseManager?.displayName
        ?.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || currentUserInitials || "—",
    updated
  };
}

function formatUrgency(urgency: CreatedCase["urgency"]) {
  if (urgency === "NORMAL") return "Normal";
  if (urgency === "HIGH") return "High";
  return "Urgent";
}

function formatStage(stage: CreatedCase["stage"]) {
  const labels: Record<string, string> = {
    SUBMITTED: "Submitted",
    VERIFICATION: "Verification",
    APPROVED: "Approval",
    PROVIDER_SELECTION: "Provider",
    PAYMENT: "Payment",
    IMPACT: "Impact",
    CLOSED: "Closed",
    REJECTED: "Rejected",
    ON_HOLD: "On hold"
  };

  return labels[stage] ?? stage;
}

function formatUpdated(value: string | Date | undefined) {
  if (!value) return "Recently";

  const updatedAt = new Date(value);
  const diff = Date.now() - updatedAt.getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatMoney(amountMinor: string, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number(amountMinor) / 100);
}

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function filterCasesForQueue(
  records: CreatedCase[],
  stage: CreatedCase["stage"],
  query: string
) {
  const normalized = query.trim().toLowerCase();

  return records
    .filter((item) => item.stage === stage)
    .filter((item) => {
      if (!normalized) return true;

      return [
        item.caseNumber,
        item.title,
        item.category,
        item.description,
        item.beneficiary.preferredName,
        item.beneficiary.city,
        item.beneficiary.region,
        item.verifier?.displayName ?? "",
        item.caseManager?.displayName ?? "",
        formatUrgency(item.urgency)
      ].some((value) => value.toLowerCase().includes(normalized));
    })
    .sort((first, second) => {
      const urgencyRank: Record<CreatedCase["urgency"], number> = {
        URGENT: 3,
        HIGH: 2,
        NORMAL: 1
      };

      const urgencyDifference =
        urgencyRank[second.urgency] - urgencyRank[first.urgency];

      if (urgencyDifference) return urgencyDifference;

      return (
        new Date(first.updatedAt).getTime() -
        new Date(second.updatedAt).getTime()
      );
    });
}

function formatQueueAge(value: string | Date | undefined) {
  if (!value) return "Recently";

  const updatedAt = new Date(value);
  const diff = Date.now() - updatedAt.getTime();
  const hours = Math.max(0, Math.round(diff / 3600000));

  if (hours < 1) return "Under 1 hr";
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"}`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

function buildDashboardFocus(records: CreatedCase[]): Array<{
  detail: string;
  icon: IconName;
  title: string;
  tone: string;
}> {
  const verification = records.filter((item) => item.stage === "VERIFICATION");
  const payment = records.filter((item) => item.stage === "PAYMENT");
  const impact = records.filter((item) => item.stage === "IMPACT");
  const submitted = records.filter((item) => item.stage === "SUBMITTED");
  const urgent = records.filter((item) => item.urgency === "URGENT" && !["CLOSED", "REJECTED"].includes(item.stage));
  const focus: Array<{ detail: string; icon: IconName; title: string; tone: string }> = [];

  if (urgent.length) {
    const oldestUrgent = oldestCase(urgent);
    if (oldestUrgent) {
      focus.push({
        detail: `${oldestUrgent.caseNumber} · ${oldestUrgent.beneficiary.preferredName}`,
        icon: "folder",
        title: `${urgent.length} urgent case${urgent.length === 1 ? "" : "s"} need attention`,
        tone: "amber"
      });
    }
  }

  if (verification.length) {
    const oldestVerification = oldestCase(verification);
    if (oldestVerification) {
      focus.push({
        detail: `${oldestVerification.caseNumber} waiting ${formatQueueAge(oldestVerification.updatedAt)}`,
        icon: "verify",
        title: `Complete ${verification.length} verification${verification.length === 1 ? "" : "s"}`,
        tone: "amber"
      });
    }
  }

  if (payment.length) {
    const total = payment.reduce(
      (sum, item) => sum + Number(item.approvedAmountMinor ?? item.requestedAmountMinor),
      0
    );
    focus.push({
      detail: `${formatMoney(String(total), "INR")} ready to record`,
      icon: "payment",
      title: `Record ${payment.length} payment${payment.length === 1 ? "" : "s"}`,
      tone: "blue"
    });
  }

  if (impact.length) {
    const oldestImpact = oldestCase(impact);
    focus.push({
      detail: oldestImpact ? `${oldestImpact.caseNumber} is waiting for evidence` : "Impact follow-up is waiting",
      icon: "impact",
      title: `Follow up ${impact.length} impact case${impact.length === 1 ? "" : "s"}`,
      tone: "green"
    });
  }

  if (!focus.length && submitted.length) {
    const oldestSubmitted = oldestCase(submitted);
    focus.push({
      detail: oldestSubmitted ? `${oldestSubmitted.caseNumber} is ready for triage` : "Submitted case is ready for triage",
      icon: "folder",
      title: `Review ${submitted.length} submitted case${submitted.length === 1 ? "" : "s"}`,
      tone: "green"
    });
  }

  if (!focus.length) {
    focus.push({
      detail: "No active queue items need immediate action.",
      icon: "complete",
      title: "Workflow queue is clear",
      tone: "green"
    });
  }

  return focus.slice(0, 3);
}

function buildPipelineRows(records: CreatedCase[]) {
  const stages: Array<{ className: string; label: string; stage: CreatedCase["stage"] }> = [
    { label: "Submitted", stage: "SUBMITTED", className: "submitted" },
    { label: "Verification", stage: "VERIFICATION", className: "verification" },
    { label: "Approval", stage: "APPROVED", className: "approval" },
    { label: "Provider", stage: "PROVIDER_SELECTION", className: "provider" },
    { label: "Payment", stage: "PAYMENT", className: "payment" },
    { label: "Impact", stage: "IMPACT", className: "impact" }
  ];
  const counts = stages.map((item) => ({
    ...item,
    value: records.filter((record) => record.stage === item.stage).length
  }));
  const maxCount = Math.max(...counts.map((item) => item.value), 1);

  return counts.map(({ className, label, value }) => ({
    className,
    label,
    value,
    width: value === 0 ? 0 : Math.max(8, Math.round((value / maxCount) * 100))
  }));
}

function oldestCase(records: CreatedCase[]) {
  return [...records].sort(
    (first, second) =>
      new Date(first.updatedAt).getTime() - new Date(second.updatedAt).getTime()
  )[0];
}

function Dashboard({
  role,
  firstName,
  onNavigate,
  caseRecords,
  cases: items,
  casesLoading,
  onDeleteCase,
  onOpenCase
}: {
  role: Role;
  firstName: string;
  onNavigate: (view: View) => void;
  caseRecords: CreatedCase[];
  cases: CaseTableItem[];
  casesLoading: boolean;
  onDeleteCase: (id: string) => void;
  onOpenCase: (id: string, mode?: "view" | "edit") => void;
}) {
  const activeCases = caseRecords.filter((item) => !["CLOSED", "REJECTED"].includes(item.stage));
  const verificationCases = caseRecords.filter((item) => item.stage === "VERIFICATION");
  const paymentCases = caseRecords.filter((item) => item.stage === "PAYMENT");
  const closedThisMonth = caseRecords.filter((item) => {
    if (item.stage !== "CLOSED" || !item.closedAt) return false;
    const closedAt = new Date(item.closedAt);
    const now = new Date();
    return closedAt.getMonth() === now.getMonth() && closedAt.getFullYear() === now.getFullYear();
  });
  const urgentVerificationCount = verificationCases.filter((item) => item.urgency === "URGENT").length;
  const readyPaymentAmount = paymentCases.reduce(
    (sum, item) => sum + Number(item.approvedAmountMinor ?? item.requestedAmountMinor),
    0
  );
  const focusItems = buildDashboardFocus(caseRecords);
  const activityItems = [...caseRecords]
    .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())
    .slice(0, 4);
  const pipelineRows = buildPipelineRows(caseRecords);
  const primaryQueueView: View =
    verificationCases.length > 0 ? "verification" : paymentCases.length > 0 ? "payments" : "cases";

  return (
    <>
      <PageHeading
        eyebrow={new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
        title={`Good morning, ${firstName}.`}
        description={`${roleDescriptions[role]}. Here is what needs attention across Arukah today.`}
      />

      <section className="stat-grid">
        <Stat label="Active cases" value={String(activeCases.length)} detail={casesLoading ? "Loading…" : "From live database"} tone="green" icon="folder" />
        <Stat label="Pending verification" value={String(verificationCases.length)} detail={`${urgentVerificationCount} urgent case${urgentVerificationCount === 1 ? "" : "s"}`} tone="amber" icon="verify" />
        <Stat label="Ready for payment" value={String(paymentCases.length)} detail={formatMoney(String(readyPaymentAmount), "INR")} tone="blue" icon="payment" />
        <Stat label="Closed this month" value={String(closedThisMonth.length)} detail={`${caseRecords.filter((item) => item.stage === "CLOSED").length} closed total`} tone="purple" icon="complete" />
      </section>

      <section className="dashboard-layout">
        <div className="panel cases-panel">
          <PanelHeader title="Cases needing attention" subtitle="Prioritized by urgency and time in stage" action="View all cases" onAction={() => onNavigate("cases")} />
          {casesLoading ? <div className="empty-state"><Icon name="clock" /><h3>Loading cases…</h3><p>Pulling the latest records from the API.</p></div> : <CaseTable items={items.slice(0, 4)} onDeleteCase={onDeleteCase} onOpenCase={onOpenCase} />}
        </div>

        <div className="panel focus-panel">
          <PanelHeader title="Today’s focus" subtitle="Your operational queue" />
          {casesLoading ? (
            <div className="empty-state compact-empty"><Icon name="clock" /><h3>Loading focus…</h3><p>Reading the live workflow queue.</p></div>
          ) : (
            <div className="focus-list">
              {focusItems.map((item) => (
                <FocusItem detail={item.detail} icon={item.icon} key={`${item.title}-${item.detail}`} title={item.title} tone={item.tone} />
              ))}
            </div>
          )}
          <button className="secondary-button full-width" onClick={() => onNavigate(primaryQueueView)} type="button">Open my work queue <Icon name="arrow" /></button>
        </div>

        <div className="panel activity-panel">
          <PanelHeader title="Recent activity" subtitle="Latest case updates from the live database" action="View cases" onAction={() => onNavigate("cases")} />
          <div className="activity-list">
            {casesLoading ? <Activity initials="…" text={<>Loading live activity…</>} time="Now" /> : null}
            {!casesLoading && !activityItems.length ? <Activity initials="A" text={<>No case activity yet. Create a case to begin.</>} time="—" /> : null}
            {!casesLoading && activityItems.map((item) => (
              <Activity
                initials={getInitials(item.beneficiary.preferredName) || "A"}
                key={item.id}
                text={<><strong>{item.beneficiary.preferredName}</strong> is in <b>{formatStage(item.stage)}</b> for <b>{item.caseNumber}</b></>}
                time={formatUpdated(item.updatedAt)}
              />
            ))}
          </div>
        </div>

        <div className="panel pipeline-panel">
          <PanelHeader title="Case pipeline" subtitle="Open cases by current stage" />
          <div className="pipeline">
            {pipelineRows.map(({ label, value, className, width }) => (
              <div className="pipeline-row" key={label}>
                <span>{label}</span>
                <div><i className={`${className} ${value === 0 ? "empty" : ""}`} style={{ width: `${width}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CasesView({
  caseCounts,
  caseFilters,
  caseFiltersOpen,
  caseTab,
  cases: items,
  casesLoading,
  casesError,
  categories,
  onDeleteCase,
  onNewCase: _onNewCase,
  onOpenCase,
  onResetFilters,
  onSetCaseFilters,
  onSetCaseFiltersOpen,
  onSetCaseTab
}: {
  caseCounts: Record<CaseListTab, number>;
  caseFilters: CaseAdvancedFilters;
  caseFiltersOpen: boolean;
  caseTab: CaseListTab;
  cases: CaseTableItem[];
  casesLoading: boolean;
  casesError: string;
  categories: CaseCategory[];
  onDeleteCase: (id: string) => void;
  onNewCase: () => void;
  onOpenCase: (id: string, mode?: "view" | "edit") => void;
  onResetFilters: () => void;
  onSetCaseFilters: (filters: CaseAdvancedFilters) => void;
  onSetCaseFiltersOpen: (open: boolean) => void;
  onSetCaseTab: (tab: CaseListTab) => void;
}) {
  const activeFilterCount = [
    caseFilters.category,
    caseFilters.stage,
    caseFilters.urgency
  ].filter(Boolean).length;
  const tabs: Array<{ id: CaseListTab; label: string }> = [
    { id: "active", label: "Active" },
    { id: "mine", label: "My cases" },
    { id: "closed", label: "Closed" },
    { id: "all", label: "All cases" }
  ];
  const stages: Array<{ value: CreatedCase["stage"]; label: string }> = [
    { value: "SUBMITTED", label: "Submitted" },
    { value: "VERIFICATION", label: "Verification" },
    { value: "APPROVED", label: "Approval" },
    { value: "PROVIDER_SELECTION", label: "Provider" },
    { value: "PAYMENT", label: "Payment" },
    { value: "IMPACT", label: "Impact" },
    { value: "CLOSED", label: "Closed" },
    { value: "REJECTED", label: "Rejected" },
    { value: "ON_HOLD", label: "On hold" }
  ];

  return (
    <>
      <PageHeading eyebrow="Case management" title="Cases" description="Track every request from intake through responsible closure.">
        <button
          aria-expanded={caseFiltersOpen}
          className={`secondary-button ${activeFilterCount ? "filter-active" : ""}`}
          onClick={() => onSetCaseFiltersOpen(!caseFiltersOpen)}
          type="button"
        >
          <Icon name="filter" /> Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
        <a className="primary-button" href="/cases/new"><Icon name="plus" /> New case</a>
      </PageHeading>
      <div className="view-tabs">
        {tabs.map((tab) => (
          <button
            className={caseTab === tab.id ? "active" : ""}
            key={tab.id}
            onClick={() => onSetCaseTab(tab.id)}
            type="button"
          >
            {tab.label} <span>{caseCounts[tab.id]}</span>
          </button>
        ))}
      </div>
      {caseFiltersOpen ? (
        <div className="panel case-filter-panel">
          <label>
            Category
            <select
              value={caseFilters.category}
              onChange={(event) =>
                onSetCaseFilters({ ...caseFilters, category: event.target.value })
              }
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Stage
            <select
              value={caseFilters.stage}
              onChange={(event) =>
                onSetCaseFilters({ ...caseFilters, stage: event.target.value })
              }
            >
              <option value="">All stages</option>
              {stages.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Urgency
            <select
              value={caseFilters.urgency}
              onChange={(event) =>
                onSetCaseFilters({ ...caseFilters, urgency: event.target.value })
              }
            >
              <option value="">All urgency levels</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <button className="secondary-button" onClick={onResetFilters} type="button">Reset filters</button>
        </div>
      ) : null}
      <div className="panel full-table">
        {casesError ? <div className="empty-state"><Icon name="search" /><h3>Unable to load cases</h3><p>{casesError}</p></div> : null}
        {casesLoading ? <div className="empty-state"><Icon name="clock" /><h3>Loading cases…</h3><p>Pulling the latest records from the API.</p></div> : null}
        {!casesLoading && !casesError ? <CaseTable items={items} expanded onDeleteCase={onDeleteCase} onOpenCase={onOpenCase} /> : null}
        {!casesLoading && !casesError && !items.length ? <div className="empty-state"><Icon name="search" /><h3>No cases found</h3><p>Try a beneficiary name, case number, or category.</p></div> : null}
      </div>
    </>
  );
}

function DirectoryView({
  error,
  loading,
  onNewSupplier,
  onNewTeamMember,
  suppliers,
  teamMembers
}: {
  error: string;
  loading: boolean;
  onNewSupplier: () => void;
  onNewTeamMember: () => void;
  suppliers: Supplier[];
  teamMembers: TeamMember[];
}) {
  const activeTeam = teamMembers.filter((item) => item.active);
  const activeSuppliers = suppliers.filter((item) => item.active);
  const verifierCount = activeTeam.filter((item) => item.role === "VERIFIER").length;
  const associateCount = activeTeam.filter((item) => item.staffType === "ASSOCIATE").length;

  return (
    <>
      <PageHeading
        eyebrow="Operations directory"
        title="Team, associates, and suppliers"
        description="Register the people and providers who submit, verify, manage, and fulfill cases."
      >
        <button className="secondary-button" onClick={onNewSupplier} type="button"><Icon name="plus" /> New supplier</button>
        <button className="primary-button" onClick={onNewTeamMember} type="button"><Icon name="plus" /> New team member</button>
      </PageHeading>

      <section className="stat-grid compact">
        <Stat label="Active team" value={String(activeTeam.length)} detail={`${associateCount} associate${associateCount === 1 ? "" : "s"}`} tone="green" icon="people" />
        <Stat label="Verifiers" value={String(verifierCount)} detail="Can act on verification queue" tone="amber" icon="verify" />
        <Stat label="Suppliers" value={String(activeSuppliers.length)} detail="Providers and payees" tone="blue" icon="payment" />
      </section>

      {error ? <div className="panel"><div className="empty-state"><Icon name="search" /><h3>Unable to load directory</h3><p>{error}</p></div></div> : null}
      {loading ? <div className="panel"><div className="empty-state"><Icon name="clock" /><h3>Loading directory…</h3><p>Pulling the latest team and supplier records.</p></div></div> : null}

      {!loading && !error ? (
        <section className="directory-layout">
          <div className="panel">
            <PanelHeader title="Team members" subtitle="Employees, associates, case managers, verifiers, finance, and admins" />
            <div className="directory-list">
              {teamMembers.map((item) => (
                <article className="directory-card" key={item.id}>
                  <div className="beneficiary-avatar">{getInitials(item.displayName)}</div>
                  <div>
                    <span>{item.staffType.toLowerCase()}</span>
                    <h3>{item.displayName}</h3>
                    <p>{roleLabels[item.role]} · {item.title || item.organization || "Arukah"}</p>
                    <small>{item.email}{item.phone ? ` · ${item.phone}` : ""}</small>
                  </div>
                  <StatusPill value={item.active ? "ACTIVE" : "ARCHIVED"} />
                </article>
              ))}
              {!teamMembers.length ? <div className="empty-state compact-empty"><Icon name="people" /><h3>No team members yet</h3><p>Register employees or associates to begin.</p></div> : null}
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="Suppliers and providers" subtitle="Service providers, payees, hospitals, schools, and vendors" />
            <div className="directory-list">
              {suppliers.map((item) => (
                <article className="directory-card" key={item.id}>
                  <div className="beneficiary-avatar">{getInitials(item.name)}</div>
                  <div>
                    <span>{item.serviceType}</span>
                    <h3>{item.name}</h3>
                    <p>{item.city}, {item.region}</p>
                    <small>{item.contactName || "No contact"}{item.phone ? ` · ${item.phone}` : ""}</small>
                  </div>
                  <StatusPill value={item.active ? "ACTIVE" : "ARCHIVED"} />
                </article>
              ))}
              {!suppliers.length ? <div className="empty-state compact-empty"><Icon name="payment" /><h3>No suppliers yet</h3><p>Register providers used during case fulfillment.</p></div> : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function DirectoryRegistrationPanel({
  mode,
  onClose,
  onCreateSupplier,
  onCreateTeamMember
}: {
  mode: "team" | "supplier";
  onClose: () => void;
  onCreateSupplier: (input: SupplierInput) => Promise<void>;
  onCreateTeamMember: (input: TeamMemberInput) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      if (mode === "team") {
        await onCreateTeamMember({
          displayName: String(form.get("displayName")),
          email: String(form.get("email")),
          organization: String(form.get("organization") || "") || undefined,
          password: String(form.get("password") || "") || undefined,
          phone: String(form.get("phone") || "") || undefined,
          role: String(form.get("role")) as StaffRole,
          staffType: String(form.get("staffType")) as TeamMemberInput["staffType"],
          title: String(form.get("title") || "") || undefined
        });
      } else {
        await onCreateSupplier({
          city: String(form.get("city")),
          contactName: String(form.get("contactName") || "") || undefined,
          email: String(form.get("email") || "") || undefined,
          name: String(form.get("name")),
          notes: String(form.get("notes") || "") || undefined,
          phone: String(form.get("phone") || "") || undefined,
          region: String(form.get("region")),
          serviceType: String(form.get("serviceType"))
        });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to register directory record");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="case-dialog case-detail-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="case-dialog-header">
          <div>
            <span className="eyebrow">Directory</span>
            <h2>{mode === "team" ? "Register team member" : "Register supplier"}</h2>
            <p>{mode === "team" ? "Add employees, associates, verifiers, or finance users." : "Add a provider, supplier, payee, hospital, school, or vendor."}</p>
          </div>
          <button aria-label="Close directory registration" onClick={onClose} type="button">×</button>
        </header>

        <form className="case-form" onSubmit={handleSubmit}>
          {mode === "team" ? (
            <fieldset>
              <legend>Team member details</legend>
              <label>Display name<input minLength={2} name="displayName" required /></label>
              <label>Email<input name="email" required type="email" /></label>
              <label>Phone<input minLength={8} name="phone" /></label>
              <label>Type
                <select name="staffType" required>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ASSOCIATE">Associate</option>
                </select>
              </label>
              <label>Role
                <select name="role" required>
                  <option value="CASE_MANAGER">Case manager / submitter</option>
                  <option value="VERIFIER">Verifier</option>
                  <option value="FINANCE_MANAGER">Finance manager</option>
                  <option value="SUPER_ADMIN">Super admin</option>
                </select>
              </label>
              <label>Title<input name="title" placeholder="Program Associate" /></label>
              <label>Organization<input name="organization" placeholder="Arukah / Partner org" /></label>
              <label>Password<input minLength={8} name="password" placeholder="Optional login password" type="password" /></label>
            </fieldset>
          ) : (
            <fieldset>
              <legend>Supplier details</legend>
              <label>Supplier / provider name<input minLength={2} name="name" required /></label>
              <label>Service type<input minLength={2} name="serviceType" placeholder="Hospital, School, Pharmacy" required /></label>
              <label>Contact person<input name="contactName" /></label>
              <label>Email<input name="email" type="email" /></label>
              <label>Phone<input minLength={8} name="phone" /></label>
              <label>City<input minLength={2} name="city" required /></label>
              <label>State / Region<input minLength={2} name="region" required /></label>
              <label className="field-full">Notes<textarea name="notes" rows={4} /></label>
            </fieldset>
          )}

          {error ? <div className="form-error field-full" role="alert">{error}</div> : null}

          <footer className="case-form-actions">
            <button className="secondary-button" disabled={submitting} onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" disabled={submitting} type="submit">{submitting ? "Registering…" : "Register"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function CaseDetailPanel({
  caseRecord,
  categories,
  initialMode,
  onClose,
  onDeleted,
  onUpdated,
  session
}: {
  caseRecord: CreatedCase | null;
  categories: CaseCategory[];
  initialMode: "view" | "edit";
  onClose: () => void;
  onDeleted: (id: string, caseNumber: string) => void;
  onUpdated: (updated: CreatedCase) => void;
  session: AuthSession;
}) {
  const [editing, setEditing] = useState(initialMode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!caseRecord) {
    return (
      <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
        <section className="case-dialog case-detail-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
          <header className="case-dialog-header">
            <div>
              <span className="eyebrow">Case details</span>
              <h2>Case not found</h2>
              <p>This case may have been removed or the list is refreshing.</p>
            </div>
            <button aria-label="Close case details" onClick={onClose} type="button">×</button>
          </header>
        </section>
      </div>
    );
  }

  const selectedCase = caseRecord;
  const requestedAmount = Number(selectedCase.requestedAmountMinor) / 100;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const updated = await updateCase(session, selectedCase.id, {
        title: String(form.get("title")),
        category: String(form.get("category")),
        description: String(form.get("description")),
        requestedAmountMinor: Math.round(Number(form.get("amount")) * 100),
        currency: String(form.get("currency") || "INR").toUpperCase(),
        urgency: String(form.get("urgency")) as CreatedCase["urgency"],
        stage: String(form.get("stage")) as CreatedCase["stage"]
      });

      onUpdated(updated);
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update case");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${selectedCase.caseNumber}? This is only allowed for submitted cases without workflow history.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteCase(session, selectedCase.id);
      onDeleted(selectedCase.id, selectedCase.caseNumber);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete case");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="case-detail-title"
        aria-modal="true"
        className="case-dialog case-detail-panel"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="case-dialog-header">
          <div>
            <span className="eyebrow">Case details</span>
            <h2 id="case-detail-title">{caseRecord.caseNumber}</h2>
            <p>{caseRecord.beneficiary.preferredName} · {formatStage(caseRecord.stage)} · {formatUpdated(caseRecord.updatedAt)}</p>
          </div>
          <button aria-label="Close case details" onClick={onClose} type="button">×</button>
        </header>

        {!editing ? (
          <div className="case-detail-body">
            <div className="case-detail-summary">
              <div><span>Title</span><strong>{caseRecord.title}</strong></div>
              <div><span>Beneficiary</span><strong>{caseRecord.beneficiary.preferredName}</strong><small>{caseRecord.beneficiary.city}, {caseRecord.beneficiary.region}</small></div>
              <div><span>Category</span><strong>{caseRecord.category}</strong></div>
              <div><span>Requested amount</span><strong>{formatMoney(caseRecord.requestedAmountMinor, caseRecord.currency)}</strong></div>
              <div><span>Urgency</span><strong>{formatUrgency(caseRecord.urgency)}</strong></div>
              <div><span>Stage</span><strong>{formatStage(caseRecord.stage)}</strong></div>
              <div className="field-full"><span>Description</span><p>{caseRecord.description}</p></div>
            </div>

            {error ? <div className="form-error" role="alert">{error}</div> : null}

            <footer className="case-form-actions">
              <button className="danger-button" disabled={deleting} onClick={handleDelete} type="button">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button className="secondary-button" onClick={() => setEditing(true)} type="button">Edit case</button>
              <button className="primary-button" onClick={onClose} type="button">Done</button>
            </footer>
          </div>
        ) : (
          <form className="case-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Edit case intake</legend>
              <label className="field-full">Case title<input defaultValue={caseRecord.title} minLength={4} name="title" required /></label>
              <label>Category
                <select defaultValue={caseRecord.category} name="category" required>
                  <option value="">Select category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label>Amount<input defaultValue={requestedAmount} min={1} name="amount" required step="0.01" type="number" /></label>
              <label>Currency<input defaultValue={caseRecord.currency} maxLength={3} minLength={3} name="currency" required /></label>
              <label>Urgency
                <select defaultValue={caseRecord.urgency} name="urgency">
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </label>
              <label>Stage
                <select defaultValue={caseRecord.stage} name="stage">
                  <option value="SUBMITTED">Submitted</option>
                  <option value="VERIFICATION">Verification</option>
                  <option value="APPROVED">Approval</option>
                  <option value="PROVIDER_SELECTION">Provider selection</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="IMPACT">Impact</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ON_HOLD">On hold</option>
                </select>
              </label>
              <label className="field-full">Description<textarea defaultValue={caseRecord.description} minLength={20} name="description" required rows={5} /></label>
            </fieldset>

            {error ? <div className="form-error field-full" role="alert">{error}</div> : null}

            <footer className="case-form-actions">
              <button className="secondary-button" disabled={submitting} onClick={() => { setEditing(false); setError(""); }} type="button">Cancel</button>
              <button className="primary-button" disabled={submitting} type="submit">{submitting ? "Saving…" : "Save changes"}</button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}

function BeneficiariesView({
  beneficiaries: items,
  error,
  loading,
  onArchive,
  onCreate,
  onOpen
}: {
  beneficiaries: Beneficiary[];
  error: string;
  loading: boolean;
  onArchive: (id: string) => void;
  onCreate: () => void;
  onOpen: (id: string, mode?: "view" | "edit") => void;
}) {
  return (
    <>
      <PageHeading eyebrow="People and families" title="Beneficiaries" description="Private records for the people Arukah serves.">
        <button className="primary-button" onClick={onCreate} type="button"><Icon name="plus" /> New beneficiary</button>
      </PageHeading>
      {error ? <div className="panel"><div className="empty-state"><Icon name="search" /><h3>Unable to load beneficiaries</h3><p>{error}</p></div></div> : null}
      {loading ? <div className="panel"><div className="empty-state"><Icon name="clock" /><h3>Loading beneficiaries…</h3><p>Pulling the latest records from the API.</p></div></div> : null}
      {!loading && !error && !items.length ? <div className="panel"><div className="empty-state"><Icon name="people" /><h3>No beneficiaries found</h3><p>Create a beneficiary or adjust your search.</p></div></div> : null}
      <section className="beneficiary-grid">
        {items.map((item) => (
          <article className="beneficiary-card" key={item.id}>
            <div className="beneficiary-avatar">{getInitials(item.preferredName)}</div>
            <div className="beneficiary-copy">
              <span>{item.referenceCode}</span>
              <h3>{item.preferredName}</h3>
              <p><Icon name="pin" /> {item.city}, {item.region}</p>
              {item.phone ? <p><Icon name="phone" /> {item.phone}</p> : null}
            </div>
            <StatusPill value={item.status} />
            <div className="beneficiary-footer">
              <span>{item.activeCaseCount ?? 0} active case{(item.activeCaseCount ?? 0) === 1 ? "" : "s"}</span>
              <div className="beneficiary-actions">
                <button onClick={() => onOpen(item.id)} type="button">View</button>
                <button onClick={() => onOpen(item.id, "edit")} type="button">Edit</button>
                <button className="danger" onClick={() => onArchive(item.id)} type="button">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function BeneficiaryDetailPanel({
  beneficiary,
  initialMode,
  onArchive,
  onClose,
  onSaved,
  session,
  states,
  tamilNaduCities
}: {
  beneficiary: Beneficiary | null;
  initialMode: "view" | "edit" | "create";
  onArchive: (id: string) => void;
  onClose: () => void;
  onSaved: (beneficiary: Beneficiary) => void;
  session: AuthSession;
  states: IndiaState[];
  tamilNaduCities: IndiaCity[];
}) {
  const creating = initialMode === "create";
  const [editing, setEditing] = useState(initialMode !== "view");
  const [selectedStateCode, setSelectedStateCode] = useState(
    beneficiary?.region === "Tamil Nadu" || creating ? "TN" : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const input = {
      preferredName: String(form.get("preferredName")),
      legalName: String(form.get("legalName")),
      email: String(form.get("email") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      city: String(form.get("city")),
      region: String(form.get("region")),
      country: "IN"
    };

    try {
      const saved = creating
        ? await createBeneficiary(session, input)
        : await updateBeneficiary(session, beneficiary!.id, input);
      onSaved(saved);
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save beneficiary");
    } finally {
      setSubmitting(false);
    }
  }

  if (!beneficiary && !creating) {
    return null;
  }

  const title = creating ? "New beneficiary" : beneficiary!.preferredName;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="case-dialog case-detail-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="case-dialog-header">
          <div>
            <span className="eyebrow">Beneficiary profile</span>
            <h2>{title}</h2>
            <p>{creating ? "Create a private beneficiary record." : `${beneficiary!.referenceCode} · ${beneficiary!.city}, ${beneficiary!.region}`}</p>
          </div>
          <button aria-label="Close beneficiary details" onClick={onClose} type="button">×</button>
        </header>

        {!editing && beneficiary ? (
          <div className="case-detail-body">
            <div className="case-detail-summary">
              <div><span>Preferred name</span><strong>{beneficiary.preferredName}</strong></div>
              <div><span>Legal name</span><strong>{beneficiary.legalName}</strong></div>
              <div><span>Phone</span><strong>{beneficiary.phone || "—"}</strong></div>
              <div><span>Email</span><strong>{beneficiary.email || "—"}</strong></div>
              <div><span>Location</span><strong>{beneficiary.city}, {beneficiary.region}</strong><small>{beneficiary.country}</small></div>
              <div><span>Active cases</span><strong>{beneficiary.activeCaseCount ?? 0}</strong></div>
            </div>
            <footer className="case-form-actions">
              <button className="danger-button" onClick={() => onArchive(beneficiary.id)} type="button">Delete beneficiary</button>
              <button className="secondary-button" onClick={() => setEditing(true)} type="button">Edit beneficiary</button>
              <button className="primary-button" onClick={onClose} type="button">Done</button>
            </footer>
          </div>
        ) : (
          <form className="case-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>{creating ? "Create beneficiary" : "Edit beneficiary"}</legend>
              <label>Preferred name<input defaultValue={beneficiary?.preferredName ?? ""} name="preferredName" required /></label>
              <label>Legal name<input defaultValue={beneficiary?.legalName ?? ""} name="legalName" required /></label>
              <label>Email<input defaultValue={beneficiary?.email ?? ""} name="email" type="email" /></label>
              <label>Phone<input defaultValue={beneficiary?.phone ?? ""} minLength={8} name="phone" /></label>
              <label>State
                <select
                  defaultValue={beneficiary?.region ?? "Tamil Nadu"}
                  name="region"
                  onChange={(event) => {
                    const selected = states.find((item) => item.name === event.target.value);
                    setSelectedStateCode(selected?.code ?? "");
                  }}
                  required
                >
                  <option value="">Select state</option>
                  {states.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}{item.kind === "UNION_TERRITORY" ? " (UT)" : ""}</option>
                  ))}
                </select>
              </label>
              {selectedStateCode === "TN" ? (
                <label>City
                  <select defaultValue={beneficiary?.city ?? ""} name="city" required>
                    <option value="">Select Tamil Nadu city</option>
                    {tamilNaduCities.map((item) => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label>City<input defaultValue={beneficiary?.city ?? ""} name="city" required /></label>
              )}
            </fieldset>
            {error ? <div className="form-error field-full" role="alert">{error}</div> : null}
            <footer className="case-form-actions">
              <button className="secondary-button" disabled={submitting} onClick={creating ? onClose : () => { setEditing(false); setError(""); }} type="button">Cancel</button>
              <button className="primary-button" disabled={submitting} type="submit">{submitting ? "Saving…" : "Save beneficiary"}</button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}

function VerificationWorkflowPanel({
  caseRecord,
  onClose,
  onSubmit
}: {
  caseRecord: CreatedCase | null;
  onClose: () => void;
  onSubmit: (caseId: string, input: VerificationInput) => Promise<void>;
}) {
  const [outcome, setOutcome] = useState<VerificationInput["outcome"]>("APPROVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!caseRecord) {
    return (
      <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
        <section className="case-dialog case-detail-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
          <header className="case-dialog-header">
            <div>
              <span className="eyebrow">Verification workflow</span>
              <h2>Case not found</h2>
              <p>This case may have moved out of the verification queue.</p>
            </div>
            <button aria-label="Close verification workflow" onClick={onClose} type="button">×</button>
          </header>
        </section>
      </div>
    );
  }

  const selectedCase = caseRecord;
  const requestedAmount = Number(selectedCase.requestedAmountMinor) / 100;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const approvedAmount = Number(form.get("approvedAmount") || requestedAmount);

    try {
      await onSubmit(selectedCase.id, {
        approvedAmountMinor:
          outcome === "APPROVE" ? Math.round(approvedAmount * 100) : undefined,
        notes: String(form.get("notes")),
        outcome
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit verification");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="case-dialog case-detail-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="case-dialog-header">
          <div>
            <span className="eyebrow">Verification workflow</span>
            <h2>{selectedCase.caseNumber}</h2>
            <p>{selectedCase.title} · {selectedCase.beneficiary.preferredName}</p>
          </div>
          <button aria-label="Close verification workflow" onClick={onClose} type="button">×</button>
        </header>

        <form className="case-form verification-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Review recommendation</legend>
            <div className="case-detail-summary field-full">
              <div><span>Beneficiary</span><strong>{selectedCase.beneficiary.preferredName}</strong><small>{selectedCase.beneficiary.city}, {selectedCase.beneficiary.region}</small></div>
              <div><span>Requested amount</span><strong>{formatMoney(selectedCase.requestedAmountMinor, selectedCase.currency)}</strong></div>
              <div><span>Category</span><strong>{selectedCase.category}</strong></div>
              <div><span>Urgency</span><strong>{formatUrgency(selectedCase.urgency)}</strong></div>
              <div className="field-full"><span>Case description</span><p>{selectedCase.description}</p></div>
            </div>
            <label>Outcome
              <select
                name="outcome"
                value={outcome}
                onChange={(event) => setOutcome(event.target.value as VerificationInput["outcome"])}
              >
                <option value="APPROVE">Submit for payment</option>
                <option value="REJECT">Reject case</option>
                <option value="HOLD">Put on hold</option>
              </select>
            </label>
            {outcome === "APPROVE" ? (
              <label>Approved amount
                <input
                  defaultValue={requestedAmount}
                  min={1}
                  name="approvedAmount"
                  required
                  step="0.01"
                  type="number"
                />
              </label>
            ) : null}
            <label className="field-full">Verification notes
              <textarea
                minLength={10}
                name="notes"
                placeholder="Summarize evidence reviewed, risks, and your recommendation."
                required
                rows={5}
              />
            </label>
          </fieldset>

          {error ? <div className="form-error field-full" role="alert">{error}</div> : null}

          <footer className="case-form-actions">
            <button className="secondary-button" disabled={submitting} onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? "Submitting…" : "Submit verification"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function PaymentWorkflowPanel({
  caseRecord,
  onClose,
  onSubmit
}: {
  caseRecord: CreatedCase | null;
  onClose: () => void;
  onSubmit: (caseId: string, input: PaymentInput) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!caseRecord) {
    return (
      <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
        <section className="case-dialog case-detail-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
          <header className="case-dialog-header">
            <div>
              <span className="eyebrow">Payment workflow</span>
              <h2>Case not found</h2>
              <p>This case may have moved out of the payment queue.</p>
            </div>
            <button aria-label="Close payment workflow" onClick={onClose} type="button">×</button>
          </header>
        </section>
      </div>
    );
  }

  const selectedCase = caseRecord;
  const payableAmount = Number(
    selectedCase.approvedAmountMinor ?? selectedCase.requestedAmountMinor
  ) / 100;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const paidAmount = Number(form.get("paidAmount") || payableAmount);

    try {
      await onSubmit(selectedCase.id, {
        notes: String(form.get("notes")),
        paidAmountMinor: Math.round(paidAmount * 100),
        paidOn: String(form.get("paidOn") || "") || undefined,
        payeeName: String(form.get("payeeName")),
        paymentReference: String(form.get("paymentReference"))
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to record payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="case-dialog case-detail-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="case-dialog-header">
          <div>
            <span className="eyebrow">Payment workflow</span>
            <h2>{selectedCase.caseNumber}</h2>
            <p>{selectedCase.title} · {selectedCase.beneficiary.preferredName}</p>
          </div>
          <button aria-label="Close payment workflow" onClick={onClose} type="button">×</button>
        </header>

        <form className="case-form payment-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Record payment</legend>
            <div className="case-detail-summary field-full">
              <div><span>Beneficiary</span><strong>{selectedCase.beneficiary.preferredName}</strong><small>{selectedCase.beneficiary.city}, {selectedCase.beneficiary.region}</small></div>
              <div><span>Payable amount</span><strong>{formatMoney(String(Math.round(payableAmount * 100)), selectedCase.currency)}</strong></div>
              <div><span>Approved amount</span><strong>{selectedCase.approvedAmountMinor ? formatMoney(selectedCase.approvedAmountMinor, selectedCase.currency) : "Not set"}</strong></div>
              <div><span>Category</span><strong>{selectedCase.category}</strong></div>
            </div>
            <label>Payee / provider name
              <input defaultValue={selectedCase.beneficiary.preferredName} minLength={2} name="payeeName" required />
            </label>
            <label>Paid amount
              <input defaultValue={payableAmount} min={1} name="paidAmount" required step="0.01" type="number" />
            </label>
            <label>Payment reference
              <input minLength={3} name="paymentReference" placeholder="UTR / cheque / receipt number" required />
            </label>
            <label>Payment date
              <input defaultValue={new Date().toISOString().slice(0, 10)} name="paidOn" type="date" />
            </label>
            <label className="field-full">Payment notes
              <textarea
                minLength={10}
                name="notes"
                placeholder="Record what was paid, to whom, and any reconciliation note."
                required
                rows={5}
              />
            </label>
          </fieldset>

          {error ? <div className="form-error field-full" role="alert">{error}</div> : null}

          <footer className="case-form-actions">
            <button className="secondary-button" disabled={submitting} onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? "Recording…" : "Record payment"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function QueueView({
  cases,
  error,
  loading,
  onOpenCase,
  onRefresh,
  onStartPayment,
  onStartVerification,
  type
}: {
  cases: CreatedCase[];
  error: string;
  loading: boolean;
  onOpenCase: (id: string, mode?: "view" | "edit") => void;
  onRefresh: () => void;
  onStartPayment: (id: string) => void;
  onStartVerification: (id: string) => void;
  type: "verification" | "payments";
}) {
  const verification = type === "verification";
  const urgentCount = cases.filter((item) => item.urgency === "URGENT").length;
  const highPriorityCount = cases.filter((item) => item.urgency !== "NORMAL").length;
  const oldestCase = cases[0];
  const totalAmount = cases.reduce(
    (sum, item) => sum + Number(item.requestedAmountMinor),
    0
  );

  return (
    <>
      <PageHeading
        eyebrow={verification ? "Evidence and recommendation" : "Financial operations"}
        title={verification ? "Verification queue" : "Payment queue"}
        description={verification ? "Live cases currently waiting in the verification workflow stage." : "Live cases currently waiting in the payment workflow stage."}
      >
        <button className="secondary-button" disabled={loading} onClick={onRefresh} type="button">
          <Icon name="clock" /> Refresh
        </button>
      </PageHeading>
      <section className="stat-grid compact">
        <Stat
          label={verification ? "In verification" : "Ready for payment"}
          value={String(cases.length)}
          detail={loading ? "Loading…" : "From live database"}
          tone={verification ? "amber" : "blue"}
          icon={verification ? "verify" : "payment"}
        />
        <Stat
          label={verification ? "High priority" : "Requested total"}
          value={verification ? String(highPriorityCount) : formatMoney(String(totalAmount), "INR")}
          detail={verification ? `${urgentCount} urgent case${urgentCount === 1 ? "" : "s"}` : `${cases.length} case${cases.length === 1 ? "" : "s"}`}
          tone="green"
          icon="clock"
        />
        <Stat
          label="Oldest waiting"
          value={oldestCase ? formatQueueAge(oldestCase.updatedAt) : "—"}
          detail={oldestCase ? oldestCase.caseNumber : "No open queue items"}
          tone="purple"
          icon="complete"
        />
      </section>
      <div className="panel queue-panel">
        <PanelHeader
          title={verification ? "Cases awaiting verification" : "Cases awaiting payment"}
          subtitle={verification ? "Prioritized by urgency and oldest update." : "Prioritized by urgency and oldest update."}
        />
        {error ? <div className="empty-state"><Icon name="search" /><h3>Unable to load queue</h3><p>{error}</p></div> : null}
        {loading ? <div className="empty-state"><Icon name="clock" /><h3>Loading queue…</h3><p>Pulling live case records from the API.</p></div> : null}
        {!loading && !error && !cases.length ? (
          <div className="empty-state">
            <Icon name={verification ? "verify" : "payment"} />
            <h3>{verification ? "No cases in verification" : "No cases in payment"}</h3>
            <p>{verification ? "Move a case to Verification to see it here." : "Move a case to Payment to see it here."}</p>
          </div>
        ) : null}
        {!loading && !error && cases.length ? (
          <section className="queue-list">
            {cases.map((item) => (
              <article className="queue-card" key={item.id}>
                <div className={`urgency-dot ${item.urgency.toLowerCase()}`} />
                <div className="queue-card-main">
                  <span>{item.caseNumber} · {item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.beneficiary.preferredName} · {item.beneficiary.city}, {item.beneficiary.region}</p>
                </div>
                <div className="queue-card-meta">
                  <span>{formatMoney(item.requestedAmountMinor, item.currency)}</span>
                  <StatusPill value={formatUrgency(item.urgency)} />
                </div>
                <div className="queue-card-meta">
                  <span>{verification ? "Verifier" : "Case manager"}</span>
                  <strong>{verification ? item.verifier?.displayName ?? "Unassigned" : item.caseManager?.displayName ?? "Unassigned"}</strong>
                </div>
                <div className="queue-card-meta">
                  <span>Waiting</span>
                  <strong>{formatQueueAge(item.updatedAt)}</strong>
                </div>
                <div className="row-actions queue-actions">
                  {verification ? (
                    <button className="primary-row-action" onClick={() => onStartVerification(item.id)} type="button">Verify</button>
                  ) : (
                    <button className="primary-row-action" onClick={() => onStartPayment(item.id)} type="button">Record payment</button>
                  )}
                  <button onClick={() => onOpenCase(item.id)} type="button">View</button>
                  <button onClick={() => onOpenCase(item.id, "edit")} type="button">Edit</button>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </>
  );
}

function ReportsView({
  beneficiaries,
  cases,
  loading,
  suppliers,
  teamMembers
}: {
  beneficiaries: Beneficiary[];
  cases: CreatedCase[];
  loading: boolean;
  suppliers: Supplier[];
  teamMembers: TeamMember[];
}) {
  const activeCases = cases.filter((item) => !["CLOSED", "REJECTED"].includes(item.stage));
  const closedCases = cases.filter((item) => item.stage === "CLOSED");
  const rejectedCases = cases.filter((item) => item.stage === "REJECTED");
  const paymentCases = cases.filter((item) => item.stage === "PAYMENT");
  const impactCases = cases.filter((item) => item.stage === "IMPACT");
  const verificationCases = cases.filter((item) => item.stage === "VERIFICATION");
  const requestedTotal = cases.reduce((sum, item) => sum + Number(item.requestedAmountMinor), 0);
  const approvedTotal = cases.reduce((sum, item) => sum + Number(item.approvedAmountMinor ?? 0), 0);
  const payableTotal = paymentCases.reduce(
    (sum, item) => sum + Number(item.approvedAmountMinor ?? item.requestedAmountMinor),
    0
  );
  const activeBeneficiaries = beneficiaries.filter((item) => item.status === "ACTIVE");
  const activeTeam = teamMembers.filter((item) => item.active);
  const activeSuppliers = suppliers.filter((item) => item.active);
  const pilotTarget = 50;
  const pilotProgress = Math.min(100, Math.round((closedCases.length / pilotTarget) * 100));
  const stageRows = buildPipelineRows(cases);
  const oldestOpenCase = oldestCase(activeCases);
  const conversionRate = cases.length ? Math.round((closedCases.length / cases.length) * 100) : 0;
  const rejectionRate = cases.length ? Math.round((rejectedCases.length / cases.length) * 100) : 0;

  return (
    <>
      <PageHeading eyebrow="Pilot learning" title="Reports" description="Operational visibility grounded in live case, beneficiary, directory, and workflow records." />
      <section className="stat-grid compact">
        <Stat label="Total cases" value={String(cases.length)} detail={loading ? "Loading…" : `${activeCases.length} active right now`} tone="green" icon="folder" />
        <Stat label="Requested total" value={formatMoney(String(requestedTotal), "INR")} detail={`${formatMoney(String(approvedTotal), "INR")} approved`} tone="blue" icon="payment" />
        <Stat label="Pilot progress" value={`${closedCases.length}/${pilotTarget}`} detail={`${pilotProgress}% of closure target`} tone="purple" icon="complete" />
      </section>

      <section className="report-grid">
        <article className="report-card report-card-wide">
          <div className="report-icon"><Icon name="report" /></div>
          <h3>Case funnel</h3>
          <p>Live movement across intake, verification, payment, impact, and closure.</p>
          <div className="report-metrics">
            {stageRows.map((row) => (
              <div className="report-metric" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="report-card">
          <div className="report-icon"><Icon name="clock" /></div>
          <h3>Time in stage</h3>
          <p>Oldest active case and queue pressure from the workflow timestamps.</p>
          <div className="report-metrics single">
            <div className="report-metric"><span>Oldest active</span><strong>{oldestOpenCase ? formatQueueAge(oldestOpenCase.updatedAt) : "—"}</strong></div>
            <div className="report-metric"><span>Verification queue</span><strong>{verificationCases.length}</strong></div>
            <div className="report-metric"><span>Payment queue</span><strong>{paymentCases.length}</strong></div>
          </div>
        </article>

        <article className="report-card">
          <div className="report-icon"><Icon name="payment" /></div>
          <h3>Financial reconciliation</h3>
          <p>Approved amounts, payment queue exposure, and impact follow-up handoff.</p>
          <div className="report-metrics single">
            <div className="report-metric"><span>Approved</span><strong>{formatMoney(String(approvedTotal), "INR")}</strong></div>
            <div className="report-metric"><span>Ready to pay</span><strong>{formatMoney(String(payableTotal), "INR")}</strong></div>
            <div className="report-metric"><span>Impact follow-up</span><strong>{impactCases.length}</strong></div>
          </div>
        </article>

        <article className="report-card">
          <div className="report-icon"><Icon name="people" /></div>
          <h3>Directory coverage</h3>
          <p>Operational readiness across beneficiaries, team members, and suppliers.</p>
          <div className="report-metrics single">
            <div className="report-metric"><span>Beneficiaries</span><strong>{activeBeneficiaries.length}</strong></div>
            <div className="report-metric"><span>Team members</span><strong>{activeTeam.length}</strong></div>
            <div className="report-metric"><span>Suppliers</span><strong>{activeSuppliers.length}</strong></div>
          </div>
        </article>

        <article className="report-card">
          <div className="report-icon"><Icon name="complete" /></div>
          <h3>Pilot progress</h3>
          <p>Responsible closures toward the first 50-case internal MVP pilot.</p>
          <div className="report-progress">
            <div><span style={{ width: `${pilotProgress}%` }} /></div>
            <strong>{pilotProgress}%</strong>
          </div>
          <div className="report-metrics single">
            <div className="report-metric"><span>Closed</span><strong>{closedCases.length}</strong></div>
            <div className="report-metric"><span>Rejected</span><strong>{rejectedCases.length}</strong></div>
            <div className="report-metric"><span>Conversion</span><strong>{conversionRate}%</strong></div>
            <div className="report-metric"><span>Rejection</span><strong>{rejectionRate}%</strong></div>
          </div>
        </article>
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

function CaseTable({
  items,
  expanded = false,
  onDeleteCase,
  onOpenCase
}: {
  items: CaseTableItem[];
  expanded?: boolean;
  onDeleteCase: (id: string) => void;
  onOpenCase: (id: string, mode?: "view" | "edit") => void;
}) {
  return (
    <div className="case-table-wrap">
      <table className="case-table">
        <thead><tr><th>Case</th><th>Beneficiary</th>{expanded ? <th>Category</th> : null}<th>Amount</th><th>Stage</th>{expanded ? <th>Owner</th> : null}<th>Updated</th><th>Actions</th></tr></thead>
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
              <td>
                <div className="row-actions">
                  <button onClick={() => onOpenCase(item.recordId, "view")} type="button">View</button>
                  <button onClick={() => onOpenCase(item.recordId, "edit")} type="button">Edit</button>
                  <button className="danger" onClick={() => onDeleteCase(item.recordId)} type="button">Delete</button>
                </div>
              </td>
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
  const label = value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());

  return <span className={`status-pill ${value === "ACTIVE" || value === "Active" ? "active" : ""}`}>{label}</span>;
}

function FocusItem({ icon, tone, title, detail }: { icon: IconName; tone: string; title: string; detail: string }) {
  return <div className="focus-item"><div className={`focus-icon ${tone}`}><Icon name={icon} /></div><div><strong>{title}</strong><p>{detail}</p></div><Icon name="chevron" /></div>;
}

function Activity({ initials, text, time }: { initials: string; text: React.ReactNode; time: string }) {
  return <div className="activity-item"><div className="activity-avatar">{initials}</div><div><p>{text}</p><span>{time}</span></div></div>;
}

type IconName = "grid" | "people" | "folder" | "verify" | "payment" | "report" | "dots" | "menu" | "search" | "bell" | "plus" | "complete" | "impact" | "arrow" | "chevron" | "filter" | "pin" | "phone" | "clock" | "globe" | "external" | "logout";

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
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.6a2 2 0 0 1-.45 2.11L9 10.67a16 16 0 0 0 4.33 4.33l1.24-1.24a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0 1 22 16.92Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    external: <><path d="M14 5h5v5M10 14 19 5" /><path d="M19 14v5H5V5h5" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
