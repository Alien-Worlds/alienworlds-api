const MongoClient = require('mongodb').MongoClient;

export async function connectMongo(config) {
  try {
    const client = await MongoClient.connect(config.url);
    console.log(`Connected to mongo at ${config.url}`);
    console.log(`Got DB `);
    return client.db(config.dbName);
  } catch (err) {
    console.error('\nFailed to connect\n', err);
    throw err;
  }
}
