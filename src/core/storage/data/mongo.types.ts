import { AggregateOptions, Filter, FindOptions } from 'mongodb';

export type MongoAggregateArgs = {
  pipeline: object[];
  options?: AggregateOptions;
};

export type MongoFindQueryArgs<T> = {
  filter: Filter<T>;
  options?: FindOptions<Document>;
};
