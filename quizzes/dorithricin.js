// quizzes/dorithricin.js
/**
 * Dorithricin Quiz Definition
 * 
 * This file uses the sequence-based approach to define the Dorithricin quiz
 * steps in a declarative, deterministic way. Each step specifies exactly what
 * type of interaction is needed and what action to take.
 */

// Import the carousel navigation function
const { forceCarouselNavigation } = require('./carouselNavigation');

// Import common utilities
const { sleep } = require('../utils/commonUtils');

/**
 * Enhanced carousel slide detection function
 * @param {Object} scormFrame - Puppeteer frame
 * @returns {Promise<boolean>} - Whether this is a carousel slide
 */
async function isCarouselSlide(scormFrame) {
  try {
    return await scormFrame.evaluate(() => {
      console.log('[BROWSER] Running enhanced carousel slide detection');
      
      // Strategy 1: Check for "MediBee erklärt" title specifically
      const hasMediBeeTitle = Array.from(document.querySelectorAll('div'))
        .some(el => el.textContent && 
             (el.textContent.includes('MediBee erklärt') || 
              el.textContent.includes('MediBee')));
      
      if (hasMediBeeTitle) {
        console.log('[BROWSER] Found MediBee title - confirmed carousel slide');
        return true;
      }
      
      // Strategy 2: Check for circular navigation dots at the bottom
      const navigationDots = Array.from(document.querySelectorAll('svg circle'))
        .filter(circle => {
          const rect = circle.getBoundingClientRect();
          // Look specifically for small circles near the bottom of the screen
          return rect.width < 20 && rect.width > 3 &&
                 rect.top > window.innerHeight * 0.6;
        });
      
      const hasDotNavigation = navigationDots.length >= 1; // Even one dot indicates a carousel
      
      if (hasDotNavigation) {
        console.log('[BROWSER] Found carousel navigation dots');
        return true;
      }
      
      // Strategy 3: Look for the left/right arrow buttons (orange circles)
      const orangeElements = Array.from(document.querySelectorAll('path[stroke="#FF9800"], path[fill="#FF9800"]'));
      const hasCarouselArrows = orangeElements.some(path => {
        const parent = path.closest('[data-model-id]');
        if (!parent) return false;
        
        const rect = parent.getBoundingClientRect();
        // Circular buttons at the sides
        return Math.abs(rect.width - rect.height) < 10 && // Circular
               rect.width < 50 && // Not too large
               rect.width > 20;   // Not too small
      });
      
      if (hasCarouselArrows) {
        console.log('[BROWSER] Found carousel navigation arrows');
        return true;
      }
      
      // Strategy 4: Look for known carousel button IDs
      const carouselButtonIds = ['6d9K1sUhmhU', '5gpDrv2tka1', '6jNtMM4JcZw', '6UFXGmwSpE1'];
      const hasCarouselButtons = carouselButtonIds.some(id => 
        document.querySelector(`[data-model-id="${id}"]`) !== null
      );
      
      if (hasCarouselButtons) {
        console.log('[BROWSER] Found known carousel button IDs');
        return true;
      }
      
      // If none of the conditions are met, it's not a carousel slide
      return false;
    });
  } catch (error) {
    console.error('Error checking for carousel slide:', error.message);
    return false;
  }
}

