// carmenthinNoWissenstestTest.js
const {
    checkFor503Error,
    sleep,
    clickUmfrageNextQuestionButton,
    handleQuestion,
    clickNextQuestionButton,
    clickAnswer,
    startTest,
    startUmfrage
} = require('./utils');

const { runUmfragenTest } = require('./umfragenTest');

async function runCarmethinNoWissenstest(page) {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            console.log("Starting CarmenthinNoWissenstest...");
            await page.goto("https://www.schwabe-fachkreise.de/fortbildungen/online-trainings/produkt/carmenthin/training/carmenthin-erklaervideo/wissenstest/1/", {
                waitUntil: "networkidle0",
                timeout: 60000
            });
            await sleep(5000);

            console.log("Checking for survey...");
            const surveySelector = "#question > div:nth-child(3) > div > div.row > div > div > div > div.col-sm-8 > div";
            let isSurveyPresent = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                console.log(`Attempt ${attempt} to find survey...`);
                isSurveyPresent = await page.$(surveySelector) !== null;
                if (isSurveyPresent) break;
                await sleep(5000); // Wait 5 seconds between attempts
            }

            if (isSurveyPresent) {
                console.log("Survey found, starting survey...");
                await startUmfrage(page, surveySelector);
                await sleep(2000);
                await runUmfragenTest(page);
            } else {
                console.log("Survey not present after 3 attempts, skipping survey section");
            }

            console.log("CarmenthinNoWissenstest completed successfully.");
            break;
        } catch (error) {
            console.error('Error in runCarmenthinNoWissenstest:', error);
            const is503Error = await checkFor503Error(page);
            if (is503Error) {
                console.log("TYPO3 503 error detected in CarmenthinNoWissenstest. Retrying...");
                retryCount++;
                await sleep(5000);
            } else {
                console.log("Unexpected error. Retrying the test...");
                retryCount++;
                await sleep(5000);
            }
        }
    }

    if (retryCount >= maxRetries) {
        throw new Error(`Failed to complete CarmenthinNoWissenstest after ${maxRetries} retries.`);
    }
}

module.exports = {
    runCarmethinNoWissenstest
};