import { AsyncContainerModule, Container } from 'inversify';
import { AssetMongoSource } from '@common/assets/data/data-sources/asset.mongo.source';
import { AssetRepositoryImpl } from '@common/assets/data/repositories/asset.repository-impl';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { EosDacServiceImpl } from '@common/eos-dac/data/eos-dac.service-impl';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';
import { MineMongoSource } from '@common/mines/data/data-sources/mine.mongo.source';
import { MineRepositoryImpl } from '@common/mines/data/mine.repository-impl';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { NftMongoSource } from '@common/nfts/data/data-sources/nft.mongo.source';
import { NftRepositoryImpl } from '@common/nfts/data/repositories/nft.repository-impl';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { config } from '@config';
import { connectMongo } from '@core/storage/data/data-sources/connect-mongo.helper';
import { MongoSource } from '@core/storage/data/data-sources/mongo.source';
import { Contract } from 'ethers';
import { AssetController } from './asset/domain/asset.controller';
import { GetAssetsUseCase } from './asset/domain/use-cases/get-assets.use-case';
import { MineLuckRepositoryImpl } from './mine-luck/data/mine-luck.repository-impl';
import { MineLuckController } from './mine-luck/domain/mine-luck.controller';
import { MineLuckRepository } from './mine-luck/domain/mine-luck.repository';
import { GetMineLuckUseCase } from './mine-luck/domain/use-cases/get-mine-luck.use-case';
import { MinesController } from './mines/domain/mines.controller';
import { GetMinesUseCase } from './mines/domain/use-cases/get-mines.use-case';
import { NftsController } from './nfts/domain/nfts.controller';
import { GetNftsUseCase } from './nfts/domain/use-cases/get-nfts.use-case';
import { ContractServiceImpl } from './token/data/contract.service-impl';
import { BscContractService } from './token/domain/services/bsc-contract.service';
import { EthContractService } from './token/domain/services/eth-contract.service';
import { TokenController } from './token/domain/token.controller';
import { GetCirculatingSupplyUseCase } from './token/domain/use-cases/get-circulating-supply.use-case';
import { GetTokenSuppliesUseCase } from './token/domain/use-cases/get-token-supplies.use-case';
import { CountNftsUseCase } from './nfts/domain/use-cases/count-nfts.use-case';
import { getJsonRpcProvider } from './api.ioc.utils';
import { ContractInterface } from './token/data/token.dtos';

const bindings = new AsyncContainerModule(async bind => {
  /**
   * MONGO DB (source & repositories)
   */
  const db = await connectMongo(config.mongo);
  const mongoSource = new MongoSource(db);
  const mineRepository = new MineRepositoryImpl(
    new MineMongoSource(mongoSource)
  );

  bind<MineRepository>(MineRepository.Token).toConstantValue(mineRepository);

  /**
   * MINES
   */
  bind<MinesController>(MinesController.Token).to(MinesController);
  bind<GetMinesUseCase>(GetMinesUseCase.Token).to(GetMinesUseCase);

  /**
   * ASSET
   */
  bind<AssetRepository>(AssetRepository.Token).toConstantValue(
    new AssetRepositoryImpl(new AssetMongoSource(mongoSource))
  );
  bind<GetAssetsUseCase>(GetAssetsUseCase.Token).to(GetAssetsUseCase);
  bind<AssetController>(AssetController.Token).to(AssetController);

  /**
   * MINE LUCK
   */
  const mineLuckRepository = new MineLuckRepositoryImpl(
    new MineMongoSource(mongoSource)
  );
  bind<MineLuckRepository>(MineLuckRepository.Token).toConstantValue(
    mineLuckRepository
  );
  bind<MineLuckController>(MineLuckController.Token).to(MineLuckController);
  bind<GetMineLuckUseCase>(GetMineLuckUseCase.Token).to(GetMineLuckUseCase);

  /**
   * NFTS
   */
  bind<NftRepository>(NftRepository.Token).toConstantValue(
    new NftRepositoryImpl(new NftMongoSource(mongoSource))
  );
  bind<GetNftsUseCase>(GetNftsUseCase.Token).to(GetNftsUseCase);
  bind<CountNftsUseCase>(CountNftsUseCase.Token).to(CountNftsUseCase);
  bind<NftsController>(NftsController.Token).to(NftsController);

  /**
   * TOKEN
   */
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

  const ethProvider = await getJsonRpcProvider(config.ethEndpoint);

  if (ethProvider) {
    const ethContract = new Contract(
      config.ethTokenContract,
      contractInterface,
      ethProvider
    );

    bind<EthContractService>(EthContractService.Token).toConstantValue(
      new ContractServiceImpl(ethContract as unknown as ContractInterface)
    );
  }

  const bscProvider = await getJsonRpcProvider(config.bscEndpoint);

  if (bscProvider) {
    const bscContract = new Contract(
      config.bscTokenContract,
      contractInterface,
      bscProvider
    );

    bind<BscContractService>(BscContractService.Token).toConstantValue(
      new ContractServiceImpl(bscContract as unknown as ContractInterface)
    );
  }

  bind<EosDacService>(EosDacService.Token).toConstantValue(
    new EosDacServiceImpl()
  );

  bind<TokenController>(TokenController.Token).to(TokenController);
  bind<GetTokenSuppliesUseCase>(GetTokenSuppliesUseCase.Token).to(
    GetTokenSuppliesUseCase
  );
  bind<GetCirculatingSupplyUseCase>(GetCirculatingSupplyUseCase.Token).to(
    GetCirculatingSupplyUseCase
  );
});

export const apiIoc = new Container();
export const setupApiIoc = async () => {
  await apiIoc.loadAsync(bindings);
  return apiIoc;
};
