// utils/loginUtils.js
const { sleep } = require('./commonUtils');
const { clearBrowserData, acceptCookies, handleSessionConflict } = require('./browserUtils');

/**
 * Perform login to the MEDICE Academy
 * @param {Object} page - Puppeteer page object
 * @param {string} username - Login username
 * @param {string} password - Login password
 * @returns {boolean} - Whether login was successful
 */
async function performLogin(page, username, password) {
  try {
    console.log(`Attempting login for user: ${username}`);

    // Take screenshot of the current state
    await page.screenshot({ path: 'before-login-attempt.png' });
    console.log('Saved screenshot before login attempt');

    // First visit the main site to allow all cookies to set up properly
    console.log('Visiting main site first to initialize cookies...');
    await page.goto('https://medice-health-family.com/de/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Accept cookies if needed
    await acceptCookies(page);
    await sleep(2000);

    // Check for any session conflict errors before we start
    const hasInitialConflict = await handleSessionConflict(page);
    if (hasInitialConflict) {
      console.log('Session conflict detected and handled before login attempt');
      await navigateToLoginPage(page);
    }

    // Make sure we're on the login page
    if (!page.url().includes('login-actions/authenticate') && 
        !page.url().includes('openid-connect/auth') &&
        !page.url().includes('login')) {
      console.log('Not on login page, navigating...');
      const success = await navigateToLoginPage(page);
      if (!success) {
        throw new Error('Could not navigate to login page');
      }
    }

    // Wait for the login form with increased timeout
    console.log('Waiting for login form...');
    await page.waitForSelector('#username', { visible: true, timeout: 60000 });
    console.log('Username field found');

    // Clear fields first - more thorough approach
    await page.evaluate(() => {
      const usernameField = document.querySelector('#username');
      const passwordField = document.querySelector('#password');
      if (usernameField) usernameField.value = '';
      if (passwordField) passwordField.value = '';
    });

    // Additional click to ensure focus
    await page.click('#username');
    await sleep(500);

    // Clear field using keyboard shortcuts
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    
    // Type username with delay
    console.log(`Typing username: ${username}`);
    await page.type('#username', username, { delay: 100 });
    
    // Verify username was entered
    const actualUsername = await page.evaluate(() => {
      return document.querySelector('#username').value;
    });
    console.log(`Username field contains: "${actualUsername}"`);

    // Same careful approach for password
    await page.click('#password');
    await sleep(500);
    
    // Clear password field
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    
    // Type password with delay
    console.log(`Typing password: ${password}`);
    await page.type('#password', password, { delay: 100 });

    // IMPORTANT: Ensure "Remember me" is NOT checked
    const rememberMeExists = await page.evaluate(() => {
      return !!document.querySelector('#rememberMe');
    });
    
    if (rememberMeExists) {
      console.log('Found remember me checkbox');
      
      const rememberMeChecked = await page.evaluate(() => {
        const checkbox = document.querySelector('#rememberMe');
        return checkbox.checked;
      });
      
      if (rememberMeChecked) {
        console.log('Unchecking "Remember me" checkbox');
        await page.click('#rememberMe');
        await sleep(500);
        
        // Verify it was unchecked
        const stillChecked = await page.evaluate(() => {
          return document.querySelector('#rememberMe').checked;
        });
        
        if (stillChecked) {
          console.log('WARNING: Remember me is still checked!');
        } else {
          console.log('Remember me successfully unchecked');
        }
      } else {
        console.log('"Remember me" is already unchecked');
      }
    } else {
      console.log('No remember me checkbox found');
    }

    // Take screenshot before submitting
    await page.screenshot({ path: 'login-form-filled.png' });
    console.log('Saved screenshot of filled login form');

    // Identify the submit button more reliably
    const submitButtonInfo = await page.evaluate(() => {
      // Look for button with ID first
      const idButton = document.querySelector('#kc-login');
      if (idButton) return { id: 'kc-login', method: 'id' };
      
      // Look for type="submit" within the form
      const submitButton = document.querySelector('input[type="submit"], button[type="submit"]');
      if (submitButton) return { selector: 'type=submit', method: 'type' };
      
      // Look for button with login text
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('login') || 
        btn.textContent.toLowerCase().includes('anmelden') ||
        btn.textContent.toLowerCase().includes('einloggen')
      );
      if (loginButton) return { text: loginButton.textContent, method: 'text' };
      
      return null;
    });
    
    console.log('Submit button detection:', submitButtonInfo);

    // Click the submit button
    console.log('Submitting the form...');
    if (submitButtonInfo?.method === 'id') {
      await Promise.all([
        page.click('#kc-login'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })
      ]).catch(e => console.log('Navigation error:', e.message));
    } else if (submitButtonInfo?.method === 'type') {
      await Promise.all([
        page.click('input[type="submit"], button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })
      ]).catch(e => console.log('Navigation error:', e.message));
    } else if (submitButtonInfo?.method === 'text') {
      // Use evaluate to click by text content
      await page.evaluate((text) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const loginButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes(text.toLowerCase())
        );
        if (loginButton) loginButton.click();
      }, submitButtonInfo.text);
      
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })
        .catch(e => console.log('Navigation error:', e.message));
    } else {
      // Fallback to form submission if no button found
      console.log('No submit button found, trying form submission');
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) form.submit();
      });
      
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 })
        .catch(e => console.log('Navigation error:', e.message));
    }

    // Take screenshot after login attempt
    await page.screenshot({ path: 'after-login-attempt.png' });
    console.log('Saved screenshot after login attempt');

    // Analyze current page state in detail
    const pageState = await page.evaluate(() => {
      return {
        currentUrl: window.location.href,
        pageTitle: document.title,
        bodyText: document.body.innerText.slice(0, 500), // First 500 chars
        hasLoginForm: !!document.querySelector('#username'),
        hasErrorMessages: !!document.querySelector('.alert-error, .error-message, .login-error'),
        errorText: document.querySelector('.alert-error, .error-message, .login-error')?.innerText || null
      };
    }).catch(() => ({
      currentUrl: 'Error evaluating page state',
      pageTitle: '',
      bodyText: '',
      hasLoginForm: false,
      hasErrorMessages: false,
      errorText: null
    }));
    
    console.log('Page state after login attempt:', pageState);

    // Check for login errors
    if (pageState.hasErrorMessages) {
      console.log('Login error detected:', pageState.errorText);
      return false;
    }

    // Handle any session conflicts that might appear after submission
    if (await handleSessionConflict(page)) {
      console.log('Session conflict detected after login form submission');
      // Try again with navigation
      await navigateToLoginPage(page);
      return false;
    }

    // Handle terms modal if needed
    await handleTermsModal(page);

    // Check for welcome dialog
    await handleWelcomeDialog(page);

    // Verify successful login with multiple approaches
    const loginVerification = await page.evaluate(() => {
      return {
        // Method 1: Check for profile elements
        hasProfileElements: !!document.querySelector('.user-catalog, .profile-button-container, .user-profile'),
        
        // Method 2: Check for welcome message
        hasWelcomeMessage: !!document.querySelector('.welcome-message'),
        
        // Method 3: Check for logout button
        hasLogoutButton: !!document.querySelector('button[data-test="logout"]'),
        
        // Method 4: Check URL pattern
        isOnAcademyPage: window.location.href.includes('academy.medice'),
        
        // Method 5: Check for login form (negative indicator)
        hasLoginForm: !!document.querySelector('#username, #password'),
        
        // Method 6: Look for ANY profile-related elements with broader selectors
        hasAnyProfileIndicator: !!document.querySelector('[class*="profile"], [class*="user"], [data-test*="user"]'),
        
        // Current URL for analysis
        currentUrl: window.location.href
      };
    }).catch(() => ({
      hasProfileElements: false,
      hasWelcomeMessage: false,
      hasLogoutButton: false,
      isOnAcademyPage: false,
      hasLoginForm: true,
      hasAnyProfileIndicator: false,
      currentUrl: 'Error evaluating login state'
    }));

    console.log('Login verification details:', loginVerification);

    // More lenient login success detection
    const isLoggedIn = loginVerification.hasProfileElements || 
                     loginVerification.hasWelcomeMessage || 
                     loginVerification.hasLogoutButton || 
                     loginVerification.isOnAcademyPage ||
                     loginVerification.hasAnyProfileIndicator ||
                     (loginVerification.currentUrl.includes('academy') && !loginVerification.hasLoginForm);

    if (isLoggedIn) {
      console.log('Login verification successful!');
      
      // IMPORTANT: Extra check to confirm navigation to academy
      console.log('Confirming successful login by navigating to academy home...');
      await page.goto('https://academy.medice-health-family.com/home', {
        waitUntil: 'networkidle2',
        timeout: 60000
      }).catch(e => console.log('Academy home navigation error:', e.message));
      
      // Take a final verification screenshot
      await page.screenshot({ path: 'final-verification.png' });
      
      return true;
    } else {
      console.log('Login verification failed. Detailed diagnostics:', loginVerification);
      
      // Try navigation to academy home as final attempt
      console.log('Attempting direct navigation to academy home as final verification...');
      
      await page.goto('https://academy.medice-health-family.com/home', {
        waitUntil: 'networkidle2',
        timeout: 60000
      }).catch(e => console.log('Academy home navigation error:', e.message));
      
      // Take a final verification screenshot
      await page.screenshot({ path: 'final-verification.png' });
      
      // One final check
      const finalCheck = await page.evaluate(() => {
        return {
          url: window.location.href,
          isLoginPage: !!document.querySelector('#username'),
          isAcademyPage: document.body.innerHTML.includes('academy') && !document.querySelector('#username')
        };
      }).catch(() => ({
        url: 'Error evaluating final check',
        isLoginPage: true,
        isAcademyPage: false
      }));
      
      console.log('Final verification:', finalCheck);
      
      return finalCheck.isAcademyPage || !finalCheck.isLoginPage;
    }
  } catch (error) {
    console.error('Error in login process:', error);
    
    // Take error screenshot
    await page.screenshot({ path: 'login-error.png' });
    
    return false;
  }
}

