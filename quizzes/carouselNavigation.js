// carouselNavigation.js
// Independent carousel navigation module for dorithricin.js
// This file contains all necessary functions to handle carousel navigation without 
// any dependencies on pageInteractions.js

/**
 * Helper function for delays
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after the specified time
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
/**
 * Enhanced function to click the orange next button after carousel slides
 * @param {Object} scormFrame - Puppeteer frame
 * @returns {Boolean} - Success status
 */
async function clickCarouselNextButton(scormFrame) {
    try {
      console.log('Attempting to click orange next button after carousel with enhanced approach...');
      
      // Step 1: Get detailed info about all button components
      const buttonInfo = await scormFrame.evaluate(() => {
        // Target all potentially clickable elements in the button group
        const targetIds = [
          '6jNtMM4JcZw', // Orange fill circle (parent state group)
          '6UFXGmwSpE1', // White arrow
          '5fQkkvFT1Hs', // Orange stroke circle
          // Include child elements and SVG paths
          'uniqueDomId-3086', // The specific path ID from your HTML snippet
        ];
        
        // Information about all target elements
        const elements = {};
        
        // Get positions of all elements
        targetIds.forEach(id => {
          // Try different selector strategies
          let element = document.querySelector(`[data-model-id="${id}"]`);
          if (!element && id.startsWith('uniqueDomId')) {
            element = document.getElementById(id);
          }
          
          if (element) {
            const rect = element.getBoundingClientRect();
            elements[id] = {
              exists: true,
              rect: {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2,
                width: rect.width,
                height: rect.height
              }
            };
          } else {
            elements[id] = { exists: false };
          }
        });
        
        // Also locate the SVG eventable element specifically
        const eventableElements = Array.from(document.querySelectorAll('g.eventable'));
        const eventablePositions = eventableElements.map(el => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left + rect.width/2,
            y: rect.top + rect.height/2,
            width: rect.width,
            height: rect.height
          };
        });
        
        return {
          elements,
          eventablePositions,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
      });
      
      console.log('Button element info:', JSON.stringify(buttonInfo));
      
      // Step 2: Try multiple click strategies
      
      // Strategy 1: Click each target element directly
      const targetIds = ['6jNtMM4JcZw', '5fQkkvFT1Hs', '6UFXGmwSpE1'];
      for (const id of targetIds) {
        if (buttonInfo.elements[id]?.exists) {
          try {
            console.log(`Attempting to click element with ID: ${id}`);
            await scormFrame.click(`[data-model-id="${id}"]`);
            console.log(`Clicked element with ID: ${id}`);
            await sleep(1000); // Small delay to check effect
            
            // Check if the click had an effect
            const newUrl = await scormFrame.evaluate(() => window.location.href);
            console.log(`Current URL after click: ${newUrl}`);
            
            // Continue with more strategies even if this one worked
          } catch (e) {
            console.log(`Error clicking element with ID ${id}:`, e.message);
          }
        }
      }
      
      // Strategy 2: Click using more precise SVG selectors
      try {
        console.log('Attempting to click SVG element directly...');
        await scormFrame.evaluate(() => {
          // Try to find the most specific clickable SVG element
          const svgSelectors = [
            'g.eventable',
            'svg[data-commandset-id="19"] g',
            'path[stroke="#FF9800"]',
            'path[fill="#FF9800"]'
          ];
          
          for (const selector of svgSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
              try {
                // Try both direct click and event dispatch
                el.click();
                
                // Also dispatch a complete set of events
                const rect = el.getBoundingClientRect();
                const x = rect.left + rect.width/2;
                const y = rect.top + rect.height/2;
                
                const events = [
                  new MouseEvent('mouseover', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                  new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                  new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y}),
                  new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: x, clientY: y})
                ];
                
                events.forEach(event => el.dispatchEvent(event));
                console.log(`Dispatched events on ${selector}`);
              } catch (e) {
                console.log(`Error with selector ${selector}:`, e);
              }
            }
          }
        });
        console.log('Completed SVG direct interaction');
      } catch (e) {
        console.log('Error in SVG clicking strategy:', e.message);
      }
      
      // Strategy 3: Target the parent container precisely
      try {
        console.log('Attempting to click state group container...');
        await scormFrame.evaluate(() => {
          const stateGroup = document.querySelector('div.slide-object-stategroup.shown.cursor-hover[data-model-id="6jNtMM4JcZw"]');
          if (stateGroup) {
            // Click at different positions within the element
            const rect = stateGroup.getBoundingClientRect();
            const coords = [
              {x: rect.left + rect.width/2, y: rect.top + rect.height/2}, // Center
              {x: rect.left + rect.width/4, y: rect.top + rect.height/4}, // Top-left quarter
              {x: rect.left + rect.width*3/4, y: rect.top + rect.height*3/4} // Bottom-right quarter
            ];
            
            for (const coord of coords) {
              const el = document.elementFromPoint(coord.x, coord.y);
              if (el) {
                el.click();
                console.log(`Clicked at position (${coord.x}, ${coord.y})`);
              }
            }
          }
        });
      } catch (e) {
        console.log('Error clicking state group container:', e.message);
      }
      
      // Strategy 4: Use mouse clicks at precise coordinates from our button info
      if (buttonInfo.eventablePositions.length > 0) {
        for (const pos of buttonInfo.eventablePositions) {
          try {
            console.log(`Mouse clicking at eventable coordinates: (${pos.x}, ${pos.y})`);
            await scormFrame.mouse.click(pos.x, pos.y);
            await sleep(1000);
          } catch (e) {
            console.log(`Error clicking at eventable coordinates:`, e.message);
          }
        }
      }
      
      // Strategy 5: Simulate interaction with all parent and child elements
      try {
        console.log('Attempting comprehensive DOM interaction...');
        await scormFrame.evaluate(() => {
          function clickAllRelated(element) {
            if (!element) return;
            
            // Click the element itself
            try {
              element.click();
            } catch (e) {}
            
            // Create and dispatch events directly
            try {
              const rect = element.getBoundingClientRect();
              const x = rect.left + rect.width/2;
              const y = rect.top + rect.height/2;
              
              element.dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true, cancelable: true, view: window,
                clientX: x, clientY: y
              }));
              
              element.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true, cancelable: true, view: window,
                clientX: x, clientY: y
              }));
              
              element.dispatchEvent(new MouseEvent('click', {
                bubbles: true, cancelable: true, view: window,
                clientX: x, clientY: y
              }));
            } catch (e) {}
            
            // Try parent
            if (element.parentElement) {
              clickAllRelated(element.parentElement);
            }
            
            // Try children
            Array.from(element.children).forEach(child => {
              clickAllRelated(child);
            });
          }
          
          // Start with the main elements
          const startElements = [
            document.querySelector('[data-model-id="6jNtMM4JcZw"]'),
            document.querySelector('[data-model-id="5fQkkvFT1Hs"]')
          ];
          
          startElements.forEach(el => {
            if (el) clickAllRelated(el);
          });
        });
      } catch (e) {
        console.log('Error in comprehensive DOM interaction:', e.message);
      }
      
      // Strategy 6: Last resort - click at bottom right corner
      try {
        const bottomRight = {
          x: buttonInfo.viewport.width - 50,
          y: buttonInfo.viewport.height - 50
        };
        
        console.log(`Last resort: clicking at bottom right (${bottomRight.x}, ${bottomRight.y})`);
        await scormFrame.mouse.click(bottomRight.x, bottomRight.y);
      } catch (e) {
        console.log('Error in bottom right click:', e.message);
      }
      
      // Wait for any click effects
      await sleep(3000);
      
      console.log('Completed all click strategies for carousel next button');
      return true;
    } catch (error) {
      console.error('Error in enhanced carousel next button click:', error.message);
      return false;
    }
}
  
