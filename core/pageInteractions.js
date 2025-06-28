// core/pageInteractions.js
const { sleep } = require('../utils/commonUtils');

/**
 * Collection of standard page interaction functions
 * These functions handle common interactions across all quizzes
 */

/**
 * Click the start button to begin a quiz
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function clickStartButton(frame, params = {}) {
  const selector = params.selector || 'button[data-test="path-start-button"]';
  console.log(`Clicking start button with selector: ${selector}`);
  
  await frame.waitForSelector(selector, { 
    visible: true, 
    timeout: params.timeout || 15000 
  });
  
  await frame.click(selector);
  console.log('Clicked the "Starten" button');
  await sleep(params.delay || 3000);
}

/**
 * Click the next button
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function clickNextButton(frame, params = {}) {
  const selectors = params.selectors || [
    'button[class*="high-impact"]',
    // Additional fallback selectors for next buttons
    '[data-model-id="5fJnOnqo2Mn"]',
    '[data-model-id="6SnZaWfxQZH"]',
    '[data-model-id="6p3OI0ZXRkJ"]',
    '[data-model-id="6bfu7dbXM45"]'
  ];
  
  // Try each selector in order
  for (const selector of selectors) {
    try {
      const exists = await frame.waitForSelector(selector, { 
        visible: true, 
        timeout: 5000 
      }).then(() => true).catch(() => false);
      
      if (exists) {
        console.log(`Clicking next button with selector: ${selector}`);
        await frame.click(selector);
        return true;
      }
    } catch (error) {
      console.log(`Failed to click next button with selector ${selector}: ${error.message}`);
      // Continue trying other selectors
    }
  }
  
  // Last resort: click in the bottom right corner where next buttons typically are
  console.log('Trying fallback: clicking bottom right corner');
  
  await frame.evaluate(() => {
    const rightSide = window.innerWidth - 50;
    const bottomSide = window.innerHeight - 50;
    const elementAtPoint = document.elementFromPoint(rightSide, bottomSide);
    if (elementAtPoint) {
      elementAtPoint.click();
      return true;
    }
    return false;
  });
  
  console.log('Clicked bottom right area as fallback for next button');
  await sleep(params.delay || 2000);
  return true;
}

/**
 * Press space key (commonly used to dismiss dialogs)
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function pressSpaceKey(frame, params = {}) {
    console.log('Pressing the Space key...');
    
    // Try multiple space key presses with verification
    const maxAttempts = params.maxAttempts || 3;
    let success = false;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Space key attempt ${attempt}/${maxAttempts}`);
      
      // Press space key
      await frame.keyboard.press('Space');
      console.log('Pressed the Space key');
      
      // Wait longer than the default time
      await sleep(params.delay || 3000);
      
      // Check if space key had an effect by looking for frame changes
      // or content changes if we can identify specific elements
      try {
        // Check for SCORM frame as an indicator of success
        const frames = frame.frames ? frame.frames() : frame.mainFrame?.frames();
        const scormFrameExists = frames && frames.some(f => f.url().includes('/index_lms.html'));
        
        if (scormFrameExists) {
          console.log('Space key press successful - SCORM frame detected');
          success = true;
          break;
        }
        
        // If on black screen, check if URL changed from about:blank
        const currentUrl = await frame.url();
        if (currentUrl !== 'about:blank' && !currentUrl.includes('blank')) {
          console.log(`Space key press changed URL to: ${currentUrl}`);
          success = true;
          break;
        }
        
        // If this is the last attempt, try one more time with longer wait
        if (attempt === maxAttempts) {
          console.log('Last attempt: trying with longer wait time...');
          await frame.keyboard.press('Space');
          await sleep(6000); // Longer wait on final attempt
        }
      } catch (error) {
        console.log(`Error checking space key effect: ${error.message}`);
      }
    }
    
    console.log(`Space key press ${success ? 'appears successful' : 'may not have worked'}`);
    
    // Return success status
    return success;
}

/**
 * Handle generic next button state - wait for orange button and click it
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function handleGenericNextButtonState(frame, params = {}) {
    try {
      console.log('Handling generic next button state...');
      
      // Wait for any initial animations/transitions
      console.log('Waiting for button to become active (orange)...');
      await sleep(params.initialDelay || 3000);
      
      // Wait for the button to turn orange with a polling approach
      let nextButtonActive = false;
      const maxWaitTime = params.maxWaitTime || 15000; // 15 seconds max wait
      const startTime = Date.now();
      
      while (!nextButtonActive && (Date.now() - startTime < maxWaitTime)) {
        // Check if the orange next button exists and is visible
        nextButtonActive = await frame.evaluate(() => {
          const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
          if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
            return false;
          }
          
          // Check if it has the orange stroke (active state)
          const path = orangeButton.querySelector('svg path');
          if (!path) return false;
          
          const strokeColor = path.getAttribute('stroke');
          return strokeColor === '#FF9800'; // Orange stroke color
        });
        
        if (nextButtonActive) {
          console.log('Orange next button is now active');
          break;
        }
        
        console.log('Waiting for next button to become active...');
        await sleep(1000); // Check every second
      }
      
      // Try clicking the orange next button (now that it's active)
      console.log('Attempting to click orange next button...');
      await sleep(500); // Small delay before clicking
      
      // Try the direct methods first before using the comprehensive clickOrangeNextButton
      let clicked = false;
      
      // First try: click directly on the known ID
      try {
        const buttonExists = await frame.evaluate(() => {
          const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
          return orangeButton && window.getComputedStyle(orangeButton).display !== 'none';
        });
        
        if (buttonExists) {
          await frame.click('[data-model-id="5fQkkvFT1Hs"]');
          console.log('Clicked orange next button directly with ID 5fQkkvFT1Hs');
          clicked = true;
        }
      } catch (error) {
        console.log(`Direct orange button click failed: ${error.message}`);
      }
      
      // Second try: bottom right click
      if (!clicked) {
        try {
          // Click in bottom right using JavaScript evaluation
          clicked = await frame.evaluate(() => {
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
          
          if (clicked) {
            console.log('Clicked bottom right corner with JavaScript');
          }
        } catch (error) {
          console.log(`Bottom right corner click failed: ${error.message}`);
        }
      }
      
      // Third try: Use the comprehensive approach as a fallback
      if (!clicked) {
        try {
          clicked = await clickOrangeNextButton(frame);
        } catch (error) {
          console.log(`Comprehensive orange button click failed: ${error.message}`);
        }
      }
      
      // Wait after clicking to ensure transition completes
      console.log('Waiting for transition after clicking next button...');
      await sleep(params.waitAfter || 3000);
      
      return true;
    } catch (error) {
      console.error('Error in generic next button state handler:', error.message);
      
      // Even if there's an error, try to proceed
      try {
        await clickNextButton(frame);
      } catch (e) {
        console.log('Error clicking next button after generic state handler error:', e.message);
      }
      
      return false;
    }
}

/**
 * Handle percentage drag and drop interaction
 * @param {Object} frame - Puppeteer frame or page
 * @param {Object} params - Additional parameters
 */
async function handlePercentageDragAndDrop(frame, params = {}) {
    try {
        console.log('Starting percentage drag and drop interaction...');
        
        // Wait for the slide content to fully load
        await sleep(params.initialDelay || 3000);
        
        // Define our drag-drop pairs with the CORRECT mappings based on screenshot
        const dragDropPairs = [
            {
                sourceID: '65H2YP6zQYj', // 50-80%
                targetID: '5WjuStY9TX7', // Virus container
                description: "50-80% to Virus"
            },
            {
                sourceID: '5kZ1pClIPrb', // 20-30%
                targetID: '6DcWd8zvKfc', // Bacteria container
                description: "20-30% to Bacteria"
            }
        ];
        
        // Execute each drag and drop operation
        for (let i = 0; i < dragDropPairs.length; i++) {
            const { sourceID, targetID, description } = dragDropPairs[i];
            const sourceSelector = `div[data-model-id="${sourceID}"]`;
            const targetSelector = `div[data-model-id="${targetID}"]`;
            
            console.log(`Drag operation ${i+1}: ${description}`);
            console.log(`- Source: ${sourceSelector}`);
            console.log(`- Target: ${targetSelector}`);
            
            try {
                // First check if elements exist and are visible
                const elementsVisible = await frame.evaluate(
                    (source, target) => {
                        const sourceEl = document.querySelector(source);
                        const targetEl = document.querySelector(target);
                        
                        return {
                            sourceVisible: sourceEl && window.getComputedStyle(sourceEl).display !== 'none',
                            targetVisible: targetEl && window.getComputedStyle(targetEl).display !== 'none',
                            sourceRect: sourceEl?.getBoundingClientRect(),
                            targetRect: targetEl?.getBoundingClientRect()
                        };
                    },
                    sourceSelector,
                    targetSelector
                );
                
                console.log('Element visibility check:', 
                    `Source: ${elementsVisible.sourceVisible}`,
                    `Target: ${elementsVisible.targetVisible}`,
                    `Source position:`, elementsVisible.sourceRect,
                    `Target position:`, elementsVisible.targetRect
                );
                
                if (elementsVisible.sourceVisible && elementsVisible.targetVisible) {
                    await dragAndDropElement(
                        frame.page(),
                        frame,
                        sourceSelector,
                        targetSelector
                    );
                    console.log(`Successfully performed drag operation: ${description}`);
                } else {
                    console.log('Some elements not visible, cannot perform drag');
                }
            } catch (error) {
                console.error(`Error with drag-drop for ${description}:`, error.message);
            }
            
            await sleep(params.delayBetweenDrags || 2000);
        }
        
        // Click the submit button
        try {
            console.log('Looking for Absenden button...');
            
            // Try multiple selectors for the Absenden button
            const buttonSelectors = [
                'div[data-acc-text="Absenden"]',
                'div[data-model-id="6DLw0UoWTnG"]', // Common ID for Absenden button
                'div.slide-object-button.shown', // Generic button class
                'div[role="button"]' // Accessibility role
            ];
            
            let absendenClicked = false;
            for (const selector of buttonSelectors) {
                const buttonExists = await frame.evaluate(
                    selector => !!document.querySelector(selector),
                    selector
                );
                
                if (buttonExists) {
                    console.log(`Found Absenden button with selector: ${selector}`);
                    await frame.click(selector);
                    console.log('Clicked Absenden button');
                    absendenClicked = true;
                    break;
                }
            }
            
            // If no button found, click in bottom center as fallback
            if (!absendenClicked) {
                console.log('Using fallback: clicking element at bottom center');
                await frame.evaluate(() => {
                    const centerX = window.innerWidth / 2;
                    const bottomY = window.innerHeight - 50;
                    const elementAtPoint = document.elementFromPoint(centerX, bottomY);
                    if (elementAtPoint) {
                        elementAtPoint.click();
                    }
                });
            }
            
            // Wait for dialog to appear
            console.log('Waiting for confirmation dialog to appear...');
            await sleep(params.waitForDialog || 3000);
            
            // Now handle the close button (X) in the dialog
            console.log('Looking for close button (X) in the dialog...');
            const closeButtonSelector = 'div[data-model-id="6opBZv1eVTe"]';
            
            // Try to click the close button multiple times if needed
            let closeButtonClicked = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const closeButtonExists = await frame.evaluate(
                        selector => {
                            const el = document.querySelector(selector);
                            return el && window.getComputedStyle(el).display !== 'none';
                        },
                        closeButtonSelector
                    );
                    
                    if (closeButtonExists) {
                        console.log(`Found close button: ${closeButtonSelector} (attempt ${attempt})`);
                        
                        // Try clicking with both standard click and JavaScript click
                        await frame.click(closeButtonSelector)
                            .catch(async e => {
                                console.log(`Standard click failed, trying JavaScript click: ${e.message}`);
                                await frame.evaluate(selector => {
                                    const el = document.querySelector(selector);
                                    if (el) {
                                        // Try to find the most clickable part (either the X or its parent)
                                        const clickTarget = el.querySelector('.slide-object-vectorshape') || el;
                                        clickTarget.click();
                                        
                                        // Also dispatch a direct click event
                                        clickTarget.dispatchEvent(new MouseEvent('click', {
                                            bubbles: true,
                                            cancelable: true,
                                            view: window
                                        }));
                                    }
                                }, closeButtonSelector);
                            });
                        
                        console.log('Clicked close button');
                        closeButtonClicked = true;
                        break;
                    } else {
                        console.log(`Close button not found on attempt ${attempt}, retrying...`);
                        await sleep(1000);
                    }
                } catch (error) {
                    console.log(`Error clicking close button on attempt ${attempt}: ${error.message}`);
                    if (attempt < 3) await sleep(1000);
                }
            }
            
            if (!closeButtonClicked) {
                console.log('Could not find/click the close button, trying fallback methods');
                
                // Try clicking any orange elements
                await frame.evaluate(() => {
                    const orangeElements = document.querySelectorAll('[fill="#FF9800"]');
                    if (orangeElements.length > 0) {
                        for (const el of orangeElements) {
                            const clickable = el.closest('[data-model-id]') || el.parentElement;
                            if (clickable) {
                                clickable.click();
                                console.log('Clicked orange element as fallback');
                                return true;
                            }
                        }
                    }
                    
                    // Try clicking in the middle of the screen as absolute fallback
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    const centerElement = document.elementFromPoint(centerX, centerY);
                    if (centerElement) {
                        centerElement.click();
                        console.log('Clicked center of screen as fallback');
                        return true;
                    }
                    
                    return false;
                });
            }
            
        } catch (error) {
            console.error('Error handling confirmation dialog:', error.message);
        }
        
        // Wait for dialog animation to complete
        console.log('Waiting for dialog to close...');
        await sleep(params.waitAfterDialog || 3000);
        
        // Now click the next button to proceed to the next slide
        console.log('Waiting for orange next button to become active...');
        // Wait for animation to complete (orange button to appear)
        await sleep(params.waitForNextButton || 2500); // Initial delay for animation to start
  
        // Now wait for the button to turn orange with a polling approach
        let nextButtonActive = false;
        const maxWaitTime = params.maxWaitTime || 15000; // 15 seconds max wait
        const startTime = Date.now();
  
        while (!nextButtonActive && (Date.now() - startTime < maxWaitTime)) {
          // Check if the orange next button exists and is visible
          nextButtonActive = await frame.evaluate(() => {
            const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
            if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
              return false;
            }
            
            // Check if it has the orange stroke (active state)
            const path = orangeButton.querySelector('svg path');
            if (!path) return false;
            
            const strokeColor = path.getAttribute('stroke');
            return strokeColor === '#FF9800'; // Orange stroke color
          });
          
          if (nextButtonActive) {
            console.log('Orange next button is now active');
            break;
          }
          
          console.log('Waiting for next button to become active...');
          await sleep(1000); // Check every second
        }
  
        // Try clicking the orange next button (now that it's active)
        console.log('Attempting to click orange next button...');
        await sleep(500); // Small delay before clicking
  
        // Use comprehensive clicking approach
        await clickOrangeNextButton(frame);
  
        // Wait after clicking to ensure transition completes
        console.log('Waiting for transition after clicking next button...');
        await sleep(params.waitAfter || 3000);
              
        return true;
    } catch (error) {
        console.error('Error in percentage drag and drop handler:', error.message);
        
        // Even if there's an error, try to proceed
        try {
            await clickNextButton(frame);
        } catch (e) {
            console.log('Error clicking next button after drag-drop handler error:', e.message);
        }
        
        return false;
    }
  }
  
