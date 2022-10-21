import { injectable } from '@alien-worlds/api-core';
import { ContractService } from './contract.service';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class BscContractService extends ContractService {
  public static Token = 'BSC_CONTRACT_SERVICE';
}
