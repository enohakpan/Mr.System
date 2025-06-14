// Global variables
let currentSection = 0
const totalSections = 5
let isScrolling = false
let touchStartY = 0
let lastScrollTop = 0
let scrollEndTimer = null
let isAtSectionEdge = false
let readyForTransition = false
const transitionPromptShown = false

// DOM elements
const mainContainer = document.getElementById("main-container")
const sections = document.querySelectorAll(".section")
const indicators = document.querySelectorAll(".indicator")
const navLinks = document.querySelectorAll(".nav-link")
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")
const navbar = document.getElementById("navbar")
const loadingScreen = document.getElementById("loading-screen")

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  initializeLoading()
  setupEventListeners()
  
  // Ensure first section is visible
  currentSection = 0
  mainContainer.style.transform = "translateY(0)"
  
  // Make sure all sections are properly initialized
  sections.forEach((section, index) => {
    section.classList.toggle("active", index === 0)
  })
  
  updateActiveStates()
  initializeAnimations()
  
  // Force trigger animations for first section
  triggerSectionAnimations()
})

// Initialize loading screen
function initializeLoading() {
  setTimeout(() => {
    loadingScreen.classList.add("hidden")
    setTimeout(() => {
      loadingScreen.style.display = "none"
    }, 500)
  }, 2000)
}

// Setup all event listeners
function setupEventListeners() {
  // Wheel event for desktop scrolling
  window.addEventListener("wheel", handleWheel, { passive: false })

  // Touch events for mobile swiping
  document.addEventListener("touchstart", handleTouchStart, { passive: true })
  document.addEventListener("touchend", handleTouchEnd, { passive: false })

  // Keyboard navigation
  document.addEventListener("keydown", handleKeydown)

  // Navigation clicks
  navLinks.forEach((link) => {
    link.addEventListener("click", handleNavClick)
  })

  // Indicator clicks
  indicators.forEach((indicator) => {
    indicator.addEventListener("click", handleIndicatorClick)
  })
  
  // Create navigation buttons
  createNavigationButtons()

  // Mobile menu toggle
  hamburger.addEventListener("click", toggleMobileMenu)

  // Portfolio filter buttons
  const filterBtns = document.querySelectorAll(".filter-btn")
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", handlePortfolioFilter)
  })

  // Contact form
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", sendEmail)
  }

  // Add scroll event listeners to scrollable sections
  const scrollableSections = document.querySelectorAll(".scrollable-content")
  scrollableSections.forEach((section) => {
    section.addEventListener("scroll", handleSectionScroll)
  })

  // Window resize handler
  window.addEventListener("resize", handleResize)
}

// Handle section scrolling within individual sections
function handleSectionScroll(e) {
  const section = e.target
  const scrollTop = section.scrollTop
  const scrollDirection = scrollTop > lastScrollTop ? "down" : "up"
  lastScrollTop = scrollTop

  // Toggle navbar visibility based on scroll direction
  if (scrollDirection === "down" && scrollTop > 100) {
    navbar.classList.add("navbar-hidden")
  } else if (scrollDirection === "up" || scrollTop <= 100) {
    navbar.classList.remove("navbar-hidden")
  }

  // Check if we're at the edges
  const isAtTop = scrollTop <= 1
  const isAtBottom = section.scrollHeight - scrollTop - section.clientHeight <= 10

  // Show navigation buttons when at bottom of section
  if (isAtBottom) {
    showNavigationButtons()
  }

  // Set flag for section edge
  isAtSectionEdge = isAtTop || isAtBottom

  // Clear any existing timer
  if (scrollEndTimer) {
    clearTimeout(scrollEndTimer)
  }

  // Reset the edge detection after scrolling stops
  scrollEndTimer = setTimeout(() => {
    isAtSectionEdge = false
  }, 150)
}

// Handle wheel scrolling with improved control
function handleWheel(e) {
  const currentSectionElement = sections[currentSection]
  const scrollableContent = currentSectionElement.querySelector(".scrollable-content")
  const delta = e.deltaY

  // Show navigation buttons when user scrolls
  showNavigationButtons()

  // If section has scrollable content, handle internal scrolling only
  if (scrollableContent) {
    const isAtBottom = 
      scrollableContent.scrollHeight - scrollableContent.scrollTop - scrollableContent.clientHeight <= 10
    
    // Show navigation buttons when at bottom of scrollable content
    if (isAtBottom) {
      showNavigationButtons()
    }
    
    // Allow normal scrolling within the section, but prevent section transitions
    e.preventDefault()
    if (delta > 0 && scrollableContent.scrollTop < scrollableContent.scrollHeight - scrollableContent.clientHeight) {
      scrollableContent.scrollTop += Math.abs(delta)
    } else if (delta < 0 && scrollableContent.scrollTop > 0) {
      scrollableContent.scrollTop -= Math.abs(delta)
    }
  } else {
    // For non-scrollable sections, just prevent default behavior
    e.preventDefault()
  }
}

