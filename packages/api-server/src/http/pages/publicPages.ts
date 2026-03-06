import { PageService } from "../../../../domain/src/page/PageService";
import { RevisionService } from "../../../../domain/src/revision/RevisionService";

const revisionService = new RevisionService();
const pageService = new PageService(revisionService);

export function getPublicHome() {
  return {
    status: 200,
    body: pageService.getHome(),
  };
}

export function getAdminRevisions() {
  return {
    status: 200,
    body: {
      items: revisionService.list(),
    },
  };
}
