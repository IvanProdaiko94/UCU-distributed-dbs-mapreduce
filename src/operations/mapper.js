const events = require('events');

class Mapper extends events.EventEmitter {

  constructor() {
    super();
    this.on('item', (val, i) => {
      map(val, i)
    })
  }

  map(val, i) {

  }

}