// Handle section transitions with simplified behavior
function handleSectionTransition(direction) {
  // Show navigation buttons
  showNavigationButtons()
  
  // Directly proceed with transition without double-scroll requirement
  if (direction === "down" && currentSection < totalSections - 1) {
    scrollToSection(currentSection + 1)
    return true
  } else if (direction === "up" && currentSection > 0) {
    scrollToSection(currentSection - 1)
    return true
  }
  
  // Hide any transition prompts
  hideTransitionPrompt()
  return false
}

// Handle touch start
function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY
}

// Handle touch end with improved swipe detection
function handleTouchEnd(e) {
  const touchEndY = e.changedTouches[0].clientY
  const deltaY = touchStartY - touchEndY
  const threshold = 100 // Increased threshold for better control

  if (Math.abs(deltaY) < threshold) return

  // Show navigation buttons on swipe
  showNavigationButtons()

  const currentSectionElement = sections[currentSection]
  const scrollableContent = currentSectionElement.querySelector(".scrollable-content")

  if (scrollableContent) {
    const isAtTop = scrollableContent.scrollTop <= 10
    const isAtBottom =
      scrollableContent.scrollHeight - scrollableContent.scrollTop - scrollableContent.clientHeight <= 10

    // Only handle section transitions at boundaries
    if (deltaY > 0 && isAtBottom && currentSection < totalSections - 1) {
      scrollToSection(currentSection + 1)
    } else if (deltaY < 0 && isAtTop && currentSection > 0) {
      scrollToSection(currentSection - 1)
    }
  } else {
    // For non-scrollable sections
    if (deltaY > 0 && currentSection < totalSections - 1) {
      scrollToSection(currentSection + 1)
    } else if (deltaY < 0 && currentSection > 0) {
      scrollToSection(currentSection - 1)
    }
  }
}

// Handle keyboard navigation
function handleKeydown(e) {
  if (isScrolling) return

  const currentSectionElement = sections[currentSection]
  const scrollableContent = currentSectionElement.querySelector(".scrollable-content")
  const scrollAmount = 50 // Amount to scroll in pixels

  switch (e.key) {
    case "ArrowUp":
      e.preventDefault()
      if (scrollableContent) {
        // Scroll within section if not at top
        if (scrollableContent.scrollTop > 0) {
          scrollableContent.scrollTop -= scrollAmount
        } else if (currentSection > 0) {
          // At top of section, transition to previous section
          handleSectionTransition("up")
        }
      } else if (currentSection > 0) {
        handleSectionTransition("up")
      }
      break

    case "ArrowDown":
      e.preventDefault()
      if (scrollableContent) {
        const maxScroll = scrollableContent.scrollHeight - scrollableContent.clientHeight
        // Scroll within section if not at bottom
        if (scrollableContent.scrollTop < maxScroll) {
          scrollableContent.scrollTop += scrollAmount
        } else if (currentSection < totalSections - 1) {
          // At bottom of section, transition to next section
          handleSectionTransition("down")
        }
      } else if (currentSection < totalSections - 1) {
        handleSectionTransition("down")
      }
      break

    case "Home":
      e.preventDefault()
      scrollToSection(0)
      break

    case "End":
      e.preventDefault()
      scrollToSection(totalSections - 1)
      break
  }
}

// Handle navigation clicks
function handleNavClick(e) {
  e.preventDefault()
  const target = e.target.closest("[data-section]")
  if (!target) return
  
  const sectionIndex = Number.parseInt(target.getAttribute("data-section"))
  if (!isNaN(sectionIndex)) {
    scrollToSection(sectionIndex)
    
    // Close mobile menu if open
    if (navMenu.classList.contains("active")) {
      toggleMobileMenu()
    }
  }
}

// Handle indicator clicks
function handleIndicatorClick(e) {
  const target = e.target.closest("[data-section]")
  if (!target) return
  
  const sectionIndex = Number.parseInt(target.getAttribute("data-section"))
  if (!isNaN(sectionIndex)) {
    scrollToSection(sectionIndex)
  }
}

