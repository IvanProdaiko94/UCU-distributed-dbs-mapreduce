const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const readEnv = require('read-env');

const wsutils = require('../utils/ws');

const config = readEnv.default({prefix: 'APP'});

const mapperFile = fs.readFileSync(config.mapperFile).toString();

const wss = new WebSocket.Server({ host: config.masterHost, port: config.masterPort }, (err) => {
  if (err != null) {
    throw err
  }
  console.log(`Web Socket server started on address ws://${config.masterHost}:${config.masterPort}`)
});

wss.on('connection', function connection(ws) {
  console.log('connection');
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
            executable: mapperFile
          }
        });
        return;
      default:
        wsutils.send(ws,{
          message: 'not found',
          payload: null
        })
    }
  });
});

wss.broadcast = function(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      wsutils.send(client, data);
    }
  });
};

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
      wss.broadcast({
        message: 'start',
        payload: null
      })
    }
  });
  server.listen(config.masterPort + 1, config.masterHost, (err) => {
    if (err != null) {
      throw err
    }
    console.log(`Http server started on address http://${config.masterHost}:${config.masterPort + 1}`);
  });
}, config.initialDelay * 1000);
