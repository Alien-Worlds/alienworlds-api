/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EosDacServiceImpl } from '../eos-dac.service-impl';
import fetch from 'node-fetch';
import { RequestError } from '@core/architecture/data/errors/request.error';
import { Config, config } from '@config';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('node-fetch');
const fetchMock = fetch as jest.MockedFunction<typeof fetch>;

describe('EosDacServiceImpl Unit tests', () => {
  it('"sendRequest" should call fetch and return json if response status is ok', async () => {
    const source = new EosDacServiceImpl();

    fetchMock.mockResolvedValue({
      json: () => ({ foo: 1 }),
      ok: true,
    } as any);

    //@ts-ignore
    const result = await source.sendRequest('http://localhost/foo');
    expect(result).toEqual({
      foo: 1,
    });

    fetchMock.mockClear();
  });

  it('"sendRequest" should throw RequestError error when response.ok is false', async () => {
    const source = new EosDacServiceImpl();

    fetchMock.mockResolvedValue({
      json: () => ({}),
      ok: false,
    } as any);
    try {
      //@ts-ignore
      await source.sendRequest('http://localhost/foo');
    } catch (error) {
      expect(error).toBeInstanceOf(RequestError);
    }

    fetchMock.mockClear();
  });

  it('"getInfo" should call fetch with correct url', async () => {
    configMock.endpoints[0] = 'foo';
    const source = new EosDacServiceImpl();
    const sendRequestMock = jest
      .spyOn(source as any, 'sendRequest')
      .mockResolvedValue({});

    await source.getInfo();
    expect(sendRequestMock).toBeCalledWith(`foo/v1/chain/get_info`);

    sendRequestMock.mockClear();
  });

  it('"getCurrencyStats" should call fetch with correct url', async () => {
    configMock.endpoints[0] = 'foo';
    const options = {
      method: 'POST',
      body: JSON.stringify({
        json: true,
        code: 'alien.worlds',
        symbol: 'TLM',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
    const source = new EosDacServiceImpl();
    const sendRequestMock = jest
      .spyOn(source as any, 'sendRequest')
      .mockResolvedValue({});

    await source.getCurrencyStats();
    expect(sendRequestMock).toBeCalledWith(
      `foo/v1/chain/get_currency_stats`,
      options
    );

    sendRequestMock.mockClear();
  });

  it('"getCurrencyBalance" should call fetch with correct url', async () => {
    configMock.endpoints[0] = 'foo';
    const account = 'foo';
    const options = {
      method: 'POST',
      body: JSON.stringify({
        account,
        code: 'alien.worlds',
        symbol: 'TLM',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
    const source = new EosDacServiceImpl();
    const sendRequestMock = jest
      .spyOn(source as any, 'sendRequest')
      .mockResolvedValue({});

    await source.getCurrencyBalance(account);
    expect(sendRequestMock).toBeCalledWith(
      `foo/v1/chain/get_currency_balance`,
      options
    );

    sendRequestMock.mockClear();
  });
});
