// core/quizRunner.js
const errorHandler = require('./errorHandler');
const pageInteractions = require('./pageInteractions');
const stateManager = require('./stateManager');
const { sleep } = require('../utils/commonUtils');
const { checkFor503Error } = require('../utils/browserUtils');

/**
 * Main function to run a quiz with sequence-based approach
 * @param {Object} page - Puppeteer page object
 * @param {Object} quiz - Quiz definition object
 * @param {number} maxRetries - Maximum number of retries for the quiz
 */
async function runQuiz(page, quiz, maxRetries = 3) {
    let retryCount = 0;
    let currentPage = page; // Keep track of the active page
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Starting quiz: ${quiz.name}`);
        
        // Initialize state
        stateManager.initQuizState(quiz);
        
        // Navigate to quiz URL
        console.log(`Navigating to: ${quiz.url}`);
        await currentPage.goto(quiz.url, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(3000); // Give the page time to stabilize
        
        // Get all frames to handle potential iframe structures
        let currentFrame = currentPage;
        let scormFrame = null;
        
        // Execute each step in the sequence
        for (let i = 0; i < quiz.sequence.length; i++) {
          const step = quiz.sequence[i];
          
          // Update state
          stateManager.setCurrentStep(i, step);
          
          // Special handling for steps that might open new tabs
          if (step.openNewTab) {
            console.log("This step may open a new tab, setting up listener...");
            const newPagePromise = new Promise(resolve => currentPage.once('popup', resolve));
            
            // Perform the action that opens a new tab
            await executeStepAction(currentPage, currentFrame, step, quiz, i);
            
            // Wait for the new tab and switch to it
            const newPage = await newPagePromise;
            await newPage.bringToFront();
            currentPage = newPage; // Update our current page reference
            currentFrame = currentPage; // Reset frame reference
            
            console.log(`New tab detected, waiting for content to load...`);
            
            // Wait for the page to navigate away from about:blank
            try {
              await currentPage.waitForNavigation({ 
                waitUntil: 'networkidle2',
                timeout: 30000 
              });
            } catch (navError) {
              console.log('Navigation timeout, but continuing as page might be loaded...');
            }
            
            // Additional wait for content stability
            await sleep(5000);
            
            console.log(`Switched to new tab. Title: ${await currentPage.title()}`);
            console.log(`New tab URL: ${await currentPage.url()}`);
            
            // Skip to next step since we already executed this one
            continue;
          }
          
          // Check if step requires SCORM frame
          if (step.useScormFrame) {
            console.log("Finding SCORM frame for this step...");
            
            // First check if a SCORM frame was previously found by the specialized function
            if (currentPage.__scormFrame) {
              console.log("Using SCORM frame previously found by specialized function");
              scormFrame = currentPage.__scormFrame;
              currentFrame = scormFrame;
            } 
            // Otherwise try to find it normally
            else if (!scormFrame) {
              // Retry logic for finding SCORM frame
              let frameRetries = 0;
              const maxFrameRetries = 5;
              
              while (frameRetries < maxFrameRetries) {
                const frames = await currentPage.frames();
                scormFrame = frames.find(f => f.url().includes('/index_lms.html'));
                
                if (scormFrame) {
                  console.log("SCORM frame found successfully!");
                  currentFrame = scormFrame;
                  break;
                }
                
                console.log(`SCORM frame not found on attempt ${frameRetries + 1}. Retrying...`);
                frameRetries++;
                
                // Try clicking anywhere on the screen and pressing space again
                console.log("Trying to interact with page to trigger SCORM frame...");
                await currentPage.evaluate(() => {
                  // Click in the center of the page
                  const centerX = window.innerWidth / 2;
                  const centerY = window.innerHeight / 2;
                  const element = document.elementFromPoint(centerX, centerY);
                  if (element) element.click();
                });
                
                await currentPage.keyboard.press('Space');
                await sleep(5000);
              }
              
              if (!scormFrame) {
                // Last resort - look for any iframe in the page
                console.log("Standard SCORM frame not found, looking for ANY iframe...");
                const frames = await currentPage.frames();
                if (frames.length > 1) {
                  console.log(`Found ${frames.length} frames, using the first non-main frame`);
                  scormFrame = frames.find(f => f !== currentPage.mainFrame());
                  if (scormFrame) {
                    console.log(`Using alternative frame: ${await scormFrame.url()}`);
                    currentFrame = scormFrame;
                  } else {
                    throw new Error('No usable frames found after multiple retries');
                  }
                } else {
                  throw new Error('SCORM frame not found but required for step after multiple retries');
                }
              }
            }
          } else if (!step.useScormFrame && scormFrame) {
            // Reset to main frame if not using SCORM frame
            currentFrame = currentPage;
          }
          
          // Execute the step
          await executeStepAction(currentPage, currentFrame, step, quiz, i);
          
          // Wait between steps for stability
          await sleep(step.waitAfter || 2000);
          
          // Check for common error conditions that might need handling
          await errorHandler.checkForCommonErrors(currentPage, currentFrame);
        }
        
        console.log(`Quiz "${quiz.name}" completed successfully!`);
        return true;
        
      } catch (error) {
        retryCount++;
        console.error(`Error running quiz "${quiz.name}" (Attempt ${retryCount}/${maxRetries}):`, error);
        
        // Try to recover from the error
        const shouldRetry = await errorHandler.handleError(currentPage, error, retryCount, maxRetries);
        
        // Check if we can retry
        if (shouldRetry && retryCount < maxRetries) {
          console.log(`Retrying quiz "${quiz.name}"...`);
          await sleep(5000 * retryCount); // Increasing wait time for each retry
        } else {
          console.error(`Failed to complete quiz "${quiz.name}" after ${maxRetries} attempts.`);
          throw error;
        }
      }
    }
}

/**
 * Detect what type of slide we're currently on
 * @param {Object} frame - Current frame
 * @returns {string} - The slide type identifier
 */
async function detectCurrentSlideType(frame) {
  try {
    return await frame.evaluate(() => {
      // Check for slider-specific elements
      const sliderElement = document.querySelector('[data-model-id="5aV8PocxYuR"]'); // Slider handle
      const sliderTrack = document.querySelector('[data-model-id="5aV8PocxYuR_track"]'); // Slider track
      const sliderText = Array.from(document.querySelectorAll('div')).some(el => 
        el.textContent && el.textContent.includes('Wie viel Prozent bevorzugen')
      );

      if (sliderElement && sliderTrack && sliderText) {
        console.log('[DETECTOR] Found slider interaction slide');
        return 'SLIDER_INTERACTION_SLIDE';
      }

      // Check for slider-related text content
      const hasSliderText = Array.from(document.querySelectorAll('div'))
        .some(el => el.textContent && (
          el.textContent.includes('Anzahl der Infektionen') || 
          el.textContent.includes('Infektionen bei Erwachsenen') ||
          el.textContent.includes('Infektionen bei Kindern') ||
          el.textContent.includes('Wie viel Prozent bevorzugen') || // Add this for Cystinol quiz
          el.textContent.includes('richtige Stelle')                // Add this for tooltip text
        ));

      // Detect slider track element which is another indicator
      const hasSliderTrack = document.querySelector('[data-acc-text*="track"]') !== null;

      // Check for slider circle element which is common in all slider implementations
      const hasSliderCircle = document.querySelectorAll('circle').length > 0;

      // If we have slider elements OR (slider text AND circle)
      if ((sliderElement || sliderTrack) || (hasSliderText && hasSliderCircle) || hasSliderTrack) {
        console.log('[DETECTOR] Found slider interaction slide');
        return 'SLIDER_INTERACTION_SLIDE';
      }
      
      // GENERIC NEXT BUTTON STATE - High priority check
      // Look for MediBee explains slides with characteristic structure
      const hasMediBeeTitle = Array.from(document.querySelectorAll('div'))
        .some(el => el.textContent && (
          el.textContent.includes('MediBee erklärt') || 
          el.textContent.includes('MediBee explains')
        ));
      
      // Check if there's orange next button but minimal other interactive elements
      const hasOrangeNextButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
      const hasNavDots = document.querySelectorAll('circle[fill="#FF9800"]').length > 0;
      
      // Look for educational bullet points often found in MediBee explanation slides
      const hasBulletPoints = Array.from(document.querySelectorAll('div'))
        .some(el => el.textContent && (
          el.textContent.includes('•') || 
          el.textContent.includes('Viren') ||
          el.textContent.includes('Bakterien')
        ));
      
      // If we have strong indicators of a MediBee explanation slide, immediately identify it
      if (hasMediBeeTitle) {
        console.log('[DETECTOR] Found MediBee explanation slide with title');
        return 'GENERIC_NEXT_BUTTON_STATE';
      }
      
      // Secondary check based on other indicators
      if ((hasNavDots || hasBulletPoints) && hasOrangeNextButton) {
        console.log('[DETECTOR] Found MediBee explanation slide with bullet points or navigation');
        return 'GENERIC_NEXT_BUTTON_STATE';
      }
      
      // CAROUSEL SLIDE check
      const carouselIndicators = document.querySelectorAll('[data-model-id="6d9K1sUhmhU"], [data-model-id="5gpDrv2tka1"]');
      // Check for multiple circles which typically indicate a carousel
      const hasMultipleCircleIndicators = document.querySelectorAll('svg circle').length >= 3;
      
      if (carouselIndicators.length > 0 || 
          (hasMultipleCircleIndicators && !hasMediBeeTitle)) {
        console.log('[DETECTOR] Found carousel slide indicators');
        return 'CAROUSEL_SLIDE';
      }
      
      // SCORM START SCREEN
      const startButton = document.querySelector('[data-model-id="6eUA3GjhbF3"], [data-model-id="6lDgYO2arca"]');
      if (startButton) {
        console.log('[DETECTOR] Found start button');
        return 'SCORM_START_SCREEN';
      }
      
      // PHARMACY SCENE
      const plusButton = document.querySelector('[data-model-id="5mnzOCmvQcX"]');
      if (plusButton) {
        console.log('[DETECTOR] Found plus button');
        return 'PHARMACY_SCENE';
      }
      
      // SPEECH BUBBLE SLIDE - look for more specific speech bubble indicators
      const speechBubbleIds = ['61cy9Hbjzng', '6B44zup212K', '6mxFfMbxISZ', '6RkkYe1DKRz', '6Lm3aJpJf7t', '6fwMvc4hzcl', '6P2wSi7otO3', '5uvPi2PVSIx'];
      const hasSpeechBubbles = speechBubbleIds.some(id => document.querySelector(`[data-model-id="${id}"]`) !== null);
      const messageButton = document.querySelector('[data-model-id="6l65RbsSaM0"], [data-model-id="6ZIquEpaUG5"]');
      
      // More specific check - must have visible speech bubbles AND message button
      // AND not have MediBee title (to differentiate from explanation slide)
      if (hasSpeechBubbles && messageButton && !hasMediBeeTitle) {
        console.log('[DETECTOR] Found speech bubbles and message button');
        return 'SPEECH_BUBBLE_SLIDE';
      }

      // MESSAGE BUTTONS SLIDE (without speech bubbles)
      const messageButtonIds = ['6l65RbsSaM0', '6ZIquEpaUG5'];
      const hasMessageButtons = messageButtonIds.some(id => document.querySelector(`[data-model-id="${id}"]`) !== null);
      const hasDialogIcon = document.querySelector('image[xlink\\:href*="message"], image[xlink\\:href*="chat"]') !== null;
      const hasMessageCounter = document.querySelector('[data-acc-text="0/2"]') !== null;

      // Make sure we're not confusing this with the speech bubble slide or MediBee explanation
      const noSpeechBubbles = speechBubbleIds.every(id => document.querySelector(`[data-model-id="${id}"]`) === null);

      if ((hasMessageButtons || hasDialogIcon || hasMessageCounter) && noSpeechBubbles && !hasMediBeeTitle) {
          console.log('[DETECTOR] Found message buttons slide without speech bubbles');
          return 'MESSAGE_BUTTONS_SLIDE';
      }
      
      // RISK FACTORS SLIDE
      const riskFactorIds = ['6CgBjku5i0P', '6f83JhqEXI5', '6U8twOQqmyr', '6ik9oDyZp4F', '6aelPxiqTQs', '6cACM9wqz9n'];
      const hasRiskFactors = riskFactorIds.some(id => document.querySelector(`[data-model-id="${id}"]`) !== null);
      
      if (hasRiskFactors) {
        console.log('[DETECTOR] Found risk factors');
        return 'RISK_FACTORS_SLIDE';
      }
      
      // PERCENTAGE DRAG DROP SLIDE
      const percentageButtonIds = ['65H2YP6zQYj', '5kZ1pClIPrb'];
      const containerIds = ['6DcWd8zvKfc', '5WjuStY9TX7'];
      
      const hasPercentageButtons = percentageButtonIds.some(id => 
        document.querySelector(`[data-model-id="${id}"]`) !== null
      );
      const hasContainers = containerIds.some(id => 
        document.querySelector(`[data-model-id="${id}"]`) !== null
      );
      
      if (hasPercentageButtons || hasContainers) {
        console.log('[DETECTOR] Found percentage drag and drop slide');
        return 'PERCENTAGE_DRAG_DROP_SLIDE';
      }

      // MEMO_ELEMENTS_SLIDE
      const memoElementIds = ['6QuM2lH06Pj', '6OZGmTUMXSy', '6d6WGZdXhui', '6S50BV4YpY3'];
      const hasMemoElements = memoElementIds.some(id => 
          document.querySelector(`[data-model-id="${id}"]`) !== null
      );
      const memoContainer = document.querySelector('[data-acc-text*="Memo"]') ||
                          document.querySelector('[data-acc-text*="memo"]');

      if (hasMemoElements || memoContainer) {
          console.log('[DETECTOR] Found memo elements slide');
          return 'MEMO_ELEMENTS_SLIDE';
      }
      
      // Generic Next Button slide (fallback check)
      // If we detect only a next button with minimal other interactive elements
      const hasNextButton = document.querySelector(
        '[data-model-id="5fQkkvFT1Hs"], [data-model-id="5fJnOnqo2Mn"], [data-model-id="6SnZaWfxQZH"]'
      );
      
      // Check if page has very few interactive elements (suggesting it's just a next button slide)
      const interactiveElements = document.querySelectorAll('[data-model-id]').length;
      
      if (hasNextButton && interactiveElements < 10) {
        console.log('[DETECTOR] Found generic next button state (fallback check)');
        return 'GENERIC_NEXT_BUTTON_STATE';
      }
      
      // Unknown slide type
      return 'UNKNOWN';
    });
  } catch (error) {
    console.error('Error detecting slide type:', error.message);
    return 'UNKNOWN';
  }
}

/**
 * Check if a step's elements are present on the current slide
 * @param {Object} frame - Current frame
 * @param {Object} step - Step definition
 * @returns {boolean} - Whether the step's elements are present
 */
async function isStepRelevant(frame, step) {
    try {
      console.log(`Checking if step type "${step.type}" is relevant on current slide...`);
      
      // First detect what type of slide we're currently on
      const currentSlideType = await detectCurrentSlideType(frame);
      console.log(`Current slide detected as: ${currentSlideType}`);
      
      // If we've already detected the current slide type, we can use that for immediate decisions
      if (currentSlideType && currentSlideType !== 'UNKNOWN') {
        // Only execute steps that match the current slide type
        return step.type === currentSlideType;
      }
      
      // If we couldn't detect the slide type through the global method, fall back to individual checks
      switch (step.type) {
        case "SCORM_START_SCREEN":
          return await frame.evaluate(() => {
            const startButton = document.querySelector('[data-model-id="6eUA3GjhbF3"], [data-model-id="6lDgYO2arca"]');
            return !!startButton;
          });
        
        case "PHARMACY_SCENE":
          return await frame.evaluate(() => {
            // More specific check - require the plus button specifically
            const plusButton = document.querySelector('[data-model-id="5mnzOCmvQcX"]');
            
            // Verify this is NOT a carousel slide - carousel slides have specific indicators
            const carouselIndicators = document.querySelectorAll('[data-model-id="6d9K1sUhmhU"], [data-model-id="5gpDrv2tka1"]');
            const hasMediBeeTitle = document.querySelector('div:contains("MediBee erklärt")');
            
            // Return true only if we find the plus button AND we don't see carousel elements
            return !!plusButton && carouselIndicators.length === 0 && !hasMediBeeTitle;
          });
        
        case "SPEECH_BUBBLE_SLIDE":
          return await frame.evaluate(() => {
            // Look for specific speech bubble indicators
            const speechBubbleIds = ['61cy9Hbjzng', '6B44zup212K', '6mxFfMbxISZ', '6RkkYe1DKRz', '6Lm3aJpJf7t', '6fwMvc4hzcl', '6P2wSi7otO3', '5uvPi2PVSIx'];
            
            // Check for any of these specific IDs
            const hasSpeechBubbles = speechBubbleIds.some(id => 
              document.querySelector(`[data-model-id="${id}"]`) !== null
            );
            
            // Check for message button
            const messageButton = document.querySelector('[data-model-id="6l65RbsSaM0"], [data-model-id="6ZIquEpaUG5"]');
            
            // Verify this is NOT a carousel slide
            const carouselIndicators = document.querySelectorAll('[data-model-id="6d9K1sUhmhU"], [data-model-id="5gpDrv2tka1"]');
            
            return (hasSpeechBubbles || !!messageButton) && carouselIndicators.length === 0;
          });
        
        // Add this to the switch statement in isStepRelevant:
        case "MESSAGE_BUTTONS_SLIDE":
            return await frame.evaluate(() => {
                // Check for message buttons
                const messageButtonIds = ['6l65RbsSaM0', '6ZIquEpaUG5'];
                const hasMessageButtons = messageButtonIds.some(id => 
                    document.querySelector(`[data-model-id="${id}"]`) !== null
                );
                
                // Check for message counter or dialog icon
                const hasMessageCounter = document.querySelector('[data-acc-text="0/2"]') !== null;
                const hasDialogIcon = document.querySelector('image[xlink\\:href*="message"], image[xlink\\:href*="chat"]') !== null;
                
                // Check that this is NOT a speech bubble slide
                const speechBubbleIds = ['61cy9Hbjzng', '6B44zup212K', '6mxFfMbxISZ', '6RkkYe1DKRz'];
                const noSpeechBubbles = speechBubbleIds.every(id => 
                    document.querySelector(`[data-model-id="${id}"]`) === null
                );
                
                // IMPORTANT: Check that this is NOT a MediBee explanation slide
                const hasMediBeeTitle = Array.from(document.querySelectorAll('div'))
                    .some(el => el.textContent && (
                        el.textContent.includes('MediBee erklärt') || 
                        el.textContent.includes('MediBee explains')
                    ));
                
                // Must have message buttons AND no speech bubbles AND no MediBee title
                return (hasMessageButtons || hasMessageCounter || hasDialogIcon) && 
                       noSpeechBubbles && 
                       !hasMediBeeTitle;
            });
        
        case "CAROUSEL_SLIDE":
          return await frame.evaluate(() => {
            // Check for carousel navigation dots
            const carouselDots = document.querySelectorAll('[data-model-id="6d9K1sUhmhU"], [data-model-id="5gpDrv2tka1"]');
            
            // Check for "MediBee erklärt" text which is specific to carousel slides
            const hasMediBeeTitle = Array.from(document.querySelectorAll('div'))
              .some(el => el.textContent && el.textContent.includes('MediBee erklärt'));
            
            // Look for the carousel navigation dots at the bottom
            const hasCarouselDots = document.querySelectorAll('svg circle, path[fill="#FF9800"]')
              .length >= 3; // There should be at least 3 dots/indicators
            
            return carouselDots.length > 0 || (hasMediBeeTitle && hasCarouselDots);
          });

        // Add this to the switch statement in isStepRelevant:
        case "GENERIC_NEXT_BUTTON_STATE":
            return await frame.evaluate(() => {
            // Check for MediBee explanation title
            const hasMediBeeTitle = Array.from(document.querySelectorAll('div'))
                .some(el => el.textContent && (
                el.textContent.includes('MediBee erklärt') || 
                el.textContent.includes('MediBee explains')
                ));
            
            // Check for next button (orange or gray)
            const hasNextButton = document.querySelector(
                '[data-model-id="5fQkkvFT1Hs"], [data-model-id="5fJnOnqo2Mn"], [data-model-id="6SnZaWfxQZH"]'
            );
            
            // Check for minimal interactive elements
            const interactiveElements = document.querySelectorAll('[data-model-id]').length;
            const fewInteractiveElements = interactiveElements < 10;
            
            return (hasMediBeeTitle || (hasNextButton && fewInteractiveElements));
            });

        case "PERCENTAGE_DRAG_DROP_SLIDE":
            return await frame.evaluate(() => {
              // Check for percentage buttons
              const percentageButtonIds = ['65H2YP6zQYj', '5kZ1pClIPrb'];
              const containerIds = ['6DcWd8zvKfc', '5WjuStY9TX7'];
              
              const hasPercentageButtons = percentageButtonIds.some(id => 
                document.querySelector(`[data-model-id="${id}"]`) !== null
              );
              const hasContainers = containerIds.some(id => 
                document.querySelector(`[data-model-id="${id}"]`) !== null
              );
              
              // Check for Absenden button
              const hasAbsendenButton = !!document.querySelector('div[data-acc-text="Absenden"]');
              
              // Check for text about percentages and throat inflammation
              const hasThroatText = Array.from(document.querySelectorAll('div'))
                .some(el => el.textContent && (
                  el.textContent.includes('Halsentzündung') || 
                  el.textContent.includes('Prozent') ||
                  el.textContent.includes('Viren') || 
                  el.textContent.includes('Bakterien')
                ));
              
              return (hasPercentageButtons || hasContainers) && (hasAbsendenButton || hasThroatText);
            });
        
        case "MEMO_ELEMENTS_SLIDE":
            return await frame.evaluate(() => {
                // Check for memo elements
                const memoElementIds = ['6QuM2lH06Pj', '6OZGmTUMXSy', '6d6WGZdXhui', '6S50BV4YpY3'];
                const hasMemoElements = memoElementIds.some(id => 
                document.querySelector(`[data-model-id="${id}"]`) !== null
                );
                
                // Check for memo container
                const memoContainer = document.querySelector('[data-acc-text*="Memo"]') ||
                                    document.querySelector('[data-acc-text*="memo"]');
                
                // Also look for clickable elements near text about memos
                const hasMemoText = Array.from(document.querySelectorAll('div'))
                .some(el => el.textContent && (
                    el.textContent.includes('Memo') || 
                    el.textContent.includes('memo') ||
                    el.textContent.includes('Merke')
                ));
                
            return hasMemoElements || memoContainer || hasMemoText;
          });

          case "SLIDER_INTERACTION_SLIDE":
            return await frame.evaluate(() => {
              // Check for specific slider elements (either type will match)
              const specificSliderIds = ['6BICHbFtmNU', '6ab5xvhtIXy']; // Dual slider IDs
              const genericSliderId = '5aV8PocxYuR'; // Generic slider ID
              
              // Check for specific dual sliders
              const hasDualSliders = specificSliderIds.some(id => 
                document.querySelector(`[data-model-id="${id}"]`) !== null
              );
              
              // Check for generic slider
              const hasGenericSlider = document.querySelector(`[data-model-id="${genericSliderId}"]`) !== null;
              
              // Look for slider-related text content
              const hasSliderText = Array.from(document.querySelectorAll('div'))
                .some(el => el.textContent && (
                  el.textContent.includes('Anzahl der Infektionen') || 
                  el.textContent.includes('Infektionen bei Erwachsenen') ||
                  el.textContent.includes('Infektionen bei Kindern')
                ));
              
              // Also look for the Prüfen button which appears on slider slides
              const hasPruefenButton = document.querySelector('[data-model-id="6M3h8ouA9G1"]') !== null ||
                                       Array.from(document.querySelectorAll('div')).some(el => 
                                         el.textContent && el.textContent.includes('Prüfen')
                                       );
              
              return (hasDualSliders || hasGenericSlider) && (hasSliderText || hasPruefenButton);
            });  



        case "RISK_FACTORS_SLIDE":
          return await frame.evaluate(() => {
            // Check for the question text
            const hasQuestionText = Array.from(document.querySelectorAll('div'))
              .some(el => el.textContent && (
                el.textContent.includes('Findest du hier im Bild noch weitere Risikofaktoren?') || 
                el.textContent.includes('Risikofaktoren')
              ));

            // Check for risk factor elements by text content
            const riskFactorTexts = [
              "Unzureichende Flüssigkeitszufuhr",
              "Hormonelle Veränderungen",
              "Geschwächtes Immunsystem",
              "Falsche Intimhygiene",
              "Antibiotika-Einnahme",
              "häufiger Geschlechtsverkehr"
            ];

            const hasRiskFactors = riskFactorTexts.some(text => 
              Array.from(document.querySelectorAll('[data-acc-text], div'))
                .some(el => el.textContent.includes(text))
            );

            return hasQuestionText || hasRiskFactors;
          });
          
        default:
          // For steps we don't have specific checks for, assume they're relevant
          return true;
      }
    } catch (error) {
      console.log(`Error checking step relevance: ${error.message}`);
      // If check fails, assume step is relevant
      return true;
    }
}

/**
 * Execute a single step action
 * @param {Object} page - Puppeteer page object
 * @param {Object} frame - Current frame to execute in
 * @param {Object} step - Step definition
 * @param {Object} quiz - Quiz definition
 * @param {number} stepIndex - Current step index
 */
async function executeStepAction(page, frame, step, quiz, stepIndex) {
  console.log(`Executing step ${stepIndex+1}/${quiz.sequence.length}: ${step.type} - ${step.action}`);
  
  try {
    // Check for 503 error before performing the action
    const is503Error = await checkFor503Error(page);
    if (is503Error) {
      throw new Error("TYPO3 503 error detected");
    }
    
    // MODIFIED SECTION: Force execution or check relevance
    if (!step.forceExecute) { // Only check relevance if not forced
      // For interactive steps, check if elements are present on current slide
      if (step.type === "SCORM_START_SCREEN" || 
          step.type === "PHARMACY_SCENE" ||
          step.type === "SPEECH_BUBBLE_SLIDE" ||
          step.type === "CAROUSEL_SLIDE" ||  
          step.type === "RISK_FACTORS_SLIDE") {
        
        const isRelevant = await isStepRelevant(frame, step);
        
        if (!isRelevant) {
          console.log(`Step ${stepIndex+1} (${step.type}) is not relevant to current slide - skipping`);
          return;
        } else {
          console.log(`Step ${stepIndex+1} (${step.type}) is confirmed relevant to current slide - executing`);
        }
      }
    } else {
      console.log(`Force executing step ${stepIndex+1} (${step.type}) regardless of detection`);
    }
    
    // Special handling for the dialog screen with space key press
    if (step.type === "DIALOG_SCREEN" && step.action === "pressSpaceKey") {
      console.log("Using specialized dialog handling for space key press...");
      const { success, scormFrame } = await pageInteractions.waitForDialogAndPressSpace(page, step.params || {});
      
      // If we found a SCORM frame, update the reference
      if (scormFrame) {
        console.log("Using SCORM frame found by specialized function");
        page.__scormFrame = scormFrame;
      }
      
      return;
    }
    
    // Get the action function
    let actionFn;
    
    // First check if it's a custom function for this quiz (PRIORITY CHANGE)
    if (quiz.customFunctions && quiz.customFunctions[step.action]) {
      actionFn = quiz.customFunctions[step.action];
    } 
    // Then check if this is a standard page interaction
    else if (pageInteractions[step.action]) {
      actionFn = pageInteractions[step.action];
    }
    // Finally, look for common recovery utils if appropriate
    else {
      throw new Error(`Action function not found: ${step.action}`);
    }
    
    // Before executing any action, double check slide type for critical steps 
    // to avoid misidentifications between similar slide types
    if (step.type === "MESSAGE_BUTTONS_SLIDE" || step.type === "GENERIC_NEXT_BUTTON_STATE") {
      const currentSlideType = await detectCurrentSlideType(frame);
      
      // If this is a critical mismatch, skip this step
      if (currentSlideType !== step.type && 
         (currentSlideType === "MESSAGE_BUTTONS_SLIDE" || currentSlideType === "GENERIC_NEXT_BUTTON_STATE")) {
        console.log(`CRITICAL MISMATCH: Current slide is ${currentSlideType} but attempting to run ${step.type} - skipping`);
        return;
      }
    }

    // Execute the action function
    const result = await actionFn(frame, step.params || {}, { stepIndex, quiz });
    
    // Special handling for carousel navigation to support multiple clicks
    if (step.action === 'handleCarouselNavigation' && result === false) {
      console.log('Continuing with next carousel click...');
      return await executeStepAction(page, frame, step, quiz, stepIndex);
    }
    
  } catch (stepError) {
    // Try recovery before failing completely
    const recovered = await errorHandler.recoverFromStepError(
      page, 
      frame, 
      step, 
      stepError
    );
    
    if (!recovered) {
      throw stepError; // Re-throw if recovery failed
    }
  }
}


module.exports = { runQuiz };