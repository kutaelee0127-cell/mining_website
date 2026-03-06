import { readAccessToken } from "./auth";

export interface RevisionDto {
  id: string;
  entity_type: string;
  entity_id: string;
  summary: string[];
  created_at: string;
}

function adminHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function listRevisions(): Promise<RevisionDto[]> {
  const response = await fetch("/api/admin/revisions", {
    headers: adminHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed revisions list: ${response.status}`);
  }
  const data = (await response.json()) as { items: RevisionDto[] };
  return data.items;
}

export async function restoreRevision(revisionId: string): Promise<{ ok: boolean }> {
  const response = await fetch(`/api/admin/revisions/${revisionId}/restore`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    return { ok: false };
  }
  return { ok: true };
}
