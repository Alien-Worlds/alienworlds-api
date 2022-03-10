import { config, Config } from '@config';
import { BlocksRange } from '../blocks-range';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

describe('BlocksRange Unit tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Should create instance of BlockRange with default values', () => {
    configMock.startBlock = 100;
    configMock.endBlock = 200;

    const range = BlocksRange.create();
    expect(range).toBeInstanceOf(BlocksRange);
    expect(range.start).toEqual(configMock.startBlock);
    expect(range.end).toEqual(configMock.endBlock);
  });

  it('Should create instance of BlockRange with given values', () => {
    configMock.startBlock = NaN;
    configMock.startBlock = NaN;
    const range = BlocksRange.create(100, 200);
    expect(range).toBeInstanceOf(BlocksRange);
    expect(range.start).toEqual(100);
    expect(range.end).toEqual(200);
  });
});
