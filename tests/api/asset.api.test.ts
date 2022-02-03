import { createApiTestEnvironment } from '../environments';
import {
  fakeowner1ToolWorldsSchemaAssetsResponse,
  emptyAssetsResponse,
  asset1099624236152Response,
  fakeowner0AssetsResponse,
  fakeowner6AssetsResponse,
} from './fixtures/asset.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

describe('Asset API Test', () => {
  it('Should return 200', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/asset',
    });

    expect(response.statusCode).toEqual(200);
  });

  it('Should return a response with an asset with the given "id"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/asset?id=1099624236152',
    });

    expect(JSON.parse(response.body)).toEqual(asset1099624236152Response);
  });

  it('Should return a response with assets of the given "owner"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/asset?owner=fakeowner0',
    });

    const { results } = JSON.parse(response.body);
    expect(results).toEqual(
      expect.arrayContaining(fakeowner0AssetsResponse.results)
    );
  });

  it('Should return a response with assets in the given range based on the "owner", "limit" and "offset" options', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/asset?owner=fakeowner6&limit=4&offset=2',
    });

    const { results } = JSON.parse(response.body);
    expect(results).toEqual(
      expect.arrayContaining(fakeowner6AssetsResponse.results)
    );
  });

  it('Should return a response with empty assets when wrong owner was given', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/asset?owner=',
    });

    expect(JSON.parse(response.body)).toEqual(emptyAssetsResponse);
  });

  it('Should return a response with assets matching the given "owner" and "schema"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/asset?owner=fakeowner1&schema=tool.worlds',
    });

    const { results } = JSON.parse(response.body);
    expect(results).toEqual(
      expect.arrayContaining(fakeowner1ToolWorldsSchemaAssetsResponse.results)
    );
  });
});
