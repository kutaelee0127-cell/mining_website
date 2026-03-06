export interface RevisionEntry {
  id: string;
  entityType: "home" | "about" | "booking" | "gallery" | "style" | "review";
  entityId: string;
  summary: string[];
  createdAt: string;
}

export class RevisionService {
  private entries: RevisionEntry[] = [];

  append(summary: string[], entityType: RevisionEntry["entityType"] = "home", entityId = entityType): RevisionEntry {
    const entry: RevisionEntry = {
      id: `rev-${this.entries.length + 1}`,
      entityType,
      entityId,
      summary,
      createdAt: new Date().toISOString(),
    };
    this.entries = [entry, ...this.entries];
    return entry;
  }

  list(): RevisionEntry[] {
    return this.entries;
  }

  getById(id: string): RevisionEntry | null {
    return this.entries.find((entry) => entry.id === id) ?? null;
  }
}
