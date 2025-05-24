// core/stateManager.js
/**
 * State manager to track quiz progress
 * 
 * This module tracks the current state of quiz execution to help with
 * logging, debugging, and recovery if errors occur.
 */

// State variables
let currentQuiz = null;
let currentStep = null;
let currentStepIndex = -1;
let quizStartTime = null;
let stepsCompleted = [];
let lastError = null;

/**
 * Initialize quiz state
 * @param {Object} quiz - Quiz definition
 */
function initQuizState(quiz) {
  currentQuiz = quiz;
  currentStep = null;
  currentStepIndex = -1;
  quizStartTime = new Date();
  stepsCompleted = [];
  lastError = null;
  
  console.log(`Initialized state for quiz: ${quiz.name}`);
  console.log(`Quiz has ${quiz.sequence.length} steps`);
}

/**
 * Set the current step being executed
 * @param {number} index - Step index in the sequence
 * @param {Object} step - Step definition
 */
function setCurrentStep(index, step) {
  currentStepIndex = index;
  currentStep = step;
  
  console.log(`Setting current step to index ${index}: ${step.type} - ${step.action}`);
}

/**
 * Mark the current step as completed
 * @param {boolean} success - Whether the step completed successfully
 */
function completeCurrentStep(success = true) {
  if (currentStep && currentStepIndex >= 0) {
    stepsCompleted.push({
      index: currentStepIndex,
      type: currentStep.type,
      action: currentStep.action,
      success,
      timestamp: new Date()
    });
    
    console.log(`Marked step ${currentStepIndex} (${currentStep.type}) as ${success ? 'completed' : 'failed'}`);
  }
}

/**
 * Record an error that occurred during quiz execution
 * @param {Error} error - The error that occurred
 * @param {number} stepIndex - The step index where the error occurred
 */
function recordError(error, stepIndex = currentStepIndex) {
  lastError = {
    message: error.message,
    stack: error.stack,
    stepIndex,
    step: currentStep,
    timestamp: new Date()
  };
  
  console.log(`Recorded error at step ${stepIndex}: ${error.message}`);
}

/**
 * Get the current quiz execution status
 * @returns {Object} - Current status information
 */
function getStatus() {
  return {
    quiz: currentQuiz ? currentQuiz.name : null,
    currentStepIndex,
    currentStep,
    stepsCompleted: stepsCompleted.length,
    totalSteps: currentQuiz ? currentQuiz.sequence.length : 0,
    elapsedTime: quizStartTime ? (new Date() - quizStartTime) / 1000 : 0,
    lastError
  };
}

/**
 * Get detailed information about steps completed
 * @returns {Array} - Array of completed steps
 */
function getCompletedSteps() {
  return [...stepsCompleted];
}

/**
 * Reset the state manager
 */
function reset() {
  currentQuiz = null;
  currentStep = null;
  currentStepIndex = -1;
  quizStartTime = null;
  stepsCompleted = [];
  lastError = null;
  
  console.log('State manager reset');
}

// Export the state manager functions
module.exports = {
  initQuizState,
  setCurrentStep,
  completeCurrentStep,
  recordError,
  getStatus,
  getCompletedSteps,
  reset
};