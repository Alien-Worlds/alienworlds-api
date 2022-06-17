/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Failure } from '@core/architecture/domain/failure';
import { AbiHexFile } from '../../../data/abi-hex.dto';
import 'reflect-metadata';
import { AbiHexRepositoryImpl } from '../abi-hex.repository-impl';
import { AbiHex } from '../../../domain/entities/abi-hex';
import { MostRecentAbiHex } from '../../../domain/entities/most-recent-abi-hex';

jest.mock('../data-sources/abi.local.source');

let repository: AbiHexRepositoryImpl;

const localSourceMock = {
  load: jest.fn(),
  getMostRecentAbi: jest.fn(),
};

const abieosService = {
  loadAbiHex: jest.fn(),
  getTypeForAction: jest.fn(),
  getTypeForTable: jest.fn(),
  parseDataToJson: jest.fn(),
};

describe('AbiRepositoryImpl Unit tests', () => {
  beforeEach(() => {
    repository = new AbiHexRepositoryImpl(
      localSourceMock as any,
      abieosService as any
    );
  });

  afterEach(() => {
    localSourceMock.load.mockReset();
    localSourceMock.getMostRecentAbi.mockReset();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('"load" should return Result with an array of Abi objects', async () => {
    const dto: AbiHexFile = {
      contract: 'fake',
      block_num: '0',
      hex: 'fake-abi-hex',
      filename: 'fake-12345.hex',
    };
    localSourceMock.load.mockResolvedValue([dto]);
    const { content, failure } = await repository.load('');

    expect(content).toEqual([AbiHex.fromDto(dto)]);
    expect(failure).toBeUndefined();
  });

  it('"load" should return a Failure when abis loading fails', async () => {
    localSourceMock.load.mockRejectedValueOnce(new Error('soem error'));
    const { content, failure } = await repository.load('');

    expect(failure).toBeInstanceOf(Failure);
    expect(content).toBeUndefined();
  });

  it('"getMostRecentAbi" should return Failure when calling local source fails', async () => {
    localSourceMock.getMostRecentAbi.mockImplementation(() => {
      throw new Error('some error');
    });

    const { content, failure } = await repository.getMostRecentAbiHex(
      'foo',
      0n
    );

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });

  it('"getMostRecentAbi" should return the latest abi with "hasChanged" equal false when the loaded abi is equal to the current one', async () => {
    const dto: AbiHexFile = {
      contract: 'fake',
      block_num: '0',
      hex: 'fake-abi-hex',
      filename: 'fake-12345.hex',
    };
    //@ts-ignore
    repository.mostRecentAbi = MostRecentAbiHex.create(dto, false);

    localSourceMock.getMostRecentAbi.mockReturnValue(dto);

    localSourceMock.load.mockResolvedValue([dto]);
    const { content, failure } = await repository.getMostRecentAbiHex(
      'foo',
      0n
    );

    expect(content).toEqual(MostRecentAbiHex.create(dto, false));
    expect(failure).toBeUndefined();
  });

  it('"getMostRecentAbi" should return the latest abi with "hasChanged" equal true when the loaded abi is different than the current one', async () => {
    const currentDto: AbiHexFile = {
      contract: 'fake',
      block_num: '0',
      hex: 'fake-abi-hex',
      filename: 'fake-00000.hex',
    };
    const dto: AbiHexFile = {
      contract: 'fake',
      block_num: '0',
      hex: 'fake-abi-hex-2',
      filename: 'fake-12345.hex',
    };
    //@ts-ignore
    repository.mostRecentAbi = MostRecentAbiHex.create(currentDto, false);

    localSourceMock.getMostRecentAbi.mockReturnValue(dto);

    localSourceMock.load.mockResolvedValue([dto]);
    const { content, failure } = await repository.getMostRecentAbiHex(
      'foo',
      0n
    );

    expect(content).toEqual(MostRecentAbiHex.create(dto, true));
    expect(failure).toBeUndefined();
  });

  it('"updateAbi" should update ABI for the given account', () => {
    abieosService.loadAbiHex.mockImplementation(() => {});
    const { content, failure } = repository.uploadAbiHex('foo', 'bar');

    expect(content).toBeUndefined();
    expect(failure).toBeUndefined();
  });

  it('"updateAbi" should return a failure if update has failed', () => {
    abieosService.loadAbiHex.mockImplementation(() => {
      throw new Error();
    });
    const { content, failure } = repository.uploadAbiHex('foo', 'bar');

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
