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

    /* // Wait for MediBee to appear and click it
    {
      type: "MEDIBEE_APPEARS",
      action: "waitForAndClickMediBee",
      useScormFrame: true,
      waitAfter: 4000
    }, */

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
    
    // Next button after risk factors
    {
      type: "NEXT_BUTTON_STATE",
      action: "clickNextButton",
      useScormFrame: true,
      waitAfter: 5000
    },

    // Info slide (bacteria info)
    {
      type: "INFO_SLIDE",
      action: "waitForContentAndProceedToNext",
      useScormFrame: true,
      waitAfter: 20000
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
    clickAllRiskFactors: async function(scormFrame, params = {}) {
      try {
        console.log('Starting enhanced risk factors interaction...');
        
        // Wait for risk factors to load
        await sleep(params.initialDelay || 2000);
        
        // Define risk factors by text content (from screenshot)
        const riskFactorTexts = [
          "Unzureichende Flüssigkeitszufuhr",
          "Hormonelle Veränderungen, wie Schwangerschaft oder Wechseljahre",
          "Geschwächtes Immunsystem",
          "Falsche Intimhygiene",
          "Antibiotika-Einnahme",
          "Ein frisch verliebtes Paar: möglicherweise häufiger Geschlechtsverkehr"
        ];

        // Click elements containing these texts
        for (const text of riskFactorTexts) {
          await scormFrame.evaluate((searchText) => {
            // Find all elements with matching text
            const elements = Array.from(document.querySelectorAll('[data-acc-text], div'));
            const targetElement = elements.find(el => 
              (el.getAttribute('data-acc-text') || el.textContent).includes(searchText)
            );
            
            if (targetElement) {
              // Find the closest clickable parent
              const clickTarget = targetElement.closest('[data-model-id]') || targetElement;
              clickTarget.click();
              console.log(`Clicked element with text: "${searchText}"`);
            }
          }, text);
          
          await sleep(params.delayBetweenClicks || 1000);
        }

        // Handle success popup
        console.log('Closing success dialog...');
        await scormFrame.evaluate(() => {
          const closeButton = document.querySelector('[data-model-id="5nUZEiVuJdn"]');
          if (closeButton) closeButton.click();
        });
        
        await sleep(params.waitAfter || 2000);
        return true;
      } catch (error) {
        console.error('Risk factor interaction failed:', error);
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