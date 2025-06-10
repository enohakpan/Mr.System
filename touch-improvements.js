// Enhanced touch handling for mobile devices
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");
  let touchStartY = 0;
  let isScrolling = false;
  
  // Touch event handlers
  document.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener("touchend", (e) => {
    if (isScrolling) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    
    // Only process significant vertical swipes
    if (Math.abs(deltaY) > 80) {
      // Use the global scrollToSection function if available
      if (typeof window.scrollToSection === 'function') {
        const currentSection = Array.from(sections).findIndex(section => 
          section.classList.contains("active"));
          
        if (deltaY > 0 && currentSection < sections.length - 1) {
          window.scrollToSection(currentSection + 1);
        } else if (deltaY < 0 && currentSection > 0) {
          window.scrollToSection(currentSection - 1);
        }
      }
    }
  }, { passive: true });
});