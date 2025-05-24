// utils/recoveryUtils.js
const { sleep } = require('./commonUtils');

/**
 * Handle session conflict (user already logged in elsewhere)
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether the conflict was successfully handled
 */
async function handleSessionConflict(page) {
  try {
    console.log('Handling session conflict...');
    
    // Take a screenshot of the conflict state
    await page.screenshot({ path: 'session-conflict.png' });
    
    // Try to find and click "return to application" link if present
    const linkClicked = await page.evaluate(() => {
      // Look for links with relevant text
      const links = Array.from(document.querySelectorAll('a')).filter(link => {
        const text = link.innerText.toLowerCase();
        return text.includes('zurück') || text.includes('anwendung') || 
               text.includes('applikation') || text.includes('return');
      });
      
      if (links.length > 0) {
        links[0].click();
        return true;
      }
      
      return false;
    }).catch(() => false);
    
    if (linkClicked) {
      console.log('Clicked "return to application" link');
      await page.waitForNavigation({ timeout: 30000 }).catch(() => {});
    }
    
    // Try to navigate to logout URLs to clear the session
    const logoutUrls = [
      'https://academy.medice-health-family.com/logout',
      'https://login.medice.com/auth/realms/medicerealm/protocol/openid-connect/logout'
    ];
    
    for (const url of logoutUrls) {
      console.log(`Trying logout URL: ${url}`);
      await page.goto(url, { timeout: 10000 })
        .catch(e => console.log(`Error navigating to ${url}: ${e.message}`));
      await sleep(2000);
    }
    
    // Clear browser cookies and storage
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    
    // Clear localStorage and sessionStorage via JavaScript
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Also try to clear cookies via JavaScript
        document.cookie.split(';').forEach(c => {
          document.cookie = c.trim().split('=')[0] + '=;' + 
          'expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        });
      } catch (e) {
        console.log('Error clearing browser storage:', e);
      }
    }).catch(() => {});
    
    // Navigate back to home page
    console.log('Navigating to home page to start fresh...');
    await page.goto('https://academy.medice-health-family.com/home', {
      waitUntil: 'networkidle2',
      timeout: 60000
    }).catch(e => console.log('Navigation error:', e.message));
    
    // Wait for page to stabilize
    await sleep(5000);
    
    return true;
  } catch (error) {
    console.error('Error handling session conflict:', error);
    return false;
  }
}

/**
 * Handle session timeout
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether the timeout was successfully handled
 */
async function handleSessionTimeout(page) {
  try {
    console.log('Handling session timeout...');
    
    // Take a screenshot of the timeout state
    await page.screenshot({ path: 'session-timeout.png' });
    
    // Try to find and click login/refresh button if present
    const buttonClicked = await page.evaluate(() => {
      // Look for buttons with relevant text
      const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]')).filter(btn => {
        const text = btn.innerText.toLowerCase();
        return text.includes('login') || text.includes('anmelden') || 
               text.includes('neu laden') || text.includes('refresh');
      });
      
      if (buttons.length > 0) {
        buttons[0].click();
        return true;
      }
      
      return false;
    }).catch(() => false);
    
    if (buttonClicked) {
      console.log('Clicked login/refresh button');
      await page.waitForNavigation({ timeout: 30000 }).catch(() => {});
    }
    
    // Navigate back to home page
    console.log('Navigating to home page after session timeout...');
    await page.goto('https://academy.medice-health-family.com/home', {
      waitUntil: 'networkidle2',
      timeout: 60000
    }).catch(e => console.log('Navigation error:', e.message));
    
    // Wait for page to stabilize
    await sleep(5000);
    
    return true;
  } catch (error) {
    console.error('Error handling session timeout:', error);
    return false;
  }
}

/**
 * Handle 503 error
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether the error was successfully handled
 */
async function handle503Error(page) {
  try {
    console.log('Handling 503 error...');
    
    // Take a screenshot of the error state
    await page.screenshot({ path: '503-error.png' });
    
    // Wait a bit before retrying (TYPO3 503 errors are often temporary)
    console.log('Waiting 10 seconds before retrying...');
    await sleep(10000);
    
    // Refresh the page
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 })
      .catch(e => console.log('Page reload error:', e.message));
    
    // Check if the error is still present
    const still503 = await page.evaluate(() => {
      return document.body.innerText.includes('503 Service Temporarily Unavailable');
    }).catch(() => false);
    
    if (still503) {
      console.log('503 error still present after reload, trying to navigate to homepage...');
      
      // Try navigating to the home page
      await page.goto('https://academy.medice-health-family.com/home', {
        waitUntil: 'networkidle2',
        timeout: 60000
      }).catch(e => console.log('Navigation error:', e.message));
    }
    
    // Wait for page to stabilize
    await sleep(5000);
    
    return true;
  } catch (error) {
    console.error('Error handling 503 error:', error);
    return false;
  }
}

