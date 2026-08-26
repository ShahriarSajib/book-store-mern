/**
 * utils/pick.js — object field picker.
 */
function pick(source, keys) {
  return keys.reduce((acc, key) => {
    if (source && source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
}

export default pick;
