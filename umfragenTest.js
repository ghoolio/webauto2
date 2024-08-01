// umfragenTest.js
const { checkFor503Error, sleep, clickUmfrageAnswer, clickUmfrageNextQuestionButton, writeUmfrageAnswer } = require("./utils");
const possibleAnswers = [
  "Unterschiedlich",
  "Ja",
  "Nein",
  "Gut",
  "Verständlich",
  "Sehr gut",
  "Zum Teil",
  "Eher ja"
];

async function runUmfragenTest(page) {
  await sleep(5000);
  
  const surveyStartSelector = "#question > div:nth-child(3) > div > div.row > div > div > div > div.col-sm-8 > div > a > span";
  const surveyStartButton = await page.$(surveyStartSelector);
  
  if (surveyStartButton) {
    console.log("Found start survey button. Clicking to begin survey...");
    await surveyStartButton.click();
    await sleep(3000);
  } else {
    console.log("Start survey button not found. Checking if survey is already in progress or completed...");
  }

  let retryCount = 0;
  const maxRetries = 5; // Increased max retries

  while (retryCount < maxRetries) {
    try {
      while (true) {
        await sleep(2000);
        
        const surveyEndSelector = "#question > div:nth-child(2) > div > div > a";
        const surveyEnded = await page.$(surveyEndSelector);

        if (surveyEnded) {
          console.log("Survey has ended. Exiting the loop.");
          return; // Exit the function entirely
        }

        const inputField = await page.$("#answer1");
        if (inputField) {
          console.log("Answering text question...");
          await sleep(2000);
          const randomAnswer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
          await page.type('#answer1', randomAnswer);
          console.log(`Entered answer: ${randomAnswer}`);
          await sleep(1000);
          await clickUmfrageNextQuestionButton(page);
        } else {
          const radioButtonSelector = "#question > div > div > div > div.row > div > form > div.answerWrap > div:nth-child(2) > div > label";
          const radioButton1 = await page.$(radioButtonSelector);
          if (radioButton1) {
            console.log("Answering radio button question (type 1)...");
            await sleep(2000);
            await clickUmfrageAnswer(page, radioButtonSelector);
            await sleep(2000);
            await clickUmfrageNextQuestionButton(page);
          } else {
            const radioButton2 = await page.$("#answer_1_4");
            if (radioButton2) {
              console.log("Answering radio button question (type 2)...");
              await sleep(2000);
              await clickUmfrageAnswer(page, "#answer_1_4");
              await sleep(2000);
              await clickUmfrageNextQuestionButton(page);
            } else {
              const nextButtonSelector = "#question > div > div > div > div.row > div > form > div.col-24 > div.buttonWrap > input[type=submit]";
              const nextButton = await page.$(nextButtonSelector);
              if (nextButton) {
                console.log("No input field or radio button found, but next question button exists. Moving to next question...");
                await clickUmfrageNextQuestionButton(page);
              } else {
                console.log("No input field, radio button, or next question button found. Checking if survey has ended.");
              }
            }
          }
        }

        // Wait for navigation to complete after each question
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
        retryCount = 0; // Reset retry count after successful question
      }
    } catch (error) {
      console.error("Error occurred while handling the Umfrage:", error);
      if (error.message.includes("Execution context was destroyed")) {
        console.log("Page navigation occurred unexpectedly. Reloading and retrying...");
        retryCount++;
        await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
        await sleep(5000);
      } else if (error.message.includes("TYPO3 503 error detected")) {
        console.log("503 error detected. Retrying...");
        retryCount++;
        await sleep(5000);
      } else {
        console.log("Unexpected error. Retrying...");
        retryCount++;
        await sleep(5000);
      }

      if (retryCount >= maxRetries) {
        console.log(`Max retries (${maxRetries}) reached. Moving to next test.`);
        throw error; // Throw the error to be handled in the main script
      }
    }
  }
}

module.exports = {
  runUmfragenTest,
};