/* ========================================
   STICKY HEADER FUNCTIONALITY
   ======================================== */

// Initialize sticky header state
let stickyHeaderVisible = false;
const stickyHeader = document.getElementById('stickyHeader');
const mainHeader = document.getElementById('mainHeader');

// Sticky header appears when user scrolls beyond the first section (hero)
// This creates a professional effect where additional navigation becomes available
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const heroSection = document.querySelector('.hero-section');
    const heroHeight = heroSection ? heroSection.offsetHeight : 0;

    // Show sticky header after scrolling past the hero section
    if (scrollPosition > heroHeight - 100) {
        if (!stickyHeaderVisible) {
            stickyHeader.classList.add('visible');
            stickyHeaderVisible = true;
        }
    } else {
        if (stickyHeaderVisible) {
            stickyHeader.classList.remove('visible');
            stickyHeaderVisible = false;
        }
    }
});

/* ========================================
   CAROUSEL FUNCTIONALITY
   ======================================== */

// Carousel state management - tracks which slide is currently displayed
let currentSlide = 0;
let totalSlides = 4; // Number of carousel items

const carouselInner = document.getElementById('carouselInner');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselIndicators = document.getElementById('carouselIndicators');

// Create carousel indicator dots dynamically based on number of slides
function initializeCarouselIndicators() {
    const indicators = document.querySelectorAll('.carousel-item').length;
    totalSlides = indicators;

    for (let i = 0; i < indicators; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        carouselIndicators.appendChild(dot);
    }
}

// Update carousel position when slide changes
// This function smoothly translates the carousel to show the correct slide
function updateCarouselPosition() {
    const translateX = -currentSlide * 100;
    carouselInner.style.transform = `translateX(${translateX}%)`;

    // Update indicator dots to show which slide is active
    document.querySelectorAll('.carousel-indicator').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Navigate to a specific slide when dot is clicked
function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarouselPosition();
}

// Move to next slide when next button is clicked
carouselNext.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarouselPosition();
});

// Move to previous slide when prev button is clicked
carouselPrev.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarouselPosition();
});

// Keyboard navigation for accessibility - arrow keys control carousel
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        carouselNext.click();
    } else if (e.key === 'ArrowLeft') {
        carouselPrev.click();
    }
});

// Initialize carousel when page loads
document.addEventListener('DOMContentLoaded', initializeCarouselIndicators);

/* ========================================
   MODAL POPUP FUNCTIONALITY
   ======================================== */

// Email Datasheet Modal - appears when "Download Full Technical Datasheet" is clicked
const emailModal = document.getElementById('emailModal');
const emailModalOverlay = document.getElementById('emailModalOverlay');
const emailModalClose = document.getElementById('emailModalClose');
const dataSheetBtn = document.getElementById('dataSheetBtn');
const datasheetForm = document.getElementById('datasheetForm');

// Request Callback Modal - appears when "Request a Quote" is clicked
const callbackModal = document.getElementById('callbackModal');
const callbackModalOverlay = document.getElementById('callbackModalOverlay');
const callbackModalClose = document.getElementById('callbackModalClose');
const callbackBtn = document.getElementById('callbackBtn');
const callbackForm = document.getElementById('callbackForm');

// Open email datasheet modal with smooth animation
function openEmailModal() {
    emailModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Close email datasheet modal with smooth animation
function closeEmailModal() {
    emailModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Open request callback modal with smooth animation
function openCallbackModal() {
    callbackModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close request callback modal with smooth animation
function closeCallbackModal() {
    callbackModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Email modal event listeners
dataSheetBtn.addEventListener('click', openEmailModal);
emailModalClose.addEventListener('click', closeEmailModal);
emailModalOverlay.addEventListener('click', closeEmailModal);

// Callback modal event listeners
callbackBtn.addEventListener('click', openCallbackModal);
callbackModalClose.addEventListener('click', closeCallbackModal);
callbackModalOverlay.addEventListener('click', closeCallbackModal);

// Close modals when ESC key is pressed - standard web behavior for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEmailModal();
        closeCallbackModal();
    }
});

// Prevent modal from closing when clicking inside the modal content
emailModal.addEventListener('click', (e) => {
    if (e.target === emailModal || e.target === emailModalOverlay) {
        closeEmailModal();
    }
});

callbackModal.addEventListener('click', (e) => {
    if (e.target === callbackModal || e.target === callbackModalOverlay) {
        closeCallbackModal();
    }
});

/* ========================================
   FORM HANDLING
   ======================================== */

// Datasheet form submission
datasheetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(datasheetForm);
    const data = Object.fromEntries(formData);

    // In production, this would send to a backend API
    // For now, we simulate successful submission
    console.log('Datasheet form submitted:', data);

    // Show success message (you can enhance this with a toast notification)
    alert('Thank you! Your datasheet download will start shortly. Check your email for the download link.');

    // Reset form and close modal
    datasheetForm.reset();
    closeEmailModal();
});

