import { BaseModel } from './baseModel.js';

export class Permission extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      resource: data.resource ?? null,
      action: data.action ?? null,
      status: data.status ?? 'active',
      isDeleted: data.isDeleted ?? false,
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      ...data
    });
  }
}
