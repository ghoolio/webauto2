// quizzes/newQuiz.js
/**
 * Template for creating a new quiz
 * 
 * Instructions:
 * 1. Copy this file and rename it for your new quiz
 * 2. Replace placeholders with actual values
 * 3. Customize the sequence steps as needed
 * 4. Add custom functions if required
 * 5. Register the quiz in quizRegistry.js
 */

module.exports = {
    // Basic quiz information
    name: "QuizName", // Replace with actual quiz name
    url: "https://academy.medice-health-family.com/paths/your-quiz-path/home", // Replace with actual URL
    
    // Sequence of steps to complete the quiz
    sequence: [
      // Example steps - modify as needed
      
      // Start screen
      {
        type: "START_SCREEN",
        action: "clickStartButton",
        waitAfter: 3000
      },
      
      // Navigate through initial screens
      {
        type: "NEXT_BUTTON",
        action: "clickNextButton",
        waitAfter: 2000
      },
      {
        type: "NEXT_BUTTON",
        action: "clickNextButton",
        waitAfter: 2000
      },
      
      // Handle dialog screen
      {
        type: "DIALOG_SCREEN",
        action: "pressSpaceKey",
        params: {
          delay: 3000
        },
        waitAfter: 5000
      },
      
      // Risk factors slide
      {
        type: "RISK_FACTORS_SLIDE",
        action: "clickAllRiskFactors",
        useScormFrame: true, // Set to true if this step needs to use SCORM frame
        params: {
          // Optional: Provide custom risk factors if needed
          riskFactors: [
            { id: 'element-id-1', description: 'Description 1' },
            { id: 'element-id-2', description: 'Description 2' },
            // Add more as needed
          ],
          delayBetweenClicks: 1000,
          waitAfterClose: 2000
        },
        waitAfter: 2000
      },
      
      // Message slide
      {
        type: "MESSAGE_SLIDE",
        action: "handleMessageDialogSequence",
        useScormFrame: true,
        params: {
          maxClicks: 3,
          waitAfterNext: 5000
        },
        waitAfter: 5000
      },
      
      // Slider interaction
      {
        type: "SLIDER_INTERACTION_SLIDE",
        action: "handleSliderInteraction",
        useScormFrame: true,
        params: {
          position: 6, // Set slider position (1-7)
          waitAfterSet: 2000
        },
        waitAfter: 5000
      },
      
      // Carousel navigation
      {
        type: "CAROUSEL_SLIDE",
        action: "handleCarouselNavigation",
        useScormFrame: true,
        params: {
          maxClicks: 2, // Number of carousel slides to click through
          delayBetweenClicks: 2000
        },
        waitAfter: 3000
      },
      
      // Generic next button
      {
        type: "GENERIC_NEXT_BUTTON_STATE",
        action: "clickNextButton",
        useScormFrame: true,
        waitAfter: 5000
      },
      
      // Completion screen
      {
        type: "COMPLETION_SCREEN",
        action: "clickWeiterButton",
        useScormFrame: true,
        waitAfter: 3000
      },
      
      // Final screen
      {
        type: "FINAL_SCREEN",
        action: "clickTrainingSchliessen",
        useScormFrame: true,
        waitAfter: 5000
      }
      
      // Add additional steps as needed
    ],
    
    // Custom functions specific to this quiz (optional)
    customFunctions: {
      // Add custom functions if standard interactions are not sufficient
      // Example:
      /*
      customInteraction: async (frame, params, stepInfo) => {
        console.log(`Executing custom interaction for ${stepInfo.quiz.name}`);
        
        // Custom implementation
        await frame.click(params.selector || '#customElement');
        await require('../utils/commonUtils').sleep(2000);
        
        // Return true for successful completion
        return true;
      }
      */
    }
};