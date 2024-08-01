const puppeteer = require('puppeteer-extra');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { runPerenterolQuiz } = require('./perenterolQuiz');
const { checkFor503Error } = require('./utils');
const qs = require('qs');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const axios = wrapper(require('axios').default);
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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const stealthFixPlugin = require('puppeteer-extra-plugin-stealth-fix');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const { headers } = require('next/headers');

puppeteer.use(stealthFixPlugin());
puppeteer.use(stealthPlugin());

const startSchwalbe = async () => {
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

    // Define handleCookiePopup function
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
            // Wait for the cookie notification to be present
            await page.waitForSelector('#cookie-notification', { timeout: 5000 });
        
            // Check if the cookie notification is visible
            const isCookieNotificationVisible = await page.evaluate(() => {
                const cookieNotification = document.querySelector('#cookie-notification');
                return cookieNotification && window.getComputedStyle(cookieNotification).display !== 'none';
            });
        
            if (isCookieNotificationVisible) {
                console.log('Cookie notification is visible. Accepting cookies...');
        
                // Click the "Auswahl bestätigen" button
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
    
    async function ensureLoggedOut(client) {
        const logoutPageResponse = await client.get('https://www.medibee.de/login');
        const $ = cheerio.load(logoutPageResponse.data);
        const logoutForm = $('form[name="logout"]');
        
        if (logoutForm.length > 0) {
            console.log('Already logged in. Logging out...');
            const logoutResponse = await client.post('https://www.medibee.de/login', 
                qs.stringify({
                    logintype: 'logout',
                    pid: logoutForm.find('input[name="pid"]').val(),
                    'tx_felogin_pi1[noredirect]': logoutForm.find('input[name="tx_felogin_pi1[noredirect]"]').val()
                })
            );
            console.log('Logout response status:', logoutResponse.status);
        }
    }

    // Define performLogin function
    async function runPerenterolQuiz(page) {
        console.log('Starting Perenterol test...');
    
        try {
            await page.goto('https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-5-schnelle-fragen-zu-perenterol', { waitUntil: 'networkidle0', timeout: 60000 });
            console.log('Navigated to Perenterol quiz page...');
    
            // Wait for the iframe to load
            console.log("Waiting for iframe to load...");
            await page.waitForSelector('iframe.ap-elearning--iframe-top', { timeout: 30000 });
    
            // Switch to the iframe context
            console.log("Switching to iframe context...");
            const frame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
            
            if (!frame) {
                throw new Error('Could not find the quiz iframe');
            }
    
            console.log('Potential quiz frame found. Analyzing content...');
    
            // Try to find and click the "Los!" button or any suitable alternative
            const clickResult = await frame.evaluate(() => {
                const possibleSelectors = [
                    'svg *[cursor="pointer"]',
                    'button',
                    '*[role="button"]',
                    '*[onclick]',
                    '.slide-object-vectorshape',
                    '*[class*="start"]',
                    '*[id*="start"]'
                ];
    
                for (const selector of possibleSelectors) {
                    const elements = document.querySelectorAll(selector);
                    for (const element of elements) {
                        if (element.textContent.includes('Los') || element.textContent.includes('Start') || element.textContent.trim() === '') {
                            element.click();
                            return `Clicked element: ${selector}`;
                        }
                    }
                }
    
                return 'No suitable clickable element found';
            });
    
            console.log('Click attempt result:', clickResult);
    
            // Wait for potential changes
            await sleep(5000);
    
            // Answer 5 questions
            for (let i = 1; i <= 5; i++) {
                console.log(`Answering question ${i}...`);
                
                // Wait for the question to be visible (you might need to adjust this selector)
                await frame.waitForSelector('svg text', { timeout: 10000 }).catch(() => console.log(`Question ${i} not found`));
    
                // Click an answer (you may need to adjust the selector based on the actual structure)
                await frame.evaluate(() => {
                    const answerElements = document.querySelectorAll('svg *[cursor="pointer"]');
                    if (answerElements.length > 0) {
                        answerElements[0].click(); // Click the first answer
                    }
                });
    
                await sleep(2000);
    
                // Click the next question button
                await frame.evaluate(() => {
                    const nextButton = document.querySelector('svg *[cursor="pointer"]');
                    if (nextButton) {
                        nextButton.click();
                    }
                });
    
                await sleep(2000);
            }
    
            console.log("All questions answered. Waiting for results...");
            await sleep(5000);
    
            // Check for results or any final page
            const resultText = await frame.evaluate(() => document.body.innerText);
            console.log("Quiz completed. Result:", resultText);
    
            // Take a screenshot of the entire page
            await page.screenshot({ path: 'quiz-after-completion.png', fullPage: true });
    
            console.log('Perenterol test completed.');
        } catch (error) {
            console.error('Error in Perenterol test:', error);
            // Take a screenshot on error for debugging
            await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
        }
    }

    const cookieJar = new tough.CookieJar();

    async function loginAxios(nm, pw) {
        const client = axios.create({
            jar: cookieJar,
            withCredentials: true
        });
    
        try {
            await ensureLoggedOut(client);
            console.log(`Attempting login for user: ${nm}`);
            const loginPageResponse = await client.get('https://www.medibee.de/login');
            const $ = cheerio.load(loginPageResponse.data);
            
            const hiddenInputs = {};
            $('form input[type="hidden"]').each((i, el) => {
                hiddenInputs[$(el).attr('name')] = $(el).val();
            });
    
            console.log('Hidden inputs found:', hiddenInputs);
    
            const loginResponse = await client.post('https://www.medibee.de/login', 
                qs.stringify({
                    user: nm,
                    pass: pw,
                    submit: 'Anmelden',
                    logintype: 'login',
                    pid: hiddenInputs.pid || '17@68280de23ad0092ce76442debbb2676c10d754cd',
                    redirect_url: hiddenInputs.redirect_url || '/lernmodule',
                    'tx_felogin_pi1[noredirect]': hiddenInputs['tx_felogin_pi1[noredirect]'] || '0',
                    ...hiddenInputs
                }),
                {
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Accept-Encoding': 'gzip, deflate, br, zstd',
                        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cache-Control': 'max-age=0',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.medibee.de',
                        'Referer': 'https://www.medibee.de/login',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'same-origin',
                        'Sec-Fetch-User': '?1',
                        'Upgrade-Insecure-Requests': '1',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    },
                    maxRedirects: 0,
                    validateStatus: function (status) {
                        return status >= 200 && status < 400;
                    },
                }
            );
    
            console.log('Login response status:', loginResponse.status);
            console.log('Login response headers:', loginResponse.headers);
    
            if (loginResponse.status === 303 || loginResponse.status === 302) {
                console.log('Redirect URL:', loginResponse.headers.location);
                
                const redirectResponse = await client.get(loginResponse.headers.location);
                
                console.log('Redirect response status:', redirectResponse.status);
                console.log('Redirect response URL:', redirectResponse.config.url);
    
                const checkLoginResponse = await client.get('https://www.medibee.de/lernmodule');
                
                if (checkLoginResponse.data.includes('Logout') || checkLoginResponse.data.includes('Mein Konto')) {
                    console.log('Login successful (found Logout or Mein Konto in content)');
                    return true;
                } else {
                    console.log('Login failed. Not logged in after redirect.');
                    console.log('Response content:', checkLoginResponse.data.slice(0, 500)); // Log first 500 characters
                    return false;
                }
            } else {
                console.log('Login failed. Unexpected status code.');
                console.log('Response content:', loginResponse.data.slice(0, 500)); // Log first 500 characters
                return false;
            }
        } catch (error) {
            console.error('Error during login:', error.message);
            if (error.response) {
                console.log('Error response status:', error.response.status);
                console.log('Error response headers:', error.response.headers);
                console.log('Error response data:', error.response.data.slice(0, 500)); // Log first 500 characters
            }
            return false;
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

    async function runPerenterolQuiz(page) {
        console.log('Starting Perenterol test...');
    
        try {
            await page.goto('https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-5-schnelle-fragen-zu-perenterol', { waitUntil: 'networkidle0', timeout: 60000 });
            console.log('Navigated to Perenterol quiz page...');
    
            // Wait for the outer iframe to load
            console.log("Waiting for outer iframe to load...");
            await page.waitForSelector('iframe.ap-elearning--iframe-top', { timeout: 30000 });
    
            // Switch to the outer iframe context
            console.log("Switching to outer iframe context...");
            const outerFrame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
            
            if (!outerFrame) {
                throw new Error('Could not find the outer iframe');
            }
    
            // Wait for the inner iframe to load
            console.log("Waiting for inner iframe to load...");
            await outerFrame.waitForSelector('iframe.ap-elearning--iframe-bottom', { timeout: 30000 });
    
            // Switch to the inner iframe context
            console.log("Switching to inner iframe context...");
            const innerFrame = await outerFrame.childFrames().find(f => f.url().includes('/fileadmin/elearnings/'));
    
            if (!innerFrame) {
                throw new Error('Could not find the inner iframe');
            }
    
            console.log('Quiz frame found. Starting quiz...');
    
            // Click the start button
            await innerFrame.evaluate(() => {
                const startButton = document.querySelector('#acc-6WrES1MOsT8');
                if (startButton) {
                    startButton.click();
                    return 'Start button clicked';
                }
                return 'Start button not found';
            });
    
            console.log('Start button clicked. Waiting for quiz to load...');
            await innerFrame.waitForTimeout(2000);
    
            // Answer 5 questions
            for (let i = 1; i <= 5; i++) {
                console.log(`Attempting to answer question ${i}...`);
                
                await innerFrame.evaluate(() => {
                    const answerButtons = document.querySelectorAll('.slide-object-button');
                    if (answerButtons.length > 0) {
                        answerButtons[0].click();
                        return 'Answer clicked';
                    }
                    return 'No clickable answer found';
                });
    
                console.log(`Clicked answer for question ${i}`);
                await innerFrame.waitForTimeout(1000);
    
                // Click the next button
                await innerFrame.evaluate(() => {
                    const nextButton = document.querySelector('.slide-object-button[aria-label="Next Slide"]');
                    if (nextButton) {
                        nextButton.click();
                        return 'Next button clicked';
                    }
                    return 'Next button not found';
                });
    
                console.log(`Clicked next button after question ${i}`);
                await innerFrame.waitForTimeout(1000);
            }
    
            console.log('All questions answered. Waiting for results...');
            await innerFrame.waitForTimeout(2000);
    
            // Check for results
            const resultText = await innerFrame.evaluate(() => {
                const resultElement = document.querySelector('.ap-lightbox__message');
                return resultElement ? resultElement.innerText : 'Result not found';
            });
            console.log("Quiz completed. Result:", resultText);
    
            console.log('Perenterol test completed.');
        } catch (error) {
            console.error('Error in Perenterol test:', error);
            // Take a screenshot on error for debugging
            await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
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

            /* let loginAttempts = 0;
            const maxLoginAttempts = 3;
            let loginSuccessful = false;

            while (loginAttempts < maxLoginAttempts && !loginSuccessful) {
                loginAttempts++;
                loginSuccessful = await performLogin(page, loginAttempts);
                
                if (!loginSuccessful && loginAttempts < maxLoginAttempts) {
                    console.log(`Login attempt ${loginAttempts} failed. Waiting before next attempt...`);
                    await sleep(5000);
                }
            }

            if (!loginSuccessful) {
                console.error(`Failed to log in after ${maxLoginAttempts} attempts. Moving to next user.`);
                continue; // Skip to next user
            } */

            const tests = [
                //{ name: 'remifeminQuiz', func: runRemifeminQuiz },
                { name: 'perenterolQuiz', func: runPerenterolQuiz }
            ];

            for (let i = 0; i < tests.length; i++) {
                const test = tests[i];
                let testCompleted = false;
                let retryCount = 0;
            
                while (!testCompleted && retryCount < maxRetries) {
                    try {
                        await test.func(page);
                        testCompleted = true;
                    } catch (error) {
                        console.error(`Error in ${test.name} test:`, error);
                        const is503Error = await checkFor503Error(page);
                        if (is503Error) {
                            console.log(`TYPO3 503 error detected during ${test.name} test. Restarting this test...`);
                            retryCount++;
                            await sleep(5000);
                            await page.goto("https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-5-schnelle-fragen-zu-perenterol", {
                                waitUntil: "domcontentloaded",
                                timeout: 60000
                            });
                            await setZoom(page);  // Reapply zoom after navigation
                        } else {
                            console.log(`Unexpected error in ${test.name} test. Retrying...`);
                            retryCount++;
                            await sleep(5000);
                        }
                    }
                }
            
                if (!testCompleted) {
                    console.error(`Failed to complete ${test.name} test after ${maxRetries} retries. Moving to next test.`);
                }
            }

            try {
                const logoutSelector = 'body > main > div.tx-felogin-pi1 > section > div > form > fieldset > div.row.ap-form__submit > div > input';
                const logoutButton = await page.$(logoutSelector);
                if (logoutButton) {
                    await logoutButton.click();
                    console.log('Logout successful');
                } else {
                    console.log('Logout button not found. User might already be logged out.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
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
      await startSchwalbe();
  } catch (error) {
      console.error("Error in main execution:", error);
  }
})();

module.exports = { sleep };