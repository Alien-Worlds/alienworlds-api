/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import { Result } from '../../../../../core/domain/result';
import { Mine } from '../../entities/mine';

@injectable()
export class GetLastBlockUseCase {
  public static Token = 'GET_LAST_BLOCK_USE_CASE';

  public async execute(): Promise<Result<Mine>> {
    return Result.withContent(Mine.fromDto({} as any));
  }
}
