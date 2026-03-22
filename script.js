document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scroll Restoration & Memory ---
    // If we're on the home page, check if we need to restore scroll position
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    
    if (isHomePage) {
        const savedScroll = sessionStorage.getItem('homeScrollPos');
        if (savedScroll) {
            // Use setTimeout to ensure the page has rendered enough content to scroll
            setTimeout(() => {
                window.scrollTo({
                    top: parseInt(savedScroll),
                    behavior: 'instant'
                });
            }, 50);
        }
    }

    // --- Smooth Anchor Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                // Offset calculation for fixed navbar
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // --- Mouse Point (Dot) Logic ---
    const cursorDot = document.querySelector('.cursor-dot');
    
    if (cursorDot && window.matchMedia("(hover: hover)").matches) {
        let mouseX = 0, mouseY = 0;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            requestAnimationFrame(() => {
                cursorDot.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
            });
        }, { passive: true });

        const hoverElements = document.querySelectorAll('a, button, .glass-card, .service-card, .portfolio-item');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursorDot.classList.add('hover'), { passive: true });
            el.addEventListener('mouseleave', () => cursorDot.classList.remove('hover'), { passive: true });
        });
    }

    // --- Theme Toggling ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme');
    
    // Default to 'light' even if system prefers dark, unless user manually saved 'dark' previously
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
    }
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-links a');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    revealElements.forEach(el => revealOnScroll.observe(el));

    // --- FIXED: Single Optimized Scroll Listener (duplicate removed) ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a:not(.btn)');
    
    let sectionData = [];
    const updateSectionCache = () => {
        sectionData = Array.from(sections).map(section => ({
            id: section.getAttribute('id'),
            top: section.offsetTop,
            height: section.clientHeight
        }));
    };
    
    updateSectionCache();
    window.addEventListener('resize', updateSectionCache, { passive: true });

    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                
                // Navbar scroll effect
                navbar.classList.toggle('scrolled', scrollY > 50);

                // Active link highlighting
                let current = '';
                sectionData.forEach(section => {
                    if (scrollY >= (section.top - navbar.offsetHeight - 100)) {
                        current = section.id;
                    }
                });

                navItems.forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href').substring(1) === current) {
                        a.classList.add('active');
                    }
                });
                
                isScrolling = false;
            });
            isScrolling = true;

            // Save scroll position for restoration if we're on home page
            if (isHomePage) {
                sessionStorage.setItem('homeScrollPos', window.pageYOffset);
            }
        }
    }, { passive: true });

    // --- Form Handling ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // Submit to FormSubmit (Primary Display Logic)
                const response = await fetch('https://formsubmit.co/ajax/fawazdigitalmarketer@gmail.com', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                // Submit to Google Sheets (Secondary background save)
                const googleSheetsURL = 'https://script.google.com/macros/s/AKfycbxkDIZbjbeVH-ygLtmPJBVvHwHyfhHRis9JPQKxurUAN8xfhOQFVrlums-bvU4jtEPh/exec';
                fetch(googleSheetsURL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                }).catch(err => console.error('Google Sheets backup error:', err));

                const result = await response.json();

                if (result.success === 'true' || result.success === true) {
                    formStatus.innerHTML = '<span style="color: #10b981;"><i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully. I will get back to you soon.</span>';
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                formStatus.innerHTML = '<span style="color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Error sending message. Please try again or email directly.</span>';
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
                setTimeout(() => { formStatus.innerHTML = ''; }, 5000);
            }
        });
    }
});
