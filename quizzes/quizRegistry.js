// quizzes/quizRegistry.js
/**
 * Quiz Registry
 * 
 * This module manages the registration and retrieval of all available quizzes.
 * It allows enabling/disabling quizzes and retrieving quiz definitions.
 */

// Import all quiz definitions
const dorithricin = require('./dorithricin');
const cystinolAkut = require('./cystinolAkut');
const perenterol = require('./perenterol');
const soventol = require('./soventol');
// Import other quizzes as they are created

// Repository of all available quizzes
const quizzes = {
  'Soventol': soventol,
  'Perenterol': perenterol,
  'Dorithricin': dorithricin,
  'CystinolAkut': cystinolAkut,
  // Add other quizzes as they are created
};

// List of enabled quizzes (can be controlled through configuration)
let enabledQuizzes = [
  'Soventol',
  'Perenterol',
  'Dorithricin',
  'CystinolAkut',
  // 'Dorithricin',
  // Enable/disable quizzes as needed
];

/**
 * Get a quiz definition by name
 * @param {string} quizName - Name of the quiz to retrieve
 * @returns {Object|null} - The quiz definition or null if not found
 */
function getQuiz(quizName) {
  return quizzes[quizName] || null;
}

/**
 * Get the list of all available quizzes
 * @returns {string[]} - Array of quiz names
 */
function getAllQuizzes() {
  return Object.keys(quizzes);
}

/**
 * Get the list of currently enabled quizzes
 * @returns {string[]} - Array of enabled quiz names
 */
function getEnabledQuizzes() {
  return [...enabledQuizzes];
}

/**
 * Enable a quiz by name
 * @param {string} quizName - Name of the quiz to enable
 * @returns {boolean} - True if the quiz was enabled, false if it doesn't exist
 */
function enableQuiz(quizName) {
  if (quizzes[quizName] && !enabledQuizzes.includes(quizName)) {
    enabledQuizzes.push(quizName);
    return true;
  }
  return false;
}

/**
 * Disable a quiz by name
 * @param {string} quizName - Name of the quiz to disable
 * @returns {boolean} - True if the quiz was disabled, false if it wasn't enabled
 */
function disableQuiz(quizName) {
  const index = enabledQuizzes.indexOf(quizName);
  if (index !== -1) {
    enabledQuizzes.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Enable multiple quizzes at once
 * @param {string[]} quizNames - Array of quiz names to enable
 */
function enableQuizzes(quizNames) {
  quizNames.forEach(name => enableQuiz(name));
}

/**
 * Disable multiple quizzes at once
 * @param {string[]} quizNames - Array of quiz names to disable
 */
function disableQuizzes(quizNames) {
  quizNames.forEach(name => disableQuiz(name));
}

/**
 * Register a new quiz dynamically
 * @param {string} quizName - Name of the quiz to register
 * @param {Object} quizDefinition - The quiz definition object
 * @param {boolean} enable - Whether to enable the quiz after registration
 * @returns {boolean} - True if registration succeeded, false if quiz already exists
 */
function registerQuiz(quizName, quizDefinition, enable = true) {
  if (quizzes[quizName]) {
    return false; // Quiz already exists
  }
  
  quizzes[quizName] = quizDefinition;
  
  if (enable) {
    enableQuiz(quizName);
  }
  
  return true;
}

// Export the registry functions as an object for easier importing
const quizRegistry = {
  getQuiz,
  getAllQuizzes,
  getEnabledQuizzes,
  enableQuiz,
  disableQuiz,
  enableQuizzes,
  disableQuizzes,
  registerQuiz
};

module.exports = { quizRegistry };