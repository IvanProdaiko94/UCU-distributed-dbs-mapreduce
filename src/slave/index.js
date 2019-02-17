const WebSocket = require('ws');
const vm = require('vm');
const readEnv = require('read-env');

const wsutils = require('../utils/ws');

const config = readEnv.default({prefix: 'APP'});

let mapper = '';

console.log(`Connecting to ws://${config.masterHost}:${config.masterPort}`);
const ws = new WebSocket(`ws://${config.masterHost}:${config.masterPort}`, {
  perMessageDeflate: false
});

ws.on('open', function open() {
  wsutils.send(ws, {
    message: 'register',
    payload: null
  });
});

ws.on('message', function incoming(data) {
  let msg;
  try {
    msg = JSON.parse(data)
  } catch (e) {
    console.error(e);
    return;
  }
  console.log(msg);
  switch (msg.message) {
    case 'register':
      mapper = msg.payload.executable;
      return;
    case 'start':
      const ctx = vm.createContext({console});
      return;
    default:
      wsutils.send(ws,{
        message: 'not found',
        payload: null
      })
  }
});