const fs = require('fs');
const http2 = require('http2');

const readEnv = require('read-env');

const config = Object.assign(
  readEnv.default({prefix: 'MASTER'}),
  readEnv.default({prefix: 'MAPPER'}),
  {exclusive:true}
);

const mapperFile = fs.readFileSync(config.file).toString();