// Scroll to specific section
function scrollToSection(sectionIndex) {
  // Validate section index
  if (isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= totalSections) return
  
  // Prevent scrolling if already scrolling or same section
  if (isScrolling || sectionIndex === currentSection) return

  console.log(`Scrolling to section: ${sectionIndex}`)
  isScrolling = true
  currentSection = sectionIndex

  // Hide transition prompt and reset readiness
  hideTransitionPrompt()
  readyForTransition = false

  // Show/hide navbar based on section
  if (currentSection === 0) {
    navbar.classList.remove("navbar-hidden")
  }

  // Update transform with smooth transition
  const translateY = -currentSection * 100
  mainContainer.style.transform = `translateY(${translateY}vh)`

  // Reset scroll positions for scrollable sections
  const scrollableContent = sections[currentSection].querySelector(".scrollable-content")
  if (scrollableContent) {
    scrollableContent.scrollTop = 0
  }
  lastScrollTop = 0

  // Show navigation buttons
  showNavigationButtons()
  
  // Update active states
  updateActiveStates()

  // Trigger section-specific animations
  triggerSectionAnimations()

  // Reset scrolling flag after animation completes
  setTimeout(() => {
    isScrolling = false
  }, 800)
}

// Update active states for navigation and indicators
function updateActiveStates() {
  // Update indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentSection)
  })

  // Update navigation links
  navLinks.forEach((link, index) => {
    link.classList.toggle("active", index === currentSection)
  })

  // Update sections
  sections.forEach((section, index) => {
    section.classList.toggle("active", index === currentSection)
  })
}

// Trigger section-specific animations
function triggerSectionAnimations() {
  const currentSectionElement = sections[currentSection]

  // Always ensure current section is visible
  currentSectionElement.style.display = "block"
  currentSectionElement.style.opacity = "1"

  // Animate stats counters in about section
  if (currentSection === 1) {
    setTimeout(() => {
      animateCounters()
      animateSkillBars()
    }, 300)
  }

  // Animate portfolio items
  if (currentSection === 3) {
    setTimeout(() => {
      animatePortfolioItems()
    }, 300)
  }
  
  // For first section (hero), ensure it's fully visible
  if (currentSection === 0) {
    const heroElements = currentSectionElement.querySelectorAll(".fade-in, .slide-in")
    heroElements.forEach(el => {
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
    })
  }
}

// Animate counter numbers
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]")

  counters.forEach((counter) => {
    const target = Number.parseInt(counter.getAttribute("data-target"))
    const increment = target / 60 // 60 frames for 1 second animation
    let current = 0

    const updateCounter = () => {
      if (current < target) {
        current += increment
        counter.textContent = Math.ceil(current)
        requestAnimationFrame(updateCounter)
      } else {
        counter.textContent = target
      }
    }

    updateCounter()
  })
}

// Animate skill progress bars
function animateSkillBars() {
  const progressBars = document.querySelectorAll(".progress-bar[data-progress]")

  progressBars.forEach((bar, index) => {
    setTimeout(() => {
      const progress = bar.getAttribute("data-progress")
      bar.style.width = `${progress}%`
    }, index * 100)
  })
}

// Animate portfolio items
function animatePortfolioItems() {
  const portfolioItems = document.querySelectorAll(".portfolio-item")

  portfolioItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = "1"
      item.style.transform = "translateY(0)"
    }, index * 100)
  })
}

// Toggle mobile menu
function toggleMobileMenu() {
  navMenu.classList.toggle("active")
  hamburger.classList.toggle("active")

  // Prevent body scroll when menu is open
  if (navMenu.classList.contains("active")) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = ""
  }
}

// Handle portfolio filtering
function handlePortfolioFilter(e) {
  const filterBtns = document.querySelectorAll(".filter-btn")
  const portfolioItems = document.querySelectorAll(".portfolio-item")
  const filter = e.target.getAttribute("data-filter")

  // Update active filter button
  filterBtns.forEach((btn) => btn.classList.remove("active"))
  e.target.classList.add("active")

  // Filter portfolio items with animation
  portfolioItems.forEach((item, index) => {
    const category = item.getAttribute("data-category")

    if (filter === "all" || category === filter) {
      setTimeout(() => {
        item.style.display = "block"
        setTimeout(() => {
          item.style.opacity = "1"
          item.style.transform = "translateY(0)"
        }, 50)
      }, index * 50)
    } else {
      item.style.opacity = "0"
      item.style.transform = "translateY(20px)"
      setTimeout(() => {
        item.style.display = "none"
      }, 300)
    }
  })
}

