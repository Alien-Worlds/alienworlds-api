/* eslint-disable no-unused-vars */
/**
 * Wraps a RabbitMQ job handler so that nothing it throws can kill the worker.
 *
 * amqplib calls the consumer callback and ignores what it returns, so an exception or a
 * rejected promise from the handler is unhandled and, on Node 15 and later, terminates the
 * process. In a cluster worker that silently removes its consumers (see worker-supervisor.ts).
 *
 * If the handler throws, the error is logged, and unless the job was already acked or rejected
 * (Amq marks it with `__settled`), it is put back on the queue after `retryDelayMs`. The delay
 * stops a job that can never succeed from being redelivered in a tight loop. Settling a job twice
 * would make RabbitMQ close the whole channel, so a settled job is left alone.
 *
 * RabbitMQ also calls the callback with `null` when it cancels the consumer (for example when
 * the queue is deleted or a node fails over). That is logged and `onCancel` is called, because
 * the consumer is gone and nothing else would notice.
 */

export interface JobGuardLogger {
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface JobGuardOptions {
  /**
   * Called when RabbitMQ cancels the consumer (it sends a `null` job). The consumer is gone
   * for good: neither the AMQP reconnection nor the worker supervision notices, so the owner
   * must act, normally by exiting so the supervisor starts a worker that subscribes again.
   */
  onCancel?: () => void;
  retryDelayMs?: number;
  log?: JobGuardLogger;
  sleep?: (ms: number) => Promise<void>;
}

export function guardJobHandler(
  name: string,
  handler: (job: any) => Promise<any> | any,
  amq: { reject: (job: any) => Promise<any> },
  options: JobGuardOptions = {}
) {
  const retryDelayMs = options.retryDelayMs ?? 1000;
  const log = options.log || console;
  const sleep =
    options.sleep ||
    ((ms: number) => new Promise(resolve => setTimeout(resolve, ms)));

  return async (job: any): Promise<void> => {
    if (!job) {
      log.warn(`The ${name} consumer was cancelled by the server`);
      if (options.onCancel) {
        options.onCancel();
      }
      return;
    }
    try {
      await handler(job);
    } catch (e) {
      log.error(
        `Unhandled error in the ${name} job handler: ${
          e && e.stack ? e.stack : e
        }`
      );
      if (job.__settled) {
        return;
      }
      try {
        await sleep(retryDelayMs);
        if (!job.__settled) {
          await amq.reject(job);
        }
      } catch (rejectError) {
        log.error(
          `Could not return the ${name} job to the queue: ${
            rejectError && rejectError.message
          }`
        );
      }
    }
  };
}

/**
 * Returns an `onCancel` for guardJobHandler that makes the process exit (once, however many of
 * its consumers are cancelled together), so the worker supervisor starts a replacement that
 * subscribes again. Unsettled jobs go back on the queue by themselves when the process dies.
 */
export function exitOnConsumerCancel(
  log: JobGuardLogger = console,
  exit: (code: number) => void = code => process.exit(code)
) {
  let exiting = false;
  return () => {
    if (exiting) {
      return;
    }
    exiting = true;
    log.error(
      'RabbitMQ cancelled a consumer; exiting so that the worker is restarted and subscribes again'
    );
    exit(1);
  };
}
