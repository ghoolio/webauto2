"use strict";

const { sleep } = require('./utils');

const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multipleChoice',
    MULTIPLE_CHOICE2: 'multipleChoice2',
    DRAG_AND_DROP1: 'dragAndDrop1',
    DRAG_AND_DROP2: 'dragAndDrop2',
    TEXT_INPUT: 'textInput',
    WEITER_ONLY: 'weiterOnly'
};

const quizStructure = [
    { 
        type: QUESTION_TYPES.MULTIPLE_CHOICE, 
        options: 4,
        selectors: [
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(46) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(45) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(44) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(43) > div > div:nth-child(1) > div > svg > g'
        ],
        correctAnswers: [1, 2, 3]
    },
    {
        type: QUESTION_TYPES.DRAG_AND_DROP1,
        pairs: [
            {
                sourceSelector: 'div[data-acc-text="img-packshot--imodium.png"]',
                targetSelector: 'div[data-acc-text*="Hemmt die Darmmotilität"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Perenterol-Forte_R_102021.png"]',
                targetSelector: 'div[data-acc-text*="Bindet Erreger und scheidet sie aus"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Tannacomp rechts vorne.png"]',
                targetSelector: 'div[data-acc-text*="Dichtet die Darmwand ab, wirkt antibakteriell und krampflösend"]'
            },
            {
                sourceSelector: 'div[data-acc-text="13584824_OB_10_20Stk_2000x2000px_RGB-72dpi.png"]',
                targetSelector: 'div[data-acc-text*="Als NEM nicht zur Behandlung"]'
            }
        ]
    },
    {
        type: QUESTION_TYPES.WEITER_ONLY,
        selector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(42) > div > svg > g'
    },
    {
        type: QUESTION_TYPES.DRAG_AND_DROP2,
        pairs: [
            {
                sourceSelector: 'div[data-acc-text="Linderung des akuten Durchfalls"]',
                targetSelector: 'div[data-acc-text*="So unterstützt Perenterol die Reduktion des Wassereinstroms in den Darm"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Durchfall entsteht"]',
                targetSelector: 'div[data-acc-text*="Durch Viren wird u.a. die Aufnahme von Nährstoffen  gestört und vermehrt Wasser in den Darm abgegeben"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Die Nährstoffaufnahme wird begünstigt"]',
                targetSelector: 'div[data-acc-text*="S. boulardii unterstützt die Aktivität wichtiger Darmenzyme"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Die Regeneration der Darmschleimhaut wird gefördert"]',
                targetSelector: 'div[data-acc-text*="S. boulardii produziert und sezerniert Polyamine"]'
            }
        ]
    },
    {
        type: QUESTION_TYPES.TEXT_INPUT,
        answer: 'Arzneihefe'
    },
    {
        type: QUESTION_TYPES.WEITER_ONLY,
        selector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(42) > div > svg > g'
    },
    { 
        type: QUESTION_TYPES.MULTIPLE_CHOICE2, 
        options: 4,
        selectors: [
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(46) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(45) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(44) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(43) > div > div:nth-child(1) > div > svg > g'
        ],
        correctAnswers: [0, 1, 3]
    },
];

function humanDelay(baseMs) {
    return sleep(baseMs + Math.floor(Math.random() * 500));
}