async function handleDorithricinSlider(scormFrame) {
  const { sleep } = require('../utils/commonUtils');
  
  try {
    console.log('Starting Dorithricin-specific slider interaction...');

    // Precise positioning calculation with movement detection
    const sliderInteractionResult = await scormFrame.evaluate(() => {
      // Find sliders and tracks
      const greenSlider = document.querySelector('[data-model-id="6ab5xvhtIXy"]');
      const yellowSlider = document.querySelector('[data-model-id="6BICHbFtmNU"]');
      const greenTrack = document.querySelector('[data-model-id="6ab5xvhtIXy_track"]');
      const yellowTrack = document.querySelector('[data-model-id="6BICHbFtmNU_track"]');

      if (!greenSlider || !yellowSlider || !greenTrack || !yellowTrack) {
        console.error('Could not find all slider elements');
        return { success: false, message: 'Slider elements not found' };
      }

      // Store initial positions
      const initialGreenTransform = greenSlider.style.transform;
      const initialYellowTransform = yellowSlider.style.transform;

      // Precise positioning calculations
      const greenFinalX = 756;  // Hardcoded precise rightmost position
      const yellowFinalX = 302;  // Hardcoded 4/10 position

      // Position sliders with precise transform
      greenSlider.style.transform = `translate(${greenFinalX}px, 0px) rotate(0deg) scale(1, 1)`;
      yellowSlider.style.transform = `translate(${yellowFinalX}px, 0px) rotate(0deg) scale(1, 1)`;
      
      // Dispatch comprehensive events to simulate user interaction
      const dispatchSliderEvents = (slider) => {
        const events = [
          new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
          new MouseEvent('mousemove', { bubbles: true, cancelable: true }),
          new Event('input', { bubbles: true }),
          new Event('change', { bubbles: true }),
          new MouseEvent('mouseup', { bubbles: true, cancelable: true })
        ];
        
        events.forEach(event => {
          slider.dispatchEvent(event);
        });
      };

      dispatchSliderEvents(greenSlider);
      dispatchSliderEvents(yellowSlider);

      return {
        success: true,
        initialGreenTransform,
        initialYellowTransform,
        finalGreenTransform: greenSlider.style.transform,
        finalYellowTransform: yellowSlider.style.transform
      };
    });

    // Log positioning results
    console.log('Detailed Slider Positioning:', JSON.stringify(sliderInteractionResult, null, 2));

    // Wait for slider movement to complete
    const sliderMovementComplete = await scormFrame.evaluate(() => {
      const greenSlider = document.querySelector('[data-model-id="6ab5xvhtIXy"]');
      const yellowSlider = document.querySelector('[data-model-id="6BICHbFtmNU"]');

      // Function to check if slider has moved
      const hasSliderMoved = (slider, initialTransform) => {
        return slider.style.transform !== initialTransform;
      };

      // Wait for slider movement with promise
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const greenMoved = hasSliderMoved(greenSlider, sliderInteractionResult.initialGreenTransform);
          const yellowMoved = hasSliderMoved(yellowSlider, sliderInteractionResult.initialYellowTransform);
          
          if (greenMoved && yellowMoved) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 10000);
      });
    });

    if (!sliderMovementComplete) {
      console.log('Slider movement did not complete as expected');
      // Still continue with the process
    }

    // Click Prüfen button
    console.log('Attempting to click Prüfen button...');
    await scormFrame.click('[data-model-id="6M3h8ouA9G1"]');
    
    // Wait for potential "Das stimmt leider nicht ganz" dialog
    await sleep(3000);

    // Dismiss "Das stimmt leider nicht ganz" dialog
    console.log('Attempting to dismiss "Das stimmt leider nicht ganz" dialog...');
    await scormFrame.click('[data-model-id="6qzg5u11jFL"]');

    // Wait for sliders to settle 
    await sleep(3000);

    // Click Prüfen button again
    console.log('Clicking Prüfen button again...');
    await scormFrame.click('[data-model-id="6M3h8ouA9G1"]');

    // Wait for sliders to settle 
    await sleep(10000);

    // Wait for dialog to appear and become visible
    console.log('Waiting for dialog close button to become visible...');
    const dialogCloseSelector = await scormFrame.evaluate(() => {
      // Selectors for potential dialog close buttons
      const dialogCloseSelectors = [
        '[data-model-id="5WyLjVP2wBG"]',   // Richtig dialog close
        '[data-model-id="6lGUORpiSn6"]'    // Tatsächlich dialog close
      ];
      
      // Wait for a close button to become visible
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          for (const selector of dialogCloseSelectors) {
            const closeButton = document.querySelector(selector);
            if (closeButton && 
                window.getComputedStyle(closeButton).display !== 'none' && 
                window.getComputedStyle(closeButton).visibility !== 'hidden') {
              clearInterval(checkInterval);
              resolve(selector);
              return;
            }
          }
        }, 200);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(null);
        }, 10000);
      });
    });

    // If a dialog close button is found, click it
    if (dialogCloseSelector) {
      console.log(`Attempting to dismiss dialog with selector: ${dialogCloseSelector}`);
      await scormFrame.click(dialogCloseSelector);
    } else {
      console.log('No dialog close button found within timeout');
    }

    // Wait for next button to become active (orange)
    console.log('Waiting for next button to become active...');
    const nextButtonActive = await scormFrame.evaluate(() => {
      const nextButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
      if (!nextButton) return false;

      // Check for orange stroke
      const orangeStrokePath = nextButton.querySelector('svg path[stroke="#FF9800"]');
      return !!orangeStrokePath;
    });

    // If next button is not active, wait a bit more
    if (!nextButtonActive) {
      await sleep(2000);
    }

    // Click next button
    console.log('Clicking next button...');
    await scormFrame.click('[data-model-id="5fQkkvFT1Hs"]');
    
    return true;
  } catch (error) {
    console.error('Dorithricin slider error:', error);
    
    // Additional fallback attempts
    try {
      await scormFrame.evaluate(() => {
        const rightX = window.innerWidth - 50;
        const bottomY = window.innerHeight - 50;
        const elementAtPoint = document.elementFromPoint(rightX, bottomY);
        if (elementAtPoint) {
          elementAtPoint.click();
        }
      });
    } catch (fallbackError) {
      console.error('Emergency fallback failed:', fallbackError);
    }
    
    return false;
  }
}

