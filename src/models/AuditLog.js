import { BaseModel } from './baseModel.js';

export class AuditLog extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      userId: data.userId ?? null,
      user: data.user ?? null,
      action: data.action ?? null,
      resource: data.resource ?? null,
      result: data.result ?? 'success',
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      ...data
    });
  }
}
