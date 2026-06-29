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
  'अनन्त — Infinite. गणित — Mathematics.',
  'Ancient Vedic wisdom, modern calculation speed.',
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

  window.scrollTo(0, 0);
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
  window.scrollTo(0, 0);

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
    explanation:"Whole numbers (0, 1, 2, 3…) ke calculation mein BODMAS ek strict rule hai — Brackets → Of → Division → Multiplication → Addition → Subtraction. Is order ko todoge toh wrong answer milega! Key trap: D aur M same priority hain, left-se-right solve karo. Similarly A aur S same priority — left-se-right. 'Of' matlab multiplication hai (½ of 20 = 10). Negative numbers ke saath sign rules: (−)×(−)=+, (−)×(+)=−. Place value: Ones, Tens, Hundreds, Thousands — ek digit shift = ×10 ya ÷10. Exam mein BODMAS se complex expressions, place value se number comparison/rounding aate hain!",
    steps:[
      "B — Brackets pehle: innermost se bahar niklo. ( ) → { } → [ ] order mein solve karo",
      "O — Of matlab multiply: ½ of 20 = ½ × 20 = 10 | % of bhi multiplication hai",
      "D aur M — left se right: 6÷2×3 → (6÷2)×3 = 3×3 = 9 (NEVER 6÷(2×3)=1)",
      "A aur S — left se right: 10−3+2 → (10−3)+2 = 7+2 = 9 (NEVER 10−(3+2)=5)",
      "Sign rules: (−)×(−)=+, (−)×(+)=−, (−)÷(−)=+. Negative mein brackets use karo",
      "Place value: Ones(10⁰), Tens(10¹), Hundreds(10²), Thousands(10³) — ek position shift = ×10",
      "Divisibility shortcuts: ÷2=last digit even | ÷3=digit sum÷3 | ÷5=ends in 0 or 5 | ÷9=digit sum÷9"
    ],
    stepEgs:[
      "(3+5)×2 → bracket first: 8×2=16 ✓ NOT 3+(5×2)=13",
      "⅓ of 90 = ⅓×90=30 | 15% of 200 = 15÷100×200 = 30",
      "24÷4×3 → left-right: (24÷4)×3 = 6×3 = 18 ✓ (NOT 24÷12=2 ✗)",
      "15−6+4 → (15−6)+4 = 9+4 = 13 ✓ (NOT 15−10=5 ✗)",
      "(−3)×(−4) = +12 | (−2)×5 = −10 | (−8)÷(−2) = +4",
      "5,432 → 5=Thousands, 4=Hundreds, 3=Tens, 2=Ones. 5,432 ÷ 10 = 543.2",
      "252: digit sum=9 → ÷9✓ | last digit=2 → ÷2✓ | ends in 2, not 0/5 → ÷5✗"
    ],
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
    explanation:"Decimal system mein har digit ka position uski value batata hai — tenths (1/10), hundredths (1/100), thousandths (1/1000). Decimals ko fractions mein convert karo toh calculation bahut easy ho jaati hai! Fraction-decimal pairs MUST memorize karo: 0.5=½, 0.25=¼, 0.75=¾, 0.125=⅛, 0.333…=⅓, 0.2=⅕. Recurring decimals: let x = decimal, multiply by 10ⁿ (n = repeating digits count) → subtract → fraction niklo. Multiplication mein: remove decimal → multiply → put decimal back. Division: dono ko multiply karo jab tak decimals khatam na ho!",
    steps:[
      "Place value: 0.1=tenths, 0.01=hundredths, 0.001=thousandths. 3.47 = 3 + 4/10 + 7/100",
      "Fraction conversion: 0.25=25/100=1/4 | 0.125=125/1000=1/8 | 0.6=6/10=3/5",
      "Recurring decimals: x=0.333… → 10x=3.333… → 9x=3 → x=1/3. Repeat digits = how many 9s",
      "Multiplication trick: ignore decimal → multiply → count decimal places → put back",
      "Division trick: multiply both by 10ⁿ (till decimals gone) → divide whole numbers",
      "Comparison: same number of decimal places tak zeros add karo → compare digit by digit",
      "Operations with fractions: convert both to same form (both fractions OR both decimals)"
    ],
    stepEgs:[
      "3.47 → 3 ones, 4 tenths, 7 hundredths | 0.005 = 5 thousandths",
      "0.375 = 375/1000 = 3/8 | 0.666… = 2/3 | 0.16̄ = 1/6",
      "x=0.272727… → 100x=27.2727… → 99x=27 → x=27/99=3/11",
      "2.4 × 3.5 = 24×35÷100 = 840÷100 = 8.4 (2 decimal places total)",
      "3.6 ÷ 0.04 → ×100 both → 360 ÷ 4 = 90",
      "0.8 vs 0.75 → 0.80 vs 0.75 → 80>75 → 0.8 is bigger",
      "0.25 + 1/3 = 1/4 + 1/3 = 3/12 + 4/12 = 7/12 (fraction form easier)"
    ],
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
    explanation:"Fraction = numerator/denominator. Types: Proper (n<d, eg 3/4), Improper (n>d, eg 7/3), Mixed (1¾). Addition/Subtraction mein LCM nikalo — denominators same karo phir numerators operate karo. Multiplication seedha cross karo. Division mein KFC rule: Keep (pehla fraction), Flip (doosra ulta karo), Change (÷ ko × karo). Mixed fractions ko pehle improper mein convert karo. Simplify: GCD se divide karo. Comparison: cross multiply aur compare (a/b vs c/d: check ad vs bc)!",
    steps:[
      "Types: Proper (3/4), Improper (7/4), Mixed (1¾=7/4), Unit fraction (1/n)",
      "Convert mixed to improper: 2⅗ = (2×5+3)/5 = 13/5 | Improper to mixed: 13÷5=2 rem 3 → 2⅗",
      "Addition/Subtraction: LCM of denominators → same denominator → add/subtract numerators",
      "Multiplication: (a/b) × (c/d) = ac/bd → then simplify using GCD",
      "Division: KFC rule — Keep first, Flip second, Change ÷ to × → (a/b) ÷ (c/d) = (a/b) × (d/c)",
      "Simplification: divide numerator aur denominator by their GCD (HCF)",
      "Comparison: a/b vs c/d → cross multiply → compare ad vs bc. Bigger cross-product = bigger fraction"
    ],
    stepEgs:[
      "3/7 proper | 9/4 improper | 2¼ mixed → 9/4 improper | 1/n unit fractions (1/2, 1/3...)",
      "3⅔ = (3×3+2)/3 = 11/3 | 17/5 → 17÷5=3 rem 2 → 3⅖",
      "1/2+1/3 → LCM=6 → 3/6+2/6=5/6 | 3/4−1/6 → LCM=12 → 9/12−2/12=7/12",
      "2/3 × 3/4 = 6/12 → GCD(6,12)=6 → 1/2 | cancel before: (2/3)×(3/4) → (1/1)×(1/2)=1/2",
      "2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6 | 7 ÷ 1/3 = 7 × 3 = 21",
      "24/36 → GCD=12 → 2/3 | 18/45 → GCD=9 → 2/5",
      "3/5 vs 4/7 → 3×7=21 vs 4×5=20 → 21>20 → 3/5 > 4/7"
    ],
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
    explanation:"Numbers ke beech relationships mein HCF (Highest Common Factor = sabse bada common factor) aur LCM (Lowest Common Multiple = sabse chhota common multiple) central hain. Golden shortcut: HCF × LCM = N1 × N2. Division method se HCF, prime factorization se LCM sabse fast! Divisibility rules exam mein critical hain — by 2,3,4,5,6,7,8,9,11,13 — sab alag rules hain. Co-prime matlab HCF=1. Natural numbers, whole numbers, integers — inke relationships bhi samajhna zaroori hai!",
    steps:[
      "HCF Division method: bade ko chhote se divide → remainder se divide → 0 aane tak → last divisor = HCF",
      "LCM shortcut: LCM = (N1 × N2) ÷ HCF | Teen numbers: HCF(N1,N2) pehle, phir HCF(result,N3)",
      "Divisibility rules: ÷2=last digit even | ÷3=digit sum÷3 | ÷4=last 2 digits÷4 | ÷5=ends 0 or 5",
      "More rules: ÷6=÷2 AND ÷3 both | ÷8=last 3 digits÷8 | ÷9=digit sum÷9 | ÷11=alternating sum÷11",
      "Prime factorization: HCF = product of COMMON prime factors (lowest powers) | LCM = product of ALL (highest powers)",
      "Co-prime numbers: HCF=1 (no common factor). If HCF=1 then LCM=N1×N2",
      "Number types: Natural(1,2,3…), Whole(0,1,2…), Integer(…−2,−1,0,1,2…), Even/Odd, Prime/Composite"
    ],
    stepEgs:[
      "HCF(48,18): 48÷18=R12, 18÷12=R6, 12÷6=R0 → HCF=6",
      "LCM(48,18) = 48×18÷6 = 864÷6 = 144 | Check: 48×18=864, HCF×LCM=6×144=864 ✓",
      "792: last=2→÷2✓, 7+9+2=18→÷9✓, last 2 digits 92→÷4✗ (92÷4=23), ends 2→÷5✗",
      "561: 5−6+1=0 → ÷11✓ | 231: 2−3+1=0 → ÷11✓ | 22×11=242: 2−4+2=0 ✓",
      "36=2²×3², 48=2⁴×3 → HCF=2²×3=12, LCM=2⁴×3²=144",
      "8 and 9: no common factors → HCF=1 → co-prime → LCM=8×9=72",
      "1 is neither prime nor composite. Smallest prime=2. 2 is only even prime"
    ],
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
    explanation:"CP (Cost Price) = khareedte waqt ki price | SP (Selling Price) = bechte waqt ki price | MP (Marked Price) = tag pe likha price. SP>CP = Profit | SP<CP = Loss. Profit/Loss ALWAYS CP pe calculate hota hai! SP formula: SP=CP×(100±P%)/100 — yeh ek formula se SP nikalo. CP nikalna ho: CP=SP×100/(100±P%). Faulty weight trick: agar seller 900g de aur 1kg bolke le, toh cheating% = error/true × 100. Successive profit: multiply the factors!",
    steps:[
      "Define: CP=khareed price, SP=bech price, Profit=SP−CP, Loss=CP−SP",
      "Profit% = (Profit/CP)×100 | Loss% = (Loss/CP)×100 — ALWAYS on CP!",
      "SP nikalna: SP = CP × (100+P%) / 100 | Loss case: SP = CP × (100−L%) / 100",
      "CP nikalna: CP = SP × 100 / (100+P%) | Loss case: CP = SP × 100 / (100−L%)",
      "Same SP, equal profit% + loss% → Net loss% = (x/10)² always (e.g., 20+20: net loss=4%)",
      "Faulty weight profit% = (True weight − False weight) / False weight × 100",
      "Successive transactions: overall profit% = (1+p₁/100)(1+p₂/100)×100 − 100"
    ],
    stepEgs:[
      "CP=₹300, SP=₹360 → Profit=60 | CP=₹400, SP=₹340 → Loss=60",
      "Profit%=60/300×100=20% | Loss%=60/400×100=15%",
      "CP=₹500, P%=30 → SP=500×130/100=₹650 | CP=₹800, L%=10 → SP=800×90/100=₹720",
      "SP=₹660, P%=10 → CP=660×100/110=₹600 | SP=₹540, L%=10 → CP=540×100/90=₹600",
      "Two items at 20% profit & 20% loss same SP → net loss=(20/10)²=4%",
      "Seller weighs 800g instead of 1kg → profit% = 200/800×100=25%",
      "Buy at 10% profit, sell at 5% profit → overall = 1.1×1.05=1.155 → 15.5% profit"
    ],
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
    explanation:"Discount ki duniya mein 3 prices hain: CP (cost), MP (marked/tag price), SP (selling price). Discount HAMESHA MP pe milta hai — CP pe nahi! SP = MP × (100−D%)/100. Profit/Loss alag — woh SP aur CP ke beech mein hai. Successive discounts kabhi add nahi karte — MULTIPLY karo: 20%+10% ≠ 30%, actual = 28% off. True Discount aur Banker's Discount competitive exams mein extra marks! Simple formula: SP = MP × product of (1 − d/100) for each discount.",
    steps:[
      "3 prices samjho: CP (cost to seller), MP (tag price, always ≥ CP), SP (actual selling price ≤ MP)",
      "Discount = MP − SP | Discount% = (Discount/MP) × 100 — ALWAYS on MP",
      "SP from MP: SP = MP × (100−D%) / 100",
      "MP from SP: MP = SP × 100 / (100−D%)",
      "Successive discounts (d1% then d2%): Effective discount = d1+d2 − (d1×d2/100). Multiply: SP = MP×(1−d1/100)×(1−d2/100)",
      "Profit on MP-discounted item: if CP known → Profit% = (SP−CP)/CP × 100",
      "Finding required discount: Seller wants P% profit on CP → MP set toh discount% = (MP−SP)/MP × 100"
    ],
    stepEgs:[
      "MP=₹1200, CP=₹800, D%=20% → SP=1200×80/100=₹960 → Profit=960−800=₹160",
      "Discount=₹150, MP=₹600 → D%=150/600×100=25%",
      "MP=₹800, D%=15% → SP=800×85/100=₹680",
      "SP=₹570, D%=5% → MP=570×100/95=₹600",
      "20% then 10%: effective=20+10−2=28% → SP=1000×0.8×0.9=₹720 ✓",
      "CP=₹500, D%=20%, MP=₹800 → SP=₹640 → Profit%=140/500×100=28%",
      "CP=₹400, wants 25% profit → SP=₹500. MP=₹600 → D%=(600−500)/600×100=16.67%"
    ],
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
    explanation:"Partnership business mein profit share karna Capital × Time ratio se hota hai. Simple Partnership: same time → sirf capital ratio. Compound Partnership: alag-alag time → Capital × Time nikao har ke liye. Working partner ko pehle salary milti hai baaki profit split hoti hai. Investment beech mein change hone pe: do alag periods calculate karo. Profit share = (apna ratio / total ratio) × Total Profit. Loss bhi isi ratio mein share hota hai!",
    steps:[
      "Simple partnership (same time): profit ratio = Capital ratio directly",
      "Compound partnership (diff time): Calculate Capital × Time for each partner",
      "Ratio simplify karo → yeh profit division ka base hai",
      "Working partner ka salary: pehle salary dedge total profit se, baaki split by ratio",
      "Variable investment: alag periods ke liye alag calculate karo, phir total",
      "Profit share formula: Partner's share = (Partner's ratio / Sum of ratios) × Total Profit",
      "Partner join/leave mid-year: uska time months mein calculate karo precisely"
    ],
    stepEgs:[
      "A=₹6000, B=₹4000 same time → ratio=6:4=3:2. Profit ₹5000 → A=₹3000, B=₹2000",
      "A=₹8000×9mo=72000, B=₹6000×12mo=72000 → ratio=1:1",
      "A=72000, B=54000, C=36000 → ratio=4:3:2 → simplify with HCF=18000",
      "Working partner A gets ₹2000 salary, profit=₹8000, partner B → remaining=6000 split by ratio",
      "A: ₹5000 for 6mo + ₹8000 for 6mo = 30000+48000=78000",
      "A=78000, B=60000 → ratio=13:10 → Profit ₹4600 → A=13/23×4600=₹2600",
      "B joins after 3 months → A invested 12 months, B invested 9 months"
    ],
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
    explanation:"Mixture & Alligation mein do types hain: (1) Simple Mixture — do ya zyada substances mix karo. (2) Alligation Rule — cross method se mixing ratio fastest nikalo. Cross banao: Cheaper (C) upar-left, Dearer (D) upar-right, Mean (M) beech mein. Then: ratio = (D−M):(M−C). Milk-water problems mein water ka 'price' = 0 lo. Salary average, strength average — sab isme aate hain. Repeated dilution: final concentration = original × (1 − removal/total)ⁿ",
    steps:[
      "Identify: Cheaper (C) = lower value, Dearer (D) = higher value, Mean (M) = required mixture value",
      "Cross method: draw X shape → C topleft, D topright, M centre → differences diagonally",
      "Ratio: Quantity of C : Quantity of D = (D−M) : (M−C)",
      "Milk-water problems: water has no value (price=0) → c=0, d=milk price, m=mixture price",
      "Removal and replacement: after n operations, remaining = Total × (1 − replaced/Total)ⁿ",
      "Mean price formula: Mean = (C×q₁ + D×q₂) / (q₁+q₂) — weighted average concept",
      "3-way mixing: use alligation twice (take 2 at a time) or weighted average formula"
    ],
    stepEgs:[
      "₹40/kg + ₹70/kg → blend ₹50/kg: C=40, D=70, M=50",
      "D−M=20 (ratio of cheaper), M−C=10 (ratio of dearer) → 20:10=2:1",
      "Cheaper:Dearer = 2:1 → for every 3kg, 2kg cheaper + 1kg dearer",
      "Pure milk ₹30/L, water free. Mix ₹24/L → C=0,D=30,M=24 → Water:Milk=(30−24):(24−0)=6:24=1:4",
      "30L vessel, 6L removed and replaced with water, n=2 times: milk=30×(24/30)²=30×0.64=19.2L",
      "5kg@₹20 + 3kg@₹30 → total= 100+90=190, total weight=8 → avg=190/8=₹23.75/kg",
      "Mix A(40%),B(60%),C(80%) to get 50% → alligation of A vs B first, then result vs C"
    ],
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
    explanation:"Speed, Distance, Time ka triangle formula: D = S × T. Cover jo nikalna ho woh → S = D/T, T = D/S. Units MUST match — km/h to m/s × 5/18, m/s to km/h × 18/5. Trains mein: pole cross = train length only | platform cross = train + platform length. Relative speed: same direction = speeds subtract | opposite direction = speeds add. Boats mein: still water speed=u, current=v → downstream=u+v, upstream=u−v. Average speed = 2s₁s₂/(s₁+s₂) for equal distances (NOT arithmetic mean)!",
    steps:[
      "Triangle formula: D=S×T | S=D/T | T=D/S. Cover the unknown in the DST triangle",
      "Unit conversion: km/h → m/s: multiply by 5/18 | m/s → km/h: multiply by 18/5",
      "Relative speed (TRAINS): Same direction = S1−S2 | Opposite directions = S1+S2",
      "Train crossing problems: distance = (train length + object length) | Time = distance/speed",
      "Boats & Streams: Downstream speed = u+v | Upstream speed = u−v | u = (D+U)/2, v = (D−U)/2",
      "Average speed for equal distances: Avg = 2ab/(a+b) — NOT (a+b)/2 (common trap!)",
      "Meeting problem: Total distance = (S1+S2) × Time of meeting | Chasing: extra distance / relative speed"
    ],
    stepEgs:[
      "S=80km/h, T=2.5hr → D=80×2.5=200km | D=150km, T=3hr → S=50km/h",
      "108km/h = 108×5/18=30m/s | 25m/s = 25×18/5=90km/h",
      "Train 72km/h, Car 54km/h same dir → relative=18km/h → overtake 200m train in 200/(18×5/18)=40sec",
      "Train 150m, platform 250m, speed=54km/h=15m/s → time=(150+250)/15=400/15≈26.7sec",
      "Boat 8km/h still, current 2km/h → downstream=10km/h, upstream=6km/h | u=(10+6)/2=8, v=(10−6)/2=2",
      "First half at 40km/h, second half at 60km/h → avg=2×40×60/(40+60)=4800/100=48km/h",
      "A 50km/h, B 30km/h, 400km apart, opposite → meet in 400/(50+30)=5 hours"
    ],
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
    shortcut:"W = T×E | 1-day work = 1/n | Together = ab/(a+b) | LCM Method | M₁T₁ = M₂T₂ | Pipes: +inlet −outlet",
    hint:"1/8 + 1/12",
    explanation:"Time & Work teen quantities pe based hai — Work (total kaam = 1 unit), Time (kitne din), aur Efficiency (1 din mein kitna kaam). Core rule: A n dino mein kame → A ki 1-din efficiency = 1/n. Do log saath kaam karein → efficiencies add karo → together days = ab/(a+b). LCM Method sabse fast hai — total work = LCM assume karo, integer efficiencies niklo, fractions khatam! Men×Days = constant (inverse proportion). Pipes mein inlet positive, leak negative — net = sum of all. Alternate days pe kaam karain toh cycles mein sochlo!",
    steps:[
      "W = T × E: Work = Time × Efficiency | E = W/T = 1/n (agar n din mein kaam ho)",
      "A ka 1-din kaam = 1/a | B ka = 1/b | n din ka kaam = n × (1-day work) | Total days = 1 ÷ efficiency",
      "Combined work: saath mein efficiency = 1/a + 1/b | Days together = ab/(a+b) | Teen log: xyz/(xy+yz+zx)",
      "LCM Method (FASTEST): Total work = LCM of all days. Efficiency = LCM ÷ days. Add efficiencies → divide total by sum",
      "Men-Days relation: M₁×T₁ = M₂×T₂ = constant work | Extended: M₁×T₁×H₁ = M₂×T₂×H₂",
      "Efficiency:Time INVERSE ratio → E_A:E_B = m:n ↔ T_A:T_B = n:m | Zyada efficient → kam time",
      "Pipes & Cisterns: Inlet (filling) = +1/t | Outlet (draining) = −1/t | Net rate = Σinlet − Σoutlet"
    ],
    stepEgs:[
      "A finishes in 8 days → E = 1/8 per day. In 3 days → 3×(1/8) = 3/8 kaam. Remaining = 5/8",
      "A=10 days, B=15 days → together = 1/10+1/15 = 3/30+2/30 = 5/30 = 1/6 → 6 days total",
      "A=10, B=15 → shortcut: (10×15)÷(10+15) = 150÷25 = 6 days ✓ (same answer, faster!)",
      "A=12, B=18 → LCM=36 → A: 36÷12=3 units/day, B: 36÷18=2 units/day → together 5/day → 36÷5 = 7.2 days",
      "10 men × 20 days = 5 × x → x=40 days | 8 men×6hr×12days = 4 men×8hr×x → 576=32x → x=18 days",
      "A twice as fast as B (2:1) → time ratio B:A = 2:1 → if B=20 days, A=10 days. Together = 20×10÷30 = 6.67 days",
      "Pipe A fills in 6hr (+1/6), Pipe B drains in 8hr (−1/8) → net = 4/24−3/24 = 1/24 → tank fills in 24 hours"
    ],
    examples:[
      {level:"Basic",    num:1, problem:"A=12 days, B=18 days. Together kab finish karenge?", steps:["LCM(12,18) = 36 → Total work = 36 units","A efficiency = 36÷12 = 3 units/day","B efficiency = 36÷18 = 2 units/day","Together = 3+2 = 5 units/day","Time = 36÷5 = 7.2 days","✅ = 7 days 4.8 hours"]},
      {level:"Basic",    num:2, problem:"10 men complete work in 20 days. 5 men mein kitne din lagenge?", steps:["Men-Days formula: M₁T₁ = M₂T₂","10 × 20 = 5 × x","200 = 5x → x = 40","✅ = 40 days (double the time, half the men!)"]},
      {level:"Moderate", num:3, problem:"A=6 days, B=12 days. B akele 4 din kaam kare, phir A join kare. Total kitne din?", steps:["B 4 din mein: 4 × (1/12) = 1/3 kaam","Remaining = 1 − 1/3 = 2/3 kaam","Together per day: 1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4","Remaining time = (2/3) ÷ (1/4) = 8/3 days","Total = 4 + 8/3 = 20/3 = 6.67 days","✅ ≈ 6 days 16 hours"]},
      {level:"Hard",     num:4, problem:"Pipe A tank 10hr mein bharta hai, Pipe B 15hr mein khaali karta hai. Dono open ho toh?", steps:["Inlet A = +1/10 per hr","Outlet B = −1/15 per hr","Net = 1/10 − 1/15 = 3/30 − 2/30 = 1/30","Time to fill = 30 hours","✅ = 30 hours"]},
      {level:"Advanced", num:5, problem:"A, B se 3 guna efficient hai. Saath mein 12 din mein kaam karte hain. A akele kitne din?", steps:["A = 3× efficient → A's days = x, B's days = 3x","Together: 1/x + 1/3x = 1/12","3/3x + 1/3x = 1/12 → 4/3x = 1/12","3x = 48 → x = 16","✅ A alone = 16 days, B alone = 48 days"]},
    ]
  },
  {
    id:11, name:"Percentage", emoji:"💯", cat:"Arithmetic",
    shortcut:"x% of y = x×y/100 | a is what% of b = (a/b)×100 | % change = (change/original)×100",
    hint:"35 * 240 / 100",
    explanation:"Percent = per hundred (Latin). x% = x/100. Percentage har competitive exam mein aata hai — profit/loss, SI/CI, data interpretation sab mein. MUST memorize fraction table: 10%=1/10, 12.5%=1/8, 20%=1/5, 25%=1/4, 33.33%=1/3, 50%=1/2, 66.67%=2/3, 75%=3/4. Percentage change = (Change/Original)×100. Successive percentage: multiply factors (not add). 'A is x% more than B' ≠ 'B is x% less than A' — yeh common trap hai!",
    steps:[
      "x% of N = N × x/100. Fraction shortcut: 25% of N = N/4, 12.5% of N = N/8",
      "% change = (New − Old) / Old × 100. Increase: positive, Decrease: negative",
      "A is P% more than B → A = B×(100+P)/100 | B is less than A by: (P/(100+P))×100 %",
      "Successive %: not additive! 20% up then 10% down = 100×1.2×0.9=108 → 8% net increase",
      "Population/Growth formula: Final = Initial × (1 + r/100)ⁿ for n years at r% annual",
      "x% of A = y% of B → A/B = y/x (convert to equation and solve)",
      "Percentage point vs percentage: 30% to 35% = 5 percentage points increase, but 16.7% increase"
    ],
    stepEgs:[
      "35% of 240 = 1/4 of 240 + 1/10 of 240 = 60+24=84 OR 240×0.35=84",
      "Old=800, New=600 → change=−200 → % change=−200/800×100=−25% (decrease)",
      "A 20% more than B: if B=100, A=120. B less than A: 20/120×100=16.67% (not 20%!)",
      "Price up 10% then down 10%: 100×1.1×0.9=99 → net 1% loss! (not 0%)",
      "Population 10000, grows 5% each year for 2yr: 10000×1.05²=11025",
      "30% of 120 = x% of 72 → 36=0.01x×72 → x=50",
      "Election: A got 55% votes = 4400 votes. Total votes=4400/0.55=8000. B got 3600 votes"
    ],
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
    explanation:"Ratio a:b = a/b. Simplify karo — HCF se divide karo. Proportion: a:b :: c:d means ad = bc (product of extremes = product of means). Types of proportion: Direct (more→more), Inverse (more→less). Compound ratio: multiple ratios multiply karo. Ratio types: Duplicate=a²:b², Triplicate=a³:b³, Sub-duplicate=√a:√b. Variation: Direct (y∝x → y=kx), Inverse (y∝1/x → xy=k). Sharing problems: total × (part ratio/sum of ratios) = share!",
    steps:[
      "Simplify ratio: find HCF of all terms → divide → simplified ratio. a:b:c → a/HCF : b/HCF : c/HCF",
      "Proportion a:b :: c:d → Extremes × Extremes = Means × Means → ad = bc (cross product)",
      "Special proportionals: 4th proportional (a:b::c:d→d=bc/a) | Mean proportional (a:x::x:b→x=√ab) | 3rd proportional (a:b::b:c→c=b²/a)",
      "Compound ratio: multiply each term → (a:b) and (c:d) → ac:bd | Duplicate: a²:b² | Sub-duplicate: √a:√b",
      "Direct proportion: x₁/y₁ = x₂/y₂ | Inverse proportion: x₁y₁ = x₂y₂",
      "Three ratios combination: A:B=m:n, B:C=p:q → A:B:C = mp:np:nq (equalize B using LCM)",
      "Distribution: Total T in ratio a:b:c → A's share = (a/a+b+c)×T"
    ],
    stepEgs:[
      "24:36:48 → HCF=12 → 2:3:4 | 0.5:1.5:2.5 → multiply by 2 → 1:3:5",
      "4:5::12:? → 4x=60 → x=15 ✓ | Or: 5×12/4=15",
      "Mean prop of 4 & 16: x=√(4×16)=√64=8. Check: 4:8::8:16 ✓ | 3rd prop to 3,6: c=36/3=12",
      "Compound: (2:3)×(4:5)×(3:7)=24:105=8:35 | Duplicate of 3:4=9:16 | Sub-dup of 25:49=5:7",
      "Direct: 4 pens cost ₹20, 7 pens? → 4/20=7/x → x=₹35 | Inverse: 6 men 8 days, 4 men? → 6×8=4x→x=12",
      "A:B=2:3, B:C=4:5 → B LCM=12 → A:B=8:12, B:C=12:15 → A:B:C=8:12:15",
      "Profit ₹1800 shared in 3:2:1 → A=3/6×1800=₹900, B=₹600, C=₹300"
    ],
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
    explanation:"Square root (√) ka matlab: woh number jo khud se multiply hone pe original de. √n = x means x²=n. Perfect squares 1 se 30 tak memorize karo! Prime factorization method: number factorize karo → pair banao → ek-ek bahar nikalo. Approximation: nearest perfect squares se estimate karo. Simplification: √(a×b) = √a × √b — perfect square ko bahar nikalo. Rationalization: denominator mein √ hatane ke liye conjugate multiply karo. Cube roots bhi same logic: three ka group banao!",
    steps:[
      "Perfect squares memorize karo: 1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400",
      "Prime factorization method: factorize → pairs banao → ek bahar nikalo per pair",
      "Simplification: √72 = √(36×2) = 6√2 | Pull out perfect square factors",
      "Approximation: √(n) ≈ nearest known √ + (n − nearest²)/(2×nearest)",
      "Rationalization: 1/√a = √a/a | 1/(√a+√b) = (√a−√b)/(a−b) (multiply by conjugate)",
      "√(a/b) = √a/√b | √(a×b) = √a×√b — these splitting rules are very useful",
      "Cube root ∛n: prime factorize → groups of 3 → one per group outside"
    ],
    stepEgs:[
      "Quickly: √225=15, √256=16, √289=17, √324=18, √361=19, √400=20",
      "√1764: 1764=4×441=4×9×49 → √4=2, √9=3, √49=7 → 2×3×7=42",
      "√200=√(100×2)=10√2 | √75=√(25×3)=5√3 | √108=√(36×3)=6√3",
      "√50≈7+(50−49)/(2×7)=7+1/14≈7.07 | √3≈1+(3−1)/4=1.5 (rough), actual=1.732",
      "1/√3=√3/3 | 5/(√5−√2)=5(√5+√2)/(5−2)=5(√5+√2)/3",
      "√(144/225)=12/15=4/5 | √(0.16)=0.4 | √(0.0025)=0.05",
      "∛216: 216=2³×3³=(2×3)³=6³ → ∛216=6 | ∛1000=10 | ∛8=2"
    ],
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
    explanation:"Average (Mean) = Total Sum / Count. Key insight: Sum = Average × Count — yeh formula zyada useful hai jab missing numbers nikalni hon. Weighted average: Σ(weight × value)/Σweights. Deviation method: ek 'assumed average' lo, deviations nikalo, unka average nikalo, assumed mein add karo → actual average. Consecutive numbers ka average: (first+last)/2. Important trap: agar ek number remove ho toh 'old sum − removed = new sum'. Average always between minimum aur maximum hota hai!",
    steps:[
      "Basic: Average = Sum/n | Sum = Average × n | n = Sum/Average",
      "Weighted average: Avg = (w₁x₁ + w₂x₂ + …) / (w₁+w₂+…) | Different groups combining",
      "Adding/removing element: new sum = old sum ± new element → new avg = new sum / new n",
      "Deviation method (exam fastest): assume convenient A → deviations d₁,d₂… → Avg = A + (Σd/n)",
      "Consecutive numbers average: first to last = (first+last)/2 = middle term",
      "Average of n consecutive from a: a, a+1, ..., a+n-1 → avg = a + (n-1)/2",
      "If one number replaced: effect = (new − old) / n added to/removed from average"
    ],
    stepEgs:[
      "85,92,78,96,89 → sum=440, n=5 → avg=88 | avg=88, n=5 → sum=88×5=440",
      "Class A 30 students avg 80, Class B 20 students avg 90 → combined=(30×80+20×90)/50=(2400+1800)/50=84",
      "Avg of 6 = 48. 7th added, new avg=52. 7th = 52×7−48×6=364−288=76",
      "Assume 30: values 25,30,35 → deviations −5,0,+5 → avg deviation=0 → avg=30",
      "1 to 99 consecutive: avg=(1+99)/2=50 | 1 to n: avg=(n+1)/2",
      "3 to 11 (9 numbers): avg=3+(9-1)/2=3+4=7 = (3+11)/2=7 ✓",
      "Avg of 5 = 20. One number changes from 15 to 25: new avg = 20+(25−15)/5=20+2=22"
    ],
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
    explanation:"Simple Interest (SI): same principal pe fixed rate har saal — SI=PRT/100, Amount=P+SI. Compound Interest (CI): interest pe bhi interest milta hai — more profitable! CI = P(1+r/100)ⁿ − P. 2yr shortcut: CI−SI = P(r/100)². Half-yearly: rate halve karo, time double karo. Quarterly: rate quarter, time ×4. Population/depreciation bhi CI formula se solve hota hai. Effective annual rate: (1+r/100)ⁿ − 1. Key: CI > SI hamesha (for same P,R,T > 1 year) — interest pe interest milta hai!",
    steps:[
      "SI = P × R × T / 100 | Amount = P + SI | P = 100×SI/(R×T) | R = 100×SI/(P×T)",
      "CI = P × (1+R/100)ⁿ − P | Amount = P × (1+R/100)ⁿ",
      "CI for 2 years shortcut: CI = SI₁ + SI₁ + SI₁×r/100 = 2×SI(year1) + SI₁²/P",
      "CI − SI (2 years) = P×(r/100)² — this is the 'extra interest on first year's interest'",
      "Half-yearly compounding: rate = R/2, n = 2T (time in half-years)",
      "Quarterly: rate = R/4, n = 4T | Monthly: rate = R/12, n = 12T",
      "Population growth: P_n = P₀(1+r/100)ⁿ | Depreciation: V_n = V₀(1−r/100)ⁿ"
    ],
    stepEgs:[
      "P=₹8000, R=12%, T=3yr → SI=8000×12×3/100=₹2880. Amount=₹10880",
      "P=₹10000, R=10%, T=2yr → Amount=10000×1.1²=₹12100. CI=₹2100",
      "P=₹5000, R=8%, T=2yr → SI₁=₹400. CI=400+400+400×8/100=800+32=₹832",
      "CI−SI=P×(r/100)²=10000×(10/100)²=10000×0.01=₹100 ✓",
      "P=₹4000, R=10% per year, half-yearly, T=1yr → rate=5%, n=2 → A=4000×1.05²=₹4410, CI=₹410",
      "R=20% per year quarterly → rate=5%, n=4 quarters in 1 yr → A=P×1.05⁴",
      "City population 50000 grows 4% each year. After 2yr: 50000×1.04²=50000×1.0816=₹54080"
    ],
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
    explanation:"Algebraic identities ek superpower hain — complex calculations instantly simplify ho jaati hain. (a+b)² expand mat karo step by step — formula seedha apply karo! (a+b)² = a²+2ab+b². Important derived result: a²+b² = (a+b)²−2ab. Difference of squares: a²−b² = (a+b)(a−b) — fastest multiplication trick (99×101=100²−1). Cube identities: a³+b³=(a+b)(a²−ab+b²). Surds (√ expressions) mein rationalization — denominator mein √ hatao conjugate multiply karke!",
    steps:[
      "(a+b)² = a²+2ab+b² → reverse: a²+b² = (a+b)²−2ab | Use when a+b and ab given",
      "(a−b)² = a²−2ab+b² → reverse: a²+b² = (a−b)²+2ab | Use when a−b and ab given",
      "a²−b² = (a+b)(a−b) — Difference of squares: fastest multiplication (98×102=100²−4=9996)",
      "(a+b)³ = a³+3a²b+3ab²+b³ | (a−b)³ = a³−3a²b+3ab²−b³ | a³+b³=(a+b)(a²−ab+b²)",
      "Key derived: if a+b=s, ab=p → a²+b²=s²−2p | a³+b³=s³−3sp | (a−b)²=s²−4p",
      "Surds multiplication: √a×√b=√(ab) | √a÷√b=√(a/b) | (√a+√b)(√a−√b)=a−b",
      "Rationalization: 1/√a=√a/a | 1/(√a+√b)=(√a−√b)/(a−b) | 1/(a+√b)=(a−√b)/(a²−b)"
    ],
    stepEgs:[
      "a+b=7, ab=10 → a²+b²=(7)²−2(10)=49−20=29 | a−b=√(49−40)=3",
      "a−b=5, ab=6 → a²+b²=25+12=37 | a+b=√(25+24)=7",
      "97×103=(100−3)(100+3)=10000−9=9991 | 48²=(50−2)²=2500−200+4=2304",
      "a+b=5, ab=6 → a³+b³=125−3×5×6=125−90=35 ✓ (=a³+b³=(a+b)(a²−ab+b²)=5×(25−6−6)=5×13=65? check: 2³+3³=35 ✓)",
      "a+b=10, ab=24 → a²+b²=100−48=52 | a³+b³=1000−3×10×24=1000−720=280",
      "√12×√3=√36=6 | √50÷√2=√25=5 | (√7+√3)(√7−√3)=7−3=4",
      "3/(√5+√2)=3(√5−√2)/(5−2)=3(√5−√2)/3=√5−√2"
    ],
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
    explanation:"Linear equation mein variables ki highest power = 1. Graph: hamesha straight line. Slope-intercept form: y = mx + c (m=slope, c=y-intercept). Standard form: ax+by=c. Slope = rise/run = (y₂−y₁)/(x₂−x₁). Positive slope: line rises left to right. Negative slope: falls. Zero slope: horizontal line. Undefined slope: vertical line. Parallel lines: same slope (m₁=m₂). Perpendicular lines: m₁×m₂=−1. Two lines intersection = system of equations ka solution!",
    steps:[
      "Slope-intercept form: y = mx + c → m=slope, c=y-intercept (where line crosses y-axis)",
      "Slope m = (y₂−y₁)/(x₂−x₁) = Δy/Δx = rise/run. Positive=going up, Negative=going down",
      "x-intercept: put y=0 → solve for x → point (x, 0). y-intercept: put x=0 → point (0, c)",
      "Parallel: same slope (m₁=m₂), different y-intercept → never meet",
      "Perpendicular: slopes multiply to −1 (m₁×m₂=−1) → meet at 90° angle",
      "Two equations → solve simultaneously: substitution or elimination method → intersection point",
      "Standard form ax+by+c=0 → slope = −a/b, x-int = −c/a, y-int = −c/b"
    ],
    stepEgs:[
      "3x+4y=12 → y=−3x/4+3 → slope=−3/4, y-int=3, x-int: 0=−3x/4+3→x=4 → (4,0)",
      "Through (2,3) and (5,9): m=(9−3)/(5−2)=6/3=2 → y=2x+c → 3=4+c → c=−1 → y=2x−1",
      "y=3x+2: x-int → 0=3x+2 → x=−2/3 → (−2/3,0) | y-int: (0,2)",
      "y=2x+3 and y=2x−1: slopes both=2 → parallel, no intersection",
      "y=3x+1: perpendicular slope = −1/3 → y=−x/3+c",
      "2x+y=7 and x+3y=11 → from eq1: y=7−2x → sub: x+3(7−2x)=11 → x=2, y=3",
      "ax+by+c=0 form: 2x+3y−6=0 → a=2,b=3,c=−6 → slope=−2/3, x-int=3, y-int=2"
    ],
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
    explanation:"Triangle ke 4 special centres hain — har ek ek alag construction se banta hai! (1) Centroid (G): 3 medians ka meeting point — G median ko 2:1 mein divide karta hai vertex se. (2) Incentre (I): 3 angle bisectors ka point — inscribed circle (incircle) ka centre, hamesha INSIDE triangle. (3) Circumcentre (O): 3 perpendicular bisectors ka point — circumscribed circle ka centre, acute=inside, right=hypotenuse midpoint, obtuse=outside. (4) Orthocentre (H): 3 altitudes ka point. Euler's Line: O, G, H collinear aur OG:GH=1:2!",
    steps:[
      "Centroid (G): teen medians (vertex se opposite side ka midpoint) ka intersection. G median ko 2:1 karta hai — vertex se 2/3, midpoint se 1/3",
      "Incentre (I): teen angle bisectors ka intersection. Inscribed circle ka centre. Always INSIDE any triangle. Inradius r = Area/s (s=semi-perimeter)",
      "Circumcentre (O): teen perpendicular bisectors ka intersection. Circumscribed circle ka centre. Circumradius R = abc/(4×Area)",
      "Orthocentre (H): teen altitudes ka intersection. Acute△ → inside | Right△ → at right angle vertex | Obtuse△ → outside",
      "Euler's Line: O, G, H hamesha ek line pe (except equilateral). OG:GH = 1:2 always",
      "Special case: Equilateral triangle mein O=G=I=H (sab ek hi point!)",
      "Centroid coordinates: G = ((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3) for vertices (x₁,y₁),(x₂,y₂),(x₃,y₃)"
    ],
    stepEgs:[
      "Median = 18cm → Vertex to G = 2/3×18=12cm | G to midpoint = 1/3×18=6cm",
      "Triangle with sides 6,8,10: s=12, Area=24 → Inradius r=24/12=2cm",
      "Right triangle 3-4-5: Area=6, abc=60 → Circumradius R=60/(4×6)=2.5 = hypotenuse/2 ✓",
      "Obtuse triangle 2-3-4: orthocentre falls OUTSIDE the triangle",
      "Euler line: O at (1,0), G at (2,0), H at (4,0) → OG=1, GH=2 → ratio 1:2 ✓",
      "Equilateral △ side=6: all 4 centres at same point (centroid), height=3√3, each centre at height √3 from base",
      "Vertices A(0,0), B(6,0), C(0,8): G=((0+6+0)/3,(0+0+8)/3)=(2,8/3)"
    ],
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
    explanation:"Congruence (≅): triangles bilkul same — same size aur same shape. Criteria: SSS, SAS, ASA, AAS, RHS. Similarity (~): same shape, different size. Criteria: AA (most common in exams!), SSS-similarity, SAS-similarity. Similar triangles mein: sides proportional, angles equal. Scale factor k → perimeters k times, areas k² times, volumes k³ times. BPT (Thales theorem): agar ek line triangle ki do sides ko proportionally divide kare toh woh teesri side ke parallel hai — bahut important theorem!",
    steps:[
      "Congruence criteria: SSS (3 sides equal) | SAS (2 sides+included angle) | ASA (2 angles+included side) | AAS | RHS (right, hyp, side)",
      "Similarity criteria: AA (2 equal angles → 3rd auto equal) | SSS~ (all 3 sides proportional) | SAS~ (2 sides proportional + included angle equal)",
      "Scale factor k: similar △ sides in ratio k → perimeter ratio=k, area ratio=k², volume ratio=k³",
      "BPT (Basic Proportionality Theorem): DE∥BC in △ABC → AD/DB = AE/EC",
      "Converse of BPT: if AD/DB = AE/EC then DE∥BC",
      "Corresponding parts: if △ABC~△PQR → ∠A=∠P, ∠B=∠Q, ∠C=∠R, AB/PQ=BC/QR=CA/RP",
      "Midpoint theorem: segment joining midpoints of 2 sides = ½ of 3rd side and parallel to it"
    ],
    stepEgs:[
      "△ABC: A=60°,B=80°,C=40°. △PQR: P=60°,Q=80°,R=40° → AA → Similar! (same 2 angles)",
      "Sides 3,4,5 vs 6,8,10 → ratio=1:2 everywhere → SSS~ → similar with k=2",
      "k=3:4 → areas = 9:16 | k=2:5 → areas = 4:25 | areas 36:100 → k=6:10=3:5",
      "△ABC, D on AB, E on AC, DE∥BC. AD=4, DB=6 → AE/EC=4/6=2/3",
      "If AE=6, EC=9 → AE/EC=2/3 → DE∥BC (converse BPT) ✓",
      "△ABC~△PQR, AB=6,BC=8,CA=10 (3-4-5 scaled×2), PQ=9 → ratio=9/6=3/2 → QR=12, PR=15",
      "M,N midpoints of AB,AC → MN = BC/2 = (1/2)×BC and MN∥BC"
    ],
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
    explanation:"Circle geometry mein theorems yaad karo — ek baar samajh aaya toh sab easy lag jaata hai! (1) Tangent ⊥ Radius at point of contact (always 90°). (2) External point se do tangents equal length ki hoti hain. (3) Inscribed angle = ½ × Central angle (same arc). (4) Semicircle mein inscribed angle = 90° (Thales theorem). (5) Angles in same segment equal hote hain. (6) Radius⊥chord → chord bisect hoti hai. Chord-chord, secant-secant, tangent-secant — in sab ke liye power of a point theorem!",
    steps:[
      "Tangent properties: Tangent⊥Radius at contact point (90°) | External point P: PA=PB (two tangents equal)",
      "Chord properties: Radius⊥chord → bisects chord. Equal chords are equidistant from centre",
      "Angle theorem: Central angle = 2 × Inscribed angle (same arc). Angle in semicircle = 90°",
      "Same segment theorem: all inscribed angles subtended by same arc are equal",
      "Power of a point: External point P: PT² = PA×PB (tangent² = secant×external secant segment)",
      "Chord-chord inside circle: PA×PB = PC×PD (intersecting chords multiply = constant)",
      "Cyclic quadrilateral: opposite angles supplementary (∠A+∠C=180°, ∠B+∠D=180°)"
    ],
    stepEgs:[
      "OA=radius, PT=tangent → OT⊥PT → ∠OTP=90°. External P: PA=PB=√(PO²−r²)",
      "Chord AB=16cm, distance from centre=6cm → half chord=8, radius=√(36+64)=10cm",
      "Arc AB = 120° → Central angle AOB=120° → Inscribed angle APB=60° (P on circle)",
      "∠ACB = ∠ADB = 35° (both inscribed in same segment for chord AB)",
      "External P, tangent=6cm, near secant point=3cm → 6²=3×PB → PB=12 → chord=9cm",
      "Chords AC and BD intersect at P: AP=4, PC=9 → BP×PD=36 → if BP=6 then PD=6",
      "Cyclic quad ABCD: ∠A=80° → ∠C=100° | ∠B=110° → ∠D=70°"
    ],
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
    explanation:"Triangle properties: angle sum=180°, exterior angle=sum of 2 non-adjacent interior angles. Area = ½×base×height. Pythagoras (right △): a²+b²=c² (c=hypotenuse). Triplets MUST memorize: 3-4-5, 5-12-13, 8-15-17, 7-24-25 (and their multiples). Heron's formula: jab teeno sides diye ho aur height nahi — A=√(s(s-a)(s-b)(s-c)) where s=(a+b+c)/2. Equilateral: Area=(√3/4)a², Height=(√3/2)a. Isosceles: split by height into 2 right triangles. Sine rule: a/sinA=b/sinB=c/sinC. Cosine rule: a²=b²+c²−2bc·cosA!",
    steps:[
      "Angle properties: sum=180° | Exterior angle = sum of two opposite interior angles",
      "Area = ½ × base × height (h⊥ to base). Must identify the base-height pair correctly",
      "Equilateral (all sides a): Area=(√3/4)a² | Height=(√3/2)a | All angles=60°",
      "Pythagorean theorem: a²+b²=c² (ONLY for right triangles, c=hypotenuse). Triplets: 3-4-5, 5-12-13, 8-15-17, 7-24-25",
      "Heron's formula (all 3 sides given): s=(a+b+c)/2, Area=√(s(s−a)(s−b)(s−c))",
      "Isosceles triangle (equal sides=a, base=b): Height h=√(a²−b²/4). Area=½×b×h",
      "Triangle inequality: sum of any 2 sides > 3rd side. Longest side < sum of other two"
    ],
    stepEgs:[
      "In △ exterior angle=110°: one interior=60° → other interior=110°−60°=50° ✓ (or 180°−110°=70°=third angle)",
      "Base=12, Area=48 → height=48/(½×12)=8cm | Base=10, h=7 → Area=35cm²",
      "Equilateral side=8: Area=(√3/4)×64=16√3≈27.7cm² | Height=(√3/2)×8=4√3≈6.93cm",
      "Legs 5,12: hyp=√(25+144)=√169=13 (5-12-13 triplet!) | Check: 5²+12²=25+144=169=13² ✓",
      "Sides 9,12,15 (3-4-5 × 3 → right triangle!): s=18, Area=√(18×9×6×3)=√2916=54cm²",
      "Isosceles: equal sides=13, base=10. h=√(169−25)=√144=12. Area=½×10×12=60cm²",
      "Can 3,7,11 be sides? 3+7=10 < 11 → NO! Triangle inequality fails"
    ],
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
    explanation:"Quadrilateral = 4-sided polygon. Angle sum = 360°. Types: Square (all sides+angles equal), Rectangle (all 90°, opposite sides equal), Rhombus (all sides equal, diagonals bisect at 90°), Parallelogram (opposite sides∥ and equal), Trapezium (one pair ∥), Kite (two pairs of adjacent equal sides). Key hierarchy: Square ⊂ Rectangle ⊂ Parallelogram. Rhombus ⊂ Parallelogram. Diagonal of rhombus bisect at 90° — area=½d₁d₂. Trapezium area=½(sum of parallel sides)×height!",
    steps:[
      "Square: Area=a² | Perimeter=4a | Diagonal=a√2 | All angles=90° | Diagonals equal and bisect at 90°",
      "Rectangle: Area=l×b | Perimeter=2(l+b) | Diagonal=√(l²+b²) | Opposite sides equal, all 90°",
      "Rhombus: Area=½×d₁×d₂ | Perimeter=4a | Diagonals bisect each other at 90° | Each diagonal bisects the angles",
      "Parallelogram: Area=base×height | Perimeter=2(a+b) | Opposite sides∥ and equal | Adjacent angles supplementary (add to 180°)",
      "Trapezium: Area=½×(a+b)×h (a,b=parallel sides, h=height between them) | Isosceles trapezium: legs equal",
      "Kite: Area=½×d₁×d₂ (diagonals) | One diagonal bisects the other at 90°",
      "Key relationships: Square diag=a√2 | Rectangle diag=√(l²+b²) | Rhombus: side=√((d₁/2)²+(d₂/2)²)"
    ],
    stepEgs:[
      "Square side=7: Area=49, Perim=28, Diagonal=7√2≈9.9cm",
      "Rectangle l=10, b=6: Area=60, Perim=32, Diagonal=√(100+36)=√136=2√34≈11.66",
      "Rhombus d₁=10, d₂=24: Area=½×10×24=120cm² | Side=√(5²+12²)=13cm (5-12-13 triplet!)",
      "Parallelogram base=15, h=8: Area=120. Adjacent angles 70°+110°=180° ✓",
      "Trapezium parallel sides=8 and 14, h=6: Area=½×(8+14)×6=½×22×6=66cm²",
      "Kite d₁=6, d₂=10: Area=½×6×10=30cm²",
      "Rhombus side=10, one diagonal=12: other diagonal=√(4×(100−36))=√256=16 → Area=½×12×16=96cm²"
    ],
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
    explanation:"Regular polygon: saari sides equal + saare angles equal. n sides → n vertices → n angles. Interior angle sum = (n−2)×180°. Each interior angle (regular) = (n−2)×180°/n. Exterior angle = 360°/n. Interior + Exterior = 180° (supplementary). Exterior angles ka sum HAMESHA 360° — chahe koi bhi polygon ho! Number of diagonals = n(n−3)/2. Common polygons: Triangle(3)=60°, Square(4)=90°, Pentagon(5)=108°, Hexagon(6)=120°, Octagon(8)=135°, Decagon(10)=144°. Regular hexagon area = (3√3/2)a²!",
    steps:[
      "Interior angle sum = (n−2) × 180°. For n=3: 180°, n=4: 360°, n=5: 540°, n=6: 720°",
      "Each interior angle (regular polygon) = (n−2)×180°/n. Exterior = 360°/n",
      "Interior + Exterior = 180° (they are supplementary — linear pair)",
      "Exterior angle sum = 360° ALWAYS — for any convex polygon, any n!",
      "Number of diagonals = n(n−3)/2. Triangle=0, Square=2, Pentagon=5, Hexagon=9, Octagon=20",
      "Find n from exterior angle: n = 360°/exterior angle | From interior: n = 360°/(180°−interior)",
      "Regular hexagon area = (3√3/2)a² | Perimeter = 6a | It can tile a plane perfectly!"
    ],
    stepEgs:[
      "Heptagon n=7: sum=(7−2)×180=5×180=900° | Each angle=900/7≈128.57°",
      "Regular octagon: each interior=(8−2)×180/8=6×180/8=135° | Exterior=360/8=45°",
      "Octagon: 135°+45°=180° ✓ (supplementary) | Exterior sum=8×45°=360° ✓",
      "Pentagon exterior=72°: sum=5×72=360° ✓ | ANY polygon: exterior sum=360°",
      "Decagon n=10: diagonals=10×(10−3)/2=10×7/2=35 diagonals!",
      "Exterior angle=24° → n=360/24=15 sides (Pentadecagon) | Interior angle=156° → ext=24°",
      "Hexagon side=6: Area=3√3/2×36=54√3≈93.5cm² | Perimeter=36cm"
    ],
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
    explanation:"Right Prism: ek 3D solid jisme do identical parallel polygonal bases hote hain aur lateral faces bilkul rectangles hote hain (tilted nahi). 'Right' ka matlab — apex seedha base ke upar. Base koi bhi polygon ho sakta hai — triangle, square, pentagon, hexagon. Teen important formulas: LSA (Lateral Surface Area) = base perimeter × height. TSA (Total Surface Area) = LSA + 2×base area. Volume = base area × height. Triangular prism: base = triangle (½bh), square prism = cuboid. Hexagonal prism: base = (3√3/2)a². Exam trick: pehle base shape identify karo, phir uska area aur perimeter nikal lo — baki sab formulas simple multiplication!",
    steps:[
      "Base shape identify karo: triangle (½bh), square (a²), rectangle (lb), hexagon (3√3/2 × a²). Yeh alag-alag bases ke liye area formula hai.",
      "Base perimeter nikalo: triangle = a+b+c, square = 4a, rectangle = 2(l+b), regular hexagon = 6a. Perimeter = sum of all base edges.",
      "LSA (Lateral Surface Area) = Base Perimeter × Prism Height. Sirf side faces include. Isko 'unroll' karo toh ek rectangle milega!",
      "TSA = LSA + 2 × Base Area. Top aur bottom (do identical bases) ko add karo. Agar open prism (box without lid): TSA = LSA + 1 base.",
      "Volume = Base Area × Height. Yeh prism ka total space fill karta hai — base shape ka area × height tak stretch karo.",
      "Triangular prism special case: base = right triangle (sides a, b, hyp c). LSA = (a+b+c)×h. Vol = ½×a×b×h. Equilateral base: area = (√3/4)a².",
      "Exam tip: 'Longest diagonal of prism' = √(perimeter²/4 + h²) for square prism = √(2a²+h²). Open box surface area = LSA + 1 base area only."
    ],
    stepEgs:[
      "Triangular prism: base triangle 3-4-5, h=10 → base area=½×3×4=6 cm²",
      "Perimeter of 3-4-5 triangle = 3+4+5 = 12 cm",
      "LSA = 12 × 10 = 120 cm²",
      "TSA = 120 + 2×6 = 132 cm²",
      "Volume = 6 × 10 = 60 cm³",
      "Square prism: a=5, h=8 → LSA=4×5×8=160, Vol=25×8=200 cm³",
      "Hexagonal prism: a=4, h=10 → Base=3√3/2×16=24√3, Vol=24√3×10=240√3 cm³"
    ],
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
    explanation:"Right Circular Cone: ek circular base se ek apex (top point) tak tapered 3D shape. Teen measurements — r (base radius), h (vertical height), l (slant height — apex se base edge tak ki straight distance). Pythagorean relation: l = √(r²+h²). LSA (Curved Surface Area) = πrl — sirf curved outside. TSA = πrl + πr² = πr(r+l) — base circle bhi include karo. Volume = (1/3)πr²h — exactly cylinder ka ⅓! Common exam ratios: agar same base aur height → Cylinder:Cone:Sphere volumes = 3:1:2. Frustum (cone ka upper part cut karo) SSC mein kabhi kabhi aata hai — LSA=π(R+r)l, Vol=πh/3(R²+Rr+r²). 3-4-5 Pythagorean triple: r=3, h=4 → l=5. r=6, h=8 → l=10!",
    steps:[
      "l (slant height) = √(r² + h²). Yaad rakho: r=3,h=4→l=5; r=6,h=8→l=10; r=5,h=12→l=13 (Pythagorean triples!).",
      "LSA (Curved Surface Area) = π × r × l. Sirf bahar ka curved part — base circle nahi. Unfurl karo toh sector milega!",
      "TSA = π × r × (r + l) = LSA + base circle area (πr²). Total bahri surface = curved + bottom circle.",
      "Volume = (1/3) × π × r² × h. Cone = ⅓ of cylinder with same base & height. Cylinder:Cone = 3:1 ratio.",
      "Key ratio: Cylinder, Cone, Sphere (same r, same h=2r) → Volume ratio = 3 : 1 : 2. Bada exam shortcut!",
      "n small cones from 1 big cone (same r): Big_h = n × small_h. Kyunki Vol ∝ h jab r same ho.",
      "Frustum: Cut a cone parallel to base → R (big base), r (small base), h, l=√(h²+(R−r)²). LSA=π(R+r)l, Vol=(πh/3)(R²+Rr+r²)."
    ],
    stepEgs:[
      "r=6, h=8 → l=√(36+64)=√100=10 cm",
      "r=6, l=10 → LSA=π×6×10=60π≈188.5 cm²",
      "TSA=π×6×(6+10)=π×6×16=96π≈301.6 cm²",
      "Volume=(1/3)×π×36×8=96π≈301.6 cm³",
      "Cylinder V=π×36×8=288π, Cone=96π → ratio 3:1 ✓",
      "Big cone r=3, h=12. 4 small cones same r → small h=12/4=3 cm",
      "Frustum: R=10, r=6, h=8 → l=√(64+16)=√80≈8.94. LSA=π×16×8.94≈449 cm²"
    ],
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
    explanation:"Right Circular Cylinder: do circular bases (top aur bottom) aur ek curved side. Sirf 2 values chahiye — r (radius) aur h (height). LSA (Curved SA) = 2πrh — isko unroll karo toh ek rectangle milega jiska length=2πr (circumference) aur width=h. TSA = 2πr(r+h) = 2πrh + 2πr² (dono circles add karo). Volume = πr²h. Hollow cylinder (pipe, tube): material ka volume = π(R²−r²)×h jahan R=outer, r=inner radius. π = 22/7 use karo jab r multiple of 7 ho, otherwise 3.14 use karo. Exam mein: wire problems (wire ko melt karke cylinder banana), rain water collecting in cylindrical tank — yeh sab Volume conservation pe based hain!",
    steps:[
      "LSA (Curved Surface Area) = 2πrh. Cylinder ko 'open karke flatten' karo → rectangle milega: width=2πr, height=h.",
      "TSA = 2πr(r + h) = LSA + 2πr². Do circular bases (top + bottom = 2πr²) add karo. Open cylinder: TSA = LSA + πr² (only one base).",
      "Volume = π × r² × h. Base area (πr²) × height. π ≈ 22/7 jab r = 7 ka multiple; π ≈ 3.14 otherwise.",
      "Hollow cylinder (pipe): Volume of material = π(R² − r²) × h. Thickness = R − r. Mass = volume × density.",
      "Volume conservation: solid A ko melt karo → cylinder B banao. Volume A = Volume B. Sphere melt → cylinder: (4/3)πr³ = πR²H.",
      "Wire problems: Wire (thin cylinder) ko coil karo → new shape. Wire V = πr²×length. Always equate volumes.",
      "Ratio shortcuts: Same base cylinder:cone:hemisphere = 3:1:2. Cylinder height double → Volume double. Radius double → Volume 4× (quadruple)!"
    ],
    stepEgs:[
      "r=7, h=10 → LSA=2×(22/7)×7×10=2×22×10=440 cm²",
      "TSA=2×(22/7)×7×(7+10)=2×22×17=748 cm²",
      "Volume=(22/7)×49×10=22×7×10=1540 cm³",
      "Hollow: R=5, r=3, h=10 → V=π(25−9)×10=160π≈503 cm³",
      "Sphere r=3 melt → Cylinder R=3: (4/3)π×27=πr²H → H=4 cm",
      "Wire: r=1mm=0.1cm, L=100m=10000cm → V=π×0.01×10000=100π cm³",
      "Radius double (r→2r): New Vol=π(2r)²h=4πr²h → Vol 4× bada!"
    ],
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
    explanation:"Sphere: bilkul gol 3D shape jahan har point surface pe centre se equal distance (= radius r) pe hai. Surface Area = 4πr² — ek sphere ki surface = exactly 4 great circles ka area! Volume = (4/3)πr³. Memory trick: Surface 4πr² → Volume mein r ek aur degree badhta hai: (4/3)πr³. Hemisphere (half sphere): Curved SA = 2πr² (sphere ka aadha), Flat base = πr², TSA = 3πr². Hemisphere Volume = (2/3)πr³. MOST IMPORTANT EXAM SHORTCUT: n small spheres from 1 big sphere → R³ = n × r³ (Volumes equal karo, π aur 4/3 cancel). SA ratio: SA₁/SA₂ = (r₁/r₂)². Volume ratio: V₁/V₂ = (r₁/r₂)³. SA ratio given → find Volume ratio: cube the square root of SA ratio!",
    steps:[
      "Sphere SA = 4πr². Yaad karo: '4 great circles'. π = 22/7 jab r = 7 ka multiple hai (7, 14, 21…).",
      "Sphere Volume = (4/3)πr³. Ek trick: V = (SA × r)/3 = (4πr² × r)/3. Useful agar SA pata ho aur V nikalna ho.",
      "n small spheres from 1 big: R³ = n × r³ (volume conservation). → n = (R/r)³. → R = r × ∛n.",
      "SA ratio = r₁²:r₂². Volume ratio = r₁³:r₂³. Agar SA ratio = 4:9 → r ratio = 2:3 → Vol ratio = 8:27.",
      "Hemisphere curved SA = 2πr². TSA (placed on surface) = 2πr² + πr² = 3πr². Volume = (2/3)πr³.",
      "Sphere melted → cylinder/cone: Sphere V = Other shape V. (4/3)πR³ = πr²h (cylinder). Solve for unknown.",
      "Largest sphere inside cube (side a): r = a/2. Largest sphere inside cylinder (r, h): r_sphere = min(r, h/2). Packing problems!"
    ],
    stepEgs:[
      "r=7 → SA=4×(22/7)×49=4×22×7=616 cm²",
      "r=7 → V=(4/3)×(22/7)×343=4×22×49/3≈1437 cm³",
      "Big R=6, small r=2 → n=(6/2)³=3³=27 small spheres",
      "SA ratio=4:9 → r ratio=2:3 → Vol ratio=8:27",
      "r=7, Hemisphere: Curved SA=308, TSA=462, V=(2/3)×(22/7)×343≈718 cm³",
      "Sphere r=3 melted → Cylinder r=3: (4/3)π×27=π×9×h → h=4 cm",
      "Cube side=6 → Largest sphere r=3; SA of sphere=4π×9=36π≈113 cm²"
    ],
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
    explanation:"Hemisphere: sphere ko exactly aadha kaat lo — aadha solid milta hai. Real life: bowl, dome, igloo, half-cut orange. Do important surfaces samajhna zaruri hai — (1) Curved (rounded) surface = 2πr² aur (2) Flat circular base = πr². Jab hemisphere table pe rakha ho: TSA = Curved SA + Base = 2πr² + πr² = 3πr². Jab free floating (like half melon): same TSA = 3πr². Volume = (2/3)πr³ = exactly ½ of full sphere volume. Hollow hemisphere (like a bowl): Inner curved SA + Outer curved SA + annular ring (top edge). Exam mein solid sphere cut → 2 hemispheres: new TSA of each = 2πr² + πr² = 3πr² (badhta hai sphere ke 4πr² se kyunki cut surface expose hoti hai). Key comparison: Sphere TSA = 4πr²; Hemisphere TSA = 3πr² = ¾ of sphere SA!",
    steps:[
      "Curved SA (rounded part only) = 2πr². Yeh sphere ka half = 4πr²/2 = 2πr².",
      "Flat circular base area = πr² (ek circle). Diameter = 2r ka simple circle.",
      "TSA = Curved SA + Base = 2πr² + πr² = 3πr². Table pe rakhe hemisphere ka poora bahri surface.",
      "Volume = (2/3)πr³ = exactly half of full sphere volume [(4/3)πr³ ÷ 2]. Quick check: 2/3 = 4/3 ÷ 2 ✓",
      "Solid sphere cut → 2 hemispheres: original sphere SA = 4πr². Each hemisphere TSA = 3πr². Total of both = 6πr² > original sphere SA (cut expose karta hai extra area).",
      "Hollow hemisphere (bowl): Outer curved = 2πR², Inner curved = 2πr², Top ring = π(R²−r²). Total = 2π(R²+r²) + π(R²−r²).",
      "n = (R/r)³ hemispheres from 1 big. Ratio rule: same as spheres since V ∝ r³."
    ],
    stepEgs:[
      "r=7 → Curved SA=2×(22/7)×49=2×22×7=308 cm²",
      "r=7 → Base area=(22/7)×49=154 cm²",
      "r=7 → TSA=308+154=462 cm²",
      "r=3 → Vol=(2/3)×π×27=18π≈56.5 cm³",
      "Sphere r=7 cut → Each hemisphere TSA=3×(22/7)×49=462 cm². Both together=924 cm² vs sphere 616 cm²",
      "Hollow bowl R=5, r=4: outer=2π×25=50π, inner=2π×16=32π, ring=π(25−16)=9π, Total=91π cm²",
      "Big R=6, small r=3 → n=(6/3)³=8 small hemispheres"
    ],
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
    explanation:"Rectangular Parallelepiped = Cuboid = box shape! Teen measurements: l (length), b (breadth/width), h (height). Yeh sabse common 3D shape hai exams mein — room, tank, brick, box sab cuboids hain. TSA = 2(lb + bh + hl) — 3 pairs of opposite faces, each pair = 2×face. LSA (Lateral Surface Area, 4 side faces only, no top/bottom) = 2h(l+b). Volume = l×b×h. Space diagonal (ek corner se opposite corner tak) = √(l²+b²+h²) — yeh 3D Pythagoras theorem hai! CUBE: special cuboid jahan l=b=h=a. Cube TSA=6a², Vol=a³, Diagonal=a√3. Agar cube ka volume pata ho → a = ∛V → phir TSA nikal sakte hain. Room problem: longest stick (=space diagonal). Tank filling time = Volume ÷ flow rate.",
    steps:[
      "TSA = 2(lb + bh + hl). Teen pairs of faces: lb (top+bottom), bh (front+back), hl (left+right). Each pair × 2.",
      "LSA = 2h(l+b). Sirf 4 side faces (walls), top aur bottom nahi. Room ke 4 walls ka area = LSA.",
      "Volume = l × b × h. Simple multiplication. Tank capacity = l×b×h litres (agar cm mein → divide by 1000).",
      "Space diagonal = √(l² + b² + h²). 3D Pythagoras. Longest rod that fits inside cuboid = space diagonal.",
      "Cube (l=b=h=a): TSA = 6a². Vol = a³. Diagonal = a√3. Given Vol → a = ∛V → find TSA = 6a².",
      "Cube: ratio of diagonal to edge = √3 : 1. TSA:Vol = 6/a (dimension dependent — not constant!).",
      "Surface area change: paint all faces = TSA. Paint only walls = LSA. Paint only floor = lb. Remove from questions carefully!"
    ],
    stepEgs:[
      "l=8, b=6, h=5 → TSA=2(48+30+40)=2×118=236 cm²",
      "LSA=2×5×(8+6)=2×5×14=140 cm²",
      "Volume=8×6×5=240 cm³",
      "Diagonal=√(64+36+25)=√125=5√5≈11.18 cm",
      "Cube Vol=1000 → a=10 → TSA=6×100=600 cm². Diagonal=10√3≈17.3 cm",
      "Room 12×10×8 → Longest rod=√(144+100+64)=√308≈17.55 m",
      "Tank 5m×4m×3m → Capacity=60 m³=60,000 litres"
    ],
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
    explanation:"Regular Right Pyramid: ek polygonal base (square, triangle, hexagon) aur saari lateral edges ek common apex point par milti hain — apex seedha base ke centre ke upar. 'Right' = perpendicular axis. 3 important heights samajhna zaruri: (1) h = vertical height (base centre to apex), (2) l = slant height (midpoint of base edge to apex — triangular face ki height), (3) lateral edge = corner of base to apex. Apothem = base centre se base ki kisi edge ka perpendicular distance. For square: apothem = side/2. Slant height l = √(h² + apothem²). LSA = ½ × base perimeter × l. TSA = LSA + base area. Volume = (1/3) × base area × h — exactly ⅓ of prism with same base & height! Exam mein most common: square base pyramid. Egypt ka Great Pyramid! Number of faces = n+1 (n base edges + n triangular faces + 1 base).",
    steps:[
      "Base identify karo aur apothem nikalo: Square (side=a) → apothem=a/2. Equilateral triangle (side=a) → apothem=a/(2√3). Regular hexagon → apothem=a√3/2.",
      "Slant height l = √(h² + apothem²). Yeh triangular lateral face ki median height hai. Body height h se confuse mat karo!",
      "LSA (Lateral SA) = ½ × Base Perimeter × Slant height l. All triangular faces combined. Each triangular face area = ½ × base edge × l.",
      "TSA = LSA + Base Area. Base area: square=a², equilateral triangle=(√3/4)a², hexagon=(3√3/2)a².",
      "Volume = (1/3) × Base Area × h. Exactly ⅓ of prism. Pyramid:Prism = 1:3 (same base & height).",
      "n faces = n triangular faces + 1 base. n edges = 2n. n vertices = n+1 (n base corners + 1 apex). Euler: F+V−E=2.",
      "Exam shortcut: Square pyramid — agar base a aur slant l diya: LSA=2al, TSA=2al+a², Vol=a²h/3. Lateral edge=√(h²+(a√2/2)²)."
    ],
    stepEgs:[
      "Square base a=6 → apothem=6/2=3 cm",
      "h=4, apothem=3 → l=√(16+9)=√25=5 cm",
      "LSA=½×(4×6)×5=½×24×5=60 cm²",
      "TSA=60+36=96 cm²",
      "Volume=(1/3)×36×4=48 cm³",
      "F=4+1=5 faces, E=8 edges, V=5 vertices. Euler: 5+5−8=2 ✓",
      "Lateral edge=√(h²+(a/√2)²)=√(16+18)=√34≈5.83 cm"
    ],
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
    explanation:"Heights & Distances: trigonometry ka practical application — real world mein heights ya distances directly measure karna impossible hota hai (mountain, tower, building), toh angles aur trig ratios use karte hain. Do key angles: (1) Angle of Elevation — observer se upar kisi object ko dekhne ka angle (horizontal se upar). (2) Angle of Depression — observer se neeche dekhne ka angle (horizontal se neeche). IMPORTANT: Angle of elevation from A to B = Angle of depression from B to A (alternate interior angles, parallel lines). Most useful formula: tan θ = Height/Base (opposite/adjacent). Standard values: tan 30°=1/√3≈0.577, tan 45°=1, tan 60°=√3≈1.732. Exam mein: Tower/building height nikalo, two observer problems (do angles given), shadow problems (sun ka angle), two towers opposite sides. Always draw diagram pehle!",
    steps:[
      "Diagram zaroor banao. Observer point, object top, base/ground clearly mark karo. Right angle identify karo (usually at base of tower).",
      "Angle of Elevation = angle measured UPWARD from horizontal. Angle of Depression = angle measured DOWNWARD from horizontal. Dono numerically equal hote hain jab lines parallel hain.",
      "Main formula: tan θ = Opposite/Adjacent = Height/Base (horizontal distance). sin θ = H/Hypotenuse, cos θ = Base/Hypotenuse.",
      "Standard angle values: tan 30°=1/√3, tan 45°=1, tan 60°=√3. If angle=45°: height = distance. If angle=60°: height=distance×√3.",
      "Two observers / two angles: Ek tower, do observer positions → 2 equations. Variables: h (height), d (distance). Solve simultaneously.",
      "Two poles/towers problem: Heights h₁, h₂, distance d. Wire crossing point from ground: x/h₁ = (d−x)/h₂ → x = d×h₁/(h₁+h₂).",
      "Sun/shadow: tan(sun angle) = pole height / shadow length. Shadow lengthens as sun goes lower (smaller angle). sin/cos bhi use hota hai agar hypotenuse involve ho."
    ],
    stepEgs:[
      "Tower height=h, distance=d, angle of elevation=θ. tan θ = h/d",
      "Angle=45° → tan45°=1 → h=d. Height = Distance. Simple!",
      "Tower 30m, elevation 60° → tan60°=30/d → √3=30/d → d=10√3≈17.3m",
      "Elevation 30° from d₁, elevation 60° from d₂: two equations, solve h",
      "Two poles 10m & 20m, 30m apart: crossing x=30×10/(10+20)=10m from pole 1",
      "Shadow problem: pole 10m, sun angle 30° → tan30°=10/shadow → shadow=10√3m",
      "From top of 75m tower, depression angles 30° & 45°: d₁=75m, d₂=75√3m, gap=75(√3−1)≈54.9m"
    ],
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
    explanation:"Histogram: continuous data ka visual representation using adjoining bars. Bar chart se bilkul ALAG — histogram mein bars ke beech koi gap nahi hota (kyunki data continuous hai — scores, ages, heights). X-axis pe class intervals (ranges), Y-axis pe frequency ya frequency density. Equal class widths: Y-axis = frequency directly. Unequal class widths: Y-axis = Frequency Density (FD) = Frequency ÷ Class Width. Bar ka AREA = frequency (proportional). Mode: sabse lambe bar wali class = modal class. Exact mode formula: Mode = L + [(f₁−f₀)/(2f₁−f₀−f₂)] × h, jahan L=lower limit, f₁=modal freq, f₀=prev freq, f₂=next freq, h=class width. Mean se histogram mein: Σfx/Σf jahan x = class midpoint. Exam DI mein: histogram padho → frequencies nikalo → calculations karo.",
    steps:[
      "Continuous data: exam scores, heights, ages, weights — yeh histogram ke liye suitable hain. Discrete/categorical data ke liye bar chart use karo.",
      "Class interval table banao: lower limit, upper limit, frequency. Class width = upper − lower. Midpoint = (lower+upper)/2.",
      "Equal class widths: Y-axis = Frequency. Unequal widths: Y-axis = Frequency Density = f/class width. Area of bar = Frequency.",
      "Bars draw karo: X-axis pe class intervals mark karo, heights = frequency (ya FD). Adjacent bars touch each other — NO GAPS.",
      "Modal class = class with highest frequency (tallest bar). Exact mode: L + [(f₁−f₀)/(2f₁−f₀−f₂)] × h.",
      "Mean from histogram: x̄ = Σ(midpoint × frequency) / Σfrequency. Midpoint of 10-20 = 15, of 20-30 = 25, etc.",
      "Median: cumulative frequency → find n/2 class → L + [(n/2 − cf)/f] × h. Median class = first class where cum freq ≥ n/2."
    ],
    stepEgs:[
      "Classes: 0-10(f=5), 10-20(f=12), 20-30(f=8). Equal width=10, so Y=frequency directly",
      "Midpoints: 5, 15, 25. Mean = (5×5+15×12+25×8)/(5+12+8)=25+180+200/25=16.2",
      "Tallest bar: f=12 (class 10-20). Modal class = 10-20",
      "Unequal: 0-20(f=10), 20-30(f=12). FD(0-20)=10/20=0.5, FD(20-30)=12/10=1.2",
      "Mode exact: L=10, f₁=12, f₀=5, f₂=8, h=10 → Mode=10+[(12−5)/(24−5−8)]×10=10+7/11×10≈16.4",
      "Cum freq: 5,17,25. Median class: n/2=12.5 → first cum≥12.5 is 17 → class 10-20",
      "Median=10+[(12.5−5)/12]×10=10+6.25=16.25"
    ],
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
    explanation:"Frequency Polygon: histogram ke UPAR ek line graph — ya directly banao midpoints plot karke. Yeh data distribution ka shape dikhata hai — symmetric, skewed, bimodal. Banane ke 2 methods: (1) Histogram se: har bar ke top midpoint pe point rakho → connect with straight lines. (2) Directly: class midpoints X-axis pe, frequencies Y-axis pe → points plot → connect. Closed polygon: first class se pehle aur last class ke baad zero-frequency class add karo — lines X-axis ko touch karti hain. Frequency polygon ka AREA = histogram ka area = total frequency. Two distributions compare karna easy — dono polygons ek hi graph pe. Ogive (cumulative frequency polygon): upper class limits vs cumulative frequency. Median = ogive mein n/2 pe horizontal line ka intersection.",
    steps:[
      "Midpoint of each class = (Lower limit + Upper limit) / 2. Class 10-20 → midpoint = 15. Class 20-30 → midpoint = 25.",
      "Points plot karo: (midpoint, frequency). Example: (15, 8), (25, 12), (35, 6).",
      "Adjacent points ko straight lines se connect karo. Yeh frequency polygon hai — histogram nahi.",
      "Closed polygon: before first class, add midpoint of imaginary class with f=0. After last class, same. Line X-axis se touch hoti hai dono ends pe.",
      "Two distributions compare: dono ka frequency polygon ek hi graph pe → shapes compare karo. Higher peak = more concentrated data.",
      "Ogive (Cumulative Frequency Polygon): upper class limits vs cumulative frequency. Median = ogive ka n/2 point. Q1=n/4, Q3=3n/4 bhi ogive se nikaalo.",
      "Shape analysis: Symmetric polygon = normal distribution. Left-skewed = tail left, peak right. Right-skewed = tail right, peak left. Bimodal = do peaks."
    ],
    stepEgs:[
      "Classes: 10-20(f=5), 20-30(f=8), 30-40(f=12), 40-50(f=7), 50-60(f=3). Midpoints: 15,25,35,45,55",
      "Points: (15,5), (25,8), (35,12), (45,7), (55,3)",
      "Connect: (15,5)→(25,8)→(35,12)→(45,7)→(55,3) with lines",
      "Close: add (5,0) before aur (65,0) after. Lines X-axis ko touch karti hain",
      "Peak at 35 → modal class is 30-40",
      "Cum freq: 5,13,25,32,35. Ogive points: (20,5),(30,13),(40,25),(50,32),(60,35). n/2=17.5 → median≈33.3",
      "Shape: peak left of center → Right skewed distribution"
    ],
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
    explanation:"Bar Diagram & Pie Chart: Data Interpretation (DI) ka core — SSC, Bank exams mein 5-10 questions isi pe. PIE CHART: Circle = 360°. Har category ka sector angle = (category value / total) × 360°. Percentage = angle/360 × 100 = value/total × 100. Formula juggle: angle given → find % (÷ by 3.6); % given → find angle (× 3.6). BAR DIAGRAM: Bars ki height ∝ value. Horizontal bars bhi hote hain. Bars ke beech gap hota hai (histogram se alag — histogram continuous data, bar chart categorical). Types: Simple bar (ek category), Multiple/Grouped bar (categories side by side), Stacked bar (parts ek bar mein). DI approach: (1) First READ the title, units, legend. (2) Koi ek question solve karo warmup ke liye. (3) Percentage/ratio/absolute difference — carefully identify karo. Common traps: % change vs absolute change, wrong year data, partial reading.",
    steps:[
      "Pie chart: Angle of sector = (Value / Total) × 360°. Ek sector ka percentage = Angle / 360 × 100 = Value / Total × 100.",
      "Reverse: Angle given → Value = (Angle/360) × Total. Percentage given → Value = (% / 100) × Total. Angle ↔ % conversion: angle = % × 3.6.",
      "Bar chart: bars ki height directly value dikhati hai. Read carefully — Y-axis ka scale (e.g., 'in thousands' — multiply by 1000!).",
      "Percent change: (New − Old) / Old × 100. Careful: question % increase puch raha hai ya absolute increase. Read carefully!",
      "Multiple bar chart: categories compare karo (e.g., Sales by year for different products). Stacked: total aur parts dono dikhte hain.",
      "DI approach: (1) Table/chart read karo — title, units, legend. (2) Question mein kya pooch raha hai exactly. (3) Relevant data extract karo. (4) Calculation karo.",
      "Common DI question types: ratio comparison, percentage share, % change, absolute difference, average, finding missing value."
    ],
    stepEgs:[
      "Pie: total=₹1200, category A=₹300 → angle=(300/1200)×360=90°, %=25%",
      "Angle given=72° → %=72/360×100=20%. Value if total=500 → 20%×500=100",
      "Bar chart: 2020=500, 2021=650. % change=(650−500)/500×100=30% increase",
      "Multiple bar: Product A: Q1=100, Q2=120, Q3=90. Q2 is highest for A.",
      "Stacked bar: 2021 total=500, Electronics=200(40%), Clothes=150(30%), Food=150(30%)",
      "DI trap: 'by how much more' = absolute. 'What % more' = relative. Read carefully!",
      "% share: A=₹450 out of ₹1800 total = 25%. Angle = 25×3.6 = 90°"
    ],
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
    explanation:"Trigonometric Ratios: right-angled triangle mein angles aur sides ka relationship. Teen sides: Perpendicular (P, opposite to θ), Base (B, adjacent to θ), Hypotenuse (H, longest side, opposite to 90°). 6 trig ratios: sin=P/H, cos=B/H, tan=P/B, cosec=H/P, sec=H/B, cot=B/P. Memory trick: SOHCAHTOA — Sin=Opposite/Hypotenuse, Cos=Adjacent/Hypotenuse, Tan=Opposite/Adjacent. Reciprocal pairs: sin↔cosec (×= 1), cos↔sec (×= 1), tan↔cot (×= 1). Important: tan = sin/cos, cot = cos/sin. Standard values table (MUST memorize): sin: 0, ½, 1/√2, √3/2, 1 for 0°,30°,45°,60°,90°. Cos: reverse of sin. Tan = sin/cos. Memory for sin: √0/2, √1/2, √2/2, √3/2, √4/2 = 0, ½, 1/√2, √3/2, 1 — count 0 to 4 under √, then ÷2!",
    steps:[
      "Right triangle: P (perpendicular = opposite side to θ), B (base = adjacent to θ), H (hypotenuse = longest, opposite 90°). H² = P² + B².",
      "6 ratios: sin=P/H, cos=B/H, tan=P/B | cosec=H/P (=1/sin), sec=H/B (=1/cos), cot=B/P (=1/tan). Reciprocal pairs याद karo!",
      "SOHCAHTOA mnemonic: Some Old Hippie Caught Another Hippie Tripping On Acid. Sin-Opposite-Hyp, Cos-Adjacent-Hyp, Tan-Opposite-Adjacent.",
      "Standard table: sin 0°=0, 30°=1/2, 45°=1/√2, 60°=√3/2, 90°=1. Cos = reverse. Tan = sin/cos → 0, 1/√3, 1, √3, ∞.",
      "Given any one ratio → find all others using triangle. tan=3/4 → P=3, B=4, H=5 → sin=3/5, cos=4/5. Golden triangles: 3-4-5, 5-12-13, 8-15-17.",
      "Quadrant signs (ASTC): Q1 all positive. Q2 sin+ only. Q3 tan+ only. Q4 cos+ only. 'Add Sugar To Coffee!'",
      "Negative angles: sin(−θ)=−sinθ (odd), cos(−θ)=+cosθ (even). Allied angles: sin(180°−θ)=sinθ, cos(180°−θ)=−cosθ."
    ],
    stepEgs:[
      "3-4-5 right triangle with θ at base: P=3(opp), B=4(adj), H=5",
      "sinθ=3/5=0.6, cosθ=4/5=0.8, tanθ=3/4=0.75, cosecθ=5/3, secθ=5/4, cotθ=4/3",
      "Trick: sin values = √0/2, √1/2, √2/2, √3/2, √4/2 → 0, 0.5, 0.707, 0.866, 1",
      "sin30°+cos60°+tan45°=½+½+1=2. Quick substitution!",
      "tan θ=5/12 → P=5, B=12, H=13 → cosec θ=13/5",
      "sin θ=0.6=3/5 → cos θ=4/5=0.8 (using Pythagoras on triangle)",
      "Q2: sin 150°=sin(180°−30°)=sin30°=1/2. cos150°=−cos30°=−√3/2"
    ],
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
    explanation:"Degree & Radian Measures: angle ke do different units. Degree (°): circle = 360°, yeh zyada familiar hai. Radian: mathematically more natural unit. Ek radian = jab arc length = radius. Full circle = 2π radians = 360°. Fundamental relation: π radians = 180°. Conversion: Degree → Radian: multiply by π/180. Radian → Degree: multiply by 180/π. Standard conversions yaad karo: 30°=π/6, 45°=π/4, 60°=π/3, 90°=π/2, 120°=2π/3, 135°=3π/4, 150°=5π/6, 180°=π, 270°=3π/2, 360°=2π. Arc length formula (θ in radians): l = r × θ. Sector area = ½r²θ = ½rl. Yeh formulas circle sector, clock problems mein kaam aate hain! Clock: minute hand speed = 2π/60 = π/30 rad/min = 6°/min. Hour hand = π/360 rad/min = 0.5°/min.",
    steps:[
      "Relation: π radians = 180°. So 1 radian = 180°/π ≈ 57.296°. 1° = π/180 radians ≈ 0.01745 radians.",
      "Degrees → Radians: multiply by π/180. Example: 60° × π/180 = π/3 rad. Shortcut: divide degrees by 180, multiply by π.",
      "Radians → Degrees: multiply by 180/π. Example: π/4 × 180/π = 45°. Shortcut: multiply radians by 180/π.",
      "Standard values table: 30°=π/6, 45°=π/4, 60°=π/3, 90°=π/2, 180°=π, 270°=3π/2, 360°=2π. Ek baar yaad karo!",
      "Arc length l = r × θ (θ MUST be in radians). Sector area = ½r²θ = ½ × r × l.",
      "Degrees → Arc: first convert to radians, then use l=rθ. OR: l = (θ°/360°) × 2πr directly.",
      "Angular speed: if object rotates at ω rad/sec, arc speed v = rω. Clock hands: minute=6°/min=π/30 rad/min, hour=0.5°/min=π/360 rad/min."
    ],
    stepEgs:[
      "60° → 60 × π/180 = π/3 radians ≈ 1.047 rad",
      "5π/6 → 5π/6 × 180/π = 5×30 = 150°",
      "Common pairs: 30↔π/6, 45↔π/4, 60↔π/3, 90↔π/2, 180↔π, 360↔2π",
      "r=14, θ=60°=π/3 → Arc=14×π/3=14π/3≈14.66 cm",
      "r=10, θ=π/4 → Sector area=½×100×π/4=25π≈78.54 cm²",
      "Wheel r=35cm, ω=10 rad/s → v=35×10=350 cm/s=3.5 m/s",
      "Clock: minute hand 12→3 = 90° = π/2 rad. In 15 min, arc=l=r×π/2 (r=length of minute hand)"
    ],
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
    explanation:"Standard Trigonometric Identities: 3 Pythagorean identities jo har exam mein kaam aate hain — yeh sin², cos², tan², sec², cot², cosec² expressions simplify karne ke liye use hote hain. Identity 1 (MOST USED): sin²θ + cos²θ = 1. Derived from Pythagoras theorem on unit circle. Identity 2: 1 + tan²θ = sec²θ (Identity 1 ko cos²θ se divide karo). Identity 3: 1 + cot²θ = cosec²θ (Identity 1 ko sin²θ se divide karo). Useful rearrangements: sin²θ = 1−cos²θ, tan²θ = sec²θ−1, cot²θ = cosec²θ−1. Exam tricks: (a+b)(a−b) = a²−b² type: (secθ+tanθ)(secθ−tanθ) = sec²θ−tan²θ = 1. (cosecθ+cotθ)(cosecθ−cotθ) = 1. Product formula: sinθ×cosecθ=1, cosθ×secθ=1, tanθ×cotθ=1. Expression mein sin² ya cos² dikhne pe pehle identity apply karo!",
    steps:[
      "Identity 1: sin²θ + cos²θ = 1. Rearranged: sin²θ = 1−cos²θ; cos²θ = 1−sin²θ. Yeh HAMESHA 1 hota hai!",
      "Identity 2: 1 + tan²θ = sec²θ. Rearranged: sec²θ − tan²θ = 1; tan²θ = sec²θ − 1. (1 ÷ cos²θ both sides of Identity 1).",
      "Identity 3: 1 + cot²θ = cosec²θ. Rearranged: cosec²θ − cot²θ = 1; cot²θ = cosec²θ − 1. (1 ÷ sin²θ both sides).",
      "Reciprocal identities: sinθ × cosecθ = 1, cosθ × secθ = 1, tanθ × cotθ = 1. Yeh product HAMESHA 1!",
      "Factoring identity: (secθ+tanθ)(secθ−tanθ) = 1. So if secθ+tanθ = x, then secθ−tanθ = 1/x. Very useful!",
      "Expression simplification: sinθ/(1+cosθ) + (1+cosθ)/sinθ = 2cosecθ. Isko identity use karke prove karo.",
      "Sum formulas: (sinθ+cosθ)² = 1+2sinθcosθ = 1+sin2θ. (sinθ−cosθ)² = 1−2sinθcosθ = 1−sin2θ."
    ],
    stepEgs:[
      "sin²30°+cos²30° = (1/2)²+(√3/2)² = 1/4+3/4 = 1 ✓",
      "tanθ=3/4 → sec²θ=1+9/16=25/16 → secθ=5/4 → cosθ=4/5",
      "cosecθ=5/4 → cot²θ=cosec²θ−1=25/16−1=9/16 → cotθ=3/4",
      "sinθ×cosecθ=sin30°×cosec30°=½×2=1 ✓",
      "secθ+tanθ=3 → secθ−tanθ=1/3. So 2secθ=3+1/3=10/3 → secθ=5/3",
      "(sin45°+cos45°)²=(1/√2+1/√2)²=(√2)²=2=1+2×(½)=1+1=2 ✓",
      "Prove: (1−sin²θ)(1+tan²θ)=cos²θ×sec²θ=cos²θ×1/cos²θ=1 ✓"
    ],
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
    explanation:"Complementary Angles: do angles jinke sum = 90°. Example: 30° aur 60°, 25° aur 65°, θ aur (90°−θ). Trig mein complementary pairs: sin↔cos (co-sine means 'complement ka sine'!), tan↔cot, sec↔cosec. Formulas: sin(90°−θ)=cosθ, cos(90°−θ)=sinθ, tan(90°−θ)=cotθ, cot(90°−θ)=tanθ, sec(90°−θ)=cosecθ, cosec(90°−θ)=secθ. Exam superpower: sin20°=cos70°, sin35°=cos55°, tan30°=cot60°. Expression mein sinA × cosA waale terms → pair karo using complementary. sin²10°+sin²20°+...+sin²80°: pair karo → (sin²10°+sin²80°)+(sin²20°+sin²70°)+...=(cos²80°+sin²80°)+...=1+1+...=4! Yeh shortcut 10-second mein answer deta hai!",
    steps:[
      "Complementary angle pairs (sum=90°): 30°&60°, 25°&65°, θ &(90°−θ). Trig ratios: sin↔cos, tan↔cot, sec↔cosec.",
      "Formulas: sin(90°−θ)=cosθ | cos(90°−θ)=sinθ | tan(90°−θ)=cotθ | cot(90°−θ)=tanθ | sec(90°−θ)=cosecθ | cosec(90°−θ)=secθ.",
      "Direct substitution: sin20°=cos(90°−20°)=cos70°. tan35°=cot55°. sec15°=cosec75°. USE this to simplify expressions!",
      "Product pairs: sinA × cosecA = 1. cosA × secA = 1. tanA × cotA = 1. Jab A aur complement ka product ho → = 1.",
      "Sum of squares pairing: sin²θ + sin²(90°−θ) = sin²θ + cos²θ = 1. Use this for series: sin²10°+sin²80°=1, sin²20°+sin²70°=1, etc.",
      "sinA/cosB = 1 agar A+B=90° (because sinA=cosB when A&B are complementary). Similarly tanA=cotB when A+B=90°.",
      "Special: sin45°=cos45°=1/√2 (45° is self-complementary). sec45°=cosec45°=√2. These are equal because 45° = 90°−45°!"
    ],
    stepEgs:[
      "sin(90°−θ)=cosθ: sin70°=cos20°, sin35°=cos55°, sin89°=cos1°",
      "tan25°=cot(90°−25°)=cot65°. cot40°=tan50°",
      "sec30°=cosec(90°−30°)=cosec60°=2/√3",
      "Expression: sin35°/cos55° = sin35°/sin35° = 1 (since cos55°=sin35°) ✓",
      "Series: sin²10°+sin²80°=1, sin²20°+sin²70°=1, sin²30°+sin²60°=1, sin²40°+sin²50°=1 → Total=4",
      "(sin25°+cos65°)²+(cos25°−sin65°)²=(2cos65°)²+(0)²=4cos²65°=4sin²25°",
      "tan1°×tan2°×...×tan89° = 1 (kyunki tan k° × tan(90°−k°) = tanθ×cotθ = 1 for each pair)"
    ],
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
    hook: "2 + 3 × 4 = 20 ya 14? BODMAS kehta hai 14 — multiplication pehle, addition baad mein! BODMAS ek RULE hai, argument nahi karna!",
    tricks: [
      "<strong>B.O.D.M.A.S. full form</strong>: Brackets → Of (powers/roots) → Division → Multiplication → Addition → Subtraction. Isi exact order mein solve karo hamesha!",
      "<strong>Brackets ki priority</strong>: pehle innermost ( ) → phir { } → phir [ ] → phir main expression. Andar se bahar!",
      "<strong>D aur M SAME level</strong> → left se right solve karo: 6÷2×3 = 3×3=9 (galat: 6÷6=1). Similarly 10−3+2 = 7+2=9 (galat: 10−5=5).",
      "<strong>'Of' means multiply</strong>: 3/4 of 80 = 3/4 × 80 = 60. 'Of' = × hai. Exponents bhi O mein aate hain: 2³ = 8 pehle.",
      "<strong>Negative numbers</strong>: 5 − (−3) = 5+3=8. −(−) = +. Parentheses mein rakhna safe hai: (−4) × (−3) = +12.",
      "<strong>Common exam trap</strong>: 48÷2(9+3) → BODMAS: bracket pehle → 48÷2×12 → left to right → 24×12=288. Not 2!"
    ],
    mnemonic: "🎵 <strong>Bhai Often Drinks Milk And Sugar</strong> → B.O.D.M.A.S. Ek baar yaad karo, lifetime apply karo!",
    realLife: ["🛒", "Grocery bill: (3 items × ₹50) + (2 items × ₹30) − ₹20 coupon = 150+60−20 = ₹190. BODMAS sequence correct rakho → correct bill!"],
    funFact: "USA mein BODMAS ko <strong>PEMDAS</strong> kehte hain (Parentheses, Exponents, Multiplication, Division, Addition, Subtraction). UK: BODMAS. India: BODMAS. Same rule, different country, different name!"
  },
  2: {
    hook: "0.125 × 8 = 1! Fraction trick: 0.125 = 1/8, 1/8 × 8 = 1. Mental math instant! Calculator band karo, fraction table kholo!",
    tricks: [
      "<strong>Fraction-Decimal Table (MUST memorize)</strong>: 0.5=½, 0.25=¼, 0.75=¾, 0.125=⅛, 0.333…=⅓, 0.667…=⅔, 0.2=⅕, 0.4=⅖, 0.6=⅗, 0.8=⅘, 0.1=1/10, 0.0625=1/16.",
      "<strong>Multiply decimals</strong>: ignore decimal → multiply integers → count total decimal places → put decimal back. 2.5×1.4 → 25×14=350 → 2 places → 3.50=3.5.",
      "<strong>Divide decimals</strong>: dono ko same power of 10 se multiply karo → integer division. 1.5÷0.3 → ×10 → 15÷3=5. 0.48÷0.06 → ×100 → 48÷6=8.",
      "<strong>Recurring decimals to fraction</strong>: 0.333… → x=0.333, 10x=3.333, subtract: 9x=3, x=⅓. 0.142857… = 1/7. 0.272727… = 3/11.",
      "<strong>Comparison trick</strong>: Same numerator fractions → smaller denominator = LARGER (1/3 > 1/5). Same denominator → larger numerator = LARGER. Mixed: convert to decimals or cross-multiply.",
      "<strong>Quick % from decimals</strong>: 0.35 of 200 = 35% of 200 = 70. 0.125 of 400 = 12.5% of 400 = 50. Convert any decimal to % by ×100!"
    ],
    mnemonic: "💰 <strong>Paisa yaad rakho</strong>: ₹0.25=25 paise=¼, ₹0.50=50 paise=½, ₹0.75=75 paise=¾. Ek baar paisa samjha → fractions samajh gaye!",
    realLife: ["⛽", "Petrol ₹98.75/litre × 40.5 litres → convert: ≈ ₹99 × 40.5 ≈ ₹4009. Quick estimate with decimal rounding!"],
    funFact: "0.999999… = exactly 1! Proof: x=0.999…, 10x=9.999…, 10x−x=9, 9x=9, x=1. Mind-blowing but mathematically 100% correct!"
  },
  3: {
    hook: "1/2 + 1/3 = 2/5? GALAT! Add denominators directly MAT karo. LCM nikalo: 1/2+1/3 = 3/6+2/6 = 5/6. Sirf numerators add hote hain!",
    tricks: [
      "<strong>Addition/Subtraction</strong>: Pehle LCM of denominators nikalo → equivalent fractions banao (same denominator) → sirf numerators add/subtract. 2/3 + 3/4 = 8/12+9/12 = 17/12.",
      "<strong>Multiplication shortcut</strong>: (a/b) × (c/d) = ac/bd. Before multiplying, cross-cancel (simplify diagonally): 4/9 × 3/8 → cancel 4&8 (÷4) and 3&9 (÷3) → 1/3 × 1/2 = 1/6. Much simpler!",
      "<strong>Division (KFC rule)</strong>: Keep → Flip → Change. (a/b) ÷ (c/d) = (a/b) × (d/c). Keep first fraction, Flip second, Change ÷ to ×. (3/4) ÷ (9/8) = 3/4 × 8/9 = 24/36 = 2/3.",
      "<strong>Mixed to improper</strong>: 3½ = (3×2+1)/2 = 7/2. Improper to mixed: 11/4 = 2 remainder 3 = 2¾. Multiplication/division: ALWAYS convert mixed to improper first!",
      "<strong>Comparing fractions</strong>: Cross multiply and compare: 3/5 vs 4/7 → 3×7=21 vs 4×5=20 → 21>20 → 3/5 > 4/7. No need for LCM!",
      "<strong>Fraction of a number</strong>: 2/3 of 120 = 2×(120/3) = 2×40 = 80. Always divide by denominator first (if divisible), then multiply by numerator."
    ],
    mnemonic: "🍕 <strong>Pizza analogy</strong>: ½ + ⅓ pizza = cut into 6 equal pieces → 3/6 + 2/6 = 5/6 pizza. Same size pieces tabhi add hote hain!",
    realLife: ["🧪", "Recipe: 2½ cups aata + ¾ cup sugar → 5/2 + 3/4 = 10/4+3/4 = 13/4 = 3¼ cups total. Baking mein fractions must!"],
    funFact: "Ancient Egyptians (1650 BC, Rhind Papyrus) sirf unit fractions (1/n) use karte the! 2/5 likhte the 1/3 + 1/15. Complex fractions bhi unit fraction mein split karte the!"
  },
  4: {
    hook: "HCF × LCM = N1 × N2. Magic formula! HCF(12,18)=6, LCM=12×18÷6=36. Ek formula dono nikaal deta hai!",
    tricks: [
      "<strong>HCF by Euclidean Division</strong>: bade ko chhote se divide, remainder nikalo, phir chhote ko remainder se divide, jab remainder=0 aaye → last divisor = HCF. HCF(48,18): 48=18×2+12; 18=12×1+6; 12=6×2+0 → HCF=6.",
      "<strong>LCM shortcut</strong>: LCM = (N1 × N2) ÷ HCF. Ek baar HCF nikalo, baaki formula se. For 3 numbers: LCM(a,b,c) = LCM(LCM(a,b), c).",
      "<strong>Divisibility rules (MUST know)</strong>: 2→last digit even; 3→digit sum divisible by 3; 4→last 2 digits divisible by 4; 5→ends in 0 or 5; 9→digit sum div by 9; 11→alternating digit sum div by 11.",
      "<strong>Co-prime pairs</strong>: HCF=1. Examples: (8,9), (14,25), (consecutive integers always co-prime). Co-prime mein LCM = product: LCM(8,9)=72.",
      "<strong>HCF applications</strong>: Largest tile = HCF of dimensions. Largest equal divisions = HCF. Smallest repeating unit = LCM.",
      "<strong>LCM applications</strong>: Bells ringing together → LCM of intervals. Traffic lights synchronize → LCM. Smallest number divisible by all → LCM. Smallest number divisible by a,b,c = LCM(a,b,c)."
    ],
    mnemonic: "⚡ <strong>HCF × LCM = N1 × N2</strong> — Golden Formula! Ek pata ho → doosra seedha nikalo. Exam mein time bachao!",
    realLife: ["📐", "Tiles: 12m × 8m room mein largest square tile → HCF(12,8)=4 → 4m×4m tile. Total tiles = (12/4)×(8/4) = 3×2 = 6 tiles!"],
    funFact: "Every integer has EXACTLY one prime factorization — <strong>Fundamental Theorem of Arithmetic</strong>! Primes are 'atoms' of numbers. 12 = 2²×3. Always. No other way. Proven 2000+ years ago!"
  },
  5: {
    hook: "₹100 CP → ₹120 SP = 20% profit. ₹100 CP → ₹80 SP = 20% loss. SP − CP = positive → profit, negative → loss. ALWAYS compare with CP!",
    tricks: [
      "<strong>SP formula</strong>: SP = CP × (100+P%)/100 (profit). SP = CP × (100−L%)/100 (loss). Ek formula, do cases.",
      "<strong>CP from SP</strong>: CP = SP × 100/(100+P%) for profit. CP = SP × 100/(100−L%) for loss. SP given → divide by multiplier.",
      "<strong>Profit% and Loss%</strong>: ALWAYS on CP! Profit% = (SP−CP)/CP × 100. Loss% = (CP−SP)/CP × 100. Never calculate % on SP (common mistake!)",
      "<strong>Same price buy-sell trick</strong>: Two items same SP, one at x% profit, one at x% loss → NET LOSS = (x/10)² %. Example: both SP=₹1000, 20% profit+loss → net loss=(20/10)²=4%.",
      "<strong>MP, CP, SP relation</strong>: MP (Marked Price) > CP (Cost Price) ≥ SP (Selling Price) usually. Discount on MP, Profit/Loss compared to CP. SP = MP × (100−D%)/100.",
      "<strong>Successive transactions</strong>: Buy at CP, sell at SP1, repurchase at SP1, resell at SP2. Calculate each step separately. Profit = final SP − original CP."
    ],
    mnemonic: "💡 <strong>SP se CP nikalna</strong>: SP ÷ (1+P%) = CP for profit. SP ÷ (1−L%) = CP for loss. E.g., SP=120 at 20% profit → CP=120÷1.2=100.",
    realLife: ["🛍️", "Flipkart: ₹5000 ki laptop ₹4000 mein mili. CP=₹4000, MP=₹5000, Discount=₹1000, Discount%=20%. Seller ne kaafi pehle ₹3500 mein kharida hoga!"],
    funFact: "India mein e-commerce mein sellers often inflate MRP to show big discounts. Actual discount nahi hota — sirf psychological trick. Always check original CP before celebrating 'deals'!"
  },
  6: {
    hook: "20% + 10% discount = 28% off, NOT 30%! Yeh exam ka sabse common trap hai. Remainders multiply karo: 0.8 × 0.9 = 0.72 → 28% total off!",
    tricks: [
      "<strong>Single discount formula</strong>: SP = MP × (100−D%)/100. Discount amount = MP − SP = MP × D%/100. D% always on MP (Marked Price), never on CP!",
      "<strong>Successive discounts</strong>: d1% then d2% → effective % = d1+d2 − (d1×d2)/100. OR: MP × (1−d1/100) × (1−d2/100). Three discounts: multiply all three remainders.",
      "<strong>Quick formula for two equal discounts d% + d%</strong>: effective = 2d − d²/100. E.g., 10%+10% = 20−1=19%. 20%+20%=40−4=36%.",
      "<strong>Finding MP from SP and Discount</strong>: MP = SP × 100/(100−D%). E.g., SP=₹800 after 20% discount → MP=800×100/80=₹1000.",
      "<strong>Discount chain for max saving</strong>: Same two discounts in any order give same final price (commutative). 20% then 10% = 10% then 20% = 28% net.",
      "<strong>CP, MP, SP relationship</strong>: Seller marks MP above CP to allow discount AND still profit. Profit% = (SP−CP)/CP×100. Target: find when discount % = profit %."
    ],
    mnemonic: "📉 <strong>Successive ≠ Additive!</strong> 20%+10%=28%, not 30%. Always multiply remainders: 0.8×0.9=0.72 → 28% off total.",
    realLife: ["🏬", "Amazon sale: 30% off → extra 10% → 100×0.7×0.9=63 → 37% off (not 40%). Bank credit card extra 5% → 100×0.7×0.9×0.95=59.85 → ~40% total!"],
    funFact: "Credit card companies love '20% off + extra 10%' — sounds like 30% but it's only 28%. Marketing math! Psychology > Mathematics in advertising."
  },
  7: {
    hook: "Partnership profit ratio = Capital × Time. A: ₹6000×6=36, B: ₹4000×9=36 → ratio 1:1! Time factor matter karta hai, not just capital!",
    tricks: [
      "<strong>Profit ratio = Capital × Time</strong>: Each partner ke liye calculate karo separately, phir ratio nikalo. Agar time same → sirf capital ratio.",
      "<strong>Working partner salary</strong>: Pehle salary deduct karo total profit se → baaki PROFIT split according to ratio. Salary is separate from profit share.",
      "<strong>Investment change mid-period</strong>: Alag-alag periods ke liye calculate karo. A: ₹5000 for 4 months then ₹7000 for 8 months → A's share = 5000×4 + 7000×8 = 76000.",
      "<strong>Finding original investment</strong>: Profit ratio given → Capital ratio = Profit ratio (agar same time) → find missing capital.",
      "<strong>Sleep partner vs active partner</strong>: Active/working partner gets extra salary/commission from profits before division. Read questions carefully!",
      "<strong>New partner joining</strong>: Old partners' ratios remain among themselves. New partner buys a share → adjust existing ratio proportionally."
    ],
    mnemonic: "🤝 <strong>Capital × Time = Partner's contribution</strong>. Zyada paisa + zyada time = zyada profit share. Simple and fair!",
    realLife: ["🏪", "Startup: A ₹5L (12 months) = 60, B ₹3L (8 months) = 24 → Ratio 5:2. Total profit ₹70000 → A=₹50000, B=₹20000."],
    funFact: "Ancient Rome mein 'societas' (partnership) agreements hote the — legally binding! Aaj ka LLP (Limited Liability Partnership) usi concept ka modern evolution hai. 2000+ saal purana concept!"
  },
  8: {
    hook: "Alligation cross: cheaper ₹80, dearer ₹120, mean ₹100 → cross differences: (120−100):(100−80) = 20:20 = 1:1 ratio. 5 seconds mein mixing ratio!",
    tricks: [
      "<strong>Alligation cross diagram</strong>: Cheaper (C) upar-left, Dearer (D) upar-right, Mean (M) middle. Cross subtract: (D−M) aur (M−C). Ratio of quantities = (D−M):(M−C).",
      "<strong>Milk-water mixtures</strong>: Water price = 0, Milk price = actual price. Mixture price = mean value. Apply alligation formula. ₹0 water + ₹60 milk, mean ₹40 → ratio 20:40 = 1:2 (water:milk).",
      "<strong>Mixture replacement</strong>: Container C litres, x litres removed and replaced with water n times → Remaining = C × (1−x/C)ⁿ. Remember the formula!",
      "<strong>Average salary / group mixing</strong>: Group A (100 people, avg salary ₹500) + Group B (200, avg ₹800) → alligation: (800−600):(600−500) = 2:1 → Wait, check: 100×500+200×800 = 210000 → avg=210000/300=₹700.",
      "<strong>When to use alligation</strong>: Whenever two mixtures/groups are combined and you need the ratio, OR when you know the ratio and need the mean, OR mean given and need ratio.",
      "<strong>Three-component mixing</strong>: Split into two 2-component problems. Mix A+B first → result mix with C. OR use simultaneous equations for 3 unknowns."
    ],
    mnemonic: "✝️ <strong>Cross banao</strong>: C (left) .... D (right), M (middle). Neeche: (D−M) for C's quantity, (M−C) for D's quantity = mixing ratio!",
    realLife: ["☕", "Tea blend: ₹80/kg (cheap) + ₹120/kg (premium) → target ₹100/kg: (120−100):(100−80)=20:20=1:1. Equal quantities mix karo!"],
    funFact: "'Alligation' Latin 'alligare' (to bind together) se aaya! Medieval spice traders would use this to blend spices to target price. 500+ saal purana commercial math!"
  },
  9: {
    hook: "18 km/h = 5 m/s. 54 km/h = 15 m/s. Multiply by 5/18 to convert! Conversion bhool gaye toh answer galat. HAMESHA units check karo!",
    tricks: [
      "<strong>D=S×T triangle</strong>: D (distance) upar, S×T neeche. Jo nikalna hai uss ko cover karo: D → S×T multiply. S → D/T. T → D/S.",
      "<strong>Unit conversion</strong>: km/h → m/s = ×5/18. m/s → km/h = ×18/5. Quick: 36 km/h = 36×5/18 = 10 m/s. 20 m/s = 20×18/5 = 72 km/h.",
      "<strong>Relative speed</strong>: Same direction → speeds subtract (slower kar aage waale se). Opposite direction → speeds add. Train passing: if same direction, time = (train+object length)/(speed difference).",
      "<strong>Train problems</strong>: Cross a pole/person → distance = train length. Cross a platform/bridge → distance = train length + platform/bridge length. Time same in both cases.",
      "<strong>Average speed trap</strong>: Average speed ≠ (v1+v2)/2 when same distance covered. Use: Avg speed = 2v1v2/(v1+v2). For 3 equal segments: 3v1v2v3/(v1v2+v2v3+v3v1).",
      "<strong>Meeting problems</strong>: A and B start from X and Y toward each other. They meet → A travels d1, B travels d2. Time = d/(v1+v2). After meeting: A takes d2/v1 more time, B takes d1/v2 more time."
    ],
    mnemonic: "🚗 <strong>DST Triangle</strong>: D top, S×T bottom. Cover what you want! 5/18 to m/s, 18/5 to km/h. Kab bhoolna nahi!",
    realLife: ["🚂", "Delhi-Agra 200 km, Rajdhani 160 km/h → Time=200/160=1.25 hrs=1hr 15min. Platform 500m, train 200m, speed=54 km/h=15 m/s → time=(200+500)/15≈46.7 sec."],
    funFact: "Sound 343 m/s = 1235 km/h. Light 3×10⁸ m/s = 1.08 billion km/h! Einstein's Special Relativity: light ka relative speed hamesha same hota hai — observer ki speed se independent. Nature ka sabse weird fact!"
  },
  10: {
    hook: "LCM Method ek baar seekh lo → 90% Time & Work problems 30 seconds mein! A=12, B=18 → LCM=36 → A: 3 units/day, B: 2 units/day → together 5/day → 36÷5 = 7.2 days. No fractions, no confusion!",
    tricks: [
      "<strong>3 Quantities yaad karo</strong>: Work (W) = total kaam = 1 unit | Time (T) = days | Efficiency (E) = 1-din kaam = 1/n. Formula: W = T × E",
      "<strong>1-day work = 1/n</strong>. KABHI bhi days directly add mat karo — always efficiencies (fractions) add karo! Galat: 10+15=25. Sahi: 1/10+1/15=1/6 → 6 din",
      "<strong>LCM Method (EXAM FASTEST)</strong>: Total work = LCM of all given days. Efficiency = LCM ÷ person's days. Phir add → divide. Integer answers, zero fractions!",
      "<strong>Two persons shortcut</strong>: Days together = ab/(a+b). Teen persons: xyz/(xy+yz+zx). Efficiency ratio = inverse of time ratio → A:B=2:1 → Time = 1:2",
      "<strong>Men-Days Formula</strong>: M₁×T₁ = M₂×T₂ (inverse proportion — more men, less time). Extended: M₁×T₁×H₁ = M₂×T₂×H₂ (H = hours/day)",
      "<strong>Pipes & Cisterns</strong>: Inlet (filling) = positive (+1/t). Outlet/Drain/Leak = negative (−1/t). Net rate = Σinlet − Σoutlet. If net negative → tank kabhi nahi bharega!"
    ],
    mnemonic: "⚙️ <strong>NEVER add days — ALWAYS add efficiencies (1/n)</strong>. Just like parallel resistors in physics: 1/R_total = 1/R₁ + 1/R₂. Same formula, same concept — physics aur maths ek hain!",
    realLife: ["🏗️", "Project management: Developer A finishes feature in 10 days, B in 15 days. Together = (10×15)÷(10+15) = 6 days. Manager aise hi sprint deadline plan karta hai!"],
    funFact: "Time & Work = Power in physics! Power = Work/Time, so higher efficiency = higher power rating. Ek 100W bulb ek 60W bulb se 'zyada efficient' worker hai — same concept, different units!"
  },
  11: {
    hook: "12.5% of 80 = 1/8 × 80 = 10 — 1 second! 75% of 200 = 3/4 × 200 = 150. Fraction shortcuts yaad karo, mental math fast hoga!",
    tricks: [
      "<strong>% ↔ Fraction shortcuts</strong>: 10%=1/10, 20%=1/5, 25%=1/4, 33.3%=1/3, 50%=1/2, 66.7%=2/3, 75%=3/4, 12.5%=1/8, 37.5%=3/8, 62.5%=5/8. Yeh yaad karo!",
      "<strong>% change</strong>: (New−Old)/Old × 100. Increase: positive result. Decrease: negative. Percent change in old to new: always divide by OLD value.",
      "<strong>A is x% more than B</strong>: A = B×(100+x)/100. BUT B is NOT x% less than A — B is [x/(100+x)]×100 % less than A. Classic exam trap!",
      "<strong>Successive % change</strong>: First x% then y% → Effective = x+y+xy/100. Same formula as successive discounts! 10% up then 10% down = 10+(-10)+10×(-10)/100 = −1% net.",
      "<strong>Finding original value</strong>: After 20% increase, value = 240 → original = 240/1.2 = 200. Divide by multiplier, not subtract 20%!",
      "<strong>% of % problems</strong>: 30% of 25% of 400 = 0.3×0.25×400 = 0.075×400 = 30. Convert percentages to decimals, multiply left-to-right."
    ],
    mnemonic: "💯 <strong>FRACTION TABLE</strong>: 33%=⅓, 25%=¼, 50%=½, 75%=¾, 12.5%=⅛. Ek baar yaad → har jagah fast calculation!",
    realLife: ["💰", "GST 18% on ₹5000: 10%=₹500, 5%=₹250, 3%=₹150 → GST=₹900. Total=₹5900. Split into parts for mental math!"],
    funFact: "'Per cent' = Latin 'per centum' = per hundred. Romans taxed soldiers at per centum! 100 years=1 Century bhi isi se. 'Percent' and 'Century' same Latin root!"
  },
  12: {
    hook: "a:b = 2:3 = 4:6 = 6:9 — all same ratio! Ratio is relative, not absolute. Always simplify using HCF first!",
    tricks: [
      "<strong>Simplify ratio</strong>: HCF nikalo → divide both → simplest form. 12:18 → HCF=6 → 2:3. 24:36:48 → HCF=12 → 2:3:4.",
      "<strong>Proportion (a:b::c:d)</strong>: Extremes × Extremes = Means × Means → ad = bc. Cross-product property. Find missing: 3:x::12:20 → 3×20=x×12 → x=5.",
      "<strong>Mean proportional</strong>: Of a and b = √(ab). Third proportional of a,b: a:b::b:x → x=b²/a.",
      "<strong>Combining ratios</strong>: A:B=2:3, B:C=4:5 → A:B:C: make B same: A:B=8:12, B:C=12:15 → A:B:C=8:12:15.",
      "<strong>Dividing in ratio</strong>: Total T split in ratio a:b:c → shares = T×a/(a+b+c), T×b/(a+b+c), T×c/(a+b+c). Parts sum = T always check.",
      "<strong>Inverse proportion</strong>: More workers → less time. If A∝1/B → AB=constant. Speed-time, men-work, interest-time — sab inverse proportion!"
    ],
    mnemonic: "⚖️ <strong>ad = bc</strong> for proportion a:b::c:d. Cross multiply → solve. Har proportion question isi se solve hota hai!",
    realLife: ["🗺️", "Map scale 1:50000. 3 cm on map = 3×50000=150000 cm=1.5 km actual. Reverse: 5km real = 5×100000cm ÷ 50000 = 10cm on map."],
    funFact: "Golden Ratio φ=1.618 (1:1.618) — Mona Lisa face dimensions, Parthenon columns, nautilus shell spiral, sunflower seeds — all follow Golden Ratio! Nature's favorite proportion!"
  },
  13: {
    hook: "√1764 = ? Prime factorize: 1764=4×441=4×9×49. √4=2, √9=3, √49=7 → 2×3×7=42. Zero calculator, pure logic!",
    tricks: [
      "<strong>Perfect squares 1-400</strong>: 1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400. 1² to 20². Yaad karo — sab square root problems instant hone lagte hain!",
      "<strong>Prime factorization method</strong>: Factor karke pairs nikalo. √(2×2×3×3×7×7)=2×3×7=42. Agar unpaired factor ho → irrational (√2, √3, √5, etc.).",
      "<strong>Simplify surds</strong>: √72=√(4×9×2)=2×3×√2=6√2. √48=√(16×3)=4√3. Largest perfect square factor nikalo.",
      "<strong>Add/subtract surds</strong>: 3√2+5√2=8√2 (like terms). 2√3+4√2 cannot simplify (unlike terms).",
      "<strong>Approximate square roots</strong>: √50: nearest perfect square √49=7 → √50≈7.07. √(n²+k) ≈ n + k/(2n) for small k.",
      "<strong>Cube roots shortcut</strong>: ∛1000=10, ∛8=2, ∛27=3, ∛64=4, ∛125=5, ∛216=6, ∛343=7, ∛512=8, ∛729=9. Sab yaad karo!"
    ],
    mnemonic: "📋 <strong>1² to 20² memorize</strong>: 1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400. Yeh 20 values sab kuch solve karti hain!",
    realLife: ["🏠", "Room area 576 sq ft → side = √576 = 24 ft (576=4×144=4×12²=24²). Square root from prime factorization!"],
    funFact: "√2=1.41421356… NEVER repeats, NEVER terminates — irrational hai! Greeks discover karke shocked the. Legend: Hippasus ne irrational numbers discover kiya → unhe samudra mein duba diya (myth)!"
  },
  14: {
    hook: "5 numbers ka avg=30. 6th add karne pe avg=32. 6th = 32×6 − 30×5 = 192−150 = 42! Sum formula sab solve karta hai!",
    tricks: [
      "<strong>KEY: Sum = Average × Count</strong>. Average=Sum/Count sirf easy problems. Hard problems mein Sum=Avg×n use karo to find missing values.",
      "<strong>New element added/removed</strong>: Old sum ± new element = New avg × new count. Agar avg badhega: new element > old avg. Agar ghattega: new element < old avg.",
      "<strong>Weighted average</strong>: Σ(weight × value) / Σweight. Group A (50 people, avg=60) + Group B (30 people, avg=80) → total=(50×60+30×80)/(50+30)=(3000+2400)/80=67.5.",
      "<strong>Deviation/Assumed mean method</strong>: Assume koi convenient number (near middle). Har element se deviation nikalo. Avg = assumed + (Σdeviation)/n. Calculation simple ho jata hai!",
      "<strong>Average of consecutive numbers</strong>: 1 to n → avg = (n+1)/2. AP mein avg = (first+last)/2. Even number of terms: avg between two middle terms.",
      "<strong>Replacement problem</strong>: Avg n persons, one person replaced. New avg higher/lower by d. Difference due to replacement = n×d. New person's value = old person's value ± n×d."
    ],
    mnemonic: "📊 <strong>Sum = Avg × n</strong>. Cover one: Sum = Avg×n, Avg = Sum/n, n = Sum/Avg. Simple triangle like DST!",
    realLife: ["🎓", "5 exams mein 80% avg chahiye → Sum=400. Pehle 4 mein 78+82+76+80=316 → 5th mein minimum 400−316=84 chahiye!"],
    funFact: "Lake Wobegon Effect: 70%+ drivers khud ko 'above average' maante hain — statistically impossible! Similarly, 90%+ people think they're funnier/smarter than average. Cognitive bias wins!"
  },
  15: {
    hook: "FD ₹10000 at 10% — 2 years: SI = ₹2000, CI = ₹2100. Difference = ₹100 = P×(r/100)² = 10000×0.01 = ₹100. Formula instant!",
    tricks: [
      "<strong>SI = P × R × T / 100</strong>. Simple — principal stays constant. SI for 3 years at 10% on ₹5000 = 5000×10×3/100=₹1500. Amount = P+SI.",
      "<strong>CI formula</strong>: A = P × (1 + r/100)ⁿ. CI = A − P. For n=1: CI=SI. For n=2: CI=SI₁+SI₂ where SI₂ is on (P+SI₁).",
      "<strong>CI vs SI difference (2 years)</strong>: CI−SI = P(r/100)². Direct formula! CI−SI (3 years) = P(r/100)²×(r/100+3). 2-year formula most useful.",
      "<strong>Half-yearly compounding</strong>: Rate becomes r/2, time becomes 2n. A = P(1+r/200)²ⁿ. Quarterly: r/4, time ×4.",
      "<strong>Population/Depreciation</strong>: Growth at r% per year → after n years = P(1+r/100)ⁿ. Depreciation at d% → P(1−d/100)ⁿ. Car depreciation, population growth same formula!",
      "<strong>Rule of 72</strong>: At r% CI, money doubles in ≈72/r years. At 8% → doubles in 9 years. At 12% → 6 years. Quick mental estimate!"
    ],
    mnemonic: "🏦 <strong>CI−SI (2yr) = P(r/100)²</strong> — Golden shortcut! ₹10000 at 10%: CI−SI = 10000×0.01=₹100. Instant answer!",
    realLife: ["📈", "FD ₹1 lakh at 8% annual CI for 10 years: A=100000×(1.08)¹⁰≈₹215892. SI would give ₹180000. CI gives ₹35892 extra — power of compounding!"],
    funFact: "Einstein allegedly said: 'Compound interest is the 8th wonder of the world.' Whether he said it or not, it's true: ₹1 lakh at 12% CI for 30 years = ₹30 lakhs! Never underestimate CI!"
  },
  16: {
    hook: "99×101 = (100−1)(100+1) = 100²−1 = 9999. Mentally in 2 seconds! Algebra identities = Speed calculator!",
    tricks: [
      "<strong>Big 3 identities</strong>: (a+b)²=a²+2ab+b² | (a−b)²=a²−2ab+b² | (a+b)(a−b)=a²−b². Teeno yaad karo — har algebra problem mein kaam aate hain!",
      "<strong>(a+b)(a−b) = a²−b² trick</strong>: 49×51=(50−1)(50+1)=2500−1=2499. 97×103=(100−3)(100+3)=10000−9=9991. Pairs jo 2n ke around hain!",
      "<strong>Given sum/product, find squares</strong>: a+b=S, ab=P → a²+b²=(a+b)²−2ab=S²−2P. a²−b²=(a+b)(a−b)=S×(a−b).",
      "<strong>Rationalization</strong>: 1/(√5+√3) = (√5−√3)/[(√5)²−(√3)²] = (√5−√3)/2. Multiply by conjugate (a+b → a−b). Denominator becomes a²−b² = rational!",
      "<strong>Cube identities</strong>: (a+b)³=a³+3a²b+3ab²+b³. (a−b)³=a³−3a²b+3ab²−b³. a³+b³=(a+b)(a²−ab+b²). a³−b³=(a−b)(a²+ab+b²).",
      "<strong>Mental squaring</strong>: 65² = (60+5)² = 3600+600+25=4225. Or: 65² ends in 25 (any number ending in 5): 65² → 6×7=42, append 25 → 4225. Fast trick!"
    ],
    mnemonic: "⚡ <strong>(a+b)(a−b)=a²−b²</strong>: 99×101=9999, 49×51=2499. Ek baar yaad → mental math instant!",
    realLife: ["🧮", "Mental math: 45² = 4×5 append 25 = 2025. 35² = 3×4 append 25 = 1225. 95² = 9×10 append 25 = 9025. Any n5² → n(n+1) append 25!"],
    funFact: "Brahmagupta (628 AD, India) ne algebraic identities systematic kiye. Al-Khwarizmi (820 AD) ne 'algebra' word diya (from Arabic 'al-jabr'). Indian aur Arabic math ka combination = modern algebra!"
  },
  17: {
    hook: "y = mx + c: m = slope (steepness), c = y-intercept. Two points (2,3) aur (4,7): slope m = (7−3)/(4−2) = 4/2 = 2. Line: y = 2x + c → c = −1.",
    tricks: [
      "<strong>Slope formula</strong>: m = (y2−y1)/(x2−x1) = rise/run. Positive slope → line goes up left-to-right. Negative → goes down. Zero → horizontal. Undefined → vertical.",
      "<strong>Line equations</strong>: Slope-intercept: y=mx+c. Point-slope: y−y1=m(x−x1). Two-point form: (y−y1)/(y2−y1) = (x−x1)/(x2−x1). Standard: ax+by+c=0.",
      "<strong>Parallel & perpendicular</strong>: Parallel lines: m1=m2 (same slope). Perpendicular lines: m1×m2=−1 (slopes are negative reciprocals). Example: slope 2 → perpendicular slope = −½.",
      "<strong>Intercepts</strong>: x-intercept → set y=0 → solve for x. y-intercept → set x=0 → solve for y. Intercept form: x/a + y/b = 1 (a=x-intercept, b=y-intercept).",
      "<strong>Distance from point to line</strong>: Line ax+by+c=0, Point (x₁,y₁). Distance = |ax₁+by₁+c| / √(a²+b²).",
      "<strong>Collinear points check</strong>: Three points (x1,y1), (x2,y2), (x3,y3) collinear if area of triangle = 0: |x1(y2−y3)+x2(y3−y1)+x3(y1−y2)| = 0."
    ],
    mnemonic: "📈 <strong>y=mx+c</strong>: m=slope (tilt), c=y-intercept (start point). Two points → slope → then find c. Line equation ready!",
    realLife: ["📊", "COVID cases: daily cases vs time → positive slope = growing. Break-even: Revenue line crosses Cost line = break-even point. Coordinate geometry = business graph!"],
    funFact: "René Descartes (1637) ne coordinate geometry invent ki! Bed mein lait ke ceiling pe makkhi dekhte hue sochaa ki fly ki position 2 numbers se describe ho sakti hai. Cartesian = Descartes ka Latin name!"
  },
  18: {
    hook: "Triangle ke 4 special centres: Centroid (medians meet), Incentre (angle bisectors), Circumcentre (⊥ bisectors), Orthocentre (altitudes). Equilateral mein sab EK point!",
    tricks: [
      "<strong>Centroid (G)</strong>: Teen medians ka meeting point. Centroid median ko vertex se 2:1 mein divide karta hai. G always INSIDE triangle. Centroid = 'balancing point' (centre of mass).",
      "<strong>Incentre (I)</strong>: Teen angle bisectors ka meeting point. I is always INSIDE the triangle. Incentre se sides pe perpendicular distance = inradius (r). r = Area/semi-perimeter.",
      "<strong>Circumcentre (O)</strong>: Teen perpendicular bisectors ka meeting point. O se vertices ki distance = circumradius (R). R = abc/(4×Area). Acute→inside, Right→midpoint of hyp, Obtuse→OUTSIDE.",
      "<strong>Orthocentre (H)</strong>: Teen altitudes ka meeting point. Acute triangle → inside. Right triangle → at right angle vertex. Obtuse triangle → outside. H + O + G lie on Euler's Line!",
      "<strong>Euler's Line</strong>: O (Circumcentre), G (Centroid), H (Orthocentre) are ALWAYS collinear! OG:GH = 1:2. G divides OH in 1:2 ratio from O.",
      "<strong>Nine-Point Circle</strong>: Midpoints of sides, feet of altitudes, midpoints of OA, OB, OC — all 9 lie on one circle. Radius = R/2. Centre = midpoint of OH!"
    ],
    mnemonic: "📍 <strong>2:1 Centroid Rule</strong>: G median ko vertex se 2:1 mein divide karta hai. OGH collinear, OG:GH=1:2. Euler's line!",
    realLife: ["🏛️", "Centroid = centre of gravity. Triangle-shaped plywood ko centroid pe needle pe balance kar sakte hain! Architecture mein load distribution centroid pe based hoti hai."],
    funFact: "Euler (1765) ne prove kiya O, G, H collinear hain — called Euler's Line. OG:GH=1:2 also proven by him. Ek insaan ne geometry mein itna discover kiya ki mathematicians ne 'greatest mathematician ever' kaha!"
  },
  19: {
    hook: "Similar triangles: sides ratio k=2:3 → Area ratio k²=4:9. Perimeter ratio k=2:3. Volume ratio k³=8:27. Ek ratio se sab nikal jata hai!",
    tricks: [
      "<strong>Congruence criteria (≅)</strong>: SSS (3 sides), SAS (2 sides + included angle), ASA (2 angles + included side), AAS (2 angles + non-included side), RHS (right angle + hyp + side). Sab 5 yaad karo.",
      "<strong>Similarity criteria (~)</strong>: AA (2 angles → 3rd automatically same), SAS (2 sides proportional + included angle), SSS (all 3 sides proportional). AA is most used!",
      "<strong>Ratio relationships</strong>: Side ratio k → Perimeter ratio k → Area ratio k² → Volume ratio k³. If sides 3:4 → areas 9:16 → volumes 27:64.",
      "<strong>BPT (Basic Proportionality Theorem)</strong>: Line ∥ to base divides other two sides proportionally. If DE∥BC → AD/DB = AE/EC. Converse: if AD/DB=AE/EC → DE∥BC.",
      "<strong>Important similarity cases</strong>: Right triangle altitude to hypotenuse → 3 similar triangles. Angle bisector theorem: BD/DC = AB/AC.",
      "<strong>Finding areas using similarity</strong>: Two similar triangles, side ratio k. Larger area = smaller area × k². E.g., k=3:2 → areas ratio 9:4."
    ],
    mnemonic: "🔄 <strong>AA → Similar</strong>. 2 angles equal → third automatically equal → similar triangles. Area ∝ k², Perimeter ∝ k, Volume ∝ k³!",
    realLife: ["🗺️", "Map scale 1:50000 = k. 1cm on map = 0.5km real. Area on map 4cm² = 4 × 50000² = 10¹⁰ cm² = 1 km² real. Similarity in action!"],
    funFact: "Ancient Egyptians ne 2500 BC mein similar triangles se pyramid heights measure ki! Shadow ka use karke: person height / shadow = pyramid height / shadow ratio. Thales of Miletus ne bhi yahi method use kiya!"
  },
  20: {
    hook: "Tangent ⊥ Radius at contact point — ALWAYS 90°! Agar yeh ek rule yaad raha toh circle ke 70% problems solve ho jaate hain!",
    tricks: [
      "<strong>Tangent properties</strong>: Tangent ⊥ radius at point of contact (90°). External point se drawn two tangents are EQUAL in length: PA=PB. OP bisects angle APB.",
      "<strong>Chord properties</strong>: Perpendicular from centre to chord bisects the chord. Equal chords are equidistant from centre. Larger chord → closer to centre.",
      "<strong>Angle theorems</strong>: Inscribed angle = ½ × Central angle (same arc). Angles in same segment are equal. Angle in semicircle = 90° (Thales' theorem)!",
      "<strong>Cyclic quadrilateral</strong>: Opposite angles sum = 180°. (A+C=180°, B+D=180°). If opposite angles supplementary → it's cyclic. Very common exam question!",
      "<strong>Secant-tangent relationships</strong>: External point P: PA (tangent), PBC (secant) → PA² = PB × PC. Two secants: PA×PB = PC×PD (power of a point).",
      "<strong>Common tangents</strong>: Two circles, external tangents = 2 (both same side), internal tangents = 2 (cross between circles). Non-overlapping: 4 tangents total. Touching externally: 3 tangents."
    ],
    mnemonic: "⭕ <strong>APEX rule</strong>: A=half angle (inscribed=½ central), P=equal tangents (PA=PB), E=equal inscribed angles (same arc), X=90° (semicircle)!",
    realLife: ["🚲", "Bicycle wheel: spokes=radii, road=tangent. Tangent⊥radius → wheel rolls smoothly forward without slipping sideways!"],
    funFact: "Thales' Theorem (600 BC): angle in semicircle is 90°. One of history's first mathematical PROOFS! Before Thales, math was just calculation. He introduced logical proof!"
  },
  21: {
    hook: "3-4-5 right triangle! 5-12-13, 8-15-17, 7-24-25 bhi yaad karo. Inhe multiplied form mein bhi recognize karo: 6-8-10, 15-36-39!",
    tricks: [
      "<strong>Pythagorean theorem</strong>: a²+b²=c² (only for RIGHT triangles). c = hypotenuse (longest side, opposite 90°). Check: largest side² = sum of squares of other two.",
      "<strong>Pythagorean triplets</strong>: 3-4-5, 5-12-13, 8-15-17, 7-24-25, 9-40-41, 11-60-61. Aur multiples: 6-8-10, 9-12-15, 10-24-26. Instantly recognize in problems!",
      "<strong>Triangle types from c²</strong>: If c²=a²+b² → RIGHT. c²<a²+b² → ACUTE. c²>a²+b² → OBTUSE. Quick check without calculating angles!",
      "<strong>Area formulas</strong>: Right triangle = ½×base×height. Equilateral = (√3/4)a². Isoceles = use altitude first. Scalene = Heron's formula.",
      "<strong>Heron's formula</strong>: s=(a+b+c)/2 (semi-perimeter). Area=√[s(s−a)(s−b)(s−c)]. When no height given → use Heron's. All 3 sides given → Heron's.",
      "<strong>Angle sum property</strong>: Sum of all angles = 180°. Exterior angle = sum of two non-adjacent interior angles. In right triangle: two acute angles sum = 90°."
    ],
    mnemonic: "📐 <strong>3-4-5 multiples</strong>: ×2=6-8-10, ×3=9-12-15, ×4=12-16-20. See ANY of these → right triangle CONFIRMED instantly!",
    realLife: ["🏗️", "Ancient builders: 3m rope, 4m rope, 5m rope → tie at endpoints → perfect 90° corner! Even today surveyors use Pythagorean triplets for right angles."],
    funFact: "Pythagorean theorem on Babylonian clay tablets 1800 BC — Pythagoras se 1200 years pehle! Bhaskara (India, 1150 AD) ne 4 different proofs diye. US President James Garfield ne 1876 mein ek novel proof discover kiya!"
  },
  22: {
    hook: "Rhombus ka area = ½×d1×d2. Diagonals bisect at 90°! Trapezium = ½×(sum of parallel sides)×height. Formulas yaad karo — shapes apply karo!",
    tricks: [
      "<strong>Rectangle</strong>: Area=l×b. Perimeter=2(l+b). Diagonal=√(l²+b²). All angles 90°. Opposite sides equal and parallel.",
      "<strong>Square</strong>: Area=a². Perimeter=4a. Diagonal=a√2. All sides equal, all angles 90°. Square is a special rectangle AND rhombus.",
      "<strong>Parallelogram</strong>: Area=base×height (NOT side×side!). Perimeter=2(a+b). Diagonals bisect each other (not at 90°, not equal). Opposite sides parallel & equal.",
      "<strong>Rhombus</strong>: Area=½×d1×d2 (diagonals). All sides equal, opposite angles equal. Diagonals bisect at 90° and bisect angles. Side a, diagonals d1,d2: a²=(d1/2)²+(d2/2)².",
      "<strong>Trapezium</strong>: Area=½×(a+b)×h (a,b=parallel sides, h=height between them). Only one pair of parallel sides. Isoceles trapezium: non-parallel sides equal, diagonals equal.",
      "<strong>Kite</strong>: Area=½×d1×d2 (same as rhombus). Two pairs of adjacent sides equal. One diagonal bisects other at 90°. Like rhombus but NOT all sides equal."
    ],
    mnemonic: "⬛ <strong>Rhombus & Kite both = ½×d1×d2</strong>. Trapezium = ½×(parallel sum)×height. Parallelogram = base×height (use perpendicular height!).",
    realLife: ["🪁", "Kite paper area: diagonals d1=60cm, d2=40cm → Area=½×60×40=1200 cm². Rhombus-shaped diamond kite same formula!"],
    funFact: "Taj Mahal ka Char Bagh (4 gardens) = 4 perfect squares. Total area = 4×(side)². Mughal architects used precise quadrilateral geometry for perfect symmetry!"
  },
  23: {
    hook: "Exterior angle sum ALWAYS 360° for ANY convex polygon. Interior sum = (n−2)×180°. Pentagon: (5−2)×180=540°. Hexagon: (6−2)×180=720°!",
    tricks: [
      "<strong>Interior angle SUM = (n−2)×180°</strong>. Triangle(3)=180°, Quad(4)=360°, Pentagon(5)=540°, Hexagon(6)=720°, Octagon(8)=1080°, Decagon(10)=1440°.",
      "<strong>Each interior angle (regular)</strong> = (n−2)×180°/n. Triangle=60°, Square=90°, Pentagon=108°, Hexagon=120°, Octagon=135°.",
      "<strong>Exterior angle sum = 360° ALWAYS</strong>. Each exterior angle (regular) = 360°/n. Hexagon: 60°. Octagon: 45°. To find n: n=360°/exterior angle.",
      "<strong>Number of diagonals = n(n−3)/2</strong>. Pentagon=5, Hexagon=9, Octagon=20, Decagon=35. Each vertex connects to n−3 non-adjacent vertices (not itself, not 2 adjacent).",
      "<strong>Finding n from angle</strong>: Given interior angle 135° → exterior=45° → n=360/45=8 (octagon). Given exterior angle 72° → n=360/72=5 (pentagon). FAST!",
      "<strong>Tessellation</strong>: Only regular polygons that tile a plane: Triangle (60°×6=360°), Square (90°×4=360°), Hexagon (120°×3=360°). Only these 3!"
    ],
    mnemonic: "🔢 <strong>Exterior sum=360° ALWAYS</strong>: hexagon each=60°, pentagon each=72°, octagon each=45°. Find n: n=360÷exterior angle!",
    realLife: ["⬡", "Honeycomb = regular hexagons tiling perfectly. 120° angles, 360°/3=120° → only 3 hexagons meet at each vertex. Maximum honey storage, minimum wax. Evolution found the math!"],
    funFact: "Honeycomb hexagonal theorem: hexagonal honeycomb gives MAXIMUM area for given perimeter — mathematically proven in 1999 by Thomas Hales! Bees have 'known' this for millions of years!"
  },
  24: {
    hook: "Prism = same cross-section throughout height. Toblerone box, triangular tent, swimming pool — sab prisms! Volume = Base Area × Height.",
    tricks: [
      "<strong>Identify base shape first</strong>: Triangle, square, rectangle, hexagon. Base shape ka area aur perimeter nikalo — baaki formulas apply karo.",
      "<strong>LSA = Base Perimeter × Height</strong>. All rectangular side faces combined. Unroll karo toh ek rectangle milega: width=perimeter, height=h.",
      "<strong>TSA = LSA + 2 × Base Area</strong>. Two identical bases (top + bottom). Open box: TSA = LSA + 1 base only.",
      "<strong>Volume = Base Area × Height</strong>. Simple multiplication. Water tank, swimming pool volume isi se!",
      "<strong>Triangular prism shortcut</strong>: Right triangle base (a,b,c): LSA=(a+b+c)h, Vol=½×a×b×h. Equilateral triangle base (side s): Area=√3/4×s², Vol=√3/4×s²×h.",
      "<strong>Hexagonal prism</strong>: Base area=(3√3/2)a², Base perimeter=6a. LSA=6ah, Vol=(3√3/2)a²×h. Used in honeycomb calculations!"
    ],
    mnemonic: "📦 <strong>Prism = Base throughout</strong>. LSA=Perimeter×h. TSA=LSA+2×base. Vol=Base×h. Three formulas, one concept!",
    realLife: ["🏕️", "Triangular tent: base = equilateral triangle side 3m, height 2m. Vol=(√3/4×9)×2=9√3/2≈7.8 m³. LSA=3×3×2=18 m². Tent ka material area!"],
    funFact: "Newton (1666) ne triangular glass prism se white light ko 7 colors mein split kiya — VIBGYOR! Light wavelengths alag-alag refract hoti hain. Prism geometry + optics physics = rainbow ka reason!"
  },
  25: {
    hook: "r=6, h=8: slant l=√(36+64)=√100=10. 6-8-10 Pythagorean triple! LSA=π×6×10=60π. Memorize common triplets for instant l!",
    tricks: [
      "<strong>l = √(r²+h²)</strong>: Pythagoras in 3D. Common pairs: r=3,h=4→l=5; r=6,h=8→l=10; r=5,h=12→l=13. Instant l for Pythagorean triple questions!",
      "<strong>LSA (Curved SA) = πrl</strong>. Only curved outside, no base. Unroll karo → sector of circle milega.",
      "<strong>TSA = πr(r+l) = πrl + πr²</strong>. Curved surface + circular base. Ice cream cone → curved part only, no base = CSA.",
      "<strong>Volume = (1/3)πr²h</strong>. Exactly ⅓ of cylinder with same r and h. Cone:Cylinder = 1:3 volume ratio.",
      "<strong>Key ratio</strong>: Cylinder, Cone, Sphere (same r, h=2r) → Volume = 3:1:2. Archimedes discovered this aur itna khush hua ki katakatha famous ho gayi!",
      "<strong>n small cones from 1 big</strong>: If same r → Big h = n × small h. If same h → Big r³ = n × small r³. Volume conservation apply karo."
    ],
    mnemonic: "🍦 <strong>Ice cream cone</strong>: l=√(r²+h²) pehle nikalo. LSA=πrl (wrapper). TSA=πr(r+l) (wrapper+base). Vol=(1/3)πr²h (ice cream amount)!",
    realLife: ["🎉", "Traffic cone: r=15cm, h=40cm → l=√(225+1600)=√1825≈42.7cm → LSA=π×15×42.7≈2012 cm² → material needed for cone."],
    funFact: "Archimedes (287-212 BC) ne prove kiya: Cylinder:Cone:Sphere = 3:1:2 (same r, same h=2r). Usne request ki uski tomb pe cylinder-in-sphere khodein. Cicero ne 137 BC mein tomb dhundhla aur yahi carving payi!"
  },
  26: {
    hook: "Cylinder unroll karo → rectangle width=2πr, height=h. LSA=2πrh. r=7, h=10: LSA=2×22/7×7×10=440. π=22/7 use karo r=7 ke liye!",
    tricks: [
      "<strong>LSA = 2πrh</strong>. Unroll cylinder → rectangle area = 2πr × h. Wrapper/label of can = LSA. π=22/7 jab r=7 ka multiple.",
      "<strong>TSA = 2πr(r+h)</strong>. LSA + 2 circular ends. Open cylinder (bucket): TSA = LSA + πr² (only one base).",
      "<strong>Volume = πr²h</strong>. Base area × height. Water tank capacity = πr²h litres (if r,h in dm, or divide cm³ by 1000 for litres).",
      "<strong>Hollow cylinder</strong>: Material volume = π(R²−r²)h. R=outer, r=inner radius. Pipe ka material weight = Volume × density.",
      "<strong>Volume conservation</strong>: Melt karo → new shape. Sphere melt → cylinder: (4/3)πR³=πr²h. Wire: thin cylinder, length L, radius r → V=πr²L.",
      "<strong>Radius vs height impact</strong>: Volume ∝ r². Radius double → Volume 4×. Height double → Volume 2×. Radius more impactful than height!"
    ],
    mnemonic: "🥫 <strong>Tin can formula</strong>: label=2πrh, two lids=2πr², full can=TSA=2πr(r+h). r=7 → π=22/7 cancel karke integer!",
    realLife: ["🥤", "Coke can: r=3.3cm, h=11.5cm → Vol=π×10.89×11.5≈393 mL. Standard size! Manufacturer optimizes r:h ratio to minimize material (TSA) for given volume."],
    funFact: "Archimedes ne prove kiya: Sphere volume inscribed in cylinder = ⅔ of cylinder volume, SA of sphere = ⅔ of cylinder TSA. Usne khud kahaa was uski greatest discovery! Tomb pe cylinder-sphere carvings!"
  },
  27: {
    hook: "Sphere SA=4πr². r=7: SA=4×22/7×49=616 cm². n small spheres (r=2) from big (R=6): n=(6/2)³=27. Volume cube mein proportional!",
    tricks: [
      "<strong>SA = 4πr²</strong>. '4 circles' analogy: surface = area of 4 great circles. r=7: SA=4×22/7×49=616 cm².",
      "<strong>Volume = (4/3)πr³</strong>. V = SA×r/3 bhi kah sakte hain. r=3: V=4/3×π×27=36π≈113 cm³.",
      "<strong>n spheres from 1 big (same material)</strong>: Big R, small r: R³=n×r³ → n=(R/r)³. R=6, r=2: n=8. R=3, r=1: n=27.",
      "<strong>SA and Volume ratios</strong>: r₁:r₂=k:1 → SA₁:SA₂=k²:1 → V₁:V₂=k³:1. SA ratio given→r ratio=√(SA ratio)→V ratio=r³ ratio.",
      "<strong>Sphere inside cube</strong>: Cube side a → max sphere r=a/2. SA of sphere=4π(a/2)²=πa².",
      "<strong>Hemisphere comparisons</strong>: Sphere→Hemisphere: SA halves from 4πr² to 2πr² (curved only), but TSA=3πr² (includes flat base). Vol halves: 2/3πr³."
    ],
    mnemonic: "🌐 <strong>4πr² = 4 circles</strong>. Volume=(4/3)πr³. n spheres from big: n=(R/r)³. SA ratio=r², Volume ratio=r³. Simple scaling!",
    realLife: ["🌍", "Earth SA=4π×(6371)²≈510 million km². Oceans=71%=362 million km². Sphere formula tells us ocean's total surface area!"],
    funFact: "Soap bubbles ALWAYS spherical — nature minimizes surface area for given volume. Sphere = minimum SA for given volume. This is why cells, planets, water droplets are spherical. Nature is efficient!"
  },
  28: {
    hook: "tan 45°=1 → Height=Distance! tan 60°=√3 → Height=√3×Distance! Angle se directly height-distance relation milta hai!",
    tricks: [
      "<strong>tan θ = Height/Base</strong>: Most used formula. Height=d×tanθ. Distance=h/tanθ. sin=H/hypotenuse, cos=base/hypotenuse bhi use hote hain.",
      "<strong>Standard angle values</strong>: tan 30°=1/√3≈0.577, tan 45°=1, tan 60°=√3≈1.732. Elevation 45° → h=d (equal). Elevation 60° → h=d√3.",
      "<strong>Angle of elevation vs depression</strong>: Looking UP → elevation. Looking DOWN → depression. From A to B elevation = from B to A depression (alternate angles).",
      "<strong>Two observer problems</strong>: Tower of height h. Observer 1 at angle α, Observer 2 at angle β. Two equations: h=d1×tanα, h=d2×tanβ → find d1, d2, or h.",
      "<strong>Diagram is MANDATORY</strong>: Draw tower, observer, angles, horizontal line. Label: h=height, d=distance, θ=angle. Question automatically becomes clear!",
      "<strong>Two poles problem</strong>: Poles of height h1, h2, distance d. Wire joining tops crosses ground at point x from pole 1: x = d×h1/(h1+h2)."
    ],
    mnemonic: "🏔️ <strong>tan θ = Height/Distance</strong>. 45°→H=D. 60°→H=D√3. 30°→H=D/√3. DIAGRAM FIRST, equation second!",
    realLife: ["🗼", "Eiffel Tower survey: ground se 1km door se elevation angle measure kiya. tan θ = 324/1000 → θ≈18°. Kisi bhi tower ki height remotely measure hoti hai!"],
    funFact: "Ancient Egyptian surveyors (2500 BC) used gnomon (shadow stick) to measure pyramid heights — same as today's tanθ! Thales of Miletus (600 BC) ne same method se Egyptian pyramid height mathematically proved!",
    hasTrigChart: true
  },
  29: {
    hook: "Histogram mein bars ke beech GAP NAHI — bar chart se yahi MAIN fark! Continuous data (marks, heights, ages) = histogram. Categories = bar chart!",
    tricks: [
      "<strong>No gaps between bars</strong>: Continuous data → histogram. Bars touch each other. Bar chart mein gap hota hai (discrete categories).",
      "<strong>Modal class = tallest bar</strong> ki class. Exact mode: L+[(f1−f0)/(2f1−f0−f2)]×h. L=lower limit, f1=modal freq, f0=prev, f2=next, h=width.",
      "<strong>Unequal class widths</strong>: Y-axis = Frequency Density = f/class width. Area of bar = frequency (NOT height). Equal widths: Y-axis = frequency directly.",
      "<strong>Mean from histogram</strong>: x̄=Σ(midpoint×f)/Σf. Midpoint of each class = (lower+upper)/2.",
      "<strong>Median from histogram</strong>: Cumulative frequency → n/2 class → Median=L+[(n/2−cf)/f]×h. cf=cumulative freq before median class.",
      "<strong>Skewness from histogram</strong>: Symmetric=bell shape. Right skew=tail right, peak left. Left skew=tail left, peak right. Mode<Median<Mean for right-skewed."
    ],
    mnemonic: "📊 <strong>Histogram = NO GAP (continuous data)</strong>. Modal class = tallest bar. FD=f/width for unequal classes. Mean=Σfx/Σf!",
    realLife: ["🌡️", "Delhi temperature: kitne din 5-10°C, 10-15°C, 15-20°C → histogram. Tallest bar = modal temperature range. Government uses this for seasonal planning!"],
    funFact: "William Playfair (1759-1823) ne bar chart, pie chart, line chart sab invent kiye — statistical graphics pioneer! France aur Britain ki economic data visualize ki. Data storytelling 1786 mein start hua!"
  },
  30: {
    hook: "Histogram bar tops ke midpoints ko connect karo → Frequency Polygon! Do distributions compare karna easy — ek graph pe dono polygons!",
    tricks: [
      "<strong>Midpoint = (lower + upper)/2</strong>. Class 10-20 → midpoint=15. Class 20-30 → midpoint=25. Har class ka midpoint nikalo.",
      "<strong>Plot points (midpoint, frequency)</strong>. Example: (15,5), (25,8), (35,12). Join with straight lines → frequency polygon ready.",
      "<strong>Close the polygon</strong>: Dono ends pe imaginary 0-frequency class add karo (before first, after last). Lines X-axis ko touch karti hain.",
      "<strong>Mean from polygon</strong>: x̄=Σ(midpoint×f)/Σf. Same as histogram. Polygon aur histogram same data, different visual.",
      "<strong>Ogive (cumulative frequency polygon)</strong>: Upper class limits vs cumulative frequency. S-curve banata hai. Median = n/2 pe horizontal line → ogive intersection.",
      "<strong>Two distributions compare</strong>: Dono polygons ek graph pe. Higher peak → more concentrated. Wider spread → more variation. Overlap area → common range."
    ],
    mnemonic: "📉 <strong>Midpoints connect karo → Polygon</strong>. Close karo → X-axis touch. Ogive = cumulative freq polygon = S-curve. Median at n/2!",
    realLife: ["🏃", "Marathon: har 30-min bracket mein finishers ka frequency polygon. Peak 3-4 hour range. Two years ka comparison: ek graph pe dono polygons → improvement visible!"],
    funFact: "Frequency polygon ki area = histogram ki area (mathematically equivalent). Polygon continuous distribution ka approximation hai. Large n pe → normal distribution curve ban jaata hai!"
  },
  31: {
    hook: "Pie chart: ₹100 out of ₹400 = 25% = 90° angle. Bar chart: each bar = one category, bars have gaps. Histogram: no gaps, continuous data. Teeno alag!",
    tricks: [
      "<strong>Pie chart angle = (value/total) × 360°</strong>. Percent = angle/360×100 = value/total×100. Angle↔%: multiply/divide by 3.6.",
      "<strong>Reverse from angle</strong>: Value = (angle/360°) × total. Percentage share = angle/360 × 100. Quick: 90°=25%, 72°=20%, 120°=33.3%.",
      "<strong>Bar chart vs Histogram</strong>: Bar chart has GAPS (discrete/categorical: subjects, months, products). Histogram NO GAPS (continuous: marks, ages, heights).",
      "<strong>DI reading tips</strong>: Read title+units first. Identify what's asked: ratio, %, absolute difference, average? Don't confuse absolute with percentage!",
      "<strong>Multiple bar charts</strong>: Compare categories side by side. Stacked bars: show total + parts. 100% stacked: show proportions only.",
      "<strong>Common DI traps</strong>: % increase vs absolute increase. 'How many more' = absolute. 'What % more' = relative. Read CAREFULLY!"
    ],
    mnemonic: "🥧 <strong>360° full pie</strong>. Angle=(part/total)×360. % =(angle/360)×100. 90°=25%, 180°=50%, 120°=33.3%, 72°=20%. Pizza slice!",
    realLife: ["💰", "Budget: Education=₹540cr of ₹1800cr → angle=540/1800×360=108°. Health=₹450cr → 90°. Infrastructure=₹360cr → 72°. Total=360°!"],
    funFact: "Florence Nightingale (1858) ne 'rose diagram' (coxcomb chart) banaya — Crimean War mein preventable disease deaths show karne ke liye. Chart ne Parliament ko convince kiya hospital reforms ke liye. Data visualization ne lives bachaye!"
  },
  32: {
    hook: "Hemisphere = half sphere. Curved SA=2πr². Flat base=πr². TSA=3πr². Easy! 2+1=3 times πr². Bowl, dome, igloo — sab hemispheres!",
    tricks: [
      "<strong>Curved SA = 2πr²</strong>: Half of full sphere's 4πr². Only the rounded dome part. Bowl ke andar/bahar yahi formula.",
      "<strong>Flat circular base = πr²</strong>: The cut face (circle). Hemisphere table pe rakho toh yeh bottom face hoti hai.",
      "<strong>TSA = 3πr²</strong>: Curved (2πr²) + Base (πr²) = 3πr². Easy memory: 2+1=3. Full sphere TSA=4πr² se compare: hemisphere TSA = ¾ of sphere.",
      "<strong>Volume = (2/3)πr³</strong>: Exactly half of sphere's (4/3)πr³. Confirmation: (4/3)÷2=2/3 ✓",
      "<strong>Sphere cut → 2 hemispheres</strong>: Original sphere SA=4πr². Each hemisphere TSA=3πr². Both together=6πr² (more than original — cutting exposes 2 extra circles of πr² each).",
      "<strong>Hollow hemisphere (bowl)</strong>: R=outer radius, r=inner radius. Total surface = Outer curved (2πR²) + Inner curved (2πr²) + Ring at top [π(R²−r²)]."
    ],
    mnemonic: "🌓 <strong>TSA=3πr²</strong>: 2(curved) + 1(flat) = 3×πr². Volume=2/3πr³. Half of sphere = 2/4=1/2 for curved SA, 2/3 for volume!",
    realLife: ["🏟️", "Stadium dome r=50m. Curved SA material = 2π×2500=5000π≈15708 m². Stadium mein kitna steel/glass lagega → hemisphere formula se!"],
    funFact: "Pantheon Rome (125 AD) ka dome = perfect hemisphere, diameter 43.3m. 1900 saal se khada hai! Unreinforced concrete dome — ancient Romans ne hemisphere geometry aur material science dono sahi kiya!"
  },
  33: {
    hook: "Cuboid: l=5, b=4, h=3 → TSA=2(20+12+15)=94. Vol=60. Diagonal=√(25+16+9)=√50=5√2. Three formulas, three seconds!",
    tricks: [
      "<strong>TSA = 2(lb+bh+hl)</strong>: Three types of faces, each pair appears twice. lb=top/bottom, bh=front/back, hl=left/right.",
      "<strong>LSA = 2h(l+b)</strong>: Four side walls (no top/bottom). Room painting: paint walls (LSA), not ceiling/floor.",
      "<strong>Volume = l×b×h</strong>: Simple multiplication. Tank capacity in cm³ → divide by 1000 for litres.",
      "<strong>Diagonal = √(l²+b²+h²)</strong>: 3D Pythagorean theorem. Longest rod/stick that fits = space diagonal.",
      "<strong>CUBE (a)</strong>: TSA=6a². LSA=4a². Vol=a³. Space diagonal=a√3. Face diagonal=a√2. Given any one → find others.",
      "<strong>Common exam patterns</strong>: Room size given → longest bamboo/stick=diagonal. Tank → volume → capacity in litres. Ratio of dimensions given → find surface area or volume."
    ],
    mnemonic: "📦 <strong>Longest stick in box = √(l²+b²+h²)</strong> — 3D Pythagoras! TSA=2(lb+bh+hl), Vol=lbh, Cube=6a²/a³/a√3!",
    realLife: ["🎁", "Gift box 30×20×10 cm → longest diagonal ribbon = √(900+400+100)=√1400≈37.4cm. Wrapping tape length estimate!"],
    funFact: "Rubik's cube (3×3×3 cuboid with 26 sub-cubes) has 43 quintillion (4.3×10¹⁹) possible states. Fastest human solve: 3.47 seconds. Solving algorithm uses Group Theory — graduate-level mathematics!"
  },
  34: {
    hook: "Pyramid = ⅓ of prism (same base, height). Square pyramid: base a=6, h=4 → apothem=3, slant l=5 → LSA=60, Vol=48. 3-4-5 triplet helps!",
    tricks: [
      "<strong>Three heights (MOST CONFUSING PART)</strong>: h=vertical (base center to apex). l=slant height (triangular face height). Lateral edge=corner to apex. l=√(h²+apothem²).",
      "<strong>Apothem = perpendicular from center to base edge</strong>. Square base side a: apothem=a/2. Equilateral triangle side a: apothem=a/(2√3)=a√3/6.",
      "<strong>LSA = ½ × Base Perimeter × Slant height l</strong>. Each triangular face area = ½×base edge×l. Sum of all faces = LSA.",
      "<strong>TSA = LSA + Base area</strong>. Base area: square=a², triangle=(√3/4)a², hexagon=(3√3/2)a².",
      "<strong>Volume = (1/3) × Base area × h</strong>. Always one-third of corresponding prism. Great Pyramid, Sand pile, Diamond — sab pyramids!",
      "<strong>3-4-5 shortcut</strong>: Square pyramid base a, h=h, apothem=a/2. Common: a=6,h=4 → apothem=3, l=5 (3-4-5 triple!). LSA=½×24×5=60, Vol=48."
    ],
    mnemonic: "🔺 <strong>⅓ Rule</strong>: Pyramid=⅓ Prism. Vol=(1/3)×base area×h. LSA=½×perimeter×l. l=√(h²+apothem²). Step by step!",
    realLife: ["🏺", "Great Pyramid Giza: base=230m, h=146m → Vol=(1/3)×230²×146≈2.58 million m³. 2.3 million stone blocks! Ancient Egyptians ka geometry perfect tha!"],
    funFact: "Ancient Egyptians built 138 pyramids! Great Pyramid: 2.3 million blocks, avg 2.5 tonnes each = 5.75 million tonnes total. Built ~2560 BC, still standing. Mathematical precision = historical wonder!"
  },
  35: {
    hook: "3-4-5 triangle: sinθ=3/5, cosθ=4/5, tanθ=3/4. Ek triangle se 6 ratios! SOHCAHTOA yaad karo, aur PBHSS trick se 6 ratios instantly!",
    tricks: [
      "<strong>SOHCAHTOA</strong>: Sin=Opposite/Hyp, Cos=Adjacent/Hyp, Tan=Opposite/Adjacent. Yeh 3 ratios yaad karo → baaki 3 reciprocals hain.",
      "<strong>Pandit Badri Prasad Har Har Bole</strong>: P/H=sin, B/H=cos, P/B=tan, H/P=cosec, H/B=sec, B/P=cot. P=Perpendicular, B=Base, H=Hypotenuse.",
      "<strong>Standard trig values table</strong>: sin: 0, ½, 1/√2, √3/2, 1 (for 0°,30°,45°,60°,90°). Cos = sin ka reverse. Tan=sin/cos → 0, 1/√3, 1, √3, ∞.",
      "<strong>Golden triangles</strong>: 3-4-5, 5-12-13, 8-15-17, 7-24-25. Given any trig ratio → find all 6. tanθ=3/4 → P=3,B=4,H=5 → all ratios.",
      "<strong>Quadrant signs (ASTC)</strong>: Q1=All positive. Q2=Sin only. Q3=Tan only. Q4=Cos only. 'Add Sugar To Coffee!' or 'All Students Take Calculus'.",
      "<strong>Complementary pairs</strong>: sin↔cos, tan↔cot, sec↔cosec (sum=90°). sin30°=cos60°. tan30°=cot60°. Self-complementary: sin45°=cos45°."
    ],
    mnemonic: "🎵 <strong>Pandit Badri Prasad Har Har Bole</strong>: sin=P/H, cos=B/H, tan=P/B, cosec=H/P, sec=H/B, cot=B/P. 6 ratios, 1 sentence!",
    realLife: ["📡", "GPS satellite triangulation: sin, cos, tan thousands of times per second to find your location within meters. Trig powers Google Maps, Uber, everything navigation!"],
    funFact: "Hipparchus (190-120 BC) ne first trigonometry tables banaye! Aryabhata (499 AD, India) ne sine function define kiya aur 'jya' (Sanskrit) se Arab mein 'jiba' → Latin 'sinus' → English 'sine' aaya!",
    hasTrigChart: true
  },
  36: {
    hook: "π radians = 180°. Degrees → Radians: ×π/180. Radians → Degrees: ×180/π. Arc length = r×θ (θ must be in radians!). Three things yaad karo!",
    tricks: [
      "<strong>π radians = 180°</strong>. Fundamental relation. 1 radian ≈ 57.3°. 1° ≈ 0.01745 radians. Full circle = 2π radians.",
      "<strong>Degrees → Radians: ×π/180</strong>. Shortcut: simplify the fraction. 60°×π/180=π/3. 120°=2π/3. 270°=3π/2.",
      "<strong>Radians → Degrees: ×180/π</strong>. π/4×180/π=45°. 5π/6×180/π=150°. π cancels out beautifully!",
      "<strong>Standard pairs</strong>: 30°=π/6, 45°=π/4, 60°=π/3, 90°=π/2, 120°=2π/3, 135°=3π/4, 150°=5π/6, 180°=π, 270°=3π/2, 360°=2π. MEMORIZE!",
      "<strong>Arc length l = r×θ</strong> (θ in radians). Sector area = ½r²θ = ½r×l. If θ given in degrees: convert first OR use l=(θ°/360)×2πr directly.",
      "<strong>Angular speed</strong>: ω (rad/sec). Linear speed v = r×ω. RPM conversion: n RPM = n×2π/60 rad/sec. Wheel, gear, motor problems!"
    ],
    mnemonic: "⭕ <strong>π/180 → radians. 180/π → degrees</strong>. Arc=rθ. Area=½r²θ. Standard: 30°=π/6, 90°=π/2, 180°=π, 360°=2π!",
    realLife: ["🎡", "Ferris wheel r=20m, rotates 1/3 circle=120°=2π/3 rad. Arc=20×2π/3=40π/3≈41.9m of travel. Speed=arc/time!"],
    funFact: "360° kyun? Babylonians (2000 BC): 360 ≈ year's days, highly divisible by 1,2,3,4,5,6,8,9,10,12,15,18,20,24,30,36,40,45,60. Radians are 'natural' — arise directly from calculus. Both useful!",
    hasTrigChart: true
  },
  37: {
    hook: "3 Pythagorean identities: sin²+cos²=1, tan²+1=sec², 1+cot²=cosec². Teeno ek se derive hote hain. Ek yaad karo → teeno yaad!",
    tricks: [
      "<strong>Identity 1 (MASTER)</strong>: sin²θ+cos²θ=1. Derived from Pythagoras: (P/H)²+(B/H)²=1. Rearranged: sin²θ=1−cos²θ; cos²θ=1−sin²θ.",
      "<strong>Identity 2</strong>: 1+tan²θ=sec²θ. Derivation: Identity 1 ÷ cos²θ. Rearranged: sec²θ−tan²θ=1; tan²θ=sec²θ−1.",
      "<strong>Identity 3</strong>: 1+cot²θ=cosec²θ. Derivation: Identity 1 ÷ sin²θ. Rearranged: cosec²θ−cot²θ=1.",
      "<strong>Product identities</strong>: sinθ×cosecθ=1, cosθ×secθ=1, tanθ×cotθ=1. Reciprocal pairs ka product hamesha 1!",
      "<strong>Difference of squares trick</strong>: (secθ+tanθ)(secθ−tanθ)=sec²θ−tan²θ=1. So if secθ+tanθ=3 → secθ−tanθ=1/3. Instant!",
      "<strong>Sum/product substitution</strong>: sinθ+cosθ=k → sin²θ+cos²θ=1, 2sinθcosθ=k²−1. sinθ×cosθ=(k²−1)/2. Expand (sinθ+cosθ)²=sin²θ+2sinθcosθ+cos²θ=1+2sinθcosθ."
    ],
    mnemonic: "🔑 <strong>1 identity → 3 identities</strong>: sin²+cos²=1. ÷cos²→tan²+1=sec². ÷sin²→1+cot²=cosec². Divide once, get two more!",
    realLife: ["🌊", "Sound/light waves: E=A×sin(ωt+φ). sin²+cos²=1 ensures energy conservation — wave math physically meaningful!"],
    funFact: "sin²θ+cos²θ=1 IS Pythagoras in disguise: (P/H)²+(B/H)²=1 → P²+B²=H². Trigonometry aur Pythagoras ek hi truth ke do faces hain! 2600 year purana theorem, naya form!",
    hasTrigChart: true
  },
  38: {
    hook: "sin(90°−θ)=cosθ. sin40°=cos50°. tan25°=cot65°. Complementary angles ka magic: 6 ratio pairs, swap pairs at 90°! Expression instantly simplify!",
    tricks: [
      "<strong>Six co-function pairs</strong>: sin(90°−θ)=cosθ, cos(90°−θ)=sinθ, tan(90°−θ)=cotθ, cot(90°−θ)=tanθ, sec(90°−θ)=cosecθ, cosec(90°−θ)=secθ.",
      "<strong>Direct substitution</strong>: sin40°=cos50°=cos(90°−40°). tan35°=cot55°. sec20°=cosec70°. Use this to pair terms in expressions!",
      "<strong>Product of complementary pairs</strong>: sinA×cosecA=1, cosA×secA=1, tanA×cotA=1. Agar angles sum to 90°: sinA×cosecA=sinA×(1/sinA)=1.",
      "<strong>Sum of squares pairing trick</strong>: sin²A+sin²(90°−A)=sin²A+cos²A=1. Series: sin²10°+sin²80°=1, sin²20°+sin²70°=1, etc. 4 pairs=4!",
      "<strong>Expression simplification</strong>: sinA/cosB=1 agar A+B=90° (since sinA=cosB). tanA/cotB=1 agar A+B=90°. Fraction simplifies instantly!",
      "<strong>Self-complementary</strong>: 45°+45°=90°. sin45°=cos45°=1/√2. tan45°=cot45°=1. sec45°=cosec45°=√2. These are equal because 45° is its own complement!"
    ],
    mnemonic: "🔁 <strong>Co-function pairs</strong>: sin↔cos, tan↔cot, sec↔cosec at 90°−θ. Pairs sum=90°. Series: pair karo, each pair=1!",
    realLife: ["☀️", "Solar panels: elevation angle of sun = 90° − latitude (approximately). cos(elevation) = sin(zenith angle). Complementary angles optimize solar panel tilt!"],
    funFact: "Word 'cosine' literally = 'complement's sine'! cos(θ)=sin(90°−θ)=sin(complement of θ). Similarly 'cotangent'='complement's tangent', 'cosecant'='complement's secant'. Language encodes math!",
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

  /* ── Practice panel HTML ── */
  function buildAptPracticeHTML(topicId) {
    const qs = (typeof APT_QUESTIONS !== 'undefined' && APT_QUESTIONS[topicId]) || [];
    if (!qs.length) return '<div style="padding:2rem;text-align:center;color:var(--text-faint)">Questions loading...</div>';
    const DIFF_CLS = { Easy:'ex-basic', Medium:'ex-moderate', Hard:'ex-hard', Advanced:'ex-advanced' };
    let html = '<div class="practice-section">';
    html += '<div class="practice-header"><span>📝 Practice — 50 MCQs (Easy → Advanced)</span><button class="qs-btn primary" id="aPracToggleKey">Show Answer Key</button></div>';
    html += '<div class="practice-filters" id="aPracFilters"><button class="prac-filter-btn active" data-diff="all">All (50)</button>';
    const counts = {};
    qs.forEach(q => { counts[q.diff] = (counts[q.diff]||0)+1; });
    ['Easy','Medium','Hard','Advanced'].forEach(d => { if(counts[d]) html += `<button class="prac-filter-btn" data-diff="${d}">${d} (${counts[d]})</button>`; });
    html += '</div>';
    qs.forEach((q, i) => {
      html += `<div class="prac-q" data-diff="${q.diff}">
        <div class="prac-q-head"><span class="prac-q-num">Q${i+1}</span><span class="ex-level-badge ${DIFF_CLS[q.diff]||''}">${q.diff}</span></div>
        <div class="prac-q-text">${q.q}</div>
        <div class="prac-opts">
          <label class="prac-opt"><input type="radio" name="aPracQ${topicId}_${i}" value="A"><span class="prac-opt-label">A</span><span>${q.a}</span></label>
          <label class="prac-opt"><input type="radio" name="aPracQ${topicId}_${i}" value="B"><span class="prac-opt-label">B</span><span>${q.b}</span></label>
          <label class="prac-opt"><input type="radio" name="aPracQ${topicId}_${i}" value="C"><span class="prac-opt-label">C</span><span>${q.c}</span></label>
          <label class="prac-opt"><input type="radio" name="aPracQ${topicId}_${i}" value="D"><span class="prac-opt-label">D</span><span>${q.d}</span></label>
        </div>
        <div class="prac-ans hidden" id="aPracAns${topicId}_${i}">✅ Answer: <strong>${q.ans}</strong></div>
      </div>`;
    });
    html += '<div class="prac-answer-key hidden" id="aPracAnswerKey">';
    html += '<h3 class="prac-key-title">📋 Answer Key</h3><div class="prac-key-grid">';
    qs.forEach((q, i) => { html += `<div class="prac-key-item"><span class="prac-key-q">Q${i+1}</span><span class="prac-key-a">${q.ans}</span></div>`; });
    html += '</div></div></div>';
    return html;
  }

  window.scrollTo(0, 0);
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
        <button class="topic-tab-btn" data-panel="practice">📝 Practice (50 Qs)</button>
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

      <!-- Practice Panel -->
      <div class="topic-tab-panel" data-panel="practice">${buildAptPracticeHTML(t.id)}</div>

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
  window.scrollTo(0, 0);

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

  /* Practice tab interactivity */
  const aPracToggle = document.getElementById('aPracToggleKey');
  const aPracKey    = document.getElementById('aPracAnswerKey');
  if (aPracToggle && aPracKey) {
    aPracToggle.addEventListener('click', () => {
      const showing = !aPracKey.classList.contains('hidden');
      aPracKey.classList.toggle('hidden');
      aPracToggle.textContent = showing ? 'Show Answer Key' : 'Hide Answer Key';
      el.querySelectorAll('.prac-ans').forEach(a => showing ? a.classList.add('hidden') : a.classList.remove('hidden'));
    });
  }
  const aPracFilters = document.getElementById('aPracFilters');
  if (aPracFilters) {
    aPracFilters.addEventListener('click', e => {
      const btn = e.target.closest('.prac-filter-btn');
      if (!btn) return;
      aPracFilters.querySelectorAll('.prac-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const diff = btn.dataset.diff;
      el.querySelectorAll('.prac-q').forEach(q => {
        q.style.display = (diff === 'all' || q.dataset.diff === diff) ? '' : 'none';
      });
    });
  }
  el.querySelectorAll('.prac-opt input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const name  = radio.name;
      const match = name.match(/aPracQ(\d+)_(\d+)/);
      if (!match) return;
      const ansEl = document.getElementById(`aPracAns${match[1]}_${match[2]}`);
      if (ansEl) {
        ansEl.classList.remove('hidden');
        const correct = ansEl.querySelector('strong').textContent.trim() === radio.value;
        const parent  = radio.closest('.prac-q');
        parent.querySelectorAll('.prac-opt').forEach(o => o.classList.remove('prac-correct','prac-wrong'));
        radio.closest('.prac-opt').classList.add(correct ? 'prac-correct' : 'prac-wrong');
        if (!correct) {
          const correctAns = ansEl.querySelector('strong').textContent.trim();
          parent.querySelectorAll('.prac-opt').forEach(o => {
            if (o.querySelector('.prac-opt-label').textContent === correctAns) o.classList.add('prac-correct');
          });
        }
      }
    });
  });
}

