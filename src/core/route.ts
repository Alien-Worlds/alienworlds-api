export type RouteHook = (...args: unknown[]) => void;
export type RouteValidator = (...args: unknown[]) => void;
export type RouteHandler = (...args: unknown[]) => void;

export type RouteOptions = {
  hooks?: {
    pre?: RouteHook;
    post?: RouteHook;
  };
  validators?: {
    request?: RouteValidator;
    response?: {
      [status: number]: RouteValidator;
    };
  };
};

export type RequestMethod = 'POST' | 'PUT' | 'DELETE' | 'GET';

export class Route {
  constructor(
    public readonly method: RequestMethod,
    public readonly path: string | string[],
    public readonly handler: RouteHandler,
    public readonly options?: RouteOptions
  ) {}
}
