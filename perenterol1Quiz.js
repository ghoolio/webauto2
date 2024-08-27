"use strict";

const { sleep } = require('./utils');

const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multipleChoice',
    MULTIPLE_CHOICE2: 'multipleChoice2',
    MULTIPLE_CHOICE3: 'multipleChoice3',
    DRAG_AND_DROP1: 'dragAndDrop1',
    DRAG_AND_DROP2: 'dragAndDrop2',
    DRAG_AND_DROP3: 'dragAndDrop3',
    DRAG_AND_DROP4: 'dragAndDrop4',
    DRAG_AND_DROP5: 'dragAndDrop5',
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
    {
        type: QUESTION_TYPES.DRAG_AND_DROP3,
        pairs: [
            {
                sourceSelector: 'div[data-acc-text="Diarrhö, Tuberkulose,"]',
                targetSelector: 'div[data-acc-text*="GettyImages-636855402.jpg"]',
            },
            {
                sourceSelector: 'div[data-acc-text="Diarrhö, Influenza,"]',
                targetSelector: 'div[data-acc-text*="Viren.png"]'
            }
        ]
    },
    {
        type: QUESTION_TYPES.WEITER_ONLY,
        selector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(42) > div > svg > g'
    },
    {
        type: QUESTION_TYPES.DRAG_AND_DROP4,
        pairs: [
            {
                sourceSelector: 'div[data-acc-text="Anwendung bei Antibiotika-"]',
                targetSelector: 'div[data-acc-text*="Perenterol-Forte_R_102021.png"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Ist für Antibiotika-"]',
                targetSelector: 'div[data-acc-text*="img-packshot--imodium.png"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Für Kinder schon ab 2 Jahren geeignet"]',
                targetSelector: 'div[data-acc-text*="Perenterol-Forte_R_102021.png"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Durchfall-Erreger werden"]',
                targetSelector: 'div[data-acc-text*="Perenterol-Forte_R_102021.png"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Für Kinder erst ab 12 Jahren geeignet"]',
                targetSelector: 'div[data-acc-text*="img-packshot--imodium.png"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Wirkstoff: Saccharomyces"]',
                targetSelector: 'div[data-acc-text*="Perenterol-Forte_R_102021.png"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Durchfall-Erreger verbleiben"]',
                targetSelector: 'div[data-acc-text*="img-packshot--imodium.png"]'
            },
            {
                sourceSelector: 'div[data-acc-text="Wirkstoff: Loperamidhydro-"]',
                targetSelector: 'div[data-acc-text*="img-packshot--imodium.png"]'
            },
        ]
    },
    {
        type: QUESTION_TYPES.DRAG_AND_DROP5,
    },
    {
        type: QUESTION_TYPES.WEITER_ONLY,
        selector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(42) > div > svg > g'
    },
    { 
        type: QUESTION_TYPES.MULTIPLE_CHOICE3, 
        options: 4,
        selectors: [
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(46) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(45) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(44) > div > div:nth-child(1) > div > svg > g',
            '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(43) > div > div:nth-child(1) > div > svg > g'
        ],
        correctAnswers: [0, 1, 2, 3]
    },
    {
        type: QUESTION_TYPES.TEXT_INPUT,
        answer: '2'
    },
];

function humanDelay(baseMs) {
    return sleep(baseMs + Math.floor(Math.random() * 300));
}

