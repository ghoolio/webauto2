// Special function for the initial start click that retries multiple times
async function handleRepeatedStartButtonClick(scormFrame, retries = 3) {
  console.log(`Beginning repeated start button click process (${retries} attempts)...`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`Start button click attempt ${attempt}/${retries}`);
    
    const result = await scormFrame.evaluate(() => {
      const results = {
        clicked: false,
        methods: []
      };
      
      try {
        // Helper function to click an element safely
        const safeClick = (element) => {
          try {
            if (typeof element.click === 'function') {
              element.click();
              return true;
            } else {
              // Use event dispatch as fallback
              const rect = element.getBoundingClientRect();
              const eventOptions = {
                bubbles: true, 
                cancelable: true,
                view: window,
                clientX: rect.left + rect.width/2,
                clientY: rect.top + rect.height/2
              };
              
              const events = [
                new MouseEvent('mousedown', eventOptions),
                new MouseEvent('mouseup', eventOptions),
                new MouseEvent('click', eventOptions)
              ];
              
              events.forEach(e => element.dispatchEvent(e));
              return true;
            }
          } catch (e) {
            return false;
          }
        };
        
        // Method 1: Play button by ID
        const knownPlayButtonIds = [
          '6mDzcHBsA6b', '6paMtR8vL6S', '6pprQ1MHcCJ', '5hVgbZXvALu', '5xKHZdvRLcj'
        ];
        
        for (const id of knownPlayButtonIds) {
          const button = document.querySelector(`[data-model-id="${id}"]`);
          if (button) {
            results.methods.push(`id:${id}`);
            if (safeClick(button)) {
              results.clicked = true;
              break;
            }
          }
        }
        
        if (results.clicked) return results;
        
        // Method 2: White triangle play symbol
        const whitePaths = document.querySelectorAll('path[fill="#FFFFFF"], path[fill="white"], path[fill="#FFF"]');
        for (const path of whitePaths) {
          const svg = path.closest('svg');
          if (svg) {
            const parent = svg.parentElement;
            if (parent) {
              results.methods.push('white_path');
              if (safeClick(parent)) {
                results.clicked = true;
                break;
              }
            }
          }
        }
        
        if (results.clicked) return results;
        
        // Method 3: All SVG elements (often used for interactive buttons)
        const svgElements = document.querySelectorAll('svg');
        for (const svg of svgElements) {
          results.methods.push('svg');
          if (safeClick(svg)) {
            results.clicked = true;
            break;
          }
        }
        
        if (results.clicked) return results;
        
        // Method 4: Any visible button
        const buttons = document.querySelectorAll('button, [role="button"]');
        for (const button of buttons) {
          if (window.getComputedStyle(button).display !== 'none') {
            results.methods.push('button');
            if (safeClick(button)) {
              results.clicked = true;
              break;
            }
          }
        }
        
        if (results.clicked) return results;
        
        // Method 5: Click in center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const centerElement = document.elementFromPoint(centerX, centerY);
        
        if (centerElement) {
          results.methods.push('center');
          if (safeClick(centerElement)) {
            results.clicked = true;
          }
        }
        
        return results;
      } catch (e) {
        return {
          clicked: false,
          error: e.message,
          methods: results.methods
        };
      }
    });
    
    console.log(`Attempt ${attempt} result:`, result);
    
    // If clicked or on last attempt, press space key as well
    await scormFrame.evaluate(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true
      }));
      document.dispatchEvent(new KeyboardEvent('keyup', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true
      }));
    });
    
    // Wait between attempts
    if (attempt < retries) {
      await sleep(5000);
      
      // Check if we need to continue with more attempts
      const needMoreAttempts = await scormFrame.evaluate(() => {
        // Look for a play button or start screen
        const hasPlayButton = document.querySelector('path[fill="#FFFFFF"], path[fill="white"], path[fill="#FFF"]') !== null;
        const isStartScreen = document.querySelectorAll('button, [role="button"], [data-model-id]').length < 15;
        
        return hasPlayButton || isStartScreen;
      });
      
      if (!needMoreAttempts) {
        console.log('Start screen appears to have advanced, no more click attempts needed');
        break;
      }
    }
  }
  
  console.log('Completed repeated start button click process');
  return true;
}// quizzes/perenterol.js
/**
 * Perenterol Quiz Definition
 * 
 * This file uses the sequence-based approach to define the Perenterol quiz
 * steps in a declarative, deterministic way. Each step specifies exactly what
 * type of interaction is needed and what action to take.
 */

