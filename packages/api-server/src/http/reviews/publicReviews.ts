import { ReviewService } from "../../../../domain/src/review/ReviewService";

const service = new ReviewService();

export function getPublicReviewItems() {
  return {
    status: 200,
    body: {
      items: service.list(),
    },
  };
}
