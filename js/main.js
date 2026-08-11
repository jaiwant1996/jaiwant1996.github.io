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
  // Track whatever the nav actually links to (sections + the #sendMessage div), not just <section> tags
  const spySections = Array.from(navAnchors)
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
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
    'ship code while you\'re still in standup.',
    'solve problems nobody assigned me.'
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

  /* ---------- Starfield canvas ---------- */
  initStarfield('starfield', { density: 0.00018, color: '255,255,255' });

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

  /* ---------- Sparkle burst helper (reused by the Konami easter egg) ---------- */
  function sparkleBurst(originX, originY, colors) {
    colors = colors || ['#8b5cf6', '#ec4899', '#22d3ee'];
    for (let i = 0; i < 24; i++) {
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
      const distance = Math.random() * 130 + 50;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      if (window.gsap) {
        gsap.to(p, {
          x: dx, y: dy, opacity: 0, scale: 0.2, duration: 0.7 + Math.random() * 0.5,
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
  }

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg, duration) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration || 2600);
  }

  /* ---------- Scroll progress bar ---------- */
  const scrollProgressEl = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!scrollProgressEl) return;
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    scrollProgressEl.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ---------- Time-based dynamic greeting ---------- */
  const greetingEl = document.getElementById('liveGreeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    let msg;
    if (hour < 5) msg = "Up late? Same. Automating something, probably.";
    else if (hour < 12) msg = 'Good morning — hope your KPIs are behaving.';
    else if (hour < 17) msg = 'Good afternoon. Somewhere, a spreadsheet needs saving.';
    else if (hour < 21) msg = 'Good evening — perfect time to hire a consultant.';
    else msg = "Still awake? I automate at this hour too.";
    greetingEl.innerHTML = `<span class="dot"></span>${msg}`;
  }

  /* ---------- Copy email button ---------- */
  const copyBtn = document.getElementById('copyEmailBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const value = copyBtn.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(value);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = value; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove();
      }
      const original = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied';
      copyBtn.classList.add('copied');
      showToast('Email copied to clipboard.');
      setTimeout(() => { copyBtn.textContent = original; copyBtn.classList.remove('copied'); }, 1800);
    });
  }

  /* ---------- Live GitHub stats ---------- */
  const githubStatsEl = document.getElementById('githubStats');
  if (githubStatsEl) {
    fetch('https://api.github.com/users/jaiwant1996')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const repos = data.public_repos ?? '—';
        githubStatsEl.textContent = `${repos} public repos and counting. Probably automating one right now.`;
      })
      .catch(() => {
        githubStatsEl.textContent = 'Live stats took a coffee break — check the profile directly.';
      });
  }

  /* ================================================================
     Command palette (⌘K / Ctrl+K) — jump around the site or trigger
     a few quick actions. Pure vanilla JS, no dependencies.
     ================================================================ */
  (function initCommandPalette() {
    const overlay = document.getElementById('cmdkOverlay');
    const input = document.getElementById('cmdkInput');
    const list = document.getElementById('cmdkList');
    const trigger = document.getElementById('cmdkTrigger');
    if (!overlay || !input || !list) return;

    const commands = [
      { icon: '👋', label: 'Go to About', hint: 'section', action: () => scrollToId('about') },
      { icon: '⚙️', label: 'Go to Skills', hint: 'section', action: () => scrollToId('skills') },
      { icon: '💼', label: 'Go to Experience', hint: 'section', action: () => scrollToId('work') },
      { icon: '🎸', label: 'Go to Beyond the Spreadsheets', hint: 'section', action: () => scrollToId('Beyond') },
      { icon: '✉️', label: 'Go to Contact', hint: 'section', action: () => scrollToId('contact') },
      { icon: '📝', label: 'Send a Message', hint: 'section', action: () => scrollToId('sendMessage') },
      { icon: '📋', label: 'Copy Email Address', hint: 'action', action: () => copyBtn && copyBtn.click() },
      { icon: '📧', label: 'Email Me Directly', hint: 'mailto', action: () => { window.location.href = 'mailto:jaiwant96@gmail.com'; } },
      { icon: '🐙', label: 'Open GitHub Profile', hint: '↗ new tab', action: () => window.open('https://github.com/jaiwant1996/', '_blank') },
      { icon: '💼', label: 'Open LinkedIn Profile', hint: '↗ new tab', action: () => window.open('https://www.linkedin.com/in/jaiwant/', '_blank') },
      { icon: '🎵', label: 'Open SoundCloud', hint: '↗ new tab', action: () => window.open('https://soundcloud.com/jaiwant96', '_blank') },
      { icon: '⬆️', label: 'Back to Top', hint: 'nav', action: () => scrollToId('top') }
    ];

    function scrollToId(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    let filtered = commands.slice();
    let activeIndex = 0;

    function render() {
      list.innerHTML = '';
      if (!filtered.length) {
        list.innerHTML = '<li class="cmdk-empty">No matches. Try something else.</li>';
        return;
      }
      filtered.forEach((cmd, i) => {
        const li = document.createElement('li');
        li.className = 'cmdk-item' + (i === activeIndex ? ' active' : '');
        li.innerHTML = `<span class="cmdk-item-icon">${cmd.icon}</span><span>${cmd.label}</span><span class="cmdk-item-hint">${cmd.hint}</span>`;
        li.addEventListener('click', () => runCommand(cmd));
        list.appendChild(li);
      });
    }

    function runCommand(cmd) {
      closePalette();
      setTimeout(() => cmd.action(), 120);
    }

    function filterCommands(query) {
      const q = query.trim().toLowerCase();
      filtered = !q ? commands.slice() : commands.filter((c) => c.label.toLowerCase().includes(q));
      activeIndex = 0;
      render();
    }

    function openPalette() {
      overlay.classList.add('open');
      input.value = '';
      filterCommands('');
      setTimeout(() => input.focus(), 30);
    }

    function closePalette() {
      overlay.classList.remove('open');
    }

    if (trigger) trigger.addEventListener('click', openPalette);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePalette(); });

    input.addEventListener('input', () => filterCommands(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closePalette(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
      if (e.key === 'Enter' && filtered[activeIndex]) { e.preventDefault(); runCommand(filtered[activeIndex]); }
    });

    window.addEventListener('keydown', (e) => {
      const isK = e.key === 'k' || e.key === 'K';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        overlay.classList.contains('open') ? closePalette() : openPalette();
      } else if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closePalette();
      }
    });
  })();

  /* ================================================================
     Konami code easter egg: ↑ ↑ ↓ ↓ ← → ← → B A
     ================================================================ */
  (function initKonami() {
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let progress = 0;
    window.addEventListener('keydown', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === sequence[progress] ? progress + 1 : (key === sequence[0] ? 1 : 0);
      if (progress === sequence.length) {
        progress = 0;
        sparkleBurst(window.innerWidth / 2, window.innerHeight / 2);
        showToast('Cheat code accepted. Automation level: over 9000.', 3200);
        const heroGroup = window.__hero3dGroup;
        if (heroGroup && window.gsap) {
          gsap.to(heroGroup.rotation, { y: heroGroup.rotation.y + Math.PI * 4, duration: 1.6, ease: 'power3.inOut' });
        }
      }
    });
  })();

  /* ---------- Console easter egg ---------- */
  console.log(
    '%c👋 Poking around the console? I like that.',
    'font-family: monospace; font-size: 14px; color: #8b5cf6; font-weight: bold;'
  );
  console.log(
    '%cLet\'s talk: jaiwant96@gmail.com — or just press ⌘K / Ctrl+K on this site.',
    'font-family: monospace; font-size: 12px; color: #cbc4de;'
  );

  /* ---------- Send-a-message form (web3forms, AJAX) ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const statusEl = document.getElementById('formStatus');
    const submitBtn = contactForm.querySelector('.submit-btn');
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) { statusEl.textContent = 'Sending…'; statusEl.className = 'form-status'; }

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success !== false) {
          if (statusEl) { statusEl.textContent = "Message sent — I'll get back to you soon."; statusEl.className = 'form-status success'; }
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Something went wrong.');
        }
      } catch (err) {
        if (statusEl) { statusEl.textContent = "Couldn't send that — try emailing me directly instead."; statusEl.className = 'form-status error'; }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /* ================================================================
     3D hero visual — layered wireframe network sphere (Three.js).
     Idle rotation + mouse parallax + click pulse. Fully optional:
     if Three.js failed to load, WebGL is unavailable, or the canvas
     is hidden (small screens), this quietly does nothing — it never
     throws, so it can't break the rest of the page's interactivity.
     ================================================================ */
  initHero3D();

  function initHero3D() {
    const canvas = document.getElementById('hero3d');
    if (!canvas || !window.THREE) return;
    if (window.getComputedStyle(canvas).display === 'none') return;

    try {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 7;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const group = new THREE.Group();

      const outerGeo = new THREE.IcosahedronGeometry(2.3, 1);
      const outerLines = new THREE.LineSegments(
        new THREE.EdgesGeometry(outerGeo),
        new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.55 })
      );

      const innerGeo = new THREE.IcosahedronGeometry(1.45, 1);
      const innerLines = new THREE.LineSegments(
        new THREE.EdgesGeometry(innerGeo),
        new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45 })
      );

      const nodesGeo = new THREE.BufferGeometry();
      nodesGeo.setAttribute('position', outerGeo.getAttribute('position').clone());
      const nodes = new THREE.Points(
        nodesGeo,
        new THREE.PointsMaterial({ color: 0xec4899, size: 0.085, transparent: true, opacity: 0.9 })
      );

      group.add(outerLines, innerLines, nodes);
      scene.add(group);
      window.__hero3dGroup = group;

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(rect.width, 1), h = Math.max(rect.height, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener('resize', resize);

      let targetPX = 0, targetPY = 0, curPX = 0, curPY = 0;
      window.addEventListener('mousemove', (e) => {
        targetPX = (e.clientX / window.innerWidth - 0.5) * 1.3;
        targetPY = (e.clientY / window.innerHeight - 0.5) * 1.3;
      });

      // Click anywhere in the hero: a small reactive "pulse"
      const heroEl = canvas.closest('.hero');
      if (heroEl) {
        heroEl.addEventListener('click', () => {
          if (window.gsap) {
            gsap.fromTo(group.scale, { x: 1, y: 1, z: 1 }, { x: 1.12, y: 1.12, z: 1.12, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 });
          }
        });
      }

      function animate() {
        requestAnimationFrame(animate);
        if (!reducedMotion) {
          group.rotation.y += 0.0018;
          innerLines.rotation.y -= 0.0026;
          outerLines.rotation.x += 0.0006;
        }
        curPX += (targetPX - curPX) * 0.04;
        curPY += (targetPY - curPY) * 0.04;
        camera.position.x = curPX * 1.1;
        camera.position.y = -curPY * 1.1;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      }
      animate();

      // Fade in once the first frame is ready
      requestAnimationFrame(() => canvas.classList.add('is-ready'));
    } catch (err) {
      // WebGL unsupported or blocked — fail silently, rest of the page is unaffected
    }
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
