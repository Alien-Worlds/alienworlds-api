import { inject, injectable } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { GetNftsUseCase } from './use-cases/get-nfts.use-case';
import { GetNftsInput } from './entities/get-nfts.input';
import { LimitExceededError } from '@common/api/domain/errors/limit-exceeded.error';
import { CountNftsUseCase } from './use-cases/count-nfts.use-case';
import { GetNftsOutput } from './entities/get-nfts.output';

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
   * @param {GetNftsInput} options
   * @returns {Promise<Result<NFT[]>>}
   */
  public async getNfts(options: GetNftsInput): Promise<Result<GetNftsOutput>> {
    //
    if (options.limit > 1000) {
      return Result.withFailure(
        Failure.fromError(new LimitExceededError(1000))
      );
    }
    const { content: nfts, failure: getNftsFailure } =
      await this.getNftsUseCase.execute(options);

    if (getNftsFailure) {
      return Result.withFailure(getNftsFailure);
    }

    const { content: size, failure: countNftsFailure } =
      await this.countNftsUseCase.execute(options);

    if (countNftsFailure) {
      return Result.withFailure(countNftsFailure);
    }

    return Result.withContent(GetNftsOutput.create(nfts, size));
  }
}
