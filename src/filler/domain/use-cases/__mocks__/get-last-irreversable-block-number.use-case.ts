/* eslint-disable @typescript-eslint/no-var-requires */

import { Result } from '@core/domain/result';
import { injectable } from 'inversify';

@injectable()
export class GetLastIrreversableBlockNumUseCase {
  public static Token = 'GET_LAST_IRREVERSABLE_BLOCK_NUMBER_USE_CASE';

  public async execute(): Promise<Result<number>> {
    return Result.withContent(10);
  }
}