/**
 * Navigate to the login page
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether navigation was successful
 */
async function navigateToLoginPage(page) {
  console.log('Attempting direct navigation to the academy login page...');
  
  try {
    // Clear cookies but preserve localStorage (important for proper routing)
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    
    // First visit the academy page - this will redirect to login if needed
    await page.goto("https://academy.medice-health-family.com/home", {
      waitUntil: "networkidle2",
      timeout: 60000
    });
    
    // Check if we're on a login page
    const hasLoginForm = await page.evaluate(() => {
      return !!document.querySelector('#username') || 
             !!document.querySelector('input[type="password"]') ||
             window.location.href.includes('login');
    }).catch(() => false);
    
    if (hasLoginForm) {
      console.log('Successfully navigated to login page with academy redirect');
      return true;
    }
    
    // If we're already on the academy page, we might be logged in already
    const isOnAcademyPage = await page.evaluate(() => {
      return window.location.href.includes('academy.medice');
    }).catch(() => false);
    
    if (isOnAcademyPage) {
      console.log('Already on academy page - might be logged in');
      return true;
    }
    
    // If we're not on login page or academy, try a backup approach
    console.log('Not on login page or academy, trying alternative approach...');
    
    // Try a more direct approach with proper redirect
    await page.goto("https://login.medice.com/auth/realms/medicerealm/protocol/openid-connect/auth?client_id=health_family&redirect_uri=https%3A%2F%2Facademy.medice-health-family.com%2Fsso%2Fcallback&response_type=code&scope=openid+profile+email", {
      waitUntil: "networkidle2",
      timeout: 60000
    });
    
    // Check again if we have the login form
    const loginFormVisible = await page.waitForSelector('#username', { 
      visible: true, 
      timeout: 30000 
    }).then(() => true).catch(() => false);
    
    if (loginFormVisible) {
      console.log('Login form found and visible with proper academy redirect');
      return true;
    }
    
    // Last resort - try to navigate directly to academy and check if logged in
    console.log('Trying direct navigation to academy as last resort...');
    await page.goto("https://medice-health-family.com/de/academy", {
      waitUntil: "networkidle2",
      timeout: 60000
    });
    
    // Check if we see a login button/link
    const needsLogin = await page.evaluate(() => {
      return document.body.innerHTML.includes('Anmelden') || 
             document.body.innerHTML.includes('Login');
    }).catch(() => true);
    
    if (needsLogin) {
      // Click any login button we find
      await page.evaluate(() => {
        const loginButtons = Array.from(document.querySelectorAll('a, button'))
          .filter(el => el.innerText.includes('Anmelden') || 
                      el.innerText.includes('Login'));
        
        if (loginButtons.length > 0) {
          loginButtons[0].click();
          return true;
        }
        return false;
      }).catch(() => false);
      
      // Wait for navigation and login form
      await page.waitForSelector('#username', { timeout: 30000 })
        .catch(() => console.log('Could not find login form after clicking login button'));
    }
    
    return await page.evaluate(() => {
      return !!document.querySelector('#username');
    }).catch(() => false);
  } catch (error) {
    console.error('Error navigating to login page:', error);
    
    // Last emergency attempt
    try {
      console.log('Making emergency attempt to access login...');
      await page.goto("https://medice-health-family.com/de/academy", {
        waitUntil: "networkidle2",
        timeout: 60000
      });
      
      // Wait 2 seconds
      await sleep(2000);
      
      // Try to find and click any login button
      const foundLoginButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('a, button, div'));
        const loginButton = buttons.find(btn => 
          btn.innerText.includes('Anmelden') || 
          btn.innerText.includes('Login') ||
          btn.className.includes('login')
        );
        
        if (loginButton) {
          loginButton.click();
          return true;
        }
        return false;
      }).catch(() => false);
      
      if (foundLoginButton) {
        console.log('Found and clicked login button');
        await page.waitForNavigation({ timeout: 30000 }).catch(() => {});
        
        return await page.waitForSelector('#username', { timeout: 20000 })
          .then(() => true)
          .catch(() => false);
      }
      
      return false;
    } catch (emergencyError) {
      console.error('Emergency attempt failed:', emergencyError);
      return false;
    }
  }
}

