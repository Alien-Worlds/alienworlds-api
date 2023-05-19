/* eslint-disable @typescript-eslint/no-explicit-any */
import { getJsonRpcProvider } from '../../src/ioc/api.ioc.utils';
import { createApiTestEnvironment } from '../environments';

import {
  emptyNftsResponse,
  fakeLandId,
  fakeminer0Name,
  fakeTemplateId,
  nftsByFakeminer0Response,
  nftsByLandIdResponse,
  nftsByTemplateIdResponse,
  nftsFebruary2022Response,
  rareNftsResponse,
} from './fixtures/nfts.fixture';

jest.mock('ethers');
jest.mock('../../src/ioc/api.ioc.utils');
const getJsonRpcProviderMock = getJsonRpcProvider as jest.MockedFunction<
  typeof getJsonRpcProvider
>;
getJsonRpcProviderMock.mockResolvedValue({} as any);

const environment = createApiTestEnvironment();
environment.initialize();

describe('NFTS API Test', () => {
  it('Should return empty list when no nfts were found', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/nfts?land_id=0000000001',
    });

    expect(response.statusCode).toEqual(200);
    const data = JSON.parse(response.body);
    expect(data).toEqual({ results: [], count: 0 });
  });

  it('Should return 400 if limit is > 1000', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/nfts?limit=2000',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('Should return 400 if wrong sort was provided', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/nfts?sort=FAKE',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('Should return the amount of nft corresponding to the given "limit"', async () => {
    const limit = 4;
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/nfts?limit=${limit}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results.length).toEqual(limit);
  });

  it('Should return a list of nft assigned to the given "miner"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/nfts?miner=${fakeminer0Name}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(nftsByFakeminer0Response.results)
    );
  });

  it('Should return a list of nft assigned to the given "land_id"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/nfts?land_id=${fakeLandId}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(nftsByLandIdResponse.results)
    );
  });

  it('Should return a list of nft assigned to the given "template_id"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/nfts?template_id=${fakeTemplateId}`,
    });

    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(nftsByTemplateIdResponse.results)
    );
  });

  it('Should return a list of nft matching the given "rarity"', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: `/v1/alienworlds/nfts?rarity=Rare`,
    });
    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(rareNftsResponse.results)
    );
  });

  it('Should return empty response when block timestamp is out of time range and "from" date was given', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/nfts?from=2023-04-11T14:27:41',
    });
    const data = JSON.parse(response.body);
    expect(data).toEqual(emptyNftsResponse);
  });

  it('Should return empty response when block timestamp is out of time range and "to" date was given', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/nfts?to=2019-04-11T14:27:41',
    });
    const data = JSON.parse(response.body);
    expect(data).toEqual(emptyNftsResponse);
  });

  it('Should return response with the nfts collection relevant to the given time interval', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/nfts?from=2022-02-01T00:00:00&to=2022-02-31T00:00:00',
    });
    const data = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(nftsFebruary2022Response.results)
    );
  });
});
