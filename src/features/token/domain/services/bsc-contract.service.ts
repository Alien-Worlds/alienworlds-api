import { injectable } from 'inversify';
import { ContractService } from './contract.service';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class BscContractService extends ContractService {
  public static Token = 'BSC_CONTRACT_SERVICE';
}
