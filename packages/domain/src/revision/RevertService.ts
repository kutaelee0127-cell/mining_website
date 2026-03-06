export interface RevertInput {
  revisionId: string;
  expectedVersion: number;
  currentVersion: number;
}

export interface RevertResult {
  status: 200 | 409;
  newVersion?: number;
}

export class RevertService {
  revert(input: RevertInput): RevertResult {
    if (input.expectedVersion !== input.currentVersion) {
      return { status: 409 };
    }

    return { status: 200, newVersion: input.currentVersion + 1 };
  }
}
