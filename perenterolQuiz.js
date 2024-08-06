// perenterolQuiz.js
const { sleep, clickNextButton, clickWeiterButton } = require('./utils');

async function runPerenterolQuiz(page) {
    console.log('Starting Perenterol test...');

    try {
        await navigateToQuizPage(page);
        const frame = await switchToQuizFrame(page);
        await startQuiz(frame);
        await answerQuestions(frame);
        await handleDragAndDropQuestion(frame);
        
        // Wait a bit longer to ensure all changes are registered
        await sleep(5000);

        await clickNextButton(frame);
        await sleep(2000);

        // Check for the dialogue box
        const dialogueBox = await frame.$('#slide-window > div > div > div.slide-transition-container > div > div:nth-child(8) > div:nth-child(1) > div > svg > g');
        if (dialogueBox) {
            console.log('Warning: Dialogue box appeared. Answers may not have been registered.');
            // You might want to add some error handling or retry logic here
        } else {
            console.log('Successfully moved to next question after drag and drop.');
        }
        
        await clickWeiterButton(frame);
        await sleep(2000);

        await checkResults(frame);
        await takeScreenshot(page);

        console.log('Perenterol test completed.');
    } catch (error) {
        console.error('Error in Perenterol test:', error);
        await takeErrorScreenshot(page);
    }
}

