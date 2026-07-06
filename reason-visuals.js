/* ═══════════════════════════════════════════════════════════
   reason-visuals.js  —  Visual Explainers for Reasoning Module
   Reuses step visual builder from apt-visuals.js
═══════════════════════════════════════════════════════════ */

// ── Hand-crafted step SVGs for key reasoning topics ────────

// Topic 1: Analogies — word pair relationship visual
const RSV1 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Read the Word Pair',cT,14,'700')}
    ${BOX(40,40,180,70,cP,0.2,'Given Pair','')}
    ${T(130,82,'Doctor : Hospital',cP,16,'800','middle',0.4)}
    ${LN(230,75,270,75,cA,0.5)}
    ${BOX(280,40,180,70,cB,0.6,'Find Pair','')}
    ${T(370,82,'Teacher : ?',cB,16,'800','middle',0.8)}
    ${T(250,145,'Read both pairs carefully',cD,11,'400','middle',0.9)}
    ${BOX(100,160,300,45,cG,1.0,'','Identify the pattern')}`,
  1: ()=> `${VD}
    ${T(250,22,'Step 2: Identify Relationship',cT,14,'700')}
    ${BOX(30,45,140,55,cP,0.2,'Word A','Doctor')}
    ${LN(175,72,220,72,cA,0.4)}
    ${BOX(225,45,50,55,cA,0.5,'','→')}
    ${LN(280,72,325,72,cA,0.6)}
    ${BOX(330,45,140,55,cG,0.7,'Word B','Hospital')}
    ${T(250,130,'"works in"',cA,18,'800','middle',0.9)}
    ${BOX(120,145,260,40,cA,1.0,'','A works in B')}
    ${T(250,210,'Find the exact connection',cD,11,'400','middle',1.1)}`,
  2: ()=> `${VD}
    ${T(250,22,'Step 3: Frame as Sentence',cT,14,'700')}
    ${BOX(50,45,400,50,cP,0.2)}
    ${T(250,75,'"A is the workplace of B"',cP,15,'700','middle',0.4)}
    ${LN(250,100,250,120,cA,0.5)}
    ${BOX(50,125,400,50,cG,0.6)}
    ${T(250,155,'General Rule: Person → Place',cG,14,'700','middle',0.8)}
    ${T(250,200,'This sentence becomes your template',cD,11,'400','middle',1.0)}`,
  3: ()=> `${VD}
    ${T(250,22,'Step 4: Apply to New Pair',cT,14,'700')}
    ${BOX(50,45,180,55,cP,0.2,'Template','"A works in B"')}
    ${LN(240,72,260,72,cA,0.4)}
    ${BOX(270,45,180,55,cB,0.5,'Apply','Teacher → ?')}
    ${LN(360,105,360,125,cG,0.6)}
    ${BOX(270,130,180,55,cG,0.7,'Answer','School')}
    ${T(250,210,'Teacher works in School ✅',cG,13,'700','middle',0.9)}`,
  4: ()=> `${VD}
    ${T(250,22,'Step 5: Check All Options',cT,14,'700')}
    ${BOX(30,50,100,40,cG,0.2,'A','School ✅')}
    ${BOX(140,50,100,40,cR,0.3,'B','Book ✗')}
    ${BOX(250,50,100,40,cR,0.4,'C','Student ✗')}
    ${BOX(360,50,100,40,cR,0.5,'D','Pen ✗')}
    ${LN(80,95,80,115,cG,0.6)}
    ${BOX(30,120,100,40,cG,0.7,'','Place ✅')}
    ${T(250,190,'Only "School" fits the workplace relationship',cD,11,'400','middle',0.9)}`,
  5: ()=> `${VD}
    ${T(250,22,'Step 6: Avoid Traps',cT,14,'700')}
    ${BOX(30,50,200,55,cR,0.2,'Trap Option','Teacher : Student')}
    ${T(130,130,'Related but WRONG type!',cR,12,'700','middle',0.4)}
    ${BOX(270,50,200,55,cG,0.5,'Correct','Teacher : School')}
    ${T(370,130,'Same relationship type ✅',cG,12,'700','middle',0.7)}
    ${T(250,170,'Trap options sound right but use a different relationship',cD,11,'400','middle',0.9)}
    ${BOX(100,185,300,25,cA,1.0,'','Always match relationship TYPE')}`,
  6: ()=> `${VD}
    ${T(250,22,'Step 7: Reverse Check',cT,14,'700')}
    ${BOX(50,45,170,55,cP,0.2,'Forward','Doctor → Hospital')}
    ${LN(230,72,270,72,cA,0.4)}
    ${BOX(280,45,170,55,cG,0.5,'Reverse','Hospital → Doctor')}
    ${T(250,125,'Both directions make sense? ✅',cG,13,'700','middle',0.7)}
    ${LN(250,135,250,155,cA,0.8)}
    ${BOX(100,160,300,45,cG,0.9,'','Answer Confirmed!')}`,
};

// Topic 4: Directions — compass-based visual
const RSV4 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Draw Direction Map',cT,14,'700')}
    ${CIR(250,125,60,cP,0.2)}
    ${T(250,55,'N',cA,14,'800','middle',0.3)}
    ${T(250,205,'S',cA,14,'800','middle',0.4)}
    ${T(160,130,'W',cA,14,'800','middle',0.5)}
    ${T(340,130,'E',cA,14,'800','middle',0.6)}
    ${LN(250,70,250,180,cD,0.3,1)}
    ${LN(175,125,325,125,cD,0.4,1)}
    ${T(250,215,'Always start with a compass',cD,11,'400','middle',0.8)}`,
  1: ()=> `${VD}
    ${T(250,22,'Step 2: Mark Starting Point',cT,14,'700')}
    ${CIR(250,120,5,cG,0.2)}
    ${T(250,145,'START',cG,12,'700','middle',0.4)}
    ${BOX(50,160,400,40,cP,0.6,'','Mark where the person begins')}
    ${T(250,55,'N',cD,12,'600','middle',0.3)}
    ${T(250,200,'S',cD,12,'600','middle',0.3)}
    ${T(160,125,'W',cD,12,'600','middle',0.3)}
    ${T(340,125,'E',cD,12,'600','middle',0.3)}`,
  2: ()=> `${VD}
    ${T(250,22,'Step 3: Trace Each Turn',cT,14,'700')}
    ${CIR(150,110,5,cG,0.2)}
    ${T(150,135,'Start',cG,10,'600','middle',0.3)}
    ${LN(150,110,150,60,cP,0.4)}
    ${T(165,85,'North 5km',cP,10,'600','start',0.5)}
    ${LN(150,60,250,60,cA,0.6)}
    ${T(200,50,'East 3km',cA,10,'600','middle',0.7)}
    ${LN(250,60,250,110,cB,0.8)}
    ${T(265,85,'South 5km',cB,10,'600','start',0.9)}
    ${CIR(250,110,5,cR,1.0)}
    ${T(250,135,'End',cR,10,'600','middle',1.1)}
    ${BOX(70,155,360,40,cG,1.2,'','Draw arrows for each movement')}`,
};

