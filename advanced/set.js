export class Set {
  constructor(rounds) {
      this.rounds = rounds;
      this.intervals = [];
      this.rest = 0;
  }

  addInterval(interval) {
      this.intervals.push(interval);
  }

  setRest(rest) {
      this.rest = rest;
  }

  toJSON() {
      return {
          rounds: this.rounds,
          intervals: this.intervals.map(interval => interval.toJSON()),
          rest: this.rest
      };
  }

  static fromJSON(json) {
      const set = new Set(json.rounds);
      set.rest = json.rest;
      set.intervals = json.intervals.map(Interval.fromJSON);
      return set;
  }
}
