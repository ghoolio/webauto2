"use strict";

const { sleep, clickNextButton, clickWeiterButton } = require('./utils');

function humanDelay(baseMs) {
    return sleep(baseMs + Math.floor(Math.random() * 200));
}

async function navigateToQuizPage(page) {
    await page.goto('https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-5-schnelle-fragen-zu-perenterol', { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('Navigated to Perenterol quiz page');
}

async function switchToQuizFrame(page) {
    const outerFrame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
    if (!outerFrame) throw new Error('Could not find the outer iframe');

    const innerFrame = await outerFrame.childFrames().find(f => f.url().includes('/fileadmin/elearnings/'));
    if (!innerFrame) throw new Error('Could not find the inner iframe');

    return innerFrame;
}

async function startQuiz(frame) {
    await frame.click('#acc-6WrES1MOsT8').catch(() => {});
    await sleep(3000);
}

async function runPerenterolQuiz(page, maxRetries = 3) {
    console.log('Starting Perenterol test...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} of ${maxRetries}`);
            await navigateToQuizPage(page);
            await humanDelay(1000);
            const frame = await switchToQuizFrame(page);
            await humanDelay(500);
            await startQuiz(frame);
            
            let allQuestionsAnswered = true;

            // Text input question
            console.log('Handling text input question...');
            allQuestionsAnswered &= await handleTextInput(frame);
            if (!allQuestionsAnswered) throw new Error("Failed to answer text input question");
            await humanDelay(1000);
            await clickNextButton(frame);
            await humanDelay(500);
            await clickWeiterButton(frame);
            await humanDelay(1000);

            // First multiple choice question
            console.log('Handling first multiple choice question...');
            allQuestionsAnswered &= await handleMultipleChoice(frame);
            if (!allQuestionsAnswered) throw new Error("Failed to answer first multiple choice question");
            await humanDelay(1000);
            await clickNextButton(frame);
            await humanDelay(500);
            await clickWeiterButton(frame);
            await humanDelay(1000);

            // First drag and drop question
            console.log('Handling first drag and drop question...');
            await Promise.all([
                handleDragAndDropQuestion(frame),
                humanDelay(3000)
            ]);
            await humanDelay(1000);
            await clickNextButton(frame);
            await humanDelay(500);
            await clickWeiterButton(frame);
            await humanDelay(1000);

            // Second multiple choice question
            console.log('Handling second multiple choice question...');
            allQuestionsAnswered &= await handleMultipleChoice2(frame);
            if (!allQuestionsAnswered) throw new Error("Failed to answer second multiple choice question");
            await humanDelay(1000);
            await clickNextButton(frame);
            await humanDelay(500);
            await clickWeiterButton(frame);
            await humanDelay(1000);

            // Second drag and drop question
            console.log('Handling second drag and drop question...');
            await Promise.all([
                handleDragAndDropQuestion2(frame),
                humanDelay(3000)
            ]);
            await humanDelay(1000);
            await clickNextButton(frame);
            await humanDelay(500);
            await clickWeiterButton(frame);

            console.log('All questions answered. Waiting for submit button to appear...');
            await humanDelay(5000); // Longer wait for submit button

            const parentFrame = frame.parentFrame();
            if (parentFrame) {
                let submitClicked = false;
                for (let submitAttempt = 1; submitAttempt <= 5; submitAttempt++) {
                    try {
                        console.log(`Attempt ${submitAttempt} to click submit button`);
                        
                        // Try to click the button using JavaScript
                        const clicked = await parentFrame.evaluate(() => {
                            const submitButton = document.querySelector('#ap-elearning--submit');
                            if (submitButton) {
                                submitButton.click();
                                return true;
                            }
                            return false;
                        });

                        if (clicked) {
                            console.log('Final submit button clicked successfully via JavaScript');
                            submitClicked = true;
                            break;
                        } else {
                            console.log(`Submit button not found or not clickable. Attempt ${submitAttempt} of 5.`);
                        }
                    } catch (submitError) {
                        console.error(`Error during submit button click attempt ${submitAttempt}:`, submitError.message);
                    }
                    await humanDelay(2000); // Wait 2 seconds before next attempt
                }

                if (!submitClicked) {
                    console.log('Failed to click submit button after multiple attempts. Quiz may be incomplete.');
                }
            } else {
                console.error('Could not find parent frame for final submit');
            }

            console.log('Perenterol test completed.');
            return true; // Always return true to allow index.js to handle logout

        } catch (error) {
            console.error(`Error in Perenterol test (Attempt ${attempt}):`, error);
            if (attempt === maxRetries) {
                console.error('Maximum retries reached. Perenterol test failed.');
                await takeErrorScreenshot(page);
                return false;
            }
            console.log('Retrying...');
            await humanDelay(3000);
        }
    }
}

async function handleTextInput(frame) {
    const textInputSelectors = [
        '#slide-window textarea',
        'textarea[placeholder="Gib hier deine Antwort ein…"]',
    ];
    
    for (const selector of textInputSelectors) {
        try {
            await frame.waitForSelector(selector, { visible: true, timeout: 10000 });
            await frame.type(selector, 'Arzneihefe', { delay: 50 }); // Faster typing
            await humanDelay(500);
            return true;
        } catch (error) {
            console.log(`Error handling text input with selector ${selector}:`, error.message);
        }
    }
    
    return false;
}

async function handleMultipleChoice(frame) {
    const optionSelectors = [
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(6) > div > div:nth-child(3) > div > svg > g',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(7) > div > div:nth-child(3) > div > svg > g',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(8) > div > div:nth-child(3) > div > svg > g',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(9) > div > div:nth-child(3) > div > svg > g'
    ];

    let clickedCount = 0;

    for (const selector of optionSelectors) {
        try {
            await frame.waitForSelector(selector, { visible: true, timeout: 5000 });
            await frame.click(selector);
            console.log(`Clicked multiple choice option with selector: ${selector}`);
            await humanDelay(300); // Shorter wait between clicks
            clickedCount++;
        } catch (error) {
            console.log(`Error clicking option with selector ${selector}:`, error.message);
        }
    }

    return clickedCount === optionSelectors.length;
}

async function handleDragAndDropQuestion(frame) {
    const page = frame.page();
    await frame.waitForSelector('#slide-window', { timeout: 10000 });

    const dragDropPairs = [
        { 
            sourceSelector: 'div[data-acc-text*="Ist bei AAD kontraindiziert"]',
            targetSelector: 'div[data-acc-text*="img-packshot--imodium.png"]'
        },
        {
            sourceSelector: 'div[data-acc-text*="Muss zeitversetzt zum Antibiotikum eingenommen werden"]',
            targetSelector: 'div[data-acc-text*="img-packshot--omnibiotic-2.png"]'
        },
        {
            sourceSelector: 'div[data-acc-text*="Kann zeitgleich zum Antibiotikum eingenommen werden"]',
            targetSelector: 'div[data-acc-text*="img-packshot--perenterol.png"]'
        }
    ];

    for (const pair of dragDropPairs) {
        await dragAndDrop(page, frame, pair.sourceSelector, pair.targetSelector);
        await humanDelay(500); // Short delay between drag and drop operations
    }
}


async function handleMultipleChoice2(frame) {
    console.log('Handling second multiple choice question...');
    const optionSelectors = [
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(7) > div > div:nth-child(3) > div > svg > g',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(8) > div > div:nth-child(3) > div > svg > g',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(9) > div > div:nth-child(3) > div > svg > g'
    ];

    let clickedCount = 0;

    for (let i = 0; i < optionSelectors.length; i++) {
        try {
            console.log(`Attempting to click option ${i + 2}`);
            await frame.waitForSelector(optionSelectors[i], { visible: true, timeout: 5000 });
            await frame.click(optionSelectors[i]);
            console.log(`Successfully clicked option ${i + 2}`);
            await sleep(1000); // Wait a bit between clicks
            clickedCount++;
        } catch (error) {
            console.log(`Error clicking option ${i + 2}:`, error.message);
        }
    }

    return clickedCount === optionSelectors.length;
}

async function handleDragAndDropQuestion2(frame) {
    const page = frame.page();
    await frame.waitForSelector('#slide-window', { timeout: 10000 });

    const dragDropPairs = [
        { 
            sourceSelector: 'div[data-acc-text*="img-packshot--perenterol.png"]',
            targetSelector: 'div[data-acc-text*="Bindet Erreger und scheidet sie aus"]'
        },
        {
            sourceSelector: 'div[data-acc-text*="img-packshot--imodium.png"]',
            targetSelector: 'div[data-acc-text*="Hemmt die Darmmotilität"]'
        },
        {
            sourceSelector: 'div[data-acc-text*="img-packshot--omnibiotic-2.png"]',
            targetSelector: 'div[data-acc-text*="Als NEM nicht zur Behandlung von Durchfall zugelassen"]'
        }
    ];

    for (const pair of dragDropPairs) {
        await dragAndDrop(page, frame, pair.sourceSelector, pair.targetSelector);
    }
}

async function dragAndDrop(page, frame, sourceSelector, targetSelector) {
    const sourceElement = await frame.$(sourceSelector);
    const targetElement = await frame.$(targetSelector);

    if (sourceElement && targetElement) {
        const sourceBox = await sourceElement.boundingBox();
        const targetBox = await targetElement.boundingBox();

        if (sourceBox && targetBox) {
            await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
            await humanDelay(100);
            await page.mouse.down();
            await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2 + 125, { steps: 10 });
            await humanDelay(100);
            await page.mouse.up();
            await page.mouse.move(targetBox.x + targetBox.width / 2 + 5, targetBox.y + targetBox.height / 2 + 5 + 125, { steps: 5 });
            await page.mouse.move(targetBox.x + targetBox.width / 2 - 5, targetBox.y + targetBox.height / 2 - 5 + 125, { steps: 5 });
            await humanDelay(500);
        }
    }
}

async function takeErrorScreenshot(page) {
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
}

module.exports = { runPerenterolQuiz };