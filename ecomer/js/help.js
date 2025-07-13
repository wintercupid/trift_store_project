// help.js - Comprehensive Help Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // Smooth Scrolling
    // ======================
    const handleSmoothScroll = (event) => {
        // Check if link is an anchor
        if (event.target.hash && event.target.hash.startsWith('#')) {
            event.preventDefault();
            const targetId = event.target.hash;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Update URL without page jump
                history.pushState(null, null, targetId);
                
                // Scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav pill
                updateActiveNavPill(targetId);
            }
        }
    };

    // Add event listeners to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

    // ======================
    // Active Nav Pill Highlighting
    // ======================
    const updateActiveNavPill = (targetId) => {
        document.querySelectorAll('.nav-pills .nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });
    };

    // Update on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.help-section');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (pageYOffset >= sectionTop) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        updateActiveNavPill(currentSection);
    });

    // ======================
    // Contact Form Handling
    // ======================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Form validation
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            
            if (!name || !email || !message) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            showAlert('Thank you for your message! We will respond within 24 hours.', 'success');
            contactForm.reset();
            
            // In a real app, you would send the form data to your server here
            // const formData = new FormData(contactForm);
            // fetch('/submit-contact-form', { method: 'POST', body: formData })
            //     .then(response => response.json())
            //     .then(data => showAlert(data.message, data.status))
            //     .catch(error => showAlert('An error occurred. Please try again.', 'error'));
        });
    }

    // ======================
    // Utility Functions
    // ======================
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const showAlert = (message, type = 'success') => {
        const alertBox = document.createElement('div');
        alertBox.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alertBox.setAttribute('role', 'alert');
        alertBox.style.position = 'fixed';
        alertBox.style.top = '20px';
        alertBox.style.right = '20px';
        alertBox.style.zIndex = '1100';
        alertBox.style.maxWidth = '400px';
        
        alertBox.innerHTML = `
            <strong>${type === 'success' ? 'Success!' : 'Error!'}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertBox);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertBox);
            bsAlert.close();
        }, 5000);
    };

    // ======================
    // FAQ Accordion Enhancements
    // ======================
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion-button');
        const collapse = item.querySelector('.accordion-collapse');
        
        button.addEventListener('click', () => {
            // Add slight delay for smooth animation
            setTimeout(() => {
                if (collapse.classList.contains('show')) {
                    button.innerHTML = button.innerHTML.replace('fa-chevron-down', 'fa-chevron-right');
                } else {
                    button.innerHTML = button.innerHTML.replace('fa-chevron-right', 'fa-chevron-down');
                }
            }, 100);
        });
    });

    // ======================
    // Initialize Tooltips
    // ======================
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // ======================
    // Print Page Functionality
    // ======================
    const printButton = document.getElementById('printHelp');
    if (printButton) {
        printButton.addEventListener('click', () => {
            window.print();
        });
    }
});

// Replace the form submission handler with:
contactForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            })
        });
        
        const data = await response.json();
        showAlert(data.message, data.success ? 'success' : 'error');
        
        if (data.success) {
            contactForm.reset();
        }
    } catch (error) {
        showAlert('Failed to send message. Please try again later.', 'error');
    }
});

// Add search functionality for FAQs
const faqSearch = document.getElementById('faqSearch');
if (faqSearch) {
    faqSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        document.querySelectorAll('.accordion-item').forEach(item => {
            const question = item.querySelector('.accordion-button').textContent.toLowerCase();
            const answer = item.querySelector('.accordion-body').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                item.querySelector('.accordion-button').classList.add('bg-warning', 'bg-opacity-10');
            } else {
                item.style.display = 'none';
                item.querySelector('.accordion-button').classList.remove('bg-warning', 'bg-opacity-10');
            }
        });
    });
}