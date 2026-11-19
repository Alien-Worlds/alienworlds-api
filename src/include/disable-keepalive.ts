// Node 19 turned keep-alive on for the default HTTP agents (it was off in Node 17,
// which this code was written for). node-fetch 2 and ethers 5 then reuse sockets
// that the server has already closed, which fails with
// "FetchError: ... reason: socket hang up". Turn it off again, as it was.
//
// Import this before anything makes an outgoing HTTP request. It changes the
// existing global agents instead of replacing them, so the New Relic agent's
// instrumentation of http and https stays in place.
const http = require('http');
const https = require('https');

http.globalAgent.keepAlive = false;
https.globalAgent.keepAlive = false;
