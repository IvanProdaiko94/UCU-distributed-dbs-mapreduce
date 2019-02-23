module.exports = (arr) => {
  return arr.reduce((acc, el) => {
    Object.keys(el).map(key => {
      if (acc[key] !== undefined) {
        if (typeof acc[key] === 'number') {
          acc[key] = acc[key] + el[key]
        } else if (typeof acc[key] === 'string') {
          acc[key] = acc[key] + el[key]
        } else if (typeof acc[key] === 'boolean') {
          acc[key] = acc[key] && el[key]
        } else if (Array.isArray(acc[key])) {
          acc[key] = acc[key].concat(el[key])
        } else {
          acc[key] = Object.assign(acc[key], el[key])
        }
      } else {
        acc[key] = el[key]
      }
    });
    return acc
  })
};
