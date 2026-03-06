import { RevisionService } from "../../../../domain/src/revision/RevisionService";
import { isAdminRequest, type RequestLike } from "../middleware/auth";

const revisions = new RevisionService();

function unauthorized() {
  return {
    status: 401,
    body: {
      code: "AUTH_REQUIRED",
      message: "Not authenticated",
    },
  };
}

export function getAdminRevisions(request: RequestLike) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return {
    status: 200,
    body: {
      items: revisions.list().map((item) => ({
        id: item.id,
        entity_type: item.entityType,
        entity_id: item.entityId,
        summary: item.summary,
        created_at: item.createdAt,
      })),
    },
  };
}

export function getAdminRevisionById(request: RequestLike, id: string) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  const item = revisions.getById(id);
  if (!item) {
    return {
      status: 404,
      body: {
        code: "NOT_FOUND",
        message: "Revision not found",
      },
    };
  }
  return {
    status: 200,
    body: {
      id: item.id,
      entity_type: item.entityType,
      entity_id: item.entityId,
      summary: item.summary,
      created_at: item.createdAt,
    },
  };
}
