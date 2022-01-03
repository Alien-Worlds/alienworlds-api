import { createApiTestEnvironment } from '../environments'

const environment = createApiTestEnvironment();
environment.initialize();

describe('Health check', () => {
    it('should return 200', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/health'
        });
        expect(response.statusCode).toEqual(200);
    });
    it('should return message OK', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/health'
        });
        expect(response.body.message).toEqual('OK');
    });
});