/* Initialise aptitude sidebar after APTITUDE_TOPICS const is in scope */
renderAptitudeList();

/* ════════════════════════════════════════════════════════════
   REASONING TOPICS DATA
════════════════════════════════════════════════════════════ */
const REASONING_TOPICS = [
  {
    id: 1, name: 'Analogies', emoji: '🔗', cat: 'Verbal Reasoning',
    shortcut: 'Find the hidden relationship between word pairs — same logic, different words!',
    hint: 'e.g. Doctor:Hospital :: Teacher:?',
    explanation: 'Analogy matlab "samanta" — ek relationship dhundho aur wahi relationship doosre pair mein apply karo. Jaise Doctor ka Hospital se rishta wahi hai jo Teacher ka School se!',
    steps: [
      'Step 1 — Pehle diye gaye word pair ko clearly samjho (e.g. Doctor : Hospital)',
      'Step 2 — Unke beech ka exact relationship identify karo (Doctor WORKS IN Hospital)',
      'Step 3 — Relationship ko ek chhoti sentence mein likho: "A is the workplace of B"',
      'Step 4 — Wahi sentence ko answer pair pe apply karo (Teacher WORKS IN ___)',
      'Step 5 — Sabhi options check karo aur jo fit ho usse select karo',
      'Step 6 — Trap options se bachao — similar-sounding words often wrong hote hain',
      'Step 7 — Confirm karo: reverse bhi same sense deta ho toh answer pakka sahi hai ✅'
    ],
    stepEgs: [
      'Doctor : Hospital — workplace pair',
      'Relationship = "works at" or "belongs to"',
      '"A is the professional place of B"',
      'Teacher : School (Teacher works at School) ✅',
      'Reject: Teacher : Book (instrument, not place)',
      'Trap: Teacher : Student — wrong relationship type',
      'Reverse: Hospital : Doctor ✅ — confirms it!'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Pen : Write :: Knife : ?', steps: ['Pen ka kaam hai Write karna', 'Knife ka kaam hai — Cut karna', 'Answer: Cut ✅'] },
      { num: 2, level: 'Basic', problem: 'Fish : Water :: Bird : ?', steps: ['Fish rehti hai Water mein', 'Bird rehti hai — Air mein', 'Answer: Air/Sky ✅'] },
      { num: 3, level: 'Moderate', problem: 'Melody : Music :: Aroma : ?', steps: ['Melody ek pleasant quality hai Music ki', 'Aroma ek pleasant quality hai — Food/Smell ki', 'Answer: Fragrance ✅'] },
      { num: 4, level: 'Hard', problem: 'Paw : Cat :: Hoof : ?', steps: ['Paw = Cat ka foot', 'Hoof = Horse ka foot', 'Answer: Horse ✅'] },
      { num: 5, level: 'Advanced', problem: 'Sculptor : Chisel :: Painter : ?', steps: ['Sculptor ka tool = Chisel', 'Painter ka tool = Brush', 'Answer: Brush ✅'] }
    ]
  },
  {
    id: 2, name: 'Similarities & Differences', emoji: '⚖️', cat: 'Verbal Reasoning',
    shortcut: 'Odd one out: 3 share a link, 1 is the imposter — find it fast!',
    hint: 'e.g. Cat, Dog, Lion, Rose — which is odd?',
    explanation: 'Is type mein ya toh common property dhundho (Similarities) ya jo alag ho usse nikalo (Odd One Out). Sab questions mein ek "hidden group" hoti hai — usse pakdo!',
    steps: [
      'Step 1 — Saare options ek baar padho aur mentally categorize karo',
      'Step 2 — Common thread dhundho — kya sab animals hain? Fruits? Numbers?',
      'Step 3 — Jo ek item baaki se alag category mein ho, woh odd one out hai',
      'Step 4 — Number-based questions mein: prime, even, perfect square check karo',
      'Step 5 — Word-based: first letter, syllable count, gender bhi trap ho sakti hai',
      'Step 6 — Elimination method use karo — 2 clearly same hain toh unhe group karo',
      'Step 7 — Last mein verify: kya baaki 3 ek common property share karte hain? ✅'
    ],
    stepEgs: [
      'Cat, Dog, Lion, Rose — read all',
      'Cat, Dog, Lion = Animals; Rose = Plant',
      'Rose is odd — different kingdom',
      '4, 9, 16, 18 — 4,9,16 are perfect squares; 18 is not',
      'Trap: BDFH vs BDFG — last letter pattern',
      'Dog, Cat, Rose, Lion — Lion could be "wild" trap',
      'Remaining 3: Cat, Dog, Lion = Animals ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Apple, Mango, Potato, Banana — odd one out?', steps: ['Apple, Mango, Banana = Fruits', 'Potato = Vegetable', 'Answer: Potato ✅'] },
      { num: 2, level: 'Basic', problem: 'Square, Triangle, Circle, Cube — odd one out?', steps: ['Square, Triangle, Circle = 2D shapes', 'Cube = 3D shape', 'Answer: Cube ✅'] },
      { num: 3, level: 'Moderate', problem: '4, 9, 25, 35 — odd one out?', steps: ['4=2², 9=3², 25=5² — perfect squares', '35 = 5×7 — not a perfect square', 'Answer: 35 ✅'] },
      { num: 4, level: 'Hard', problem: 'BDFH, LNPR, TVXZ, MOQS — odd one out?', steps: ['B+2=D+2=F+2=H — gap of 2', 'L+2=N+2=P+2=R — gap of 2', 'M+2=O+2=Q+2=S — gap of 2', 'T+2=V+2=X+2=Z — gap of 2', 'All same! But MOQS starts with M (13th), others start even — Answer: MOQS ✅'] },
      { num: 5, level: 'Advanced', problem: 'Painting, Sculpture, Poetry, Dancing, Swimming — odd one out?', steps: ['Painting, Sculpture, Poetry, Dancing = Art forms', 'Swimming = Sport/Physical activity', 'Answer: Swimming ✅'] }
    ]
  },
  {
    id: 3, name: 'Space Visualization', emoji: '🎲', cat: 'Non-Verbal Reasoning',
    shortcut: 'Mentally rotate/fold shapes — practice with real dice and paper!',
    hint: 'e.g. Cube nets, unfolded boxes, 3D rotations',
    explanation: 'Space Visualization = 3D shapes ko mentally ghumana ya unfold karna. Dice questions mein opposite faces yaad rakho, cube nets mein mentally fold karo!',
    steps: [
      'Step 1 — Dice ke liye: opposite faces ka rule yaad rakho (1-6, 2-5, 3-4 standard dice mein)',
      'Step 2 — Cube net dekhte hi mentally fold karo — base se start karo',
      'Step 3 — Har face ka neighbor kaun hai — left/right/top/bottom mark karo',
      'Step 4 — Rotation questions mein: ek reference point fix rakho aur baaki ghumao',
      'Step 5 — Water image mein horizontal flip, mirror image mein vertical flip hota hai',
      'Step 6 — Practice trick: apne haath ko 3D shape ki tarah use karo',
      'Step 7 — Eliminate impossible options first — jo opposite face visible ho woh wrong hai ✅'
    ],
    stepEgs: [
      'Standard dice: 1 opposite 6, 2 opposite 5, 3 opposite 4',
      'Net fold: cross shape mein — center = bottom, top = top face',
      '4 lateral faces + top + bottom = 6 faces total',
      'Fix face "1" aur rotate — "2" kahan jayega?',
      'Water image: top-bottom flip; Mirror image: left-right flip',
      'Fingers = cube edges trick for quick rotation',
      'If face 1 visible aur question mein 6 visible — wrong option!'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Ek cube ka ek face par 1 hai, adjacent face par 2 hai. Opposite face of 1 kya hai?', steps: ['Standard dice: 1 opposite 6', 'Answer: 6 ✅'] },
      { num: 2, level: 'Basic', problem: 'Mirror image of "CLOCK" kya hoga?', steps: ['Mirror = left-right flip', 'CLOCK → ꟸJOƆ (horizontal reverse)', 'Answer: ꞶꟸOJ (letters individually flipped too) ✅'] },
      { num: 3, level: 'Moderate', problem: 'Cube net mein top face pe A, right face pe B hai. Cube fold karne ke baad B ke opposite kya hoga?', steps: ['Net mentally fold karo', 'B ke opposite = left face', 'Depends on net — track 6 faces ✅'] },
      { num: 4, level: 'Hard', problem: 'A dice is shown with 3 faces visible: 1(top), 2(front), 3(right). Which number is at the bottom?', steps: ['Top=1, so bottom=6', 'Answer: 6 ✅'] },
      { num: 5, level: 'Advanced', problem: 'If a cube net is T-shaped with numbers 1-6, identify the face opposite to 4.', steps: ['Draw T-net mentally', 'Fold step by step', 'Track each face position — Answer depends on net layout ✅'] }
    ]
  },
  {
    id: 4, name: 'Spatial Orientation', emoji: '🧭', cat: 'Non-Verbal Reasoning',
    shortcut: 'N-S-E-W + Left/Right turns = Mental GPS. Always face the direction of movement!',
    hint: 'e.g. Facing North, turn left — now facing West',
    explanation: 'Direction sense aur orientation = mentally khud us jagah khada ho jao aur wahan se sochao. "Turn left" matlab apne left, na map ka left!',
    steps: [
      'Step 1 — North = Up, South = Down, East = Right, West = Left — yeh fix karo',
      'Step 2 — "Turn Left" = anti-clockwise 90°, "Turn Right" = clockwise 90°',
      'Step 3 — "About turn" = 180° = bilkul ulti disha',
      'Step 4 — Path draw karo paper pe — every turn note karo',
      'Step 5 — Final position find karo: net displacement North-South + East-West',
      'Step 6 — Distance from start: Pythagoras theorem use karo (a² + b² = c²)',
      'Step 7 — "Shadow at sunrise" = East se light, shadow West mein padegi ✅'
    ],
    stepEgs: [
      'N→turn left→W, W→turn left→S, S→turn left→E',
      'Facing North, turn right = now facing East',
      'Facing East, about turn = now facing West',
      'Go 3km N, 4km E — draw on paper',
      'Net: 3N + 4E = end point',
      'Distance from start = √(3²+4²) = √25 = 5 km',
      'Sunrise (East) se aata hai, shadow opposite (West) mein ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Ramesh faces North. He turns right. Which direction is he facing?', steps: ['North + right turn = East', 'Answer: East ✅'] },
      { num: 2, level: 'Basic', problem: 'A walks 5 km South, then 5 km North. Net displacement?', steps: ['5 South + 5 North = 0 net', 'Answer: Back at starting point, 0 km ✅'] },
      { num: 3, level: 'Moderate', problem: 'A goes 10 km East, 6 km North, 10 km West. How far from start?', steps: ['East 10, West 10 cancel out', 'Only 6 km North remains', 'Answer: 6 km ✅'] },
      { num: 4, level: 'Hard', problem: 'A goes 3 km North, 4 km East. Shortest distance from start?', steps: ['a=3, b=4', 'c = √(9+16) = √25 = 5 km', 'Answer: 5 km ✅'] },
      { num: 5, level: 'Advanced', problem: 'Facing South, turn left twice, then right once. Final direction?', steps: ['South → left → East', 'East → left → North', 'North → right → East', 'Answer: East ✅'] }
    ]
  },
  {
    id: 5, name: 'Problem Solving', emoji: '🧩', cat: 'Analytical Reasoning',
    shortcut: 'Break complex problems into small steps — elimination + logic = answer!',
    hint: 'e.g. Seating arrangements, logical puzzles',
    explanation: 'Problem Solving = systematic approach. Pehle given info note karo, conditions list karo, constraints apply karo, aur step-by-step narrow down karo. Koi bhi problem ek ek condition se solve hoti hai!',
    steps: [
      'Step 1 — Problem ko ek baar poora padho, bina answer sochne ke',
      'Step 2 — Given information aur conditions alag-alag note karo',
      'Step 3 — Strongest/most restrictive condition se start karo',
      'Step 4 — Diagram ya table banao — linear arrangement, circular, grid, etc.',
      'Step 5 — Har condition apply karo aur possibilities eliminate karo',
      'Step 6 — Derived conclusions bhi note karo (A ne kiya → B nahi kar sakta)',
      'Step 7 — Answer check karo — kya saari conditions satisfy hoti hain? ✅'
    ],
    stepEgs: [
      'Read: A, B, C, D sit in a row; A not at ends',
      'Conditions: B is next to C; D is at right end',
      'Start with D at right end (most restrictive)',
      'Row: _ _ _ D; A not at position 1 → A at 2 or 3',
      'B next to C → BC or CB block in remaining spots',
      'If BC at 1,2 → A at 3: B C A D ✅',
      'Check: D at right ✅, B next to C ✅, A not at end ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: '5 log ek line mein. A sabse aage hai, E sabse peeche. B, C ke baad hai. Order kya hai?', steps: ['A _ _ _ E fixed', 'B after C → ...C...B...', 'Possible: A C B D E or A D C B E', 'Answer: A C B D E (most common answer) ✅'] },
      { num: 2, level: 'Basic', problem: 'Agar 6 log round table pe baithe hain aur A always B ke baaye hai, total arrangements?', steps: ['Circular: (6-1)! = 120', 'A-B fixed pair halves it → 60', 'Answer: 60 ✅'] },
      { num: 3, level: 'Moderate', problem: '4 friends: age A>B>C>D. A is not oldest. Who is oldest?', steps: ['Contradiction! A>B>C>D means A is oldest', 'But A is NOT oldest — impossible unless reread', 'Recheck: B>A>C>D → B is oldest ✅'] },
      { num: 4, level: 'Hard', problem: '6 boxes P,Q,R,S,T,U stacked. P above S, Q below R, T on top, U at bottom. S above U. Arrangement?', steps: ['T top, U bottom', 'S above U: U...S', 'P above S: U...S...P', 'Q below R: R...Q', 'Fill: T P R Q S U ✅'] },
      { num: 5, level: 'Advanced', problem: 'A is father of B. C is mother of D. B is sister of D. How is A related to C?', steps: ['B and D are siblings (B sister of D)', 'A is father of B', 'C is mother of D', 'Same family → A is husband of C ✅'] }
    ]
  },
  {
    id: 6, name: 'Analysis', emoji: '🔬', cat: 'Analytical Reasoning',
    shortcut: 'Break down → categorize → pattern find → conclude. Think like a detective!',
    hint: 'e.g. Statement analysis, data sufficiency',
    explanation: 'Analysis questions mein data ya statements diye hote hain — tumhe logical conclusions nikalni hoti hain. Emotions chhodo, sirf facts se kaam karo!',
    steps: [
      'Step 1 — Diye gaye statements ko carefully alag-alag padho',
      'Step 2 — Har statement mein "absolute" words dhundho: All, No, Some, Always, Never',
      'Step 3 — Venn diagram banao mentally — All A is B = circle A inside circle B',
      'Step 4 — Conclusions ko one by one test karo against the diagram',
      'Step 5 — "Some" conclusion ke liye at least one case true hona chahiye',
      'Step 6 — "All" conclusion ke liye har case true hona chahiye',
      'Step 7 — Ambiguous cases mein "Either/Or" conclusion valid hoti hai ✅'
    ],
    stepEgs: [
      'Statement: All cats are animals. Some animals are dogs.',
      '"All cats are animals" → Cat circle inside Animal circle',
      'Venn: Cats ⊂ Animals, Dogs ∩ Animals',
      'Conclusion: Some dogs are cats — test against diagram',
      'Diagram shows Dog-Cat overlap NOT guaranteed → False',
      'All conclusions need 100% certainty to be true',
      'When both I and II false but combined possible → Either/Or ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'All roses are flowers. All flowers are plants. Conclusion: All roses are plants?', steps: ['All roses → flowers → plants', 'Transitive: All roses are plants', 'Answer: True ✅'] },
      { num: 2, level: 'Basic', problem: 'No cat is a dog. All dogs are animals. Conclusion: No cat is an animal?', steps: ['No overlap Cat-Dog', 'Dogs ⊂ Animals', 'Cats could still be animals independently', 'Answer: Conclusion is False ✅'] },
      { num: 3, level: 'Moderate', problem: 'Some A are B. All B are C. Conclusion: Some A are C?', steps: ['Some A → B → C (since All B are C)', 'Those "some A" that are B are also C', 'Answer: True ✅'] },
      { num: 4, level: 'Hard', problem: 'All pens are books. No book is a pencil. Conclusion: No pen is a pencil?', steps: ['Pens ⊂ Books; Books ∩ Pencils = ∅', 'Since Pens ⊂ Books, Pens ∩ Pencils = ∅', 'Answer: True ✅'] },
      { num: 5, level: 'Advanced', problem: 'Some A are B. Some B are C. Conclusion: Some A are C?', steps: ['Some A→B and Some B→C', 'Overlap not guaranteed to be same "some"', 'Answer: Conclusion does NOT follow ✅'] }
    ]
  },
  {
    id: 7, name: 'Judgment', emoji: '⚖️', cat: 'Analytical Reasoning',
    shortcut: 'Course of Action: Is it practical? Does it address the ROOT cause?',
    hint: 'e.g. Problem given → which action should be taken?',
    explanation: 'Judgment questions mein ek situation di jati hai aur tum decide karte ho ki kya karana chahiye. Logical, practical aur root-cause addressing actions select karo!',
    steps: [
      'Step 1 — Problem/situation clearly samjho — kaun, kya, kahan, kab',
      'Step 2 — Proposed course of action padho carefully',
      'Step 3 — Check: Kya yeh action problem ke ROOT CAUSE ko address karta hai?',
      'Step 4 — Check: Kya yeh action PRACTICAL hai? Implement ho sakta hai?',
      'Step 5 — Extreme actions usually wrong hote hain — balance dhundho',
      'Step 6 — Government / administrative problems mein: investigation + action both valid',
      'Step 7 — Agar dono actions complementary hain toh dono follow karo ✅'
    ],
    stepEgs: [
      'Problem: Road accident due to poor lighting',
      'Action I: Improve street lighting; Action II: Ban vehicles at night',
      'Action I addresses root cause (poor lighting) ✅',
      'Action I is practical and implementable',
      'Action II is extreme — banning vehicles = impractical',
      'Action II does NOT address root cause properly',
      'Answer: Only Action I follows ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Many students fail exams due to poor teaching. Action: Fire all teachers immediately?', steps: ['Extreme action — "all" is a red flag', 'Root cause = poor teaching, not all teachers', 'Answer: Does NOT follow ✅'] },
      { num: 2, level: 'Basic', problem: 'River floods every year. Action I: Build embankments. Action II: Relocate villages?', steps: ['Action I: Practical, addresses flooding', 'Action II: Extreme but valid for safety', 'Answer: Both follow ✅'] },
      { num: 3, level: 'Moderate', problem: 'Crime rate increasing in city. Action: Deploy more police in affected areas?', steps: ['Practical, directly addresses crime', 'Root cause addressed (more surveillance)', 'Answer: Follows ✅'] },
      { num: 4, level: 'Hard', problem: 'Company losing profit. Action I: Cut employee salaries. Action II: Improve product quality?', steps: ['Action I: Temporary fix, may harm morale', 'Action II: Addresses root cause (better product)', 'Answer: Action II is better; both could follow in context ✅'] },
      { num: 5, level: 'Advanced', problem: 'Students not attending school. Action I: Impose fines on parents. Action II: Investigate reasons?', steps: ['Action II: Find root cause first (always)', 'Action I: Punitive without understanding = premature', 'Answer: Action II follows; Action I debatable ✅'] }
    ]
  },
  {
    id: 8, name: 'Blood Relations', emoji: '👨‍👩‍👧‍👦', cat: 'Verbal Reasoning',
    shortcut: 'Draw a family tree! Male=square, Female=circle, = is married, | is child.',
    hint: 'e.g. A is B\'s father\'s sister — how is A related to B?',
    explanation: 'Blood relation questions mein family tree banana sabse best approach hai. Symbols use karo: + for male, - for female, aur har sentence ke baad tree update karo!',
    steps: [
      'Step 1 — Diagram banao: box/+ for male, circle/- for female',
      'Step 2 — Har statement ek baar padho aur tree mein add karo',
      'Step 3 — Key relations yaad rakho: Father\'s sister = Aunt, Mother\'s brother = Uncle',
      'Step 4 — "Only son/daughter" = sibling nahi hai',
      'Step 5 — Generation track karo — same gen, upper gen, lower gen',
      'Step 6 — Gender clues se confirm karo — "he/she" se gender fix karo',
      'Step 7 — Final answer: person A se person B ka kya rishta? Tree trace karo ✅'
    ],
    stepEgs: [
      'A is B\'s father → A (+) above B',
      'C is B\'s sister → C (-) same level as B',
      'Father\'s sister = Bua (Paternal Aunt)',
      '"A has only one son" = A\'s son has no siblings',
      'A (Parent gen) → B (Child gen) → C (Grandchild gen)',
      'Pointing to photo: "His mother is my mother\'s daughter" = she is Niece',
      'Trace: My mother\'s daughter = Sister; Sister\'s son = Nephew ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'A is B\'s father. C is A\'s sister. How is C related to B?', steps: ['A = B\'s father', 'C = A\'s sister = Father\'s sister', 'Answer: C is B\'s Aunt (Bua) ✅'] },
      { num: 2, level: 'Basic', problem: 'Pointing to a boy, Seema says "He is son of my grandfather\'s only son." Who is the boy?', steps: ['Grandfather\'s only son = Seema\'s father', 'Father\'s son = Seema\'s brother', 'Answer: Brother ✅'] },
      { num: 3, level: 'Moderate', problem: 'A+B means A is mother of B. A-B means A is brother of B. Find: P+Q-R?', steps: ['P+Q = P is mother of Q', 'Q-R = Q is brother of R', 'So P is mother of Q, Q is brother of R', 'Answer: P is mother of R ✅'] },
      { num: 4, level: 'Hard', problem: '"That woman\'s father-in-law is my father\'s only son." How is the man related to the woman?', steps: ['My father\'s only son = Me (the speaker)', 'I am the woman\'s father-in-law', 'Answer: He is her Father-in-law ✅'] },
      { num: 5, level: 'Advanced', problem: 'A is B\'s sister. B is C\'s mother. D is C\'s father. How is A related to D?', steps: ['B is C\'s mother, D is C\'s father → B and D are married', 'A is B\'s sister → A is D\'s Sister-in-law', 'Answer: Sister-in-law ✅'] }
    ]
  },
  {
    id: 9, name: 'Decision Making', emoji: '🎯', cat: 'Analytical Reasoning',
    shortcut: 'Follow given criteria strictly — no assumptions, no personal opinions!',
    hint: 'e.g. Candidate must have X, Y, Z — does this profile qualify?',
    explanation: 'Decision Making = given criteria ke basis pe haan ya na bolna. Apni marzi nahi chalti — jo criteria diya hai woh mechanical apply karo!',
    steps: [
      'Step 1 — Saare criteria ek list mein note karo (age, marks, experience etc.)',
      'Step 2 — Candidate/case ki details carefully padho',
      'Step 3 — Ek ek criterion check karo — tick ya cross lagao',
      'Step 4 — Agar koi exception clause hai ("refer to senior" etc.) — woh condition check karo',
      'Step 5 — Sabhi criteria meet karne pe: Selected/Eligible',
      'Step 6 — Koi ek bhi criteria fail karne pe: Not Selected (jab tak exception na ho)',
      'Step 7 — Borderline cases mein exception clause use karo ✅'
    ],
    stepEgs: [
      'Criteria: Age 21-28, Marks ≥60%, Experience ≥2 years',
      'Candidate: Age 25, Marks 65%, Experience 1.5 years',
      'Age ✅, Marks ✅, Experience ❌ (1.5 < 2)',
      'Check exception: "If experience 1-2 years, refer to manager"',
      'Experience 1.5 years → exception applies',
      'Answer: Refer to Manager (not outright rejected)',
      'Final decision follows from criteria + exception ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Age 18-25 required. Candidate is 23. Eligible?', steps: ['23 is between 18-25', 'Answer: Eligible ✅'] },
      { num: 2, level: 'Basic', problem: 'Min 60% marks needed. Student got 58%. Admit?', steps: ['58 < 60 — criteria not met', 'Answer: Not admitted ✅'] },
      { num: 3, level: 'Moderate', problem: 'Age 21-28, Grad required, 2yr exp. Candidate: Age 27, Grad ✅, 1.5yr exp. Rule: 1-2yr refer to director.', steps: ['Age ✅, Grad ✅, Exp ❌ (1.5yr)', 'Exception: 1-2 yr → refer to Director', 'Answer: Refer to Director ✅'] },
      { num: 4, level: 'Hard', problem: 'Score ≥ 70 in both subjects. A scores 72 in Math, 68 in English. Result?', steps: ['Math: 72 ≥ 70 ✅', 'English: 68 < 70 ❌', 'Both required — one fails', 'Answer: Not Qualified ✅'] },
      { num: 5, level: 'Advanced', problem: 'Criteria: A) Grad B) Age 22-30 C) Computer knowledge. Relaxation: If A&B met but not C, give computer training.', steps: ['Candidate: Grad ✅, Age 25 ✅, No computer ❌', 'A and B met, C not met → Relaxation applies', 'Answer: Give computer training ✅'] }
    ]
  },
  {
    id: 10, name: 'Visual Memory', emoji: '👁️', cat: 'Non-Verbal Reasoning',
    shortcut: 'Study the figure for patterns — count elements, note unique features!',
    hint: 'e.g. Mirror images, embedded figures, figure completion',
    explanation: 'Visual Memory = figures ko yaad rakhna aur unhe analyze karna. Har figure mein elements count karo, shapes note karo, symmetry dekho — details matter karte hain!',
    steps: [
      'Step 1 — Figure ko systematically scan karo: top-left se bottom-right',
      'Step 2 — Elements count karo — lines, dots, circles, angles',
      'Step 3 — Symmetry check karo: horizontal, vertical, rotational',
      'Step 4 — Hidden/embedded figures mein: question figure ko answer options mein trace karo',
      'Step 5 — Figure series mein: kya element add/remove/rotate ho raha hai?',
      'Step 6 — Elimination use karo — clearly wrong options pehle hatao',
      'Step 7 — Final answer: exact match in count + orientation + position ✅'
    ],
    stepEgs: [
      'Figure: Triangle with dot inside and line outside',
      'Elements: 1 triangle, 1 dot, 1 line = 3 elements',
      'Is it symmetric? Yes — vertical axis',
      'Look for this triangle in option figures',
      'Series: Square→Pentagon→Hexagon = sides increasing by 1',
      'Eliminate options with wrong side count',
      'Next = Heptagon (7 sides) ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Mirror image of a flag with star on left side?', steps: ['Mirror flips left-right', 'Star moves to right side', 'Answer: Star on right ✅'] },
      { num: 2, level: 'Basic', problem: 'Count triangles in a figure divided by 3 lines through center?', steps: ['3 lines create 6 small triangles', 'Larger triangles formed by 2 small ones: 6', 'Largest: 2, Total = 6+6+2 = depends on figure', 'Systematic counting ✅'] },
      { num: 3, level: 'Moderate', problem: 'Find the embedded figure: a small triangle inside a complex figure?', steps: ['Trace the triangle shape in the complex figure', 'Match all 3 sides exactly', 'Answer: Option where triangle is visible ✅'] },
      { num: 4, level: 'Hard', problem: 'Figure series: shapes rotate 45° each step. 4th figure?', steps: ['Step 1: 0°, Step 2: 45°, Step 3: 90°', 'Step 4: 135° rotation', 'Answer: Shape at 135° ✅'] },
      { num: 5, level: 'Advanced', problem: 'Water image of a clock showing 3:45?', steps: ['Water image = top-bottom flip', 'Clock at 3:45 flipped = appears as 8:15', 'Answer: 8:15 ✅'] }
    ]
  },
  {
    id: 11, name: 'Discrimination', emoji: '🔎', cat: 'Non-Verbal Reasoning',
    shortcut: 'Spot the tiny difference — one figure is the imposter among lookalikes!',
    hint: 'e.g. 4 figures given, 1 is slightly different — find it',
    explanation: 'Discrimination = almost identical figures mein se ek alag dhundho. Rotation, reflection, missing element, extra element — micro-details pe dhyan do!',
    steps: [
      'Step 1 — Saari figures ko ek baar overview karo — pehle overall shape dekho',
      'Step 2 — Elements count karo har figure mein: lines, dots, arrows, curves',
      'Step 3 — Orientation check karo — koi figure rotated ya flipped toh nahi?',
      'Step 4 — Internal details compare karo — shading, pattern, size differences',
      'Step 5 — Ek ek option eliminate karo — 3 same hain, 1 alag',
      'Step 6 — Symmetry check karo — axis of symmetry same hai ya different?',
      'Step 7 — Final confirmation — exactly kya alag hai woh note karo ✅'
    ],
    stepEgs: [
      '4 arrows — all pointing right, one slightly tilted',
      'Count: all have 1 arrowhead, 1 shaft — same',
      'Angle: 3 at 0°, 1 at 15° tilt',
      'Shading: all hollow — no difference there',
      'Fig C has the tilt — eliminate A, B, D',
      'No symmetry difference — only rotation matters',
      'Answer: Fig C — tilted arrow ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: '4 squares: 3 have a dot in center, 1 has dot in corner. Find odd.', steps: ['3 center dots, 1 corner dot', 'Answer: Figure with corner dot ✅'] },
      { num: 2, level: 'Basic', problem: '4 triangles: 3 pointing up, 1 pointing down. Find odd.', steps: ['3 upward, 1 inverted', 'Answer: Inverted triangle ✅'] },
      { num: 3, level: 'Moderate', problem: '4 clock faces: 3 show 3:00, 1 shows 3:00 mirror image. Find odd.', steps: ['3 normal, 1 mirror-flipped', 'Answer: Mirror image clock ✅'] },
      { num: 4, level: 'Hard', problem: '4 pentagons with internal lines: 3 have same pattern, 1 has one extra line.', steps: ['Count internal lines: 3 have 2 lines, 1 has 3 lines', 'Answer: Pentagon with 3 internal lines ✅'] },
      { num: 5, level: 'Advanced', problem: '4 complex figures with arrows and shapes: spot the rotated one.', steps: ['Compare arrow directions in each', 'One figure has arrow rotated 90°', 'Answer: Rotated figure ✅'] }
    ]
  },
  {
    id: 12, name: 'Observation', emoji: '👀', cat: 'Non-Verbal Reasoning',
    shortcut: 'Figure series mein pattern dhundho — kya add/remove/rotate ho raha hai har step mein?',
    hint: 'e.g. What comes next in the figure series?',
    explanation: 'Observation = figure series ya pattern completion. Har step mein kya change ho raha hai — addition, deletion, rotation, shading — woh pattern continue karo!',
    steps: [
      'Step 1 — Series ki pehli 2-3 figures dhyan se dekho',
      'Step 2 — Kya change ho raha hai? Rotation? Element add? Size change?',
      'Step 3 — Change ka pattern note karo — clockwise 90°? Har step mein 1 element add?',
      'Step 4 — Pattern ko next figure pe apply karo',
      'Step 5 — Options mein se match karo',
      'Step 6 — Multiple patterns ho sakte hain ek saath — dono track karo',
      'Step 7 — Verify: kya tumhara answer series ke saare rules follow karta hai? ✅'
    ],
    stepEgs: [
      'Fig 1: △, Fig 2: △□, Fig 3: △□○',
      'Change: har step mein 1 new shape add ho raha hai',
      'Pattern: Triangle → +Square → +Circle → +???',
      'Next shape could be: Pentagon or Star (next in series)',
      'Check options for △□○★ or similar',
      'Also note: shapes are in order — no rotation happening',
      'Answer: Figure with all 4 shapes in order ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Series: ○, ○○, ○○○, ? — What comes next?', steps: ['Pattern: +1 circle each time', 'Next: ○○○○ (4 circles)', 'Answer: 4 circles ✅'] },
      { num: 2, level: 'Basic', problem: 'Arrow rotates 90° clockwise each step. After 3 steps from →?', steps: ['→ → ↓ → ← → ↑', 'Answer: ↑ (pointing up) ✅'] },
      { num: 3, level: 'Moderate', problem: 'Shading pattern: white, half-shaded, full-shaded, white, half-shaded, ?', steps: ['Cycle: W → H → F → W → H → F', 'Answer: Full-shaded ✅'] },
      { num: 4, level: 'Hard', problem: 'Figure rotates 45° and one element is added each step. Predict 4th figure.', steps: ['Step 1: 0°+1 elem, Step 2: 45°+2 elem, Step 3: 90°+3 elem', 'Step 4: 135° rotation + 4 elements', 'Answer: 135° rotated with 4 elements ✅'] },
      { num: 5, level: 'Advanced', problem: 'Dual pattern: outer shape rotates, inner shape alternates black/white. Find 5th figure.', steps: ['Track outer: rotation pattern', 'Track inner: B, W, B, W, B', 'Combine both patterns', 'Answer: Rotated outer + Black inner ✅'] }
    ]
  },
  {
    id: 13, name: 'Relationship Concepts', emoji: '🔗', cat: 'Verbal Reasoning',
    shortcut: 'Find how A relates to B — tool:user, part:whole, cause:effect, synonym:antonym!',
    hint: 'e.g. Hammer:Nail :: Screwdriver:?',
    explanation: 'Relationship Concepts mein do cheezein ka aapas mein kya rishta hai woh samjhna hai. Common types: worker-tool, cause-effect, part-whole, product-material, degree relationships.',
    steps: [
      'Step 1 — Given pair mein exact relationship identify karo',
      'Step 2 — Relationship ka type classify karo: tool-user? part-whole? cause-effect?',
      'Step 3 — Same type ka relationship doosre pair pe apply karo',
      'Step 4 — Common relationship types yaad rakho (10+ types hote hain)',
      'Step 5 — Degree/intensity relationships: Happy→Ecstatic, Warm→Hot',
      'Step 6 — Reverse relationships: Create→Destroy, Buy→Sell (antonyms)',
      'Step 7 — Verify: dono pairs mein SAME type ka relationship hai? ✅'
    ],
    stepEgs: [
      'Hammer:Nail — Hammer hits Nail (Tool:Object)',
      'Type: Tool → Used on → Object',
      'Screwdriver → Used on → Screw',
      'Types: Worker-Tool, Part-Whole, Cause-Effect, Symbol-Meaning',
      'Anger → Fury (degree), Like → Love (degree)',
      'Buy:Sell, Create:Destroy (antonym pairs)',
      'Hammer:Nail = Tool:Object, Screwdriver:Screw = Tool:Object ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Tailor : Cloth :: Carpenter : ?', steps: ['Tailor works on Cloth', 'Carpenter works on — Wood', 'Answer: Wood ✅'] },
      { num: 2, level: 'Basic', problem: 'Mango : Fruit :: Carrot : ?', steps: ['Mango is a type of Fruit', 'Carrot is a type of — Vegetable', 'Answer: Vegetable ✅'] },
      { num: 3, level: 'Moderate', problem: 'Annoy : Enrage :: Pleased : ?', steps: ['Annoy → Enrage (degree increase)', 'Pleased → Ecstatic (degree increase)', 'Answer: Ecstatic ✅'] },
      { num: 4, level: 'Hard', problem: 'Bee : Hive :: Ant : ?', steps: ['Bee lives in Hive', 'Ant lives in — Colony/Anthill', 'Answer: Colony ✅'] },
      { num: 5, level: 'Advanced', problem: 'Cobbler : Leather :: Blacksmith : ?', steps: ['Cobbler works with Leather (raw material)', 'Blacksmith works with — Iron/Metal', 'Answer: Iron ✅'] }
    ]
  },
  {
    id: 14, name: 'Arithmetical Reasoning', emoji: '🧮', cat: 'Analytical Reasoning',
    shortcut: 'Word problem → equation. "More than" = +, "Less than" = −, "Times" = ×',
    hint: 'e.g. A is twice B\'s age. Sum is 36. Find ages.',
    explanation: 'Arithmetical Reasoning = math word problems. English/Hindi sentences ko equations mein convert karo aur solve karo. Translation hi sabse important step hai!',
    steps: [
      'Step 1 — Problem padho aur unknowns ko variables assign karo (Let A = x)',
      'Step 2 — "More than" = +, "Less than" = −, "Times" = ×, "Divided by" = ÷',
      'Step 3 — Sentences ko equations mein convert karo one by one',
      'Step 4 — Equations solve karo — substitution ya elimination method',
      'Step 5 — Answer ko original problem mein put karke verify karo',
      'Step 6 — Units dhyan rakho: age=years, money=Rs, distance=km',
      'Step 7 — Shortcut: Options mein se back-substitute karke check karo ✅'
    ],
    stepEgs: [
      'A is twice B\'s age. Let B = x, then A = 2x',
      '"Sum is 36" → x + 2x = 36',
      'Equation: 3x = 36',
      'Solve: x = 12, so B = 12, A = 24',
      'Check: 24 + 12 = 36 ✅ and 24 = 2×12 ✅',
      'Ages in years ✅',
      'From options: if B=12 → A=24, sum=36 ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'A number is 3 more than twice another. Sum is 18. Find them.', steps: ['Let x, other = 2x+3', 'x + 2x + 3 = 18 → 3x = 15 → x = 5', 'Numbers: 5 and 13 ✅'] },
      { num: 2, level: 'Basic', problem: 'Age of father is 4 times son. After 5 years, father is 3 times son. Find ages.', steps: ['Son = x, Father = 4x', '4x+5 = 3(x+5) → 4x+5 = 3x+15 → x=10', 'Son=10, Father=40 ✅'] },
      { num: 3, level: 'Moderate', problem: 'In a class of 40, girls are 10 more than boys. How many boys?', steps: ['Boys = x, Girls = x+10', 'x + x + 10 = 40 → 2x = 30 → x = 15', 'Boys = 15 ✅'] },
      { num: 4, level: 'Hard', problem: 'A is 3yr older than B. C is 2yr younger than A. Sum of ages = 50. Find B\'s age.', steps: ['B=x, A=x+3, C=x+3-2=x+1', 'x + (x+3) + (x+1) = 50 → 3x+4=50 → x=46/3', 'Approximate or recheck wording ✅'] },
      { num: 5, level: 'Advanced', problem: '5 consecutive odd numbers sum to 75. Find the middle one.', steps: ['Let middle = x: (x-4)+(x-2)+x+(x+2)+(x+4)=75', '5x = 75 → x = 15', 'Answer: 15 ✅'] }
    ]
  },
  {
    id: 15, name: 'Figural Classification', emoji: '🗂️', cat: 'Non-Verbal Reasoning',
    shortcut: 'Group similar figures together — shape, shading, count, rotation = classification criteria!',
    hint: 'e.g. 6 figures → divide into 2 groups of 3',
    explanation: 'Figural Classification = figures ko groups mein divide karo based on common properties. Shape, number of elements, shading, orientation — jo common hai woh group!',
    steps: [
      'Step 1 — Saari figures ek baar scan karo — overall impression lo',
      'Step 2 — Har figure mein elements count karo',
      'Step 3 — Shape type note karo — curved vs straight, open vs closed',
      'Step 4 — Shading/pattern compare karo across figures',
      'Step 5 — Rotation/orientation check karo — koi group rotated hai?',
      'Step 6 — 2 groups banao: Group A = similar, Group B = similar',
      'Step 7 — Verify: har group ke saare members ek hi rule follow karte hain? ✅'
    ],
    stepEgs: [
      'Figs: △○ , □○ , △□ , ○○ , □□ , △△',
      'Count: all have 2 elements each',
      'Group by: same shape pair vs different shape pair',
      'Same: ○○, □□, △△ → Group A',
      'Different: △○, □○, △□ → Group B',
      'Rule A: both elements same, Rule B: both different',
      'Classification verified ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Figures: filled circle, empty square, filled triangle, empty circle, filled square, empty triangle. Classify.', steps: ['Group A: filled shapes (circle, triangle, square)', 'Group B: empty shapes (circle, square, triangle)', 'Classification by shading ✅'] },
      { num: 2, level: 'Basic', problem: '6 arrows: 3 point right, 3 point left. Group them.', steps: ['Group A: right-pointing arrows', 'Group B: left-pointing arrows', 'Classification by direction ✅'] },
      { num: 3, level: 'Moderate', problem: 'Figures with 1,2,3,1,2,3 dots. How to group?', steps: ['Group by dot count: (1,1), (2,2), (3,3)', 'Or: Group A = {1,2,3} first set, Group B = {1,2,3} second', 'Answer depends on other features ✅'] },
      { num: 4, level: 'Hard', problem: 'Complex figures: classify by number of straight lines vs curves.', steps: ['Count straight lines in each figure', 'Count curves in each figure', 'Group: mostly-straight vs mostly-curved', 'Answer: Based on dominant feature ✅'] },
      { num: 5, level: 'Advanced', problem: '6 figures with mixed features. Group by 2 simultaneous criteria.', steps: ['Identify criteria 1: shape type', 'Identify criteria 2: element count', 'Combine: same shape + same count = group', 'Answer: Multi-criteria classification ✅'] }
    ]
  },
  {
    id: 16, name: 'Arithmetic Number Series', emoji: '🔢', cat: 'Analytical Reasoning',
    shortcut: 'Differences nikalo! Constant diff = AP, growing diff = take 2nd difference, multiply = GP!',
    hint: 'e.g. 2, 6, 12, 20, ? — differences: 4,6,8 → next diff=10 → answer=30',
    explanation: 'Number Series = pattern dhundho. Pehle differences nikalo, agar constant nahi hai toh 2nd differences nikalo. Multiply, divide, square, cube patterns bhi check karo!',
    steps: [
      'Step 1 — Consecutive terms ke beech difference nikalo (1st order)',
      'Step 2 — Agar 1st diff constant hai → AP: next = last + common diff',
      'Step 3 — 1st diff constant nahi → 2nd differences nikalo',
      'Step 4 — 2nd diff constant → quadratic pattern (add increasing values)',
      'Step 5 — Multiply/divide pattern check: har term × 2? × 3? ÷ 2?',
      'Step 6 — Perfect squares (1,4,9,16...) ya cubes (1,8,27,64...) check karo',
      'Step 7 — Alternating series check: odd positions alag pattern, even alag? ✅'
    ],
    stepEgs: [
      '2, 6, 12, 20, ? → Diffs: 4, 6, 8',
      'Diffs not constant → find 2nd diffs',
      '2nd diffs: 6-4=2, 8-6=2 → constant! Pattern found',
      'Next 1st diff = 8+2 = 10',
      'Answer = 20 + 10 = 30',
      'Verify: 2,6,12,20,30 = n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6 ✅',
      'Not alternating — single pattern throughout ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: '3, 7, 11, 15, ?', steps: ['Diff: 4, 4, 4 → AP', 'Next: 15 + 4 = 19', 'Answer: 19 ✅'] },
      { num: 2, level: 'Basic', problem: '2, 4, 8, 16, ?', steps: ['Each × 2 → GP', 'Next: 16 × 2 = 32', 'Answer: 32 ✅'] },
      { num: 3, level: 'Moderate', problem: '1, 4, 9, 16, 25, ?', steps: ['1², 2², 3², 4², 5² → perfect squares', 'Next: 6² = 36', 'Answer: 36 ✅'] },
      { num: 4, level: 'Hard', problem: '2, 6, 12, 20, 30, ?', steps: ['Diffs: 4,6,8,10 → increasing by 2', 'Next diff: 12', 'Answer: 30 + 12 = 42 ✅'] },
      { num: 5, level: 'Advanced', problem: '1, 1, 2, 3, 5, 8, ?', steps: ['Fibonacci: each = sum of previous two', '5 + 8 = 13', 'Answer: 13 ✅'] }
    ]
  },
  {
    id: 17, name: 'Non-Verbal Series', emoji: '🔄', cat: 'Non-Verbal Reasoning',
    shortcut: 'Figure se figure mein kya badal raha hai? Rotation + Element count + Position track karo!',
    hint: 'e.g. Figure series: what comes next?',
    explanation: 'Non-Verbal Series = figure patterns. Text nahi, pictures mein pattern dhundho — rotation, addition, subtraction, position change. Har step mein 1-2 changes hote hain!',
    steps: [
      'Step 1 — Series ki figures ko left se right scan karo',
      'Step 2 — Kya rotate ho raha hai? Clockwise/anti-clockwise kitne degrees?',
      'Step 3 — Koi element add ya remove ho raha hai har step mein?',
      'Step 4 — Position change track karo — elements shift ho rahe hain?',
      'Step 5 — Shading/color pattern: alternate? progressive fill?',
      'Step 6 — Sabhi patterns simultaneously apply karke next figure predict karo',
      'Step 7 — Options se match karo — exact match dhundho ✅'
    ],
    stepEgs: [
      'Fig series: □+dot(top-left), □+dot(top-right), □+dot(bottom-right)',
      'Dot is moving clockwise around square corners',
      'No elements added or removed — only position change',
      'Position: TL → TR → BR → next = BL (bottom-left)',
      'No shading change',
      'Next: Square with dot at bottom-left',
      'Match with options ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Arrow: →, ↓, ←, ↑, ? — next?', steps: ['Rotating 90° clockwise', 'After ↑: → again (full cycle)', 'Answer: → ✅'] },
      { num: 2, level: 'Basic', problem: 'Dots: 1, 2, 3, 4, ? — increasing count?', steps: ['Pattern: +1 dot each step', 'Next: 5 dots', 'Answer: 5 dots ✅'] },
      { num: 3, level: 'Moderate', problem: 'Shape rotates 45° and gains 1 line each step. Predict step 4.', steps: ['Step 1: 0°, 1 line; Step 2: 45°, 2 lines; Step 3: 90°, 3 lines', 'Step 4: 135°, 4 lines', 'Answer: 135° rotation + 4 lines ✅'] },
      { num: 4, level: 'Hard', problem: 'Alternating: big circle, small square, big circle, small square, ?', steps: ['Pattern: alternating shape + size', 'Next: big circle (odd position)', 'Answer: Big circle ✅'] },
      { num: 5, level: 'Advanced', problem: 'Two independent patterns: outer rotates, inner alternates. Find 5th figure.', steps: ['Outer: rotates 60° each step', 'Inner: black, white, black, white, black', 'Step 5: 240° rotation + black inner', 'Answer: Combined figure ✅'] }
    ]
  },
  {
    id: 18, name: 'Coding & Decoding', emoji: '🔐', cat: 'Verbal Reasoning',
    shortcut: 'Find the code rule: letter shift (+1, +2), reverse, position swap — crack the pattern!',
    hint: 'e.g. CAT=DBU, then DOG=?',
    explanation: 'Coding-Decoding = secret language! Ek word ka code diya hai — pehle rule dhundho (letter shift, reverse, etc.), phir same rule doosre word pe apply karo!',
    steps: [
      'Step 1 — Given word aur code ko letter-by-letter compare karo',
      'Step 2 — Har letter ka position number nikalo (A=1, B=2... Z=26)',
      'Step 3 — Difference nikalo: code letter - original letter = shift value',
      'Step 4 — Kya shift constant hai (har letter +2?) ya variable (+1,+2,+3...)?',
      'Step 5 — Reverse coding check karo: WORD ulta = DROW coded?',
      'Step 6 — Found rule ko new word pe apply karo',
      'Step 7 — Verify: kya decoded answer meaningful hai? ✅'
    ],
    stepEgs: [
      'CAT = DBU: C→D, A→B, T→U',
      'C=3→D=4, A=1→B=2, T=20→U=21',
      'Shift: +1, +1, +1 → constant shift of +1',
      'Shift = +1 for all letters (Caesar cipher)',
      'Not reverse — straightforward shift',
      'DOG: D+1=E, O+1=P, G+1=H = EPH',
      'EPH — coded form ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'If CAT = DBU, what is DOG?', steps: ['Rule: each letter +1', 'D+1=E, O+1=P, G+1=H', 'Answer: EPH ✅'] },
      { num: 2, level: 'Basic', problem: 'If BALL = YZOO, what is the coding rule?', steps: ['B=2→Y=25, A=1→Z=26, L=12→O=15', 'Pattern: 2→25=27-2, 1→26=27-1', 'Rule: 27 - position = code ✅'] },
      { num: 3, level: 'Moderate', problem: 'In a code, LION = ORQL. Find BEAR.', steps: ['L+3=O, I+3=R (wait: I=9, R=18... L=12→O=15 = +3)', 'Each letter +3', 'B+3=E, E+3=H, A+3=D, R+3=U', 'Answer: EHDU ✅'] },
      { num: 4, level: 'Hard', problem: 'COMPUTER coded as DMQVUFS. Rule?', steps: ['C+1=D, O+(-2)=M... variable shifts', 'Check: C=3→D=4(+1), O=15→M=13(-2)...', 'Alternating +1,-2 pattern', 'Answer: Apply same to new word ✅'] },
      { num: 5, level: 'Advanced', problem: 'If 1234 codes MATH, what does 4213 code?', steps: ['1=M, 2=A, 3=T, 4=H', '4213 = H, A, M, T → HAMT', 'Answer: HAMT ✅'] }
    ]
  },
  {
    id: 19, name: 'Statement & Conclusion', emoji: '📋', cat: 'Analytical Reasoning',
    shortcut: 'Only use given statements! No outside knowledge, no assumptions — pure logic!',
    hint: 'e.g. Statement: All dogs bark. Conclusion: Some barkers are dogs — True/False?',
    explanation: 'Statement-Conclusion mein kuch statements diye hote hain aur unse conclusion nikalna hota hai. Sirf given info use karo — duniya ka general knowledge NAHI!',
    steps: [
      'Step 1 — Statements carefully padho — har word matter karta hai',
      'Step 2 — "All", "Some", "No", "Most" — yeh quantifiers game changers hain',
      'Step 3 — Venn diagram banao based on statements',
      'Step 4 — Conclusion ko test karo: kya yeh NECESSARILY true hai?',
      'Step 5 — "Some A are B" ka conclusion "Some B are A" ALWAYS valid hai',
      'Step 6 — "All A are B" se "All B are A" NAHI niklta — one-way!',
      'Step 7 — Agar conclusion statements se nahi nikalta → Does NOT follow ✅'
    ],
    stepEgs: [
      'Statement: All dogs are animals.',
      'Key word: "All" — complete inclusion',
      'Venn: Dog circle inside Animal circle',
      'Conclusion: Some animals are dogs → Yes, necessarily true',
      'Reverse: Some dogs are animals → also true (subset)',
      'Wrong: All animals are dogs → NO! Animals circle is bigger',
      'Valid conclusions only from given statements ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'Statement: All pens are blue. Conclusion: Some blue things are pens.', steps: ['All pens ⊂ blue', 'Since pens exist in blue → some blue are pens', 'Answer: Follows ✅'] },
      { num: 2, level: 'Basic', problem: 'Statement: Some cats are white. Conclusion: All cats are white.', steps: ['Only "some" — not "all"', '"All cats are white" is not guaranteed', 'Answer: Does NOT follow ✅'] },
      { num: 3, level: 'Moderate', problem: 'Statements: All A are B. All B are C. Conclusion: All A are C.', steps: ['A ⊂ B ⊂ C → transitive', 'All A are indeed C', 'Answer: Follows ✅'] },
      { num: 4, level: 'Hard', problem: 'Statements: No fish is a bird. Some birds can swim. Conclusion: Some fish can swim.', steps: ['Fish ∩ Bird = ∅; Some birds swim', 'Fish swimming not connected to birds swimming', 'Answer: Does NOT follow (no link) ✅'] },
      { num: 5, level: 'Advanced', problem: 'Statements: Some A are B. No B is C. Conclusions: I) Some A are not C. II) No A is C.', steps: ['Some A in B, no B in C → those A in B are NOT in C', 'Conclusion I: Some A are not C → Follows ✅', 'Conclusion II: No A is C → may have A outside B that IS C', 'Answer: Only I follows ✅'] }
    ]
  },
  {
    id: 20, name: 'Syllogistic Reasoning', emoji: '🧠', cat: 'Analytical Reasoning',
    shortcut: 'All/Some/No + Venn Diagram = Syllogism solved! Learn the 4 standard forms!',
    hint: 'e.g. All A are B. All B are C. Therefore: All A are C.',
    explanation: 'Syllogism = formal logic with "All", "Some", "No" statements. 2-3 premises se valid conclusion nikalo. Venn diagram method sabse reliable hai — kabhi fail nahi hota!',
    steps: [
      'Step 1 — Saare premises (statements) note karo with their type: All/Some/No',
      'Step 2 — Venn diagram banao: "All A are B" = A circle inside B circle',
      'Step 3 — "Some A are B" = partial overlap; "No A is B" = no overlap',
      'Step 4 — Conclusions ko ek ek test karo against the diagram',
      'Step 5 — Possibility check: "Some A are B is a POSSIBILITY" ≠ "Some A are B"',
      'Step 6 — Complementary pairs: if "All A are B" false → "Some A are not B" true',
      'Step 7 — Either/Or: when individually both false but at least one must be true ✅'
    ],
    stepEgs: [
      'P1: All dogs are animals. P2: Some animals are pets.',
      'Venn: Dogs ⊂ Animals, Pets ∩ Animals (overlap)',
      'Dogs-Pets overlap NOT guaranteed',
      'C1: Some dogs are pets → NOT necessarily true',
      'C2: Some animals are dogs → TRUE (since all dogs are animals)',
      'If C1 false and C3 false but together cover all → Either/Or',
      'Valid conclusion: Some animals are dogs ✅'
    ],
    examples: [
      { num: 1, level: 'Basic', problem: 'All roses are flowers. All flowers are beautiful. Conclusion: All roses are beautiful?', steps: ['Roses ⊂ Flowers ⊂ Beautiful', 'Transitive: All roses are beautiful', 'Answer: Valid ✅'] },
      { num: 2, level: 'Basic', problem: 'No cat is a dog. All dogs are animals. Conclusion: No cat is an animal?', steps: ['Cats ∩ Dogs = ∅; Dogs ⊂ Animals', 'Cats can still be animals independently', 'Answer: Invalid (does not follow) ✅'] },
      { num: 3, level: 'Moderate', problem: 'Some pens are pencils. All pencils are stationery. Conclusion: Some pens are stationery?', steps: ['Some Pens overlap Pencils; Pencils ⊂ Stationery', 'Those overlapping pens are also stationery', 'Answer: Valid ✅'] },
      { num: 4, level: 'Hard', problem: 'All A are B. No B is C. Conclusions: I) No A is C. II) Some A are C.', steps: ['A ⊂ B; B ∩ C = ∅', 'Since A is inside B, and B has no C → A has no C', 'I: No A is C → Valid ✅', 'II: Some A are C → Invalid ❌'] },
      { num: 5, level: 'Advanced', problem: 'Some A are B. Some B are C. Conclusions: I) Some A are C. II) No A is C.', steps: ['Overlap A-B exists; overlap B-C exists', 'A-C overlap NOT guaranteed', 'I: Some A are C → may or may not be true', 'II: No A is C → may or may not be true', 'Answer: Either I or II (complementary) ✅'] }
    ]
  }
];