/**
 * Basic next button click function as fallback
 * @param {Object} scormFrame - Puppeteer frame
 * @returns {Boolean} - Success status
 */
async function clickNextButton(scormFrame) {
    try {
      console.log('Attempting to click next button...');
      
      const clicked = await scormFrame.evaluate(() => {
        // Try known next button IDs
        const nextButtonIds = ['5fJnOnqo2Mn', '6SnZaWfxQZH', '6p3OI0ZXRkJ', '6bfu7dbXM45'];
        
        for (const id of nextButtonIds) {
          const button = document.querySelector(`[data-model-id="${id}"]`);
          if (!button) continue;
          
          try {
            button.click();
            console.log(`Clicked next button with ID: ${id}`);
            return true;
          } catch (e) {
            console.log(`Error clicking next button ${id}:`, e.message);
          }
        }
        
        // Try by stroke color (orange)
        const orangePaths = document.querySelectorAll('svg path[stroke="#FF9800"]');
        for (const path of orangePaths) {
          const parent = path.closest('[data-model-id]');
          if (!parent) continue;
          
          const rect = parent.getBoundingClientRect();
          // Check if it's in the bottom right area (typical for next buttons)
          if (rect.bottom > window.innerHeight * 0.7 && rect.right > window.innerWidth * 0.7) {
            try {
              parent.click();
              console.log('Clicked orange-stroked element in bottom right (likely next button)');
              return true;
            } catch (e) {
              console.log('Error clicking orange element:', e.message);
            }
          }
        }
        
        // If no buttons found by ID or stroke, try by position
        const rightSide = window.innerWidth - 50;
        const bottomSide = window.innerHeight - 50;
        
        const element = document.elementFromPoint(rightSide, bottomSide);
        if (element) {
          try {
            element.click();
            console.log('Clicked element at bottom right (next button position)');
            return true;
          } catch (e) {
            console.log('Error clicking at position:', e.message);
          }
        }
        
        return false;
      });
      
      console.log(`Next button click ${clicked ? 'successful' : 'failed'}`);
      return clicked;
    } catch (error) {
      console.error('Error in clickNextButton:', error.message);
      return false;
    }
}
  