/**
 * Close modal dialog
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether the modal was successfully closed
 */
async function closeModalDialog(page) {
  try {
    console.log('Attempting to close modal dialog...');
    
    // Try to find and click close button
    const closeClicked = await page.evaluate(() => {
      // Look for close buttons using various selectors
      const closeSelectors = [
        '.modal-close',
        '.close',
        '.modal .btn-close',
        '.modal button[aria-label="Close"]',
        '.modal-header .close',
        'button.close',
        // Look for specific labels
        'button[aria-label="Schließen"]',
        'button[aria-label="Close"]',
        // Look for X symbols
        'button:has-text("×")',
        'button:has-text("✕")'
      ];
      
      // Try each selector
      for (const selector of closeSelectors) {
        try {
          const closeButton = document.querySelector(selector);
          if (closeButton) {
            closeButton.click();
            console.log(`Clicked close button with selector: ${selector}`);
            return true;
          }
        } catch (e) {
          console.log(`Error with selector ${selector}:`, e);
        }
      }
      
      // If no specific close button found, try buttons at the top-right corner
      const modalElement = document.querySelector('.modal.show, .modal[style*="display: block"]');
      if (modalElement) {
        const modalRect = modalElement.getBoundingClientRect();
        const potentialCloseBtn = document.elementFromPoint(
          modalRect.right - 20,
          modalRect.top + 20
        );
        
        if (potentialCloseBtn && 
            (potentialCloseBtn.tagName === 'BUTTON' || 
             potentialCloseBtn.closest('button'))) {
          const buttonToClick = potentialCloseBtn.tagName === 'BUTTON' ? 
                               potentialCloseBtn : 
                               potentialCloseBtn.closest('button');
          buttonToClick.click();
          console.log('Clicked button at modal top-right corner');
          return true;
        }
      }
      
      return false;
    }).catch(() => false);
    
    if (closeClicked) {
      console.log('Successfully clicked modal close button');
      await sleep(2000);
      
      // Verify modal is closed
      const modalClosed = await page.evaluate(() => {
        return !document.querySelector('.modal.show, .modal[style*="display: block"]');
      }).catch(() => false);
      
      if (modalClosed) {
        console.log('Modal was successfully closed');
      } else {
        console.log('Modal is still open, trying alternative approach...');
        
        // Try clicking modal backdrop
        await page.evaluate(() => {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.click();
            return true;
          }
          return false;
        }).catch(() => false);
        
        await sleep(1000);
      }
    } else {
      console.log('Could not find modal close button, trying to click outside modal...');
      
      // Try clicking outside the modal
      await page.evaluate(() => {
        // Get modal dimensions
        const modal = document.querySelector('.modal-dialog');
        if (!modal) return false;
        
        const rect = modal.getBoundingClientRect();
        
        // Click in the top-left corner of the screen (outside modal)
        const element = document.elementFromPoint(10, 10);
        if (element) {
          element.click();
          return true;
        }
        
        return false;
      }).catch(() => false);
      
      await sleep(1000);
    }
    
    return true;
  } catch (error) {
    console.error('Error closing modal dialog:', error);
    return false;
  }
}

/**
 * Find and click next button (used for generic recovery)
 * @param {Object} frame - Puppeteer frame or page
 * @returns {boolean} - Whether the next button was found and clicked
 */