// Import common utilities
const { sleep } = require('../utils/commonUtils');

// Import carousel functionality (similar to dorithricin.js)
const { forceCarouselNavigation } = require('./carouselNavigation');
const { detectCarouselSlide } = require('./carouselDetector');

/**
 * Enhanced function to detect the SCORM start screen specific to Perenterol
 * This is crucial since the current implementation fails at this step
 * @param {Object} scormFrame - Puppeteer frame
 * @returns {Promise<boolean>} - Whether this is a SCORM start screen
 */
async function isPerenterolScormStartScreen(scormFrame) {
  try {
    console.log('Running enhanced SCORM start screen detection for Perenterol...');
    
    // Multiple detection strategies for maximum reliability
    const result = await scormFrame.evaluate(() => {
      console.log('[BROWSER] Running comprehensive SCORM start screen detection');
      
      // Strategy 1: Check for common SCORM start elements by text content
      const startTexts = [
        'Klicken Sie auf den Pfeil, um das Training zu starten',
        'Starten',
        'Start',
        'Willkommen',
        'Perenterol',
        'Training starten',
        'Klicken Sie Start',
        'Los geht\'s',
        'Beginnen'
      ];
      
      const hasStartText = Array.from(document.querySelectorAll('div, p, span, h1, h2, h3'))
        .some(el => startTexts.some(text => (el.textContent || '').includes(text)));
      
      if (hasStartText) {
        console.log('[BROWSER] Found start text - confirmed SCORM start screen');
        return true;
      }
      
      // Strategy 2: Look for start/play button visual indicators
      const hasStartButton = document.querySelector('[data-acc-text*="Start"], [data-acc-text*="starten"], button.start-button, .start-button');
      if (hasStartButton) {
        console.log('[BROWSER] Found start button - confirmed SCORM start screen');
        return true;
      }
      
      // Strategy 3: Look for play/arrow/start icons
      const playIcons = Array.from(document.querySelectorAll('svg path'));
      const hasPlayIcon = playIcons.some(path => {
        // Check if it's a triangle (play) icon based on points
        const d = path.getAttribute('d') || '';
        return d.includes('M') && d.includes('L') && d.includes('Z') && // Simple triangle markers
               (path.getAttribute('fill') === '#FFFFFF' || 
               path.getAttribute('fill') === 'white' || 
               path.getAttribute('fill') === '#FFF');
      });
      
      if (hasPlayIcon) {
        console.log('[BROWSER] Found play icon - confirmed SCORM start screen');
        return true;
      }
      
      // Strategy 4: Check for typical start screen layout and elements
      // Start screens often have centered content, prominent button, and minimal other elements
      const hasTypicalStartLayout = document.querySelectorAll('div, p, span, h1, h2, h3').length < 20 && // Not too many elements
                                   document.querySelectorAll('button, [role="button"]').length >= 1; // Has at least one button
      
      if (hasTypicalStartLayout) {
        console.log('[BROWSER] Found typical start screen layout - likely SCORM start screen');
        return true;
      }
      
      // Strategy 5: Check for orange elements (based on Medice branding in screenshots)
      const orangeElements = document.querySelectorAll('path[fill="#FF9800"], path[stroke="#FF9800"]');
      const hasOrangeElements = orangeElements.length > 0;
      
      if (hasOrangeElements) {
        const isInStartContext = document.body.innerText.length < 500; // Start screens usually have minimal text
        if (isInStartContext) {
          console.log('[BROWSER] Found orange elements in minimal context - likely SCORM start screen');
          return true;
        }
      }

      // If all strategies fail, check if there's a very simple page with minimal content and any button at all
      const buttons = document.querySelectorAll('button, [data-model-id], [role="button"], svg circle, svg rect');
      if (buttons.length > 0 && document.body.innerText.length < 200) {
        console.log('[BROWSER] Found simple page with buttons and minimal text - likely SCORM start screen');
        return true;
      }
      
      console.log('[BROWSER] Not detected as a SCORM start screen');
      return false;
    });
    
    console.log(`SCORM start screen detection result: ${result ? 'DETECTED' : 'NOT DETECTED'}`);
    return result;
  } catch (error) {
    console.error('Error in SCORM start screen detection:', error.message);
    // Fallback to true in case of error to avoid skipping the step
    return true;
  }
}

