export interface RevisionEntry {
  id: string;
  entityType: "home";
  entityId: string;
  summary: string[];
  createdAt: string;
}

export class RevisionService {
  private entries: RevisionEntry[] = [];

  append(summary: string[]): RevisionEntry {
    const entry: RevisionEntry = {
      id: `rev-${this.entries.length + 1}`,
      entityType: "home",
      entityId: "home",
      summary,
      createdAt: new Date().toISOString(),
    };
    this.entries = [entry, ...this.entries];
    return entry;
  }

  list(): RevisionEntry[] {
    return this.entries;
  }
}
