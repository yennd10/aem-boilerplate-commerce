/**
 * Home Images Block with Parallax Effect
 * Creates a smooth parallax scrolling effect for images
 */

export default function init(el) {
  // Add parallax class to enable effects
  el.classList.add('parallax-enabled');
  
  // Get all images in the block
  const images = el.querySelectorAll('.default-content-wrapper img');
  
  // Parallax configuration
  const parallaxConfig = {
    speed: 0.5, // Adjust this value to control parallax intensity (0.1 to 1.0)
    threshold: 0.1, // Minimum visibility threshold
    smoothness: 0.1 // Smoothing factor for transitions
  };
  
  // Store initial positions
  const imagePositions = [];
  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    imagePositions.push({
      element: img,
      index: index,
      initialTop: rect.top + window.scrollY,
      height: rect.height
    });
  });
  
  // Parallax scroll handler
  function handleParallax() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    imagePositions.forEach((imgData, index) => {
      const { element, initialTop, height } = imgData;
      const rect = element.getBoundingClientRect();
      
      // Calculate visibility
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const isVisible = elementBottom > 0 && elementTop < windowHeight;
      
      if (isVisible) {
        // Calculate parallax offset based on scroll position
        const scrollProgress = (scrollY - (initialTop - windowHeight)) / (windowHeight + height);
        const parallaxOffset = scrollProgress * parallaxConfig.speed * 100;
        
        // Apply different parallax directions for visual interest
        let finalOffset;
        switch (index) {
          case 0: // First image - move up
            finalOffset = -parallaxOffset;
            break;
          case 1: // Second image - move down
            finalOffset = parallaxOffset * 0.7;
            break;
          case 2: // Third image - move up slightly
            finalOffset = -parallaxOffset * 0.5;
            break;
          default:
            finalOffset = 0;
        }
        
        // Apply the transform using CSS custom properties
        element.style.setProperty(`--parallax-offset-${index + 1}`, `${finalOffset}px`);
      }
    });
  }
  
  // Throttled scroll handler for performance
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleParallax();
        ticking = false;
      });
      ticking = true;
    }
  }
  
  // Add scroll event listener
  window.addEventListener('scroll', requestTick, { passive: true });
  
  // Initial call to set positions
  handleParallax();
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalculate positions after resize
      imagePositions.forEach((imgData, index) => {
        const rect = imgData.element.getBoundingClientRect();
        imgData.initialTop = rect.top + window.scrollY;
        imgData.height = rect.height;
      });
      handleParallax();
    }, 250);
  });
  
  // Cleanup function
  function cleanup() {
    window.removeEventListener('scroll', requestTick);
    window.removeEventListener('resize', cleanup);
  }
  
  // Return cleanup function for block lifecycle management
  return cleanup;
}
