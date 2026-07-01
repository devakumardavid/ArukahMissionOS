"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { AuthSession } from "../lib/auth";
import {
  createBeneficiary,
  createCase,
  type Beneficiary,
  type CaseCategory,
  type CreatedCase,
  type IndiaCity,
  type IndiaState,
  listCaseCategories,
  listBeneficiaries,
  listIndiaCities,
  listIndiaStates
} from "../lib/cases";
import {
  filesFromForm,
  uploadSupportingDocuments
} from "../lib/supporting-documents";

type NewCaseDialogProps = {
  session: AuthSession;
  onClose: () => void;
  onCreated: (created: CreatedCase) => void;
  embedded?: boolean;
};

export function NewCaseDialog({
  session,
  onClose,
  onCreated,
  embedded = false
}: NewCaseDialogProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [states, setStates] = useState<IndiaState[]>([]);
  const [tamilNaduCities, setTamilNaduCities] = useState<IndiaCity[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("TN");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [createNewBeneficiary, setCreateNewBeneficiary] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      listBeneficiaries(session),
      listCaseCategories(session),
      listIndiaStates(session),
      listIndiaCities(session, "TN")
    ])
      .then((items) => {
        const [beneficiaryItems, categoryItems, stateItems, cityItems] = items;
        setBeneficiaries(beneficiaryItems);
        setCategories(categoryItems);
        setStates(stateItems);
        setTamilNaduCities(cityItems);
        if (beneficiaryItems[0]) setBeneficiaryId(beneficiaryItems[0].id);
        else setCreateNewBeneficiary(true);
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Unable to load beneficiaries")
      );
  }, [session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      let selectedBeneficiaryId = beneficiaryId;
      const beneficiaryDocuments = filesFromForm(form, "beneficiaryDocuments");
      const caseDocuments = filesFromForm(form, "caseDocuments");

      if (createNewBeneficiary) {
        const beneficiary = await createBeneficiary(session, {
          preferredName: String(form.get("preferredName")),
          legalName: String(form.get("legalName")),
          email: String(form.get("email") || "") || undefined,
          phone: String(form.get("phone") || "") || undefined,
          city: String(form.get("city")),
          region: String(form.get("region")),
          country: String(form.get("country") || "IN")
        });
        selectedBeneficiaryId = beneficiary.id;
      }

      if (!selectedBeneficiaryId) {
        throw new Error("Select or create a beneficiary");
      }

      const amount = Number(form.get("amount"));
      const created = await createCase(session, {
        beneficiaryId: selectedBeneficiaryId,
        title: String(form.get("title")),
        category: String(form.get("category")),
        description: String(form.get("description")),
        requestedAmountMinor: Math.round(amount * 100),
        currency: String(form.get("currency") || "INR").toUpperCase(),
        urgency: String(form.get("urgency")) as "NORMAL" | "HIGH" | "URGENT",
        caseManagerId: session.user.id
      });

      if (beneficiaryDocuments.length) {
        await uploadSupportingDocuments(
          session,
          "BENEFICIARY",
          selectedBeneficiaryId,
          beneficiaryDocuments,
          "Beneficiary supporting document"
        );
      }

      if (caseDocuments.length) {
        await uploadSupportingDocuments(
          session,
          "CASE",
          created.id,
          caseDocuments,
          "Case supporting document"
        );
      }

      onCreated(created);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create case");
    } finally {
      setSubmitting(false);
    }
  }

  const content = (
      <section
        aria-labelledby="new-case-title"
        aria-modal={embedded ? undefined : "true"}
        className={`case-dialog ${embedded ? "case-dialog-embedded" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        role={embedded ? "region" : "dialog"}
      >
        <header className="case-dialog-header">
          <div>
            <span className="eyebrow">Case intake</span>
            <h2 id="new-case-title">Create a new case</h2>
            <p>Record the beneficiary and assistance request.</p>
          </div>
          {!embedded ? <button aria-label="Close new case form" onClick={onClose} type="button">×</button> : null}
        </header>

        <form className="case-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Beneficiary</legend>
            {beneficiaries.length ? (
              <label className="field-full">
                Existing beneficiary
                <select
                  disabled={createNewBeneficiary}
                  onChange={(event) => setBeneficiaryId(event.target.value)}
                  value={beneficiaryId}
                >
                  {beneficiaries.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.preferredName} · {item.referenceCode}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="checkbox-field field-full">
              <input
                checked={createNewBeneficiary}
                onChange={(event) => setCreateNewBeneficiary(event.target.checked)}
                type="checkbox"
              />
              Create a new beneficiary
            </label>
            {createNewBeneficiary ? (
              <>
                <label>Preferred name<input name="preferredName" required /></label>
                <label>Legal name<input name="legalName" required /></label>
                <label>Email<input name="email" type="email" /></label>
                <label>Phone<input minLength={8} name="phone" /></label>
                <label>State
                  <select
                    name="region"
                    onChange={(event) => {
                      const selected = states.find((item) => item.name === event.target.value);
                      setSelectedStateCode(selected?.code ?? "");
                    }}
                    required
                    defaultValue="Tamil Nadu"
                  >
                    <option value="">Select state</option>
                    {states.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}{item.kind === "UNION_TERRITORY" ? " (UT)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedStateCode === "TN" ? (
                  <label>City
                    <select name="city" required>
                      <option value="">Select Tamil Nadu city</option>
                      {tamilNaduCities.map((item) => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label>City<input name="city" required /></label>
                )}
                <input name="country" type="hidden" value="IN" />
              </>
            ) : null}
            <label className="field-full">Beneficiary supporting documents
              <input accept="image/*,.pdf,application/pdf" multiple name="beneficiaryDocuments" type="file" />
              <small>Upload beneficiary ID, income proof, address proof, or family documents as images/PDF.</small>
            </label>
          </fieldset>

          <fieldset>
            <legend>Assistance request</legend>
            <label className="field-full">Case title<input minLength={4} name="title" required /></label>
            <label>Category
              <select name="category" required>
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>Urgency<select defaultValue="NORMAL" name="urgency"><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label>
            <label>Requested amount<input min="0.01" name="amount" required step="0.01" type="number" /></label>
            <label>Currency<input defaultValue="INR" maxLength={3} minLength={3} name="currency" required /></label>
            <label className="field-full">Description<textarea minLength={20} name="description" required rows={4} /></label>
            <label className="field-full">Case supporting documents
              <input accept="image/*,.pdf,application/pdf" multiple name="caseDocuments" type="file" />
              <small>Upload estimates, invoices, prescriptions, school fee letters, or other need evidence.</small>
            </label>
          </fieldset>

          {error ? <div className="form-error field-full" role="alert">{error}</div> : null}

          <footer className="case-form-actions">
            <button className="secondary-button" onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? "Creating…" : "Create case"}
            </button>
          </footer>
        </form>
      </section>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      {content}
    </div>
  );
}
