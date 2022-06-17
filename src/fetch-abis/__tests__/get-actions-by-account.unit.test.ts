/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestError } from '@core/architecture/data/errors/request.error';
import fetch from 'node-fetch';
import { getActionsByAccount } from '../get-actions-by-account';

jest.mock('node-fetch', () => jest.fn());
const fetchMock = fetch as jest.MockedFunction<any>;

describe('"getActionsByAccount" unit tests', () => {
  afterAll(() => {
    fetchMock.mockReset();
  });

  it('Should return failure when fetch throws an error', async () => {
    fetchMock.mockImplementation(() => {
      throw Error('some error');
    });
    const result = await getActionsByAccount('fake');

    expect(result.isFailure).toEqual(true);
  });

  it('Should return failure with error when response is not successful', async () => {
    const body = {
      statusCode: 400,
      error: 'Bad request',
      message: 'Something went wrong',
    };
    const response = {
      status: 400,
      statusText: 'Bad request',
      ok: false,
      json: () => body,
    };
    fetchMock.mockImplementation(() => Promise.resolve(response));
    const result = await getActionsByAccount('fake');

    expect(result.isFailure).toEqual(true);
    expect((result.failure.error as RequestError).status).toEqual(
      response.status
    );
    expect(result.failure.error.message).toEqual(response.statusText);
  });

  it('Should return failure with message when response is successful but without actions', async () => {
    const body = {
      actions: 'Something is wrong',
    };
    const response = Promise.resolve({
      ok: true,
      json: () => body,
    });
    fetchMock.mockImplementation(() => response);
    const result = await getActionsByAccount('fake');

    expect(result.isFailure).toEqual(true);
    expect(result.failure.error.message).toEqual(JSON.stringify(body));
  });

  it('Should return actions array when response is successful', async () => {
    const body = {
      actions: [
        {
          block_num: 123456,
        },
      ],
    };
    const response = Promise.resolve({
      ok: true,
      json: () => body,
    });
    fetchMock.mockImplementation(() => response);
    const result = await getActionsByAccount('fake');
    expect(result.content).toEqual([{ block_num: 123456 }]);
  });
});
