import { Container } from 'inversify';

const tokenIoc = new Container();

tokenIoc.bind<TokenController>(TokenController.Token).to(TokenController);

export { tokenIoc };
