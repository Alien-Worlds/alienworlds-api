/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Long } from 'mongodb';
import { NFT } from '../nft';
import { NftParams } from '../nft-params';
import { NftTemplateData } from '../nft-template-data';

const blockTimestamp = new Date(1645815926208);
const nftParamsDto = {
  invalid: 0,
  error: 'error',
  delay: 0,
  difficulty: 1,
  ease: 1,
  luck: 1,
  commission: 1,
} as any;
const nftTemplateDto = {
  cardid: 1,
  name: 'foo.nft',
  img: 'none',
  backimg: 'back-none',
  rarity: 'rare',
  shine: 'Stone',
  description: 'foo bar baz',
  attack: 100,
  defense: 200,
  class: 'some',
  movecost: 2,
  race: 'some',
  type: 'Manipulator',
  element: 'some',
  delay: 75,
  difficulty: 1,
  ease: 10,
  luck: 5,
} as any;
const nftDto = {
  miner: 'fake.foo',
  land_id: 'fake.land',
  params: nftParamsDto,
  rand1: 1,
  rand2: 2,
  rand3: 3,
  template_id: 11,
  block_num: Long.fromBigInt(0n),
  block_timestamp: blockTimestamp,
  global_sequence: Long.fromBigInt(0n),
  template_data: nftTemplateDto,
} as any;

describe('NFT Unit tests', () => {
  it('Should create entity based on dto', () => {
    const entity = NFT.fromDto(nftDto);

    expect(entity).toEqual({
      id: undefined,
      miner: 'fake.foo',
      landId: 'fake.land',
      params: NftParams.fromDto(nftParamsDto),
      rand1: 1,
      rand2: 2,
      rand3: 3,
      templateId: 11,
      blockNumber: 0n,
      blockTimestamp: blockTimestamp,
      globalSequence: 0n,
      templateData: NftTemplateData.fromDto(nftTemplateDto),
    });
  });

  it('Should create dto based on entity', () => {
    const entity = NFT.fromDto(nftDto);
    expect(entity.toDto()).toEqual(nftDto);
  });
});
