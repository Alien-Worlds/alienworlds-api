import { buildAPI } from '../../src/api';
import { TestEnvironment, TestHooks } from './test-environment';
import { TestEnvironmentServer } from './api-test-environment';
import { Container } from 'inversify';
import { ApiTestsMongoHelper } from '../../src/ioc/api.ioc.utils';

export class FastifyTestEnvironment implements TestEnvironment {
  private _server;
  private _ioc = new Container();

  get server(): TestEnvironmentServer {
    return this._server;
  }

  initialize(hooks?: TestHooks) {
    beforeAll(async () => {
      this._server = await buildAPI(this._ioc);
      if (hooks?.beforeAll) {
        hooks.beforeAll();
      }
    });

    if (hooks?.beforeEach) {
      hooks.beforeEach();
    }

    if (hooks?.afterEach) {
      hooks.afterEach();
    }

    afterAll(async () => {
      if (hooks?.afterAll) {
        hooks.afterAll();
      }
      if (this._server) {
        await this._server.close();
        const mongoHelper = this._ioc.get<ApiTestsMongoHelper>(
          ApiTestsMongoHelper.Token
        );
        await mongoHelper.close();
        this._ioc.unbindAll();
      }
    });
  }
}
