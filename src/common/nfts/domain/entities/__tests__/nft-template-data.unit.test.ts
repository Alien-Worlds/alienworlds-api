/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NftTemplateData } from '../nft-template-data';

const dto = {
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
};

describe('NftTemplateData Unit tests', () => {
  it('Should create entity based on dto', () => {
    const entity = NftTemplateData.fromDto(dto);

    expect(entity).toEqual({
      cardId: dto.cardid,
      name: dto.name,
      image: dto.img,
      backImage: dto.backimg,
      rarity: dto.rarity,
      shine: dto.shine,
      description: dto.description,
      attack: dto.attack,
      defense: dto.defense,
      className: dto.class,
      moveCost: dto.movecost,
      race: dto.race,
      type: dto.type,
      element: dto.element,
      delay: dto.delay,
      difficulty: dto.difficulty,
      ease: dto.ease,
      luck: dto.luck,
    });
  });

  it('Should create empty entity based on empty dto', () => {
    const dto = {};
    const entity = NftTemplateData.fromDto(dto);

    expect(entity).toEqual({});
  });

  it('Should create dto based on entity', () => {
    const entity = NftTemplateData.fromDto(dto);

    expect(entity.toDto()).toEqual(dto);
  });
});
