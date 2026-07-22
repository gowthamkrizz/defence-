// Core UX, animations, and interactive layers for the Defence Industry website

document.addEventListener('DOMContentLoaded', () => {
  // Global Variables
  let droneInstance = null;
  let customCursor, cursorFollower;
  
  // Custom Cursor Initialization
  initCustomCursor();
  
  // Preloader Logic
  initPreloader();
  
  // Initialize Smooth Scrolling (Lenis)
  initSmoothScroll();
  
  // Initialize Global Elements (Navbar, Magnetic buttons, etc.)
  initGlobalUX();
  
  // Setup Scroll & Hover Animations (GSAP)
  initGsapAnimations();

  // Canvas Graphics (Section 4 & Section 7)
  initTechEcosystemCanvas();
  initCommandCenterTelemetry();
  
  // Interactive Map animations (Section 8)
  initGlobalOpsMap();

  // Mobile Navigation Hamburger Overlay
  initMobileNavigation();

  // Page transition handler
  initPageTransitions();
});

/* =========================================================================
   CUSTOM CURSOR
   ========================================================================= */
function initCustomCursor() {
  customCursor = document.createElement('div');
  customCursor.className = 'custom-cursor';
  document.body.appendChild(customCursor);

  cursorFollower = document.createElement('div');
  cursorFollower.className = 'custom-cursor-follower';
  document.body.appendChild(cursorFollower);

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Set fast cursor directly
    customCursor.style.left = `${mouseX}px`;
    customCursor.style.top = `${mouseY}px`;
  });

  // Smooth lerp animation for the follower circle
  function updateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;

    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;

    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Hover states
  const interactives = document.querySelectorAll('a, button, .btn, .editorial-card, .hover-target');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* =========================================================================
   PRELOADER
   ========================================================================= */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const progressNum = preloader.querySelector('.preloader-progress');
  const logText = preloader.querySelector('.preloader-log');
  
  const systemLogs = [
    { threshold: 10, text: "Booting avionics core..." },
    { threshold: 25, text: "Calibrating inertial measurement unit..." },
    { threshold: 45, text: "Connecting telemetry satlink..." },
    { threshold: 65, text: "Synchronizing tactical command node..." },
    { threshold: 85, text: "Activating hybrid VTOL thruster coils..." },
    { threshold: 95, text: "Drone system online." }
  ];

  let currentPercent = 0;

  const interval = setInterval(() => {
    currentPercent += Math.floor(Math.random() * 4) + 1;
    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(interval);
      
      // Animate Preloader Out
      setTimeout(() => {
        gsap.timeline()
          .to(preloader, {
            opacity: 0,
            duration: 0.8,
            ease: "power4.inOut"
          })
          .set(preloader, { visibility: "hidden" })
          .from('.hero-animate', {
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "power4.out"
          }, "-=0.2");
      }, 600);
    }

    progressNum.textContent = `${currentPercent}%`;

    // Update Logs
    const currentLog = systemLogs.filter(log => currentPercent >= log.threshold).pop();
    if (currentLog) {
      logText.textContent = currentLog.text;
    }
  }, 50);
}

/* =========================================================================
   SMOOTH SCROLLING (LENIS)
   ========================================================================= */
