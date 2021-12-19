import { createTestEnvironment } from '../environments'

const environment = createTestEnvironment();
environment.initialize();

describe('GET /foo', () => {
    it('should return 200', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/foo'
        });
        expect(response.statusCode).toEqual(200);
        const payload = response.json();
        expect(payload).toHaveProperty('hello');
        expect(payload.hello).not.toBeNull();
    });
});
