import { Socket } from 'net';

export interface Response<T = unknown> {
  body: T;
  status: number;
  type: string;
  headers: object;
  socket: Socket;
}
