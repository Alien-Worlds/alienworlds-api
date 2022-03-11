import 'reflect-metadata';
import { MinesRepository } from '../mines.repository';

describe('MinesRepository Unit tests', () => {
  it('"Token" should be set', () => {
    expect(MinesRepository.Token).not.toBeNull();
  });
});
