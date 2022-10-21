/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'reflect-metadata';

import { EosDacService } from '../eos-dac.service';

describe('EosDacServiceImpl Unit tests', () => {
  it('"Token" should be set', () => {
    expect(EosDacService.Token).not.toBeNull();
  });
});
