import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { AbiRepository } from '../abi.repository';
import { Abi } from '../entities/abi';

/**
 * @class
 */
@injectable()
export class GetCurrentAbiUseCase implements UseCase {
  public static Token = 'GET_CURRENT_ABI_USE_CASE';

  /**
   * @constructor
   * @param {AbiRepository} abiRepository
   */
  constructor(
    @inject(AbiRepository.Token)
    private abiRepository: AbiRepository
  ) {}
  public execute(): Result<Abi> {
    return this.abiRepository.getCurrentAbi();
  }
}
