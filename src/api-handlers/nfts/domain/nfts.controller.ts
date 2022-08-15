import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { GetNftsUseCase } from './use-cases/get-nfts.use-case';
import { GetNftsInput } from './models/get-nfts.input';
import { CountNftsUseCase } from './use-cases/count-nfts.use-case';
import { GetNftsOutput } from './models/get-nfts.output';

/**
 * @class
 */
@injectable()
export class NftsController {
  public static Token = 'NFTS_CONTROLLER';

  constructor(
    @inject(GetNftsUseCase.Token) private getNftsUseCase: GetNftsUseCase,
    @inject(CountNftsUseCase.Token) private countNftsUseCase: CountNftsUseCase
  ) {}

  /**
   * @async
   * @param {GetNftsInput} input
   * @returns {Promise<Result<NFT[]>>}
   */
  public async getNfts(input: GetNftsInput): Promise<Result<GetNftsOutput>> {
    const { content: nfts, failure: getNftsFailure } =
      await this.getNftsUseCase.execute(input);

    if (getNftsFailure) {
      return Result.withFailure(getNftsFailure);
    }

    const { content: size, failure: countNftsFailure } =
      await this.countNftsUseCase.execute(input);

    if (countNftsFailure) {
      return Result.withFailure(countNftsFailure);
    }

    return Result.withContent(GetNftsOutput.create(nfts, size));
  }
}
