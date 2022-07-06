import { parseToBigInt } from '@common/utils/dto.utils';
import { AbiHexFile } from './abi-hex.dto';

export const blockNumberAscSorter = (a: AbiHexFile, b: AbiHexFile) =>
  parseToBigInt(a.block_num) < parseToBigInt(b.block_num) ? -1 : 1;

export const blockNumberDescSorter = (a: AbiHexFile, b: AbiHexFile) =>
  parseToBigInt(a.block_num) > parseToBigInt(b.block_num) ? -1 : 1;
