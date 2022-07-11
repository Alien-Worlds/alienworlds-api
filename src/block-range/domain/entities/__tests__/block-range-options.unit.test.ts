import { Config, config } from '@config';
import { BlockRangeOptions } from '../block-range-options';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

describe('BlockRangeOptions Unit tests', () => {
  it('Should create instance of BlockRangeOptions with default config values', () => {
    configMock.blockRangeScan.scanKey = 'test';

    const range = BlockRangeOptions.fromOptionValues({});
    expect(range).toBeInstanceOf(BlockRangeOptions);
    expect(range.scanKey).toEqual(configMock.blockRangeScan.scanKey);
  });

  it('Should create instance of BlockRangeOptions with given values', () => {
    configMock.blockRangeScan.scanKey = null;

    const options = {
      scanKey: 'fake_test',
    };
    const range = BlockRangeOptions.fromOptionValues(options);
    expect(range).toBeInstanceOf(BlockRangeOptions);
    expect(range.scanKey).toEqual(options.scanKey);
  });
});
