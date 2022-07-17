import { Result } from '@core/architecture/domain/result';
import { Socket } from 'net';

export type Response<T = unknown> = {
  body?: T;
  status: number;
  type?: string;
  headers?: object;
  socket?: Socket;
};

export interface Request<T = unknown> {
  body: T;
  params: object;
  query: object;
  header: object;
}

export type RequestHooks = {
  pre?: (...args: unknown[]) => unknown;
  post?: (...args: unknown[]) => Response;
};

export type RequestValidators = {
  request?: (...args: unknown[]) => unknown;
  response?: {
    [status: number]: (...args: unknown[]) => unknown;
  };
};

export type RouteOptions = {
  hooks?: RequestHooks;
  validators?: RequestValidators;
};

export type RouteHandler = (...args: unknown[]) => Result;