// Callback form submission
callbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(callbackForm);
    const data = Object.fromEntries(formData);

    // In production, this would send to a backend API
    console.log('Callback form submitted:', data);

    // Show success message
    alert('Thank you for your interest! Our team will contact you shortly with a personalized quote.');

    // Reset form and close modal
    callbackForm.reset();
    closeCallbackModal();
});

// Contact form submission (at the bottom of the page)
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // In production, this would send to a backend API
    console.log('Contact form submitted:', data);

    // Show success message
    alert('Thank you for your message! We will get back to you within 24 hours.');

    // Reset form
    contactForm.reset();
});

/* ========================================
   MOBILE NAVIGATION
   ======================================== */

// Mobile menu toggle - shows/hides navigation on mobile devices
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');

mobileMenuToggle.addEventListener('click', () => {
    // Toggle the menu visibility
    navLinks.classList.toggle('mobile-open');
    mobileMenuToggle.classList.toggle('active');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileMenuToggle.classList.remove('active');
    });
});

// Close mobile menu when scrolling
window.addEventListener('scroll', () => {
    if (navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        mobileMenuToggle.classList.remove('active');
    }
});

/* ========================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ======================================== */

// Smooth scrolling when clicking navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Don't prevent default for modal triggers
        if (href === '#') {
            return;
        }

        const target = document.querySelector(href);

        if (target) {
            e.preventDefault();

            // Calculate offset for fixed header
            const headerHeight = mainHeader.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ========================================
   LAZY LOADING FOR IMAGES
   ======================================== */

// Implement native lazy loading for images
document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
    }
});

// Intersection Observer for images that need to be loaded only when visible
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

/* ========================================
   INTERACTIVE EFFECTS & ANIMATIONS
   ======================================== */

// Add smooth hover effects to interactive elements
document.querySelectorAll('.feature-card, .product-card, .testimonial-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        // Already handled by CSS hover states
        // This is here for future enhancements
    });
});

// Button ripple effect on click (optional enhancement)
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Get click position
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create ripple element
        const ripple = document.createElement('span');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s ease-out';

        // Add animation to page
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    from {
                        transform: scale(1);
                        opacity: 1;
                    }
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    });
});

/* ========================================
   PAGE PERFORMANCE & OPTIMIZATION
   ======================================== */

// Optimize performance by debouncing scroll events
let scrollTimeout;
function debounce(callback, delay) {
    return function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(callback, delay);
    };
}

// Lazy load images when they come into view
const imageElements = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
}, {
    rootMargin: '50px 0px',
    threshold: 0.01
});

imageElements.forEach(img => {
    if (img.dataset.src) {
        imageObserver.observe(img);
    }
});

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Check if an element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate counter numbers when element comes into view
const counters = document.querySelectorAll('.stat-number');
let counterAnimated = false;

window.addEventListener('scroll', () => {
    if (!counterAnimated && counters.length > 0) {
        const statsSection = document.querySelector('.stats-section');
        if (isInViewport(statsSection)) {
            animateCounters();
            counterAnimated = true;
        }
    }
});

function animateCounters() {
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000; // 2 seconds
        const startTime = Date.now();

        function updateCounter() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Extract just the number part for animation
            const numberText = counter.textContent.replace(/[^0-9]/g, '');
            const animatedNumber = Math.floor(parseInt(numberText) * progress);

            // Format the number based on the original text
            if (counter.textContent.includes('+')) {
                counter.textContent = animatedNumber + '+';
            } else if (counter.textContent.includes('%')) {
                counter.textContent = animatedNumber + '%';
            } else if (counter.textContent.includes('/')) {
                counter.textContent = '24/7';
            } else {
                counter.textContent = animatedNumber;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

/* ========================================
   INITIALIZATION
   ======================================== */

// Log that the page has loaded successfully
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - All interactive features initialized');
    
    // Set focus on main content for accessibility
    document.querySelector('main')?.focus();
});

// Handle window resize for responsive behavior
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Adjust any layout calculations if needed
        console.log('Window resized');
    }, 250);
});