/**
 * Enhanced function to handle the SCORM start button specific to Perenterol
 * @param {Object} scormFrame - Puppeteer frame
 * @param {Object} params - Function parameters
 * @returns {Promise<boolean>} - Success status
 */
async function handlePerenterolScormStartScreen(scormFrame, params = {}) {
  try {
    console.log('Starting enhanced Perenterol SCORM start screen handler...');
    
    // Increase initial delay significantly to ensure SCORM content is fully loaded
    const initialDelay = params.initialDelay || 15000; // 15 seconds to ensure everything is loaded
    const timeout = params.timeout || 30000;
    const waitAfter = params.waitAfter || 5000;
    
    // Wait for initial delay to ensure everything is loaded
    console.log(`Waiting ${initialDelay}ms for initial delay...`);
    await sleep(initialDelay);
    
    // Verify this is indeed a SCORM start screen
    const isStartScreen = await isPerenterolScormStartScreen(scormFrame);
    
    if (!isStartScreen) {
      console.log('Warning: This does not appear to be a SCORM start screen, but will attempt to proceed anyway');
    }
    
    // Multi-strategy approach to find and click the start button
    console.log('Attempting multiple strategies to find and click start button...');
    
    const result = await scormFrame.evaluate((timeout) => {
      // Updated start button click strategy
      const updatedStartButtonClickStrategy = () => {
        // Prioritize specific model ID
        const specificStartButtonId = '5wi4qVJtVCO';
        const specificButton = document.querySelector(`[data-model-id="${specificStartButtonId}"]`);
        
        if (specificButton) {
          console.log(`[BROWSER] Found specific start button with ID: ${specificStartButtonId}`);
          
          // Function to dispatch comprehensive click events
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
              
              // Try multiple ways to trigger click
              if (typeof specificButton.click === 'function') {
                specificButton.click();
              }
              
              // Attempt to trigger on the SVG child or eventable elements
              const svgChild = specificButton.querySelector('svg');
              const eventableChild = specificButton.querySelector('.eventable');
              
              if (svgChild) {
                svgChild.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
              }
              
              if (eventableChild) {
                eventableChild.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
              }
              
              return true;
            } catch (e) {
              console.log(`[BROWSER] Error dispatching events: ${e.message}`);
              return false;
            }
          };
          
          // Attempt to click with comprehensive strategy
          const clickResult = dispatchCompleteClickEvents(specificButton);
          
          if (clickResult) {
            console.log(`[BROWSER] Successfully clicked start button with ID: ${specificStartButtonId}`);
            return { clicked: true, methods: [`id:${specificStartButtonId}`] };
          }
        }
        
        // Fallback to existing strategies if specific ID fails
        return null;
      };

      // First try the updated specific strategy
      const specificResult = updatedStartButtonClickStrategy();
      if (specificResult) {
        return specificResult;
      }
      
      // Original multi-strategy approach as fallback
      const results = {
        clicked: false,
        methods: []
      };
      
      try {
        // Helper function to click an element safely
        const safeClick = (element) => {
          try {
            if (typeof element.click === 'function') {
              element.click();
              return true;
            } else {
              // Use event dispatch as fallback
              const rect = element.getBoundingClientRect();
              const eventOptions = {
                bubbles: true, 
                cancelable: true,
                view: window,
                clientX: rect.left + rect.width/2,
                clientY: rect.top + rect.height/2
              };
              
              const events = [
                new MouseEvent('mousedown', eventOptions),
                new MouseEvent('mouseup', eventOptions),
                new MouseEvent('click', eventOptions)
              ];
              
              events.forEach(e => element.dispatchEvent(e));
              return true;
            }
          } catch (e) {
            return false;
          }
        };
        
        // Method 1: Play button by ID
        const knownPlayButtonIds = [
          '6mDzcHBsA6b', '6paMtR8vL6S', '6pprQ1MHcCJ', '5hVgbZXvALu', '5xKHZdvRLcj'
        ];
        
        for (const id of knownPlayButtonIds) {
          const button = document.querySelector(`[data-model-id="${id}"]`);
          if (button) {
            results.methods.push(`id:${id}`);
            if (safeClick(button)) {
              results.clicked = true;
              break;
            }
          }
        }
        
        if (results.clicked) return results;
        
        // Method 2: White triangle play symbol
        const whitePaths = document.querySelectorAll('path[fill="#FFFFFF"], path[fill="white"], path[fill="#FFF"]');
        for (const path of whitePaths) {
          const svg = path.closest('svg');
          if (svg) {
            const parent = svg.parentElement;
            if (parent) {
              results.methods.push('white_path');
              if (safeClick(parent)) {
                results.clicked = true;
                break;
              }
            }
          }
        }
        
        if (results.clicked) return results;
        
        // Method 3: All SVG elements (often used for interactive buttons)
        const svgElements = document.querySelectorAll('svg');
        for (const svg of svgElements) {
          results.methods.push('svg');
          if (safeClick(svg)) {
            results.clicked = true;
            break;
          }
        }
        
        if (results.clicked) return results;
        
        // Method 4: Any visible button
        const buttons = document.querySelectorAll('button, [role="button"]');
        for (const button of buttons) {
          if (window.getComputedStyle(button).display !== 'none') {
            results.methods.push('button');
            if (safeClick(button)) {
              results.clicked = true;
              break;
            }
          }
        }
        
        if (results.clicked) return results;
        
        // Method 5: Click in center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const centerElement = document.elementFromPoint(centerX, centerY);
        
        if (centerElement) {
          results.methods.push('center');
          if (safeClick(centerElement)) {
            results.clicked = true;
          }
        }
        
        return results;
      } catch (e) {
        return {
          clicked: false,
          error: e.message,
          methods: results.methods
        };
      }
    }, timeout);
    
    console.log('Start button click result:', result);
    
    if (!result.clicked) {
      console.log('WARNING: Failed to click start button with any strategy');
    }
    
    // If clicked or on last attempt, press space key as well
    await scormFrame.evaluate(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true
      }));
      document.dispatchEvent(new KeyboardEvent('keyup', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true
      }));
    });
    
    // Wait after clicking to allow time for transition
    console.log(`Waiting ${waitAfter}ms after clicking start button...`);
    await sleep(waitAfter);
    
    // Use our specialized repeated start button click function to ensure we click the start button properly
    console.log('Starting specialized repeated start button click process...');
    await handleRepeatedStartButtonClick(scormFrame, 3);
    
    // Wait after to ensure transition completes
    await sleep(5000);
    
    return true;
  } catch (error) {
    console.error('Error in SCORM start screen handler:', error.message);
    return false;
  }
}

