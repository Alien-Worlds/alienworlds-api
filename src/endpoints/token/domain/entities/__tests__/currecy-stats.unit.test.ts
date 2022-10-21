import { CurrencyStats } from '../currecy-stats';

describe('CurrencyStats instance Unit tests', () => {
  it('', () => {
    const stats = CurrencyStats.fromDto({
      TLM: { supply: 'foo', max_supply: 'bar', issuer: 'baz' },
    });

    expect(stats).toEqual({ supply: 'foo', maxSupply: 'bar', issuer: 'baz' });
  });
});
