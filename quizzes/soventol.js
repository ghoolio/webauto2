// quizzes/soventol.js
/**
 * Soventol Quiz Definition
 * 
 * This file uses the sequence-based approach to define the Soventol quiz
 * steps in a declarative, deterministic way. Each step specifies exactly what
 * type of interaction is needed and what action to take.
 */

// Import common utilities
const { sleep } = require('../utils/commonUtils');

// SUCCESS COORDINATES MAPPING (from manual testing)
const SOVENTOL_SUCCESS_COORDINATES = {
  // Ball position (X, Y) that triggers success for each hotspot
  "6O89a2HQw4T": { x: 386, y: 319 },  // Hotspot 2 - SUCCESS ✅
  "6mCPZaz2EAz": { x: 241, y: 340 },  // Hotspot 4 - SUCCESS ✅  
  "6dlYcC9a7mH": { x: 138, y: 296 },  // Hotspot 5 - SUCCESS ✅
  "6faEnesjmw1": { x: 35, y: 331 },   // Hotspot 6 - SUCCESS ✅
  "5tpqZSGdAZt": { x: 85, y: 126 },   // Hotspot 7 - SUCCESS ✅
  "5YA47GZGSJu": { x: 292, y: 169 },  // Hotspot 8 - SUCCESS ✅
  "6ZgMhm5vCVX": { x: 364, y: 56 },   // Hotspot 9 - SUCCESS ✅
  "60nmdOupwGN": { x: 552, y: 88 },   // Hotspot 10 - SUCCESS ✅
  "69W8f0IBB6x": { x: 593, y: 250 },  // Hotspot 1 - SUCCESS ✅
  "6MCSTfULgSf": { x: 304, y: 267 }   // Hotspot 3 - SUCCESS ✅
};

