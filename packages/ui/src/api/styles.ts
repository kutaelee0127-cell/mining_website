import { readAccessToken } from "./auth";

export interface StyleItemDto {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
}

interface StyleItemApi {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: { amount: number; currency: string };
  media_id: string;
  category: string;
}

function adminHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toDto(item: StyleItemApi): StyleItemDto {
  return {
    id: item.id,
    name: item.name["ko-KR"] ?? item.name["en-US"] ?? "Style",
    description: item.description["ko-KR"] ?? item.description["en-US"] ?? "",
    price: Number(item.price?.amount ?? 0),
    imageUrl: item.media_id || "/public/media/style",
    category: item.category,
  };
}

export async function listStyles(isAdmin = false): Promise<StyleItemDto[]> {
  const response = await fetch(isAdmin ? "/api/admin/styles/items" : "/api/public/styles/items", {
    headers: isAdmin ? adminHeaders() : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed styles list: ${response.status}`);
  }
  const data = (await response.json()) as { items: StyleItemApi[] };
  return data.items.map(toDto);
}

export async function addStyle(input: Omit<StyleItemDto, "id" | "category"> & { category?: string }): Promise<StyleItemDto> {
  const response = await fetch("/api/admin/styles/items", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      name: { "ko-KR": input.name, "en-US": input.name },
      description: { "ko-KR": input.description, "en-US": input.description },
      price: { amount: input.price, currency: "KRW" },
      media_id: input.imageUrl,
      category: input.category ?? "ETC",
      published: true,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed style create: ${response.status}`);
  }
  return toDto((await response.json()) as StyleItemApi);
}

export async function saveStyle(id: string, patch: Partial<Omit<StyleItemDto, "id">>): Promise<StyleItemDto | null> {
  const body: Record<string, unknown> = {};
  if (typeof patch.name === "string") {
    body.name = { "ko-KR": patch.name, "en-US": patch.name };
  }
  if (typeof patch.description === "string") {
    body.description = { "ko-KR": patch.description, "en-US": patch.description };
  }
  if (typeof patch.price === "number") {
    body.price = { amount: patch.price, currency: "KRW" };
  }
  if (typeof patch.imageUrl === "string") {
    body.media_id = patch.imageUrl;
  }
  if (typeof patch.category === "string") {
    body.category = patch.category;
  }
  const response = await fetch(`/api/admin/styles/items/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed style update: ${response.status}`);
  }
  return toDto((await response.json()) as StyleItemApi);
}

export async function deleteStyle(id: string): Promise<void> {
  const response = await fetch(`/api/admin/styles/items/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed style delete: ${response.status}`);
  }
}