function initSmoothScroll() {
  window.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium ease out
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Sync GSAP ScrollTrigger with Lenis
  window.lenis.on('scroll', ScrollTrigger.update);
  
  gsap.ticker.add((time) => {
    window.lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Sync scroll to Three.js Drone rotation/scale on Home Page
  const droneContainer = document.getElementById('drone-container');
  if (droneContainer && window.initGlobalDrone) {
    droneInstance = window.initGlobalDrone('drone-container');

    window.lenis.on('scroll', (e) => {
      // Calculate scroll fraction of first section
      const progress = Math.min(e.scroll / window.innerHeight, 1);
      droneInstance.setScroll(progress);
    });
  }
}

/* =========================================================================
   GLOBAL UX INTERACTIONS
   ========================================================================= */
function initGlobalUX() {
  // Navbar Hide / Show on Scroll
  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100 && currentScrollY > lastScrollY) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    
    lastScrollY = currentScrollY;
  });

  // Magnetic Button Effect
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });

  // Text word split reveal
  const textReveals = document.querySelectorAll('.text-reveal');
  textReveals.forEach(el => {
    const words = el.innerText.split(' ');
    el.innerHTML = '';
    words.forEach(word => {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.overflow = 'hidden';
      span.innerHTML = `<span style="display:inline-block; transform:translateY(100%); transition:transform 0.8s var(--ease-premium);">${word}&nbsp;</span>`;
      el.appendChild(span);
    });
    
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => {
        el.querySelectorAll('span span').forEach((innerSpan, index) => {
          setTimeout(() => {
            innerSpan.style.transform = 'translateY(0)';
          }, index * 40);
        });
      }
    });
  });

  // 3D Card Hover Tilt Effect
  const cards = document.querySelectorAll('.editorial-card, .tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation based on cursor proximity to center
      const rotateX = ((y / rect.height) - 0.5) * -12; // max tilt 12deg
      const rotateY = ((x / rect.width) - 0.5) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* =========================================================================
   GSAP SCROLLTRIGGER & TIMELINE ANIMATIONS
   ========================================================================= */
function initGsapAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // 1. Horizontal Scroll Storytelling for Mission Process (Home Section 5)
  const processSection = document.getElementById('process-section');
  const horizontalTimeline = document.querySelector('.horizontal-timeline');
  if (processSection && horizontalTimeline) {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 992px)", () => {
      // 6 steps total, which translates to moving -83.33% (-500vw)
      gsap.to(horizontalTimeline, {
        xPercent: -83.33,
        ease: "none",
        scrollTrigger: {
          trigger: processSection,
          pin: true,
          scrub: 1.2,
          start: "top top",
          end: () => `+=${horizontalTimeline.offsetWidth}`,
          invalidateOnRefresh: true
        }
      });
    });
  }

  // 2. Simple fade-in-up animations for common elements
  const fadeElements = document.querySelectorAll('.fade-up');
  fadeElements.forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 92%", // Trigger when the element enters the bottom of screen
        toggleActions: "play none none none"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // 3. Counter animations
  const counters = document.querySelectorAll('.counter-val');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    ScrollTrigger.create({
      trigger: counter,
      start: "top 90%",
      onEnter: () => {
        let count = { value: 0 };
        gsap.to(count, {
          value: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            // Check if floating number
            if (counter.getAttribute('data-float') === "true") {
              counter.textContent = count.value.toFixed(1) + "%";
            } else {
              counter.textContent = Math.floor(count.value).toString() + (counter.getAttribute('data-suffix') || "");
            }
          }
        });
      }
    });
  });
  
  // Refresh ScrollTrigger calculations after all setups are ready
  ScrollTrigger.refresh();
}

/* =========================================================================
   CANVAS GRAPHICS - SECTION 4 (TECH ECOSYSTEM HEX GRID)
   ========================================================================= */
