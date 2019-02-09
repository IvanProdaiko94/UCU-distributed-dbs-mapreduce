const vm = require('vm');
const net = require('net');
const events = require('events');

class Slave extends events.EventEmitter {
  constructor() {
    super();
    this.master = null;
  }

  register() {

  }

  start(code) {
    vm.createContext()
  }

  abort() {

  }
}

new Slave().start();
