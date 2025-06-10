// Minimal scroll progress functionality
document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("scrollProgress");
  if (!progressBar) return;
  
  // Update progress based on current section
  function updateProgress() {
    const sections = document.querySelectorAll(".section");
    const activeIndex = Array.from(sections).findIndex(section => 
      section.classList.contains("active"));
    
    if (activeIndex >= 0) {
      const progress = ((activeIndex + 1) / sections.length) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }
  
  // Listen for section changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        updateProgress();
      }
    });
  });
  
  // Observe all sections for class changes
  document.querySelectorAll(".section").forEach(section => {
    observer.observe(section, { attributes: true });
  });
  
  // Initial update
  updateProgress();
});