/* ════════════════════════════════════════════════════════════
   REASONING BASICS (extra Basics-panel content per topic)
════════════════════════════════════════════════════════════ */
const REASONING_BASICS = {
  1: { hook:'Analogy = "Samanta" — ek pair ka rishta samjho, doosre pair mein apply karo!', realLife:['🏥','Doctor:Hospital jaisa simple — workplace relationship!'], tricks:['Relationship ko sentence mein likho: "A works at B"','Reverse check: ulta bhi sense de toh sahi hai','Types yaad karo: Workplace, Tool-User, Part-Whole, Product-Material','Trap: similar-sounding ≠ correct'], funFact:'SSC mein 3-5 Analogy questions — sabse scoring!' },
  2: { hook:'Odd One Out = Among Us — 3 ek group mein, 1 imposter!', realLife:['🍎','Apple, Mango, Banana, Potato — Potato alag kyunki vegetable hai!'], tricks:['Broad category dhundho: Animal? Fruit? Number type?','Numbers: prime, even/odd, perfect square check','Letters: gap pattern (A+2=C+2=E)','Elimination: 2 same → group bana lo'], funFact:'Classification mein kabhi kabhi 2 possible answers — examiner ki intent samjho!' },
  3: { hook:'3D shapes mentally ghumao — dice: 1↔6, 2↔5, 3↔4 yaad rakho!', realLife:['🎲','Real dice uthao aur ghumao — best physical practice!'], tricks:['Opposite faces sum = 7','Cube net cross: center = bottom, top = top','Mirror = left-right flip; Water = top-bottom flip','2 faces visible → 3rd fixed'], funFact:'Dice questions har government exam mein 2-3 pakka!' },
  4: { hook:'Mental GPS: N=Up, E=Right. Har turn ke baad direction update!', realLife:['🧭','Google Maps bina chalo — directions mentally follow karo!'], tricks:['NESW clockwise: Never Eat Sour Watermelon','Left=anti-clockwise, Right=clockwise, About=180°','Distance = √(NS² + EW²)','Sunrise=East light, shadow=West'], funFact:'Direction + Blood Relation = SSC ka 5+ marks combo!' },
  5: { hook:'Complex puzzles = jigsaw. Sabse strict condition pehle lagao!', realLife:['🧩','Meeting room seating = real-life arrangement puzzle!'], tricks:['Most restrictive condition first','Linear vs Circular: circular = (n-1)!','Table/Diagram ZAROOR banao','Derived clues note karo'], funFact:'Seating arrangement = reasoning ka KING — 5-8 questions ek set se!' },
  6: { hook:'Venn Diagram = X-ray! "All A are B" = A inside B. Facts only!', realLife:['🔬','Court mein judge bhi yahi karta hai — evidence se conclusion!'], tricks:['"All A are B" = A ⊂ B','"Some A are B" = partial overlap','"No A is B" = no touch','Conclusion ALWAYS true hona chahiye'], funFact:'Syllogism = Banking ka 5 marks guaranteed!' },
  7: { hook:'ROOT CAUSE fix karo, extreme action avoid karo!', realLife:['⚖️','Road accident? Lights lagao (root cause) — cars ban mat karo!'], tricks:['Extreme = usually wrong: "ban all", "fire all"','Root cause = usually right: "investigate", "improve"','Both valid? Dono select karo','Complex? "Refer to senior" valid'], funFact:'Judgment questions Banking PO mein favourite!' },
  8: { hook:'Family tree banao! Male=□, Female=○. Update after each sentence!', realLife:['👨‍👩‍👧‍👦','Apni family se practice: Mama ka beta = Cousin!'], tricks:['Father\'s sister=Bua, Mother\'s brother=Mama','"Only son" = no siblings','Coded: A+B=father — decode step by step','"Pointing to photo" = trace from speaker'], mnemonic:'Dada=FF, Nana=MF, Chacha=FB, Mama=MB', funFact:'Blood Relations + Directions = advanced combo!' },
  9: { hook:'Criteria = checklist. Robot ban jao — mechanical check karo!', realLife:['🎯','HR bhi yahi karta hai — eligibility checklist se match!'], tricks:['Criteria list → tick/cross each','Exception clause dhundho: "refer if..."','ALL meet = Selected, ANY fail = Rejected','Borderline = check exception'], funFact:'Decision Making SBI PO aur NABARD mein favourite!' },
  10: { hook:'Figures mein elements count karo — systematic scan: top-left se start!', realLife:['👁️','Spot-the-difference games = daily practice!'], tricks:['Mirror = left-right flip; Water = top-bottom flip','Series: rotation/addition/removal pattern dhundho','Embedded: trace question figure in options','Count carefully — overlapping shapes!'], funFact:'Non-verbal = no language barrier — international exams bhi same!' },
  11: { hook:'Almost identical figures mein imposter dhundho — micro-details matter!', realLife:['🔎','Quality control mein bhi yahi hota hai — defective piece dhundho!'], tricks:['Overall shape pehle, details baad mein','Elements count karo — 1 extra/missing = answer','Rotation vs reflection — clearly differentiate','Symmetry axis compare karo'], funFact:'Discrimination SSC Tier-2 mein common topic!' },
  12: { hook:'Pattern continuation — kya badal raha hai har step mein? Track karo!', realLife:['👀','Weather patterns bhi observation se predict hote hain!'], tricks:['2 consecutive changes note karo → rule milega','Multiple patterns ek saath ho sakte hain','Cyclic patterns: after N steps, repeat','Elimination: clearly wrong options pehle hatao'], funFact:'Non-Verbal Series har reasoning section mein 3-4 questions!' },
  13: { hook:'10+ relationship types yaad karo: tool-user, part-whole, cause-effect!', realLife:['🔗','Hammer:Nail = Tool:Object — daily life mein relationships hain!'], tricks:['Sentence banao: "A is used to do B"','Degree: happy→ecstatic (intensity badhti hai)','Antonym pairs: Buy:Sell, Create:Destroy','Worker:Workplace = Doctor:Hospital type'], funFact:'Relationship-based analogies SSC mein 2-3 questions guaranteed!' },
  14: { hook:'English sentence → Math equation. "More than"=+, "Times"=×!', realLife:['🧮','Shopping mein bhi: 20% off matlab 0.8× price!'], tricks:['Let unknown = x, convert each sentence','Back-substitute from options — fastest method','Units track karo: age=years, speed=km/h','Ratio problems: assume LCM as base'], funFact:'Arithmetical reasoning Banking + SSC dono mein heavy weightage!' },
  15: { hook:'Figures ko groups mein divide karo — shape, shading, count se classify!', realLife:['🗂️','Laundry sort = real classification — whites vs colors!'], tricks:['Count elements first — easiest criteria','Shape type: curved vs straight','Shading: filled, empty, half-filled','Combination criteria for hard questions'], funFact:'Figural classification = pattern recognition — AI bhi yahi seekhta hai!' },
  16: { hook:'Differences nikalo! Constant=AP, growing=2nd diff, multiply=GP!', realLife:['🔢','Cricket score prediction bhi pattern-based hai!'], tricks:['1st diff → 2nd diff → pattern milega','×2 each time = GP, +constant = AP','Perfect squares: 1,4,9,16... cubes: 1,8,27,64...','Alternating series: odd/even positions alag'], funFact:'Number series = 4-5 questions har competitive exam mein!' },
  17: { hook:'Figure patterns: rotation + element count + position change = answer!', realLife:['🔄','Animation = frame by frame change — same concept!'], tricks:['Fix one element, track its movement','Count: additions/deletions per step','Clockwise vs anti-clockwise rotation','Cyclic: after N frames, pattern repeats'], funFact:'Non-verbal series = universal — works across all languages!' },
  18: { hook:'Secret language crack karo! Letter shift, reverse, position swap dhundho!', realLife:['🔐','Passwords bhi coding hain — letters ko numbers mein convert!'], tricks:['Letter-by-letter compare: original vs code','Position diff: A=1,B=2...Z=26','Constant shift = Caesar cipher','Reverse/swap = check word backwards'], funFact:'Coding-Decoding SSC CGL mein 3-4 questions — easy marks!' },
  19: { hook:'Sirf given statements use karo! Bahar ki knowledge = WRONG!', realLife:['📋','Newspaper headlines se conclusion — facts only, opinion nahi!'], tricks:['"All/Some/No" = game-changing quantifiers','"Some A are B" → "Some B are A" always valid','"All A are B" does NOT mean "All B are A"','Venn diagram = most reliable method'], funFact:'Statement-Conclusion Banking PO mein 5 questions ka set!' },
  20: { hook:'All/Some/No + Venn = Syllogism solved! 4 standard forms seekho!', realLife:['🧠','Lawyer arguments bhi syllogism follow karte hain — logical proof!'], tricks:['Draw ALL possible Venn diagrams','Possibility ≠ Certainty — clearly distinguish','Complementary: "All" false → "Some not" true','Either/Or = when both individually uncertain'], funFact:'Syllogism = most asked reasoning topic — master it and score 5+ marks!' }
};

