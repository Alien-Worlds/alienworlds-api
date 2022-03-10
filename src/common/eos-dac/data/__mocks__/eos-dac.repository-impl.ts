import { CurrencyStats } from '@common/eos-dac/domain/entities/currecy-stats';
import { EosDacInfo } from '@common/eos-dac/domain/entities/eos-dac-info';
import { EosDacRepository } from '@common/eos-dac/domain/eos-dac.repository';
import { Result } from '@core/domain/result';
import { inject, injectable } from 'inversify';
import { EosDacService } from './eos-dac.service';

@injectable()
export class EosDacRepositoryImpl implements EosDacRepository {
  constructor(
    @inject(EosDacService.Token) private eosDacService: EosDacService
  ) {}

  public async getInfo(): Promise<Result<EosDacInfo>> {
    return null;
  }

  public async getCurrecyStats(): Promise<Result<CurrencyStats>> {
    return null;
  }

  public async getCurrencyBalance(): Promise<Result<number>> {
    return null;
  }
}
