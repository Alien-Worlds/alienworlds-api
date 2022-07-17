import { Container } from 'inversify';
import { MineLuckController } from './domain/mine-luck.controller';

const mineLuckIoc = new Container();

mineLuckIoc
  .bind<MineLuckController>(MineLuckController.Token)
  .to(MineLuckController);

export { mineLuckIoc };
