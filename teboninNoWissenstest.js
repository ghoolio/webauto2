// umckaloaboTest.js
const {
    clickUmfrageNextQuestionButton,
    handleQuestion,
    clickNextQuestionButton // Add this line
} = require('./utils');

const {
    runUmfragenTest
} = require('./umfragenTest');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startTest(page, startbutton) {
    await sleep(2000);
    await page.waitForSelector(startbutton);
    await page.click(startbutton);
}

async function startUmfrage(page, umfragebutton) {
    await sleep(2000);
    await page.waitForSelector(umfragebutton);
    await page.click(umfragebutton);
}

async function writeUmfrageAnswer(page, answer, inputSelector) {
    await sleep(2000);
  
    // Wait for the input field
    await page.waitForSelector(inputSelector);
  
    // Clear the input field
    await page.evaluate((selector) => {
      const inputField = document.querySelector(selector);
      if (inputField) {
        inputField.value = '';
      }
    }, inputSelector);
  
    // Type the answer into the input field
    await page.type(inputSelector, answer);
}

async function runCarmethinNoWissenstest(page) {
    // TEBONIN
    await page.goto("https://www.schwabe-fachkreise.de/fortbildungen/online-trainings/produkt/tebonin/training/beratungstraining-einwaenden-von-kunden-entspannt-und-erfolgreich-begegnen/fragen/0", {
      waitUntil: "domcontentloaded",
      timeout: 60000 // Increase timeout to 90 seconds
    });
    await sleep(5000);
    // maybe check if this is a text area question and else, just answer the tickbox question
    // check if the answer element is called #answer_1_4 and if that's the case then just write Die Anwtwort and if not, check and tick on the #answer1
    await startUmfrage(page, "#question > div:nth-child(3) > div > div.row > div > div > div > div.col-sm-8 > div");
    await sleep(2000);
    await runUmfragenTest(page);
}  

module.exports = {
    runCarmethinNoWissenstest
};
