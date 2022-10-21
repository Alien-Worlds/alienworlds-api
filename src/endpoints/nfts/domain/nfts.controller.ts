import { inject, injectable } from 'inversify';
import { ListNftsUseCase } from './use-cases/list-nfts.use-case';
import { ListNftsInput } from './models/list-nfts.input';
import { CountNftsUseCase } from './use-cases/count-nfts.use-case';
import { ListNftsOutput } from './models/list-nfts.output';
import { Result } from '@alien-worlds/api-core';

/**
 * @class
 */
@injectable()
export class NftsController {
  public static Token = 'NFTS_CONTROLLER';

  constructor(
    @inject(ListNftsUseCase.Token) private listNftsUseCase: ListNftsUseCase,
    @inject(CountNftsUseCase.Token) private countNftsUseCase: CountNftsUseCase
  ) {}

  /**
   * @async
   * @param {ListNftsInput} input
   * @returns {Promise<Result<NFT[]>>}
   */
  public async listNfts(input: ListNftsInput): Promise<Result<ListNftsOutput>> {
    const { content: nfts, failure: listNftsFailure } =
      await this.listNftsUseCase.execute(input);

    if (listNftsFailure) {
      return Result.withFailure(listNftsFailure);
    }

    const { content: size, failure: countNftsFailure } =
      await this.countNftsUseCase.execute(input);

    if (countNftsFailure) {
      return Result.withFailure(countNftsFailure);
    }

    return Result.withContent(ListNftsOutput.create(nfts, size));
  }
}
