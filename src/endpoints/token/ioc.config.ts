import { Container } from 'inversify';
import { Contract, providers } from 'ethers';
import { TokenController } from './domain/token.controller';
import { GetTokenSuppliesUseCase } from './domain/use-cases/get-token-supplies.use-case';
import { GetCirculatingSupplyUseCase } from './domain/use-cases/get-circulating-supply.use-case';
import { BscContractService } from './domain/services/bsc-contract.service';
import { EosDacService } from './domain/services/eos-dac.service';
import { ContractServiceImpl } from './data/services/contract.service-impl';
import { EosDacServiceImpl } from './data/services/eos-dac.service-impl';
import { ContractInterface } from './data/dtos/token.dtos';
import { EthContractService } from './domain/services/eth-contract.service';

export const bindTokenEndpointComponents = async (
  container: Container,
  ethProvider: providers.JsonRpcProvider,
  bscProvider: providers.JsonRpcProvider,
  ethTokenContract: string,
  bscTokenContract: string
): Promise<Container> => {
  const contractInterface = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      payable: false,
      type: 'function',
    },
  ];

  if (ethProvider) {
    const ethContract = new Contract(
      ethTokenContract,
      contractInterface,
      ethProvider
    );

    container
      .bind<EthContractService>(EthContractService.Token)
      .toConstantValue(
        new ContractServiceImpl(ethContract as unknown as ContractInterface)
      );
  }

  if (bscProvider) {
    const bscContract = new Contract(
      bscTokenContract,
      contractInterface,
      bscProvider
    );

    container
      .bind<BscContractService>(BscContractService.Token)
      .toConstantValue(
        new ContractServiceImpl(bscContract as unknown as ContractInterface)
      );
  }

  container
    .bind<EosDacService>(EosDacService.Token)
    .toConstantValue(new EosDacServiceImpl());

  container.bind<TokenController>(TokenController.Token).to(TokenController);
  container
    .bind<GetTokenSuppliesUseCase>(GetTokenSuppliesUseCase.Token)
    .to(GetTokenSuppliesUseCase);
  container
    .bind<GetCirculatingSupplyUseCase>(GetCirculatingSupplyUseCase.Token)
    .to(GetCirculatingSupplyUseCase);

  return container;
};