/**
 * Custom handler for carousel navigation that uses our specialized function
 * This wrapper uses the imported function from carouselNavigation.js
 * @param {Object} scormFrame - Puppeteer frame
 * @param {Object} params - Function parameters
 * @returns {Promise<boolean>} - Success status
 */
async function handleCarouselNavigation(scormFrame, params = {}) {
  console.log('Starting custom carousel navigation handler...');
  
  // First, verify this is indeed a carousel slide
  const isCarousel = await isCarouselSlide(scormFrame);
  
  if (!isCarousel) {
    console.log('Warning: handleCarouselNavigation called on a non-carousel slide. Attempting detection again...');
    // Second check - in case state detection was wrong initially
    const secondCheck = await isCarouselSlide(scormFrame);
    if (!secondCheck) {
      console.log('Still not detected as carousel. Will try generic next button as fallback.');
      // Try to click a generic next button as fallback
      await scormFrame.evaluate(() => {
        const rightSide = window.innerWidth - 50;
        const bottomSide = window.innerHeight - 50;
        const elementAtPoint = document.elementFromPoint(rightSide, bottomSide);
        if (elementAtPoint) {
          elementAtPoint.click();
          console.log('[BROWSER] Clicked element at bottom right as fallback');
          return true;
        }
        return false;
      });
      return true; // Return true to continue with quiz
    }
  }
  
  // Use our specialized carousel navigation function
  console.log('Using enhanced carousel navigation function');
  const maxClicks = params.maxClicks || 2;
  return await forceCarouselNavigation(scormFrame, maxClicks);
}

// Create a customFunctions object to hook into quizRunner.js's existing extension point
const customFunctions = {
  handleCarouselNavigation,
  handleDorithricinSlider
};

