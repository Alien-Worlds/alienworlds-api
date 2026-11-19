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
 * the queue is deleted or a node fails over); that is logged and ignored.
 */

export interface JobGuardLogger {
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface JobGuardOptions {
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
