import { readAccessToken } from "./auth";

export interface ReviewItemDto {
  id: string;
  rating: number;
  text: string;
  author: string;
  source: string;
}

interface ReviewApiItem {
  id: string;
  author_name: string;
  rating: number;
  content: Record<string, string>;
  source: string;
}

function adminHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toDto(item: ReviewApiItem): ReviewItemDto {
  return {
    id: item.id,
    rating: item.rating,
    text: item.content["ko-KR"] ?? item.content["en-US"] ?? "",
    author: item.author_name,
    source: item.source,
  };
}

export async function listReviews(isAdmin = false): Promise<ReviewItemDto[]> {
  const response = await fetch(isAdmin ? "/api/admin/reviews/items" : "/api/public/reviews/items", {
    headers: isAdmin ? adminHeaders() : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed reviews list: ${response.status}`);
  }
  const data = (await response.json()) as { items: ReviewApiItem[] };
  return data.items.map(toDto);
}

export async function addReview(input: Omit<ReviewItemDto, "id">): Promise<ReviewItemDto> {
  const response = await fetch("/api/admin/reviews/items", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      author_name: input.author,
      rating: input.rating,
      content: { "ko-KR": input.text, "en-US": input.text },
      source: input.source || "MANUAL",
      published: true,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed review create: ${response.status}`);
  }
  return toDto((await response.json()) as ReviewApiItem);
}

export async function saveReview(id: string, patch: Partial<Omit<ReviewItemDto, "id">>): Promise<ReviewItemDto | null> {
  const body: Record<string, unknown> = {};
  if (typeof patch.author === "string") {
    body.author_name = patch.author;
  }
  if (typeof patch.rating === "number") {
    body.rating = patch.rating;
  }
  if (typeof patch.text === "string") {
    body.content = { "ko-KR": patch.text, "en-US": patch.text };
  }
  if (typeof patch.source === "string") {
    body.source = patch.source;
  }
  const response = await fetch(`/api/admin/reviews/items/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed review update: ${response.status}`);
  }
  return toDto((await response.json()) as ReviewApiItem);
}

export async function removeReview(id: string): Promise<void> {
  const response = await fetch(`/api/admin/reviews/items/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed review delete: ${response.status}`);
  }
}