// Handle contact form submission
function sendEmail(e) {
    e.preventDefault();
    console.log('Form submission triggered');

    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.querySelector(".btn-text").textContent;

    // Show loading state
    submitBtn.querySelector(".btn-text").textContent = "Sending...";
    submitBtn.querySelector(".btn-icon i").className = "fas fa-spinner fa-spin";
    submitBtn.disabled = true;

    // Prepare email with all form data
    const templateParams = {
        to_email: 'dashdash59600@gmail.com',
        from_name: formData.get('name'),
        email: formData.get('email'),
        message: `
New Contact Form Submission:

Name: ${formData.get('name')}
Email: ${formData.get('email')}
Company: ${formData.get('company')}
Budget Range: ${formData.get('budget')}
Service Needed: ${formData.get('service')}

Message:
${formData.get('message')}
        `
    };

    console.log('Sending form data...');

    // Send email with form data
    emailjs.send('service_8tuaw9y', 'template_f7i4c8d', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            showNotification("Message sent successfully! I'll get back to you soon.", "success");
            
            // Reset form
            e.target.reset();
            
            // Reset button
            submitBtn.querySelector(".btn-text").textContent = originalText;
            submitBtn.querySelector(".btn-icon i").className = "fas fa-paper-plane";
            submitBtn.disabled = false;
        })
        .catch(function(error) {
            console.error('FAILED...', error);
            showNotification(`Failed to send: ${error.text || 'Please try again later.'}`, "error");
            submitBtn.querySelector(".btn-text").textContent = originalText;
            submitBtn.querySelector(".btn-icon i").className = "fas fa-paper-plane";
            submitBtn.disabled = false;
        });

    return false;
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === "success" ? "check-circle" : "info-circle"}"></i>
      <span>${message}</span>
    </div>
  `

  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 10000;
    background: ${type === "success" ? "var(--accent-color)" : "var(--primary-color)"};
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    box-shadow: var(--shadow-xl);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `

  document.body.appendChild(notification)

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Hide notification after 5 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 5000)
}

// Show transition prompt
function showTransitionPrompt(message, direction) {
  const prompt = document.getElementById("transition-prompt")
  const promptText = prompt.querySelector(".prompt-text")
  const promptIcon = prompt.querySelector(".prompt-icon i")

  promptText.textContent = message
  promptIcon.className = `fas fa-arrow-${direction === "down" ? "down" : "up"}`

  prompt.classList.add("visible")
}

// Hide transition prompt
function hideTransitionPrompt() {
  const prompt = document.getElementById("transition-prompt")
  prompt.classList.remove("visible")
}

// Variables for navigation buttons
let navButtonsTimeout = null;
let navButtonsVisible = false;

// Create navigation buttons for section transitions
function createNavigationButtons() {
  // Remove any existing buttons first
  const existingButtons = document.querySelector(".section-nav-buttons")
  if (existingButtons) {
    document.body.removeChild(existingButtons)
  }
  
  // Create container for navigation buttons
  const navButtonsContainer = document.createElement("div")
  navButtonsContainer.className = "section-nav-buttons"
  navButtonsContainer.innerHTML = `
    <button id="prevSectionBtn" class="section-nav-btn prev-section" aria-label="Previous section">
      <i class="fas fa-chevron-up"></i>
    </button>
    <button id="nextSectionBtn" class="section-nav-btn next-section" aria-label="Next section">
      <i class="fas fa-chevron-down"></i>
    </button>
  `
  
  // Add styles for the buttons
  const style = document.createElement("style")
  style.textContent = `
    .section-nav-buttons {
      position: fixed;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    .section-nav-buttons.visible {
      opacity: 1;
      visibility: visible;
    }
    .section-nav-btn {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .section-nav-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    @media (max-width: 768px) {
      .section-nav-buttons {
        right: 1rem;
      }
      .section-nav-btn {
        width: 2.5rem;
        height: 2.5rem;
      }
    }
  `
  
  // Add to document
  document.head.appendChild(style)
  document.body.appendChild(navButtonsContainer)
  
  // Add event listeners
  const prevBtn = document.getElementById("prevSectionBtn")
  const nextBtn = document.getElementById("nextSectionBtn")
  
  prevBtn.addEventListener("click", () => handleSectionTransition("up"))
  nextBtn.addEventListener("click", () => handleSectionTransition("down"))
  
  // Show buttons on hover near the edge
  document.addEventListener("mousemove", (e) => {
    const edgeThreshold = 100
    if (e.clientX > window.innerWidth - edgeThreshold) {
      showNavigationButtons()
    }
  })
  
  // Keep buttons visible when hovering over them
  navButtonsContainer.addEventListener("mouseenter", () => {
    if (navButtonsTimeout) {
      clearTimeout(navButtonsTimeout)
      navButtonsTimeout = null
    }
  })
  
  navButtonsContainer.addEventListener("mouseleave", () => {
    hideNavigationButtonsWithDelay()
  })
  
  // Update button states based on current section
  function updateButtonStates() {
    prevBtn.disabled = currentSection === 0
    prevBtn.style.opacity = currentSection === 0 ? "0.5" : "1"
    prevBtn.style.pointerEvents = currentSection === 0 ? "none" : "auto"
    
    nextBtn.disabled = currentSection === totalSections - 1
    nextBtn.style.opacity = currentSection === totalSections - 1 ? "0.5" : "1"
    nextBtn.style.pointerEvents = currentSection === totalSections - 1 ? "none" : "auto"
  }
  
  // Initial update
  updateButtonStates()
  
  // Update on section change
  const originalUpdateActiveStates = updateActiveStates
  updateActiveStates = function() {
    originalUpdateActiveStates()
    updateButtonStates()
    showNavigationButtons()
  }
}

