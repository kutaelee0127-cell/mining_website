import { readAccessToken } from "./auth";

export interface GalleryItemDto {
  id: string;
  imageUrl: string;
  title: string;
  sortOrder: number;
  version: number;
}

interface GalleryItemApi {
  id: string;
  media_id: string;
  caption: Record<string, string>;
  sort_order: number | null;
  version: number;
}

function titleOf(caption: Record<string, string>): string {
  return caption["ko-KR"] ?? caption["en-US"] ?? "Gallery";
}

function toDto(item: GalleryItemApi): GalleryItemDto {
  return {
    id: item.id,
    imageUrl: item.media_id,
    title: titleOf(item.caption),
    sortOrder: item.sort_order ?? 0,
    version: item.version,
  };
}

function adminHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function listGallery(isAdmin = false): Promise<GalleryItemDto[]> {
  const response = await fetch(isAdmin ? "/api/admin/gallery/items" : "/api/public/gallery/items", {
    headers: isAdmin ? adminHeaders() : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed gallery list: ${response.status}`);
  }
  const data = (await response.json()) as { items: GalleryItemApi[] };
  return data.items.map(toDto).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addGalleryItem(imageUrl: string, title: string): Promise<GalleryItemDto> {
  const response = await fetch("/api/admin/gallery/items", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      media_id: imageUrl,
      caption: { "ko-KR": title, "en-US": title },
      published: true,
      featured: false,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed gallery create: ${response.status}`);
  }
  return toDto((await response.json()) as GalleryItemApi);
}

export async function updateGalleryItem(id: string, patch: { imageUrl?: string; title?: string }): Promise<GalleryItemDto> {
  const response = await fetch(`/api/admin/gallery/items/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({
      ...(patch.imageUrl ? { media_id: patch.imageUrl } : {}),
      ...(patch.title ? { caption: { "ko-KR": patch.title, "en-US": patch.title } } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed gallery update: ${response.status}`);
  }
  return toDto((await response.json()) as GalleryItemApi);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const response = await fetch(`/api/admin/gallery/items/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed gallery delete: ${response.status}`);
  }
}

export async function reorderGallery(ids: string[]): Promise<GalleryItemDto[]> {
  const response = await fetch("/api/admin/gallery/items/reorder", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      items: ids.map((id, index) => ({ id, sort_order: index })),
    }),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed gallery reorder: ${response.status}`);
  }
  return listGallery(true);
}
