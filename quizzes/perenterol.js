// quizzes/perenterol.js
/**
 * Perenterol Quiz Definition
 * 
 * This file uses the sequence-based approach to define the Perenterol quiz
 * steps in a declarative, deterministic way. Each step specifies exactly what
 * type of interaction is needed and what action to take.
 */

// Import common utilities
const { sleep } = require('../utils/commonUtils');

module.exports = {
  name: "Perenterol",
  url: "https://academy.medice-health-family.com/paths/66d469ce89ec217f159567f5/home",
  
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
      action: "handlePerenterolDialog",
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
        buttonId: "5wi4qVJtVCO",
        optional: true     // Don't fail if button doesn't exist
      },
      waitAfter: 3000
    },

    // Slide 5: Pharmacy scene - click orange plus button
    {
      type: "PHARMACY_SCENE",
      action: "clickPerenterolPlusButton", // Use custom function
      useScormFrame: true,
      forceExecute: true, // FORCE execution regardless of detection
      params: {
        timeout: 15000,
        delay: 3000,
        buttonId: "5f6qjbORqvb"  // Specific plus button ID for Perenterol
      },
      waitAfter: 5000
    },

    // Slide 6: Message button slide - click message button 5 times
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

    // Slide 7: Click the orange next button after message sequence
    {
      type: "NEXT_BUTTON",
      action: "clickPerenterolNextButton",
      useScormFrame: true,
      forceExecute: true,
      params: {
        timeout: 15000,
        buttonId: "5WP8Lt8v1CQ",  // Specific next button ID for Perenterol
        waitAfter: 5000
      },
      waitAfter: 5000
    },

    // Slide 8: Generic next button state with orange circle + arrow
    {
      type: "GENERIC_NEXT_BUTTON_STATE",
      action: "clickGenericStateButton",
      useScormFrame: true,
      forceExecute: true,
      params: {
        timeout: 15000,
        buttonId: "5YFslzawldA",  // State group button ID
        waitAfter: 5000
      },
      waitAfter: 5000
    },

    // Slide 9: Three memo elements + next button (all on one slide)
    {
      type: "MEMO_ELEMENTS_SLIDE",
      action: "handleMemoElements",
      useScormFrame: true,
      forceExecute: true,
      params: {
        timeout: 15000,
        delayBetweenClicks: 2000,
        waitAfter: 5000
      },
      waitAfter: 5000
    },

    // Slide 10: Carousel navigation slide (MediBee explains bacteria/viruses)
    {
      type: "CAROUSEL_SLIDE",
      action: "handlePerenterolCarousel",
      useScormFrame: true,
      forceExecute: true,
      params: {
        carouselButtonIds: [
          "6hrQzxjPanZ",  // First carousel button (Oval 3)
          "5urR7GfxTj2"   // Second carousel button (Oval 3)
        ],
        nextButtonId: "5WP8Lt8v1CQ",  // Next slide button (Oval 3)
        maxClicks: 2,
        delayBetweenClicks: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 11: Travel infection sources - click 5 plus buttons
    {
      type: "TRAVEL_INFECTION_SOURCES_SLIDE",
      action: "handleTravelInfectionSources",
      useScormFrame: true,
      forceExecute: true,
      params: {
        plusButtonIds: [
          "6gfrOx9fPEC",  // Plus button 1 (ship deck)
          "6RKEZtfwQVh",  // Plus button 2 (restaurant) 
          "699RZ5KTJtJ",  // Plus button 3 (cabin area)
          "6BgSU9521qb",  // Plus button 4 (pool area)
          "6LsFQqgrp95"   // Plus button 5 (dining area)
        ],
        nextButtonId: "5WP8Lt8v1CQ",  // Next slide button
        maxClicks: 5,
        delayBetweenClicks: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 12: Laboratory pathogens - click 6 petri dish elements
    {
      type: "LABORATORY_PATHOGENS_SLIDE",
      action: "handleLaboratoryPathogens",
      useScormFrame: true,
      forceExecute: true,
      params: {
        pathogenElementIds: [
          "5l0PIiD6pL7",  // Icon1.png (E. coli - top left)
          "5u8mohlei5t",  // Icon3.png (top right)
          "5VLk7HbbqPc",  // Petri4.png (bottom left)
          "5VKMJnmD2th",  // Petri5.png (bottom middle)
          "6FKf1UHXA77"   // Petri6.png (bottom right)
          // Note: 6th element may need to be added if missing from provided HTML
        ],
        nextButtonId: "5WP8Lt8v1CQ",  // Next slide button
        maxClicks: 6,
        delayBetweenClicks: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 13: Travel diarrhea regions carousel - navigate through 4 sub-slides
    {
      type: "TRAVEL_DIARRHEA_CAROUSEL_SLIDE",
      action: "handleTravelDiarrheaCarousel",
      useScormFrame: true,
      forceExecute: true,
      params: {
        carouselSequence: [
          {
            name: "World Map",
            buttonId: "69QKRTtJQwt",  // First carousel button
            waitTime: 4000,  // Wait for red spots animation + bee animation
            description: "World map with risk regions and bee animation"
          },
          {
            name: "Grilling Info", 
            buttonId: "6XG7NNIhRak",  // Second carousel button
            waitTime: 3000,  // Wait for slide transition
            description: "BBQ grilling information slide"
          },
          {
            name: "Infection Sources",
            buttonId: "5YJn9kdtNtY",  // Third carousel button  
            waitTime: 3000,  // Wait for slide transition
            description: "Food infection sources slide"
          }
        ],
        finalNextButtonId: "5WP8Lt8v1CQ",  // Final next slide button
        initialAnimationWait: 3000,  // Wait for initial world map animation
        finalSlideWait: 2000,  // Extra wait on final slide before next
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 14: Message button slide (5 clicks) - Second message interaction
    {
      type: "MESSAGE_BUTTON_SLIDE",
      action: "handleMessageButtonSlide",
      useScormFrame: true,
      forceExecute: true,
      params: {
        messageButtonId: "6l65RbsSaM0",  // Message button (state group)
        nextButtonId: "5WP8Lt8v1CQ",    // Next slide button
        requiredClicks: 5,
        delayBetweenClicks: 1500,
        counterSelector: '[data-acc-text="0/5"]',  // Counter element to monitor
        waitAfterComplete: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 15: Bullet point revelation slide (5 points revealed sequentially)
    {
      type: "BULLET_POINT_SLIDE",
      action: "handleBulletPointSlide",
      useScormFrame: true,
      forceExecute: true,
      params: {
        pointButtonId: "5yL9xTjRkYD",   // Next point button (same button clicked 5 times)
        nextButtonId: "5WP8Lt8v1CQ",   // Next slide button
        totalPoints: 5,
        delayBetweenPoints: 2000,       // 2 seconds between each point revelation
        waitAfterComplete: 2000,        // Wait after all points revealed
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 16: Simple timed slide - wait for content/animation then proceed
    {
      type: "SIMPLE_SLIDE",
      action: "handleSimpleSlide", 
      useScormFrame: true,
      forceExecute: true,
      params: {
        nextButtonId: "5WP8Lt8v1CQ",   // Next slide button
        waitBeforeClick: 3000,         // Wait 3 seconds for content/animation
        waitAfterNext: 3000
      },
      waitAfter: 5000
    },

    // Slide 17: Sequential speech bubble interaction - mechanism explanation
    {
      type: "SPEECH_BUBBLE_SEQUENCE",
      action: "handleSpeechBubbleSequence",
      useScormFrame: true,
      forceExecute: true,
      params: {
        startButtonId: "6A46FoOsILy",      // START! button
        speechBubbles: [
          "5qtHQgOWiUA",  // "S. boulardii bildet Polyamine."
          "6RQ4D5Nmp2C",  // "Polyamine unterstützen also..."
          "6loII0PiF0S"   // "Je mehr funktionsfähige Enterozyten..."
        ],
        nextButtonId: "5WP8Lt8v1CQ",       // Next slide button
        delayBetweenBubbles: 1500,         // Wait between each bubble
        waitAfterComplete: 2000,
        waitAfterNext: 3000
      },
      waitAfter: 5000
    }
    
    // TODO: Add remaining slides based on user input
  ],
  
  // Custom functions specific to Perenterol quiz
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
    handlePerenterolDialog: async function(page, params = {}) {
      try {
        console.log('Adaptive dialog handling - checking for Resume button and black screen...');
        
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
        console.error('Error in handlePerenterolDialog:', error.message);
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
        
        const buttonId = params.buttonId || '5wi4qVJtVCO';
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
     * Enhanced SCORM start button click that handles the specific Perenterol button
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    clickScormStartButton: async function(scormFrame, params = {}) {
      try {
        console.log('Clicking SCORM start button for Perenterol...');
        
        const buttonId = params.buttonId || '5wi4qVJtVCO';
        const timeout = params.timeout || 30000;
        
        // Wait for the specific button to appear
        console.log(`Looking for SCORM start button with ID: ${buttonId}`);
        
        const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
          visible: true, 
          timeout: timeout 
        }).then(() => true).catch(() => false);
        
        if (buttonExists) {
          console.log(`SCORM start button found with ID: ${buttonId}, clicking it...`);
          
          // Try multiple click methods for reliability
          try {
            await scormFrame.click(`[data-model-id="${buttonId}"]`);
            console.log('Clicked SCORM start button with frame.click()');
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
                
                console.log(`[BROWSER] Clicked SCORM start button with ID: ${id}`);
                return true;
              }
              return false;
            }, buttonId);
          }
          
          console.log('SCORM start button clicked successfully');
          await sleep(params.waitAfter || 5000);
          return true;
        } else {
          console.log(`SCORM start button with ID ${buttonId} not found, trying fallback methods...`);
          
          // Fallback: look for any start-like buttons
          const fallbackClicked = await scormFrame.evaluate(() => {
            // Look for buttons with "Start" text
            const startButtons = Array.from(document.querySelectorAll('div, button'))
              .filter(el => {
                const text = el.getAttribute('data-acc-text') || el.textContent || '';
                return text.toLowerCase().includes('start');
              });
            
            if (startButtons.length > 0) {
              startButtons[0].click();
              console.log('[BROWSER] Clicked fallback start button');
              return true;
            }
            
            // Look for any clickable SVG elements (common for start buttons)
            const svgElements = document.querySelectorAll('svg');
            if (svgElements.length > 0) {
              svgElements[0].click();
              console.log('[BROWSER] Clicked SVG element as fallback');
              return true;
            }
            
            return false;
          });
          
          if (fallbackClicked) {
            console.log('Fallback start button clicked');
            await sleep(params.waitAfter || 5000);
            return true;
          } else {
            console.log('No start button found with any method');
            return false;
          }
        }
      } catch (error) {
        console.error('Error clicking SCORM start button:', error.message);
        return false;
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
        
        const buttonId = params.buttonId || '5f6qjbORqvb';
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
     * Handle Perenterol carousel navigation (MediBee explains bacteria/viruses slide)
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handlePerenterolCarousel: async function(scormFrame, params = {}) {
      try {
        console.log('Starting Perenterol carousel navigation...');
        
        const carouselButtonIds = params.carouselButtonIds || ["6hrQzxjPanZ", "5urR7GfxTj2"];
        const nextButtonId = params.nextButtonId || "5WP8Lt8v1CQ";
        const maxClicks = params.maxClicks || 2;
        const delayBetweenClicks = params.delayBetweenClicks || 2000;
        
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
        console.error('Error in handlePerenterolCarousel:', error.message);
        return false;
      }
    },

    /**
     * Handle travel infection sources slide - click 5 plus buttons then next
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleTravelInfectionSources: async function(scormFrame, params = {}) {
      try {
        console.log('Starting travel infection sources interaction (5 plus buttons)...');
        
        const plusButtonIds = params.plusButtonIds || [
          "6gfrOx9fPEC", "6RKEZtfwQVh", "699RZ5KTJtJ", "6BgSU9521qb", "6LsFQqgrp95"
        ];
        const nextButtonId = params.nextButtonId || "5WP8Lt8v1CQ";
        const maxClicks = params.maxClicks || 5;
        const delayBetweenClicks = params.delayBetweenClicks || 2000;
        
        // Click each plus button in sequence
        for (let i = 0; i < Math.min(plusButtonIds.length, maxClicks); i++) {
          const buttonId = plusButtonIds[i];
          console.log(`Clicking infection source plus button ${i + 1}/${maxClicks}: ${buttonId}`);
          
          try {
            // Wait for button to be visible and ready
            const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${buttonId}"]`, { 
              visible: true, 
              timeout: 10000 
            }).then(() => true).catch(() => false);
            
            if (buttonExists) {
              // Try multiple click methods for reliability
              try {
                await scormFrame.click(`[data-model-id="${buttonId}"]`);
                console.log(`Clicked plus button ${buttonId} with frame.click()`);
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
                      console.log(`[BROWSER] Dispatched full event sequence on plus button: ${id}`);
                      return true;
                    }
                    
                    // Fallback to regular click
                    button.click();
                    console.log(`[BROWSER] Clicked plus button: ${id}`);
                    return true;
                  }
                  return false;
                }, buttonId);
              }
              
              console.log(`Successfully clicked plus button: ${buttonId}`);
              
              // Wait between clicks to allow any animations/popups to show
              await sleep(delayBetweenClicks);
              
              // Check if there's a popup/dialog that needs to be closed
              const hasPopup = await scormFrame.evaluate(() => {
                // Look for common popup/modal elements that might appear
                const popupElements = document.querySelectorAll('[data-model-id*="popup"], [data-model-id*="modal"], [data-model-id*="dialog"], .popup, .modal, .dialog');
                return popupElements.length > 0;
              }).catch(() => false);
              
              if (hasPopup) {
                console.log('Popup detected after plus button click, attempting to close...');
                
                // Try to close popup by clicking outside or finding close button
                await scormFrame.evaluate(() => {
                  // Look for close buttons
                  const closeButtons = document.querySelectorAll('[data-acc-text*="close"], [data-acc-text*="Close"], [aria-label*="close"], [aria-label*="Close"]');
                  if (closeButtons.length > 0) {
                    closeButtons[0].click();
                    console.log('[BROWSER] Clicked close button on popup');
                    return;
                  }
                  
                  // Try clicking outside the popup area (center of screen)
                  const centerX = window.innerWidth / 2;
                  const centerY = window.innerHeight / 2;
                  
                  const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: centerX,
                    clientY: centerY
                  });
                  
                  document.body.dispatchEvent(clickEvent);
                  console.log('[BROWSER] Clicked outside popup to close it');
                }).catch(() => {
                  console.log('Could not close popup, continuing...');
                });
                
                await sleep(1000); // Brief pause after closing popup
              }
            } else {
              console.log(`Plus button ${buttonId} not found`);
            }
          } catch (error) {
            console.error(`Error clicking plus button ${buttonId}:`, error.message);
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
        console.error('Error in handleTravelInfectionSources:', error.message);
        return false;
      }
    },

    /**
     * Handle laboratory pathogens slide - click 6 petri dish elements then next
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleLaboratoryPathogens: async function(scormFrame, params = {}) {
      try {
        console.log('Starting laboratory pathogens interaction (6 petri dish elements)...');
        
        const pathogenElementIds = params.pathogenElementIds || [
          "5l0PIiD6pL7", "5u8mohlei5t", "5VLk7HbbqPc", "5VKMJnmD2th", "6FKf1UHXA77"
        ];
        const nextButtonId = params.nextButtonId || "5WP8Lt8v1CQ";
        const maxClicks = params.maxClicks || 6;
        const delayBetweenClicks = params.delayBetweenClicks || 2000;
        
        // First, try to find any additional elements that might be missing from the provided list
        console.log('Scanning for additional pathogen elements...');
        const additionalElements = await scormFrame.evaluate(() => {
          // Look for elements with similar patterns that might be petri dishes
          const allElements = document.querySelectorAll('[data-model-id]');
          const pathogenElements = [];
          
          allElements.forEach(element => {
            const modelId = element.getAttribute('data-model-id');
            const accText = element.getAttribute('data-acc-text') || '';
            
            // Look for elements that might be petri dishes or icons
            if (accText.toLowerCase().includes('petri') || 
                accText.toLowerCase().includes('icon') ||
                accText.toLowerCase().includes('.png')) {
              
              // Check if it has cursor-hover class (indicates it's clickable)
              if (element.classList.contains('cursor-hover')) {
                pathogenElements.push({
                  id: modelId,
                  accText: accText,
                  visible: element.style.opacity !== '0' && !element.classList.contains('hidden')
                });
              }
            }
          });
          
          return pathogenElements;
        }).catch(() => []);
        
        // Merge found elements with provided list
        const allPathogenIds = [...pathogenElementIds];
        additionalElements.forEach(elem => {
          if (elem.visible && !allPathogenIds.includes(elem.id)) {
            console.log(`Found additional pathogen element: ${elem.id} (${elem.accText})`);
            allPathogenIds.push(elem.id);
          }
        });
        
        console.log(`Total pathogen elements to click: ${Math.min(allPathogenIds.length, maxClicks)}`);
        
        // Click each pathogen element in sequence
        for (let i = 0; i < Math.min(allPathogenIds.length, maxClicks); i++) {
          const elementId = allPathogenIds[i];
          console.log(`Clicking pathogen element ${i + 1}/${maxClicks}: ${elementId}`);
          
          try {
            // Wait for element to be visible and ready
            const elementExists = await scormFrame.waitForSelector(`[data-model-id="${elementId}"]`, { 
              visible: true, 
              timeout: 10000 
            }).then(() => true).catch(() => false);
            
            if (elementExists) {
              // Try multiple click methods for reliability
              try {
                await scormFrame.click(`[data-model-id="${elementId}"]`);
                console.log(`Clicked pathogen element ${elementId} with frame.click()`);
              } catch (clickError) {
                console.log('Direct click failed, using evaluate method:', clickError.message);
                
                // Fallback to evaluate method with SVG/image event handling
                await scormFrame.evaluate((id) => {
                  const element = document.querySelector(`[data-model-id="${id}"]`);
                  if (element) {
                    // For image elements, try clicking the eventable group or the image itself
                    const eventableElement = element.querySelector('svg g.eventable') || 
                                           element.querySelector('image') ||
                                           element;
                    
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
                      console.log(`[BROWSER] Dispatched full event sequence on pathogen element: ${id}`);
                      return true;
                    }
                    
                    // Fallback to regular click
                    element.click();
                    console.log(`[BROWSER] Clicked pathogen element: ${id}`);
                    return true;
                  }
                  return false;
                }, elementId);
              }
              
              console.log(`Successfully clicked pathogen element: ${elementId}`);
              
              // Wait between clicks to allow any animations/popups to show
              await sleep(delayBetweenClicks);
              
              // Check if there's a popup/dialog that needs to be closed
              const hasPopup = await scormFrame.evaluate(() => {
                // Look for common popup/modal elements that might appear
                const popupElements = document.querySelectorAll('[data-model-id*="popup"], [data-model-id*="modal"], [data-model-id*="dialog"], .popup, .modal, .dialog');
                return popupElements.length > 0;
              }).catch(() => false);
              
              if (hasPopup) {
                console.log('Popup detected after pathogen element click, attempting to close...');
                
                // Try to close popup by clicking outside or finding close button
                await scormFrame.evaluate(() => {
                  // Look for close buttons
                  const closeButtons = document.querySelectorAll('[data-acc-text*="close"], [data-acc-text*="Close"], [aria-label*="close"], [aria-label*="Close"]');
                  if (closeButtons.length > 0) {
                    closeButtons[0].click();
                    console.log('[BROWSER] Clicked close button on popup');
                    return;
                  }
                  
                  // Try clicking outside the popup area (center of screen)
                  const centerX = window.innerWidth / 2;
                  const centerY = window.innerHeight / 2;
                  
                  const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: centerX,
                    clientY: centerY
                  });
                  
                  document.body.dispatchEvent(clickEvent);
                  console.log('[BROWSER] Clicked outside popup to close it');
                }).catch(() => {
                  console.log('Could not close popup, continuing...');
                });
                
                await sleep(1000); // Brief pause after closing popup
              }
            } else {
              console.log(`Pathogen element ${elementId} not found`);
            }
          } catch (error) {
            console.error(`Error clicking pathogen element ${elementId}:`, error.message);
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
        console.error('Error in handleLaboratoryPathogens:', error.message);
        return false;
      }
    },

    /**
     * Handle travel diarrhea carousel slide - navigate through 4 sub-slides
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleTravelDiarrheaCarousel: async function(scormFrame, params = {}) {
      try {
        console.log('Starting travel diarrhea carousel navigation...');
        
        const carouselSequence = params.carouselSequence || [];
        const finalNextButtonId = params.finalNextButtonId || "5WP8Lt8v1CQ";
        const initialAnimationWait = params.initialAnimationWait || 3000;
        const finalSlideWait = params.finalSlideWait || 2000;
        
        // Wait for initial world map animation to complete
        console.log(`Waiting ${initialAnimationWait}ms for world map red spots animation...`);
        await sleep(initialAnimationWait);
        
        // Navigate through each carousel sub-slide
        for (let i = 0; i < carouselSequence.length; i++) {
          const carouselStep = carouselSequence[i];
          const stepNumber = i + 1;
          const totalSteps = carouselSequence.length;
          
          console.log(`\n=== Carousel Step ${stepNumber}/${totalSteps}: ${carouselStep.name} ===`);
          console.log(`Clicking carousel button: ${carouselStep.buttonId}`);
          
          try {
            // Wait for carousel button to be visible and ready
            const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${carouselStep.buttonId}"]`, { 
              visible: true, 
              timeout: 10000 
            }).then(() => true).catch(() => false);
            
            if (buttonExists) {
              // Check if button is actually clickable (not hidden/disabled)
              const isClickable = await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (!button) return false;
                
                const style = window.getComputedStyle(button);
                const rect = button.getBoundingClientRect();
                
                return style.opacity !== '0' && 
                       style.visibility !== 'hidden' && 
                       style.display !== 'none' &&
                       rect.width > 0 && rect.height > 0;
              }, carouselStep.buttonId);
              
              if (isClickable) {
                // Try multiple click methods for carousel navigation
                try {
                  await scormFrame.click(`[data-model-id="${carouselStep.buttonId}"]`);
                  console.log(`✅ Clicked carousel button ${carouselStep.buttonId} with frame.click()`);
                } catch (clickError) {
                  console.log('Direct click failed, using evaluate method:', clickError.message);
                  
                  // Fallback to evaluate method with comprehensive event handling
                  await scormFrame.evaluate((buttonId) => {
                    const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                    if (button) {
                      // For carousel buttons, focus on the SVG eventable group
                      const eventableElement = button.querySelector('svg g.eventable') || 
                                             button.querySelector('svg') ||
                                             button;
                      
                      if (eventableElement) {
                        // Create complete interaction sequence for carousel navigation
                        const rect = eventableElement.getBoundingClientRect();
                        const x = rect.left + rect.width/2;
                        const y = rect.top + rect.height/2;
                        
                        const events = [
                          new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                          new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                          new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                          new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                          new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                          new MouseEvent('mouseleave', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                        ];
                        
                        // Dispatch events with small delays for natural interaction
                        events.forEach((event, index) => {
                          setTimeout(() => eventableElement.dispatchEvent(event), index * 50);
                        });
                        
                        console.log(`[BROWSER] Dispatched carousel navigation events on: ${buttonId}`);
                        return true;
                      }
                      
                      // Final fallback
                      button.click();
                      console.log(`[BROWSER] Fallback clicked carousel button: ${buttonId}`);
                      return true;
                    }
                    return false;
                  }, carouselStep.buttonId);
                  
                  console.log(`✅ Clicked carousel button ${carouselStep.buttonId} with evaluate method`);
                }
                
                // Wait for the animation/transition to complete before next step
                console.log(`⏳ Waiting ${carouselStep.waitTime}ms for ${carouselStep.description} animation...`);
                await sleep(carouselStep.waitTime);
                
                // Verify the carousel step was successful by checking for content changes
                const stepSuccess = await scormFrame.evaluate((stepName) => {
                  // Look for slide content or animation changes that indicate progression
                  const slideContent = document.querySelector('.slide-object, [data-dv_comp]');
                  return slideContent !== null; // Basic verification that slide is active
                }, carouselStep.name).catch(() => true);
                
                if (stepSuccess) {
                  console.log(`✅ Carousel step ${stepNumber} (${carouselStep.name}) completed successfully`);
                } else {
                  console.log(`⚠️ Carousel step ${stepNumber} may not have completed properly, continuing...`);
                }
              } else {
                console.log(`⚠️ Carousel button ${carouselStep.buttonId} not clickable, skipping...`);
              }
            } else {
              console.log(`❌ Carousel button ${carouselStep.buttonId} not found`);
            }
          } catch (error) {
            console.error(`Error in carousel step ${stepNumber} (${carouselStep.name}):`, error.message);
            console.log('Continuing to next step...');
          }
        }
        
        // Wait a bit on the final slide before clicking next
        console.log(`\n⏳ Waiting ${finalSlideWait}ms on final carousel slide...`);
        await sleep(finalSlideWait);
        
        // Now click the final next slide button to proceed to the next slide
        console.log(`\n🎯 Clicking final next slide button: ${finalNextButtonId}`);
        
        try {
          const nextButtonExists = await scormFrame.waitForSelector(`[data-model-id="${finalNextButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (nextButtonExists) {
            try {
              await scormFrame.click(`[data-model-id="${finalNextButtonId}"]`);
              console.log(`✅ Clicked final next button ${finalNextButtonId} with frame.click()`);
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
                    console.log(`[BROWSER] Dispatched events on final next button: ${buttonId}`);
                    return true;
                  }
                  
                  button.click();
                  console.log(`[BROWSER] Clicked final next button: ${buttonId}`);
                  return true;
                }
                return false;
              }, finalNextButtonId);
            }
            
            console.log(`✅ Successfully clicked final next slide button: ${finalNextButtonId}`);
            await sleep(params.waitAfterNext || 3000);
          } else {
            console.log(`❌ Final next button ${finalNextButtonId} not found`);
          }
        } catch (error) {
          console.error(`Error clicking final next button ${finalNextButtonId}:`, error.message);
        }
        
        console.log('🎉 Travel diarrhea carousel navigation completed!');
        return true;
      } catch (error) {
        console.error('Error in handleTravelDiarrheaCarousel:', error.message);
        return false;
      }
    },

    /**
     * Handle bullet point revelation slide - click same button 5 times to reveal points
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleBulletPointSlide: async function(scormFrame, params = {}) {
      try {
        console.log('Starting bullet point revelation slide...');
        
        const pointButtonId = params.pointButtonId || "5yL9xTjRkYD";
        const nextButtonId = params.nextButtonId || "5WP8Lt8v1CQ";
        const totalPoints = params.totalPoints || 5;
        const delayBetweenPoints = params.delayBetweenPoints || 2000;
        const waitAfterComplete = params.waitAfterComplete || 2000;
        
        console.log(`Will reveal ${totalPoints} bullet points by clicking button: ${pointButtonId}`);
        
        // Click the point button multiple times to reveal bullet points
        for (let i = 1; i <= totalPoints; i++) {
          console.log(`\n=== Revealing Point ${i}/${totalPoints} ===`);
          
          try {
            // Wait for point button to be visible and ready
            const buttonExists = await scormFrame.waitForSelector(`[data-model-id="${pointButtonId}"]`, { 
              visible: true, 
              timeout: 10000 
            }).then(() => true).catch(() => false);
            
            if (buttonExists) {
              // Check if button is clickable
              const isClickable = await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (!button) return false;
                
                const style = window.getComputedStyle(button);
                const rect = button.getBoundingClientRect();
                
                return style.opacity !== '0' && 
                       style.visibility !== 'hidden' && 
                       style.display !== 'none' &&
                       rect.width > 0 && rect.height > 0;
              }, pointButtonId);
              
              if (isClickable) {
                console.log(`🎯 Clicking point button ${pointButtonId} (click ${i}/${totalPoints})`);
                
                // Try multiple click methods for point revelation
                try {
                  await scormFrame.click(`[data-model-id="${pointButtonId}"]`);
                  console.log(`✅ Point ${i} revealed with frame.click()`);
                } catch (clickError) {
                  console.log('Direct click failed, using evaluate method:', clickError.message);
                  
                  // Fallback to evaluate method with comprehensive event handling
                  await scormFrame.evaluate((buttonId) => {
                    const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                    if (button) {
                      // For point buttons, focus on the SVG eventable group
                      const eventableElement = button.querySelector('svg g.eventable') || 
                                             button.querySelector('svg') ||
                                             button;
                      
                      if (eventableElement) {
                        // Create complete interaction sequence for point revelation
                        const rect = eventableElement.getBoundingClientRect();
                        const x = rect.left + rect.width/2;
                        const y = rect.top + rect.height/2;
                        
                        const events = [
                          new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                          new MouseEvent('mouseenter', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                          new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                          new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                          new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                        ];
                        
                        // Dispatch events with small delays
                        events.forEach((event, index) => {
                          setTimeout(() => eventableElement.dispatchEvent(event), index * 50);
                        });
                        
                        console.log(`[BROWSER] Dispatched point revelation events on: ${buttonId}`);
                        return true;
                      }
                      
                      // Final fallback
                      button.click();
                      console.log(`[BROWSER] Fallback clicked point button: ${buttonId}`);
                      return true;
                    }
                    return false;
                  }, pointButtonId);
                  
                  console.log(`✅ Point ${i} revealed with evaluate method`);
                }
                
                // Wait between point revelations (except after the last point)
                if (i < totalPoints) {
                  console.log(`⏳ Waiting ${delayBetweenPoints}ms before revealing next point...`);
                  await sleep(delayBetweenPoints);
                }
                
                // Verify the point was revealed by checking for content changes
                const pointRevealed = await scormFrame.evaluate((pointNumber) => {
                  // Look for bullet point content or text changes
                  const bulletPoints = document.querySelectorAll('li, .bullet-point, [class*="bullet"], [class*="point"]');
                  return bulletPoints.length >= pointNumber; // Basic verification
                }, i).catch(() => true);
                
                if (pointRevealed) {
                  console.log(`✅ Point ${i} successfully revealed`);
                } else {
                  console.log(`⚠️ Point ${i} may not have revealed properly, continuing...`);
                }
              } else {
                console.log(`⚠️ Point button ${pointButtonId} not clickable for point ${i}`);
              }
            } else {
              console.log(`❌ Point button ${pointButtonId} not found for point ${i}`);
            }
          } catch (error) {
            console.error(`Error revealing point ${i}:`, error.message);
            console.log('Continuing to next point...');
          }
        }
        
        // Wait after all points are revealed
        console.log(`\n⏳ All ${totalPoints} points revealed! Waiting ${waitAfterComplete}ms before next slide...`);
        await sleep(waitAfterComplete);
        
        // Now click the next slide button
        console.log(`\n🎯 Clicking next slide button: ${nextButtonId}`);
        
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
        
        console.log('🎉 Bullet point revelation slide completed!');
        return true;
      } catch (error) {
        console.error('Error in handleBulletPointSlide:', error.message);
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
     * Handle sequential speech bubble interaction - START button then click bubbles in sequence
     * @param {Object} scormFrame - Puppeteer frame
     * @param {Object} params - Additional parameters
     * @returns {Promise<boolean>} - Success status
     */
    handleSpeechBubbleSequence: async function(scormFrame, params = {}) {
      try {
        console.log('Starting sequential speech bubble interaction...');
        
        const startButtonId = params.startButtonId || "6A46FoOsILy";
        const speechBubbles = params.speechBubbles || [];
        const nextButtonId = params.nextButtonId || "5WP8Lt8v1CQ";
        const delayBetweenBubbles = params.delayBetweenBubbles || 1500;
        
        console.log(`Will click START button: ${startButtonId}`);
        console.log(`Then interact with ${speechBubbles.length} speech bubbles: ${speechBubbles.join(', ')}`);
        
        // Step 1: Click the START button
        console.log('\n=== STEP 1: Click START Button ===');
        
        try {
          const startButtonExists = await scormFrame.waitForSelector(`[data-model-id="${startButtonId}"]`, { 
            visible: true, 
            timeout: 10000 
          }).then(() => true).catch(() => false);
          
          if (startButtonExists) {
            const isClickable = await scormFrame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              if (!button) return false;
              
              const style = window.getComputedStyle(button);
              const rect = button.getBoundingClientRect();
              
              return style.opacity !== '0' && 
                     style.visibility !== 'hidden' && 
                     style.display !== 'none' &&
                     rect.width > 0 && rect.height > 0;
            }, startButtonId);
            
            if (isClickable) {
              console.log(`🎯 Clicking START button: ${startButtonId}`);
              
              try {
                await scormFrame.click(`[data-model-id="${startButtonId}"]`);
                console.log(`✅ START button clicked with frame.click()`);
              } catch (clickError) {
                console.log('Direct START click failed, using evaluate method:', clickError.message);
                
                await scormFrame.evaluate((buttonId) => {
                  const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                  if (button) {
                    const eventableElement = button.querySelector('svg g.eventable') || 
                                           button.querySelector('svg') ||
                                           button;
                    
                    if (eventableElement) {
                      const rect = eventableElement.getBoundingClientRect();
                      const x = rect.left + rect.width/2;
                      const y = rect.top + rect.height/2;
                      
                      const events = [
                        new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                        new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                        new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                        new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                      ];
                      
                      events.forEach((event, index) => {
                        setTimeout(() => eventableElement.dispatchEvent(event), index * 50);
                      });
                      
                      console.log(`[BROWSER] Dispatched START button events on: ${buttonId}`);
                      return true;
                    }
                    
                    button.click();
                    console.log(`[BROWSER] Fallback clicked START button: ${buttonId}`);
                    return true;
                  }
                  return false;
                }, startButtonId);
              }
              
              console.log('✅ START button clicked successfully!');
              await sleep(delayBetweenBubbles);
              
            } else {
              console.log(`⚠️ START button ${startButtonId} not clickable`);
            }
          } else {
            console.log(`❌ START button ${startButtonId} not found`);
          }
        } catch (error) {
          console.error(`Error clicking START button ${startButtonId}:`, error.message);
        }
        
        // Step 2: Click each speech bubble in sequence
        console.log('\n=== STEP 2: Click Speech Bubbles in Sequence ===');
        
        for (let i = 0; i < speechBubbles.length; i++) {
          const bubbleId = speechBubbles[i];
          console.log(`\n--- Speech Bubble ${i + 1}/${speechBubbles.length}: ${bubbleId} ---`);
          
          try {
            // Wait for speech bubble to appear
            const bubbleExists = await scormFrame.waitForSelector(`[data-model-id="${bubbleId}"]`, { 
              visible: true, 
              timeout: 8000 
            }).then(() => true).catch(() => false);
            
            if (bubbleExists) {
              const isClickable = await scormFrame.evaluate((buttonId) => {
                const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                if (!button) return false;
                
                const style = window.getComputedStyle(button);
                const rect = button.getBoundingClientRect();
                
                return style.opacity !== '0' && 
                       style.visibility !== 'hidden' && 
                       style.display !== 'none' &&
                       rect.width > 0 && rect.height > 0;
              }, bubbleId);
              
              if (isClickable) {
                console.log(`🎯 Clicking speech bubble: ${bubbleId}`);
                
                try {
                  await scormFrame.click(`[data-model-id="${bubbleId}"]`);
                  console.log(`✅ Speech bubble clicked with frame.click()`);
                } catch (clickError) {
                  console.log('Direct bubble click failed, using evaluate method:', clickError.message);
                  
                  await scormFrame.evaluate((buttonId) => {
                    const button = document.querySelector(`[data-model-id="${buttonId}"]`);
                    if (button) {
                      const eventableElement = button.querySelector('svg g.eventable') || 
                                             button.querySelector('svg') ||
                                             button;
                      
                      if (eventableElement) {
                        const rect = eventableElement.getBoundingClientRect();
                        const x = rect.left + rect.width/2;
                        const y = rect.top + rect.height/2;
                        
                        const events = [
                          new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                          new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                          new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0}),
                          new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0})
                        ];
                        
                        events.forEach((event, index) => {
                          setTimeout(() => eventableElement.dispatchEvent(event), index * 50);
                        });
                        
                        console.log(`[BROWSER] Dispatched speech bubble events on: ${buttonId}`);
                        return true;
                      }
                      
                      button.click();
                      console.log(`[BROWSER] Fallback clicked speech bubble: ${buttonId}`);
                      return true;
                    }
                    return false;
                  }, bubbleId);
                }
                
                console.log(`✅ Speech bubble ${i + 1} clicked successfully!`);
                
                // Wait between bubbles (except after the last one)
                if (i < speechBubbles.length - 1) {
                  console.log(`⏳ Waiting ${delayBetweenBubbles}ms before next bubble...`);
                  await sleep(delayBetweenBubbles);
                }
                
              } else {
                console.log(`⚠️ Speech bubble ${bubbleId} not clickable`);
              }
            } else {
              console.log(`❌ Speech bubble ${bubbleId} not found`);
            }
          } catch (error) {
            console.error(`Error with speech bubble ${bubbleId}:`, error.message);
            console.log('Continuing to next bubble...');
          }
        }
        
        // Step 3: Wait and click next slide button
        console.log('\n=== STEP 3: Proceed to Next Slide ===');
        console.log(`⏳ Waiting ${params.waitAfterComplete || 2000}ms after all bubbles...`);
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
        
        console.log('🎉 Sequential speech bubble interaction completed!');
        return true;
      } catch (error) {
        console.error('Error in handleSpeechBubbleSequence:', error.message);
        return false;
      }
    }
  }
};