import { AbiEosService } from '@common/abi/data/services/abieos.service';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';

/**
 * @class
 */
@injectable()
export class ParseDataToJsonUseCase implements UseCase {
  public static Token = 'PARSE_DATA_TO_JSON_USE_CASE';

  /**
   * @constructor
   * @param {AbiEosService} abieosService
   */
  constructor(
    @inject(AbiEosService.Token)
    private abieosService: AbiEosService
  ) {}
  public execute(
    account: string,
    name: string,
    buffer: Buffer
  ): Result<string> {
    try {
      const type = this.abieosService.getTypeForAction(account, name);
      const json = this.abieosService.parseDataToJson(account, type, buffer);

      return Result.withContent(json);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
