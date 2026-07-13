import { BaseModel } from './baseModel.js';

export class ServiceRequest extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      parentId: data.parentId ?? null,
      studentId: data.studentId ?? null,
      type: data.type ?? 'general',
      subject: data.subject ?? null,
      payload: data.payload ?? {},
      status: data.status ?? 'pending',
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      parent: data.parent ?? null,
      student: data.student ?? null,
      ...data
    });
  }
}