/**
 * Main function to handle carousel navigation
 * @param {Object} scormFrame - Puppeteer frame
 * @param {Number} maxClicks - Maximum number of carousel clicks before proceeding
 * @returns {Boolean} - Success status
 */
async function forceCarouselNavigation(scormFrame, maxClicks = 2) {
    try {
      console.log('Attempting carousel navigation with enhanced approach...');
      
      // Known carousel navigation IDs in order
      const carouselButtonIds = [
        '6d9K1sUhmhU',  // First slide
        '5gpDrv2tka1'   // Second slide
      ];
      
      // Create unique keys for tracking
      const counterKey = 'carouselClickCounter_' + (scormFrame._frameId || 'default');
      const carouselCompletedKey = 'carouselNavigationCompleted_' + (scormFrame._frameId || 'default');
      
      // Initialize the counter for this specific frame if it doesn't exist
      if (typeof global[counterKey] === 'undefined') {
        global[counterKey] = 0;
      }
      
      // Select the current ID based on the counter and array length
      const currentButtonId = carouselButtonIds[global[counterKey] % carouselButtonIds.length];
      
      console.log(`Attempting to click carousel button with ID: ${currentButtonId} (Click ${global[counterKey] + 1}/${maxClicks})`);
      
      try {
        const clickSuccess = await scormFrame.evaluate((id) => {
          // First try the specific SVG event target
          const eventableElement = document.querySelector(`[data-model-id="${id}"] svg g.eventable`);
          
          if (eventableElement) {
            // Create a complete sequence of mouse events
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
          
          await sleep(1000); // Wait for any animations
          
          // Check if we've reached the maximum number of clicks
          if (global[counterKey] >= maxClicks) {
            console.log('Completed specified number of carousel clicks. Moving to next slide.');
            
            // Reset the counter to prevent continuous incrementing
            global[counterKey] = 0;
            
            // CRITICAL FIX: Use the comprehensive orange next button click function
            console.log('Attempting to click orange next button after carousel...');
            await clickCarouselNextButton(scormFrame);
            
            // Set the flag to indicate carousel navigation is complete
            global[carouselCompletedKey] = true;
            
            // Wait after clicking to ensure transition completes
            await sleep(3000);
            
            // Return true to indicate carousel navigation is complete
            return true;
          }
          
          // If not max clicks, continue with next interaction
          return false;
        }
      } catch (error) {
        console.log(`Error processing button with ID ${currentButtonId}:`, error.message);
      }
      
      // Fallback to standard next button click if all else fails
      console.log('Carousel navigation failed, using next button fallback');
      await clickNextButton(scormFrame);
      
      // Also try the orange next button as final fallback
      await clickCarouselNextButton(scormFrame);
      
      return true;
    } catch (error) {
      console.error('Error in carousel navigation:', error.message);
      
      // Fallback to next button and orange next button
      try {
        await clickNextButton(scormFrame);
        await clickCarouselNextButton(scormFrame);
      } catch (e) {
        console.log('Error in carousel fallback:', e.message);
      }
      
      return true;
    }
}
  
// Export the functions for use in dorithricin.js
module.exports = {
    forceCarouselNavigation,
    clickCarouselNextButton,
    clickNextButton
};