/**
 * Perform drag and drop between two elements
 * @param {Object} page - Puppeteer page object
 * @param {Object} frame - Puppeteer frame 
 * @param {string} sourceSelector - CSS selector for source element
 * @param {string} targetSelector - CSS selector for target element
 */
async function dragAndDropElement(page, frame, sourceSelector, targetSelector) {
    console.log(`Performing drag-and-drop: ${sourceSelector} -> ${targetSelector}`);
    
    try {
        // Wait for both elements
        const sourceHandle = await frame.waitForSelector(sourceSelector, { visible: true, timeout: 10000 });
        const targetHandle = await frame.waitForSelector(targetSelector, { visible: true, timeout: 10000 });
        
        // Get element positions
        const sourceBox = await sourceHandle.boundingBox();
        const targetBox = await targetHandle.boundingBox();
        
        if (!sourceBox || !targetBox) {
            throw new Error('Could not get element positions');
        }
        
        console.log('Source position:', sourceBox);
        console.log('Target position:', targetBox);
        
        // Source center coordinates
        const sourceX = sourceBox.x + sourceBox.width / 2;
        const sourceY = sourceBox.y + sourceBox.height / 2;
        
        // Target center coordinates
        const targetX = targetBox.x + targetBox.width / 2;
        const targetY = targetBox.y + targetBox.height / 2;
        
        // Perform the drag operation with smooth movement
        await page.mouse.move(sourceX, sourceY, { steps: 10 });
        await sleep(300);
        await page.mouse.down();
        
        // Move to target in small steps for reliability
        const steps = 20;
        const deltaX = (targetX - sourceX) / steps;
        const deltaY = (targetY - sourceY) / steps;
        
        for (let i = 1; i <= steps; i++) {
            await page.mouse.move(
                sourceX + deltaX * i,
                sourceY + deltaY * i,
                { steps: 1 }
            );
            await sleep(25); // Short delay between movements
        }
        
        await sleep(300);
        await page.mouse.up();
        
        console.log('Drag and drop completed');
        await sleep(1000); // Wait for any animations
        
        return true;
    } catch (error) {
        console.error(`Error in drag and drop operation: ${error.message}`);
        throw error;
    }
}

/**
 * Handle memo elements slide interaction with improved detection and interaction
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function handleMemoElements(frame, params = {}) {
    try {
      console.log('Starting memo elements interaction with enhanced detection...');
      
      // Initial delay to ensure all elements are loaded
      await sleep(params.initialDelay || 3000);
      
      // Get the specific information about memo cards to click with more robust detection
      const memoCardsInfo = await frame.evaluate(() => {
        // Find all memo/memory cards with multiple detection strategies
        const memoCards = [];
        
        // Strategy 1: Known memo element IDs (from previous runs and documentation)
        const knownMemoIds = [
          // Primary IDs
          '6QuM2lH06Pj', '6OZGmTUMXSy', '6d6WGZdXhui', '6S50BV4YpY3',
          // Additional IDs observed in other runs
          '5ZZ5sW8vjSj', '6pngmTBRi9u', '67O0nHRKORm', '5lNIcyHBJr3'
        ];
        
        // First pass: Check for known ID elements
        for (const id of knownMemoIds) {
          const element = document.querySelector(`[data-model-id="${id}"]`);
          if (element && window.getComputedStyle(element).display !== 'none') {
            const rect = element.getBoundingClientRect();
            // Verify the element is sizeable (not just a tiny dot)
            if (rect.width > 40 && rect.height > 40) {
              memoCards.push({
                element: element,
                id: id,
                selector: `[data-model-id="${id}"]`,
                rect: {
                  x: rect.left + rect.width/2,
                  y: rect.top + rect.height/2,
                  width: rect.width,
                  height: rect.height
                },
                confidence: 'high'
              });
            }
          }
        }
        
        // Strategy 2: Look for elements with "Memo" in their text or accessibility text
        const memoTextElements = Array.from(document.querySelectorAll('[data-acc-text*="memo"], [data-acc-text*="Memo"]'))
          .filter(el => {
            // Skip if already added
            if (memoCards.some(card => card.element === el)) return false;
            
            // Check if it's visible
            if (window.getComputedStyle(el).display === 'none') return false;
            
            const rect = el.getBoundingClientRect();
            // Size filter
            return rect.width > 50 && rect.height > 50;
          })
          .map(el => {
            const rect = el.getBoundingClientRect();
            return {
              element: el,
              id: el.getAttribute('data-model-id') || '',
              selector: el.getAttribute('data-model-id') 
                ? `[data-model-id="${el.getAttribute('data-model-id')}"]`
                : null,
              rect: {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height
              },
              confidence: 'medium'
            };
          });
        
        memoCards.push(...memoTextElements);
        
        // Strategy 3: Look for visible rectangle elements that might be memo cards
        // Focus especially on elements with cursor-pointer class
        const potentialCardElements = Array.from(document.querySelectorAll('.slide-object-shape.cursor-pointer, .slide-object-vectorshape.cursor-pointer'))
          .filter(el => {
            // Skip if already added
            if (memoCards.some(card => card.element === el)) return false;
            
            // Check if visible
            if (window.getComputedStyle(el).display === 'none') return false;
            
            const rect = el.getBoundingClientRect();
            // Memo cards are typically large rectangles
            const isRightSize = rect.width > 80 && rect.height > 80;
            
            // Additional check: is it on a grid? (memo cards are often aligned)
            const left = rect.left;
            const top = rect.top;
            
            // If we found 2 or more cards already, check if this one aligns with them
            if (memoCards.length >= 2) {
              const isAligned = memoCards.some(card => 
                Math.abs(card.rect.x - (left + rect.width/2)) < 10 || // Same column
                Math.abs(card.rect.y - (top + rect.height/2)) < 10    // Same row
              );
              
              return isRightSize && isAligned;
            }
            
            return isRightSize;
          })
          .map(el => {
            const rect = el.getBoundingClientRect();
            return {
              element: el,
              id: el.getAttribute('data-model-id') || '',
              selector: el.getAttribute('data-model-id') 
                ? `[data-model-id="${el.getAttribute('data-model-id')}"]`
                : null,
              rect: {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height
              },
              confidence: 'medium-low'
            };
          });
        
        memoCards.push(...potentialCardElements);
        
        // If we still don't have enough cards, do an educated guess based on layout
        if (memoCards.length < 3) {
          console.log('[BROWSER] Not enough memo cards found by primary methods, using grid detection...');
          
          // Get all slide objects that could be clickable elements
          const allPossibleElements = Array.from(document.querySelectorAll('.slide-object-shape, .slide-object-vectorshape'))
            .filter(el => {
              // Skip if already added
              if (memoCards.some(card => card.element === el)) return false;
              
              // Check if visible
              if (window.getComputedStyle(el).display === 'none') return false;
              
              const rect = el.getBoundingClientRect();
              
              // Look for similarly-sized elements that could form a grid
              // Memo cards are often medium-sized rectangles
              return rect.width > 80 && rect.width < 300 && 
                     rect.height > 80 && rect.height < 300;
            })
            .map(el => {
              const rect = el.getBoundingClientRect();
              return {
                element: el,
                id: el.getAttribute('data-model-id') || '',
                selector: el.getAttribute('data-model-id') 
                  ? `[data-model-id="${el.getAttribute('data-model-id')}"]`
                  : null,
                rect: {
                  x: rect.left + rect.width/2,
                  y: rect.top + rect.height/2,
                  width: rect.width,
                  height: rect.height
                },
                size: rect.width * rect.height
              };
            });
            
          // Group by similar size (memo cards are usually the same size)
          const sizeGroups = {};
          for (const el of allPossibleElements) {
            // Group by size with some tolerance (round to nearest 1000 pixels)
            const sizeKey = Math.round(el.size / 1000) * 1000;
            if (!sizeGroups[sizeKey]) sizeGroups[sizeKey] = [];
            sizeGroups[sizeKey].push(el);
          }
          
          // Find the group with the most elements
          let bestGroup = [];
          for (const sizeKey in sizeGroups) {
            if (sizeGroups[sizeKey].length > bestGroup.length) {
              bestGroup = sizeGroups[sizeKey];
            }
          }
          
          // Add the best group's elements to our memo cards
          for (const el of bestGroup) {
            memoCards.push({
              ...el,
              confidence: 'low'
            });
          }
        }
        
        // Sort by confidence
        memoCards.sort((a, b) => {
          const confidenceMap = { 'high': 3, 'medium': 2, 'medium-low': 1, 'low': 0 };
          return confidenceMap[b.confidence] - confidenceMap[a.confidence];
        });
        
        // Limit to a reasonable number
        const limitedCards = memoCards.slice(0, 6); // Max 6 cards
        
        return {
          cards: limitedCards.map(card => ({
            id: card.id,
            selector: card.selector,
            x: card.rect.x,
            y: card.rect.y,
            width: card.rect.width,
            height: card.rect.height,
            confidence: card.confidence
          })),
          count: limitedCards.length
        };
      });
      
      console.log(`Found ${memoCardsInfo.count} memo cards to click`);
      memoCardsInfo.cards.forEach((card, i) => {
        console.log(`Card ${i+1}: ID=${card.id || 'unknown'}, Confidence=${card.confidence}, Position=(${card.x},${card.y})`);
      });
      
      // If we found memo cards, click them one by one with proper timing
      if (memoCardsInfo.count > 0) {
        for (let i = 0; i < memoCardsInfo.cards.length; i++) {
          const card = memoCardsInfo.cards[i];
          console.log(`Clicking memo card ${i+1}/${memoCardsInfo.count}: ID=${card.id || 'unknown'} (Confidence: ${card.confidence})`);
          
          // Try different methods to click the card
          let clicked = false;
          
          // Method 1: Direct selector click (most reliable if we have the ID)
          if (card.selector) {
            try {
              await frame.click(card.selector);
              console.log(`Clicked memo card with selector: ${card.selector}`);
              clicked = true;
            } catch (error) {
              console.log(`Selector click failed: ${error.message}`);
            }
          }
          
          // Method 2: Mouse click at coordinates (good fallback)
          if (!clicked && card.x && card.y) {
            try {
              await frame.mouse.click(card.x, card.y);
              console.log(`Clicked memo card at coordinates: (${card.x}, ${card.y})`);
              clicked = true;
            } catch (error) {
              console.log(`Mouse click failed: ${error.message}`);
            }
          }
          
          // Method 3: JavaScript evaluate (most flexible approach, last resort)
          if (!clicked) {
            try {
              const jsClickResult = await frame.evaluate((cardInfo) => {
                // Try by ID
                if (cardInfo.id) {
                  const element = document.querySelector(`[data-model-id="${cardInfo.id}"]`);
                  if (element) {
                    element.click();
                    console.log(`[BROWSER] Clicked element with ID: ${cardInfo.id}`);
                    return true;
                  }
                }
                
                // Try by selector if provided
                if (cardInfo.selector) {
                  const element = document.querySelector(cardInfo.selector);
                  if (element) {
                    element.click();
                    console.log(`[BROWSER] Clicked element with selector: ${cardInfo.selector}`);
                    return true;
                  }
                }
                
                // Try by coordinates
                if (cardInfo.x && cardInfo.y) {
                  const element = document.elementFromPoint(cardInfo.x, cardInfo.y);
                  if (element) {
                    // Try to find the most clickable parent element
                    const clickTarget = element.closest('[data-model-id]') || 
                                       element.closest('.cursor-pointer') || 
                                       element;
                    
                    clickTarget.click();
                    console.log(`[BROWSER] Clicked element at (${cardInfo.x}, ${cardInfo.y})`);
                    return true;
                  }
                }
                
                return false;
              }, card);
              
              if (jsClickResult) {
                console.log('JavaScript click successful');
                clicked = true;
              }
            } catch (error) {
              console.log(`JavaScript click failed: ${error.message}`);
            }
          }
          
          // Wait between card clicks to let animations complete
          // Use a progressively longer delay if card confidence is lower
          const delayMultiplier = 
            card.confidence === 'high' ? 1 :
            card.confidence === 'medium' ? 1.5 :
            card.confidence === 'medium-low' ? 2 : 2.5;
          
          await sleep((params.delayBetweenClicks || 1500) * delayMultiplier);
        }
      } else {
        console.log('No memo cards found by element detection, trying click grid method...');
        
        // Fallback: click in a grid pattern on the screen
        await frame.evaluate(() => {
          // Define a grid of possible positions (3x3 grid)
          const gridPositions = [
            { x: 0.25, y: 0.3 }, { x: 0.5, y: 0.3 }, { x: 0.75, y: 0.3 },
            { x: 0.25, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.5 },
            { x: 0.25, y: 0.7 }, { x: 0.5, y: 0.7 }, { x: 0.75, y: 0.7 }
          ];
          
          // For each position, calculate x/y and click
          for (const pos of gridPositions) {
            const x = window.innerWidth * pos.x;
            const y = window.innerHeight * pos.y;
            
            // Find element at this point
            const element = document.elementFromPoint(x, y);
            if (element) {
              // Find the best clickable parent
              const clickTarget = element.closest('[data-model-id]') || 
                                 element.closest('.cursor-pointer') || 
                                 element;
              
              console.log(`[BROWSER] Clicking at position (${x}, ${y})`);
              clickTarget.click();
              
              // Small delay in browser to let animations complete
              return new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          return true;
        });
      }
      
      // Wait for all click animations to complete
      console.log('Waiting for animations after clicking all memo cards...');
      await sleep(params.waitAfterClicks || 4000);
      
      // Handle any dialog that might appear after clicking all cards
      console.log('Looking for dialog to close...');
      const dialogClosed = await frame.evaluate(() => {
        // Look for dialog elements (common close button selectors)
        const closeSelectors = [
          // Orange circle with white X
          '[data-model-id="5nUZEiVuJdn"]',
          // Other common close button IDs
          '[data-model-id="6lGUORpiSn6"]',
          '[data-model-id="6j5kqHVCSqu"]',
          '[data-model-id="6PeGCMMyBPJ"]',
          // Generic close indicators
          'div[data-acc-text="X"]',
          'div[data-acc-text="Close"]',
          'div[data-acc-text="close"]',
          'div[aria-label="Close"]',
          // Any SVG with X shape or close icon
          'svg path[d*="M12 12L19 19"][d*="M12 19L19 12"]',
          'svg path[d*="M18 6L6 18"][d*="M6 6L18 18"]'
        ];
        
        // Try each close button selector
        for (const selector of closeSelectors) {
          const closeButtons = document.querySelectorAll(selector);
          for (const closeButton of closeButtons) {
            if (window.getComputedStyle(closeButton).display !== 'none') {
              // Get the most clickable parent
              const clickTarget = closeButton.closest('[data-model-id]') || closeButton;
              
              // Try to click with both native click and event dispatch
              try {
                clickTarget.click();
                console.log(`[BROWSER] Clicked close button with selector: ${selector}`);
                
                // Also dispatch events for reliability
                const rect = clickTarget.getBoundingClientRect();
                const x = rect.left + rect.width/2;
                const y = rect.top + rect.height/2;
                
                clickTarget.dispatchEvent(new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  clientX: x,
                  clientY: y
                }));
                
                return true;
              } catch (e) {
                console.log(`[BROWSER] Error clicking close button: ${e.message}`);
              }
            }
          }
        }
        
        // Look for orange circles (common close button style)
        const orangeCircleElements = Array.from(document.querySelectorAll('path[fill="#FF9800"]'))
          .map(el => el.closest('[data-model-id]'))
          .filter(Boolean);
        
        if (orangeCircleElements.length > 0) {
          orangeCircleElements[0].click();
          console.log('[BROWSER] Clicked orange circle (likely close button)');
          return true;
        }
        
        // Look for any newly appeared elements after memo card clicks
        // These are likely dialog/result elements
        const recentElements = document.querySelectorAll('.slide-object-stategroup.shown');
        for (const el of recentElements) {
          // Find a child that looks like a close button
          const closeButton = el.querySelector('[data-acc-text="X"], svg circle, path[stroke="#FFFFFF"]');
          if (closeButton) {
            const clickTarget = closeButton.closest('[data-model-id]') || closeButton;
            clickTarget.click();
            console.log('[BROWSER] Clicked newly appeared close button');
            return true;
          } else {
            // Try clicking the top-right area of the element (common close position)
            const rect = el.getBoundingClientRect();
            const topRight = document.elementFromPoint(rect.right - 20, rect.top + 20);
            if (topRight) {
              topRight.click();
              console.log('[BROWSER] Clicked top-right of dialog element');
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (dialogClosed) {
        console.log('Dialog close button clicked successfully');
        await sleep(params.waitAfterDialog || 2000);
      } else {
        console.log('No dialog close button found or clicked');
      }
      
      // Wait for next button to become active (orange)
      console.log('Waiting for orange next button to become active...');
      await sleep(params.initialWaitForButton || 3000); // Wait for transition to start
      
      // Now wait for the orange next button with polling
      let nextButtonActive = false;
      const maxWaitTime = params.maxWaitTime || 20000; // 20 seconds max wait
      const startTime = Date.now();
      
      while (!nextButtonActive && (Date.now() - startTime < maxWaitTime)) {
        nextButtonActive = await frame.evaluate(() => {
          const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
          if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
            return false;
          }
          
          const path = orangeButton.querySelector('svg path');
          if (!path) return false;
          
          const strokeColor = path.getAttribute('stroke');
          return strokeColor === '#FF9800'; // Orange stroke
        });
        
        if (nextButtonActive) {
          console.log('Orange next button is now active!');
          break;
        }
        
        console.log('Waiting for next button to become active...');
        await sleep(1000); // Check every second
      }
      
      // Use the robust clickOrangeNextButton function for maximum reliability
      console.log('Clicking next button after memo elements interaction...');
      await clickOrangeNextButton(frame);
      
      // Wait after clicking to ensure transition completes
      console.log('Waiting for transition after handlehandlso elements interaction...');
      await sleep(params.waitAfter || 5000);
      
      return true;
    } catch (error) {
      console.error('Error in memo elements handler:', error.message);
      
      // Try to recover by clicking next button
      try {
        await clickNextButton(frame);
      } catch (e) {
        console.log('Recovery attempt also failed:', e.message);
      }
      
      return false;
    }
}

/**
 * Click all risk factors in a specific slide
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function clickAllRiskFactors(frame, params = {}) {
  // Use provided factors or default set
  const riskFactors = params.riskFactors || [
    { id: '6CgBjku5i0P', description: 'Couple (frequent intercourse)' },
    { id: '6f83JhqEXI5', description: 'Reading lady' },
    { id: '6U8twOQqmyr', description: 'Lady red nose' },
    { id: '6ik9oDyZp4F', description: 'Old lady' },
    { id: '6aelPxiqTQs', description: 'Lady pregnant' },
    { id: '6cACM9wqz9n', description: 'Women on blanket' }
  ];

  console.log('Starting to click all risk factors...');
  
  for (const factor of riskFactors) {
    try {
      await frame.waitForSelector(`[data-model-id="${factor.id}"]`, {
        visible: true,
        timeout: 5000
      });
      await frame.click(`[data-model-id="${factor.id}"]`);
      console.log(`Clicked risk factor: ${factor.description}`);
      await sleep(params.delayBetweenClicks || 1000);
    } catch (error) {
      console.log(`Failed to click risk factor ${factor.description}: ${error.message}`);
    }
  }
  console.log('Finished clicking all risk factors');

  // Handle the "Super!" popup and close button
  console.log('Waiting for success popup and close button...');
  await sleep(params.waitForPopup || 2000);

  try {
    // Wait for and find the specific close button structure
    const closeButtonSelector = 'div[data-model-id="5nUZEiVuJdn"].slide-object-stategroup.shown';
    await frame.waitForSelector(closeButtonSelector, {
      visible: true,
      timeout: 10000
    });

    // Click using evaluate to ensure we hit the right element
    await frame.evaluate(() => {
      const closeButton = document.querySelector('div[data-model-id="5nUZEiVuJdn"].slide-object-stategroup.shown');
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
    });

    console.log('Successfully clicked close button');
    await sleep(params.waitAfterClose || 2000);

    // Verify the close action worked
    const buttonStillVisible = await frame.evaluate(() => {
      const button = document.querySelector('div[data-model-id="5nUZEiVuJdn"].slide-object-stategroup.shown');
      return button !== null && window.getComputedStyle(button).display !== 'none';
    });

    if (buttonStillVisible) {
      console.log('Close button still visible, trying alternative click method...');
      // Try direct click as fallback
      await frame.click('div[data-model-id="5nUZEiVuJdn"]');
      await sleep(1000);
    }
  } catch (error) {
    console.error('Error handling close button:', error.message);
    throw error;
  }
}

/**
 * Wait for dialog and press space key repeatedly until interactive elements appear
 * @param {Object} page - Puppeteer page object
 * @param {Object} params - Additional parameters
 */
