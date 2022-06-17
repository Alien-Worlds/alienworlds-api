export type WorkerMessageOptions = {
  pid: number;
  type: string;
  name: string;
  content?: unknown;
  error?: Error;
};

export type WorkerMessageHandler = (message: WorkerMessage) => void;

export class WorkerMessage {
  public static create({
    pid,
    type,
    name,
    content,
    error,
  }: WorkerMessageOptions) {
    let errorJson;
    if (error) {
      const { message, stack, name: errorName, ...rest } = error;
      errorJson = {
        message,
        stack,
        name: errorName,
        ...rest,
      };
    }

    return new WorkerMessage(pid, type, name, content, errorJson);
  }

  private constructor(
    public readonly pid: number,
    public readonly type: string,
    public readonly name: string,
    public readonly content: unknown,
    public readonly error: Error
  ) {}

  public toJson(): object {
    const { pid, type, name, content, error } = this;

    return {
      pid,
      type,
      name,
      content,
      error,
    };
  }
}

export enum WorkerMessageType {
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
  Task = 'task',
}
