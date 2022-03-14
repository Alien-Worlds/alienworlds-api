/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { MessageQueue, Messages } from '@core/domain/messages';
import { Config, config } from '@config';
import { AmqMessages } from '@core/data/messages/amq.messages';
import { ProcessBlocksRangeMessageUseCase } from '../use-cases/process-blocks-range-message.use-case';
import { BlockRangeCommandHandler } from '../block-range.command-handler';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('@core/data/messages/amq.messages');
jest.mock('../use-cases/process-blocks-range-message.use-case');

const processBlocksRangeMessageUseCaseMock =
  new ProcessBlocksRangeMessageUseCase(null);
const messages: AmqMessages = new AmqMessages(
  configMock.amqConnectionString,
  console
);
const messagesMock = messages as jest.MockedObject<AmqMessages>;

let container: Container;
let commandHandler: BlockRangeCommandHandler;

describe('GetBlocksRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container.bind<Messages>(Messages.Token).toConstantValue(messages);
    container
      .bind<ProcessBlocksRangeMessageUseCase>(
        ProcessBlocksRangeMessageUseCase.Token
      )
      .toConstantValue(processBlocksRangeMessageUseCaseMock);
    container
      .bind<BlockRangeCommandHandler>(BlockRangeCommandHandler.Token)
      .to(BlockRangeCommandHandler);
  });

  beforeEach(() => {
    commandHandler = container.get<BlockRangeCommandHandler>(
      BlockRangeCommandHandler.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(BlockRangeCommandHandler.Token).not.toBeNull();
  });

  it('Should call messages.consume method', async () => {
    const consumeMock = jest.spyOn(messages, 'consume');

    commandHandler.run();
    expect(consumeMock).toBeCalled();

    consumeMock.mockReset();
  });

  it('Should execute processBlocksRangeMessageUseCase when running "aw_block_range" handler', async () => {
    const processMock = jest.spyOn(
      processBlocksRangeMessageUseCaseMock,
      'execute'
    );
    commandHandler.run();
    (messagesMock as any).__triggerMessageHandler(
      MessageQueue.AlienWorldsBlockRange
    );
    expect(processMock).toBeCalled();

    processMock.mockReset();
  });
});
