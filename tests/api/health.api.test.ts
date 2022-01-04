import { createApiTestEnvironment } from '../environments'

const environment = createApiTestEnvironment();
environment.initialize();

describe('Health check', () => {
    it('should return 200', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/v1/alienworlds/health'
        });
        expect(response.statusCode).toEqual(200);
    });
    it('should return message OK', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/v1/alienworlds/health'
        });
        expect(JSON.parse(response.body).message).toEqual('OK');
    });
});