async function waitForDialogAndPressSpace(page, params = {}) {
    console.log('Specialized function: Waiting for initial dialog and pressing space...');
    
    const maxAttempts = params.maxAttempts || 5;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Space key attempt ${attempt}/${maxAttempts}...`);
        
        // Press space key
        await page.keyboard.press('Space');
        console.log('Pressed the Space key');
        
        // Wait for any dialog dismissal
        await sleep(3000);
        
        // Check if any interactive elements are now visible
        const frames = await page.frames();
        const scormFrame = frames.find(f => f.url().includes('/index_lms.html'));
        
        if (!scormFrame) {
          console.log('SCORM frame not found yet, waiting longer...');
          await sleep(5000);
          continue;
        }
        
        // Check for any interactive elements
        const hasElements = await scormFrame.evaluate(() => {
          const elements = document.querySelectorAll('[data-model-id]');
          return elements.length > 0;
        });
        
        if (hasElements) {
          console.log('Dialog dismissed successfully, interactive elements found!');
          return { success: true, scormFrame };
        }
        
        console.log('No interactive elements found yet, waiting before next attempt...');
        
        // If we've tried a few times, try clicking on the page first, then space
        if (attempt >= 2) {
          console.log('Trying to click on the page first, then space...');
          
          // Try clicking in different areas of the screen
          await page.evaluate(() => {
            // Try center
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const centerEl = document.elementFromPoint(centerX, centerY);
            if (centerEl) centerEl.click();
            
            // Try other areas if needed
            const positions = [
              { x: centerX, y: centerY - 100 }, // Above center
              { x: centerX, y: centerY + 100 }, // Below center
              { x: centerX - 100, y: centerY }, // Left of center
              { x: centerX + 100, y: centerY }  // Right of center
            ];
            
            for (const pos of positions) {
              const el = document.elementFromPoint(pos.x, pos.y);
              if (el) el.click();
            }
          });
          
          // Press space again
          await page.keyboard.press('Space');
        }
        
        await sleep(5000);
      } catch (error) {
        console.error(`Error in space key attempt ${attempt}:`, error.message);
        await sleep(3000);
      }
    }
    
    // If we get here, we didn't succeed but will try continuing anyway
    console.log('WARNING: Could not confirm dialog dismissal, but will attempt to continue...');
    
    // Try one last desperate attempt - look for any SCORM frame we can find
    const frames = await page.frames();
    const scormFrame = frames.find(f => f.url().includes('/index_lms.html') || f.url().includes('scorm'));
    
    return { success: false, scormFrame };
}

/**
 * Handle message buttons slides without speech bubbles
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function handleMessageButtons(frame, params = {}) {
    try {
      console.log('Starting message buttons interaction...');
      
      // Maximum number of message button clicks to try (safety limit)
      const maxMessageClicks = params.maxMessageClicks || 10;
      let messageClickCount = 0;
      let messageButtonExists = true;
      let nextButtonReady = false;
      
      // Keep clicking the message button until one of the stopping conditions is met
      while (messageButtonExists && !nextButtonReady && messageClickCount < maxMessageClicks) {
        try {
          // Check if the message button still exists and is visible
          messageButtonExists = await frame.evaluate(() => {
            const buttonIds = ['6l65RbsSaM0', '6ZIquEpaUG5'];
            for (const id of buttonIds) {
              const button = document.querySelector(`[data-model-id="${id}"]`);
              if (button && window.getComputedStyle(button).display !== 'none') {
                return true;
              }
            }
            return false;
          });
          
          if (!messageButtonExists) {
            console.log('Message button no longer exists or is hidden, moving to next step');
            break;
          }
          
          // Try clicking the message button
          const clicked = await frame.evaluate(() => {
            const buttonIds = ['6l65RbsSaM0', '6ZIquEpaUG5'];
            for (const id of buttonIds) {
              const button = document.querySelector(`[data-model-id="${id}"]`);
              if (button && window.getComputedStyle(button).display !== 'none') {
                button.click();
                console.log(`Clicked message button with ID: ${id}`);
                return true;
              }
            }
            return false;
          });
          
          if (clicked) {
            messageClickCount++;
            console.log(`Clicked message button (attempt ${messageClickCount}/${maxMessageClicks})`);
          } else {
            console.log('Failed to click message button');
          }
          
          // Wait a moment for any animations to complete
          await sleep(params.delayBetweenClicks || 1500);
          
          // Check if the next button is now active (orange)
          nextButtonReady = await frame.evaluate(() => {
            // Check for orange next button
            const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
            if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
              return false;
            }
            
            // Check if it has the orange stroke
            const path = orangeButton.querySelector('svg path');
            if (!path) return false;
            
            const strokeColor = path.getAttribute('stroke');
            return strokeColor === '#FF9800';
          });
          
          if (nextButtonReady) {
            console.log(`Next button is now active after ${messageClickCount} message clicks`);
            break;
          }
        } catch (error) {
          console.log(`Error during message button click attempt ${messageClickCount}:`, error.message);
          // Don't break on error, try again until max attempts
        }
      }
      
      // If next button is ready, click it
      if (nextButtonReady) {
        console.log('Clicking active next button...');
        await clickOrangeNextButton(frame);
      } else {
        // Try clicking next button anyway as fallback
        console.log('Next button not confirmed active, trying click anyway...');
        await clickNextButton(frame);
      }
      
      // Wait after clicking
      await sleep(params.waitAfter || 3000);
      
      return true;
    } catch (error) {
      console.error('Error in message buttons interaction:', error.message);
      
      // Try to recover by clicking next button
      try {
        await clickNextButton(frame);
      } catch (e) {
        console.log('Recovery attempt also failed:', e.message);
      }
      
      return false;
    }
}

/**
 * Handle message dialog sequence with multiple clicks
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function handleMessageDialogSequence(frame, params = {}) {
    try {
      console.log('Starting message dialog sequence handling...');
      
      // Maximum number of message button clicks to try (safety limit)
      const maxMessageClicks = params.maxClicks || 3;
      let messageClickCount = 0;
      let messageButtonExists = true;
      
      // Keep clicking the message button until one of the stopping conditions is met
      while (messageButtonExists && messageClickCount < maxMessageClicks) {
        try {
          // Check if the message button still exists and is visible
          messageButtonExists = await frame.evaluate(() => {
            const button = document.querySelector('[data-model-id="6l65RbsSaM0"]');
            return button && window.getComputedStyle(button).display !== 'none';
          });
          
          if (!messageButtonExists) {
            console.log('Message button no longer exists or is hidden, moving to next step');
            break;
          }
          
          // Try clicking the message button
          await frame.click('[data-model-id="6l65RbsSaM0"]');
          messageClickCount++;
          console.log(`Clicked message button (attempt ${messageClickCount}/${maxMessageClicks})`);
          
          // Wait a moment for any animations to complete
          await sleep(params.delayBetweenClicks || 1500);
          
          // If we've reached max clicks, the slide will transition automatically
          if (messageClickCount >= maxMessageClicks) {
            console.log('Reached maximum number of message clicks, waiting for automatic transition...');
            // Wait for transition to complete instead of looking for a next button
            await sleep(params.transitionWait || 5000);
            return true;
          }
        } catch (error) {
          console.log(`Error during message button click attempt ${messageClickCount}:`, error.message);
          // Don't break on error, try again until max attempts
        }
      }
      
      // For cases where we didn't reach max clicks but the button disappeared
      // (This is only executed if we exit the loop before reaching max clicks)
      console.log('Waiting after message sequence...');
      await sleep(params.waitAfterNext || 5000);
      
      return true;
    } catch (error) {
      console.error('Error in message dialog sequence:', error.message);
      return false;
    }
  }

/**
 * Click MediBee when it appears
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function clickMediBee(frame, params = {}) {
  try {
    // Wait for message to disappear and MediBee to appear
    console.log('Waiting for MediBee to appear...');
    await sleep(params.initialDelay || 4000);  // Wait for animation/transition

    // Wait for and click the MediBee element
    await frame.waitForSelector('[data-model-id="65WBcmftYDt"]', {
      visible: true,
      timeout: params.timeout || 10000
    });
    
    await frame.click('[data-model-id="65WBcmftYDt"]');
    console.log('Clicked MediBee element');
    
    await sleep(params.waitAfter || 2000);
    return true;
  } catch (error) {
    throw new Error(`Failed to click MediBee: ${error.message}`);
  }
}

/**
 * Handle slider interaction with EXACT approach copied from dorithricin1.js
 * @param {Object} frame - Puppeteer page or frame 
 * @param {Object} params - Additional parameters
 */
async function handleSliderInteraction(frame, params = {}) {
  try {
    console.log('Starting slider interaction with EXACT dorithricin1.js approach...');
    
    // Step 1: Set the green dot position - EXACTLY as in dorithricin1.js
    console.log('Setting green dot position...');
    await frame.evaluate(() => {
      const greenDot = document.querySelector('[data-model-id="6ab5xvhtIXy"]');
      if (greenDot) {
        greenDot.style.transform = 'translate(756px, 0px) rotate(0deg) scale(1, 1)';
        greenDot.dispatchEvent(new Event('change', { bubbles: true }));
        greenDot.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[BROWSER] Set green dot to position 10/10');
      } else {
        console.log('[BROWSER] Green dot not found');
      }
    });
    
    // Exact same sleep timing as dorithricin1.js
    await sleep(2000);
    
    // Step 2: Set the yellow dot position - EXACTLY as in dorithricin1.js
    console.log('Setting yellow dot position...');
    await frame.evaluate(() => {
      const yellowDot = document.querySelector('[data-model-id="6BICHbFtmNU"]');
      if (yellowDot) {
        yellowDot.style.transform = 'translate(302px, 0px) rotate(0deg) scale(1, 1)';
        yellowDot.dispatchEvent(new Event('change', { bubbles: true }));
        yellowDot.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[BROWSER] Set yellow dot to position 4/10');
      } else {
        console.log('[BROWSER] Yellow dot not found');
      }
    });
    
    // Exact same sleep timing as dorithricin1.js
    await sleep(2000);
    
    // Step 3: Click the Prüfen button - directly from dorithricin1.js
    console.log('Clicking Prüfen button using EXACT dorithricin1.js method...');
    
    try {
      // Try direct frame.click first
      await frame.click('[data-model-id="6M3h8ouA9G1"]');
      console.log('Directly clicked Prüfen button with frame.click()');
    } catch (clickError) {
      console.log('Direct click failed, using evaluate method:', clickError.message);
      
      // Fall back to evaluate approach from dorithricin1.js
      await frame.evaluate(() => {
        const pruefenButton = document.querySelector('[data-model-id="6M3h8ouA9G1"]');
        if (!pruefenButton) {
          console.log('[BROWSER] Prüfen button not found');
          return false;
        }
        
        try {
          pruefenButton.click();
          console.log('[BROWSER] Clicked Prüfen button directly');
          return true;
        } catch (e) {
          console.log('[BROWSER] Error clicking button:', e);
        }
        
        // Try by selector (looking for button text)
        try {
          const pruefenByText = document.querySelector('div:contains("Prüfen")');
          if (pruefenByText) {
            pruefenByText.click();
            console.log('[BROWSER] Clicked Prüfen by text content');
            return true;
          }
        } catch (e) {
          console.log('[BROWSER] Error clicking by text:', e);
        }
        
        // Try clicking any element in the button area (bottom center)
        try {
          const centerX = window.innerWidth / 2;
          const bottomY = window.innerHeight - 150;
          const element = document.elementFromPoint(centerX, bottomY);
          if (element) {
            element.click();
            console.log('[BROWSER] Clicked element at bottom center');
            return true;
          }
        } catch (e) {
          console.log('[BROWSER] Error clicking at position:', e);
        }
        
        return false;
      });
    }
    
    // Wait EXACTLY 5 seconds as in dorithricin1.js
    console.log('Waiting for dialog to appear (5000ms)...');
    await sleep(5000);
    
    // Check if dialog is present
    const dialogPresent = await frame.evaluate(() => {
      // Look for dialog elements
      const dialogs = document.querySelectorAll('.slide-object-stategroup.shown');
      const dialogWithRichtig = Array.from(dialogs).some(d => 
        d.textContent && (d.textContent.includes('Tatsächlich') || d.textContent.includes('Das stimmt'))
      );
      
      console.log('[BROWSER] Dialog detection:', {
        dialogsPresent: dialogs.length > 0,
        dialogWithText: dialogWithRichtig,
        dialogsFound: Array.from(dialogs).map(d => d.getAttribute('data-model-id'))
      });
      
      return dialogs.length > 0;
    });
    
    console.log(`Dialog detected: ${dialogPresent}`);
    
    // Close dialog if present
    if (dialogPresent) {
      console.log('Attempting to close dialog...');
      
      try {
        // Try each known close button ID
        const closeButtonIds = ['6j5kqHVCSqu', '6PeGCMMyBPJ', '5nUZEiVuJdn', '6lGUORpiSn6', '6opBZv1eVTe'];
        
        for (const id of closeButtonIds) {
          try {
            // Check if button exists first
            const exists = await frame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              return button && window.getComputedStyle(button).display !== 'none';
            }, id);
            
            if (exists) {
              console.log(`Found close button with ID: ${id}, attempting to click...`);
              await frame.click(`[data-model-id="${id}"]`);
              console.log(`Successfully clicked close button with ID: ${id}`);
              break;
            }
          } catch (e) {
            console.log(`Error clicking close button ${id}:`, e.message);
          }
        }
      } catch (e) {
        console.log('Error in close button click sequence:', e.message);
        
        // Fallback: Use evaluate to force-hide dialogs
        await frame.evaluate(() => {
          const dialogs = document.querySelectorAll('.slide-object-stategroup.shown');
          for (const dialog of dialogs) {
            dialog.classList.remove('shown');
            dialog.style.display = 'none';
            console.log('[BROWSER] Force-hid dialog');
          }
        });
      }
    } else {
      console.log('No dialog detected, continuing to next step');
    }
    
    // Wait exactly 2000ms as in dorithricin1.js
    console.log('Waiting after dialog handling (2000ms)...');
    await sleep(2000);
    
    // Click the next button with direct frame.click
    console.log('Clicking next button...');
    
    try {
      // First approach: Try known next button IDs with frame.click
      const nextButtonIds = ['5fQkkvFT1Hs', '5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'];
      let clicked = false;
      
      for (const id of nextButtonIds) {
        try {
          // Check if button exists and is visible
          const buttonExists = await frame.evaluate((buttonId) => {
            const button = document.querySelector(`[data-model-id="${buttonId}"]`);
            return button && window.getComputedStyle(button).display !== 'none';
          }, id);
          
          if (buttonExists) {
            await frame.click(`[data-model-id="${id}"]`);
            console.log(`Clicked next button with ID: ${id}`);
            clicked = true;
            break;
          }
        } catch (e) {
          console.log(`Error clicking next button ${id}:`, e.message);
        }
      }
      
      // If direct click failed, use evaluate method
      if (!clicked) {
        console.log('Direct click failed, using evaluate for next button...');
        
        await frame.evaluate(() => {
          // Try by orange stroke
          const orangePaths = document.querySelectorAll('path[stroke="#FF9800"]');
          for (const path of orangePaths) {
            const button = path.closest('[data-model-id]');
            if (button) {
              try {
                button.click();
                console.log('[BROWSER] Clicked button with orange stroke');
                return true;
              } catch (e) {
                console.log('[BROWSER] Error clicking orange button:', e);
              }
            }
          }
          
          // Try bottom right corner
          try {
            const rightSide = window.innerWidth - 50;
            const bottomSide = window.innerHeight - 50;
            const element = document.elementFromPoint(rightSide, bottomSide);
            if (element) {
              element.click();
              console.log('[BROWSER] Clicked element at bottom right corner');
              return true;
            }
          } catch (e) {
            console.log('[BROWSER] Error clicking at corner:', e);
          }
          
          return false;
        });
      }
    } catch (e) {
      console.log('Error in next button click sequence:', e.message);
    }
    
    // Wait exactly 7000ms as in dorithricin1.js
    console.log('Waiting for transition after clicking next button (7000ms)...');
    await sleep(7000);
    
    return true;
  } catch (error) {
    console.error('Error in slider interaction:', error.message);
    
    // Try to recover
    try {
      console.log('Attempting recovery...');
      
      // Try clicking at bottom right as last resort
      await frame.evaluate(() => {
        const rightSide = window.innerWidth - 50;
        const bottomSide = window.innerHeight - 50;
        const element = document.elementFromPoint(rightSide, bottomSide);
        if (element) {
          element.click();
          console.log('[BROWSER] Last resort: clicked at bottom right');
          return true;
        }
        return false;
      });
    } catch (e) {
      console.log('Recovery attempt failed:', e.message);
    }
    
    return false;
  }
}

/**
 * Handle message dialog sequence with specifically 5 clicks and waiting for orange next button
 * @param {Object}

// Export all interaction functions
module.exports = {
    clickStartButton,
    clickNextButton,
    pressSpaceKey,
    clickAllRiskFactors,
    handleMessageDialogSequence,
    clickMediBee,
    handleSliderInteraction,
    handleCarouselNavigation,
    clickWeiterButton,
    clickTrainingSchliessen,
    waitForContentAndProceedToNext,
    waitForDialogAndPressSpace,
    clickScormStartButton,
    clickOrangePlusButton,
    handleSpeechBubbles,
    handlePercentageDragAndDrop,
    handleGenericNextButtonState,
    handleMessageButtons,
    handleMemoElements,
    handleMessageDialogFive
}; frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function handleMessageDialogFive(frame, params = {}) {
  try {
    console.log('Starting message dialog sequence with 5 clicks...');
    
    // Maximum number of message button clicks - default to 5 for this function
    const maxMessageClicks = params.maxClicks || 5;
    let messageClickCount = 0;
    let messageButtonExists = true;
    
    // Keep clicking the message button until reaching max clicks
    while (messageButtonExists && messageClickCount < maxMessageClicks) {
      try {
        // Check if the message button still exists and is visible
        messageButtonExists = await frame.evaluate(() => {
          const button = document.querySelector('[data-model-id="6l65RbsSaM0"]');
          return button && window.getComputedStyle(button).display !== 'none';
        });
        
        if (!messageButtonExists) {
          console.log('Message button no longer exists or is hidden, moving to next step');
          break;
        }
        
        // Try clicking the message button
        await frame.click('[data-model-id="6l65RbsSaM0"]');
        messageClickCount++;
        console.log(`Clicked message button (attempt ${messageClickCount}/${maxMessageClicks})`);
        
        // Wait a moment for any animations to complete
        await sleep(params.delayBetweenClicks || 1500);
      } catch (error) {
        console.log(`Error during message button click attempt ${messageClickCount}:`, error.message);
        // Don't break on error, try again until max attempts
      }
    }
    
    // Now wait for the next button to turn orange (become active)
    console.log('Completed message button clicks. Waiting for next button to turn orange...');
    await sleep(3000); // Initial wait for animations
    
    // Poll for the next button to become active
    const maxWaitTime = params.maxWaitForNextButton || 30000; // 30 seconds max wait
    const startTime = Date.now();
    let nextButtonActive = false;
    
    while (!nextButtonActive && (Date.now() - startTime < maxWaitTime)) {
      nextButtonActive = await frame.evaluate(() => {
        // Look for orange next button
        const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
        if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
          return false;
        }
        
        // Check if it has the orange stroke (active state)
        const path = orangeButton.querySelector('svg path');
        if (!path) return false;
        
        const strokeColor = path.getAttribute('stroke');
        return strokeColor === '#FF9800'; // Orange stroke color
      });
      
      if (nextButtonActive) {
        console.log('Next button is now active (orange)!');
        break;
      }
      
      console.log('Waiting for next button to become active...');
      await sleep(1000); // Check every second
    }
    
    // If next button is active, click it
    if (nextButtonActive) {
      console.log('Clicking activated next button...');
      
      try {
        // Try known next button IDs
        const nextButtonIds = ['5fQkkvFT1Hs', '5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'];
        
        let clicked = false;
        for (const id of nextButtonIds) {
          try {
            const buttonExists = await frame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              return button && window.getComputedStyle(button).display !== 'none';
            }, id);
            
            if (buttonExists) {
              await frame.click(`[data-model-id="${id}"]`);
              console.log(`Clicked next button with ID: ${id}`);
              clicked = true;
              break;
            }
          } catch (e) {
            console.log(`Error clicking next button ${id}:`, e.message);
          }
        }
        
        // If direct click failed, try bottom right corner
        if (!clicked) {
          console.log('Direct button click failed, trying bottom right corner...');
          
          await frame.evaluate(() => {
            const rightSide = window.innerWidth - 50;
            const bottomSide = window.innerHeight - 50;
            const element = document.elementFromPoint(rightSide, bottomSide);
            if (element) {
              element.click();
              console.log('[BROWSER] Clicked element at bottom right corner');
              return true;
            }
            return false;
          });
        }
      } catch (nextError) {
        console.log('Error clicking next button:', nextError.message);
      }
    } else {
      console.log('Next button did not become active within timeout period');
    }
    
    // Wait to ensure transition completes
    console.log('Waiting for transition after message dialog sequence...');
    await sleep(params.waitAfterNext || 5000);
    
    return true;
  } catch (error) {
    console.error('Error in message dialog sequence:', error.message);
    
    // Try to recover with basic next button click
    try {
      console.log('Attempting recovery after error...');
      await frame.evaluate(() => {
        const rightSide = window.innerWidth - 50;
        const bottomSide = window.innerHeight - 50;
        const element = document.elementFromPoint(rightSide, bottomSide);
        if (element) element.click();
      });
    } catch (e) {
      console.log('Recovery attempt failed:', e.message);
    }
    
    return false;
  }
}
/**
 * Handle slider interaction with EXACT approach copied from dorithricin1.js
 * @param {Object} frame - Puppeteer page or frame 
 * @param {Object} params - Additional parameters
 */
async function handleSliderInteraction(frame, params = {}) {
  try {
    console.log('Starting slider interaction with EXACT dorithricin1.js approach...');
    
    // Step 1: Set the green dot position - EXACTLY as in dorithricin1.js
    console.log('Setting green dot position...');
    await frame.evaluate(() => {
      const greenDot = document.querySelector('[data-model-id="6ab5xvhtIXy"]');
      if (greenDot) {
        greenDot.style.transform = 'translate(756px, 0px) rotate(0deg) scale(1, 1)';
        greenDot.dispatchEvent(new Event('change', { bubbles: true }));
        greenDot.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[BROWSER] Set green dot to position 10/10');
      } else {
        console.log('[BROWSER] Green dot not found');
      }
    });
    
    // Exact same sleep timing as dorithricin1.js
    await sleep(2000);
    
    // Step 2: Set the yellow dot position - EXACTLY as in dorithricin1.js
    console.log('Setting yellow dot position...');
    await frame.evaluate(() => {
      const yellowDot = document.querySelector('[data-model-id="6BICHbFtmNU"]');
      if (yellowDot) {
        yellowDot.style.transform = 'translate(302px, 0px) rotate(0deg) scale(1, 1)';
        yellowDot.dispatchEvent(new Event('change', { bubbles: true }));
        yellowDot.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[BROWSER] Set yellow dot to position 4/10');
      } else {
        console.log('[BROWSER] Yellow dot not found');
      }
    });
    
    // Exact same sleep timing as dorithricin1.js
    await sleep(2000);
    
    // Step 3: Click the Prüfen button - directly from dorithricin1.js
    console.log('Clicking Prüfen button using EXACT dorithricin1.js method...');
    
    try {
      // Try direct frame.click first
      await frame.click('[data-model-id="6M3h8ouA9G1"]');
      console.log('Directly clicked Prüfen button with frame.click()');
    } catch (clickError) {
      console.log('Direct click failed, using evaluate method:', clickError.message);
      
      // Fall back to evaluate approach from dorithricin1.js
      await frame.evaluate(() => {
        const pruefenButton = document.querySelector('[data-model-id="6M3h8ouA9G1"]');
        if (!pruefenButton) {
          console.log('[BROWSER] Prüfen button not found');
          return false;
        }
        
        try {
          pruefenButton.click();
          console.log('[BROWSER] Clicked Prüfen button directly');
          return true;
        } catch (e) {
          console.log('[BROWSER] Error clicking button:', e);
        }
        
        // Try by selector (looking for button text)
        try {
          const pruefenByText = document.querySelector('div:contains("Prüfen")');
          if (pruefenByText) {
            pruefenByText.click();
            console.log('[BROWSER] Clicked Prüfen by text content');
            return true;
          }
        } catch (e) {
          console.log('[BROWSER] Error clicking by text:', e);
        }
        
        // Try clicking any element in the button area (bottom center)
        try {
          const centerX = window.innerWidth / 2;
          const bottomY = window.innerHeight - 150;
          const element = document.elementFromPoint(centerX, bottomY);
          if (element) {
            element.click();
            console.log('[BROWSER] Clicked element at bottom center');
            return true;
          }
        } catch (e) {
          console.log('[BROWSER] Error clicking at position:', e);
        }
        
        return false;
      });
    }
    
    // Wait EXACTLY 5 seconds as in dorithricin1.js
    console.log('Waiting for dialog to appear (5000ms)...');
    await sleep(5000);
    
    // Check if dialog is present
    const dialogPresent = await frame.evaluate(() => {
      // Look for dialog elements
      const dialogs = document.querySelectorAll('.slide-object-stategroup.shown');
      const dialogWithRichtig = Array.from(dialogs).some(d => 
        d.textContent && (d.textContent.includes('Tatsächlich') || d.textContent.includes('Das stimmt'))
      );
      
      console.log('[BROWSER] Dialog detection:', {
        dialogsPresent: dialogs.length > 0,
        dialogWithText: dialogWithRichtig,
        dialogsFound: Array.from(dialogs).map(d => d.getAttribute('data-model-id'))
      });
      
      return dialogs.length > 0;
    });
    
    console.log(`Dialog detected: ${dialogPresent}`);
    
    // Close dialog if present
    if (dialogPresent) {
      console.log('Attempting to close dialog...');
      
      try {
        // Try each known close button ID
        const closeButtonIds = ['6j5kqHVCSqu', '6PeGCMMyBPJ', '5nUZEiVuJdn', '6lGUORpiSn6', '6opBZv1eVTe'];
        
        for (const id of closeButtonIds) {
          try {
            // Check if button exists first
            const exists = await frame.evaluate((buttonId) => {
              const button = document.querySelector(`[data-model-id="${buttonId}"]`);
              return button && window.getComputedStyle(button).display !== 'none';
            }, id);
            
            if (exists) {
              console.log(`Found close button with ID: ${id}, attempting to click...`);
              await frame.click(`[data-model-id="${id}"]`);
              console.log(`Successfully clicked close button with ID: ${id}`);
              break;
            }
          } catch (e) {
            console.log(`Error clicking close button ${id}:`, e.message);
          }
        }
      } catch (e) {
        console.log('Error in close button click sequence:', e.message);
        
        // Fallback: Use evaluate to force-hide dialogs
        await frame.evaluate(() => {
          const dialogs = document.querySelectorAll('.slide-object-stategroup.shown');
          for (const dialog of dialogs) {
            dialog.classList.remove('shown');
            dialog.style.display = 'none';
            console.log('[BROWSER] Force-hid dialog');
          }
        });
      }
    } else {
      console.log('No dialog detected, continuing to next step');
    }
    
    // Wait exactly 2000ms as in dorithricin1.js
    console.log('Waiting after dialog handling (2000ms)...');
    await sleep(2000);
    
    // Click the next button with direct frame.click
    console.log('Clicking next button...');
    
    try {
      // First approach: Try known next button IDs with frame.click
      const nextButtonIds = ['5fQkkvFT1Hs', '5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'];
      let clicked = false;
      
      for (const id of nextButtonIds) {
        try {
          // Check if button exists and is visible
          const buttonExists = await frame.evaluate((buttonId) => {
            const button = document.querySelector(`[data-model-id="${buttonId}"]`);
            return button && window.getComputedStyle(button).display !== 'none';
          }, id);
          
          if (buttonExists) {
            await frame.click(`[data-model-id="${id}"]`);
            console.log(`Clicked next button with ID: ${id}`);
            clicked = true;
            break;
          }
        } catch (e) {
          console.log(`Error clicking next button ${id}:`, e.message);
        }
      }
      
      // If direct click failed, use evaluate method
      if (!clicked) {
        console.log('Direct click failed, using evaluate for next button...');
        
        await frame.evaluate(() => {
          // Try by orange stroke
          const orangePaths = document.querySelectorAll('path[stroke="#FF9800"]');
          for (const path of orangePaths) {
            const button = path.closest('[data-model-id]');
            if (button) {
              try {
                button.click();
                console.log('[BROWSER] Clicked button with orange stroke');
                return true;
              } catch (e) {
                console.log('[BROWSER] Error clicking orange button:', e);
              }
            }
          }
          
          // Try bottom right corner
          try {
            const rightSide = window.innerWidth - 50;
            const bottomSide = window.innerHeight - 50;
            const element = document.elementFromPoint(rightSide, bottomSide);
            if (element) {
              element.click();
              console.log('[BROWSER] Clicked element at bottom right corner');
              return true;
            }
          } catch (e) {
            console.log('[BROWSER] Error clicking at corner:', e);
          }
          
          return false;
        });
      }
    } catch (e) {
      console.log('Error in next button click sequence:', e.message);
    }
    
    // Wait exactly 7000ms as in dorithricin1.js
    console.log('Waiting for transition after clicking next button (7000ms)...');
    await sleep(7000);
    
    return true;
  } catch (error) {
    console.error('Error in slider interaction:', error.message);
    
    // Try to recover
    try {
      console.log('Attempting recovery...');
      
      // Try clicking at bottom right as last resort
      await frame.evaluate(() => {
        const rightSide = window.innerWidth - 50;
        const bottomSide = window.innerHeight - 50;
        const element = document.elementFromPoint(rightSide, bottomSide);
        if (element) {
          element.click();
          console.log('[BROWSER] Last resort: clicked at bottom right');
          return true;
        }
        return false;
      });
    } catch (e) {
      console.log('Recovery attempt failed:', e.message);
    }
    
    return false;
  }
}

/**
 * Handle speech bubble interactions on the dialogue slide
 * @param {Object} frame - Puppeteer frame or page
 * @param {Object} params - Additional parameters
 */
async function handleSpeechBubbles(frame, params = {}) {
    console.log('Starting speech bubble interaction handler with enhanced detection...');
    
    // First, identify all potential speech bubbles using multiple detection strategies
    const speechBubbles = await frame.evaluate(() => {
      // Look for all potential speech bubbles using multiple detection strategies
      const allPossibleBubbles = [];
      
      // Strategy 1: Known speech bubble IDs
      const knownIds = ['61cy9Hbjzng', '6B44zup212K'];
      for (const id of knownIds) {
        const element = document.querySelector(`[data-model-id="${id}"]`);
        if (element && window.getComputedStyle(element).display !== 'none') {
          allPossibleBubbles.push({
            id: id,
            text: element.getAttribute('data-acc-text') || element.textContent || '',
            hasOrangeStroke: !!element.querySelector('svg path[stroke="#FF9800"]'),
            isKnownId: true
          });
        }
      }
      
      // Strategy 2: Elements with orange outlines (interactive speech bubbles)
      const orangeOutlines = Array.from(document.querySelectorAll('div.slide-object-stategroup.shown.cursor-hover'))
        .filter(el => {
          // Skip if already added by ID
          if (el.getAttribute('data-model-id') && 
              knownIds.includes(el.getAttribute('data-model-id'))) {
            return false;
          }
          
          // Check if it has an orange stroke path inside
          return !!el.querySelector('svg path[stroke="#FF9800"]');
        })
        .map(el => ({
          id: el.getAttribute('data-model-id') || '',
          text: el.getAttribute('data-acc-text') || 
                el.querySelector('[data-acc-text]')?.getAttribute('data-acc-text') || '',
          hasOrangeStroke: true,
          isKnownId: false
        }));
      
      allPossibleBubbles.push(...orangeOutlines);
      
      // Strategy 3: Elements that look like speech bubbles by shape/class
      const bubbleShapes = Array.from(document.querySelectorAll(
        'div.slide-object-vectorshape, div.slide-object-textboxshape'
      ))
        .filter(el => {
          // Skip if already added
          if (el.getAttribute('data-model-id') && 
              allPossibleBubbles.some(b => b.id === el.getAttribute('data-model-id'))) {
            return false;
          }
          
          // Check if it looks like a chat bubble (has rounded corners, has text)
          const hasText = el.textContent && el.textContent.trim().length > 0;
          const isRounded = el.querySelector('svg path[d*="a"]'); // 'a' in SVG path = arc = rounded
          const isBubbleSized = el.offsetWidth > 100 && el.offsetWidth < 400;
          
          return hasText && (isRounded || isBubbleSized);
        })
        .map(el => ({
          id: el.getAttribute('data-model-id') || '',
          text: el.getAttribute('data-acc-text') || el.textContent || '',
          hasOrangeStroke: false,
          isKnownId: false
        }));
      
      allPossibleBubbles.push(...bubbleShapes);
      
      // Score the bubbles based on likelihood of being interactive speech bubbles
      return allPossibleBubbles.map(bubble => {
        let score = 0;
        
        // Known IDs get highest score
        if (bubble.isKnownId) score += 100;
        
        // Orange stroke is a very strong indicator
        if (bubble.hasOrangeStroke) score += 80;
        
        // Text content that suggests it's a speech bubble
        if (bubble.text && (
            bubble.text.includes('Beschwerden') || 
            bubble.text.includes('Seit wann') ||
            bubble.text.includes('Symptom') ||
            bubble.text.includes('Patient'))) {
          score += 50;
        }
        
        return {...bubble, score};
      }).sort((a, b) => b.score - a.score);  // Sort by descending score
    });
    
    console.log(`Found ${speechBubbles.length} potential speech bubbles`);
    
    // Click each speech bubble in sequence (limit to top 3 to avoid excessive clicking)
    const bubblesToProcess = speechBubbles.slice(0, 3);
    
    // If no speech bubbles found, try generic interaction
    if (bubblesToProcess.length === 0) {
      console.log('No speech bubbles found, trying generic interaction in content area');
      
      // Try clicking in the content area to find interactive elements
      await frame.evaluate(() => {
        // Click in a grid pattern across the center area
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        for (let x = 0.3; x <= 0.7; x += 0.2) {
          for (let y = 0.3; y <= 0.7; y += 0.2) {
            const element = document.elementFromPoint(width * x, height * y);
            if (element) element.click();
          }
        }
      });
      
      // Wait a moment for any interactions to trigger
      await sleep(2000);
    } else {
      // Process each speech bubble in order of score
      for (const bubble of bubblesToProcess) {
        if (bubble.id) {
          try {
            console.log(`Clicking speech bubble: ${bubble.id}`);
            await frame.click(`[data-model-id="${bubble.id}"]`);
            await sleep(params.delayBetweenClicks || 1000);
          } catch (error) {
            console.log(`Failed to click speech bubble ${bubble.id}: ${error.message}`);
            
            // Try fallback with evaluate as direct click
            try {
              await frame.evaluate((id) => {
                const element = document.querySelector(`[data-model-id="${id}"]`);
                if (element) {
                  // Try the element itself
                  element.click();
                  console.log(`Clicked bubble with ID ${id} using JavaScript`);
                  return true;
                }
                return false;
              }, bubble.id);
              await sleep(1000);
            } catch (evalError) {
              console.log(`Evaluate click also failed: ${evalError.message}`);
            }
          }
        }
      }
    }
    
    // Now handle the message button with enhanced detection
    console.log('Now attempting to click message button using direct mouse approach...');
    
    // Message button clicking: Try multiple times with fresh DOM evaluation each time
    const maxMessageClicks = params.maxMessageClicks || 10;
    let messageClickCount = 0;
    let nextButtonActive = false;
    
    // Loop for multiple message button clicks
    while (messageClickCount < maxMessageClicks && !nextButtonActive) {
      messageClickCount++;
      console.log(`Message button click attempt ${messageClickCount}/${maxMessageClicks}`);
      
      // Get fresh message button coordinates on EACH attempt
      const messageButtonInfo = await frame.evaluate(() => {
        // Known message button IDs
        const messageButtonIds = ['6l65RbsSaM0', '6ZIquEpaUG5'];
        
        // Find potential message buttons
        const messageButtons = [];
        
        // First look by ID (most reliable)
        for (const id of messageButtonIds) {
          const button = document.querySelector(`[data-model-id="${id}"]`);
          if (button && window.getComputedStyle(button).display !== 'none') {
            const rect = button.getBoundingClientRect();
            messageButtons.push({
              id: id,
              rect: {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height
              },
              priority: 1 // Highest priority
            });
          }
        }
        
        // Then look for elements with message icon or text
        const messageTextButtons = Array.from(document.querySelectorAll('[data-acc-text*="message"], [data-acc-text*="Message"], [data-acc-text="0/3"]'))
          .filter(el => !messageButtons.some(b => b.id === el.getAttribute('data-model-id')))
          .map(el => {
            const rect = el.getBoundingClientRect();
            return {
              id: el.getAttribute('data-model-id') || '',
              rect: {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height
              },
              priority: 2
            };
          });
        
        messageButtons.push(...messageTextButtons);
        
        // Look for blue rectangles (common for message buttons)
        const blueButtons = Array.from(document.querySelectorAll('svg path[stroke="#007F95"]'))
          .filter(path => {
            const button = path.closest('[data-model-id]');
            return button && !messageButtons.some(b => b.id === button.getAttribute('data-model-id'));
          })
          .map(path => {
            const button = path.closest('[data-model-id]');
            const rect = button.getBoundingClientRect();
            return {
              id: button.getAttribute('data-model-id') || '',
              rect: {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height
              },
              priority: 3
            };
          });
        
        messageButtons.push(...blueButtons);
        
        // Additional lookups: find elements with blue fills
        const blueFillElements = Array.from(document.querySelectorAll('svg path[fill="#007F95"]'))
          .filter(path => {
            const button = path.closest('[data-model-id]');
            return button && !messageButtons.some(b => b.id === button.getAttribute('data-model-id'));
          })
          .map(path => {
            const button = path.closest('[data-model-id]');
            const rect = button.getBoundingClientRect();
            return {
              id: button.getAttribute('data-model-id') || '',
              rect: {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height
              },
              priority: 4
            };
          });
          
        messageButtons.push(...blueFillElements);
        
        // Sort by priority and return
        messageButtons.sort((a, b) => a.priority - b.priority);
        
        // If no buttons found, return fixed position
        if (messageButtons.length === 0) {
          return { 
            x: 424, 
            y: 447, 
            width: 50, 
            height: 40,
            bottomLeftPosition: { x: window.innerWidth * 0.3, y: window.innerHeight * 0.8 },
            centerPosition: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
            id: null,
            buttons: [] 
          };
        }
        
        // Return the best button
        const bestButton = messageButtons[0];
        return {
          x: bestButton.rect.x,
          y: bestButton.rect.y,
          width: bestButton.rect.width,
          height: bestButton.rect.height,
          id: bestButton.id,
          bottomLeftPosition: { x: window.innerWidth * 0.3, y: window.innerHeight * 0.8 },
          centerPosition: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
          buttons: messageButtons
        };
      });
      
      console.log(`Message button found: ${messageButtonInfo.id || 'No ID'} at x=${messageButtonInfo.x}, y=${messageButtonInfo.y}`);
      
      // Try multiple click methods for message button
      let clickSuccess = false;
      
      // Method 1: Direct mouse click at coordinates (most reliable)
      try {
        await frame.mouse.click(messageButtonInfo.x, messageButtonInfo.y);
        console.log(`Clicked message button at coordinates (${messageButtonInfo.x}, ${messageButtonInfo.y})`);
        clickSuccess = true;
      } catch (error) {
        console.log(`Mouse click failed: ${error.message}`);
      }
      
      // Method 2: Try by ID if available and first method failed
      if (!clickSuccess && messageButtonInfo.id) {
        try {
          await frame.click(`[data-model-id="${messageButtonInfo.id}"]`);
          console.log(`Clicked message button with ID: ${messageButtonInfo.id}`);
          clickSuccess = true;
        } catch (error) {
          console.log(`ID click failed: ${error.message}`);
        }
      }
      
      // Method 3: Use JavaScript evaluate
      if (!clickSuccess) {
        try {
          const jsClickResult = await frame.evaluate((info) => {
            // Try known IDs first
            const messageButtonIds = ['6l65RbsSaM0', '6ZIquEpaUG5'];
            for (const id of messageButtonIds) {
              const button = document.querySelector(`[data-model-id="${id}"]`);
              if (button) {
                try {
                  button.click();
                  console.log(`[BROWSER] Clicked message button with ID: ${id}`);
                  return true;
                } catch (e) {
                  console.log(`[BROWSER] Error clicking by ID: ${e.message}`);
                }
              }
            }
            
            // Try clicking at coordinates
            try {
              const element = document.elementFromPoint(info.x, info.y);
              if (element) {
                element.click();
                console.log('[BROWSER] Clicked element at coordinates');
                return true;
              }
            } catch (e) {
              console.log(`[BROWSER] Error clicking at coordinates: ${e.message}`);
            }
            
            // Try bottom left position (common for message button)
            try {
              const element = document.elementFromPoint(info.bottomLeftPosition.x, info.bottomLeftPosition.y);
              if (element) {
                element.click();
                console.log('[BROWSER] Clicked element at bottom left position');
                return true;
              }
            } catch (e) {
              console.log(`[BROWSER] Error clicking at bottom left: ${e.message}`);
            }
            
            // Final fallback - click center of screen
            try {
              const element = document.elementFromPoint(info.centerPosition.x, info.centerPosition.y);
              if (element) {
                element.click();
                console.log('[BROWSER] Clicked element at center of screen');
                return true;
              }
            } catch (e) {
              console.log(`[BROWSER] Error clicking at center: ${e.message}`);
            }
            
            return false;
          }, messageButtonInfo);
          
          if (jsClickResult) {
            console.log('JavaScript click successful');
            clickSuccess = true;
          }
        } catch (error) {
          console.log(`JavaScript evaluation failed: ${error.message}`);
        }
      }
      
      // Wait a moment after click attempt
      await sleep(2000);
      
      // Check if next button is active after this click
      nextButtonActive = await frame.evaluate(() => {
        // Look for orange next button
        const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
        if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
          return false;
        }
        
        // Check if it has orange stroke (active state)
        const path = orangeButton.querySelector('svg path');
        if (!path) return false;
        
        const strokeColor = path.getAttribute('stroke');
        return strokeColor === '#FF9800'; // Orange stroke
      });
      
      if (nextButtonActive) {
        console.log(`Next button is now active after ${messageClickCount} message clicks`);
        break;
      } else {
        console.log('Next button not yet active, continuing with message clicks...');
      }
    }
    
    // Wait for next button to become active with polling approach if not already active
    if (!nextButtonActive) {
      console.log('Waiting for next button to become active (turn orange)...');
      
      const maxWaitTime = params.maxWaitTime || 20000; // 20 seconds wait time
      const startTime = Date.now();
      
      while (!nextButtonActive && (Date.now() - startTime < maxWaitTime)) {
        nextButtonActive = await frame.evaluate(() => {
          const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
          if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
            return false;
          }
          
          const path = orangeButton.querySelector('svg path');
          if (!path) return false;
          
          const strokeColor = path.getAttribute('stroke');
          return strokeColor === '#FF9800'; // Orange stroke
        });
        
        if (nextButtonActive) {
          console.log('Next button is now active, ready to click');
          break;
        }
        
        console.log('Next button not yet active, waiting...');
        await sleep(1000); // Check every second
      }
    }
    
    // Click the next button after message sequence
    console.log('Clicking next button after message sequence...');
    await sleep(1000); // Small delay before clicking
    
    // Use a robust approach to click the next button
    const nextButtonCoords = await frame.evaluate(() => {
      // Look for orange next button with all known IDs
      const nextButtonIds = ['5fQkkvFT1Hs', '5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'];
      
      for (const id of nextButtonIds) {
        const button = document.querySelector(`[data-model-id="${id}"]`);
        if (button && window.getComputedStyle(button).display !== 'none') {
          const rect = button.getBoundingClientRect();
          return { 
            x: rect.left + rect.width/2, 
            y: rect.top + rect.height/2,
            id: id 
          };
        }
      }
      
      // Look for elements with orange stroke
      const orangeElements = document.querySelectorAll('svg path[stroke="#FF9800"]');
      for (const el of orangeElements) {
        const parent = el.closest('[data-model-id]');
        if (parent) {
          const rect = parent.getBoundingClientRect();
          return {
            x: rect.left + rect.width/2,
            y: rect.top + rect.height/2,
            id: parent.getAttribute('data-model-id')
          };
        }
      }
      
      // Fallback to fixed position or bottom right
      return { 
        x: 845, 
        y: 451,
        bottomRight: {
          x: window.innerWidth - 50,
          y: window.innerHeight - 50
        },
        id: null
      };
    });
    
    console.log(`Next button coordinates: x=${nextButtonCoords.x}, y=${nextButtonCoords.y}, id=${nextButtonCoords.id || 'none'}`);
    
    // Try multiple approaches to click the next button
    let nextButtonClicked = false;
    
    // Approach 1: Try direct mouse click at coordinates
    try {
      await frame.mouse.click(nextButtonCoords.x, nextButtonCoords.y);
      console.log(`Clicked next button at coordinates (${nextButtonCoords.x}, ${nextButtonCoords.y})`);
      nextButtonClicked = true;
    } catch (error) {
      console.log(`Mouse click failed: ${error.message}`);
    }
    
    // Approach 2: Try by ID if available
    if (!nextButtonClicked && nextButtonCoords.id) {
      try {
        await frame.click(`[data-model-id="${nextButtonCoords.id}"]`);
        console.log(`Clicked next button with ID: ${nextButtonCoords.id}`);
        nextButtonClicked = true;
      } catch (error) {
        console.log(`ID click failed: ${error.message}`);
      }
    }
    
    // Approach 3: Use JavaScript evaluate with multiple fallbacks
    if (!nextButtonClicked) {
      try {
        const clicked = await frame.evaluate((coords) => {
          // Try all known next button IDs
          const nextButtonIds = ['5fQkkvFT1Hs', '5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'];
          
          for (const id of nextButtonIds) {
            const button = document.querySelector(`[data-model-id="${id}"]`);
            if (button) {
              try {
                button.click();
                console.log(`[BROWSER] Clicked next button with ID: ${id}`);
                return true;
              } catch (e) {
                console.log(`[BROWSER] Error clicking next button ${id}: ${e}`);
              }
            }
          }
          
          // Try elements with orange stroke
          const orangeStrokes = document.querySelectorAll('path[stroke="#FF9800"]');
          for (const stroke of orangeStrokes) {
            const button = stroke.closest('[data-model-id]');
            if (button) {
              try {
                button.click();
                console.log('[BROWSER] Clicked element with orange stroke');
                return true;
              } catch (e) {
                console.log(`[BROWSER] Error clicking orange element: ${e}`);
              }
            }
          }
          
          // Try clicking at bottom right
          try {
            const element = document.elementFromPoint(coords.bottomRight.x, coords.bottomRight.y);
            if (element) {
              element.click();
              console.log('[BROWSER] Clicked at bottom right corner');
              return true;
            }
          } catch (e) {
            console.log(`[BROWSER] Error clicking at bottom right: ${e}`);
          }
          
          return false;
        }, nextButtonCoords);
        
        if (clicked) {
          console.log('JavaScript click for next button was successful');
          nextButtonClicked = true;
        }
      } catch (error) {
        console.log(`JavaScript evaluation failed: ${error.message}`);
      }
    }
    
    // Approach 4: Final attempt - click at bottom right
    if (!nextButtonClicked && nextButtonCoords.bottomRight) {
      try {
        await frame.mouse.click(nextButtonCoords.bottomRight.x, nextButtonCoords.bottomRight.y);
        console.log(`Final attempt: Clicked at bottom right (${nextButtonCoords.bottomRight.x}, ${nextButtonCoords.bottomRight.y})`);
        nextButtonClicked = true;
      } catch (error) {
        console.log(`Bottom right click failed: ${error.message}`);
      }
    }
    
    // Wait for transition to next slide
    await sleep(params.waitAfter || 5000);
    
    return true;
}

/**
 * Click the orange plus button (circle) on the pharmacy/kindergarten scene
 * @param {Object} frame - Puppeteer frame or page
 * @param {Object} params - Additional parameters
 */
async function clickOrangePlusButton(frame, params = {}) {
    console.log('Looking for orange plus button to click...');
    
    // Try with the known ID first
    const knownButtonId = '5mnzOCmvQcX';
    
    try {
      console.log(`Looking for plus button with ID: ${knownButtonId}`);
      const buttonExists = await frame.waitForSelector(`[data-model-id="${knownButtonId}"]`, { 
        visible: true, 
        timeout: params.timeout || 15000 
      }).then(() => true).catch(() => false);
      
      if (buttonExists) {
        console.log(`Plus button found with ID: ${knownButtonId}, clicking it...`);
        await frame.click(`[data-model-id="${knownButtonId}"]`);
        console.log('Clicked the orange plus button');
        await sleep(params.delay || 3000);
        return true;
      }
    } catch (error) {
      console.log(`Error clicking plus button with ID ${knownButtonId}: ${error.message}`);
    }
    
    // If we couldn't find the button by ID, try using more generic selectors
    try {
      console.log('Trying to find plus button by attributes...');
      
      const clicked = await frame.evaluate(() => {
        // Look for orange-stroked circles
        const orangeStrokes = document.querySelectorAll('path[stroke="#FF9800"]');
        for (const element of orangeStrokes) {
          const parent = element.closest('[data-model-id]');
          if (parent) {
            parent.click();
            console.log('Clicked element with orange stroke');
            return true;
          }
        }
        
        // Also look for any element with "Oval" in its acc-text
        const ovalElements = document.querySelectorAll('[data-acc-text*="Oval"]');
        for (const element of ovalElements) {
          element.click();
          console.log('Clicked oval element');
          return true;
        }
        
        return false;
      });
      
      if (clicked) {
        console.log('Successfully clicked plus button using fallback method');
        await sleep(params.delay || 3000);
        return true;
      }
    } catch (error) {
      console.log(`Error with fallback button click: ${error.message}`);
    }
    
    // If all else fails, try clicking around where plus buttons typically are
    console.log('Could not find plus button, trying positional clicks...');
    
    await frame.evaluate(() => {
      // Click in the left side area where the plus button appears to be in screenshot
      const positions = [
        { x: 30, y: 30 },                                // Upper left
        { x: 30, y: window.innerHeight - 150 }           // Bottom left
      ];
      
      for (const pos of positions) {
        const element = document.elementFromPoint(pos.x, pos.y);
        if (element) {
          element.click();
          console.log(`Clicked element at position (${pos.x}, ${pos.y})`);
        }
      }
    });
    
    console.log('Attempted positional clicks as last resort');
    await sleep(params.delay || 3000);
    return false;
}

/**
 * Handle carousel navigation by clicking through a specified number of slides
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function handleCarouselNavigation(frame, params = {}) {
    try {
      console.log('Attempting carousel navigation with FORCED approach...');
      
      // Known carousel navigation IDs in order
      const carouselButtonIds = [
        '6d9K1sUhmhU',  // First slide
        '5gpDrv2tka1'   // Second slide
      ];
      
      // Create unique keys for tracking - this is critical for state management
      const counterKey = 'carouselClickCounter_' + (frame._frameId || 'default');
      const carouselCompletedKey = 'carouselNavigationCompleted_' + (frame._frameId || 'default');
      
      // Initialize the counter for this specific frame if it doesn't exist
      if (typeof global[counterKey] === 'undefined') {
        global[counterKey] = 0;
      }
      
      // Default to 2 clicks if not specified
      const maxClicks = params.maxClicks || 2;
      
      // Select the current ID based on the counter and array length
      const currentButtonId = carouselButtonIds[global[counterKey] % carouselButtonIds.length];
      
      console.log(`Attempting to click carousel button with ID: ${currentButtonId} (Click ${global[counterKey] + 1}/${maxClicks})`);
      
      try {
        const clickSuccess = await frame.evaluate((id) => {
          // First try the specific SVG event target for highest reliability
          const eventableElement = document.querySelector(`[data-model-id="${id}"] svg g.eventable`);
          
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
            console.log(`Dispatched full event sequence on SVG eventable element with ID: ${id}`);
            return true;
          }
          
          return false;
        }, currentButtonId);
        
        if (clickSuccess) {
          console.log(`Successfully clicked carousel button with ID: ${currentButtonId}`);
          
          // Increment the counter for the next call
          global[counterKey]++;
          
          await sleep(params.delayBetweenClicks || 2000); // Wait between carousel clicks
          
          // Check if we've reached the maximum number of clicks
          if (global[counterKey] >= maxClicks) {
            console.log('Completed specified number of carousel clicks. Moving to next slide.');
            
            // Reset the counter to prevent continuous incrementing
            global[counterKey] = 0;
            
            // CRITICAL: Use the comprehensive orange next button click function
            console.log('Attempting to click orange next button after carousel...');
            
            // Use exactly the approach from dorithricin1.js for the orange next button click
            await clickOrangeNextButton(frame);
            
            // Set the flag to indicate carousel navigation is complete
            global[carouselCompletedKey] = true;
            
            // Wait after clicking to ensure transition completes
            await sleep(params.waitAfterNext || 3000);
            
            return true;
          }
          
          // If we haven't reached max clicks, return false to signal we need more clicks
          return false;
        }
      } catch (error) {
        console.log(`Error processing button with ID ${currentButtonId}:`, error.message);
      }
      
      // If the primary click method failed, try to continue with next button as fallback
      console.log('Carousel navigation primary click failed, trying next button as fallback');
      await clickNextButton(frame);
      
      return true;
    } catch (error) {
      console.error('Error in carousel navigation:', error.message);
      
      // Try to recover by clicking next button
      try {
        await clickNextButton(frame);
      } catch (e) {
        console.log('Recovery attempt also failed:', e.message);
      }
      
      return false;
    }
}
  
/**
 * Click the orange next button in carousel slides
 * @param {Object} frame - Puppeteer frame or page
 */
async function clickOrangeNextButton(frame) {
    try {
      console.log('Looking for active orange next button...');
      
      // First, gather comprehensive information about all potential next buttons
      let buttonInfo;
      try {
        buttonInfo = await frame.evaluate(() => {
          // Collection of selectors that might match next buttons
          const nextButtonSelectors = [
            // Known specific IDs
            '[data-model-id="5fQkkvFT1Hs"]',
            '[data-model-id="5fJnOnqo2Mn"]',
            '[data-model-id="6SnZaWfxQZH"]',
            '[data-model-id="6p3OI0ZXRkJ"]',
            '[data-model-id="6bfu7dbXM45"]',
            // Visual attributes
            'svg path[stroke="#FF9800"]',
            // Role-based
            'div[role="button"]',
            'button',
            // Text-based
            '[data-acc-text*="next"]',
            '[data-acc-text*="Next"]',
            '[data-acc-text*="weiter"]',
            '[data-acc-text*="Weiter"]'
          ];
          
          // Find all potential buttons
          const potentialButtons = [];
          
          for (const selector of nextButtonSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
              // Get the actual clickable element (might be parent or child)
              let clickableEl = el;
              
              // If we found a path, we need to go up to find the clickable wrapper
              if (el.tagName.toLowerCase() === 'path') {
                clickableEl = el.closest('[data-model-id]') || el.closest('div[role="button"]') || el;
              }
              
              // Skip if already found or invisible
              if (potentialButtons.some(b => b.element === clickableEl) || 
                  window.getComputedStyle(clickableEl).display === 'none') {
                continue;
              }
              
              const rect = clickableEl.getBoundingClientRect();
              potentialButtons.push({
                element: clickableEl,
                id: clickableEl.getAttribute('data-model-id') || '',
                selector: clickableEl.getAttribute('data-model-id') 
                  ? `[data-model-id="${clickableEl.getAttribute('data-model-id')}"]`
                  : selector,
                text: clickableEl.getAttribute('data-acc-text') || clickableEl.textContent,
                isOrange: !!clickableEl.querySelector('path[stroke="#FF9800"]'),
                coords: {
                  x: rect.left + rect.width/2,
                  y: rect.top + rect.height/2,
                },
                isBottomRight: (rect.left > window.innerWidth * 0.7 && rect.top > window.innerHeight * 0.7),
                isVisible: rect.width > 0 && rect.height > 0
              });
            }
          }
          
          // Add bottom-right position as a fallback (where next buttons are often located)
          const bottomRightX = window.innerWidth - 50;
          const bottomRightY = window.innerHeight - 50;
          
          // Score buttons by likelihood of being the next button
          const scoredButtons = potentialButtons
            .filter(btn => btn.isVisible) // Must be visible
            .map(btn => {
              let score = 0;
              
              // Orange color is a strong indicator
              if (btn.isOrange) score += 50;
              
              // Bottom right position is common for next buttons
              if (btn.isBottomRight) score += 30;
              
              // Known next button IDs
              if (['5fQkkvFT1Hs', '5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'].includes(btn.id)) {
                score += 40;
              }
              
              // Button text indicates it's a next button
              if (btn.text && /next|weiter|continue|forward/i.test(btn.text)) {
                score += 20;
              }
              
              return {...btn, score};
            })
            .sort((a, b) => b.score - a.score); // Sort by descending score
          
          return {
            buttons: scoredButtons,
            bottomRight: {x: bottomRightX, y: bottomRightY}
          };
        });
      } catch (evalError) {
        console.log(`Error evaluating button info: ${evalError.message}`);
        buttonInfo = null;
      }
      
      // If evaluate failed, set default values to avoid null reference errors
      if (!buttonInfo) {
        console.log('Setting default button information due to evaluation failure');
        buttonInfo = {
          buttons: [],
          bottomRight: {
            x: 845,  // Default position based on common next button location
            y: 450
          }
        };
      }
      
      // Ensure buttons array exists even if no buttons found
      if (!buttonInfo.buttons) {
        buttonInfo.buttons = [];
      }
      
      if (buttonInfo.buttons.length === 0) {
        console.log('No potential next buttons found, using fallback methods');
        // Continue with fallback methods
      } else {
        console.log(`Found ${buttonInfo.buttons.length} potential next buttons`);
        buttonInfo.buttons.forEach((btn, i) => {
          console.log(`Button ${i+1}: ID=${btn.id}, Score=${btn.score}, IsOrange=${btn.isOrange}, Position=(${btn.coords?.x || 'unknown'},${btn.coords?.y || 'unknown'})`);
        });
      }
      
      // Try the direct method first - look for known next button IDs and click
      try {
        const nextButtonSelectors = [
          '[data-model-id="5fQkkvFT1Hs"]',  // Orange next (most common)
          '[data-model-id="5fJnOnqo2Mn"]',
          '[data-model-id="6SnZaWfxQZH"]',
          '[data-model-id="6p3OI0ZXRkJ"]',
          '[data-model-id="6bfu7dbXM45"]'
        ];
        
        for (const selector of nextButtonSelectors) {
          const exists = await frame.evaluate(
            (sel) => {
              const el = document.querySelector(sel);
              return el && window.getComputedStyle(el).display !== 'none';
            },
            selector
          );
          
          if (exists) {
            console.log(`Found next button with selector: ${selector}`);
            await frame.click(selector);
            console.log(`Clicked next button with selector: ${selector}`);
            return true;
          }
        }
      } catch (directError) {
        console.log(`Direct next button click failed: ${directError.message}`);
      }
      
      // If we have button information, try clicking the best button
      let clicked = false;
      if (buttonInfo.buttons.length > 0) {
        // Get the highest scored button
        const bestButton = buttonInfo.buttons[0];
        
        // 1. First try: standard click on the element
        try {
          await frame.click(bestButton.selector);
          console.log(`Clicked button with selector: ${bestButton.selector}`);
          clicked = true;
        } catch (e) {
          console.log(`Standard click failed: ${e.message}`);
        }
        
        // 2. Second try: mouse click at coordinates if they exist
        if (!clicked && bestButton.coords) {
          try {
            await frame.mouse.click(bestButton.coords.x, bestButton.coords.y);
            console.log(`Clicked at coordinates: (${bestButton.coords.x}, ${bestButton.coords.y})`);
            clicked = true;
          } catch (e) {
            console.log(`Coordinate click failed: ${e.message}`);
          }
        }
        
        // 3. Third try: advanced DOM-level events
        if (!clicked) {
          try {
            clicked = await frame.evaluate((selector) => {
              const button = document.querySelector(selector);
              if (!button) return false;
              
              try {
                // Try different click techniques
                button.click();
                
                // Also dispatch events manually
                const rect = button.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                
                // Complete event sequence
                const events = [
                  new MouseEvent('mouseover', {bubbles:true, cancelable:true, clientX:centerX, clientY:centerY}),
                  new MouseEvent('mousedown', {bubbles:true, cancelable:true, clientX:centerX, clientY:centerY}),
                  new MouseEvent('mouseup', {bubbles:true, cancelable:true, clientX:centerX, clientY:centerY}),
                  new MouseEvent('click', {bubbles:true, cancelable:true, clientX:centerX, clientY:centerY})
                ];
                
                events.forEach(e => button.dispatchEvent(e));
                return true;
              } catch (e) {
                console.log(`DOM event click failed: ${e.message}`);
                return false;
              }
            }, bestButton.selector);
            
            if (clicked) {
              console.log('Clicked using DOM-level events');
            }
          } catch (evalError) {
            console.log(`DOM event evaluation failed: ${evalError.message}`);
          }
        }
      }
      
      // 4. Fourth try: fallback to bottom-right click
      if (!clicked) {
        try {
          const bottomRightX = buttonInfo.bottomRight?.x || 845;
          const bottomRightY = buttonInfo.bottomRight?.y || 450;
          
          await frame.mouse.click(bottomRightX, bottomRightY);
          console.log(`Fallback: clicked at bottom-right (${bottomRightX}, ${bottomRightY})`);
          clicked = true;
        } catch (e) {
          console.log(`Bottom-right click failed: ${e.message}`);
        }
      }
      
      // 5. Last attempt: try clicking other buttons if we have them
      if (!clicked && buttonInfo.buttons.length > 1) {
        console.log('Attempting to click other candidate buttons...');
        
        for (let i = 1; i < Math.min(buttonInfo.buttons.length, 3); i++) {
          const btn = buttonInfo.buttons[i];
          try {
            await frame.click(btn.selector);
            console.log(`Clicked alternative button ${i+1}: ${btn.selector}`);
            clicked = true;
            break;
          } catch (e) {
            console.log(`Failed to click alternative button ${i+1}: ${e.message}`);
          }
        }
      }
      
      // 6. Final fallback: try to find any actionable elements in bottom right quadrant
      if (!clicked) {
        console.log('All regular attempts failed, trying final fallback method...');
        
        try {
          const finalResult = await frame.evaluate(() => {
            // Look in the bottom right quadrant
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Try a grid of points in the bottom right
            for (let x = 0.7; x <= 0.9; x += 0.1) {
              for (let y = 0.7; y <= 0.9; y += 0.1) {
                const element = document.elementFromPoint(width * x, height * y);
                if (element) {
                  // Try to find a clickable parent if the element itself isn't clickable
                  const clickTarget = element.closest('[role="button"]') || 
                                     element.closest('button') || 
                                     element.closest('[data-model-id]') || 
                                     element;
                  
                  if (clickTarget) {
                    clickTarget.click();
                    console.log(`[BROWSER] Clicked element in bottom right quadrant`);
                    return true;
                  }
                }
              }
            }
            
            // Try one last point
            const elementAtCorner = document.elementFromPoint(width - 50, height - 50);
            if (elementAtCorner) {
              elementAtCorner.click();
              console.log('[BROWSER] Clicked element at very bottom right corner');
              return true;
            }
            
            return false;
          });
          
          if (finalResult) {
            console.log('Final fallback method succeeded');
            clicked = true;
          }
        } catch (evalError) {
          console.log(`Final fallback method failed: ${evalError.message}`);
        }
      }
      
      // Wait briefly for any transitions or animations after clicking
      await sleep(2000);
      
      return clicked;
    } catch (error) {
      console.error('Error in clickOrangeNextButton:', error.message);
      
      // Even if we had an error, try a last desperate measure
      try {
        console.log('Attempting one last fallback click in bottom right corner...');
        await frame.evaluate(() => {
          const rightSide = window.innerWidth - 50;
          const bottomSide = window.innerHeight - 50;
          const element = document.elementFromPoint(rightSide, bottomSide);
          if (element) element.click();
        });
      } catch (e) {
        console.log('Last resort click also failed');
      }
      
      return false;
    }
}

/**
 * Click Weiter button on completion screen
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function clickWeiterButton(frame, params = {}) {
  console.log('Attempting to click Weiter button...');
  
  // Try with evaluate to find and click the button
  const clicked = await frame.evaluate(() => {
    // Strategy 1: Look for text
    const byText = Array.from(document.querySelectorAll('[data-acc-text], button, div[role="button"]'))
      .filter(el => {
        const text = el.textContent || el.getAttribute('data-acc-text') || '';
        return text.includes('Weiter') || text.includes('Continue');
      });
    
    if (byText.length > 0) {
      byText[0].click();
      console.log('Clicked Weiter button by text');
      return true;
    }
    
    // Strategy 2: Look for blue teal buttons
    const blueButtons = Array.from(document.querySelectorAll('div.slide-object-vectorshape'))
      .filter(btn => {
        const fill = btn.querySelector('path')?.getAttribute('fill');
        return fill === '#007F95' || fill?.includes('007F');
      });
    
    if (blueButtons.length > 0) {
      blueButtons[0].click();
      console.log('Clicked blue button matching Weiter style');
      return true;
    }
    
    // Strategy 3: Click at bottom left (common Weiter position)
    const x = 100;
    const y = window.innerHeight - 50;
    const element = document.elementFromPoint(x, y);
    
    if (element) {
      element.click();
      console.log('Clicked at likely Weiter button position');
      return true;
    }
    
    return false;
  });
  
  if (clicked) {
    console.log('Successfully clicked Weiter button');
  } else {
    console.log('Failed to find and click Weiter button');
  }
  
  await sleep(params.waitAfter || 3000);
  return clicked;
}

/**
 * Click "Training schließen" on final screen
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function clickTrainingSchliessen(frame, params = {}) {
  console.log('Attempting to click Training schließen button...');
  
  // Try with evaluate to find and click the button
  const clicked = await frame.evaluate(() => {
    // Strategy 1: Look for text
    const byText = Array.from(document.querySelectorAll('[data-acc-text], button, div.slide-object-vectorshape'))
      .filter(el => {
        const text = el.textContent || el.getAttribute('data-acc-text') || '';
        return text.includes('schließen') || text.includes('Training');
      });
    
    if (byText.length > 0) {
      byText[0].click();
      console.log('Clicked Training schließen by text');
      return true;
    }
    
    // Strategy 2: Look by known ID
    const byId = document.querySelector('[data-model-id="6QYaZJzOXoM"]');
    if (byId) {
      byId.click();
      console.log('Clicked Training schließen by ID');
      return true;
    }
    
    // Strategy 3: Look for blue teal buttons (common color for this button)
    const blueButtons = Array.from(document.querySelectorAll('div.slide-object-vectorshape'))
      .filter(btn => {
        const fill = btn.querySelector('path')?.getAttribute('fill');
        return fill === '#007F95' || fill?.includes('007F');
      });
    
    if (blueButtons.length > 0) {
      blueButtons[0].click();
      console.log('Clicked blue button matching Training schließen style');
      return true;
    }
    
    // Strategy 4: Click at bottom left corner (common position)
    const x = 100;
    const y = window.innerHeight - 50;
    const element = document.elementFromPoint(x, y);
    
    if (element) {
      element.click();
      console.log('Clicked at likely Training schließen position');
      return true;
    }
    
    return false;
  });
  
  if (clicked) {
    console.log('Successfully clicked Training schließen button');
  } else {
    console.log('Failed to find and click Training schließen button');
  }
  
  await sleep(params.waitAfter || 5000);
  return clicked;
}

/**
 * Click the SCORM start button that appears after the initial black screen
 * @param {Object} frame - Puppeteer frame or page
 * @param {Object} params - Additional parameters
 */
async function clickScormStartButton(frame, params = {}) {
    console.log('Waiting for SCORM content start button to appear...');
    
    // Known IDs for the SCORM start button
    const startButtonIds = ['6eUA3GjhbF3', '6lDgYO2arca'];
    
    // Try waiting for each possible button ID
    let startButtonFound = false;
    
    for (const buttonId of startButtonIds) {
      try {
        const waitOptions = { 
          visible: true, 
          timeout: params.timeout || 30000 
        };
        
        console.log(`Looking for start button with ID: ${buttonId}`);
        const buttonExists = await frame.waitForSelector(`[data-model-id="${buttonId}"]`, waitOptions)
          .then(() => true)
          .catch(() => false);
        
        if (buttonExists) {
          console.log(`Start button found with ID: ${buttonId}, clicking it...`);
          await frame.click(`[data-model-id="${buttonId}"]`);
          console.log('Clicked the SCORM start button');
          startButtonFound = true;
          break;
        }
      } catch (error) {
        console.log(`Error waiting for or clicking button with ID ${buttonId}: ${error.message}`);
      }
    }
    
    // If we couldn't find a button by ID, try by text content
    if (!startButtonFound) {
      try {
        console.log('Looking for start button by text content...');
        
        const buttonClicked = await frame.evaluate(() => {
          // Look for elements with "Start" text
          const elements = Array.from(document.querySelectorAll('div, button, [role="button"]'))
            .filter(el => {
              const text = el.textContent?.trim().toLowerCase() || '';
              return text === 'start' || text === 'starten';
            });
            
          if (elements.length > 0) {
            elements[0].click();
            return true;
          }
          
          // Try clicking blue buttons as fallback
          const blueButtons = Array.from(document.querySelectorAll('path[fill="#007F95"]'))
            .map(el => el.closest('[data-model-id]'))
            .filter(Boolean);
            
          if (blueButtons.length > 0) {
            blueButtons[0].click();
            return true;
          }
          
          return false;
        });
        
        if (buttonClicked) {
          console.log('Clicked start button by text content or color');
          startButtonFound = true;
        }
      } catch (error) {
        console.log(`Error with text-based button search: ${error.message}`);
      }
    }
    
    // Final fallback - click in the center of the screen
    if (!startButtonFound) {
      console.log('Start button not found by ID or text, trying position-based approach...');
      
      await frame.evaluate(() => {
        // Try positions where the Start button might be
        const positions = [
          { x: window.innerWidth / 2, y: window.innerHeight * 0.8 }, // Bottom center
          { x: window.innerWidth / 2, y: window.innerHeight / 2 }    // Center
        ];
        
        for (const pos of positions) {
          const element = document.elementFromPoint(pos.x, pos.y);
          if (element) {
            element.click();
            console.log(`Clicked element at position (${pos.x}, ${pos.y})`);
            return true;
          }
        }
        
        return false;
      });
    }
    
    // Wait for any transitions after clicking
    await sleep(params.waitAfter || 5000);
}

/**
 * Wait for content and proceed to next slide
 * @param {Object} frame - Puppeteer page or frame
 * @param {Object} params - Additional parameters
 */
async function waitForContentAndProceedToNext(frame, params = {}) {
  try {
    console.log('Waiting for slide content to fully load...');
    
    // Extended initial wait for bee animation
    const initialWait = params.initialWait || 20000; // 20 seconds
    console.log(`Waiting ${initialWait/1000}s for animations...`);
    await sleep(initialWait);

    // New: Active polling for orange button state
    const maxWaitTime = 30000; // 30 seconds total
    const startTime = Date.now();
    let buttonState;

    while (Date.now() - startTime < maxWaitTime) {
      buttonState = await frame.evaluate(() => {
        const orangeButton = document.querySelector('[data-model-id="5fJnOnqo2Mn"]');
        if (!orangeButton) return { status: 'not-found' };

        const isVisible = window.getComputedStyle(orangeButton).display !== 'none';
        const path = orangeButton.querySelector('svg path');
        const hasOrangeStroke = path?.getAttribute('stroke') === '#FF9800';

        return { status: 'found', isVisible, hasOrangeStroke };
      });

      if (buttonState.status === 'found' && buttonState.hasOrangeStroke) {
        console.log('Orange button active!');
        break;
      }

      console.log('Orange button not ready, waiting...');
      await sleep(2000); // Check every 2 seconds
    }

    // Only click if button is ready
    if (buttonState?.hasOrangeStroke) {
      console.log('Clicking verified orange button');
      await frame.click('[data-model-id="5fJnOnqo2Mn"]');
    } else {
      console.log('Orange button never activated, using last-resort click');
      await frame.evaluate(() => {
        document.elementFromPoint(window.innerWidth - 50, window.innerHeight - 50)?.click();
      });
    }

    await sleep(params.waitAfter || 3000);
    return true;
  } catch (error) {
    console.error('Info slide handling failed:', error);
    return false;
  }
}

// Export all interaction functions
module.exports = {
    clickStartButton,
    clickNextButton,
    pressSpaceKey,
    clickAllRiskFactors,
    handleMessageDialogSequence,
    clickMediBee,
    handleSliderInteraction,
    handleCarouselNavigation,
    clickWeiterButton,
    clickTrainingSchliessen,
    waitForContentAndProceedToNext,
    waitForDialogAndPressSpace,
    clickScormStartButton,
    clickOrangePlusButton,
    handleSpeechBubbles,
    handlePercentageDragAndDrop,
    handleGenericNextButtonState,
    handleMessageButtons,
    handleMemoElements,
    handleMessageDialogFive
};