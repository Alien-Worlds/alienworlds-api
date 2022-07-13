import 'reflect-metadata';

import { EosRpcSource } from '../eos-rpc.source';

describe('EosRpc source Unit tests', () => {
  it('"Token" should be set', () => {
    expect(EosRpcSource.Token).not.toBeNull();
  });
});