/**
 * Handles multiple choice questions specific to Perenterol quiz
 * @param {Object} scormFrame - Puppeteer frame
 * @param {Object} params - Function parameters
 * @returns {Promise<boolean>} - Success status
 */
async function handlePerenterolMultipleChoice(scormFrame, params = {}) {
  try {
    console.log('Starting Perenterol multiple choice handler...');
    
    // Default parameters
    const initialDelay = params.initialDelay || 2000;
    const waitAfterSelection = params.waitAfterSelection || 1000;
    const waitAfterSubmit = params.waitAfterSubmit || 3000;
    
    // Wait for initial delay to ensure page is fully loaded
    await sleep(initialDelay);
    
    // Find and select the correct options - we'll need to update these IDs based on actual quiz
    const correctOptions = params.correctOptions || [
      // These IDs are placeholders and will need to be updated
      '6osym6aQqAX',
      '5uFfdjBTnb6'
    ];
    
    // Click each correct option
    for (const optionId of correctOptions) {
      try {
        console.log(`Selecting option with data-model-id="${optionId}"`);
        
        // Use evaluate for robust selection with event dispatching
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
    
    // Click the Submit button (often labeled "Absenden")
    console.log('Clicking submit button...');
    
    const submitClicked = await scormFrame.evaluate(() => {
      // Try multiple selectors for the submit button
      const selectors = [
        // Placeholder selectors - we'll need to update these based on actual quiz
        '[data-model-id="5ppizEiswFw"]',
        'div[data-acc-text="Absenden"]',
        'div[data-acc-text="Submit"]',
        'div[data-acc-text="Prüfen"]'
      ];
      
      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
          // Function to dispatch a complete set of mouse events
          const dispatchCompleteClickEvents = (element) => {
            try {
              const rect = element.getBoundingClientRect();
              const centerX = rect.left + rect.width/2;
              const centerY = rect.top + rect.height/2;
              
              const events = [
                new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY}),
                new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: centerX, clientY: centerY})
              ];
              
              for (const event of events) {
                element.dispatchEvent(event);
              }
              
              return true;
            } catch (e) {
              console.log(`[BROWSER] Error dispatching events: ${e.message}`);
              return false;
            }
          };
          
          if (dispatchCompleteClickEvents(button)) {
            console.log(`[BROWSER] Clicked submit button with selector: ${selector}`);
            return true;
          }
        }
      }
      
      // Fallback: try clicking any button in the bottom center area
      try {
        const centerX = window.innerWidth / 2;
        const bottomY = window.innerHeight - 100;
        const element = document.elementFromPoint(centerX, bottomY);
        if (element) {
          const clickTarget = element.closest('[data-model-id]') || element;
          clickTarget.click();
          console.log('[BROWSER] Clicked element at bottom center as fallback');
          return true;
        }
      } catch (e) {
        console.log(`[BROWSER] Error in fallback click: ${e.message}`);
      }
      
      return false;
    });
    
    if (submitClicked) {
      console.log('Successfully clicked submit button');
    } else {
      console.log('Failed to find and click submit button');
    }
    
    // Wait for feedback dialog
    await sleep(waitAfterSubmit);
    
    // Handle close button on feedback dialog
    console.log('Looking for close button on feedback dialog...');
    
    const closeClicked = await scormFrame.evaluate(() => {
      // Try known close button IDs
      const closeButtonIds = ['6bRLqwSpo6m', '6aNlE2Xany4', '5nUZEiVuJdn'];
      
      for (const id of closeButtonIds) {
        const closeBtn = document.querySelector(`[data-model-id="${id}"]`);
        if (closeBtn) {
          try {
            closeBtn.click();
            console.log(`[BROWSER] Clicked close button with ID: ${id}`);
            return true;
          } catch (e) {
            console.log(`[BROWSER] Error clicking close button ${id}: ${e.message}`);
          }
        }
      }
      
      // Fallback: Look for orange X buttons
      const orangeElements = document.querySelectorAll('path[fill="#FF9800"], path[stroke="#FF9800"]');
      for (const element of orangeElements) {
        try {
          const parent = element.closest('[data-model-id]');
          if (parent) {
            parent.click();
            console.log('[BROWSER] Clicked orange element (likely close button)');
            return true;
          }
        } catch (e) {
          console.log(`[BROWSER] Error clicking orange element: ${e.message}`);
        }
      }
      
      return false;
    });
    
    if (closeClicked) {
      console.log('Successfully closed feedback dialog');
    } else {
      console.log('No feedback dialog found or failed to close it');
    }
    
    // Click next button to continue
    console.log('Clicking next button...');
    
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
      const nextButtonIds = ['5fQkkvFT1Hs', '5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'];
      
      // Try each known button ID
      for (const id of nextButtonIds) {
        const nextButton = document.querySelector(`[data-model-id="${id}"]`);
        if (nextButton) {
          dispatchCompleteClickEvents(nextButton);
          console.log(`[BROWSER] Dispatched events to next button with ID: ${id}`);
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
            console.log('[BROWSER] Dispatched events to orange element in bottom right');
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
        console.log('[BROWSER] Dispatched events to element at bottom right corner');
        return true;
      }
      
      return false;
    });
    
    // Wait for transition to next slide
    await sleep(5000);
    
    return true;
  } catch (error) {
    console.error('Error in multiple choice handler:', error.message);
    return false;
  }
}

