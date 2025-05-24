// core/errorHandler.js
const { sleep } = require('../utils/commonUtils');
const { checkFor503Error } = require('../utils/browserUtils');
const recoveryUtils = require('../utils/recoveryUtils');

/**
 * Handle errors during quiz execution with comprehensive recovery strategies
 * @param {Object} page - Puppeteer page object
 * @param {Error} error - The error that occurred
 * @param {number} retryCount - Current retry count
 * @param {number} maxRetries - Maximum number of retries
 * @returns {boolean} - Whether to retry the quiz
 */
async function handleError(page, error, retryCount, maxRetries) {
  console.log(`Handling error: ${error.message}`);
  
  // Take error screenshot if possible
  try {
    await page.screenshot({ 
      path: `error-screenshot-${Date.now()}.png`, 
      fullPage: true 
    });
    console.log('Error screenshot saved');
  } catch (screenshotError) {
    console.log('Failed to save error screenshot:', screenshotError.message);
  }
  
  // Check for specific error types
  
  // Check for 503 error
  const is503Error = await checkFor503Error(page);
  if (is503Error) {
    console.log("TYPO3 503 error detected. Waiting before retry...");
    await sleep(5000);
    return true;
  }
  
  // Check for session conflict
  const hasSessionConflict = await page.evaluate(() => {
    return document.body.innerText.includes('bereits mit einem anderen Benutzer') ||
           document.body.innerText.includes('bereits angemeldet') ||
           document.body.innerText.includes('Cookie konnte nicht gefunden werden');
  }).catch(() => false);
  
  if (hasSessionConflict) {
    console.log("Session conflict detected, attempting recovery...");
    await recoveryUtils.handleSessionConflict(page);
    return true;
  }
  
  // Check if we've reached max retries
  if (retryCount >= maxRetries) {
    console.log(`Maximum retries (${maxRetries}) reached. Giving up.`);
    return false;
  }
  
  // General retry with exponential backoff
  const delay = Math.pow(2, retryCount) * 1000;
  console.log(`Waiting ${delay}ms before retry ${retryCount+1}/${maxRetries}...`);
  await sleep(delay);
  
  return true;
}

/**
 * Attempt to recover from an error that occurred during a specific step
 * @param {Object} page - Puppeteer page object
 * @param {Object} frame - Current frame where the error occurred
 * @param {Object} step - The step that failed
 * @param {Error} error - The error that occurred
 * @returns {boolean} - Whether recovery was successful
 */
async function recoverFromStepError(page, frame, step, error) {
  console.log(`Attempting to recover from error in step type "${step.type}": ${error.message}`);
  
  // Try different recovery strategies based on step type
  switch (step.type) {
    case 'RISK_FACTORS_SLIDE':
      return await recoveryUtils.recoverFromRiskFactorsError(frame);
      
    case 'MESSAGE_SLIDE':
      return await recoveryUtils.recoverFromMessageSlideError(frame);
      
    case 'SLIDER_INTERACTION_SLIDE':
      return await recoveryUtils.recoverFromSliderError(frame);
      
    case 'CAROUSEL_SLIDE':
      return await recoveryUtils.recoverFromCarouselError(frame);
      
    // Add more step-specific recovery strategies as needed
      
    default:
      // Generic recovery: try to find and click the next button
      console.log('Attempting generic recovery: looking for next button...');
      
      try {
        const nextButtonClicked = await recoveryUtils.findAndClickNextButton(frame);
        return nextButtonClicked;
      } catch (recoveryError) {
        console.log('Generic recovery failed:', recoveryError.message);
        return false;
      }
  }
}

/**
 * Check for common error conditions after each step
 * @param {Object} page - Puppeteer page object
 * @param {Object} frame - Current frame being used
 */
async function checkForCommonErrors(page, frame) {
  // Check for session timeout message
  const hasSessionTimeout = await page.evaluate(() => {
    return document.body.innerText.includes('Sitzung ist abgelaufen') ||
           document.body.innerText.includes('session has expired') ||
           document.body.innerText.includes('timed out');
  }).catch(() => false);
  
  if (hasSessionTimeout) {
    console.log('Session timeout detected, attempting recovery...');
    await recoveryUtils.handleSessionTimeout(page);
    return;
  }
  
  // Check for 503 error
  const is503Error = await checkFor503Error(page);
  if (is503Error) {
    console.log('503 error detected during step execution');
    await recoveryUtils.handle503Error(page);
    return;
  }
  
  // Check for modal dialogs that might interfere with next steps
  const hasModal = await page.evaluate(() => {
    // Look for common modal indicators
    return document.querySelector('.modal.show') !== null ||
           document.querySelector('.modal[style*="display: block"]') !== null ||
           document.querySelector('.dialog.active') !== null;
  }).catch(() => false);
  
  if (hasModal) {
    console.log('Modal dialog detected, attempting to close...');
    await recoveryUtils.closeModalDialog(page);
  }
  
  // If we have access to the frame, check for SCORM-specific issues
  if (frame) {
    try {
      // Check for stuck buttons or elements
      const hasStuckElements = await frame.evaluate(() => {
        // Check for elements that might be stuck in a non-interactive state
        const grayButtons = document.querySelectorAll('[data-model-id*="Button"][style*="opacity: 0.5"]');
        const overlayElements = document.querySelectorAll('.overlay.shown');
        
        return grayButtons.length > 0 || overlayElements.length > 0;
      });
      
      if (hasStuckElements) {
        console.log('Detected potentially stuck elements, attempting recovery...');
        await recoveryUtils.recoverFromStuckElements(frame);
      }
    } catch (frameError) {
      console.log('Error checking for stuck elements:', frameError.message);
    }
  }
}

module.exports = {
  handleError,
  recoverFromStepError,
  checkForCommonErrors
};