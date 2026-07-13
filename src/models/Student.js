import { BaseModel } from './baseModel.js';

export class Student extends BaseModel {
  constructor(data = {}) {
    super({
      id: data.id,
      studentId: data.studentId ?? data.id,
      applicationUserId: data.applicationUserId ?? null,
      parentId: data.parentId ?? null,
      admissionNumber: data.admissionNumber ?? null,
      name: data.name ?? null,
      status: data.status ?? 'active',
      isDeleted: data.isDeleted ?? false,
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      deletedAt: data.deletedAt ?? null,
      parent: data.parent ?? null,
      ...data
    });
  }
}
