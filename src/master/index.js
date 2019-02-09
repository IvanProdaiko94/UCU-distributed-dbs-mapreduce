const events = require('events');

const opts = {
  port: process.env['MASTER_PORT']
};

class Master extends events.EventEmitter {
  constructor() {
    super();
    this.slaves = [];
  }

  registerSlave(slave) {
    this.slaves.push(slave);
    slave
      .on('error', err => {
        slave.destroy(err);
      })
      .on('data', () => {

      })
      .on('end', () => {

      })
      .on('close', () => {
        console.log('CONNECTION CLOSED')
      });
  }

  registerMapper(mapper) {
    this.slaves.forEach(slave => {
      slave.write()
    });
  }

  start() {
    jayson.tcp()
  }

  abort() {

  }
}

new Master().start();