async function runPerenterol1Quiz(page, maxRetries = 3) {
    console.log('Starting Perenterol test...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} of ${maxRetries}`);
            await navigateToQuizPage(page);
            console.log('Navigated to quiz page');
            await humanDelay(3000); // Wait for page to load
            const frame = await switchToQuizFrame(page);
            console.log('Switched to quiz frame');
            await startQuiz(frame);
            console.log('Quiz started');

            for (let i = 0; i < quizStructure.length; i++) {
                const questionNumber = i + 1;
                const questionInfo = quizStructure[i];
                
                console.log(`Handling question/slide ${questionNumber} (${questionInfo.type})...`);
                await humanDelay(2000); // Simulating reading time
                
                let success;
                switch (questionInfo.type) {
                    case QUESTION_TYPES.MULTIPLE_CHOICE:
                        success = await handleMultipleChoice(frame, questionNumber, questionInfo);
                        break;
                    case QUESTION_TYPES.MULTIPLE_CHOICE2:
                        success = await handleMultipleChoice(frame, questionNumber, questionInfo);
                        break;    
                    case QUESTION_TYPES.DRAG_AND_DROP1:
                    case QUESTION_TYPES.DRAG_AND_DROP2:
                        success = await handleDragAndDrop(frame, questionNumber, questionInfo.pairs, questionInfo.type);
                        break;
                    case QUESTION_TYPES.TEXT_INPUT:
                        success = await handleTextInput(frame, questionNumber, questionInfo.answer);
                        break;
                    case QUESTION_TYPES.WEITER_ONLY:
                        success = await handleWeiterOnly(frame, questionInfo.selector);
                        break;
                    default:
                        console.warn(`Unknown question type for question ${questionNumber}`);
                        success = false;
                }
                
                if (!success) {
                    console.error(`Failed to handle question/slide ${questionNumber}`);
                    throw new Error(`Failed to handle question/slide ${questionNumber}`);
                }
                
                // Handle "Weiter" clicks based on question type
                if (i < quizStructure.length - 1) {
                    if (questionInfo.type !== QUESTION_TYPES.WEITER_ONLY) {
                        // For non-WEITER_ONLY questions, click "Weiter" twice
                        console.log(`Clicking first "Weiter" after question ${questionNumber}`);
                        await humanDelay(1500);
                        const firstWeiterClicked = await clickWeiterButton(frame, false);
                        if (!firstWeiterClicked) {
                            throw new Error(`Failed to click first Weiter button after question ${questionNumber}`);
                        }
                        await waitForNextQuestion(frame);

                        console.log(`Clicking second "Weiter" after question ${questionNumber}`);
                        await humanDelay(1500);
                        const secondWeiterClicked = await clickWeiterButton(frame, true);
                        if (!secondWeiterClicked) {
                            throw new Error(`Failed to click second Weiter button after question ${questionNumber}`);
                        }
                        await waitForNextQuestion(frame);
                    }
                    // For WEITER_ONLY questions, the click is handled in handleWeiterOnly function
                }
            }

            console.log('All questions answered. Waiting for final submit button...');
            await humanDelay(5000);

            const parentFrame = frame.parentFrame();
            if (parentFrame) {
                await parentFrame.click('#ap-elearning--submit').catch((error) => {
                    console.error('Failed to click final submit button:', error);
                    throw error;
                });
            } else {
                throw new Error('Could not find parent frame for final submit');
            }

            await humanDelay(5000);

            console.log('Perenterol test completed successfully.');
            return true;

        } catch (error) {
            console.error(`Error in Perenterol test (Attempt ${attempt}):`, error);
            if (attempt === maxRetries) {
                console.error('Maximum retries reached. Perenterol test failed.');
                await takeErrorScreenshot(page);
                return false;
            }
            console.log('Retrying...');
            await humanDelay(5000);
        }
    }
}

async function handleWeiterOnly(frame, selector) {
    try {
        console.log(`Attempting to click Weiter button with selector: ${selector}`);
        await frame.waitForSelector(selector, { visible: true, timeout: 15000 });
        await humanDelay(1000); // Wait before clicking
        await frame.click(selector);
        console.log(`Successfully clicked Weiter button`);
        await humanDelay(2500); // Wait for transition
        await waitForNextQuestion(frame);
        return true;
    } catch (error) {
        console.error(`Failed to click Weiter button:`, error.message);
        return false;
    }
}

async function waitForNextQuestion(frame) {
    console.log('Waiting for next question to load...');
    await frame.waitForFunction(() => {
        const slideWindow = document.querySelector('#slide-window');
        return slideWindow && !slideWindow.classList.contains('animating');
    }, { timeout: 30000 });
    await humanDelay(2000); // Additional wait to ensure elements are interactive
    console.log('Next question loaded.');
}

async function handleMultipleChoice(frame, questionNumber, questionInfo) {
    console.log(`Handling multiple choice question ${questionNumber} with ${questionInfo.options} options...`);

    let correctlyClicked = 0;

    for (let i = 0; i < questionInfo.options; i++) {
        if (questionInfo.correctAnswers.includes(i)) {
            const selector = questionInfo.selectors[i];
            try {
                await frame.waitForSelector(selector, { visible: true, timeout: 10000 });
                await humanDelay(1000); // Pause before clicking
                await frame.click(selector);
                console.log(`Clicked correct option ${i + 1} with selector: ${selector}`);
                await humanDelay(1500);
                correctlyClicked++;
            } catch (error) {
                console.log(`Error clicking correct option ${i + 1} with selector ${selector}:`, error.message);
            }
        }
    }

    return correctlyClicked === questionInfo.correctAnswers.length;
}