// Topic 5: Blood Relations — family tree visual
const RSV5 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Find Main Person',cT,14,'700')}
    ${CIR(250,90,30,cA,0.2)}
    ${T(250,95,'?',cA,22,'800','middle',0.4)}
    ${T(250,140,'Main Person',cA,13,'700','middle',0.5)}
    ${BOX(80,160,340,45,cP,0.6,'','Who is the question about?')}`,
  1: ()=> `${VD}
    ${T(250,22,'Step 2: Decode Relationships',cT,14,'700')}
    ${BOX(30,45,130,40,cP,0.2,'','Father')}
    ${LN(165,65,195,65,cA,0.3)}
    ${BOX(200,45,100,40,cA,0.4,'','of')}
    ${LN(305,65,335,65,cA,0.5)}
    ${BOX(340,45,130,40,cG,0.6,'','Mother')}
    ${LN(250,90,250,110,cD,0.7)}
    ${BOX(150,115,200,40,cG,0.8,'','= Grandfather')}
    ${T(250,180,'Break complex chains into simple pairs',cD,11,'400','middle',1.0)}
    ${BOX(80,190,340,25,cA,1.1,'','Father of Mother = Maternal Grandfather')}`,
};

// Topic 7: Coding-Decoding — letter shift visual
const RSV7 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Write Letter Positions',cT,14,'700')}
    ${BOX(20,45,55,40,cP,0.1,'','A=1')} ${BOX(80,45,55,40,cP,0.15,'','B=2')}
    ${BOX(140,45,55,40,cP,0.2,'','C=3')} ${BOX(200,45,55,40,cP,0.25,'','D=4')}
    ${BOX(260,45,55,40,cA,0.3,'','...')}
    ${BOX(320,45,55,40,cP,0.35,'','Y=25')} ${BOX(380,45,55,40,cP,0.4,'','Z=26')}
    ${T(250,115,'A=1, B=2, C=3 ... Z=26',cA,13,'700','middle',0.6)}
    ${BOX(80,130,340,40,cG,0.7,'','Know position of each letter')}
    ${T(250,200,'This is the foundation of coding',cD,11,'400','middle',0.9)}`,
  1: ()=> `${VD}
    ${T(250,22,'Step 2: Find the Pattern',cT,14,'700')}
    ${BOX(30,50,100,45,cP,0.2,'Code','CAT')}
    ${LN(135,72,165,72,cA,0.3)}
    ${BOX(170,50,100,45,cG,0.4,'Coded','FDW')}
    ${T(250,120,'C→F (+3)  A→D (+3)  T→W (+3)',cA,13,'700','middle',0.6)}
    ${BOX(100,135,300,40,cA,0.7,'','Pattern: Each letter +3')}
    ${T(250,200,'Compare each letter to find shift',cD,11,'400','middle',0.9)}`,
};