async function findAndClickNextButton(frame) {
  try {
    console.log('Attempting to find and click next button for recovery...');
    
    const nextButtonSelectors = [
      '[data-model-id="5fJnOnqo2Mn"]', // Common next button IDs
      '[data-model-id="5fQkkvFT1Hs"]',
      '[data-model-id="6SnZaWfxQZH"]',
      '[data-model-id="6p3OI0ZXRkJ"]',
      '[data-model-id="6bfu7dbXM45"]',
      'button[class*="high-impact"]', // Class-based selectors
      'button:has-text("Next")',
      'button:has-text("Weiter")'
    ];
    
    for (const selector of nextButtonSelectors) {
      try {
        const exists = await frame.waitForSelector(selector, { 
          visible: true, 
          timeout: 3000 
        }).then(() => true).catch(() => false);
        
        if (exists) {
          await frame.click(selector);
          console.log(`Clicked next button with selector: ${selector}`);
          await sleep(3000);
          return true;
        }
      } catch (error) {
        console.log(`Failed to click selector ${selector}:`, error.message);
      }
    }
    
    // If no button found with selectors, try clicking bottom right corner where next button often is
    console.log('No next button found with selectors, trying bottom right corner...');
    
    await frame.evaluate(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Try clicking at bottom right area
      const element = document.elementFromPoint(width - 50, height - 50);
      if (element) {
        element.click();
        console.log('Clicked element at bottom right corner');
        return true;
      }
      
      return false;
    }).catch(() => false);
    
    await sleep(3000);
    
    console.log('Attempted generic next button recovery');
    return true;
  } catch (error) {
    console.error('Error finding/clicking next button:', error);
    return false;
  }
}

/**
 * Recover from risk factors error
 * @param {Object} frame - Puppeteer frame or page
 * @returns {boolean} - Whether recovery was successful
 */
async function recoverFromRiskFactorsError(frame) {
  try {
    console.log('Recovering from risk factors error...');
    
    // Try clicking any remaining visible risk factors
    const clickedFactors = await frame.evaluate(() => {
      // Get all potential factor elements
      const factorSelectors = [
        '[data-model-id="6CgBjku5i0P"]',
        '[data-model-id="6f83JhqEXI5"]',
        '[data-model-id="6U8twOQqmyr"]',
        '[data-model-id="6ik9oDyZp4F"]',
        '[data-model-id="6aelPxiqTQs"]',
        '[data-model-id="6cACM9wqz9n"]'
      ];
      
      let clickCount = 0;
      
      // Click each visible factor
      factorSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && window.getComputedStyle(element).display !== 'none') {
          element.click();
          clickCount++;
        }
      });
      
      return clickCount;
    }).catch(() => 0);
    
    console.log(`Clicked ${clickedFactors} risk factors during recovery`);
    
    // Look for the close button (for "Super!" popup)
    const closeButtonSelector = 'div[data-model-id="5nUZEiVuJdn"].slide-object-stategroup.shown';
    const closeButtonExists = await frame.waitForSelector(closeButtonSelector, { 
      visible: true, 
      timeout: 5000 
    }).then(() => true).catch(() => false);
    
    if (closeButtonExists) {
      console.log('Found close button for "Super!" popup, clicking it...');
      
      await frame.evaluate(() => {
        const closeButton = document.querySelector('div[data-model-id="5nUZEiVuJdn"].slide-object-stategroup.shown');
        if (!closeButton) return false;
        
        // Try to find the clickable part (the orange circle with X)
        const clickableElement = closeButton.querySelector('.slide-object-vectorshape') || closeButton;
        
        // Create and dispatch a mouse event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        clickableElement.dispatchEvent(clickEvent);
        
        return true;
      }).catch(() => false);
      
      await sleep(2000);
    }
    
    // Try to click next button to proceed
    return await findAndClickNextButton(frame);
  } catch (error) {
    console.error('Error recovering from risk factors error:', error);
    return false;
  }
}

/**
 * Recover from message slide error
 * @param {Object} frame - Puppeteer frame or page
 * @returns {boolean} - Whether recovery was successful
 */
async function recoverFromMessageSlideError(frame) {
  try {
    console.log('Recovering from message slide error...');
    
    // Try clicking the message button one more time
    const messageButtonClicked = await frame.evaluate(() => {
      const button = document.querySelector('[data-model-id="6l65RbsSaM0"]');
      if (button && window.getComputedStyle(button).display !== 'none') {
        button.click();
        return true;
      }
      return false;
    }).catch(() => false);
    
    if (messageButtonClicked) {
      console.log('Clicked message button during recovery');
      await sleep(2000);
    }
    
    // Look for orange next button
    const orangeNextButtonExists = await frame.evaluate(() => {
      const orangeButton = document.querySelector('[data-model-id="5fQkkvFT1Hs"]');
      if (!orangeButton || window.getComputedStyle(orangeButton).display === 'none') {
        return false;
      }
      
      const path = orangeButton.querySelector('svg path');
      if (!path) return false;
      
      const strokeColor = path.getAttribute('stroke');
      return strokeColor === '#FF9800';
    }).catch(() => false);
    
    if (orangeNextButtonExists) {
      console.log('Found orange next button during recovery, clicking it...');
      await frame.click('[data-model-id="5fQkkvFT1Hs"]').catch(() => {});
      await sleep(2000);
    }
    
    // Try to click the next button to proceed
    return await findAndClickNextButton(frame);
  } catch (error) {
    console.error('Error recovering from message slide error:', error);
    return false;
  }
}

