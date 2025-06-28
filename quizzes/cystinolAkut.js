// quizzes/cystinolAkut.js
/**
 * Cystinol Akut Quiz Definition
 * 
 * This file uses the sequence-based approach to define the Cystinol Akut quiz
 * steps in a declarative, deterministic way. Each step specifies exactly what
 * type of interaction is needed and what action to take.
 */
const { sleep } = require('../utils/commonUtils');

module.exports = {
  name: "Cystinol Akut",
  url: "https://academy.medice-health-family.com/paths/66d3263086cd7aaa6d9d66c9/home?forceRestart=true",
  
  // Define the sequence of steps to complete the quiz
  sequence: [
    // Initial navigation steps
    {
      type: "START_SCREEN",
      action: "clickStartButton",
      waitAfter: 3000
    },
    // Slide 2: Academy "Starten/Fortsetzen" button (opens new tab)
    {
      type: "ACADEMY_START_BUTTON", 
      action: "clickAcademyStartButton",
      openNewTab: false,
      waitAfter: 5000
    },

    {
      type: "ACADEMY_START_BUTTON", 
      action: "clickAcademyStartButton",
      openNewTab: true,
      waitAfter: 5000
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

    // Made this step more flexible - handle either pharmacy scene or message buttons
    {
      type: ["PHARMACY_SCENE", "MESSAGE_BUTTONS_SLIDE"],
      action: "handlePharmacyOrMessageButtons",
      useScormFrame: true,
      params: {
        timeout: 15000,
        delay: 3000,
        maxMessageClicks: 5
      },
      waitAfter: 5000
    },
   
    // Message button slide (only execute if we need to)
    {
      type: "MESSAGE_SLIDE",
      action: "clickMessageButtonThreeTimes",
      useScormFrame: true,
      optional: true, // Mark as optional so it can be skipped if not present
      waitAfter: 4000
    },

    // Wait for MediBee to appear and click it
    {
      type: "MEDIBEE_APPEARS",
      action: "waitForAndClickMediBee",
      useScormFrame: true,
      waitAfter: 4000
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
      forceExecute: true,
      waitAfter: 2000
    },

    {
      type: "TIMED_INFO_SLIDE",
      action: "handleTimedSlideWithWait",
      useScormFrame: true,
      params: {
        requiredWaitTime: 28000,    // 28 seconds as you mentioned
        maxWaitTime: 35000,         // 35 seconds max (safety buffer)
        useSimpleWait: true,        // Use simple wait (most reliable for timed content)
        waitAfterClick: 5000        // Wait 5 seconds after clicking
      },
      waitAfter: 5000
    },

    // Message button slide (one click)
    {
      type: "MESSAGE_SLIDE",
      action: "handleMessageDialogSequence",
      useScormFrame: true,
      params: {
        maxClicks: 1,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    }, 

    // Slider interaction slide
    {
      type: "SLIDER_INTERACTION_SLIDE",
      action: "handleSliderInteraction",
      useScormFrame: true,
      params: {
        targetPosition: 4 // Set slider to position 6
      },
      waitAfter: 5000
    },

    // Multiple choice question slide
    {
      type: "MULTIPLE_CHOICE_SLIDE",
      action: "handleMultipleChoiceQuestions",
      useScormFrame: true,
      params: {
        initialDelay: 2000,
        waitAfterSelection: 1000,
        waitAfterSubmit: 3000,
        waitAfterDialog: 2000
      },
      waitAfter: 4000
    },

    // Completion screen 1
    {
      type: "COMPLETION_SCREEN",
      action: "clickWeiterButton",
      useScormFrame: true,
      waitAfter: 3000
    },

    // Completion screen 2
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
  ],
  
  // Custom functions specific to Cystinol Akut quiz
  customFunctions: {
    /**
     * Click the start button to begin - EXACT COPY of dorithricin approach but updated for new button
     * @param {Object} frame - Puppeteer frame (main page)
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickStartButton: async function(frame, params = {}) {
      try {
        console.log('Clicking start button...');
        
        // Primary selector for new button structure
        const primarySelector = 'button[data-test="path-start-button"]';
        
        // Fallback selectors
        const fallbackSelectors = [
          'button.button-regular.primary.brand.regular.initial',
          'button.button-regular.primary.brand',
          'button[type="button"]'
        ];
        
        // Try primary selector first
        try {
          await frame.waitForSelector(primarySelector, { 
            visible: true, 
            timeout: params.timeout || 15000 
          });
          
          await frame.click(primarySelector);
          console.log('✅ Clicked start button with primary selector');
          await sleep(params.waitAfter || 3000);
          return true;
          
        } catch (primaryError) {
          console.log('Primary selector failed, trying fallbacks...');
          
          // Try fallback selectors
          for (const selector of fallbackSelectors) {
            try {
              const elementExists = await frame.$(selector);
              if (elementExists) {
                await frame.click(selector);
                console.log(`✅ Clicked start button with fallback: ${selector}`);
                await sleep(params.waitAfter || 3000);
                return true;
              }
            } catch (fallbackError) {
              console.log(`Fallback failed: ${selector}`);
            }
          }
          
          // Text-based fallback
          const clicked = await frame.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const startButton = buttons.find(btn => 
              btn.textContent.trim().toLowerCase().includes('starten') &&
              !btn.disabled &&
              window.getComputedStyle(btn).display !== 'none'
            );
            
            if (startButton) {
              startButton.click();
              console.log('[BROWSER] Clicked start button via text search');
              return true;
            }
            return false;
          });
          
          if (clicked) {
            console.log('✅ Clicked start button via text search');
            await sleep(params.waitAfter || 3000);
            return true;
          }
          
          throw new Error('Failed to find start button with any method');
        }
      } catch (error) {
        console.error('Error clicking start button:', error.message);
        return false;
      }
    },
    /**
     * Click the academy start/continue button that opens the new tab - EXACT COPY from dorithricin
     * @param {Object} frame - Puppeteer frame (main page)
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickAcademyStartButton: async function(frame, params = {}) {
      try {
        console.log('Clicking academy start/continue button to open SCORM tab...');
        
        const buttonSelector = 'button.start-resume-button';
        
        await frame.waitForSelector(buttonSelector, { 
          visible: true, 
          timeout: params.timeout || 15000 
        });
        
        console.log('Academy start button found, clicking it...');
        await frame.click(buttonSelector);
        
        console.log('Academy start button clicked - new tab should open');
        await sleep(params.waitAfter || 3000);
        
        return true;
      } catch (error) {
        console.error('Error clicking academy start button:', error.message);
        
        // Fallback: try alternative selectors
        try {
          console.log('Trying fallback selectors...');
          
          const fallbackSelectors = [
            '.start-resume-button',
            'button[class*="start-resume"]',
            'button[class*="primary"][class*="brand"]',
            '.button-regular.primary.brand'
          ];
          
          for (const selector of fallbackSelectors) {
            const exists = await frame.$(selector);
            if (exists) {
              console.log(`Using fallback selector: ${selector}`);
              await frame.click(selector);
              await sleep(3000);
              return true;
            }
          }
          
          throw new Error('No suitable button selector found');
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError.message);
          return false;
        }
      }
    },

    // New function that can handle either pharmacy scene or message buttons
    handlePharmacyOrMessageButtons: async function(scormFrame, params = {}) {
      try {
        console.log('Starting flexible pharmacy/message buttons handler...');
        
        // Default parameters
        const timeout = params.timeout || 15000;
        const delay = params.delay || 3000;
        const maxMessageClicks = params.maxMessageClicks || 5;
        
        // Wait for specified delay to ensure the scene is fully loaded
        await sleep(delay);
        
        // First, detect what kind of slide we're on
        const slideType = await scormFrame.evaluate(() => {
          // Look for pharmacy scene indicators
          const hasPharmacyElements = document.querySelector('[data-acc-text*="Apotheke"]') || 
                                     document.querySelector('[data-acc-text*="pharmacy"]') ||
                                     document.querySelector('[data-acc-text*="Medikament"]');
          
          // Look for message button indicators 
          const hasMessageButton = document.querySelector('[data-model-id="6l65RbsSaM0"]') ||
                                  document.querySelector('.slide-object-button');
          
          if (hasPharmacyElements) return 'PHARMACY_SCENE';
          if (hasMessageButton) return 'MESSAGE_BUTTONS_SLIDE';
          
          // Default to generic detection based on orange elements
          const orangeElements = document.querySelectorAll('[style*="fill: #FF9800"], [style*="stroke: #FF9800"]');
          if (orangeElements.length > 0) return 'PHARMACY_SCENE';
          
          return 'UNKNOWN';
        });
        
        console.log(`Detected slide type: ${slideType}`);
        
        if (slideType === 'PHARMACY_SCENE') {
          // Handle pharmacy scene
          // First try to find the orange plus button by known data-model-ids
          const orangePlusModelIds = [
            '6HdSXOXIYQE',  // Add the missing ID here
            '6ZIquEpaUG5',  // Common orange plus button ID
            '5xF6b5qZgR5',  // Alternative ID
            '6ZsMxwjq80A'   // Another possible ID
          ];
          
          let buttonFound = false;
          
          // Try each possible button ID
          for (const buttonId of orangePlusModelIds) {
            try {
              // Check if the button exists
              const elementExists = await scormFrame.evaluate((id) => {
                const element = document.querySelector(`[data-model-id="${id}"]`);
                return element && window.getComputedStyle(element).display !== 'none';
              }, buttonId);
              
              if (elementExists) {
                console.log(`Found orange plus button with ID: ${buttonId}`);
                
                // Click the button
                await scormFrame.click(`[data-model-id="${buttonId}"]`);
                console.log(`Clicked pharmacy orange plus button (ID: ${buttonId})`);
                buttonFound = true;
                break;
              }
            } catch (error) {
              console.log(`Error with button ID ${buttonId}:`, error.message);
            }
          }
          
          // If we couldn't find the button by ID, look for visual characteristics
          if (!buttonFound) {
            console.log('Button not found by ID, trying to locate by visual characteristics...');
            
            const buttonClicked = await scormFrame.evaluate(() => {
              // Look for orange elements (common for plus buttons)
              const orangeElements = Array.from(document.querySelectorAll('[style*="fill: #FF9800"], [style*="stroke: #FF9800"]'));
              
              for (const element of orangeElements) {
                const parent = element.closest('.slide-object-vectorshape');
                if (parent) {
                  parent.click();
                  console.log('Clicked orange element that might be a plus button');
                  return true;
                }
              }
              
              // Last resort: try to click in the center-right area
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              
              const centerRightX = viewportWidth * 0.75;
              const centerY = viewportHeight * 0.5;
              
              const elementAtPoint = document.elementFromPoint(centerRightX, centerY);
              if (elementAtPoint) {
                const parent = elementAtPoint.closest('.slide-object-vectorshape') || elementAtPoint;
                parent.click();
                console.log('Clicked element in center-right area');
                return true;
              }
              
              return false;
            });
            
            if (buttonClicked) {
              buttonFound = true;
            }
          }
          
          if (!buttonFound) {
            console.log('Warning: Could not find orange plus button in pharmacy scene');
          }
          
        } else if (slideType === 'MESSAGE_BUTTONS_SLIDE') {
          // Handle message buttons slide
          console.log('Handling message buttons slide...');
          
          // Try to identify and click message buttons
          let messageButtons = [];
          try {
            messageButtons = await scormFrame.evaluate(() => {
              // First, look for message buttons by known IDs
              const knownButtonIds = ['6l65RbsSaM0', '5WXPfWGTEQl'];
              
              for (const id of knownButtonIds) {
                const button = document.querySelector(`[data-model-id="${id}"]`);
                if (button && window.getComputedStyle(button).display !== 'none') {
                  return [id];
                }
              }
              
              // If known IDs not found, look for any button-like elements
              const possibleButtons = Array.from(document.querySelectorAll('.slide-object-button, [role="button"], [data-acc-text*="button"]'));
              return possibleButtons.map(btn => btn.getAttribute('data-model-id')).filter(Boolean);
            });
            
            console.log(`Found message buttons: ${messageButtons.join(', ')}`);
          } catch (error) {
            console.log('Error finding message buttons:', error.message);
          }
          
          // Click message buttons
          let clickCount = 0;
          for (const buttonId of messageButtons) {
            if (clickCount >= maxMessageClicks) break;
            
            try {
              await scormFrame.click(`[data-model-id="${buttonId}"]`);
              console.log(`Clicked message button: ${buttonId}`);
              clickCount++;
              await sleep(1000); // Wait between clicks
            } catch (error) {
              console.log(`Error clicking message button ${buttonId}:`, error.message);
            }
          }
          
          // If we didn't find any message buttons by ID, try clicking by position
          if (clickCount === 0) {
            try {
              const clicked = await scormFrame.evaluate(() => {
                // Try to find buttons by their appearance
                const blueElements = Array.from(document.querySelectorAll('[style*="fill: #4682B4"], [style*="stroke: #4682B4"]'));
                
                for (const element of blueElements) {
                  const parent = element.closest('.slide-object-vectorshape');
                  if (parent) {
                    parent.click();
                    return true;
                  }
                }
                
                // Try clicking in the center-left area where message buttons often are
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                const centerLeftX = viewportWidth * 0.25;
                const centerY = viewportHeight * 0.5;
                
                const elementAtPoint = document.elementFromPoint(centerLeftX, centerY);
                if (elementAtPoint) {
                  const parent = elementAtPoint.closest('.slide-object-vectorshape') || elementAtPoint;
                  parent.click();
                  return true;
                }
                
                return false;
              });
              
              if (clicked) {
                console.log('Clicked potential message button by position');
                clickCount++;
              }
            } catch (error) {
              console.log('Error in fallback message button click:', error.message);
            }
          }
          
          console.log(`Total message buttons clicked: ${clickCount}`);
        } else {
          // Unknown slide type, try generic interaction
          console.log('Unknown slide type, trying generic interaction...');
          
          const interacted = await scormFrame.evaluate(() => {
            // Try to find and click any interactive element
            const interactiveElements = Array.from(document.querySelectorAll('.slide-object-button, [role="button"], [style*="cursor: pointer"]'));
            
            if (interactiveElements.length > 0) {
              interactiveElements[0].click();
              return true;
            }
            
            // Try clicking in the center of the screen
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const centerX = viewportWidth / 2;
            const centerY = viewportHeight / 2;
            
            const elementAtPoint = document.elementFromPoint(centerX, centerY);
            if (elementAtPoint) {
              elementAtPoint.click();
              return true;
            }
            
            return false;
          });
          
          if (interacted) {
            console.log('Performed generic interaction with unknown slide type');
          } else {
            console.log('Could not interact with unknown slide type');
          }
        }
        
        // Wait before proceeding
        await sleep(2000);
        
        return true;
      } catch (error) {
        console.error('Error in handlePharmacyOrMessageButtons:', error.message);
        return false;
      }
    },

    // In customFunctions of cystinolAkut.js
    /**
     * REVAMPED: Click all risk factors based on the actual HTML structure
     * Updated to work with the specific data-model-ids and SVG eventable groups
     */
    clickAllRiskFactors: async function(scormFrame, params = {}) {
      try {
        console.log('Starting REVAMPED risk factors interaction with actual element IDs...');
        
        // Wait for risk factors to load
        await sleep(params.initialDelay || 2000);
        
        // Define risk factors by their actual data-model-ids from the HTML
        const riskFactorElements = [
          {
            id: "6ik9oDyZp4F",
            description: "Old lady (elderly woman risk factor)"
          },
          {
            id: "6aelPxiqTQs", 
            description: "Pregnant lady (pregnancy risk factor)"
          },
          {
            id: "6cACM9wqz9n",
            description: "Women on blanket (lifestyle risk factor)" 
          },
          {
            id: "6U8twOQqmyr",
            description: "Lady with red nose (health condition risk factor)"
          },
          {
            id: "6f83JhqEXI5", 
            description: "Reading lady (stress/lifestyle risk factor)"
          },
          {
            id: "6CgBjku5i0P",
            description: "Couple kissing (sexual activity risk factor)"
          }
        ];

        console.log(`Will click ${riskFactorElements.length} risk factor images...`);

        let successfulClicks = 0;

        // Click each risk factor element using the SVG eventable group
        for (let i = 0; i < riskFactorElements.length; i++) {
          const factor = riskFactorElements[i];
          console.log(`Clicking risk factor ${i + 1}/${riskFactorElements.length}: ${factor.description} (ID: ${factor.id})`);
          
          try {
            // Enhanced clicking method targeting the eventable SVG group
            const clickSuccess = await scormFrame.evaluate((factorId) => {
              const element = document.querySelector(`[data-model-id="${factorId}"]`);
              if (!element) {
                console.log(`[BROWSER] Element not found: ${factorId}`);
                return false;
              }

              // Check if element is visible and has cursor-hover class
              const isVisible = window.getComputedStyle(element).display !== 'none';
              const isInteractive = element.classList.contains('cursor-hover');
              
              if (!isVisible || !isInteractive) {
                console.log(`[BROWSER] Element not interactive: ${factorId}`);
                return false;
              }

              // Target the SVG eventable group specifically (most reliable)
              const eventableGroup = element.querySelector('svg g.eventable');
              if (eventableGroup) {
                // Get center coordinates for precise clicking
                const rect = eventableGroup.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Dispatch comprehensive mouse event sequence
                const events = [
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0})
                ];
                
                // Dispatch events to the eventable group
                events.forEach(event => eventableGroup.dispatchEvent(event));
                console.log(`[BROWSER] Dispatched events to eventable group for: ${factorId}`);
                
                // Also try clicking the main element as backup
                element.click();
                console.log(`[BROWSER] Also clicked main element: ${factorId}`);
                
                return true;
              } else {
                // Fallback: click the main element directly
                element.click();
                console.log(`[BROWSER] Clicked main element (no eventable group): ${factorId}`);
                return true;
              }
            }, factor.id);

            if (clickSuccess) {
              console.log(`✅ Successfully clicked risk factor: ${factor.description}`);
              successfulClicks++;
            } else {
              console.log(`❌ Failed to click risk factor: ${factor.description}`);
            }

          } catch (error) {
            console.error(`Error clicking risk factor ${factor.id}:`, error.message);
          }
          
          // Wait between clicks to allow for animations/feedback
          await sleep(params.delayBetweenClicks || 1000);
        }

        console.log(`✅ Clicked ${successfulClicks}/${riskFactorElements.length} risk factors`);

        // Wait for success dialog to appear
        console.log('Waiting for success dialog to appear...');
        await sleep(params.waitForPopup || 3000);

        // Handle success popup with the CORRECT close button ID
        console.log('Closing success dialog with updated button ID...');
        
        try {
          // Use the correct close button ID from the HTML: 6C0p3gtvB8a
          const correctCloseButtonId = "6C0p3gtvB8a";
          
          const dialogClosed = await scormFrame.evaluate((closeButtonId) => {
            // Find the close button element
            const closeButton = document.querySelector(`[data-model-id="${closeButtonId}"]`);
            if (!closeButton) {
              console.log(`[BROWSER] Close button not found: ${closeButtonId}`);
              return false;
            }

            // Check if it's part of a shown dialog
            const isInShownDialog = closeButton.closest('.slide-object-stategroup.shown') || 
                                  closeButton.classList.contains('shown');
                                  
            if (!isInShownDialog) {
              console.log(`[BROWSER] Close button not in shown dialog: ${closeButtonId}`);
              return false;
            }

            // Target the SVG eventable group for reliable clicking
            const eventableGroup = closeButton.querySelector('svg g.eventable');
            if (eventableGroup) {
              // Get center coordinates
              const rect = eventableGroup.getBoundingClientRect();
              const centerX = rect.left + rect.width/2;
              const centerY = rect.top + rect.height/2;
              
              // Comprehensive click event sequence
              const events = [
                new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0})
              ];
              
              // Dispatch to eventable group
              events.forEach(event => eventableGroup.dispatchEvent(event));
              console.log(`[BROWSER] Dispatched close events to eventable group: ${closeButtonId}`);
              
              // Also try direct element click as backup
              closeButton.click();
              console.log(`[BROWSER] Also clicked close button directly: ${closeButtonId}`);
              
              return true;
            } else {
              // Fallback: direct click
              closeButton.click();
              console.log(`[BROWSER] Direct clicked close button: ${closeButtonId}`);
              return true;
            }
          }, correctCloseButtonId);

          if (dialogClosed) {
            console.log('✅ Successfully closed success dialog');
          } else {
            console.log('⚠️ Could not close dialog with primary method, trying fallbacks...');
            
            // Fallback: try other common close button methods
            await scormFrame.evaluate(() => {
              // Try clicking any orange stroke circle (typical close button)
              const orangeCircles = document.querySelectorAll('path[stroke="#FF9800"]');
              for (const circle of orangeCircles) {
                const parent = circle.closest('[data-model-id]');
                if (parent && parent.getAttribute('data-acc-text') === 'Oval 3') {
                  parent.click();
                  console.log('[BROWSER] Clicked orange oval as fallback close');
                  return true;
                }
              }
              
              // Try pressing Escape key
              document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                bubbles: true
              }));
              console.log('[BROWSER] Pressed Escape as fallback');
              
              return false;
            });
          }

        } catch (closeError) {
          console.error('Error closing success dialog:', closeError.message);
        }
        
        await sleep(params.waitAfterClose || 2000);

        // IMPORTANT: Click the next button to proceed (using the correct ID from the HTML)
        console.log('Clicking next button to proceed from risk factors slide...');
        
        try {
          const nextButtonId = "5fJnOnqo2Mn"; // The actual next button ID from the HTML
          
          const nextButtonClicked = await scormFrame.evaluate((buttonId) => {
            const nextButton = document.querySelector(`[data-model-id="${buttonId}"]`);
            if (!nextButton) {
              console.log(`[BROWSER] Next button not found: ${buttonId}`);
              return false;
            }

            // Check if button is visible and shown
            const isVisible = window.getComputedStyle(nextButton).display !== 'none';
            const isShown = nextButton.classList.contains('shown');
            
            if (!isVisible || !isShown) {
              console.log(`[BROWSER] Next button not visible/shown: ${buttonId}`);
              return false;
            }

            // Target the SVG eventable group for reliable clicking
            const eventableGroup = nextButton.querySelector('svg g.eventable');
            if (eventableGroup) {
              // Get center coordinates
              const rect = eventableGroup.getBoundingClientRect();
              const centerX = rect.left + rect.width/2;
              const centerY = rect.top + rect.height/2;
              
              // Comprehensive click event sequence for next button
              const events = [
                new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0})
              ];
              
              // Dispatch to eventable group
              events.forEach(event => eventableGroup.dispatchEvent(event));
              console.log(`[BROWSER] Dispatched next button events to eventable group: ${buttonId}`);
              
              // Also try direct element click as backup
              nextButton.click();
              console.log(`[BROWSER] Also clicked next button directly: ${buttonId}`);
              
              return true;
            } else {
              // Fallback: direct click
              nextButton.click();
              console.log(`[BROWSER] Direct clicked next button: ${buttonId}`);
              return true;
            }
          }, nextButtonId);

          if (nextButtonClicked) {
            console.log('✅ Successfully clicked next button to proceed');
          } else {
            console.log('⚠️ Could not click next button, trying fallback...');
            
            // Fallback: try clicking by orange stroke (the button has stroke="#FF9800")
            await scormFrame.evaluate(() => {
              // Look for orange stroke circles that could be next buttons
              const orangeButtons = document.querySelectorAll('path[stroke="#FF9800"]');
              for (const path of orangeButtons) {
                const parent = path.closest('[data-model-id]');
                if (parent && parent.classList.contains('shown')) {
                  // Check if it's likely a next button (usually in bottom right area)
                  const rect = parent.getBoundingClientRect();
                  if (rect.right > window.innerWidth * 0.7 && rect.bottom > window.innerHeight * 0.7) {
                    parent.click();
                    console.log('[BROWSER] Clicked orange button in bottom right as next button');
                    return true;
                  }
                }
              }
              
              // Final fallback: click bottom right corner
              const rightSide = window.innerWidth - 50;
              const bottomSide = window.innerHeight - 50;
              const element = document.elementFromPoint(rightSide, bottomSide);
              if (element) {
                element.click();
                console.log('[BROWSER] Clicked bottom right corner as next button fallback');
                return true;
              }
              
              return false;
            });
          }

        } catch (nextButtonError) {
          console.error('Error clicking next button:', nextButtonError.message);
        }

        // Wait for transition after clicking next button
        await sleep(params.waitAfterNext || 3000);

        console.log('🎉 REVAMPED risk factors interaction completed!');
        
        // Success criteria: at least 4 out of 6 risk factors clicked
        const successRate = successfulClicks / riskFactorElements.length;
        const success = successRate >= 0.66; // 66% success rate
        
        console.log(`📊 Success rate: ${(successRate * 100).toFixed(1)}% (${successfulClicks}/${riskFactorElements.length})`);
        
        return success;
      } catch (error) {
        console.error('Error in REVAMPED risk factors interaction:', error.message);
        return false;
      }
    },
    
    // Implementation from cystinolAkut1.js
    clickMessageButtonThreeTimes: async function(scormFrame) {
      for (let i = 1; i <= 3; i++) {
        try {
          await scormFrame.waitForSelector('[data-model-id="6l65RbsSaM0"]', { 
            visible: true,
            timeout: 10000 
          });
          await scormFrame.click('[data-model-id="6l65RbsSaM0"]');
          console.log(`Clicked message button (${i}/3)`);
          await sleep(2000);
        } catch (error) {
          throw new Error(`Failed to click message button on attempt ${i}: ${error.message}`);
        }
      }
    },
    
    // Implementation from cystinolAkut1.js
    waitForAndClickMediBee: async function(scormFrame) {
      try {
        // Wait for message to disappear and MediBee to appear
        console.log('Waiting for MediBee to appear...');
        await sleep(4000);  // Wait for animation/transition

        // Wait for and click the MediBee element
        await scormFrame.waitForSelector('[data-model-id="65WBcmftYDt"]', {
          visible: true,
          timeout: 10000
        });
        
        await scormFrame.click('[data-model-id="65WBcmftYDt"]');
        console.log('Clicked MediBee element');
        
        return true;
      } catch (error) {
        throw new Error(`Failed to click MediBee: ${error.message}`);
      }
    },

    /**
     * Handle timed slide that requires 28 seconds wait for next button to become active
     * This is for the bacteria information slide that has a specific timing requirement
     */
    handleTimedSlideWithWait: async function(scormFrame, params = {}) {
      try {
        console.log('Starting timed slide handler - waiting for next button to become active...');
        
        const nextButtonId = "5fJnOnqo2Mn"; // Same ID as before
        const requiredWaitTime = params.requiredWaitTime || 28000; // 28 seconds default
        const maxWaitTime = params.maxWaitTime || 35000; // 35 seconds max (safety buffer)
        
        console.log(`⏳ Waiting ${requiredWaitTime/1000} seconds for next button to become active...`);
        
        // Method 1: Simple wait approach (most reliable for timed content)
        if (params.useSimpleWait !== false) {
          console.log('Using simple wait approach for timed content...');
          await sleep(requiredWaitTime);
          
          // After the wait, click the button
          console.log('Wait complete, attempting to click next button...');
          
        } else {
          // Method 2: Polling approach (checks button state periodically)
          console.log('Using polling approach to detect button activation...');
          
          const startTime = Date.now();
          let buttonActive = false;
          
          while (!buttonActive && (Date.now() - startTime < maxWaitTime)) {
            // Check if the next button is active (has orange stroke)
            buttonActive = await scormFrame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              if (!button) return false;
              
              const isShown = button.classList.contains('shown');
              const isVisible = window.getComputedStyle(button).display !== 'none';
              const hasOrangeStroke = button.querySelector('path[stroke="#FF9800"]');
              
              // Additional check: see if button responds to hover (indicates it's active)
              const isInteractive = button.classList.contains('cursor-hover') || 
                                  button.style.cursor === 'pointer';
              
              const isActive = isShown && isVisible && hasOrangeStroke;
              
              if (isActive) {
                console.log(`[BROWSER] Button is active: shown=${isShown}, visible=${isVisible}, hasOrange=${!!hasOrangeStroke}`);
              }
              
              return isActive;
            }, nextButtonId);
            
            if (buttonActive) {
              console.log(`✅ Next button became active after ${((Date.now() - startTime)/1000).toFixed(1)} seconds`);
              break;
            }
            
            // Log progress every 5 seconds
            const elapsed = (Date.now() - startTime) / 1000;
            if (Math.floor(elapsed) % 5 === 0 && elapsed >= 5) {
              console.log(`⏳ Still waiting... ${elapsed.toFixed(0)}s elapsed`);
            }
            
            await sleep(1000); // Check every second
          }
          
          if (!buttonActive) {
            console.log(`⚠️ Button didn't become active within ${maxWaitTime/1000}s, proceeding anyway...`);
          }
        }
        
        // Now click the next button using the proven method
        console.log('Clicking next button with enhanced method...');
        
        try {
          const nextButtonClicked = await scormFrame.evaluate((buttonId) => {
            const nextButton = document.querySelector(`[data-model-id="${buttonId}"]`);
            if (!nextButton) {
              console.log(`[BROWSER] Next button not found: ${buttonId}`);
              return false;
            }

            // Target the SVG eventable group for reliable clicking
            const eventableGroup = nextButton.querySelector('svg g.eventable');
            if (eventableGroup) {
              // Get center coordinates
              const rect = eventableGroup.getBoundingClientRect();
              const centerX = rect.left + rect.width/2;
              const centerY = rect.top + rect.height/2;
              
              // Comprehensive click event sequence
              const events = [
                new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0})
              ];
              
              // Dispatch to eventable group
              events.forEach(event => eventableGroup.dispatchEvent(event));
              console.log(`[BROWSER] Dispatched click events to eventable group: ${buttonId}`);
              
              // Also try direct element click as backup
              nextButton.click();
              console.log(`[BROWSER] Also clicked next button directly: ${buttonId}`);
              
              return true;
            } else {
              // Fallback: direct click
              nextButton.click();
              console.log(`[BROWSER] Direct clicked next button: ${buttonId}`);
              return true;
            }
          }, nextButtonId);

          if (nextButtonClicked) {
            console.log('✅ Successfully clicked next button on timed slide');
          } else {
            console.log('⚠️ Could not click next button, trying fallback...');
            
            // Fallback: click by orange stroke in bottom right area
            await scormFrame.evaluate(() => {
              const orangeButtons = document.querySelectorAll('path[stroke="#FF9800"]');
              for (const path of orangeButtons) {
                const parent = path.closest('[data-model-id]');
                if (parent && parent.classList.contains('shown')) {
                  const rect = parent.getBoundingClientRect();
                  // Check if it's in the bottom right area (typical next button position)
                  if (rect.right > window.innerWidth * 0.7 && rect.bottom > window.innerHeight * 0.7) {
                    parent.click();
                    console.log('[BROWSER] Clicked orange button in bottom right as next button');
                    return true;
                  }
                }
              }
              
              // Final fallback
              const rightSide = window.innerWidth - 50;
              const bottomSide = window.innerHeight - 50;
              const element = document.elementFromPoint(rightSide, bottomSide);
              if (element) {
                element.click();
                console.log('[BROWSER] Clicked bottom right corner as final fallback');
              }
              
              return false;
            });
          }

        } catch (clickError) {
          console.error('Error clicking next button on timed slide:', clickError.message);
        }

        // Wait for transition to next slide
        console.log('Waiting for transition to next slide...');
        await sleep(params.waitAfterClick || 5000);

        console.log('🎉 Timed slide completed successfully!');
        return true;
        
      } catch (error) {
        console.error('Error in timed slide handler:', error.message);
        
        // Emergency fallback: try to click something in bottom right
        try {
          await scormFrame.evaluate(() => {
            const rightSide = window.innerWidth - 50;
            const bottomSide = window.innerHeight - 50;
            const element = document.elementFromPoint(rightSide, bottomSide);
            if (element) element.click();
          });
        } catch (e) {
          console.log('Emergency fallback also failed');
        }
        
        return false;
      }
    },

    /**
     * Handle message dialog sequence with updated next button ID
     * Updated to use the correct next button ID: 6Cp6RKOAOTU
     */
    handleMessageDialogSequence: async function(scormFrame, params = {}) {
      try {
        console.log('Starting message dialog sequence with updated next button handling...');
        
        const messageButtonId = "6l65RbsSaM0"; // Message button ID (this worked)
        const nextButtonId = "6Cp6RKOAOTU";   // UPDATED: New next button ID
        const maxClicks = params.maxClicks || 1;
        const delayBetweenClicks = params.delayBetweenClicks || 1500;
        const waitForActivation = params.waitForActivation || 5000; // Wait for button to become active
        
        console.log(`Will click message button ${maxClicks} times, then proceed with next button: ${nextButtonId}`);
        
        // STEP 1: Click message button the required number of times
        for (let i = 1; i <= maxClicks; i++) {
          console.log(`Message button click ${i}/${maxClicks}`);
          
          try {
            await scormFrame.click(`[data-model-id="${messageButtonId}"]`);
            console.log(`✅ Message button click ${i} successful`);
            
            if (i < maxClicks) {
              await sleep(delayBetweenClicks);
            }
          } catch (error) {
            console.log(`❌ Error with message button click ${i}: ${error.message}`);
          }
        }
        
        console.log('✅ All message button clicks completed');
        
        // STEP 2: Wait for next button to become active (stroke changes from gray to orange)
        console.log(`⏳ Waiting ${waitForActivation/1000}s for next button to become active...`);
        await sleep(waitForActivation);
        
        // STEP 3: Click next button with enhanced detection and multiple strategies
        console.log('Attempting to click next button with multiple strategies...');
        
        let nextButtonClicked = false;
        
        // Strategy 1: Direct click with specific ID
        try {
          const buttonFound = await scormFrame.evaluate((buttonId) => {
            const button = document.querySelector(`[data-model-id="${buttonId}"]`);
            if (!button) {
              console.log(`[BROWSER] Button not found: ${buttonId}`);
              return false;
            }
            
            const isShown = button.classList.contains('shown');
            const isVisible = window.getComputedStyle(button).display !== 'none';
            
            console.log(`[BROWSER] Button state: shown=${isShown}, visible=${isVisible}`);
            
            return isShown && isVisible;
          }, nextButtonId);
          
          if (buttonFound) {
            await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
            console.log(`✅ Strategy 1: Clicked next button with ID: ${nextButtonId}`);
            nextButtonClicked = true;
          }
        } catch (error) {
          console.log(`Strategy 1 failed: ${error.message}`);
        }
        
        // Strategy 2: Enhanced SVG eventable group clicking
        if (!nextButtonClicked) {
          try {
            nextButtonClicked = await scormFrame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              if (!button) return false;
              
              // Target the SVG eventable group specifically
              const eventableGroup = button.querySelector('svg g.eventable');
              if (eventableGroup) {
                // Get center coordinates
                const rect = eventableGroup.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Comprehensive click event sequence
                const events = [
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY, button: 0})
                ];
                
                // Dispatch events
                events.forEach(event => eventableGroup.dispatchEvent(event));
                console.log(`[BROWSER] Strategy 2: Enhanced SVG click for ${buttonId}`);
                
                // Also try direct click as backup
                button.click();
                console.log(`[BROWSER] Strategy 2: Also direct clicked ${buttonId}`);
                
                return true;
              }
              
              return false;
            }, nextButtonId);
            
            if (nextButtonClicked) {
              console.log(`✅ Strategy 2: Enhanced SVG click successful`);
            }
          } catch (error) {
            console.log(`Strategy 2 failed: ${error.message}`);
          }
        }
        
        // Strategy 3: Look for any orange or gray stroke circles (button might still be gray but clickable)
        if (!nextButtonClicked) {
          try {
            nextButtonClicked = await scormFrame.evaluate(() => {
              // Look for circles with orange OR gray stroke (in case button is still gray but clickable)
              const strokeColors = ['#FF9800', '#BFBFBF']; // Orange or gray
              
              for (const color of strokeColors) {
                const circles = document.querySelectorAll(`path[stroke="${color}"]`);
                for (const path of circles) {
                  const parent = path.closest('[data-model-id]');
                  if (parent && parent.classList.contains('shown')) {
                    // Check if it's likely a next button (in bottom right area)
                    const rect = parent.getBoundingClientRect();
                    if (rect.right > window.innerWidth * 0.7 && rect.bottom > window.innerHeight * 0.7) {
                      // Try clicking with events
                      const centerX = rect.left + rect.width/2;
                      const centerY = rect.top + rect.height/2;
                      
                      const clickEvent = new MouseEvent('click', {
                        bubbles: true, 
                        cancelable: true, 
                        view: window,
                        clientX: centerX,
                        clientY: centerY
                      });
                      
                      parent.dispatchEvent(clickEvent);
                      parent.click(); // Also direct click
                      
                      console.log(`[BROWSER] Strategy 3: Clicked ${color} stroke button in bottom right`);
                      return true;
                    }
                  }
                }
              }
              
              return false;
            });
            
            if (nextButtonClicked) {
              console.log(`✅ Strategy 3: Stroke-based click successful`);
            }
          } catch (error) {
            console.log(`Strategy 3 failed: ${error.message}`);
          }
        }
        
        // Strategy 4: Position-based clicking (bottom right corner)
        if (!nextButtonClicked) {
          try {
            await scormFrame.evaluate(() => {
              // Try clicking in bottom right area where next buttons typically are
              const positions = [
                { x: window.innerWidth - 50, y: window.innerHeight - 50 },   // Very bottom right
                { x: window.innerWidth - 100, y: window.innerHeight - 50 },  // Slightly left
                { x: window.innerWidth - 50, y: window.innerHeight - 100 },  // Slightly up
              ];
              
              for (const pos of positions) {
                const element = document.elementFromPoint(pos.x, pos.y);
                if (element) {
                  element.click();
                  console.log(`[BROWSER] Strategy 4: Clicked element at (${pos.x}, ${pos.y})`);
                  return true;
                }
              }
              
              return false;
            });
            
            console.log(`✅ Strategy 4: Position-based click attempted`);
            nextButtonClicked = true; // Assume success for position-based clicking
          } catch (error) {
            console.log(`Strategy 4 failed: ${error.message}`);
          }
        }
        
        // Wait for transition
        console.log('Waiting for transition to next slide...');
        await sleep(params.waitAfterNext || 5000);
        
        if (nextButtonClicked) {
          console.log('🎉 Message dialog sequence completed successfully!');
        } else {
          console.log('⚠️ Message dialog sequence completed, but next button click uncertain');
        }
        
        return true;
        
      } catch (error) {
        console.error('Error in message dialog sequence:', error.message);
        
        // Emergency fallback
        try {
          await scormFrame.evaluate(() => {
            const rightSide = window.innerWidth - 50;
            const bottomSide = window.innerHeight - 50;
            const element = document.elementFromPoint(rightSide, bottomSide);
            if (element) element.click();
          });
        } catch (e) {
          console.log('Emergency fallback failed');
        }
        
        return false;
      }
    },
        
    // Final implementation for handling slider interaction with direct element clicking
    // Completely standalone implementation for slider interaction
    // This does NOT use any functions from pageInteractions.js
    handleSliderInteraction: async function(scormFrame, params = {}) {
      try {
        console.log('Starting standalone slider interaction handler (completely independent)...');

        // ------------------------------------------------------------
        // PART 1: Move slider to target position
        // ------------------------------------------------------------
        
        // Default params
        const initialDelay = params.initialDelay || 2000;
        const waitAfterSelection = params.waitAfterSelection || 1000;
        const waitAfterSubmit = params.waitAfterSubmit || 3000;
        
        // Wait for initial delay to ensure page is fully loaded
        await sleep(initialDelay);
        
        // Move the slider to the target position 
        const targetPosition = params.targetPosition || 5; // Default to position 5
        console.log(`Moving slider to position ${targetPosition}`);

        await scormFrame.evaluate((position) => {
          const slider = document.querySelector('[data-model-id="5aV8PocxYuR"]');
          if (slider) {
            const positions = [0, 70, 140, 210, 280, 350, 420]; // Pixel positions for each step
            const targetX = positions[position - 1]; // Convert to 0-based index
            slider.style.transform = `translate(${targetX}px, 0px) rotate(0deg) scale(1, 1)`;
            console.log(`Slider moved to position ${position} (x=${targetX}px)`);
          } else {
            console.log('Slider not found');
          }
        }, targetPosition);

        await sleep(waitAfterSelection);

        // ------------------------------------------------------------
        // PART 2: Click the Absenden (Submit) button 
        // ------------------------------------------------------------
        
        console.log('Clicking Absenden button...');
        
        await scormFrame.evaluate(() => {
          // Function to dispatch a complete set of mouse events
          const dispatchCompleteClickEvents = (element) => {
            if (!element) return false;
            
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width/2;
            const centerY = rect.top + rect.height/2;
            
            // Create and dispatch events in the right order for a complete click
            const events = [
              new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
            ];
            
            // Dispatch all events
            for (const event of events) {
              element.dispatchEvent(event);
            }
            
            return true;
          };
          
          // First try by specific ID
          const submitBtn = document.querySelector('[data-model-id="5ppizEiswFw"]');
          if (submitBtn) {
            dispatchCompleteClickEvents(submitBtn);
            console.log('Dispatched events to Absenden button by ID');
            return true;
          }
          
          // Try by text content
          const submitTexts = ['Absenden', 'Submit', 'OK', 'Prüfen'];
          const allButtons = Array.from(document.querySelectorAll('div[role="button"], button, div.slide-object-button, div[data-acc-text*="button"]'));
          
          for (const btn of allButtons) {
            const text = btn.textContent || btn.getAttribute('data-acc-text') || '';
            if (submitTexts.some(t => text.includes(t))) {
              dispatchCompleteClickEvents(btn);
              console.log('Dispatched events to Absenden button by text match');
              return true;
            }
          }
          
          // Try center bottom position
          const centerX = window.innerWidth / 2;
          const bottomY = window.innerHeight - 100;
          const element = document.elementFromPoint(centerX, bottomY);
          if (element) {
            dispatchCompleteClickEvents(element);
            console.log('Dispatched events to element at bottom center');
            return true;
          }
          
          return false;
        });
        
        // Wait for the result dialog to appear
        console.log(`Waiting ${waitAfterSubmit}ms for dialog to appear...`);
        await sleep(waitAfterSubmit);
        
        // ------------------------------------------------------------
        // PART 3: X Button Click - Direct targeted approach using low-level events
        // ------------------------------------------------------------
        
        console.log('Using specialized X button click method...');
        
        // Wait extra time to ensure dialog is fully visible
        await sleep(2000);
        
        await scormFrame.evaluate(() => {
          // Debugging function to help track what's happening
          const debugInfo = {
            attempts: 0,
            methods: [],
            foundElements: []
          };
          
          // MOST SPECIFIC METHOD: Target exact HTML structure from paste.txt
          // Direct reference to the specific HTML structure we know exists
          try {
            debugInfo.attempts++;
            debugInfo.methods.push("direct_html_targeting");
            
            // Get all the potential elements from the known structure
            // This handles all three parts of the X button
            const xButtonElements = [
              // 1. Main container with state group
              document.querySelector('div.slide-object.slide-object-stategroup.shown.cursor-hover[data-model-id="6aNlE2Xany4"]'),
              
              // 2. The orange circle
              document.querySelector('div.slide-object.slide-object-vectorshape[data-model-id="6aNlE2Xany4"]'),
              
              // 3. The white X symbol
              document.querySelector('div.slide-object.slide-object-vectorshape[data-model-id="5myJdF9hfmN"]'),
              
              // 4. The orange stroke circle
              document.querySelector('div.slide-object.slide-object-vectorshape[data-model-id="5oCCHMCBgOu"]')
            ].filter(Boolean); // Remove any null values
            
            debugInfo.foundElements = xButtonElements.map(el => el?.getAttribute('data-model-id') || 'unknown');
            
            if (xButtonElements.length > 0) {
              console.log(`Found ${xButtonElements.length} X button elements by direct HTML targeting`);
              
              // Dispatch events to ALL found elements to maximize chances of success
              for (const element of xButtonElements) {
                // Get center coordinates for this element
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Dispatch a full sequence of events
                const events = [
                  new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
                ];
                
                // Dispatch them all
                for (const event of events) {
                  element.dispatchEvent(event);
                }
                
                console.log(`Dispatched all events to element with ID: ${element.getAttribute('data-model-id')}`);
              }
              
              // Also dispatch events to document for event delegation
              document.dispatchEvent(new MouseEvent('click', {
                bubbles: true, 
                cancelable: true,
                view: window,
                clientX: 970, // From screenshot X button position
                clientY: 165  // From screenshot X button position
              }));
              
              // Sleep briefly to let any handlers process
              setTimeout(() => {
                console.log("Delayed actions after dispatching events");
              }, 500);
            }
          } catch (e) {
            console.log(`Error in direct HTML targeting: ${e.message}`);
          }
          
          // METHOD 2: Target SVG paths directly
          try {
            debugInfo.attempts++;
            debugInfo.methods.push("svg_path_targeting");
            
            // Target the specific SVG paths from the HTML
            const pathSelectors = [
              // Orange circle fill
              'path[fill="#FF9800"]',
              
              // White X 
              'path[fill="#FFFFFF"]',
              
              // Orange stroke
              'path[stroke="#FF9800"]'
            ];
            
            let pathsFound = 0;
            
            for (const selector of pathSelectors) {
              const paths = document.querySelectorAll(selector);
              
              for (const path of paths) {
                // Find the clickable parent
                const clickable = path.closest('[data-model-id]');
                if (!clickable) continue;
                
                // Get center coordinates
                const rect = clickable.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Dispatch events to both the path and its parent
                const events = [
                  new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
                ];
                
                for (const event of events) {
                  path.dispatchEvent(event);
                  clickable.dispatchEvent(event);
                }
                
                pathsFound++;
                console.log(`Dispatched events to path with selector ${selector} and its parent`);
              }
            }
            
            console.log(`Found and dispatched events to ${pathsFound} SVG paths`);
          } catch (e) {
            console.log(`Error in SVG path targeting: ${e.message}`);
          }
          
          // METHOD 3: Click at exact coordinates from screenshot
          try {
            debugInfo.attempts++;
            debugInfo.methods.push("exact_coordinates");
            
            // From the image, we can see the X button is approximately at these coordinates
            const xButtonX = 970; 
            const xButtonY = 165;
            
            // Find element at this position
            const elementAtXButton = document.elementFromPoint(xButtonX, xButtonY);
            
            if (elementAtXButton) {
              console.log(`Found element at X button coordinates: ${elementAtXButton.tagName} with ID ${elementAtXButton.getAttribute('data-model-id') || 'none'}`);
              
              // Dispatch events directly to this element
              const events = [
                new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: xButtonX, clientY: xButtonY}),
                new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: xButtonX, clientY: xButtonY}),
                new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: xButtonX, clientY: xButtonY}),
                new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: xButtonX, clientY: xButtonY}),
                new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: xButtonX, clientY: xButtonY})
              ];
              
              for (const event of events) {
                elementAtXButton.dispatchEvent(event);
              }
              
              // Also try clicking parent elements
              let parent = elementAtXButton.parentElement;
              for (let i = 0; parent && i < 3; i++) {
                for (const event of events) {
                  parent.dispatchEvent(event);
                }
                parent = parent.parentElement;
              }
              
              console.log("Dispatched events to element at X button coordinates and its parents");
            }
            
            // Also dispatch directly to document at those coordinates
            document.dispatchEvent(new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: xButtonX,
              clientY: xButtonY
            }));
          } catch (e) {
            console.log(`Error in exact coordinates method: ${e.message}`);
          }
          
          // METHOD 4: Target "eventable" elements
          try {
            debugInfo.attempts++;
            debugInfo.methods.push("eventable_elements");
            
            // From paste.txt, we know there are elements with class "eventable" 
            // and data-accepts="events" attribute
            const eventableElements = document.querySelectorAll('.eventable, [data-accepts="events"]');
            
            console.log(`Found ${eventableElements.length} eventable elements`);
            
            for (const el of eventableElements) {
              // Find closest data-model-id for debugging
              const modelId = el.closest('[data-model-id]')?.getAttribute('data-model-id') || 'unknown';
              
              // Dispatch events
              el.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              }));
              
              console.log(`Dispatched click to eventable element near model ID: ${modelId}`);
            }
          } catch (e) {
            console.log(`Error in eventable elements method: ${e.message}`);
          }
          
          // METHOD 5: Try direct DOM API modifications
          try {
            debugInfo.attempts++;
            debugInfo.methods.push("dom_api_modification");
            
            // Function to try to programmatically remove the dialog
            const attemptDialogRemoval = () => {
              // Find the dialog container
              const dialogContainers = document.querySelectorAll('.slide-object-stategroup.shown');
              let removed = false;
              
              for (const dialog of dialogContainers) {
                // First try to trigger a close event
                dialog.dispatchEvent(new CustomEvent('close', { bubbles: true }));
                
                // Then try to directly modify the DOM
                try {
                  // Try to remove the shown class
                  dialog.classList.remove('shown');
                  
                  // Try to hide it
                  dialog.style.display = 'none';
                  dialog.style.visibility = 'hidden';
                  dialog.style.opacity = '0';
                  
                  removed = true;
                  console.log(`Modified dialog with ID: ${dialog.getAttribute('data-model-id') || 'unknown'}`);
                } catch (e) {
                  console.log(`Error modifying dialog: ${e.message}`);
                }
              }
              
              return removed;
            };
            
            const dialogRemoved = attemptDialogRemoval();
            console.log(`Dialog removal attempt result: ${dialogRemoved}`);
          } catch (e) {
            console.log(`Error in DOM API modification: ${e.message}`);
          }
          
          // METHOD 6: Keyboard events
          try {
            debugInfo.attempts++;
            debugInfo.methods.push("keyboard_events");
            
            // Try Escape key to close dialog
            document.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true
            }));
            
            document.dispatchEvent(new KeyboardEvent('keyup', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true
            }));
            
            console.log("Dispatched Escape key events");
          } catch (e) {
            console.log(`Error in keyboard events: ${e.message}`);
          }
          
          return debugInfo;
        });
        
        // Wait after all X button click attempts
        console.log("Waiting after X button click attempts...");
        await sleep(5000); 
        
        // ------------------------------------------------------------
        // PART 4: Next button click
        // ------------------------------------------------------------
        
        console.log('Looking for orange next button...');
        
        await scormFrame.evaluate(() => {
          // Function to dispatch a complete set of mouse events
          const dispatchCompleteClickEvents = (element) => {
            if (!element) return false;
            
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width/2;
            const centerY = rect.top + rect.height/2;
            
            // Create and dispatch events in the right order for a complete click
            const events = [
              new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
              new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
            ];
            
            // Dispatch all events
            for (const event of events) {
              element.dispatchEvent(event);
            }
            
            return true;
          };
          
          // Known next button IDs
          const nextButtonIds = [
            '5fQkkvFT1Hs',  // From the existing code
            '6SnZaWfxQZH',  // Common next button ID
            '6p3OI0ZXRkJ',  // Another common next button ID
            '5fJnOnqo2Mn'   // Yet another common ID
          ];
          
          // Try each known button ID
          for (const id of nextButtonIds) {
            const nextButton = document.querySelector(`[data-model-id="${id}"]`);
            if (nextButton) {
              dispatchCompleteClickEvents(nextButton);
              console.log(`Dispatched events to next button with ID: ${id}`);
              return true;
            }
          }
          
          // Try by orange elements in bottom right
          const orangeElements = document.querySelectorAll('path[fill="#FF9800"], path[stroke="#FF9800"]');
          for (const el of orangeElements) {
            const parent = el.closest('[data-model-id]');
            if (parent) {
              const rect = parent.getBoundingClientRect();
              // Only consider elements in bottom right quadrant
              if (rect.right > window.innerWidth * 0.5 && rect.bottom > window.innerHeight * 0.5) {
                dispatchCompleteClickEvents(parent);
                console.log('Dispatched events to orange element in bottom right');
                return true;
              }
            }
          }
          
          // Try bottom right corner
          const rightEdge = window.innerWidth - 50;
          const bottomEdge = window.innerHeight - 50;
          const cornerElement = document.elementFromPoint(rightEdge, bottomEdge);
          if (cornerElement) {
            dispatchCompleteClickEvents(cornerElement);
            console.log('Dispatched events to element at bottom right corner');
            return true;
          }
          
          return false;
        });

        // Wait for transition to next screen
        console.log("Waiting for transition to next screen...");
        await sleep(5000);
        
        console.log('Slider interaction completed');
        return true;
      } catch (error) {
        console.error('Error in slider interaction:', error.message);
        return false;
      }
    },
    
    // Standalone implementation for multiple choice questions
    // This does NOT rely on any functions from pageInteractions.js
    handleMultipleChoiceQuestions: async function(scormFrame, params = {}) {
      try {
        console.log('Starting enhanced multiple choice questions handler...');
        
        // Default params
        const initialDelay = params.initialDelay || 2000;
        const waitAfterSelection = params.waitAfterSelection || 1000;
        const waitAfterSubmit = params.waitAfterSubmit || 3000;
        const waitAfterDialog = params.waitAfterDialog || 2000;
        
        // Wait for initial delay to ensure page is fully loaded
        await sleep(initialDelay);
        
        // Define the correct answers based on the images provided
        // These are the data-model-ids for the correct symptom options
        const correctOptions = [
          '6osym6aQqAX', // "... Brennen beim Wasserlassen" (burning when urinating)
          '5uFfdjBTnb6'  // "... häufiger Harndrang" (frequent urge to urinate)
        ];
        
        // Click each correct option
        for (const optionId of correctOptions) {
          try {
            console.log(`Selecting option with data-model-id="${optionId}"`);
            
            // Instead of using .click(), we'll use event dispatching
            // to avoid the "click is not a function" error
            const optionSelected = await scormFrame.evaluate((id) => {
              // Function to dispatch a complete set of mouse events
              const dispatchCompleteClickEvents = (element) => {
                if (!element) return false;
                
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Create and dispatch events in the right order for a complete click
                const events = [
                  new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
                ];
                
                // Dispatch all events
                for (const event of events) {
                  element.dispatchEvent(event);
                }
                
                return true;
              };
              
              // First try by specific ID
              const option = document.querySelector(`[data-model-id="${id}"]`);
              if (option) {
                const result = dispatchCompleteClickEvents(option);
                console.log(`Dispatched events to option with ID: ${id}`);
                
                // Also try eventable elements inside
                const eventables = option.querySelectorAll('.eventable, [data-accepts="events"]');
                for (const eventable of eventables) {
                  dispatchCompleteClickEvents(eventable);
                }
                
                return result;
              }
              
              return false;
            }, optionId);
            
            if (optionSelected) {
              console.log(`Successfully selected option with ID: ${optionId}`);
            } else {
              console.log(`Failed to select option with ID: ${optionId}`);
            }
            
            // Brief pause between selections
            await sleep(waitAfterSelection);
            
          } catch (error) {
            console.error(`Error selecting option with data-model-id="${optionId}":`, error.message);
          }
        }
        
        // Click the "Absenden" (Submit) button - using multiple techniques
        // This is highly targeted based on the HTML structure you provided
        console.log('Clicking Absenden button with multiple methods...');
        
        try {
          const absendenClicked = await scormFrame.evaluate(() => {
            // Track our attempts for debugging
            const clickResults = {
              attempts: 0,
              methods: [],
              successes: 0
            };
            
            // Function to dispatch a complete set of mouse events
            const dispatchCompleteClickEvents = (element) => {
              if (!element) return false;
              
              try {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Create and dispatch events in the right order for a complete click
                const events = [
                  new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
                ];
                
                // Dispatch all events
                for (const event of events) {
                  element.dispatchEvent(event);
                }
                
                return true;
              } catch (e) {
                console.log(`Error dispatching events: ${e.message}`);
                return false;
              }
            };
            
            // METHOD 1: Direct targeting of the element by data-model-id
            clickResults.attempts++;
            clickResults.methods.push("direct_id_targeting");
            
            const absendenButton = document.querySelector('[data-model-id="5ppizEiswFw"]');
            if (absendenButton) {
              console.log('Found Absenden button by ID');
              
              // Click the main container
              if (dispatchCompleteClickEvents(absendenButton)) {
                clickResults.successes++;
              }
              
              // Also click each part of the SVG structure
              const svgElement = absendenButton.querySelector('svg');
              if (svgElement && dispatchCompleteClickEvents(svgElement)) {
                clickResults.successes++;
              }
              
              // Also click the path element
              const pathElement = absendenButton.querySelector('path');
              if (pathElement && dispatchCompleteClickEvents(pathElement)) {
                clickResults.successes++;
              }
              
              // Click eventable elements - these are crucial for event handling
              const eventables = absendenButton.querySelectorAll('.eventable, [data-accepts="events"]');
              for (const eventable of eventables) {
                if (dispatchCompleteClickEvents(eventable)) {
                  clickResults.successes++;
                }
              }
              
              // Click specifically the path with fill="#007F95" (blue button)
              const bluePath = absendenButton.querySelector('path[fill="#007F95"]');
              if (bluePath && dispatchCompleteClickEvents(bluePath)) {
                clickResults.successes++;
              }
            }
            
            // METHOD 2: Find by text content ("Absenden")
            clickResults.attempts++;
            clickResults.methods.push("text_content_targeting");
            
            const elementsByText = document.querySelectorAll('[data-acc-text="Absenden"]');
            if (elementsByText.length > 0) {
              console.log(`Found ${elementsByText.length} elements with 'Absenden' text`);
              
              for (const el of elementsByText) {
                if (dispatchCompleteClickEvents(el)) {
                  clickResults.successes++;
                }
                
                // Also try SVG and path children
                const svg = el.querySelector('svg');
                if (svg && dispatchCompleteClickEvents(svg)) {
                  clickResults.successes++;
                }
                
                const paths = el.querySelectorAll('path');
                for (const path of paths) {
                  if (dispatchCompleteClickEvents(path)) {
                    clickResults.successes++;
                  }
                }
              }
            }
            
            // METHOD 3: Find blue buttons (they often have fill="#007F95")
            clickResults.attempts++;
            clickResults.methods.push("color_targeting");
            
            const blueElements = document.querySelectorAll('path[fill="#007F95"]');
            if (blueElements.length > 0) {
              console.log(`Found ${blueElements.length} blue elements`);
              
              for (const el of blueElements) {
                // Get the container with data-model-id
                const container = el.closest('[data-model-id]');
                if (container && dispatchCompleteClickEvents(container)) {
                  clickResults.successes++;
                }
                
                // Also click the blue element itself
                if (dispatchCompleteClickEvents(el)) {
                  clickResults.successes++;
                }
              }
            }
            
            // METHOD 4: Find elements at bottom center (where Absenden button usually is)
            clickResults.attempts++;
            clickResults.methods.push("position_targeting");
            
            const centerX = window.innerWidth / 2;
            const bottomY = window.innerHeight - 100;
            
            // Try a grid of positions in the bottom center area
            for (let x = centerX - 100; x <= centerX + 100; x += 50) {
              for (let y = bottomY - 50; y <= bottomY + 50; y += 25) {
                const elementAtPoint = document.elementFromPoint(x, y);
                if (elementAtPoint) {
                  // Find closest clickable container
                  const clickTarget = elementAtPoint.closest('[data-model-id]') || 
                                    elementAtPoint.closest('svg') || 
                                    elementAtPoint;
                  
                  if (dispatchCompleteClickEvents(clickTarget)) {
                    clickResults.successes++;
                    console.log(`Clicked element at position (${x}, ${y})`);
                  }
                }
              }
            }
            
            // METHOD 5: Based on exact coords from your HTML
            // The transform indicates position at matrix(1, 0, 0, 1, 67.537, 394.609)
            clickResults.attempts++;
            clickResults.methods.push("transform_position_targeting");
            
            const exactX = 67.537 + (145.687 / 2); // X position + half width
            const exactY = 394.609 + (40.0398 / 2); // Y position + half height
            
            const elementAtExactPos = document.elementFromPoint(exactX, exactY);
            if (elementAtExactPos) {
              const clickTarget = elementAtExactPos.closest('[data-model-id]') || elementAtExactPos;
              if (dispatchCompleteClickEvents(clickTarget)) {
                clickResults.successes++;
                console.log(`Clicked element at exact transform position (${exactX}, ${exactY})`);
              }
            }
            
            return clickResults;
          });
          
          console.log('Absenden button click results:', absendenClicked);
          
        } catch (error) {
          console.error('Error clicking Absenden button:', error.message);
        }
        
        // Wait for the result dialog to appear
        console.log(`Waiting ${waitAfterSubmit}ms for dialog to appear...`);
        await sleep(waitAfterSubmit);
        
        // Handle the results dialog (the "Sehr gut!" dialog)
        try {
          console.log('Looking for close button on results dialog...');
          
          // Use the same approach that worked for the X button
          const dialogHandled = await scormFrame.evaluate(() => {
            const results = {
              attempts: 0,
              methods: [],
              successes: 0
            };
            
            // Function to dispatch a complete set of mouse events
            const dispatchCompleteClickEvents = (element) => {
              if (!element) return false;
              
              try {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Create and dispatch events in the right order for a complete click
                const events = [
                  new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
                ];
                
                // Dispatch all events
                for (const event of events) {
                  element.dispatchEvent(event);
                }
                
                return true;
              } catch (e) {
                console.log(`Error dispatching events: ${e.message}`);
                return false;
              }
            };
            
            // METHOD 1: Direct ID targeting of dialog close button
            results.attempts++;
            results.methods.push("direct_id_targeting");
            
            // Common IDs for dialog close buttons
            const closeButtonIds = ['6bRLqwSpo6m', '6aNlE2Xany4', '5nUZEiVuJdn'];
            
            for (const id of closeButtonIds) {
              const closeBtn = document.querySelector(`[data-model-id="${id}"]`);
              if (closeBtn) {
                console.log(`Found close button with ID: ${id}`);
                
                // Click the main container
                if (dispatchCompleteClickEvents(closeBtn)) {
                  results.successes++;
                }
                
                // Also click the inner elements
                closeBtn.querySelectorAll('svg, path, g').forEach(el => {
                  if (dispatchCompleteClickEvents(el)) {
                    results.successes++;
                  }
                });
                
                // Also click all eventable elements
                closeBtn.querySelectorAll('.eventable, [data-accepts="events"]').forEach(el => {
                  if (dispatchCompleteClickEvents(el)) {
                    results.successes++;
                  }
                });
              }
            }
            
            // METHOD 2: Find orange circle elements (typical dialog close buttons)
            results.attempts++;
            results.methods.push("orange_element_targeting");
            
            const orangeElements = document.querySelectorAll('path[fill="#FF9800"], path[stroke="#FF9800"]');
            for (const el of orangeElements) {
              const container = el.closest('[data-model-id]');
              if (container) {
                if (dispatchCompleteClickEvents(container)) {
                  results.successes++;
                }
                
                if (dispatchCompleteClickEvents(el)) {
                  results.successes++;
                }
              }
            }
            
            // METHOD 3: Look for white X symbol (typical in close buttons)
            results.attempts++;
            results.methods.push("x_symbol_targeting");
            
            const whiteElements = document.querySelectorAll('path[fill="#FFFFFF"]');
            for (const el of whiteElements) {
              const container = el.closest('[data-model-id]');
              if (container) {
                if (dispatchCompleteClickEvents(container)) {
                  results.successes++;
                }
                
                if (dispatchCompleteClickEvents(el)) {
                  results.successes++;
                }
              }
            }
            
            // METHOD 4: Position-based targeting (dialog close buttons are often top-right)
            results.attempts++;
            results.methods.push("position_targeting");
            
            // Try clicking in the top-right area where dialog close buttons typically are
            const dialogElements = document.querySelectorAll('.dialog, .popup, [role="dialog"], [data-acc-text*="dialog"]');
            let dialogFound = false;
            
            for (const dialog of dialogElements) {
              if (window.getComputedStyle(dialog).display !== 'none') {
                dialogFound = true;
                
                // Calculate top-right corner of the dialog
                const rect = dialog.getBoundingClientRect();
                const topRightX = rect.right - 20; // 20px from right edge
                const topRightY = rect.top + 20; // 20px from top edge
                
                const closeElement = document.elementFromPoint(topRightX, topRightY);
                if (closeElement) {
                  const clickTarget = closeElement.closest('[data-model-id]') || closeElement;
                  if (dispatchCompleteClickEvents(clickTarget)) {
                    results.successes++;
                    console.log('Clicked element at dialog top-right corner');
                  }
                }
              }
            }
            
            // If no dialog found, use a general approach
            if (!dialogFound) {
              // Try top-right corner of the viewport
              const viewportTopRight = document.elementFromPoint(window.innerWidth - 20, 20);
              if (viewportTopRight) {
                const clickTarget = viewportTopRight.closest('[data-model-id]') || viewportTopRight;
                if (dispatchCompleteClickEvents(clickTarget)) {
                  results.successes++;
                  console.log('Clicked element at viewport top-right corner');
                }
              }
            }
            
            // METHOD 5: Escape key fallback
            results.attempts++;
            results.methods.push("keyboard_fallback");
            
            document.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true
            }));
            
            document.dispatchEvent(new KeyboardEvent('keyup', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true
            }));
            
            console.log('Dispatched Escape key events');
            
            return results;
          });
          
          console.log('Dialog handling results:', dialogHandled);
          
        } catch (error) {
          console.error('Error handling results dialog:', error.message);
        }
        
        // Wait after dialog handling
        await sleep(waitAfterDialog);
        
        // Click the orange next button
        console.log('Looking for orange next button...');
        
        try {
          await scormFrame.evaluate(() => {
            // Function to dispatch a complete set of mouse events
            const dispatchCompleteClickEvents = (element) => {
              if (!element) return false;
              
              const rect = element.getBoundingClientRect();
              const centerX = rect.left + rect.width/2;
              const centerY = rect.top + rect.height/2;
              
              // Create and dispatch events in the right order for a complete click
              const events = [
                new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
              ];
              
              // Dispatch all events
              for (const event of events) {
                element.dispatchEvent(event);
              }
              
              return true;
            };
            
            // Known next button IDs
            const nextButtonIds = [
              '5fQkkvFT1Hs',  // From the existing code
              '6SnZaWfxQZH',  // Common next button ID
              '6p3OI0ZXRkJ',  // Another common next button ID
              '5fJnOnqo2Mn'   // Yet another common ID
            ];
            
            // Try each known button ID
            for (const id of nextButtonIds) {
              const nextButton = document.querySelector(`[data-model-id="${id}"]`);
              if (nextButton) {
                dispatchCompleteClickEvents(nextButton);
                console.log(`Dispatched events to next button with ID: ${id}`);
                
                // Also click children that might be event targets
                nextButton.querySelectorAll('.eventable, [data-accepts="events"], svg, path').forEach(el => {
                  dispatchCompleteClickEvents(el);
                });
                
                return true;
              }
            }
            
            // Try by orange elements in bottom right
            const orangeElements = document.querySelectorAll('path[fill="#FF9800"], path[stroke="#FF9800"]');
            for (const el of orangeElements) {
              const parent = el.closest('[data-model-id]');
              if (parent) {
                const rect = parent.getBoundingClientRect();
                // Only consider elements in bottom right quadrant
                if (rect.right > window.innerWidth * 0.5 && rect.bottom > window.innerHeight * 0.5) {
                  dispatchCompleteClickEvents(parent);
                  dispatchCompleteClickEvents(el);
                  console.log('Dispatched events to orange element in bottom right');
                  return true;
                }
              }
            }
            
            // Try bottom right corner
            const rightEdge = window.innerWidth - 50;
            const bottomEdge = window.innerHeight - 50;
            const cornerElement = document.elementFromPoint(rightEdge, bottomEdge);
            if (cornerElement) {
              const clickTarget = cornerElement.closest('[data-model-id]') || cornerElement;
              dispatchCompleteClickEvents(clickTarget);
              console.log('Dispatched events to element at bottom right corner');
              return true;
            }
            
            return false;
          });
          
          console.log('Next button click completed');
          
        } catch (error) {
          console.error('Error clicking next button:', error.message);
        }
        
        // Wait for transition to next screen
        await sleep(5000);
        
        console.log('Multiple choice interaction completed');
        return true;
      } catch (error) {
        console.error('Error in multiple choice questions handler:', error.message);
        return false;
      }
    }
  }
};