// utils.js
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const nextButtonSelectors = [
  '#slide-window > div > div > div.slide-transition-container > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-stategroup.shown.cursor-hover > div > div.slide-object.slide-object-vectorshape.shown > div > svg > g',
  'button:contains("Next")',
  'button:contains("Weiter")',
  '.next-button',
  '.submit-button'
];

const weiterButtonSelectors = [
  '#slide-window > div > div > div.slide-transition-container > div > div:nth-child(6) > div.slide-object.slide-object-stategroup.shown.cursor-hover > div > div.slide-object.slide-object-vectorshape.shown > div > svg > g',
  'button:contains("Weiter")',
  'button:contains("Continue")',
  '.weiter-button',
  '.continue-button'
];

async function clickButton(frame, selectors) {
  for (const selector of selectors) {
      try {
          const button = await frame.$(selector);
          if (button) {
              await button.click();
              console.log(`Clicked button with selector: ${selector}`);
              return true;
          }
      } catch (error) {
          console.log(`Failed to find or click button with selector: ${selector}`);
      }
  }
  console.log('Failed to find any matching button');
  return false;
}

async function clickNextButton(frame) {
  console.log('Attempting to click Next button...');
  return await clickButton(frame, nextButtonSelectors);
}

async function clickWeiterButton(frame) {
  console.log('Attempting to click Weiter button...');
  return await clickButton(frame, weiterButtonSelectors);
}

// error 503
async function checkFor503Error(page) {
  try {
    const content = await page.content();
    return content.includes('503 Service Temporarily Unavailable');
  } catch (error) {
    console.error('Error checking for 503:', error);
    // If there's an error checking (likely due to navigation), assume it might be a 503
    return true;
  }
}
  
async function clickAnswer(frame, answer) {
  await sleep(2000);
  await frame.waitForSelector(answer);
  await frame.click(answer);
}

async function clickNextQuestionButton(frame) {
  await sleep(2000);
  const nextButton = await frame.$('#nextButton');
  if (nextButton) {
      await nextButton.click();
  } else {
      console.error('Next button not found');
  }
}

async function clickStartButton(frame) {
  try {
      // Wait for the start button to be visible and clickable
      await frame.waitForSelector('#slide-window > div > div > div > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-stategroup.shown.cursor-hover > div > div.slide-object.slide-object-vectorshape.shown > div > svg > g', {
          visible: true,
          timeout: 30000
      });

      // Click the start button
      await frame.click('#slide-window > div > div > div > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-stategroup.shown.cursor-hover > div > div.slide-object.slide-object-vectorshape.shown > div > svg > g');

      console.log('Start button clicked successfully');
  } catch (error) {
      console.error('Error clicking start button:', error);
  }
}


//Für den Quiz
async function clickStartButton(page) {
  try {
    // Wait for the iframe to load
    await page.waitForSelector('iframe.ap-elearning--iframe-top');

    // Switch to the iframe context
    const frame = await page.frames().find(f => f.url().includes('/lernmodule/lernmodul/lernmodul-iframe'));
    
    if (!frame) {
      console.log('Could not find the quiz iframe');
      return;
    }

    // Wait for the start button to be visible and clickable
    await frame.waitForSelector('#slide-window > div > div > div > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-stategroup.shown.cursor-hover > div > div.slide-object.slide-object-vectorshape.shown > div > svg > g', {
      visible: true,
      timeout: 30000
    });

    // Click the start button
    await frame.click('#slide-window > div > div > div > div > div.slide-layer.base-layer.shown > div.slide-object.slide-object-stategroup.shown.cursor-hover > div > div.slide-object.slide-object-vectorshape.shown > div > svg > g');

    console.log('Start button clicked successfully');
  } catch (error) {
    console.error('Error clicking start button:', error);
  }
}
  
module.exports = {
  sleep,
  clickNextQuestionButton,
  clickAnswer,
  checkFor503Error,
  clickStartButton,
  clickNextButton,
  clickWeiterButton
};