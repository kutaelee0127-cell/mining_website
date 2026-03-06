export interface RevisionDto {
  id: string;
  entity_type: string;
  entity_id: string;
  summary: string[];
  created_at: string;
}

let revisions: RevisionDto[] = [];

export function seedRevision(entry: RevisionDto): void {
  revisions = [entry, ...revisions];
}

export async function listRevisions(): Promise<RevisionDto[]> {
  return revisions;
}
