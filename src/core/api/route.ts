import { RequestMethod } from './api.enums';
import { RouteHandler, RouteOptions } from './api.types';

export class Route {
  constructor(
    public readonly method: RequestMethod,
    public readonly path: string | string[],
    public readonly handler: RouteHandler,
    public readonly options?: RouteOptions
  ) {}
}

export class GetRoute extends Route {
  constructor(
    public readonly path: string | string[],
    public readonly handler: RouteHandler,
    public readonly options?: RouteOptions
  ) {
    super(RequestMethod.Get, path, handler, options);
  }
}

export class PostRoute extends Route {
  constructor(
    public readonly path: string | string[],
    public readonly handler: RouteHandler,
    public readonly options?: RouteOptions
  ) {
    super(RequestMethod.Post, path, handler, options);
  }
}

export class PutRoute extends Route {
  constructor(
    public readonly path: string | string[],
    public readonly handler: RouteHandler,
    public readonly options?: RouteOptions
  ) {
    super(RequestMethod.Put, path, handler, options);
  }
}

export class DeleteRoute extends Route {
  constructor(
    public readonly path: string | string[],
    public readonly handler: RouteHandler,
    public readonly options?: RouteOptions
  ) {
    super(RequestMethod.Delete, path, handler, options);
  }
}
