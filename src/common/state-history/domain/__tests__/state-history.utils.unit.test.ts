/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Serialize } from 'eosjs';
import { deserializeMessage, serializeMessage } from '../state-history.utils';

jest.mock('eosjs');

const SerialBufferMock = Serialize.SerialBuffer as jest.MockedClass<
  typeof Serialize.SerialBuffer
>;

const type = {
  name: 'foo',
  aliasOfName: 'foo',
  arrayOf: {},
  optionalOf: {},
  baseName: 'foo',
  base: {},
  fields: [],
  serialize: jest.fn(),
  deserialize: jest.fn(),
};

const typesByName = new Map([['foo', type]]);

describe('State History Service Unit tests', () => {
  it('"serializeMessage" should return buffer as Uint8Array', () => {
    SerialBufferMock.prototype.asUint8Array.mockReturnValue(
      Uint8Array.from([])
    );
    (Serialize.getType as any) = jest.fn().mockReturnValue(type);

    const result = serializeMessage('foo', '', typesByName as any);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('"deserializeMessage" should return deserialized data', () => {
    const data = { versions: '1.0' };
    const readPos = 18;
    const encoded = new TextEncoder().encode(JSON.stringify(data));

    type.deserialize.mockReturnValue(data);
    SerialBufferMock.prototype.asUint8Array.mockReturnValue(encoded);
    SerialBufferMock.prototype.readPos = readPos;
    (Serialize.getType as any) = jest.fn().mockReturnValue(type);

    const result = deserializeMessage('foo', encoded, typesByName as any);
    expect(result).toEqual(data);
  });
});
