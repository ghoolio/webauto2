// utils/commonUtils.js

/**
 * Sleep/delay for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after the specified time
 */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff retry for operations that may fail temporarily
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise} - Result of the operation
 */
async function exponentialBackoff(operation, maxRetries = 5, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Retry ${retries} after ${delay}ms`);
      await sleep(delay);
    }
  }
}

/**
 * Get a random integer between min and max
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} - Random integer
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Add random delay to simulate human interaction
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} variationPercent - Variation percentage (0-100)
 * @returns {Promise} - Promise that resolves after random delay
 */
async function humanLikeDelay(baseDelay, variationPercent = 25) {
  const variation = baseDelay * (variationPercent / 100);
  const actualDelay = baseDelay + getRandomInt(-variation, variation);
  return sleep(Math.max(0, actualDelay));
}

/**
 * Generate timestamp string for logging
 * @returns {string} - Formatted timestamp
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

/**
 * Log message with timestamp
 * @param {string} message - Message to log
 * @param {string} level - Log level (default: 'info')
 */
function logWithTimestamp(message, level = 'info') {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}]`;
  
  switch (level.toLowerCase()) {
    case 'error':
      console.error(`${prefix} ERROR: ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} WARNING: ${message}`);
      break;
    case 'debug':
      console.debug(`${prefix} DEBUG: ${message}`);
      break;
    case 'info':
    default:
      console.log(`${prefix} ${message}`);
      break;
  }
}

/**
 * Format a number with leading zeros
 * @param {number} num - Number to format
 * @param {number} length - Desired length
 * @returns {string} - Formatted number with leading zeros
 */
function padWithZeros(num, length = 2) {
  return String(num).padStart(length, '0');
}

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Create a throttled function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if a value is a plain object
 * @param {*} value - Value to check
 * @returns {boolean} - Whether value is a plain object
 */
function isPlainObject(value) {
  return value !== null && 
         typeof value === 'object' && 
         Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
function mergeDeep(target, source) {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source;
  }
  
  const output = Object.assign({}, target);
  
  Object.keys(source).forEach(key => {
    if (isPlainObject(source[key])) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = mergeDeep(target[key], source[key]);
      }
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  });
  
  return output;
}

/**
 * Retry a function multiple times
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} - Result of the function
 */
async function retry(fn, maxRetries = 3, delay = 1000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      console.log(`Attempt ${retries}/${maxRetries} failed: ${error.message}`);
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      await sleep(delay);
    }
  }
}

module.exports = {
  sleep,
  exponentialBackoff,
  getRandomInt,
  humanLikeDelay,
  getTimestamp,
  logWithTimestamp,
  padWithZeros,
  debounce,
  throttle,
  isPlainObject,
  mergeDeep,
  retry
};