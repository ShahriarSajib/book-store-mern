/**
 * utils/logger.js — minimal structured logger.
 */
/* eslint-disable no-console */
function ts() {
  return new Date().toISOString();
}

const logger = {
  info: (...args) => console.log(`[info]`, ...args),
  warn: (...args) => console.warn(`[warn]`, ts(), ...args),
  error: (...args) => console.error(`[error]`, ts(), ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== "production") console.log(`[debug]`, ts(), ...args);
  },
};

export default logger;