/**
 * Recover from slider error
 * @param {Object} frame - Puppeteer frame or page
 * @returns {boolean} - Whether recovery was successful
 */
async function recoverFromSliderError(frame) {
  try {
    console.log('Recovering from slider error...');
    
    // Try setting slider position directly via JavaScript
    const sliderPositionSet = await frame.evaluate(() => {
      const slider = document.querySelector('[data-model-id="5aV8PocxYuR"]');
      if (!slider) return false;
      
      // Set to position 6
      slider.style.transform = 'translate(350px, 0px) rotate(0deg) scale(1, 1)';
      
      // Dispatch events to trigger any listeners
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      
      return true;
    }).catch(() => false);
    
    if (sliderPositionSet) {
      console.log('Set slider position during recovery');
      await sleep(2000);
    }
    
    // Try clicking the Prüfen button
    const pruefenButtonClicked = await frame.evaluate(() => {
      // Try with known button ID first
      const pruefenButton = document.querySelector('[data-model-id="6M3h8ouA9G1"]');
      if (pruefenButton) {
        pruefenButton.click();
        return true;
      }
      
      // Look for button text as fallback
      const buttons = Array.from(document.querySelectorAll('div.slide-object-button'));
      const pruefenByText = buttons.find(b => b.innerText?.includes('Prüfen'));
      if (pruefenByText) {
        pruefenByText.click();
        return true;
      }
      
      return false;
    }).catch(() => false);
    
    if (pruefenButtonClicked) {
      console.log('Clicked Prüfen button during recovery');
      await sleep(3000);
    }
    
    // Try to close any dialog with close button
    const closeButtonClicked = await frame.evaluate(() => {
      // Look for close buttons using various selectors
      const closeSelectors = [
        '[data-model-id="6j5kqHVCSqu"]', 
        '[data-model-id="6PeGCMMyBPJ"]',
        '[data-model-id="5nUZEiVuJdn"]',
        '[data-model-id="6lGUORpiSn6"]',
        // Generic selectors as fallbacks
        'div.slide-object-vectorshape[data-acc-text="Oval 3"]',
        'div.slide-object-vectorshape[data-acc-text="close icon"]',
        'div.slide-object-stategroup.shown.cursor-hover' // Any clickable dialog group
      ];
      
      for (const selector of closeSelectors) {
        const element = document.querySelector(selector);
        if (element && window.getComputedStyle(element).display !== 'none') {
          element.click();
          return true;
        }
      }
      
      return false;
    }).catch(() => false);
    
    if (closeButtonClicked) {
      console.log('Clicked close button during recovery');
      await sleep(2000);
    } else {
      // If close button not found, try to force-hide dialogs
      await frame.evaluate(() => {
        // Find all potential dialogs
        const dialogSelectors = [
          '[data-model-id="6PeGCMMyBPJ"]', // The dialog or its container
          '.slide-object-stategroup.shown' // Generic dialog class
        ];
        
        for (const selector of dialogSelectors) {
          const dialogs = document.querySelectorAll(selector);
          
          for (const dialog of dialogs) {
            // Check if it contains dialog text
            if (dialog.textContent && 
                (dialog.textContent.includes('Richtig') || 
                 dialog.textContent.includes('Super'))) {
              // Direct DOM manipulation to hide it
              dialog.classList.remove('shown');
              dialog.style.display = 'none';
              return true;
            }
          }
        }
        
        // Last resort: Hide ALL dialog-like elements
        const allDialogs = document.querySelectorAll('.slide-object-stategroup.shown');
        for (const dialog of allDialogs) {
          dialog.classList.remove('shown');
          dialog.style.display = 'none';
        }
        
        return true;
      }).catch(() => false);
    }
    
    // Try to click next button to proceed
    return await findAndClickNextButton(frame);
  } catch (error) {
    console.error('Error recovering from slider error:', error);
    return false;
  }
}

