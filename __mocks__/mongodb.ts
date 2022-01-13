import {
    CreateIndexesOptions,
    MongoClientOptions,
    MongoClient as client,
    IndexSpecification
  } from 'mongodb';
  
  export const constructorSpy = jest.fn();
  export const databaseSpy = jest.fn();
  export const collectionSpy = jest.fn();
  export const createIndexSpy = jest.fn();
  export const insertOneSpy = jest.fn();
  export const findOneSpy = jest.fn();
  export const findSpy = jest.fn();
  export const updateOneSpy = jest.fn();
  export const deleteOneSpy = jest.fn();
  
  export class MongoClient {
    constructor(url: string, options?: MongoClientOptions) {
      constructorSpy(url, options);
    }
  
    async connect() {
      return 'mock-client';
    }
  }
  
  const mongoFunctionality = {
    insertOne: (payload: unknown) => {
      insertOneSpy(payload);
    },
    findOne: (payload: unknown) => {
      findOneSpy(payload);
    },
    find: (payload: unknown) => {
      findSpy(payload);
      return { toArray: () => {} };
    },
    updateOne: (identifier: unknown, payload: unknown) => {
      updateOneSpy(identifier, payload);
    },
    deleteOne: (payload: unknown) => {
      deleteOneSpy(payload);
    }
  };
  
  export const mockClient = {
    db: (database: string) => {
      databaseSpy(database);
      return {
        collection: (collection: string) => {
          collectionSpy(collection);
          return mongoFunctionality;
        },
        createIndex: async (
          collection: string,
          index: IndexSpecification,
          options: CreateIndexesOptions
        ) => {
          createIndexSpy(collection, index, options);
          return 'mock-index';
        }
      };
    }
  } as unknown as client;
  
  export interface MongodbSpies {
    constructorSpy: jest.Mock;
    databaseSpy: jest.Mock;
    collectionSpy: jest.Mock;
    createIndexSpy: jest.Mock;
    insertOneSpy: jest.Mock;
    findOneSpy: jest.Mock;
    findSpy: jest.Mock;
    updateOneSpy: jest.Mock;
    deleteOneSpy: jest.Mock;
  }
