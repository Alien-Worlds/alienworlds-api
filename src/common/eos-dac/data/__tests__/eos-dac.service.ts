import 'reflect-metadata';
import { EosDacService } from '../eos-dac.service';

describe('EosDacService Unit tests', () => {
  it('"Token" should be set', () => {
    expect(EosDacService.Token).not.toBeNull();
  });
});
