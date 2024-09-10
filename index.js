"use strict";
// index.js
const puppeteer = require('puppeteer-extra');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { runPerenterolQuiz } = require('./perenterolQuiz');
const { runPerenterolWabenQuiz } = require('./perenterolWabenQuiz');
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

const quizzes = [
    // { name: 'Perenterol', func: runPerenterolQuiz },
    { name: 'Perenterol1', func: runPerenterolWabenQuiz },
    // More quizzes here
];

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

async function performLogin2(page) {
    try {
        console.log(`Attempting login for user: ${globalLoginName}`);

        await page.goto('https://www.medibee.de/login', { waitUntil: 'networkidle0', timeout: 60000 });

        // Check if we're already logged in
        const logoutButton = await page.$('#top > header > div.navigation.sticky > div > nav > div > div.meta-wrapper > ul > li.meta-item.logout > a > div');
        if (logoutButton) {
            console.log('Already logged in. Logging out first...');
            await logoutButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
        }

        // Wait for the login form to be available
        await page.waitForSelector('#user', { visible: true, timeout: 30000 });

        // Check if the login form is actually visible
        const isLoginFormVisible = await page.evaluate(() => {
            const userInput = document.querySelector('#user');
            const passInput = document.querySelector('#pass');
            return userInput && passInput && 
                   window.getComputedStyle(userInput).display !== 'none' && 
                   window.getComputedStyle(passInput).display !== 'none';
        });

        if (!isLoginFormVisible) {
            console.log('Login form is not visible. Refreshing the page...');
            await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
            await page.waitForSelector('#user', { visible: true, timeout: 30000 });
        }

        // Fill in the login form
        await page.type('#user', globalLoginName, { delay: 50 });
        await page.type('#pass', globalLoginPW, { delay: 50 });

        // Submit the form
        await Promise.all([
            page.click('input[type="submit"][value="Anmelden"]'),
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
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
            return false;
        }
    } catch (error) {
        console.error('Error in performLogin2:', error);
        return false;
    }
}

async function logout(page, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Logout attempt ${attempt} of ${maxRetries}`);
        try {
            console.log('Attempting to logout...');
            await page.goto('https://www.medibee.de/', { waitUntil: 'networkidle0', timeout: 60000 })
                .catch(e => {
                    console.log('Navigation error:', e.message);
                    throw e; // Rethrow to be caught by the outer try-catch
                });

            await sleep(2500);

            const logoutResult = await page.evaluate(() => {
                if (typeof logout === 'function') {
                    logout();
                    return 'Logout function called successfully';
                } else {
                    const logoutLink = document.querySelector('a[href*="logout"]');
                    if (logoutLink) {
                        logoutLink.click();
                        return 'Logout link clicked successfully';
                    } else {
                        return 'Unable to find logout function or link';
                    }
                }
            }).catch(e => {
                console.log('Logout evaluation error:', e.message);
                throw e; // Rethrow to be caught by the outer try-catch
            });

            console.log('Logout result:', logoutResult);
            await sleep(2500);

            const isLoggedOut = await page.evaluate(() => {
                return !document.body.innerHTML.includes('Logout') && !document.body.innerHTML.includes('Mein Konto');
            }).catch(e => {
                console.log('Logout verification error:', e.message);
                throw e; // Rethrow to be caught by the outer try-catch
            });

            if (isLoggedOut) {
                console.log('Logout verification successful');
                return true; // Successful logout
            } else {
                console.log('Logout verification failed. User might still be logged in.');
                await page.goto('https://www.medibee.de/mein-konto', { waitUntil: 'networkidle0', timeout: 60000 })
                    .catch(e => console.log('Navigation error:', e.message));
                const isRedirectedToLogin = await page.url().includes('/login');
                if (isRedirectedToLogin) {
                    console.log('Redirected to login page. Logout seems successful.');
                    return true; // Successful logout
                } else {
                    console.log('Not redirected to login page. Logout may have failed.');
                    throw new Error('Logout failed'); // Force a retry
                }
            }
        } catch (error) {
            console.error(`Error during logout attempt ${attempt}:`, error.message);
            if (attempt === maxRetries) {
                console.error('Maximum logout retries reached. Logout failed.');
                return false; // Failed to logout after all retries
            }
            console.log('Retrying logout...');
            await sleep(3000); // Wait before retrying
        }
    }
}

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

    while (true) {
        try {
            const hasMoreData = await readSheet();
            if (!hasMoreData) {
                console.log('No more data in the sheet, closing the browser...');
                await browser.close();
                return;
            }

            console.log(`Processing login: ${globalLoginName}`);

            for (const quiz of quizzes) {
                console.log(`Starting ${quiz.name} quiz...`);

                // Login for each quiz
                await page.goto("https://www.medibee.de/login", {
                    waitUntil: "networkidle0",
                    timeout: 60000
                });

                await handleCookieConsent(page);
                await handleCookiePopup(page);

                const loginSuccessful = await performLogin2(page);
                if (!loginSuccessful) {
                    console.log(`Login failed for ${quiz.name} quiz. Skipping this quiz.`);
                    continue;
                }

                console.log(`Login successful for ${quiz.name} quiz. Running quiz...`);

                try {
                    // Run the quiz
                    const quizCompleted = await quiz.func(page, 3); // 3 is the maximum number of retries
                    console.log(`${quiz.name} quiz completed:`, quizCompleted ? 'Successfully' : 'With errors');
                } catch (quizError) {
                    console.error(`Error running ${quiz.name} quiz:`, quizError);
                }

                // Logout after each quiz
                console.log(`Attempting to logout after ${quiz.name} quiz...`);
                const logoutSuccessful = await logout(page);
                if (!logoutSuccessful) {
                    console.log(`Logout failed after ${quiz.name} quiz. Proceeding to next quiz or user.`);
                }

                // Add a delay between quizzes
                console.log('Waiting before next quiz...');
                await sleep(5000);
            }

            console.log('All quizzes completed for current user. Moving to next user if available.');

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