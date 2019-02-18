const events = require('events');

class Grouper extends events.EventEmitter {
  constructor() {
    super();
    this.state = {}
  }

  groupBy(key, val) {
    return
  }
}


// map (specific code sending to master)

// groupBy (apply grouping to mapped values)

// reduce (code that is applied to grouped data)
