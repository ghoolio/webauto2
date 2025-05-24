// utils/browserUtils.js
const { sleep } = require('./commonUtils');

/**
 * Check if the page is showing a 503 error
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether a 503 error is detected
 */
async function checkFor503Error(page) {
  try {
    const content = await page.content();
    return content.includes('503 Service Temporarily Unavailable');
  } catch (error) {
    console.error('Error checking for 503:', error);
    // If there's an error checking (likely due to navigation), assume it might be a 503
    return false;
  }
}

/**
 * Accept cookies on the current page
 * @param {Object} page - Puppeteer page object
 */
async function acceptCookies(page) {
  try {
    console.log('Waiting for cookies dialog...');
    
    // Check if cookie banner exists with short timeout to avoid long waits
    const cookieBannerExists = await page.waitForSelector('#vinegar-accept', { 
      visible: true, 
      timeout: 10000 
    }).then(() => true).catch(() => false);
    
    if (cookieBannerExists) {
      console.log('Cookies dialog found. Clicking accept...');
      await page.click('#vinegar-accept');
      console.log('Cookies accepted.');
      await sleep(2000); // Wait for cookies to be applied
    } else {
      console.log('No cookies dialog found or already accepted.');
    }
  } catch (error) {
    console.error('Error accepting cookies:', error);
  }
}

/**
 * Clear browser cookies only
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether the operation was successful
 */
async function clearBrowserCookies(page) {
  console.log('Clearing browser cookies only...');
  
  try {
    // Only clear cookies, not localStorage or sessionStorage
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    
    console.log('Browser cookies cleared');
    return true;
  } catch (error) {
    console.error('Error clearing browser cookies:', error);
    return false;
  }
}

/**
 * Clear all browser data (cookies, cache, storage)
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether the operation was successful
 */
async function clearBrowserData(page) {
  console.log('Clearing browser data...');
  
  try {
    // Get CDP session for low-level browser operations
    const client = await page.target().createCDPSession();
    
    // Clear cookies
    await client.send('Network.clearBrowserCookies');
    console.log('Browser cookies cleared');
    
    // Clear browser cache
    await client.send('Network.clearBrowserCache');
    console.log('Browser cache cleared');
    
    // Clear all storage (localStorage, sessionStorage)
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('localStorage and sessionStorage cleared');
        
        // Also remove all cookies via JavaScript
        document.cookie.split(';').forEach(function(c) {
          document.cookie = c.trim().split('=')[0] + '=;' + 
          'expires=Thu, 01 Jan 1970 00:00:00 UTC;' +
          'path=/;';
        });
        console.log('Cookies cleared via JavaScript');
      } catch (e) {
        console.log('Error clearing storage:', e);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing browser data:', error);
    return false;
  }
}

/**
 * Handle session conflict (user already logged in elsewhere)
 * @param {Object} page - Puppeteer page object
 * @returns {boolean} - Whether the conflict was successfully handled
 */
async function handleSessionConflict(page) {
  try {
    console.log('Checking for session conflict error...');
    
    // Check for session conflict messages
    const hasSessionError = await page.evaluate(() => {
      const pageText = document.body.innerText;
      const conflictPhrases = [
        'bereits mit einem anderen Benutzer',
        'bereits angemeldet',
        'bereits in Benutzung',
        'another session',
        'session conflict',
        'already logged in',
        'Sie sind bereits angemeldet',
        'Cookie konnte nicht gefunden werden'
      ];
      
      return conflictPhrases.some(phrase => pageText.includes(phrase));
    }).catch(() => false);
    
    if (hasSessionError) {
      console.log('Session conflict detected! Handling...');
      
      // Take screenshot of the conflict state
      await page.screenshot({ path: 'session-conflict.png' });
      
      // Look for and click any "return to application" or similar link
      const clickedLink = await page.evaluate(() => {
        // Look for links with text about returning
        const returnLinks = Array.from(document.querySelectorAll('a'))
          .filter(link => 
            link.innerText.includes('Zurück') || 
            link.innerText.includes('Applikation') ||
            link.innerText.includes('zurück') ||
            link.innerText.includes('Anwendung') ||
            link.href.includes('applikation')
          );
            
        if (returnLinks.length > 0) {
          console.log(`Found return link with text: ${returnLinks[0].innerText}`);
          returnLinks[0].click();
          return true;
        }
        return false;
      }).catch(() => false);
      
      if (clickedLink) {
        console.log('Clicked "return to application" link');
        await page.waitForNavigation({ timeout: 30000 }).catch(() => {});
      }
      
      // Clear all browser data 
      await clearBrowserData(page);
      
      // Try different logout URLs
      const logoutUrls = [
        'https://academy.medice-health-family.com/logout',
        'https://medice-health-family.com/logout',
        'https://login.medice.com/logout',
        'https://login.medice.com/auth/realms/medicerealm/protocol/openid-connect/logout'
      ];
      
      for (const url of logoutUrls) {
        console.log(`Trying logout URL: ${url}`);
        await page.goto(url, { timeout: 10000 })
          .catch(e => console.log(`Error navigating to ${url}: ${e.message}`));
        await sleep(2000);
      }
      
      // Navigate back to home page
      console.log('Navigating to home page to start fresh...');
      await page.goto("https://medice-health-family.com/de/academy", {
        waitUntil: "networkidle2",
        timeout: 60000
      }).catch(e => console.log('Navigation error:', e.message));
      
      // Wait to ensure all cleanup is complete
      await sleep(5000);
      
      return true; // Conflict was handled
    }
    
    return false; // No conflict detected
  } catch (error) {
    console.error('Error checking for session conflict:', error);
    return false;
  }
}

module.exports = {
  checkFor503Error,
  acceptCookies,
  clearBrowserCookies,
  clearBrowserData,
  handleSessionConflict
};