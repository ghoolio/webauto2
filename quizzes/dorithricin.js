// quizzes/dorithricin.js
/**
 * Dorithricin Quiz Definition - REBUILT VERSION
 * 
 * This file uses the sequence-based approach to define the Dorithricin quiz
 * steps in a declarative, deterministic way, following the proven patterns
 * from Perenterol and Soventol implementations.
 */

// Import common utilities
const { sleep } = require('../utils/commonUtils');

module.exports = {
  name: "Dorithricin",
  url: "https://academy.medice-health-family.com/paths/66d32acd918632655aa90a5d/home",
  
  // Define the sequence of steps to complete the quiz
  sequence: [
    // Slide 1: Initial academy start screen
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
    
    // Slide 3: Handle popup/black screen with space key (conditional)
    {
      type: "DIALOG_SCREEN",
      action: "handleDorithricinDialog",
      params: {
        delay: 2000,
        maxAttempts: 5,
        adaptiveCheck: true
      },
      waitAfter: 3000
    },
    
    // Slide 4: Click the Start button in SCORM content (CONDITIONAL)
    {
      type: "SCORM_START_SCREEN",
      action: "clickScormStartButtonConditional", 
      useScormFrame: true,
      forceExecute: true,
      params: {
        timeout: 15000,
        waitAfter: 3000,   
        buttonIds: ["6eUA3GjhbF3", "6lDgYO2arca"],
        optional: true
      },
      waitAfter: 3000
    },
    
    // Slide 5: Pharmacy scene - click orange plus button
    {
      type: "PHARMACY_SCENE",
      action: "clickDorithricinPlusButton",
      useScormFrame: true,
      forceExecute: true,
      params: {
        timeout: 15000,
        delay: 3000,
        buttonId: "5mnzOCmvQcX"
      },
      waitAfter: 5000
    },

    // Slide 6: Speech bubble slide - click speech bubbles then message button
    {
      type: "SPEECH_BUBBLE_SLIDE",
      action: "handleDorithricinSpeechBubbles",
      useScormFrame: true,
      params: {
        speechBubbleIds: ["61cy9Hbjzng", "6B44zup212K"],
        messageButtonId: "6l65RbsSaM0",
        nextButtonId: "5fQkkvFT1Hs",
        maxMessageClicks: 3,
        delayBetweenClicks: 1500,
        waitAfterBubbles: 3000,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    },

    {
      type: "SPEECH_BUBBLE_SLIDE",
      action: "handleDorithricinSpeechBubbles",
      useScormFrame: true,
      params: {
        speechBubbleIds: ["61cy9Hbjzng", "6B44zup212K"],
        messageButtonId: "6l65RbsSaM0",
        nextButtonId: "5fQkkvFT1Hs",
        maxMessageClicks: 3,
        delayBetweenClicks: 1500,
        waitAfterBubbles: 3000,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    },

    // Slide 7: Carousel navigation slide (MediBee explains)
    {
      type: "CAROUSEL_SLIDE",
      action: "handleDorithricinCarousel",
      useScormFrame: true,
      forceExecute: true,
      params: {
        carouselButtonIds: ["6d9K1sUhmhU", "5gpDrv2tka1"],
        nextButtonId: "5fQkkvFT1Hs",
        maxClicks: 2,
        delayBetweenClicks: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 8: Message button slide - click message button multiple times
    {
      type: "MESSAGE_BUTTONS_SLIDE",
      action: "handleMessageButtonSlide",
      useScormFrame: true,
      params: {
        messageButtonId: "6l65RbsSaM0",
        nextButtonId: "5fQkkvFT1Hs",
        requiredClicks: 3,
        delayBetweenClicks: 1500,
        waitAfterComplete: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 9: Generic next button state
    {
      type: "GENERIC_NEXT_BUTTON_STATE",
      action: "handleGenericNextButtonState",
      useScormFrame: true,
      params: {
        nextButtonId: "5fQkkvFT1Hs",
        initialDelay: 3000,
        maxWaitTime: 15000,
        waitAfter: 3000
      },
      waitAfter: 5000
    },
    
    // Slide 10: Percentage drag and drop slide
    {
      type: "PERCENTAGE_DRAG_DROP_SLIDE",
      action: "handleDorithricinDragDrop",
      useScormFrame: true,
      params: {
        dragDropPairs: [
          {
            sourceID: '65H2YP6zQYj',
            targetID: '5WjuStY9TX7',
            description: "50-80% to Virus"
          },
          {
            sourceID: '5kZ1pClIPrb',
            targetID: '6DcWd8zvKfc',
            description: "20-30% to Bacteria"
          }
        ],
        submitButtonId: "6DLw0UoWTnG",
        closeButtonId: "6opBZv1eVTe",
        nextButtonId: "5fQkkvFT1Hs",
        delayBetweenDrags: 2000,
        waitAfterSubmit: 3000,
        waitAfterClose: 3000
      },
      waitAfter: 3000
    },

    // Slide 11: Message slide with blue oval - second instance
    {
      type: "MESSAGE_BUTTONS_SLIDE",
      action: "handleMessageButtonSlide",
      useScormFrame: true,
      params: {
        messageButtonId: "6l65RbsSaM0",
        nextButtonId: "5fQkkvFT1Hs",
        requiredClicks: 3,
        delayBetweenClicks: 1500,
        waitAfterComplete: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 12: Memo elements slide - click memo cards (UPDATED WITH CORRECT IDs)
    {
      type: "MEMO_ELEMENTS_SLIDE",
      action: "handleDorithricinMemoElements",
      useScormFrame: true,
      params: {
        memoElementIds: [
          "6NHkEIKnqWl",  // Rectangular Hotspot 1
          "61rJiCh3r0J",  // Rectangular Hotspot 2  
          "6kDSXXaOYr5",  // Rectangular Hotspot 3
          "5i7p2qEPXc1",  // Rectangular Hotspot 4
          "6hf6heEsgee",  // Rectangular Hotspot 5
          "6PVHhZSkdxf",  // Rectangular Hotspot 6
          "6geaP82ceT9"   // Rectangular Hotspot 7
        ],
        closeButtonId: "5nUZEiVuJdn",
        nextButtonId: "5fQkkvFT1Hs",
        delayBetweenClicks: 1500,
        waitAfterClicks: 4000,
        waitAfterDialog: 2000,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    },
    
    // Slide 13: Generic next button state - second instance
    {
      type: "GENERIC_NEXT_BUTTON_STATE",
      action: "handleGenericNextButtonState",
      useScormFrame: true,
      params: {
        nextButtonId: "5fQkkvFT1Hs",
        initialDelay: 3000,
        maxWaitTime: 15000,
        waitAfter: 3000
      },
      waitAfter: 5000
    },
    
    // Slide 14: Slider interaction slide
    {
      type: "SLIDER_INTERACTION_SLIDE",
      action: "handleDorithricinSlider",
      useScormFrame: true,
      params: {
        greenSliderId: "6ab5xvhtIXy",
        yellowSliderId: "6BICHbFtmNU",
        greenFinalX: 756,
        yellowFinalX: 302,
        submitButtonId: "6M3h8ouA9G1",
        closeButtonIds: ["6j5kqHVCSqu", "6PeGCMMyBPJ", "5nUZEiVuJdn", "6lGUORpiSn6", "6opBZv1eVTe"],
        nextButtonId: "5fQkkvFT1Hs",
        waitAfterPosition: 2000,
        waitAfterSubmit: 5000,
        waitAfterClose: 2000
      },
      waitAfter: 8000
    },
    
    // Slide 15: Message buttons slide with 5 clicks
    {
      type: "MESSAGE_BUTTONS_SLIDE",
      action: "handleMessageButtonSlide",
      useScormFrame: true,
      params: {
        messageButtonId: "6l65RbsSaM0",
        nextButtonId: "5fQkkvFT1Hs",
        requiredClicks: 5,
        delayBetweenClicks: 1500,
        waitAfterComplete: 2000,
        waitAfterNext: 5000
      },
      waitAfter: 5000
    },

    // Slide 16: Risk factors slide - click all risk factors
    {
      type: "RISK_FACTORS_SLIDE",
      action: "handleDorithricinRiskFactors",
      useScormFrame: true,
      params: {
        riskFactorIds: [
          "6CgBjku5i0P",  // Couple (frequent intercourse)
          "6f83JhqEXI5",  // Reading lady
          "6U8twOQqmyr",  // Lady red nose
          "6ik9oDyZp4F",  // Old lady
          "6aelPxiqTQs",  // Lady pregnant
          "6cACM9wqz9n"   // Women on blanket
        ],
        closeButtonId: "5nUZEiVuJdn",
        delayBetweenClicks: 1000,
        waitForPopup: 2000,
        waitAfterClose: 2000
      },
      waitAfter: 2000
    },
    
    // Completion screen 1
    {
      type: "COMPLETION_SCREEN",
      action: "handleSimpleSlide", 
      useScormFrame: true,
      forceExecute: true,
      params: {
        nextButtonId: "5yna9bHVyUa",
        waitBeforeClick: 3000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Completion screen 2
    {
      type: "COMPLETION_SCREEN",
      action: "handleSimpleSlide", 
      useScormFrame: true,
      forceExecute: true,
      params: {
        nextButtonId: "6ZnzraJR921",
        waitBeforeClick: 3000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Final screen with final Training schließen button
    {
      type: "FINAL_COMPLETION",
      action: "handleFinalDorithricinCompletion",
      useScormFrame: true,
      forceExecute: true,
      params: {
        finalButtonId: "6XJxArgc22P",
        waitBeforeClick: 3000,
        completionMessage: "🎉 Dorithricin training completed successfully!"
      },
      waitAfter: 5000
    }
  ],
  
  // Custom functions specific to Dorithricin quiz
  customFunctions: {
    /**
     * Click the academy start/continue button that opens the new tab
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

    /**
     * Handle dialog screen conditionally - checks for Resume button or black screen
     * @param {Object} page - Puppeteer page object
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleDorithricinDialog: async function(page, params = {}) {
      try {
        console.log('Adaptive dialog handling for Dorithricin - checking for Resume button and black screen...');
        
        const maxAttempts = params.maxAttempts || 5;
        const delay = params.delay || 2000;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`Dialog check attempt ${attempt}/${maxAttempts}`);
          
          // Wait between checks
          await sleep(delay);
          
          // Get all frames (main page + SCORM frame)
          const frames = await page.frames();
          const scormFrame = frames.find(f => f.url().includes('/index_lms.html'));
          
          // Store SCORM frame for later use
          if (scormFrame) {
            page.__scormFrame = scormFrame;
          }
          
          // Check for Resume button in SCORM frame first
          if (scormFrame) {
            console.log('Checking for Resume button in SCORM frame...');
            
            const resumeButtonExists = await scormFrame.evaluate(() => {
              const resumeButton = document.querySelector('button[data-dv_ref="resume"]') || 
                                 document.querySelector('button[aria-label="Resume"]') ||
                                 document.querySelector('button:contains("Resume")');
              return !!resumeButton;
            }).catch(() => false);
            
            if (resumeButtonExists) {
              console.log('Resume button found in SCORM frame, clicking it...');
              
              try {
                await scormFrame.click('button[data-dv_ref="resume"]');
                console.log('Clicked Resume button successfully');
                await sleep(3000);
                return true;
              } catch (clickError) {
                console.log('Direct click failed, trying evaluate method...');
                
                const clicked = await scormFrame.evaluate(() => {
                  const resumeButton = document.querySelector('button[data-dv_ref="resume"]') || 
                                     document.querySelector('button[aria-label="Resume"]');
                  if (resumeButton) {
                    resumeButton.click();
                    console.log('[BROWSER] Clicked Resume button');
                    return true;
                  }
                  return false;
                });
                
                if (clicked) {
                  console.log('Resume button clicked via evaluate');
                  await sleep(3000);
                  return true;
                }
              }
            }
          }
          
          // Check for Resume button in main page
          console.log('Checking for Resume button in main page...');
          const mainResumeExists = await page.evaluate(() => {
            const resumeButton = document.querySelector('button[data-dv_ref="resume"]') || 
                               document.querySelector('button[aria-label="Resume"]');
            return !!resumeButton;
          }).catch(() => false);
          
          if (mainResumeExists) {
            console.log('Resume button found in main page, clicking it...');
            
            try {
              await page.click('button[data-dv_ref="resume"]');
              console.log('Clicked Resume button in main page');
              await sleep(3000);
              return true;
            } catch (clickError) {
              console.log('Main page resume click failed, trying evaluate...');
              
              const clicked = await page.evaluate(() => {
                const resumeButton = document.querySelector('button[data-dv_ref="resume"]') || 
                                   document.querySelector('button[aria-label="Resume"]');
                if (resumeButton) {
                  resumeButton.click();
                  console.log('[BROWSER] Clicked Resume button in main page');
                  return true;
                }
                return false;
              });
              
              if (clicked) {
                console.log('Main page Resume button clicked via evaluate');
                await sleep(3000);
                return true;
              }
            }
          }
          
          // Fallback: Check for traditional black screen and try space key
          const needsSpaceKey = await page.evaluate(() => {
            // Check for black screen indicators
            const isBlackScreen = document.body.innerHTML.trim() === '' || 
                                 document.body.innerHTML.trim() === '<script></script>' ||
                                 window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)';
            
            // Check if URL is about:blank
            const isAboutBlank = window.location.href === 'about:blank';
            
            // Check if we have very minimal content
            const hasMinimalContent = document.body.innerText.trim().length < 10;
            
            // Check if page seems unresponsive
            const hasNoInteractiveElements = document.querySelectorAll('button, a, [onclick], [data-model-id]').length === 0;
            
            return isBlackScreen || isAboutBlank || hasMinimalContent || hasNoInteractiveElements;
          }).catch(() => false);
          
          if (needsSpaceKey) {
            console.log(`Black screen detected on attempt ${attempt}, pressing space key as fallback...`);
            
            // Press space key
            await page.keyboard.press('Space');
            console.log('Pressed the Space key as fallback');
            await sleep(3000);
          } else {
            console.log(`No Resume button or black screen detected on attempt ${attempt}`);
          }
          
          // Check if we now have interactive content
          const hasContent = await page.evaluate(() => {
            return document.querySelectorAll('button, a, [onclick], [data-model-id]').length > 0;
          }).catch(() => true);
          
          if (hasContent) {
            console.log('Interactive content found, dialog handling complete');
            return true;
          }
        }
        
        console.log('Dialog handling completed after all attempts');
        return true;
      } catch (error) {
        console.error('Error in handleDorithricinDialog:', error.message);
        return true; // Continue even if dialog handling fails
      }
    },

    /**
     * Conditionally click SCORM start button - don't fail if it doesn't exist (resumed quiz)
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickScormStartButtonConditional: async function(scormFrame, params = {}) {
      try {
        console.log('Conditionally clicking SCORM start button (may not exist on resumed quiz)...');
        
        const buttonIds = params.buttonIds || ["6eUA3GjhbF3", "6lDgYO2arca"];
        const timeout = params.timeout || 15000;
        
        // Try each button ID
        for (const buttonId of buttonIds) {
          console.log(`Checking for SCORM start button with ID: ${buttonId}`);
          
          const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
            visible: true, 
            timeout: timeout 
          }).then(() => true).catch(() => false);
          
          if (buttonExists) {
            console.log(`SCORM start button found with ID: ${buttonId}, clicking it...`);
            await scormFrame.click(`[data-model-id="${buttonId}"]`);
            console.log('SCORM start button clicked successfully');
            await sleep(params.waitAfter || 3000);
            return true;
          }
        }
        
        console.log(`SCORM start buttons not found - quiz likely already started (resumed attempt)`);
        console.log('This is normal for resumed quiz attempts, continuing...');
        return true; // Don't fail - this is expected for resumed attempts
      } catch (error) {
        console.error('Error in clickScormStartButtonConditional:', error.message);
        console.log('Continuing anyway - button may not exist on resumed attempts');
        return true; // Don't fail the whole quiz for this
      }
    },

    /**
     * Click the orange plus button specific to Dorithricin pharmacy scene
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickDorithricinPlusButton: async function(scormFrame, params = {}) {
      try {
        console.log('Clicking Dorithricin pharmacy plus button...');
        
        const buttonId = params.buttonId || '5mnzOCmvQcX';
        const timeout = params.timeout || 15000;
        const delay = params.delay || 3000;
        
        // Wait for initial delay
        await sleep(delay);
        
        console.log(`Looking for plus button with ID: ${buttonId}`);
        
        const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
          visible: true, 
          timeout: timeout 
        }).then(() => true).catch(() => false);
        
        if (buttonExists) {
          console.log(`Plus button found with ID: ${buttonId}, clicking it...`);
          
          // Try multiple click methods for reliability
          try {
            await scormFrame.click(`[data-model-id="${buttonId}"]`);
            console.log('Clicked plus button with frame.click()');
          } catch (clickError) {
            console.log('Direct click failed, using evaluate method:', clickError.message);
            
            // Fallback to evaluate method
            await scormFrame.evaluate((id) => {
              const button = document.querySelector(`[data-model-id="${id}"]`);
              if (button) {
                // Try multiple click approaches
                if (typeof button.click === 'function') {
                  button.click();
                }
                
                // Also dispatch events
                const rect = button.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                const events = [
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, clientX: centerX, clientY: centerY}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, clientX: centerX, clientY: centerY}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, clientX: centerX, clientY: centerY})
                ];
                
                events.forEach(event => button.dispatchEvent(event));
                
                console.log(`[BROWSER] Clicked plus button with ID: ${id}`);
                return true;
              }
              return false;
            }, buttonId);
          }
          
          console.log('Plus button clicked successfully');
          await sleep(3000);
          return true;
        } else {
          console.log(`Plus button with ID ${buttonId} not found, trying fallback methods...`);
          
          // Fallback: look for orange elements
          const fallbackClicked = await scormFrame.evaluate(() => {
            // Look for orange stroke elements (typical plus button style)
            const orangeElements = document.querySelectorAll('path[stroke="#FF9800"]');
            
            if (orangeElements.length > 0) {
              // Find the parent clickable element
              for (const path of orangeElements) {
                const parent = path.closest('[data-model-id]');
                if (parent) {
                  parent.click();
                  console.log('[BROWSER] Clicked orange element as fallback plus button');
                  return true;
                }
              }
            }
            
            return false;
          });
          
          if (fallbackClicked) {
            console.log('Fallback orange element clicked');
            await sleep(3000);
            return true;
          } else {
            console.log('No plus button found with any method');
            return false;
          }
        }
      } catch (error) {
        console.error('Error clicking Dorithricin plus button:', error.message);
        return false;
      }
    },

    /**
     * Handle Dorithricin speech bubbles interaction - dynamic detection and enhanced clicking
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleDorithricinSpeechBubbles: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Dorithricin speech bubbles interaction with dynamic detection...');
        
        const messageButtonId = params.messageButtonId || "6l65RbsSaM0";
        const nextButtonId = params.nextButtonId || "5fQkkvFT1Hs";
        const maxMessageClicks = params.maxMessageClicks || 3;
        const delayBetweenClicks = params.delayBetweenClicks || 1500;
        
        // STEP 1: Dynamically find and click speech bubbles
        console.log('--- STEP 1: Finding and clicking speech bubbles ---');
        
        const speechBubbles = await scormFrame.evaluate(() => {
          // Look for speech bubble elements with orange stroke (interactive)
          const bubbles = [];
          
          // Strategy 1: Look for elements with orange stroke (#FF9800) - these are interactive
          const orangeElements = document.querySelectorAll('path[stroke="#FF9800"]');
          orangeElements.forEach(path => {
            const parent = path.closest('[data-model-id]');
            if (parent && parent.classList.contains('slide-object-vectorshape')) {
              const rect = parent.getBoundingClientRect();
              if (rect.width > 50 && rect.height > 30) { // Size filter for speech bubbles
                bubbles.push({
                  id: parent.getAttribute('data-model-id'),
                  text: parent.getAttribute('data-acc-text') || '',
                  rect: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
                });
              }
            }
          });
          
          // Strategy 2: Look for elements with speech bubble text patterns
          const textElements = document.querySelectorAll('[data-acc-text]');
          textElements.forEach(element => {
            const text = element.getAttribute('data-acc-text');
            if (text && (text.includes('?') || text.includes('Symptome') || text.includes('Beschwerden'))) {
              const id = element.getAttribute('data-model-id');
              if (id && !bubbles.some(b => b.id === id)) {
                const rect = element.getBoundingClientRect();
                if (rect.width > 50 && rect.height > 30) {
                  bubbles.push({
                    id: id,
                    text: text,
                    rect: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
                  });
                }
              }
            }
          });
          
          console.log(`[BROWSER] Found ${bubbles.length} potential speech bubbles:`, bubbles.map(b => `${b.id}: "${b.text}"`));
          return bubbles;
        });
        
        console.log(`Found ${speechBubbles.length} speech bubbles to click`);
        
        // Click each speech bubble
        for (let i = 0; i < speechBubbles.length; i++) {
          const bubble = speechBubbles[i];
          console.log(`Speech bubble ${i + 1}/${speechBubbles.length}: ${bubble.id} - "${bubble.text}"`);
          
          let clickSuccess = false;
          
          // Method 1: Try direct click on element
          try {
            await scormFrame.click(`[data-model-id="${bubble.id}"]`);
            console.log(`✅ Clicked speech bubble: ${bubble.id}`);
            clickSuccess = true;
          } catch (error) {
            console.log(`Direct click failed: ${error.message}`);
          }
          
          // Method 2: Try clicking the SVG eventable group
          if (!clickSuccess) {
            try {
              clickSuccess = await scormFrame.evaluate((bubbleId) => {
                const element = document.querySelector(`[data-model-id="${bubbleId}"]`);
                if (element) {
                  // Look for the eventable SVG group
                  const eventableGroup = element.querySelector('svg g.eventable');
                  if (eventableGroup) {
                    const rect = eventableGroup.getBoundingClientRect();
                    const x = rect.left + rect.width/2;
                    const y = rect.top + rect.height/2;
                    
                    const events = [
                      new MouseEvent('mousedown', {bubbles: true, cancelable: true, clientX: x, clientY: y}),
                      new MouseEvent('mouseup', {bubbles: true, cancelable: true, clientX: x, clientY: y}),
                      new MouseEvent('click', {bubbles: true, cancelable: true, clientX: x, clientY: y})
                    ];
                    
                    events.forEach(event => eventableGroup.dispatchEvent(event));
                    console.log(`[BROWSER] Clicked eventable group for bubble: ${bubbleId}`);
                    return true;
                  }
                  
                  // Fallback to element click
                  element.click();
                  console.log(`[BROWSER] Fallback clicked bubble: ${bubbleId}`);
                  return true;
                }
                return false;
              }, bubble.id);
              
              if (clickSuccess) {
                console.log(`✅ Clicked speech bubble via evaluate: ${bubble.id}`);
              }
            } catch (evalError) {
              console.log(`Evaluate click failed: ${evalError.message}`);
            }
          }
          
          // Method 3: Try mouse click at coordinates
          if (!clickSuccess && bubble.rect) {
            try {
              await scormFrame.mouse.click(bubble.rect.x, bubble.rect.y);
              console.log(`✅ Clicked speech bubble via coordinates: ${bubble.id}`);
              clickSuccess = true;
            } catch (mouseError) {
              console.log(`Mouse click failed: ${mouseError.message}`);
            }
          }
          
          if (!clickSuccess) {
            console.log(`❌ All click methods failed for bubble: ${bubble.id}`);
          }
          
          await sleep(1000);
        }
        
        console.log('--- STEP 2: Message button interaction ---');
        
        // STEP 2: Click message button multiple times with enhanced detection
        let messageButtonClicks = 0;
        
        for (let i = 1; i <= maxMessageClicks; i++) {
          console.log(`Message button click ${i}/${maxMessageClicks}`);
          
          // Check if message button exists and is clickable
          const messageButtonInfo = await scormFrame.evaluate((buttonId) => {
            const button = document.querySelector(`[data-model-id="${buttonId}"]`);
            if (!button) return { exists: false };
            
            const rect = button.getBoundingClientRect();
            const style = window.getComputedStyle(button);
            
            return {
              exists: true,
              visible: style.display !== 'none' && style.visibility !== 'hidden',
              rect: { x: rect.left + rect.width/2, y: rect.top + rect.height/2 },
              hasEventable: !!button.querySelector('svg g.eventable')
            };
          }, messageButtonId);
          
          if (!messageButtonInfo.exists) {
            console.log(`❌ Message button ${messageButtonId} not found`);
            break;
          }
          
          if (!messageButtonInfo.visible) {
            console.log(`❌ Message button ${messageButtonId} not visible`);
            break;
          }
          
          let clickSuccess = false;
          
          // Try multiple click methods
          try {
            await scormFrame.click(`[data-model-id="${messageButtonId}"]`);
            console.log(`✅ Message button click ${i} successful`);
            clickSuccess = true;
            messageButtonClicks++;
          } catch (error) {
            console.log(`Direct click failed: ${error.message}`);
            
            // Try evaluate method
            try {
              clickSuccess = await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  const eventableGroup = button.querySelector('svg g.eventable');
                  if (eventableGroup) {
                    eventableGroup.click();
                    console.log(`[BROWSER] Clicked message button eventable group`);
                    return true;
                  }
                  
                  button.click();
                  console.log(`[BROWSER] Clicked message button directly`);
                  return true;
                }
                return false;
              }, messageButtonId);
              
              if (clickSuccess) {
                console.log(`✅ Message button click ${i} via evaluate`);
                messageButtonClicks++;
              }
            } catch (evalError) {
              console.log(`Evaluate click failed: ${evalError.message}`);
            }
          }
          
          if (!clickSuccess) {
            console.log(`❌ All click methods failed for message button click ${i}`);
          }
          
          if (i < maxMessageClicks) {
            await sleep(delayBetweenClicks);
          }
        }
        
        console.log(`Completed ${messageButtonClicks}/${maxMessageClicks} message button clicks`);
        
        console.log('--- STEP 3: Proceeding to next slide ---');
        await sleep(3000);
        
        // STEP 3: Click next button with enhanced detection
        try {
          const nextButtonExists = await scormFrame.evaluate((buttonId) => {
            const button = document.querySelector(`[data-model-id="${buttonId}"]`);
            return button && window.getComputedStyle(button).display !== 'none';
          }, nextButtonId);
          
          if (nextButtonExists) {
            await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
            console.log(`✅ Next button clicked successfully`);
          } else {
            console.log(`❌ Next button ${nextButtonId} not found or not visible`);
            
            // Fallback: click in bottom right corner
            await scormFrame.evaluate(() => {
              const x = window.innerWidth - 50;
              const y = window.innerHeight - 50;
              const element = document.elementFromPoint(x, y);
              if (element) {
                element.click();
                console.log('[BROWSER] Clicked at bottom right corner as fallback');
              }
            });
          }
        } catch (error) {
          console.log(`❌ Error clicking next button: ${error.message}`);
        }
        
        await sleep(params.waitAfterNext || 5000);
        
        console.log('🎉 Dorithricin speech bubbles interaction completed!');
        return true;
      } catch (error) {
        console.error('Error in handleDorithricinSpeechBubbles:', error.message);
        return false;
      }
    },

    /**
     * Handle Dorithricin carousel navigation
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleDorithricinCarousel: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Dorithricin carousel navigation...');
        
        const carouselButtonIds = params.carouselButtonIds || ["6d9K1sUhmhU", "5gpDrv2tka1"];
        const nextButtonId = params.nextButtonId || "5fQkkvFT1Hs";
        const maxClicks = params.maxClicks || 2;
        const delayBetweenClicks = params.delayBetweenClicks || 2000;
        
        // Click each carousel button in sequence
        for (let i = 0; i < Math.min(carouselButtonIds.length, maxClicks); i++) {
          const buttonId = carouselButtonIds[i];
          console.log(`Clicking carousel button ${i + 1}/${maxClicks}: ${buttonId}`);
          
          try {
            await scormFrame.click(`[data-model-id="${buttonId}"]`);
            console.log(`Successfully clicked carousel button: ${buttonId}`);
            await sleep(delayBetweenClicks);
          } catch (error) {
            console.error(`Error clicking carousel button ${buttonId}:`, error.message);
          }
        }
        
        // Click the next slide button
        console.log(`Clicking next slide button: ${nextButtonId}`);
        
        try {
          await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
          console.log(`Successfully clicked next slide button: ${nextButtonId}`);
          await sleep(params.waitAfterNext || 3000);
        } catch (error) {
          console.error(`Error clicking next button ${nextButtonId}:`, error.message);
        }
        
        return true;
      } catch (error) {
        console.error('Error in handleDorithricinCarousel:', error.message);
        return false;
      }
    },

    /**
     * Handle message button slide - click message button required number of times
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleMessageButtonSlide: async function(scormFrame, params = {}) {
      try {
        console.log('Starting message button slide interaction...');
        
        const messageButtonId = params.messageButtonId || "6l65RbsSaM0";
        const nextButtonId = params.nextButtonId || "5fQkkvFT1Hs";
        const requiredClicks = params.requiredClicks || 3;
        const delayBetweenClicks = params.delayBetweenClicks || 1500;
        
        console.log(`Will click message button ${requiredClicks} times`);
        
        // Click message button the required number of times
        for (let i = 1; i <= requiredClicks; i++) {
          console.log(`Message button click ${i}/${requiredClicks}`);
          
          try {
            await scormFrame.click(`[data-model-id="${messageButtonId}"]`);
            console.log(`✅ Message button click ${i} completed`);
            
            // Wait between clicks (except after the last one)
            if (i < requiredClicks) {
              await sleep(delayBetweenClicks);
            }
          } catch (error) {
            console.log(`❌ Error with message button click ${i}: ${error.message}`);
          }
        }
        
        console.log('✅ All message button clicks completed');
        await sleep(params.waitAfterComplete || 2000);
        
        // Click next button
        console.log(`Clicking next button: ${nextButtonId}`);
        
        try {
          await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
          console.log(`✅ Successfully proceeded to next slide`);
          await sleep(params.waitAfterNext || 3000);
        } catch (error) {
          console.error(`Error clicking next button:`, error.message);
        }
        
        console.log('🎉 Message button slide interaction completed!');
        return true;
      } catch (error) {
        console.error('Error in handleMessageButtonSlide:', error.message);
        return false;
      }
    },

    /**
     * Handle percentage drag and drop interaction using PROVEN visual drag simulation
     * Based on the working Soventol implementation
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleDorithricinDragDrop: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Dorithricin percentage drag and drop with PROVEN visual movement...');
        
        const dragDropPairs = params.dragDropPairs || [
          {
            sourceID: '65H2YP6zQYj',
            targetID: '5WjuStY9TX7',
            description: "50-80% to Virus"
          },
          {
            sourceID: '5kZ1pClIPrb',
            targetID: '6DcWd8zvKfc',
            description: "20-30% to Bacteria"
          }
        ];
        
        const submitButtonId = params.submitButtonId || "6FOUO2w4nS3"; // Updated with correct ID
        const closeButtonId = params.closeButtonId || "6opBZv1eVTe";
        const nextButtonId = params.nextButtonId || "5fQkkvFT1Hs";
        
        await sleep(3000);
        
        // Get element positions and info (adapted from Soventol)
        const getElementInfo = async function(elementId) {
          return await scormFrame.evaluate((id) => {
            try {
              const element = document.querySelector(`[data-model-id="${id}"]`);
              if (!element) return null;
              
              const rect = element.getBoundingClientRect();
              const style = window.getComputedStyle(element);
              
              return {
                exists: true,
                rect: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                  left: rect.left,
                  top: rect.top,
                  right: rect.right,
                  bottom: rect.bottom
                },
                center: {
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2
                },
                style: {
                  transform: element.style.transform,
                  position: style.position,
                  left: style.left,
                  top: style.top,
                  zIndex: style.zIndex
                }
              };
            } catch (error) {
              return null;
            }
          }, elementId);
        };
        
        // PROVEN REALISTIC DRAG SIMULATION - Adapted from Soventol
        const simulateRealisticDrag = async function(sourceId, targetId, description) {
          console.log(`🎯 VISUAL DRAG - ${description}`);
          
          try {
            // Get current source and target positions dynamically
            const sourceInfo = await getElementInfo(sourceId);
            const targetInfo = await getElementInfo(targetId);
            
            if (!sourceInfo || !targetInfo) {
              console.log(`❌ Could not get element info for ${sourceId} or ${targetId}`);
              return false;
            }
            
            // Use ACTUAL element centers as coordinates
            const startX = sourceInfo.center.x;
            const startY = sourceInfo.center.y;
            const endX = targetInfo.center.x;
            const endY = targetInfo.center.y;
            
            console.log(`🔴 Source center: (${startX.toFixed(1)}, ${startY.toFixed(1)})`);
            console.log(`🎯 Target center: (${endX.toFixed(1)}, ${endY.toFixed(1)})`);
            
            // Calculate movement path
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Create movement steps (proven to work)
            const steps = Math.max(10, Math.min(25, Math.ceil(distance / 20))); // 10-25 steps
            const stepX = deltaX / steps;
            const stepY = deltaY / steps;
            
            console.log(`📏 Movement: ${distance.toFixed(1)}px in ${steps} steps`);
            console.log(`📐 Step size: (${stepX.toFixed(1)}, ${stepY.toFixed(1)}) per step`);
            
            // PROVEN REALISTIC DRAG SEQUENCE (this worked in Soventol!)
            const dragResult = await scormFrame.evaluate(async (sourceId, targetId, startX, startY, stepX, stepY, steps, endX, endY, description) => {
              try {
                console.log(`[BROWSER] Starting VISUAL realistic drag simulation for: ${description}`);
                console.log(`[BROWSER] From (${startX.toFixed(1)}, ${startY.toFixed(1)}) to (${endX.toFixed(1)}, ${endY.toFixed(1)})`);
                
                const source = document.querySelector(`[data-model-id="${sourceId}"]`);
                const target = document.querySelector(`[data-model-id="${targetId}"]`);
                
                if (!source) {
                  console.log(`[BROWSER] Source not found: ${sourceId}`);
                  return false;
                }
                
                if (!target) {
                  console.log(`[BROWSER] Target not found: ${targetId}`);
                  return false;
                }
                
                // Helper function to create and dispatch mouse events
                function createMouseEvent(type, x, y, target) {
                  const event = new MouseEvent(type, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y,
                    pageX: x,
                    pageY: y,
                    screenX: x,
                    screenY: y,
                    button: 0,
                    buttons: type === 'mousedown' || type === 'mousemove' ? 1 : 0
                  });
                  
                  if (target) {
                    target.dispatchEvent(event);
                  }
                  
                  return event;
                }
                
                // PROVEN SEQUENCE: Start drag
                console.log(`[BROWSER] STEP 1: Starting drag sequence`);
                
                // Set high z-index (proven to work)
                source.style.zIndex = '1501'; 
                
                // Get initial position for relative movement
                const sourceRect = source.getBoundingClientRect();
                const initialOffsetX = startX - (sourceRect.left + sourceRect.width/2);
                const initialOffsetY = startY - (sourceRect.top + sourceRect.height/2);
                
                // Initial mousedown on source
                createMouseEvent('mousedown', startX, startY, source);
                
                // Small delay
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // PROVEN SEQUENCE: Gradual movement
                console.log(`[BROWSER] STEP 2: Moving in ${steps} steps`);
                
                for (let i = 1; i <= steps; i++) {
                  const currentX = startX + (stepX * i);
                  const currentY = startY + (stepY * i);
                  
                  // Update source position using proven transform method
                  const sourceOffsetX = currentX - (sourceRect.width/2) + initialOffsetX;
                  const sourceOffsetY = currentY - (sourceRect.height/2) + initialOffsetY;
                  
                  source.style.transform = `matrix(1, 0, 0, 1, ${sourceOffsetX}, ${sourceOffsetY})`;
                  
                  // Force reflow (proven necessary)
                  source.offsetHeight;
                  
                  // Trigger mousemove event
                  createMouseEvent('mousemove', currentX, currentY, source);
                  
                  // Check for target collision during movement
                  const elementAtPoint = document.elementFromPoint(currentX, currentY);
                  if (elementAtPoint) {
                    const targetElement = elementAtPoint.closest(`[data-model-id="${targetId}"]`) || 
                                        (elementAtPoint.getAttribute('data-model-id') === targetId ? elementAtPoint : null);
                    
                    if (targetElement) {
                      console.log(`[BROWSER] 🎯 Source over target at step ${i}! Position: (${currentX.toFixed(1)}, ${currentY.toFixed(1)})`);
                      
                      // Trigger collision events (proven to work)
                      createMouseEvent('mouseenter', currentX, currentY, targetElement);
                      createMouseEvent('mouseover', currentX, currentY, targetElement);
                      
                      // Additional collision detection triggers
                      if (typeof targetElement.onmouseenter === 'function') {
                        targetElement.onmouseenter(createMouseEvent('mouseenter', currentX, currentY, targetElement));
                      }
                    }
                  }
                  
                  // Delay between steps (proven timing)
                  if (i < steps) {
                    await new Promise(resolve => setTimeout(resolve, 40));
                  }
                }
                
                // PROVEN SEQUENCE: Final positioning
                console.log(`[BROWSER] STEP 3: Final positioning`);
                
                // Final precise positioning
                const finalOffsetX = endX - (sourceRect.width/2) + initialOffsetX;
                const finalOffsetY = endY - (sourceRect.height/2) + initialOffsetY;
                source.style.transform = `matrix(1, 0, 0, 1, ${finalOffsetX}, ${finalOffsetY})`;
                
                // Force reflow
                source.offsetHeight;
                
                // Final collision check and events
                const finalElementAtPoint = document.elementFromPoint(endX, endY);
                if (finalElementAtPoint) {
                  const finalTargetElement = finalElementAtPoint.closest(`[data-model-id="${targetId}"]`) ||
                                            (finalElementAtPoint.getAttribute('data-model-id') === targetId ? finalElementAtPoint : null);
                  
                  if (finalTargetElement) {
                    console.log(`[BROWSER] 🎯 Final collision detected!`);
                    
                    // Comprehensive event triggering
                    createMouseEvent('mouseenter', endX, endY, finalTargetElement);
                    createMouseEvent('mouseover', endX, endY, finalTargetElement);
                    createMouseEvent('click', endX, endY, finalTargetElement);
                    
                    // Try additional event handlers
                    if (typeof finalTargetElement.onclick === 'function') {
                      finalTargetElement.onclick(createMouseEvent('click', endX, endY, finalTargetElement));
                    }
                    
                    // Also dispatch drag events for completeness
                    const dragEvents = [
                      new DragEvent('dragstart', {bubbles: true, cancelable: true, clientX: startX, clientY: startY}),
                      new DragEvent('dragover', {bubbles: true, cancelable: true, clientX: endX, clientY: endY}),
                      new DragEvent('drop', {bubbles: true, cancelable: true, clientX: endX, clientY: endY}),
                      new DragEvent('dragend', {bubbles: true, cancelable: true, clientX: endX, clientY: endY})
                    ];
                    
                    source.dispatchEvent(dragEvents[0]);
                    finalTargetElement.dispatchEvent(dragEvents[1]);
                    finalTargetElement.dispatchEvent(dragEvents[2]);
                    source.dispatchEvent(dragEvents[3]);
                  }
                }
                
                // Final mouseup
                createMouseEvent('mouseup', endX, endY, source);
                
                console.log(`[BROWSER] VISUAL drag simulation completed successfully for: ${description}`);
                return true;
                
              } catch (error) {
                console.log(`[BROWSER] VISUAL drag simulation error: ${error.message}`);
                return false;
              }
            }, sourceId, targetId, startX, startY, stepX, stepY, steps, endX, endY, description);
            
            if (!dragResult) {
              console.log(`❌ Visual drag simulation failed for: ${description}`);
              return false;
            }
            
            // CRITICAL: Wait for collision detection processing (proven timing)
            console.log(`⏳ Waiting for collision detection...`);
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            console.log(`✅ VISUAL DRAG SUCCESS! ${description}`);
            return true;
            
          } catch (error) {
            console.error(`❌ Visual drag error for ${description}: ${error.message}`);
            return false;
          }
        };
        
        // === MAIN EXECUTION ===
        console.log('\n=== STARTING VISUAL DRAG SEQUENCE ===');
        
        let successfulDrags = 0;
        
        // Execute each drag and drop operation with visual movement
        for (let i = 0; i < dragDropPairs.length; i++) {
          const { sourceID, targetID, description } = dragDropPairs[i];
          console.log(`\n--- VISUAL DRAG ${i + 1}/${dragDropPairs.length}: ${description} ---`);
          
          // Try visual realistic drag simulation
          const success = await simulateRealisticDrag(sourceID, targetID, description);
          
          if (success) {
            successfulDrags++;
            console.log(`✅ Drag ${i + 1} successful! Total: ${successfulDrags}/${dragDropPairs.length}`);
          } else {
            console.log(`❌ Drag ${i + 1} failed`);
          }
          
          // Wait between drag operations
          if (i < dragDropPairs.length - 1) {
            console.log(`⏳ Waiting before next drag...`);
            await new Promise(resolve => setTimeout(resolve, params.delayBetweenDrags || 2000));
          }
        }
        
        console.log(`\n🎯 VISUAL drag sequence completed: ${successfulDrags}/${dragDropPairs.length} successful`);
        
        // Enhanced submit button detection and clicking with SVG eventable targeting
        console.log('Looking for submit button with enhanced SVG clicking...');
        try {
          const submitResult = await scormFrame.evaluate(() => {
            // Strategy 1: Look for Absenden button with enhanced clicking
            const absendenButtons = document.querySelectorAll('[data-acc-text="Absenden"]');
            
            for (const button of absendenButtons) {
              const style = window.getComputedStyle(button);
              if (style.display !== 'none' && style.visibility !== 'hidden' && button.classList.contains('shown')) {
                console.log(`[BROWSER] Found Absenden button with ID: ${button.getAttribute('data-model-id')}`);
                
                // Enhanced clicking targeting the SVG eventable group
                const eventableGroup = button.querySelector('svg g.eventable');
                if (eventableGroup) {
                  const rect = eventableGroup.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  // Comprehensive event sequence for reliable clicking
                  const events = [
                    new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                  ];
                  
                  events.forEach(event => eventableGroup.dispatchEvent(event));
                  console.log(`[BROWSER] Enhanced SVG click on Absenden button`);
                  return { success: true, method: 'enhanced SVG click on Absenden' };
                }
                
                // Fallback to direct button click
                button.click();
                console.log(`[BROWSER] Direct click on Absenden button`);
                return { success: true, method: 'direct click on Absenden' };
              }
            }
            
            // Strategy 2: Look for specific submit button IDs
            const submitIds = ['6FOUO2w4nS3', '6DLw0UoWTnG']; // Include both IDs
            for (const submitId of submitIds) {
              const button = document.querySelector(`[data-model-id="${submitId}"]`);
              if (button && window.getComputedStyle(button).display !== 'none') {
                console.log(`[BROWSER] Found submit button with ID: ${submitId}`);
                
                const eventableGroup = button.querySelector('svg g.eventable');
                if (eventableGroup) {
                  const rect = eventableGroup.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  const events = [
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                  ];
                  
                  events.forEach(event => eventableGroup.dispatchEvent(event));
                  console.log(`[BROWSER] Enhanced SVG click on submit button ${submitId}`);
                  return { success: true, method: `enhanced SVG click on ${submitId}` };
                }
                
                button.click();
                return { success: true, method: `direct click on ${submitId}` };
              }
            }
            
            // Strategy 3: Look for orange stroke buttons (submit buttons typically have orange outline)
            const orangeButtons = document.querySelectorAll('[data-model-id]');
            for (const button of orangeButtons) {
              const orangePath = button.querySelector('svg path[stroke="#FF9800"]');
              if (orangePath && window.getComputedStyle(button).display !== 'none') {
                const text = button.getAttribute('data-acc-text') || '';
                if (text.toLowerCase().includes('absenden') || text.toLowerCase().includes('submit')) {
                  console.log(`[BROWSER] Found orange submit button: ${text}`);
                  
                  const eventableGroup = button.querySelector('svg g.eventable');
                  if (eventableGroup) {
                    eventableGroup.click();
                    return { success: true, method: 'orange button enhanced click' };
                  }
                  
                  button.click();
                  return { success: true, method: 'orange button direct click' };
                }
              }
            }
            
            return { success: false, method: 'no submit button found' };
          });
          
          if (submitResult.success) {
            console.log(`✅ Clicked submit button via: ${submitResult.method}`);
          } else {
            console.log(`❌ Could not find submit button with any method`);
          }
        } catch (error) {
          console.log(`Submit button search error: ${error.message}`);
        }
        
        await sleep(params.waitAfterSubmit || 3000);
        
        // Enhanced close button detection with SVG eventable targeting
        console.log('Looking for close dialog button with enhanced SVG clicking...');
        try {
          const closeResult = await scormFrame.evaluate(() => {
            // Strategy 1: Look for close buttons with .shown class (active dialogs)
            const shownCloseButtons = document.querySelectorAll('.slide-object-stategroup.shown [data-model-id]');
            
            for (const button of shownCloseButtons) {
              const accText = button.getAttribute('data-acc-text') || '';
              if (accText === 'X' || accText.toLowerCase().includes('close')) {
                console.log(`[BROWSER] Found shown close button with ID: ${button.getAttribute('data-model-id')}`);
                
                // Enhanced clicking targeting the SVG eventable group
                const eventableGroup = button.querySelector('svg g.eventable');
                if (eventableGroup) {
                  const rect = eventableGroup.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  const events = [
                    new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                  ];
                  
                  events.forEach(event => eventableGroup.dispatchEvent(event));
                  console.log(`[BROWSER] Enhanced SVG click on close button`);
                  return { success: true, method: 'enhanced SVG click on shown close button' };
                }
                
                button.click();
                return { success: true, method: 'direct click on shown close button' };
              }
            }
            
            // Strategy 2: Look for common close button patterns
            const closeSelectors = [
              '[data-acc-text="X"]',
              '[aria-label="Close"]',
              '[data-model-id="6opBZv1eVTe"]',
              '[data-model-id="5nUZEiVuJdn"]',
              '[data-model-id="6j5kqHVCSqu"]',
              '[data-model-id="6PeGCMMyBPJ"]',
              '[data-model-id="6lGUORpiSn6"]'
            ];
            
            for (const selector of closeSelectors) {
              const button = document.querySelector(selector);
              if (button && window.getComputedStyle(button).display !== 'none' && window.getComputedStyle(button).visibility !== 'hidden') {
                console.log(`[BROWSER] Found close button with selector: ${selector}`);
                
                const eventableGroup = button.querySelector('svg g.eventable');
                if (eventableGroup) {
                  const rect = eventableGroup.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  const events = [
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                  ];
                  
                  events.forEach(event => eventableGroup.dispatchEvent(event));
                  return { success: true, method: `enhanced SVG click with ${selector}` };
                }
                
                button.click();
                return { success: true, method: `direct click with ${selector}` };
              }
            }
            
            // Strategy 3: Look for orange circle close buttons (typical close button style)
            const orangeCloseButtons = document.querySelectorAll('[data-model-id]');
            for (const button of orangeCloseButtons) {
              const orangeCircle = button.querySelector('svg circle[fill="#FF9800"], svg circle[stroke="#FF9800"], svg path[fill="#FF9800"]');
              if (orangeCircle && window.getComputedStyle(button).display !== 'none') {
                // Check if it's likely a close button (small size, X symbol, etc.)
                const rect = button.getBoundingClientRect();
                if (rect.width < 100 && rect.height < 100) { // Typical close button size
                  console.log(`[BROWSER] Found orange close button candidate: ${button.getAttribute('data-model-id')}`);
                  
                  const eventableGroup = button.querySelector('svg g.eventable');
                  if (eventableGroup) {
                    eventableGroup.click();
                    return { success: true, method: 'orange close button enhanced click' };
                  }
                  
                  button.click();
                  return { success: true, method: 'orange close button direct click' };
                }
              }
            }
            
            // Strategy 4: Look for any visible dialogs and try to find close buttons within them
            const visibleDialogs = document.querySelectorAll('.slide-object-stategroup.shown, .dialog, .popup, .modal');
            for (const dialog of visibleDialogs) {
              const closeButtons = dialog.querySelectorAll('[data-model-id]');
              for (const button of closeButtons) {
                const accText = button.getAttribute('data-acc-text') || '';
                const rect = button.getBoundingClientRect();
                
                // Look for small buttons that might be close buttons
                if ((accText === 'X' || rect.width < 50 || rect.height < 50) && window.getComputedStyle(button).display !== 'none') {
                  console.log(`[BROWSER] Found dialog close button: ${button.getAttribute('data-model-id')}`);
                  
                  const eventableGroup = button.querySelector('svg g.eventable');
                  if (eventableGroup) {
                    eventableGroup.click();
                    return { success: true, method: 'dialog close button enhanced click' };
                  }
                  
                  button.click();
                  return { success: true, method: 'dialog close button direct click' };
                }
              }
            }
            
            return { success: false, method: 'no close button found' };
          });
          
          if (closeResult.success) {
            console.log(`✅ Clicked close button via: ${closeResult.method}`);
          } else {
            console.log(`ℹ️ No close button found (may not be needed)`);
          }
        } catch (error) {
          console.log(`Close button search error: ${error.message}`);
        }
        
        await sleep(params.waitAfterClose || 3000);
        
        // Click next button
        console.log('Looking for next button...');
        try {
          const nextButtonExists = await scormFrame.evaluate((buttonId) => {
            const button = document.querySelector(`[data-model-id="${buttonId}"]`);
            return button && window.getComputedStyle(button).display !== 'none';
          }, nextButtonId);
          
          if (nextButtonExists) {
            await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
            console.log('✅ Clicked next button');
          } else {
            console.log('Next button not found, trying fallback...');
            await scormFrame.evaluate(() => {
              const rightSide = window.innerWidth - 50;
              const bottomSide = window.innerHeight - 50;
              const element = document.elementFromPoint(rightSide, bottomSide);
              if (element) {
                element.click();
                console.log('[BROWSER] Clicked at bottom right as next button fallback');
              }
            });
          }
        } catch (error) {
          console.log(`Next button click error: ${error.message}`);
        }
        
        await sleep(params.waitAfterNext || 3000);
        
        console.log('🎉 VISUAL percentage drag and drop interaction completed!');
        
        // Success criteria
        const progressMade = successfulDrags > 0;
        const minimumSuccess = successfulDrags >= Math.min(1, Math.floor(dragDropPairs.length * 0.5));
        const overallSuccess = progressMade && minimumSuccess;
        
        console.log(`📈 Overall success: ${overallSuccess}`);
        console.log(`   - Progress made: ${progressMade} (${successfulDrags}/${dragDropPairs.length})`);
        console.log(`   - Minimum success: ${minimumSuccess}`);
        
        return overallSuccess;
      } catch (error) {
        console.error('Error in VISUAL percentage drag and drop handler:', error.message);
        return false;
      }
    },

    /**
     * Handle generic next button state - wait for orange button and click it
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleGenericNextButtonState: async function(scormFrame, params = {}) {
      try {
        console.log('Handling generic next button state...');
        
        const nextButtonId = params.nextButtonId || "5fQkkvFT1Hs";
        const initialDelay = params.initialDelay || 3000;
        const maxWaitTime = params.maxWaitTime || 15000;
        
        console.log(`⏳ Waiting ${initialDelay}ms for button to become active (orange)...`);
        await sleep(initialDelay);
        
        // Wait for the button to turn orange with a polling approach
        let nextButtonActive = false;
        const startTime = Date.now();
        
        while (!nextButtonActive && (Date.now() - startTime < maxWaitTime)) {
          // Check if the orange next button exists and is visible
          nextButtonActive = await scormFrame.evaluate((buttonId) => {
            const orangeButton = document.querySelector(`[data-model-id="${buttonId}"]`);
            if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
              return false;
            }
            
            // Check if it has the orange stroke (active state)
            const path = orangeButton.querySelector('svg path');
            if (!path) return false;
            
            const strokeColor = path.getAttribute('stroke');
            return strokeColor === '#FF9800'; // Orange stroke color
          }, nextButtonId);
          
          if (nextButtonActive) {
            console.log('Orange next button is now active');
            break;
          }
          
          console.log('Waiting for next button to become active...');
          await sleep(1000); // Check every second
        }
        
        // Click the orange next button
        console.log('Attempting to click orange next button...');
        await sleep(500); // Small delay before clicking
        
        try {
          await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
          console.log(`Clicked orange next button with ID ${nextButtonId}`);
        } catch (error) {
          console.log(`Direct orange button click failed: ${error.message}`);
          
          // Fallback: click in bottom right corner
          await scormFrame.evaluate(() => {
            const x = window.innerWidth - 50;
            const y = window.innerHeight - 50;
            const element = document.elementFromPoint(x, y);
            if (element) {
              element.click();
              console.log('[BROWSER] Clicked element at bottom right corner');
              return true;
            }
            return false;
          });
        }
        
        // Wait after clicking to ensure transition completes
        console.log('Waiting for transition after clicking next button...');
        await sleep(params.waitAfter || 3000);
        
        return true;
      } catch (error) {
        console.error('Error in generic next button state handler:', error.message);
        
        // Even if there's an error, try to proceed
        try {
          await scormFrame.evaluate(() => {
            const rightSide = window.innerWidth - 50;
            const bottomSide = window.innerHeight - 50;
            const element = document.elementFromPoint(rightSide, bottomSide);
            if (element) element.click();
          });
        } catch (e) {
          console.log('Error clicking next button after generic state handler error:', e.message);
        }
        
        return false;
      }
    },

    /**
     * Handle Dorithricin memo elements slide - click all rectangular hotspots then close dialog
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleDorithricinMemoElements: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Dorithricin memo elements interaction with enhanced clicking...');
        
        const memoElementIds = params.memoElementIds || [
          "6NHkEIKnqWl",  // Rectangular Hotspot 1
          "61rJiCh3r0J",  // Rectangular Hotspot 2  
          "6kDSXXaOYr5",  // Rectangular Hotspot 3
          "5i7p2qEPXc1",  // Rectangular Hotspot 4
          "6hf6heEsgee",  // Rectangular Hotspot 5
          "6PVHhZSkdxf",  // Rectangular Hotspot 6
          "6geaP82ceT9"   // Rectangular Hotspot 7
        ];
        const closeButtonId = params.closeButtonId || "5nUZEiVuJdn";
        const nextButtonId = params.nextButtonId || "5fQkkvFT1Hs";
        const delayBetweenClicks = params.delayBetweenClicks || 1500;
        
        console.log(`Will click ${memoElementIds.length} rectangular hotspots`);
        
        // STEP 1: Click each rectangular hotspot with enhanced method
        console.log('=== STEP 1: Clicking rectangular hotspots ===');
        
        let successfulClicks = 0;
        
        for (let i = 0; i < memoElementIds.length; i++) {
          const elementId = memoElementIds[i];
          console.log(`Clicking rectangular hotspot ${i + 1}/${memoElementIds.length}: ${elementId}`);
          
          try {
            // Wait for element to be available
            const elementExists = await scormFrame.waitForSelector(`[data-model-id="${elementId}"]`, { 
              visible: true, 
              timeout: 8000 
            }).then(() => true).catch(() => false);
            
            if (elementExists) {
              // Enhanced clicking method - use the proven approach
              let clickSuccess = false;
              
              // Method 1: Try direct frame click
              try {
                await scormFrame.click(`[data-model-id="${elementId}"]`);
                console.log(`✅ Successfully clicked hotspot ${elementId} with frame.click()`);
                clickSuccess = true;
              } catch (clickError) {
                console.log(`Direct click failed for ${elementId}, using enhanced method...`);
              }
              
              // Method 2: Enhanced clicking with SVG eventable group targeting
              if (!clickSuccess) {
                clickSuccess = await scormFrame.evaluate((hotspotId) => {
                  const hotspot = document.querySelector(`[data-model-id="${hotspotId}"]`);
                  if (!hotspot) return false;
                  
                  // Target the eventable SVG group specifically
                  const eventableGroup = hotspot.querySelector('svg g.eventable');
                  const clickTarget = eventableGroup || hotspot;
                  
                  if (clickTarget) {
                    const rect = clickTarget.getBoundingClientRect();
                    const x = rect.left + rect.width/2;
                    const y = rect.top + rect.height/2;
                    
                    // Comprehensive event sequence for rectangular hotspots
                    const events = [
                      new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                      new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                      new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                    ];
                    
                    // Dispatch events with small delays
                    events.forEach((event, index) => {
                      setTimeout(() => clickTarget.dispatchEvent(event), index * 50);
                    });
                    
                    console.log(`[BROWSER] Enhanced click dispatched for rectangular hotspot: ${hotspotId}`);
                    return true;
                  }
                  
                  return false;
                }, elementId);
                
                if (clickSuccess) {
                  console.log(`✅ Successfully clicked hotspot ${elementId} with enhanced method`);
                }
              }
              
              // Method 3: Fallback coordinate-based clicking
              if (!clickSuccess) {
                try {
                  const elementInfo = await scormFrame.evaluate((hotspotId) => {
                    const element = document.querySelector(`[data-model-id="${hotspotId}"]`);
                    if (element) {
                      const rect = element.getBoundingClientRect();
                      return {
                        x: rect.left + rect.width/2,
                        y: rect.top + rect.height/2,
                        width: rect.width,
                        height: rect.height
                      };
                    }
                    return null;
                  }, elementId);
                  
                  if (elementInfo) {
                    await scormFrame.mouse.click(elementInfo.x, elementInfo.y);
                    console.log(`✅ Successfully clicked hotspot ${elementId} with coordinate method`);
                    clickSuccess = true;
                  }
                } catch (coordError) {
                  console.log(`Coordinate click failed for ${elementId}: ${coordError.message}`);
                }
              }
              
              if (clickSuccess) {
                successfulClicks++;
                console.log(`✅ Hotspot ${i + 1} clicked successfully! Total: ${successfulClicks}/${memoElementIds.length}`);
              } else {
                console.log(`❌ All click methods failed for hotspot ${elementId}`);
              }
              
            } else {
              console.log(`❌ Rectangular hotspot ${elementId} not found`);
            }
          } catch (error) {
            console.error(`Error with rectangular hotspot ${elementId}: ${error.message}`);
          }
          
          // Wait between clicks (except after the last one)
          if (i < memoElementIds.length - 1) {
            await sleep(delayBetweenClicks);
          }
        }
        
        console.log(`✅ Clicked ${successfulClicks}/${memoElementIds.length} rectangular hotspots`);
        await sleep(params.waitAfterClicks || 4000);
        
        // STEP 2: Close dialog with enhanced detection
        console.log('=== STEP 2: Closing success dialog ===');
        
        try {
          // Try multiple close button detection strategies
          const closeButtonFound = await scormFrame.evaluate((buttonId) => {
            // Strategy 1: Look for the specific close button ID
            let closeButton = document.querySelector(`[data-model-id="${buttonId}"]`);
            if (closeButton && window.getComputedStyle(closeButton).display !== 'none') {
              return { found: true, method: 'specific-id', element: buttonId };
            }
            
            // Strategy 2: Look for any visible close button with .shown class
            const shownCloseButtons = document.querySelectorAll(`.slide-object-stategroup.shown [data-model-id="${buttonId}"]`);
            if (shownCloseButtons.length > 0) {
              return { found: true, method: 'shown-class', element: buttonId };
            }
            
            // Strategy 3: Look for any close button patterns
            const closePatterns = [
              '[data-acc-text="X"]',
              '[aria-label="Close"]',
              '.close-btn',
              '.dialog-close'
            ];
            
            for (const pattern of closePatterns) {
              closeButton = document.querySelector(pattern);
              if (closeButton && window.getComputedStyle(closeButton).display !== 'none') {
                return { found: true, method: 'pattern', element: pattern };
              }
            }
            
            return { found: false, method: 'none' };
          }, closeButtonId);
          
          if (closeButtonFound.found) {
            console.log(`Found close button via: ${closeButtonFound.method}`);
            
            // Enhanced close button clicking
            if (closeButtonFound.method === 'specific-id' || closeButtonFound.method === 'shown-class') {
              const closeClicked = await scormFrame.evaluate((buttonId) => {
                const closeButton = document.querySelector(`[data-model-id="${buttonId}"].slide-object-stategroup.shown`) ||
                                  document.querySelector(`[data-model-id="${buttonId}"]`);
                
                if (closeButton) {
                  // Try to find the clickable part (the orange circle with X)
                  const clickableElement = closeButton.querySelector('.slide-object-vectorshape') || 
                                        closeButton.querySelector('svg g.eventable') ||
                                        closeButton;
                  
                  const rect = clickableElement.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  // Create and dispatch a comprehensive click event
                  const events = [
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                  ];
                  
                  events.forEach(event => clickableElement.dispatchEvent(event));
                  console.log('[BROWSER] Enhanced close button click dispatched');
                  return true;
                }
                return false;
              }, closeButtonId);
              
              if (closeClicked) {
                console.log('✅ Successfully clicked close button with enhanced method');
              }
            } else {
              // For pattern-matched buttons, use direct click
              await scormFrame.click(closeButtonFound.element);
              console.log('✅ Successfully clicked close button with pattern match');
            }
          } else {
            console.log('ℹ️ No close button found (may not be needed)');
          }
        } catch (error) {
          console.error(`Error handling close button: ${error.message}`);
        }
        
        await sleep(params.waitAfterDialog || 2000);
        
        // STEP 3: Click next button with enhanced detection
        console.log('=== STEP 3: Clicking next button ===');
        
        try {
          const nextButtonExists = await scormFrame.waitForSelector(`[data-model-id="${nextButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (nextButtonExists) {
            try {
              await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
              console.log(`✅ Successfully clicked next button: ${nextButtonId}`);
            } catch (clickError) {
              console.log('Direct next click failed, using enhanced method...');
              
              await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  const eventableElement = button.querySelector('svg g.eventable') || button;
                  eventableElement.click();
                  console.log('[BROWSER] Enhanced next button click');
                  return true;
                }
                return false;
              }, nextButtonId);
            }
            
            await sleep(params.waitAfterNext || 5000);
          } else {
            console.log(`❌ Next button ${nextButtonId} not found`);
          }
        } catch (error) {
          console.error(`Error clicking next button: ${error.message}`);
        }
        
        console.log('🎉 Dorithricin memo elements interaction completed!');
        
        // Success criteria: at least 70% of hotspots clicked successfully
        const successRate = successfulClicks / memoElementIds.length;
        const success = successRate >= 0.7;
        
        console.log(`📊 Success rate: ${(successRate * 100).toFixed(1)}% (${successfulClicks}/${memoElementIds.length})`);
        
        return success;
      } catch (error) {
        console.error('Error in handleDorithricinMemoElements:', error.message);
        return false;
      }
    },

    /**
     * COMPLETE Dorithricin slider handler with Dialog Completion Approach
     * Properly completes dialog interaction to enable next button
     */
    handleDorithricinSlider: async function(scormFrame, params = {}) {

      await sleep(2000);

      try {
        console.log("Starting Dorithricin-specific slider interaction...");

        // Precise positioning calculation with movement detection
        const sliderInteractionResult = await scormFrame.evaluate(() => {
          const greenSlider = document.querySelector('[data-model-id="6ab5xvhtIXy"]');
          const yellowSlider = document.querySelector('[data-model-id="6BICHbFtmNU"]');
          const greenTrack = document.querySelector('[data-model-id="6ab5xvhtIXy_track"]');
          const yellowTrack = document.querySelector('[data-model-id="6BICHbFtmNU_track"]');

          if (!greenSlider || !yellowSlider || !greenTrack || !yellowTrack) {
            console.error('Could not find all slider elements');
            return { success: false, message: 'Slider elements not found' };
          }

          const initialGreenTransform = greenSlider.style.transform;
          const initialYellowTransform = yellowSlider.style.transform;

          const greenFinalX = 756;
          const yellowFinalX = 302;

          greenSlider.style.transform = `translate(${greenFinalX}px, 0px) rotate(0deg) scale(1, 1)`;
          yellowSlider.style.transform = `translate(${yellowFinalX}px, 0px) rotate(0deg) scale(1, 1)`;

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

        console.log('Detailed Slider Positioning:', JSON.stringify(sliderInteractionResult, null, 2));

        const sliderMovementComplete = await scormFrame.evaluate(() => {
          const greenSlider = document.querySelector('[data-model-id="6ab5xvhtIXy"]');
          const yellowSlider = document.querySelector('[data-model-id="6BICHbFtmNU"]');

          const hasSliderMoved = (slider, initialTransform) => {
            return slider.style.transform !== initialTransform;
          };

          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              const greenMoved = hasSliderMoved(greenSlider, sliderInteractionResult.initialGreenTransform);
              const yellowMoved = hasSliderMoved(yellowSlider, sliderInteractionResult.initialYellowTransform);

              if (greenMoved && yellowMoved) {
                clearInterval(checkInterval);
                resolve(true);
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkInterval);
              resolve(false);
            }, 10000);
          });
        });

        if (!sliderMovementComplete) {
          console.log('Slider movement did not complete as expected');
        }

        console.log('Attempting to click Prüfen button...');
        await scormFrame.click('[data-model-id="6M3h8ouA9G1"]');

        await sleep(3000);

        console.log('Attempting to dismiss "Das stimmt leider nicht ganz" dialog...');
        await scormFrame.click('[data-model-id="6qzg5u11jFL"]');

        await sleep(5000);

        console.log('Clicking Prüfen button again...');
        await scormFrame.click('[data-model-id="6M3h8ouA9G1"]');

        await sleep(7000);

        // === DIALOG COMPLETION APPROACH ===
        console.log("✅ DIALOG COMPLETION: Properly completing dialog interaction to enable next button");

        const dialogButtonId = "68lC9mZl43k";
        
        // STRATEGY: Complete the dialog interaction properly instead of just hiding it
        console.log("🎯 Attempting to complete MediBee dialog interaction...");
        
        const dialogCompletionResult = await scormFrame.evaluate((buttonId) => {
          console.log('[BROWSER] Starting proper dialog completion...');
          
          let interactionCount = 0;
          
          // Step 1: Try to interact with dialog content elements
          const findElementsContaining = (text) => {
            return Array.from(document.querySelectorAll('*')).filter(el => 
              el.textContent.toLowerCase().includes(text.toLowerCase()) && 
              el.getBoundingClientRect().width > 0 && 
              el.getBoundingClientRect().height > 0
            );
          };
          
          // Try clicking on key dialog elements
          const keyTexts = ['erwachsene', 'kinder', 'infektionen', '4', '10'];
          keyTexts.forEach(text => {
            const elements = findElementsContaining(text);
            elements.forEach(el => {
              try {
                el.click();
                console.log(`[BROWSER] Clicked element containing: ${text}`);
                interactionCount++;
              } catch (e) {}
            });
          });
          
          // Step 2: Try to find and click the Prüfen button specifically
          const pruefenButtons = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent.toLowerCase().includes('prüfen') && 
            el.getBoundingClientRect().width > 30 &&
            el.getBoundingClientRect().height > 20
          );
          
          pruefenButtons.forEach(button => {
            try {
              const rect = button.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              // Multiple click methods
              button.click();
              
              const clickEvent = new MouseEvent('click', {
                bubbles: true, cancelable: true,
                clientX: centerX, clientY: centerY
              });
              button.dispatchEvent(clickEvent);
              
              console.log('[BROWSER] Clicked Prüfen button');
              interactionCount++;
            } catch (e) {
              console.log('[BROWSER] Prüfen button click failed');
            }
          });
          
          // Step 3: Try to trigger form submission or validation
          const formElements = document.querySelectorAll('form, [role="form"]');
          formElements.forEach(form => {
            try {
              if (typeof form.submit === 'function') {
                form.submit();
                console.log('[BROWSER] Submitted form');
                interactionCount++;
              }
            } catch (e) {}
          });
          
          // Step 4: Try pressing Enter to submit dialog
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
          console.log('[BROWSER] Dispatched Enter key events');
          
          // Step 5: Try to find and interact with any input fields or interactive elements
          const interactiveElements = document.querySelectorAll('input, select, textarea, [contenteditable], [role="button"], [role="textbox"]');
          interactiveElements.forEach(el => {
            try {
              el.focus();
              el.click();
              
              // If it's an input, try setting a value
              if (el.tagName === 'INPUT' && el.type === 'text') {
                el.value = '4'; // Adults infection rate
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }
              
              interactionCount++;
            } catch (e) {}
          });
          
          return {
            interactionCount: interactionCount,
            message: `Performed ${interactionCount} dialog interactions`
          };
        }, dialogButtonId);
        
        console.log(`🎯 Dialog completion result: ${dialogCompletionResult.message}`);
        
        // Wait for dialog to process the interactions
        await sleep(3000);
        
        // === HANDLE SUCCESS DIALOG ("Richtig!") ===
        console.log("🎉 Checking for success dialog (Richtig!)...");
        
        const successDialogResult = await scormFrame.evaluate(() => {
          // Look for "Richtig!" success dialog
          const richtigElements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent.toLowerCase().includes('richtig') && 
            el.getBoundingClientRect().width > 50
          );
          
          let successDialogFound = richtigElements.length > 0;
          let closeButtonFound = false;
          let closeButtonId = null;
          
          if (successDialogFound) {
            console.log('[BROWSER] Success dialog "Richtig!" found');
            
            // Look for close button in success dialog - specifically look for the new button ID
            const successCloseButtons = [
              '5WyLjVP2wBG', // The specific close button from the screenshot
              '6PeGCMMyBPJ', // Alternative close button
              '6j5kqHVCSqu', // Alternative close button
              '5qcT7BTIIXO'  // The button that worked in the logs
            ];
            
            for (const buttonId of successCloseButtons) {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              if (button) {
                const style = getComputedStyle(button);
                if (style.display !== 'none') {
                  console.log(`[BROWSER] Found success dialog close button: ${buttonId}`);
                  closeButtonFound = true;
                  closeButtonId = buttonId;
                  break;
                }
              }
            }
          }
          
          return {
            successDialogFound: successDialogFound,
            closeButtonFound: closeButtonFound,
            closeButtonId: closeButtonId,
            richtigElementsCount: richtigElements.length
          };
        });
        
        console.log('🎉 Success dialog check:', successDialogResult);
        
        if (successDialogResult.successDialogFound) {
          console.log('✅ "Richtig!" success dialog detected - attempting to close it...');
          
          if (successDialogResult.closeButtonFound) {
            // Try to click the specific close button
            try {
              await scormFrame.click(`[data-model-id="${successDialogResult.closeButtonId}"]`);
              console.log(`✅ Successfully clicked success dialog close button: ${successDialogResult.closeButtonId}`);
              await sleep(2000);
            } catch (error) {
              console.log(`❌ Failed to click success close button: ${error.message}`);
              
              // Enhanced clicking for success dialog close button
              const enhancedCloseResult = await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  try {
                    // Try multiple click approaches
                    button.click();
                    
                    const rect = button.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const clickEvent = new MouseEvent('click', {
                      bubbles: true, cancelable: true,
                      clientX: centerX, clientY: centerY
                    });
                    button.dispatchEvent(clickEvent);
                    
                    // Also try clicking the SVG group
                    const svgGroup = button.querySelector('svg g.eventable');
                    if (svgGroup) {
                      svgGroup.click();
                    }
                    
                    console.log(`[BROWSER] Enhanced success dialog close: ${buttonId}`);
                    return true;
                  } catch (e) {
                    console.log(`[BROWSER] Enhanced close failed: ${e.message}`);
                    return false;
                  }
                }
                return false;
              }, successDialogResult.closeButtonId);
              
              if (enhancedCloseResult) {
                console.log('✅ Enhanced success dialog close succeeded');
                await sleep(2000);
              }
            }
          } else {
            // Try clicking the working button from logs
            console.log('🔄 Trying the button that worked in logs: 5qcT7BTIIXO');
            try {
              await scormFrame.click('[data-model-id="5qcT7BTIIXO"]');
              console.log('✅ Successfully clicked working button from logs');
              await sleep(2000);
            } catch (error) {
              console.log('❌ Working button from logs failed');
            }
          }
          
          // Wait for success dialog to close
          await sleep(3000);
        }
        
        // Check if dialog completed and next button is now active
        const completionCheck = await scormFrame.evaluate(() => {
          // Check if next buttons are now orange/active
          const nextButton1 = document.querySelector('[data-model-id="6jNtMM4JcZw"]');
          const nextButton2 = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
          
          const checkButtonActive = (button) => {
            if (!button) return false;
            const style = getComputedStyle(button);
            const orangeElement = button.querySelector('svg path[fill="#FF9800"], svg path[stroke="#FF9800"]');
            return style.display !== 'none' && !!orangeElement;
          };
          
          const button1Active = checkButtonActive(nextButton1);
          const button2Active = checkButtonActive(nextButton2);
          
          // Also check for any other orange buttons that might be navigation
          const orangeButtons = [];
          document.querySelectorAll('svg path[fill="#FF9800"], svg path[stroke="#FF9800"]').forEach(path => {
            const button = path.closest('[data-model-id]');
            if (button) {
              const modelId = button.getAttribute('data-model-id');
              const rect = button.getBoundingClientRect();
              const style = getComputedStyle(button);
              
              // Check if it's in navigation area and not a dialog button
              if (rect.x > window.innerWidth * 0.7 && rect.y > window.innerHeight * 0.7 && 
                  style.display !== 'none' &&
                  !['68lC9mZl43k', '6lGUORpiSn6', '68MgzCwXJoR', '6clGWKBUxB5', '6M3h8ouA9G1'].includes(modelId)) {
                orangeButtons.push({
                  id: modelId,
                  rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
                });
              }
            }
          });
          
          return {
            expectedButton1Active: button1Active,
            expectedButton2Active: button2Active,
            anyExpectedActive: button1Active || button2Active,
            orangeNavButtons: orangeButtons.length,
            orangeButtons: orangeButtons
          };
        });
        
        console.log('🔍 Next button activation check:', completionCheck);
        
        if (completionCheck.anyExpectedActive || completionCheck.orangeNavButtons > 0) {
          console.log('✅ Next button(s) are now active! Attempting to click...');
          
          // Try to click the active next button
          if (completionCheck.anyExpectedActive) {
            const targetButtonId = completionCheck.expectedButton1Active ? "6jNtMM4JcZw" : "5fQkkvFT1Hs";
            
            try {
              await scormFrame.click(`[data-model-id="${targetButtonId}"]`);
              console.log(`✅ Successfully clicked expected next button: ${targetButtonId}`);
              await sleep(2000);
              return true;
            } catch (error) {
              console.log(`❌ Failed to click expected button: ${error.message}`);
            }
          }
          
          // Try clicking orange navigation buttons
          if (completionCheck.orangeButtons.length > 0) {
            for (const button of completionCheck.orangeButtons) {
              try {
                await scormFrame.click(`[data-model-id="${button.id}"]`);
                console.log(`✅ Successfully clicked orange nav button: ${button.id}`);
                await sleep(2000);
                return true;
              } catch (error) {
                console.log(`❌ Failed to click orange button ${button.id}: ${error.message}`);
              }
            }
          }
        } else {
          console.log('⚠️ Next buttons still not active after dialog completion attempt');
          
          // Fallback: Try the close button approach one more time
          console.log('🔄 Fallback: Attempting close button dismissal...');
          
          const closeButtonDismissal = await scormFrame.evaluate((buttonId) => {
            const closeButton = document.querySelector(`[data-model-id="${buttonId}"]`);
            if (closeButton) {
              // Try multiple aggressive click approaches
              for (let i = 0; i < 10; i++) {
                try {
                  closeButton.click();
                  
                  // Also try clicking parent elements
                  const parents = [closeButton.parentElement, closeButton.parentElement?.parentElement];
                  parents.forEach(parent => {
                    if (parent) {
                      try { parent.click(); } catch (e) {}
                    }
                  });
                  
                  // Dispatch multiple event types
                  const events = ['mousedown', 'mouseup', 'click', 'dblclick'];
                  const rect = closeButton.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;
                  
                  events.forEach(eventType => {
                    const event = new MouseEvent(eventType, {
                      bubbles: true, cancelable: true,
                      clientX: centerX, clientY: centerY
                    });
                    closeButton.dispatchEvent(event);
                  });
                  
                } catch (e) {}
              }
              
              return 'Performed aggressive close button clicking';
            }
            return 'Close button not found';
          }, dialogButtonId);
          
          console.log(`🔄 Close button fallback: ${closeButtonDismissal}`);
          await sleep(2000);
          
          // Final check for next button activation
          const finalCheck = await scormFrame.evaluate(() => {
            const orangeButtons = [];
            document.querySelectorAll('svg path[fill="#FF9800"], svg path[stroke="#FF9800"]').forEach(path => {
              const button = path.closest('[data-model-id]');
              if (button && getComputedStyle(button).display !== 'none') {
                const modelId = button.getAttribute('data-model-id');
                orangeButtons.push(modelId);
              }
            });
            return orangeButtons;
          });
          
          console.log('🔍 Final orange buttons available:', finalCheck);
          
          // Try clicking any available orange button
          if (finalCheck.length > 0) {
            for (const buttonId of finalCheck) {
              // Skip known dialog buttons
              if (['68lC9mZl43k', '6lGUORpiSn6', '68MgzCwXJoR', '6clGWKBUxB5', '6M3h8ouA9G1'].includes(buttonId)) {
                continue;
              }
              
              try {
                await scormFrame.click(`[data-model-id="${buttonId}"]`);
                console.log(`✅ Final attempt: clicked orange button ${buttonId}`);
                await sleep(2000);
                return true;
              } catch (error) {
                console.log(`❌ Final attempt failed for ${buttonId}`);
              }
            }
          }
        }
        
        // Ultimate fallback: Emergency navigation but DON'T return true unless we actually succeed
        console.log('🚨 Ultimate fallback: Emergency navigation...');
        
        // Check if we're actually on a different slide now
        const slideCheck = await scormFrame.evaluate((buttonId) => {
          // Check if the dialog is completely gone (indicating slide progression)
          const dialogStillExists = document.querySelector(`[data-model-id="${buttonId}"]`) &&
                                  Array.from(document.querySelectorAll('*')).some(el => {
                                    const text = el.textContent.toLowerCase();
                                    return text.includes('medibee erklärt') && el.getBoundingClientRect().width > 100;
                                  });
          
          return {
            dialogExists: !!dialogStillExists,
            currentUrl: window.location.href,
            pageContent: document.title || document.body.textContent.substring(0, 100)
          };
        }, dialogButtonId);
        
        console.log('🔍 Final slide check:', slideCheck);
        
        if (!slideCheck.dialogExists) {
          console.log('✅ Dialog gone - slide appears to have progressed');
          return true;
        } else {
          console.log('❌ Still on slider slide with dialog - will retry');
          return false; // Return false to indicate we need to retry
        }

      } catch (error) {
        console.error('Dorithricin slider error:', error);
        return false; // Return false on error so it can be retried
      }
    },

    /**
     * Handle Dorithricin risk factors slide - click all risk factors
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleDorithricinRiskFactors: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Dorithricin risk factors interaction...');
        
        const riskFactorIds = params.riskFactorIds || [
          "6CgBjku5i0P",  // Couple (frequent intercourse)
          "6f83JhqEXI5",  // Reading lady
          "6U8twOQqmyr",  // Lady red nose
          "6ik9oDyZp4F",  // Old lady
          "6aelPxiqTQs",  // Lady pregnant
          "6cACM9wqz9n"   // Women on blanket
        ];
        const closeButtonId = params.closeButtonId || "5nUZEiVuJdn";
        const delayBetweenClicks = params.delayBetweenClicks || 1000;
        
        console.log(`Will click ${riskFactorIds.length} risk factors`);
        
        // STEP 1: Click all risk factors
        console.log('=== STEP 1: Clicking all risk factors ===');
        
        for (let i = 0; i < riskFactorIds.length; i++) {
          const factorId = riskFactorIds[i];
          console.log(`Clicking risk factor ${i + 1}/${riskFactorIds.length}: ${factorId}`);
          
          try {
            await scormFrame.waitForSelector(`[data-model-id="${factorId}"]`, {
              visible: true,
              timeout: 5000
            });
            await scormFrame.click(`[data-model-id="${factorId}"]`);
            console.log(`✅ Clicked risk factor: ${factorId}`);
            await sleep(delayBetweenClicks);
          } catch (error) {
            console.log(`❌ Failed to click risk factor ${factorId}: ${error.message}`);
          }
        }
        
        console.log('✅ Finished clicking all risk factors');
        
        // STEP 2: Wait for success popup
        console.log('=== STEP 2: Waiting for success popup ===');
        await sleep(params.waitForPopup || 2000);
        
        // STEP 3: Close the popup dialog
        console.log('=== STEP 3: Closing success popup ===');
        
        try {
          const closeButtonSelector = `div[data-model-id="${closeButtonId}"].slide-object-stategroup.shown`;
          await scormFrame.waitForSelector(closeButtonSelector, {
            visible: true,
            timeout: 10000
          });

          await scormFrame.evaluate((buttonId) => {
            const closeButton = document.querySelector(`div[data-model-id="${buttonId}"].slide-object-stategroup.shown`);
            if (!closeButton) throw new Error('Close button element not found');
            
            // Try to find the clickable part (the orange circle with X)
            const clickableElement = closeButton.querySelector('.slide-object-vectorshape') || closeButton;
            
            // Create and dispatch a mouse event
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            clickableElement.dispatchEvent(clickEvent);
            console.log('[BROWSER] Close button clicked successfully');
            return true;
          }, closeButtonId);

          console.log('✅ Successfully clicked close button');
          await sleep(params.waitAfterClose || 2000);

        } catch (error) {
          console.error('Error handling close button:', error.message);
        }
        
        console.log('🎉 Dorithricin risk factors interaction completed!');
        return true;
      } catch (error) {
        console.error('Error in handleDorithricinRiskFactors:', error.message);
        return false;
      }
    },

    /**
     * Handle simple timed slide - just wait and proceed
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleSimpleSlide: async function(scormFrame, params = {}) {
      try {
        console.log('Starting simple timed slide...');
        
        const nextButtonId = params.nextButtonId || "5fQkkvFT1Hs";
        const waitBeforeClick = params.waitBeforeClick || 3000;
        
        console.log(`⏳ Waiting ${waitBeforeClick}ms for content/animations to complete...`);
        await sleep(waitBeforeClick);
        
        // Click the next slide button
        console.log(`🎯 Clicking next slide button: ${nextButtonId}`);
        
        try {
          await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
          console.log(`✅ Successfully clicked next slide button: ${nextButtonId}`);
          await sleep(params.waitAfterNext || 3000);
        } catch (error) {
          console.error(`Error clicking next button ${nextButtonId}:`, error.message);
        }
        
        console.log('🎉 Simple timed slide completed!');
        return true;
      } catch (error) {
        console.error('Error in handleSimpleSlide:', error.message);
        return false;
      }
    },

    /**
     * Handle final Dorithricin training completion
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleFinalDorithricinCompletion: async function(scormFrame, params = {}) {
      try {
        console.log('🎯 Starting final Dorithricin training completion...');
        
        const finalButtonId = params.finalButtonId || "6QYaZJzOXoM";
        const waitBeforeClick = params.waitBeforeClick || 3000;
        const completionMessage = params.completionMessage || "Training completed!";

        console.log(`⏳ Waiting ${waitBeforeClick}ms for final completion screen to load...`);
        await sleep(waitBeforeClick);

        console.log(`🎯 Clicking final "Training schließen" button: ${finalButtonId}`);
        
        try {
          await scormFrame.click(`[data-model-id="${finalButtonId}"]`);
          console.log('✅ Final completion button clicked successfully!');
          await sleep(2000);
          
          console.log(completionMessage);
          return true;
        } catch (error) {
          console.log(`❌ Final button ${finalButtonId} click failed: ${error.message}`);
          
          // Fallback: try clicking at typical button positions
          await scormFrame.evaluate(() => {
            // Strategy 1: Click at bottom left corner (common position)
            const x = 100;
            const y = window.innerHeight - 50;
            const element = document.elementFromPoint(x, y);
            
            if (element) {
              element.click();
              console.log('[BROWSER] Clicked at likely Training schließen position');
              return true;
            }
            
            return false;
          });
          
          return false;
        }
      } catch (error) {
        console.error('Error in handleFinalDorithricinCompletion:', error.message);
        return false;
      }
    }
  }
};