import { BaseModel } from './baseModel.js';

export class Ticket extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      parentId: data.parentId ?? null,
      userId: data.userId ?? null,
      subject: data.subject ?? null,
      category: data.category ?? 'general',
      description: data.description ?? null,
      status: data.status ?? 'open',
      priority: data.priority ?? 'normal',
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      parent: data.parent ?? null,
      ...data
    });
  }
}
