import { BaseModel } from './baseModel.js';

export class Notification extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      parentId: data.parentId ?? null,
      userId: data.userId ?? null,
      channel: data.channel ?? 'whatsapp',
      subject: data.subject ?? null,
      body: data.body ?? null,
      status: data.status ?? 'pending',
      deliveryStatus: data.deliveryStatus ?? null,
      providerReference: data.providerReference ?? null,
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      parent: data.parent ?? null,
      ...data
    });
  }
}
