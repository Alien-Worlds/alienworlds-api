/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImmutableSerializedData } from '../immutable-serialized-data';

const dto = {
  cardid: 12,
  name: 'foo',
  img: 'foo.img',
  backimg: 'foo.backimg',
  rarity: 'rare',
  shine: 'stone',
  type: 'any',
  delay: 0,
  difficulty: 1,
  ease: 10,
  luck: 100,
};

describe('ImmutableSerializedData unit tests', () => {
  it('ImmutableSerializedData.fromDto should returnentity based on data provided in given dto', async () => {
    const entity = ImmutableSerializedData.fromDto(dto);
    expect(entity).toEqual({
      cardId: 12,
      name: 'foo',
      image: 'foo.img',
      backImage: 'foo.backimg',
      rarity: 'rare',
      shine: 'stone',
      type: 'any',
      delay: 0,
      difficulty: 1,
      ease: 10,
      luck: 100,
    });
  });

  it('ImmutableSerializedData.toDto should return a dto based on entity', async () => {
    const entity = ImmutableSerializedData.fromDto(dto);
    expect(entity.toDto()).toEqual(dto);
  });
});
