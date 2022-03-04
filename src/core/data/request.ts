export interface Request<T = unknown> {
  body: T;
  params: object;
  query: object;
  header: object;
}
