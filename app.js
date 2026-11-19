/* ══════════════════════════════════════════════════════════════
   COMIC PORTFOLIO — interaction engine
   Vertical frame-scrub sequences / kunai cursor / click lightning
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const D = window.PORTFOLIO || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));

  const pad   = n => String(n).padStart(3, "0");
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const rand  = (a, b) => a + Math.random() * (b - a);
  const pick  = arr => arr[(Math.random() * arr.length) | 0];

  /* fade in over [a,b], hold, fade out over [c,d] */
  const window4 = (p, a, b, c, d) =>
    p < a || p > d ? 0 : p < b ? (p - a) / (b - a) : p > c ? 1 - (p - c) / (d - c) : 1;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine   = matchMedia("(pointer: fine)").matches;

  /* ═══════════════════════ render content ═══════════════════════ */
  function render() {
    const set = (sel, val) => { const el = $(sel); if (el && val != null) el.textContent = val; };

    set("#brandName", D.name);
    set("#coverName", D.name);
    set("#coverKicker", D.kicker);
    set("#coverRole", D.role);
    set("#coverTagline", D.tagline);
    set("#bioTitle", D.bioTitle);
    set("#bioText", D.bio);
    set("#bioLocation", D.location);
    set("#bioStatus", D.status);
    set("#contactTitle", D.contactTitle);
    set("#contactAccent", D.contactTitleAccent);
    set("#contactBlurb", D.contactBlurb);
    set("#footerName", D.name);
    set("#footerYear", String(new Date().getFullYear()));

    if (D.email) {
      const mail = $("#contactMail");
      if (mail) mail.href = "mailto:" + D.email;
    }

    /* stats */
    const statsGrid = $("#statsGrid");
    if (statsGrid && Array.isArray(D.stats)) {
      statsGrid.innerHTML = D.stats.map(s =>
        '<div class="stat-cell"><b data-count="' + (+s.value || 0) +
        '" data-suffix="' + (s.suffix || '') + '">0</b><i>' + (s.label || '') + '</i></div>'
      ).join("");
    }

    /* projects */
    const projectGrid = $("#projectGrid");
    if (projectGrid && Array.isArray(D.projects)) {
      projectGrid.innerHTML = D.projects.map(p =>
        '<article class="project" data-reveal style="--tone:var(--' +
        (p.color || "yellow") + ')">' +
          '<div class="project__top">' +
            '<span class="project__no">CASE ' + (p.no || "") + '</span>' +
            '<span class="project__kind">' + (p.kind || "") + '</span>' +
          '</div>' +
          '<h3>' + (p.title || "") + '</h3>' +
          '<p>' + (p.blurb || "") + '</p>' +
          '<div class="project__tags">' +
            (p.tags || []).map(t => "<span>" + t + "</span>").join("") +
          '</div>' +
          '<a class="project__link" href="' + (p.link || "#") + '">OPEN CASE <b>↗</b></a>' +
        '</article>'
      ).join("");
    }

    /* skills */
    const skillsGrid = $("#skillsGrid");
    if (skillsGrid && Array.isArray(D.skills)) {
      skillsGrid.innerHTML = D.skills.map(g =>
        '<div class="skill-card" data-reveal>' +
          '<h3>' + (g.group || "") + '</h3>' +
          (g.items || []).map(it =>
            '<div class="skill">' +
              '<div class="skill__row"><span>' + it.name + '</span><span>' + it.level + '%</span></div>' +
              '<div class="skill__meter"><i data-level="' + (+it.level || 0) + '"></i></div>' +
            '</div>'
          ).join("") +
        '</div>'
      ).join("");
    }

    /* socials */
    const socials = $("#socialLinks");
    if (socials && Array.isArray(D.socials)) {
      socials.innerHTML = D.socials.map(s =>
        '<a href="' + (s.href || "#") + '" target="_blank" rel="noopener">' + (s.label || "") + '</a>'
      ).join("");
    }
  }

  /* ═══════════════════════ canvas helpers ═══════════════════════ */
  function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }

  function fit(canvas) {
    const w = Math.round(canvas.offsetWidth * dpr());
    const h = Math.round(canvas.offsetHeight * dpr());
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return canvas.getContext("2d");
  }

  function stale(canvas) {
    return canvas.width !== Math.round(canvas.offsetWidth * dpr()) ||
           canvas.height !== Math.round(canvas.offsetHeight * dpr());
  }

  /* cover-draw a frame without distorting it */
  function drawCover(ctx, img, cw, ch) {
    if (!img || !img.naturalWidth) return false;
    const ir = img.naturalWidth / img.naturalHeight;
    let w = cw, h = cw / ir;
    if (h < ch) { const s = Math.min(ch / h, 2.2); w *= s; h *= s; }
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);

    /* soft corner vignette so any baked-in watermark disappears */
    const g = ctx.createRadialGradient(cw, ch, 0, cw, ch, Math.max(w, h) * 0.3);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.45, "rgba(0,0,0,.85)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.beginPath(); ctx.rect(cw - Math.max(w, h) * 0.3, ch - Math.max(w, h) * 0.3,
                              Math.max(w, h) * 0.3, Math.max(w, h) * 0.3); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
    return true;
  }

  /* ═══════════════════════ frame sequences ═══════════════════════ */
  const scrubs = $$(".scrub").map(el => {
    const id = el.id;
    return {
      el: el,
      id: id,
      dir: el.dataset.dir || "gaze",
      count: +el.dataset.count || 1,
      label: el.dataset.label || id.toUpperCase(),
      canvas: $("#" + id + "Canvas"),
      bar: $("#" + id + "Bar"),
      frame: $("#" + id + "Frame"),
      caps: $$(".cap", el),
      lines: $(".scrub__lines", el),
      frames: [],
      ctx: null,
      p: 0, target: 0, shown: 0, last: -1
    };
  });

  scrubs.forEach(s => { if (s.canvas) s.ctx = fit(s.canvas); });

  const totalFrames = scrubs.reduce((n, s) => n + s.count, 0);
  const edgeFrames = $("#edgeFrames");
  if (edgeFrames) edgeFrames.textContent = String(totalFrames);

  /* — loader / preload — */
  const loader     = $("#loader");
  const loaderFill = $("#loaderFill");
  const loaderPct  = $("#loaderPct");
  const loaderMsg  = $("#loaderMsg");
  const LOAD_MSGS  = [
    "GATHERING FRAMES", "INKING THE PANELS", "WIRING THE LIGHTNING",
    "SHARPENING THE KUNAI", "ALMOST READY"
  ];
  let loaded = 0;

  function progress(p) {
    if (loaderFill) loaderFill.style.width = (p * 100).toFixed(1) + "%";
    if (loaderPct)  loaderPct.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
    if (loaderMsg)  loaderMsg.textContent = LOAD_MSGS[Math.min(LOAD_MSGS.length - 1, Math.floor(p * LOAD_MSGS.length))];
  }

  function loadImage(src, bucket, i) {
    return new Promise(res => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        bucket[i] = img;
        loaded++;
        progress(loaded / Math.max(1, totalFrames));
        res();
      };
      img.src = src;
    });
  }

  const jobs = [];
  scrubs.forEach(s => {
    for (let i = 1; i <= s.count; i++) {
      jobs.push(loadImage("Minato-master/frames/" + s.dir + "/" + pad(i) + ".jpg", s.frames, i - 1));
    }
  });

  Promise.all(jobs).then(() => setTimeout(() => {
    if (loader) loader.classList.add("done");
    document.body.classList.add("ready");
    scrubs.forEach(s => { s.last = -1; });
    resizeAll();
    if (!reduce) quietStrike();
    setTimeout(() => { if (loader) loader.style.display = "none"; }, 800);
  }, 260));

  /* — caption timing windows — */
  const WINDOWS = [
    [0.05, 0.11, 0.19, 0.28],
    [0.28, 0.34, 0.43, 0.52],
    [0.52, 0.58, 0.67, 0.76],
    [0.76, 0.82, 0.97, 1.08]
  ];

  function readScrub(s) {
    const r = s.el.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    s.p = clamp(-r.top / (span || 1));
    s.target = s.p * (s.count - 1);
  }

  function paintScrub(s, dt) {
    const r = s.el.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;

    s.shown = lerp(s.shown, s.target, reduce ? 1 : 0.16);
    const idx = clamp(Math.round(s.shown), 0, s.count - 1);

    if (stale(s.canvas)) s.ctx = fit(s.canvas);
    if (idx !== s.last || s.canvas.dataset.dirty === "1") {
      const w = s.canvas.width, h = s.canvas.height;
      s.ctx.clearRect(0, 0, w, h);
      drawCover(s.ctx, s.frames[idx], w, h);
      s.last = idx;
      s.canvas.dataset.dirty = "0";
    }

    if (s.frame) s.frame.textContent = pad(idx + 1) + " / " + pad(s.count);
    if (s.bar)  s.bar.style.width = (s.p * 100).toFixed(1) + "%";

    s.caps.forEach((cap, i) => {
      const w = WINDOWS[i] || WINDOWS[0];
      const a = window4(s.p, w[0], w[1], w[2], w[3]);
      cap.style.opacity = a.toFixed(3);
      cap.style.transform = "translateY(-42%) translateY(" + ((1 - a) * 24).toFixed(1) + "px)";
      cap.style.filter = "blur(" + ((1 - a) * 5).toFixed(2) + "px)";
    });

    if (s.lines) s.lines.style.opacity = (scrollVel * 0.9).toFixed(3);
  }

  /* ═══════════════════════ kunai cursor ═══════════════════════ */
  /* Frames are extracted from the Minato kunai cursor pack:
     idle   = gloving/glowing kunai      (32 frames)
     hover  = link-select shine sweep    (10 frames)
     busy   = spinning shuriken          (7 frames)  */
  const cursorEl = $("#kunaiCursor");
  const cursorImg = $("#kunaiImg");
  const CURSOR_FRAMES = { idle: 32, hover: 10, busy: 7 };
  const CURSOR_DELAY  = { idle: 90, hover: 55, busy: 65 };

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my, hot = false;
  let curState = "idle", curFrame = 0, lastFrameAt = 0, busyUntil = 0;

  function setCursorState(state) {
    if (curState === state) return;
    curState = state;
    curFrame = 0;
  }

  if (fine && cursorEl && !reduce) {
    document.body.classList.add("js-cursor");
    addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    $$("a, .project, .skill-card, .panel, .comic-btn").forEach(el => {
      el.addEventListener("pointerenter", () => {
        hot = true;
        cursorEl.classList.add("hot");
        if (performance.now() > busyUntil) setCursorState("hover");
      });
      el.addEventListener("pointerleave", () => {
        hot = false;
        cursorEl.classList.remove("hot");
        if (performance.now() > busyUntil) setCursorState("idle");
      });
    });
  }

  function paintCursor(t) {
    if (!cursorEl || !document.body.classList.contains("js-cursor")) return;

    cx = lerp(cx, mx, 0.28);
    cy = lerp(cy, my, 0.28);

    if (busyUntil && t > busyUntil) {
      busyUntil = 0;
      setCursorState(hot ? "hover" : "idle");
    }

    const count = CURSOR_FRAMES[curState];
    if (cursorImg && t - lastFrameAt > CURSOR_DELAY[curState]) {
      lastFrameAt = t;
      curFrame = (curFrame + 1) % count;
      cursorImg.src = "cursor-art/" + curState + "_" +
                      String(curFrame).padStart(2, "0") + ".png";
    }

    /* the source hotspot is the kunai tip, ~7px down the 32px art */
    const s = hot ? 1.12 : 1;
    cursorEl.style.transform =
      "translate(" + cx.toFixed(1) + "px," + (cy - 16 * s).toFixed(1) + "px) scale(" + s + ")";
  }

  /* ═══════════════════════ lightning ═══════════════════════ */
  const thunderCanvas = $("#thunderCanvas");
  const sparkCanvas   = $("#sparkCanvas");
  const flashEl       = $("#fxFlash");
  const wordEl        = $("#comicWord");
  let thunderCtx = thunderCanvas && fit(thunderCanvas);
  let sparkCtx   = sparkCanvas && fit(sparkCanvas);

  const thunder = [];
  const sparks  = [];

  function boltPath(x0, y0, x1, y1, jag, steps) {
    const pts = [[x0, y0]];
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const off = (Math.random() - 0.5) * len * (1.9 / steps) * jag * Math.sin(t * Math.PI);
      pts.push([x0 + dx * t + nx * off, y0 + dy * t + ny * off]);
    }
    pts.push([x1, y1]);
    return pts;
  }

  function path(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  }

  function strokeBolts(ctx, list) {
    if (!ctx) return;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.life -= b.decay;
      if (b.life <= 0) { list.splice(i, 1); continue; }
      const a = b.life, w = b.weight;

      path(ctx, b.pts);
      ctx.shadowColor = "rgba(63,224,255,.9)";
      ctx.shadowBlur = 28 * w;
      ctx.globalAlpha = a * 0.22;
      ctx.strokeStyle = "#3fe0ff";
      ctx.lineWidth = 15 * w;
      ctx.stroke();

      ctx.shadowColor = "rgba(255,210,63,.9)";
      ctx.shadowBlur = 14 * w;
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = "#ffd23f";
      ctx.lineWidth = 5 * w;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = a;
      ctx.strokeStyle = "#fffdf0";
      ctx.lineWidth = 1.7 * w;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function dropBolt(w, h, x0, power) {
    const x1 = x0 + rand(-w * 0.18, w * 0.18);
    const y1 = rand(h * 0.42, h * 1.02);
    const main = boltPath(x0, -h * 0.09, x1, y1, 1, 22);
    thunder.push({ pts: main, life: 1, decay: 0.055 + rand(0, 0.03), weight: 1.15 * power });

    const forks = 1 + ((Math.random() * 2) | 0);
    for (let f = 0; f < forks; f++) {
      const k = 6 + ((Math.random() * (main.length - 11)) | 0);
      const p = main[clamp(k, 1, main.length - 2)];
      thunder.push({
        pts: boltPath(p[0], p[1], p[0] + rand(-w * 0.16, w * 0.16), p[1] + rand(h * 0.12, h * 0.34), 1.2, 12),
        life: 0.75, decay: 0.09, weight: 0.6 * power
      });
    }
  }

  const WORDS = ["ZAP!", "BOOM!", "KRAK!", "POW!", "ZING!", "THWACK!", "BZZT!"];

  function showWord(x, y) {
    if (!wordEl || reduce) return;
    wordEl.textContent = pick(WORDS);
    wordEl.style.left = clamp(x, 90, window.innerWidth - 90) + "px";
    wordEl.style.top  = clamp(y - 60, 100, window.innerHeight - 80) + "px";
    wordEl.classList.remove("pop");
    void wordEl.offsetWidth;
    wordEl.classList.add("pop");
  }

  function burst(x, y, n, power) {
    const ratio = dpr();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.2832 + Math.random() * 0.5;
      const sp = rand(3, 11) * power * ratio;
      sparks.push({
        x: x * ratio, y: y * ratio,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: rand(0.015, 0.04),
        gold: Math.random() < 0.65
      });
    }
  }

  function paintSparks() {
    if (!sparkCtx) return;
    const w = sparkCanvas.width, h = sparkCanvas.height;
    sparkCtx.clearRect(0, 0, w, h);
    sparkCtx.lineCap = "round";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vx *= 0.93; s.vy *= 0.93;
      s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      sparkCtx.globalAlpha = s.life;
      sparkCtx.strokeStyle = s.gold ? "#ffd23f" : "#3fe0ff";
      sparkCtx.lineWidth = 1.5 * s.life + 0.5;
      sparkCtx.beginPath();
      sparkCtx.moveTo(s.x, s.y);
      sparkCtx.lineTo(s.x - s.vx * 2.4, s.y - s.vy * 2.4);
      sparkCtx.stroke();
    }
    sparkCtx.globalAlpha = 1;
  }

  function strike(x, y, power, quiet) {
    if (!thunderCtx) return;
    const w = thunderCanvas.width, h = thunderCanvas.height;
    if (!w || !h) return;
    power = power || 1;

    const lanes = [0.2, 0.5, 0.8].sort(() => Math.random() - 0.5);
    const n = quiet ? 1 : 2 + ((Math.random() * 2) | 0);
    const originX = x != null ? x * dpr() : null;

    for (let i = 0; i < n; i++) {
      const bx = originX != null && i === 0
        ? originX
        : w * lanes[i % lanes.length] + rand(-w * 0.12, w * 0.12);
      dropBolt(w, h, bx, power);
    }

    if (quiet) return;

    if (flashEl) {
      flashEl.classList.remove("fire");
      void flashEl.offsetWidth;
      flashEl.classList.add("fire");
    }
    document.body.classList.remove("shake");
    void document.body.offsetWidth;
    document.body.classList.add("shake");
    if (x != null) {
      burst(x, y, 22, power);
      showWord(x, y);
    }
    if (cursorEl) {
      setCursorState("busy");
      busyUntil = performance.now() + 700;
      cursorEl.animate(
        [{ filter: "brightness(3)" }, { filter: "brightness(1)" }],
        { duration: 320, easing: "ease-out" }
      );
    }
  }

  function quietStrike() { strike(null, null, 0.5, true); }

  /* click anywhere = lightning */
  addEventListener("pointerdown", e => {
    if (e.button !== undefined && e.button !== 0) return;
    strike(e.clientX, e.clientY, 1, false);
  }, { passive: true });

  /* occasional distant storm */
  let nextStrike = 0;
  function ambientThunder(t) {
    if (reduce) return;
    if (t < nextStrike) return;
    nextStrike = t + rand(9000, 16000);
    quietStrike();
  }

  function paintThunder(t) {
    if (stale(thunderCanvas)) thunderCtx = fit(thunderCanvas);
    ambientThunder(t);
    thunderCtx.clearRect(0, 0, thunderCanvas.width, thunderCanvas.height);
    strokeBolts(thunderCtx, thunder);
  }

  /* ═══════════════════════ reveals / counters / meters ═══════════════════════ */
  function countUp(el) {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    const t0 = performance.now();
    const dur = reduce ? 1 : 1400;
    const step = now => {
      const p = clamp((now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  let statsDone = false;
  let skillsDone = false;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");

      if (el.id === "statsGrid" && !statsDone) {
        statsDone = true;
        $$("[data-count]", el).forEach(countUp);
      }
      if (el.id === "skillsGrid" && !skillsDone) {
        skillsDone = true;
        $$(".skill__meter i", el).forEach(i => { i.style.width = i.dataset.level + "%"; });
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });

  $$("[data-reveal], #statsGrid, #skillsGrid").forEach(el => io.observe(el));

  /* ═══════════════════════ scroll chrome ═══════════════════════ */
  const sections = $$("main > section");
  const navLinks = $$(".nav a");
  const pageEl = $("#coverPage");
  let lastY = scrollY, scrollVel = 0;

  function readScroll() {
    const y = scrollY;
    const d = y - lastY;
    scrollVel = lerp(scrollVel, Math.min(Math.abs(d) / 45, 1), 0.14);
    lastY = y;

    let current = null;
    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      if (r.top <= window.innerHeight * 0.45 && r.bottom > window.innerHeight * 0.3) {
        current = sec;
        break;
      }
    }
    if (!current) return;
    const idx = sections.indexOf(current);
    if (pageEl) pageEl.textContent = "PAGE " + pad(idx + 1) + " / " + pad(sections.length);
    navLinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current.id);
    });
  }

  /* ═══════════════════════ resize / loop ═══════════════════════ */
  function resizeAll() {
    if (thunderCanvas) { thunderCtx = fit(thunderCanvas); thunderCanvas.dataset.dirty = "1"; }
    if (sparkCanvas)   sparkCtx = fit(sparkCanvas);
    scrubs.forEach(s => { if (s.canvas) { s.ctx = fit(s.canvas); s.canvas.dataset.dirty = "1"; } });
  }
  addEventListener("resize", resizeAll, { passive: true });

  let prev = performance.now();
  function frame(t) {
    const dt = Math.min(t - prev, 50);
    prev = t;

    readScroll();
    paintCursor(t);
    scrubs.forEach(s => { readScrub(s); paintScrub(s, dt); });
    paintSparks();
    paintThunder(t);

    requestAnimationFrame(frame);
  }

  /* ═══════════════════════ boot ═══════════════════════ */
  render();
  resizeAll();
  requestAnimationFrame(frame);
})();
