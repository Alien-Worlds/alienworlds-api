/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Config, config } from '@config';
import { Failure } from '@core/domain/failure';
import { Messages } from '@core/domain/messages';
import { AmqMessages } from '@core/data/messages/amq.messages';
import { PopulateBlockRangesUseCase } from '../populate-block-ranges.use-case';
import { BlocksRange } from '../../../domain/entities/blocks-range';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('@core/data/messages/amq.messages');

let container: Container;
let useCase: PopulateBlockRangesUseCase;
const messages: AmqMessages = new AmqMessages(
  configMock.amqConnectionString,
  console
);
const messagesMock = messages as jest.MockedObject<AmqMessages>;

describe('PopulateBlockRangesUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container.bind<Messages>(Messages.Token).toConstantValue(messages);
    container
      .bind<PopulateBlockRangesUseCase>(PopulateBlockRangesUseCase.Token)
      .to(PopulateBlockRangesUseCase);
  });

  beforeEach(() => {
    useCase = container.get<PopulateBlockRangesUseCase>(
      PopulateBlockRangesUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(PopulateBlockRangesUseCase.Token).not.toBeNull();
  });

  it('Should send the correct number of messages - according to the size of the block range - and return the result with a summary', async () => {
    const result = await useCase.execute(BlocksRange.create(0, 67890));
    //@ts-ignore
    const writeBlockRangeBufferMock = jest.spyOn(
      useCase,
      //@ts-ignore
      'writeBlockRangeBuffer'
    );
    //@ts-ignore
    writeBlockRangeBufferMock.mockResolvedValue();
    messagesMock.send.mockResolvedValue();

    expect(result.content).toEqual({ sent: 7, total: 7 });

    writeBlockRangeBufferMock.mockReset();
    messagesMock.send.mockReset();
  });

  it('Should return failure when sending at least one message has failed', async () => {
    //@ts-ignore
    const writeBlockRangeBufferMock = jest.spyOn(
      useCase,
      //@ts-ignore
      'writeBlockRangeBuffer'
    );
    //@ts-ignore
    writeBlockRangeBufferMock.mockResolvedValue();

    messagesMock.send
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('some error'))
      .mockResolvedValueOnce();

    const result = await useCase.execute(BlocksRange.create(0, 67890));
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);

    writeBlockRangeBufferMock.mockReset();
    messagesMock.send.mockReset();
  });

  it('"writeBlockRangeBuffer" Should return correct buffer for given block range', async () => {
    const bufferJSON = {
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      type: 'Buffer',
    };
    //@ts-ignore
    const buffer = useCase.writeBlockRangeBuffer(0, 100);
    expect(buffer.toJSON()).toEqual(bufferJSON);
  });
});
