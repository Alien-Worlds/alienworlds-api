import { Mine } from './entities/mine';

/**
 * @abstract
 */
export abstract class MinesRepository {
  public static Token = 'MINES_REPOSITORY';

  public abstract getLastBlock(): Promise<Mine>;
}
