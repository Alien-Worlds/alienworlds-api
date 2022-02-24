import { Db, MongoClient } from 'mongodb';
import { MongoConfig } from '../config/config.types';

/**
 * Connect to mongo database
 *
 * @async
 * @param {MongoConfig} config
 * @returns {Db} - database instance
 */
export const connectMongo = async (config: MongoConfig): Promise<Db> => {
  const { url, dbName } = config;
  const client = new MongoClient(url);

  await client.connect();
  return client.db(dbName);
};
