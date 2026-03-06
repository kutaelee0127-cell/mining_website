export interface StyleItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

export class StyleService {
  private items: StyleItem[] = [];

  list(): StyleItem[] {
    return this.items;
  }

  create(input: Omit<StyleItem, "id">): StyleItem {
    const item: StyleItem = {
      id: `style-${this.items.length + 1}`,
      ...input,
    };
    this.items.push(item);
    return item;
  }

  update(id: string, patch: Partial<Omit<StyleItem, "id">>): StyleItem | null {
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
}
