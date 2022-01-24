import { Amq } from '../amq';

describe('Amq instance Unit tests', () => {
  it('should contain "connection_string" equal to the value given in the constructor', async () => {
    const connectionString = 'some_connection_string';
    const amq = new Amq(connectionString);
    expect(amq.connection_string).toEqual(connectionString);
  });
});
