const fs = require('fs');
const csv = require('csv-streamify');
const readEnv = require('read-env');

const config = readEnv.default({ prefix: 'PRE' });

const createCursor = function (length) {
  const streams = Array
    .from({length})
    .map((el, i) => fs.createWriteStream(`./${config.outputDir}/${i}.csv`));

  let _cursor = 0;

  return {
    next() {
      if (_cursor === length - 1) {
        _cursor = 0;
      } else {
        _cursor += 1;
      }
      return streams[_cursor];
    },
  };
};

const cursor = createCursor(config.partitioningFactor);

fs.createReadStream(config.datasetPath).pipe(csv({quote: '"'}))
  .on('error', function(err) {
    console.error(err);
  })
  .on('data', function(data) {
    const stream = cursor.next();
    stream.write(data.join(',') + '\n');
  });
