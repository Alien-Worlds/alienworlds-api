// Fake chain endpoints for the /token route. Plain Node, no dependencies.
//   POST /v1/chain/get_currency_stats    -> fixed supply
//   POST /v1/chain/get_currency_balance  -> fixed balance
//   POST /  (JSON-RPC, ethers)           -> fixed chain id and a fixed balanceOf
//   GET  /v2/history/get_actions         -> one fixed setabi action per account (fetch_abis)
//
// It also refuses to serve a second request on the same connection: it drops the
// socket, as a server that has already closed an idle keep-alive connection would.
// A client that reuses sockets (Node 19+ default agents, node-fetch 2, ethers 5)
// then fails with "socket hang up". The api and fetch_abis must turn keep-alive
// off (src/include/disable-keepalive.ts) to get through.
const http = require('http');
const word = n => BigInt(n).toString(16).padStart(64, '0');

http
  .createServer((req, res) => {
    if (req.socket.served) return req.socket.destroy();
    req.socket.served = true;
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      const send = (obj, status = 200) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(obj));
      };
      if (req.url === '/v1/chain/get_currency_stats') {
        return send({ TLM: { supply: '1000000000.0000 TLM', max_supply: '10000000000.0000 TLM', issuer: 'alien.worlds' } });
      }
      if (req.url === '/v1/chain/get_currency_balance') return send(['1000.0000 TLM']);
      if (req.url.startsWith('/v2/history/get_actions')) {
        const account = new URL(req.url, 'http://x').searchParams.get('account');
        return send({ actions: [{ block_num: 100 + account.length, act: { data: { abi: '0a0b0c' } } }] });
      }
      let rpc;
      try { rpc = JSON.parse(body); } catch (e) { return send({ error: 'bad request' }, 400); }
      const one = r => {
        const result =
          r.method === 'eth_chainId' ? '0x38' :
          r.method === 'net_version' ? '56' :
          r.method === 'eth_blockNumber' ? '0x1' :
          r.method === 'eth_call' ? '0x' + word(10000000n) :
          null;
        return { jsonrpc: '2.0', id: r.id, result };
      };
      send(Array.isArray(rpc) ? rpc.map(one) : one(rpc));
    });
  })
  .listen(8080, '0.0.0.0', () => console.log('mock-chain listening on 8080'));