async function runPerenterol1Quiz(page, maxRetries = 3) {
    console.log('Starting Perenterol test...');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} of ${maxRetries}`);
            await navigateToQuizPage(page);
            console.log('Navigated to quiz page');
            await humanDelay(1000);
            const frame = await switchToQuizFrame(page);
            console.log('Switched to quiz frame');
            await startQuiz(frame);
            console.log('Quiz started');

            for (let i = 0; i < quizStructure.length; i++) {
                const questionNumber = i + 1;
                const questionInfo = quizStructure[i];

                console.log(`Handling question/slide ${questionNumber} (${questionInfo.type})...`);
                await humanDelay(500);

                let success;
                switch (questionInfo.type) {
                    case QUESTION_TYPES.MULTIPLE_CHOICE:
                    case QUESTION_TYPES.MULTIPLE_CHOICE2:
                    case QUESTION_TYPES.MULTIPLE_CHOICE3:
                        success = await handleMultipleChoice(frame, questionNumber, questionInfo);
                        break;    
                    case QUESTION_TYPES.DRAG_AND_DROP1:
                    case QUESTION_TYPES.DRAG_AND_DROP2:
                    case QUESTION_TYPES.DRAG_AND_DROP3:
                    case QUESTION_TYPES.DRAG_AND_DROP4:
                    case QUESTION_TYPES.DRAG_AND_DROP5:
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

                // Handle "Weiter" clicks for all questions except the last one
                if (i < quizStructure.length - 1) {
                    if (questionInfo.type !== QUESTION_TYPES.WEITER_ONLY) {
                        console.log(`Clicking first "Weiter" after question ${questionNumber}`);
                        await humanDelay(500);
                        const firstWeiterClicked = await clickWeiterButton(frame, false);
                        if (!firstWeiterClicked) {
                            throw new Error(`Failed to click first Weiter button after question ${questionNumber}`);
                        }
                        await waitForNextQuestion(frame);

                        console.log(`Clicking second "Weiter" after question ${questionNumber}`);
                        await humanDelay(500);
                        const secondWeiterClicked = await clickWeiterButton(frame, true);
                        if (!secondWeiterClicked) {
                            throw new Error(`Failed to click second Weiter button after question ${questionNumber}`);
                        }
                        await waitForNextQuestion(frame);
                    }
                }
            }

            // Handle final "Weiter" clicks after the last question
            console.log('Clicking final "Weiter" buttons...');
            await humanDelay(500);
            await clickWeiterButton(frame, false);
            await waitForNextQuestion(frame);
            await humanDelay(500);
            await clickWeiterButton(frame, true);
            await waitForNextQuestion(frame);

            console.log('All questions answered. Waiting for final submit button...');
            await humanDelay(1000);

            const parentFrame = frame.parentFrame();
            if (parentFrame) {
                await parentFrame.click('#ap-elearning--submit').catch((error) => {
                    console.error('Failed to click final submit button:', error);
                    throw error;
                });
            } else {
                throw new Error('Could not find parent frame for final submit');
            }

            await humanDelay(1000);

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
            await humanDelay(3000);
        }
    }
}

async function handleWeiterOnly(frame, selector) {
    try {
        console.log(`Attempting to click Weiter button with selector: ${selector}`);
        await frame.waitForSelector(selector, { visible: true, timeout: 15000 });
        await humanDelay(500); // Wait before clicking
        await frame.click(selector);
        console.log(`Successfully clicked Weiter button`);
        await humanDelay(1500); // Wait for transition
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
    }, { timeout: 20000 });
    await humanDelay(1000); // Additional wait to ensure elements are interactive
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
                await humanDelay(500); // Pause before clicking
                await frame.click(selector);
                console.log(`Clicked correct option ${i + 1} with selector: ${selector}`);
                await humanDelay(800);
                correctlyClicked++;
            } catch (error) {
                console.log(`Error clicking correct option ${i + 1} with selector ${selector}:`, error.message);
            }
        }
    }

    if (correctlyClicked === questionInfo.correctAnswers.length) {
        console.log(`All correct options clicked for question ${questionNumber}`);
        // Add a delay before attempting to click the "Weiter" button
        await humanDelay(1000);
        
        // Attempt to click the "Weiter" button
        let weiterClicked = await clickWeiterButton(frame);
        if (!weiterClicked) {
            console.log(`Failed to click Weiter button after question ${questionNumber}. Retrying...`);
            await humanDelay(1000);
            weiterClicked = await clickWeiterButton(frame);
        }
        
        if (!weiterClicked) {
            console.error(`Failed to click Weiter button after question ${questionNumber} after retry`);
            return false;
        }
        
        // Wait for the next question to load
        await waitForNextQuestion(frame);
        return true;
    }

    return false;
}

async function handleDragAndDrop(frame, questionNumber, pairs, questionType) {
    console.log(`Handling drag and drop question ${questionNumber} of type ${questionType}...`);
    const page = frame.page();

    if (questionType === QUESTION_TYPES.DRAG_AND_DROP5) {
        return await handleDragAndDrop5(page, frame);
    }

    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        console.log(`Attempting drag-and-drop operation ${i + 1} of ${pairs.length}`);

        let success = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Attempt ${attempt} for pair ${i + 1}`);
                success = await dragAndDropSequential(
                    page, 
                    frame, 
                    pair.sourceSelector, 
                    pair.targetSelector, 
                    i === pairs.length - 1, 
                    questionType
                );
                if (success) {
                    console.log(`Successfully completed drag-and-drop operation ${i + 1}`);
                    break;
                }
                console.log(`Attempt ${attempt} failed for drag-and-drop operation ${i + 1}`);

                if (attempt < 3) {
                    console.log("Waiting before next attempt...");
                    await sleep(2000);
                }
            } catch (error) {
                console.error(`Error in drag and drop operation ${i + 1}, attempt ${attempt}:`, error.message);
                if (attempt < 3) {
                    console.log("Waiting before next attempt...");
                    await sleep(2000);
                }
            }
        }

        if (!success) {
            console.log(`Failed to complete drag-and-drop operation ${i + 1} after multiple attempts`);
            await page.screenshot({ path: `failed-drag-drop-q${questionNumber}-pair${i + 1}.png`, fullPage: true });
            console.log(`Screenshot captured: failed-drag-drop-q${questionNumber}-pair${i + 1}.png`);
        }

        await sleep(1500); // Wait after each drag and drop operation
    }

    console.log("All drag and drop operations attempted.");
    return true;
}

