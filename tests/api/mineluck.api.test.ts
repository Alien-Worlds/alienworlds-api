/* eslint-disable @typescript-eslint/no-explicit-any */
import { getJsonRpcProvider } from '../../src/api-handlers/api.ioc.utils';
import { ListMineLuckOutput } from '../../src/api-handlers/mine-luck/domain/models/list-mine-luck.output';
import { createApiTestEnvironment } from '../environments';
import {
  emptyMineluckResponse,
  mineluckOnlyJanuary2022Response,
  mineluckResponse,
} from './fixtures/mineluck.fixture';

jest.mock('ethers');
jest.mock('../../src/api-handlers/api.ioc.utils');
const getJsonRpcProviderMock = getJsonRpcProvider as jest.MockedFunction<
  typeof getJsonRpcProvider
>;
getJsonRpcProviderMock.mockResolvedValue({} as any);

const environment = createApiTestEnvironment();
environment.initialize();

describe('Mineluck check', () => {
  it('Should return 200', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mineluck',
    });
    expect(response.statusCode).toEqual(200);
  });

  it('Should return mineluck response with the mineluck collection and "count" value equal to size of the "results" array', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mineluck',
    });

    const data: ListMineLuckOutput = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(mineluckResponse.results)
    );
    expect(data.count).toEqual(mineluckResponse.count);
    expect(Object.keys(data).length).toEqual(
      Object.keys(mineluckResponse).length
    );
  });

  it('Should return empty response when block timestamp is out of time range and "from" date was given', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mineluck?from=2023-04-11T14:27:41',
    });

    const data: ListMineLuckOutput = JSON.parse(response.body);
    expect(data).toEqual(emptyMineluckResponse);
  });

  it('Should return empty response when block timestamp is out of time range and "to" date was given', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mineluck?to=2019-04-11T14:27:41',
    });
    const data: ListMineLuckOutput = JSON.parse(response.body);
    expect(data).toEqual(emptyMineluckResponse);
  });

  it('Should return response with the mineluck collection relevant to the given time interval', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mineluck?from=2022-01-01T00:00:00&to=2022-01-31T00:00:00',
    });
    const data: ListMineLuckOutput = JSON.parse(response.body);
    expect(data.results).toEqual(
      expect.arrayContaining(mineluckOnlyJanuary2022Response.results)
    );
    expect(data.count).toEqual(mineluckOnlyJanuary2022Response.count);
    expect(Object.keys(data).length).toEqual(
      Object.keys(mineluckOnlyJanuary2022Response).length
    );
  });
});
