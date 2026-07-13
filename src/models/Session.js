import { BaseModel } from './baseModel.js';

export class Session extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      sessionId: data.sessionId ?? data.id,
      parentId: data.parentId ?? null,
      userId: data.userId ?? null,
      tokenHash: data.tokenHash ?? null,
      expiresAt: data.expiresAt ?? null,
      status: data.status ?? 'active',
      deviceInfo: data.deviceInfo ?? {},
      lastActivityAt: data.lastActivityAt ?? null,
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      parent: data.parent ?? null,
      ...data
    });
  }
}
