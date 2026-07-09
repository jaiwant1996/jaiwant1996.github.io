/* Jaiwant Bhushan — Portfolio interactions */

document.addEventListener('DOMContentLoaded', () => {

  const pointerFine = window.matchMedia('(pointer: fine)').matches;
  if (!pointerFine) document.body.classList.add('no-fine-pointer');

  /* ---------- Navbar scroll state ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  /* ---------- Nav scrollspy (active section indicator) ---------- */
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const spySections = document.querySelectorAll('section[id]');
  if (navAnchors.length && spySections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    spySections.forEach((sec) => spy.observe(sec));
  }

  /* ---------- Hero rotator (typewriter) ---------- */
  const phrases = [
    'turn banking chaos into KPIs.',
    'automate my way out of busywork.',
    'ship ideas.',
    'occasionally consult the stars.',
    'design better systems.',
    'solve messy problems.',
    'drink too much coffee.'
  ];
  const rotatorEl = document.getElementById('rotatorText');
  let pIndex = 0, cIndex = 0, deleting = false;

  function typeLoop() {
    const current = phrases[pIndex];
    if (!deleting) {
      cIndex++;
      rotatorEl.textContent = current.slice(0, cIndex);
      if (cIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    } else {
      cIndex--;
      rotatorEl.textContent = current.slice(0, cIndex);
      if (cIndex === 0) {
        deleting = false;
        pIndex = (pIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 35 : 55);
  }
  typeLoop();

  /* ---------- Animated stat counters (eased) ---------- */
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (window.gsap) {
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: target, duration: 1.3, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(proxy.val); }
      });
    } else {
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const tick = () => {
        current += step;
        if (current >= target) { el.textContent = target; return; }
        el.textContent = current;
        requestAnimationFrame(tick);
      };
      tick();
    }
  };

  /* ---------- Scroll reveal (single source of truth — no competing tweens) ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero: load-triggered entrance, not scroll-triggered (it's already in view)
    gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'transform' } })
      .to('.hero .reveal', { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 });

    // Section intros (everything else tagged .reveal, outside the hero)
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Cards / grids: batched + staggered so neighbouring tiles animate in one fluid wave
    ScrollTrigger.batch('.reveal-up', {
      start: 'top 87%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
          clearProps: 'transform',
          onComplete: () => {
            batch.forEach((el) => {
              const counter = el.querySelector && el.querySelector('.stat-num[data-count]');
              if (counter) animateCounter(counter);
            });
          }
        });
      }
    });
  } else {
    // Fallback: just show everything if GSAP fails to load
    document.querySelectorAll('.reveal, .reveal-up').forEach((el) => {
      el.style.opacity = 1; el.style.transform = 'none';
    });
    document.querySelectorAll('.stat-num[data-count]').forEach(animateCounter);
  }

  /* ---------- Starfield canvases ---------- */
  initStarfield('starfield', { density: 0.00018, color: '255,255,255' });
  initStarfield('astroCanvas', { density: 0.00028, color: '251,191,36', twinkle: true });

  function initStarfield(canvasId, opts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h;

    function resize() {
      const parent = canvas.parentElement;
      w = canvas.width = parent.offsetWidth;
      h = canvas.height = parent.offsetHeight;
      const count = Math.floor(w * h * opts.density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        s: Math.random() * 0.4 + 0.05,
        phase: Math.random() * Math.PI * 2
      }));
    }

    let t = 0;
    function draw() {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      stars.forEach((star) => {
        const twinkle = opts.twinkle ? (Math.sin(t + star.phase) * 0.4 + 0.6) : 1;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${opts.color}, ${0.55 * twinkle})`;
        ctx.fill();
        star.y += star.s;
        if (star.y > h) { star.y = 0; star.x = Math.random() * w; }
      });
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  /* ---------- Eyebrow text-scramble intro ---------- */
  const scrambleEl = document.getElementById('eyebrowScramble');
  if (scrambleEl) {
    const finalText = scrambleEl.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·✦';
    let frame = 0;
    const totalFrames = 24;
    const scrambleTick = () => {
      frame++;
      const progress = frame / totalFrames;
      const revealCount = Math.floor(finalText.length * progress);
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') { out += ' '; continue; }
        out += i < revealCount ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
      }
      scrambleEl.textContent = out;
      if (frame < totalFrames) requestAnimationFrame(scrambleTick);
      else scrambleEl.textContent = finalText;
    };
    setTimeout(() => requestAnimationFrame(scrambleTick), 300);
  }

  /* ================================================================
     Fluid pointer interactions: tilt, magnetic buttons, cursor glow.
     All driven by a SINGLE shared requestAnimationFrame loop using
     lerp-smoothing, and only active once the user actually moves the
     pointer over an element — this avoids fighting with the GSAP
     scroll-reveal tweens (which fully release the transform via
     clearProps once they finish).
     ================================================================ */
  if (pointerFine) {

    // --- Cursor glow (smooth trailing) ---
    const glow = document.getElementById('cursorGlow');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let glowX = mouseX, glowY = mouseY;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    // --- Tilt cards ---
    const tiltStates = Array.from(document.querySelectorAll('.tilt')).map((el) => ({
      el, targetRX: 0, targetRY: 0, targetLift: 0,
      curRX: 0, curRY: 0, curLift: 0
    }));
    tiltStates.forEach((s) => {
      s.el.addEventListener('mousemove', (e) => {
        const b = s.el.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width;
        const py = (e.clientY - b.top) / b.height;
        s.targetRY = (px - 0.5) * 9;
        s.targetRX = (0.5 - py) * 9;
        s.targetLift = -7;
      });
      s.el.addEventListener('mouseleave', () => {
        s.targetRX = 0; s.targetRY = 0; s.targetLift = 0;
      });
    });

    // --- Magnetic buttons ---
    const magnetStates = Array.from(document.querySelectorAll('.magnetic')).map((el) => ({
      el, targetX: 0, targetY: 0, curX: 0, curY: 0
    }));
    magnetStates.forEach((s) => {
      s.el.addEventListener('mousemove', (e) => {
        const b = s.el.getBoundingClientRect();
        s.targetX = (e.clientX - b.left - b.width / 2) * 0.3;
        s.targetY = (e.clientY - b.top - b.height / 2) * 0.3;
      });
      s.el.addEventListener('mouseleave', () => { s.targetX = 0; s.targetY = 0; });
    });

    const LERP = 0.16;
    function raf() {
      if (glow) {
        glowX += (mouseX - glowX) * 0.14;
        glowY += (mouseY - glowY) * 0.14;
        glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      }

      tiltStates.forEach((s) => {
        s.curRX += (s.targetRX - s.curRX) * LERP;
        s.curRY += (s.targetRY - s.curRY) * LERP;
        s.curLift += (s.targetLift - s.curLift) * LERP;
        const settled = Math.abs(s.curRX) < 0.02 && Math.abs(s.curRY) < 0.02 && Math.abs(s.curLift) < 0.05
          && s.targetRX === 0 && s.targetRY === 0 && s.targetLift === 0;
        if (settled) {
          if (s.el.style.transform) s.el.style.transform = '';
        } else {
          s.el.style.transform = `perspective(800px) rotateX(${s.curRX.toFixed(2)}deg) rotateY(${s.curRY.toFixed(2)}deg) translateY(${s.curLift.toFixed(2)}px)`;
        }
      });

      magnetStates.forEach((s) => {
        s.curX += (s.targetX - s.curX) * LERP;
        s.curY += (s.targetY - s.curY) * LERP;
        const settled = Math.abs(s.curX) < 0.05 && Math.abs(s.curY) < 0.05 && s.targetX === 0 && s.targetY === 0;
        if (settled) {
          if (s.el.style.transform) s.el.style.transform = '';
        } else {
          s.el.style.transform = `translate(${s.curX.toFixed(2)}px, ${s.curY.toFixed(2)}px)`;
        }
      });

      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } else {
    const glow = document.getElementById('cursorGlow');
    if (glow) glow.style.display = 'none';
  }

  /* ---------- Button ripple ---------- */
  document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------- Sparkle burst on astro WhatsApp click ---------- */
  const astroBtn = document.getElementById('astroBtn');
  if (astroBtn) {
    astroBtn.addEventListener('click', (e) => {
      const originX = e.clientX, originY = e.clientY;
      const colors = ['#fbbf24', '#f97316', '#fde68a'];
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('span');
        p.className = 'sparkle-particle';
        const size = Math.random() * 6 + 3;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = originX + 'px';
        p.style.top = originY + 'px';
        p.style.background = `radial-gradient(circle, ${colors[i % colors.length]}, transparent 70%)`;
        document.body.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 90 + 40;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        if (window.gsap) {
          gsap.to(p, {
            x: dx, y: dy, opacity: 0, scale: 0.2, duration: 0.7 + Math.random() * 0.4,
            ease: 'power2.out', onComplete: () => p.remove()
          });
        } else {
          p.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
          requestAnimationFrame(() => {
            p.style.transform = `translate(${dx}px, ${dy}px)`;
            p.style.opacity = '0';
          });
          setTimeout(() => p.remove(), 850);
        }
      }
    });
  }

  /* ---------- Timeline scroll-progress draw ---------- */
  const timelineProgress = document.getElementById('timelineProgress');
  if (timelineProgress && window.gsap && window.ScrollTrigger) {
    const timelineEl = document.querySelector('.timeline');
    gsap.to(timelineProgress, {
      height: '100%', ease: 'none',
      scrollTrigger: {
        trigger: timelineEl, start: 'top 70%', end: 'bottom 60%', scrub: 0.6
      }
    });
  }

});
