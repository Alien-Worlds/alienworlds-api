#!/usr/bin/env node
// Used by the production stage of the Dockerfile. Rewrites the api, blockrange, filler
// and processor scripts in package.json from "tsc-watch --onSuccess "node dist/x.js""
// to "node dist/x.js", so `yarn api` (and the others) keep working in an image that
// has no TypeScript. Anything after the script name is still passed on to node.
const fs = require('fs');
const file = process.argv[2] || 'package.json';
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const name of ['api', 'blockrange', 'filler', 'processor']) {
  const match = /^tsc-watch --onSuccess "(node dist\/[a-z_]+\.js[^"]*)"$/.exec(pkg.scripts[name] || '');
  if (!match) throw new Error(`script "${name}" is not in the expected tsc-watch form: ${pkg.scripts[name]}`);
  pkg.scripts[name] = match[1];
}
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log('scripts now run the compiled code:', ['api', 'blockrange', 'filler', 'processor'].map(n => `${n}: ${pkg.scripts[n]}`).join(' | '));
