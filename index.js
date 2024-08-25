"use strict";
// index.js
const puppeteer = require('puppeteer-extra');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { runPerenterolQuiz } = require('./perenterolQuiz');
const { runPerenterol1Quiz } = require('./perenterol1Quiz');
const { checkFor503Error, sleep } = require('./utils');
const qs = require('qs');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
dotenv.config();

const clientEmail = 'schwalbebot-google-sheet-servi@schwalbebot001.iam.gserviceaccount.com';
const privateKey = process.env.PRIVATE_KEY;
const googleSheetId = process.env.GOOGLE_SHEET_ID;
const googleSheetPage = 'Logins Medibee';

const googleAuth = new google.auth.JWT(
    clientEmail,
    null,
    privateKey.replace(/\\n/g, '\n'),
    'https://www.googleapis.com/auth/spreadsheets'
);

let globalLoginName, globalLoginPW;
let rowIndex = 2; // Start from the second row (B2 and C2)

async function readSheet() {
  try {
      const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth });
      const infoObjectFromSheet = await sheetInstance.spreadsheets.values.get({
          auth: googleAuth,
          spreadsheetId: googleSheetId,
          range: `${googleSheetPage}!B${rowIndex}:C${rowIndex}`
      });

      const valuesFromSheet = infoObjectFromSheet.data.values;

      if (valuesFromSheet && valuesFromSheet[0] && valuesFromSheet[0].length === 2) {
          globalLoginName = valuesFromSheet[0][0];
          globalLoginPW = valuesFromSheet[0][1];
          rowIndex++;
          return true; // There's more data
      } else {
          console.log('No more data in the sheet.');
          return false; // No more data
      }
  } catch (err) {
      console.log("readSheet func() error", err);
      throw err;
  }
}

const stealthFixPlugin = require('puppeteer-extra-plugin-stealth-fix');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(stealthFixPlugin());
puppeteer.use(stealthPlugin());

// Define an array of quiz functions
const quizzes = [
    //{ name: 'Perenterol', func: runPerenterolQuiz },
    { name: 'Perenterol1', func: runPerenterol1Quiz },
    // Add more quizzes here
    // { name: 'NextQuiz', func: runNextQuiz },
];