/* ════════════════════════════════════════════════════════════
   REASONING — Sidebar List + Content Renderer
════════════════════════════════════════════════════════════ */

function renderReasoningList() {
  const list = document.getElementById('reasonList');
  if (!list) return;

  const categories = {};
  REASONING_TOPICS.forEach(t => {
    if (!categories[t.cat]) categories[t.cat] = [];
    categories[t.cat].push(t);
  });

  const catEmojis = { 'Verbal Reasoning':'🗣️', 'Non-Verbal Reasoning':'🎲', 'Analytical Reasoning':'🧩' };

  let html = '';
  Object.entries(categories).forEach(([cat, topics]) => {
    html += `<div class="apt-cat-header">${catEmojis[cat] || '📌'} ${cat}</div>`;
    topics.forEach(t => {
      html += `<div class="vs-item apt-item reason-item" data-id="${t.id}" title="${t.name}">
        <span class="vs-num">${t.id}</span>
        <div class="vs-name">${t.name}</div>
      </div>`;
    });
  });
  list.innerHTML = html;

  list.addEventListener('click', e => {
    const item = e.target.closest('.reason-item');
    if (!item) return;
    list.querySelectorAll('.reason-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    renderReasoningContent(parseInt(item.dataset.id));
  });
}

function renderReasoningContent(id) {
  const el = document.getElementById('reasonMain');
  if (!el) return;
  const t = REASONING_TOPICS.find(x => x.id === id);
  if (!t) return;
  const b = REASONING_BASICS[id] || {};

  function buildBasicsHTML() {
    let html = '<div class="basics-card">';
    html += `<div class="basics-hook">💬 ${b.hook || t.explanation}</div>`;
    if (b.realLife) html += `<div class="reallife-box"><span class="reallife-icon">${b.realLife[0]}</span><span>${b.realLife[1]}</span></div>`;
    if (b.tricks && b.tricks.length) {
      html += `<div><div class="basics-section-title">✨ Memory Tricks &amp; Shortcuts</div><div class="basics-tricks-list">`;
      b.tricks.forEach((tr, i) => { html += `<div class="basics-trick-item"><span class="basics-trick-num">${i + 1}</span><span>${tr}</span></div>`; });
      html += `</div></div>`;
    }
    if (b.mnemonic) html += `<div class="basics-mnemonic"><div class="basics-mnemonic-title">🧠 Mnemonic — Dil Se Yaad Karo!</div><div class="basics-mnemonic-text">${b.mnemonic}</div></div>`;
    if (b.funFact) html += `<div class="fun-fact-box"><span>💡</span><span>${b.funFact}</span></div>`;
    html += `<div style="text-align:center;font-size:0.78rem;color:var(--text-faint);padding:0.5rem 0">Click <strong style="color:var(--sci-color)">⚡ Learn Steps</strong> to start step-by-step learning, or <strong style="color:var(--sci-color)">🎯 Examples</strong> to jump to practice!</div>`;
    html += '</div>';
    return html;
  }

  const stepsHtml = t.steps.map((st, i) => {
    const eg = t.stepEgs && t.stepEgs[i];
    const egBox = eg ? `<div class="qs-eg-box"><span class="qs-eg-label">eg</span><span class="qs-eg-text">${eg}</span></div>` : '';
    const isLast = i === t.steps.length - 1;
    return `<div class="qs-step locked" data-num="${i + 1}">
      <div class="qs-left"><div class="qs-bubble">${i + 1}</div>${!isLast ? '<div class="qs-line"></div>' : ''}</div>
      <div class="qs-content"><div class="qs-rule">${st}</div>${egBox}</div>
    </div>`;
  }).join('');

  const LEVEL_CLS = { Basic:'ex-basic', Moderate:'ex-moderate', Hard:'ex-hard', Advanced:'ex-advanced' };
  const examplesHtml = (t.examples || []).map(ex => {
    const stH = ex.steps.map((s, i) => `<div class="sc-step${i === ex.steps.length - 1 ? ' hl' : ''}">${s}</div>`).join('');
    return `<div class="sc-example apt-example">
        <span class="ex-level-badge ${LEVEL_CLS[ex.level] || ''}">${ex.level}</span>
        <div class="sc-ex-head"><i class="bx bx-brain"></i>&nbsp; Example ${ex.num}</div>
        <div class="sc-ex-prob">${ex.problem}</div>
        <div class="sc-steps">${stH}</div>
      </div>`;
  }).join('');

  /* ── Practice panel HTML ── */
  function buildReasonPracticeHTML(topicId) {
    const qs = (typeof REASON_QUESTIONS !== 'undefined' && REASON_QUESTIONS[topicId]) || [];
    if (!qs.length) return '<div style="padding:2rem;text-align:center;color:var(--text-faint)">Questions loading...</div>';
    const DIFF_CLS = { Easy:'ex-basic', Medium:'ex-moderate', Hard:'ex-hard', Advanced:'ex-advanced' };
    let html = '<div class="practice-section">';
    html += '<div class="practice-header"><span>📝 Practice — 50 MCQs (Easy → Advanced)</span><button class="qs-btn primary" id="rPracToggleKey">Show Answer Key</button></div>';
    html += '<div class="practice-filters" id="rPracFilters"><button class="prac-filter-btn active" data-diff="all">All (50)</button>';
    const counts = {};
    qs.forEach(q => { counts[q.diff] = (counts[q.diff]||0)+1; });
    ['Easy','Medium','Hard','Advanced'].forEach(d => { if(counts[d]) html += `<button class="prac-filter-btn" data-diff="${d}">${d} (${counts[d]})</button>`; });
    html += '</div>';
    qs.forEach((q, i) => {
      html += `<div class="prac-q" data-diff="${q.diff}">
        <div class="prac-q-head"><span class="prac-q-num">Q${i+1}</span><span class="ex-level-badge ${DIFF_CLS[q.diff]||''}">${q.diff}</span></div>
        <div class="prac-q-text">${q.q}</div>
        <div class="prac-opts">
          <label class="prac-opt"><input type="radio" name="rPracQ${topicId}_${i}" value="A"><span class="prac-opt-label">A</span><span>${q.a}</span></label>
          <label class="prac-opt"><input type="radio" name="rPracQ${topicId}_${i}" value="B"><span class="prac-opt-label">B</span><span>${q.b}</span></label>
          <label class="prac-opt"><input type="radio" name="rPracQ${topicId}_${i}" value="C"><span class="prac-opt-label">C</span><span>${q.c}</span></label>
          <label class="prac-opt"><input type="radio" name="rPracQ${topicId}_${i}" value="D"><span class="prac-opt-label">D</span><span>${q.d}</span></label>
        </div>
        <div class="prac-ans hidden" id="rPracAns${topicId}_${i}">✅ Answer: <strong>${q.ans}</strong></div>
      </div>`;
    });
    html += '<div class="prac-answer-key hidden" id="rPracAnswerKey">';
    html += '<h3 class="prac-key-title">📋 Answer Key</h3><div class="prac-key-grid">';
    qs.forEach((q, i) => { html += `<div class="prac-key-item"><span class="prac-key-q">Q${i+1}</span><span class="prac-key-a">${q.ans}</span></div>`; });
    html += '</div></div></div>';
    return html;
  }

  window.scrollTo(0, 0);
  el.innerHTML = `
    <div class="sutra-card">
      <div class="sc-header">
        <div class="sc-header-text">
          <div class="sc-num">${t.cat} &nbsp;·&nbsp; Topic ${t.id} of 20</div>
          <div class="sc-name">${t.name}</div>
        </div>
        <div class="sc-emoji-badge">${t.emoji}</div>
      </div>
      <div class="sc-info-row"><div class="sc-shortcut" style="grid-column:1/-1"><i class="bx bx-bulb"></i><span>${t.shortcut}</span></div></div>
      <p class="sc-explanation">${t.explanation}</p>
      <div class="topic-tabs">
        <button class="topic-tab-btn active" data-panel="basics">📚 Basics</button>
        <button class="topic-tab-btn" data-panel="steps">⚡ Learn Steps</button>
        <button class="topic-tab-btn" data-panel="examples">🎯 Examples</button>
        <button class="topic-tab-btn" data-panel="practice">📝 Practice (50 Qs)</button>
      </div>
      <div class="topic-tab-panel active" data-panel="basics">${buildBasicsHTML()}</div>
      <div class="topic-tab-panel" data-panel="steps">
        <div class="sc-example sc-steps-full" id="rQsCard">
          <div class="sc-ex-head"><i class="bx bx-list-ol"></i>&nbsp; Quick Steps — Learn One by One</div>
          <div class="qs-prog-bar-wrap"><div class="qs-prog-track"><div class="qs-prog-fill" id="rQsProgFill"></div></div><span class="qs-prog-label" id="rQsProgLabel">0 / ${t.steps.length}</span></div>
          <div class="qs-wrap">${stepsHtml}</div>
          <div class="qs-done-banner" id="rQsDoneBanner">🎉 Sab steps samajh aa gaye! Ab examples dekho 👇</div>
          <div class="qs-controls">
            <button class="qs-btn primary" id="rQsPlayBtn"><i class="bx bx-play"></i> Start</button>
            <button class="qs-btn" id="rQsNextBtn" disabled><i class="bx bx-right-arrow-alt"></i> Next</button>
            <button class="qs-btn" id="rQsResetBtn"><i class="bx bx-reset"></i></button>
            <button class="qs-showall" id="rQsShowAll">Show All</button>
            <span class="qs-counter" id="rQsCounter">0 / ${t.steps.length}</span>
          </div>
        </div>
      </div>
      <div class="topic-tab-panel" data-panel="examples"><div class="apt-examples-grid">${examplesHtml}</div></div>
      <div class="topic-tab-panel" data-panel="practice">${buildReasonPracticeHTML(t.id)}</div>
    </div>`;
  window.scrollTo(0, 0);

  /* Tab switching */
  el.querySelectorAll('.topic-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.topic-tab-btn').forEach(b2 => b2.classList.remove('active'));
      el.querySelectorAll('.topic-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      el.querySelector(`.topic-tab-panel[data-panel="${btn.dataset.panel}"]`).classList.add('active');
      if (btn.dataset.panel === 'steps' && !rQsInited) initRQS();
    });
  });

  /* Quick Steps interactive */
  let rQsInited = false;
  function initRQS() {
    rQsInited = true;
    const qsSteps = [...el.querySelectorAll('.qs-step')];
    const progFill = document.getElementById('rQsProgFill');
    const progLabel = document.getElementById('rQsProgLabel');
    const playBtn = document.getElementById('rQsPlayBtn');
    const nextBtn = document.getElementById('rQsNextBtn');
    const resetBtn = document.getElementById('rQsResetBtn');
    const showAllBtn = document.getElementById('rQsShowAll');
    const counter = document.getElementById('rQsCounter');
    const banner = document.getElementById('rQsDoneBanner');
    const total = qsSteps.length;
    let current = -1, timer = null, playing = false;

    function setProgress(n) { progFill.style.width = (n/total*100)+'%'; progLabel.textContent = `${n} / ${total}`; counter.textContent = `${n} / ${total}`; }
    function applyStates(idx) { qsSteps.forEach((s,i) => { s.classList.remove('locked','active','done'); const bub = s.querySelector('.qs-bubble'); if(i<idx){s.classList.add('done');bub.textContent='✓';}else if(i===idx){s.classList.add('active');bub.textContent=s.dataset.num;}else{s.classList.add('locked');bub.textContent=s.dataset.num;} }); }
    function reveal(idx) { if(idx<0||idx>=total)return; current=idx; applyStates(idx); setProgress(idx+1); nextBtn.disabled=idx>=total-1; if(idx===total-1){stopTimer();banner.classList.add('show');playBtn.innerHTML='<i class="bx bx-check-circle"></i> Done!';playBtn.disabled=true;} }
    function stopTimer() { clearInterval(timer);timer=null;playing=false; if(current<total-1&&current>=0){playBtn.innerHTML='<i class="bx bx-play"></i> Resume';playBtn.classList.remove('paused');} }
    function startAuto() { playing=true;playBtn.innerHTML='<i class="bx bx-pause"></i> Pause';playBtn.classList.add('paused'); if(current===-1)reveal(0); timer=setInterval(()=>{if(current<total-1)reveal(current+1);else stopTimer();},1500); }
    function reset() { stopTimer();current=-1;playing=false; qsSteps.forEach(s=>{s.classList.remove('active','done');s.classList.add('locked');s.querySelector('.qs-bubble').textContent=s.dataset.num;}); banner.classList.remove('show');setProgress(0);nextBtn.disabled=true;playBtn.disabled=false;playBtn.innerHTML='<i class="bx bx-play"></i> Start';playBtn.classList.remove('paused'); }

    playBtn.addEventListener('click',()=>{if(playBtn.disabled)return;playing?stopTimer():startAuto();});
    nextBtn.addEventListener('click',()=>{stopTimer();if(current<total-1)reveal(current+1);});
    resetBtn.addEventListener('click',reset);
    showAllBtn.addEventListener('click',()=>{stopTimer();playing=false;qsSteps.forEach((s,i)=>{s.classList.remove('locked','active','done');const bub=s.querySelector('.qs-bubble');if(i<total-1){s.classList.add('done');bub.textContent='✓';}else{s.classList.add('active');bub.textContent=s.dataset.num;}});current=total-1;setProgress(total);banner.classList.add('show');nextBtn.disabled=true;playBtn.disabled=true;playBtn.innerHTML='<i class="bx bx-check-circle"></i> Done!';});
    setProgress(0);
  }

  /* ── Practice: answer key toggle ── */
  const rPracToggle = document.getElementById('rPracToggleKey');
  const rPracKey    = document.getElementById('rPracAnswerKey');
  if (rPracToggle && rPracKey) {
    rPracToggle.addEventListener('click', () => {
      const showing = !rPracKey.classList.contains('hidden');
      rPracKey.classList.toggle('hidden');
      rPracToggle.textContent = showing ? 'Show Answer Key' : 'Hide Answer Key';
      el.querySelectorAll('.prac-ans').forEach(a => showing ? a.classList.add('hidden') : a.classList.remove('hidden'));
    });
  }

  /* ── Practice: difficulty filter ── */
  const rPracFilters = document.getElementById('rPracFilters');
  if (rPracFilters) {
    rPracFilters.addEventListener('click', e => {
      const btn = e.target.closest('.prac-filter-btn');
      if (!btn) return;
      rPracFilters.querySelectorAll('.prac-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const diff = btn.dataset.diff;
      el.querySelectorAll('.prac-q').forEach(q => {
        q.style.display = (diff === 'all' || q.dataset.diff === diff) ? '' : 'none';
      });
    });
  }

  /* ── Practice: radio answer reveal ── */
  el.querySelectorAll('.prac-opt input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const name  = radio.name;
      const match = name.match(/rPracQ(\d+)_(\d+)/);
      if (!match) return;
      const ansEl = document.getElementById(`rPracAns${match[1]}_${match[2]}`);
      if (ansEl) {
        ansEl.classList.remove('hidden');
        const correct = ansEl.querySelector('strong').textContent.trim() === radio.value;
        const parent  = radio.closest('.prac-q');
        parent.querySelectorAll('.prac-opt').forEach(o => o.classList.remove('prac-correct','prac-wrong'));
        radio.closest('.prac-opt').classList.add(correct ? 'prac-correct' : 'prac-wrong');
        if (!correct) {
          const correctAns = ansEl.querySelector('strong').textContent.trim();
          parent.querySelectorAll('.prac-opt').forEach(o => {
            if (o.querySelector('.prac-opt-label').textContent === correctAns) o.classList.add('prac-correct');
          });
        }
      }
    });
  });
}

/* Initialise reasoning sidebar */
renderReasoningList();
