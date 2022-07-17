import { Container } from 'inversify';
import { MinesController } from './domain/mines.controller';

const minesIoc = new Container();

minesIoc.bind<MinesController>(MinesController.Token).to(MinesController);

export { minesIoc };
