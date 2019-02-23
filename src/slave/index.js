const vm = require('vm');
const fs = require('fs');
const WebSocket = require('ws');
const readEnv = require('read-env');
const thr2_reduce = require('through2-reduce');
const thr2_map = require('through2-map');
const csv = require('csv-streamify');
const streamToPromise = require('stream-to-promise');
const tap = require('tap-stream');

const wsutils = require('../utils/ws');
const groupBy = require('../operations/group');

const config = readEnv.default({prefix: 'APP'});

let map = '';
let id;

const mapper = thr2_map(
  {objectMode: true},
  (chunk) => {
    return {genre: chunk[4]}
  // const ctx = vm.createContext({key: chunk[0], val: chunk});
  // return vm.runInContext(map, ctx);
});

const grouper = thr2_reduce({objectMode: true}, groupBy(config.propToGroupBy), {});

console.log(`Connecting to ws://${config.masterHost}:${config.masterPort}`);
const ws = new WebSocket(`ws://${config.masterHost}:${config.masterPort}`, {perMessageDeflate: false});

ws.on('open', function open() {
  wsutils.send(ws, {
    message: 'register',
    payload: null
  });
});

ws.on('message', (data) => {
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
      id = msg.payload.id;
      map = msg.payload.executable;
      return;
    case 'start':
      console.log(`start mapping of ${id}`);
      streamToPromise(
        fs.createReadStream(`./data/${id}.csv`)
        .pipe(csv({quote: '"'}))
        .pipe(mapper)
        .pipe(tap(() => console.log(`Map: processing of data in ${id}`)))
        .pipe(grouper)
      )
        .then(([result]) => {
          if (result === 'genre')
          wsutils.send(ws, {
            message: 'result',
            payload: result
          })
        }).catch(err => {
          console.error(err);
          wsutils.send(ws, {
            message: 'error',
            payload: {
              error: err
            }
          })
        });
      return;
  }
});