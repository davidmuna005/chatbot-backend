import { BaseModel } from './baseModel.js';

export class User extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      roleId: data.roleId,
      role: data.role ?? null,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.displayName,
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
