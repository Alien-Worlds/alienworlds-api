import { Container } from 'inversify';
import { NftsController } from './domain/nfts.controller';
import { CountNftsUseCase } from './domain/use-cases/count-nfts.use-case';
import { GetNftsUseCase } from './domain/use-cases/get-nfts.use-case';

const nftsIoc = new Container();

nftsIoc.bind<GetNftsUseCase>(GetNftsUseCase.Token).to(GetNftsUseCase);
nftsIoc.bind<CountNftsUseCase>(CountNftsUseCase.Token).to(CountNftsUseCase);
nftsIoc.bind<NftsController>(NftsController.Token).to(NftsController);

export { nftsIoc };