async function dragAndDropSequential(page, frame, sourceSelector, targetSelector, isLastItem = false, questionType) {
    console.log(`Attempting drag-and-drop: ${sourceSelector} -> ${targetSelector}`);
    try {
        // Function to find element by partial text match
        const findElementByPartialText = async (selector, text) => {
            const elements = await frame.$$(selector);
            for (const element of elements) {
                const elementText = await frame.evaluate(el => el.getAttribute('data-acc-text'), element);
                if (elementText && elementText.includes(text)) {
                    return element;
                }
            }
            return null;
        };

        // Extract the text to match from the selectors
        const sourceText = sourceSelector.match(/data-acc-text="(.+?)"/)[1];
        const targetText = targetSelector.match(/data-acc-text\*="(.+?)"/)[1];

        let sourceElement = await findElementByPartialText('div[data-acc-text]', sourceText);
        let targetElement = await findElementByPartialText('div[data-acc-text]', targetText);

        if (!sourceElement) {
            console.error(`Source element not found for text: ${sourceText}`);
            return false;
        }
        if (!targetElement) {
            console.error(`Target element not found for text: ${targetText}`);
            return false;
        }

        console.log(`Source element found: ${sourceElement !== null}`);
        console.log(`Target element found: ${targetElement !== null}`);

        const sourceElementText = await frame.evaluate(el => el.getAttribute('data-acc-text'), sourceElement);
        console.log(`Source element text: ${sourceElementText}`);

        let sourceBox = await sourceElement.boundingBox();
        let targetBox = await targetElement.boundingBox();

        console.log(`Source bounding box: ${JSON.stringify(sourceBox)}`);
        console.log(`Target bounding box: ${JSON.stringify(targetBox)}`);

        // If sourceBox is null, try to find it again
        if (!sourceBox) {
            await frame.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await sleep(1000);
            sourceBox = await sourceElement.boundingBox();
            console.log(`Retried source bounding box: ${JSON.stringify(sourceBox)}`);
        }

        // If sourceBox is still null, use a default position
        if (!sourceBox) {
            console.log('Source bounding box is still null, using default position');
            sourceBox = { x: 0, y: 0, width: 1, height: 1 };
        }

        let dropX, dropY;

        switch (questionType) {
            case QUESTION_TYPES.DRAG_AND_DROP1:
            case QUESTION_TYPES.DRAG_AND_DROP2:
                // For DRAG_AND_DROP1 and DRAG_AND_DROP2, drop directly on the target
                dropX = targetBox.x + targetBox.width / 2;
                dropY = targetBox.y + targetBox.height / 2;
                break;
            case QUESTION_TYPES.DRAG_AND_DROP3:
                // For DRAG_AND_DROP3, drop 100px below the target
                dropX = targetBox.x + targetBox.width / 2;
                dropY = targetBox.y + targetBox.height + 100;
                break;
            case QUESTION_TYPES.DRAG_AND_DROP4:
                // For DRAG_AND_DROP4, find the image and drop below it
                const imageElement = await frame.$(`div[data-acc-text*="${targetText}"] img`);
                if (imageElement) {
                    const imageBox = await imageElement.boundingBox();
                    dropX = imageBox.x + imageBox.width / 2;
                    dropY = imageBox.y + imageBox.height + 50; // 50px below the image
                } else {
                    console.log(`Image element not found for DRAG_AND_DROP4, using target bottom`);
                    dropX = targetBox.x + targetBox.width / 2;
                    dropY = targetBox.y + targetBox.height + 50; // 50px below the target
                }
                break;
            case QUESTION_TYPES.DRAG_AND_DROP5:
                // For DRAG_AND_DROP5, use the specific handling
                return await handleDragAndDrop5(page, frame, sourceElement, targetElement, sourceBox, targetBox);
            default:
                console.log(`Unknown question type: ${questionType}, using default target`);
                dropX = targetBox.x + targetBox.width / 2;
                dropY = targetBox.y + targetBox.height / 2;
        }

        // Perform the drag and drop
        await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(dropX, dropY, { steps: 30 });
        await sleep(500); // Short pause before release
        await page.mouse.up();

        console.log(`Drag and drop action completed. Dropped at: (${dropX}, ${dropY})`);
        return true;
    } catch (error) {
        console.error(`Error in drag and drop operation: ${error.message}`);
        return false;
    }
}

