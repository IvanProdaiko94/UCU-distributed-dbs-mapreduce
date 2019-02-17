const http2 = require('http2');
const vm = require('vm');

const readEnv = require('read-env');

const config = Object.assign(
  readEnv.default({prefix: 'MASTER'}),
  readEnv.default({prefix: 'SLAVE'})
);

const ctx = vm.createContext({console});
let mapper = '';