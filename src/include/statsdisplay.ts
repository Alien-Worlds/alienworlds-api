/**
 * StatsDisplay class
 *
 * @class
 */
export class StatsDisplay {
  private interval: number;
  private buckets: Map<string, number>;

  /**
   * Create instance of the StatsDisplay class and
   * set the interval at which the display method is invoked.
   *
   * @param {number} [interval=5]
   */
  constructor(interval = 5) {
    this.interval = interval; // 5 second buckets
    this.buckets = new Map();
    setInterval(() => {
      this.display();
    }, this.interval * 1000);
  }

  /**
   * Add an entry to the statistics or increase
   * the number of appearances if it was previously recorded.
   *
   * @param {string} name
   * @param {number} [count=1]
   */
  public add(name: string, count = 1) {
    const currentCount = this.buckets.get(name);
    if (isNaN(currentCount)) {
      this.buckets.set(name, 0);
    } else {
      this.buckets.set(name, currentCount + count);
    }
  }

  /**
   * Build log message
   *
   * @param {string} name
   * @param {number} count
   * @param {number} interval
   * @returns {string}
   */
  private buildLogMessage(
    name: string,
    count: number,
    interval: number
  ): string {
    const rate = (count / interval).toFixed(2);
    return `${name} : ${rate}/s`;
  }

  /**
   * Show statistics and reset "count" values
   *
   * @private
   */
  private display() {
    const items = [];

    this.buckets.forEach((count: number, name: string) => {
      items.push(this.buildLogMessage(name, count, this.interval));
      this.buckets.set(name, 0);
    });

    console.log(`[${process.pid}] ${items.join(' | ') || 'No data'}`);
  }
}
