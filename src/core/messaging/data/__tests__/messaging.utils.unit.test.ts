import { wait } from '../messaging.utils';

describe('Messaging Utils Unit tests', () => {
  it('"wait" should be resolved after a certain amount of time', async () => {
    await expect(wait(1000)).resolves.toBe(undefined);
  });
});