// Topic 10: Number Series — pattern visual
const RSV10 = {
  0: ()=> `${VD}
    ${T(250,22,'Step 1: Write the Series',cT,14,'700')}
    ${BOX(20,50,75,45,cP,0.1,'','2')} ${BOX(105,50,75,45,cP,0.2,'','5')}
    ${BOX(190,50,75,45,cP,0.3,'','10')} ${BOX(275,50,75,45,cP,0.4,'','17')}
    ${BOX(360,50,75,45,cA,0.5,'','?')}
    ${LN(60,100,60,120,cG,0.6)} ${LN(142,100,142,120,cG,0.65)}
    ${LN(227,100,227,120,cG,0.7)} ${LN(312,100,312,120,cG,0.75)}
    ${T(60,135,'+3',cG,12,'700','middle',0.8)}
    ${T(142,135,'+5',cG,12,'700','middle',0.85)}
    ${T(227,135,'+7',cG,12,'700','middle',0.9)}
    ${T(312,135,'+9',cG,12,'700','middle',0.95)}
    ${BOX(80,150,340,40,cA,1.0,'','Find differences between terms')}
    ${T(250,215,'Answer: 17 + 9 = 26',cG,13,'700','middle',1.1)}`,
};

// Map topic IDs to hand-crafted step SVG functions
const RSTEP_SVG = {
  1: RSV1,
  4: RSV4,
  5: RSV5,
  7: RSV7,
  10: RSV10
};

// ── Get step SVG (hand-crafted or auto-generated) ─────────
function getReasonStepSvg(tid, si, text, eg, total) {
  const fn = RSTEP_SVG[tid] && RSTEP_SVG[tid][si];
  return fn ? fn() : stepAutoSvg(text, eg, si + 1, total);
}

// ── Build step visual section for reasoning ───────────────
function buildReasonStepVisualSection(t) {
  if (!t.steps || !t.steps.length) return '';
  const n = t.steps.length;

  const svgs = t.steps.map((s, i) => `<div class="svb-step${i === 0 ? ' active' : ''}" data-step="${i}"><svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">${getReasonStepSvg(t.id, i, s, t.stepEgs && t.stepEgs[i], n)}</svg></div>`).join('');

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
function buildReasonVisualHTML(t) {
  const stepSection = buildReasonStepVisualSection(t);
  return stepSection || `<div style="padding:2rem;text-align:center;color:var(--text-faint);font-size:0.85rem">Visual coming soon for ${t.name}.</div>`;
}
