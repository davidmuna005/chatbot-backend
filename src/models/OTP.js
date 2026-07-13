import { BaseModel } from './baseModel.js';

export class OTP extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      reference: data.reference ?? null,
      destination: data.destination ?? null,
      method: data.method ?? 'sms',
      codeHash: data.codeHash ?? null,
      expiresAt: data.expiresAt ?? null,
      isVerified: data.isVerified ?? false,
      attempts: data.attempts ?? 0,
      status: data.status ?? 'pending',
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      ...data
    });
  }
}
