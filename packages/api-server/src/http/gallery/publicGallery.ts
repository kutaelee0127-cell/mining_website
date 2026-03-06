import { GalleryService } from "../../../../domain/src/gallery/GalleryService";

const service = new GalleryService();

export function getPublicGalleryItems() {
  return {
    status: 200,
    body: {
      items: service.list(),
    },
  };
}
