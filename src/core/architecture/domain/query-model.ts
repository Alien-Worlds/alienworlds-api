export abstract class QueryModel<T = unknown> {
  public abstract toQueryParams(...args: unknown[]): T;
}
