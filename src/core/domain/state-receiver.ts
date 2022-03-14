import { TraceHandler } from 'handlers/trace-handler';

/**
 * StateReceiver factory.
 * @see {@link ioc.config.ts} for the usage
 *
 * @abstract
 * @class
 */
export abstract class StateReceiverFactory {
  public static Token = 'STATE_RECEIVER_FACTORY';
}

/**
 * Abstraction of the eosdac.io state receiver.
 *
 * @abstract
 * @class
 */
export abstract class StateReceiver {
  parseDate: () => void;
  registerBlockHandler: () => void;
  registerDoneHandler: (callback: (...args: unknown[]) => void) => void;
  registerTraceHandler: (traceHandler: TraceHandler) => void;
  registerDeltaHandler: () => void;
  registerProgressHandler: () => void;
  registerForkHandler: () => void;
  registerConnectedHandler: () => void;
  status: () => void;
  start: () => void;
  restart: () => void;
  destroy: () => void;
  requestBlocks: () => void;
  handleFork: () => void;
  receivedBlock: () => void;
}