function initTechEcosystemCanvas() {
  const canvas = document.getElementById('tech-ecosystem-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.parentElement.clientWidth;
    height = 400;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  // Define nodes (Hex network nodes)
  const nodes = [
    { x: 0.25, y: 0.32, label: "ARTIFICIAL INTELLIGENCE", active: true },
    { x: 0.5, y: 0.18, label: "MACHINE VISION", active: true },
    { x: 0.75, y: 0.32, label: "COMPUTER VISION", active: true },
    { x: 0.75, y: 0.62, label: "SWARM PROTOCOLS", active: true },
    { x: 0.5, y: 0.76, label: "ZERO-TRUST ENCRYPTION", active: true },
    { x: 0.25, y: 0.62, label: "CLOUD COMMAND", active: true }
  ];

  let pulseAngle = 0;

  function drawHexNode(ctx, x, y, label, active) {
    const size = 15;
    
    // Draw outer glowing ring
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = x + Math.cos(angle) * (size + (active ? Math.sin(pulseAngle) * 3 : 0));
      const hy = y + Math.sin(angle) * (size + (active ? Math.sin(pulseAngle) * 3 : 0));
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.strokeStyle = active ? '#000000' : '#EAEAEA';
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.stroke();

    // Draw inner point
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = active ? '#000000' : '#888888';
    ctx.fill();

    // Draw label
    ctx.font = "bold 9px 'IBM Plex Sans'";
    ctx.fillStyle = '#050505';
    ctx.fillText(label, x - ctx.measureText(label).width / 2, y + 32);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Update animation pulse
    pulseAngle += 0.04;

    // Convert relative positions to actual coordinates
    const absoluteNodes = nodes.map(n => ({
      x: n.x * width,
      y: n.y * height,
      label: n.label,
      active: n.active
    }));

    // Draw connection lines
    ctx.strokeStyle = '#EAEAEA';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    for (let i = 0; i < absoluteNodes.length; i++) {
      for (let j = i + 1; j < absoluteNodes.length; j++) {
        // Draw links between nearby hex nodes
        const dist = Math.hypot(absoluteNodes[i].x - absoluteNodes[j].x, absoluteNodes[i].y - absoluteNodes[j].y);
        if (dist < width * 0.4) {
          ctx.moveTo(absoluteNodes[i].x, absoluteNodes[i].y);
          ctx.lineTo(absoluteNodes[j].x, absoluteNodes[j].y);
        }
      }
    }
    ctx.stroke();

    // Draw active animated data pulses along connections
    absoluteNodes.forEach((node, idx) => {
      if (node.active) {
        absoluteNodes.forEach((other, oidx) => {
          if (other.active && idx !== oidx) {
            const dist = Math.hypot(node.x - other.x, node.y - other.y);
            if (dist < width * 0.4) {
              // Add a phase offset based on indices so pulses flow asynchronously
              const speedRatio = ((Date.now() + (idx * 400) + (oidx * 600)) / 2000) % 1;
              const px = node.x + (other.x - node.x) * speedRatio;
              const py = node.y + (other.y - node.y) * speedRatio;
              
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = '#000000';
              ctx.fill();
            }
          }
        });
      }
    });

    // Draw nodes
    absoluteNodes.forEach(n => {
      drawHexNode(ctx, n.x, n.y, n.label, n.active);
    });

    requestAnimationFrame(draw);
  }
  draw();
}

/* =========================================================================
   CANVAS GRAPHICS - SOLUTIONS PAGE (Stackly COMMAND SUITE RADAR)
   ========================================================================= */
function initCommandSuiteRadar() {
  const canvas = document.getElementById('sol-radar-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  // Tracked nodes — each has a fixed angle, orbit radius, altitude, and id
  const nodes = [
    { id: 'V-01',    angle: 0.8,  orbitR: 0.60, alt: 180, type: 'UAV',  brightness: 0 },
    { id: 'V-02',    angle: 2.6,  orbitR: 0.40, alt: 95,  type: 'UAV',  brightness: 0 },
    { id: 'UGV-04',  angle: 4.2,  orbitR: 0.72, alt: 42,  type: 'UGV',  brightness: 0 },
    { id: 'SAT-LK',  angle: 1.5,  orbitR: 0.85, alt: 420, type: 'SAT',  brightness: 0 },
    { id: 'UGV-07',  angle: 3.9,  orbitR: 0.55, alt: 8,   type: 'UGV',  brightness: 0 },
  ];

  // Slowly drift node angles to simulate movement
  const driftSpeeds = nodes.map(() => (Math.random() - 0.5) * 0.0006);

  let sweepAngle = 0;
  let startTime  = Date.now();
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const parentW = canvas.parentElement.clientWidth;
    W = parentW;
    H = Math.round(parentW * 0.52); // 52% aspect ratio — wide cinema-style
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // -- Blinking status dot in header --
  const feedDot = document.getElementById('sol-feed-dot');
  let dotOn = true;
  setInterval(() => {
    if (!feedDot) return;
    dotOn = !dotOn;
    feedDot.style.opacity = dotOn ? '1' : '0.2';
  }, 800);

  // -- Uptime counter --
  const uptimeEl = document.getElementById('sol-uptime');
  setInterval(() => {
    if (!uptimeEl) return;
    const s = Math.floor((Date.now() - startTime) / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    uptimeEl.textContent = `${hh}:${mm}:${ss}`;
  }, 1000);

  // -- Latency jitter --
  const latencyEl = document.getElementById('sol-latency');
  setInterval(() => {
    if (!latencyEl) return;
    latencyEl.textContent = (8 + Math.random() * 6).toFixed(1);
  }, 1500);

  let isEcosystemVisible = true;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      isEcosystemVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    obs.observe(canvas);
  }

  function draw() {
    if (!isEcosystemVisible) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) * 0.43;

    // -- Subtle background fill --
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, W, H);

    // -- Radial grid gradient fade --
    const fade = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.1);
    fade.addColorStop(0,   'rgba(247,247,247,0)');
    fade.addColorStop(0.7, 'rgba(247,247,247,0)');
    fade.addColorStop(1,   'rgba(247,247,247,0.95)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);

    // -- Concentric circles --
    for (let r = 0.25; r <= 1; r += 0.25) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,0,0,${0.05 + r * 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // -- Ring labels (range markers) --
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.font = `${Math.round(W * 0.018)}px 'IBM Plex Sans', monospace`;
    [25, 50, 75, 100].forEach((km, i) => {
      const rx = cx + maxR * (i + 1) * 0.25 + 3;
      ctx.fillText(`${km}KM`, rx, cy - 4);
    });

    // -- Dashed crosshair --
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
    ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // -- Sweep (multi-step arc trail + leading edge) --
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sweepAngle);
    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const frac = i / steps;
      const alpha = (1 - frac) * 0.22;
      const sa = -(frac + 1 / steps) * (Math.PI / 2.5);
      const ea = -frac * (Math.PI / 2.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, sa, ea);
      ctx.closePath();
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();
    }
    // Leading edge line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(maxR, 0);
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    sweepAngle += 0.016;
    const normSweep = ((sweepAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // -- Drift nodes and draw blips --
    let activeCount = 0;
    nodes.forEach((node, idx) => {
      // Slowly drift angle
      node.angle += driftSpeeds[idx];

      const bx = cx + Math.cos(node.angle) * maxR * node.orbitR;
      const by = cy + Math.sin(node.angle) * maxR * node.orbitR;

      // Wrap-around angle detection
      const nodeNorm = ((node.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let diff = normSweep - nodeNorm;
      if (diff < 0) diff += Math.PI * 2;
      const swept = diff < 0.55;

      if (swept) {
        node.brightness = 1.0;
        activeCount++;
      } else {
        node.brightness = Math.max(0.18, node.brightness - 0.0025);
        if (node.brightness > 0.18) activeCount++;
      }

      const a = node.brightness;
      const dotR = node.type === 'SAT' ? 4.5 : (node.type === 'UGV' ? 4 : 5);

      // Outer pulse ring
      const pulse = dotR + Math.sin(Date.now() * 0.003 + idx) * 3 + 3;
      ctx.beginPath();
      ctx.arc(bx, by, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,0,0,${a * 0.22})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core dot
      ctx.beginPath();
      ctx.arc(bx, by, dotR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${a})`;
      ctx.fill();

      // Label tag — draws only when recently swept
      if (a > 0.4) {
        const tagX = bx + dotR + 4;
        const tagY = by + 4;
        const label = `${node.id} // ALT:${node.alt}M`;
        const fs = Math.round(W * 0.022);
        ctx.font = `bold ${fs}px 'IBM Plex Sans', monospace`;
        const tw = ctx.measureText(label).width;

        // White pill background
        ctx.fillStyle = `rgba(255,255,255,${a * 0.92})`;
        ctx.fillRect(tagX - 2, tagY - fs, tw + 6, fs + 4);
        ctx.strokeStyle = `rgba(0,0,0,${a * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tagX - 2, tagY - fs, tw + 6, fs + 4);

        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fillText(label, tagX + 1, tagY);
      }
    });

    // -- Update node count and node bar --
    const nodeCountEl = document.getElementById('sol-node-count');
    if (nodeCountEl) nodeCountEl.textContent = activeCount;

    const nodeBar = document.getElementById('sol-node-bar');
    if (nodeBar && Math.floor(sweepAngle * 5) % 80 === 0) {
      nodeBar.innerHTML = nodes.map(n =>
        `<span style="opacity:${n.brightness.toFixed(2)};">
          <strong>${n.id}</strong> ${n.type} | ALT ${n.alt}M
        </span>`
      ).join('');
    }

    requestAnimationFrame(draw);
  }
  draw();
}


/* =========================================================================
   CANVAS GRAPHICS - SECTION 7 (COMMAND CENTER TELEMETRY & RADAR)
   ========================================================================= */
function initCommandCenterTelemetry() {
  const radarCanvas = document.getElementById('telemetry-radar-canvas');
  if (!radarCanvas) return;

  const ctx = radarCanvas.getContext('2d');
  let size;

  function resize() {
    // Get the grid container or the main container width to prevent layout feedback loops
    const mainContainer = radarCanvas.closest('.container');
    const containerW = mainContainer ? mainContainer.clientWidth : 320;
    
    // On mobile, the column width is the container width. On desktop, it is 5/12 of container width
    const isMobile = window.innerWidth <= 991;
    const estimatedColumnW = isMobile ? containerW : (containerW * 5 / 12);
    
    size = Math.min(estimatedColumnW - 48, 300);
    if (size < 180) size = 180; // minimum bounds
    
    const dpr = window.devicePixelRatio || 1;
    radarCanvas.width = size * dpr;
    radarCanvas.height = size * dpr;
    radarCanvas.style.width = `${size}px`;
    radarCanvas.style.height = `${size}px`;
    // FIX: use setTransform to prevent compounding scale bug on repeated resize
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let angle = 0;
  // Radar blips — each tracks its own brightness from 0->1 after the sweep
  const blips = [
    { angle: 0.5,  dist: 0.55, r: 4, label: "SYS-01 (ACTIVE)",   brightness: 0 },
    { angle: 2.2,  dist: 0.30, r: 3, label: "SYS-02 (VTOL)",      brightness: 0 },
    { angle: 4.0,  dist: 0.70, r: 5, label: "SATLINK SECURE",      brightness: 0 },
    { angle: 5.5,  dist: 0.42, r: 3, label: "NODE-04",             brightness: 0 }
  ];

  // -- Live log stream for the security brief panel --
  const logLines = [
    "[STATUS] BEACON LOCK — SECTOR 7 NODE ACTIVE.",
    "[INFO]   ALTITUDE DELTA: +2.3M OVER BASELINE.",
    "[ALERT]  WIND SHEAR DETECTED. ADJUSTING TRIM.",
    "[OK]     PROPULSION NOMINAL. ALL SYSTEMS GO.",
    "[INFO]   SATLINK HANDSHAKE WITH BRUSSELS NODE.",
    "[STATUS] AUTO-TRANSIT CALIBRATED OVER SECTOR 4.",
    "[OK]     ENCRYPTION VERIFIED — AES-256 ACTIVE.",
    "[ALERT]  BATTERY @ 87.5% — CRUISE MODE ENGAGED.",
  ];
  let logIdx = 0;
  const logContainer = document.getElementById('live-security-log');
  if (logContainer) {
    setInterval(() => {
      const entry = document.createElement('div');
      entry.style.cssText = 'opacity:0;transition:opacity 0.6s;margin-bottom:0.4rem;';
      entry.textContent = logLines[logIdx % logLines.length];
      // Colour tag by type
      if (logLines[logIdx % logLines.length].includes('[ALERT]')) {
        entry.style.color = '#333';
        entry.style.fontWeight = '700';
      }
      logContainer.prepend(entry);
      requestAnimationFrame(() => { entry.style.opacity = '1'; });
      // Keep only last 5 entries visible
      const children = logContainer.children;
      if (children.length > 5) logContainer.removeChild(children[children.length - 1]);
      logIdx++;
    }, 2200);
  }

  let isRadarVisible = true;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      isRadarVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    obs.observe(radarCanvas);
  }

  function draw() {
    if (!isRadarVisible) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.44;

    // -- Concentric rings --
    for (let r = 0.25; r <= 1; r += 0.25) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,0,0,${0.06 + r * 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // -- Dashed crosshair --
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
    ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
    ctx.stroke();
    ctx.setLineDash([]);

    // -- Sweep wedge with trailing glow (multi-step arcs) --
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const trailSteps = 14;
    for (let i = 0; i < trailSteps; i++) {
      const frac = i / trailSteps;
      const alpha = (1 - frac) * 0.20;
      const startA = -(frac + 1 / trailSteps) * (Math.PI / 2.2);
      const endA   = -frac * (Math.PI / 2.2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, startA, endA);
      ctx.closePath();
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();
    }
    // Bright leading-edge line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(maxR, 0);
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // -- Advance sweep angle --
    angle += 0.018;
    const normalAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // -- Blips: fade in when swept, slowly decay --
    blips.forEach(blip => {
      const bx = cx + Math.cos(blip.angle) * maxR * blip.dist;
      const by = cy + Math.sin(blip.angle) * maxR * blip.dist;

      // Correct wrap-around angle difference
      const blipNorm = ((blip.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let diff = normalAngle - blipNorm;
      if (diff < 0) diff += Math.PI * 2;
      const swept = diff < 0.6;

      if (swept) {
        blip.brightness = 1.0;
      } else {
        blip.brightness = Math.max(0.18, blip.brightness - 0.003);
      }

      const alpha = blip.brightness;

      // Animated pulse ring
      const pulseR = blip.r + Math.sin(Date.now() * 0.004) * 3 + 3;
      ctx.beginPath();
      ctx.arc(bx, by, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.28})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core dot
      ctx.beginPath();
      ctx.arc(bx, by, blip.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();

      // Label — show only when brightness is high enough
      if (blip.brightness > 0.45) {
        ctx.font = `bold ${Math.round(size * 0.028)}px 'IBM Plex Sans', monospace`;
        ctx.fillStyle = `rgba(5,5,5,${blip.brightness})`;
        ctx.fillText(blip.label, bx + blip.r + 4, by + 4);
      }
    });

    // -- Live telemetry value ticks --
    const liveAlt  = document.getElementById('live-altitude');
    const liveBat  = document.getElementById('live-battery');
    const liveWind = document.getElementById('live-wind');

    if (liveAlt  && Math.random() > 0.96)
      liveAlt.textContent  = (118.5 + Math.random() * 4).toFixed(1) + 'M';
    if (liveWind && Math.random() > 0.96)
      liveWind.textContent = (11.8 + Math.random() * 3.5).toFixed(1) + ' KTS';
    if (liveBat  && Math.random() > 0.992) {
      const cur = parseFloat(liveBat.textContent);
      if (cur > 10) liveBat.textContent = (cur - 0.1).toFixed(1) + '%';
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* =========================================================================
   INTERACTIVE MAP - SECTION 8 (GLOBAL OPERATIONS MAP WITH SVGS)
   ========================================================================= */
function initGlobalOpsMap() {
  const mapSvg = document.getElementById('global-ops-map');
  if (!mapSvg) return;

  const markers = mapSvg.querySelectorAll('.map-marker');
  const paths = mapSvg.querySelectorAll('.map-path');

  // Trigger initial line animations
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    ScrollTrigger.create({
      trigger: mapSvg,
      start: "top 70%",
      onEnter: () => {
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: "power2.inOut"
        });
      }
    });
  });

  // Markers ping animation on scroll entry
  markers.forEach((marker, idx) => {
    gsap.set(marker, { scale: 0, transformOrigin: "center center" });
    ScrollTrigger.create({
      trigger: mapSvg,
      start: "top 70%",
      onEnter: () => {
        gsap.to(marker, {
          scale: 1,
          duration: 1,
          delay: idx * 0.2,
          ease: "back.out(1.7)"
        });
      }
    });
  });
}

/* =========================================================================
   PAGE TRANSITIONS
   ========================================================================= */
function initPageTransitions() {
  const transitionOverlay = document.querySelector('.page-transition-overlay');
  if (!transitionOverlay) return;

  // Intercept normal clicks on navbar/footer navigation
  const links = document.querySelectorAll("a[href$='.html']");
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = link.getAttribute('href');

      // Slide transition layer up
      gsap.to(transitionOverlay, {
        yPercent: -100,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          window.location.href = targetUrl;
        }
      });
    });
  });

  // If entering a new page, slide transition layer down (reveal page)
  gsap.set(transitionOverlay, { yPercent: 0 });
  gsap.to(transitionOverlay, {
    yPercent: 100,
    duration: 0.6,
    delay: 0.2,
    ease: "power3.inOut"
  });
}

/* =========================================================================
   RESPONSIVE MOBILE NAV OVERLAY & HAMBURGER
   ========================================================================= */
function initMobileNavigation() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // 1. Create the burger toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'mobile-toggle';
  toggleBtn.style.display = 'none'; // Controlled by CSS media queries
  toggleBtn.innerHTML = '<i data-lucide="menu" style="width:24px; height:24px;"></i>';
  navbar.appendChild(toggleBtn);

  // 2. Create the full-screen overlay menu
  const overlay = document.createElement('div');
  overlay.className = 'mobile-menu-overlay';

  // Dedicated close button inside the overlay (aligned at top right)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'mobile-menu-close';
  closeBtn.innerHTML = '<i data-lucide="x" style="width:24px; height:24px;"></i>';
  overlay.appendChild(closeBtn);

  const linksContainer = document.createElement('div');
  linksContainer.className = 'mobile-menu-links';

  // Copy standard desktop nav-links
  const desktopLinks = document.querySelectorAll('.nav-links .nav-link');
  desktopLinks.forEach(link => {
    const clone = link.cloneNode(true);
    clone.className = 'mobile-menu-link';
    linksContainer.appendChild(clone);
  });
  overlay.appendChild(linksContainer);

  // Copy auth actions
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'mobile-menu-actions';
  const desktopActions = document.querySelectorAll('.nav-actions .btn');
  desktopActions.forEach(btn => {
    const clone = btn.cloneNode(true);
    clone.style.width = '100%';
    clone.style.padding = '0.7rem 1.5rem';
    clone.style.fontSize = '0.72rem';
    actionsContainer.appendChild(clone);
  });
  overlay.appendChild(actionsContainer);

  document.body.appendChild(overlay);

  // 3. Setup event listeners
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
    if (window.lucide) window.lucide.createIcons();
  }

  function closeMenu() {
    menuOpen = false;
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
    if (window.lucide) window.lucide.createIcons();
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMenu();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
  });

  // Close overlay on backdrop click or link click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('a') || e.target.closest('.btn')) {
      closeMenu();
    }
  });

  // Close overlay on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