module.exports = {
  name: "Soventol",
  url: "https://academy.medice-health-family.com/paths/66d468be134b41f7006d0c0c/home?lang=",

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
      openNewTab: true, // Mark this step as one that opens a new tab
      waitAfter: 5000
    },
    
    // Slide 3: Handle popup/black screen with space key (conditional)
    {
      type: "DIALOG_SCREEN",
      action: "handleSoventolDialog",
      params: {
        delay: 2000,  // Shorter delay since it can appear later too
        maxAttempts: 5,
        adaptiveCheck: true  // Check multiple times
      },
      waitAfter: 3000
    },

    // Slide 4: Click the Start button in SCORM content (CONDITIONAL - may not exist on resumed attempts)
    {
      type: "SCORM_START_SCREEN",
      action: "clickScormStartButtonConditional", 
      useScormFrame: true,
      forceExecute: true,
      params: {
        timeout: 15000,    // Shorter timeout since it may not exist
        waitAfter: 3000,   
        buttonId: "6rSXEimPF3j",
        optional: true     // Don't fail if button doesn't exist
      },
      waitAfter: 3000
    },
    /*
    // Slide 5: Pharmacy scene - click orange plus button
    {
      type: "PHARMACY_SCENE",
      action: "clickPerenterolPlusButton",
      useScormFrame: true,
      forceExecute: true,
      params: {
        timeout: 15000,
        delay: 3000,
        buttonId: "6l65RbsSaM0"  // Plus button ID from DOM analysis
      },
      waitAfter: 5000
    },

    // Slide 6: Complex interaction - message button + magnifying glass + digression
    {
      type: "COMPLEX_MESSAGE_MAGNIFIER_SLIDE",
      action: "handleMessageMagnifierDigression",
      useScormFrame: true,
      params: {
        messageButtonId: "6l65RbsSaM0",
        magnifierButtonId: "6WuixtxvYVS", 
        nextButtonId: "65LuQWennx6",
        digressionMessageClicks: 3,
        delayBetweenClicks: 1500,
        waitAfterMagnifier: 2000,
        waitAfterDigression: 3000
      },
      waitAfter: 5000
    }, 

    // Slide 7: Simple timed slide - wait for content/animation then proceed
    {
      type: "SIMPLE_SLIDE",
      action: "handleSimpleSlide", 
      useScormFrame: true,
      forceExecute: true,
      params: {
        nextButtonId: "65LuQWennx6",   // Next slide button
        waitBeforeClick: 3000,         // Wait 3 seconds for content/animation
        waitAfterNext: 3000
      },
      waitAfter: 5000
    }, 
    
    // Slide 8: Interactive nature scene - click 10 hotspot elements + close dialog
    {
      type: "HOTSPOT_ELEMENTS_SLIDE",
      action: "handleSoventolHotspotElements",
      useScormFrame: true,
      forceExecute: true,
      params: {
        hotspotElementIds: [
          "6AlFkSQofJU",  // Freeform Hotspot 1
          "5c5YGTfr6Tc",  // Freeform Hotspot 2  
          "6AlFkSQofJU",  // Freeform Hotspot 3
          "5br8Jm6S327",  // Freeform Hotspot 3
          "6XuJ6lpo3Wq",  // Freeform Hotspot 4
          "5ZBW3rvJGU7",  // Freeform Hotspot 5
          "6YJVHLbRxre",  // Freeform Hotspot 6
          "630OwFHCVmr",  // Oval Hotspot 7
          "5mvVfkKh2BS",  // Freeform Hotspot 8
          "6p3ix6GCKO7",  // Freeform Hotspot 9
          "6hxsXiQ6Oye"   // Freeform Hotspot 10
        ],
        closeButtonId: "62CWu5D8Ksf",     // X close button
        nextButtonId: "65LuQWennx6",      // Next slide button
        maxClicks: 11,
        delayBetweenClicks: 2000,
        waitAfterComplete: 2000,          // Wait after X button before next
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 9: Simple carousel navigation - MediBee explains inflammation
    {
      type: "CAROUSEL_SLIDE",
      action: "handleSoventolCarousel",
      useScormFrame: true,
      forceExecute: true,
      params: {
        carouselButtonIds: [
          "6XaDmWPnR73",  // First carousel button (slide 2)
          "5yAOMlIblZS"   // Second carousel button (slide 3)
        ],
        nextButtonId: "65LuQWennx6",  // Next slide button
        maxClicks: 2,
        delayBetweenClicks: 2500,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },
    */

    // Slide 10: Drag and Drop Hotspots Slide BS
    {
      type: "DRAG_DROP_HOTSPOTS_SLIDE",
      action: "handleSoventolDragDropDynamic", // ← UPDATED function name
      useScormFrame: true,
      forceExecute: true,
      params: {
        dragElementId: "6mJrB4LtUYw",
        hotspotElementIds: [
          "6O89a2HQw4T", "6mCPZaz2EAz", "6dlYcC9a7mH", "6faEnesjmw1", 
          "5tpqZSGdAZt", "6ZgMhm5vCVX", "60nmdOupwGN", "69W8f0IBB6x", 
          "6MCSTfULgSf", "5YA47GZGSJu"
        ],
        nextButtonId: "65LuQWennx6",
        maxDrops: 10,
        delayBetweenDrops: 2000,
        waitAfterComplete: 3000
      },
      waitAfter: 5000
    },
    // === QUIZ SLIDES WILL BE ADDED HERE PROGRESSIVELY ===
    // (User will provide screenshots and DOM details for each slide)
    
    // === COMPLETION FLOW (Following dorithricin.js pattern) ===
    // Completion screen 1
    {
      type: "COMPLETION_SCREEN",
      action: "clickSoventolWeiterButton1",
      useScormFrame: true,
      waitAfter: 3000
    },

    // Completion screen 2
    {
      type: "COMPLETION_SCREEN",
      action: "clickSoventolWeiterButton2",
      useScormFrame: true,
      waitAfter: 3000
    },
    
    // Final screen with final Weiter button
    {
      type: "FINAL_SCREEN",
      action: "clickSoventolWeiterButton3",
      useScormFrame: true,
      waitAfter: 5000
    }
    
    // Quiz completion - no more steps needed
  ],
  
  // Custom functions specific to Soventol quiz
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
        
        // Wait for the button to be available
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
    handleSoventolDialog: async function(page, params = {}) {
      try {
        console.log('Adaptive dialog handling for Soventol - checking for Resume button and black screen...');
        
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
        console.error('Error in handleSoventolDialog:', error.message);
        return true; // Continue even if dialog handling fails
      }
    },

    /**
     * Click the orange plus button specific to Perenterol pharmacy scene
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickPerenterolPlusButton: async function(scormFrame, params = {}) {
      try {
        console.log('Clicking Perenterol pharmacy plus button...');
        
        const buttonId = params.buttonId || '6l65RbsSaM0';
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
        console.error('Error clicking Perenterol plus button:', error.message);
        return false;
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
        
        const buttonId = params.buttonId || '6rSXEimPF3j';
        const timeout = params.timeout || 15000;
        
        // Check if button exists (don't wait long)
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
        } else {
          console.log(`SCORM start button with ID ${buttonId} not found - quiz likely already started (resumed attempt)`);
          console.log('This is normal for resumed quiz attempts, continuing...');
          return true; // Don't fail - this is expected for resumed attempts
        }
      } catch (error) {
        console.error('Error in clickScormStartButtonConditional:', error.message);
        console.log('Continuing anyway - button may not exist on resumed attempts');
        return true; // Don't fail the whole quiz for this
      }
    },

    /**
     * Handle complex message + magnifier + digression interaction for Soventol slide 5
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleMessageMagnifierDigression: async function(scormFrame, params = {}) {
      try {
        console.log('Starting complex message + magnifier + digression interaction...');
        
        const messageButtonId = params.messageButtonId || "6l65RbsSaM0";
        const magnifierButtonId = params.magnifierButtonId || "6WuixtxvYVS";
        const nextButtonId = params.nextButtonId || "65LuQWennx6";
        const digressionMessageClicks = params.digressionMessageClicks || 3;
        const delayBetweenClicks = params.delayBetweenClicks || 1500;
        
        // STEP 1: Click the initial message button
        console.log('=== STEP 1: Clicking initial message button ===');
        
        try {
          const messageButtonExists = await scormFrame.waitForSelector(`[data-model-id="${messageButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (messageButtonExists) {
            await scormFrame.click(`[data-model-id="${messageButtonId}"]`);
            console.log(`✅ Clicked initial message button: ${messageButtonId}`);
            await sleep(delayBetweenClicks);
          } else {
            console.log(`❌ Initial message button ${messageButtonId} not found`);
            return false;
          }
        } catch (error) {
          console.log(`Error clicking initial message button: ${error.message}`);
          return false;
        }
        
        // STEP 2: Wait for and click the magnifying glass
        console.log('=== STEP 2: Waiting for and clicking magnifying glass ===');
        
        try {
          const magnifierExists = await scormFrame.waitForSelector(`[data-model-id="${magnifierButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (magnifierExists) {
            console.log(`🔍 Magnifying glass appeared: ${magnifierButtonId}`);
            
            // Try multiple click methods for the magnifying glass
            try {
              await scormFrame.click(`[data-model-id="${magnifierButtonId}"]`);
              console.log(`✅ Clicked magnifying glass with frame.click()`);
            } catch (clickError) {
              console.log('Direct click failed, using evaluate method:', clickError.message);
              
              await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  const eventableElement = button.querySelector('svg g.eventable') || button;
                  
                  if (eventableElement) {
                    const rect = eventableElement.getBoundingClientRect();
                    const x = rect.left + rect.width/2;
                    const y = rect.top + rect.height/2;
                    
                    const events = [
                      new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                    ];
                    
                    events.forEach(event => eventableElement.dispatchEvent(event));
                    console.log(`[BROWSER] Dispatched events on magnifying glass: ${buttonId}`);
                    return true;
                  }
                  
                  button.click();
                  console.log(`[BROWSER] Clicked magnifying glass: ${buttonId}`);
                  return true;
                }
                return false;
              }, magnifierButtonId);
            }
            
            await sleep(params.waitAfterMagnifier || 2000);
          } else {
            console.log(`❌ Magnifying glass ${magnifierButtonId} did not appear`);
            return false;
          }
        } catch (error) {
          console.log(`Error with magnifying glass: ${error.message}`);
          return false;
        }
        
        // STEP 3: Handle digression slide with 3 message button clicks
        console.log('=== STEP 3: Handling digression slide (3 message clicks) ===');
        
        try {
          for (let i = 1; i <= digressionMessageClicks; i++) {
            console.log(`Digression message click ${i}/${digressionMessageClicks}`);
            
            // Wait for message button to be available
            const messageButtonReady = await scormFrame.waitForSelector(`[data-model-id="${messageButtonId}"]`, { 
              visible: true, 
              timeout: 8000 
            }).then(() => true).catch(() => false);
            
            if (messageButtonReady) {
              try {
                await scormFrame.click(`[data-model-id="${messageButtonId}"]`);
                console.log(`✅ Digression click ${i} successful`);
              } catch (clickError) {
                console.log(`Direct click failed for digression ${i}, using evaluate:`, clickError.message);
                
                await scormFrame.evaluate((buttonId) => {
                  const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                  if (button) {
                    button.click();
                    console.log(`[BROWSER] Clicked digression message button: ${buttonId}`);
                    return true;
                  }
                  return false;
                }, messageButtonId);
              }
              
              // Wait between clicks (except after the last one)
              if (i < digressionMessageClicks) {
                await sleep(delayBetweenClicks);
              }
            } else {
              console.log(`❌ Message button not ready for digression click ${i}`);
            }
          }
          
          console.log('✅ Completed all digression message clicks');
          await sleep(params.waitAfterDigression || 3000);
          
        } catch (error) {
          console.log(`Error in digression slide: ${error.message}`);
        }
        
        // STEP 4: Click the next button to proceed
        console.log('=== STEP 4: Clicking next button to proceed ===');
        
        try {
          const nextButtonExists = await scormFrame.waitForSelector(`[data-model-id="${nextButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (nextButtonExists) {
            try {
              await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
              console.log(`✅ Clicked next button ${nextButtonId} with frame.click()`);
            } catch (clickError) {
              console.log('Direct next button click failed, using evaluate method:', clickError.message);
              
              await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${nextButtonId}"]`);
                if (button) {
                  const eventableElement = button.querySelector('svg g.eventable') || button;
                  
                  if (eventableElement) {
                    const rect = eventableElement.getBoundingClientRect();
                    const x = rect.left + rect.width/2;
                    const y = rect.top + rect.height/2;
                    
                    const events = [
                      new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                    ];
                    
                    events.forEach(event => eventableElement.dispatchEvent(event));
                    console.log(`[BROWSER] Dispatched events on next button: ${buttonId}`);
                    return true;
                  }
                  
                  button.click();
                  console.log(`[BROWSER] Clicked next button: ${buttonId}`);
                  return true;
                }
                return false;
              }, nextButtonId);
            }
            
            console.log('✅ Successfully clicked next button to proceed');
            await sleep(2000);
          } else {
            console.log(`❌ Next button ${nextButtonId} not found`);
          }
        } catch (error) {
          console.log(`Error clicking next button: ${error.message}`);
        }
        
        console.log('🎉 Complex message + magnifier + digression interaction completed!');
        return true;
        
      } catch (error) {
        console.error('Error in handleMessageMagnifierDigression:', error.message);
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
        
        const nextButtonId = params.nextButtonId || "5WP8Lt8v1CQ";
        const waitBeforeClick = params.waitBeforeClick || 3000;
        
        console.log(`⏳ Waiting ${waitBeforeClick}ms for content/animations to complete...`);
        await sleep(waitBeforeClick);
        
        // Click the next slide button
        console.log(`🎯 Clicking next slide button: ${nextButtonId}`);
        
        try {
          const nextButtonExists = await scormFrame.waitForSelector(`[data-model-id="${nextButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (nextButtonExists) {
            try {
              await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
              console.log(`✅ Clicked next button ${nextButtonId} with frame.click()`);
            } catch (clickError) {
              console.log('Direct next button click failed, using evaluate method:', clickError.message);
              
              await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  const eventableElement = button.querySelector('svg g.eventable') || button;
                  
                  if (eventableElement) {
                    const rect = eventableElement.getBoundingClientRect();
                    const x = rect.left + rect.width/2;
                    const y = rect.top + rect.height/2;
                    
                    const events = [
                      new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                    ];
                    
                    events.forEach(event => eventableElement.dispatchEvent(event));
                    console.log(`[BROWSER] Dispatched events on next button: ${buttonId}`);
                    return true;
                  }
                  
                  button.click();
                  console.log(`[BROWSER] Clicked next button: ${buttonId}`);
                  return true;
                }
                return false;
              }, nextButtonId);
            }
            
            console.log(`✅ Successfully clicked next slide button: ${nextButtonId}`);
            await sleep(params.waitAfterNext || 3000);
          } else {
            console.log(`❌ Next button ${nextButtonId} not found`);
          }
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
     * Enhanced hotspot clicking that handles overlapping tooltips/information bubbles
     * Specifically for elements: 6AlFkSQofJU, 5c5YGTfr6Tc, 6hxsXiQ6Oye
     */
    handleSoventolHotspotElements: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Soventol hotspot elements interaction with tooltip management...');
        
        const hotspotElementIds = params.hotspotElementIds || [];
        const closeButtonId = params.closeButtonId || "62CWu5D8Ksf";
        const nextButtonId = params.nextButtonId || "65LuQWennx6";
        const maxClicks = params.maxClicks || 10;
        const delayBetweenClicks = params.delayBetweenClicks || 1500;
        
        // Function to dismiss any visible tooltips/bubbles
        const dismissTooltips = async function() {
          console.log('🧹 Checking for and dismissing any visible tooltips...');
          
          await scormFrame.evaluate(() => {
            // Look for tooltip/bubble elements that might be blocking other hotspots
            const tooltipSelectors = [
              '[class*="tooltip"]',
              '[class*="bubble"]', 
              '[class*="popup"]',
              '[class*="info"]',
              '[data-model-id][style*="z-index: 1"]', // High z-index elements
              '.slide-object[style*="opacity: 1"][style*="z-index"]' // Visible slide objects
            ];
            
            let dismissed = 0;
            
            tooltipSelectors.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(element => {
                const style = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                
                // Check if element is visible and potentially blocking
                if (style.opacity !== '0' && 
                    style.visibility !== 'hidden' && 
                    style.display !== 'none' &&
                    rect.width > 50 && rect.height > 30) {
                  
                  // Try to hide/dismiss it by clicking outside or setting opacity
                  try {
                    // Method 1: Click outside the tooltip area
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    
                    // Only click outside if center is not within this element
                    if (centerX < rect.left || centerX > rect.right || 
                        centerY < rect.top || centerY > rect.bottom) {
                      
                      const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        clientX: centerX,
                        clientY: centerY
                      });
                      
                      document.body.dispatchEvent(clickEvent);
                      dismissed++;
                    }
                    
                    // Method 2: Try to find and click close buttons
                    const closeButtons = element.querySelectorAll('[aria-label*="close"], [data-role="close"], .close-btn, [class*="close"]');
                    closeButtons.forEach(btn => {
                      try {
                        btn.click();
                        dismissed++;
                      } catch (e) {}
                    });
                    
                  } catch (e) {
                    console.log('[BROWSER] Error dismissing tooltip:', e.message);
                  }
                }
              });
            });
            
            console.log(`[BROWSER] Attempted to dismiss ${dismissed} potentially blocking elements`);
            return dismissed;
          });
          
          await sleep(500); // Wait for dismissals to take effect
        };
        
        // Enhanced click function for problematic/overlapping elements
        const clickHotspotWithTooltipHandling = async function(elementId, elementIndex) {
          console.log(`🎯 Enhanced click for element ${elementIndex}: ${elementId}`);
          
          // Step 1: Dismiss any existing tooltips first
          await dismissTooltips();
          
          // Step 2: Wait for element and get multiple click coordinates
          try {
            const elementExists = await scormFrame.waitForSelector(`[data-model-id="${elementId}"]`, { 
              visible: true, 
              timeout: 8000 
            }).then(() => true).catch(() => false);
            
            if (!elementExists) {
              console.log(`❌ Element ${elementId} not found`);
              return false;
            }
            
            // Step 3: Use enhanced clicking with multiple coordinate attempts
            const clicked = await scormFrame.evaluate((id, index) => {
              const element = document.querySelector(`[data-model-id="${id}"]`);
              if (!element) return false;
              
              const rect = element.getBoundingClientRect();
              const svg = element.querySelector('svg');
              const eventableGroup = element.querySelector('svg g.eventable');
              const path = element.querySelector('path[data-accepts="events"]');
              
              console.log(`[BROWSER] Enhanced click for element ${index} (${id}):`);
              console.log(`[BROWSER] Element bounds:`, rect.left, rect.top, rect.width, rect.height);
              
              // Generate smart click coordinates that avoid likely tooltip positions
              const clickPoints = [];
              
              // For early elements (1-3), avoid top and left areas where tooltips might appear
              if (index <= 3) {
                clickPoints.push(
                  { x: rect.left + rect.width*0.8, y: rect.top + rect.height*0.8 },   // Bottom-right
                  { x: rect.left + rect.width*0.7, y: rect.top + rect.height*0.6 },   // Right-center
                  { x: rect.left + rect.width*0.9, y: rect.top + rect.height*0.5 },   // Far right
                  { x: rect.left + rect.width*0.6, y: rect.top + rect.height*0.9 },   // Bottom area
                  { x: rect.left + rect.width*0.5, y: rect.top + rect.height*0.7 }    // Lower center
                );
              } else {
                // For later elements, use more standard coordinates
                clickPoints.push(
                  { x: rect.left + rect.width*0.5, y: rect.top + rect.height*0.5 },   // Center
                  { x: rect.left + rect.width*0.3, y: rect.top + rect.height*0.3 },   // Top-left
                  { x: rect.left + rect.width*0.7, y: rect.top + rect.height*0.7 },   // Bottom-right
                  { x: rect.left + rect.width*0.4, y: rect.top + rect.height*0.6 },   // Offset center
                  { x: rect.left + rect.width*0.6, y: rect.top + rect.height*0.4 }    // Offset center 2
                );
              }
              
              let success = false;
              
              // Try each click point
              for (let i = 0; i < clickPoints.length; i++) {
                const point = clickPoints[i];
                console.log(`[BROWSER] Trying click point ${i + 1}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);
                
                // Create comprehensive event sequence
                const events = [
                  new PointerEvent('pointerover', {bubbles: true, cancelable: true, pointerId: 1, clientX: point.x, clientY: point.y}),
                  new PointerEvent('pointerdown', {bubbles: true, cancelable: true, pointerId: 1, clientX: point.x, clientY: point.y, button: 0}),
                  new PointerEvent('pointerup', {bubbles: true, cancelable: true, pointerId: 1, clientX: point.x, clientY: point.y, button: 0}),
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, clientX: point.x, clientY: point.y}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, clientX: point.x, clientY: point.y, button: 0}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, clientX: point.x, clientY: point.y, button: 0}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, clientX: point.x, clientY: point.y, button: 0})
                ];
                
                // Try dispatching to different targets
                const targets = [path, eventableGroup, svg, element].filter(t => t);
                
                for (const target of targets) {
                  events.forEach(event => {
                    try {
                      const result = target.dispatchEvent(event);
                      if (event.type === 'click' && result) {
                        success = true;
                      }
                    } catch (e) {
                      // Ignore dispatch errors
                    }
                  });
                  
                  if (success) break;
                }
                
                if (success) break;
              }
              
              // Additional direct click attempts
              if (!success) {
                [element, path, eventableGroup, svg].filter(t => t).forEach(target => {
                  if (typeof target.click === 'function') {
                    try {
                      target.click();
                      success = true;
                      console.log(`[BROWSER] Direct click() succeeded on target`);
                    } catch (e) {
                      // Ignore click errors
                    }
                  }
                });
              }
              
              console.log(`[BROWSER] Enhanced click result for ${id}: ${success ? 'SUCCESS' : 'FAILED'}`);
              return success;
            }, elementId, elementIndex);
            
            if (clicked) {
              console.log(`✅ Enhanced click successful for element ${elementIndex}: ${elementId}`);
              
              // Step 4: Wait and dismiss any new tooltips that appeared
              await sleep(800);
              await dismissTooltips();
              
              return true;
            } else {
              console.log(`⚠️ Enhanced click failed for element ${elementIndex}: ${elementId}`);
              return false;
            }
            
          } catch (error) {
            console.error(`Error in enhanced click for ${elementId}:`, error.message);
            return false;
          }
        };
        
        // Step 1: Click each hotspot element with tooltip management
        console.log('\n=== STEP 1: Click 10 Hotspot Elements with Tooltip Management ===');
        
        for (let i = 0; i < Math.min(hotspotElementIds.length, maxClicks); i++) {
          const elementId = hotspotElementIds[i];
          console.log(`\n--- Hotspot Element ${i + 1}/${maxClicks}: ${elementId} ---`);
          
          // Use enhanced method for elements that are prone to tooltip overlap
          const problematicElements = ["6AlFkSQofJU", "5c5YGTfr6Tc", "6hxsXiQ6Oye"];
          
          if (problematicElements.includes(elementId)) {
            console.log(`🎯 Using tooltip-aware method for problematic element: ${elementId}`);
            await clickHotspotWithTooltipHandling(elementId, i + 1);
          } else {
            // Use standard method for other elements, but still dismiss tooltips first
            await dismissTooltips();
            
            try {
              await scormFrame.click(`[data-model-id="${elementId}"]`);
              console.log(`✅ Standard click successful for element ${i + 1}: ${elementId}`);
            } catch (clickError) {
              console.log(`Using fallback method for element ${elementId}`);
              
              await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  const eventableElement = button.querySelector('svg g.eventable') || button;
                  const rect = eventableElement.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  const events = [
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                  ];
                  
                  events.forEach(event => eventableElement.dispatchEvent(event));
                  console.log(`[BROWSER] Fallback click for: ${buttonId}`);
                  return true;
                }
                return false;
              }, elementId);
            }
          }
          
          console.log(`✅ Hotspot element ${i + 1} interaction completed!`);
          
          // Wait between clicks with extra time for tooltip-prone elements
          if (i < maxClicks - 1) {
            const waitTime = problematicElements.includes(elementId) ? delayBetweenClicks + 1000 : delayBetweenClicks;
            console.log(`⏳ Waiting ${waitTime}ms before next element...`);
            await sleep(waitTime);
          }
        }
        
        // Clear any remaining tooltips before proceeding
        console.log('\n🧹 Final tooltip cleanup before dialog...');
        await dismissTooltips();
        await sleep(1000);
        
        // Step 2: Wait for bee animation and click close (X) button
        console.log('\n=== STEP 2: Close Dialog (Click X Button) ===');
        console.log('⏳ Waiting for bee animation and dialog to appear...');
        await sleep(2000);
        
        console.log(`🎯 Clicking close (X) button: ${closeButtonId}`);
        
        try {
          const closeButtonExists = await scormFrame.waitForSelector(`[data-model-id="${closeButtonId}"]`, { 
            visible: true, 
            timeout: 8000 
          }).then(() => true).catch(() => false);
          
          if (closeButtonExists) {
            try {
              await scormFrame.click(`[data-model-id="${closeButtonId}"]`);
              console.log(`✅ Close button clicked with frame.click()`);
            } catch (clickError) {
              await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  button.click();
                  console.log(`[BROWSER] Close button clicked via evaluate`);
                  return true;
                }
                return false;
              }, closeButtonId);
            }
            
            console.log('✅ Dialog closed successfully!');
          } else {
            console.log(`❌ Close button ${closeButtonId} not found`);
          }
        } catch (error) {
          console.error(`Error clicking close button ${closeButtonId}:`, error.message);
        }
        
        // Step 3: Wait and click next slide button
        console.log('\n=== STEP 3: Proceed to Next Slide ===');
        console.log(`⏳ Waiting ${params.waitAfterComplete || 2000}ms after dialog close...`);
        await sleep(params.waitAfterComplete || 2000);
        
        console.log(`🎯 Clicking next slide button: ${nextButtonId}`);
        
        try {
          const nextButtonExists = await scormFrame.waitForSelector(`[data-model-id="${nextButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (nextButtonExists) {
            try {
              await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
              console.log(`✅ Clicked next button with frame.click()`);
            } catch (clickError) {
              await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (button) {
                  button.click();
                  console.log(`[BROWSER] Next button clicked via evaluate`);
                  return true;
                }
                return false;
              }, nextButtonId);
            }
            
            console.log(`✅ Successfully proceeded to next slide!`);
            await sleep(params.waitAfterNext || 3000);
          } else {
            console.log(`❌ Next button ${nextButtonId} not found`);
          }
        } catch (error) {
          console.error(`Error clicking next button:`, error.message);
        }
        
        console.log('🎉 Soventol hotspot elements with tooltip management completed!');
        return true;
      } catch (error) {
        console.error('Error in handleSoventolHotspotElements:', error.message);
        return false;
      }
    },

    /**
     * Handle Soventol carousel navigation (MediBee explains inflammation slide)
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleSoventolCarousel: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Soventol carousel navigation...');
        
        const carouselButtonIds = params.carouselButtonIds || ["6XaDmWPnR73", "5yAOMlIblZS"];
        const nextButtonId = params.nextButtonId || "65LuQWennx6";
        const maxClicks = params.maxClicks || 2;
        const delayBetweenClicks = params.delayBetweenClicks || 2500;
        
        // Click each carousel button in sequence
        for (let i = 0; i < Math.min(carouselButtonIds.length, maxClicks); i++) {
          const buttonId = carouselButtonIds[i];
          console.log(`Clicking carousel button ${i + 1}/${maxClicks}: ${buttonId}`);
          
          try {
            // Wait for button to be visible
            const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
              visible: true, 
              timeout: 10000 
            }).then(() => true).catch(() => false);
            
            if (buttonExists) {
              // Try multiple click methods for reliability
              try {
                await scormFrame.click(`[data-model-id="${buttonId}"]`);
                console.log(`Clicked carousel button ${buttonId} with frame.click()`);
              } catch (clickError) {
                console.log('Direct click failed, using evaluate method:', clickError.message);
                
                // Fallback to evaluate method with SVG event handling
                await scormFrame.evaluate((id) => {
                  const button = document.querySelector(`[data-model-id="${id}"]`);
                  if (button) {
                    // First try the specific SVG event target for highest reliability
                    const eventableElement = button.querySelector('svg g.eventable');
                    
                    if (eventableElement) {
                      // Create a complete sequence of mouse events for most reliable interaction
                      const rect = eventableElement.getBoundingClientRect();
                      const x = rect.left + rect.width/2;
                      const y = rect.top + rect.height/2;
                      
                      const events = [
                        new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                        new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                        new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                        new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                        new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                      ];
                      
                      // Dispatch each event in sequence
                      events.forEach(event => eventableElement.dispatchEvent(event));
                      console.log(`[BROWSER] Dispatched full event sequence on carousel button: ${id}`);
                      return true;
                    }
                    
                    // Fallback to regular click
                    button.click();
                    console.log(`[BROWSER] Clicked carousel button: ${id}`);
                    return true;
                  }
                  return false;
                }, buttonId);
              }
              
              console.log(`Successfully clicked carousel button: ${buttonId}`);
              await sleep(delayBetweenClicks);
            } else {
              console.log(`Carousel button ${buttonId} not found`);
            }
          } catch (error) {
            console.error(`Error clicking carousel button ${buttonId}:`, error.message);
          }
        }
        
        // Now click the next slide button
        console.log(`Clicking next slide button: ${nextButtonId}`);
        
        try {
          // Wait for next button to be ready
          await sleep(1000);
          
          const nextButtonExists = await scormFrame.waitForSelector(`[data-model-id="${nextButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (nextButtonExists) {
            try {
              await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
              console.log(`Clicked next button ${nextButtonId} with frame.click()`);
            } catch (clickError) {
              console.log('Direct next button click failed, using evaluate method:', clickError.message);
              
              // Fallback to evaluate method
              await scormFrame.evaluate((id) => {
                const button = document.querySelector(`[data-model-id="${id}"]`);
                if (button) {
                  // Try the SVG approach for next button too
                  const eventableElement = button.querySelector('svg g.eventable');
                  
                  if (eventableElement) {
                    const rect = eventableElement.getBoundingClientRect();
                    const x = rect.left + rect.width/2;
                    const y = rect.top + rect.height/2;
                    
                    const events = [
                      new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                      new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                    ];
                    
                    events.forEach(event => eventableElement.dispatchEvent(event));
                    console.log(`[BROWSER] Dispatched events on next button: ${id}`);
                    return true;
                  }
                  
                  button.click();
                  console.log(`[BROWSER] Clicked next button: ${id}`);
                  return true;
                }
                return false;
              }, nextButtonId);
            }
            
            console.log(`Successfully clicked next slide button: ${nextButtonId}`);
            await sleep(params.waitAfterNext || 3000);
          } else {
            console.log(`Next button ${nextButtonId} not found`);
          }
        } catch (error) {
          console.error(`Error clicking next button ${nextButtonId}:`, error.message);
        }
        
        return true;
      } catch (error) {
        console.error('Error in handleSoventolCarousel:', error.message);
        return false;
      }
    },

    /**
     * PROVEN REALISTIC DRAG SIMULATION - Now with dynamic targeting
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Parameters
     */
    handleSoventolDragDropDynamic: async function(scormFrame, params = {}) {
      try {
        console.log('🎯 Starting DYNAMIC Soventol drag simulation...');
        
        const dragElementId = params.dragElementId || "6mJrB4LtUYw";
        const hotspotElementIds = params.hotspotElementIds || [
          "6O89a2HQw4T", "6mCPZaz2EAz", "6dlYcC9a7mH", "6faEnesjmw1", 
          "5tpqZSGdAZt", "6ZgMhm5vCVX", "60nmdOupwGN", "69W8f0IBB6x", 
          "6MCSTfULgSf", "5YA47GZGSJu"
        ];
        const nextButtonId = params.nextButtonId || "65LuQWennx6";
        
        // Counter detection
        const checkCounterValue = async function() {
          return await scormFrame.evaluate(() => {
            try {
              const counter = document.querySelector('[data-model-id="6ThG7ADv7Jh"]');
              if (counter) {
                const text = (counter.textContent || counter.innerText || '').trim();
                const match = text.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                  return { current: parseInt(match[1]), total: parseInt(match[2]), text: text };
                }
              }
              return { current: 0, total: 10, text: 'not-found' };
            } catch (error) {
              return { current: 0, total: 10, text: 'error' };
            }
          });
        };
        
        // Get element positions and info
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
        
        // DYNAMIC REALISTIC DRAG SIMULATION - Uses actual hotspot centers
        const simulateDynamicDrag = async function(hotspotId) {
          console.log(`🎯 DYNAMIC DRAG - Simulating drag to ${hotspotId}`);
          
          try {
            // Get current ball and hotspot positions dynamically
            const ballInfo = await getElementInfo(dragElementId);
            const hotspotInfo = await getElementInfo(hotspotId);
            
            if (!ballInfo || !hotspotInfo) {
              console.log(`❌ Could not get element info for ${dragElementId} or ${hotspotId}`);
              return false;
            }
            
            // Use ACTUAL hotspot center as target (not fixed coordinates)
            const targetX = hotspotInfo.center.x;
            const targetY = hotspotInfo.center.y;
            
            console.log(`🔴 Ball center: (${ballInfo.center.x.toFixed(1)}, ${ballInfo.center.y.toFixed(1)})`);
            console.log(`🎯 Hotspot center: (${hotspotInfo.center.x.toFixed(1)}, ${hotspotInfo.center.y.toFixed(1)})`);
            console.log(`📍 DYNAMIC Target: (${targetX.toFixed(1)}, ${targetY.toFixed(1)})`);
            
            // Calculate movement path
            const startX = ballInfo.center.x;
            const startY = ballInfo.center.y;
            const endX = targetX;
            const endY = targetY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Create movement steps (proven to work)
            const steps = Math.max(10, Math.min(25, Math.ceil(distance / 20))); // 10-25 steps
            const stepX = deltaX / steps;
            const stepY = deltaY / steps;
            
            console.log(`📏 Movement: ${distance.toFixed(1)}px in ${steps} steps`);
            console.log(`📐 Step size: (${stepX.toFixed(1)}, ${stepY.toFixed(1)}) per step`);
            
            // Get counter before drag
            const counterBefore = await checkCounterValue();
            console.log(`📊 Before drag - Counter: ${counterBefore.current}/${counterBefore.total}`);
            
            // PROVEN REALISTIC DRAG SEQUENCE (this worked before!)
            const dragResult = await scormFrame.evaluate(async (ballId, hotspotId, startX, startY, stepX, stepY, steps, endX, endY) => {
              try {
                console.log(`[BROWSER] Starting DYNAMIC realistic drag simulation`);
                console.log(`[BROWSER] From (${startX.toFixed(1)}, ${startY.toFixed(1)}) to (${endX.toFixed(1)}, ${endY.toFixed(1)})`);
                
                const ball = document.querySelector(`[data-model-id="${ballId}"]`);
                const hotspot = document.querySelector(`[data-model-id="${hotspotId}"]`);
                
                if (!ball) {
                  console.log(`[BROWSER] Ball not found: ${ballId}`);
                  return false;
                }
                
                if (!hotspot) {
                  console.log(`[BROWSER] Hotspot not found: ${hotspotId}`);
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
                ball.style.zIndex = '1501'; 
                
                // Initial mousedown on ball
                createMouseEvent('mousedown', startX, startY, ball);
                
                // Small delay
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // PROVEN SEQUENCE: Gradual movement
                console.log(`[BROWSER] STEP 2: Moving in ${steps} steps`);
                
                for (let i = 1; i <= steps; i++) {
                  const currentX = startX + (stepX * i);
                  const currentY = startY + (stepY * i);
                  
                  // Update ball position using proven transform method
                  const ballOffsetX = currentX - 18; // Ball center offset
                  const ballOffsetY = currentY - 18;
                  
                  ball.style.transform = `matrix(1, 0, 0, 1, ${ballOffsetX}, ${ballOffsetY})`;
                  
                  // Force reflow (proven necessary)
                  ball.offsetHeight;
                  
                  // Trigger mousemove event
                  createMouseEvent('mousemove', currentX, currentY, ball);
                  
                  // Check for hotspot collision during movement
                  const elementAtPoint = document.elementFromPoint(currentX, currentY);
                  if (elementAtPoint) {
                    const hotspotElement = elementAtPoint.closest(`[data-model-id="${hotspotId}"]`) || 
                                        (elementAtPoint.getAttribute('data-model-id') === hotspotId ? elementAtPoint : null);
                    
                    if (hotspotElement) {
                      console.log(`[BROWSER] 🎯 Ball over hotspot at step ${i}! Position: (${currentX.toFixed(1)}, ${currentY.toFixed(1)})`);
                      
                      // Trigger collision events (proven to work)
                      createMouseEvent('mouseenter', currentX, currentY, hotspotElement);
                      createMouseEvent('mouseover', currentX, currentY, hotspotElement);
                      
                      // Additional collision detection triggers
                      if (typeof hotspotElement.onmouseenter === 'function') {
                        hotspotElement.onmouseenter(createMouseEvent('mouseenter', currentX, currentY, hotspotElement));
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
                const finalOffsetX = endX - 18;
                const finalOffsetY = endY - 18;
                ball.style.transform = `matrix(1, 0, 0, 1, ${finalOffsetX}, ${finalOffsetY})`;
                
                // Force reflow
                ball.offsetHeight;
                
                // Final collision check and events
                const finalElementAtPoint = document.elementFromPoint(endX, endY);
                if (finalElementAtPoint) {
                  const finalHotspotElement = finalElementAtPoint.closest(`[data-model-id="${hotspotId}"]`) ||
                                            (finalElementAtPoint.getAttribute('data-model-id') === hotspotId ? finalElementAtPoint : null);
                  
                  if (finalHotspotElement) {
                    console.log(`[BROWSER] 🎯 Final collision detected!`);
                    
                    // Comprehensive event triggering
                    createMouseEvent('mouseenter', endX, endY, finalHotspotElement);
                    createMouseEvent('mouseover', endX, endY, finalHotspotElement);
                    createMouseEvent('click', endX, endY, finalHotspotElement);
                    
                    // Try additional event handlers
                    if (typeof finalHotspotElement.onclick === 'function') {
                      finalHotspotElement.onclick(createMouseEvent('click', endX, endY, finalHotspotElement));
                    }
                  }
                }
                
                // Final mouseup
                createMouseEvent('mouseup', endX, endY, ball);
                
                console.log(`[BROWSER] DYNAMIC drag simulation completed successfully`);
                return true;
                
              } catch (error) {
                console.log(`[BROWSER] DYNAMIC drag simulation error: ${error.message}`);
                return false;
              }
            }, dragElementId, hotspotId, startX, startY, stepX, stepY, steps, endX, endY);
            
            if (!dragResult) {
              console.log(`❌ Dynamic drag simulation failed`);
              return false;
            }
            
            // CRITICAL: Wait for collision detection processing (proven timing)
            console.log(`⏳ Waiting for collision detection...`);
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // Check counter after drag
            const counterAfter = await checkCounterValue();
            console.log(`📊 After drag - Counter: ${counterAfter.current}/${counterAfter.total}`);
            
            const success = counterAfter.current > counterBefore.current;
            
            if (success) {
              console.log(`✅ DYNAMIC DRAG SUCCESS! Counter: ${counterBefore.current} → ${counterAfter.current}`);
            } else {
              console.log(`⚠️ No counter change: ${counterBefore.current} → ${counterAfter.current}`);
            }
            
            return success;
            
          } catch (error) {
            console.error(`❌ Dynamic drag error: ${error.message}`);
            return false;
          }
        };
        
        // === MAIN EXECUTION ===
        console.log('\n=== STARTING DYNAMIC DRAG SEQUENCE ===');
        
        const initialCounter = await checkCounterValue();
        console.log(`📊 Initial counter: ${initialCounter.current}/${initialCounter.total}`);
        
        let successfulInteractions = 0;
        const targetCount = Math.min(hotspotElementIds.length, 10);
        
        // Main interaction loop with dynamic targeting
        for (let i = 0; i < targetCount; i++) {
          const hotspotId = hotspotElementIds[i];
          console.log(`\n--- DYNAMIC DRAG - Hotspot ${i + 1}/${targetCount}: ${hotspotId} ---`);
          
          // Try dynamic realistic drag simulation
          const success = await simulateDynamicDrag(hotspotId);
          
          if (success) {
            successfulInteractions++;
            console.log(`✅ Hotspot ${i + 1} successful! Total: ${successfulInteractions}/${targetCount}`);
          } else {
            console.log(`❌ Hotspot ${i + 1} failed`);
          }
          
          // Wait between interactions
          if (i < targetCount - 1) {
            console.log(`⏳ Waiting before next hotspot...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log(`\n🎯 DYNAMIC sequence completed: ${successfulInteractions}/${targetCount} successful`);
        
        // Final validation
        const finalCounter = await checkCounterValue();
        console.log(`📊 Final counter: ${finalCounter.current}/${finalCounter.total}`);
        
        // Wait and proceed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Click next button
        console.log(`\n🎯 Proceeding to next slide...`);
        
        try {
          const nextButtonExists = await scormFrame.waitForSelector(`[data-model-id="${nextButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (nextButtonExists) {
            await scormFrame.click(`[data-model-id="${nextButtonId}"]`);
            console.log(`✅ Clicked next button ${nextButtonId}`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            console.log(`❌ Next button ${nextButtonId} not found`);
          }
        } catch (error) {
          console.error(`Error clicking next button:`, error.message);
        }
        
        console.log('🎉 DYNAMIC Soventol drag-drop completed!');
        
        // Success criteria
        const progressMade = finalCounter.current > initialCounter.current;
        const minimumSuccess = successfulInteractions >= Math.min(5, Math.floor(targetCount * 0.5));
        const overallSuccess = progressMade && minimumSuccess;
        
        console.log(`📈 Overall success: ${overallSuccess}`);
        console.log(`   - Progress made: ${progressMade} (${initialCounter.current} → ${finalCounter.current})`);
        console.log(`   - Minimum success: ${minimumSuccess} (${successfulInteractions}/${targetCount})`);
        
        return overallSuccess;
        
      } catch (error) {
        console.error('Error in handleSoventolDragDropDynamic:', error.message);
        return false;
      }
    },

    /**
     * Click first Soventol completion screen Weiter button
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickSoventolWeiterButton1: async function(scormFrame, params = {}) {
      try {
        console.log('Clicking first Soventol completion Weiter button...');
        
        // Will be updated with specific button ID when we get to completion screens
        const buttonId = "PLACEHOLDER_BUTTON_ID_1";
        
        // Wait for button to be visible
        const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
          visible: true, 
          timeout: 10000 
        }).then(() => true).catch(() => false);
        
        if (buttonExists) {
          try {
            await scormFrame.click(`[data-model-id="${buttonId}"]`);
            console.log(`✅ Clicked first Weiter button ${buttonId} with frame.click()`);
          } catch (clickError) {
            console.log('Direct click failed, using evaluate method:', clickError.message);
            
            await scormFrame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              if (button) {
                const eventableElement = button.querySelector('svg g.eventable') || button;
                
                if (eventableElement) {
                  const rect = eventableElement.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  const events = [
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                  ];
                  
                  events.forEach(event => eventableElement.dispatchEvent(event));
                  console.log(`[BROWSER] Dispatched events on first Weiter button: ${buttonId}`);
                  return true;
                }
                
                button.click();
                console.log(`[BROWSER] Clicked first Weiter button: ${buttonId}`);
                return true;
              }
              return false;
            }, buttonId);
          }
          
          console.log('✅ First completion Weiter button clicked successfully');
          await sleep(3000);
          return true;
        } else {
          console.log(`❌ First Weiter button ${buttonId} not found`);
          return false;
        }
      } catch (error) {
        console.error('Error clicking first Soventol Weiter button:', error.message);
        return false;
      }
    },

    /**
     * Click second Soventol completion screen Weiter button
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickSoventolWeiterButton2: async function(scormFrame, params = {}) {
      try {
        console.log('Clicking second Soventol completion Weiter button...');
        
        // Will be updated with specific button ID when we get to completion screens
        const buttonId = "PLACEHOLDER_BUTTON_ID_2";
        
        // Wait for button to be visible
        const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
          visible: true, 
          timeout: 10000 
        }).then(() => true).catch(() => false);
        
        if (buttonExists) {
          try {
            await scormFrame.click(`[data-model-id="${buttonId}"]`);
            console.log(`✅ Clicked second Weiter button ${buttonId} with frame.click()`);
          } catch (clickError) {
            console.log('Direct click failed, using evaluate method:', clickError.message);
            
            await scormFrame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              if (button) {
                const eventableElement = button.querySelector('svg g.eventable') || button;
                
                if (eventableElement) {
                  const rect = eventableElement.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  const events = [
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                  ];
                  
                  events.forEach(event => eventableElement.dispatchEvent(event));
                  console.log(`[BROWSER] Dispatched events on second Weiter button: ${buttonId}`);
                  return true;
                }
                
                button.click();
                console.log(`[BROWSER] Clicked second Weiter button: ${buttonId}`);
                return true;
              }
              return false;
            }, buttonId);
          }
          
          console.log('✅ Second completion Weiter button clicked successfully');
          await sleep(3000);
          return true;
        } else {
          console.log(`❌ Second Weiter button ${buttonId} not found`);
          return false;
        }
      } catch (error) {
        console.error('Error clicking second Soventol Weiter button:', error.message);
        return false;
      }
    },

    /**
     * Click final Soventol screen Weiter button
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickSoventolWeiterButton3: async function(scormFrame, params = {}) {
      try {
        console.log('Clicking final Soventol screen Weiter button...');
        
        // Will be updated with specific button ID when we get to completion screens
        const buttonId = "PLACEHOLDER_BUTTON_ID_3";
        
        // Wait for button to be visible
        const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
          visible: true, 
          timeout: 10000 
        }).then(() => true).catch(() => false);
        
        if (buttonExists) {
          try {
            await scormFrame.click(`[data-model-id="${buttonId}"]`);
            console.log(`✅ Clicked final Weiter button ${buttonId} with frame.click()`);
          } catch (clickError) {
            console.log('Direct click failed, using evaluate method:', clickError.message);
            
            await scormFrame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              if (button) {
                const eventableElement = button.querySelector('svg g.eventable') || button;
                
                if (eventableElement) {
                  const rect = eventableElement.getBoundingClientRect();
                  const x = rect.left + rect.width/2;
                  const y = rect.top + rect.height/2;
                  
                  const events = [
                    new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                    new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                  ];
                  
                  events.forEach(event => eventableElement.dispatchEvent(event));
                  console.log(`[BROWSER] Dispatched events on final Weiter button: ${buttonId}`);
                  return true;
                }
                
                button.click();
                console.log(`[BROWSER] Clicked final Weiter button: ${buttonId}`);
                return true;
              }
              return false;
            }, buttonId);
          }
          
          console.log('✅ Final Weiter button clicked successfully');
          await sleep(5000);
          return true;
        } else {
          console.log(`❌ Final Weiter button ${buttonId} not found`);
          return false;
        }
      } catch (error) {
        console.error('Error clicking final Soventol Weiter button:', error.message);
        return false;
      }
    }
  }
};