/**
 * Handle the Terms acceptance modal if it appears - FIXED VERSION
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether terms modal was present and handled
 */
async function handleTermsModal(page) {
  try {
    // Check if the terms modal is present (try for 5 seconds)
    console.log('Checking for terms acceptance modal...');
    
    // Wait briefly for possible modal to appear
    await sleep(2000);
    
    const isModalPresent = await page.evaluate(() => {
      // Look for modal title text or button
      const modalText = document.body.innerText;
      return modalText.includes('Sie müssen zustimmen') || 
             document.querySelector('button[data-test="popup-confirm-button"]') !== null ||
             document.querySelector('.checkbox-wrapper[data-test="checkbox-wrapper"]') !== null;
    }).catch(() => false);
    
    if (!isModalPresent) {
      console.log('Terms modal not detected, continuing...');
      return false;
    }
    
    console.log('Terms acceptance modal detected. Accepting terms...');
    
    // FIXED: Click both checkboxes using the correct selectors
    const checkboxesClicked = await page.evaluate(() => {
      // Find all checkbox wrappers with the correct selector
      const checkboxes = document.querySelectorAll('div.checkbox-wrapper[data-test="checkbox-wrapper"][aria-checked="false"]');
      
      console.log(`[BROWSER] Found ${checkboxes.length} unchecked checkboxes`);
      
      let clickedCount = 0;
      
      // Click each unchecked checkbox
      checkboxes.forEach((checkbox, index) => {
        try {
          console.log(`[BROWSER] Clicking checkbox ${index + 1}`);
          
          // Try multiple click methods for reliability
          checkbox.click();
          
          // Also dispatch mouse events
          checkbox.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          }));
          
          // Dispatch change event
          checkbox.dispatchEvent(new Event('change', {
            bubbles: true,
            cancelable: true
          }));
          
          clickedCount++;
          console.log(`[BROWSER] Successfully clicked checkbox ${index + 1}`);
        } catch (error) {
          console.log(`[BROWSER] Error clicking checkbox ${index + 1}:`, error);
        }
      });
      
      return clickedCount;
    }).catch((error) => {
      console.log('Error clicking checkboxes:', error.message);
      return 0;
    });
    
    console.log(`Clicked ${checkboxesClicked} checkboxes`);
    
    // Wait a moment for the UI to update
    await sleep(1500);
    
    // Verify checkboxes are checked
    const checkboxStatus = await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('div.checkbox-wrapper[data-test="checkbox-wrapper"]');
      const checkedCount = Array.from(checkboxes).filter(cb => cb.getAttribute('aria-checked') === 'true').length;
      const totalCount = checkboxes.length;
      
      console.log(`[BROWSER] Checkbox status: ${checkedCount}/${totalCount} checked`);
      
      return { checked: checkedCount, total: totalCount };
    }).catch(() => ({ checked: 0, total: 0 }));
    
    console.log(`Checkbox verification: ${checkboxStatus.checked}/${checkboxStatus.total} checkboxes are checked`);
    
    // Click the Bestätigen button
    const buttonClicked = await page.evaluate(() => {
      // Try multiple selectors for the confirm button
      const buttonSelectors = [
        'button[data-test="popup-confirm-button"]',
        'button:contains("Bestätigen")',
        'button:contains("Confirm")',
        '.modal button',
        '.popup button'
      ];
      
      for (const selector of buttonSelectors) {
        try {
          // Handle text-based selectors
          if (selector.includes(':contains(')) {
            const text = selector.match(/:contains\("([^"]+)"\)/)[1];
            const buttons = Array.from(document.querySelectorAll('button'));
            const confirmButton = buttons.find(btn => btn.textContent && btn.textContent.includes(text));
            
            if (confirmButton) {
              console.log(`[BROWSER] Found confirm button by text: ${text}`);
              confirmButton.click();
              
              // Also dispatch events for reliability
              confirmButton.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              }));
              
              return true;
            }
          } else {
            // Standard selector
            const confirmButton = document.querySelector(selector);
            if (confirmButton) {
              console.log(`[BROWSER] Found confirm button with selector: ${selector}`);
              confirmButton.click();
              
              // Also dispatch events for reliability
              confirmButton.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              }));
              
              return true;
            }
          }
        } catch (error) {
          console.log(`[BROWSER] Error with selector ${selector}:`, error);
        }
      }
      
      // Fallback: try to find any button in the modal area
      const allButtons = document.querySelectorAll('button');
      for (const button of allButtons) {
        const buttonText = button.textContent?.toLowerCase() || '';
        if (buttonText.includes('bestätigen') || 
            buttonText.includes('confirm') || 
            buttonText.includes('accept') ||
            buttonText.includes('akzeptieren')) {
          console.log(`[BROWSER] Found confirm button by text content: ${buttonText}`);
          button.click();
          return true;
        }
      }
      
      console.log('[BROWSER] Could not find confirm button');
      return false;
    }).catch((error) => {
      console.log('Error clicking confirm button:', error.message);
      return false;
    });
    
    if (buttonClicked) {
      console.log('Successfully clicked Bestätigen button');
      // Wait for any resulting navigation
      await sleep(3000);
    } else {
      console.log('Could not find the confirm button');
      
      // Fallback: try pressing Enter key
      console.log('Trying Enter key as fallback...');
      await page.keyboard.press('Enter');
      await sleep(2000);
    }
    
    // Verify the modal is gone
    const modalGone = await page.evaluate(() => {
      const modalText = document.body.innerText;
      return !modalText.includes('Sie müssen zustimmen');
    }).catch(() => true);
    
    if (modalGone) {
      console.log('Terms modal successfully dismissed');
    } else {
      console.log('Terms modal may still be present');
    }
    
    return true;
  } catch (error) {
    console.error('Error handling terms modal:', error);
    // Continue even if there's an error with the terms modal
    return false;
  }
}

