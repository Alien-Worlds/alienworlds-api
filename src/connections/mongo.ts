const MongoClient = require('mongodb').MongoClient;


export async function connectMongo(config) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(config.url, {useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.error("\nFailed to connect\n", err);
                reject(err)
            } else if (client) {
                console.log(`Connected to mongo at ${config.url}`);
                console.log(`Got DB `)
                resolve(client.db(config.dbName))
            }
        });
    });
}


