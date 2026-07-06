/* ═══════════════════════════════════════════════════════════
   vedic-visuals.js  —  Visual Explainers for Vedic Maths
   Reuses SVG primitives & stepAutoSvg from apt-visuals.js
═══════════════════════════════════════════════════════════ */

// ── Hand-crafted step SVGs for key Vedic sutras ────────────

// Sutra 1: Ekadhikena Purvena — squaring numbers ending in 5
const VSV1 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Check Last Digit = 5',cT,14,'700')}
    ${BOX(120,40,260,55,cP,0.2)}
    ${T(250,62,'Number:',cD,11,'400','middle',0.3)}
    ${T(250,82,'3  5',cP,22,'800','middle',0.4)}
    ${CIR(268,72,18,cA,0.5)}
    ${T(268,78,'5',cA,18,'800','middle',0.6)}
    ${LN(250,100,250,125,cG,0.7)}
    ${T(250,145,'Last digit is 5 — Sutra applies!',cG,13,'700','middle',0.8)}
    ${BOX(100,160,300,40,cA,0.9,'','Look at the last digit first')}`,
  1: ()=> `${VD}
    ${T(250,22,'Step 2: Take Remaining Digits',cT,14,'700')}
    ${BOX(60,45,180,55,cP,0.2)}
    ${T(150,68,'35',cP,22,'800','middle',0.3)}
    ${LN(250,72,290,72,cA,0.5)}
    ${BOX(300,45,140,55,cG,0.6,'Remaining','')}
    ${T(370,82,'3',cG,26,'800','middle',0.7)}
    ${T(250,135,'Remove the 5, keep what\'s before it',cD,12,'400','middle',0.9)}
    ${BOX(100,150,300,40,cA,1.0,'','n = 3 (digits before 5)')}`,
  2: ()=> `${VD}
    ${T(250,22,'Step 3: Multiply n × (n+1)',cT,14,'700')}
    ${BOX(40,50,120,55,cP,0.2,'n','3')}
    ${T(175,80,'×',cA,22,'800','middle',0.4)}
    ${BOX(200,50,120,55,cB,0.5,'n+1','4')}
    ${T(340,80,'=',cA,22,'800','middle',0.6)}
    ${BOX(370,50,100,55,cG,0.7,'Result','12')}
    ${T(250,140,'3 × 4 = 12',cG,16,'800','middle',0.9)}
    ${BOX(100,155,300,40,cA,1.0,'','This becomes the LEFT part')}`,
  3: ()=> `${VD}
    ${T(250,22,'Step 4: Append 25',cT,14,'700')}
    ${BOX(60,50,160,55,cP,0.2,'Left Part','12')}
    ${T(240,80,'+',cA,20,'800','middle',0.4)}
    ${BOX(270,50,160,55,cA,0.5,'Always','25')}
    ${LN(250,110,250,135,cG,0.7)}
    ${BOX(120,140,260,55,cG,0.8,'Answer','1225')}
    ${T(250,215,'Just stick 25 at the end!',cD,11,'400','middle',1.0)}`,
  4: ()=> `${VD}
    ${T(250,22,'Step 5: Verify',cT,14,'700')}
    ${BOX(50,45,180,50,cP,0.2,'Our Answer','1225')}
    ${T(250,75,'vs',cD,14,'600','middle',0.4)}
    ${BOX(270,45,180,50,cB,0.5,'35 × 35','1225')}
    ${T(250,125,'Both match!',cG,16,'800','middle',0.7)}
    ${BOX(100,140,300,45,cG,0.8,'','35² = 1225 ✅')}
    ${T(250,210,'Always cross-check with calculator',cD,11,'400','middle',1.0)}`,
};

// Sutra 2: Nikhilam — base method multiplication
const VSV2 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Choose the Base',cT,14,'700')}
    ${BOX(40,50,120,50,cP,0.2,'Num 1','96')}
    ${BOX(340,50,120,50,cP,0.3,'Num 2','94')}
    ${LN(170,75,200,75,cA,0.4)}
    ${LN(310,75,330,75,cA,0.4)}
    ${BOX(200,45,110,60,cA,0.5,'Base','100')}
    ${T(250,135,'Pick nearest power of 10',cD,12,'400','middle',0.7)}
    ${BOX(80,150,340,40,cG,0.8,'','Base = 10, 100, 1000...')}`,
  1: ()=> `${VD}
    ${T(250,22,'Step 2: Find Deviations',cT,14,'700')}
    ${BOX(30,50,140,55,cP,0.2,'96','dev = −4')}
    ${BOX(200,50,100,55,cA,0.4,'Base','100')}
    ${BOX(330,50,140,55,cB,0.6,'94','dev = −6')}
    ${T(100,130,'100 − 96 = 4',cP,12,'600','middle',0.7)}
    ${T(400,130,'100 − 94 = 6',cB,12,'600','middle',0.8)}
    ${BOX(80,145,340,40,cG,0.9,'','Deviation = Base − Number')}`,
  2: ()=> `${VD}
    ${T(250,22,'Step 3: Cross-Subtract for Left Part',cT,14,'700')}
    ${BOX(40,50,130,50,cP,0.2,'','96')}
    ${T(195,80,'−',cA,20,'800','middle',0.3)}
    ${BOX(220,50,80,50,cB,0.4,'dev₂','6')}
    ${T(325,80,'=',cA,20,'800','middle',0.5)}
    ${BOX(350,50,100,50,cG,0.6,'Left','90')}
    ${T(250,130,'96 − 6 = 90',cG,15,'700','middle',0.8)}
    ${BOX(80,145,340,40,cA,0.9,'','First number minus other\'s deviation')}`,
  3: ()=> `${VD}
    ${T(250,22,'Step 4: Multiply Deviations for Right',cT,14,'700')}
    ${BOX(50,50,120,50,cP,0.2,'dev₁','4')}
    ${T(195,80,'×',cA,20,'800','middle',0.3)}
    ${BOX(220,50,120,50,cB,0.4,'dev₂','6')}
    ${T(360,80,'=',cA,20,'800','middle',0.5)}
    ${BOX(380,50,80,50,cG,0.6,'Right','24')}
    ${T(250,130,'4 × 6 = 24',cG,15,'700','middle',0.8)}
    ${BOX(80,145,340,40,cA,0.9,'','Digits = number of zeros in base')}`,
  4: ()=> `${VD}
    ${T(250,22,'Step 5: Combine Left | Right',cT,14,'700')}
    ${BOX(60,50,150,55,cP,0.2,'Left','90')}
    ${T(230,80,'|',cA,28,'800','middle',0.4)}
    ${BOX(260,50,150,55,cB,0.5,'Right','24')}
    ${LN(250,110,250,135,cG,0.7)}
    ${BOX(130,140,240,55,cG,0.8,'Answer','9024')}
    ${T(250,215,'96 × 94 = 9024 ✅',cG,13,'700','middle',1.0)}`,
};

