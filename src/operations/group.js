module.exports = function (previous, current) {
  const prop = 'genre';
  const prevVal = previous[current[prop]];
  previous[current[prop]] = prevVal ? prevVal + 1 : 1;
  return previous
};