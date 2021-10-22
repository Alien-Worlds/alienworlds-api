#!/usr/bin/env node

import { connectMongo } from './connections/mongo';
import { config } from './config';
import { Amq } from './connections/amq';

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitForMongo = async (): Promise<any> => {
  await connectMongo(config.mongo);
  console.log('connected to mongo:');
};

export const waitForRabbitMQ = async (): Promise<any> => {
  const amq = new Amq(config);
  await amq.init();
  console.log('connected to RabbitMQ - check something here.');
};

export const wait = () => {
  return waitForDependencies(
    [waitForMongo, waitForRabbitMQ],
    5000,
    async () => {
      await console.log('completed');
    }
  );
};

export const waitForDependencies = async (
  tests: (() => Promise<any>)[],
  timeDelay: number,
  completion: () => Promise<any>
) => {
  let index = 0;
  while (index < tests.length) {
    try {
      const test = tests[index]();
      console.log('About to satisfy dependency: ', index);

      await test;
      index++;
    } catch (e) {
      console.log(
        'Error occurred while waiting for promise at index: ',
        index,
        ' error: ',
        e.message
      );
      await sleep(timeDelay);
    }
  }
  console.log('Dependencies all satisfied...');
  await completion();
};

(async () => {
  await wait();
})();
