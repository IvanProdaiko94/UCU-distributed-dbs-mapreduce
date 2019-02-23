const http = require('http');
const fs = require('fs');
const url = require('url');

const colors = require('colors/safe');
const WebSocket = require('ws');
const readEnv = require('read-env');

const wsutils = require('../utils/ws');
const reducer = require('../operations/reduce');

const config = readEnv.default({prefix: 'APP'});

const mapFile = fs.readFileSync(config.mapFile).toString();

const wss = new WebSocket.Server({ host: config.masterHost, port: config.masterPort }, (err) => {
  if (err != null) {
    throw err
  }
  console.log(`Web Socket server started on address ws://${config.masterHost}:${config.masterPort}`)
});

const results = [];

wss.on('connection', function connection(ws) {
  console.log(`connection opened. Current number of connections is ${wss.clients.size}`);
  ws.on('message', function incoming(message) {
    let msg;
    try {
      msg = JSON.parse(message)
    } catch (e) {
      console.error(e);
      return;
    }
    console.log(msg);
    switch (msg.message) {
      case 'register':
        wsutils.send(ws, {
          message: 'register',
          payload: {
            executable: mapFile,
            id: wss.clients.size - 1
          }
        });
        return;
      case 'result':
        results.push(msg.payload);
        if (config.slaveReplicationFactor === results.length) {
          console.log(
            colors.green(
              reducer(results)
            )
          );
        }
        return;
      default:
        wsutils.send(ws,{
          message: 'not found',
          payload: null
        })
    }
  });
});

setTimeout(() => {
  if (config.slaveReplicationFactor !== wss.clients.size) {
    wss.close(() => {
      console.error(`Replica factor is not appropriate. Expect: ${config.slaveReplicationFactor}, got: ${wss.clients.size}`);
      process.exit(1);
    });
  }

  const server = http.createServer((req, res) => {
    const urlParts = url.parse(req.url);
    if (req.method === 'POST' && urlParts.pathname === '/start') {
      wsutils.broadcast(wss, {
        message: 'start',
        payload: null
      })
    }
    res.writeHead(204);
    res.end();
  });
  server.listen(config.masterPort + 1, config.masterHost, (err) => {
    if (err != null) {
      throw err
    }
    console.log(`Http server started on address http://${config.masterHost}:${config.masterPort + 1}`);
  });
}, config.initialDelay * 1000);
