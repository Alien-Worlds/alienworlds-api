import fs from 'fs';
import { AbiHexNotFoundError } from '../../domain/errors/abi-hex-not-found.error';
import { InvalidAbiHexFileNameError } from '../../domain/errors/invalid-abi-hex-file-name.error';
import { AbiHexFile } from '../abi-hex.dto';

export class AbiHexLocalSource {
  private abisByContracts: Map<string, AbiHexFile[]> = new Map();

  /**
   * Extract contract name and block number from file name
   * @private
   * @param {string} name
   * @returns {{ contract: string, blockNum: number }}
   */
  private extractDataFromFilename(name: string): {
    contract: string;
    blockNumber: string;
  } {
    const [contract, blockNumber] = name.replace(/\.hex$/, '').split('-');

    if (!contract || !blockNumber) {
      throw new InvalidAbiHexFileNameError(name, contract, blockNumber);
    }

    return { contract, blockNumber };
  }

  /**
   * Load Abi's from the files
   *
   * @param {string} path
   * @returns {AbiHexFile[]}
   */
  public async load(path: string): Promise<AbiHexFile[]> {
    const abiDirectory = fs.opendirSync(path);

    if (this.abisByContracts.size) {
      console.warn('Current Abi dtos will be overriden');
    }

    for await (const file of abiDirectory) {
      // TODO: what should happen if one of the files or name is broken?
      // Should we continue with the rest of the files or break the process?
      try {
        const { contract, blockNumber } = this.extractDataFromFilename(
          file.name
        );
        const abiHexFilePath = `${path}/${file.name}`;
        console.log(`Loading ${abiHexFilePath}...`);
        const abiHex = fs.readFileSync(abiHexFilePath, 'utf-8');

        const dto: AbiHexFile = {
          contract,
          block_num: blockNumber,
          hex: abiHex,
          filename: file.name,
        };

        if (this.abisByContracts.has(contract)) {
          this.abisByContracts.get(contract).push(dto);
        } else {
          this.abisByContracts.set(contract, [dto]);
        }
        console.log(`ABI hex file loaded ${abiHexFilePath}`);
      } catch (error) {
        console.error(error);
      }
    }
    console.log(`Loading ABI hex files finieshed`);
    const result = [];

    this.abisByContracts.forEach(dtos => {
      dtos.sort((a, b) => (a.block_num < b.block_num ? -1 : 1));
      result.push(...dtos);
    });

    return result;
  }

  /**
   * Get the most recent matching ABI
   *
   * @param {string} account
   * @param {number} blockNum
   * @param {boolean=} fromCurrentBlock
   * @returns {AbiHexFile}
   */
  public getMostRecentAbiHex(
    account: string,
    blockNum: bigint,
    fromCurrentBlock?: boolean
  ): AbiHexFile {
    const dtos = this.abisByContracts.get(account);

    if (!dtos || dtos.length === 0) {
      throw new AbiHexNotFoundError(account);
    }

    const revertedDtos = [...dtos].reverse();
    let abiHex = null;

    for (const dto of revertedDtos) {
      if (
        (fromCurrentBlock && blockNum >= BigInt(dto.block_num)) ||
        (!fromCurrentBlock && blockNum > BigInt(dto.block_num))
      ) {
        abiHex = dto;
        break;
      }
    }

    return abiHex;
  }
}
