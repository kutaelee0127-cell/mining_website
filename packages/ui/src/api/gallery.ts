export interface GalleryItemDto {
  id: string;
  imageUrl: string;
  title: string;
  sortOrder: number;
}

let items: GalleryItemDto[] = [];

export async function listGallery(): Promise<GalleryItemDto[]> {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addGalleryItem(imageUrl: string, title: string): Promise<GalleryItemDto> {
  const item: GalleryItemDto = {
    id: `gallery-ui-${items.length + 1}`,
    imageUrl,
    title,
    sortOrder: items.length,
  };
  items = [...items, item];
  return item;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  items = items.filter((item) => item.id !== id);
}

export async function reorderGallery(ids: string[]): Promise<GalleryItemDto[]> {
  const orderMap = new Map(ids.map((id, index) => [id, index]));
  items = items.map((item) => ({ ...item, sortOrder: orderMap.get(item.id) ?? item.sortOrder }));
  return listGallery();
}
