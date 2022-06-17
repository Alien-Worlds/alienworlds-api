/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { AbiHexRepository } from '../../../../../processor/domain/abi-hex.repository';
import { ParseDataToJsonUseCase } from '../parse-data-to-json.use-case';
import { AbiEosService } from '@common/abi/data/services/abieos.service';

const abieosService = {
  getTypeForAction: jest.fn(() => {}),
  parseDataToJson: jest.fn(() => {}),
} as any;

const abieosServiceMock = abieosService as jest.MockedObject<AbiEosService>;

let container: Container;
let useCase: ParseDataToJsonUseCase;

describe('GetLastBlockUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<AbiEosService>(AbiEosService.Token)
      .toConstantValue(abieosService);
    container
      .bind<ParseDataToJsonUseCase>(ParseDataToJsonUseCase.Token)
      .to(ParseDataToJsonUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ParseDataToJsonUseCase>(
      ParseDataToJsonUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ParseDataToJsonUseCase.Token).not.toBeNull();
  });

  it('Should call AbieosService methods and return JSON', async () => {
    const json = { foo: 1 };
    abieosService.getTypeForAction = jest.fn(() => 'foo.type');
    abieosService.parseDataToJson = jest.fn(() => json);

    const { content, failure } = useCase.execute(
      'foo',
      'foo.name',
      Buffer.from([])
    );

    expect(abieosServiceMock.getTypeForAction).toBeCalledWith(
      'foo',
      'foo.name'
    );
    expect(abieosServiceMock.parseDataToJson).toBeCalledWith(
      'foo',
      'foo.type',
      Buffer.from([])
    );
    expect(content).toBe(json);
    expect(failure).toBeUndefined();
  });

  it('Should return a failure ', async () => {
    abieosService.getTypeForAction = jest.fn(() => {
      throw new Error();
    });

    const { content, failure } = useCase.execute(
      'foo',
      'foo.name',
      Buffer.from([])
    );

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
