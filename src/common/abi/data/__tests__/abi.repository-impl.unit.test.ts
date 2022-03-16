/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Abi } from '@common/abi/domain/entities/abi';
import { MostRecentAbi } from '@common/abi/domain/entities/most-recent-abi';
import { Failure } from '@core/domain/failure';
import 'reflect-metadata';
import { AbiDto } from '../abi.dtos';
import { AbiRepositoryImpl } from '../abi.repository-impl';
import { AbiLocalSource } from '../data-sources/abi.local.source';

jest.mock('../data-sources/abi.local.source');

let repository: AbiRepositoryImpl;
let localSourceMock: jest.MockedObject<AbiLocalSource>;

describe('AbiRepositoryImpl Unit tests', () => {
  beforeEach(() => {
    repository = new AbiRepositoryImpl();
    localSourceMock = (<any>repository)
      .localSource as jest.MockedObject<AbiLocalSource>;
  });

  afterEach(() => {
    localSourceMock.load.mockReset();
    localSourceMock.getMostRecentAbi.mockReset();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('"load" should return Result with an array of Abi objects', async () => {
    const dto: AbiDto = {
      contract: 'fake',
      block_num: '0',
      abi_hex: 'fake-abi-hex',
      filename: 'fake-12345.hex',
    };
    localSourceMock.load.mockResolvedValue([dto]);
    const { content, failure } = await repository.load();

    expect(content).toEqual([Abi.fromDto(dto)]);
    expect(failure).toBeUndefined();
  });

  it('"load" should return a Failure when abis loading fails', async () => {
    localSourceMock.load.mockRejectedValueOnce(new Error('soem error'));
    const { content, failure } = await repository.load();

    expect(failure).toBeInstanceOf(Failure);
    expect(content).toBeUndefined();
  });

  it('"getMostRecentAbi" should return Failure when calling local source fails', async () => {
    localSourceMock.getMostRecentAbi.mockImplementation(() => {
      throw new Error('some error');
    });

    const { content, failure } = await repository.getMostRecentAbi('foo', 0n);

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });

  it('"getMostRecentAbi" should return the latest abi with "hasChanged" equal false when the loaded abi is equal to the current one', async () => {
    const dto: AbiDto = {
      contract: 'fake',
      block_num: '0',
      abi_hex: 'fake-abi-hex',
      filename: 'fake-12345.hex',
    };
    //@ts-ignore
    repository.mostRecentAbi = MostRecentAbi.create(dto, false);

    localSourceMock.getMostRecentAbi.mockReturnValue(dto);

    localSourceMock.load.mockResolvedValue([dto]);
    const { content, failure } = await repository.getMostRecentAbi('foo', 0n);

    expect(content).toEqual(MostRecentAbi.create(dto, false));
    expect(failure).toBeUndefined();
  });

  it('"getMostRecentAbi" should return the latest abi with "hasChanged" equal true when the loaded abi is different than the current one', async () => {
    const currentDto: AbiDto = {
      contract: 'fake',
      block_num: '0',
      abi_hex: 'fake-abi-hex',
      filename: 'fake-00000.hex',
    };
    const dto: AbiDto = {
      contract: 'fake',
      block_num: '0',
      abi_hex: 'fake-abi-hex-2',
      filename: 'fake-12345.hex',
    };
    //@ts-ignore
    repository.mostRecentAbi = MostRecentAbi.create(currentDto, false);

    localSourceMock.getMostRecentAbi.mockReturnValue(dto);

    localSourceMock.load.mockResolvedValue([dto]);
    const { content, failure } = await repository.getMostRecentAbi('foo', 0n);

    expect(content).toEqual(MostRecentAbi.create(dto, true));
    expect(failure).toBeUndefined();
  });
});
