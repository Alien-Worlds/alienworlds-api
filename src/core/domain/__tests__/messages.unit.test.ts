import { Messages } from '../messages';

describe('Messages instance Unit tests', () => {
  it('"Token" should be set', () => {
    expect(Messages.Token).not.toBeNull();
  });
});
