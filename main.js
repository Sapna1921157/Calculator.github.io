/* ============================================================
   Calc Pro — main.js  (Tab-based redesign)
   Tabs: Home | Calculator | Vedic Math | Statistics
   Features: Canvas animation, Typewriter, Count-up, Quick Calc,
             Math Facts, Scientific Calculator (24 fns), Memory,
             History (localStorage), Programmer Strip (HEX/BIN/OCT),
             Statistics Engine, 16 Vedic Sutras (Hinglish),
             5 Themes, Keyboard support, Ripple animations
============================================================ */

'use strict';

// Start canvas immediately on load
document.addEventListener('DOMContentLoaded', () => initCanvas());

/* ════════════════════════════════════════════════════════════
   TAB NAVIGATION
════════════════════════════════════════════════════════════ */
function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

  const section = document.getElementById('tab-' + tabId);
  const btn     = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  if (section) section.classList.add('active');
  if (btn)     btn.classList.add('active');

  // canvas runs globally — no lazy init needed
}

document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Feature cards & hero buttons
document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', () => switchTab(el.dataset.goto));
});

/* ════════════════════════════════════════════════════════════
   CANVAS — Floating Math Symbols
════════════════════════════════════════════════════════════ */
let canvasInited = false;

function initCanvas() {
  canvasInited = true;
  const canvas = document.getElementById('mathCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const SYMBOLS = ['π', 'e', '√', 'Σ', '∫', '∞', 'φ', 'θ', 'Δ', 'λ', 'μ', 'α',
                   'β', 'γ', 'ω', '∂', '∇', '±', '≈', '÷', '×', '²', '³', 'ℕ', 'ℝ'];

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      sym:  SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      size: 12 + Math.random() * 24,
      vx:   (Math.random() - 0.5) * 0.4,
      vy:   -0.3 - Math.random() * 0.5,
      alpha: 0.08 + Math.random() * 0.18,
      rot:  Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.008,
    };
  }

  function initParticles() {
    particles = Array.from({ length: 55 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = '#a78bfa';
      ctx.font        = `${p.size}px "Segoe UI", sans-serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.sym, 0, 0);
      ctx.restore();

      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.vrot;

      if (p.y < -40 || p.x < -40 || p.x > W + 40) {
        Object.assign(p, createParticle());
        p.y = H + 10;
        if (Math.random() < 0.4) { p.x = Math.random() < 0.5 ? -10 : W + 10; p.y = Math.random() * H; }
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();
  window.addEventListener('resize', () => { resize(); initParticles(); });
}

/* ════════════════════════════════════════════════════════════
   TYPEWRITER EFFECT
════════════════════════════════════════════════════════════ */
const TYPEWRITER_LINES = [
  'Ancient wisdom, modern speed.',
  'Vedic Math · Scientific Calc · Statistics.',
  'Mental math ki speed 10x badh jaayegi!',
  'Explore all 16 Vedic Sutras — Hinglish mein.',
  'From sin/cos to nCr — sab yahan hai.',
];

(function typewriterInit() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  let lineIdx = 0, charIdx = 0, deleting = false, pauseTimer = null;

  function tick() {
    const line = TYPEWRITER_LINES[lineIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = line.slice(0, charIdx);
      if (charIdx === line.length) { deleting = true; pauseTimer = setTimeout(tick, 2200); return; }
    } else {
      charIdx--;
      el.textContent = line.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        lineIdx  = (lineIdx + 1) % TYPEWRITER_LINES.length;
      }
    }
    const delay = deleting ? 38 : 62;
    pauseTimer = setTimeout(tick, delay);
  }
  tick();
})();

/* ════════════════════════════════════════════════════════════
   COUNT-UP ANIMATION
════════════════════════════════════════════════════════════ */
(function countUpInit() {
  const els = document.querySelectorAll('.count-num');
  if (!els.length) return;

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) ** 2;
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Trigger when home tab is in view (IntersectionObserver)
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        els.forEach(animateCount);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const countBar = document.querySelector('.count-bar');
  if (countBar) observer.observe(countBar);
})();

/* ════════════════════════════════════════════════════════════
   QUICK CALCULATE (Home tab)
════════════════════════════════════════════════════════════ */
(function quickCalcInit() {
  const input  = document.getElementById('quickInput');
  const btn    = document.getElementById('quickBtn');
  const result = document.getElementById('quickResult');
  if (!input || !btn || !result) return;

  function run() {
    const raw = input.value.trim();
    if (!raw) return;
    try {
      // Reuse evalSafe (defined later) via a light wrapper so order doesn't matter
      const val = evalSafe(toEval(raw));
      if (!isFinite(val)) { result.textContent = val > 0 ? '= ∞' : '= −∞'; }
      else { result.textContent = '= ' + formatResult(val); }
      result.classList.add('has-result');
    } catch {
      result.textContent = '⚠ Invalid expression';
      result.classList.remove('has-result');
    }
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
})();

/* ════════════════════════════════════════════════════════════
   MATH FACTS TICKER (Home tab)
════════════════════════════════════════════════════════════ */
const MATH_FACTS = [
  "π ke 1 trillion se zyada digits nikale ja chuke hain — abhi bhi pattern nahi mila!",
  "Zero ka concept India ne diya — Aryabhata ji ✌",
  "Fibonacci sequence sunflower ke seeds mein dikhti hai 🌻",
  "Prime numbers infinitely hain — Euclid ne 300 BC mein prove kiya tha!",
  "1729 = 12³+1³ = 10³+9³ — Ramanujan's Taxicab Number 🚕",
  "Chessboard pe wheat grains: 2⁶⁴−1 = 18 quintillion! 🌾",
  "Euler's identity: eⁱᵖ + 1 = 0 — all of math in one equation 🤯",
  "Googol = 10¹⁰⁰ — Google ka naam yahan se aaya!",
  "Vedic Mathematics mein sirf 16 sutras se poori arithmetic cover hoti hai 🕉️",
  "Every even number > 2 is sum of two primes — Goldbach's Conjecture (still unproven!)",
  "√2 irrational hai — Pythagoras ke disciple ne prove kiya aur khud dara gaya!",
  "Möbius strip ek aisa surface hai jiska sirf ek side hai 🔁",
  "Kaun sa number sabse 'interesting' hai? Koi bhi uninteresting number nahi hota! 😄",
  "1 + 2 + 3 + ... + 100 = 5050 — Gauss ne 8 saal mein instantly solve kiya tha ⚡",
  "Badhiya magic: 111,111,111 × 111,111,111 = 12,345,678,987,654,321",
];

(function mathFactsInit() {
  const factEl   = document.getElementById('mathFact');
  const nextBtn  = document.getElementById('factNext');
  if (!factEl || !nextBtn) return;

  let idx = Math.floor(Math.random() * MATH_FACTS.length);
  factEl.textContent = MATH_FACTS[idx];

  function showNext() {
    idx = (idx + 1) % MATH_FACTS.length;
    factEl.style.opacity = '0';
    setTimeout(() => {
      factEl.textContent = MATH_FACTS[idx];
      factEl.style.opacity = '1';
    }, 250);
  }

  nextBtn.addEventListener('click', showNext);
  setInterval(showNext, 8000);
})();

/* ════════════════════════════════════════════════════════════
   EXPRESSION DISPLAY — converts internal expression to HTML
════════════════════════════════════════════════════════════ */
function toDisplay(expr) {
  // Single-pass replacement: tokens are matched left-to-right so already-emitted
  // HTML is never re-scanned, preventing </span> closing tags from being corrupted.
  return expr.replace(
    /asin\(|acos\(|atan\(|sinh\(|cosh\(|tanh\(|sin\(|cos\(|tan\(|log2\(|log\(|ln\(|cbrt\(|sqrt\(|floor\(|ceil\(|abs\(|nCr\(|PI|EU|\*|\/|\+|-|\^|\(|\)|%|!/g,
    match => {
      switch (match) {
        case '*':      return '<span class="op">×</span>';
        case '/':      return '<span class="op">÷</span>';
        case '+':      return '<span class="op">+</span>';
        case '-':      return '<span class="op">−</span>';
        case '^':      return '<span class="op">^</span>';
        case 'PI':     return '<span class="sci">π</span>';
        case 'EU':     return '<span class="sci">e</span>';
        case 'asin(':  return '<span class="sci">sin⁻¹(</span>';
        case 'acos(':  return '<span class="sci">cos⁻¹(</span>';
        case 'atan(':  return '<span class="sci">tan⁻¹(</span>';
        case 'sinh(':  return '<span class="sci">sinh(</span>';
        case 'cosh(':  return '<span class="sci">cosh(</span>';
        case 'tanh(':  return '<span class="sci">tanh(</span>';
        case 'sin(':   return '<span class="sci">sin(</span>';
        case 'cos(':   return '<span class="sci">cos(</span>';
        case 'tan(':   return '<span class="sci">tan(</span>';
        case 'log2(':  return '<span class="sci">log₂(</span>';
        case 'log(':   return '<span class="sci">log(</span>';
        case 'ln(':    return '<span class="sci">ln(</span>';
        case 'cbrt(':  return '<span class="sci">∛(</span>';
        case 'sqrt(':  return '<span class="sci">√(</span>';
        case 'floor(': return '<span class="sci">⌊</span>';
        case 'ceil(':  return '<span class="sci">⌈</span>';
        case 'abs(':   return '<span class="sci">|</span>';
        case 'nCr(':   return '<span class="sci">nCr(</span>';
        case '(':      return '<span class="br">(</span>';
        case ')':      return '<span class="br">)</span>';
        case '%':      return '<span class="sci">%</span>';
        case '!':      return '<span class="sci">!</span>';
        default:       return match;
      }
    }
  );
}

/* ════════════════════════════════════════════════════════════
   EXPRESSION EVAL — converts internal notation to valid JS
════════════════════════════════════════════════════════════ */
function toEval(expr) {
  let e = expr;
  e = e.replace(/\^/g, '**');
  e = e.replace(/(\d+\.?\d*)!/g, 'factorial($1)');
  e = e.replace(/%/g, '/100');
  return e;
}

/* ════════════════════════════════════════════════════════════
   SAFE EVALUATOR — sandboxed Function() with math helpers
════════════════════════════════════════════════════════════ */
let isDeg = true;   // DEG/RAD state (used in evalSafe)

function evalSafe(expr) {
  if (/[^0-9+\-*/.()%^!a-zA-Z_\s,]/.test(expr)) throw new Error('Invalid input');

  const helpers = `
    const PI    = ${Math.PI};
    const EU    = ${Math.E};
    const sin   = x => Math.sin(${isDeg ? 'x * Math.PI / 180' : 'x'});
    const cos   = x => Math.cos(${isDeg ? 'x * Math.PI / 180' : 'x'});
    const tan   = x => Math.tan(${isDeg ? 'x * Math.PI / 180' : 'x'});
    const asin  = x => (${isDeg ? 'Math.asin(x) * 180 / Math.PI' : 'Math.asin(x)'});
    const acos  = x => (${isDeg ? 'Math.acos(x) * 180 / Math.PI' : 'Math.acos(x)'});
    const atan  = x => (${isDeg ? 'Math.atan(x) * 180 / Math.PI' : 'Math.atan(x)'});
    const sinh  = x => Math.sinh(x);
    const cosh  = x => Math.cosh(x);
    const tanh  = x => Math.tanh(x);
    const log   = x => Math.log10(x);
    const log2  = x => Math.log2(x);
    const ln    = x => Math.log(x);
    const sqrt  = x => Math.sqrt(x);
    const cbrt  = x => Math.cbrt(x);
    const abs   = x => Math.abs(x);
    const floor = x => Math.floor(x);
    const ceil  = x => Math.ceil(x);
    function nCr(n, r) {
      if (r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) return NaN;
      if (r === 0 || r === n) return 1;
      r = Math.min(r, n - r);
      let res = 1;
      for (let i = 0; i < r; i++) res = res * (n - i) / (i + 1);
      return Math.round(res);
    }
    function factorial(n) {
      if (n < 0 || !Number.isInteger(n)) throw new Error('Invalid factorial');
      if (n > 170) return Infinity;
      if (n <= 1) return 1;
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    }
  `;
  // eslint-disable-next-line no-new-func
  return Function('"use strict";' + helpers + 'return (' + expr + ')')();
}

/* ════════════════════════════════════════════════════════════
   NUMBER FORMATTING
════════════════════════════════════════════════════════════ */
function formatResult(num) {
  if (!isFinite(num)) return num > 0 ? '∞' : '−∞';
  const precise = parseFloat(num.toPrecision(12));
  return precise.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

/* ════════════════════════════════════════════════════════════
   CALCULATOR — DOM refs & state
════════════════════════════════════════════════════════════ */
const display      = document.getElementById('display');
const prevExprEl   = document.getElementById('prevExpr');
const currExprEl   = document.getElementById('currExpr');
const currResultEl = document.getElementById('currResult');
const memIndicator = document.getElementById('memIndicator');
const sciGrid      = document.getElementById('sciGrid');
const historyPanel = document.getElementById('historyPanel');
const historyList  = document.getElementById('historyList');
const themePanel   = document.getElementById('themePanel');
const degRadBtn    = document.getElementById('degRadBtn');
const toast        = document.getElementById('toast');
const progStrip    = document.getElementById('progStrip');

let calcInput  = '';
let memory     = 0;
let memHasVal  = false;
let isSci      = false;
let justEvaled = false;
let calcHistory = JSON.parse(localStorage.getItem('calcHistory') || '[]');

/* ════════════════════════════════════════════════════════════
   PROGRAMMER STRIP — HEX / BIN / OCT
════════════════════════════════════════════════════════════ */
function updateProgStrip(num) {
  if (!isFinite(num) || !Number.isInteger(num) || num < -2147483648 || num > 4294967295) {
    progStrip.classList.remove('visible');
    return;
  }
  const n    = Math.trunc(num);
  const sign = n < 0 ? '-' : '';
  const abv  = Math.abs(n);
  document.querySelector('#progHex .prog-val').textContent = sign + '0x' + abv.toString(16).toUpperCase();
  document.querySelector('#progBin .prog-val').textContent = sign + abv.toString(2);
  document.querySelector('#progOct .prog-val').textContent = sign + '0o' + abv.toString(8);
  progStrip.classList.add('visible');
}

document.querySelectorAll('.prog-item').forEach(item => {
  item.addEventListener('click', () => {
    const val = item.querySelector('.prog-val').textContent;
    if (!val) return;
    navigator.clipboard?.writeText(val)
      .then(() => showToast('Copied: ' + val))
      .catch(() => showToast('Copy failed'));
  });
});

/* ════════════════════════════════════════════════════════════
   LIVE PREVIEW
════════════════════════════════════════════════════════════ */
function updateLiveResult() {
  if (!calcInput) {
    currResultEl.textContent = '0';
    currResultEl.className   = '';
    progStrip.classList.remove('visible');
    return;
  }
  try {
    const val = evalSafe(toEval(calcInput));
    if (val !== undefined && isFinite(val)) {
      currResultEl.textContent = formatResult(val);
      currResultEl.className   = 'live';
      updateProgStrip(val);
    }
  } catch { /* silent during typing */ }
}

/* ════════════════════════════════════════════════════════════
   CORE KEY HANDLER
════════════════════════════════════════════════════════════ */
function handleKey(value) {

  /* Clear */
  if (value === 'clear') {
    calcInput = '';
    prevExprEl.textContent   = '';
    currExprEl.innerHTML     = '';
    currResultEl.textContent = '0';
    currResultEl.className   = '';
    progStrip.classList.remove('visible');
    justEvaled = false;
    return;
  }

  /* Backspace */
  if (value === 'backspace') {
    if (justEvaled) { calcInput = ''; justEvaled = false; }
    const tokens = [
      'asin(','acos(','atan(',
      'sinh(','cosh(','tanh(',
      'sin(','cos(','tan(',
      'log2(','log(','ln(',
      'cbrt(','sqrt(',
      'floor(','ceil(','abs(','nCr(',
      'PI','EU'
    ];
    let removed = false;
    for (const t of tokens) {
      if (calcInput.endsWith(t)) { calcInput = calcInput.slice(0, -t.length); removed = true; break; }
    }
    if (!removed) calcInput = calcInput.slice(0, -1);
    currExprEl.innerHTML = toDisplay(calcInput);
    updateLiveResult();
    return;
  }

  /* Equals */
  if (value === '=') {
    if (!calcInput) return;
    try {
      const result    = evalSafe(toEval(calcInput));
      if (!isFinite(result)) throw new Error('Overflow');
      const formatted = formatResult(result);
      const exprText  = currExprEl.innerText || calcInput;

      addToHistory(exprText, formatted, calcInput);

      prevExprEl.textContent   = exprText + ' =';
      currExprEl.innerHTML     = '';
      currResultEl.textContent = formatted;
      currResultEl.className   = 'computed';
      updateProgStrip(result);
      calcInput  = result.toString();
      justEvaled = true;
    } catch { shakeDisplay('Error'); }
    return;
  }

  /* Auto-brackets */
  if (value === 'brackets') {
    if (justEvaled) { calcInput = ''; justEvaled = false; }
    const opens  = (calcInput.match(/\(/g) || []).length;
    const closes = (calcInput.match(/\)/g) || []).length;
    calcInput += (opens === closes) ? '(' : ')';
    currExprEl.innerHTML = toDisplay(calcInput);
    updateLiveResult();
    return;
  }

  /* 1/x */
  if (value === '1/x') {
    if (!calcInput) return;
    try {
      const val    = evalSafe(toEval(calcInput));
      const result = 1 / val;
      calcInput = result.toString();
      currExprEl.innerHTML     = toDisplay(calcInput);
      currResultEl.textContent = formatResult(result);
      currResultEl.className   = 'computed';
      updateProgStrip(result);
      justEvaled = false;
    } catch { shakeDisplay('Error'); }
    return;
  }

  /* x² */
  if (value === '^2') {
    if (!calcInput) return;
    calcInput += '^2';
    currExprEl.innerHTML = toDisplay(calcInput);
    updateLiveResult();
    return;
  }

  /* All other keys */
  if (justEvaled && /^[0-9.]$/.test(value)) calcInput = '';
  justEvaled = false;

  if (validate(value)) {
    calcInput += value;
    currExprEl.innerHTML = toDisplay(calcInput);
    updateLiveResult();
  }
}

/* ════════════════════════════════════════════════════════════
   INPUT VALIDATION
════════════════════════════════════════════════════════════ */
function validate(value) {
  const last = calcInput.slice(-1);
  const ops  = ['+', '-', '*', '/', '^'];
  if (value === '.' && (last === '.' || calcInput === ''))  return false;
  if (value === '.' && /[+\-*/^(]/.test(last))              return false;
  if (ops.includes(value) && ops.includes(last))            return false;
  if (ops.includes(value) && calcInput === '')              return false;
  return true;
}

/* ════════════════════════════════════════════════════════════
   MEMORY  (MC / MR / M+ / M-)
════════════════════════════════════════════════════════════ */
function handleMemory(action) {
  const currentResult = parseFloat(currResultEl.textContent.replace(/,/g, ''));

  switch (action) {
    case 'mc':
      memory = 0; memHasVal = false;
      memIndicator.textContent = '';
      memIndicator.classList.remove('visible');
      showToast('Memory cleared');
      break;

    case 'mr':
      if (!memHasVal) { showToast('Memory is empty'); return; }
      if (justEvaled) { calcInput = ''; justEvaled = false; }
      calcInput += memory.toString();
      currExprEl.innerHTML = toDisplay(calcInput);
      updateLiveResult();
      showToast('Memory recalled: ' + formatResult(memory));
      break;

    case 'm+':
      if (isNaN(currentResult)) return;
      memory += currentResult; memHasVal = true;
      memIndicator.textContent = 'M: ' + formatResult(memory);
      memIndicator.classList.add('visible');
      showToast('M = ' + formatResult(memory));
      break;

    case 'm-':
      if (isNaN(currentResult)) return;
      memory -= currentResult; memHasVal = true;
      memIndicator.textContent = 'M: ' + formatResult(memory);
      memIndicator.classList.add('visible');
      showToast('M = ' + formatResult(memory));
      break;
  }
}

/* ════════════════════════════════════════════════════════════
   HISTORY
════════════════════════════════════════════════════════════ */
function addToHistory(expr, result, rawInput) {
  const entry = { expr, result, rawInput, time: Date.now() };
  calcHistory.unshift(entry);
  if (calcHistory.length > 50) calcHistory.pop();
  localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
  renderHistory();
}

function renderHistory() {
  if (!historyList) return;
  if (!calcHistory.length) {
    historyList.innerHTML = '<p class="empty-msg">No calculations yet.</p>';
    return;
  }
  historyList.innerHTML = calcHistory.map((h, i) => `
    <div class="history-item" data-index="${i}">
      <div class="h-expr">${h.expr}</div>
      <div class="h-result">= ${h.result}</div>
    </div>
  `).join('');
}

function clearHistory() {
  calcHistory = [];
  localStorage.removeItem('calcHistory');
  renderHistory();
  showToast('History cleared');
}

historyList && historyList.addEventListener('click', e => {
  const item = e.target.closest('.history-item');
  if (!item) return;
  const h = calcHistory[parseInt(item.dataset.index)];
  if (!h) return;
  calcInput = h.rawInput;
  currExprEl.innerHTML     = toDisplay(calcInput);
  currResultEl.textContent = h.result;
  currResultEl.className   = 'computed';
  justEvaled = true;
  historyPanel.classList.remove('open');
  showToast('Loaded: ' + h.expr);
  switchTab('calculator');
});

/* ════════════════════════════════════════════════════════════
   STATISTICS ENGINE
════════════════════════════════════════════════════════════ */
function computeStats(nums) {
  const n = nums.length;
  if (n === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const sum    = nums.reduce((a, b) => a + b, 0);
  const mean   = sum / n;

  const median = n % 2 === 1
    ? sorted[Math.floor(n / 2)]
    : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  const freq = {};
  nums.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const modes   = maxFreq > 1
    ? Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => +v)
    : [];

  const variance  = nums.reduce((a, x) => a + (x - mean) ** 2, 0) / n;
  const stddev    = Math.sqrt(variance);
  const sVariance = n > 1 ? nums.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1) : NaN;
  const sStddev   = Math.sqrt(sVariance);

  function quartile(arr, q) {
    const pos = (arr.length - 1) * q;
    const lo  = Math.floor(pos), hi = Math.ceil(pos);
    return lo === hi ? arr[lo] : arr[lo] + (arr[hi] - arr[lo]) * (pos - lo);
  }
  const q1  = quartile(sorted, 0.25);
  const q3  = quartile(sorted, 0.75);
  const iqr = q3 - q1;

  return {
    count: n, sum, mean, median,
    mode: modes.length ? modes.join(', ') : 'None',
    min: sorted[0], max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    q1, q3, iqr,
    variance:  +variance.toPrecision(10),
    stddev:    +stddev.toPrecision(10),
    sVariance: isNaN(sVariance) ? 'N/A (need ≥2)' : +sVariance.toPrecision(10),
    sStddev:   isNaN(sStddev)   ? 'N/A (need ≥2)' : +sStddev.toPrecision(10),
  };
}

function renderStats(stats) {
  const el = document.getElementById('statsResults');
  if (!el) return;
  if (!stats) {
    el.innerHTML = '<div class="stats-empty"><i class="bx bx-error-circle"></i><p>No valid numbers found.</p></div>';
    return;
  }

  const fmt = v => (typeof v === 'number' ? formatResult(v) : v);
  const row = (label, val, note) => `
    <div class="stat-row">
      <span class="stat-label">${label}${note ? `<small>${note}</small>` : ''}</span>
      <span class="stat-val">${fmt(val)}</span>
    </div>`;

  el.innerHTML = `
    <div class="stats-section-title"><i class="bx bx-trending-up"></i> Central Tendency</div>
    ${row('Count (n)', stats.count)}
    ${row('Sum', stats.sum)}
    ${row('Mean', stats.mean, 'μ = Σx / n')}
    ${row('Median', stats.median, 'Middle value')}
    ${row('Mode', stats.mode, 'Most frequent')}

    <div class="stats-section-title"><i class="bx bx-scatter-chart"></i> Spread</div>
    ${row('Minimum', stats.min)}
    ${row('Maximum', stats.max)}
    ${row('Range', stats.range, 'Max − Min')}
    ${row('Q1 (25th pct)', stats.q1)}
    ${row('Q3 (75th pct)', stats.q3)}
    ${row('IQR', stats.iqr, 'Q3 − Q1')}

    <div class="stats-section-title"><i class="bx bx-stats"></i> Variance &amp; Std Dev</div>
    ${row('Population σ²', stats.variance)}
    ${row('Population σ', stats.stddev)}
    ${row('Sample s²', stats.sVariance)}
    ${row('Sample s', stats.sStddev)}
  `;
}

/* Statistics events */
const statsCalcBtn = document.getElementById('statsCalcBtn');
if (statsCalcBtn) {
  statsCalcBtn.addEventListener('click', () => {
    const raw     = document.getElementById('statsInput').value;
    const numbers = raw.split(/[,\n\s]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));
    renderStats(computeStats(numbers));
  });
}

document.querySelectorAll('.stats-sample').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById('statsInput');
    if (input) input.value = btn.dataset.set;
  });
});

/* ════════════════════════════════════════════════════════════
   THEMES
════════════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('calcTheme', theme);
  document.querySelectorAll('.theme-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === theme);
  });
}

document.getElementById('btnTheme').addEventListener('click', e => {
  e.stopPropagation();
  themePanel.classList.toggle('open');
});

document.querySelectorAll('.theme-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    applyTheme(chip.dataset.theme);
    showToast(chip.dataset.theme[0].toUpperCase() + chip.dataset.theme.slice(1) + ' theme applied');
    setTimeout(() => themePanel.classList.remove('open'), 400);
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('#themePanel') && !e.target.closest('#btnTheme'))
    themePanel.classList.remove('open');
});

/* ════════════════════════════════════════════════════════════
   COPY RESULT
════════════════════════════════════════════════════════════ */
function copyResult() {
  const val = currResultEl.textContent;
  if (!val || val === '0') return;
  navigator.clipboard?.writeText(val.replace(/,/g, ''))
    .then(() => showToast('Copied: ' + val))
    .catch(() => showToast('Copy failed'));
}

currResultEl && currResultEl.addEventListener('click', copyResult);

/* ════════════════════════════════════════════════════════════
   ANIMATIONS & FEEDBACK
════════════════════════════════════════════════════════════ */
function shakeDisplay(msg) {
  if (!display) return;
  display.classList.add('shake');
  currResultEl.textContent = msg || 'Error';
  currResultEl.className   = '';
  setTimeout(() => {
    display.classList.remove('shake');
    if (!calcInput) currResultEl.textContent = '0';
    else updateLiveResult();
  }, 420);
}

function spawnRipple(el, e) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x    = (e ? e.clientX - rect.left  : rect.width  / 2) - size / 2;
  const y    = (e ? e.clientY - rect.top   : rect.height / 2) - size / 2;
  const r    = document.createElement('span');
  r.className     = 'ripple';
  r.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  el.appendChild(r);
  setTimeout(() => r.remove(), 550);
}

let toastTimer = null;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ════════════════════════════════════════════════════════════
   CALCULATOR — EVENT LISTENERS
════════════════════════════════════════════════════════════ */
/* Keys */
document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', e => {
    spawnRipple(key, e);
    handleKey(key.dataset.key);
  });
});

/* Memory buttons */
document.querySelectorAll('.mem-btn').forEach(btn => {
  btn.addEventListener('click', () => handleMemory(btn.dataset.mem));
});

/* History panel */
const btnHistory      = document.getElementById('btnHistory');
const btnCloseHistory = document.getElementById('btnCloseHistory');
const btnClearHistory = document.getElementById('btnClearHistory');

btnHistory      && btnHistory.addEventListener('click', e => {
  e.stopPropagation();
  historyPanel.classList.toggle('open');
});
btnCloseHistory && btnCloseHistory.addEventListener('click', () => historyPanel.classList.remove('open'));
btnClearHistory && btnClearHistory.addEventListener('click', clearHistory);

document.addEventListener('click', e => {
  if (!e.target.closest('#historyPanel') && !e.target.closest('#btnHistory'))
    historyPanel && historyPanel.classList.remove('open');
});

/* Scientific mode */
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    isSci = btn.dataset.mode === 'scientific';
    sciGrid && sciGrid.classList.toggle('open', isSci);
  });
});

/* DEG / RAD toggle */
degRadBtn && degRadBtn.addEventListener('click', () => {
  isDeg = !isDeg;
  degRadBtn.textContent = isDeg ? 'DEG' : 'RAD';
  showToast(isDeg ? 'Degrees mode' : 'Radians mode');
});

/* ════════════════════════════════════════════════════════════
   KEYBOARD SUPPORT
════════════════════════════════════════════════════════════ */
const KB_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '+':'+', '-':'-', '*':'*', '/':'/',
  '.':'.', '%':'%', '^':'^', '!':'!',
  'Enter':'=', '=':'=',
  'Backspace':'backspace',
  'Escape':'clear',
  'c':'clear',
};

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

  /* Tab shortcuts */
  if (e.key === 'h' || e.key === 'H') {
    switchTab('calculator');
    setTimeout(() => historyPanel && historyPanel.classList.toggle('open'), 100);
    return;
  }
  if (e.key === 'v' || e.key === 'V') { switchTab('vedic');      return; }
  if (e.key === 's' || e.key === 'S') { switchTab('stats');      return; }
  if (e.key === 't' || e.key === 'T') {
    themePanel.classList.toggle('open');
    return;
  }

  const mapped = KB_MAP[e.key];
  if (!mapped) return;
  e.preventDefault();

  // Auto-switch to calculator tab for digit / operator keys
  const activeTab = document.querySelector('.tab-section.active');
  if (activeTab && activeTab.id !== 'tab-calculator') switchTab('calculator');

  const btn = document.querySelector(`.key[data-key="${mapped}"]`);
  if (btn) {
    btn.classList.add('kb-flash');
    spawnRipple(btn);
    setTimeout(() => btn.classList.remove('kb-flash'), 160);
  }
  handleKey(mapped);
});

/* ════════════════════════════════════════════════════════════
   VEDIC MATHEMATICS — 16 SUTRAS DATA (Hinglish)
════════════════════════════════════════════════════════════ */
const SUTRAS = [
  {
    id: 1, name: "Ekadhikena Purvena", emoji: "🔼",
    meaning: "By one more than the previous one",
    use: "Numbers ending in 5 ka square instantly nikalna",
    explanation: "Yeh sutra tab use hota hai jab kisi number ka square nikalna ho jo 5 pe khatam hota ho. Trick simple hai — pehle wale digit(s) ko khud se ek zyada se multiply karo, phir result ke saath '25' chipka do. Bus! Calculator ki zaroorat hi nahi.",
    shortcut: "n5² = [n × (n+1)] followed by 25",
    steps: ["Number dekho — last digit 5 hai ya nahi","Remaining digits lo (5 se pehle wala part)","Un digits ko (khud + 1) se multiply karo","Result ke end mein '25' lagao","Yahi final answer hai — verify karo calculator se!"],
    stepEgs: ["35² → last digit = 5 ✓","35 → remaining = 3","3 × (3+1) = 3×4 = 12","12 ke baad '25' → 1225","35² = 1225 ✓"],
    examples: [
      {level:"Basic",    num:1, problem:"25² = ?", steps:["Last digit=5 ✓, remaining=2","2×(2+1)=2×3=6","6 ke baad '25' → 625","✅ 25² = 625"]},
      {level:"Basic",    num:2, problem:"35² = ?", steps:["Remaining=3","3×4=12","12+'25' → 1225","✅ 35² = 1225"]},
      {level:"Moderate", num:3, problem:"75² = ?", steps:["Remaining=7","7×8=56","56+'25' → 5625","✅ 75² = 5625"]},
      {level:"Hard",     num:4, problem:"115² = ?", steps:["Remaining=11","11×12=132","132+'25' → 13225","✅ 115² = 13225"]},
      {level:"Advanced", num:5, problem:"205² = ?", steps:["Remaining=20","20×21=420","420+'25' → 42025","✅ 205² = 42025"]},
    ]
  },
  {
    id: 2, name: "Nikhilam Navatashcaramam Dashatah", emoji: "🔟",
    meaning: "All from 9 and the last from 10",
    use: "Base (10, 100, 1000) ke paas numbers ka lightning-fast multiplication",
    explanation: "Jab do numbers kisi base (10, 100, 1000...) ke bahut paas hon, toh normal multiplication slow aur tedious hoti hai. Yeh sutra ek jabardast shortcut deta hai — dono numbers ki base se distance (deviation) nikalo, cross-subtract karo left part ke liye, aur deviations multiply karo right part ke liye. Dono parts combine karo — instant answer!",
    shortcut: "Answer = (A − dev_B) | (dev_A × dev_B)",
    steps: ["Suitable base lo — 10, 100, 1000 jo bhi paas ho","Har number ka deviation nikalo = Base − Number","Left part: Pehle number mein se doosre ka deviation ghataao","Right part: Dono deviations ko multiply karo","Right part mein utne digits rakhna jitna base mein zeros hain","Left | Right combine karo → Answer!"],
    stepEgs: ["96×94 → nearest base = 100","96→ dev=−4, 94→ dev=−6","Left: 96−6 = 90","Right: (−4)×(−6) = 24","24 has 2 digits ✓ (base=100 → 2 zeros)","90|24 = 9024 ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"9 × 8 = ?", steps:["Base=10, dev: 9→−1, 8→−2","Left: 9−2=7","Right: (−1)×(−2)=02","✅ 7|2 = 72"]},
      {level:"Basic",    num:2, problem:"98 × 96 = ?", steps:["Base=100, dev: −2, −4","Left: 98−4=94","Right: 2×4=08","✅ 94|08 = 9408"]},
      {level:"Moderate", num:3, problem:"97 × 98 = ?", steps:["Base=100, dev: −3, −2","Left: 97−2=95","Right: 3×2=06","✅ 9506"]},
      {level:"Hard",     num:4, problem:"103 × 104 = ?", steps:["Base=100, dev: +3, +4","Left: 103+4=107","Right: 3×4=12","✅ 107|12 = 10712"]},
      {level:"Advanced", num:5, problem:"998 × 997 = ?", steps:["Base=1000, dev: −2, −3","Left: 998−3=995","Right: 2×3=006","✅ 995|006 = 995006"]},
    ]
  },
  {
    id: 3, name: "Anurupyena", emoji: "⚖️",
    meaning: "Proportionality — by suitable proportion",
    use: "Koi bhi convenient base choose karke multiplication easy banana",
    explanation: "Kabhi kabhi numbers 100 ke paas nahi hote, jaise 48 ya 53. Nikhilam direct apply nahi hota. Anurupyena kehta hai — apne mann se koi bhi convenient base lo (50 = 100÷2, ya 40 = 4×10, etc.), Nikhilam jaisi trick karo, phir base ke ratio se result scale karo. Yeh sutra flexibility deta hai — ek master key hai multiplication ki!",
    shortcut: "Sub-base = convenient number, scale result by (sub-base / power-of-10)",
    steps: ["Numbers dekho, unke paas ka convenient number dhundho","Woh number sub-base banao (e.g., 50, 25, 500)","Har number ka sub-base se deviation nikalo","Cross add/subtract karo left part ke liye","Deviations multiply karo right part ke liye","Left part ko (sub-base / 10ⁿ) se scale karo","Combine karo → Final answer!"],
    stepEgs: ["48×47 → nearest convenient = 50","Sub-base = 50 (=100÷2)","48→ dev=−2, 47→ dev=−3","Left: 48−3 = 45","Right: (−2)×(−3)=6","Left scaled: 45×50 = 2250","2250+6 = 2256 ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"48 × 49 = ?", steps:["Sub-base=50, dev: −2,−1","Left: 48−1=47, Right: 2×1=02","Scale: 47×50=2350","✅ 2350+2 = 2352"]},
      {level:"Basic",    num:2, problem:"46 × 43 = ?", steps:["Sub-base=50, dev: −4,−7","Left: 46−7=39, Right: 4×7=28","Scale: 39×50=1950","✅ 1950+28 = 1978"]},
      {level:"Moderate", num:3, problem:"52 × 53 = ?", steps:["Sub-base=50, dev: +2,+3","Left: 52+3=55, Right: 2×3=06","Scale: 55×50=2750","✅ 2750+6 = 2756"]},
      {level:"Hard",     num:4, problem:"23 × 24 = ?", steps:["Sub-base=25 (=100÷4), dev: −2,−1","Left: 23−1=22, Right: 2×1=02","Scale: 22×25=550","✅ 550+2 = 552"]},
      {level:"Advanced", num:5, problem:"490 × 510 = ?", steps:["Sub-base=500, dev: −10,+10","Left: 490+10=500, Right: (−10)×(+10)=−100","Scale: 500×500=250000","✅ 250000−100 = 249900"]},
    ]
  },
  {
    id: 4, name: "Paravartya Yojayet", emoji: "🔄",
    meaning: "Transpose and adjust",
    use: "Fast division — especially jab divisor 9, 11, 12 jaisa ho",
    explanation: "Division normally sabse slow operation hoti hai. Paravartya sutra isko fast banata hai. Divisor ke leading digit ke baad wale digits ke signs palat do (transpose), phir dividend ke digits pe running multiplication karo. Yeh particularly 9, 11, 12, 21 jaise divisors pe kaafi effective hai. Ek baar practice ho gayi toh mental division mein koi nahi roka!",
    shortcut: "Divisor ke non-leading digits ke signs palto, running total banao",
    steps: ["Divisor likho, leading digit alag rakhna","Remaining digits ke signs palat do (positive → negative)","Dividend ka pehla digit seedha quotient mein likho","Woh digit × transposed divisor-digits → next dividend digits mein add karo","Process repeat karo har digit ke liye","Last mein jo bacha woh remainder hai"],
    stepEgs: ["1452÷12 → leading=1, remaining=2","Transpose: +2 → −2","1 → first quotient digit = 1","1×(−2)=−2; 4+(−2)=2 → next quotient = 2","Repeat: 2×(−2)=−4; 5+(−4)=1; 1×(−2)=−2; 2+(−2)=0","Remainder = 0 → 1452÷12 = 121 ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"121 ÷ 11 = ?", steps:["Transpose −1; 1→q=1","1×(−1)=−1; 2+(−1)=1→q=1","1×(−1)=−1; 1+(−1)=0 rem","✅ Quotient=11, remainder=0"]},
      {level:"Basic",    num:2, problem:"321 ÷ 9 = ?", steps:["Running total: 3|3+2=5|5+1=6","Quotient=35, Remainder=6","✅ 35 r 6"]},
      {level:"Moderate", num:3, problem:"1234 ÷ 11 = ?", steps:["Transpose −1; 1→1; 2−1=1; 3−1=2; 4−2=2 rem","✅ Quotient=112, Remainder=2"]},
      {level:"Hard",     num:4, problem:"1452 ÷ 12 = ?", steps:["Transpose −2; 1→1; 4−2=2; 5−4=1; 2−2=0","✅ Quotient=121, Remainder=0"]},
      {level:"Advanced", num:5, problem:"12345 ÷ 11 = ?", steps:["Transpose −1","1→1; 2−1=1; 3−1=2; 4−2=2; 5−2=3 rem","✅ Quotient=1122, Remainder=3"]},
    ]
  },
  {
    id: 5, name: "Shunyam Saamyasamuccaye", emoji: "0️⃣",
    meaning: "When the sum is the same, that sum is zero",
    use: "Equations instantly solve karna jab dono sides ka sum same ho",
    explanation: "Yeh sutra equations ke liye ek magical shortcut hai! Agar kisi equation mein dono sides ka 'samuccaya' (common factor ya sum of coefficients) equal hai, toh woh samuccaya directly zero set ho jaata hai. Matlab poori solving skip karke seedha answer! Quadratic equations bhi isse mein seconds mein solve ho jaate hain.",
    shortcut: "Agar LHS sum = RHS sum → woh sum = 0 → x seedha nikalega",
    steps: ["Equation ke dono sides likho","Constant terms check karo — kya dono taraf sum equal hai?","Agar haan, toh woh shared sum ko zero set karo","Directly x niklo","Original equation mein daalkar verify karo"],
    stepEgs: ["2x+5 = x+5 → dono sides likhein","Constants: LHS=5, RHS=5 → equal!","Sum same → variable part must cancel","2x−x = 5−5 → x=0","x=0: 2(0)+5=5, 1(0)+5=5 ✓"],
    examples: [
      {level:"Basic",    num:1, problem:"3x+5 = 2x+5 → x=?", steps:["Constants: 5=5 ✓","3x−2x = 5−5 = 0","✅ x = 0"]},
      {level:"Basic",    num:2, problem:"x+7 = x+7 → solution?", steps:["Dono sides same → identity","Sab x ke liye true","✅ Infinite solutions"]},
      {level:"Moderate", num:3, problem:"(x+3)+(x+5) = (x+2)+(x+6)", steps:["LHS constants: 3+5=8","RHS constants: 2+6=8 → Same!","✅ Identity — true for all x"]},
      {level:"Hard",     num:4, problem:"2(x+4) = 2x+8 → solution?", steps:["Expand: 2x+8 = 2x+8","Samuccaya equal → identity","✅ All values of x valid"]},
      {level:"Advanced", num:5, problem:"3(x+2)+4 = 2(x+2)+x+10 → x?", steps:["LHS: 3x+10, RHS: 2x+4+x+10=3x+14","3x+10 ≠ 3x+14 → no solution!","✅ Inconsistent equation"]},
    ]
  },
  {
    id: 6, name: "Anurupye Shunyamanyat", emoji: "📊",
    meaning: "If one is in ratio, the other is zero",
    use: "Simultaneous equations mein ratio check se instant solution",
    explanation: "Do equations ke system mein agar ek variable ke coefficients ka ratio doosre variable ke coefficients ke ratio ke barabar ho, toh ek variable zero ho jaata hai — directly! Yeh sutra dependent aur inconsistent systems ko ek second mein identify kar leta hai. Bahut kam log jaante hain yeh trick!",
    shortcut: "a₁/a₂ = b₁/b₂ = c₁/c₂ → Infinite solutions | a₁/a₂ = b₁/b₂ ≠ c₁/c₂ → No solution",
    steps: ["Do simultaneous equations ka coefficients likho","x-coefficients ka ratio nikalo: a₁ : a₂","y-coefficients ka ratio nikalo: b₁ : b₂","Constants ka ratio nikalo: c₁ : c₂","Teeno ratios compare karo","Agar a/a = b/b = c/c → Infinite solutions (dependent)","Agar a/a = b/b ≠ c/c → No solution (inconsistent)"],
    stepEgs: ["2x+3y=6, 4x+6y=12 → a:2,4 b:3,6 c:6,12","x-ratio: 2÷4 = 1:2","y-ratio: 3÷6 = 1:2","const-ratio: 6÷12 = 1:2","1:2 = 1:2 = 1:2 ✓","Teeno same → Infinite solutions","Agar const-ratio alag hota → No solution"],
    examples: [
      {level:"Basic",    num:1, problem:"2x+4y=8, 3x+6y=12 → solution?", steps:["Ratios: 2/3, 4/6=2/3, 8/12=2/3","Teeno same → Dependent","✅ Infinite solutions"]},
      {level:"Basic",    num:2, problem:"x+2y=3, 2x+4y=7 → solution?", steps:["x-ratio=1/2, y-ratio=1/2, const=3/7≠1/2","x/y same but const diff → No soln","✅ Inconsistent (parallel lines)"]},
      {level:"Moderate", num:3, problem:"3x+6y=9, x+2y=3 → solution?", steps:["3/1=3, 6/2=3, 9/3=3 → all same","✅ Infinite solutions (dependent)"]},
      {level:"Hard",     num:4, problem:"4x+6y=10, 6x+9y=15 → solution?", steps:["4/6=2/3, 6/9=2/3, 10/15=2/3","✅ Infinite solutions"]},
      {level:"Advanced", num:5, problem:"5x+10y=15, 3x+6y=10 → solution?", steps:["5/3, 10/6=5/3, 15/10=3/2≠5/3","x/y ratio same, const alag","✅ No solution (inconsistent)"]},
    ]
  },
  {
    id: 7, name: "Sankalana-Vyavakalanabhyam", emoji: "➕➖",
    meaning: "By addition and by subtraction",
    use: "Simultaneous equations ko add/subtract karke elegantly solve karna",
    explanation: "Yeh sutra simultaneous equations ke liye addition aur subtraction ka smart use karta hai. Dono equations ko add karo — ek naya simple equation milega. Phir subtract karo — aur naya equation milega. In do naye equations se variables bahut easily nikal aate hain. Yeh elimination method ka fast Vedic version hai — mentally bhi kar sakte ho!",
    shortcut: "Add equations → ek variable solve karo. Subtract → doosra!",
    steps: ["Dono equations likhein side by side","Step 1: Dono equations add karo → naya equation (A)","Step 2: Equation 2 ko Equation 1 se subtract karo → naya equation (B)","Equation (A) aur (B) se variables solve karo","Values original equations mein daalkhar verify karo"],
    stepEgs: ["5x+4y=9 aur 4x+5y=9 likhein","Add: 9x+9y=18 → x+y=2 ...(A)","Subtract: x−y=0 ...(B)","A+B: 2x=2 → x=1; y=1","Verify: 5+4=9 ✓, 4+5=9 ✓"],
    examples: [
      {level:"Basic",    num:1, problem:"x+y=5, x−y=1 → x,y=?", steps:["Add: 2x=6 → x=3","Subtract: 2y=4 → y=2","✅ x=3, y=2"]},
      {level:"Basic",    num:2, problem:"5x+4y=9, 4x+5y=9 → x,y=?", steps:["Add: 9(x+y)=18 → x+y=2","Subtract: x−y=0","✅ x=1, y=1"]},
      {level:"Moderate", num:3, problem:"3x+2y=16, 2x+3y=14 → x,y=?", steps:["Add: 5x+5y=30 → x+y=6","Subtract: x−y=2","✅ x=4, y=2"]},
      {level:"Hard",     num:4, problem:"6x+4y=20, 4x+6y=20 → x,y=?", steps:["Add: 10(x+y)=40 → x+y=4","Subtract: 2x−2y=0 → x=y","✅ x=2, y=2"]},
      {level:"Advanced", num:5, problem:"11x+9y=38, 9x+11y=42 → x,y=?", steps:["Add: 20(x+y)=80 → x+y=4","Subtract: 2x−2y=−4 → x−y=−2","✅ x=1, y=3"]},
    ]
  },
  {
    id: 8, name: "Puranapuranabhyam", emoji: "⬜",
    meaning: "By the completion or non-completion",
    use: "Quadratic equations solve karna — 'Completing the Square' ka Vedic version",
    explanation: "Yeh sutra 'completing the square' hai — Vedic style mein! Jab koi expression incomplete lage — jaise x² + 6x — toh kuch add/subtract karke use perfect square bana do: (x+3)². Yeh technique quadratic equations, conic sections, integration aur bahut zyada advanced math mein use hoti hai.",
    shortcut: "x² + bx → add (b/2)² → (x + b/2)² — Perfect square!",
    steps: ["Quadratic: ax² + bx + c = 0","Agar a ≠ 1 toh poora a se divide karo","Constant c ko RHS le jaao: x² + bx = −c","(b/2)² nikalo aur dono sides mein add karo","LHS → (x + b/2)² ban jaata hai","Square root lo dono sides ka","x nikalo!"],
    stepEgs: ["x²+8x+7=0 → a=1,b=8,c=7","a=1 ✓ (no division)","x²+8x = −7","(8/2)²=16 → add both sides","x²+8x+16=9 → (x+4)²=9","x+4 = ±3","x=−1 ya x=−7 ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"x²+4x+3=0 → x=?", steps:["x²+4x=−3","(4/2)²=4 → (x+2)²=1","x+2=±1","✅ x=−1 ya x=−3"]},
      {level:"Basic",    num:2, problem:"x²+6x+5=0 → x=?", steps:["x²+6x=−5","(3)²=9 → (x+3)²=4","x+3=±2","✅ x=−1 ya x=−5"]},
      {level:"Moderate", num:3, problem:"x²−8x+12=0 → x=?", steps:["x²−8x=−12","(−4)²=16 → (x−4)²=4","x−4=±2","✅ x=6 ya x=2"]},
      {level:"Hard",     num:4, problem:"x²−10x+16=0 → x=?", steps:["x²−10x=−16","(−5)²=25 → (x−5)²=9","x−5=±3","✅ x=8 ya x=2"]},
      {level:"Advanced", num:5, problem:"2x²−12x+10=0 → x=?", steps:["÷2: x²−6x+5=0","x²−6x=−5","(−3)²=9 → (x−3)²=4","x−3=±2","✅ x=5 ya x=1"]},
    ]
  },
  {
    id: 9, name: "Chalana-Kalanabhyam", emoji: "🔀",
    meaning: "Differences and Similarities / Sequential Motion",
    use: "Quadratic roots find karna — Sum & Product method",
    explanation: "Yeh sutra polynomial roots nikalne ke liye hai using 'differences and similarities'. Practical use: quadratic ax² + bx + c ke roots ki sum = −b/a aur product = c/a hoti hai. In do values se directly factors nikalo bina formula use kiye. Mental math mein yeh fastest quadratic solver hai!",
    shortcut: "Sum of roots = −b/a   |   Product of roots = c/a",
    steps: ["Quadratic ax² + bx + c = 0 likho","Sum of roots = −b/a nikalo","Product of roots = c/a nikalo","Do numbers dhundho jinka sum aur product match kare","Woh numbers roots hain!","Factors likhein: (x − root1)(x − root2)"],
    stepEgs: ["x²−7x+12=0 → a=1,b=−7,c=12","Sum = −(−7)/1 = 7","Product = 12/1 = 12","3+4=7 ✓, 3×4=12 ✓ → roots 3 aur 4","Roots are 3 aur 4","(x−3)(x−4)=0 ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"x²−3x+2=0 → x=?", steps:["Sum=3, Product=2","1+2=3, 1×2=2","✅ x=1 ya x=2"]},
      {level:"Basic",    num:2, problem:"x²−5x+6=0 → x=?", steps:["Sum=5, Product=6","2+3=5, 2×3=6","✅ x=2 ya x=3"]},
      {level:"Moderate", num:3, problem:"x²+x−12=0 → x=?", steps:["Sum=−1, Product=−12","3+(−4)=−1, 3×(−4)=−12","✅ x=3 ya x=−4"]},
      {level:"Hard",     num:4, problem:"x²−7x+12=0 → x=?", steps:["Sum=7, Product=12","3+4=7, 3×4=12","(x−3)(x−4)=0","✅ x=3 ya x=4"]},
      {level:"Advanced", num:5, problem:"2x²−5x+3=0 → x=?", steps:["a=2 → Product target = 2×3=6, Sum=5","2+3=5 ✓, 2×3=6 ✓","2x²−2x−3x+3 → 2x(x−1)−3(x−1)","✅ x=1 ya x=3/2"]},
    ]
  },
  {
    id: 10, name: "Yaavadunam", emoji: "📉",
    meaning: "Whatever the extent of its deficiency",
    use: "10, 100, 1000 ke paas numbers ka instant squaring",
    explanation: "Yeh sutra squaring ke liye Nikhilam ka special version hai. 'Yaavadunam' matlab 'jitni kami hai utna'. Number ki base se kitni kami (deficit) hai nikalo. Number mein se deficit ghataao → left part. Deficit ka square nikalo → right part. Combine karo — done! Yeh itna fast hai ki 997² bhi 5 seconds mein ho jaata hai!",
    shortcut: "n² = (n − deficit) | deficit²   (base ke paas numbers ke liye)",
    steps: ["Number lo jo 10, 100, 1000 ke paas ho","Nearest base identify karo","Deficit = Base − Number","Left part = Number − Deficit","Right part = Deficit² (utne digits jitne base mein zeros)","Left | Right = Answer!"],
    stepEgs: ["97² → 97 is near 100","Base = 100","Deficit = 100−97 = 3","Left = 97−3 = 94","Right = 3² = 09 (2 digits, base=100)","94|09 = 9409 ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"9² (near base 10) = ?", steps:["Base=10, Deficit=1","Left=9−1=8","Right=1²=1","✅ 8|1 = 81"]},
      {level:"Basic",    num:2, problem:"98² = ?", steps:["Base=100, Deficit=2","Left=96, Right=04","✅ 9604"]},
      {level:"Moderate", num:3, problem:"97² = ?", steps:["Base=100, Deficit=3","Left=94, Right=09","✅ 9409"]},
      {level:"Hard",     num:4, problem:"999² = ?", steps:["Base=1000, Deficit=1","Left=998, Right=001","✅ 998001"]},
      {level:"Advanced", num:5, problem:"9997² = ?", steps:["Base=10000, Deficit=3","Left=9994, Right=0009","✅ 99940009"]},
    ]
  },
  {
    id: 11, name: "Vyashtisamanstih", emoji: "🧩",
    meaning: "Individuality and Totality / Part and Whole",
    use: "Quadratic factorization — middle term splitting",
    explanation: "Yeh sutra individual parts aur unke whole ke beech relationship use karta hai. Quadratic ax² + bx + c ko factor karne ke liye — product = a×c nikalo, phir do aise numbers dhundho jinki sum = b aur product = a×c ho. Middle term ko un numbers se replace karo aur grouping karo. Yeh 'split the middle term' method ka proper Vedic naam hai!",
    shortcut: "Find p,q such that p+q = b  and  p×q = a×c",
    steps: ["ax² + bx + c mein a, b, c identify karo","Product P = a × c nikalo","Do numbers p aur q dhundho: p+q = b, p×q = P","Middle term bx ko (px + qx) se replace karo","Pehle do terms se common factor nikalo","Doosre do terms se bhi common factor nikalo","Common binomial factor niklo → Factored form!"],
    stepEgs: ["2x²+7x+3 → a=2, b=7, c=3","P = 2×3 = 6","p+q=7, p×q=6 → p=6, q=1","2x²+6x+x+3","2x(x+3)...","...+1(x+3) → common (x+3)","(x+3)(2x+1) ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"x²+5x+6 = ?", steps:["P=1×6=6; p+q=5: 2+3","x²+2x+3x+6 → x(x+2)+3(x+2)","✅ (x+2)(x+3)"]},
      {level:"Basic",    num:2, problem:"x²+7x+12 = ?", steps:["P=12; p+q=7: 3+4","x²+3x+4x+12 → x(x+3)+4(x+3)","✅ (x+3)(x+4)"]},
      {level:"Moderate", num:3, problem:"2x²+7x+3 = ?", steps:["P=6; p+q=7: 6+1","2x²+6x+x+3 → 2x(x+3)+1(x+3)","✅ (2x+1)(x+3)"]},
      {level:"Hard",     num:4, problem:"6x²+11x+3 = ?", steps:["P=18; p+q=11: 9+2","6x²+9x+2x+3 → 3x(2x+3)+1(2x+3)","✅ (3x+1)(2x+3)"]},
      {level:"Advanced", num:5, problem:"12x²−x−6 = ?", steps:["P=−72; p+q=−1: −9+8","12x²−9x+8x−6 → 3x(4x−3)+2(4x−3)","✅ (4x−3)(3x+2)"]},
    ]
  },
  {
    id: 12, name: "Shesanyankena Charamena", emoji: "🔢",
    meaning: "The remainders by the last digit",
    use: "Divisibility rules — 9, 3, aur 11 se divisible hai ya nahi instantly batao",
    explanation: "Yeh sutra number ke digits ke sum aur remainder ke beech relationship use karta hai. Aapko pura division karne ki zaroorat nahi — sirf digits ka sum nikalo aur divisibility seedha pata chal jaata hai. Yeh vedic mathematicians ka ek brilliant observation hai jo aaj bhi school mein padhaya jaata hai!",
    shortcut: "Digit sum → 9/3 check | Alternating digit sum → 11 check",
    steps: ["Number ke saare digits add karo","Sum agar 9 ka multiple → number 9 se divisible","Sum agar 3 ka multiple → number 3 se divisible","11 check ke liye: alternating sum nikalo (d1 − d2 + d3...)","Alternating sum agar 0 ya 11 ka multiple → 11 se divisible"],
    stepEgs: ["729 → digits 7,2,9","7+2+9=18 → 1+8=9 → div by 9 ✓","18 div by 3 ✓ (also div by 3)","11 check: 7−2+9=14 (not 0 or 11)","729 ÷ 11 ✗"],
    examples: [
      {level:"Basic",    num:1, problem:"Is 252 divisible by 3?", steps:["2+5+2=9","9÷3=3 ✓","✅ Yes, divisible by 3"]},
      {level:"Basic",    num:2, problem:"Is 999 divisible by 9?", steps:["9+9+9=27 → 2+7=9","9÷9=1 ✓","✅ Yes!"]},
      {level:"Moderate", num:3, problem:"Is 123456 divisible by 9?", steps:["1+2+3+4+5+6=21 → 2+1=3","3÷9 ✗ → Not divisible by 9","✅ But ÷3 = Yes (3 is mult of 3)"]},
      {level:"Hard",     num:4, problem:"Is 847 divisible by 11?", steps:["Alternating: 8−4+7=11","11÷11=1 ✓","✅ Yes! 847÷11=77"]},
      {level:"Advanced", num:5, problem:"Is 7654321 divisible by 11?", steps:["7−6+5−4+3−2+1=4","4 not divisible by 11","✅ No"]},
    ]
  },
  {
    id: 13, name: "Sopaantyadvayamantyam", emoji: "📐",
    meaning: "The ultimate and twice the penultimate",
    use: "Specific algebraic fractions simplify karna aur partial fractions",
    explanation: "Yeh sutra ek specific pattern wali algebraic fractions ke liye hai. Jab denominator mein consecutive terms ka product ho, toh quick mental method se partial fraction A aur B ke values nikalo bina tedious algebra ke. Iska use integration mein bhi bahut hota hai.",
    shortcut: "1/(AB): substitute x = −a for A, x = −b for B",
    steps: ["Partial fraction: 1/((x+a)(x+b)) = A/(x+a) + B/(x+b) form mein likhein","Dono sides (x+a) se multiply karo","x = −a rakhein → A ki value niklo","Dono sides (x+b) se multiply karo","x = −b rakhein → B ki value niklo","Final partial fraction likhein"],
    stepEgs: ["1/((x+2)(x+3)) → A/(x+2)+B/(x+3)","Multiply by (x+2)","x=−2: A=1/(−2+3)=1","Multiply by (x+3)","x=−3: B=1/(−3+2)=−1","1/(x+2) − 1/(x+3) ✅"],
    examples: [
      {level:"Basic",    num:1, problem:"1/((x+1)(x+2)) = ?", steps:["A/(x+1)+B/(x+2)","x=−1: A=1/1=1","x=−2: B=1/(−1)=−1","✅ 1/(x+1) − 1/(x+2)"]},
      {level:"Basic",    num:2, problem:"1/((x+1)(x+3)) = ?", steps:["x=−1: A=1/2","x=−3: B=−1/2","✅ (1/2)[1/(x+1) − 1/(x+3)]"]},
      {level:"Moderate", num:3, problem:"2/((x)(x+2)) = ?", steps:["A/x + B/(x+2)","x=0: A=2/2=1","x=−2: B=2/(−2)=−1","✅ 1/x − 1/(x+2)"]},
      {level:"Hard",     num:4, problem:"x/((x−1)(x+2)) = ?", steps:["A/(x−1)+B/(x+2)","x=1: A=1/3","x=−2: B=(−2)/(−3)=2/3","✅ (1/3)/(x−1) + (2/3)/(x+2)"]},
      {level:"Advanced", num:5, problem:"2x/((x−1)(x+2)) = ?", steps:["x=1: A=2/3","x=−2: B=2(−2)/(−3)=4/3","✅ (2/3)/(x−1) + (4/3)/(x+2)"]},
    ]
  },
  {
    id: 14, name: "Ekanyunena Purvena", emoji: "9️⃣",
    meaning: "By one less than the previous one",
    use: "9, 99, 999, 9999... se multiplication — fastest trick hai yeh!",
    explanation: "Yeh Ekadhikena ka opposite hai — ek zyada ki jagah ek kam! Jab kisi number ko 9, 99, 999 ya kisi all-nines number se multiply karna ho, yeh sutra kaafi fast hai. Logic: 9 = 10−1, 99 = 100−1. Number se 1 ghataao → left part, aur (Base − number) → right part. Combine karo!",
    shortcut: "n × (10ᵏ−1) = (n−1) | (10ᵏ − n)",
    steps: ["Number aur multiplier (9, 99, 999...) identify karo","Multiplier ka base identify karo: 9→10, 99→100, 999→1000","Left part = Number − 1","Right part = Base − Number","Left | Right combine karo → Final answer!"],
    stepEgs: ["5 × 99 → Number=5, Multiplier=99","99 = 100−1 → Base=100","Left = 5−1 = 4","Right = 100−5 = 95","Answer = 4|95 = 495"],
    examples: [
      { level:"Basic", num:1, problem:"5 × 99 = ?", steps:["99 = 100−1, Base = 100","Left = 5−1 = 4","Right = 100−5 = 95","✅ 4|95 = 495"] },
      { level:"Basic", num:2, problem:"78 × 99 = ?", steps:["99 = 100−1, Base = 100","Left = 78−1 = 77","Right = 100−78 = 22","✅ 77|22 = 7722"] },
      { level:"Moderate", num:3, problem:"654 × 999 = ?", steps:["999 = 1000−1, Base = 1000","Left = 654−1 = 653","Right = 1000−654 = 346","✅ 653|346 = 653346"] },
      { level:"Hard", num:4, problem:"123 × 9999 = ?", steps:["9999 = 10000−1, Base = 10000","Left = 123−1 = 122","Right = 10000−123 = 9877","✅ 122|9877 = 1229877"] },
      { level:"Advanced", num:5, problem:"376 × 999 = ?", steps:["999 = 1000−1, Base = 1000","Left = 376−1 = 375","Right = 1000−376 = 624","✅ 375|624 = 375624"] }
    ]
  },
  {
    id: 15, name: "Gunitasamuchyah", emoji: "✅",
    meaning: "Product of the sum = Sum of the product",
    use: "Digit Sum method se multiplication verify karna — instant error check!",
    explanation: "Yeh sutra verification ke liye sabse important hai! Koi bhi multiplication karne ke baad answer sahi hai ya nahi, yeh Beejank (digit sum) method se check karo. Dono numbers ke digit sums nikalo, multiply karo, phir actual answer ka digit sum nikalo — dono match hone chahiye! Ek second mein error pakad lo!",
    shortcut: "DS(A) × DS(B) → DS = DS(A×B) ... agar na mile → calculation galat!",
    steps: ["Dono numbers ke digit sums nikalo (repeatedly sum till single digit)","Un digit sums ko multiply karo","Agar product > 9 toh uska bhi digit sum nikalo","Answer ka digit sum nikalo","Dono match karte hain → Answer sahi! ✓","Nahi milta → Calculation mein galti hai!"],
    stepEgs: ["12 → 1+2=3, 4 → 4","DS1=3, DS2=4","3×4=12 → 1+2=3","48 → 4+8=12 → 3","3=3 ✅","If mismatch → recheck calculation"],
    examples: [
      { level:"Basic", num:1, problem:"Verify: 12 × 4 = 48", steps:["12 → 1+2 = 3","4 → 4","3 × 4 = 12 → 3","48 → 4+8 = 12 → 3","✅ 3 = 3 → Answer sahi!"] },
      { level:"Basic", num:2, problem:"Verify: 99 × 99 = 9801", steps:["99 → 18 → 9","99 → 18 → 9","9 × 9 = 81 → 9","9801 → 18 → 9","✅ 9 = 9 → Correct!"] },
      { level:"Moderate", num:3, problem:"Verify: 123 × 456 = 56088", steps:["123 → 6","456 → 15 → 6","6 × 6 = 36 → 9","56088 → 27 → 9","✅ 9 = 9 → Answer sahi!"] },
      { level:"Hard", num:4, problem:"Verify: 125 × 48 = 6000", steps:["125 → 8","48 → 12 → 3","8 × 3 = 24 → 6","6000 → 6","✅ 6 = 6 → Correct!"] },
      { level:"Advanced", num:5, problem:"Catch error: 99 × 11 = 1099 (?)", steps:["99 → 9","11 → 2","9 × 2 = 18 → 9","1099 → 19 → 10 → 1","✗ 9 ≠ 1 → Answer galat! Correct: 1089"] }
    ]
  },
  {
    id: 16, name: "Gunakasamuchyah", emoji: "🔍",
    meaning: "Factors of the sum = Sum of the factors",
    use: "Factorization verify karna — koi bhi value daalo aur check karo",
    explanation: "Yeh Gunitasamuchyah ka extension hai — sirf multiplication nahi, factorization bhi verify hoti hai isse. Agar tumne x² + 5x + 6 = (x+2)(x+3) factor kiya, toh koi bhi x ki value daalo dono mein — agar same answer aaye toh factorization correct hai! Exam mein apna answer verify karne ka yeh fastest method hai.",
    shortcut: "f(x) mein koi bhi x daalo. Factors mein same x daalo. Same answer → ✓",
    steps: ["Original expression aur factored form dono likhein","Koi bhi simple value lo: x = 1 ya x = 2","Woh value original expression mein daalo","Same value factored form mein daalo","Dono answers compare karo","Same? ✓ Factorization sahi. Different? ✗ Galti hai"],
    stepEgs: ["f(x)=x²+3x+2 and (x+1)(x+2)","Use x=1","LHS: 1+3+2=6","RHS: (2)(3)=6","6=6 ✅","Factorization confirmed!"],
    examples: [
      { level:"Basic", num:1, problem:"Verify: x²+3x+2 = (x+1)(x+2)", steps:["x=1: LHS = 1+3+2 = 6","x=1: RHS = (2)(3) = 6","x=0: LHS = 2, RHS = (1)(2) = 2","✅ Match! Factorization sahi!"] },
      { level:"Basic", num:2, problem:"Verify: x²+5x+6 = (x+2)(x+3)", steps:["x=1: LHS = 1+5+6 = 12","x=1: RHS = (3)(4) = 12","x=2: LHS = 4+10+6 = 20, RHS = (4)(5) = 20","✅ Factorization correct!"] },
      { level:"Moderate", num:3, problem:"Verify: 2x²+5x+3 = (2x+3)(x+1)", steps:["x=1: LHS = 2+5+3 = 10","x=1: RHS = 5×2 = 10 ✓","x=0: LHS = 3, RHS = 3×1 = 3 ✓","x=−1: LHS = 0, RHS = 1×0 = 0 ✓","✅ Factorization verified!"] },
      { level:"Hard", num:4, problem:"Verify: x³−6x²+11x−6 = (x−1)(x−2)(x−3)", steps:["x=0: LHS = −6, RHS = (−1)(−2)(−3) = −6 ✓","x=4: LHS = 64−96+44−6 = 6","x=4: RHS = (3)(2)(1) = 6 ✓","✅ Cubic factorization sahi!"] },
      { level:"Advanced", num:5, problem:"Find roots: x²−5x+6 = (x−2)(x−3)", steps:["x=2: LHS = 4−10+6 = 0, RHS = 0×(−1) = 0 ✓","x=3: LHS = 9−15+6 = 0, RHS = 1×0 = 0 ✓","x=1: LHS = 1−5+6 = 2 ≠ 0 (not a root)","✅ Roots are x=2 and x=3 confirmed!"] }
    ]
  }
];

/* ════════════════════════════════════════════════════════════
   VEDIC BASICS — Fundamentals for all 16 Sutras
════════════════════════════════════════════════════════════ */
const VEDIC_BASICS = {
  1: {
    hook: "75² = 5625. Mentally in 2 seconds! 7×8=56, add '25' → 5625. Any number ending in 5!",
    tricks: ["Formula: <strong>n5² = [n×(n+1)] then append '25'</strong>","35²: take 3, multiply by 4 → 12, append 25 → <strong>1225</strong>","65²: 6×7=42, append 25 → <strong>4225</strong>","Works for ANY ending-in-5 number: 15², 25², 105², 115², 205²..."],
    mnemonic: "🔼 <strong>Ek-adhik = ONE MORE</strong>. Take digit(s) before 5, multiply by ONE MORE than itself, then stick '25' at end!",
    realLife: ["📐", "Room: 35 feet × 35 feet = 1225 sq ft. Or 45m × 45m = 2025 sq m. Mental math in seconds!"],
    funFact: "This works because (10n+5)² = 100n(n+1) + 25. Pure algebra — ancient Indian mathematicians found this pattern thousands of years ago!"
  },
  2: {
    hook: "96 × 94 = 9024. Deviations from 100: −4 and −6. Left: 96−6=90. Right: 4×6=24. Done: 9024!",
    tricks: ["Deviations = Base − Number (negative if below, positive if above base)","<strong>Left part = either number − other's deviation</strong>","<strong>Right part = product of deviations</strong>","Right part digits = zeros in base (100→2 digits, 1000→3 digits)"],
    mnemonic: "🔟 <strong>Nikhilam = All from 9, last from 10</strong>. Deviation from base is your key number!",
    realLife: ["🛒", "Price: ₹97 × 96 items = ? Deviations −3, −4. Left: 97−4=93. Right: 12. Total: ₹9312!"],
    funFact: "This uses identity (100−a)(100−b) = 100(100−a−b) + ab. Ancient Indians embedded algebra in a simple 3-step method!"
  },
  3: {
    hook: "48 × 47 near 50 (not 100). Use 50 as sub-base, deviations −2 and −3. Left: 45×50=2250. Right: 6. Total: 2256!",
    tricks: ["When numbers aren't near 10/100/1000, choose a <strong>convenient sub-base</strong>","Common sub-bases: <strong>50 (=100÷2), 25 (=100÷4), 500, 250</strong>","Apply Nikhilam method → then scale left part by sub-base/10ⁿ","Sub-base 50: left×½ | Sub-base 25: left×¼"],
    mnemonic: "⚖️ <strong>Anurupyena = by proportion</strong>. Choose smart base → Nikhilam → scale proportionally!",
    realLife: ["🛍️", "52 items at ₹53 each = ? Sub-base 50: deviations +2,+3. Left: 55×50=2750. Right: 6. Total: ₹2756!"],
    funFact: "This sutra shows ancient Indian mathematicians understood 'change of base' — a concept modern computers use in binary/hex/decimal conversions!"
  },
  4: {
    hook: "1452 ÷ 12 = 121. Transpose 12 → leading 1, flip remaining 2 → −2. Running multiply → 121 in seconds!",
    tricks: ["<strong>Transpose: reverse signs of all digits AFTER the first digit of divisor</strong>","12 → leading=1, remaining=2 → transpose to −2","Write first dividend digit as first quotient digit","quotient digit × transposed value → add to next dividend digit"],
    mnemonic: "🔄 <strong>Paravartya = transpose and adjust</strong>. Flip the sign of divisor's non-leading digits!",
    realLife: ["💰", "Split ₹1452 among 12 people = ? Paravartya: 121 rupees each, instantly!"],
    funFact: "This is essentially synthetic division — a method reinvented by Western mathematicians in the 19th century. India had it 1500+ years earlier!"
  },
  5: {
    hook: "3x+5 = 2x+5 → constants both sides = 5 (same!) → x = 0. Zero appears by Shunyam! Instant!",
    tricks: ["Check if 'samuccaya' (common sum/factor) is same on both sides","If constants equal on both sides → variable part = 0 → <strong>x = 0</strong>","If ALL coefficients and constants match → identity → <strong>infinite solutions</strong>","Applicable to linear, quadratic, and higher-degree equations"],
    mnemonic: "0️⃣ <strong>Shunyam = zero</strong>. When samuccaya matches both sides → set that samuccaya to zero!",
    realLife: ["⚖️", "Balance sheet: both sides have same fixed costs → profit − loss = 0 → break-even point found instantly!"],
    funFact: "This sutra anticipates modern 'trivial solutions' and 'identically zero polynomials' — fundamental concepts of abstract algebra!"
  },
  6: {
    hook: "2x+3y=6, 4x+6y=12 → ratios 2:4=3:6=6:12 = 1:2 all same → Infinite solutions! No solving needed!",
    tricks: ["<strong>a₁/a₂ = b₁/b₂ = c₁/c₂ → Infinite solutions</strong> (same line)","<strong>a₁/a₂ = b₁/b₂ ≠ c₁/c₂ → No solution</strong> (parallel lines)","a₁/a₂ ≠ b₁/b₂ → Unique solution (lines intersect)","Just ratio check — no actual solving needed!"],
    mnemonic: "📊 <strong>Ratio check</strong>: x-ratio = y-ratio = const-ratio → same line. x=y ≠ const → parallel!",
    realLife: ["🗺️", "Two navigation equations give same location (dependent lines) or impossible point (inconsistent) → ratio method tells instantly!"],
    funFact: "This is equivalent to the 'rank of matrix' method in linear algebra — a concept Western math formalized only in the 19th century!"
  },
  7: {
    hook: "5x+4y=9 aur 4x+5y=9. Add → 9x+9y=18 → x+y=2. Subtract → x−y=0. Therefore x=1, y=1!",
    tricks: ["<strong>Add</strong> both equations → eliminates or simplifies one variable","<strong>Subtract</strong> one from other → another simple relationship","Works fastest when coefficients are <strong>symmetric or swapped</strong>","Two new equations → two variables solved elegantly!"],
    mnemonic: "➕➖ <strong>Sankalana + Vyavakalana</strong>: Add AND subtract → two new equations → both unknowns found!",
    realLife: ["🛒", "5 apples+4 oranges=₹9, 4 apples+5 oranges=₹9. By this sutra: apple=orange=₹1 in seconds!"],
    funFact: "This technique was rediscovered as 'Gaussian Elimination' by Carl Friedrich Gauss in 18th century — India used it in Vedic times!"
  },
  8: {
    hook: "x²+8x+7=0. Move 7 to right: x²+8x=−7. Add (4)²=16 both sides. (x+4)²=9. x=−1 or x=−7!",
    tricks: ["Move constant to RHS: x²+bx = −c","Add <strong>(b/2)²</strong> to BOTH sides","LHS becomes perfect square: <strong>(x + b/2)²</strong>","Take ± square root → two x values"],
    mnemonic: "⬜ <strong>Pura-na = completion</strong>. FILL IN the missing piece to complete the perfect square!",
    realLife: ["📡", "Parabolic satellite dishes: complete-the-square to find focal point for maximum signal reception!"],
    funFact: "Al-Khwarizmi (800 AD) called this method 'al-jabr' (completing) — which became the word '<strong>ALGEBRA</strong>'! This sutra predates him significantly!"
  },
  9: {
    hook: "x²−7x+12=0. Sum of roots=7, product=12. Which pair? 3+4=7 and 3×4=12 → Roots: 3 and 4!",
    tricks: ["<strong>Sum of roots = −b/a</strong>","<strong>Product of roots = c/a</strong>","Find two numbers matching BOTH sum AND product","Works like a puzzle — think of factor pairs of product!"],
    mnemonic: "🔀 <strong>Chalana-Kalana = motion and differences</strong>. Roots 'move apart' by sum, 'combine' by product!",
    realLife: ["🌱", "Garden area x(x−7)=12 sq m → x²−7x−12=0 → find dimensions using sum/product roots method!"],
    funFact: "Vieta's formulas (François Viète, 1591 AD) state exactly sum=−b/a and product=c/a. Vedic sutras embedded this principle much earlier!"
  },
  10: {
    hook: "97² = 9409. Base 100, deficit=3. Left: 97−3=94. Right: 3²=09 (2 digits). Answer: 9409 in 3 sec!",
    tricks: ["For numbers near base: <strong>deficit = base − number</strong>","Left = <strong>number − deficit</strong>","Right = <strong>deficit²</strong> (padded to base-zeros digits)","For numbers ABOVE base: use surplus, ADD to left instead"],
    mnemonic: "📉 <strong>Yaavadunam = whatever the deficiency</strong>. Deficit → left. Deficit² → right. Combine!",
    realLife: ["📱", "Screen resolution: 998 × 997 pixels. Base 1000, dev −2,−3. Left: 995. Right: 006. = 995006!"],
    funFact: "This is a special application of (a−b)² = a² − 2ab + b². Ancient Indians packaged the formula into a 3-step mental process!"
  },
  11: {
    hook: "2x²+7x+3: Product P = 2×3=6. Find p+q=7, pq=6 → 6,1. Split: 2x²+6x+x+3 → (2x+1)(x+3)!",
    tricks: ["Find <strong>P = a×c</strong> (outer × inner coefficients)","Find two numbers: <strong>sum = b AND product = P</strong>","<strong>Split middle term</strong> using those two numbers","Factor by grouping → two binomial factors!"],
    mnemonic: "🧩 <strong>Vyashti-samanstih = individual and total</strong>. Split middle → group → factor common binomial!",
    realLife: ["🏗️", "Area = 2x²+7x+3 sq m → dimensions are (2x+1) by (x+3). Factor to find rectangle sides!"],
    funFact: "This 'splitting the middle term' is the most universal factoring method in high school algebra worldwide — its roots trace back to Vedic mathematics!"
  },
  12: {
    hook: "Is 847 divisible by 11? Alternating sum: 8−4+7=11 → divisible! No actual division performed!",
    tricks: ["Div by 9: <strong>digit sum divisible by 9</strong>","Div by 3: digit sum divisible by 3","Div by 11: <strong>alternating sum (d1−d2+d3−...) divisible by 11</strong>","Repeat digit sum till single digit for easy 9/3 check"],
    mnemonic: "🔢 <strong>Shesha = remainder</strong>. Digit sum REVEALS the remainder when dividing by 9 — no division needed!",
    realLife: ["💳", "Credit card Luhn algorithm uses digit sums to validate card numbers — SAME concept as this sutra! Banks use Vedic-style math!"],
    funFact: "ISBN book numbers use alternating digit sums (like 11-divisibility) to detect printing errors. This sutra lives in everyday objects!"
  },
  13: {
    hook: "1/((x+2)(x+3)) = A/(x+2) + B/(x+3). Put x=−2 for A, x=−3 for B. No system of equations needed!",
    tricks: ["Cover each factor, plug in its root → get coefficient directly","To find A: multiply by (x+a), then set <strong>x = −a</strong>","To find B: multiply by (x+b), set <strong>x = −b</strong>","Each coefficient found independently and instantly"],
    mnemonic: "📐 <strong>Sopaantya = penultimate</strong>. Cover each factor, substitute its root → coefficient appears!",
    realLife: ["🔬", "Partial fractions essential in Physics (circuits), Engineering (signals), Calculus (integration). This sutra is a daily power tool!"],
    funFact: "This is the 'Heaviside cover-up method' by Oliver Heaviside (1890s). The exact same technique existed in Vedic sutras centuries earlier!"
  },
  14: {
    hook: "654 × 999 = 653346. Left = 654−1 = 653. Right = 1000−654 = 346. Combine: 653|346 = 653346!",
    tricks: ["n × 9 = (n−1) | (10−n)","n × 99 = (n−1) | (100−n)","<strong>n × 999 = (n−1) | (1000−n)</strong>","Digits in right part = digits in the all-9s number"],
    mnemonic: "9️⃣ <strong>Ekanyunena = ONE LESS</strong>. Left = number MINUS ONE. Right = base MINUS number. Simple!",
    realLife: ["🛒", "EMI: ₹654 per day for 999 days = ₹653,346. Mental math: 654−1=653, 1000−654=346 → ₹653,346!"],
    funFact: "Works because n×(10ᵏ−1) = n×10ᵏ − n = (n−1)×10ᵏ + (10ᵏ−n). Beautifully elegant algebra in a 2-step trick!"
  },
  15: {
    hook: "123×456=56088. Verify: DS(123)=6, DS(456)=6, 6×6=36→9. DS(56088)=27→9. MATCH ✓ Answer is right!",
    tricks: ["<strong>Digit sum (Beejank)</strong>: add all digits, repeat till single digit","DS(A) × DS(B) = DS(A×B) — always!","Mismatch → calculation <strong>definitely wrong</strong>","Match → calculation <strong>probably right</strong> (catches most errors)"],
    mnemonic: "✅ <strong>Gunita-samuchyah = product verification</strong>. DS of product = product of DS values!",
    realLife: ["🧾", "Long bills: shopkeeper uses digit sum check to spot calculation errors before handing receipt!"],
    funFact: "Based on modular arithmetic mod 9 — every integer ≡ its digit sum (mod 9). Ancient Indians discovered modular arithmetic through this sutra!"
  },
  16: {
    hook: "x²+3x+2 = (x+1)(x+2)? Put x=1: LHS=6, RHS=2×3=6. Put x=2: LHS=12, RHS=12. Match → Correct!",
    tricks: ["Substitute simple x values (0, 1, 2) into <strong>both</strong> original and factored forms","If they match → factorization is correct","If they don't match → error found!","Test with x=0 AND x=1 for double confirmation"],
    mnemonic: "🔍 <strong>Gunaka-samuchyah = verification by factors</strong>. Plug in numbers → same answer both sides → done!",
    realLife: ["💻", "Software testing: same concept! Input test values to verify code output. This sutra is the world's first unit testing method!"],
    funFact: "This evaluation method is called 'polynomial interpolation' in modern math. René Descartes formalized it in 1637 — Vedic sutras used it much earlier!"
  }
};

/* ════════════════════════════════════════════════════════════
   VEDIC SIDEBAR — render sutra list & content
════════════════════════════════════════════════════════════ */
function renderSutraList() {
  const list = document.getElementById('sutraList');
  if (!list) return;

  list.innerHTML = SUTRAS.map(s => `
    <div class="vs-item" data-id="${s.id}" title="${s.name}">
      <span class="vs-num">${s.id}</span>
      <div class="vs-name">${s.emoji} ${s.name}</div>
    </div>
  `).join('');

  list.addEventListener('click', e => {
    const item = e.target.closest('.vs-item');
    if (!item) return;
    list.querySelectorAll('.vs-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    renderSutraContent(parseInt(item.dataset.id));
  });
}

function renderSutraContent(id) {
  const el = document.getElementById('vedicMain');
  if (!el) return;
  const s = SUTRAS.find(x => x.id === id);
  if (!s) return;
  const b = VEDIC_BASICS[id] || {};

  /* ── Basics panel HTML ── */
  function buildBasicsHTML() {
    let html = '<div class="basics-card">';
    if (b.hook) {
      html += `<div class="basics-hook">💬 ${b.hook}</div>`;
    } else {
      html += `<div class="basics-hook">💬 ${s.explanation}</div>`;
    }
    if (b.realLife) {
      html += `<div class="reallife-box"><span class="reallife-icon">${b.realLife[0]}</span><span>${b.realLife[1]}</span></div>`;
    }
    if (b.tricks && b.tricks.length) {
      html += `<div><div class="basics-section-title">✨ Memory Tricks &amp; Shortcuts</div><div class="basics-tricks-list">`;
      b.tricks.forEach((tr, i) => {
        html += `<div class="basics-trick-item"><span class="basics-trick-num">${i + 1}</span><span>${tr}</span></div>`;
      });
      html += `</div></div>`;
    }
    if (b.mnemonic) {
      html += `<div class="basics-mnemonic"><div class="basics-mnemonic-title">🧠 Mnemonic — Dil Se Yaad Karo!</div><div class="basics-mnemonic-text">${b.mnemonic}</div></div>`;
    }
    if (b.funFact) {
      html += `<div class="fun-fact-box"><span>💡</span><span>${b.funFact}</span></div>`;
    }
    html += `<div style="text-align:center;font-size:0.78rem;color:var(--text-faint);padding:0.5rem 0">
      Click <strong style="color:var(--sci-color)">⚡ Method Steps</strong> for step-by-step walkthrough, or <strong style="color:var(--sci-color)">🎯 Examples</strong> to practice!
    </div>`;
    html += '</div>';
    return html;
  }

  /* ── Steps panel HTML ── */
  const stepsHtml = s.steps.map((st, i) => {
    const eg = s.stepEgs && s.stepEgs[i]
      ? `<span class="sc-step-eg">eg: ${s.stepEgs[i]}</span>` : '';
    return `<div class="sc-step"><div class="sc-step-body"><span>${st}</span>${eg}</div></div>`;
  }).join('');

  /* ── Examples panel HTML ── */
  const LEVEL_CLS = { Basic:'ex-basic', Moderate:'ex-moderate', Hard:'ex-hard', Advanced:'ex-advanced' };
  const examplesHtml = (s.examples || []).map(ex => {
    const stH = ex.steps.map((st, i) =>
      `<div class="sc-step${i === ex.steps.length - 1 ? ' hl' : ''}">${st}</div>`
    ).join('');
    return `<div class="sc-example apt-example">
        <span class="ex-level-badge ${LEVEL_CLS[ex.level] || ''}">${ex.level}</span>
        <div class="sc-ex-head"><i class="bx bx-calculator"></i>&nbsp; Example ${ex.num}</div>
        <div class="sc-ex-prob">${ex.problem}</div>
        <div class="sc-steps">${stH}</div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="sutra-card">

      <!-- Header -->
      <div class="sc-header">
        <div class="sc-header-text">
          <div class="sc-num">Sutra ${s.id} of 16</div>
          <div class="sc-name">${s.name}</div>
          <div class="sc-meaning">"${s.meaning}"</div>
        </div>
        <div class="sc-emoji-badge">${s.emoji}</div>
      </div>

      <!-- Use + Shortcut -->
      <div class="sc-info-row">
        <div class="sc-use">
          <i class="bx bx-target-lock"></i>
          <span>${s.use}</span>
        </div>
        <div class="sc-shortcut">
          <i class="bx bx-bulb"></i>
          <span>${s.shortcut}</span>
        </div>
      </div>

      <!-- Explanation -->
      <p class="sc-explanation">${s.explanation}</p>

      <!-- Topic Tabs -->
      <div class="topic-tabs">
        <button class="topic-tab-btn active" data-panel="basics">📚 Basics</button>
        <button class="topic-tab-btn" data-panel="steps">⚡ Method Steps</button>
        <button class="topic-tab-btn" data-panel="examples">🎯 Examples</button>
      </div>

      <!-- Basics Panel -->
      <div class="topic-tab-panel active" data-panel="basics">
        ${buildBasicsHTML()}
      </div>

      <!-- Steps Panel -->
      <div class="topic-tab-panel" data-panel="steps">
        <div class="sc-example sc-steps-full">
          <div class="sc-ex-head"><i class="bx bx-list-ol"></i>&nbsp; Method — Steps</div>
          <div class="sc-steps">${stepsHtml}</div>
        </div>
      </div>

      <!-- Examples Panel -->
      <div class="topic-tab-panel" data-panel="examples">
        <div class="apt-examples-grid">${examplesHtml}</div>
      </div>

      <!-- Try It — always visible -->
      <div class="sc-try-it" id="scTryIt">
        <div class="sc-try-label"><i class="bx bx-bolt-circle"></i> Try It Yourself — Quick Calculator</div>
        <div class="sc-try-row">
          <input class="sc-try-input" id="scTryInput" type="text"
                 placeholder="e.g.  75^2  or  sqrt(144) + 3^2  or  sin(45)" spellcheck="false" autocomplete="off" />
          <button class="sc-try-btn" id="scTryBtn"><i class="bx bx-send"></i> Calculate</button>
        </div>
        <div class="sc-try-result" id="scTryResult"></div>
      </div>

    </div>
  `;
  el.scrollTop = 0;

  /* Tab switching */
  el.querySelectorAll('.topic-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.topic-tab-btn').forEach(b2 => b2.classList.remove('active'));
      el.querySelectorAll('.topic-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      el.querySelector(`.topic-tab-panel[data-panel="${btn.dataset.panel}"]`).classList.add('active');
    });
  });

  /* Wire Try-It button */
  const tryInput  = document.getElementById('scTryInput');
  const tryBtn    = document.getElementById('scTryBtn');
  const tryResult = document.getElementById('scTryResult');

  function runTry() {
    const raw = tryInput.value.trim();
    if (!raw) return;
    try {
      const val = evalSafe(toEval(raw));
      tryResult.textContent = isFinite(val) ? '= ' + formatResult(val) : (val > 0 ? '= ∞' : '= −∞');
      tryResult.style.color = 'var(--action-color)';
    } catch {
      tryResult.textContent = '⚠ Invalid expression — check brackets and function names';
      tryResult.style.color = 'var(--op-color)';
    }
  }

  tryBtn  && tryBtn.addEventListener('click', runTry);
  tryInput && tryInput.addEventListener('keydown', e => { if (e.key === 'Enter') runTry(); });
}

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
(function init() {
  /* Theme */
  applyTheme(localStorage.getItem('calcTheme') || 'dark');

  /* History */
  renderHistory();

  /* Memory */
  const savedMem = localStorage.getItem('calcMemory');
  if (savedMem !== null) {
    memory = parseFloat(savedMem);
    if (memory !== 0 && memIndicator) {
      memHasVal = true;
      memIndicator.textContent = 'M: ' + formatResult(memory);
      memIndicator.classList.add('visible');
    }
  }

  /* Vedic sidebar */
  renderSutraList();

  /* Aptitude sidebar — called after APTITUDE_TOPICS is declared (see bottom of file) */

  /* Canvas — init only if home is the starting tab */
  const homeActive = document.getElementById('tab-home');
  if (homeActive && homeActive.classList.contains('active')) {
    initCanvas();
  }
})();

window.addEventListener('beforeunload', () => {
  localStorage.setItem('calcMemory', memory);
});

/* ════════════════════════════════════════════════════════════
   QUANTITATIVE APTITUDE — 38 TOPICS DATA
   Each topic: steps + examples array with 4-5 levels
   Levels: Basic(2) · Moderate(1-2) · Hard(1) · Advanced(1)
════════════════════════════════════════════════════════════ */
const APTITUDE_TOPICS = [

  /* ── NUMBERS ── */
  {
    id:1, name:"Computation of Whole Numbers", emoji:"🔢", cat:"Numbers",
    shortcut:"BODMAS: Brackets → Of → Division → Multiplication → Addition → Subtraction",
    hint:"2 + 3 * 4 - 1",
    explanation:"Whole numbers 0 se shuru hote hain aur infinite tak jaate hain. Inka calculation mein sabse important rule BODMAS hai. Is rule ko follow karo toh koi bhi complex expression galat nahi hogi!",
    steps:["Expression mein brackets check karo — pehle solve karo","'Of' matlab multiplication — percent/fraction ke saath aata hai","Division aur Multiplication left to right solve karo","Addition aur Subtraction left to right solve karo","Negative numbers ka sign dhyan se rakhna"],
    stepEgs:["(3+5)×2 → pehle (3+5)=8, phir 8×2=16","½ of 10 = ½×10 = 5","6÷2×3 → left to right: 3×3=9 ✓ (6÷6=1 ✗)","10−3+2 → left to right: 7+2=9 ✓ (10−5=5 ✗)","5+(−3) = 5−3 = 2"],
    examples:[
      {level:"Basic",    num:1, problem:"Solve: 5 + 3 × 2", steps:["Multiply first: 3×2=6","5+6=11","✅ = 11"]},
      {level:"Basic",    num:2, problem:"Solve: 20 − 4 ÷ 2", steps:["Division: 4÷2=2","20−2=18","✅ = 18"]},
      {level:"Moderate", num:3, problem:"Solve: 18 + 6 ÷ 2 × 3 − 4", steps:["6÷2=3, then 3×3=9","18+9−4=23","✅ = 23"]},
      {level:"Hard",     num:4, problem:"Solve: (5+3)² − 4×3 + √16", steps:["Bracket: 8²=64","Multiply: 4×3=12","√16=4","64−12+4=56","✅ = 56"]},
      {level:"Advanced", num:5, problem:"Solve: 3 of 1/3 of 270 + (12−8)²", steps:["1/3 of 270=90, 3 of 90=270","(12−8)²=16","270+16=286","✅ = 286"]},
    ]
  },
  {
    id:2, name:"Decimals", emoji:"🔸", cat:"Numbers",
    shortcut:"Decimal → Fraction: 0.25 = 25/100 = 1/4 | Move decimal: ×10 shifts right, ÷10 shifts left",
    hint:"0.125 * 8",
    explanation:"Decimal numbers mein point ke baad wale digits tenths, hundredths, thousandths represent karte hain. Exam mein decimals ko fractions mein convert karo — calculation bahut easy ho jaati hai! 0.5 = 1/2, 0.25 = 1/4, 0.125 = 1/8 yaad rakhlo.",
    steps:["Decimal ko fraction mein convert karo (0.5=1/2, 0.25=1/4, etc.)","Recurring decimals: x = 0.333... → 10x = 3.333... → 9x=3 → x=1/3","Multiplication: 2.5 × 4 = 25 × 4 ÷ 10 = 10","Division: 1.5 ÷ 0.3 = 15 ÷ 3 = 5 (dono ×10)","Comparison: same digits tak 0 add karo"],
    stepEgs:["0.75 = 75/100 = 3/4; 0.125 = 1/8","x=0.666…, 10x=6.666…, 9x=6, x=2/3","3.6×5 = 36×5÷10 = 180÷10 = 18","2.4÷0.06 = 240÷6 = 40","0.8 vs 0.75 → 0.80 > 0.75 ✓"],
    examples:[
      {level:"Basic",    num:1, problem:"0.5 × 8 = ?", steps:["0.5 = 1/2","1/2 × 8 = 4","✅ = 4"]},
      {level:"Basic",    num:2, problem:"1.5 ÷ 0.3 = ?", steps:["Dono ×10 → 15 ÷ 3","= 5","✅ = 5"]},
      {level:"Moderate", num:3, problem:"0.0625 × 64 = ?", steps:["0.0625 = 1/16","1/16 × 64 = 4","✅ = 4"]},
      {level:"Hard",     num:4, problem:"3.6 ÷ 0.04 + 0.5² = ?", steps:["3.6 ÷ 0.04 = 360 ÷ 4 = 90","0.5² = 0.25","90 + 0.25 = 90.25","✅ = 90.25"]},
      {level:"Advanced", num:5, problem:"Recurring 0.272727… = fraction?", steps:["Let x = 0.272727…","100x = 27.272727…","100x − x = 27 → 99x = 27","x = 27/99 = 3/11","✅ = 3/11"]},
    ]
  },
  {
    id:3, name:"Fractions", emoji:"½", cat:"Numbers",
    shortcut:"a/b + c/d = (ad+bc)/bd | a/b × c/d = ac/bd | a/b ÷ c/d = a/b × d/c",
    hint:"3/4 + 5/6",
    explanation:"Fractions mein numerator (upar) aur denominator (neeche) hota hai. Addition ke liye LCM nikalo, multiplication seedha karo, division mein doosre fraction ko ulta karke multiply karo. Mixed fractions ko improper mein convert karo phir calculate karo.",
    steps:["Addition/Subtraction: LCM of denominators nikalo","Equivalent fractions banao same denominator ke saath","Numerators add/subtract karo","Multiplication: seedha numerator × numerator, denominator × denominator","Division: doosre fraction ko flip karke multiply karo"],
    stepEgs:["1/2 + 1/3 → LCM(2,3) = 6","1/2 = 3/6, 1/3 = 2/6 (same denominator)","3/6 + 2/6 = 5/6","2/3 × 3/4 = 6/12 = 1/2","2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6"],
    examples:[
      {level:"Basic",    num:1, problem:"1/2 + 1/3 = ?", steps:["LCM of 2,3 = 6","3/6 + 2/6 = 5/6","✅ = 5/6"]},
      {level:"Basic",    num:2, problem:"3/4 × 8/9 = ?", steps:["= (3×8)/(4×9) = 24/36","= 2/3","✅ = 2/3"]},
      {level:"Moderate", num:3, problem:"2/3 + 3/4 = ?", steps:["LCM = 12","8/12 + 9/12 = 17/12","= 1 5/12","✅ = 1 5/12"]},
      {level:"Hard",     num:4, problem:"5/6 ÷ 5/12 − 1/4 = ?", steps:["5/6 × 12/5 = 2","2 − 1/4 = 8/4 − 1/4","= 7/4 = 1¾","✅ = 7/4"]},
      {level:"Advanced", num:5, problem:"2⅓ × 1½ ÷ 3½ = ?", steps:["Convert: 7/3 × 3/2 ÷ 7/2","= 7/3 × 3/2 × 2/7","= (7×3×2)/(3×2×7) = 42/42 = 1","✅ = 1"]},
    ]
  },
  {
    id:4, name:"Relationships between Numbers", emoji:"🔗", cat:"Numbers",
    shortcut:"HCF × LCM = Product of two numbers | LCM always ≥ HCF",
    hint:"12 * 18",
    explanation:"Numbers ke beech relationships mein HCF (sabse bada common factor) aur LCM (sabse chhota common multiple) sabse important hain. Exam mein shortcut: HCF × LCM = N1 × N2. Division method se HCF aur prime factorization se LCM fastest hai!",
    steps:["HCF: Bade number ko chhote se divide karo, remainder se phir divide — jab remainder 0 ho woh HCF","LCM: HCF × LCM = N1 × N2 → LCM = (N1×N2)/HCF","Divisibility: 2 → last digit even, 3 → digit sum divisible by 3, 9 → digit sum div by 9","11 → alternating digit sum divisible by 11","Co-prime numbers: HCF = 1"],
    stepEgs:["HCF(18,12): 18÷12=R6, 12÷6=R0 → HCF=6","LCM = 12×18÷6 = 36","252: last digit 2 (÷2✓), 2+5+2=9 (÷9✓)","121: 1−2+1=0 → divisible by 11 ✓","8 aur 9: HCF=1 → co-prime"],
    examples:[
      {level:"Basic",    num:1, problem:"Is 987 divisible by 3?", steps:["9+8+7 = 24 → 2+4 = 6","6 ÷ 3 = 2 ✓","✅ Yes, divisible by 3"]},
      {level:"Basic",    num:2, problem:"HCF of 12 and 18 = ?", steps:["18 = 12×1 + 6","12 = 6×2 + 0 → HCF = 6","✅ HCF = 6"]},
      {level:"Moderate", num:3, problem:"LCM of 12 and 18 = ?", steps:["HCF = 6 (from above)","LCM = 12×18 ÷ 6 = 36","✅ LCM = 36"]},
      {level:"Hard",     num:4, problem:"HCF of 3 numbers: 24, 36, 60 = ?", steps:["HCF(24,36): 36=24×1+12, 24=12×2+0 → 12","HCF(12,60): 60=12×5+0 → 12","✅ HCF = 12"]},
      {level:"Advanced", num:5, problem:"LCM = 180, HCF = 6, one number = 12. Other = ?", steps:["HCF × LCM = N1 × N2","6 × 180 = 12 × N2","N2 = 1080 ÷ 12 = 90","✅ Other number = 90"]},
    ]
  },

  /* ── ARITHMETIC ── */
  {
    id:5, name:"Profit and Loss", emoji:"💰", cat:"Arithmetic",
    shortcut:"Profit% = Profit/CP×100 | SP = CP×(100+P%)/100 | CP = SP×100/(100+P%)",
    hint:"500 * 120 / 100",
    explanation:"CP (Cost Price) woh price hai jis pe cheez khareedte hain, SP (Selling Price) jis pe bechte hain. SP > CP = Profit, SP < CP = Loss. Exam trick: SP seedha formula se nikalo — CP × (100 ± %) ÷ 100. Successive discount/profit ke liye: multiply karo percentages.",
    steps:["CP aur SP identify karo","Profit = SP − CP (agar SP > CP)","Profit% = (Profit ÷ CP) × 100","SP from CP: SP = CP × (100+P%) ÷ 100","CP from SP: CP = SP × 100 ÷ (100+P%)"],
    stepEgs:["Buy ₹200, sell ₹250 → CP=200, SP=250","SP>CP → Profit = 250−200 = ₹50","Profit% = (50÷200)×100 = 25%","CP=500, P%=20 → SP=500×120÷100 = ₹600","SP=₹720, P%=20 → CP=720×100÷120 = ₹600"],
    examples:[
      {level:"Basic",    num:1, problem:"CP=₹200, SP=₹250. Profit%?", steps:["Profit = 250−200 = ₹50","Profit% = 50/200×100 = 25%","✅ Profit = 25%"]},
      {level:"Basic",    num:2, problem:"CP=₹500, Loss=10%. SP=?", steps:["SP = 500×(100−10)/100","= 500×90/100 = ₹450","✅ SP = ₹450"]},
      {level:"Moderate", num:3, problem:"20% profit pe SP=₹720. CP=?", steps:["CP = 720×100/(100+20)","= 720×100/120 = ₹600","✅ CP = ₹600"]},
      {level:"Hard",     num:4, problem:"Article 20% loss pe becha. Agar 60 zyada milte toh 20% profit. CP=?", steps:["Loss SP = CP×80/100","Profit SP = CP×120/100","Diff = 60: CP×120/100 − CP×80/100 = 60","CP×40/100 = 60 → CP = ₹150","✅ CP = ₹150"]},
      {level:"Advanced", num:5, problem:"Two articles: one at 20% profit, one at 20% loss, same SP ₹480. Net P/L%?", steps:["CP1 = 480×100/120 = ₹400","CP2 = 480×100/80 = ₹600","Total CP = ₹1000, Total SP = ₹960","Loss = 40 → Loss% = 40/1000×100 = 4%","✅ Net Loss = 4% (formula: loss% = (x/10)² = 4%)"]},
    ]
  },
  {
    id:6, name:"Discount", emoji:"🏷️", cat:"Arithmetic",
    shortcut:"Discount = MP − SP | Discount% = Discount/MP×100 | SP = MP×(100−D%)/100",
    hint:"1000 * 85 / 100",
    explanation:"Discount hamesha Marked Price (MP) pe milta hai, CP pe nahi — yeh bahut important hai! Successive discounts ke liye trick: 20% aur 10% = single discount of 28% (100−20=80, 80−10%of80=72, so 28% off). Formula: SP = MP × (100−D%)/100.",
    steps:["MP aur Discount% identify karo","Discount amount = MP × D% ÷ 100","SP = MP − Discount","Ya directly: SP = MP × (100−D%) ÷ 100","Successive discounts: (100−d1)/100 × (100−d2)/100 × MP"],
    stepEgs:["Tag ₹1000, 20% off → MP=1000, D%=20","Discount = 1000×20÷100 = ₹200","SP = 1000−200 = ₹800","SP = 1000×80÷100 = ₹800 (faster!)","20% then 10%: 1000×0.8×0.9 = ₹720"],
    examples:[
      {level:"Basic",    num:1, problem:"MP=₹800, Discount=15%. SP=?", steps:["SP = 800×(100−15)/100","= 800×85/100 = ₹680","✅ SP = ₹680"]},
      {level:"Basic",    num:2, problem:"MP=₹500, SP=₹425. Discount%?", steps:["Discount = 500−425 = ₹75","D% = 75/500×100 = 15%","✅ Discount = 15%"]},
      {level:"Moderate", num:3, problem:"20% then 10% successive discounts. Effective%?", steps:["After 20%: 80 remains","After 10%: 80×90/100 = 72%","Net discount = 100−72 = 28%","✅ Effective = 28%"]},
      {level:"Hard",     num:4, problem:"MP=₹2000, 25% off, then 10% off. SP=?", steps:["After 25%: 2000×75/100 = ₹1500","After 10%: 1500×90/100 = ₹1350","✅ SP = ₹1350"]},
      {level:"Advanced", num:5, problem:"SP=₹1080 after 10% discount. MP=? Profit agar CP=₹800?", steps:["MP×90/100 = 1080 → MP = ₹1200","Profit = 1080−800 = ₹280","Profit% = 280/800×100 = 35%","✅ MP=₹1200, Profit=35%"]},
    ]
  },
  {
    id:7, name:"Partnership Business", emoji:"🤝", cat:"Arithmetic",
    shortcut:"Profit ratio = Capital × Time (for each partner)",
    hint:"12000 * 6",
    explanation:"Partnership mein profit ka baantna Capital aur Time pe depend karta hai. Simple partnership mein time same hota hai toh sirf capital ka ratio lelo. Compound partnership mein Capital × Time nikalo. Yeh ratio hi profit division ka basis hai!",
    steps:["Har partner ka Capital × Time nikalo","Ye values ka ratio lo","Total profit × ek ka ratio / total ratio = us partner ka share","Sleeping partner vs working partner — problem mein clearly mention hoga","Agar time mein bhi investment change ho toh alag alag period ke liye calculate karo"],
    stepEgs:["A: ₹5000×6mo=30000, B: ₹4000×9mo=36000","Ratio = 30000:36000 = 5:6","Profit ₹1100 → A's share = 5/11×1100 = ₹500","Working partner gets salary first, rest split by ratio","A: ₹2000×3mo + ₹4000×9mo = 6000+36000 = 42000"],
    examples:[
      {level:"Basic",    num:1, problem:"A=₹5000, B=₹3000, C=₹2000. Profit=₹1000. B's share?", steps:["Ratio = 5:3:2, Total = 10 parts","B = 3/10×1000 = ₹300","✅ B's share = ₹300"]},
      {level:"Basic",    num:2, problem:"A:B invest 2:3. Profit=₹5000. A's share?", steps:["A gets 2/5 of profit","= 2/5×5000 = ₹2000","✅ A's share = ₹2000"]},
      {level:"Moderate", num:3, problem:"A=₹12000 (6 months), B=₹8000 (9 months). Profit=₹2600. A's share?", steps:["A: 12000×6 = 72000","B: 8000×9 = 72000","Ratio = 1:1","A's share = 2600/2 = ₹1300","✅ = ₹1300"]},
      {level:"Hard",     num:4, problem:"A=₹10000 full year. B=₹15000 (8 months). Profit=₹9200. B's share?", steps:["A: 10000×12 = 120000","B: 15000×8 = 120000","Ratio = 1:1 → B = 9200/2","✅ B's share = ₹4600"]},
      {level:"Advanced", num:5, problem:"A=₹6000 (6mo), B joins later ₹8000 (4mo), C=₹4000 (whole year). Profit=₹8800. C's share?", steps:["A: 6000×6=36000","B: 8000×4=32000","C: 4000×12=48000","Total=116000, C ratio=48/116=12/29","C share = 8800×12/29 = ₹3641","✅ ≈ ₹3641"]},
    ]
  },
  {
    id:8, name:"Mixture and Alligation", emoji:"⚗️", cat:"Arithmetic",
    shortcut:"Alligation Cross: (d−m):(m−c) = ratio of quantities | Cheaper:Dearer = (Dearer−Mean):(Mean−Cheaper)",
    hint:"(80 - 60) / (60 - 40)",
    explanation:"Alligation ka cross method fastest technique hai! Ek cross banao — ऊपर dono values, beech mein mean value, phir cross difference nikalo. Yeh differences hi mixing ratio hoga. Milk-water problems, salary average problems — sab isme aate hain!",
    steps:["Cheaper value (c), Dearer value (d), aur Mean (m) identify karo","Cross banao: c aur d upar, m beech mein","Left difference: d − m (neeche right)","Right difference: m − c (neeche left)","Ratio = (d−m) : (m−c)"],
    stepEgs:["₹20/kg + ₹80/kg → blend ₹50/kg: c=20, d=80, m=50","c=20 upar left, d=80 upar right, m=50 centre","d−m = 80−50 = 30 (cheaper ki quantity)","m−c = 50−20 = 30 (dearer ki quantity)","Ratio = 30:30 = 1:1 (equal mix)"],
    examples:[
      {level:"Basic",    num:1, problem:"₹40/kg aur ₹80/kg mix karke ₹60/kg. Ratio?", steps:["d−m = 80−60 = 20","m−c = 60−40 = 20","Ratio = 20:20 = 1:1","✅ Equal quantities"]},
      {level:"Basic",    num:2, problem:"40% aur 60% alcohol mix → 50%. Ratio?", steps:["d−m = 60−50 = 10","m−c = 50−40 = 10","Ratio = 1:1","✅ Equal parts"]},
      {level:"Moderate", num:3, problem:"Milk ₹30/L, Water free. Mixed ₹25/L. Water%?", steps:["c=0, d=30, m=25","Water parts = 30−25 = 5","Milk parts = 25−0 = 25","Water% = 5/30×100 = 16.67%","✅ = 16.67%"]},
      {level:"Hard",     num:4, problem:"20L mixture: milk:water = 3:1. 5L water add. New ratio?", steps:["Milk = 15L, Water = 5L","Add 5L water → Water = 10L","New ratio = 15:10 = 3:2","✅ New ratio = 3:2"]},
      {level:"Advanced", num:5, problem:"Vessel A: milk:water=5:3, Vessel B: 2:3. Mixed equal volumes. Final ratio?", steps:["A → milk=5/8, water=3/8","B → milk=2/5, water=3/5","Equal volumes: milk= 5/8+2/5 = 41/40","water = 3/8+3/5 = 39/40","Ratio = 41:39","✅ Milk:Water = 41:39"]},
    ]
  },
  {
    id:9, name:"Time and Distance", emoji:"🚗", cat:"Arithmetic",
    shortcut:"Distance = Speed × Time | Speed in km/h → m/s: ×5/18 | m/s → km/h: ×18/5",
    hint:"60 * 5/18",
    explanation:"D = S × T — yeh teen formula se sab solve hota hai. Trains ke problems mein: relative speed, length of train + platform. Boats mein: upstream = u−v, downstream = u+v. Speed units convert karna mat bhoolna — km/h to m/s × 5/18!",
    steps:["D=S×T, S=D/T, T=D/S identify karo","km/h to m/s: × 5/18","Two objects same direction: relative speed = |S1−S2|","Two objects opposite direction: relative speed = S1+S2","Train length problems: length = speed × time to cross"],
    stepEgs:["Speed=60km/h, Time=2hr → D=60×2=120 km","36 km/h × 5/18 = 10 m/s","Train 60, Car 40, same dir → relative = 20 km/h","Car A 60 + Car B 40, opposite → relative = 100 km/h","Train 100m, crosses pole in 5s → speed=20 m/s"],
    examples:[
      {level:"Basic",    num:1, problem:"Car 60km/h, 3 hours. Distance?", steps:["D = S×T = 60×3","= 180 km","✅ Distance = 180 km"]},
      {level:"Basic",    num:2, problem:"72 km/h = ? m/s", steps:["× 5/18","= 72×5/18 = 20 m/s","✅ = 20 m/s"]},
      {level:"Moderate", num:3, problem:"Train 72km/h, 200m long. Pole cross karne ka time?", steps:["Speed = 72×5/18 = 20 m/s","Distance = 200m (only train length)","Time = 200/20 = 10 sec","✅ = 10 seconds"]},
      {level:"Hard",     num:4, problem:"Train 200m, platform 300m, speed 90km/h. Platform cross time?", steps:["Speed = 90×5/18 = 25 m/s","Distance = 200+300 = 500m","Time = 500/25 = 20 sec","✅ = 20 seconds"]},
      {level:"Advanced", num:5, problem:"A (60km/h) aur B (40km/h) opposite directions. A starts 1hr late. Meet kab?", steps:["B covers 40km extra in 1hr","After A starts: relative speed = 60+40 = 100 km/h","They close 40km gap at 100 km/h","Time = 40/100 = 0.4 hr = 24 min","✅ Meet after 24 min from A's start"]},
    ]
  },
  {
    id:10, name:"Time and Work", emoji:"⚙️", cat:"Arithmetic",
    shortcut:"1 day work = 1/n | Together = 1/a + 1/b | Days together = ab/(a+b)",
    hint:"1/8 + 1/12",
    explanation:"Time & Work mein sabse important concept: agar koi kaam n dino mein kare, toh 1 din ka kaam = 1/n. Do log saath mein kaam karein toh unke 1-din work add karo. Pipe-cistern bhi same concept — filling pipe positive, leaking pipe negative karo!",
    steps:["A ka 1-din kaam = 1/a, B ka 1-din kaam = 1/b","Together 1-din kaam = 1/a + 1/b","Total days together = 1/(1/a+1/b) = ab/(a+b)","Efficiency ratio = inverse of time ratio","Pipes: inlet + outlet (outlet ko negative lo)"],
    stepEgs:["A 10 din mein → 1 din = 1/10 kaam","A: 1/10, B: 1/15 → together = 5/30 = 1/6 per day","Days = 6 (finish in 6 days)","A: 6 days, B: 12 days → efficiency 2:1","Inlet 1/4 hr, outlet 1/6 hr → net = 1/4−1/6 = 1/12 per hr"],
    examples:[
      {level:"Basic",    num:1, problem:"A = 10 days. 1 din mein kitna kaam?", steps:["1 din kaam = 1/10","= 10% per day","✅ = 1/10 of work"]},
      {level:"Basic",    num:2, problem:"A=8 days, B=12 days. Together kab?", steps:["Together = 1/8 + 1/12 = 5/24","Days = 24/5 = 4.8 days","✅ = 4 days 19.2 hrs"]},
      {level:"Moderate", num:3, problem:"A=6 days, B=12 days. B alone 4 days kaam kare, phir A join kare. Total?", steps:["B 4 din mein: 4/12 = 1/3 kaam","Remaining = 2/3","Together 1 din: 1/6+1/12 = 3/12 = 1/4","Remaining days = (2/3)/(1/4) = 8/3 days","Total = 4 + 8/3 = 6⅔ days","✅ ≈ 6.67 days"]},
      {level:"Hard",     num:4, problem:"Pipe A fills in 10hrs, B empties in 15hrs. Both open. Tank full kab?", steps:["Net fill per hr = 1/10 − 1/15","= 3/30 − 2/30 = 1/30","Time = 30 hours","✅ = 30 hours"]},
      {level:"Advanced", num:5, problem:"A 3× faster than B. Together 12 days. Alone A?", steps:["A = 3× efficient → does 3× more per day","Let A's days = x, B's days = 3x","1/x + 1/3x = 1/12","4/3x = 1/12 → 3x = 48 → x = 16","✅ A alone = 16 days"]},
    ]
  },
  {
    id:11, name:"Percentage", emoji:"💯", cat:"Arithmetic",
    shortcut:"x% of y = x×y/100 | a is what% of b = (a/b)×100 | % change = (change/original)×100",
    hint:"35 * 240 / 100",
    explanation:"Percentage ek universal concept hai — har topic mein aata hai. Shortcut: fractions yaad rakho! 25%=1/4, 20%=1/5, 33.33%=1/3, 12.5%=1/8. Population increase/decrease ke liye: new = old × (1 ± %/100). Exam mein percentage tricks se 3 seconds mein answer!",
    steps:["x% of N = N×x/100","% change = (New−Old)/Old × 100","Agar A, B se P% zyada: A = B×(100+P)/100","Common fractions: 10%=1/10, 25%=1/4, 50%=1/2","Successive %: first % pe → phir second %"],
    stepEgs:["15% of 200 = 200×15÷100 = 30","Old=500, New=600 → change=(100÷500)×100 = 20%","B=100, A 20% zyada → A=100×120÷100 = 120","12.5% of 80 = 1/8×80 = 10 (instant!)","10%↑ then 10%↓: 100×1.1×0.9 = 99 (net −1%)"],
    examples:[
      {level:"Basic",    num:1, problem:"25% of 200 = ?", steps:["25% = 1/4","200 × 1/4 = 50","✅ = 50"]},
      {level:"Basic",    num:2, problem:"35% of 240 = ?", steps:["30% = 72, 5% = 12","72+12 = 84","✅ = 84"]},
      {level:"Moderate", num:3, problem:"60 is what % of 150?", steps:["= 60/150 × 100","= 2/5 × 100 = 40%","✅ = 40%"]},
      {level:"Hard",     num:4, problem:"Price 20% ↑ then 10% ↓. Net change%?", steps:["Effective = 100×1.2×0.9 = 108","Net = 8% increase","✅ Net increase = 8%"]},
      {level:"Advanced", num:5, problem:"A's salary is 20% more than B. B's salary is what% less than A?", steps:["Let B = 100, A = 120","B less than A = (120−100)/120×100","= 20/120×100 = 16.67%","✅ B is 16.67% less than A"]},
    ]
  },
  {
    id:12, name:"Ratio and Proportion", emoji:"⚖️", cat:"Arithmetic",
    shortcut:"a:b = c:d → ad = bc (cross multiply) | Fourth proportional: x = bc/a | Mean proportional: √(ab)",
    hint:"sqrt(16 * 25)",
    explanation:"Ratio a:b matlab a/b. Proportion mein a:b :: c:d hota hai, yaani ad = bc. Fourth proportional: a:b :: c:? = bc/a. Mean proportional: a:? :: ?:b = √(ab). Compound ratio: multiply karo. Exam mein mostly ek simple equation banti hai — cross multiply aur solve!",
    steps:["a:b:c ko simplify karo — HCF nikalo","Compound ratio: (a:b) aur (c:d) ka compound = ac:bd","Duplicate ratio: a:b ka duplicate = a²:b²","Sub-duplicate: √a:√b","Fourth proportional to a,b,c: d = bc/a"],
    stepEgs:["12:18:24 → HCF=6 → simplified 2:3:4","2:3 aur 4:5 → compound = 8:15","3:4 ka duplicate = 9:16","4:9 ka sub-duplicate = 2:3","a=4, b=6, c=8 → d = 6×8÷4 = 12"],
    examples:[
      {level:"Basic",    num:1, problem:"4:5 :: 8:? (Fourth proportional)", steps:["4×d = 5×8 → d = 40/4","= 10","✅ = 10"]},
      {level:"Basic",    num:2, problem:"Mean proportional of 9 and 25 = ?", steps:["Mean prop = √(9×25) = √225","= 15","✅ = 15"]},
      {level:"Moderate", num:3, problem:"A:B=2:3, B:C=4:5. A:B:C=?", steps:["B LCM: 3 and 4 → 12","A:B = 8:12, B:C = 12:15","A:B:C = 8:12:15","✅ = 8:12:15"]},
      {level:"Hard",     num:4, problem:"₹780 ko A:B:C = 4:3:2:1 mein baanto. A−C=?", steps:["Oops! Only 3 people. A:B:C=4:3:2, total=9","A = 4/9×780 = ₹346.67","C = 2/9×780 = ₹173.33","Diff = ₹173.33","✅ A−C = ₹173.33"]},
      {level:"Advanced", num:5, problem:"Salaries A:B=5:4, B:C=6:5. If C=₹9000. A=?", steps:["A:B=5:4, B:C=6:5","A:B:C = 30:24:20 (LCM of 4,6 = 12; ×6,×6,×5)","C = 20 parts = ₹9000 → 1 part = ₹450","A = 30×450 = ₹13500","✅ A's salary = ₹13500"]},
    ]
  },
  {
    id:13, name:"Square Roots", emoji:"√", cat:"Numbers",
    shortcut:"√(a×b) = √a × √b | √(a/b) = √a/√b | Estimate: find nearest perfect square",
    hint:"sqrt(1764)",
    explanation:"Square root ki fastest trick: prime factorization karo, pairs banao, ek ek nikalo. Approximation ke liye nearest perfect square dhundho. Exam mein common perfect squares yaad rakhlo: 1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400.",
    steps:["Prime factorization karo","Pairs banao aur ek-ek factor bahar nikalo","Agar perfect square nahi: neighbor squares use karo","√(ab) = √a × √b ka use karo simplify karne ke liye","Rationalize: 1/√2 = √2/2"],
    stepEgs:["√144: 144=2²×2²×3² → pairs of 2,2,3","One each: 2×2×3 = 12 → √144=12","√50: near √49=7, √64=8 → ≈ 7.07","√72 = √36×√2 = 6√2","3/√5 = 3√5÷5 (multiply top & bottom by √5)"],
    examples:[
      {level:"Basic",    num:1, problem:"√144 = ?", steps:["12×12 = 144","✅ √144 = 12"]},
      {level:"Basic",    num:2, problem:"√0.0256 = ?", steps:["= √(256/10000) = 16/100","= 0.16","✅ = 0.16"]},
      {level:"Moderate", num:3, problem:"√1764 = ?", steps:["1764 = 4×9×49","√4=2, √9=3, √49=7","= 2×3×7 = 42","✅ = 42"]},
      {level:"Hard",     num:4, problem:"√(0.81 × 1.44) = ?", steps:["= √0.81 × √1.44","= 0.9 × 1.2 = 1.08","✅ = 1.08"]},
      {level:"Advanced", num:5, problem:"√(248 + √(52 + √144)) = ?", steps:["Innermost: √144 = 12","52+12 = 64 → √64 = 8","248+8 = 256 → √256 = 16","✅ = 16"]},
    ]
  },
  {
    id:14, name:"Averages", emoji:"📊", cat:"Arithmetic",
    shortcut:"Average = Sum/Count | Sum = Avg × Count | If one added: new avg = (old sum + new)/(n+1)",
    hint:"(45 + 60 + 75 + 80 + 90) / 5",
    explanation:"Average = Total Sum ÷ Number of items. Trick: agar average mein change aaye toh actual sum se kaam karo. Weighted average ke liye: Σ(weight × value)/Σweight. Exam shortcut: deviation method — ek assume karo phir deviations average karo!",
    steps:["Average = Sum/n","Sum = Average × n","Ek value add hone par: new sum = old avg×n + new value","New average = new sum/(n+1)","Deviation method: assume koi number, deviations nikalo, average deviation add karo"],
    stepEgs:["10,20,30,40,50 → sum=150, avg=150÷5=30","Avg=25, n=4 → sum=25×4=100","Old avg=25, n=4, add 45 → new sum=100+45=145","New avg = 145÷5 = 29","Assume 30: deviations −10,0,+10 → avg of dev=0 → actual avg=30"],
    examples:[
      {level:"Basic",    num:1, problem:"4 numbers: 10,20,30,40. Average?", steps:["Sum = 100, n = 4","Avg = 100/4 = 25","✅ Average = 25"]},
      {level:"Basic",    num:2, problem:"Average of 1 to 9 = ?", steps:["Consecutive numbers: avg = (1+9)/2","= 10/2 = 5","✅ Average = 5"]},
      {level:"Moderate", num:3, problem:"5 numbers avg=48. 6th add hone pe avg=52. 6th number?", steps:["Old sum = 48×5 = 240","New sum = 52×6 = 312","6th = 312−240 = 72","✅ = 72"]},
      {level:"Hard",     num:4, problem:"First 30 avg=20, next 30 avg=30. Overall?", steps:["Sum1 = 600, Sum2 = 900","Total = 1500, n = 60","Avg = 1500/60 = 25","✅ = 25"]},
      {level:"Advanced", num:5, problem:"Cricket: 10 innings avg=30. 11th innings 80 runs. New avg?", steps:["Old sum = 10×30 = 300","New sum = 300+80 = 380","New avg = 380/11 = 34.5","✅ New avg = 34.5"]},
    ]
  },
  {
    id:15, name:"Interest (SI & CI)", emoji:"🏦", cat:"Arithmetic",
    shortcut:"SI = P×R×T/100 | CI = P×(1+R/100)^T | CI−SI (2yr) = P×(R/100)²",
    hint:"10000 * 5 * 3 / 100",
    explanation:"Simple Interest (SI) mein har saal same interest milta hai. Compound Interest (CI) mein interest pe bhi interest milta hai — zyada faaydemand! 2 saal ka CI aur SI ka difference = P×(r/100)². Exam shortcut: effective CI rate ek formula se niklo.",
    steps:["SI: P×R×T/100 (seedha multiply)","CI (annual): P×(1+r/100)^n − P","CI 2yr shortcut: CI = 2×SI + SI×r/100","Half-yearly: rate halve, time double","Quarterly: rate quarter, time quadruple"],
    stepEgs:["P=1000, R=10%, T=2yr → SI=1000×10×2÷100=₹200","P=1000, R=10%, T=2yr → CI=1000×1.1²−1000=₹210","SI=200, r=10% → CI=200+200×10÷100=₹220 ✓","10% annual half-yearly → 5% per 6mo, 4 periods (2yr)","10% annual quarterly → 2.5% per quarter, 8 periods (2yr)"],
    examples:[
      {level:"Basic",    num:1, problem:"P=₹5000, R=10%, T=3yr. SI=?", steps:["SI = 5000×10×3/100","= ₹1500","✅ SI = ₹1500"]},
      {level:"Basic",    num:2, problem:"SI=₹600, P=₹2000, T=3yr. R=?", steps:["600 = 2000×R×3/100","R = 60000/6000 = 10%","✅ R = 10%"]},
      {level:"Moderate", num:3, problem:"P=₹10000, R=10%, T=2yr. CI vs SI diff?", steps:["SI = 10000×10×2/100 = ₹2000","Diff = P×(r/100)² = 10000×0.01 = ₹100","✅ CI is ₹100 more"]},
      {level:"Hard",     num:4, problem:"P=₹8000, R=10% compounded half-yearly, T=1yr. CI=?", steps:["Rate = 5%, n = 2","A = 8000×(1.05)² = 8000×1.1025","= ₹8820","CI = 8820−8000 = ₹820","✅ CI = ₹820"]},
      {level:"Advanced", num:5, problem:"Amount doubles in 5yr (SI). In how many years treble?", steps:["P doubles → SI = P in 5yr","SI = P×R×5/100 = P → R = 20%","For treble: 2P = P×20×T/100","T = 200/20 = 10 yr","✅ Trebles in 10 years"]},
    ]
  },

  /* ── ALGEBRA ── */
  {
    id:16, name:"Algebraic Identities & Surds", emoji:"🔣", cat:"Algebra",
    shortcut:"(a+b)²=a²+2ab+b² | (a-b)²=a²-2ab+b² | (a+b)(a-b)=a²-b² | (a+b)³=a³+3a²b+3ab²+b³",
    hint:"(25 + 1)^2 - 4*25",
    explanation:"Algebraic identities se complex expressions instantly simplify hoti hain. (a+b)² aur a²+b² mein 2ab ka fark hai — yeh yaad rakhlo! Surds mein √a × √b = √(ab) aur rationalize karne ke liye multiply by conjugate. Exam mein identity recognize karo — answer ek second mein!",
    steps:["(a+b)² = a² + 2ab + b² → if a+b aur ab diya toh a²+b² = (a+b)²−2ab","(a−b)² = a²−2ab+b²","a²−b² = (a+b)(a−b) — factoring shortcut","Rationalize 1/(a+√b) = (a−√b)/(a²−b)","a³+b³ = (a+b)(a²−ab+b²)"],
    stepEgs:["a+b=5, ab=6 → a²+b²=25−12=13","(8−3)²=25; 64+9=73, 73−2×24=25 ✓","99×101=(100−1)(100+1)=10000−1=9999","1/(2+√3) = (2−√3)÷(4−3) = 2−√3","8+27=2³+3³=(2+3)(4−6+9)=5×7=35"],
    examples:[
      {level:"Basic",    num:1, problem:"(a+b)² jab a=3, b=4 = ?", steps:["(3+4)² = 7² = 49","OR: 9+24+16 = 49","✅ = 49"]},
      {level:"Basic",    num:2, problem:"a+b=7, ab=12. a²+b²=?", steps:["a²+b² = (a+b)²−2ab","= 49−24 = 25","✅ = 25"]},
      {level:"Moderate", num:3, problem:"103² = ? (use identity)", steps:["= (100+3)² = 10000+600+9","= 10609","✅ = 10609"]},
      {level:"Hard",     num:4, problem:"1/(√5+√3) rationalize karo", steps:["× (√5−√3)/(√5−√3)","= (√5−√3)/(5−3) = (√5−√3)/2","✅ Rationalized"]},
      {level:"Advanced", num:5, problem:"a−b=4, a³−b³=52. ab=?", steps:["a³−b³ = (a−b)(a²+ab+b²)","52 = 4×(a²+ab+b²) → a²+ab+b²=13","(a−b)²=a²−2ab+b²=16","a²+b²=16+2ab","16+2ab+ab=13 → 3ab=−3 → ab=−1","✅ ab = −1"]},
    ]
  },
  {
    id:17, name:"Graphs of Linear Equations", emoji:"📈", cat:"Algebra",
    shortcut:"y = mx + c (slope m, y-intercept c) | x-intercept: put y=0 | y-intercept: put x=0",
    hint:"2*3 + 5",
    explanation:"Linear equation ka graph hamesha ek seedhi line hoti hai. Slope (m) = y mein change ÷ x mein change. y = mx + c mein c y-axis pe milta point hai. Do lines parallel hain agar slope same ho, perpendicular hain agar slopes ka product = −1. Equation se seedha slope-intercept form nikalo!",
    steps:["Equation ko y = mx + c form mein likho","m = slope (angle of line), c = y-intercept","x-intercept: y=0 rakhke x nikalo","y-intercept: x=0 rakhke y nikalo","Do points plot karo → line draw karo"],
    stepEgs:["2x+3y=6 → y=−2x/3+2 (slope=−2/3, c=2)","y=3x+5: slope=3 (steep), y-intercept=5","y=2x−4: x-int → 0=2x−4 → x=2","y=2x−4: y-int → y=−4 (put x=0)","Plot (0,−4) aur (2,0) → connect → line!"],
    examples:[
      {level:"Basic",    num:1, problem:"y = 3x + 2. y-intercept?", steps:["y = mx+c form mein: c = 2","y-intercept = (0, 2)","✅ y-intercept = 2"]},
      {level:"Basic",    num:2, problem:"2x + 3y = 6. x-intercept aur y-intercept?", steps:["x-int: y=0 → x=3","y-int: x=0 → y=2","✅ (3,0) aur (0,2)"]},
      {level:"Moderate", num:3, problem:"y=2x+3 aur y=2x−1 parallel hain?", steps:["Slopes: both = 2","Equal slopes → parallel","✅ Yes, parallel (never intersect)"]},
      {level:"Hard",     num:4, problem:"Line through (2,5) and (4,9). Equation?", steps:["Slope m = (9−5)/(4−2) = 2","y−5 = 2(x−2) → y = 2x+1","✅ y = 2x + 1"]},
      {level:"Advanced", num:5, problem:"3x+4y=12 aur 6x+8y=k parallel hain. k=?", steps:["Rewrite: 6x+8y = 24 (multiply by 2)","For parallel aur coincident: k ≠ 24","For truly parallel (distinct): k ≠ 24","✅ k ≠ 24 for parallel; k=24 coincident"]},
    ]
  },

  /* ── GEOMETRY ── */
  {
    id:18, name:"Triangle — Kinds of Centres", emoji:"🔺", cat:"Geometry",
    shortcut:"Centroid=2:1 median | Incentre=angle bisectors | Circumcentre=⊥bisectors | Orthocentre=altitudes",
    hint:"",
    explanation:"Triangle ke 4 centres yaad rakhlo: (1) Centroid — 3 medians ka meeting point, median 2:1 mein divide hota hai. (2) Incentre — angle bisectors ka meeting point, inscribed circle ka centre. (3) Circumcentre — perpendicular bisectors ka point, circumscribed circle ka centre. (4) Orthocentre — altitudes ka point.",
    steps:["Centroid: G divides median in 2:1 from vertex","Incentre (I): angle bisectors milte hain, always inside","Circumcentre (O): perpendicular bisectors, outside for obtuse triangle","Orthocentre (H): altitudes mein milta, outside for obtuse","Euler line: O, G, H ek hi line pe hote hain, OG:GH = 1:2"],
    stepEgs:["Median=12cm → vertex to G=2/3×12=8cm, G to midpoint=4cm","Incentre always INSIDE — all triangle types mein","Equilateral triangle → O=I=G (all 3 same point)","Right triangle → Orthocentre at right angle vertex","OG=2, GH=4 → ratio 1:2 on Euler's line"],
    examples:[
      {level:"Basic",    num:1, problem:"Centroid G, AG=8cm. Full median length?", steps:["Centroid 2:1 divide karta hai","AG:GM = 2:1, AG=8 → GM=4","Median = 12 cm","✅ = 12 cm"]},
      {level:"Basic",    num:2, problem:"Obtuse triangle mein circumcentre kahan?", steps:["Acute → inside","Right → hypotenuse midpoint","Obtuse → OUTSIDE triangle","✅ Outside"]},
      {level:"Moderate", num:3, problem:"Centroid G, median = 15cm. G se vertex ki distance?", steps:["G divides 2:1","Vertex side = 2/3 × 15 = 10 cm","✅ = 10 cm"]},
      {level:"Hard",     num:4, problem:"Triangle mein medians ka sum aur sides ka relation?", steps:["3/4 × (sum of sides) < sum of medians < sum of sides","For 3-4-5 triangle: medians ≈ 2.5+3.0+4.27 = 9.77","3/4 × 12 = 9 < 9.77 < 12 ✓","✅ Rule verified"]},
      {level:"Advanced", num:5, problem:"Triangle: A(0,0), B(6,0), C(0,8). Centroid G=?", steps:["Gx = (0+6+0)/3 = 2","Gy = (0+0+8)/3 = 8/3","G = (2, 8/3)","✅ Centroid = (2, 2.67)"]},
    ]
  },
  {
    id:19, name:"Congruence & Similarity", emoji:"🔄", cat:"Geometry",
    shortcut:"Congruent: SSS,SAS,ASA,AAS,RHS | Similar: AA,SSS,SAS | Similar ratio=k → area ratio=k²",
    hint:"",
    explanation:"Congruent triangles bilkul same hote hain (size+shape same). Similar triangles same shape ke hote hain lekin size alag. Similarity mein sides ka ratio same hota hai. Important: agar triangles similar hain aur sides ka ratio k hai, toh areas ka ratio k² hoga. Exam mein mostly AA similarity use hoti hai!",
    steps:["Congruence: SSS(3 sides), SAS(2 sides+angle), ASA(2 angles+side), AAS, RHS","Similarity: AA (2 angles equal ho toh 3rd bhi equal)","Similar ratio r → perimeter ratio r, area ratio r²","Corresponding sides proportion mein hoti hain","BPT (Basic Proportionality Theorem): line parallel to base sides proportional divide karta hai"],
    stepEgs:["3-4-5 aur 3-4-5 triangles → SSS → Congruent","∠A=50°,∠B=60° in both → AA → Similar","Ratio 2:3 → perimeter 2:3, area 4:9","AB/PQ = BC/QR = CA/RP (all equal)","DE∥BC → AD/DB = AE/EC"],
    examples:[
      {level:"Basic",    num:1, problem:"Do triangles congruent hain: SSS se. Sides 3,4,5 dono mein. Congruent?", steps:["3 sides equal → SSS criterion","✅ Yes, Congruent (SSS)"]},
      {level:"Basic",    num:2, problem:"ΔABC ~ ΔPQR, ratio 1:2. Perimeter ABC=18. PQR?", steps:["Perimeter ratio = similarity ratio","PQR = 18 × 2 = 36","✅ Perimeter = 36"]},
      {level:"Moderate", num:3, problem:"ΔABC ~ ΔPQR. AB=4, PQ=6, area ABC=16. Area PQR=?", steps:["k = 6/4 = 3/2","Area ratio = k² = 9/4","Area PQR = 16×9/4 = 36","✅ = 36 sq units"]},
      {level:"Hard",     num:4, problem:"ΔABC mein DE∥BC, AD=3, DB=5. DE/BC=?", steps:["By BPT: AD/AB = DE/BC","AD/AB = 3/(3+5) = 3/8","DE/BC = 3/8","✅ DE = 3BC/8"]},
      {level:"Advanced", num:5, problem:"Similar triangles mein areas 25:49. Perimeters ratio?", steps:["Area ratio = k²","k² = 25/49 → k = 5/7","Perimeter ratio = k = 5/7","✅ Perimeters = 5:7"]},
    ]
  },
  {
    id:20, name:"Circles — Chords, Tangents, Angles", emoji:"⭕", cat:"Geometry",
    shortcut:"Tangent⊥radius | PA×PB=PC×PD (secant) | Angle at centre = 2× angle at circumference",
    hint:"",
    explanation:"Circle ke important theorems: (1) Tangent radius pe perpendicular hoti hai. (2) Ek bahar ke point se do tangents equal hoti hain. (3) Same arc pe angle at centre = 2 × angle at circumference. (4) Semicircle mein angle = 90°. Exam mein mostly tangent-secant aur chord-angle problems aate hain!",
    steps:["Tangent from external point: PA = PB (equal tangents)","Chord bisect: radius perpendicular to chord → bisects it","Angles: inscribed angle = half of central angle","Same segment: sab inscribed angles equal","Secant rule: PA×PB = PC×PD"],
    stepEgs:["P bahar, PA aur PB tangents → PA=PB (both 10cm)","Chord 8cm, radius⊥chord → each half = 4cm","Central angle 80° → inscribed angle = 40°","∠APB = ∠AQB (same arc, both inscribed angles)","PA=3, PB=12, PC=4 → PD=3×12÷4=9"],
    examples:[
      {level:"Basic",    num:1, problem:"Arc AB=100°. Inscribed angle=?", steps:["Inscribed = Central/2","= 100/2 = 50°","✅ = 50°"]},
      {level:"Basic",    num:2, problem:"Semicircle mein inscribed angle=?", steps:["Semicircle → arc = 180°","Inscribed angle = 180/2 = 90°","✅ Always 90°"]},
      {level:"Moderate", num:3, problem:"External P. Tangent PA=12, secant PBC: PB=8. BC=?", steps:["PA² = PB×PC","144 = 8×PC → PC=18","BC = PC−PB = 10","✅ BC = 10 cm"]},
      {level:"Hard",     num:4, problem:"External P. Two tangents PA=PB=10, AB=12. PO=?", steps:["M = midpoint AB → PM⊥AB","AM=6, PA=10","PM = √(100−36) = 8","OA=r, OM = PM−PO","OA²=PA²−PO² (since OA⊥PA)","r² = 100−PO², also OM=8−PO, r²=OM²+36","100−PO²=(8−PO)²+36→PO=37/8","✅ PO = 37/8 = 4.625 cm"]},
      {level:"Advanced", num:5, problem:"Circle chord AB=8cm, centre distance=3cm. Radius=?", steps:["Perpendicular from centre bisects chord","Half chord = 4cm","r² = 3² + 4² = 9+16 = 25","r = 5 cm","✅ Radius = 5 cm"]},
    ]
  },
  {
    id:21, name:"Triangle — Properties & Area", emoji:"△", cat:"Geometry",
    shortcut:"Area = ½×b×h | Heron's: s=(a+b+c)/2, A=√(s(s-a)(s-b)(s-c)) | Pythagoras: a²+b²=c²",
    hint:"sqrt(13*3*5*5)",
    explanation:"Triangle ka area = ½ × base × height. Right triangle mein Pythagoras use karo. Common Pythagorean triplets yaad rakhlo: 3-4-5, 5-12-13, 8-15-17, 7-24-25. Heron's formula tab use karo jab teeno sides diye hon aur height nahi. Equilateral triangle area = (√3/4)a².",
    steps:["Right triangle: a²+b²=c²","Equilateral: Area = (√3/4)a², Height = (√3/2)a","Isosceles: split into 2 right triangles","Heron's formula: s = (a+b+c)/2, A = √(s(s−a)(s−b)(s−c))","Common triplets: 3-4-5, 5-12-13, 8-15-17"],
    stepEgs:["a=6, b=8 → c=√(36+64)=10","Side=6 → Area=9√3≈15.6, Height=3√3≈5.2","Isosceles: sides=5, base=6 → h=√(25−9)=4","Sides 7,8,9: s=12, A=√(12×5×4×3)≈26.8","5²+12²=25+144=169=13² ✓"],
    examples:[
      {level:"Basic",    num:1, problem:"Right triangle: legs 3 aur 4. Hypotenuse?", steps:["c² = 3²+4² = 9+16 = 25","c = 5","✅ Hypotenuse = 5"]},
      {level:"Basic",    num:2, problem:"Base=10cm, height=6cm. Area?", steps:["Area = ½×b×h = ½×10×6","= 30 cm²","✅ = 30 cm²"]},
      {level:"Moderate", num:3, problem:"Equilateral triangle side=6cm. Area?", steps:["Area = (√3/4)×6² = (√3/4)×36","= 9√3 ≈ 15.59 cm²","✅ = 9√3 cm²"]},
      {level:"Hard",     num:4, problem:"Sides 13,14,15. Area (Heron's)?", steps:["s = (13+14+15)/2 = 21","A = √(21×8×7×6) = √7056 = 84","✅ Area = 84 sq units"]},
      {level:"Advanced", num:5, problem:"Isosceles: equal sides=13, base=10. Area?", steps:["Height: h²=13²−5²=169−25=144","h=12","Area = ½×10×12 = 60 cm²","✅ = 60 cm²"]},
    ]
  },
  {
    id:22, name:"Quadrilaterals", emoji:"⬛", cat:"Geometry",
    shortcut:"Square: 4a² | Rectangle: lb | Parallelogram: b×h | Rhombus: ½×d1×d2 | Trapezium: ½×(a+b)×h",
    hint:"0.5 * (12 + 8) * 6",
    explanation:"Quadrilateral ke types aur unke area formulas yaad rakhlo. Trapezium: ek pair of parallel sides, area = ½×sum of parallel sides×height. Rhombus: diagonals bisect at 90°, area = ½×d1×d2. Parallelogram: opposite sides equal, area = base×height. Square: sab same!",
    steps:["Square: Area=a², Perimeter=4a, Diagonal=a√2","Rectangle: Area=lb, Perimeter=2(l+b), Diagonal=√(l²+b²)","Rhombus: Area=½d1d2, Perimeter=4a","Parallelogram: Area=b×h, adjacent angles supplementary","Trapezium: Area=½(a+b)×h"],
    stepEgs:["Square a=5 → Area=25, Perim=20, Diag=5√2≈7.07","l=6, b=4 → Area=24, Diag=√(36+16)=√52≈7.2","d1=6, d2=8 → Area=24, side=√(3²+4²)=5","base=8, h=5 → Area=40; angles 60°+120°=180°","parallel sides 7+9=16, h=4 → Area=½×16×4=32"],
    examples:[
      {level:"Basic",    num:1, problem:"Rectangle: l=8, b=5. Area aur diagonal?", steps:["Area = 8×5 = 40 cm²","Diagonal = √(64+25) = √89 ≈ 9.43","✅ Area=40, Diag≈9.43"]},
      {level:"Basic",    num:2, problem:"Trapezium: parallel sides 10,14cm, h=8. Area?", steps:["Area = ½×(10+14)×8 = ½×192","= 96 cm²","✅ = 96 cm²"]},
      {level:"Moderate", num:3, problem:"Rhombus: diagonals 12 aur 16cm. Area aur side?", steps:["Area = ½×12×16 = 96 cm²","Side = √(6²+8²) = 10 cm","✅ Area=96, Side=10"]},
      {level:"Hard",     num:4, problem:"Parallelogram: base=12, area=84. Height?", steps:["Area = base × height","84 = 12 × h → h = 7","✅ Height = 7 cm"]},
      {level:"Advanced", num:5, problem:"Square inscribed in circle r=5. Square ka area?", steps:["Diagonal of square = diameter = 10","a√2 = 10 → a = 5√2","Area = a² = 50 cm²","✅ Area = 50 cm²"]},
    ]
  },
  {
    id:23, name:"Regular Polygons", emoji:"⬡", cat:"Geometry",
    shortcut:"Sum of angles=(n−2)×180° | Each angle=(n−2)×180°/n | Exterior angle=360°/n",
    hint:"(6-2)*180/6",
    explanation:"Regular polygon mein saari sides aur saare angles equal hote hain. n-sided polygon ka angle sum = (n−2)×180°. Exterior angle sum HAMESHA 360° hota hai — yeh rule perfect hai! Pentagon=108°, Hexagon=120°, Octagon=135°. Hexagon ka area = (3√3/2)a² — exam mein aata hai!",
    steps:["Sum of interior angles = (n−2) × 180°","Each interior angle (regular) = (n−2)×180°/n","Exterior angle = 360°/n","Interior + Exterior = 180° (supplementary)","Number of diagonals = n(n−3)/2"],
    stepEgs:["Hexagon n=6: sum=(6−2)×180=720°","Hexagon each angle = 720÷6 = 120°","Hexagon exterior = 360÷6 = 60°","120°+60° = 180° ✓","Hexagon diagonals = 6×3÷2 = 9"],
    examples:[
      {level:"Basic",    num:1, problem:"Pentagon ka each angle?", steps:["n=5: (5−2)×180/5","= 540/5 = 108°","✅ = 108°"]},
      {level:"Basic",    num:2, problem:"Exterior angle=24°. Sides=?", steps:["n = 360/24 = 15","✅ = 15 sides"]},
      {level:"Moderate", num:3, problem:"Regular hexagon each interior angle?", steps:["(6−2)×180/6 = 720/6","= 120°","✅ = 120°"]},
      {level:"Hard",     num:4, problem:"Octagon mein diagonals kitne?", steps:["n(n−3)/2 = 8×5/2","= 40/2 = 20","✅ 20 diagonals"]},
      {level:"Advanced", num:5, problem:"Polygon ka sum of angles = 1800°. Sides?", steps:["(n−2)×180 = 1800","n−2 = 10 → n = 12","✅ 12 sides (Dodecagon)"]},
    ]
  },

  /* ── MENSURATION ── */
  {
    id:24, name:"Right Prism", emoji:"📦", cat:"Mensuration",
    shortcut:"LSA = Perimeter of base × Height | TSA = LSA + 2×Base area | Volume = Base area × Height",
    hint:"4 * 5 * 10",
    explanation:"Right Prism mein lateral (side) faces rectangles hote hain. Base koi bhi polygon ho sakta hai — triangle, square, hexagon. LSA (Lateral Surface Area) = base perimeter × height. Volume = base area × height. Exam mein mostly triangular prism aur square prism (cuboid) aate hain!",
    steps:["Base shape identify karo (triangle/square/hexagon)","Base area nikalo","Base perimeter nikalo","LSA = Perimeter × Height","TSA = LSA + 2×Base area | Volume = Base area × Height"],
    stepEgs:["Square base 4cm → cuboid (square prism)","Square base 4cm → area=16 cm²","Square 4cm → perimeter=4×4=16 cm","LSA = 16×10 = 160 cm² (h=10cm)","TSA=160+2×16=192 cm², Vol=16×10=160 cm³"],
    examples:[
      {level:"Basic",    num:1, problem:"Square prism: base 4cm, h=6cm. Volume?", steps:["Base area = 4² = 16","Volume = 16×6 = 96 cm³","✅ = 96 cm³"]},
      {level:"Basic",    num:2, problem:"Square prism: base 5cm, h=8cm. TSA?", steps:["LSA = 4×5×8 = 160","TSA = 160 + 2×25 = 210 cm²","✅ = 210 cm²"]},
      {level:"Moderate", num:3, problem:"Triangular prism: 3-4-5 base, h=10. Volume?", steps:["Base area = ½×3×4 = 6 cm²","Volume = 6×10 = 60 cm³","✅ = 60 cm³"]},
      {level:"Hard",     num:4, problem:"Equilateral triangle base side=6, prism h=10. LSA?", steps:["Perimeter = 6×3 = 18 cm","LSA = 18×10 = 180 cm²","✅ = 180 cm²"]},
      {level:"Advanced", num:5, problem:"Hexagonal prism: side=4, h=15. Volume?", steps:["Hexagon area = (3√3/2)×4² = 24√3","Volume = 24√3×15 = 360√3","≈ 360×1.732 = 623.5 cm³","✅ ≈ 623.5 cm³"]},
    ]
  },
  {
    id:25, name:"Right Circular Cone", emoji:"🍦", cat:"Mensuration",
    shortcut:"l=√(r²+h²) | LSA=πrl | TSA=πr(r+l) | Volume=⅓πr²h",
    hint:"3.14159 * 6 * 10",
    explanation:"Cone mein r (radius), h (height), l (slant height) — teen values hote hain. l = √(r²+h²). LSA = πrl (curved surface), TSA includes the base circle bhi. Volume = ⅓ × cylinder ka volume. Exam trick: agar cylinder aur cone ka same base aur height hai toh Volume ratio = 3:1!",
    steps:["l (slant height) = √(r²+h²) nikalo","LSA (curved) = π×r×l","TSA = π×r×(r+l)","Volume = (1/3)×π×r²×h","Frustum (cone ka chhota hissa): alag formula — mostly not asked"],
    stepEgs:["r=3, h=4 → l=√(9+16)=5 cm","r=6, l=10 → LSA=π×6×10=60π≈188.5","r=6, l=10 → TSA=π×6×(6+10)=96π≈301.6","r=6, h=8 → Vol=(1/3)×π×36×8=96π≈301.6","Frustum = cone ka beech se kata hua bottom part"],
    examples:[
      {level:"Basic",    num:1, problem:"r=3, h=4. Slant height l=?", steps:["l = √(9+16) = √25 = 5","✅ l = 5 cm"]},
      {level:"Basic",    num:2, problem:"Cone r=6, h=8. LSA aur Volume?", steps:["l=√(36+64)=10","LSA=π×6×10=60π","Vol=(1/3)π×36×8=96π","✅ LSA=60π, Vol=96π"]},
      {level:"Moderate", num:3, problem:"TSA=96π, r=6. Slant height?", steps:["πr(r+l) = 96π","6(6+l) = 96","l = 10","✅ l = 10 cm"]},
      {level:"Hard",     num:4, problem:"Cylinder aur same-base cone, same height. Volume ratio?", steps:["Cylinder V = πr²h","Cone V = (1/3)πr²h","Ratio = 3:1","✅ Cylinder:Cone = 3:1"]},
      {level:"Advanced", num:5, problem:"Cone ko melt kiya → 3 equal small cones (same r). Height ratio?", steps:["Big V = 3 × small V","(1/3)πr²H = 3×(1/3)πr²h","H = 3h","Height = H/3 = Big/3","✅ Small height = H/3"]},
    ]
  },
  {
    id:26, name:"Right Circular Cylinder", emoji:"🥫", cat:"Mensuration",
    shortcut:"LSA=2πrh | TSA=2πr(r+h) | Volume=πr²h | Hollow: Volume=π(R²−r²)h",
    hint:"3.14159 * 7 * 7 * 10",
    explanation:"Cylinder mein r (radius) aur h (height) — sirf do values yaad rakhne hain. LSA = 2πrh (roll karo toh rectangle milega jiska width=2πr, height=h). TSA = LSA + 2 circles. Hollow cylinder mein outer radius R aur inner radius r ke beech ka material calculate karo. π ≈ 22/7 use karo integer results ke liye!",
    steps:["LSA = 2πrh","TSA = 2πr(r+h) = LSA + 2πr²","Volume = πr²h","Hollow: Volume = π(R²−r²)h","If bent into cylinder: πr²h = volume of original material"],
    stepEgs:["r=7, h=10 → LSA=2×22/7×7×10=440 cm²","TSA=2×22/7×7×17=748 cm²","Vol=22/7×49×10=1540 cm³","R=5, r=3, h=10 → V=π(25−9)×10=160π","Wire r=0.1cm, L=1000cm → V=π×0.01×1000=10π"],
    examples:[
      {level:"Basic",    num:1, problem:"r=7, h=10. Volume?", steps:["V = πr²h = (22/7)×49×10","= 1540 cm³","✅ = 1540 cm³"]},
      {level:"Basic",    num:2, problem:"r=7, h=10. TSA=?", steps:["TSA = 2πr(r+h) = 2×22/7×7×17","= 2×22×17 = 748 cm²","✅ = 748 cm²"]},
      {level:"Moderate", num:3, problem:"Volume=1540, r=7. h=?", steps:["1540 = (22/7)×49×h","1540 = 154h → h=10","✅ h = 10 cm"]},
      {level:"Hard",     num:4, problem:"Wire: r=2mm, length=100m → melted → cylinder r=2cm, h=?", steps:["Wire V = π×0.2²×10000 = 400π cm³","400π = π×4×h","h = 100 cm","✅ h = 1 metre"]},
      {level:"Advanced", num:5, problem:"Hollow cyl: R=5, r=4, h=20. Volume of material?", steps:["V = π(R²−r²)×h","= π(25−16)×20 = 180π","≈ 565.5 cm³","✅ ≈ 565.5 cm³"]},
    ]
  },
  {
    id:27, name:"Sphere", emoji:"🌐", cat:"Mensuration",
    shortcut:"Surface area=4πr² | Volume=⁴⁄₃πr³ | Hemisphere SA=3πr² | Hemisphere Vol=⅔πr³",
    hint:"4 * 3.14159 * 7 * 7",
    explanation:"Sphere ka surface area = 4πr², Volume = 4/3×πr³. Hemisphere (aadha gola): curved SA = 2πr², total SA = 3πr² (curved + circle base), Volume = 2/3×πr³. Exam shortcut: agar n chote spheres bante hain ek bade se, toh R³ = n×r³. Yeh relation se r ya R nikal lo!",
    steps:["Sphere SA = 4πr²","Sphere Volume = (4/3)πr³","Hemisphere curved SA = 2πr²","Hemisphere TSA = 3πr²","n small spheres from 1 big: R³ = n×r³"],
    stepEgs:["r=7 → SA=4×22/7×49=616 cm²","r=3 → Vol=4/3×π×27=36π≈113.1 cm³","r=7 → Curved SA=2×22/7×49=308 cm²","r=7 → TSA=3×22/7×49=462 cm²","Big r=6, small r=1 → 216=n×1 → n=216"],
    examples:[
      {level:"Basic",    num:1, problem:"Sphere r=7. SA=?", steps:["SA = 4πr² = 4×22/7×49","= 616 cm²","✅ = 616 cm²"]},
      {level:"Basic",    num:2, problem:"Big sphere r=6. Small spheres r=1. Count?", steps:["R³ = n×r³","216 = n×1","✅ n = 216"]},
      {level:"Moderate", num:3, problem:"Sphere r=6. Volume?", steps:["V = (4/3)πr³ = (4/3)×22/7×216","= 905.14 cm³","✅ ≈ 905 cm³"]},
      {level:"Hard",     num:4, problem:"Sphere melted → cylinder r=3, h=4. Sphere ka r?", steps:["Sphere V = Cylinder V","(4/3)πr³ = π×9×4","(4/3)r³ = 36 → r³ = 27","r = 3","✅ r = 3 cm"]},
      {level:"Advanced", num:5, problem:"SA ratio of 2 spheres = 4:9. Volume ratio?", steps:["SA ∝ r² → r1:r2 = 2:3","Volume ∝ r³","Vol ratio = 2³:3³ = 8:27","✅ = 8:27"]},
    ]
  },
  {
    id:32, name:"Hemispheres", emoji:"🌓", cat:"Mensuration",
    shortcut:"Curved SA=2πr² | TSA=3πr² | Volume=⅔πr³ | If placed on ground: TSA includes flat base",
    hint:"2 * 3.14159 * 7 * 7",
    explanation:"Hemisphere ek sphere ka bilkul aadha hissa hai. Curved surface area = 2πr² (sirf gola part). Jab table pe rakhte hain: Total SA = curved + flat circle = 2πr² + πr² = 3πr². Bowl problems, dome problems — yeh concept use hota hai. Volume = ½ of sphere = 2/3 × πr³.",
    steps:["Curved SA = 2πr²","Flat circular base = πr²","TSA (when placed) = 3πr²","Volume = (2/3)πr³","Hollow bowl: inner + outer curved + ring at top"],
    stepEgs:["r=7 → Curved SA=2×22/7×49=308 cm²","r=7 → Base=22/7×49=154 cm²","r=7 → TSA=308+154=462 cm²","r=3 → Vol=2/3×π×27=18π≈56.5 cm³","Bowl: inner SA + outer SA + annular ring area"],
    examples:[
      {level:"Basic",    num:1, problem:"Hemisphere r=7. Curved SA?", steps:["Curved SA = 2πr² = 2×22/7×49","= 308 cm²","✅ = 308 cm²"]},
      {level:"Basic",    num:2, problem:"Hemisphere r=7. TSA?", steps:["TSA = 3πr² = 3×22/7×49","= 462 cm²","✅ = 462 cm²"]},
      {level:"Moderate", num:3, problem:"Hemisphere r=14. TSA?", steps:["TSA = 3πr² = 3×(22/7)×196","= 1848 cm²","✅ = 1848 cm²"]},
      {level:"Hard",     num:4, problem:"Hemisphere Volume=18π cm³. r=?", steps:["(2/3)πr³ = 18π","r³ = 27","r = 3 cm","✅ = 3 cm"]},
      {level:"Advanced", num:5, problem:"Solid sphere r=6 cut into 2 hemispheres. TSA of each?", steps:["Curved SA = 2πr² = 72π","Flat base = πr² = 36π","TSA = 72π + 36π = 108π","≈ 339.3 cm²","✅ = 108π cm²"]},
    ]
  },
  {
    id:33, name:"Rectangular Parallelepiped (Cuboid)", emoji:"📐", cat:"Mensuration",
    shortcut:"LSA=2h(l+b) | TSA=2(lb+bh+hl) | Volume=lbh | Diagonal=√(l²+b²+h²)",
    hint:"2*(6*8 + 8*5 + 5*6)",
    explanation:"Rectangular Parallelepiped ka matlab cuboid (dikbbe ke jaisa shape). L, B, H — teen dimensions. TSA = 2(lb+bh+hl), Volume = l×b×h. Body diagonal (corner to corner) = √(l²+b²+h²). Exam mein box, room, tank problems isi se solve hote hain. Cube ek special cuboid hai jahan l=b=h=a.",
    steps:["TSA = 2(lb + bh + hl)","LSA (excluding top/bottom) = 2h(l+b)","Volume = l × b × h","Diagonal = √(l²+b²+h²)","Cube: TSA=6a², Vol=a³, Diagonal=a√3"],
    stepEgs:["l=5, b=4, h=3 → TSA=2(20+12+15)=94 cm²","l=5, b=4, h=3 → LSA=2×3×9=54 cm²","l=5, b=4, h=3 → Vol=5×4×3=60 cm³","l=3, b=4, h=12 → D=√(9+16+144)=√169=13 cm","Cube a=4: TSA=96, Vol=64, Diag=4√3"],
    examples:[
      {level:"Basic",    num:1, problem:"Cube: a=5. Volume?", steps:["V = a³ = 125 cm³","✅ = 125 cm³"]},
      {level:"Basic",    num:2, problem:"Cube Volume=1000. TSA?", steps:["a³=1000 → a=10","TSA = 6×100 = 600 cm²","✅ = 600 cm²"]},
      {level:"Moderate", num:3, problem:"Cuboid l=8, b=6, h=5. TSA aur Volume?", steps:["TSA = 2(48+30+40) = 236 cm²","Vol = 8×6×5 = 240 cm³","✅ TSA=236, Vol=240"]},
      {level:"Hard",     num:4, problem:"Cuboid l=12, b=9, h=8. Diagonal?", steps:["D = √(144+81+64)","= √289 = 17 cm","✅ Diagonal = 17 cm"]},
      {level:"Advanced", num:5, problem:"Room 12×10×8. Longest rod that fits?", steps:["Rod = space diagonal","= √(144+100+64)","= √308 ≈ 17.55 m","✅ ≈ 17.55 m"]},
    ]
  },
  {
    id:34, name:"Regular Right Pyramid", emoji:"🔺", cat:"Mensuration",
    shortcut:"LSA=½×Perimeter×Slant height | TSA=LSA+Base area | Volume=⅓×Base area×Height",
    hint:"(1/3) * 6*6 * 10",
    explanation:"Pyramid mein ek polygonal base hota hai aur saare sides ek apex pe milte hain. Slant height (l) triangular face ki height hai — body height se alag! Slant height = √(h² + apothem²). LSA = ½ × base perimeter × slant height. Volume = ⅓ × base area × height — cone jaisa!",
    steps:["Base shape identify karo","Apothem = base ke centre se edge ka perpendicular distance","Slant height l = √(h² + apothem²)","LSA = (1/2) × Perimeter × l","Volume = (1/3) × Base area × Height"],
    stepEgs:["Square base → apothem = side÷2","Square side=6 → apothem=6÷2=3 cm","h=4, apothem=3 → l=√(16+9)=5 cm","Perim=4×6=24, l=5 → LSA=½×24×5=60 cm²","Base area=36, h=4 → Vol=(1/3)×36×4=48 cm³"],
    examples:[
      {level:"Basic",    num:1, problem:"Square base 6cm, h=4cm. Volume?", steps:["Base area = 36 cm²","V = (1/3)×36×4 = 48 cm³","✅ = 48 cm³"]},
      {level:"Basic",    num:2, problem:"Square base 8cm, slant h=10cm. LSA?", steps:["LSA = ½×(4×8)×10 = ½×32×10","= 160 cm²","✅ = 160 cm²"]},
      {level:"Moderate", num:3, problem:"Square base 6cm, h=4cm. Slant height?", steps:["Apothem = 6/2 = 3 cm","l = √(4²+3²) = √25 = 5","✅ l = 5 cm"]},
      {level:"Hard",     num:4, problem:"Square base 10cm, slant h=13cm. TSA?", steps:["LSA = ½×40×13 = 260 cm²","Base area = 100 cm²","TSA = 260+100 = 360 cm²","✅ = 360 cm²"]},
      {level:"Advanced", num:5, problem:"Pyramid volume = cylinder volume. Both: base r=6, h=10. Comparison?", steps:["Pyramid V = (1/3)×π×36×10 = 120π (if circular)","Cylinder V = π×36×10 = 360π","Ratio = 1:3","✅ Cylinder = 3× Pyramid volume"]},
    ]
  },

  /* ── HEIGHTS & DISTANCES ── */
  {
    id:28, name:"Heights and Distances", emoji:"🏔️", cat:"Trigonometry",
    shortcut:"tan θ = Height/Base | sin θ = Height/Hypotenuse | cos θ = Base/Hypotenuse",
    hint:"tan(30 * 3.14159 / 180)",
    explanation:"Heights & Distances mein Angle of Elevation (upar dekhne ka angle) aur Angle of Depression (neeche dekhne ka angle) use hote hain. tan θ = opposite/adjacent sabse useful formula hai. Common angles: tan 30°=1/√3, tan 45°=1, tan 60°=√3. Tower, building, ship problems — sab isi formula se!",
    steps:["Diagram banao — tower/height aur base/distance identify karo","Angle of elevation ya depression identify karo","tan(θ) = Height/Base use karo","Multiple observers: do equations banao, solve simultaneously","Sun/shadow problems: tan θ = height/shadow length"],
    stepEgs:["Tower T, observer O at ground level, distance d from base","Looking UP at tower → Angle of Elevation","Tower=30m, angle=30° → Base=30÷tan30°=30√3≈52m","Near boat angle 45°, far boat 30° → two equations","Pole=10m, shadow=10m → tanθ=1 → θ=45°"],
    examples:[
      {level:"Basic",    num:1, problem:"Height = Distance. Angle of elevation?", steps:["tan θ = height/distance = 1","θ = 45°","✅ = 45°"]},
      {level:"Basic",    num:2, problem:"Tower 30m, elevation 60°. Distance?", steps:["tan 60° = 30/Base","√3 = 30/Base → Base = 10√3","≈ 17.32 m","✅ ≈ 17.32 m"]},
      {level:"Moderate", num:3, problem:"Pole 20m high. Shadow 20√3 m. Elevation angle?", steps:["tan θ = 20/(20√3) = 1/√3","θ = 30°","✅ = 30°"]},
      {level:"Hard",     num:4, problem:"Two poles on opposite sides. Heights 10m & 20m, distance 30m. Wire joining tops. Where does it touch ground?", steps:["Use similar triangles","x/10 = (30−x)/20","20x = 300−10x → 30x = 300","x = 10m from first pole","✅ = 10m from 10m pole"]},
      {level:"Advanced", num:5, problem:"From top of 75m tower, angles of depression of two boats = 30° & 45°. Distance between boats?", steps:["Near boat: tan 45° = 75/d1 → d1=75m","Far boat: tan 30° = 75/d2 → d2=75√3m","Distance = 75√3−75 = 75(√3−1)","≈ 75×0.732 = 54.9m","✅ ≈ 54.9 m"]},
    ]
  },

  /* ── DATA INTERPRETATION ── */
  {
    id:29, name:"Histogram", emoji:"📊", cat:"Data",
    shortcut:"Frequency Density = Frequency/Class width | Area of bar = Frequency | X-axis=class, Y-axis=freq",
    hint:"(15 + 20 + 25 + 18 + 12) / 5",
    explanation:"Histogram mein continuous data ko class intervals mein group karke bars banate hain. Bars ke beech gap nahi hota (bar chart se alag!). Frequency density = frequency ÷ class width. Agar class width same hai toh Y-axis pe seedha frequency likhte hain. Mode = sabse lambe bar ki class mein hota hai.",
    steps:["Class intervals aur frequencies table banao","X-axis pe class intervals, Y-axis pe frequency (ya frequency density)","Bars draw karo — no gaps between them","Class width alag hone pe frequency density use karo","Mode class = highest frequency wali class"],
    stepEgs:["0-10:f=5, 10-20:f=12, 20-30:f=8 → table ready","X: 0,10,20,30; Y: 5,12,8 pe bars draw karo","Bar 0-10 is adjacent to 10-20 — no space between them","0-20:f=10, width=20 → FD=10÷20=0.5","Highest bar f=12 → Modal class = 10-20"],
    examples:[
      {level:"Basic",    num:1, problem:"Classes: 0-10(f=5), 10-20(f=15), 20-30(f=20). Modal class?", steps:["Highest f = 20 (class 20-30)","Modal class = 20-30","✅ = 20-30"]},
      {level:"Basic",    num:2, problem:"f=15, total=50. Relative frequency%?", steps:["= 15/50×100 = 30%","✅ = 30%"]},
      {level:"Moderate", num:3, problem:"Class 10-30 width=20, f=40. Frequency density?", steps:["FD = f/class width = 40/20","= 2","✅ = 2"]},
      {level:"Hard",     num:4, problem:"5 classes each width 10, frequencies: 4,8,12,7,4. Mean?", steps:["Midpoints: 5,15,25,35,45","Σfx=20+120+300+245+180=865","n = 4+8+12+7+4 = 35","Mean = 865/35 = 24.71","✅ ≈ 24.71"]},
      {level:"Advanced", num:5, problem:"Histogram area 60, class 20-30 has frequency density 3. Class 20-30 ka frequency?", steps:["For equal widths: frequency = FD × class width","= 3 × 10 = 30","Total n = 60, so this class = 30/60 = 50%","✅ Frequency = 30"]},
    ]
  },
  {
    id:30, name:"Frequency Polygon", emoji:"📉", cat:"Data",
    shortcut:"Midpoint of class = (lower + upper)/2 | Plot (midpoint, frequency) → join with lines",
    hint:"(10 + 20) / 2",
    explanation:"Frequency polygon banane ke liye pehle har class ka midpoint nikalo, phir midpoints ko X-axis pe aur frequency ko Y-axis pe rakho, sab points ko lines se connect karo. Closed polygon ke liye dono ends pe extra zero-frequency classes add karo. Frequency distribution ka visual comparison ke liye perfect!",
    steps:["Har class interval ka midpoint nikalo: (lower+upper)/2","Points (midpoint, frequency) plot karo","Sab points ko straight lines se connect karo","Polygon close karne ke liye: pehle class se pehle aur last class ke baad zero-frequency add karo","Two frequency polygons compare karo ek hi graph pe"],
    stepEgs:["10-20 → midpoint=(10+20)÷2=15; 20-30 → midpoint=25","Plot (15,f1), (25,f2), (35,f3) on graph","Connect (15,f1)→(25,f2)→(35,f3) with straight lines","Add (5,0) before first and (45,0) after last → close shape","Boys' polygon vs Girls' polygon, same graph pe dono"],
    examples:[
      {level:"Basic",    num:1, problem:"Class 20-30 ka midpoint?", steps:["= (20+30)/2 = 25","✅ = 25"]},
      {level:"Basic",    num:2, problem:"Class 0-10 ka midpoint?", steps:["= (0+10)/2 = 5","✅ = 5"]},
      {level:"Moderate", num:3, problem:"Classes: 10-20(f=8), 20-30(f=12), 30-40(f=6). Mean?", steps:["Midpoints: 15,25,35","Σfx=120+300+210=630","n=26","Mean=630/26≈24.23","✅ ≈ 24.23"]},
      {level:"Hard",     num:4, problem:"Polygon closed karne ke liye kya karna padta hai?", steps:["Before first class: ek aur class add karo with f=0","After last class: ek aur class add karo with f=0","Join to X-axis on both sides","✅ Closed polygon banta hai"]},
      {level:"Advanced", num:5, problem:"Two distributions same mean but alag variance. Polygon mein kya difference dikhega?", steps:["Same mean → both centered at same x-value","Higher variance → flatter, wider polygon","Lower variance → taller, narrower polygon","✅ Shape alag, center same"]},
    ]
  },
  {
    id:31, name:"Bar Diagram & Pie Chart", emoji:"🥧", cat:"Data",
    shortcut:"Pie chart angle = (Value/Total)×360° | Bar chart: height ∝ frequency | % = (part/total)×100",
    hint:"(45/200) * 360",
    explanation:"Pie chart mein circle 360° ka hota hai. Kisi bhi sector ka angle = (Value/Total) × 360°. Bar chart mein bars ki height frequency dikhati hai — bars ke beech gap hota hai (histogram se alag!). DI (Data Interpretation) mein: pehle values read karo, phir percentage/ratio/difference nikalo — question carefully padho!",
    steps:["Pie chart: Angle = (value/total) × 360°","Pie chart: % = angle/360 × 100","Bar chart: comparison karo heights ko","Multiple bar chart: categories side by side","Stacked bar: parts ek bar mein stack hote hain"],
    stepEgs:["A=50, total=200 → angle=50÷200×360=90°","Angle=90° → %=90÷360×100=25%","2020 bar h=500, 2021 h=600 → 2021 > 2020","Boys vs Girls bars side by side per subject","One bar shows Q1+Q2+Q3+Q4 stacked on top"],
    examples:[
      {level:"Basic",    num:1, problem:"Total=500, A=125. Pie angle of A?", steps:["= (125/500)×360 = 90°","✅ = 90°"]},
      {level:"Basic",    num:2, problem:"Sector angle=72°. % share?", steps:["= (72/360)×100 = 20%","✅ = 20%"]},
      {level:"Moderate", num:3, problem:"Budget: Education=₹450cr out of ₹1800cr. Pie angle?", steps:["= (450/1800)×360","= 0.25×360 = 90°","✅ = 90°"]},
      {level:"Hard",     num:4, problem:"Pie chart: A=40%, B=25%, C=20%, D=15%. If total=₹8000, B−D=?", steps:["B = 25%×8000 = ₹2000","D = 15%×8000 = ₹1200","B−D = ₹800","✅ = ₹800"]},
      {level:"Advanced", num:5, problem:"Bar chart: 2020 sales=500, 2021=650, 2022=520. % change 2020→2022?", steps:["Change = 520−500 = 20","% change = 20/500×100 = 4%","✅ = 4% increase"]},
    ]
  },

  /* ── TRIGONOMETRY ── */
  {
    id:35, name:"Trigonometric Ratios", emoji:"📐", cat:"Trigonometry",
    shortcut:"sin=P/H, cos=B/H, tan=P/B | cosec=1/sin, sec=1/cos, cot=1/tan | SOHCAHTOA",
    hint:"sin(30 * 3.14159 / 180)",
    explanation:"Trig ratios yaad karne ka shortcut — SOHCAHTOA: Sin=Opposite/Hypotenuse, Cos=Adjacent/Hypotenuse, Tan=Opposite/Adjacent. Table yaad karo: sin 0°=0, 30°=1/2, 45°=1/√2, 60°=√3/2, 90°=1. Tan = sin/cos. Exam mein table se seedha substitute karo!",
    steps:["Right triangle mein: P=Perpendicular, B=Base, H=Hypotenuse","sin θ = P/H, cos θ = B/H, tan θ = P/B","Standard values table: 0°,30°,45°,60°,90°","sin increases 0→1, cos decreases 1→0","tan 0°=0, tan 45°=1, tan 90°=∞"],
    stepEgs:["3-4-5 triangle: P=3 (opp), B=4 (adj), H=5","sinθ=3/5=0.6, cosθ=4/5=0.8, tanθ=3/4=0.75","sin 30°=0.5, sin 45°=0.707, sin 60°=0.866, sin 90°=1","sin: 0→0.5→0.707→0.866→1 (increases); cos: 1→0.866→0.707→0.5→0","tan 30°=0.577, tan 45°=1, tan 60°=1.732, tan 90°=undefined"],
    examples:[
      {level:"Basic",    num:1, problem:"sin 30° + cos 60° + tan 45° = ?", steps:["sin 30° = 1/2","cos 60° = 1/2","tan 45° = 1","1/2 + 1/2 + 1 = 2","✅ = 2"]},
      {level:"Basic",    num:2, problem:"P=3, B=4. H aur sin θ, cos θ, tan θ = ?", steps:["H = √(3²+4²) = 5","sin θ = 3/5, cos θ = 4/5","tan θ = 3/4","✅ All ratios found"]},
      {level:"Moderate", num:3, problem:"tan θ = 3/4. cosec θ = ?", steps:["P=3, B=4, H=5","cosec θ = H/P = 5/3","✅ cosec θ = 5/3 ≈ 1.667"]},
      {level:"Hard",     num:4, problem:"sin θ = 5/13. All 6 trig ratios nikalo", steps:["P=5, H=13, B=√(169−25)=12","sin=5/13, cos=12/13, tan=5/12","cosec=13/5, sec=13/12, cot=12/5","✅ All 6 ratios found"]},
      {level:"Advanced", num:5, problem:"sin⁴θ + cos⁴θ = 1 − 2sin²θcos²θ. Prove karo", steps:["sin⁴θ + cos⁴θ = (sin²θ + cos²θ)² − 2sin²θcos²θ","= 1² − 2sin²θcos²θ","= 1 − 2sin²θcos²θ","✅ Proved"]},
    ]
  },
  {
    id:36, name:"Degree and Radian Measures", emoji:"🔄", cat:"Trigonometry",
    shortcut:"π radians = 180° | 1° = π/180 rad | 1 rad = 180°/π ≈ 57.3° | Arc length = r×θ (θ in radians)",
    hint:"90 * 3.14159 / 180",
    explanation:"Degree aur Radian dono angle measure karne ke unit hain. π radians = 180°. Convert: Degrees to Radians — × π/180. Radians to Degrees — × 180/π. Common values: 30°=π/6, 45°=π/4, 60°=π/3, 90°=π/2, 180°=π, 360°=2π. Arc length = r × θ (θ radians mein)!",
    steps:["Degrees → Radians: multiply by π/180","Radians → Degrees: multiply by 180/π","Common: 30°=π/6, 45°=π/4, 60°=π/3, 90°=π/2","Arc length = r × θ (θ in radians)","Sector area = ½r²θ"],
    stepEgs:["90° → 90×π/180 = π/2 radians","π/3 → π/3×180/π = 60°","180°=π, 270°=3π/2, 360°=2π","r=10, θ=π/3 → Arc=10π/3≈10.47 cm","r=6, θ=π/4 → Area=½×36×π/4=4.5π≈14.1 cm²"],
    examples:[
      {level:"Basic",    num:1, problem:"60° = ? radians", steps:["60 × π/180","= π/3 radians","≈ 1.047 rad","✅ 60° = π/3 rad"]},
      {level:"Basic",    num:2, problem:"3π/4 radians = ?°", steps:["3π/4 × 180/π","= 3×180/4 = 135°","✅ 3π/4 rad = 135°"]},
      {level:"Moderate", num:3, problem:"120° = ? radians", steps:["120 × π/180 = 2π/3","≈ 2.094 rad","✅ 120° = 2π/3 rad"]},
      {level:"Hard",     num:4, problem:"r=14 cm, θ=60°. Arc length = ?", steps:["θ in radians = 60 × π/180 = π/3","Arc = r × θ = 14 × π/3","= 14π/3 ≈ 14.66 cm","✅ Arc ≈ 14.66 cm"]},
      {level:"Advanced", num:5, problem:"r=10, θ=π/4. Sector area = ?", steps:["Sector area = ½r²θ","= ½ × 100 × π/4","= 25π ≈ 78.54 cm²","✅ Area = 25π cm²"]},
    ]
  },
  {
    id:37, name:"Standard Identities", emoji:"🔑", cat:"Trigonometry",
    shortcut:"sin²θ+cos²θ=1 | 1+tan²θ=sec²θ | 1+cot²θ=cosec²θ | sin²θ=1−cos²θ",
    hint:"1 - (0.6)^2",
    explanation:"Teen fundamental Pythagorean identities yaad rakhlo — yeh sab questions mein kaam aate hain! (1) sin²θ + cos²θ = 1. (2) 1 + tan²θ = sec²θ. (3) 1 + cot²θ = cosec²θ. Derivations: identity (1) ko sin² ya cos² se divide karo baaki nikal jaate hain. Exam mein expression simplify karne ke liye seedha substitute karo!",
    steps:["sin²θ + cos²θ = 1 (most important)","Divide by cos²θ: tan²θ+1 = sec²θ","Divide by sin²θ: 1+cot²θ = cosec²θ","sin θ = √(1−cos²θ), cos θ = √(1−sin²θ)","Simplify: (sinθ+cosθ)² = 1 + 2sinθcosθ"],
    stepEgs:["sin30°=0.5, cos30°=0.866 → 0.25+0.75=1 ✓","tan45°=1 → 1²+1=2=sec²45° → sec45°=√2 ✓","cot60°=1/√3 → 1+1/3=4/3=cosec²60° ✓","cosθ=0.8 → sinθ=√(1−0.64)=√0.36=0.6","(sin45°+cos45°)²=(√2)²=2=1+2×½=2 ✓"],
    examples:[
      {level:"Basic",    num:1, problem:"sin²θ + cos²θ ka value = ?", steps:["Yeh fundamental identity hai","sin²θ + cos²θ = 1 (hamesha)","✅ = 1"]},
      {level:"Basic",    num:2, problem:"sin θ = 0.6. cos θ = ?", steps:["sin²θ + cos²θ = 1","0.36 + cos²θ = 1","cos²θ = 0.64","cos θ = 0.8","✅ cos θ = 0.8"]},
      {level:"Moderate", num:3, problem:"tan θ = 5/12. sec θ = ?", steps:["1 + tan²θ = sec²θ","1 + 25/144 = sec²θ","sec²θ = 169/144","sec θ = 13/12","✅ sec θ = 13/12"]},
      {level:"Hard",     num:4, problem:"(sinθ + cosθ)² + (sinθ − cosθ)² = ?", steps:["= sin²θ+2sinθcosθ+cos²θ + sin²θ−2sinθcosθ+cos²θ","= 1 + 1 = 2","✅ = 2"]},
      {level:"Advanced", num:5, problem:"Prove: (1−sin²θ)(1+tan²θ) = 1", steps:["1−sin²θ = cos²θ","1+tan²θ = sec²θ = 1/cos²θ","cos²θ × 1/cos²θ = 1","✅ Proved"]},
    ]
  },
  {
    id:38, name:"Complementary Angles", emoji:"🔁", cat:"Trigonometry",
    shortcut:"sin(90°−θ)=cosθ | cos(90°−θ)=sinθ | tan(90°−θ)=cotθ | sec(90°−θ)=cosecθ",
    hint:"",
    explanation:"Complementary angles ka sum = 90°. Trig mein: sin aur cos complementary hain — sin(90°−θ) = cos θ. Similarly tan↔cot, sec↔cosec. Exam shortcut: sin 20° = cos 70°, sin 35° = cos 55°. Expression mein sin aur cos ek saath ho toh complementary property se simplify karo — instant zero ya one milega!",
    steps:["sin(90°−θ) = cos θ, cos(90°−θ) = sin θ","tan(90°−θ) = cot θ, cot(90°−θ) = tan θ","sec(90°−θ) = cosec θ","Exam: sin A × cosec A = 1, cos A × sec A = 1, tan A × cot A = 1","Simplify: sin²10°+sin²80° = sin²10°+cos²10° = 1"],
    stepEgs:["sin70°=cos20°; cos35°=sin55°","tan25°=cot65°; cot40°=tan50°","sec30°=cosec60°; cosec45°=sec45°","sin30°×cosec30°=0.5×2=1 ✓; tan45°×cot45°=1×1=1 ✓","sin²20°+sin²70°=sin²20°+cos²20°=1"],
    examples:[
      {level:"Basic",    num:1, problem:"sin 60° = cos ?°", steps:["sin θ = cos(90°−θ)","sin 60° = cos(90°−60°)","= cos 30°","✅ sin 60° = cos 30°"]},
      {level:"Basic",    num:2, problem:"tan 35° × tan 55° = ?", steps:["tan 55° = tan(90°−35°) = cot 35°","tan 35° × cot 35° = 1","✅ = 1"]},
      {level:"Moderate", num:3, problem:"sin²25° + sin²65° = ?", steps:["sin 65° = sin(90°−25°) = cos 25°","sin²25° + cos²25° = 1","✅ = 1"]},
      {level:"Hard",     num:4, problem:"sin²10°+sin²20°+sin²30°+...+sin²80° = ?", steps:["Pair karo: sin²10°+sin²80° = 1","sin²20°+sin²70° = 1","sin²30°+sin²60° = 1","sin²40°+sin²50° = 1 (4 pairs)","✅ Sum = 4"]},
      {level:"Advanced", num:5, problem:"(sin25°+cos65°)² + (cos25°−sin65°)² = ?", steps:["sin25°=cos65° → (cos65°+cos65°)² = (2cos65°)²","cos25°=sin65° → (sin65°−sin65°)² = 0","= 4cos²65° + 0","cos²65°=sin²25° → 4sin²25°","✅ = 4sin²25° (simplifies by identity)"]},
    ]
  }
];

/* ════════════════════════════════════════════════════════════
   TRIG CHART HTML HELPER
════════════════════════════════════════════════════════════ */
function getTrigChartHTML() {
  return `
    <div class="basics-section-title" style="margin-top:0.5rem">📊 Standard Values Chart — Isko Zaroor Yaad Karo!</div>
    <div class="trig-chart-wrap">
      <table class="trig-chart">
        <thead>
          <tr>
            <th style="text-align:left;padding-left:0.9rem">θ →</th>
            <th>0°</th><th>30°</th><th>45°</th><th>60°</th><th>90°</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="func-label">sin θ</td><td>0</td><td>½</td><td>1/√2</td><td>√3/2</td><td class="val-special">1</td></tr>
          <tr><td class="func-label">cos θ</td><td class="val-special">1</td><td>√3/2</td><td>1/√2</td><td>½</td><td>0</td></tr>
          <tr><td class="func-label">tan θ</td><td>0</td><td>1/√3</td><td class="val-special">1</td><td>√3</td><td class="val-special">∞</td></tr>
          <tr><td class="func-label">cosec θ</td><td class="val-special">∞</td><td>2</td><td>√2</td><td>2/√3</td><td>1</td></tr>
          <tr><td class="func-label">sec θ</td><td>1</td><td>2/√3</td><td>√2</td><td>2</td><td class="val-special">∞</td></tr>
          <tr><td class="func-label">cot θ</td><td class="val-special">∞</td><td>√3</td><td class="val-special">1</td><td>1/√3</td><td>0</td></tr>
        </tbody>
      </table>
    </div>
    <div class="basics-mnemonic" style="margin-top:0.8rem">
      <div class="basics-mnemonic-title">🏆 SONA CHANDI TOLE — Trig Table Yaad Karne Ki MAGIC Trick!</div>
      <div class="basics-mnemonic-text">
        <strong>SONA 🥇</strong> = <em>sin</em> values (gold = increases 0 → 1)<br>
        Pattern under √: <strong>√0/2, √1/2, √2/2, √3/2, √4/2</strong><br>
        Simply: 0 se 4 tak count karo under √ → <strong>0, ½, 1/√2, √3/2, 1</strong><br><br>
        <strong>CHANDI 🥈</strong> = <em>cos</em> values (silver = REVERSE of sin, decreases 1 → 0)<br>
        <strong>1, √3/2, 1/√2, ½, 0</strong> — bas sin ulta karo!<br><br>
        <strong>TOLE ⚖️</strong> = <em>tan</em> = sin ÷ cos (weighing = dividing!)<br>
        <strong>0, 1/√3, 1, √3, ∞</strong>
      </div>
    </div>
    <div class="mnemonic-grid">
      <div class="mnemo-card">
        <div class="mnemo-card-title sona">SONA 🥇</div>
        <div class="mnemo-card-sub">sin (0 → 1)</div>
        <div class="mnemo-card-vals">
          <div class="mnemo-card-val">0° → 0</div>
          <div class="mnemo-card-val">30° → ½</div>
          <div class="mnemo-card-val">45° → 1/√2</div>
          <div class="mnemo-card-val">60° → √3/2</div>
          <div class="mnemo-card-val">90° → 1</div>
        </div>
      </div>
      <div class="mnemo-card">
        <div class="mnemo-card-title chandi">CHANDI 🥈</div>
        <div class="mnemo-card-sub">cos (1 → 0)</div>
        <div class="mnemo-card-vals">
          <div class="mnemo-card-val">0° → 1</div>
          <div class="mnemo-card-val">30° → √3/2</div>
          <div class="mnemo-card-val">45° → 1/√2</div>
          <div class="mnemo-card-val">60° → ½</div>
          <div class="mnemo-card-val">90° → 0</div>
        </div>
      </div>
      <div class="mnemo-card">
        <div class="mnemo-card-title tole">TOLE ⚖️</div>
        <div class="mnemo-card-sub">tan = sin÷cos</div>
        <div class="mnemo-card-vals">
          <div class="mnemo-card-val">0° → 0</div>
          <div class="mnemo-card-val">30° → 1/√3</div>
          <div class="mnemo-card-val">45° → 1</div>
          <div class="mnemo-card-val">60° → √3</div>
          <div class="mnemo-card-val">90° → ∞</div>
        </div>
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════
   APTITUDE BASICS — Fundamentals for all 38 topics
════════════════════════════════════════════════════════════ */
const APTITUDE_BASICS = {
  1: {
    hook: "2 + 3 × 4 = 20 ya 14? BODMAS kehta hai 14 — multiplication pehle, addition baad mein!",
    tricks: ["Yaad karo: <strong>B</strong>hai <strong>O</strong>ften <strong>D</strong>rinks <strong>M</strong>ilk <strong>A</strong>nd <strong>S</strong>ugar → Brackets, Of, Division, Multiplication, Addition, Subtraction","D aur M same level → left se right! 6÷2×3 = 3×3 = 9 ✓ (6÷6=1 ✗)","A aur S same level → 10−3+2 = 7+2 = 9 ✓ (10−5=5 ✗)","Negative numbers: hamesha ( ) mein rakhna safer hai"],
    mnemonic: "🎵 <strong>Bhai Often Drinks Milk And Sugar</strong> → B.O.D.M.A.S.",
    realLife: ["🛒", "Grocery bill: (3 items × ₹50) + (2 items × ₹30) − ₹20 coupon = 150+60−20 = ₹190 → BODMAS se calculate karo!"],
    funFact: "USA mein BODMAS ko <strong>PEMDAS</strong> kehte hain (Parentheses, Exponents, Multiplication, Division, Addition, Subtraction) — same concept, different name!"
  },
  2: {
    hook: "0.125 × 8 = ? Fraction trick se: 1/8 × 8 = 1! Calculator ki zaroorat hi nahi!",
    tricks: ["Fraction-decimal table YAAD karo: <strong>0.5=½, 0.25=¼, 0.75=¾, 0.125=⅛, 0.333=⅓, 0.667=⅔</strong>","Multiply: 2.5×4 → 25×4=100 → ÷10 = <strong>10</strong>","Divide: 1.5÷0.3 → dono ×10 → 15÷3 = <strong>5</strong>","Recurring 0.333…: x=0.333, 10x=3.333, 9x=3 → x=1/3"],
    mnemonic: "💰 <strong>Paisa yaad rakho</strong>: 0.25 = 25 paise = ¼ rupee, 0.50 = 50 paise = ½ rupee, 0.75 = ¾ rupee",
    realLife: ["⛽", "Petrol 98.75/litre × 40.5 litres — decimal multiplication aata hai kaam. Convert to fractions for quick mental math!"],
    funFact: "0.999999… = 1 exactly! Proof: x=0.999…, 10x=9.999…, 9x=9, x=1. Surprised? It's mathematically true!"
  },
  3: {
    hook: "1/2 + 1/3 = 2/5 nahi! LCM nikalo first → 3/6 + 2/6 = 5/6. Seedha add karna GALAT hai!",
    tricks: ["Addition/Subtraction: <strong>LCM nikalo → same denominator → numerator operate karo</strong>","Multiplication: seedha (a×c)/(b×d) → then simplify","Division: doosre ko FLIP karo → multiply karo (<strong>KFC: Keep Flip Change</strong>)","Mixed 3½ → improper: (3×2+1)/2 = 7/2"],
    mnemonic: "🍕 <strong>Pizza analogy</strong>: ½ + ⅓ pizza = barabar pieces banao (6 total) → 3/6 + 2/6 = 5/6 pizza!",
    realLife: ["🧪", "Recipe: 2½ cups aata + ¾ cup sugar → fractions add karo. 2½ + ¾ = 5/2 + 3/4 = 10/4+3/4 = 13/4 = 3¼ cups!"],
    funFact: "Ancient Egyptians (1650 BC) unit fractions use karte the — sirf 1/n form ki fractions! ½, ⅓, ¼, etc. koi proper fraction nahi!"
  },
  4: {
    hook: "HCF × LCM = N1 × N2. Ek formula → ek nikalo → doosra seedha calculate! Golden shortcut!",
    tricks: ["<strong>HCF (Division method)</strong>: bade ko chhote se divide, remainder se divide, 0 aane tak. Last divisor = HCF","<strong>LCM shortcut</strong>: LCM = (N1 × N2) ÷ HCF","Divisibility: 2→last digit even, 3→digit sum ÷3, 9→digit sum ÷9, 11→alternating sum ÷11","Co-prime: HCF=1 → e.g., 8 aur 9"],
    mnemonic: "⚡ <strong>HCF × LCM = Product of two numbers</strong> — yeh Golden Formula hai!",
    realLife: ["📐", "Tiles problem: 12m × 8m room mein largest square tile? HCF(12,8) = 4m → 4m × 4m tiles use karo!"],
    funFact: "Every integer can be expressed as a product of primes in EXACTLY one way — called the <strong>Fundamental Theorem of Arithmetic</strong>! Primes are the 'atoms' of numbers."
  },
  5: {
    hook: "₹100 ki cheez ₹120 mein becho → 20% profit! SP = CP × (100+P%) ÷ 100. Itna simple!",
    tricks: ["<strong>SP = CP × (100 ± P%) ÷ 100</strong> — ek formula sab solve karta hai","<strong>CP from SP</strong>: CP = SP × 100 ÷ (100 + P%)","Same SP pe x% profit + x% loss → Net Loss = (x/10)² % hamesha!","Discount hamesha MP pe, profit hamesha CP pe — confuse mat hona!"],
    mnemonic: "💡 <strong>SP se CP nikalna</strong>: SP ke peeche ×100/(100±%) lagao → CP milta hai!",
    realLife: ["🛍️", "Flipkart sale: ₹5000 ki laptop ₹4000 mein → Loss% = 1000/5000×100 = 20% loss. Seller ne kya socha hoga?"],
    funFact: "India mein e-commerce mein sellers kaafi baar inflated MRP dikhate hain to show big discounts — par actual cost? Always check original CP!"
  },
  6: {
    hook: "Successive discounts 20% aur 10% = 28% off, not 30%! Multiply karo: 0.8 × 0.9 = 0.72 → 28% off!",
    tricks: ["<strong>SP = MP × (100−D%) ÷ 100</strong>","Successive discounts: <strong>multiply the remainders</strong> → 20% + 10% = 100×0.8×0.9 = 72 → 28% effective","Formula: effective discount = d1+d2 − d1×d2/100","Discount always on <strong>Marked Price</strong>, not CP!"],
    mnemonic: "📉 <strong>20% + 10% ≠ 30%!</strong> It's 28%! 100 × 0.8 × 0.9 = 72 → 28% off.",
    realLife: ["🏬", "Store sale: 30% off then extra 10% → total = 100×0.7×0.9 = 63 → 37% off, not 40%! Successive ≠ additive!"],
    funFact: "This 'successive discounts' trick is why credit card companies love offering '20% off + extra 10%' — sounds like 30% but it's only 28%!"
  },
  7: {
    hook: "Profit ratio = Capital × Time. A ne ₹6000 × 6 months, B ne ₹4000 × 9 months → 36:36 = 1:1!",
    tricks: ["<strong>Ratio = Capital × Time</strong> for each partner","Same time → sirf Capital ratio","Working partner ko pehle salary, baaki profit split","Investment beech mein change hone pe: alag alag period calculate karo"],
    mnemonic: "🤝 <strong>Capital × Time = Effort</strong> — profit isi proportion mein baanto!",
    realLife: ["🏪", "Startup: A ₹5 lakh (full year), B ₹3 lakh (8 months) → A: 60L, B: 24L → ratio 5:2. Profit ₹1.4L → A=₹1L, B=₹0.4L"],
    funFact: "Ancient Rome mein bhi partnership agreements hote the — 'societas' kehte the! Aaj ka Limited Liability Partnership usi concept ka evolution hai."
  },
  8: {
    hook: "Alligation cross method: 5 second mein mixing ratio nikalo! C upar left, D upar right, M beech → differences ka ratio = mixing ratio!",
    tricks: ["<strong>Cross method</strong>: Cheaper (C) aur Dearer (D) upar, Mean (M) beech mein","Ratio = (D−M) : (M−C)","Milk-water problems: water = 0 price, milk = actual price","Average salary problems bhi alligation se fastest!"],
    mnemonic: "✝️ Cross banao: <strong>C ... D</strong>, M beech mein → neeche: (D−M) aur (M−C) = mixing ratio!",
    realLife: ["☕", "Tea blend: ₹80/kg + ₹120/kg → ₹100/kg blend → (120−100):(100−80) = 20:20 = 1:1 equal mix!"],
    funFact: "'Alligation' Latin word 'alligare' se aaya = to bind/tie together. Mixing ka concept!"
  },
  9: {
    hook: "18 km/h = 5 m/s (×5/18). 5 m/s = 18 km/h (×18/5). Convert karna MUST hai — always!",
    tricks: ["<strong>D = S × T</strong>: triangle mein D upar, S × T neeche — cover karo jo nikalna hai","km/h → m/s: ×5/18 | m/s → km/h: ×18/5","Opposite direction: speeds <strong>add</strong> | Same direction: speeds <strong>subtract</strong>","Train + platform cross: distance = train + platform length!"],
    mnemonic: "🚗 <strong>DST Triangle</strong>: D on top, S×T on bottom. Cover D → S×T. Cover S → D/T. Cover T → D/S!",
    realLife: ["🚂", "Delhi to Agra 200 km, Rajdhani 160 km/h → Time = 200/160 = 1.25 hours = 1 hr 15 min. Simple!"],
    funFact: "Sound ki speed 343 m/s = 1235 km/h. Light ki speed 3×10⁸ m/s = 1.08×10⁹ km/h. Imagine relative speed mein! Light relative to anything = same speed (Special Relativity)!"
  },
  10: {
    hook: "A 10 din mein kaam karta hai → 1 din = 1/10 kaam. B 15 din mein → 1 din = 1/15. Saath: 1/10+1/15 = 1/6 → 6 din!",
    tricks: ["1 din kaam = <strong>1/(total days)</strong>","Together 1 din: <strong>1/a + 1/b</strong> → Days = ab/(a+b)","Pipe fill: inlet positive, leak <strong>negative</strong>","Efficiency ratio = <strong>inverse of time ratio</strong>"],
    mnemonic: "⚙️ <strong>1/a + 1/b = 1/together</strong> — exactly like parallel resistors in physics!",
    realLife: ["🏗️", "Construction: A 30 din, B 20 din → saath = 30×20/(30+20) = 600/50 = 12 din. Project planner ka kaam!"],
    funFact: "Time & Work = Power in physics! Power = Work/Time. Zyada power → kaam jaldi. Same concept, different name!"
  },
  11: {
    hook: "12.5% of 80 = 1/8 × 80 = 10 — 1 second mein! Fraction table yaad karo, calculator chalana band karo!",
    tricks: ["Fraction shortcuts: <strong>10%=1/10, 20%=1/5, 25%=1/4, 33.3%=1/3, 50%=1/2, 12.5%=1/8</strong>","% change = (New−Old)/Old × 100","Successive %: (1+a/100) × (1+b/100) × original","<strong>A is 20% more than B ≠ B is 20% less than A</strong>! (B is 16.67% less)"],
    mnemonic: "💯 <strong>Teen-Char-Paanch</strong>: 33%=⅓, 25%=¼, 50%=½ → quick mental math!",
    realLife: ["💰", "GST 18% on ₹5000: quick way → 10% = 500, 8% = 400, total GST = ₹900. Amount = ₹5900."],
    funFact: "'Per cent' Latin mein 'per hundred' hai. 100 years = 1 Century bhi isi se! Romans ne 'per centum' (per hundred) use kiya."
  },
  12: {
    hook: "a:b = 2:3 matlab a/b = 2/3. Cross multiply: 3a = 2b. Proportion = equal ratios!",
    tricks: ["Simplify: HCF nikalo → 12:18 → HCF=6 → <strong>2:3</strong>","a:b::c:d → <strong>extremes × extremes = means × means</strong> → ad = bc","Mean proportional of a,b = <strong>√(ab)</strong>","Three quantities: find LCM of B's values to combine"],
    mnemonic: "⚖️ <strong>Extremes ka product = Means ka product</strong>. 2:3::4:6 → 2×6=12 = 3×4=12 ✓",
    realLife: ["🗺️", "Map scale 1:50000 → 3 cm on map = 3 × 50000 cm = 1500 m = 1.5 km actual!"],
    funFact: "Golden Ratio 1:1.618 (φ) — Da Vinci used it in Mona Lisa, nautilus shells have it, sunflower spiral follows it! Nature loves this ratio!"
  },
  13: {
    hook: "√1764 = ? Prime factorize: 1764 = 4×9×49 → √4×√9×√49 = 2×3×7 = 42. No calculator needed!",
    tricks: ["Perfect squares 1–400 YAAD karo: <strong>1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400</strong>","Simplify: √72 = √(36×2) = <strong>6√2</strong>","Approximate: √50 near √49=7 → 7.07","√(a/b) = √a/√b | √(ab) = √a × √b"],
    mnemonic: "📋 <strong>1² se 20² yaad karo</strong>: 1,4,9...400 — yeh 20 values sab kuch solve kar deti hain!",
    realLife: ["🏠", "Room area = 576 sq ft → Side = √576 = 24 ft. Perfect square room!"],
    funFact: "√2 = 1.41421356… irrational hai — decimal kabhi repeat nahi karta! Ancient Greeks ne yeh discover kiya aur yeh itna shocking tha ki unka ek student maraa (legend ke according to)!"
  },
  14: {
    hook: "5 numbers avg 30, 6th number add hone pe avg 32. 6th = 32×6 − 30×5 = 192−150 = 42!",
    tricks: ["<strong>Sum = Average × Count</strong> — formula zyada useful hai simple Average = Sum/Count se","New element: old sum + new = new avg × new count","Weighted average: <strong>Σ(weight × value) / Σweight</strong>","Deviation method: assume convenient number, deviations ka avg nikaalo, add karo"],
    mnemonic: "📊 <strong>Sum = Avg × n</strong> — this is the KEY formula. Direct avg = sum/n is for easy problems; Sum=Avg×n solves hard ones!",
    realLife: ["🎓", "5 exams mein 80% average chahiye → total = 400 marks chahiye. Pehle 4 mein 340 mile → 5th mein minimum 60 chahiye!"],
    funFact: "Lake Wobegon effect: surveys mein 70%+ drivers rate themselves as 'above average' drivers — statistically impossible but psychologically very real!"
  },
  15: {
    hook: "CI − SI (2 years) = P × (r/100)² — yeh shortcut exam mein gold hai! Seedha substitute karo!",
    tricks: ["<strong>SI = P×R×T/100</strong>","CI 2yr shortcut: <strong>CI = SI₁ + SI₁ + SI₁×r/100</strong> = 2×SI₁ + SI₁²/P","CI − SI (2yr) = <strong>P×(r/100)²</strong>","Half-yearly: rate ÷2, time ×2"],
    mnemonic: "🏦 <strong>CI−SI = P(r/100)²</strong> — 2 saal ke liye difference formula yaad karo, rest derive karo!",
    realLife: ["📈", "FD: ₹10000 at 10% annual CI → after 2yr = 10000×1.1² = ₹12100. SI would give ₹12000. CI extra = ₹100."],
    funFact: "Albert Einstein allegedly said: <strong>'Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.'</strong>"
  },
  16: {
    hook: "99 × 101 = (100−1)(100+1) = 100²−1 = 9999. Mentally in 3 seconds! Identity = SPEED!",
    tricks: ["(a+b)² = a²+2ab+b² | (a−b)² = a²−2ab+b²","<strong>(a+b)(a−b) = a²−b²</strong> — fastest multiplication trick!","a+b=7, ab=12 → a²+b² = (a+b)²−2ab = 49−24 = <strong>25</strong>","Rationalize: 1/(√5+√3) = (√5−√3)/(5−3) = (√5−√3)/2"],
    mnemonic: "⚡ <strong>(a+b)(a−b) = a²−b²</strong>: 99×101 = 100²−1 = 9999, 49×51 = 50²−1 = 2499, instant!",
    realLife: ["🧮", "Mental math: 45² = (40+5)² = 1600+400+25 = 2025. Or: 45² = (50−5)² = 2500−500+25 = 2025. Calculator se bhi fast!"],
    funFact: "Brahmagupta (628 AD), Indian mathematician, discovered algebraic identities! India ka contribution to world mathematics is immense!"
  },
  17: {
    hook: "y = mx + c: m = slope (line kitni steep), c = y-intercept (kahan cross karta y-axis). Straight line!",
    tricks: ["Slope m = (y2−y1)/(x2−x1) = <strong>rise/run</strong>","Parallel lines: m1 = m2 (equal slopes)","Perpendicular: m1 × m2 = <strong>−1</strong>","x-intercept: y=0 set karo | y-intercept: x=0 set karo"],
    mnemonic: "📈 <strong>y = mx + c</strong>: m = steepness, c = where line starts on Y-axis",
    realLife: ["📊", "COVID graph: daily cases over time. Positive slope = growing, zero slope = plateau, negative slope = declining. Policy decisions use this!"],
    funFact: "René Descartes (of 'I think therefore I am' fame) ne coordinate geometry invent ki! Cartesian coordinate system unhi ke naam se hai — thank you Descartes!"
  },
  18: {
    hook: "4 centres: Centroid (medians), Incentre (angle bisectors), Circumcentre (⊥ bisectors), Orthocentre (altitudes). Equilateral mein sab EK POINT!",
    tricks: ["<strong>Centroid G</strong>: median ko 2:1 mein divide karta hai vertex se","<strong>Incentre</strong>: hamesha INSIDE triangle","<strong>Circumcentre</strong>: obtuse triangle mein OUTSIDE","<strong>Euler's Line</strong>: O, G, H collinear! OG:GH = 1:2"],
    mnemonic: "📍 <strong>2:1 Centroid Rule</strong>: G median ko vertex se 2:1 mein divide karta hai — hamesha!",
    realLife: ["🏛️", "Architecture: centroid se load distribution calculate hota hai — building balance maintain karta hai!"],
    funFact: "Leonhard Euler ne 18th century mein Euler's Line discover ki — O, G, H ek line pe aur OG:GH = 1:2 bhi! Ek insaan ne geometry mein kitna kuch discover kiya!"
  },
  19: {
    hook: "Similar triangles ka area ratio = k² (side ratio). Sides 2:3 → Area 4:9. Sides 3:5 → Area 9:25!",
    tricks: ["<strong>Congruent (≅)</strong>: same size + shape → SSS, SAS, ASA, AAS, RHS","<strong>Similar (~)</strong>: same shape, different size → AA enough to prove!","Ratio k → perimeter k, area k², volume k³","BPT: line ∥ base → sides proportionally divide hoti hain"],
    mnemonic: "🔄 <strong>AA enough</strong> for similarity — 2 angles same → 3rd automatically same → similar triangle!",
    realLife: ["🗺️", "Map = similar to actual land! Scale 1:50000 = k. Areas on map × 50000² = actual area!"],
    funFact: "Ancient Egyptians measured pyramid heights using shadow similarity! Person ka shadow + height vs pyramid shadow + height = similar triangles. 2500 BC mein!"
  },
  20: {
    hook: "Circle ka sabse powerful theorem: Tangent ⊥ Radius at point of contact — HAMESHA 90°!",
    tricks: ["External point tangents: <strong>PA = PB</strong> (always equal)","Radius bisects chord: radius ⊥ chord → chord bisect hoti hai","<strong>Inscribed angle = ½ × Central angle</strong> (same arc)","Angle in semicircle = <strong>90°</strong> — very important!"],
    mnemonic: "⭕ <strong>APEX rule</strong>: A=half angle, P=equal tangents, E=equal inscribed angles, X=90° in semicircle!",
    realLife: ["🚲", "Bicycle wheel: spokes are radii, road is tangent. Tangent ⊥ radius → explains why bicycle moves forward smoothly!"],
    funFact: "Thales of Miletus (600 BC) proved 'angle in semicircle = 90°' — called Thales' Theorem. One of the first mathematical proofs in history!"
  },
  21: {
    hook: "3-4-5, 5-12-13, 8-15-17 — Pythagorean triplets! Ek dekhte hi right triangle recognize karo!",
    tricks: ["Pythagoras: <strong>a²+b²=c²</strong> only for RIGHT triangle","Triplets: <strong>3-4-5, 5-12-13, 8-15-17, 7-24-25</strong>","Equilateral area = <strong>(√3/4)a²</strong>","Heron's: s=(a+b+c)/2, A=√(s(s−a)(s−b)(s−c))"],
    mnemonic: "📐 <strong>3-4-5 multiples</strong>: 6-8-10, 9-12-15, 12-16-20 — sab right triangles!",
    realLife: ["🏗️", "Builder right angle check: 3m, 4m, 5m rope se perfect 90° corner banta hai. Ancient builders yahi karte the!"],
    funFact: "Pythagorean theorem 3000+ saal se jaana jaata tha! Babylonian clay tablets (1800 BC) mein Pythagorean triplets mile hain — Pythagoras se 1200 saal pehle!"
  },
  22: {
    hook: "Rhombus ka area = ½ × d1 × d2. Diagonals seedha multiply karo, half karo — done!",
    tricks: ["Square: 4a² | Rectangle: lb | Parallelogram: b×h","<strong>Rhombus: ½×d1×d2</strong> (diagonals bisect at 90°)","<strong>Trapezium: ½×(a+b)×h</strong> (parallel sides ka average × height)","Rectangle diagonal: √(l²+b²) — Pythagoras!"],
    mnemonic: "⬛ <strong>Rhombus = ½×d1×d2</strong>: kite shape bhi yahi formula use karta hai!",
    realLife: ["🪁", "Kite shape = 4-sided rhombus-like! Area = ½×d1×d2 → kite paper ka area nikaal sakte hain!"],
    funFact: "Taj Mahal gardens — 4 perfect charbaghs (square gardens). Area = side² se perfect symmetry achieve ki architecture mein!"
  },
  23: {
    hook: "Polygon ka exterior angle sum ALWAYS 360° — chahe pentagon ho ya 1000-gon. Always 360°!",
    tricks: ["Interior sum = <strong>(n−2)×180°</strong>","Regular polygon each angle = (n−2)×180°/n","<strong>Exterior angle = 360°/n</strong>","Diagonals = n(n−3)/2"],
    mnemonic: "🔢 <strong>Exterior always 360°</strong>: hexagon = 60° each, pentagon = 72° each, octagon = 45° each!",
    realLife: ["⬡", "Honeycomb = regular hexagons — bees intuitively use 120° angles to maximize area with minimum wax. Nature's math!"],
    funFact: "Honeybee hexagonal honeycomb is the most efficient tessellation — same perimeter, maximum area. Mathematically proven in 1999!"
  },
  24: {
    hook: "Prism = same cross-section throughout height. Volume = Base Area × Height — always!",
    tricks: ["Identify base shape first","<strong>LSA = Perimeter of base × Height</strong>","TSA = LSA + 2 × Base area","Volume = Base area × Height"],
    mnemonic: "📦 <strong>Prism = Base × Height throughout</strong> — like a Toblerone chocolate box!",
    realLife: ["🏕️", "Triangular tent, Toblerone box, glass prism — sab right prisms! Volume = base × height."],
    funFact: "Glass triangular prism light ko 7 colors mein split karta hai. Newton ne 1666 mein yeh demonstrate kiya tha — light aur math ka khoobsoorat combination!"
  },
  25: {
    hook: "Cone tip se kisi bhi direction seedha jao → slant height milti hai! l = √(r²+h²).",
    tricks: ["<strong>l = √(r²+h²)</strong> pehle nikalo","LSA = πrl (curved surface only)","TSA = πr(r+l)","Volume = (1/3)πr²h → exactly 1/3 of cylinder!"],
    mnemonic: "🍦 <strong>Ice cream cone</strong>: curved part = πrl (lick area), base = πr², total = TSA!",
    realLife: ["🎉", "Birthday dunce cap, traffic cone, ice cream cone — sab cones! Area = πrl (surface) + πr² (base) = TSA."],
    funFact: "Agar same base aur height ka cylinder aur cone ho → Volume ratio = 3:1 always! Cylinder 3 times more volume."
  },
  26: {
    hook: "Cylinder ko unroll karo → rectangle milega! Width = 2πr (circumference), Height = h. LSA = 2πrh!",
    tricks: ["<strong>LSA = 2πrh</strong> (label/wrapper)","TSA = 2πr(r+h) = LSA + 2πr²","Volume = πr²h","π = 22/7 use karo integer answers ke liye"],
    mnemonic: "🥫 <strong>Tin can</strong>: label = 2πrh, two lids = 2πr², total = 2πr(r+h)!",
    realLife: ["🥤", "Soft drink can: r≈3.3cm, h≈11.5cm → V = π×10.89×11.5 ≈ 393 mL ≈ 400mL. Formula se exact!"],
    funFact: "Archimedes (287 BC) ne prove kiya: Cylinder volume = (3/2) × inscribed sphere volume. Usne khud kahaa tha ki yeh uski sabse badi discovery hai!"
  },
  27: {
    hook: "n spheres bante hain ek bade se → R³ = n × r³. Volume cube mein proportional hota hai!",
    tricks: ["SA = 4πr² | Volume = (4/3)πr³","n spheres se bada: <strong>R³ = n × r³</strong>","SA ratio k² → Volume ratio <strong>k³</strong>","Hemisphere: SA=3πr², Vol=(2/3)πr³"],
    mnemonic: "🌐 <strong>4πr² surface = 4 circles</strong> of radius r. Volume = (4/3)πr³.",
    realLife: ["🌍", "Earth ka SA = 4π(6371)² km² ≈ 510 million km². Oceans cover about 71% of that = 362 million km²!"],
    funFact: "Sphere is nature's most efficient 3D shape — minimum surface area for given volume. Soap bubbles, planets, raindrops — sab spherical isliye!"
  },
  28: {
    hook: "tan(45°) = 1 matlab Height = Distance! Tower jitna uuncha utni hi door se 45° angle milega!",
    tricks: ["<strong>tan θ = Height/Base</strong> — Heights & Distances main formula","tan 30°=1/√3, tan 45°=1, tan 60°=√3 — yaad karo!","Angle of Elevation: upar dekhna | Angle of Depression: neeche dekhna","<strong>Diagram zaroor banao</strong> — question solve hone lagtaa hai drawing se!"],
    mnemonic: "🏔️ <strong>tan θ = Opposite/Adjacent = Height/Distance</strong> — SOH-CAH-<strong>TOA</strong>!",
    realLife: ["🗼", "Eiffel Tower survey: theodolite se angle of elevation measure kiya, distance measured → tan θ = height/distance → height!"],
    funFact: "Ancient Egyptians used 'shadow sticks' (gnomons) to measure pyramid heights using shadow angles — 2500 BC mein trig bina formula ke!",
    hasTrigChart: true
  },
  29: {
    hook: "Histogram mein bars ke beech GAP NAHI HOTA — bar chart se yahi fark hai! Continuous data!",
    tricks: ["<strong>No gaps</strong> between bars (continuous data — bar chart se alag!)","Mode = <strong>tallest bar</strong> ki class","Unequal width: <strong>Frequency Density = f ÷ class width</strong>","Area of bar = frequency (FD on y-axis)"],
    mnemonic: "📊 <strong>HIST = History bars touch karte hain</strong> — no gaps, no space between time periods!",
    realLife: ["🌡️", "Delhi temperature distribution: January mein kitne din 5-10°C, 10-15°C, 15-20°C raha → histogram from weather data!"],
    funFact: "William Playfair (1759–1823) ne statistical charts invent kiye — bar chart, pie chart, line chart sab usne banaye! Scotland ka genius economist."
  },
  30: {
    hook: "Midpoints connect karo → Frequency Polygon banta hai! Area same as histogram!",
    tricks: ["Midpoint = <strong>(lower + upper)/2</strong>","Points (midpoint, frequency) plot karo, join with lines","<strong>Close the polygon</strong>: extra 0-frequency classes dono ends pe add karo","Mean = Σ(midpoint × frequency) / Σfrequency"],
    mnemonic: "📉 <strong>Connect the midpoints</strong> of histogram bars → Frequency Polygon!",
    realLife: ["🏃", "Marathon runners: har 30-min bracket mein kitne runners finished → frequency polygon se peak completion time visible!"],
    funFact: "Frequency polygon ki area = histogram ki area — mathematically proven! Polygon smooths out the bars into a curve-like shape."
  },
  31: {
    hook: "Pie chart = 360° total. Sector angle = (value/total) × 360°. ₹100 out of ₹400 = 90°!",
    tricks: ["Pie angle: <strong>(value/total) × 360°</strong>","% from angle: <strong>(angle/360) × 100</strong>","<strong>Bar chart: gaps between bars</strong> (discrete data)","Histogram = no gaps (continuous), Bar chart = gaps (discrete)"],
    mnemonic: "🥧 <strong>360° full pie</strong>: sector = (part/whole) × 360° — pizza slice analogy!",
    realLife: ["💰", "Budget: Education 30%, Health 25%, Infrastructure 20%, Others 25% → Pie angles: 108°, 90°, 72°, 90°. Sab total = 360°!"],
    funFact: "Florence Nightingale (the nurse) ne 1858 mein pie chart invent kiya tha — Crimean War mein preventable deaths dikhaane ke liye! Data visualization ne policy change karayi!"
  },
  32: {
    hook: "Hemisphere = exactly half sphere. Curved SA = 2πr² (dome only). TSA = 3πr² (dome + flat base)!",
    tricks: ["Curved SA = 2πr² | Flat base = πr²","<strong>TSA = 3πr²</strong> (dome + base)","Volume = (2/3)πr³","Bowl TSA = inner curved + outer curved + rim ring"],
    mnemonic: "🌓 <strong>TSA = 3πr²</strong>: 2 (curved) + 1 (flat base) = 3 times πr²!",
    realLife: ["🏟️", "Stadium dome shape = hemisphere! Curved surface area = 2πr² — material needed for the dome."],
    funFact: "The Pantheon in Rome (125 AD) has a perfect hemispherical dome of 43.3m diameter — standing for 1900 years! Roman engineering used hemisphere geometry."
  },
  33: {
    hook: "Longest diagonal of cuboid = √(l²+b²+h²). 3D Pythagoras! Body diagonal corner to corner!",
    tricks: ["TSA = <strong>2(lb+bh+hl)</strong>","Volume = <strong>l×b×h</strong>","Diagonal = <strong>√(l²+b²+h²)</strong>","Cube (a): TSA=6a², Vol=a³, Diag=a√3"],
    mnemonic: "📦 <strong>Longest stick in box = √(l²+b²+h²)</strong> — 3D Pythagoras theorem!",
    realLife: ["🎁", "Gift box l=30, b=20, h=10 cm → longest diagonal ribbon = √(900+400+100) = √1400 ≈ 37 cm!"],
    funFact: "Rubik's cube = 3×3×3 cuboid. 43 quintillion possible combinations (43,252,003,274,489,856,000). Solving it uses group theory math!"
  },
  34: {
    hook: "Pyramid volume = ⅓ × base area × height. ALWAYS 1/3. Cone volume bhi ⅓ formula — same idea!",
    tricks: ["<strong>Slant height l = √(h² + apothem²)</strong> — body height se alag!","LSA = ½ × Perimeter × slant height","<strong>Volume = (1/3) × base area × h</strong>","Square pyramid apothem = side/2"],
    mnemonic: "🔺 <strong>⅓ Rule</strong>: Pyramid = ⅓ Prism, Cone = ⅓ Cylinder — same base, same height, always one-third!",
    realLife: ["🏺", "Great Pyramid of Giza: base 230m, height 146m → V = ⅓×230²×146 ≈ 2.58 million m³. Ancient builders used this exact formula!"],
    funFact: "Ancient Egyptians built 138 pyramids. The Great Pyramid used ~2.3 million stone blocks averaging 2.5 tonnes each — all precisely calculated using geometry!"
  },
  35: {
    hook: "SOHCAHTOA! Sin=Opp/Hyp, Cos=Adj/Hyp, Tan=Opp/Adj. Yaad karo aur 6 ratios nikalo!",
    tricks: ["<strong>SOHCAHTOA</strong>: Sin=Opp/Hyp, Cos=Adj/Hyp, Tan=Opp/Adj","cosec = 1/sin, sec = 1/cos, cot = 1/tan — reciprocals","sin increases (0→1), cos decreases (1→0) for 0°→90°","<strong>Pandit Badri Prasad</strong>: P/H=sin, B/H=cos, P/B=tan, H/P=cosec, H/B=sec, B/P=cot"],
    mnemonic: "🎵 <strong>Pandit Badri Prasad Har Har Bole</strong>: P/H, B/H, P/B, H/P, H/B, B/P = sin,cos,tan,cosec,sec,cot!",
    realLife: ["📡", "GPS triangulation uses sin, cos, tan thousands of times per second to pinpoint your location to within meters!"],
    funFact: "Hipparchus (190 BC), Greek mathematician, created first trig tables. 'Trigonometry' = Greek trigonon (triangle) + metron (measure). 2000+ saal pehle!",
    hasTrigChart: true
  },
  36: {
    hook: "π radians = 180°. So 90° = π/2 rad, 60° = π/3 rad, 45° = π/4 rad. Multiply by π/180 to convert!",
    tricks: ["Degrees → Radians: <strong>× π/180</strong>","Radians → Degrees: <strong>× 180/π</strong>","Must-know: <strong>30°=π/6, 45°=π/4, 60°=π/3, 90°=π/2, 180°=π, 360°=2π</strong>","Arc length = <strong>r × θ</strong> (θ in radians only!)"],
    mnemonic: "⭕ <strong>π/180 to radians, 180/π to degrees</strong>. Full circle = 2π rad = 360°.",
    realLife: ["🎡", "Ferris wheel radius 20m, angle 2π/3 → Arc = 20×2π/3 = 40π/3 ≈ 41.9m of travel!"],
    funFact: "360° kyun? Babylonians (2000 BC) ne choose kiya kyunki 360 ≈ days in year aur highly divisible (1,2,3,4,5,6,8,9,10,12...). Radians are the 'natural' unit — just math.",
    hasTrigChart: true
  },
  37: {
    hook: "sin²θ + cos²θ = 1 — ALWAYS! Ise cos² se divide karo → tan²+1=sec². Sin² se → 1+cot²=cosec²!",
    tricks: ["<strong>sin²θ + cos²θ = 1</strong> — fundamental identity","÷ cos²θ → <strong>tan²θ + 1 = sec²θ</strong>","÷ sin²θ → <strong>1 + cot²θ = cosec²θ</strong>","These 3 identities solve 90% of trig simplification problems!"],
    mnemonic: "🔑 <strong>1 → 3 identities</strong>: start with sin²+cos²=1, divide by cos² and sin² to get the other two!",
    realLife: ["🌊", "Ocean wave equations use sin + cos. sin²θ + cos²θ = 1 ensures wave energy is mathematically conserved!"],
    funFact: "sin²+cos²=1 IS Pythagoras theorem in disguise! (P/H)²+(B/H)²=1 → P²+B²=H² → Pythagoras! Trig identities aur geometry ek hi cheez hain!",
    hasTrigChart: true
  },
  38: {
    hook: "sin(90°−θ) = cos θ! sin 40° = cos 50°, sin 23° = cos 67°. Pair karo → instant calculation!",
    tricks: ["<strong>sin↔cos, tan↔cot, sec↔cosec</strong> all swap at 90°−θ","sin A × cosec A = 1, cos A × sec A = 1, <strong>tan A × cot A = 1</strong>","sin²A + sin²(90°−A) = <strong>sin²A + cos²A = 1</strong> — pair karo!","Series: sin²10°+…+sin²80° → 4 pairs each=1 → = 4"],
    mnemonic: "🔁 <strong>Co-function pairs</strong>: sin↔cos, tan↔cot, sec↔cosec always sum to 90°!",
    realLife: ["☀️", "Elevation angle at sunrise + depression angle at sunset ≈ complementary. sin(sunrise angle) = cos(sunset angle)!"],
    funFact: "Word 'cosine' literally means '<strong>complement's sine</strong>'! cos(θ) = sin(90°−θ) = sin(complement). English language ne math bhi encode kiya hai!",
    hasTrigChart: true
  }
};

/* ════════════════════════════════════════════════════════════
   APTITUDE SIDEBAR & CONTENT RENDERING
════════════════════════════════════════════════════════════ */
function renderAptitudeList() {
  const list = document.getElementById('aptList');
  if (!list) return;

  // Group by category
  const categories = {};
  APTITUDE_TOPICS.forEach(t => {
    if (!categories[t.cat]) categories[t.cat] = [];
    categories[t.cat].push(t);
  });

  const catEmojis = { Numbers:'🔢', Arithmetic:'📊', Algebra:'🔣', Geometry:'📐', Mensuration:'📦', Trigonometry:'📐', Data:'📉' };

  let html = '';
  Object.entries(categories).forEach(([cat, topics]) => {
    html += `<div class="apt-cat-header">${catEmojis[cat] || '📌'} ${cat}</div>`;
    topics.forEach(t => {
      html += `<div class="vs-item apt-item" data-id="${t.id}" title="${t.name}">
        <span class="vs-num">${t.id}</span>
        <div class="vs-name">${t.name}</div>
      </div>`;
    });
  });
  list.innerHTML = html;

  list.addEventListener('click', e => {
    const item = e.target.closest('.apt-item');
    if (!item) return;
    list.querySelectorAll('.apt-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    renderAptitudeContent(parseInt(item.dataset.id));
  });
}

function renderAptitudeContent(id) {
  const el = document.getElementById('aptMain');
  if (!el) return;
  const t = APTITUDE_TOPICS.find(x => x.id === id);
  if (!t) return;
  const b = APTITUDE_BASICS[id] || {};

  /* ── Basics panel HTML ── */
  function buildBasicsHTML() {
    let html = '<div class="basics-card">';
    if (b.hook) {
      html += `<div class="basics-hook">💬 ${b.hook}</div>`;
    } else {
      html += `<div class="basics-hook">💬 ${t.explanation}</div>`;
    }
    if (b.realLife) {
      html += `<div class="reallife-box"><span class="reallife-icon">${b.realLife[0]}</span><span>${b.realLife[1]}</span></div>`;
    }
    if (b.tricks && b.tricks.length) {
      html += `<div><div class="basics-section-title">✨ Memory Tricks &amp; Shortcuts</div><div class="basics-tricks-list">`;
      b.tricks.forEach((tr, i) => {
        html += `<div class="basics-trick-item"><span class="basics-trick-num">${i + 1}</span><span>${tr}</span></div>`;
      });
      html += `</div></div>`;
    }
    if (b.mnemonic) {
      html += `<div class="basics-mnemonic"><div class="basics-mnemonic-title">🧠 Mnemonic — Dil Se Yaad Karo!</div><div class="basics-mnemonic-text">${b.mnemonic}</div></div>`;
    }
    if (b.hasTrigChart) {
      html += getTrigChartHTML();
    }
    if (b.funFact) {
      html += `<div class="fun-fact-box"><span>💡</span><span>${b.funFact}</span></div>`;
    }
    html += `<div style="text-align:center;font-size:0.78rem;color:var(--text-faint);padding:0.5rem 0">
      Click <strong style="color:var(--sci-color)">⚡ Learn Steps</strong> to start step-by-step learning, or <strong style="color:var(--sci-color)">🎯 Examples</strong> to jump to practice!
    </div>`;
    html += '</div>';
    return html;
  }

  /* ── Steps panel HTML ── */
  const stepsHtml = t.steps.map((st, i) => {
    const eg = t.stepEgs && t.stepEgs[i];
    const egBox = eg
      ? `<div class="qs-eg-box"><span class="qs-eg-label">eg</span><span class="qs-eg-text">${eg}</span></div>`
      : '';
    const isLast = i === t.steps.length - 1;
    return `<div class="qs-step locked" data-num="${i + 1}">
      <div class="qs-left">
        <div class="qs-bubble">${i + 1}</div>
        ${!isLast ? '<div class="qs-line"></div>' : ''}
      </div>
      <div class="qs-content">
        <div class="qs-rule">${st}</div>
        ${egBox}
      </div>
    </div>`;
  }).join('');

  /* ── Examples panel HTML ── */
  const LEVEL_CLS = { Basic:'ex-basic', Moderate:'ex-moderate', Hard:'ex-hard', Advanced:'ex-advanced' };
  const examplesHtml = (t.examples || []).map(ex => {
    const stH = ex.steps.map((s, i) =>
      `<div class="sc-step${i === ex.steps.length - 1 ? ' hl' : ''}">${s}</div>`
    ).join('');
    return `<div class="sc-example apt-example">
        <span class="ex-level-badge ${LEVEL_CLS[ex.level] || ''}">${ex.level}</span>
        <div class="sc-ex-head"><i class="bx bx-calculator"></i>&nbsp; Example ${ex.num}</div>
        <div class="sc-ex-prob">${ex.problem}</div>
        <div class="sc-steps">${stH}</div>
      </div>`;
  }).join('');

  const tryPlaceholder = t.hint || 'e.g.  sqrt(144) + 3^2';

  el.innerHTML = `
    <div class="sutra-card">

      <div class="sc-header">
        <div class="sc-header-text">
          <div class="sc-num">${t.cat} &nbsp;·&nbsp; Topic ${t.id} of 38</div>
          <div class="sc-name">${t.name}</div>
        </div>
        <div class="sc-emoji-badge">${t.emoji}</div>
      </div>

      <div class="sc-info-row">
        <div class="sc-shortcut" style="grid-column:1/-1">
          <i class="bx bx-bulb"></i>
          <span>${t.shortcut}</span>
        </div>
      </div>

      <p class="sc-explanation">${t.explanation}</p>

      <!-- Topic Tabs -->
      <div class="topic-tabs">
        <button class="topic-tab-btn active" data-panel="basics">📚 Basics</button>
        <button class="topic-tab-btn" data-panel="steps">⚡ Learn Steps</button>
        <button class="topic-tab-btn" data-panel="examples">🎯 Examples</button>
      </div>

      <!-- Basics Panel -->
      <div class="topic-tab-panel active" data-panel="basics">
        ${buildBasicsHTML()}
      </div>

      <!-- Steps Panel -->
      <div class="topic-tab-panel" data-panel="steps">
        <div class="sc-example sc-steps-full" id="qsCard">
          <div class="sc-ex-head"><i class="bx bx-list-ol"></i>&nbsp; Quick Steps — Learn One by One</div>
          <div class="qs-prog-bar-wrap">
            <div class="qs-prog-track"><div class="qs-prog-fill" id="qsProgFill"></div></div>
            <span class="qs-prog-label" id="qsProgLabel">0 / ${t.steps.length}</span>
          </div>
          <div class="qs-wrap">${stepsHtml}</div>
          <div class="qs-done-banner" id="qsDoneBanner">🎉 Sab steps samajh aa gaye! Ab examples dekho 👇</div>
          <div class="qs-controls">
            <button class="qs-btn primary" id="qsPlayBtn"><i class="bx bx-play"></i> Start</button>
            <button class="qs-btn" id="qsNextBtn" disabled><i class="bx bx-right-arrow-alt"></i> Next</button>
            <button class="qs-btn" id="qsResetBtn"><i class="bx bx-reset"></i></button>
            <button class="qs-showall" id="qsShowAll">Show All</button>
            <span class="qs-counter" id="qsCounter">0 / ${t.steps.length}</span>
          </div>
        </div>
      </div>

      <!-- Examples Panel -->
      <div class="topic-tab-panel" data-panel="examples">
        <div class="apt-examples-grid">${examplesHtml}</div>
      </div>

      <!-- Try It — always visible -->
      <div class="sc-try-it">
        <div class="sc-try-label"><i class="bx bx-bolt-circle"></i> Try It — Calculator</div>
        <div class="sc-try-row">
          <input class="sc-try-input" id="aptTryInput" type="text"
                 placeholder="${tryPlaceholder}" spellcheck="false" autocomplete="off" />
          <button class="sc-try-btn" id="aptTryBtn"><i class="bx bx-send"></i> Calculate</button>
        </div>
        <div class="sc-try-result" id="aptTryResult"></div>
      </div>

    </div>
  `;
  el.scrollTop = 0;

  /* ── Tab switching ── */
  el.querySelectorAll('.topic-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.topic-tab-btn').forEach(b2 => b2.classList.remove('active'));
      el.querySelectorAll('.topic-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      el.querySelector(`.topic-tab-panel[data-panel="${btn.dataset.panel}"]`).classList.add('active');
      if (btn.dataset.panel === 'steps' && !qsInited) initQS();
    });
  });

  /* ── Quick Steps: Interactive Learning Journey (lazy init) ── */
  let qsInited = false;
  function initQS() {
    qsInited = true;
    const qsSteps   = [...el.querySelectorAll('.qs-step')];
    const progFill  = document.getElementById('qsProgFill');
    const progLabel = document.getElementById('qsProgLabel');
    const playBtn   = document.getElementById('qsPlayBtn');
    const nextBtn   = document.getElementById('qsNextBtn');
    const resetBtn  = document.getElementById('qsResetBtn');
    const showAllBtn= document.getElementById('qsShowAll');
    const counter   = document.getElementById('qsCounter');
    const banner    = document.getElementById('qsDoneBanner');
    const total     = qsSteps.length;
    let current = -1, timer = null, playing = false;

    function setProgress(n) {
      progFill.style.width  = (n / total * 100) + '%';
      progLabel.textContent = `${n} / ${total}`;
      counter.textContent   = `${n} / ${total}`;
    }

    function applyStates(idx) {
      qsSteps.forEach((s, i) => {
        s.classList.remove('locked', 'active', 'done');
        const bub = s.querySelector('.qs-bubble');
        if (i < idx)        { s.classList.add('done');   bub.textContent = '✓'; }
        else if (i === idx) { s.classList.add('active');  bub.textContent = s.dataset.num; }
        else                { s.classList.add('locked');  bub.textContent = s.dataset.num; }
      });
    }

    function reveal(idx) {
      if (idx < 0 || idx >= total) return;
      current = idx;
      applyStates(idx);
      setProgress(idx + 1);
      nextBtn.disabled = idx >= total - 1;
      if (idx === total - 1) {
        stopTimer();
        banner.classList.add('show');
        playBtn.innerHTML = '<i class="bx bx-check-circle"></i> Done!';
        playBtn.disabled  = true;
      }
    }

    function stopTimer() {
      clearInterval(timer); timer = null; playing = false;
      if (current < total - 1 && current >= 0) {
        playBtn.innerHTML = '<i class="bx bx-play"></i> Resume';
        playBtn.classList.remove('paused');
      }
    }

    function startAuto() {
      playing = true;
      playBtn.innerHTML = '<i class="bx bx-pause"></i> Pause';
      playBtn.classList.add('paused');
      if (current === -1) reveal(0);
      timer = setInterval(() => {
        if (current < total - 1) reveal(current + 1);
        else stopTimer();
      }, 1500);
    }

    function reset() {
      stopTimer(); current = -1; playing = false;
      qsSteps.forEach(s => {
        s.classList.remove('active', 'done');
        s.classList.add('locked');
        s.querySelector('.qs-bubble').textContent = s.dataset.num;
      });
      banner.classList.remove('show');
      setProgress(0);
      nextBtn.disabled  = true;
      playBtn.disabled  = false;
      playBtn.innerHTML = '<i class="bx bx-play"></i> Start';
      playBtn.classList.remove('paused');
    }

    playBtn.addEventListener('click', () => {
      if (playBtn.disabled) return;
      playing ? stopTimer() : startAuto();
    });
    nextBtn.addEventListener('click', () => {
      stopTimer();
      if (current < total - 1) reveal(current + 1);
    });
    resetBtn.addEventListener('click', reset);
    showAllBtn.addEventListener('click', () => {
      stopTimer(); playing = false;
      qsSteps.forEach((s, i) => {
        s.classList.remove('locked', 'active', 'done');
        const bub = s.querySelector('.qs-bubble');
        if (i < total - 1) { s.classList.add('done');  bub.textContent = '✓'; }
        else                { s.classList.add('active'); bub.textContent = s.dataset.num; }
      });
      current = total - 1;
      setProgress(total);
      banner.classList.add('show');
      nextBtn.disabled  = true;
      playBtn.disabled  = true;
      playBtn.innerHTML = '<i class="bx bx-check-circle"></i> Done!';
    });
    setProgress(0);
  }

  const tryInput  = document.getElementById('aptTryInput');
  const tryBtn    = document.getElementById('aptTryBtn');
  const tryResult = document.getElementById('aptTryResult');

  function runTry() {
    const raw = tryInput.value.trim();
    if (!raw) return;
    try {
      const val = evalSafe(toEval(raw));
      tryResult.textContent = isFinite(val) ? '= ' + formatResult(val) : (val > 0 ? '= ∞' : '= −∞');
      tryResult.style.color = 'var(--action-color)';
    } catch {
      tryResult.textContent = '⚠ Invalid — try: 500*120/100 or sqrt(1764)';
      tryResult.style.color = 'var(--op-color)';
    }
  }

  tryBtn   && tryBtn.addEventListener('click', runTry);
  tryInput && tryInput.addEventListener('keydown', e => { if (e.key === 'Enter') runTry(); });
}

/* Initialise aptitude sidebar after APTITUDE_TOPICS const is in scope */
renderAptitudeList();
