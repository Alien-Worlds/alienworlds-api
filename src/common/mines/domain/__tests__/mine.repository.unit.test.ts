import 'reflect-metadata';
import { MineRepository } from '../mine.repository';

describe('MineRepository Unit tests', () => {
  it('"Token" should be set', () => {
    expect(MineRepository.Token).not.toBeNull();
  });
});
