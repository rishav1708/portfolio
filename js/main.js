// =======================
// Portfolio Website JavaScript
// Author: Rishav Kant
// =======================

(function() {
    'use strict';

    // =======================
    // Utility Functions
    // =======================
    
    const utils = {
        // Debounce function for performance optimization
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function for scroll events
        throttle: function(func, delay) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, delay);
                }
            };
        },

        // Check if element is in viewport
        isInViewport: function(element, offset = 0) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
                rect.bottom >= offset
            );
        },

        // Get current theme
        getCurrentTheme: function() {
            return localStorage.getItem('theme') || 'light';
        },

        // Set theme
        setTheme: function(theme) {
            localStorage.setItem('theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
            this.updateThemeToggle(theme);
        },

        // Update theme toggle button
        updateThemeToggle: function(theme) {
            const themeToggle = document.getElementById('theme-toggle');
            const icon = themeToggle.querySelector('i');
            
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                icon.className = 'fas fa-moon';
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    };

    // =======================
    // Navigation Management
    // =======================
    
    const navigation = {
        init: function() {
            this.navbar = document.getElementById('navbar');
            this.navToggle = document.getElementById('nav-toggle');
            this.navMenu = document.getElementById('nav-menu');
            this.navLinks = document.querySelectorAll('.nav-link');
            this.sections = document.querySelectorAll('section[id]');
            
            this.bindEvents();
            this.handleScroll();
        },

        bindEvents: function() {
            // Mobile menu toggle
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close mobile menu when clicking on links
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    this.closeMobileMenu();
                    this.handleNavClick(e);
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navbar.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Handle scroll for navbar styling and active links
            window.addEventListener('scroll', utils.throttle(() => {
                this.handleScroll();
                this.updateActiveLink();
            }, 16));

            // Handle resize
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > 768) {
                    this.closeMobileMenu();
                }
            }, 250));
        },

        toggleMobileMenu: function() {
            this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            
            // Update aria-expanded attribute
            const isExpanded = this.navMenu.classList.contains('active');
            this.navToggle.setAttribute('aria-expanded', isExpanded);
            
            // Prevent body scrolling when menu is open
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        },

        closeMobileMenu: function() {
            this.navToggle.classList.remove('active');
            this.navMenu.classList.remove('active');
            this.navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        },

        handleNavClick: function(e) {
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    this.smoothScrollTo(target);
                }
            }
        },

        smoothScrollTo: function(target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        },

        handleScroll: function() {
            const scrolled = window.scrollY > 10;
            this.navbar.classList.toggle('scrolled', scrolled);
            
            if (scrolled) {
                this.navbar.style.background = utils.getCurrentTheme() === 'dark' 
                    ? 'rgba(17, 24, 39, 0.95)' 
                    : 'rgba(255, 255, 255, 0.95)';
            } else {
                this.navbar.style.background = utils.getCurrentTheme() === 'dark'
                    ? 'rgba(17, 24, 39, 0.95)'
                    : 'rgba(255, 255, 255, 0.95)';
            }
        },

        updateActiveLink: function() {
            let current = '';
            
            this.sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                const sectionHeight = section.offsetHeight;
                
                if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
                    current = section.getAttribute('id');
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href').replace('#', '');
                if (href === current) {
                    link.classList.add('active');
                }
            });
        }
    };

    // =======================
    // Theme Management
    // =======================
    
    const themeManager = {
        init: function() {
            this.themeToggle = document.getElementById('theme-toggle');
            
            // Initialize theme
            const savedTheme = utils.getCurrentTheme();
            utils.setTheme(savedTheme);
            
            this.bindEvents();
        },

        bindEvents: function() {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Listen for system theme changes
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    if (!localStorage.getItem('theme')) {
                        utils.setTheme(e.matches ? 'dark' : 'light');
                    }
                });
            }
        },

        toggleTheme: function() {
            const currentTheme = utils.getCurrentTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            utils.setTheme(newTheme);
            
            // Trigger re-evaluation of navbar background
            navigation.handleScroll();
        }
    };

    // =======================
    // Scroll Animations
    // =======================
    
    const scrollAnimations = {
        init: function() {
            this.animatedElements = document.querySelectorAll('[data-aos]');
            this.statNumbers = document.querySelectorAll('.stat-number');
            this.skillLevels = document.querySelectorAll('.skill-level');
            
            this.bindEvents();
            this.checkAnimations();
        },

        bindEvents: function() {
            window.addEventListener('scroll', utils.throttle(() => {
                this.checkAnimations();
            }, 16));
        },

        checkAnimations: function() {
            // Animate stat numbers
            this.statNumbers.forEach(stat => {
                if (utils.isInViewport(stat) && !stat.classList.contains('animated')) {
                    this.animateCounter(stat);
                    stat.classList.add('animated');
                }
            });

            // Animate skill levels
            this.skillLevels.forEach(skill => {
                if (utils.isInViewport(skill) && !skill.classList.contains('animated')) {
                    this.animateSkillLevel(skill);
                    skill.classList.add('animated');
                }
            });
        },

        animateCounter: function(element) {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };

            updateCounter();
        },

        animateSkillLevel: function(element) {
            const level = element.getAttribute('data-level');
            setTimeout(() => {
                element.style.setProperty('--skill-width', level + '%');
                element.style.setProperty('width', level + '%');
                element.querySelector('::after')?.style?.setProperty('width', level + '%');
                
                // Animate using CSS custom property
                element.style.setProperty('--animate-width', level + '%');
                element.classList.add('animate');
            }, 300);
        }
    };

    // =======================
    // Project Filtering
    // =======================
    
    const projectFilter = {
        init: function() {
            this.filterButtons = document.querySelectorAll('.filter-btn');
            this.projectCards = document.querySelectorAll('.project-card');
            
            this.bindEvents();
        },

        bindEvents: function() {
            this.filterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => this.handleFilterClick(e));
            });
        },

        handleFilterClick: function(e) {
            const filter = e.target.getAttribute('data-filter');
            
            // Update active button
            this.filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Filter projects
            this.filterProjects(filter);
        },

        filterProjects: function(filter) {
            this.projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    // Animate in
                    setTimeout(() => {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        }
    };

    // =======================
    // Form Handling
    // =======================
    
    const formHandler = {
        init: function() {
            this.form = document.getElementById('contact-form');
            this.inputs = this.form.querySelectorAll('input, textarea');
            this.submitBtn = this.form.querySelector('button[type="submit"]');
            
            this.bindEvents();
        },

        bindEvents: function() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            this.inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearError(input));
            });
        },

        validateField: function(field) {
            const value = field.value.trim();
            const fieldName = field.getAttribute('name');
            let isValid = true;
            let errorMessage = '';

            // Remove previous error state
            field.classList.remove('error');
            
            // Validation rules
            switch (fieldName) {
                case 'name':
                    if (!value) {
                        errorMessage = 'Name is required';
                        isValid = false;
                    } else if (value.length < 2) {
                        errorMessage = 'Name must be at least 2 characters';
                        isValid = false;
                    }
                    break;
                    
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!value) {
                        errorMessage = 'Email is required';
                        isValid = false;
                    } else if (!emailRegex.test(value)) {
                        errorMessage = 'Please enter a valid email';
                        isValid = false;
                    }
                    break;
                    
                case 'subject':
                    if (!value) {
                        errorMessage = 'Subject is required';
                        isValid = false;
                    } else if (value.length < 5) {
                        errorMessage = 'Subject must be at least 5 characters';
                        isValid = false;
                    }
                    break;
                    
                case 'message':
                    if (!value) {
                        errorMessage = 'Message is required';
                        isValid = false;
                    } else if (value.length < 10) {
                        errorMessage = 'Message must be at least 10 characters';
                        isValid = false;
                    }
                    break;
            }

            // Show error
            if (!isValid) {
                field.classList.add('error');
                this.showError(field, errorMessage);
            }

            return isValid;
        },

        showError: function(field, message) {
            const errorElement = document.getElementById(field.name + '-error');
            if (errorElement) {
                errorElement.textContent = message;
            }
        },

        clearError: function(field) {
            field.classList.remove('error');
            const errorElement = document.getElementById(field.name + '-error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        },

        handleSubmit: function(e) {
            e.preventDefault();
            
            let isFormValid = true;
            
            // Validate all fields
            this.inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                this.submitForm();
            } else {
                // Focus first error field
                const firstError = this.form.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                }
            }
        },

        submitForm: function() {
            // Show loading state
            this.submitBtn.classList.add('btn-loading');
            this.submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                console.log('Form data:', data);
                this.showSuccessMessage();
                this.resetForm();
                
                // Reset button state
                this.submitBtn.classList.remove('btn-loading');
                this.submitBtn.disabled = false;
            }, 2000);
        },

        showSuccessMessage: function() {
            // Create success message
            const message = document.createElement('div');
            message.className = 'success-message';
            message.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--secondary-color);
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: var(--radius-base);
                    box-shadow: var(--shadow-large);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                ">
                    <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
                    Message sent successfully!
                </div>
            `;
            
            document.body.appendChild(message);
            
            // Remove message after 5 seconds
            setTimeout(() => {
                message.remove();
            }, 5000);
        },

        resetForm: function() {
            this.form.reset();
            this.inputs.forEach(input => this.clearError(input));
        }
    };

    // =======================
    // Back to Top Button
    // =======================
    
    const backToTop = {
        init: function() {
            this.button = document.getElementById('backToTop');
            this.bindEvents();
        },

        bindEvents: function() {
            this.button.addEventListener('click', () => this.scrollToTop());
            
            window.addEventListener('scroll', utils.throttle(() => {
                this.toggleVisibility();
            }, 100));
        },

        toggleVisibility: function() {
            if (window.scrollY > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        },

        scrollToTop: function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // =======================
    // Image Lazy Loading
    // =======================
    
    const lazyLoading = {
        init: function() {
            this.images = document.querySelectorAll('img[loading="lazy"]');
            
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.observer.unobserve(entry.target);
                        }
                    });
                });

                this.images.forEach(img => this.observer.observe(img));
            } else {
                // Fallback for older browsers
                this.images.forEach(img => this.loadImage(img));
            }
        },

        loadImage: function(img) {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    };

    // =======================
    // Scroll Progress Indicator
    // =======================
    
    const scrollProgress = {
        init: function() {
            this.createProgressBar();
            this.bindEvents();
        },

        createProgressBar: function() {
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
            
            // Add CSS
            const style = document.createElement('style');
            style.textContent = `
                .scroll-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: rgba(0, 0, 0, 0.1);
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .scroll-progress.visible {
                    opacity: 1;
                }
                
                .scroll-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                    width: 0%;
                    transition: width 0.1s ease;
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(progressBar);
            
            this.progressBar = progressBar;
            this.progressBarInner = progressBar.querySelector('.scroll-progress-bar');
        },

        bindEvents: function() {
            window.addEventListener('scroll', utils.throttle(() => {
                this.updateProgress();
            }, 16));
        },

        updateProgress: function() {
            const scrollTop = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = (scrollTop / documentHeight) * 100;
            
            this.progressBarInner.style.width = Math.min(scrollProgress, 100) + '%';
            
            // Show/hide progress bar
            if (scrollTop > 100) {
                this.progressBar.classList.add('visible');
            } else {
                this.progressBar.classList.remove('visible');
            }
        }
    };

    // =======================
    // Performance Optimization
    // =======================
    
    const performance = {
        init: function() {
            this.optimizeImages();
            this.prefetchLinks();
            this.enableGPUAcceleration();
        },

        optimizeImages: function() {
            // Add intersection observer for images
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.style.willChange = 'transform';
                            
                            setTimeout(() => {
                                img.style.willChange = 'auto';
                            }, 1000);
                        }
                    });
                });

                document.querySelectorAll('img').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },

        prefetchLinks: function() {
            // Prefetch important resources
            const linksToPrefetch = [
                'https://fonts.googleapis.com',
                'https://cdnjs.cloudflare.com'
            ];

            linksToPrefetch.forEach(url => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = url;
                document.head.appendChild(link);
            });
        },

        enableGPUAcceleration: function() {
            // Enable GPU acceleration for animations
            const animatedElements = document.querySelectorAll('.project-card, .skill-category, .nav-link');
            animatedElements.forEach(el => {
                el.style.transform = 'translateZ(0)';
            });
        }
    };

    // =======================
    // Accessibility Enhancements
    // =======================
    
    const accessibility = {
        init: function() {
            this.handleKeyboardNavigation();
            this.announcePageChanges();
            this.enhanceFocusManagement();
        },

        handleKeyboardNavigation: function() {
            // Skip links
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('using-keyboard');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('using-keyboard');
            });

            // Escape key to close mobile menu
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navigation.navMenu.classList.contains('active')) {
                    navigation.closeMobileMenu();
                    navigation.navToggle.focus();
                }
            });
        },

        announcePageChanges: function() {
            // Create live region for announcements
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            liveRegion.id = 'live-region';
            document.body.appendChild(liveRegion);
            
            this.liveRegion = liveRegion;
        },

        announce: function(message) {
            if (this.liveRegion) {
                this.liveRegion.textContent = message;
                
                // Clear after announcement
                setTimeout(() => {
                    this.liveRegion.textContent = '';
                }, 1000);
            }
        },

        enhanceFocusManagement: function() {
            // Trap focus in mobile menu when open
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && navigation.navMenu.classList.contains('active')) {
                    const focusable = navigation.navMenu.querySelectorAll(focusableElements);
                    const firstFocusable = focusable[0];
                    const lastFocusable = focusable[focusable.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            });
        }
    };

    // =======================
    // Initialization
    // =======================
    
    const app = {
        init: function() {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
        },

        initializeComponents: function() {
            try {
                // Initialize core components
                navigation.init();
                themeManager.init();
                scrollAnimations.init();
                projectFilter.init();
                formHandler.init();
                backToTop.init();
                lazyLoading.init();
                scrollProgress.init();
                accessibility.init();
                performance.init();

                // Add custom skill level animations
                this.initSkillAnimations();
                
                console.log('Portfolio website initialized successfully!');
                
            } catch (error) {
                console.error('Error initializing portfolio:', error);
            }
        },

        initSkillAnimations: function() {
            // Add CSS for skill level animations
            const skillStyle = document.createElement('style');
            skillStyle.textContent = `
                .skill-level::after {
                    transition: width 1.5s ease-out 0.5s;
                }
                .skill-level.animate::after {
                    width: var(--skill-width, 0%) !important;
                }
            `;
            document.head.appendChild(skillStyle);
        }
    };

    // =======================
    // Error Handling
    // =======================
    
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
    });

    // =======================
    // Start Application
    // =======================
    
    app.init();

})();