async function handleDragAndDrop5(page, frame) {
    console.log('Handling DRAG_AND_DROP5 specifically');

    const sourceSelector = 'div[data-acc-text="Rechteck 1"]';
    const targetSelectors = [
        'div[data-acc-text*="Kann zeitgleich zum Antibiotikum eingenommen werden"]',
        'div[data-acc-text*="Ist bei AAD kontraindiziert"]',
        'div[data-acc-text*="Muss zeitversetzt zum Antibiotikum eingenommen werden"]'
    ];

    // Find all source elements
    const sourceElements = await frame.$$(sourceSelector);
    console.log(`Found ${sourceElements.length} source elements`);

    for (let i = 0; i < targetSelectors.length; i++) {
        const targetSelector = targetSelectors[i];
        console.log(`Attempting drag-and-drop for pair ${i + 1}`);

        if (i >= sourceElements.length) {
            console.error(`Not enough source elements for pair ${i + 1}`);
            continue;
        }

        const sourceElement = sourceElements[i];
        const targetElement = await frame.$(targetSelector);

        if (!sourceElement || !targetElement) {
            console.error(`Source or target element not found for pair ${i + 1}`);
            continue;
        }

        const sourceBox = await sourceElement.boundingBox();
        const targetBox = await targetElement.boundingBox();

        if (!sourceBox || !targetBox) {
            console.error(`Unable to get bounding box for source or target element for pair ${i + 1}`);
            continue;
        }

        const sourceX = sourceBox.x + sourceBox.width / 2;
        const sourceY = sourceBox.y + sourceBox.height / 2;

        const dropX = targetBox.x + targetBox.width + 20;
        const dropY = targetBox.y + (targetBox.height / 2);

        console.log(`Moving mouse to source position: (${sourceX}, ${sourceY})`);
        await page.mouse.move(sourceX, sourceY);
        await page.mouse.down();

        console.log(`Dragging to target position: (${dropX}, ${dropY})`);
        await page.mouse.move(dropX, dropY, { steps: 50 });

        await sleep(500);
        await page.mouse.up();

        console.log(`Drag and drop action completed for pair ${i + 1}`);

        await sleep(1000);

        // Verify if the drag was successful
        const finalSourcePosition = await sourceElement.boundingBox();
        console.log(`Final source position: ${JSON.stringify(finalSourcePosition)}`);

        const isSuccess = Math.abs(finalSourcePosition.x - dropX) < 50 && Math.abs(finalSourcePosition.y - dropY) < 50;
        console.log(`Drag and drop ${isSuccess ? 'successful' : 'failed'} for pair ${i + 1}`);

        if (!isSuccess) {
            console.log('Retrying drag and drop with different offset');
            await page.mouse.move(sourceX, sourceY);
            await page.mouse.down();
            await page.mouse.move(dropX + 50, dropY, { steps: 50 }); // Try 50px further to the right
            await sleep(500);
            await page.mouse.up();

            await sleep(1000);
            const retryPosition = await sourceElement.boundingBox();
            console.log(`Retry final position: ${JSON.stringify(retryPosition)}`);

            const retrySuccess = Math.abs(retryPosition.x - (dropX + 50)) < 50 && Math.abs(retryPosition.y - dropY) < 50;
            console.log(`Retry drag and drop ${retrySuccess ? 'successful' : 'failed'} for pair ${i + 1}`);
        }
    }

    return true;
}

async function handleTextInput(frame, questionNumber, answer) {
    console.log(`Handling text input question ${questionNumber}...`);
    const textInputSelectors = [
        '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-textinput.shown > div > input[type=text]'
    ];
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        for (const selector of textInputSelectors) {
            try {
                await frame.waitForSelector(selector, { visible: true, timeout: 5000 });
                await frame.type(selector, answer, { delay: 100 }); // Slower typing
                console.log(`Entered text "${answer}" using selector: ${selector}`);
                await humanDelay(500);
                return true;
            } catch (error) {
                console.log(`Attempt ${attempt}: Error handling text input with selector ${selector}:`, error.message);
            }
        }
        console.log(`Attempt ${attempt} failed. Retrying...`);
        await humanDelay(1000);
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
        await humanDelay(1000); // Wait for transition
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
            await humanDelay(800); // Wait before clicking start
            await frame.click(selector);
            console.log(`Clicked Start button with selector: ${selector}`);
            await humanDelay(1500);
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