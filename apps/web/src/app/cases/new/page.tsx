"use client";

import { useEffect, useState } from "react";
import { readSession, type AuthSession } from "../../../lib/auth";
import type { CreatedCase } from "../../../lib/cases";
import { NewCaseDialog } from "../../new-case-dialog";

export default function NewCasePage() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const stored = readSession();

    if (!stored) {
      window.location.replace("/");
      return;
    }

    setSession(stored);
  }, []);

  function handleCreated(created: CreatedCase) {
    window.location.assign(`/?created=${encodeURIComponent(created.caseNumber)}`);
  }

  if (!session) {
    return (
      <main className="session-loading">
        <div className="brand-mark">A</div>
        <span>Opening case intake…</span>
      </main>
    );
  }

  return (
    <main className="case-intake-page">
      <header className="case-intake-topbar">
        <a className="login-brand" href="/">
          <div className="brand-mark">A</div>
          <div><strong>Arukah</strong><span>MissionOS</span></div>
        </a>
        <a className="secondary-button" href="/">Back to dashboard</a>
      </header>
      <div className="case-intake-content">
        <NewCaseDialog
          embedded
          onClose={() => window.location.assign("/")}
          onCreated={handleCreated}
          session={session}
        />
      </div>
    </main>
  );
}