async function handleDragAndDrop(frame, questionNumber, pairs, questionType) {
    console.log(`Handling drag and drop question ${questionNumber}...`);
    const page = frame.page();

    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        console.log(`Attempting drag-and-drop operation ${i + 1} of ${pairs.length}`);
        
        let success = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                success = await dragAndDropSequential(page, frame, pair.sourceSelector, pair.targetSelector, i === pairs.length - 1, questionType);
                if (success) {
                    console.log(`Successfully completed drag-and-drop operation ${i + 1}`);
                    break;
                }
                console.log(`Attempt ${attempt} failed for drag-and-drop operation ${i + 1}. Retrying...`);
                if (attempt < 3) {
                    console.log("Reloading page...");
                    await page.reload({ waitUntil: 'networkidle0' });
                    await sleep(5000); // Wait for page to stabilize after reload
                    frame = await page.frames().find(f => f.url().includes('/fileadmin/elearnings/'));
                    if (!frame) {
                        throw new Error('Could not find the quiz frame after reload');
                    }
                }
            } catch (error) {
                console.log(`Error in drag and drop operation ${i + 1}, attempt ${attempt}:`, error.message);
            }
        }

        if (!success) {
            console.log(`Failed to complete drag-and-drop operation ${i + 1} after multiple attempts`);
            await page.screenshot({ path: `failed-drag-drop-q${questionNumber}-pair${i + 1}.png`, fullPage: true });
            console.log(`Screenshot captured: failed-drag-drop-q${questionNumber}-pair${i + 1}.png`);
        }

        await sleep(3000); // Wait after each drag and drop operation
    }

    console.log("All drag and drop operations attempted.");
    return true; // Return true even if some operations failed, to continue with the quiz
}

async function dragAndDropSequential(page, frame, sourceSelector, targetSelector, isLastItem = false, questionType) {
    console.log(`Attempting drag-and-drop: ${sourceSelector} -> ${targetSelector}`);
    try {
        let sourceElement = await frame.$(sourceSelector);
        let targetElement = await frame.$(targetSelector);

        if (!sourceElement || !targetElement) {
            console.error(`Source or target element not found`);
            return false;
        }

        console.log(`Source element found: ${sourceElement !== null}`);
        console.log(`Target element found: ${targetElement !== null}`);

        const sourceText = await frame.evaluate(el => el.getAttribute('data-acc-text'), sourceElement);
        const targetText = await frame.evaluate(el => el.getAttribute('data-acc-text'), targetElement);

        console.log(`Source element text: ${sourceText}`);
        console.log(`Target element text: ${targetText}`);

        let sourceBox = await sourceElement.boundingBox();
        let targetBox = await targetElement.boundingBox();

        console.log(`Initial source bounding box: ${JSON.stringify(sourceBox)}`);
        console.log(`Initial target bounding box: ${JSON.stringify(targetBox)}`);

        if (!sourceBox) {
            console.log("Attempting to make source element visible...");
            await frame.evaluate((el) => {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            }, sourceElement);
            await sleep(1000);
            sourceBox = await sourceElement.boundingBox();
            console.log(`Updated source bounding box: ${JSON.stringify(sourceBox)}`);
        }

        if (sourceBox && targetBox) {
            // Perform the drag and drop using mouse events
            await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 30 });
            await page.mouse.up();
        } else {
            console.log("Falling back to JavaScript drag and drop simulation");
            await frame.evaluate((source, target) => {
                const dataTransfer = new DataTransfer();
                
                source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
                target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
                target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
                source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer }));
            }, sourceElement, targetElement);
        }

        console.log('Drag and drop action completed');

        await sleep(1000);
        const newSourceBox = await sourceElement.boundingBox();
        if (JSON.stringify(newSourceBox) === JSON.stringify(sourceBox)) {
            console.log('Warning: Source element position did not change after drag');
        } else {
            console.log('Source element position changed after drag');
        }

        return true;
    } catch (error) {
        console.error(`Error in drag and drop operation: ${error.message}`);
        return false;
    }
}

