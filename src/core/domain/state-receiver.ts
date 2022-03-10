import { TraceHandler } from 'handlers/trace-handler';

export abstract class StateReceiverFactory {
  public static Token = 'STATE_RECEIVER_FACTORY';
}

export abstract class StateReceiver {
  parseDate: () => void;
  registerBlockHandler: () => void;
  registerDoneHandler: () => void;
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
