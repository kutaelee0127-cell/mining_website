export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  sortOrder: number;
}

export class GalleryService {
  private items: GalleryItem[] = [];

  list(): GalleryItem[] {
    return [...this.items].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  create(imageUrl: string, title: string): GalleryItem {
    const item: GalleryItem = {
      id: `gallery-${this.items.length + 1}`,
      imageUrl,
      title,
      sortOrder: this.items.length,
    };
    this.items.push(item);
    return item;
  }

  update(id: string, patch: Partial<Pick<GalleryItem, "imageUrl" | "title">>): GalleryItem | null {
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }
    this.items[index] = { ...this.items[index], ...patch };
    return this.items[index];
  }

  remove(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < before;
  }

  reorder(ids: string[]): GalleryItem[] {
    const orderMap = new Map(ids.map((id, index) => [id, index]));
    this.items = this.items.map((item) => ({
      ...item,
      sortOrder: orderMap.get(item.id) ?? item.sortOrder,
    }));
    return this.list();
  }
}
