import { parseToBigInt } from '@alien-worlds/api-core';
import { EosDacInfoDto } from '../../data/dtos/eos-dac.dtos';

/**
 * Represents entity containing eosDAC data
 * @class
 */
export class EosDacInfo {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly serverVversion: string,
    public readonly chainId: string,
    public readonly headBlockNum: bigint,
    public readonly lastIrreversibleBlockNum: bigint,
    public readonly lastIrreversibleBlockId: string,
    public readonly headBlockId: string,
    public readonly headBlockTime: string,
    public readonly headBlockProducer: string,
    public readonly virtualBlockCpuLimit: number,
    public readonly virtualBlockNet_limit: number,
    public readonly blockCpuLimit: number,
    public readonly blockNetLimit: number,
    public readonly serverVersionString: string,
    public readonly forkDbHeadBlockNum: bigint,
    public readonly forkDbHeadBlockId: string,
    public readonly serverFullVersionString: string
  ) {}

  /**
   * Create the EosDacInfo entitty from DTO.
   *
   * @static
   * @param {EosDacInfoDto} dto
   * @returns {EosDacInfo}
   */
  public static fromDto(dto: EosDacInfoDto): EosDacInfo {
    return new EosDacInfo(
      dto.server_version,
      dto.chain_id,
      parseToBigInt(dto.head_block_num),
      parseToBigInt(dto.last_irreversible_block_num),
      dto.last_irreversible_block_id,
      dto.head_block_id,
      dto.head_block_time,
      dto.head_block_producer,
      dto.virtual_block_cpu_limit,
      dto.virtual_block_net_limit,
      dto.block_cpu_limit,
      dto.block_net_limit,
      dto.server_version_string,
      parseToBigInt(dto.fork_db_head_block_num),
      dto.fork_db_head_block_id,
      dto.server_full_version_string
    );
  }
}