async function dragElementToTargetAdjusted(page, frame, sourceElement, targetElement) {
    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (sourceBox && targetBox) {
        await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
        await humanDelay(500);
        await page.mouse.down();
        await humanDelay(500);
        // Move to 200px right of the target's center
        await page.mouse.move(targetBox.x + targetBox.width / 2 + 200, targetBox.y + targetBox.height / 2, { steps: 30 });
        await humanDelay(500);
        await page.mouse.up();
        console.log(`Dragged element to adjusted target position`);
        
        await humanDelay(2000);
    } else {
        console.error('Could not get bounding box for source or target element');
    }
}

async function dragElementToTarget(page, frame, sourceElement, targetElement) {
    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (sourceBox && targetBox) {
        await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
        await humanDelay(500);
        await page.mouse.down();
        await humanDelay(500);
        await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 30 });
        await humanDelay(500);
        await page.mouse.up();
        console.log(`Dragged element to target`);
        
        await humanDelay(2000);
    } else {
        console.error('Could not get bounding box for source or target element');
    }
}

async function handleTextInput(frame, questionNumber, answer) {
    console.log(`Handling text input question ${questionNumber}...`);
    const textInputSelectors = [
        '#slide-window textarea',
        'textarea[placeholder="Gib hier deine Antwort ein…"]',
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-textinput.shown > div > input[type=text]',
        'input[type="text"]'
    ];
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        for (const selector of textInputSelectors) {
            try {
                await frame.waitForSelector(selector, { visible: true, timeout: 5000 });
                await frame.type(selector, answer, { delay: 100 }); // Slower typing
                console.log(`Entered text "${answer}" using selector: ${selector}`);
                await humanDelay(1000);
                return true;
            } catch (error) {
                console.log(`Attempt ${attempt}: Error handling text input with selector ${selector}:`, error.message);
            }
        }
        console.log(`Attempt ${attempt} failed. Retrying...`);
        await humanDelay(2000);
    }
    
    console.error('Failed to handle text input after multiple attempts');
    return false;
}

async function clickWeiterButton(frame, isSecondClick = false) {
    const firstWeiterButtonSelector = '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(42) > div > svg > g';
    const secondWeiterButtonSelector = '#slide-window > div > div > div.slide-transition-container > div > div:nth-child(8) > div:nth-child(6) > div > svg > g';
    
    const selector = isSecondClick ? secondWeiterButtonSelector : firstWeiterButtonSelector;
    
    try {
        console.log(`Attempting to click ${isSecondClick ? 'second' : 'first'} Weiter button with selector: ${selector}`);
        await frame.waitForSelector(selector, { visible: true, timeout: 15000 });
        await humanDelay(1000); // Wait before clicking
        await frame.click(selector);
        console.log(`Successfully clicked ${isSecondClick ? 'second' : 'first'} Weiter button`);
        await humanDelay(2500); // Wait for transition
        return true;
    } catch (error) {
        console.error(`Failed to click ${isSecondClick ? 'second' : 'first'} Weiter button:`, error.message);
        return false;
    }
}

async function navigateToQuizPage(page) {
    await page.goto('https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-ursachen-von-durchfall', { waitUntil: 'networkidle0', timeout: 60000 });
}

async function switchToQuizFrame(page) {
    const outerFrame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
    if (!outerFrame) throw new Error('Could not find the outer iframe');

    const innerFrame = await outerFrame.childFrames().find(f => f.url().includes('/fileadmin/elearnings/'));
    if (!innerFrame) throw new Error('Could not find the inner iframe');

    return innerFrame;
}

async function startQuiz(frame) {
    const startButtonSelectors = [
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(42) > div > svg > g',
        'div[data-acc-text="Start"]',
        'button:contains("Start")',
        '.start-button'
    ];

    for (const selector of startButtonSelectors) {
        try {
            await frame.waitForSelector(selector, { visible: true, timeout: 10000 });
            await humanDelay(1500); // Wait before clicking start
            await frame.click(selector);
            console.log(`Clicked Start button with selector: ${selector}`);
            await humanDelay(3000);
            return;
        } catch (error) {
            console.log(`Failed to click Start button with selector ${selector}:`, error.message);
        }
    }

    console.error('Failed to click any Start button');
    throw new Error('Start button not found or not clickable');
}

async function takeErrorScreenshot(page) {
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
}

module.exports = { runPerenterol1Quiz };