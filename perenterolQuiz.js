"use strict";
// Optimized perenterolQuiz.js

const { sleep, clickNextButton, clickWeiterButton } = require('./utils');

async function runPerenterolQuiz(page) {
    console.log('Starting Perenterol test...');

    try {
        await navigateToQuizPage(page);
        const frame = await switchToQuizFrame(page);
        await startQuiz(frame);
        await answerQuestions(frame);
        
        await Promise.all([
            handleDragAndDropQuestion(frame),
            sleep(5000)
        ]);
        
        await clickNextButton(frame);
        await clickWeiterButton(frame);

        await handleMultipleChoice2(frame);
        await clickNextButton(frame);
        await clickWeiterButton(frame);

        await Promise.all([
            handleDragAndDropQuestion2(frame),
            sleep(5000)
        ]);
        
        await clickNextButton(frame);
        await clickWeiterButton(frame);

        console.log('Waiting for final submit button...');
        await sleep(5000);

        const parentFrame = frame.parentFrame();
        if (parentFrame) {
            await parentFrame.click('#ap-elearning--submit').catch(() => console.log('Failed to click final submit button'));
        }

        await sleep(5000);

        console.log('Perenterol test completed.');
        return true;

    } catch (error) {
        console.error('Error in Perenterol test:', error);
        await takeErrorScreenshot(page);
        return false;
    }
}

async function navigateToQuizPage(page) {
    await page.goto('https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-5-schnelle-fragen-zu-perenterol', { waitUntil: 'networkidle0', timeout: 60000 });
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

async function answerQuestions(frame) {
    const textInputSuccess = await handleTextInput(frame);
    if (textInputSuccess) {
        await clickNextButton(frame);
        await clickWeiterButton(frame);
    }

    const multipleChoiceSuccess = await handleMultipleChoice(frame);
    if (multipleChoiceSuccess) {
        await clickNextButton(frame);
        await clickWeiterButton(frame);
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
            await frame.type(selector, 'Arzneihefe', { delay: 100 });
            await sleep(2000);
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

    let clickedAny = false;

    for (const selector of optionSelectors) {
        try {
            await frame.waitForSelector(selector, { visible: true, timeout: 5000 });
            await frame.click(selector);
            console.log(`Clicked multiple choice option with selector: ${selector}`);
            await sleep(1000); // Wait a bit between clicks
            clickedAny = true;
        } catch (error) {
            console.log(`Error clicking option with selector ${selector}:`, error.message);
        }
    }

    return clickedAny;
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
    }
}

async function handleMultipleChoice2(frame) {
    console.log('Handling second multiple choice question...');
    const optionSelectors = [
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(7) > div > div:nth-child(3) > div > svg > g',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(8) > div > div:nth-child(3) > div > svg > g',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(9) > div > div:nth-child(3) > div > svg > g'
    ];

    let clickedAny = false;

    for (let i = 0; i < optionSelectors.length; i++) {
        try {
            console.log(`Attempting to click option ${i + 2}`);
            await frame.waitForSelector(optionSelectors[i], { visible: true, timeout: 5000 });
            await frame.click(optionSelectors[i]);
            console.log(`Successfully clicked option ${i + 2}`);
            await sleep(1000); // Wait a bit between clicks
            clickedAny = true;
        } catch (error) {
            console.log(`Error clicking option ${i + 2}:`, error.message);
        }
    }

    if (clickedAny) {
        console.log('Successfully clicked at least one option in the second multiple choice question');
    } else {
        console.log('Failed to click any options in the second multiple choice question');
    }

    return clickedAny;
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
            await page.mouse.down();
            await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2 + 150, { steps: 10 });
            await page.mouse.up();
            await page.mouse.move(targetBox.x + targetBox.width / 2 + 5, targetBox.y + targetBox.height / 2 + 5 + 150, { steps: 5 });
            await page.mouse.move(targetBox.x + targetBox.width / 2 - 5, targetBox.y + targetBox.height / 2 - 5 + 150, { steps: 5 });
            await sleep(2000);
        }
    }
}

async function takeErrorScreenshot(page) {
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
}

module.exports = { runPerenterolQuiz };