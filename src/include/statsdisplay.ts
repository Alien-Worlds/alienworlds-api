export class StatsDisplay {
  interval: number;
  buckets: object;

  constructor(interval = 5) {
    this.interval = interval; // 5 second buckets
    setInterval(() => {
      this.display();
    }, this.interval * 1000);
    this.buckets = {};
  }

  add(name, count = 1) {
    if (typeof this.buckets[name] === 'undefined') {
      this.buckets[name] = 0;
    }
    this.buckets[name] += count;
  }

  display() {
    const items = [];
    for (const name in this.buckets) {
      const rate = (this.buckets[name] / this.interval).toFixed(2);
      items.push(`${name} : ${rate}/s`);
      this.buckets[name] = 0;
    }
    const str = `[${process.pid}] ` + items.join(' | ') || 'No data';
    console.log(str);
  }
}
