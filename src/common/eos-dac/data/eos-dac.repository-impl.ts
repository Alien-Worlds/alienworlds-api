import { inject, injectable } from 'inversify';
import { Failure } from '../../../core/domain/failure';
import { CurrencyStats } from '../domain/entities/currecy-stats';
import { EosDacInfo } from '../domain/entities/eos-dac-info';
import { EosDacRepository } from '../domain/eos-dac.repository';
import { EosDacService } from './eos-dac.service';

@injectable()
export class EosDacRepositoryImpl implements EosDacRepository {
  constructor(
    @inject(EosDacService.Token) private eosDacService: EosDacService
  ) {}

  public async getInfo(): Promise<EosDacInfo | Failure> {
    try {
      const dto = await this.eosDacService.getInfo();
      return EosDacInfo.fromDto(dto);
    } catch (error) {
      return Failure.fromError(error);
    }
  }

  public async getCurrecyStats(): Promise<CurrencyStats | Failure> {
    try {
      const dto = await this.eosDacService.getCurrencyStats();
      return CurrencyStats.fromDto(dto);
    } catch (error) {
      return Failure.fromError(error);
    }
  }

  public async getCurrencyBalance(account: string): Promise<number> {
    try {
      const dto = this.eosDacService.getCurrencyBalance(account);
      // map dto to float number
      const [balance] = dto[0].split(' ');
      return parseFloat(balance);
    } catch (error) {
      // TODO: Should we log errors?
      return 0;
    }
  }
}