/**
 * Recover from carousel error
 * @param {Object} frame - Puppeteer frame or page
 * @returns {boolean} - Whether recovery was successful
 */
async function recoverFromCarouselError(frame) {
  try {
    console.log('Recovering from carousel error...');
    
    // Try clicking carousel navigation dots
    const dotsClicked = await frame.evaluate(() => {
      // Known carousel navigation IDs
      const carouselButtonIds = [
        '6d9K1sUhmhU',  // First slide
        '5gpDrv2tka1'   // Second slide
      ];
      
      let clickCount = 0;
      
      // Try clicking each dot
      carouselButtonIds.forEach(id => {
        const element = document.querySelector(`[data-model-id="${id}"]`);
        if (element && window.getComputedStyle(element).display !== 'none') {
          element.click();
          clickCount++;
        }
      });
      
      // If no specific dots found, try clicking in positions where dots typically are
      if (clickCount === 0) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Calculate positions along the bottom where dots typically appear
        const y = height * 0.85;
        
        // Try 5 evenly spaced positions
        for (let i = 1; i <= 5; i++) {
          const x = width * (i / 6);
          const element = document.elementFromPoint(x, y);
          if (element) {
            element.click();
            clickCount++;
          }
        }
      }
      
      return clickCount;
    }).catch(() => 0);
    
    console.log(`Clicked ${dotsClicked} carousel dots during recovery`);
    await sleep(2000);
    
    // Look for the next button after carousel
    const carouselNextButtonSelectors = [
      '[data-model-id="5fQkkvFT1Hs"]', // Orange next button
      '[data-model-id="6caVtuFYF3U"]', // Parent state group
      'svg[data-commandset-id="20"] path',
      '[data-acc-text="Oval 3"]'
    ];
    
    for (const selector of carouselNextButtonSelectors) {
      try {
        const exists = await frame.waitForSelector(selector, { 
          visible: true, 
          timeout: 3000 
        }).then(() => true).catch(() => false);
        
        if (exists) {
          await frame.click(selector);
          console.log(`Clicked carousel next button with selector: ${selector}`);
          await sleep(3000);
          return true;
        }
      } catch (error) {
        console.log(`Failed to click carousel next button with selector ${selector}:`, error.message);
      }
    }
    
    // If specific next button not found, try generic next button recovery
    return await findAndClickNextButton(frame);
  } catch (error) {
    console.error('Error recovering from carousel error:', error);
    return false;
  }
}

/**
 * Recover from stuck elements
 * @param {Object} frame - Puppeteer frame or page
 * @returns {boolean} - Whether recovery was successful
 */
async function recoverFromStuckElements(frame) {
  try {
    console.log('Recovering from stuck elements...');
    
    // Try to hide overlay elements
    await frame.evaluate(() => {
      // Find all overlay elements
      const overlayElements = document.querySelectorAll('.overlay.shown');
      
      // Hide each overlay
      overlayElements.forEach(overlay => {
        overlay.classList.remove('shown');
        overlay.style.display = 'none';
      });
      
      // Find all gray/disabled buttons
      const grayButtons = document.querySelectorAll('[data-model-id*="Button"][style*="opacity: 0.5"]');
      
      // Try to enable each button
      grayButtons.forEach(button => {
        button.style.opacity = '1.0';
        button.style.pointerEvents = 'auto';
      });
      
      return true;
    }).catch(() => false);
    
    // Try to fire transition event
    await frame.evaluate(() => {
      // Create and dispatch transition end event on visible elements
      const visibleElements = document.querySelectorAll('.shown');
      
      visibleElements.forEach(element => {
        const event = new Event('transitionend', {
          bubbles: true,
          cancelable: true
        });
        
        element.dispatchEvent(event);
      });
      
      return true;
    }).catch(() => false);
    
    // Try to click next button to proceed
    return await findAndClickNextButton(frame);
  } catch (error) {
    console.error('Error recovering from stuck elements:', error);
    return false;
  }
}

module.exports = {
  handleSessionConflict,
  handleSessionTimeout,
  handle503Error,
  closeModalDialog,
  findAndClickNextButton,
  recoverFromRiskFactorsError,
  recoverFromMessageSlideError,
  recoverFromSliderError,
  recoverFromCarouselError,
  recoverFromStuckElements
};