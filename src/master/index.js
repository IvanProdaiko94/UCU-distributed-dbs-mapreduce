const http = require('http');
const fs = require('fs');
const url = require('url');
const colors = require('colors/safe');
const WebSocket = require('ws');
const readEnv = require('read-env');
const reducer = require('../operations/reduce');
const wsutils = require('../utils/ws');
const events = require('../utils/events');

const config = readEnv.default({prefix: 'APP'});
console.log(`Process started with config: ${JSON.stringify(config, null, 2)}`);

const mapFile = fs.readFileSync(config.mapperFile).toString();
const groupByFile = fs.readFileSync(config.grouperFile).toString();

const wss = new WebSocket.Server({ host: config.masterHost, port: config.masterPort }, (err) => {
  if (err != null) {
    throw err
  }
  console.log(`Web Socket server started on address ws://${config.masterHost}:${config.masterPort}`)
});

const results = [];

let finalResult;

wss.on('connection', (ws) => {
  console.log(`connection opened. Current number of connections is ${wss.clients.size}`);
  ws.on('message', (message) => {
    let msg;
    try {
      msg = JSON.parse(message)
    } catch (e) {
      console.error(e);
      return;
    }
    console.log(msg);
    switch (msg.message) {
      case events.REGISTER:
        wsutils.send(ws, {
          message: events.REGISTER,
          payload: {
            executable: {
              mapFile,
              groupByFile
            },
            id: wss.clients.size - 1
          }
        });
        return;
      case events.RESULT:
        results.push(msg.payload);
        if (config.slaveReplicationFactor === results.length) {
          finalResult = reducer(results);
          console.log(colors.green(finalResult));
        }
        return;
      case events.ERROR:
        console.error(msg.payload.error);
        return;
      default:
        wsutils.send(ws,{
          message: events.NOT_FOUND,
          payload: null
        })
    }
  });
});

setTimeout(() => {
  if (config.slaveReplicationFactor !== wss.clients.size) {
    wss.close(() => {
      console.error(`Replication factor is not appropriate. Expect: ${config.slaveReplicationFactor}, got: ${wss.clients.size}`);
      process.exit(1);
    });
  }

  const server = http.createServer((req, res) => {
    const urlParts = url.parse(req.url);
    console.log(`Got http request. Method: ${req.method}. Path: ${urlParts.pathname}`);
    let status = 404;
    if (req.method === 'POST' && urlParts.pathname === '/start') {
      console.log(colors.blue('Send "START" event to workers'));
      wsutils.broadcast(wss, {
        message: events.START,
        payload: null
      });
      status = 204;
    } else if (req.method === 'GET' && urlParts.pathname === '/result') {
      if (finalResult !== undefined) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify(finalResult, null, 2));
        return;
      } else {
        status = 202;
      }
    }
    res.writeHead(status);
    res.end();
  });

  server.listen(config.masterHttpPort, config.masterHost, (err) => {
    if (err != null) {
      throw err
    }
    console.log(`Http server started on address http://${config.masterHost}:${config.masterHttpPort}`);
  });
}, config.initialDelay * 1000);
