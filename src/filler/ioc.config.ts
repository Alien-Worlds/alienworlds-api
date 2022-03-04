import { EosDacRepositoryImpl } from '@common/eos-dac/data/eos-dac.repository-impl';
import { EosDacRepository } from '@common/eos-dac/domain/eos-dac.repository';
import { MinesMongoSource } from '@common/mines/data/data-sources/mines.mongo.source';
import config from '@config';
import { connectMongo } from '@core/data/connect-mongo.helper';
import { MongoSource } from '@core/data/mongo.source';
import { AsyncContainerModule, Container } from 'inversify';
import { GetBlocksRangeUseCase } from './domain/use-cases/get-blocks-range.use-case';
import { GetLastIrreversableBlockNumUseCase } from './domain/use-cases/get-last-irreversable-block-number.use-case';
import { PopulateBlockRangesUseCase } from './domain/use-cases/populate-block-ranges.use-case';
import { FillerCommandHandler } from './filler.command-handler';

const bindings = new AsyncContainerModule(async bind => {
  const db = await connectMongo(config.mongo);
  // common
  bind<MongoSource>(MongoSource.Token).toConstantValue(new MongoSource(db));
  bind<MinesMongoSource>(MinesMongoSource.Token).to(MinesMongoSource);
  bind<EosDacRepositoryImpl>(EosDacRepository.Token).to(EosDacRepositoryImpl);

  // filler
  bind<FillerCommandHandler>(FillerCommandHandler.Token).to(
    FillerCommandHandler
  );
  bind<GetLastIrreversableBlockNumUseCase>(
    GetLastIrreversableBlockNumUseCase.Token
  ).to(GetLastIrreversableBlockNumUseCase);
  bind<GetBlocksRangeUseCase>(GetBlocksRangeUseCase.Token).to(
    GetBlocksRangeUseCase
  );
  bind<PopulateBlockRangesUseCase>(PopulateBlockRangesUseCase.Token).to(
    PopulateBlockRangesUseCase
  );
});

export const ioc = new Container();
export const setupIOC = async () => ioc.loadAsync(bindings);
