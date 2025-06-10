// Performance optimizations for smooth scrolling and navigation
document.addEventListener("DOMContentLoaded", () => {
  // Apply passive event listeners where possible
  const scrollableElements = document.querySelectorAll(".scrollable-content");
  scrollableElements.forEach(element => {
    element.addEventListener("scroll", () => {}, { passive: true });
  });
  
  // Force hardware acceleration on main container
  const mainContainer = document.getElementById("main-container");
  if (mainContainer) {
    mainContainer.style.transform = 'translateZ(0)';
    mainContainer.style.willChange = 'transform';
  }
  
  // Optimize image loading with native lazy loading
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
});