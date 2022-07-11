import { AbiRepositoryImpl } from '@common/abi/data/repositories/abi.repository-impl';
import { AbiDto } from '@common/abi/data/dtos/abi.dto';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { GetBlocksAckRequest } from '../domain/entities/get-blocks-ack.request';
import {
  GetBlocksRequest,
  GetBlocksRequestOptions,
} from '../domain/entities/get-blocks.request';
import { GetBlocksResult } from '../domain/entities/get-blocks.result';
import { StateHistoryMessage } from '../domain/entities/state-history.message';
import { MissingHandlersError } from '../domain/errors/missing-handlers.error';
import { ServiceNotConnectedError } from '../domain/errors/service-not-connected.error';
import { UnhandledBlockRequestError } from '../domain/errors/unhandled-block-request.error';
import { UnhandledMessageTypeError } from '../domain/errors/unhandled-message-type.error';
import { UnhandledMessageError } from '../domain/errors/unhandled-message.error';
import { StateHistoryService } from '../domain/state-history.service';
import { StateHistorySource } from './data-sources/state-history.source';
import { WaxConnectionState } from '../domain/state-history.enums';
import { ConnectionChangeHandlerOptions } from './data-sources/state-history.dtos';
import { ServiceAlreadyConnectedError } from '../domain/errors/service-already-connected.error';
import { log } from '../domain/state-history.utils';

export class StateHistoryServiceImpl implements StateHistoryService {
  private errorHandler: (error: Error) => Promise<void> | void;
  private warningHandler: (...args: unknown[]) => Promise<void>;
  private receivedBlockHandler: (
    content: GetBlocksResult,
    blockRange: BlockRange
  ) => Promise<void>;
  private blockRangeCompleteHandler: (blockRange: BlockRange) => Promise<void>;
  private blockRangeRequest: GetBlocksRequest;

  constructor(
    private source: StateHistorySource,
    private abiRepository: AbiRepositoryImpl
  ) {
    this.source.onMessage(message => this.onMessage(message));
    this.source.onError(error => this.handleError(error));
    this.source.addConnectionStateHandler(
      WaxConnectionState.Connected,
      options => this.onConnected(options)
    );
    this.source.addConnectionStateHandler(WaxConnectionState.Idle, options =>
      this.onDisconnected(options)
    );
  }

  public onConnected({ data }: ConnectionChangeHandlerOptions) {
    log(`StateHistory plugin connected`);

    const createAbiResult = this.abiRepository.createAbi(
      JSON.parse(data as string) as AbiDto
    );

    if (createAbiResult.isFailure) {
      throw createAbiResult.failure.error;
    }
  }

  public onDisconnected({ previousState }: ConnectionChangeHandlerOptions) {
    log(`StateHistory plugin disconnected`);
    if (previousState === WaxConnectionState.Disconnecting) {
      const clearAbiResult = this.abiRepository.clearCurrentAbi();

      if (clearAbiResult.isFailure) {
        throw clearAbiResult.failure.error;
      }
    }
  }

  public async onMessage(dto: Uint8Array) {
    const { content: abi, failure } = this.abiRepository.getCurrentAbi();

    if (failure) {
      await this.handleError(failure.error);
      return;
    }

    const message = StateHistoryMessage.create(dto, abi.getTypesMap());
    if (message.isGetStatusResult) {
      // TODO: ?
    } else if (message.isGetBlocksResult) {
      await this.handleBlocksResultContent(message.content);
    } else {
      await this.handleError(new UnhandledMessageTypeError(message.type));
    }
  }

  private async handleBlocksResultContent(result: GetBlocksResult) {
    const {
      blockRangeRequest: { blockRange },
    } = this;
    const { thisBlock } = result;

    try {
      const { content: abi, failure } = this.abiRepository.getCurrentAbi();

      if (failure) {
        throw failure.error;
      }

      if (thisBlock) {
        const isLast = thisBlock.blockNumber === blockRange.end - 1n;
        await this.receivedBlockHandler(result, blockRange);

        // If received block is the last one call onComplete handler
        if (isLast) {
          this.blockRangeRequest = null;
          await this.blockRangeCompleteHandler(blockRange);
        }
      } else {
        await this.handleWarning(
          `the received message does not contain this_block`
        );
      }
      // State history plugs will answer every call of ack_request, even after
      // processing the full range, it will send messages containing only head.
      // After the block has been processed, the connection should be closed so
      // there is no need to ack request.
      if (this.source.isConnected) {
        // Acknowledge a request so that source can send next one.
        this.source.send(
          new GetBlocksAckRequest(1, abi.getTypesMap()).toUint8Array()
        );
      }
    } catch (error) {
      await this.handleError(new UnhandledMessageError(result, error));
    }
  }

  private async handleError(error) {
    if (this.errorHandler) {
      return this.errorHandler(error);
    }
  }

  private async handleWarning(...args) {
    if (this.warningHandler) {
      return this.warningHandler(...args);
    }
  }

  public async connect(): Promise<Result<void>> {
    if (!this.receivedBlockHandler || !this.blockRangeCompleteHandler) {
      return Result.withFailure(Failure.fromError(new MissingHandlersError()));
    }

    if (!this.source.isConnected) {
      log(`StateHistory plugin connecting...`);
      await this.source.connect();
      return Result.withoutContent();
    }

    return Result.withFailure(
      Failure.fromError(new ServiceAlreadyConnectedError())
    );
  }

  public async disconnect(): Promise<Result<void>> {
    if (this.source.isConnected) {
      log(`StateHistory plugin disconnecting...`);
      await this.source.disconnect();
      return Result.withoutContent();
    }

    return Result.withFailure(
      Failure.fromError(new ServiceNotConnectedError())
    );
  }

  public async requestBlocks(
    blockRange: BlockRange,
    options: GetBlocksRequestOptions
  ): Promise<Result<void>> {
    log(`StateHistory plugin trying to request blocks`);
    // still processing block range request?
    if (this.blockRangeRequest) {
      return Result.withFailure(
        Failure.fromError(new UnhandledBlockRequestError(blockRange))
      );
    }

    try {
      const { content: abi, failure } = this.abiRepository.getCurrentAbi();

      if (failure) {
        return Result.withFailure(failure);
      }

      this.blockRangeRequest = GetBlocksRequest.create(
        blockRange,
        options,
        abi.getTypesMap()
      );
      this.source.send(this.blockRangeRequest.toUint8Array());
      log(`StateHistory plugin request sent`);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public onReceivedBlock(
    handler: (content: GetBlocksResult, blockRange: BlockRange) => Promise<void>
  ) {
    this.receivedBlockHandler = handler;
  }

  public onBlockRangeComplete(
    handler: (blockRange: BlockRange) => Promise<void>
  ) {
    this.blockRangeCompleteHandler = handler;
  }

  public onError(handler: (error: Error) => void | Promise<void>) {
    this.errorHandler = handler;
  }

  public onWarning(handler: (...args: unknown[]) => Promise<void>) {
    this.warningHandler = handler;
  }
}
