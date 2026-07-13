export class BaseModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static from(data = {}) {
    return new this(data);
  }

  toJSON() {
    return { ...this };
  }
}
