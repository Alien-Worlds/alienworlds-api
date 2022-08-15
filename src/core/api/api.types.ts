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
  query: T;
  header: object;
}

export type RequestHooks = {
  pre?: (...args: unknown[]) => unknown;
  post?: (...args: unknown[]) => Response;
};

export type ValidationResult = {
  valid: boolean;
  message?: string;
  code?: number;
};

export type Validators = {
  request?: (...args: unknown[]) => ValidationResult;
  response?: {
    [status: number]: (...args: unknown[]) => ValidationResult;
  };
};

export type RouteOptions = {
  hooks?: RequestHooks;
  validators?: Validators;
};

export type RouteHandler = (...args: unknown[]) => Result;
