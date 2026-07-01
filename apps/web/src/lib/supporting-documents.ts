import { apiUrl, type AuthSession } from "./auth";

export type SupportingDocumentEntityType =
  | "CASE"
  | "BENEFICIARY"
  | "TEAM_MEMBER"
  | "SUPPLIER";

export type SupportingDocument = {
  id: string;
  entityType: SupportingDocumentEntityType;
  entityId: string;
  label: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export async function uploadSupportingDocuments(
  session: AuthSession,
  entityType: SupportingDocumentEntityType,
  entityId: string,
  files: File[],
  label?: string
): Promise<SupportingDocument[]> {
  const uploads = files.map(async (file) => {
    const form = new FormData();
    form.append("file", file);
    if (label) form.append("label", label);

    const response = await fetch(`${apiUrl}/supporting-documents/${entityType}/${entityId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      },
      body: form
    });

    const body = await response.json();

    if (!response.ok) {
      const message = (body as { message?: string | string[] }).message;
      throw new Error(Array.isArray(message) ? message[0] : message ?? "Unable to upload document");
    }

    return body as SupportingDocument;
  });

  return Promise.all(uploads);
}

export function filesFromForm(form: FormData, fieldName: string): File[] {
  return form
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0);
}
