/* eslint-disable @typescript-eslint/no-explicit-any */
import { getJsonRpcProvider } from '../../src/api-handlers/api.ioc.utils';
import { ListMinesOutput } from '../../src/api-handlers/mines/domain/models/list-mines.output';
import { createApiTestEnvironment } from '../environments';
import {
  emptyMinesResponse,
  fakeLandId,
  fakeLandowner,
  fakeminer0Name,
  fakePlanetName,
  minesByFakeminer0Response,
  minesByLandIdResponse,
  minesByLandownerResponse,
  minesByPlanetNameResponse,
} from './fixtures/mines.fixture';

jest.mock('ethers');
jest.mock('../../src/api-handlers/api.ioc.utils');
const getJsonRpcProviderMock = getJsonRpcProvider as jest.MockedFunction<
  typeof getJsonRpcProvider
>;
getJsonRpcProviderMock.mockResolvedValue({} as any);

const environment = createApiTestEnvironment();
environment.initialize();

describe('Mines API Test', () => {
  it('Should return empty list when no mines were found', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?land_id=0000000001',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      JSON.stringify(ListMinesOutput.fromEntities([]).toJson())
    );
  });

  it('Should return 400 if limit is > 5000', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?limit=6000',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('Should return 400 if wrong sort was provided', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?sort=FAKE',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('Should return the amount of mines corresponding to the given "limit"', async () => {
    const limit = 4;
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/mines?limit=${limit}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results.length).toEqual(limit);
  });

  it('Should return a list of mines assigned to the given "miner"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/mines?miner=${fakeminer0Name}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(minesByFakeminer0Response.results)
    );
  });

  it('Should return a list of mines assigned to the given "land_id"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/mines?land_id=${fakeLandId}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(minesByLandIdResponse.results)
    );
  });

  it('Should return a list of mines assigned to the given "planet_name"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/mines?planet_name=${fakePlanetName}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(minesByPlanetNameResponse.results)
    );
  });

  it('Should return a list of mines matching the given "landowner"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/mines?landowner=${fakeLandowner}`,
    });
    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(minesByLandownerResponse.results)
    );
  });

  it('Should return empty response when block timestamp is out of time range and "from" date was given', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?from=2023-04-11T14:27:41',
    });
    const data = JSON.parse(response.body);
    expect(data).toEqual(emptyMinesResponse);
  });

  it('Should return empty response when block timestamp is out of time range and "to" date was given', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?to=2019-04-11T14:27:41',
    });
    const data = JSON.parse(response.body);
    expect(data).toEqual(emptyMinesResponse);
  });

  it('Should return response with the nfts collection relevant to the given time interval', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mines?from=2022-01-01T00:00:00&to=2022-02-31T00:00:00',
    });
    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(minesByPlanetNameResponse.results)
    );
  });
});