/**
 * Specialized function to handle carousel slides for Perenterol
 * @param {Object} scormFrame - Puppeteer frame
 * @param {Object} params - Parameters for carousel handling
 * @returns {Promise<boolean>} - Success status
 */
async function handlePerenterolCarousel(scormFrame, params = {}) {
  console.log('Starting Perenterol carousel handler...');
  
  // First, verify this is indeed a carousel slide
  // We'll use both the isCarouselSlide from carouselDetector and our own checks
  const isCarousel = await detectCarouselSlide(scormFrame);
  
  if (!isCarousel) {
    console.log('Warning: handlePerenterolCarousel called on a slide that may not be a carousel.');
    
    // Second check with a more permissive approach specific to Perenterol
    const secondCheck = await scormFrame.evaluate(() => {
      // Quick check for common carousel elements
      const hasCircles = document.querySelectorAll('svg circle').length > 0;
      const hasOrangeElements = document.querySelectorAll('path[fill="#FF9800"], path[stroke="#FF9800"]').length > 0;
      const hasMediBee = document.body.innerText.includes('MediBee');
      
      return hasCircles || (hasOrangeElements && hasMediBee);
    });
    
    if (!secondCheck) {
      console.log('Still not detected as carousel. Will try generic next button as fallback.');
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
  
  // Use the importend carousel navigation function
  console.log('Using specialized carousel navigation function');
  const maxClicks = params.maxClicks || 2;
  return await forceCarouselNavigation(scormFrame, maxClicks);
}

/**
 * Special handler for Perenterol's dialog screen transition
 * @param {Object} page - Puppeteer page
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} - Result with success flag and frame
 */
async function handlePerenterolDialogTransition(page, params = {}) {
  console.log('=== SPECIAL PERENTEROL DIALOG HANDLER ACTIVATED ===');
  console.log('Attempting aggressive dialog handling with multiple strategies...');
  
  try {
    // Wait longer for any animations/transitions
    await sleep(params.initialDelay || 5000);
    
    // 1. Check if we're already on a page with frames
    let frames = await page.frames();
    let scormFrame = frames.find(f => f.url().includes('/index_lms.html'));
    
    if (scormFrame) {
      console.log('SCORM frame already found - no dialog handling needed');
      page.__scormFrame = scormFrame;
      return { success: true, scormFrame };
    }
    
    // 2. Get detailed page info for debugging
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        isBlackScreen: document.body.innerHTML.trim() === '',
        bodyClasses: document.body.className,
        bodyStyles: window.getComputedStyle(document.body).backgroundColor,
        hasIframes: document.querySelectorAll('iframe').length > 0
      };
    }).catch(() => ({
      url: 'error evaluating page',
      error: true
    }));
    
    console.log('Current page diagnostics:', pageInfo);
    
    // 3. Try multiple space key presses with verification in between
    const maxSpaceAttempts = params.maxSpaceAttempts || 10;
    console.log(`Attempting up to ${maxSpaceAttempts} space key presses...`);
    
    for (let attempt = 1; attempt <= maxSpaceAttempts; attempt++) {
      console.log(`Space key attempt ${attempt}/${maxSpaceAttempts}...`);
      
      // Press space key
      await page.keyboard.press('Space');
      console.log('Pressed Space key');
      
      // Wait longer than usual
      await sleep(3000);
      
      // Check if frame appeared after this attempt
      frames = await page.frames();
      scormFrame = frames.find(f => f.url().includes('/index_lms.html') || f.url().includes('scorm'));
      
      if (scormFrame) {
        console.log(`SUCCESS! Space key press ${attempt} created SCORM frame`);
        page.__scormFrame = scormFrame;
        return { success: true, scormFrame };
      }
      
      // Check if page changed
      const newUrl = await page.url().catch(() => 'error');
      if (newUrl !== pageInfo.url && newUrl !== 'error') {
        console.log(`Page URL changed to: ${newUrl} - navigation detected`);
        
        // Wait for content and check frames again
        await sleep(5000);
        frames = await page.frames();
        scormFrame = frames.find(f => f.url().includes('/index_lms.html') || f.url().includes('scorm'));
        
        if (scormFrame) {
          console.log(`Found SCORM frame after URL change`);
          page.__scormFrame = scormFrame;
          return { success: true, scormFrame };
        }
      }
      
      // Try clicking in the center of the screen as well
      try {
        await page.mouse.click(page.viewport().width / 2, page.viewport().height / 2);
        console.log(`Clicked center of screen on attempt ${attempt}`);
      } catch (e) {
        console.log(`Error clicking center: ${e.message}`);
      }
      
      // Press Enter key as well
      try {
        await page.keyboard.press('Enter');
        console.log(`Pressed Enter key on attempt ${attempt}`);
      } catch (e) {
        console.log(`Error pressing Enter: ${e.message}`);
      }
    }
    
    // 4. Check for specific SCORM patterns if space key fails
    console.log('Space key attempts exhausted. Looking for any iframes...');
    frames = await page.frames();
    
    if (frames.length > 1) {
      console.log(`Found ${frames.length} frames, examining each one...`);
      
      for (const frame of frames) {
        if (frame === page.mainFrame()) continue;
        
        const frameUrl = await frame.url();
        console.log(`Examining frame with URL: ${frameUrl}`);
        
        try {
          // Try to evaluate something in the frame to check if it's accessible
          const frameAccess = await frame.evaluate(() => document.body.innerHTML.length);
          console.log(`Frame access test: ${frameAccess} characters in body`);
          
          // If we get here, frame is accessible - try using it
          console.log('Found accessible frame, using as SCORM frame');
          page.__scormFrame = frame;
          return { success: true, scormFrame: frame };
        } catch (e) {
          console.log(`Cannot access frame content: ${e.message}`);
        }
      }
    }
    
    // If we get here, all attempts failed
    console.log('WARNING: Could not find SCORM frame with any method');
    return { success: false, scormFrame: null };
    
  } catch (error) {
    console.error('Critical error in Perenterol dialog handler:', error.message);
    return { success: false, scormFrame: null, error };
  }
}