// NOTE: You only need to replace the handleTermsModal function in your existing loginUtils.js
// Keep all your other functions (performLogin, clearLoginData, etc.) exactly as they are!

/**
 * Handle welcome dialog if it appears
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether welcome dialog was present and handled
 */
async function handleWelcomeDialog(page) {
  console.log('Checking for welcome dialog...');
  
  try {
    // First, check if the welcome dialog exists with a short timeout
    const dialogExists = await page.evaluate(() => {
      // Check for welcome dialog indicators
      return !!(
        document.querySelector('#pendo-close-guide-f4ffddbf') || 
        document.querySelector('._pendo-close-guide') ||
        document.querySelector('button[aria-label="Schließen"]') ||
        document.querySelector('.pendo-guide-container') ||
        document.querySelector('[id^="pendo-guide-"]')
      );
    }).catch(() => false);
    
    if (!dialogExists) {
      console.log('No welcome dialog detected, continuing with workflow...');
      return false;
    }
    
    console.log('Welcome dialog detected. Attempting to close...');
    
    // Try clicking the close button using different selectors
    const closeClicked = await page.evaluate(() => {
      // Try different selectors in order of specificity
      const selectors = [
        '#pendo-close-guide-f4ffddbf', 
        '._pendo-close-guide',
        'button[aria-label="Schließen"]',
        // More generic fallbacks
        '.pendo-close-guide',
        'button[aria-label*="chlie"]',  // Partial match for "Schließen"
        'button[id*="close-guide"]',    // Partial match for close-guide IDs
        '[id^="pendo-close-guide"]'     // Any ID starting with pendo-close-guide
      ];
      
      for (const selector of selectors) {
        const closeBtn = document.querySelector(selector);
        if (closeBtn) {
          console.log(`Found close button with selector: ${selector}`);
          closeBtn.click();
          return true;
        }
      }
      
      // Last resort: find any button that looks like a close button
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        // Check for typical close button text like "×" or "✕"
        if (btn.textContent.trim() === '×' || 
            btn.textContent.trim() === '✕' ||
            btn.getAttribute('aria-label')?.includes('close') ||
            btn.getAttribute('aria-label')?.includes('chlie')) {
          console.log('Found close button by text content');
          btn.click();
          return true;
        }
      }
      
      console.log('Could not find any close button');
      return false;
    }).catch(() => false);
    
    if (closeClicked) {
      console.log('Successfully clicked the close button');
      await sleep(1000); // Wait for dialog to disappear
      
      // Verify dialog is gone
      const dialogGone = await page.evaluate(() => {
        return !(
          document.querySelector('#pendo-close-guide-f4ffddbf') || 
          document.querySelector('._pendo-close-guide') ||
          document.querySelector('.pendo-guide-container') ||
          document.querySelector('[id^="pendo-guide-"]')
        );
      }).catch(() => false);
      
      if (dialogGone) {
        console.log('Welcome dialog closed successfully');
        return true;
      }
    }
    
    console.log('Could not close the welcome dialog. Continuing anyway...');
    return false;
  } catch (error) {
    console.error('Error handling welcome dialog:', error);
    // Don't let an error block the workflow
    console.log('Continuing with workflow despite error handling welcome dialog');
    return false;
  }
}

