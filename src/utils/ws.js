const send = (ws, msg) => {
  ws.send(JSON.stringify(msg))
};

module.exports = {
  send
};