/**
 * Simple function to click the Perenterol start button
 * @param {Object} scormFrame - Puppeteer frame
 * @returns {Promise<boolean>} - Success status
 */
async function clickPerenterolStartButton(scormFrame) {
  try {
    console.log('Attempting to click Perenterol start button...');
    
    const result = await scormFrame.evaluate(() => {
      const startButton = document.querySelector('[data-model-id="5wi4qVJtVCO"]');
      
      if (startButton) {
        try {
          // Multiple ways to trigger click
          if (typeof startButton.click === 'function') {
            startButton.click();
          }
          
          // Dispatch click event
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          startButton.dispatchEvent(clickEvent);
          
          return true;
        } catch (error) {
          console.log(`[BROWSER] Error clicking start button: ${error.message}`);
          return false;
        }
      }
      
      console.log('[BROWSER] Start button not found');
      return false;
    });
    
    if (result) {
      console.log('Successfully clicked Perenterol start button');
      
      // Wait a bit to allow for any transitions
      await sleep(5000);
      
      return true;
    } else {
      console.log('Failed to click Perenterol start button');
      return false;
    }
  } catch (error) {
    console.error('Critical error in start button click:', error.message);
    return false;
  }
}

module.exports = {
  clickPerenterolStartButton
};

// Create a customFunctions object to hook into quizRunner.js's existing extension point
const customFunctions = {
  handlePerenterolDialogTransition,
  handlePerenterolMultipleChoice,
  handlePerenterolScormStartScreen,
  isPerenterolScormStartScreen,
  handlePerenterolCarousel,
  handleRepeatedStartButtonClick
};

