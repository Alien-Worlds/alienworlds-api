/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { AbiHexFile } from '../../../data/abi-hex.dto';
import { AbiHexRepositoryImpl } from '../abi-hex.repository-impl';
import { AbiHex } from '../../../domain/entities/abi-hex';
import { MostRecentAbiHex } from '../../../domain/entities/most-recent-abi-hex';

jest.mock('../../data-sources/abi-hex.local.source');

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
    repository.mostRecentAbiHex = MostRecentAbiHex.create(dto, false);
    //@ts-ignore
    repository.abisByContracts = new Map([['fake', [AbiHex.fromDto(dto)]]]);

    localSourceMock.load.mockResolvedValue([dto]);
    const { content, failure } = await repository.getMostRecentAbiHex(
      'fake',
      2n
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
    repository.mostRecentAbiHex = MostRecentAbiHex.create(currentDto, false);
    //@ts-ignore
    repository.abisByContracts = new Map([['fake', [AbiHex.fromDto(dto)]]]);

    const { content, failure } = await repository.getMostRecentAbiHex(
      'fake',
      2n
    );

    expect(content).toEqual(MostRecentAbiHex.create(dto, true));
    expect(failure).toBeUndefined();
  });

  it('"getMostRecentAbi" should return a failure on any error', async () => {
    const dto: AbiHexFile = {
      contract: 'fake',
      block_num: '0',
      hex: 'fake-abi-hex-2',
      filename: 'fake-12345.hex',
    };
    //@ts-ignore
    repository.mostRecentAbiHex = MostRecentAbiHex.create(dto, false);
    //@ts-ignore
    repository.abisByContracts = new Map([['fake', [AbiHex.fromDto(dto)]]]);

    MostRecentAbiHex.create = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    const { failure } = await repository.getMostRecentAbiHex('fake', 2n);

    expect(failure).toBeInstanceOf(Failure);
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

  // it('"getMostRecentAbi" should throw an error when Abi was not found for given account', async () => {
  //   try {
  //     const source = new AbiHexLocalSource();
  //     await source.getMostRecentAbiHex('foo', 0n);
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(AbiHexNotFoundError);
  //   }
  // });

  // it('"getMostRecentAbi" should return most recent abi when fromCurrentBlock is true', async () => {
  //   const source = new AbiHexLocalSource();
  //   //@ts-ignore
  //   source.abisByContracts.set('foo', [
  //     { block_num: 0 } as any,
  //     { block_num: 1 } as any,
  //     { block_num: 2 } as any,
  //     { block_num: 3 } as any,
  //   ]);

  //   const abi = source.getMostRecentAbiHex('foo', 2n, true);
  //   expect(abi.block_num).toEqual(2);
  // });

  // it('"getMostRecentAbi" should return most recent abi when fromCurrentBlock is false', async () => {
  //   const source = new AbiHexLocalSource();
  //   //@ts-ignore
  //   source.abisByContracts.set('foo', [
  //     { block_num: 0 } as any,
  //     { block_num: 1 } as any,
  //     { block_num: 2 } as any,
  //     { block_num: 3 } as any,
  //   ]);

  //   const abi = source.getMostRecentAbiHex('foo', 2n, false);
  //   expect(abi.block_num).toEqual(1);
  // });
});
