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
    var target = parseFloat(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var isDecimal = String(target).includes('.');
    var duration = 2000;
    var start = performance.now();

    function update(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
      var current = target * eased;

      if (isDecimal) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.round(current).toLocaleString('fr-FR') + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = isDecimal ? prefix + target.toFixed(1) + suffix : prefix + target.toLocaleString('fr-FR') + suffix;
      }
    }
    requestAnimationFrame(update);
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

  // ── HERO PARALLAX ──────────────────────────────────────────
  var heroOrb = document.querySelector('.hero-orb');
  if (heroOrb) {
    document.addEventListener('mousemove', function(e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 30;
      var y = (e.clientY / window.innerHeight - 0.5) * 30;
      heroOrb.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
    });
  }

  // ── SPLIT HERO HOVER & PARALLAX ──────────────────────────
  var splitHero = document.querySelector('.split-hero');

  if (splitHero) {
    var splitPanels = splitHero.querySelectorAll('.split-panel');
    var splitOrbs = splitHero.querySelectorAll('.split-panel-orb');

    // Hover expand/contract — desktop only
    splitPanels.forEach(function(panel) {
      panel.addEventListener('mouseenter', function() {
        if (window.innerWidth <= 768) return;
        splitPanels.forEach(function(p) {
          if (p === panel) {
            p.classList.add('expanded');
            p.classList.remove('contracted');
          } else {
            p.classList.add('contracted');
            p.classList.remove('expanded');
          }
        });
      });
    });

    splitHero.addEventListener('mouseleave', function() {
      splitPanels.forEach(function(p) {
        p.classList.remove('expanded', 'contracted');
      });
    });

    // Orb + starfield parallax on split panels
    var starLayers = [
      { el: splitHero.querySelector('.hero-stars'),     factor: 8 },
      { el: splitHero.querySelector('.hero-stars-mid'), factor: 14 },
      { el: splitHero.querySelector('.hero-stars-far'), factor: 4 },
      { el: splitHero.querySelector('.hero-nebula'),    factor: 6 }
    ].filter(function(l) { return l.el; });

    splitHero.addEventListener('mousemove', function(e) {
      if (window.innerWidth <= 768) return;
      var cx = (e.clientX / window.innerWidth - 0.5);
      var cy = (e.clientY / window.innerHeight - 0.5);

      // Orb parallax
      splitOrbs.forEach(function(orb) {
        var rect = orb.closest('.split-panel').getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
        var y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
        orb.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
      });

      // Starfield depth parallax
      starLayers.forEach(function(layer) {
        var tx = cx * layer.factor;
        var ty = cy * layer.factor;
        layer.el.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
      });
    });
  }

  // ── CARD TILT ─────────────────────────────────────────────
  var tiltCards = document.querySelectorAll('.bento-card, .pain-card, .method-tab-panel');
  tiltCards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / centerY * -4;
      var rotateY = (x - centerX) / centerX * 4;
      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(function() { card.style.transition = ''; }, 500);
    });
  });

  // ── STAGGER CHILDREN ──────────────────────────────────────
  document.querySelectorAll('.stagger-children').forEach(function(parent) {
    var children = parent.children;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          Array.from(children).forEach(function(child, i) {
            child.style.opacity = '0';
            child.style.transform = 'translateY(20px)';
            child.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.1) + 's, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.1) + 's';
            setTimeout(function() {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, 50);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    observer.observe(parent);
  });

  // ── HERO CURSOR BLINK ─────────────────────────────────────
  var heroEm = document.querySelector('.hero-title em');
  if (heroEm) {
    heroEm.style.borderRight = '2px solid rgba(165,180,252,0.6)';
    heroEm.style.paddingRight = '4px';
    setTimeout(function() {
      heroEm.style.transition = 'border-color 0.3s ease';
      var blinkInterval = setInterval(function() {
        heroEm.style.borderColor = heroEm.style.borderColor === 'transparent' ? 'rgba(165,180,252,0.6)' : 'transparent';
      }, 600);
      // Stop blinking after 4 seconds
      setTimeout(function() {
        clearInterval(blinkInterval);
        heroEm.style.borderColor = 'transparent';
        heroEm.style.borderRight = 'none';
        heroEm.style.paddingRight = '0';
      }, 4000);
    }, 1500);
  }

})();
