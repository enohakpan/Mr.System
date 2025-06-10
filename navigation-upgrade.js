// Minimal navigation upgrade
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sections = document.querySelectorAll(".section");
  const mainContainer = document.getElementById("main-container");
  const indicators = document.querySelectorAll(".indicator");
  const navLinks = document.querySelectorAll(".nav-link");
  
  // Variables
  let currentSection = 0;
  let isScrolling = false;
  let touchStartY = 0;
  
  // Smooth scroll to section
  function scrollToSection(index) {
    if (isScrolling || index === currentSection || index < 0 || index >= sections.length) return;
    
    isScrolling = true;
    currentSection = index;
    
    // Apply transition
    mainContainer.style.transform = `translateY(-${currentSection * 100}vh)`;
    
    // Update active states
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === currentSection);
    });
    
    navLinks.forEach((link, i) => {
      link.classList.toggle("active", i === currentSection);
    });
    
    sections.forEach((section, i) => {
      section.classList.toggle("active", i === currentSection);
    });
    
    // Release scroll lock after animation completes
    setTimeout(() => {
      isScrolling = false;
    }, 800);
  }
  
  // Event listeners
  window.addEventListener("wheel", (e) => {
    if (isScrolling) return;
    
    if (e.deltaY > 0 && currentSection < sections.length - 1) {
      e.preventDefault();
      scrollToSection(currentSection + 1);
    } else if (e.deltaY < 0 && currentSection > 0) {
      e.preventDefault();
      scrollToSection(currentSection - 1);
    }
  }, { passive: false });
  
  // Navigation click handlers
  navLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToSection(index);
    });
  });
  
  // Indicator click handlers
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      scrollToSection(index);
    });
  });
  
  // Expose to global scope
  window.scrollToSection = scrollToSection;
});