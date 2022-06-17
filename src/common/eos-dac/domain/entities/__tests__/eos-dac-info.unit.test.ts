import { parseToBigInt } from '@common/utils/dto.utils';
import { EosDacInfo } from '../eos-dac-info';

describe('EosDacInfo instance Unit tests', () => {
  it('', () => {
    const dto = {
      server_version: 'v1',
      chain_id: 'chain01',
      head_block_num: 0,
      last_irreversible_block_num: 0,
      last_irreversible_block_id: 'block_id',
      head_block_id: 'foo.head',
      head_block_time: 'foo.time',
      head_block_producer: 'foo.producer',
      virtual_block_cpu_limit: 0,
      virtual_block_net_limit: 0,
      block_cpu_limit: 0,
      block_net_limit: 0,
      server_version_string: 'foo.version.str',
      fork_db_head_block_num: 0,
      fork_db_head_block_id: 'foo.block.id.str',
      server_full_version_string: 'foo.full.version.str',
    };
    const info = EosDacInfo.fromDto(dto);

    expect(info).toEqual({
      serverVversion: dto.server_version,
      chainId: dto.chain_id,
      headBlockNum: parseToBigInt(dto.head_block_num),
      lastIrreversibleBlockNum: parseToBigInt(dto.last_irreversible_block_num),
      lastIrreversibleBlockId: dto.last_irreversible_block_id,
      headBlockId: dto.head_block_id,
      headBlockTime: dto.head_block_time,
      headBlockProducer: dto.head_block_producer,
      virtualBlockCpuLimit: dto.virtual_block_cpu_limit,
      virtualBlockNet_limit: dto.virtual_block_net_limit,
      blockCpuLimit: dto.block_cpu_limit,
      blockNetLimit: dto.block_net_limit,
      serverVersionString: dto.server_version_string,
      forkDbHeadBlockNum: parseToBigInt(dto.fork_db_head_block_num),
      forkDbHeadBlockId: dto.fork_db_head_block_id,
      serverFullVersionString: dto.server_full_version_string,
    });
  });
});
