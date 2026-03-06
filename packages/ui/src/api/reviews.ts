export interface ReviewItemDto {
  id: string;
  rating: number;
  text: string;
  author: string;
  source: string;
}

let reviews: ReviewItemDto[] = [];

export async function listReviews(): Promise<ReviewItemDto[]> {
  return reviews;
}

export async function addReview(input: Omit<ReviewItemDto, "id">): Promise<ReviewItemDto> {
  const item: ReviewItemDto = { id: `review-ui-${reviews.length + 1}`, ...input };
  reviews = [...reviews, item];
  return item;
}

export async function removeReview(id: string): Promise<void> {
  reviews = reviews.filter((item) => item.id !== id);
}
