import 'reflect-metadata';

import abieos from '@eosrio/node-abieos';
import { AbiEosService } from '../abieos.service';

jest.mock(
  '@eosrio/node-abieos',
  jest.fn(() => ({
    bin_to_json: jest.fn(),
    get_type_for_table: jest.fn(),
    load_abi_hex: jest.fn(),
    get_type_for_action: jest.fn(),
  }))
);
const abieosMock = abieos as jest.MockedObject<typeof abieos>;

describe('AbieosService Unit tests', () => {
  it('"Token" should be set', () => {
    expect(AbiEosService.Token).not.toBeNull();
  });

  it('"getTypeForAction" should call get_type_for_action', () => {
    const service = new AbiEosService();
    service.getTypeForAction('', '');

    expect(abieosMock.get_type_for_action).toBeCalled();
  });

  it('"loadAbiHex" should call load_abi_hex', () => {
    const service = new AbiEosService();
    service.loadAbiHex('', '');

    expect(abieosMock.load_abi_hex).toBeCalled();
  });

  it('"getTypeForTable" should call get_type_for_table', () => {
    const service = new AbiEosService();
    service.getTypeForTable('', '');

    expect(abieosMock.get_type_for_table).toBeCalled();
  });

  it('"parseDataToJson" should call bin_to_json', () => {
    const service = new AbiEosService();
    service.parseDataToJson('', '', Buffer.from(''));

    expect(abieosMock.bin_to_json).toBeCalled();
  });
});
