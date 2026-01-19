/* ============================================
   Lindland Service & Maskin - Main JavaScript
   ============================================ */

(function() {
    'use strict';

    // DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initSmoothScroll();
        initContactForm();
        initScrollAnimations();
        initHeaderScroll();
    });

    /* ============================================
       Navigation
       ============================================ */
    function initNavigation() {
        const nav = document.querySelector('.nav');
        const navToggle = document.querySelector('.nav__toggle');
        const navLinks = document.querySelectorAll('.nav__link');

        if (!navToggle || !nav) return;

        // Toggle mobile menu
        navToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Toggle aria-expanded
            const isExpanded = nav.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking a link
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && nav.classList.contains('active')) {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Mark current page in navigation
        markCurrentPage();
    }

    function markCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav__link');

        navLinks.forEach(function(link) {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href) ||
                (currentPath.endsWith('/') && href === 'index.html') ||
                (currentPath.endsWith('/lindland-service-maskin/') && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    /* ============================================
       Smooth Scroll
       ============================================ */
    function initSmoothScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');

        anchors.forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ============================================
       Header Scroll Effect
       ============================================ */
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow when scrolled
            if (currentScroll > 10) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }

            lastScroll = currentScroll;
        });
    }

    /* ============================================
       Contact Form
       ============================================ */
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const formMessage = document.querySelector('.form-message');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate form
            if (!validateForm(form)) {
                return;
            }

            // Disable submit button and show loading state
            submitButton.disabled = true;
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner"></span> Sender...';

            // Collect form data
            const formData = {
                name: form.querySelector('#name').value.trim(),
                email: form.querySelector('#email').value.trim(),
                phone: form.querySelector('#phone').value.trim(),
                address: form.querySelector('#address')?.value.trim() || '',
                jobType: form.querySelector('#jobType').value,
                description: form.querySelector('#description').value.trim(),
                wantSiteVisit: form.querySelector('#siteVisit')?.checked || false,
                timestamp: new Date().toISOString()
            };

            try {
                // Simulate form submission (replace with actual API call)
                await simulateFormSubmission(formData);

                // Show success message
                showFormMessage('success', 'Takk for din henvendelse! Jeg vil kontakte deg så snart som mulig, vanligvis innen én arbeidsdag.');

                // Reset form
                form.reset();

            } catch (error) {
                // Show error message
                showFormMessage('error', 'Beklager, noe gikk galt. Vennligst prøv igjen eller ring meg direkte.');
                console.error('Form submission error:', error);
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                // Remove error state on input
                this.classList.remove('error');
                const errorEl = this.parentElement.querySelector('.field-error');
                if (errorEl) errorEl.remove();
            });
        });
    }

    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(function(field) {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        field.classList.remove('error');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();

        // Check required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Dette feltet er påkrevd';
        }

        // Check email format
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Vennligst oppgi en gyldig e-postadresse';
            }
        }

        // Check phone format (Norwegian)
        if (field.type === 'tel' && value) {
            const phoneRegex = /^(\+47)?[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/;
            const cleanPhone = value.replace(/[\s-]/g, '');
            if (cleanPhone.length < 8) {
                isValid = false;
                errorMessage = 'Vennligst oppgi et gyldig telefonnummer';
            }
        }

        // Show error if invalid
        if (!isValid) {
            field.classList.add('error');
            const errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.textContent = errorMessage;
            errorEl.style.cssText = 'color: #D32F2F; font-size: 0.875rem; display: block; margin-top: 0.25rem;';
            field.parentElement.appendChild(errorEl);
        }

        return isValid;
    }

    function showFormMessage(type, message) {
        const formMessage = document.querySelector('.form-message');
        if (!formMessage) return;

        formMessage.className = 'form-message form-message--' + type + ' show';
        formMessage.textContent = message;

        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-hide success message after 10 seconds
        if (type === 'success') {
            setTimeout(function() {
                formMessage.classList.remove('show');
            }, 10000);
        }
    }

    async function simulateFormSubmission(data) {
        // Simulate network delay
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                // Log data (in production, this would be sent to an API)
                console.log('Form data submitted:', data);

                // Simulate 90% success rate for testing
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated error'));
                }
            }, 1500);
        });
    }

    /* ============================================
       Resend API Integration (for production)
       ============================================ */
    async function sendFormViaResend(data) {
        // This function would be used in production with Resend API
        // Replace with your actual Resend API key and endpoint

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_RESEND_API_KEY',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'noreply@lindlandservice.no',
                to: 'post@lindlandservice.no',
                subject: `Ny henvendelse: ${data.jobType} - ${data.name}`,
                html: `
                    <h2>Ny henvendelse fra nettsiden</h2>
                    <p><strong>Navn:</strong> ${data.name}</p>
                    <p><strong>E-post:</strong> ${data.email}</p>
                    <p><strong>Telefon:</strong> ${data.phone}</p>
                    <p><strong>Adresse:</strong> ${data.address || 'Ikke oppgitt'}</p>
                    <p><strong>Type jobb:</strong> ${data.jobType}</p>
                    <p><strong>Ønsker befaring:</strong> ${data.wantSiteVisit ? 'Ja' : 'Nei'}</p>
                    <h3>Beskrivelse:</h3>
                    <p>${data.description}</p>
                    <hr>
                    <p><small>Sendt: ${new Date(data.timestamp).toLocaleString('nb-NO')}</small></p>
                `
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        return response.json();
    }

    /* ============================================
       Scroll Animations
       ============================================ */
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements
        const animatedElements = document.querySelectorAll(
            '.service-card, .value-card, .why-us__item, .service-detail, .projects-types__item'
        );

        animatedElements.forEach(function(el, index) {
            el.style.opacity = '0';
            el.classList.add('delay-' + ((index % 5) + 1));
            observer.observe(el);
        });
    }

    /* ============================================
       Utility Functions
       ============================================ */

    // Debounce function for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // Format phone number for display
    function formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 8) {
            return cleaned.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3');
        }
        return phone;
    }

    // Click to call tracking (for analytics)
    function trackPhoneClick() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Track in analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        'event_category': 'Contact',
                        'event_label': 'Phone Click',
                        'value': 1
                    });
                }
                console.log('Phone link clicked');
            });
        });
    }

    // Initialize phone tracking
    trackPhoneClick();

})();
