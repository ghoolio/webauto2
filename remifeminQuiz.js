// remifemin
const {
    checkFor503Error,
    sleep,
    clickNextQuestionButton,
    clickAnswer,
    clickStartButton
} = require('./utils');

async function runRemifeminQuiz(page) {
    try {
        console.log("Navigating to Remifemin quiz page...");
        await page.goto("https://www.medibee.de/lernmodule/lernmodul/elearning/remifemin-0724-tdm-5-schnelle-fragen-pflanzliche-therapie-mit-traubensilberkerze", {
            waitUntil: "networkidle0",
            timeout: 60000
        });
        await sleep(5000); // Wait for the page to settle

        console.log("Starting Remifemin test...");

        // Wait for the iframe to load
        console.log("Waiting for iframe to load...");
        await page.waitForSelector('iframe.ap-elearning--iframe-top', { timeout: 30000 });

        // Switch to the iframe context
        console.log("Switching to iframe context...");
        const frame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
        
        if (!frame) {
            throw new Error('Could not find the quiz iframe');
        }

        console.log("Clicking start test button...");
        await clickStartButton(frame);
        await sleep(5000);

        for (let i = 1; i <= 5; i++) {
            console.log(`Processing question ${i}...`);
            
            // Wait for the question to be visible
            try {
                await frame.waitForSelector(`#question${i}`, { timeout: 10000 });
            } catch (error) {
                console.error(`Error waiting for question ${i}:`, error);
                // Log the current frame content for debugging
                const frameContent = await frame.content();
                console.log(`Frame content for question ${i}:`, frameContent);
                throw error;
            }

            console.log(`Answering question ${i}...`);
            try {
                switch (i) {
                    case 1:
                        await clickAnswer(frame, "#answer1");
                        break;
                    case 2:
                        await clickAnswer(frame, "#answer2");
                        break;
                    case 3:   
                        await clickAnswer(frame, "#answer3");
                        break; 
                    case 4:
                        await clickAnswer(frame, "#answer1");
                        break;
                    case 5:
                        await clickAnswer(frame, "#answer1");
                        break;
                }
            } catch (error) {
                console.error(`Error clicking answer for question ${i}:`, error);
                // Log the current frame content for debugging
                const frameContent = await frame.content();
                console.log(`Frame content after error on question ${i}:`, frameContent);
                throw error;
            }

            console.log("Clicking next question button...");
            await clickNextQuestionButton(frame);
            await sleep(2000);
        }

        console.log("All questions answered. Waiting for results...");
        await sleep(5000);

        // Check for results or any final page
        const resultText = await frame.$eval('body', el => el.innerText);
        console.log("Quiz completed. Result:", resultText);

    } catch (error) {
        console.error('Error in runRemifeminQuiz:', error);
        throw error;
    }
}

module.exports = {
    runRemifeminQuiz
};