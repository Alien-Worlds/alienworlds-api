import { AbiNotFoundError } from '@common/abi/domain/errors/abi-not-found.error';
import { InvalidAbiFileNameError } from '@common/abi/domain/errors/invalid-abi-file-name.error';

import fs from 'fs';
import { AbiDto } from '../abi.dtos';

export class AbiLocalSource {
  private abisByContracts: Map<string, AbiDto[]> = new Map();

  /**
   * Extract contract name and block number from file name
   * @private
   * @param {string} name
   * @returns {{ contract: string, blockNum: number }}
   */
  private extractDataFromFilename(name: string): {
    contract: string;
    blockNum: string;
  } {
    const [contract, blockNum] = name.replace(/\.hex$/, '').split('-');

    if (!contract || !blockNum) {
      throw new InvalidAbiFileNameError(name, contract, blockNum);
    }

    return { contract, blockNum };
  }

  /**
   * Load Abi's from the files
   *
   * @param {string} path
   * @returns {AbiDto[]}
   */
  public async load(path: string): Promise<AbiDto[]> {
    const abiDirectory = fs.opendirSync(path);

    if (this.abisByContracts.size) {
      console.warn('Current Abi dtos will be overriden');
    }

    for await (const file of abiDirectory) {
      // TODO: what should happen if one of the files or name is broken?
      // Should we continue with the rest of the files or break the process?
      try {
        const { contract, blockNum } = this.extractDataFromFilename(file.name);
        console.log(`Loading ${path}/${file.name}...`);
        const abiHex = fs.readFileSync(`${path}/${file.name}`, 'utf-8');

        const dto: AbiDto = {
          contract,
          block_num: blockNum,
          abi_hex: abiHex,
          filename: file.name,
        };

        if (this.abisByContracts.has(contract)) {
          this.abisByContracts.get(contract).push(dto);
        } else {
          this.abisByContracts.set(contract, [dto]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    const result = [];

    this.abisByContracts.forEach(dtos => {
      result.push(...dtos);
    });

    return result;
  }

  /**
   * Get the most recent matching ABI
   *
   * @param {string} account
   * @param {bigint} blockNum
   * @param {boolean=} fromCurrentBlock
   * @returns {AbiDto}
   */
  public getMostRecentAbi(
    account: string,
    blockNum: bigint,
    fromCurrentBlock?: boolean
  ): AbiDto {
    const dtos = this.abisByContracts.get(account);

    if (!dtos || dtos.length === 0) {
      throw new AbiNotFoundError(account);
    }

    const revertedDtos = [...dtos].reverse();
    let abi;

    for (const dto of revertedDtos) {
      if (
        (fromCurrentBlock && blockNum >= parseInt(dto.block_num)) ||
        (!fromCurrentBlock && blockNum > parseInt(dto.block_num))
      ) {
        abi = dto;
        break;
      }
    }

    return abi;
  }
}
