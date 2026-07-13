import { BaseModel } from './baseModel.js';

export class Configuration extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      key: data.key ?? null,
      value: data.value ?? null,
      category: data.category ?? 'system',
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