// Sutra 5: Shunyam Saamyasamuccaye — zero property
const VSV5 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Identify Equation Form',cT,14,'700')}
    ${BOX(30,50,200,50,cP,0.2,'','(x+a)(x+b)')}
    ${T(245,80,'=',cA,20,'800','middle',0.4)}
    ${BOX(270,50,200,50,cB,0.5,'','(x+c)(x+d)')}
    ${T(250,130,'Same type on both sides?',cG,13,'700','middle',0.7)}
    ${BOX(80,145,340,40,cA,0.8,'','Check if Samuccaya applies')}`,
};

// Sutra 9: Chalana-Kalanabhyam — special products
const VSV9 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Split into Parts',cT,14,'700')}
    ${BOX(30,50,200,55,cP,0.2,'Part A','Simple term')}
    ${T(245,80,'+',cA,20,'800','middle',0.4)}
    ${BOX(270,50,200,55,cB,0.5,'Part B','Complex term')}
    ${T(250,135,'Break the expression into manageable parts',cD,12,'400','middle',0.7)}
    ${BOX(80,150,340,40,cG,0.8,'','Handle each part with the right sutra')}`,
};

// Map sutra IDs to hand-crafted step SVGs
const VSTEP_SVG = {
  1: VSV1,
  2: VSV2,
  5: VSV5,
  9: VSV9
};

// ── Get step SVG (hand-crafted or auto-generated) ─────────
function getVedicStepSvg(tid, si, text, eg, total) {
  const fn = VSTEP_SVG[tid] && VSTEP_SVG[tid][si];
  return fn ? fn() : stepAutoSvg(text, eg, si + 1, total);
}

// ── Build step visual section for Vedic Maths ─────────────
function buildVedicStepVisualSection(t) {
  if (!t.steps || !t.steps.length) return '';
  const n = t.steps.length;

  const svgs = t.steps.map((s, i) => `<div class="svb-step${i === 0 ? ' active' : ''}" data-step="${i}"><svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">${getVedicStepSvg(t.id, i, s, t.stepEgs && t.stepEgs[i], n)}</svg></div>`).join('');

  const txts = t.steps.map((s, i) => `<div class="svb-step-text${i === 0 ? ' active' : ''}" data-step="${i}"><div class="svb-num">Step ${i + 1}</div><div class="svb-rule">${s}</div>${t.stepEgs && t.stepEgs[i] ? `<div class="svb-eg">💡 ${t.stepEgs[i]}</div>` : ''}</div>`).join('');

  const dots = t.steps.map((_, i) => `<div class="svb-dot${i === 0 ? ' active' : ''}" data-step="${i}"></div>`).join('');

  return `<div class="svb-wrapper">
  <div class="svb-header"><span class="svb-icon">${t.emoji}</span><div class="svb-title">Step-by-Step Visual Explanation</div><div class="svb-counter">Step <span class="svb-curr">1</span> of ${n}</div></div>
  <div class="svb-dots">${dots}</div>
  <div class="svb-display">${svgs}</div>
  <div class="svb-text">${txts}</div>
  <div class="svb-controls"><button class="svb-btn svb-prev" disabled>← Previous</button><button class="svb-btn primary svb-next"${n <= 1 ? ' disabled' : ''}>Next Step →</button></div>
</div><hr class="svb-divider"/>`;
}

// ── Main export function ──────────────────────────────────
function buildVedicVisualHTML(t) {
  const stepSection = buildVedicStepVisualSection(t);
  return stepSection || `<div style="padding:2rem;text-align:center;color:var(--text-faint);font-size:0.85rem">Visual coming soon for ${t.name}.</div>`;
}
