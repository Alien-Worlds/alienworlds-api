import 'reflect-metadata';

import { MessagingSource } from '../messaging.source';

describe('Messaging source Unit tests', () => {
  it('"Token" should be set', () => {
    expect(MessagingSource.Token).not.toBeNull();
  });
});
