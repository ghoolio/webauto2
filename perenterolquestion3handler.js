// quizHandler.js
const { sleep } = require('./utils');

async function handleDragAndDropQuestion(innerFrame) {
    console.log('Attempting to answer state-changing question...');

    const stateChangePairs = [
        {
            sourceSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(10) > div > svg > g',
            targetSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(4) > div > svg > g',
            finalSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(16) > div > svg > g'
        },
        {
            sourceSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(11) > div > svg > g',
            targetSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(5) > div > svg > g',
            finalSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(17) > div > svg > g'
        },
        {
            sourceSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(9) > div > svg > g',
            targetSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(6) > div > svg > g',
            finalSelector: '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div:nth-child(18) > div > svg > g'
        }
    ];

    for (const pair of stateChangePairs) {
        try {
            await innerFrame.evaluate((source, target, final) => {
                const sourceElement = document.querySelector(source);
                const targetElement = document.querySelector(target);
                
                if (!sourceElement || !targetElement) {
                    throw new Error('Source or target element not found');
                }

                // Hide the source and target elements
                sourceElement.style.display = 'none';
                targetElement.style.display = 'none';

                // Create or show the final element
                let finalElement = document.querySelector(final);
                if (!finalElement) {
                    finalElement = sourceElement.cloneNode(true);
                    finalElement.id = final.split('#')[1];
                    sourceElement.parentNode.appendChild(finalElement);
                }
                finalElement.style.display = '';
                finalElement.style.transform = targetElement.style.transform;

            }, pair.sourceSelector, pair.targetSelector, pair.finalSelector);
            console.log(`Changed state from ${pair.sourceSelector} to ${pair.finalSelector}`);
        } catch (error) {
            console.error(`Failed to change state: ${error.message}`);
        }
        await sleep(1000); // Short wait between operations
    }

    // After changing all states, click the next button
    const nextButtonSelector = '#slide-window > div > div > div.slide-transition-container > div > div:nth-child(6) > div.slide-object.slide-object-stategroup.shown.cursor-hover > div > div.slide-object.slide-object-vectorshape.shown > div > svg > g';
    try {
        await innerFrame.evaluate((selector) => {
            const nextButton = document.querySelector(selector);
            if (nextButton) {
                nextButton.dispatchEvent(new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                }));
                return 'Next button clicked';
            }
            return 'Next button not found';
        }, nextButtonSelector);
        console.log('Attempted to click next button');
    } catch (error) {
        console.error('Error clicking next button:', error.message);
    }
}

module.exports = { handleDragAndDropQuestion };