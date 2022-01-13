import { createApiTestEnvironment } from '../environments'
import { MongodbSpies, mockClient } from '../../__mocks__/mongodb';

const environment = createApiTestEnvironment();
environment.initialize();

jest.mock('mongodb');

describe('Mines API Test', () => {
    const {
        findSpy,
    }: MongodbSpies = jest.requireMock('mongodb');

    beforeEach(() => {
        findSpy.mockClear();
    });

    it('should return 200', async () => {

        //TODO replace fastify.mongodb to mockClient

        const response = await environment.server.inject({
            method: 'GET',
            url: '/v1/alienworlds/mines?land_id=1099512959271'
        });

        expect(response.statusCode).toEqual(200);
        expect(findSpy).toHaveBeenCalledWith({
            land_id: '1099512959271'
        });
    });

});
