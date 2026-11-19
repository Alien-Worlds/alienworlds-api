/* eslint-disable no-unused-vars */
/**
 * Keeps cluster workers alive.
 *
 * Node's cluster module does not restart a worker that exits. Without this, a worker that
 * crashes (an uncaught exception, an unhandled rejection, process.exit) just disappears:
 * the master stays up, logs nothing new, and the process looks healthy while it has no
 * consumers left on its RabbitMQ queues.
 *
 * Each worker is spawned with a role. When it exits, a new worker with the same role and the
 * same message handler is started after a delay, and the exit is logged with its code and
 * signal. The delay doubles for each exit in a row of a role (a crash loop), up to a limit,
 * and resets once a worker of that role has stayed up for `stableMs`.
 *
 * `cluster`, the timer and the clock are injected so this can be tested without forking.
 */

export interface SupervisorLogger {
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface SupervisorOptions {
  log?: SupervisorLogger;
  /** First restart delay, in ms. Doubled for each exit in a row. */
  baseDelayMs?: number;
  /** Longest restart delay, in ms. */
  maxDelayMs?: number;
  /** A worker that stays up this long counts as healthy and resets the delay. */
  stableMs?: number;
  setTimeoutFn?: (fn: () => void, ms: number) => any;
  now?: () => number;
}

export type WorkerMessageHandler = (worker: any, message: any) => void;

interface WorkerEntry {
  role: string;
  handler?: WorkerMessageHandler;
  startedAt: number;
}

export class WorkerSupervisor {
  private entries = new Map<number, WorkerEntry>();
  private exitsInARow = new Map<string, number>();
  private stopped = false;
  private log: SupervisorLogger;
  private baseDelayMs: number;
  private maxDelayMs: number;
  private stableMs: number;
  private setTimeoutFn: (fn: () => void, ms: number) => any;
  private now: () => number;

  constructor(private cluster: any, options: SupervisorOptions = {}) {
    this.log = options.log || console;
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 30000;
    this.stableMs = options.stableMs ?? 60000;
    this.setTimeoutFn = options.setTimeoutFn || setTimeout;
    this.now = options.now || Date.now;
  }

  /** Starts watching for worker exits. Call once, before spawning. */
  start() {
    this.cluster.on(
      'exit',
      (worker: any, code: number | null, signal: string | null) =>
        this.onExit(worker, code, signal)
    );
  }

  /** Stops restarting workers (for a clean shutdown). */
  stop() {
    this.stopped = true;
  }

  /** Forks a worker with a role. `handler` receives its messages, and those of its replacements. */
  spawn(role: string, handler?: WorkerMessageHandler) {
    const worker = this.cluster.fork();
    this.entries.set(worker.id, { role, handler, startedAt: this.now() });
    if (handler) {
      worker.on('message', (message: any) => handler(worker, message));
    }
    return worker;
  }

  private onExit(worker: any, code: number | null, signal: string | null) {
    const entry = this.entries.get(worker.id);
    if (!entry) {
      return; // not one of ours
    }
    this.entries.delete(worker.id);

    const livedMs = this.now() - entry.startedAt;
    const inARow =
      livedMs >= this.stableMs
        ? 1
        : (this.exitsInARow.get(entry.role) || 0) + 1;
    this.exitsInARow.set(entry.role, inARow);

    const delayMs = Math.min(
      this.maxDelayMs,
      this.baseDelayMs * Math.pow(2, inARow - 1)
    );
    const pid = worker.process && worker.process.pid;
    const what = `Worker ${worker.id} (${entry.role}, pid ${pid}) exited with code ${code}, signal ${signal} after ${livedMs}ms`;

    if (this.stopped) {
      this.log.warn(`${what}; not restarting (shutting down)`);
      return;
    }
    this.log.error(`${what}; restarting in ${delayMs}ms`);

    this.setTimeoutFn(() => {
      if (!this.stopped) {
        this.spawn(entry.role, entry.handler);
      }
    }, delayMs);
  }
}
