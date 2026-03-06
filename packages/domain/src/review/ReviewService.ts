export interface ReviewItem {
  id: string;
  rating: number;
  text: string;
  author: string;
  source: string;
}

export class ReviewService {
  private items: ReviewItem[] = [];

  list(): ReviewItem[] {
    return this.items;
  }

  create(input: Omit<ReviewItem, "id">): ReviewItem {
    const item: ReviewItem = {
      id: `review-${this.items.length + 1}`,
      ...input,
    };
    this.items.push(item);
    return item;
  }

  update(id: string, patch: Partial<Omit<ReviewItem, "id">>): ReviewItem | null {
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
