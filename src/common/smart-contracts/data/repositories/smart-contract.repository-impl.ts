import { SmartContractDataNotFoundError } from '@common/smart-contracts/domain/errors/smart-contract-data-not-found.error';
import { config } from '@config';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
/**
 * Represents a base class for the smart contracts -set by tables- repositories.
 *
 * @class
 */
export class SmartContractRepositoryImpl<EntityType, DtoType> {
  protected storage: Map<string, EntityType> = new Map();
  /**
   * @constructor
   * @param {EosRpcSource} source
   * @param {string} table
   */
  constructor(protected source: EosRpcSource, protected table: string) {}

  /**
   * Add entity to the storage.
   *
   * @param {string} key
   * @param {EntityType} entity
   * @returns {EntityType}
   */
  protected store(key: string, entity: EntityType): EntityType {
    if (this.storage.has(key)) {
      console.warn(
        `Storage already contains an entity assigned to the key ${key}, it will be overwritten.`
      );
    }
    this.storage.set(key, entity);
    return entity;
  }

  /**
   * @async
   * @param {string} bound
   * @param {string} scope
   * @returns {Promise<DtoType>}
   */
  protected async getOneRowBy(bound: string, scope: string): Promise<DtoType> {
    const rows = await this.source.getTableRows<DtoType>({
      code: config.atomicAssets.contract,
      scope,
      table: this.table,
      lower_bound: bound,
      upper_bound: bound,
      limit: 1,
    });

    if (rows.length === 0) {
      throw new SmartContractDataNotFoundError(bound, scope);
    }

    return rows[0] as DtoType;
  }
}