// Show navigation buttons
function showNavigationButtons() {
  const navButtons = document.querySelector(".section-nav-buttons")
  if (navButtons) {
    navButtons.classList.add("visible")
    navButtonsVisible = true
    
    // Auto-hide after delay
    hideNavigationButtonsWithDelay()
  } else {
    // If buttons don't exist yet, create them
    setTimeout(() => {
      const newNavButtons = document.querySelector(".section-nav-buttons")
      if (newNavButtons) {
        newNavButtons.classList.add("visible")
        navButtonsVisible = true
        hideNavigationButtonsWithDelay()
      }
    }, 100)
  }
}

// Hide navigation buttons with delay
function hideNavigationButtonsWithDelay() {
  if (navButtonsTimeout) {
    clearTimeout(navButtonsTimeout)
  }
  
  navButtonsTimeout = setTimeout(() => {
    const navButtons = document.querySelector(".section-nav-buttons")
    if (navButtons) {
      navButtons.classList.remove("visible")
      navButtonsVisible = false
    }
  }, 2000)
}

// Handle window resize
function handleResize() {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 968 && navMenu.classList.contains("active")) {
    toggleMobileMenu()
  }

  // Reset any scroll positions
  const scrollableContent = sections[currentSection].querySelector(".scrollable-content")
  if (scrollableContent) {
    lastScrollTop = scrollableContent.scrollTop
  }
}

// Initialize animations and observers
function initializeAnimations() {
  // Set initial states for portfolio items
  const portfolioItems = document.querySelectorAll(".portfolio-item")
  portfolioItems.forEach((item) => {
    item.style.opacity = "0"
    item.style.transform = "translateY(30px)"
    item.style.transition = "all 0.6s ease"
  })

  // Initialize intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements that should animate on scroll
  const animateElements = document.querySelectorAll(".service-card, .skill-item, .contact-item")
  animateElements.forEach((el) => observer.observe(el))
}

// Utility function to scroll to section (for button clicks)
window.scrollToSection = scrollToSection

// Add smooth scrolling behavior
document.documentElement.style.scrollBehavior = "smooth"

// Ensure page is properly initialized on load
window.addEventListener("load", () => {
  // Reset to first section if page was reloaded
  if (window.performance && performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    currentSection = 0
    mainContainer.style.transform = "translateY(0)"
    
    // Update active states
    updateActiveStates()
    
    // Trigger animations for first section
    triggerSectionAnimations()
  }
})

// Preload critical resources
function preloadResources() {
  // Preload fonts
  const fontLink = document.createElement("link")
  fontLink.rel = "preload"
  fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
  fontLink.as = "style"
  document.head.appendChild(fontLink)

  // Preload critical images
  const images = document.querySelectorAll('img[src*="placeholder"]')
  images.forEach((img) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = img.src
    link.as = "image"
    document.head.appendChild(link)
  })
}

// Initialize preloading
preloadResources()

// Add performance monitoring
function monitorPerformance() {
  if ("performance" in window) {
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0]
      console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`)
    })
  }
}

monitorPerformance()

// Add error handling
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
})

// Add unhandled promise rejection handling
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
})
