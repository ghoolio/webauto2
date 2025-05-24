"use strict";
// index.js - Main Entry Point
const puppeteer = require('puppeteer-core');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { sleep } = require('./utils/commonUtils');
const { checkFor503Error } = require('./utils/browserUtils');
const { performLogin, clearLoginData } = require('./utils/loginUtils');
const { runQuiz } = require('./core/quizRunner');
const { quizRegistry } = require('./quizzes/quizRegistry');

dotenv.config();

// Google Sheets configuration
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

async function killSpecificChromiumProcess(pid) {
    return new Promise((resolve, reject) => {
        exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error killing Chrome process ${pid}: ${error.message}`);
                // Resolve anyway, as the process might have already ended
            }
            console.log(`Chrome process ${pid} terminated`);
            resolve();
        });
    });
}

async function cleanupDefaultFolder(browser) {
    const defaultFolderPath = path.join(__dirname, "tmp", "Default");
    console.log("Cleaning up Default folder...");

    try {
        if (browser && browser.process() != null) {
            const pid = browser.process().pid;
            await browser.close();
            await killSpecificChromiumProcess(pid);
        }
        await sleep(5000); // Wait for 5 seconds after closing the browser
        await removeDirectoryContents(defaultFolderPath);
        console.log("Default folder cleaned up successfully.");
    } catch (err) {
        console.error("Error during cleanup:", err);
    }
}

async function removeDirectoryContents(dirPath) {
    try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            try {
                const stat = await fs.stat(filePath);
                if (stat.isDirectory()) {
                    await removeDirectoryContents(filePath);
                    await fs.rmdir(filePath).catch(err => {
                        if (err.code !== 'ENOTEMPTY') {
                            console.log(`Could not remove directory ${filePath}: ${err.message}`);
                        }
                    });
                } else {
                    await fs.unlink(filePath).catch(err => {
                        if (err.code !== 'EBUSY' && err.code !== 'EPERM') {
                            console.log(`Could not delete file ${filePath}: ${err.message}`);
                        }
                    });
                }
            } catch (err) {
                console.log(`Error processing ${filePath}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${dirPath}: ${err.message}`);
    }
}

async function retryCleanup(browser, maxRetries = 3, retryDelay = 10000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await cleanupDefaultFolder(browser);
            console.log(`Cleanup successful on attempt ${attempt}`);
            return;
        } catch (error) {
            console.log(`Cleanup attempt ${attempt} failed: ${error.message}`);
            if (attempt < maxRetries) {
                console.log(`Retrying in ${retryDelay / 1000} seconds...`);
                await sleep(retryDelay);
            }
        }
    }
    console.log(`Failed to clean up after ${maxRetries} attempts. Proceeding with execution.`);
}

async function logout(page, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Logout attempt ${attempt} of ${maxRetries}`);
        try {
            console.log('Attempting to logout...');
            
            // Always navigate to the home page first
            console.log('Navigating to academy home page...');
            await page.goto('https://academy.medice-health-family.com/home/content/all', 
                { waitUntil: 'networkidle0', timeout: 60000 })
                .catch(e => {
                    console.log('Navigation error:', e.message);
                    // Continue despite navigation errors
                });
            await sleep(3000);
            
            console.log('Clicking profile button...');
            
            // Try to find and click profile button
            let profileButtonClicked = false;
            try {
                // Wait for profile button to be visible
                await page.waitForSelector('.profile-button-container', { visible: true, timeout: 10000 });
                
                // Click the profile button to open dropdown
                await page.click('.profile-button-container');
                
                profileButtonClicked = true;
                console.log('Profile button clicked successfully');
                
                // Wait for dropdown menu to appear
                await sleep(1000);
                
                // Now click the Abmelden button in the dropdown
                console.log('Clicking Abmelden button...');
                
                // Try using the data-test attribute first (most reliable)
                await page.waitForSelector('button[data-test="logout"]', { visible: true, timeout: 5000 });
                await page.click('button[data-test="logout"]');
                
                console.log('Abmelden button clicked successfully');
            } catch (clickError) {
                console.log('Error clicking profile/logout buttons with primary selectors:', clickError.message);
                
                if (!profileButtonClicked) {
                    // Try alternative selectors for profile button
                    try {
                        // Try alternative selectors
                        const altProfileSelectors = [
                            '.user-menu', 
                            '.profile-pic', 
                            '.user-info', 
                            '[aria-label="Menu"]',
                            '.avatar'
                        ];
                        
                        for (const selector of altProfileSelectors) {
                            const exists = await page.$(selector);
                            if (exists) {
                                await page.click(selector);
                                profileButtonClicked = true;
                                console.log(`Clicked profile button with selector: ${selector}`);
                                await sleep(1000);
                                break;
                            }
                        }
                        
                        // If still not clicked, try more generic approach
                        if (!profileButtonClicked) {
                            await page.evaluate(() => {
                                // Look for any button that might be a profile button
                                const profileElements = Array.from(document.querySelectorAll('button, .profile, .user, [class*="profile"], [class*="user"]'));
                                const profileButton = profileElements.find(el => {
                                    // Check if it's positioned in the top right area
                                    const rect = el.getBoundingClientRect();
                                    return rect.top < 100 && rect.right > window.innerWidth - 100;
                                });
                                
                                if (profileButton) {
                                    profileButton.click();
                                    return true;
                                }
                                return false;
                            });
                            await sleep(1000);
                        }
                    } catch (altError) {
                        console.log('Alternative profile button selection failed:', altError.message);
                    }
                }
                
                // Try to find and click logout button
                try {
                    // Look for logout button with various selectors
                    const logoutSelectors = [
                        'button[data-test="logout"]',
                        'a.logout',
                        '.logout-button',
                        'button:has-text("Abmelden")',
                        'button:has-text("Logout")'
                    ];
                    
                    let logoutClicked = false;
                    
                    for (const selector of logoutSelectors) {
                        try {
                            const exists = await page.$(selector);
                            if (exists) {
                                await page.click(selector);
                                logoutClicked = true;
                                console.log(`Clicked logout button with selector: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            console.log(`Error clicking logout with selector ${selector}:`, e.message);
                        }
                    }
                    
                    // If still not clicked, try by text content
                    if (!logoutClicked) {
                        await page.evaluate(() => {
                            // Look for elements containing "Abmelden" or "Logout" text
                            const elements = Array.from(document.querySelectorAll('button, a'));
                            const logoutElement = elements.find(el => 
                                el.textContent && (
                                    el.textContent.includes('Abmelden') || 
                                    el.textContent.includes('Logout') ||
                                    el.textContent.includes('abmelden')
                                )
                            );
                            
                            if (logoutElement) {
                                logoutElement.click();
                                return true;
                            }
                            return false;
                        });
                    }
                } catch (logoutError) {
                    console.log('Error finding logout button:', logoutError.message);
                }
            }
            
            // Wait for logout to process
            await sleep(3000);
            
            // Verify logout was successful
            console.log('Verifying logout...');
            
            const isLoggedOut = await page.evaluate(() => {
                // Check if elements that only appear when logged in are gone
                const profileElement = document.querySelector('.profile-button-container');
                const logoutButton = document.querySelector('button[data-test="logout"]');
                const welcomeMessage = document.querySelector('.login-form') || 
                                     document.body.innerHTML.includes('Anmelden') ||
                                     document.body.innerHTML.includes('Login');
                
                return (!profileElement && !logoutButton) || welcomeMessage;
            }).catch(e => {
                console.log('Logout verification error:', e.message);
                return false;
            });
            
            if (isLoggedOut) {
                console.log('Logout verification successful');
                return true; // Successful logout
            } else {
                console.log('Logout verification failed. User might still be logged in.');
                // Try one more verification by checking if redirected to login page
                if (page.url().includes('/login')) {
                    console.log('Redirected to login page. Logout seems successful.');
                    return true; // Successful logout
                } else {
                    throw new Error('Logout verification failed');
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
    return false;
}

const startMedibee = async () => {
    let browser;
    try {
        // Initial cleanup
        await retryCleanup();

        browser = await puppeteer.launch({
            executablePath: '/Users/user/.cache/puppeteer/chrome/mac_arm-126.0.6478.126/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-features=IsolateOrigins,site-per-process',
                '--enable-features=NetworkService',
                '--enable-logging',
                '--v=1'
            ],
        });

        const page = await browser.newPage();
        
        // Set page timeout to be more generous
        page.setDefaultTimeout(60000);

        const pages = await browser.pages();
        if (pages.length > 1) {
            await pages[0].close();
        }

        // Get list of enabled quizzes from registry
        const enabledQuizzes = quizRegistry.getEnabledQuizzes();
        console.log(`Enabled quizzes: ${enabledQuizzes.join(', ')}`);

        while (true) {
            try {
                const hasMoreData = await readSheet();
                if (!hasMoreData) {
                    console.log('No more data in the sheet, closing the browser...');
                    break;
                }
        
                console.log(`Processing login: ${globalLoginName}`);
        
                // Clear previous browser data
                await clearLoginData(page);
                console.log('Browser data cleared for clean session');
        
                let userSessionSuccessful = false;
                let userAttempts = 0;
                const maxUserAttempts = 3; // Increased attempts
        
                while (!userSessionSuccessful && userAttempts < maxUserAttempts) {
                    userAttempts++;
                    console.log(`Attempt ${userAttempts}/${maxUserAttempts} for user ${globalLoginName}`);
                
                    try {
                        // Perform login
                        const loginSuccessful = await performLogin(page, globalLoginName, globalLoginPW);
                        if (!loginSuccessful) {
                            throw new Error('Login failed');
                        }
                        
                        // Wait for page to stabilize after login
                        await sleep(5000);
                        
                        // Run each enabled quiz in sequence
                        for (const quizName of enabledQuizzes) {
                            console.log(`Starting quiz: ${quizName}`);
                            
                            const quiz = quizRegistry.getQuiz(quizName);
                            if (!quiz) {
                                console.log(`Quiz "${quizName}" not found in registry, skipping...`);
                                continue;
                            }
                            
                            try {
                                await runQuiz(page, quiz);
                                console.log(`Quiz "${quizName}" completed successfully.`);
                            } catch (quizError) {
                                console.error(`Error running quiz "${quizName}":`, quizError.message);
                                // Continue with next quiz even if this one failed
                            }
                            
                            // Navigate back to home page between quizzes
                            await page.goto('https://academy.medice-health-family.com/home', {
                                waitUntil: 'networkidle2',
                                timeout: 60000
                            }).catch(e => console.log('Home navigation error:', e.message));
                            
                            await sleep(3000);
                        }
                        
                        userSessionSuccessful = true;
                    } catch (error) {
                        console.error(`Error in user session (Attempt ${userAttempts}):`, error);
                        
                        // Take error screenshot
                        await page.screenshot({ path: `session-error-${globalLoginName}-attempt-${userAttempts}.png` });
                        
                        if (userAttempts < maxUserAttempts) {
                            console.log('Retrying user session after error...');
                            // Logout and clear data for next attempt
                            await logout(page);
                            await clearLoginData(page);
                            await sleep(5000);
                        }
                    }
                }
        
                if (!userSessionSuccessful) {
                    console.log(`Failed to complete session for ${globalLoginName} after ${maxUserAttempts} attempts. Moving to next user.`);
                } else {
                    console.log(`Successfully completed session for ${globalLoginName}`);
                }
        
                // Ensure thorough logout
                await logout(page);
                
                // Clear all browser data between users
                await clearLoginData(page);
        
                console.log('Moving to next user if available.');
                await sleep(5000);
        
            } catch (error) {
                console.error("An error occurred:", error);
                await sleep(5000);
            }
        }
    } catch (error) {
        console.error("Error in main execution:", error);
    } finally {
        // Final cleanup before exiting
        if (browser) {
            await browser.close();
        }
        await retryCleanup();
    }
};

// Handle script interruptions
process.on("SIGINT", async () => {
    console.log("Script interrupted. Cleaning up...");
    await retryCleanup();
    process.exit();
});

// Start the process
(async () => {
    try {
        await retryCleanup();
        await startMedibee();
    } catch (error) {
        console.error("Error in main execution:", error);
    } finally {
        await retryCleanup();
    }
})();