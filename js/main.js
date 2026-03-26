// ============================================================
// NEOPULSION — Main JS
// ============================================================

(function () {
  'use strict';

  // ── NAV SCROLL ──────────────────────────────────────────────
  const header = document.querySelector('header');

  function updateNav() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── HAMBURGER MOBILE ────────────────────────────────────────
  const burgerBtn  = document.getElementById('burger-btn');
  const mobileNav  = document.getElementById('mobile-nav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      burgerBtn.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      burgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !burgerBtn.contains(e.target)
      ) {
        mobileNav.classList.remove('open');
        burgerBtn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close mobile nav links on click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        burgerBtn.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── DROPDOWN MENU ───────────────────────────────────────────
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(function (dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen);

        // Close other dropdowns
        dropdowns.forEach(function (other) {
          if (other !== dropdown) {
            other.classList.remove('open');
            const t = other.querySelector('.nav-dropdown-trigger');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function () {
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove('open');
    });
  });

  // ── ACTIVE PAGE NAV LINK ────────────────────────────────────
  (function setActiveLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop();
      if (linkPage === path || (path === '' && linkPage === 'index.html')) {
        link.classList.add('active');
      }
    });
  })();

  // ── SCROLL REVEAL ───────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ── COUNTER ANIMATION ───────────────────────────────────────
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const isDecimal = String(target).includes('.');
    const duration = 1800;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(function () {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      current = target * eased;

      if (isDecimal) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.round(current).toLocaleString('fr-FR') + suffix;
      }

      if (step >= steps) {
        clearInterval(timer);
        if (isDecimal) {
          el.textContent = prefix + target.toFixed(1) + suffix;
        } else {
          el.textContent = prefix + target.toLocaleString('fr-FR') + suffix;
        }
      }
    }, stepDuration);
  }

  const counterEls = document.querySelectorAll('[data-counter]');

  if (counterEls.length) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterEls.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ── MARQUEE CLONE ───────────────────────────────────────────
  const marqueeTracks = document.querySelectorAll('.marquee-track');

  marqueeTracks.forEach(function (track) {
    if (!track.dataset.cloned) {
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentNode.appendChild(clone);
      track.dataset.cloned = 'true';
    }
  });

  // ── SMOOTH SCROLL FOR ANCHORS ────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  // ── BLOG FILTER BUTTONS ─────────────────────────────────────
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  const blogCards  = document.querySelectorAll('.blog-card[data-cat]');

  if (filterBtns.length && blogCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter') || 'all';

        blogCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-cat') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ── SCROLL PROGRESS BAR ────────────────────────────────────
  var progressBar = document.getElementById('scroll-progress');

  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // ── BACK TO TOP ───────────────────────────────────────────
  var backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── MOBILE BOTTOM BAR ─────────────────────────────────────
  var mobileBar = document.getElementById('mobile-bottom-bar');

  if (mobileBar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        mobileBar.classList.add('visible');
      } else {
        mobileBar.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ── TESTIMONIAL CAROUSEL ──────────────────────────────────
  var carousel = document.getElementById('testimonial-carousel');

  if (carousel) {
    var slides = carousel.querySelectorAll('.testimonial-slide');
    var dots = carousel.querySelectorAll('.carousel-dot');
    var currentSlide = 0;
    var autoplayInterval;

    function goToSlide(idx) {
      slides.forEach(function (s) { s.classList.remove('active'); });
      dots.forEach(function (d) { d.classList.remove('active'); });
      slides[idx].classList.add('active');
      dots[idx].classList.add('active');
      currentSlide = idx;
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % slides.length);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToSlide(parseInt(this.getAttribute('data-slide')));
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextSlide, 5000);
      });
    });

    autoplayInterval = setInterval(nextSlide, 5000);
  }

  // ── METHODOLOGY TABS ───────────────────────────────────────
  const tabBtns   = document.querySelectorAll('.method-tab-btn');
  const tabPanels = document.querySelectorAll('.method-tab-panel');

  if (tabBtns.length && tabPanels.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = this.getAttribute('data-tab');

        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        tabPanels.forEach(function (p) { p.classList.remove('active'); });

        this.classList.add('active');
        var panel = document.querySelector('.method-tab-panel[data-panel="' + idx + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ── FLOATING CTA ──────────────────────────────────────────
  var floatingCta = document.getElementById('floating-cta');

  if (floatingCta) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ── ACCORDION ───────────────────────────────────────────────
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = this.closest('.accordion-item');
      if (item) {
        item.classList.toggle('open');
      }
    });
  });

  // ── ALPHA NAV HIGHLIGHT (glossaire) ─────────────────────────
  const alphaLinks = document.querySelectorAll('.alpha-nav a');
  const glossaireSections = document.querySelectorAll('.glossaire-section[id]');

  if (alphaLinks.length && glossaireSections.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            alphaLinks.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    glossaireSections.forEach(function (s) { sectionObserver.observe(s); });
  }

})();
