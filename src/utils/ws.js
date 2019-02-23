const WebSocket = require('ws');

const send = (ws, msg) => {
  ws.send(JSON.stringify(msg))
};

const broadcast = (wss, data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      send(client, data);
    }
  });
};

module.exports = {
  send,
  broadcast
};