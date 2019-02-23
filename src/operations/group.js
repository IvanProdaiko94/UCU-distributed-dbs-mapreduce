module.exports = (prop) => {
  return (previous, current) => {
    const prevVal = previous[current[prop]];
    previous[current[prop]] = prevVal ? prevVal + 1 : 1;
    return previous
  };
};