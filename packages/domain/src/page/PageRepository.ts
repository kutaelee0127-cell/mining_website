export interface VersionedPageSnapshot {
  entityId: string;
  version: number;
  data: Record<string, unknown>;
}

export class PageRepository {
  private pages = new Map<string, VersionedPageSnapshot>();

  get(entityId: string): VersionedPageSnapshot | null {
    return this.pages.get(entityId) ?? null;
  }

  save(snapshot: VersionedPageSnapshot): VersionedPageSnapshot {
    this.pages.set(snapshot.entityId, snapshot);
    return snapshot;
  }
}
