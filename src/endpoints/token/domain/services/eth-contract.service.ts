import { injectable } from '@alien-worlds/api-core';
import { ContractService } from './contract.service';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class EthContractService extends ContractService {
  public static Token = 'ETH_CONTRACT_SERVICE';
}
