// carmenthinBeratungstraining.js
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

async function carmenthinBeratungstraining(page) {
  try {
    console.log("Navigating to Carmenthin Beratungstraining first survey question...");
    await page.goto("https://www.schwabe-fachkreise.de/fortbildungen/online-trainings/?tx_mponlinetraining_productlist%5Baction%5D=checkSurveyQuestion&tx_mponlinetraining_productlist%5Bcontroller%5D=Training&tx_mponlinetraining_productlist%5Bstatus%5D=641882&tx_mponlinetraining_productlist%5Btraining%5D=59&cHash=900e4084df78dc5d83cc926924ac3c18", {
      waitUntil: "networkidle0",
      timeout: 60000
    });
    await sleep(5000);

    // Check if the survey is already completed
    const completionSelector = "#c4345 > div > div > div:nth-child(1) > h1";
    const isCompleted = await page.$(completionSelector) !== null;
    if (isCompleted) {
      console.log("Survey has already been completed. Moving to next test.");
      return;
    }

    console.log("Starting survey questions...");
    let noElementsCount = 0;
    const maxNoElementsAttempts = 5;

    while (true) {
      await sleep(2000);
      try {
        // Check if we're still on a valid survey page
        const currentUrl = await page.url();
        if (!currentUrl.includes('tx_mponlinetraining_productlist')) {
          console.log("No longer on a survey page. Exiting.");
          break;
        }

        // Check if the survey has ended
        const surveyEndSelector = "#question > div:nth-child(2) > div > div > a";
        const surveyEnded = await page.$(surveyEndSelector);
        if (surveyEnded) {
          console.log("Survey has ended. Exiting the loop.");
          break;
        }

        // Check if the page has input fields
        const inputField = await page.$("#answer1");
        if (inputField) {
            console.log("Answering text question...");
            await sleep(2000);
            const randomAnswer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
            await page.type('#answer1', randomAnswer);
            console.log(`Entered answer: ${randomAnswer}`);
            await sleep(1000);
            await clickUmfrageNextQuestionButton(page);
            noElementsCount = 0; // Reset counter
        } else {
          // Check if the page has radio buttons (first type)
          const radioButtonSelector = "#question > div > div > div > div.row > div > form > div.answerWrap > div:nth-child(2) > div > label";
          const radioButton1 = await page.$(radioButtonSelector);
          if (radioButton1) {
            console.log("Answering radio button question (type 1)...");
            await sleep(2000);
            await clickUmfrageAnswer(page, radioButtonSelector);
            await sleep(2000);
            await clickUmfrageNextQuestionButton(page);
            noElementsCount = 0; // Reset counter
          } else {
            // Check if the page has radio buttons (second type)
            const radioButton2 = await page.$("#answer_1_4");
            if (radioButton2) {
              console.log("Answering radio button question (type 2)...");
              await sleep(2000);
              await clickUmfrageAnswer(page, "#answer_1_4");
              await sleep(2000);
              await clickUmfrageNextQuestionButton(page);
              noElementsCount = 0; // Reset counter
            } else {
              // Check if the next question button exists
              const nextButtonSelector = "#question > div > div > div > div.row > div > form > div.col-24 > div.buttonWrap > input[type=submit]";
              const nextButton = await page.$(nextButtonSelector);
              if (nextButton) {
                console.log("No input field or radio button found, but next question button exists. Moving to next question...");
                await clickUmfrageNextQuestionButton(page);
                noElementsCount = 0; // Reset counter
              } else {
                console.log("No input field, radio button, or next question button found. Checking if survey has ended.");
                noElementsCount++;
                if (noElementsCount >= maxNoElementsAttempts) {
                  console.log(`No elements found for ${maxNoElementsAttempts} consecutive attempts. Assuming survey is complete or not available.`);
                  break;
                }
              }
            }
          }
        }

        // Wait for navigation to complete after each question
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});

      } catch (error) {
        console.error("Error occurred while handling the Umfrage:", error);
        if (error.message.includes("Execution context was destroyed")) {
          console.log("Page navigation occurred. Continuing with the next question.");
          continue;
        }
        if (error.message.includes("TYPO3 503 error detected")) {
          throw error; // Rethrow the 503 error to be caught in the main loop
        }
        await sleep(5000);
      }
    }
    console.log("Survey completed or not available. Moving to next test.");
  } catch (error) {
    console.error("Error in carmenthinBeratungstraining:", error);
    throw error; // Rethrow the error to be handled in the main script
  }
}

module.exports = {
    carmenthinBeratungstraining,
};