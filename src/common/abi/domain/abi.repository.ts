import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { AbiDto } from '../data/dtos/abi.dto';
import { Abi } from './entities/abi';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class AbiRepository {
  public static Token = 'ABI_REPOSITORY';

  public abstract createAbi(dto: AbiDto): Result<Abi>;
  public abstract getCurrentAbi(): Result<Abi>;
  public abstract clearCurrentAbi(): Result<void>;
}
