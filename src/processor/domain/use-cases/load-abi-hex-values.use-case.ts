import { config } from '@config';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { AbiHexRepository } from '../abi-hex.repository';
import { AbiHex } from '../entities/abi-hex';

/**
 * Represents a use case in which ABIs stored locally
 * in .hex files are loaded
 *
 * @class
 */
@injectable()
export class LoadAbiHexValuesUseCase implements UseCase {
  public static Token = 'LOAD_ABI_HEX_VALUES_USE_CASE';

  /**
   * @constructor
   * @param {AbiHexRepository} abiHexRepository
   */
  constructor(
    @inject(AbiHexRepository.Token)
    private abiHexRepository: AbiHexRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<AbiHex[]>>}
   */
  public async execute(): Promise<Result<AbiHex[]>> {
    console.log('Loading ABIs from path:', config.abisPath);
    return this.abiHexRepository.load(config.abisPath);
  }
}
