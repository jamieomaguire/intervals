export class Interval {
  constructor(name, duration) {
      this.name = name;
      this.duration = duration;
  }

  toJSON() {
      return {
          name: this.name,
          duration: this.duration
      };
  }

  static fromJSON(json) {
      return new Interval(json.name, json.duration);
  }
}