const startMedibee = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        userDataDir: "./tmp",
    });

    const page = await browser.newPage();

    const pages = await browser.pages();
    if (pages.length > 1) {
        await pages[0].close();
    }

    const maxRetries = 3;

    // Function to set zoom
    async function setZoom(page) {
        await page.evaluate(() => {
            document.body.style.zoom = "75%";
        });
        console.log("Zoom set to 75%");
    }

    async function handleCookiePopup(page, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const cookiePopupExists = await page.evaluate(() => {
                    return !!document.querySelector('#pwaModal > div > div > div.modal-header');
                });
    
                if (cookiePopupExists) {
                    await page.click('#pwaModal > div > div > div.modal-header > button');
                    await page.waitForSelector('#pwaModal > div > div > div.modal-header > button', { hidden: true, timeout: 5000 });
                    console.log('Cookie popup closed successfully');
                    return;
                } else {
                    console.log('No cookie popup found, skipping...');
                    return;
                }
            } catch (error) {
                console.log(`Error handling cookie popup (attempt ${i + 1}):`, error);
                if (i === maxRetries - 1) throw error;
                await sleep(1000);
            }
        }
    }

    async function handleCookieConsent(page) {
        try {
            await page.waitForSelector('#cookie-notification', { timeout: 5000 });
        
            const isCookieNotificationVisible = await page.evaluate(() => {
                const cookieNotification = document.querySelector('#cookie-notification');
                return cookieNotification && window.getComputedStyle(cookieNotification).display !== 'none';
            });
        
            if (isCookieNotificationVisible) {
                console.log('Cookie notification is visible. Accepting cookies...');
                await page.click('#cookie-notification__decline');
                console.log('Cookies accepted.');
            } else {
                console.log('Cookie notification is not visible. No action needed.');
            }
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.log('Cookie notification not found. Proceeding without interaction.');
            } else {
                console.error('Error handling cookie consent:', error);
            }
        }
    }

    async function performLogin2(page) {
        try {
            console.log(`Attempting login for user: ${globalLoginName}`);
    
            await page.goto('https://www.medibee.de/login', { waitUntil: 'networkidle0', timeout: 60000 });
    
            // Check if we're already logged in
            const logoutButton = await page.$('#top > header > div.navigation.sticky > div > nav > div > div.meta-wrapper > ul > li.meta-item.logout > a > div');
            if (logoutButton) {
                console.log('Already logged in. Logging out first...');
                await logoutButton.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
            }
    
            // Wait for the login form to be available
            let loginFormVisible = false;
            for (let i = 0; i < 5; i++) {
                loginFormVisible = await page.evaluate(() => {
                    const userInput = document.querySelector('#user');
                    const passInput = document.querySelector('#pass');
                    return !!(userInput && passInput);
                });
                if (loginFormVisible) break;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
    
            if (!loginFormVisible) {
                console.log('Login form not found after multiple attempts');
                return false;
            }
    
            // Fill in the login form
            await page.type('#user', globalLoginName);
            await page.type('#pass', globalLoginPW);
    
            // Submit the form
            await Promise.all([
                page.click('input[type="submit"][value="Anmelden"]'),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);
    
            // Check if login was successful
            const isLoggedIn = await page.evaluate(() => {
                return document.body.innerHTML.includes('Logout') || document.body.innerHTML.includes('Mein Konto');
            });
    
            if (isLoggedIn) {
                console.log('Login successful in Puppeteer browser');
                return true;
            } else {
                console.log('Login failed in Puppeteer browser');
                const content = await page.content();
                console.log('Page content:', content.slice(0, 500)); // Log first 500 characters
                return false;
            }
        } catch (error) {
            console.error('Error in performLogin2:', error);
            return false;
        }
    }

    while (true) {
        try {
            const hasMoreData = await readSheet();
            if (!hasMoreData) {
                console.log('No more data in the sheet, closing the browser...');
                await browser.close();
                return;
            }

            console.log(`Processing login: ${globalLoginName}`);

            await page.goto("https://www.medibee.de/login", {
                waitUntil: "networkidle0",
                timeout: 60000
            });

            await handleCookieConsent(page);

            // Set zoom to 75%
            await setZoom(page);

            await sleep(5000);

            await handleCookiePopup(page);

            const loginSuccessful = await performLogin2(page);
            if (!loginSuccessful) {
                console.log('Login failed. Moving to next user.');
                continue;
            }

            try {
                let allQuizzesCompleted = true;
                for (const quiz of quizzes) {
                    console.log(`Starting ${quiz.name} quiz...`);
                    const quizCompleted = await quiz.func(page, 3); // 3 is the maximum number of retries
                    console.log(`${quiz.name} quiz completed:`, quizCompleted ? 'Successfully' : 'With errors');
                    if (!quizCompleted) {
                        console.log(`${quiz.name} quiz failed after multiple attempts. Moving to next quiz.`);
                        allQuizzesCompleted = false;
                        break; // Optional: remove this line if you want to continue with next quizzes even if one fails
                    }
                }
                if (!allQuizzesCompleted) {
                    console.log('Not all quizzes were completed successfully. Moving to next user.');
                    continue;
                }
            } catch (error) {
                console.error('Error running quizzes:', error);
            }

            // Logout process
            try {
                console.log('Attempting to logout...');
                await page.goto('https://www.medibee.de/', { waitUntil: 'networkidle0', timeout: 60000 });
                await sleep(5000);

                // Execute logout JavaScript
                const logoutResult = await page.evaluate(() => {
                    // Check if the logout function exists
                    if (typeof logout === 'function') {
                        logout();
                        return 'Logout function called successfully';
                    } else {
                        // If the logout function doesn't exist, try to find and click a logout link
                        const logoutLink = document.querySelector('a[href*="logout"]');
                        if (logoutLink) {
                            logoutLink.click();
                            return 'Logout link clicked successfully';
                        } else {
                            return 'Unable to find logout function or link';
                        }
                    }
                });

                console.log('Logout result:', logoutResult);

                // Wait for potential redirect after logout
                await sleep(5000);

                // Verify logout
                const isLoggedOut = await page.evaluate(() => {
                    return !document.body.innerHTML.includes('Logout') && !document.body.innerHTML.includes('Mein Konto');
                });

                if (isLoggedOut) {
                    console.log('Logout verification successful');
                } else {
                    console.log('Logout verification failed. User might still be logged in.');
                    
                    // Additional check: try to access a protected page
                    await page.goto('https://www.medibee.de/mein-konto', { waitUntil: 'networkidle0', timeout: 60000 });
                    const isRedirectedToLogin = await page.url().includes('/login');
                    if (isRedirectedToLogin) {
                        console.log('Redirected to login page. Logout seems successful.');
                    } else {
                        console.log('Not redirected to login page. Logout may have failed.');
                    }
                }

                console.log('Logout attempt completed.');
            } catch (error) {
                console.error('Error during logout:', error);
                // Take a screenshot for debugging
                await page.screenshot({ path: 'logout-error-screenshot.png', fullPage: true });
            }

            console.log('All tests completed for current user. Moving to next user if available.');

            } catch (error) {
                console.error("An error occurred:", error);
                await sleep(5000);
            }
        }
    };

// Start the scraping
(async () => {
  try {
      await startMedibee();
  } catch (error) {
      console.error("Error in main execution:", error);
  }
})();

module.exports = { sleep };