import { injectable } from 'inversify';
import { ContractService } from './contract.service';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class EthContractService extends ContractService {
  public static Token = 'ETH_CONTRACT_SERVICE';
}
