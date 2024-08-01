// teboninTest.js
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

async function runTeboninTest(page) {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
      try {
          console.log("Starting Tebonin test...");
          await page.goto("https://www.schwabe-fachkreise.de/fortbildungen/online-trainings/produkt/tebonin/training/tebonin-basistraining/wissenstest/1/", {
              waitUntil: "networkidle0",
              timeout: 60000
          });
          await sleep(5000);

          console.log("Clicking start test button...");
          await startTest(page, "#question > div > div > div > div:nth-child(2) > form > div.buttonWrap > input[type=submit]");
          await sleep(2000);

          for (let i = 1; i <= 10; i++) {
              console.log(`Processing question ${i}...`);
              
              const is503Error = await checkFor503Error(page);
              if (is503Error) {
                  throw new Error("TYPO3 503 error detected");
              }

              const currentUrl = await page.url();
              console.log(`Current URL: ${currentUrl}`);

              if (!currentUrl.includes('/frage/')) {
                  console.log("Not on question page. Attempting to find the correct element...");
                  const questionElement = await page.$('#question');
                  if (!questionElement) {
                      console.log("Question element not found. Restarting the test...");
                      i = 0; // Reset to start of the test
                      continue;
                  }
              }

              if (i <= 3) {
                  console.log(`Answering question ${i} with #answer3...`);
                  await clickAnswer(page, "#answer3");
              } else {
                  const isStartPlayerVisible = await page.waitForSelector("#startPlayer", { visible: true, timeout: 5000 }).then(() => true).catch(() => false);

                  if (isStartPlayerVisible) {
                      console.log("Handling video question...");
                      await handleQuestion(page);
                  } else {
                      console.log(`Answering question ${i}...`);
                      switch (i) {
                          case 4:
                              await clickAnswer(page, "#answer1");
                              await clickAnswer(page, "#answer2");
                              break;
                          case 5:
                              await clickAnswer(page, "#answer1");
                              break;
                          case 6:
                              await clickAnswer(page, "#answer1");
                              break;
                          case 7:
                              await clickAnswer(page, "#answer2");
                              break;
                          case 8:
                              await clickAnswer(page, "#answer4");
                              break;
                          case 9:
                              await clickAnswer(page, "#answer2");
                              break;
                          case 10:
                              await clickAnswer(page, "#answer2");
                              break;
                      }
                  }
              }

              console.log("Clicking next question button...");
              await clickNextQuestionButton(page);
              await sleep(5000); // Increased delay after clicking next

              if (i === 10) {
                console.log("Waiting for navigation after last question...");
                try {
                    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }); // Increased timeout to 2 minutes
                } catch (err) {
                    console.log("Navigation timeout after last question. Proceeding anyway.");
                }
            }
        }

        console.log("All questions answered. Waiting for potential redirects or loading...");
        await sleep(10000); // Wait for 10 seconds

        console.log("Checking current URL...");
        const finalUrl = await page.url();
        console.log(`Current URL after completing questions: ${finalUrl}`);

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

        console.log("Tebonin test completed successfully.");
        break;
    } catch (error) {
        console.error('Error in runTeboninTest:', error);
        const is503Error = await checkFor503Error(page);
        if (is503Error) {
            console.log("TYPO3 503 error detected in Tebonin test. Retrying...");
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
    throw new Error(`Failed to complete Tebonin test after ${maxRetries} retries.`);
}
}

module.exports = {
runTeboninTest
};