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
const events = require('../utils/events');

const config = readEnv.default({prefix: 'APP'});
console.log(`Process started with config: ${JSON.stringify(config, null, 2)}`);

let map;
let groupBy;
let id;
let IN_PROCESS = false;

const mapper = thr2_map({objectMode: true}, (chunk) => map.runInNewContext({element: chunk}));
const grouper = thr2_reduce({objectMode: true}, (previous, current) => groupBy.runInNewContext({previous, current}), {});

const masterUri = `ws://${config.masterHost}:${config.masterPort}`;

console.log(`Connecting to ${masterUri}`);
const ws = new WebSocket(masterUri, {perMessageDeflate: false});

ws.on('open', function open() {
  wsutils.send(ws, {
    message: events.REGISTER,
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
    case events.REGISTER:
      id = msg.payload.id;
      const executable = msg.payload.executable;
      map = new vm.Script(executable.mapFile);
      groupBy = new vm.Script(executable.groupByFile);
      return;
    case events.START:
      if (IN_PROCESS) {
        wsutils.send(ws, {
          message: events.ERROR,
          payload: {
            error: 'worker in process'
          }
        });
        return
      }
      console.log(`start mapping of ${id}`);
      streamToPromise(
        fs.createReadStream(`./data/${id}.csv`)
        .pipe(csv({quote: '"'}))
        .pipe(mapper)
        .pipe(tap(() => console.log(`Map: processing of data in ${id}`)))
        .pipe(grouper)
      )
        .then(([result]) => {
          wsutils.send(ws, {
            message: events.RESULT,
            payload: result
          })
        }).catch(err => {
          console.error(err);
          wsutils.send(ws, {
            message: events.ERROR,
            payload: {
              error: err
            }
          })
        })
        .then(() => {
          IN_PROCESS = false;
        });
  }
});
