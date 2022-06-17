import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { AbiRepository } from '../../domain/abi.repository';
import { Abi } from '../../domain/entities/abi';
import { AbiNotFoundError } from '../../domain/errors/abi-not-found.error';
import { AbiDto } from '../dtos/abi.dto';

/**
 * Represents ABI repository
 * @class
 */
export class AbiRepositoryImpl implements AbiRepository {
  private currentAbi: Abi;

  public createAbi(dto: AbiDto): Result<Abi> {
    try {
      this.currentAbi = Abi.fromDto(dto);
      return Result.withContent(this.currentAbi);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public getCurrentAbi(): Result<Abi> {
    if (this.currentAbi) {
      return Result.withContent(this.currentAbi);
    }

    return Result.withFailure(Failure.fromError(new AbiNotFoundError()));
  }

  public clearCurrentAbi(): Result<void> {
    if (this.currentAbi) {
      this.currentAbi = null;
      return Result.withoutContent();
    }

    return Result.withFailure(Failure.fromError(new AbiNotFoundError()));
  }
}
