const createCursor = function (length, map) {
  const arr = Array
    .from({length})
    .map(map ? map : (el) => el);

  let _cursor = 0;

  return {
    next() {
      if (_cursor === length - 1) {
        _cursor = 0;
      } else {
        _cursor += 1;
      }
      return arr[_cursor];
    },
  };
};

module.exports = createCursor;