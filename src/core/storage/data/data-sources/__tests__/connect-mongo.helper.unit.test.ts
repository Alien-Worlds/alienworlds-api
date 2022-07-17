import { connectMongo } from '../connect-mongo.helper';

const mockedDb = 'mockedDb';

jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => {
      return {
        connect: () => this,
        db: () => mockedDb,
      };
    }),
  };
});

describe('connectMongo Unit tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Should reject with error when the connection fails', async () => {
    connectMongo({ url: '', dbName: '' }).catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('Should resolve with Db instance when the connection is successful', async () => {
    const db = await connectMongo({
      url: 'mongodb://localhost:27017',
      dbName: 'UnitTest',
    });
    expect(db).toBe(mockedDb);
  });
});
