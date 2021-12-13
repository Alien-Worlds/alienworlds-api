
import {test} from "tap";
import app from "../app";

test('requests the "/" route', async t => {

    const response = await app.inject({
        method: 'GET',
        url: '/'
    })

    t.equal(response.statusCode, 200, 'returns a status code of 200');
    app.close();
});
