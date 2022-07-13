import 'reflect-metadata';

import { BlockRangeScanRepository } from '../block-range-scan.repository';

describe('BlockRangeScanRepository Unit tests', () => {
  it('"Token" should be set', () => {
    expect(BlockRangeScanRepository.Token).not.toBeNull();
  });
});
