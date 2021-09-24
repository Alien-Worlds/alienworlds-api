import { MongoClient } from 'mongodb';
export interface ConnectMongoConfig {
  url: string;
  dbName: string;
}

export async function connectMongo(config: ConnectMongoConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      config.url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err: any, client: any) => {
        if (err) {
          console.error('\nFailed to connect\n', err);
          reject(err);
        } else if (client) {
          console.log(`Connected to mongo at ${config.url}`);
          console.log(`Got DB `);
          resolve(client.db(config.dbName));
        }
      }
    );
  });
}
