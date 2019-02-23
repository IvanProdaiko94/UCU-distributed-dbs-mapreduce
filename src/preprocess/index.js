const fs = require('fs');
const csv = require('csv-streamify');
const readEnv = require('read-env');

const createCursor = require('../utils/coursor');

const config = readEnv.default({ prefix: 'PRE' });

const cursor = createCursor(config.partitioningFactor, (el, i) => fs.createWriteStream(`./${config.outputDir}/${i}.csv`));

fs.createReadStream(config.datasetPath).pipe(csv({quote: '"'}))
  .on('error', function(err) {
    console.error(err);
  })
  .on('data', function(data) {
    const stream = cursor.next();
    data[data.length - 1] = '"' + data[data.length - 1].replace(/\n/g, " ").replace(/"/g, "'") + '"'; // replace \n in order to read these .csv files properly
    stream.write(data.join(',') + '\n');
  });