async function navigateToQuizPage(page) {
    await page.goto('https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-5-schnelle-fragen-zu-perenterol', { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('Navigated to Perenterol quiz page...');
}

async function switchToQuizFrame(page) {
    console.log("Waiting for outer iframe to load...");
    await page.waitForSelector('iframe.ap-elearning--iframe-top', { timeout: 30000 });

    const outerFrame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
    if (!outerFrame) throw new Error('Could not find the outer iframe');

    console.log("Waiting for inner iframe to load...");
    await outerFrame.waitForSelector('iframe.ap-elearning--iframe-bottom', { timeout: 30000 });

    const innerFrame = await outerFrame.childFrames().find(f => f.url().includes('/fileadmin/elearnings/'));
    if (!innerFrame) throw new Error('Could not find the inner iframe');

    console.log('Quiz frame found.');
    return innerFrame;
}

async function startQuiz(frame) {
    console.log('Attempting to start the quiz...');
    await frame.click('#acc-6WrES1MOsT8').catch(() => console.log('Start button not found, quiz may have already started.'));
    await sleep(3000);
}

async function answerQuestions(frame) {
    for (let questionNumber = 1; questionNumber <= 5; questionNumber++) {
        console.log(`Attempting to answer question ${questionNumber}...`);
        
        let answered = false;
        
        // Try each answer method until one succeeds
        if (await handleTextInput(frame)) {
            answered = true;
        } else if (await handleMultipleChoice(frame)) {
            answered = true;
        } else if (await handleSpecialQuestion(frame)) {
            answered = true;
        }

        if (answered) {
            // Wait a bit to ensure all interactions are complete
            await sleep(2000);
            
            // Click the "Next" button
            await clickNextButton(frame);
            
            // Wait for the popup to appear
            await sleep(2000);
            
            // Click the "Weiter" button on the popup
            await clickWeiterButton(frame);
            
            // Additional wait after navigation
            await sleep(2000);
        } else {
            console.log(`Failed to answer question ${questionNumber}, moving to next question`);
        }
    }
}

async function handleTextInput(frame) {
    const textInputSelector = '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-textinput.shown > div > div:nth-child(2) > textarea';
    const textInput = await frame.$(textInputSelector);
    
    if (textInput) {
        await frame.evaluate((selector) => {
            const input = document.querySelector(selector);
            if (input) input.value = '';
        }, textInputSelector);
        
        await textInput.type('Arzneihefe');
        console.log('Text answer entered: Arzneihefe');
        return true;
    }
    return false;
}

async function handleMultipleChoice(frame) {
    const buttons = await frame.$$('.slide-object-button');
    if (buttons.length > 0) {
        await buttons[0].click().catch(() => console.log('Failed to click multiple choice button'));
        console.log('Multiple choice button clicked');
        return true;
    }
    return false;
}

async function handleSpecialQuestion(frame) {
    console.log('Handling special question with multiple options...');
    const optionSelectors = [
        'div:nth-child(6) > div > div:nth-child(3) > div > svg > g',
        'div:nth-child(7) > div > div:nth-child(3) > div > svg > g',
        'div:nth-child(8) > div > div:nth-child(3) > div > svg > g',
        'div:nth-child(9) > div > div:nth-child(3) > div > svg > g'
    ];

    let clickedAny = false;

    for (let i = 0; i < optionSelectors.length; i++) {
        const selector = `#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > ${optionSelectors[i]}`;
        try {
            await frame.waitForSelector(selector, { timeout: 5000 });
            await frame.click(selector);
            console.log(`Clicked option ${i + 1}`);
            clickedAny = true;
            await sleep(1000); // Wait 1 second between clicks
        } catch (error) {
            console.log(`Failed to click option ${i + 1}: ${error.message}`);
        }
    }

    if (clickedAny) {
        console.log('Finished clicking all available options');
        await sleep(2000); // Wait an additional 2 seconds after clicking all options
        return true;
    }
    console.log('No options were clickable in the special question');
    return false;
}

async function handleDragAndDropQuestion(frame) {
    console.log('Attempting to answer drag and drop questions...');

    const dragAndDropPairs = [
        {
            sourceSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(10) > div > svg > g',
            targetSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(4) > div > svg > g'
        },
        {
            sourceSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(11) > div > svg > g',
            targetSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(5) > div > svg > g'
        },
        {
            sourceSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(9) > div > svg > g',
            targetSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(6) > div > svg > g'
        }
    ];

    for (let i = 0; i < dragAndDropPairs.length; i++) {
        const pair = dragAndDropPairs[i];
        console.log(`Performing drag and drop operation ${i + 1}...`);

        await frame.evaluate((source, target) => {
            function createCustomEvent(eventType, options = {}) {
                return new CustomEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: options
                });
            }

            const sourceElement = document.querySelector(source);
            const targetElement = document.querySelector(target);

            if (!sourceElement || !targetElement) {
                throw new Error(`Source or target element not found for pair ${i + 1}`);
            }

            // Get bounding rectangles for source and target
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();

            // Dispatch dragstart event on source element
            sourceElement.dispatchEvent(createCustomEvent('dragstart', { clientX: sourceRect.left, clientY: sourceRect.top }));

            // Dispatch dragenter and dragover events on target element
            targetElement.dispatchEvent(createCustomEvent('dragenter', { clientX: targetRect.left, clientY: targetRect.top }));
            targetElement.dispatchEvent(createCustomEvent('dragover', { clientX: targetRect.left, clientY: targetRect.top }));

            // Dispatch drop event on target element
            targetElement.dispatchEvent(createCustomEvent('drop', { clientX: targetRect.left, clientY: targetRect.top }));

            // Dispatch dragend event on source element
            sourceElement.dispatchEvent(createCustomEvent('dragend', { clientX: targetRect.left, clientY: targetRect.top }));

            // Move the source element to be a child of the target element
            targetElement.appendChild(sourceElement);

            // Trigger change events
            sourceElement.dispatchEvent(new Event('change', { bubbles: true }));
            targetElement.dispatchEvent(new Event('change', { bubbles: true }));

        }, pair.sourceSelector, pair.targetSelector);

        // Wait for a moment to allow for any animations or state updates
        await sleep(2000);
    }

    // Attempt to update the quiz state directly
    await frame.evaluate(() => {
        function findQuizState() {
            for (let key in window) {
                if (window[key] && typeof window[key] === 'object' && window[key].hasOwnProperty('quiz')) {
                    return window[key].quiz;
                }
            }
            return null;
        }

        const quizState = findQuizState();
        if (quizState) {
            const currentQuestion = quizState.questions.find(q => q.type === 'dragAndDrop' || q.type === 'matchPairs');
            if (currentQuestion) {
                // Update the question state based on the current DOM state
                const pairs = document.querySelectorAll('#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div[class*="slide-object"]');
                currentQuestion.userAnswer = Array.from(pairs).map(pair => ({
                    source: pair.querySelector('div > svg > g').id,
                    target: pair.id
                }));

                // Trigger any necessary state updates
                if (quizState.updateState) {
                    quizState.updateState();
                }
                if (quizState.render) {
                    quizState.render();
                }
                console.log('Quiz state updated for drag and drop question');
            }
        }
    });

    console.log('All drag and drop operations completed and quiz state updated.');
}

async function checkResults(frame) {
    console.log("Checking for results...");
    await sleep(5000);
    const resultText = await frame.evaluate(() => {
        const resultElement = document.querySelector('.ap-lightbox__message');
        return resultElement ? resultElement.innerText : 'No result found';
    });
    console.log(`Result: ${resultText}`);
}

async function takeScreenshot(page) {
    await page.screenshot({ path: 'quiz-after-completion.png', fullPage: true });
}

async function takeErrorScreenshot(page) {
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
}

module.exports = { runPerenterolQuiz };