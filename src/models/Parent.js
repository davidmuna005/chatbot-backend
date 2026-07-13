import { BaseModel } from './baseModel.js';

export class Parent extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      parentId: data.parentId ?? data.id,
      userId: data.userId ?? null,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      phone: data.phone ?? null,
      nationalId: data.nationalId ?? null,
      verificationStatus: data.verificationStatus ?? 'pending',
      status: data.status ?? 'active',
      isDeleted: data.isDeleted ?? false,
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      sessions: data.sessions ?? [],
      tickets: data.tickets ?? [],
      notifications: data.notifications ?? [],
      serviceRequests: data.serviceRequests ?? [],
      ...data
    });
  }
}
