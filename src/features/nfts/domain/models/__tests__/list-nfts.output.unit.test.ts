/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NFT } from '@common/nfts/domain/entities/nft';
import { Long } from 'mongodb';
import { ListNftsOutput } from '../list-nfts.output';

const blockTimestamp = new Date(1645815926208);
const nftParamsDto = {
  invalid: 0,
  error: 'error',
  delay: 0,
  difficulty: 1,
  ease: 1,
  luck: 1,
  commission: 1,
};
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
  block_num: 0,
  block_timestamp: blockTimestamp,
  global_sequence: 0,
  template_data: nftTemplateDto,
} as any;

describe('ListNftsOutput Unit tests', () => {
  it('"toJson" should create controller output data as JSON', async () => {
    const output = ListNftsOutput.create([NFT.fromDto(nftDto)]);
    expect(output.toJson()).toEqual({
      count: 0,
      results: [
        {
          block_num: 0,
          block_timestamp: new Date('2022-02-25T19:05:26.208Z'),
          global_sequence: 0,
          land_id: 'fake.land',
          miner: 'fake.foo',
          params: {
            commission: 1,
            delay: 0,
            difficulty: 1,
            ease: 1,
            error: 'error',
            invalid: 0,
            luck: 1,
          },
          rand1: 1,
          rand2: 2,
          rand3: 3,
          template_data: {
            attack: 100,
            backimg: 'back-none',
            cardid: 1,
            class: 'some',
            defense: 200,
            delay: 75,
            description: 'foo bar baz',
            difficulty: 1,
            ease: 10,
            element: 'some',
            img: 'none',
            luck: 5,
            movecost: 2,
            name: 'foo.nft',
            race: 'some',
            rarity: 'rare',
            shine: 'Stone',
            type: 'Manipulator',
          },
          template_id: 11,
        },
      ],
    });
  });
});
