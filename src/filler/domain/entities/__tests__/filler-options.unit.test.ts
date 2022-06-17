import { Config, config } from '../../../../config';
import { FillerOptions } from '../filler-options';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

describe('FillerOptions Unit tests', () => {
  it('Should create instance of FillerOptions with default config values', () => {
    configMock.startBlock = 100;
    configMock.endBlock = 200;

    const range = FillerOptions.fromOptionValues({});
    expect(range).toBeInstanceOf(FillerOptions);
    expect(range.startBlock).toEqual(configMock.startBlock);
    expect(range.endBlock).toEqual(configMock.endBlock);
    expect(range.test).toEqual(0);
    expect(range.replay).toEqual(false);
  });

  it('Should create instance of FillerOptions with given values', () => {
    configMock.startBlock = NaN;
    configMock.endBlock = NaN;
    const options = {
      startBlock: 0n,
      endBlock: 0n,
      test: 10,
      replay: true,
      continueWithFiller: true,
    };
    const range = FillerOptions.fromOptionValues(options);
    expect(range).toBeInstanceOf(FillerOptions);
    expect(range.startBlock).toEqual(options.startBlock);
    expect(range.endBlock).toEqual(options.endBlock);
    expect(range.test).toEqual(options.test);
    expect(range.replay).toEqual(options.replay);
  });
});
