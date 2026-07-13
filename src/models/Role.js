import { BaseModel } from './baseModel.js';

export class Role extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      permissions: data.permissions ?? [],
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
