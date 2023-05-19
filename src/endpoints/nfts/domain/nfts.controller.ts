import { inject, injectable } from '@alien-worlds/api-core';
import { ListNftsUseCase } from './use-cases/list-nfts.use-case';
import { ListNftsInput } from './models/list-nfts.input';
import { CountNftsUseCase } from './use-cases/count-nfts.use-case';
import { ListNftsOutput } from './models/list-nfts.output';

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
  public async listNfts(input: ListNftsInput): Promise<ListNftsOutput> {
    const listResult = await this.listNftsUseCase.execute(input);

    const countResult = await this.countNftsUseCase.execute(input);

    return ListNftsOutput.create(listResult, countResult);
  }
}