// Define the perenterol quiz module
module.exports = {
  name: "Perenterol",
  url: "https://academy.medice-health-family.com/paths/66d469ce89ec217f159567f5/home",
  
  // Add customFunctions to utilize the existing extension mechanism in quizRunner.js
  customFunctions,
  
  // Define the sequence of steps to complete the quiz
  sequence: [
    // Initial navigation steps
    {
      type: "START_SCREEN",
      action: "clickStartButton",
      waitAfter: 5000  // Increased wait time
    },
    {
      type: "NEXT_BUTTON",
      action: "clickNextButton",
      openNewTab: true, // Mark this step as one that opens a new tab
      waitAfter: 8000  // Increased wait time for more reliability
    },
    
    // Use our specialized dialog handler for better reliability
    {
      type: "DIALOG_SCREEN",
      action: "handlePerenterolDialogTransition", // Use our custom function
      params: {
        delay: 5000,
        maxSpaceAttempts: 5,
        initialDelay: 5000
      },
      waitAfter: 8000
    },

    // Use our enhanced SCORM start screen handler
    {
      type: "SCORM_START_SCREEN",
      action: "handlePerenterolScormStartScreen", // Use our custom function 
      useScormFrame: true,
      forceExecute: true, // Force execution even if the state is not detected properly
      params: {
        timeout: 30000,
        waitAfter: 10000, // Longer wait after to ensure transition completes
        initialDelay: 15000 // Much longer initial delay to ensure content is fully loaded
      },
      waitAfter: 10000 // Increased global wait time after this step
    },
    {
      type: "SCORM_START_SCREEN",
      action: "clickPerenterolStartButton", // Use this new, simplified function
      useScormFrame: true,
      waitAfter: 5000
    },

    // Pharmacy/Customer Scene
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

    // Handle speech bubbles/dialog
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
    
    // Generic next button (likely for informational slides)
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
    
    // Message dialog sequence (often for explanations)
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
    
    // Multiple choice question
    {
      type: "MULTIPLE_CHOICE_SLIDE",
      action: "handlePerenterolMultipleChoice",
      useScormFrame: true,
      params: {
        initialDelay: 2000,
        waitAfterSelection: 1000,
        waitAfterSubmit: 3000,
        waitAfterDialog: 2000,
        // We need to identify correct answers - these are placeholders
        correctOptions: [
          '6osym6aQqAX',
          '5uFfdjBTnb6'
        ]
      },
      waitAfter: 4000
    },
    
    // Drag-and-drop interaction
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
    
    // More generic next button slides (likely for more information)
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
    
    // Carousel slide with our enhanced handling
    {
      type: "CAROUSEL_SLIDE",
      action: "handlePerenterolCarousel", 
      useScormFrame: true,
      forceExecute: true, // Ensure it runs regardless of detection
      params: {
        maxClicks: 2,
        delayBetweenClicks: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 3000
    },
    
    // Message buttons/dialog
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
    
    // Final completion screens
    {
      type: "COMPLETION_SCREEN",
      action: "clickWeiterButton",
      useScormFrame: true,
      waitAfter: 3000
    },
    
    // Second completion screen (often present)
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