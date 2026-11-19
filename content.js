/* ══════════════════════════════════════════════════════════════
   PORTFOLIO CONTENT  —  edit this one file to make it yours.
   Everything on the page is rendered from this object.
   ══════════════════════════════════════════════════════════════ */
window.PORTFOLIO = {
  /* — the hero — */
  name: "SATHISH",
  firstName: "Sathish",
  role: "Creative Front-End Developer",
  kicker: "PORTFOLIO  ·  ISSUE #01  ·  2026",
  tagline: "I build interfaces that hit like a comic panel.",
  intro:
    "Design-minded developer turning bold ideas into fast, tactile websites. " +
    "I care about the little things — the snap of a button, the rhythm of a scroll, " +
    "and the moment a page stops feeling like a page.",
  location: "Based in India",
  status: "Available for new projects",

  /* — about panel — */
  bioTitle: "PART HUMAN. PART KEYBOARD.",
  bio:
    "I'm a front-end developer who treats the browser like a canvas. My work lives " +
    "somewhere between engineering and illustration: clean code underneath, loud " +
    "personality on top. Give me a rough idea and a canvas and I'll turn it into " +
    "something you can scroll, click and feel.",

  /* — stat counters — */
  stats: [
    { value: 5,    suffix: "+",  label: "YEARS BUILDING" },
    { value: 42,   suffix: "",   label: "PROJECTS SHIPPED" },
    { value: 12,   suffix: "",   label: "HAPPY CLIENTS" },
    { value: 3,    suffix: "×",  label: "COFFEE PER BUILD" }
  ],

  /* — project cards — */
  projects: [
    {
      no: "01",
      title: "NEON ARCHIVE",
      kind: "INTERACTIVE / WEBGL",
      blurb:
        "A scroll-driven story engine where every section is a scene. Built with a " +
        "frame scheduler that keeps sixty frames a second even with a hundred layers moving.",
      tags: ["React", "Three.js", "GSAP"],
      link: "#",
      color: "yellow"
    },
    {
      no: "02",
      title: "FLASH UI KIT",
      kind: "DESIGN SYSTEM",
      blurb:
        "A component library with a personality. Tokens, motion rules and a dozen " +
        "panels that make product teams faster without making their work look generic.",
      tags: ["Figma", "CSS", "Storybook"],
      link: "#",
      color: "cyan"
    },
    {
      no: "03",
      title: "STORM DASH",
      kind: "GAME-LIKE LANDING",
      blurb:
        "An arcade-styled product launch with canvas lightning, a kunai cursor and " +
        "a scroll track that plays like a cutscene. Pure vanilla JavaScript.",
      tags: ["Canvas", "Web Audio", "Vanilla JS"],
      link: "#",
      color: "red"
    },
    {
      no: "04",
      title: "PANEL PRESS",
      kind: "EDITORIAL CMS",
      blurb:
        "A publishing platform for people who write in pictures. Comic-page layouts, " +
        "drag-and-drop panels and an editor that stays out of the way.",
      tags: ["Next.js", "Sanity", "Motion"],
      link: "#",
      color: "violet"
    }
  ],

  /* — skill meters — */
  skills: [
    { group: "FRONTEND", items: [
      { name: "HTML / CSS", level: 96 },
      { name: "JavaScript", level: 92 },
      { name: "TypeScript", level: 84 },
      { name: "React", level: 88 }
    ]},
    { group: "MOTION & FX", items: [
      { name: "Canvas 2D", level: 90 },
      { name: "GSAP", level: 86 },
      { name: "WebGL / Three.js", level: 72 },
      { name: "Scroll systems", level: 94 }
    ]},
    { group: "CRAFT", items: [
      { name: "Figma", level: 80 },
      { name: "Design systems", level: 88 },
      { name: "Accessibility", level: 82 },
      { name: "Performance", level: 90 }
    ]}
  ],

  /* — final panel — */
  contactTitle: "LET'S MAKE",
  contactTitleAccent: "SOME NOISE.",
  contactBlurb:
    "Got an idea that needs a little chaos and a lot of polish? Send a signal. " +
    "I read every message and usually answer within a day.",
  email: "hello@sathish.dev",

  socials: [
    { label: "GITHUB",   href: "https://github.com/" },
    { label: "LINKEDIN", href: "https://linkedin.com/" },
    { label: "X / TWITTER", href: "https://x.com/" },
    { label: "DRIBBBLE", href: "https://dribbble.com/" }
  ]
};
