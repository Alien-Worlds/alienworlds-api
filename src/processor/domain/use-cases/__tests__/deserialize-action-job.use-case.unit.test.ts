/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { DeserializeActionJobUseCase } from '../deserialize-action-job.use-case';
import { GetMostRecentAbiHexUseCase } from '../get-most-recent-abi-hex.use-case';
import { UploadAbiHexUseCase } from '../upload-abi-hex.use-case';
import { ParseDataToJsonUseCase } from '@common/abi/domain/use-cases/parse-data-to-json.use-case';

const getMostRecentAbiHexUseCaseMock = {
  execute: jest.fn(),
};
const uploadAbiHexUseCaseMock = {
  execute: jest.fn(),
};
const parseDataToJsonUseCaseMock = {
  execute: jest.fn(),
};

let container: Container;
let useCase: DeserializeActionJobUseCase;

describe('DeserializeActionJobUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetMostRecentAbiHexUseCase>(GetMostRecentAbiHexUseCase.Token)
      .toConstantValue(getMostRecentAbiHexUseCaseMock as any);
    container
      .bind<UploadAbiHexUseCase>(UploadAbiHexUseCase.Token)
      .toConstantValue(uploadAbiHexUseCaseMock as any);
    container
      .bind<ParseDataToJsonUseCase>(ParseDataToJsonUseCase.Token)
      .toConstantValue(parseDataToJsonUseCaseMock as any);
    container
      .bind<DeserializeActionJobUseCase>(DeserializeActionJobUseCase.Token)
      .to(DeserializeActionJobUseCase);
  });

  beforeEach(() => {
    useCase = container.get<DeserializeActionJobUseCase>(
      DeserializeActionJobUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(DeserializeActionJobUseCase.Token).not.toBeNull();
  });

  it('Should deserialize job data from current block when deserialization without the specified block has failed', async () => {
    const deserializeJobDataMock = jest
      .spyOn(useCase as any, 'deserializeJobData')
      .mockImplementation(() =>
        Result.withFailure(Failure.withMessage('FAIL'))
      );

    await useCase.execute({} as any);

    expect(deserializeJobDataMock).toBeCalledTimes(2);

    deserializeJobDataMock.mockClear();
  });

  it('Should result deserialized with content', async () => {
    const deserializeJobDataMock = jest
      .spyOn(useCase as any, 'deserializeJobData')
      .mockImplementation(() => Result.withFailure(Failure.withMessage('FAIL')))
      .mockImplementation(() => Result.withContent({}));

    const result = await useCase.execute({} as any);

    expect(result.content).toEqual({});
    expect(result.failure).toBeUndefined();

    deserializeJobDataMock.mockClear();
  });

  it('"deserializeJobData" should result with failure when getting most recent abi hex has failed', async () => {
    const job = {
      account: 'foo.account',
      name: 'foo.name',
      blockNumber: 0n,
      data: Buffer.from([]),
    };

    getMostRecentAbiHexUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );

    const result = await (useCase as any).deserializeJobData(job, false);

    expect(getMostRecentAbiHexUseCaseMock.execute).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);

    getMostRecentAbiHexUseCaseMock.execute.mockClear();
  });

  it('"deserializeJobData" should result with failure when uploading abi has failed', async () => {
    const job = {
      account: 'foo.account',
      name: 'foo.name',
      blockNumber: 0n,
      data: Buffer.from([]),
    };

    getMostRecentAbiHexUseCaseMock.execute.mockImplementation(() =>
      Result.withContent({ hasChanged: true, data: { hex: 'foo.hex' } })
    );
    uploadAbiHexUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );

    const result = await (useCase as any).deserializeJobData(job, false);

    expect(uploadAbiHexUseCaseMock.execute).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);

    getMostRecentAbiHexUseCaseMock.execute.mockClear();
    uploadAbiHexUseCaseMock.execute.mockClear();
  });

  it('"deserializeJobData" should result with failure when parsing data has failed', async () => {
    const job = {
      account: 'foo.account',
      name: 'foo.name',
      blockNumber: 0n,
      data: Buffer.from([]),
    };

    getMostRecentAbiHexUseCaseMock.execute.mockImplementation(() =>
      Result.withContent({ hasChanged: true, data: { hex: 'foo.hex' } })
    );
    uploadAbiHexUseCaseMock.execute.mockImplementation(() =>
      Result.withContent({})
    );
    parseDataToJsonUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('Fail'))
    );

    const result = await (useCase as any).deserializeJobData(job, false);

    expect(parseDataToJsonUseCaseMock.execute).toBeCalled();
    expect(result.failure).toBeInstanceOf(Failure);

    getMostRecentAbiHexUseCaseMock.execute.mockClear();
    uploadAbiHexUseCaseMock.execute.mockClear();
    parseDataToJsonUseCaseMock.execute.mockClear();
  });

  it('"deserializeJobData" should result with failure when parsing data has failed', async () => {
    const job = {
      account: 'foo.account',
      name: 'foo.name',
      blockNumber: 0n,
      data: Buffer.from([]),
    };

    getMostRecentAbiHexUseCaseMock.execute.mockImplementation(() =>
      Result.withContent({ hasChanged: true, data: { hex: 'foo.hex' } })
    );
    uploadAbiHexUseCaseMock.execute.mockImplementation(() =>
      Result.withContent({})
    );
    parseDataToJsonUseCaseMock.execute.mockImplementation(() =>
      Result.withContent('{ "account": "foo.account" }')
    );

    const result = await (useCase as any).deserializeJobData(job, false);

    expect(result.content).toEqual({ account: 'foo.account' });

    getMostRecentAbiHexUseCaseMock.execute.mockClear();
    uploadAbiHexUseCaseMock.execute.mockClear();
    parseDataToJsonUseCaseMock.execute.mockClear();
  });
});
