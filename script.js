document.addEventListener('DOMContentLoaded', () => {

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    const navBackdrop = document.getElementById('nav-backdrop');

    function setNavOpen(open) {
        navLinks.classList.toggle('active', open);
        if (navBackdrop) navBackdrop.classList.toggle('active', open);
        const spans = mobileToggle.querySelectorAll('span');
        if (open) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    }

    mobileToggle.addEventListener('click', () => {
        setNavOpen(!navLinks.classList.contains('active'));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setNavOpen(false));
    });

    if (navBackdrop) {
        navBackdrop.addEventListener('click', () => setNavOpen(false));
    }

    // Service Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById('panel-' + tab).classList.add('active');
        });
    });

    // Accordion
    document.querySelectorAll('.accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');

            item.parentElement.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Animated counters
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                if (target >= 1000) {
                    counter.textContent = current.toLocaleString();
                } else {
                    counter.textContent = current;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        });
    }

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = Array.from(entry.target.parentElement.children)
                    .indexOf(entry.target) * 120;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

    // Counter animation trigger
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                statsObserver.unobserve(statsSection);
            }
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Contact form — submits via Formsubmit.co (emails go to Benny@gutmansinsurance.com)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(contactForm);
            const payload = {};
            formData.forEach((value, key) => { payload[key] = value; });

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    document.getElementById('success-modal').classList.add('active');
                    contactForm.reset();
                } else {
                    fallbackMailto(formData);
                }
            } catch (err) {
                fallbackMailto(formData);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    function fallbackMailto(formData) {
        const name = (formData.get('name') || '').trim();
        const email = (formData.get('email') || '').trim();
        const company = (formData.get('company') || '').trim();
        const message = (formData.get('message') || '').trim();
        const subject = encodeURIComponent('New Inquiry from ' + name + (company ? ' at ' + company : ''));
        const body = encodeURIComponent(
            'Name: ' + name + '\n' +
            'Email: ' + email + '\n' +
            (company ? 'Company: ' + company + '\n' : '') +
            '\nMessage:\n' + message
        );
        window.location.href = 'mailto:Benny@gutmansinsurance.com?subject=' + subject + '&body=' + body;
        document.getElementById('success-modal').classList.add('active');
    }
});

function closeModal() {
    document.getElementById('success-modal').classList.remove('active');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
