// carouselDetector.js
// Enhanced carousel slide detection for dorithricin.js

/**
 * Checks if the current slide is a carousel slide with high precision
 * @param {Object} scormFrame - Puppeteer frame
 * @returns {Promise<boolean>} - True if the current slide is a carousel slide
 */
async function isCarouselSlide(scormFrame) {
    try {
      const result = await scormFrame.evaluate(() => {
        console.log('[DETECTOR] Checking for carousel slide with enhanced detection...');
        
        // Strategy 1: Look for "MediBee erklärt" title specifically AND orange buttons
        const hasMediBeeTitle = Array.from(document.querySelectorAll('div'))
          .some(el => {
            const content = el.textContent || '';
            return content.includes('MediBee erklärt') || 
                   content.includes('MediBee') || 
                   content.includes('erklärt');
          });
        
        if (hasMediBeeTitle) {
          console.log('[DETECTOR] Found "MediBee erklärt" title');
        }
        
        // Strategy 2: Look for navigation dots at the bottom (carousel indicators)
        const navigationDots = document.querySelectorAll('circle, .carousel-indicator, [data-model-id="5Y0vhTi03FU"], [data-model-id="6LdGwR80Zd1"], [data-model-id="5fIhFlY7uWX"]');
        const hasNavigationDots = navigationDots.length >= 1;
        
        if (hasNavigationDots) {
          console.log('[DETECTOR] Found navigation dots:', navigationDots.length);
        }
        
        // Strategy 3: Look for left/right navigation arrows
        const leftArrow = document.querySelector('[data-model-id="6nq5QDQUFIy"]');
        const rightArrow = document.querySelector('[data-model-id="5zGPT4DdAeZ"]');
        
        // Also check for any arrow-like elements with orange stroke or fill
        const arrowElements = Array.from(document.querySelectorAll('path[stroke="#FF9800"], path[fill="#FF9800"]'))
          .filter(el => {
            const parent = el.closest('[data-model-id]');
            if (!parent) return false;
            
            // Check for small, circular elements (likely navigation arrows)
            const rect = parent.getBoundingClientRect();
            return (Math.abs(rect.width - rect.height) < 10) && // Nearly circular
                   (rect.width < 50) && // Not too large
                   (rect.width > 20);   // Not too small
          });
        
        const hasArrows = leftArrow || rightArrow || arrowElements.length >= 1;
        
        if (hasArrows) {
          console.log('[DETECTOR] Found carousel navigation arrows');
        }
        
        // Strategy 4: Look for the specific structure shown in the screenshot
        const carouselStructure = document.querySelector('.slide-object-vectorshape');
        const hasCarouselLike = carouselStructure && window.getComputedStyle(carouselStructure).display !== 'none';
        
        // Final detection: Multiple factors must be present
        // Primary detection: MediBee title + (dots OR arrows)
        const isPrimaryCarousel = hasMediBeeTitle && (hasNavigationDots || hasArrows);
        
        // Secondary detection: If dots AND arrows are present, it's likely a carousel
        const isSecondaryCarousel = hasNavigationDots && hasArrows;
        
        // Return detection result
        const isCarousel = isPrimaryCarousel || isSecondaryCarousel;
        console.log('[DETECTOR] Carousel detection result:', {
          hasMediBeeTitle,
          hasNavigationDots,
          hasArrows,
          isPrimaryCarousel,
          isSecondaryCarousel,
          isCarousel
        });
        
        return isCarousel;
      });
      
      console.log(`Carousel detection result: ${result ? 'CAROUSEL DETECTED' : 'Not a carousel slide'}`);
      return result;
    } catch (error) {
      console.error('Error in carousel detection:', error.message);
      return false;
    }
}
  
/**
 * Advanced function to inject into dorithricin's getCurrentSlideState
 * This should be called before other slide type checks
 * @param {Object} scormFrame - Puppeteer frame
 * @returns {Promise<Object|null>} - Slide state object if carousel, null otherwise
 */
async function detectCarouselSlide(scormFrame) {
    const isCarousel = await isCarouselSlide(scormFrame);
    
    if (isCarousel) {
      console.log('*** CAROUSEL SLIDE DETECTED WITH ENHANCED DETECTION ***');
      return { state: 'CAROUSEL_SLIDE', nextAction: 'FORCE_CAROUSEL' };
    }
    
    return null; // Not a carousel slide, continue with other detections
}
  
module.exports = {
    isCarouselSlide,
    detectCarouselSlide
};