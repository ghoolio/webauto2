// perenterolQuiz.js

const { sleep, clickNextQuestionButton, clickAnswer, checkFor503Error, clickStartButton } = require('./utils');

async function runPerenterolQuiz(page) {
    try {
        console.log("Navigating to Perenterol quiz page...");
        await page.goto("https://www.medibee.de/lernmodule/lernmodul/elearning/perenterol-0824-tdm-5-schnelle-fragen-zu-perenterol", {
            waitUntil: "networkidle0",
            timeout: 60000
        });
        await sleep(5000); // Wait for the page to settle

        console.log("Starting Perenterol test...");

        // Check for 503 error
        const is503Error = await checkFor503Error(page);
        if (is503Error) {
            console.log("503 error detected. Retrying...");
            return; // You might want to implement a retry mechanism here
        }

        // Use the clickStartButton function from utils
        await clickStartButton(page);

        // Wait for the iframe to load
        console.log("Waiting for iframe to load...");
        await page.waitForSelector('iframe.ap-elearning--iframe-top', { timeout: 30000 });

        // Switch to the iframe context
        console.log("Switching to iframe context...");
        const frame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
        
        if (!frame) {
            throw new Error('Could not find the quiz iframe');
        }

        // Wait for questions to appear
        await sleep(5000);

        // Answer 5 questions
        for (let i = 1; i <= 5; i++) {
            console.log(`Answering question ${i}...`);
            
            // Wait for the question to be visible (you might need to adjust this selector)
            await frame.waitForSelector(`#question${i}`, { timeout: 10000 }).catch(() => console.log(`Selector #question${i} not found`));

            // Click an answer (you may need to adjust the selector based on the actual structure)
            await clickAnswer(frame, `#answer${i}`);

            // Click the next question button
            await clickNextQuestionButton(frame);

            await sleep(2000);
        }

        console.log("All questions answered. Waiting for results...");
        await sleep(5000);

        // Check for results or any final page
        const resultText = await frame.evaluate(() => document.body.innerText);
        console.log("Quiz completed. Result:", resultText);

    } catch (error) {
        console.error('Error in runPerenterolQuiz:', error);
        throw error;
    }
}

// Export the function so it can be used in other files
module.exports = {
    runPerenterolQuiz
};