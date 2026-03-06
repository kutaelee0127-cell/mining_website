import { PageRepository } from "../../../../domain/src/page/PageRepository";
import { RevertService } from "../../../../domain/src/revision/RevertService";
import { isAdminRequest, type RequestLike } from "../middleware/auth";

const pages = new PageRepository();
const reverter = new RevertService();

export function postAdminRevisionRevert(
  request: RequestLike,
  revisionId: string,
  body: { entityId: string; expectedVersion: number; snapshot: Record<string, unknown> },
) {
  if (!isAdminRequest(request)) {
    return {
      status: 401,
      body: {
        code: "AUTH_REQUIRED",
        message: "Not authenticated",
      },
    };
  }

  const current = pages.get(body.entityId);
  const currentVersion = current?.version ?? 1;
  const reverted = reverter.revert({
    revisionId,
    expectedVersion: body.expectedVersion,
    currentVersion,
  });

  if (reverted.status === 409) {
    return {
      status: 409,
      body: {
        code: "CONFLICT",
        message: "Version conflict",
      },
    };
  }

  pages.save({
    entityId: body.entityId,
    version: reverted.newVersion ?? currentVersion,
    data: body.snapshot,
  });

  return {
    status: 200,
    body: {
      revision_id: revisionId,
      version: reverted.newVersion,
    },
  };
}
