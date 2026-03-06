import { StyleService } from "../../../../domain/src/style/StyleService";

const service = new StyleService();

export function getPublicStyleItems() {
  return {
    status: 200,
    body: {
      items: service.list(),
    },
  };
}
