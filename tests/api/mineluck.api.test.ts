import { createApiTestEnvironment } from '../environments';
import { fakeminer2Mineluck } from './fixtures/mineluck.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

describe('Mineluck check', () => {
  it('should return 200', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mineluck',
    });
    expect(response.statusCode).toEqual(200);
  });
  it('should return message OK', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/alienworlds/mineluck',
    });

    expect(JSON.parse(response.body)).toEqual(fakeminer2Mineluck);
  });
});