module.exports = {
  name: "Dorithricin",
  url: "https://academy.medice-health-family.com/paths/66d32acd918632655aa90a5d/home",
  
  // Add customFunctions to utilize the existing extension mechanism in quizRunner.js
  customFunctions,
  
  // Define the sequence of steps to complete the quiz
  sequence: [
    // Initial navigation steps
    {
      type: "START_SCREEN",
      action: "clickStartButton",
      waitAfter: 3000
    },
    {
      type: "NEXT_BUTTON",
      action: "clickNextButton",
      waitAfter: 2000
    },
    {
      type: "NEXT_BUTTON",
      action: "clickNextButton",
      openNewTab: true, // Mark this step as one that opens a new tab
      waitAfter: 2000
    },
    
    // Handle popup and find SCORM frame
    {
      type: "DIALOG_SCREEN",
      action: "pressSpaceKey",
      params: {
        delay: 3000
      },
      waitAfter: 5000
    },

    // Click the Start button in SCORM content
    {
      type: "SCORM_START_SCREEN",
      action: "clickScormStartButton", 
      useScormFrame: true,
      params: {
        timeout: 30000,    // Wait up to 30 seconds for button to appear
        waitAfter: 5000    // Wait 5 seconds after clicking
      },
      waitAfter: 5000
    },

    /*{
      type: "MESSAGE_BUTTONS_SLIDE",
      action: "handleMessageButtons",
      useScormFrame: true,
      params: {
        maxMessageClicks: 10,
        waitAfter: 5000
      },
      waitAfter: 5000
    },*/

    {
      type: "PHARMACY_SCENE",
      action: "clickOrangePlusButton",
      useScormFrame: true,
      params: {
        timeout: 15000,
        delay: 3000
      },
      waitAfter: 5000
    },

    {
      type: "SPEECH_BUBBLE_SLIDE",
      action: "handleSpeechBubbles",
      useScormFrame: true,
      params: {
        waitAfterBubbles: 3000,
        waitAfter: 5000
      },
      waitAfter: 5000
    },

    // ENHANCED: Carousel navigation with custom handling
    // Using forceExecute ensures this step runs regardless of slide detection
    // Our handleCarouselNavigation function will verify if it's actually a carousel slide
    {
      type: "CAROUSEL_SLIDE",
      action: "handleCarouselNavigation", // This will use our customFunctions.handleCarouselNavigation 
      useScormFrame: true,
      forceExecute: true, // Bypass the relevance check in quizRunner.js
      params: {
        maxClicks: 2,
        delayBetweenClicks: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 3000
    }, 
    // Message slide with blue oval
    {
      type: "MESSAGE_SLIDE",
      action: "handleMessageDialogSequence",
      useScormFrame: true,
      params: {
        maxClicks: 3,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    },

     // Generic next button
    {
      type: "GENERIC_NEXT_BUTTON_STATE",
      action: "handleGenericNextButtonState",
      useScormFrame: true,
      params: {
        initialDelay: 3000,
        maxWaitTime: 15000,
        waitAfter: 3000
      },
      waitAfter: 5000
    },

    {
      type: "PERCENTAGE_DRAG_DROP_SLIDE",
      action: "handlePercentageDragAndDrop",
      useScormFrame: true,
      params: {
        initialDelay: 3000,
        delayBetweenDrags: 2000,
        waitForDialog: 3000,
        waitAfterDialog: 3000,
        waitForNextButton: 2500,
        waitAfter: 3000
      },
      waitAfter: 3000
    },

    // Message slide with blue oval
    {
      type: "MESSAGE_SLIDE",
      action: "handleMessageDialogSequence",
      useScormFrame: true,
      params: {
        maxClicks: 3,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    },

    {
      type: "MEMO_ELEMENTS_SLIDE",
      action: "handleMemoElements",
      useScormFrame: true,
      params: {
        initialDelay: 3000,
        delayBetweenClicks: 1500,
        waitAfterClicks: 4000,
        waitAfterDialog: 2000,
        initialWaitForButton: 5000,
        maxWaitTime: 20000,
        waitAfter: 5000
      },
      waitAfter: 5000
    }, 

    // Generic next button
    {
      type: "GENERIC_NEXT_BUTTON_STATE",
      action: "handleGenericNextButtonState",
      useScormFrame: true,
      params: {
        initialDelay: 3000,
        maxWaitTime: 15000,
        waitAfter: 3000
      },
      waitAfter: 5000
    },

    /* {
      type: "MESSAGE_BUTTONS_SLIDE",
      action: "handleMessageButtons",
      useScormFrame: true,
      params: {
        maxMessageClicks: 10,
        waitAfter: 5000
      },
      waitAfter: 5000
    },  */

    /* {
      type: "SLIDER_INTERACTION_SLIDE",
      action: "handleSliderInteraction",
      useScormFrame: true,
      params: {
        position: 6,
        waitAfterSet: 2000,
        waitForDialog: 5000,
        waitAfterClose: 2000
      },
      waitAfter: 5000
    }, */

    // Modified slider interaction step
    {
      type: "SLIDER_INTERACTION_SLIDE",
      action: "handleDorithricinSlider",  // Use custom handler
      useScormFrame: true,
      waitAfter: 8000  // Extended wait for animations
    },
    
    // Kommt gar nicht os vor hier
    /* // MediBee appears
    {
      type: "MEDIBEE_APPEARS",
      action: "clickMediBee",
      useScormFrame: true,
      waitAfter: 2000
    },

    {
      type: "PERCENTAGE_DRAG_DROP_SLIDE",
      action: "handlePercentageDragAndDrop",
      useScormFrame: true,
      params: {
        initialDelay: 3000,
        delayBetweenDrags: 2000,
        waitForDialog: 3000,
        waitAfterDialog: 3000,
        waitForNextButton: 2500,
        waitAfter: 3000
      },
      waitAfter: 3000
    },

    {
      type: "MESSAGE_BUTTONS_SLIDE",
      action: "handleMessageButtons",
      useScormFrame: true,
      params: {
        maxMessageClicks: 10,
        waitAfter: 5000
      },
      waitAfter: 5000
    }, 
    
    // Slider interaction
    {
      type: "SLIDER_INTERACTION_SLIDE",
      action: "handleSliderInteraction",
      useScormFrame: true,
      params: {
        // No parameters needed - all timings are hardcoded in the function
      },
      waitAfter: 8000
    }, */

    {
      type: "MESSAGE_BUTTONS_SLIDE",
      action: "handleMessageDialogFive",
      useScormFrame: true,
      params: {
        maxClicks: 5,
        delayBetweenClicks: 1500,
        maxWaitForNextButton: 30000,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    },

    // Risk factors slide
    {
      type: "RISK_FACTORS_SLIDE",
      action: "clickAllRiskFactors",
      useScormFrame: true,
      params: {
        delayBetweenClicks: 1000,
        waitAfterClose: 2000
      },
      waitAfter: 2000
    },
    
    // Kommt gar nicht hier vor
    /* // Generic next button
    {
      type: "GENERIC_NEXT_BUTTON_STATE",
      action: "handleGenericNextButtonState",
      useScormFrame: true,
      params: {
        initialDelay: 5000,
        maxWaitTime: 20000,
        waitAfter: 5000
      },
      waitAfter: 5000
    }, */
    
    // Completion screen
    {
      type: "COMPLETION_SCREEN",
      action: "clickWeiterButton",
      useScormFrame: true,
      waitAfter: 3000
    },

    // Completion screen
    {
      type: "COMPLETION_SCREEN",
      action: "clickWeiterButton",
      useScormFrame: true,
      waitAfter: 3000
    },
    
    // Final screen with Training schließen button
    {
      type: "FINAL_SCREEN",
      action: "clickTrainingSchliessen",
      useScormFrame: true,
      waitAfter: 5000
    }
  ]
};