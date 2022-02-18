import { ContractService } from '../../token';

export const mockContractBalanceOf = (
  service: ContractService,
  result: number
) =>
  ((service['contract'] as unknown)['balanceOf'] = () => ({
    toNumber: () => result,
  }));