/**
 * Redirect to academy after login if needed
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether redirect was successful
 */
async function redirectToAcademy(page) {
  console.log('Ensuring redirect to academy after login...');
  
  try {
    const currentUrl = page.url();
    
    // First check if we're already on the academy
    if (currentUrl.includes('academy.medice')) {
      console.log('Already on academy page:', currentUrl);
      return true;
    }
    
    // If we landed in account management instead of academy
    if (currentUrl.includes('realms/medicerealm/account')) {
      console.log('Detected account management page, redirecting to academy...');
      
      // Then navigate to academy
      await page.goto('https://academy.medice-health-family.com/home', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Check if we need login again (shouldn't if session carried over)
      const needsLogin = await page.evaluate(() => {
        return !!document.querySelector('#username');
      }).catch(() => true);
      
      if (needsLogin) {
        console.log('Redirect to academy required login again');
        return false;
      } else {
        console.log('Successfully redirected to academy');
        return true;
      }
    }
    
    // If we're somewhere else, try direct navigation
    console.log('Current URL not academy or account, trying direct navigation:', currentUrl);
    
    // Navigate to academy
    await page.goto('https://academy.medice-health-family.com/home', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Check if we've arrived
    const finalUrl = page.url();
    console.log('Final URL after redirect attempt:', finalUrl);
    
    // Take screenshot after redirect
    await page.screenshot({ path: 'academy-redirect-result.png' });
    
    // Check if we need login again or are on academy
    const finalCheck = await page.evaluate(() => {
      return {
        url: window.location.href,
        needsLogin: !!document.querySelector('#username'),
        hasProfileElements: !!document.querySelector('.profile-button-container, .user-catalog, [class*="profile"]'),
        isAcademyPage: window.location.href.includes('academy.medice')
      };
    }).catch(() => ({
      url: 'Error evaluating redirect',
      needsLogin: true,
      hasProfileElements: false,
      isAcademyPage: false
    }));
    
    console.log('Final redirect check:', finalCheck);
    
    return finalCheck.isAcademyPage && !finalCheck.needsLogin;
  } catch (error) {
    console.error('Error redirecting to academy:', error);
    return false;
  }
}

/**
 * Verify academy login 
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether login was verified
 */
async function verifyAcademyLogin(page) {
  console.log('Verifying academy login...');
  
  try {
    // Ensure we're on the academy page
    const redirectSuccess = await redirectToAcademy(page);
    if (!redirectSuccess) {
      console.log('Could not redirect to academy, login may not be valid');
      return false;
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'academy-verification.png' });
    
    // Simplify verification to just check URL and basic page properties
    const simpleCheck = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasLoginForm: !!document.querySelector('#username, #password'),
        hasAcademyContent: document.body.innerHTML.includes('academy') || 
                          document.body.innerHTML.includes('MEDICE Health')
      };
    }).catch(() => ({
      url: 'Error evaluating login verification',
      hasLoginForm: true,
      hasAcademyContent: false
    }));
    
    console.log('Simple verification check:', simpleCheck);
    
    // If we're on an academy URL and don't see a login form, consider it successful
    if (simpleCheck.url.includes('academy') && !simpleCheck.hasLoginForm) {
      console.log('Successfully verified academy login through URL and absence of login form');
      return true;
    }
    
    // Fallback: If more detailed verification is needed, try this as a last resort
    try {
      // More thorough verification only if necessary
      const detailedCheck = await page.evaluate(() => {
        // Look for profile elements with safer selectors
        const hasProfileButton = document.querySelector('.profile-button-container') !== null;
        const hasUserElements = document.querySelector('[class*="profile"], [class*="user"]') !== null;
        
        // Look for login elements using safe methods
        const loginLinks = Array.from(document.querySelectorAll('a')).filter(a => 
          a.href && a.href.includes('login'));
          
        const loginButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('Anmelden') || 
          btn.textContent.includes('Login'));
        
        return {
          hasProfileButton,
          hasUserElements,
          hasLoginElements: loginLinks.length > 0 || loginButtons.length > 0
        };
      }).catch(() => ({
        hasProfileButton: false,
        hasUserElements: false,
        hasLoginElements: true
      }));
      
      console.log('Detailed verification check:', detailedCheck);
      
      return detailedCheck.hasProfileButton || 
            detailedCheck.hasUserElements || 
            !detailedCheck.hasLoginElements;
    } catch (innerError) {
      console.log('Detailed verification failed, using simple check result:', innerError.message);
      return simpleCheck.url.includes('academy');
    }
  } catch (error) {
    console.error('Error verifying academy login:', error);
    
    // Fallback verification - just check the URL as last resort
    try {
      const currentUrl = page.url();
      const isOnAcademy = currentUrl.includes('academy');
      console.log(`Fallback verification: current URL is ${currentUrl}`);
      return isOnAcademy;
    } catch (urlError) {
      console.error('Even fallback verification failed:', urlError);
      return false;
    }
  }
}

/**
 * Clear login data before attempting login
 * @param {Object} page - Puppeteer page object
 */
async function clearLoginData(page) {
  try {
    // Clear all browser data
    await clearBrowserData(page);
    
    // Clear login fields if visible
    await page.evaluate(() => {
      const usernameField = document.querySelector('#username');
      const passwordField = document.querySelector('#password');
      
      if (usernameField) {
        usernameField.value = '';
      }
      
      if (passwordField) {
        passwordField.value = '';
      }
      
      // Also uncheck remember me if it exists and is checked
      const rememberMeCheckbox = document.querySelector('#rememberMe');
      if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        rememberMeCheckbox.checked = false;
      }
    }).catch(() => console.log('No login fields found to clear'));
    
    console.log('Login data cleared');
  } catch (error) {
    console.error('Error clearing login data:', error);
  }
}

module.exports = {
  performLogin,
  clearLoginData,
  navigateToLoginPage,
  handleTermsModal,
  handleWelcomeDialog,
  redirectToAcademy,
  verifyAcademyLogin
};