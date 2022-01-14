import { createApiTestEnvironment } from '../environments'

const environment = createApiTestEnvironment();
environment.initialize();

jest.mock('mongodb');

describe('Mines API Test', () => {

    it('should return 200', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/v1/alienworlds/mines?land_id=1099512958747'
        });

        expect(response.statusCode).toEqual(200)
        expect(response.results[0].miner).toEqual('fakeminer1.wam')
    });

});
