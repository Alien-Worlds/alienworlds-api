// Fake chain endpoints for the /token route. Plain Node, no dependencies.
//   POST /v1/chain/get_currency_stats    -> fixed supply
//   POST /v1/chain/get_currency_balance  -> fixed balance
//   POST /  (JSON-RPC, ethers)           -> fixed chain id and a fixed balanceOf
const http = require('http');
const word = n => BigInt(n).toString(16).padStart(64, '0');

http
  .createServer((req, res) => {
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
