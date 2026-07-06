/* ═══════════════════════════════════════════════════════════
   apt-visuals.js  —  Professional SVG Visual Explainers
   Design system: thin strokes · 10% fills · 3-color max
═══════════════════════════════════════════════════════════ */

// ── Design tokens ──────────────────────────────────────────
const cP = '#818cf8'; // indigo   — primary / structural
const cG = '#34d399'; // emerald  — results / answers
const cA = '#fbbf24'; // amber    — key values / highlight
const cR = '#fb7185'; // rose     — loss / warning
const cB = '#38bdf8'; // sky      — secondary comparison
const cT = 'rgba(255,255,255,0.88)';  // main text
const cD = 'rgba(255,255,255,0.40)';  // dim/label text
const cS = 'rgba(255,255,255,0.10)';  // structural stroke

// Shared SVG defs (minimal — no heavy gradients)
const VD = `<defs>
  <filter id="sd"><feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="rgba(0,0,0,0.4)"/></filter>
  <filter id="gw"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.3)"/>
  </marker>
</defs>`;

// ── Primitive helpers ───────────────────────────────────────

// Fade-in SVG text
function T(x,y,s,fill,size,wt,anc='middle',d=0.5) {
  return `<text x="${x}" y="${y}" text-anchor="${anc}" fill="${fill}" font-size="${size}" font-weight="${wt}" font-family="'Inter','Segoe UI',Arial,sans-serif" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${d}s" fill="freeze"/>${s}</text>`;
}

// Professional box: thin stroke, ~10% fill
function BOX(x,y,w,h,c,d=0.1,lbl='',val='') {
  const mx=x+w/2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${c}" fill-opacity="0.10" stroke="${c}" stroke-opacity="0.40" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${d}s" fill="freeze"/></rect>
  ${lbl ? T(mx, y+h*.40, lbl, cD, 10, '400', 'middle', d+.08) : ''}
  ${val ? T(mx, y+h*.76, val, c,  20, '800', 'middle', d+.10) : ''}`;
}

// Animated line (draws in via stroke-dashoffset)
function LN(x1,y1,x2,y2,c,d,sw=1.5) {
  const len=Math.ceil(Math.hypot(x2-x1,y2-y1));
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"><animate attributeName="stroke-dashoffset" from="${len}" to="0" dur="0.45s" begin="${d}s" fill="freeze"/></line>`;
}

// Animated bar chart bar (grows upward)
function BAR(x,yB,w,h,c,d,val='') {
  return `<rect x="${x}" y="${yB}" width="${w}" height="0" rx="3" fill="${c}" fill-opacity="0.75"><animate attributeName="height" from="0" to="${h}" dur="0.6s" begin="${d}s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1.2"/><animate attributeName="y" from="${yB}" to="${yB-h}" dur="0.6s" begin="${d}s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1.2"/></rect>
  ${val ? T(x+w/2, yB-h-8, val, c, 11, '700', 'middle', d+.55) : ''}`;
}

// Animated circle draw
function CIR(cx,cy,r,c,d,sw=2,fill='none') {
  const ci=Math.round(2*Math.PI*r);
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" fill-opacity="0.08" stroke="${c}" stroke-opacity="0.45" stroke-width="${sw}" stroke-dasharray="${ci}" stroke-dashoffset="${ci}"><animate attributeName="stroke-dashoffset" from="${ci}" to="0" dur="0.9s" begin="${d}s" fill="freeze"/></circle>`;
}

// Dot / point highlight
function DOT(cx,cy,c,d,r=5) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" filter="url(#gw)" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${d}s" fill="freeze"/></circle>`;
}

// Clean chart axis
function AXIS(x0,y0,w,h) {
  const s='rgba(255,255,255,0.18)';
  return `<line x1="${x0}" y1="${y0+h}" x2="${x0+w+8}" y2="${y0+h}" stroke="${s}" stroke-width="1.5"/><line x1="${x0}" y1="${y0-6}" x2="${x0}" y2="${y0+h}" stroke="${s}" stroke-width="1.5"/>`;
}

// Subtle grid lines
function GRID(x0,y0,w,h,cols=5,rows=4) {
  const c='rgba(255,255,255,0.04)';
  return [
    ...Array.from({length:cols-1},(_,i)=>`<line x1="${x0+(i+1)*w/cols}" y1="${y0}" x2="${x0+(i+1)*w/cols}" y2="${y0+h}" stroke="${c}" stroke-width="1"/>`),
    ...Array.from({length:rows-1},(_,j)=>`<line x1="${x0}" y1="${y0+(j+1)*h/rows}" x2="${x0+w}" y2="${y0+(j+1)*h/rows}" stroke="${c}" stroke-width="1"/>`)
  ].join('');
}

// ── Card wrapper ────────────────────────────────────────────
function vc(icon,title,sub,svg,pills=[],note='') {
  const p=pills.map(([t,c=''])=>`<div class="vis-fml ${c}">${t}</div>`).join('');
  return `<div class="vis-wrapper"><div class="vis-card">
    <div class="vis-hdr"><span class="vis-icon">${icon}</span><div><div class="vis-name">${title}</div><div class="vis-sub">${sub}</div></div></div>
    <div class="vis-body"><svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">${VD}${svg}</svg></div>
    ${p?`<div class="vis-fmls">${p}</div>`:''}
    ${note?`<div class="vis-note">💡 ${note}</div>`:''}
  </div></div>`;
}

// ═══════════════════════════════════════════════════════════
//  TOPIC VISUALS  1 → 34
// ═══════════════════════════════════════════════════════════
const VISUALS = {

/* ── 1. Whole Numbers ── */
1:()=>vc('🔢','Whole Numbers','Number line — jump arc visualisation',`
  <!-- axis -->
  <line x1="30" y1="110" x2="470" y2="110" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <polygon points="470,107 478,110 470,113" fill="rgba(255,255,255,0.2)"/>
  ${Array.from({length:11},(_,n)=>`
    <line x1="${30+n*44}" y1="105" x2="${30+n*44}" y2="115" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
    ${T(30+n*44,130,n,cD,12,'400','middle',0.05+n*0.03)}
  `).join('')}
  <!-- jump arc 3 → 3+5 = 8 -->
  <path d="M 162,110 Q 272,50 382,110" fill="none" stroke="${cP}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="260" stroke-dashoffset="260"><animate attributeName="stroke-dashoffset" from="260" to="0" dur="0.7s" begin="0.4s" fill="freeze"/></path>
  ${DOT(162,110,cP,0.3)}
  ${DOT(382,110,cG,1.1)}
  ${T(162,100,'3',cP,15,'700','middle',0.4)}
  ${T(272,62,'+5',cA,14,'700','middle',0.8)}
  ${T(382,100,'= 8',cG,18,'800','middle',1.2)}
  <!-- commutative -->
  ${T(250,165,'Commutative: a+b = b+a   |   Associative: (a+b)+c = a+(b+c)',cD,11,'400','middle',1.5)}
`,[['a + b = b + a',''],['(a+b)+c = a+(b+c)',''],['a×(b+c) = ab+ac','res']]),

/* ── 2. Decimals ── */
2:()=>vc('🔣','Decimals','Place value chart',`
  <!-- column backgrounds -->
  ${[['Hundreds',62,cP],['Tens',140,cP],['Units',218,cP],['·',265,'rgba(255,255,255,0.3)'],['Tenths',315,cB],['Hundredths',393,cB]].map(([name,cx,c],i)=>`
    <rect x="${cx-32}" y="40" width="62" height="90" rx="8" fill="${c}" fill-opacity="${name==='·'?0.08:0.07}" stroke="${c}" stroke-opacity="0.3" stroke-width="1.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="${0.08*i}s" fill="freeze"/></rect>
    ${T(cx, 82, name==='·'?'•':name.slice(0,1).toUpperCase(), c, name==='·'?28:22, '800','middle',0.1+i*0.08)}
    ${T(cx,118, name,'rgba(255,255,255,0.35)',9,'400','middle',0.15+i*0.08)}
  `).join('')}
  <!-- sample number overlay -->
  ${T(250,27,'Example:  1  2  3  ·  4  5',cD,12,'400','middle',0.1)}
  <!-- divide line -->
  <line x1="248" y1="38" x2="248" y2="135" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="4,3"/>
  ${T(155,155,'Integer part',cD,10,'400','middle',0.6)}
  ${T(355,155,'Decimal part',cD,10,'400','middle',0.6)}
  ${T(250,195,'× 10 moves point right  |  ÷ 10 moves point left',cD,11,'400','middle',1)}
`,[['0.1 = 1/10',''],['0.01 = 1/100',''],['0.001 = 1/1000',''],['Trailing zeros do not change value','key']]),

/* ── 3. Fractions ── */
3:()=>vc('🍕','Fractions','Pie chart + bar model',`
  <!-- Pie 3/4 -->
  ${CIR(110,108,78,cP,0.1,2)}
  <!-- 3/4 sector fill -->
  <path d="M110,108 L110,30 A78,78 0 1,1 57.8,147 Z" fill="${cP}" fill-opacity="0.18" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="0.3s" fill="freeze"/></path>
  <path d="M110,108 L57.8,147 A78,78 0 0,1 110,30 Z" fill="${cS}" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.8s" fill="freeze"/></path>
  ${T(108,100,'3',cP,22,'800','middle',0.5)}
  ${T(108,124,'4',cP,22,'800','middle',0.5)}
  <line x1="90" y1="112" x2="128" y2="112" stroke="${cP}" stroke-opacity="0.5" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.5s" fill="freeze"/></line>
  ${T(110,195,'¾ of the circle is shaded',cD,10,'400','middle',1)}
  <!-- Bar model 3/5 -->
  ${T(330,28,'Bar Model: 3 / 5',cD,11,'600','middle',0.2)}
  ${[0,1,2,3,4].map((i)=>`
    <rect x="${225+i*50}" y="45" width="46" height="70" rx="6" fill="${i<3?cP:'rgba(255,255,255,0.06)'}" fill-opacity="${i<3?0.22:1}" stroke="${i<3?cP:'rgba(255,255,255,0.1)'}" stroke-opacity="0.4" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${0.2+i*0.1}s" fill="freeze"/></rect>
    ${i<3?T(248+i*50,85,'✓',cP,14,'700','middle',0.5+i*0.1):''}
  `).join('')}
  ${T(330,135,'3 of 5 parts shaded',cD,10,'400','middle',1)}
  <!-- types -->
  ${T(225,170,'Proper: a<b',cP,11,'600','start',1.2)}
  ${T(330,170,'Improper: a>b',cA,11,'600','middle',1.2)}
  ${T(435,170,'Mixed: n a/b',cG,11,'600','end',1.2)}
`,[['a/b + c/d = (ad+bc)/bd',''],['a/b × c/d = ac/bd',''],['a/b ÷ c/d = ad/bc','res']],'Simplify by dividing top & bottom by HCF.'),

/* ── 4. HCF & LCM ── */
4:()=>vc('🔵','HCF & LCM','Venn diagram of common factors',`
  ${CIR(175,108,82,cP,0.1,2)}
  ${CIR(325,108,82,cG,0.3,2)}
  <!-- fills -->
  <circle cx="175" cy="108" r="82" fill="${cP}" fill-opacity="0.09" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.7s" fill="freeze"/></circle>
  <circle cx="325" cy="108" r="82" fill="${cG}" fill-opacity="0.09" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.8s" fill="freeze"/></circle>
  <!-- labels inside -->
  ${T(140,90,'Factors of',cD,9,'400','middle',0.8)}
  ${T(140,104,'12',cP,22,'800','middle',0.9)}
  ${T(140,124,'1, 2, 3, 4, 6',cD,9,'400','middle',1)}
  ${T(360,90,'Factors of',cD,9,'400','middle',0.8)}
  ${T(360,104,'18',cG,22,'800','middle',0.9)}
  ${T(360,124,'9, 18',cD,9,'400','middle',1)}
  <!-- intersection -->
  <rect x="218" y="78" width="64" height="60" rx="8" fill="${cA}" fill-opacity="0.14" stroke="${cA}" stroke-opacity="0.35" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1s" fill="freeze"/></rect>
  ${T(250,97,'HCF',cD,9,'600','middle',1.1)}
  ${T(250,121,'6',cA,26,'900','middle',1.1)}
  <!-- set labels -->
  ${T(100,28,'Set A (12)',cP,11,'600','middle',0.5)}
  ${T(400,28,'Set B (18)',cG,11,'600','middle',0.5)}
  ${T(250,200,'LCM(12,18) = 2² × 3² =',cD,11,'400','middle',1.4)}
  ${T(420,200,'36',cA,14,'800','middle',1.4)}
`,[['HCF × LCM = a × b','key'],['LCM = ab / HCF',''],['Use prime factorisation','res']],'HCF = Largest common divisor. LCM = Smallest common multiple.'),

/* ── 5. Profit & Loss ── */
5:()=>vc('💰','Profit & Loss','Bar chart — CP vs SP comparison',`
  ${AXIS(35,22,430,160)} ${GRID(35,22,430,160,5,4)}
  <!-- scenario labels -->
  ${T(130,18,'PROFIT',cG,11,'700','middle',0.1)}
  ${T(370,18,'LOSS',cR,11,'700','middle',0.1)}
  <line x1="250" y1="14" x2="250" y2="188" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="5,4"/>
  <!-- CP1 -->
  ${BAR(60,182,55,100,cP,0.1,'CP')}
  <!-- SP1 profit -->
  ${BAR(130,182,55,130,cG,0.3,'SP')}
  <!-- profit bracket -->
  ${LN(185,52,185,100,cA,0.9,1.5)}
  ${LN(130,100,185,100,cA,0.9,1)}
  ${T(210,76,'Profit',cA,10,'600','start',1.1)}
  ${T(210,90,'+30',cA,13,'800','start',1.1)}
  <!-- CP2 -->
  ${BAR(285,182,55,100,cP,0.5,'CP')}
  <!-- SP2 loss -->
  ${BAR(355,182,55,70,cR,0.7,'SP')}
  ${LN(410,112,410,182,cR,1.1,1.5)}
  ${LN(355,112,410,112,cR,1.1,1)}
  ${T(432,148,'Loss',cR,10,'600','start',1.2)}
  ${T(432,162,'−30',cR,13,'800','start',1.2)}
  ${T(250,200,'Bars: CP = Cost Price  |  SP = Selling Price',cD,10,'400','middle',1.5)}
`,[['Profit% = (P/CP)×100','res'],['SP = CP(1+P%/100)',''],['Loss% = (L/CP)×100',''],['CP = SP/(1−L%/100)','key']],'Percentage always calculated on Cost Price.'),

/* ── 6. Discount ── */
6:()=>vc('🏷️','Discount','Marked Price → Discount → SP',`
  <!-- MP full bar -->
  <rect x="30" y="55" width="440" height="50" rx="9" fill="${cP}" fill-opacity="0.10" stroke="${cP}" stroke-opacity="0.35" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.1s" fill="freeze"/></rect>
  ${T(250,82,'Marked Price (MP) = ₹500',cT,13,'600','middle',0.3)}
  <!-- SP bar -->
  <rect x="30" y="122" width="0" height="50" rx="9" fill="${cG}" fill-opacity="0.75"><animate attributeName="width" from="0" to="330" dur="0.7s" begin="0.5s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1.2"/></rect>
  ${T(195,153,'SP = ₹375',cT,13,'600','middle',1.1)}
  <!-- Discount bar -->
  <rect x="360" y="122" width="0" height="50" rx="9" fill="${cR}" fill-opacity="0.65"><animate attributeName="width" from="0" to="110" dur="0.5s" begin="1s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1.2"/></rect>
  ${T(415,153,'Disc ₹125',cT,12,'600','middle',1.4)}
  <!-- bracket -->
  ${LN(30,185,360,185,cA,1.2,1.5)}
  ${LN(360,175,360,185,cA,1.2,1)}
  ${LN(30,175,30,185,cA,1.2,1)}
  ${T(195,200,'SP',cA,10,'600','middle',1.4)}
  ${T(415,185,'← Discount →',cD,9,'400','middle',1.5)}
  ${T(250,25,'Disc% = 125/500 × 100 =',cD,12,'400','middle',1.5)}
  ${T(420,25,'25%',cA,16,'800','middle',1.6)}
`,[['Discount = MP − SP',''],['Disc% = (Disc/MP)×100','key'],['SP = MP×(1−d/100)','res']],'Discount % is always on Marked Price, never on CP.'),

/* ── 7. Partnership ── */
7:()=>vc('🤝','Partnership','Profit split proportional to capital × time',`
  <!-- Pie: A=3 parts, B=2 parts (total 5) -->
  <!-- A sector: 216° (3/5) -->
  <path d="M250,108 L250,28 A80,80 0 1,1 202.1,169.8 Z" fill="${cP}" fill-opacity="0.18" stroke="${cP}" stroke-opacity="0.4" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.2s" fill="freeze"/></path>
  <!-- B sector: 144° (2/5) -->
  <path d="M250,108 L202.1,169.8 A80,80 0 0,1 250,28 Z" fill="${cB}" fill-opacity="0.18" stroke="${cB}" stroke-opacity="0.4" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.4s" fill="freeze"/></path>
  ${DOT(250,108,cA,0.1,4)}
  ${T(230,80,'A',cP,18,'800','middle',0.7)}
  ${T(230,98,'60%',cP,12,'600','middle',0.8)}
  ${T(270,148,'B',cB,18,'800','middle',0.7)}
  ${T(270,165,'40%',cB,12,'600','middle',0.8)}
  <!-- legend -->
  <rect x="360" y="55" width="12" height="12" rx="2" fill="${cP}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.8s" fill="freeze"/></rect>
  ${T(378,65,'A  invested ₹60,000',cT,11,'400','start',0.9)}
  <rect x="360" y="78" width="12" height="12" rx="2" fill="${cB}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.9s" fill="freeze"/></rect>
  ${T(378,88,'B  invested ₹40,000',cT,11,'400','start',1.0)}
  ${T(420,115,'Ratio  3 : 2',cD,11,'500','middle',1.1)}
  ${T(420,140,'Profit = ₹50,000',cD,11,'400','middle',1.2)}
  ${T(420,162,'A gets  ₹30,000',cG,12,'700','middle',1.3)}
  ${T(420,180,'B gets  ₹20,000',cG,12,'700','middle',1.4)}
`,[['Ratio = Cap_A×T_A : Cap_B×T_B','key'],['Share = own_ratio/total × Profit',''],['For equal time: ratio = capitals','res']],'Multiply capital × months for unequal time periods.'),

/* ── 8. Mixture & Alligation ── */
8:()=>vc('⚗️','Alligation','Cross method — find mixing ratio',`
  <!-- Cheaper box: x=30,y=30,w=130,h=55 → right=160, bottom=85 -->
  ${BOX(30,30,130,55,cP,0.1,'Cheaper (A)','20')}
  <!-- Dearer box: x=340,y=30,w=130,h=55 → left=340, bottom=85 -->
  ${BOX(340,30,130,55,cR,0.3,'Dearer (B)','50')}
  <!-- Mean box: x=185,y=90,w=130,h=55 → left=185,right=315,top=90,bottom=145 -->
  ${BOX(185,90,130,55,cA,0.5,'Mean Price','35')}
  <!-- Cross lines: A bottom-right(160,85)→Mean top-left(185,90) -->
  ${LN(160,85,185,90,cD,0.8,1.5)}
  <!-- Cross lines: B bottom-left(340,85)→Mean top-right(315,90) -->
  ${LN(340,85,315,90,cD,0.9,1.5)}
  <!-- Result lines: Mean bottom-left(185,145)→ResultA top-center(95,170) -->
  ${LN(185,145,95,170,cG,1.1,1.5)}
  <!-- Result lines: Mean bottom-right(315,145)→ResultB top-center(405,170) -->
  ${LN(315,145,405,170,cG,1.2,1.5)}
  <!-- Difference result boxes: ResultA top-center=95=(30+130/2), ResultB top-center=405=(340+130/2) -->
  ${BOX(30,170,130,40,cG,1.3,'50 − 35 = qty of A','15')}
  ${BOX(340,170,130,40,cG,1.4,'35 − 20 = qty of B','15')}
  ${T(250,215,'Ratio  A : B  =  15 : 15  =  1 : 1',cD,11,'500','middle',1.7)}
`,[['qty_A/qty_B = (D−M)/(M−C)','key'],['Subtract diagonally in the cross',''],['M = target mean price','res']],'Draw cross, subtract diagonally to get mixing quantities.'),

/* ── 9. Time & Distance ── */
9:()=>vc('🚗','Speed – Distance – Time','Cover-up triangle method',`
  <!-- big triangle outline -->
  <polygon points="250,18 70,188 430,188" fill="${cP}" fill-opacity="0.05" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="600" stroke-dashoffset="600"><animate attributeName="stroke-dashoffset" from="600" to="0" dur="0.9s" begin="0.1s" fill="freeze"/></polygon>
  <!-- divide line -->
  <line x1="80" y1="148" x2="420" y2="148" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="6,4" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.9s" fill="freeze"/></line>
  <!-- D box top -->
  ${BOX(203,18,94,50,cP,0.9,'','D')}
  <!-- S box bottom-left -->
  ${BOX(70,148,140,50,cG,1.1,'','S')}
  <!-- T box bottom-right -->
  ${BOX(290,148,140,50,cA,1.1,'','T')}
  <!-- labels inside boxes override -->
  ${T(250,51,'D',cP,28,'900','middle',1.1)}
  ${T(140,181,'S',cG,28,'900','middle',1.2)}
  ${T(360,181,'T',cA,28,'900','middle',1.2)}
  ${T(250,108,'Cover D → S × T',cD,12,'400','middle',1.3)}
  ${T(250,126,'Cover S → D / T',cD,12,'400','middle',1.4)}
  <!-- conversion -->
  ${T(250,208,'km/h × 5/18 = m/s',cD,10,'400','middle',1.5)}
`,[['D = S × T','key'],['S = D / T',''],['T = D / S',''],['Avg speed (equal dist) = 2S₁S₂/(S₁+S₂)','res']]),

/* ── 10. Time & Work ── */
10:()=>vc('🔧','Time & Work','Work rate addition — animated bars',`
  <!-- A bar track -->
  ${T(30,40,'A completes job in 10 days',cD,12,'500','start',0.1)}
  <rect x="30" y="50" width="440" height="28" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="30" y="50" width="0" height="28" rx="5" fill="${cP}" fill-opacity="0.75"><animate attributeName="width" from="0" to="440" dur="1.1s" begin="0.2s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1"/></rect>
  ${T(250,69,'1/10 work per day',cT,11,'600','middle',1.1)}
  <!-- B bar track -->
  ${T(30,100,'B completes job in 15 days',cD,12,'500','start',0.3)}
  <rect x="30" y="110" width="440" height="28" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="30" y="110" width="0" height="28" rx="5" fill="${cB}" fill-opacity="0.7"><animate attributeName="width" from="0" to="440" dur="1.5s" begin="0.4s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1"/></rect>
  ${T(250,129,'1/15 work per day',cT,11,'600','middle',1.2)}
  <!-- Together result bar -->
  ${T(30,160,'Together:  1/10 + 1/15 = 1/6  per day',cD,12,'400','start',1.4)}
  <rect x="30" y="170" width="0" height="28" rx="5" fill="${cG}" fill-opacity="0.8"><animate attributeName="width" from="0" to="440" dur="0.75s" begin="1.6s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1.2"/></rect>
  ${T(250,189,'Finish together in  6 days',cT,12,'700','middle',2.1)}
`,[['Combined rate = 1/A + 1/B',''],['Days together = AB/(A+B)','key'],['Work = Efficiency × Time','res']],'Think of it as filling a tank — each person fills at their own rate.'),

/* ── 11. Percentage ── */
11:()=>vc('💯','Percentage','100-square grid — 35% highlighted',`
  <!-- 10×10 grid -->
  ${Array.from({length:100},(_,i)=>{
    const col=i%10, row=Math.floor(i/10), x=30+col*32, y=20+row*16;
    return `<rect x="${x}" y="${y}" width="29" height="13" rx="2" fill="${i<35?cP:'rgba(255,255,255,0.06)'}" fill-opacity="${i<35?0.7:1}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.18s" begin="${i*0.018}s" fill="freeze"/></rect>`;
  }).join('')}
  ${T(185,188,'35 of 100 squares = 35%',cP,12,'700','middle',1.9)}
  <!-- conversions -->
  ${[['10% = 1/10',''],['25% = 1/4',''],['33.3% = 1/3',''],['50% = 1/2',''],['75% = 3/4','']].map(([s],i)=>
    T(410,38+i*26,s,cD,11,'400','middle',0.5+i*0.08)
  ).join('')}
  ${T(410,24,'Quick conversions',cD,9,'600','middle',0.4)}
  ${T(410,178,'+10% → ×1.1',cG,11,'500','middle',1)}
  ${T(410,196,'−10% → ×0.9',cR,11,'500','middle',1)}
`,[['P% of X = PX/100',''],['% change = (new−old)/old × 100','key'],['x is what% of y = x/y × 100','res']],'+10% then −10% gives −1%, not 0 (beware successive changes).'),

/* ── 12. Ratio & Proportion ── */
12:()=>vc('⚖️','Ratio & Proportion','Split bar showing ratio',`
  <!-- full bar outline -->
  <rect x="40" y="70" width="420" height="60" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
  <!-- A portion: 3/7 -->
  <rect x="40" y="70" width="0" height="60" rx="10" fill="${cP}" fill-opacity="0.65"><animate attributeName="width" from="0" to="180" dur="0.6s" begin="0.3s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1.2"/></rect>
  ${T(130,103,'A = 3 parts',cT,13,'600','middle',0.8)}
  <!-- B portion: 4/7 -->
  <rect x="220" y="70" width="0" height="60" rx="10" fill="${cG}" fill-opacity="0.6"><animate attributeName="width" from="0" to="240" dur="0.6s" begin="0.5s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1.2"/></rect>
  ${T(340,103,'B = 4 parts',cT,13,'600','middle',1)}
  <!-- ratio label -->
  ${T(250,42,'Ratio  A : B  =  3 : 4',cP,16,'700','middle',1.1)}
  <!-- divider tick -->
  <line x1="220" y1="62" x2="220" y2="138" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <!-- proportion example -->
  ${T(250,158,'Proportion:   3/4  =  6/8   →   3×8 = 4×6  ✓',cD,12,'400','middle',1.3)}
  ${T(250,180,'Cross-multiply to check/solve proportions',cD,10,'400','middle',1.4)}
`,[['a:b = a/b',''],['a/b = c/d → ad = bc','key'],['Fourth prop: x = bc/a','res']]),

/* ── 13. Square Roots ── */
13:()=>vc('📐','Square Roots','Area reveals the side length',`
  <!-- growing square -->
  <rect x="50" y="25" width="0" height="0" rx="6" fill="${cP}" fill-opacity="0.12" stroke="${cP}" stroke-opacity="0.4" stroke-width="2"><animate attributeName="width" from="0" to="150" dur="0.6s" begin="0.2s" fill="freeze"/><animate attributeName="height" from="0" to="150" dur="0.6s" begin="0.2s" fill="freeze"/></rect>
  ${T(125,85,'Area',cD,12,'400','middle',0.7)}
  ${T(125,118,'144',cP,32,'900','middle',0.8)}
  <!-- side label arrows -->
  ${LN(30,25,30,175,cA,0.8,2)}
  ${LN(50,192,200,192,cA,0.9,2)}
  ${T(30,108,'12',cA,16,'800','middle',1)}
  ${T(125,207,'12',cA,16,'800','middle',1)}
  <!-- √ symbol -->
  <text x="262" y="100" fill="${cT}" font-size="55" font-weight="900" font-family="Arial" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1s" fill="freeze"/>√</text>
  ${T(352,100,'144',cP,42,'900','middle',1.1)}
  ${T(352,140,'= 12',cG,26,'900','middle',1.3)}
  ${T(352,170,'Perfect squares:',cD,10,'600','middle',1.5)}
  ${T(352,188,'1  4  9  16  25  36  49  64  81  100  121  144',cD,9,'400','middle',1.6)}
`,[['√(ab) = √a × √b',''],['(√a)² = a','res'],['√a² = |a|','key']],'Trick: pair digits from right — each pair contributes one digit to the root.'),

/* ── 14. Averages ── */
14:()=>vc('📊','Averages','Average = balance point',`
  ${AXIS(35,22,430,160)} ${GRID(35,22,430,160,5,4)}
  ${[[50,cP],[80,cP],[65,cP],[40,cP],[95,cP]].map(([h,c],i)=>`
    ${BAR(55+i*80,182,55,h,c,0.1+i*0.12)}
    ${T(82+i*80,192,['A','B','C','D','E'][i],cD,10,'400','middle',0.15+i*0.1)}
  `).join('')}
  <!-- average line -->
  <line x1="35" y1="116" x2="465" y2="116" stroke="${cA}" stroke-width="2" stroke-dasharray="8,5" stroke-dashoffset="450"><animate attributeName="stroke-dashoffset" from="450" to="0" dur="0.6s" begin="1s" fill="freeze"/></line>
  ${T(470,120,'Avg',cA,10,'700','start',1.2)}
  ${T(250,22,'(50+80+65+40+95)/5  =  330/5  =',cD,11,'400','middle',1.4)}
  ${T(435,22,'66',cA,15,'800','middle',1.4)}
`,[['Average = Sum / n','key'],['Sum = Avg × n',''],['Count changes → avg shifts by d/n','res']],'The dashed line shows the average — all bars are balanced around it.'),

/* ── 15. Interest ── */
15:()=>vc('🏦','Simple vs Compound Interest','CI grows faster — bars get taller',`
  ${AXIS(35,22,430,160)} ${GRID(35,22,430,160,6,4)}
  ${T(130,18,'Simple Interest (equal each year)',cB,10,'600','middle',0.1)}
  ${T(375,18,'Compound Interest (grows!)',cP,10,'600','middle',0.1)}
  <line x1="247" y1="14" x2="247" y2="188" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="5,4"/>
  <!-- SI bars (equal height 80) -->
  ${[1,2,3].map((_,i)=>`${BAR(50+i*60,182,40,80,cB,0.1+i*0.15,'₹100')}`).join('')}
  <!-- CI bars (growing) -->
  ${[[80,1],[88,2],[97,3]].map(([h,yr],i)=>`${BAR(270+i*60,182,40,h,cP,0.3+i*0.15,'₹'+[100,110,121][i])}`).join('')}
  ${T(128,200,'Yr 1  Yr 2  Yr 3',cD,9,'400','middle',0.8)}
  ${T(370,200,'Yr 1  Yr 2  Yr 3',cD,9,'400','middle',1)}
  ${T(250,210,'P=₹1000, R=10%, 3 yrs  |  SI=₹300  vs  CI=₹331',cD,10,'400','middle',1.5)}
`,[['SI = PRT/100',''],['CI = P(1+R/100)ⁿ − P','key'],['CI − SI = P(R/100)²  (2 yrs)','res']],'CI compounds on previous interest; SI uses original principal only.'),

/* ── 16. Algebraic Identities ── */
16:()=>vc('🔷','(a+b)² Proof','Geometric proof — square divided into 4 parts',`
  <!-- outer square -->
  <rect x="40" y="18" width="185" height="185" rx="4" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="750" stroke-dashoffset="750"><animate attributeName="stroke-dashoffset" from="750" to="0" dur="0.8s" begin="0.1s" fill="freeze"/></rect>
  <!-- a² top-left -->
  <rect x="40" y="18" width="115" height="115" rx="4" fill="${cP}" fill-opacity="0.15" stroke="${cP}" stroke-opacity="0.35" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.8s" fill="freeze"/></rect>
  ${T(97,82,'a²',cP,22,'800','middle',1.0)}
  <!-- ab top-right -->
  <rect x="155" y="18" width="70" height="115" rx="4" fill="${cA}" fill-opacity="0.12" stroke="${cA}" stroke-opacity="0.3" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.9s" fill="freeze"/></rect>
  ${T(190,82,'ab',cA,16,'700','middle',1.1)}
  <!-- ab bottom-left -->
  <rect x="40" y="133" width="115" height="70" rx="4" fill="${cA}" fill-opacity="0.12" stroke="${cA}" stroke-opacity="0.3" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.0s" fill="freeze"/></rect>
  ${T(97,172,'ab',cA,16,'700','middle',1.2)}
  <!-- b² bottom-right -->
  <rect x="155" y="133" width="70" height="70" rx="4" fill="${cG}" fill-opacity="0.14" stroke="${cG}" stroke-opacity="0.3" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.1s" fill="freeze"/></rect>
  ${T(190,172,'b²',cG,14,'700','middle',1.3)}
  <!-- dimension labels -->
  ${T(97,12,'← a →',cD,10,'500','middle',1.4)}
  ${T(190,12,'←b→',cD,10,'500','middle',1.4)}
  ${T(32,82,'a',cD,12,'500','middle',1.4)}
  ${T(32,168,'b',cD,12,'500','middle',1.4)}
  ${T(132,210,'(a+b)² = a² + 2ab + b²  ✓',cD,11,'600','middle',1.6)}
  <!-- other identities -->
  ${[['(a−b)² = a²−2ab+b²'],['(a+b)(a−b) = a²−b²'],['(a+b)³ = a³+3a²b+3ab²+b³'],['a³+b³ = (a+b)(a²−ab+b²)']].map(([f],i)=>
    `<rect x="265" y="${28+i*42}" width="210" height="32" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${1+i*0.1}s" fill="freeze"/></rect>${T(370,48+i*42,f,cD,10,'400','middle',1.1+i*0.1)}`
  ).join('')}
`),

/* ── 17. Linear Graphs ── */
17:()=>vc('📈','Linear Equations','y = mx + c on coordinate plane',`
  ${AXIS(45,18,400,170)} ${GRID(45,18,400,170,5,4)}
  <!-- y=x+1 -->
  <line x1="45" y1="147" x2="410" y2="18" stroke="${cP}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="420" stroke-dashoffset="420"><animate attributeName="stroke-dashoffset" from="420" to="0" dur="0.7s" begin="0.3s" fill="freeze"/></line>
  ${T(415,28,'y=x+1',cP,12,'700','start',0.8)}
  <!-- y=2x -->
  <line x1="45" y1="188" x2="300" y2="18" stroke="${cG}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="340" stroke-dashoffset="340"><animate attributeName="stroke-dashoffset" from="340" to="0" dur="0.7s" begin="0.5s" fill="freeze"/></line>
  ${T(305,24,'y=2x',cG,12,'700','start',1.0)}
  <!-- y-intercept -->
  ${DOT(45,147,cP,0.9,5)}
  ${T(65,144,'y-int(1,0)',cD,9,'400','start',1.1)}
  <!-- slope annotation -->
  ${LN(200,120,240,120,cA,1.2,1.5)}
  ${LN(240,120,240,95,cA,1.3,1.5)}
  ${T(220,132,'run',cA,9,'500','middle',1.3)}
  ${T(253,108,'rise',cA,9,'500','start',1.4)}
  ${T(250,210,'slope m = rise/run = Δy/Δx  |  c = y-intercept',cD,11,'400','middle',1.6)}
`,[['y = mx + c','key'],['Parallel lines: m₁ = m₂',''],['Perpendicular: m₁ × m₂ = −1','res']]),

/* ── 18. Triangle Centres ── */
18:()=>vc('🔺','Triangle Centres','4 special interior points',`
  ${[['Centroid','G','Medians meet','#818cf8',20],['Incenter','I','Angle bis.','#34d399',140],['Circumcenter','O','Perp. bis.','#fbbf24',260],['Orthocenter','H','Altitudes','#fb7185',380]].map(([name,sym,desc,c,x])=>`
    <polygon points="${x+50},12 ${x+6},108 ${x+94},108" fill="${c}" fill-opacity="0.08" stroke="${c}" stroke-opacity="0.40" stroke-width="1.5" stroke-dasharray="280" stroke-dashoffset="280"><animate attributeName="stroke-dashoffset" from="280" to="0" dur="0.6s" begin="${0.1+x/380*0.4}s" fill="freeze"/></polygon>
    ${DOT(x+50,70,c,0.5+x/380*0.3,6)}
    ${T(x+50,73,sym,cT,11,'700','middle',0.6+x/380*0.3)}
    ${T(x+50,124,name,c,10,'700','middle',0.7+x/380*0.3)}
    ${T(x+50,138,desc,cD,8,'400','middle',0.8+x/380*0.3)}
  `).join('')}
  ${T(250,168,'Euler Line:  O — G — H  are collinear',cD,11,'400','middle',1.4)}
  ${T(250,184,'G divides each median in 2:1 from vertex',cD,10,'400','middle',1.5)}
`,[['Inradius r = Area/s',''],['Circumradius R = abc/4·Area','key'],['Area = ½ × base × h','res']]),

/* ── 19. Congruence & Similarity ── */
19:()=>vc('🔁','Congruence & Similarity','Same shape — same or different size',`
  ${T(130,18,'CONGRUENT  ≅',cP,12,'700','middle',0.1)}
  <!-- Triangle pair (same size) -->
  <polygon points="50,175 130,38 210,175" fill="${cP}" fill-opacity="0.12" stroke="${cP}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="370" stroke-dashoffset="370"><animate attributeName="stroke-dashoffset" from="370" to="0" dur="0.6s" begin="0.2s" fill="freeze"/></polygon>
  <polygon points="215,175 295,38 375,175" fill="${cP}" fill-opacity="0.07" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="5,4" stroke-dashoffset="370"><animate attributeName="stroke-dashoffset" from="370" to="0" dur="0.6s" begin="0.4s" fill="freeze"/></polygon>
  ${T(130,198,'Same shape + same size',cD,10,'400','middle',0.9)}
  ${T(295,198,'SSS · SAS · ASA · AAS · RHS',cD,9,'400','middle',1)}
  <!-- divider -->
  <line x1="390" y1="15" x2="390" y2="195" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="5,4"/>
  ${T(445,18,'SIMILAR  ~',cG,12,'700','middle',0.1)}
  <!-- Similar pair (different size) -->
  <polygon points="405,185 445,90 480,185" fill="${cG}" fill-opacity="0.15" stroke="${cG}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="290" stroke-dashoffset="290"><animate attributeName="stroke-dashoffset" from="290" to="0" dur="0.6s" begin="0.6s" fill="freeze"/></polygon>
  <polygon points="400,195 455,55 495,195" fill="${cG}" fill-opacity="0.07" stroke="${cG}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="5,4" stroke-dashoffset="300"><animate attributeName="stroke-dashoffset" from="300" to="0" dur="0.6s" begin="0.8s" fill="freeze"/></polygon>
  ${T(447,210,'Same angles, scaled sides',cD,9,'400','middle',1.1)}
`,[['Similar: sides in ratio k','key'],['Area ratio = k²',''],['Volume ratio = k³','res']]),

/* ── 20. Circles ── */
20:()=>vc('⭕','Circle','All key parts labelled',`
  <!-- main circle -->
  ${CIR(210,108,88,cP,0.1,2)}
  <circle cx="210" cy="108" r="88" fill="${cP}" fill-opacity="0.06" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.9s" fill="freeze"/></circle>
  <!-- highlight -->
  <ellipse cx="170" cy="70" rx="22" ry="14" fill="white" fill-opacity="0.10" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1s" fill="freeze"/></ellipse>
  <!-- radius -->
  ${LN(210,108,298,108,cG,0.9,2)}
  ${DOT(210,108,cA,0.85,5)}
  ${T(254,100,'r',cG,18,'800','middle',1.1)}
  <!-- diameter dashed -->
  <line x1="122" y1="108" x2="298" y2="108" stroke="${cS}" stroke-width="1.5" stroke-dasharray="5,4"/>
  ${T(160,100,'d=2r',cD,9,'400','middle',1.2)}
  <!-- chord -->
  ${LN(140,55,298,55,cB,1.1,2)}
  ${T(220,46,'Chord',cB,10,'600','middle',1.4)}
  <!-- arc -->
  <path d="M 275,55 A88,88 0 0,1 298,108" fill="none" stroke="${cA}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="70" stroke-dashoffset="70"><animate attributeName="stroke-dashoffset" from="70" to="0" dur="0.5s" begin="1.2s" fill="freeze"/></path>
  ${T(320,76,'Arc',cA,10,'600','start',1.5)}
  <!-- tangent -->
  <line x1="298" y1="60" x2="298" y2="165" stroke="${cR}" stroke-width="1.8" stroke-dasharray="5,3" stroke-dashoffset="108"><animate attributeName="stroke-dashoffset" from="108" to="0" dur="0.4s" begin="1.3s" fill="freeze"/></line>
  <rect x="289" y="103" width="9" height="9" fill="none" stroke="${cR}" stroke-opacity="0.6" stroke-width="1.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.5s" fill="freeze"/></rect>
  ${T(330,120,'Tangent ⊥ r',cR,10,'600','start',1.6)}
  <!-- formulas right -->
  ${[['C = 2πr',cT],['Area = πr²',cT],['Arc len = rθ',cD],['Sector = πr²θ/360°',cD]].map(([f,c],i)=>T(425,40+i*30,f,c,11,'400','middle',1.1+i*0.1)).join('')}
`,[['Circumference = 2πr',''],['Area = πr²','key'],['Angle in semicircle = 90°','res']],'Tangent ⊥ radius at point of contact.'),

/* ── 21. Triangle Properties ── */
21:()=>vc('🔺','Triangle Properties','Area, altitude, angle sum',`
  <!-- main triangle -->
  <polygon points="250,18 55,185 445,185" fill="${cP}" fill-opacity="0.07" stroke="${cP}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="660" stroke-dashoffset="660"><animate attributeName="stroke-dashoffset" from="660" to="0" dur="0.9s" begin="0.1s" fill="freeze"/></polygon>
  <!-- altitude h -->
  ${LN(250,18,250,185,cA,0.9,1.5)}
  <rect x="241" y="176" width="9" height="9" fill="none" stroke="${cA}" stroke-opacity="0.5" stroke-width="1.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.2s" fill="freeze"/></rect>
  ${T(264,100,'h',cA,18,'800','start',1.1)}
  <!-- base arrow -->
  ${LN(55,200,445,200,cG,1.2,2)}
  ${T(250,215,'b',cG,14,'700','middle',1.4)}
  <!-- vertex labels -->
  ${T(250,12,'C',cT,14,'700','middle',0.2)}
  ${T(44,192,'A',cT,14,'700','middle',0.2)}
  ${T(455,192,'B',cT,14,'700','middle',0.2)}
  <!-- angle sum -->
  ${T(250,50,'∠A + ∠B + ∠C = 180°',cD,12,'500','middle',1.2)}
  <!-- types -->
  ${[['Equilateral: all sides =',cP],['Isosceles: 2 sides =',cB],['Scalene: no sides =',cD],['Right: one angle 90°',cG],['Obtuse: one angle >90°',cR]].map(([s,c],i)=>T(425,52+i*26,s,c,10,'500','middle',1+i*0.1)).join('')}
`,[['Area = ½ × b × h','key'],['Heron\'s = √s(s-a)(s-b)(s-c)',''],['Equilateral = (√3/4)a²','res']]),

/* ── 22. Quadrilaterals ── */
22:()=>vc('⬛','Quadrilaterals','Family of 4-sided figures',`
  ${[['Square',22,22,98,98,cP],['Rectangle',138,38,155,70,cB],['Rhombus',318,22,98,98,cG],['Parallelogram',22,140,155,60,cA],['Trapezium',202,140,135,60,cR],['Kite',362,140,108,70,cP]].map(([name,x,y,w,h,c],i)=>`
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${c}" fill-opacity="0.09" stroke="${c}" stroke-opacity="0.38" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="${0.08*i}s" fill="freeze"/></rect>
    ${T(x+w/2, y+h/2+4, name, c, 10, '700', 'middle', 0.2+i*0.08)}
  `).join('')}
  ${T(250,215,'Sum of all interior angles in any quadrilateral = 360°',cD,11,'400','middle',1.2)}
`,[['Square: a²  |  d=a√2',''],['Rectangle: l×b  |  d=√(l²+b²)',''],['Rhombus: ½d₁d₂  |  P=4a','key'],['Parallelogram: base×height','res']]),

/* ── 23. Regular Polygons ── */
23:()=>vc('⬡','Regular Polygons','Interior angles grow with n',`
  ${[3,4,5,6,8,10].map((n,i)=>{
    const cx=45+i*72, cy=70, r=34, pts=Array.from({length:n},(_,j)=>{const a=j*2*Math.PI/n-Math.PI/2;return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;}).join(' ');
    const cs=[cP,cG,cA,cR,cB,'#a78bfa'][i], nm=['Triangle','Square','Pentagon','Hexagon','Octagon','Decagon'][i];
    return `<polygon points="${pts}" fill="${cs}" fill-opacity="0.12" stroke="${cs}" stroke-opacity="0.45" stroke-width="1.8" stroke-dasharray="300" stroke-dashoffset="300"><animate attributeName="stroke-dashoffset" from="300" to="0" dur="0.6s" begin="${0.08+i*0.12}s" fill="freeze"/></polygon>
    ${T(cx,cy+5,''+n,cs,13,'900','middle',0.5+i*0.1)}
    ${T(cx,cy+48,nm,cs,8,'700','middle',0.6+i*0.1)}
    ${T(cx,cy+60,Math.round((n-2)*180/n)+'°',cD,8,'400','middle',0.7+i*0.1)}`;
  }).join('')}
  ${T(250,170,'Interior angle = (n−2)×180 / n',cD,11,'500','middle',1.3)}
  ${T(250,190,'Exterior angle = 360/n  |  Diagonals = n(n−3)/2',cD,10,'400','middle',1.5)}
`,[['Int. angle = (n−2)×180/n','key'],['Sum = (n−2)×180°',''],['Diagonals = n(n−3)/2','res']]),

/* ── 24. Right Prism ── */
24:()=>vc('📦','Right Prism','Volume = Base Area × Height',`
  <!-- front triangular face -->
  <polygon points="130,170 60,170 95,60" fill="${cP}" fill-opacity="0.18" stroke="${cP}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="310" stroke-dashoffset="310"><animate attributeName="stroke-dashoffset" from="310" to="0" dur="0.7s" begin="0.2s" fill="freeze"/></polygon>
  <!-- back face dashed -->
  <polygon points="280,170 210,170 245,60" fill="${cP}" fill-opacity="0.07" stroke="${cP}" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="5,4"/>
  <!-- connecting edges -->
  ${LN(130,170,280,170,cP,0.8,1.8)} ${LN(60,170,210,170,cP,0.8,1)} ${LN(95,60,245,60,cP,0.8,1.5)}
  <!-- height -->
  ${LN(310,60,310,170,cG,1,2)}
  ${T(323,118,'h',cG,18,'800','start',1.2)}
  <!-- base label -->
  ${T(95,190,'Base Area = B',cD,10,'500','middle',1.1)}
  ${T(180,28,'Triangular Prism',cD,11,'600','middle',0.1)}
  <!-- formulas right -->
  ${[['Vol = Base Area × h',cT],['LSA = Perimeter × h',cP],['TSA = LSA + 2×Base',cG]].map(([f,c],i)=>T(420,65+i*36,f,c,11,'500','middle',1.1+i*0.12)).join('')}
`,[['Vol = B × h','key'],['LSA = Perimeter × h',''],['TSA = LSA + 2B','res']]),

/* ── 25. Right Circular Cone ── */
25:()=>vc('🔺','Right Circular Cone','l² = h² + r² (Pythagoras!)',`
  <!-- base ellipse -->
  <ellipse cx="200" cy="165" rx="100" ry="22" fill="${cP}" fill-opacity="0.10" stroke="${cP}" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="335" stroke-dashoffset="335"><animate attributeName="stroke-dashoffset" from="335" to="0" dur="0.6s" begin="0.2s" fill="freeze"/></ellipse>
  <!-- left edge -->
  ${LN(100,165,200,25,cP,0.7,2)}
  <!-- right edge (slant l) -->
  ${LN(300,165,200,25,cB,0.7,2.5)}
  <!-- height h -->
  ${LN(200,25,200,165,cG,0.8,1.5)}
  <rect x="191" y="156" width="9" height="9" fill="none" stroke="${cG}" stroke-opacity="0.5" stroke-width="1.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.1s" fill="freeze"/></rect>
  <!-- radius r -->
  ${LN(200,165,300,165,cA,0.9,2)}
  <!-- labels -->
  ${DOT(200,25,cT,0.6,5)}
  ${T(215,98,'h',cG,18,'800','start',1)}
  ${T(268,84,'l',cB,18,'800','middle',0.9)}
  ${T(252,158,'r',cA,18,'800','middle',1.1)}
  <!-- formulas -->
  ${[['l = √(h²+r²)',cT],['Vol = πr²h/3',cP],['Curved SA = πrl',cG],['Total SA = πr(l+r)',cA]].map(([f,c],i)=>T(420,48+i*38,f,c,11,'500','middle',1.1+i*0.1)).join('')}
`,[['l = √(h²+r²)','key'],['Vol = πr²h/3',''],['Curved SA = πrl',''],['Total SA = πr(l+r)','res']]),

/* ── 26. Right Circular Cylinder ── */
26:()=>vc('🥫','Right Circular Cylinder','Two circles + curved surface',`
  <!-- top ellipse -->
  <ellipse cx="200" cy="45" rx="100" ry="22" fill="${cP}" fill-opacity="0.20" stroke="${cP}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="335" stroke-dashoffset="335"><animate attributeName="stroke-dashoffset" from="335" to="0" dur="0.6s" begin="0.2s" fill="freeze"/></ellipse>
  <!-- sides -->
  ${LN(100,45,100,165,cP,0.7,2)} ${LN(300,45,300,165,cP,0.7,2)}
  <!-- bottom ellipse -->
  <ellipse cx="200" cy="165" rx="100" ry="22" fill="${cP}" fill-opacity="0.10" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="335" stroke-dashoffset="335"><animate attributeName="stroke-dashoffset" from="335" to="0" dur="0.6s" begin="0.4s" fill="freeze"/></ellipse>
  <!-- r label -->
  ${LN(200,45,300,45,cG,0.8,2)}
  ${T(252,38,'r',cG,18,'800','middle',1)}
  <!-- h label -->
  ${LN(325,45,325,165,cA,0.9,2)}
  ${T(338,108,'h',cA,18,'800','start',1.1)}
  <!-- formulas -->
  ${[['Vol = πr²h',cT],['Curved SA = 2πrh',cP],['Total SA = 2πr(r+h)',cG],['Hollow: π(R²−r²)h',cD]].map(([f,c],i)=>T(430,50+i*36,f,c,11,'500','middle',1.1+i*0.1)).join('')}
`,[['Vol = πr²h','key'],['Curved SA = 2πrh',''],['Total SA = 2πr(r+h)','res']]),

/* ── 27. Sphere ── */
27:()=>vc('🌐','Sphere','Perfect 3D round shape',`
  <!-- glow -->
  <circle cx="195" cy="108" r="88" fill="${cP}" fill-opacity="0.06" filter="url(#gw)"/>
  <!-- sphere outline -->
  ${CIR(195,108,85,cP,0.15,2.5)}
  <circle cx="195" cy="108" r="85" fill="${cP}" fill-opacity="0.10" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.9s" fill="freeze"/></circle>
  <!-- specular highlight -->
  <ellipse cx="155" cy="68" rx="24" ry="15" fill="white" fill-opacity="0.15" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1s" fill="freeze"/></ellipse>
  <!-- equator -->
  <ellipse cx="195" cy="108" rx="85" ry="17" fill="none" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="6,4" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1s" fill="freeze"/></ellipse>
  <!-- meridian arc -->
  <path d="M 195,23 A 85,85 0 0,1 195,193" fill="none" stroke="${cP}" stroke-opacity="0.2" stroke-width="1.2" stroke-dasharray="5,4" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.1s" fill="freeze"/></path>
  <!-- radius -->
  ${LN(195,108,280,108,cG,0.9,2.5)}
  ${DOT(195,108,cA,0.85,5)}
  ${T(240,100,'r',cG,20,'800','middle',1.1)}
  <!-- formulas -->
  ${[['Vol = (4/3)πr³',cT],['Surface Area = 4πr²',cP],['Hemisphere Vol = (2/3)πr³',cG],['Hemisphere SA = 3πr²',cB]].map(([f,c],i)=>T(415,40+i*32,f,c,11,'500','middle',1.1+i*0.1)).join('')}
  ${T(415,25,'Formulae',cD,9,'700','middle',0.9)}
`,[['Vol = (4/3)πr³','key'],['Surface Area = 4πr²',''],['Hemi Vol = (2/3)πr³','res']]),

/* ── 28. Heights & Distances ── */
28:()=>vc('📏','Heights & Distances','Trigonometry in real world',`
  <!-- ground -->
  <line x1="20" y1="175" x2="450" y2="175" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <!-- tower -->
  <rect x="305" y="38" width="14" height="137" rx="3" fill="${cP}" fill-opacity="0.50" stroke="${cP}" stroke-opacity="0.5" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.2s" fill="freeze"/></rect>
  <!-- tower top flag -->
  <polygon points="305,24 319,24 305,38" fill="${cA}" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.4s" fill="freeze"/></polygon>
  <!-- height arrow h -->
  ${LN(335,38,335,175,cG,0.5,1.5)}
  ${T(348,110,'h',cG,18,'800','start',0.8)}
  <!-- observer -->
  ${DOT(48,168,cG,0.6,8)}
  <!-- line of sight -->
  <line x1="56" y1="162" x2="307" y2="35" stroke="${cP}" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="5,3" stroke-dashoffset="290"><animate attributeName="stroke-dashoffset" from="290" to="0" dur="0.5s" begin="0.7s" fill="freeze"/></line>
  <!-- angle arc -->
  <path d="M 88,175 A 40,40 0 0,0 75,140" fill="none" stroke="${cA}" stroke-width="2.5" stroke-dasharray="50" stroke-dashoffset="50"><animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.4s" begin="1.1s" fill="freeze"/></path>
  ${T(110,158,'θ',cA,18,'800','middle',1.2)}
  <!-- d label -->
  ${LN(48,188,305,188,cB,0.9,1.5)}
  ${T(176,200,'d  (distance)',cB,11,'500','middle',1.2)}
  ${T(200,55,'Line of Elevation ↗',cD,10,'400','middle',1.3)}
  <!-- trig -->
  ${T(430,55,'tan θ = h/d',cA,12,'700','middle',1.3)}
  ${T(430,80,'sin θ = h/l',cP,11,'500','middle',1.4)}
  ${T(430,100,'cos θ = d/l',cG,11,'500','middle',1.5)}
  ${T(430,130,'30°: 1/2 √3/2 1/√3',cD,9,'400','middle',1.6)}
  ${T(430,148,'45°: 1/√2 1/√2 1',cD,9,'400','middle',1.7)}
  ${T(430,166,'60°: √3/2 1/2 √3',cD,9,'400','middle',1.8)}
`,[['tan θ = h/d  →  h = d·tan θ','key'],['sin θ = P/H  cos θ = B/H',''],['Depression angle = Elevation angle','res']]),

/* ── 29. Histogram ── */
29:()=>vc('📊','Histogram','Bars touch — continuous data',`
  ${AXIS(40,20,415,160)} ${GRID(40,20,415,160,5,4)}
  ${[[15,42],[28,78],[22,62],[18,50],[10,28]].map(([f,h],i)=>{
    const x=40+i*82;
    return `${BAR(x,180,80,h,cP,0.1+i*0.12,f+'')}${T(x+40,195,`${i*10}−${i*10+10}`,cD,9,'400','middle',0.15+i*0.08)}`;
  }).join('')}
  ${T(250,210,'Bars are adjacent (no gaps) — continuous class intervals',cD,10,'400','middle',1)}
  ${T(10,105,'f',cD,10,'400','middle',0.1,`transform="rotate(-90,10,105)"`)}
`,[['Class width = (max−min)/n',''],['Modal class = tallest bar','key'],['Bars are adjacent — no gaps','res']]),

/* ── 30. Frequency Polygon ── */
30:()=>vc('📉','Frequency Polygon','Join midpoints of class intervals',`
  ${AXIS(40,20,415,160)} ${GRID(40,20,415,160,5,4)}
  ${(()=>{
    const pts=[[15,42],[28,78],[22,62],[18,50],[10,28]];
    const sc=pts.map(([f,h],i)=>[82+i*80,180-h]);
    const pd='M '+sc.map(([x,y])=>`${x},${y}`).join(' L ');
    return `<path d="${pd}" fill="none" stroke="${cP}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="550" stroke-dashoffset="550"><animate attributeName="stroke-dashoffset" from="550" to="0" dur="1s" begin="0.3s" fill="freeze"/></path>
    <path d="${pd} L ${sc[4][0]},180 L ${sc[0][0]},180 Z" fill="${cP}" fill-opacity="0.08" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.2s" fill="freeze"/></path>
    ${sc.map(([x,y],i)=>`${DOT(x,y,cG,1+i*0.1,6)}${T(x,y-14,pts[i][0]+'',cG,11,'700','middle',1.1+i*0.1)}${T(x,193,5+i*10+'',cD,9,'400','middle',0.15+i*0.08)}`).join('')}`;
  })()}
`,[['Plot (mid-point, frequency)',''],['Join consecutive points','key'],['Compare two datasets easily','res']]),

/* ── 31. Bar & Pie Chart ── */
31:()=>vc('📊','Bar & Pie Chart','Two ways to display the same data',`
  ${AXIS(25,18,185,155)} ${GRID(25,18,185,155,4,4)}
  ${[['A',40,cP],['B',65,cG],['C',50,cA],['D',30,cR]].map(([l,v,c],i)=>`
    ${BAR(35+i*42,173,35,v*2,c,0.1+i*0.1)}
    ${T(52+i*42,188,l,cD,10,'400','middle',0.15+i*0.08)}
  `).join('')}
  ${T(118,14,'Bar Chart',cD,10,'700','middle',0.1)}
  <line x1="228" y1="10" x2="228" y2="200" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" stroke-dasharray="5,4"/>
  ${T(365,14,'Pie Chart (185 total)',cD,10,'700','middle',0.1)}
  <!-- pie -->
  <g transform="translate(365,105)">
    <path d="M0,0 L0,-72 A72,72 0 0,1 69.5,-20.5 Z" fill="${cP}" fill-opacity="0.75" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.5s" fill="freeze"/></path>
    <path d="M0,0 L69.5,-20.5 A72,72 0 0,1 -5,72 Z" fill="${cG}" fill-opacity="0.75" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.65s" fill="freeze"/></path>
    <path d="M0,0 L-5,72 A72,72 0 0,1 -70,-15.5 Z" fill="${cA}" fill-opacity="0.75" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/></path>
    <path d="M0,0 L-70,-15.5 A72,72 0 0,1 0,-72 Z" fill="${cR}" fill-opacity="0.75" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.95s" fill="freeze"/></path>
    ${['A','B','C','D'].map((l,i)=>{const a=[37,148,215,340];const r=a[i]*Math.PI/180;return T(44*Math.cos(r),44*Math.sin(r)+4,l,'white',11,'800','middle',1+i*0.1);}).join('')}
  </g>
`,[['Pie angle = (value/total)×360°','key'],['Bar: height ∝ frequency',''],['Pie: angles must sum to 360°','res']]),

/* ── 32. Hemisphere ── */
32:()=>vc('🌓','Hemisphere','Half of a sphere',`
  <!-- dome -->
  <path d="M 90,155 A 110,110 0 0,1 310,155" fill="${cP}" fill-opacity="0.12" stroke="${cP}" stroke-opacity="0.45" stroke-width="2.5" stroke-dasharray="365" stroke-dashoffset="365"><animate attributeName="stroke-dashoffset" from="365" to="0" dur="0.8s" begin="0.1s" fill="freeze"/></path>
  <!-- flat base -->
  <ellipse cx="200" cy="155" rx="110" ry="22" fill="${cP}" fill-opacity="0.10" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="345" stroke-dashoffset="345"><animate attributeName="stroke-dashoffset" from="345" to="0" dur="0.6s" begin="0.7s" fill="freeze"/></ellipse>
  <!-- cross-section dashed -->
  <path d="M 90,155 A 110,38 0 0,0 310,155" fill="none" stroke="${cS}" stroke-width="1.2" stroke-dasharray="5,4"/>
  <!-- highlight -->
  <ellipse cx="152" cy="98" rx="26" ry="16" fill="white" fill-opacity="0.12" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.8s" fill="freeze"/></ellipse>
  <!-- radius -->
  ${LN(200,155,310,155,cG,0.8,2)}
  ${DOT(200,155,cA,0.75,5)}
  ${T(258,148,'r',cG,20,'800','middle',1)}
  <!-- formulas -->
  ${[['Vol = (2/3)πr³',cT],['Curved SA = 2πr²',cP],['Total SA = 3πr²',cG],['(includes flat circle)',cD]].map(([f,c],i)=>T(420,50+i*35,f,c,11,'500','middle',1.1+i*0.1)).join('')}
`,[['Vol = (2/3)πr³','key'],['Curved SA = 2πr²',''],['Total SA = 3πr²','res']]),

/* ── 33. Cuboid ── */
33:()=>vc('📦','Cuboid','3D box — l × b × h',`
  <!-- front face -->
  <rect x="40" y="55" width="168" height="120" rx="4" fill="${cP}" fill-opacity="0.12" stroke="${cP}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="580" stroke-dashoffset="580"><animate attributeName="stroke-dashoffset" from="580" to="0" dur="0.8s" begin="0.2s" fill="freeze"/></rect>
  <!-- top face -->
  <polygon points="40,55 95,18 280,18 208,55" fill="${cP}" fill-opacity="0.20" stroke="${cP}" stroke-opacity="0.35" stroke-width="1.8" stroke-dasharray="5,0" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/></polygon>
  <!-- right face -->
  <polygon points="208,55 280,18 280,138 208,175" fill="${cP}" fill-opacity="0.09" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="5,0" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.9s" fill="freeze"/></polygon>
  <!-- labels -->
  ${LN(18,55,18,175,cG,1,2)} ${T(8,118,'h',cG,16,'800','middle',1.1)}
  ${LN(40,190,208,190,cA,1.1,2)} ${T(124,202,'l',cA,16,'800','middle',1.2)}
  ${LN(226,185,294,148,cB,1.2,1.5)} ${T(275,160,'b',cB,14,'800','middle',1.3)}
  <!-- space diagonal -->
  <line x1="40" y1="175" x2="280" y2="18" stroke="${cD}" stroke-width="1.2" stroke-dasharray="5,4" opacity="0"><animate attributeName="opacity" from="0" to="0.5" dur="0.3s" begin="1.4s" fill="freeze"/></line>
  ${T(185,85,'d',cD,11,'500','middle',1.5)}
  <!-- formulas -->
  ${[['Vol = l×b×h',cT],['LSA = 2(l+b)×h',cP],['TSA = 2(lb+bh+lh)',cG],['Diag = √(l²+b²+h²)',cA],['Cube: a³ · 6a² · a√3',cD]].map(([f,c],i)=>T(415,30+i*36,f,c,11,'500','middle',1+i*0.1)).join('')}
`,[['Vol = l×b×h','key'],['TSA = 2(lb+bh+lh)',''],['Diagonal = √(l²+b²+h²)','res']]),

/* ── 34. Regular Right Pyramid ── */
34:()=>vc('🔺','Regular Right Pyramid','Square base — apex above centre',`
  <!-- base parallelogram (perspective) -->
  <polygon points="145,175 265,175 315,148 195,148" fill="${cA}" fill-opacity="0.12" stroke="${cA}" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="5,0" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.3s" fill="freeze"/></polygon>
  <!-- front-left face -->
  <polygon points="205,25 145,175 265,175" fill="${cP}" fill-opacity="0.18" stroke="${cP}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="400" stroke-dashoffset="400"><animate attributeName="stroke-dashoffset" from="400" to="0" dur="0.7s" begin="0.5s" fill="freeze"/></polygon>
  <!-- front-right face -->
  <polygon points="205,25 265,175 315,148" fill="${cP}" fill-opacity="0.10" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="5,0" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.7s" fill="freeze"/></polygon>
  <!-- back faces dashed -->
  <polygon points="205,25 195,148 315,148" fill="rgba(255,255,255,0.02)" stroke="${cS}" stroke-width="1" stroke-dasharray="5,4"/>
  <!-- apex -->
  ${DOT(205,25,cT,0.4,6)}
  ${T(205,15,'Apex',cD,9,'400','middle',0.5)}
  <!-- height -->
  ${LN(205,25,205,162,cG,0.8,1.5)}
  <rect x="196" y="153" width="9" height="9" fill="none" stroke="${cG}" stroke-opacity="0.5" stroke-width="1.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.1s" fill="freeze"/></rect>
  ${T(220,95,'h',cG,18,'800','start',1)}
  <!-- slant l -->
  ${LN(205,25,205,175,cA,0.9,1)}
  ${T(190,75,'l',cA,14,'600','middle',1.2)}
  <!-- base label -->
  ${T(205,195,'base side  a',cA,11,'500','middle',0.4)}
  <!-- formulas -->
  ${[['l = √(h²+(a/2)²)',cT],['Vol = ⅓×Base×h',cP],['LSA = ½×Perimeter×l',cG],['TSA = LSA + Base',cA],['Sq base: Base = a²',cD]].map(([f,c],i)=>T(415,32+i*34,f,c,11,'500','middle',1+i*0.1)).join('')}
`,[['Vol = (1/3)×Base×h','key'],['LSA = ½×Perimeter×l',''],['TSA = LSA + Base Area','res']]),

};

/* ═══════════════════════════════════════════════════════════
   STEP-BY-STEP VISUAL BUILDER
   Interactive stepper with per-step SVG teaching visuals
═══════════════════════════════════════════════════════════ */

const SC=[cP,cG,cA,cB,'#a78bfa',cR,'#f472b6'];

// ── Smart auto SVG — generates contextual visual for any step ──
function stepAutoSvg(text,eg,num,total){
  const c=SC[(num-1)%SC.length];
  const ci=+(2*Math.PI*36).toFixed(1),filled=+(ci*(num/total)).toFixed(1);
  const words=text.split(/\s+/),lines=['','',''];let li=0;
  words.forEach(w=>{if(li<2&&(lines[li]+' '+w).trim().length>45)li++;lines[li]=(lines[li]?lines[li]+' ':'')+w;});
  const fmRe=/([A-Za-z\d%×÷\+\-\/\.\(\)₂³√²]+\s*[=]\s*[^\s,|]+)/g;
  const fmAll=((eg||'')+' '+text).match(fmRe)||[];
  const fm=fmAll.find(f=>f.length>3&&f.length<42)||'';
  const textH=lines[2]?98:lines[1]?78:60;
  const fmY=32+textH+8;
  const egY=fmY+(fm?50:4);
  const egShort=eg?(eg.length>62?eg.slice(0,60)+'…':eg):'';
  return `${VD}
  <circle cx="46" cy="110" r="36" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="5"/>
  <circle cx="46" cy="110" r="36" fill="${c}" fill-opacity="0.07" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${ci}" stroke-dashoffset="${ci}" transform="rotate(-90,46,110)"><animate attributeName="stroke-dashoffset" from="${ci}" to="${ci-filled}" dur="0.7s" begin="0.1s" fill="freeze"/></circle>
  ${T(46,115,''+num,c,20,'900','middle',0.2)}
  ${T(46,184,'of '+total,cD,9,'400','middle',0.3)}
  <rect x="96" y="30" width="388" height="${textH}" rx="11" fill="${c}" fill-opacity="0.09" stroke="${c}" stroke-opacity="0.25" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.35s" fill="freeze"/></rect>
  ${T(290,52,lines[0],cT,12,'700','middle',0.4)}
  ${lines[1]?T(290,70,lines[1],cT,11,'500','middle',0.45):''}
  ${lines[2]?T(290,86,lines[2],cT,10,'400','middle',0.5):''}
  ${fm?`<rect x="96" y="${fmY}" width="388" height="40" rx="9" fill="${c}" fill-opacity="0.14" stroke="${c}" stroke-opacity="0.35" stroke-width="1" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.55s" fill="freeze"/></rect>${T(290,fmY+26,fm,c,14,'800','middle',0.6)}`:''}
  ${egShort?`<rect x="96" y="${egY}" width="388" height="44" rx="9" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" stroke-width="1" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.65s" fill="freeze"/></rect><rect x="96" y="${egY}" width="3" height="44" rx="1.5" fill="${c}" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.65s" fill="freeze"/></rect>${T(292,egY+18,'eg: '+egShort,cD,10,'400','middle',0.7)}`:''}`;
}

// ════════════════════════════════════════════════════════════
//  CUSTOM STEP SVGs — hand-crafted for key topics
// ════════════════════════════════════════════════════════════

/* ── Topic 1: BODMAS ── */
const SV1=[
// S0 — Brackets first
()=>`${VD}
  ${T(250,22,'B — Brackets First!',cP,16,'800','middle',0.1)}
  ${BOX(20,38,220,65,cP,0.2,'Expression','(3 + 5) × 2')}
  <polygon points="254,68 268,62 268,74" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.6s" fill="freeze"/></polygon>
  ${BOX(280,38,90,65,cA,0.7,'Bracket','= 8')}
  <polygon points="384,68 398,62 398,74" fill="${cG}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1s" fill="freeze"/></polygon>
  ${BOX(410,38,70,65,cG,1.1,'Answer','16')}
  ${T(250,128,'Order:  ( )  →  { }  →  [ ]  — innermost first',cD,11,'500','middle',1.3)}
  ${BOX(20,142,460,55,cB,1.2,'Nested:  [ 2 + { 3 × (4 − 1) } ]  →  [ 2 + { 3 × 3 } ]  →  [ 2 + 9 ]  →','11')}`,

// S1 — Of means ×
()=>`${VD}
  ${T(250,22,'O — "Of" means Multiply',cG,16,'800','middle',0.1)}
  ${BOX(30,40,200,70,cG,0.2,'"½  of  20"','½ × 20 = 10')}
  ${BOX(270,40,200,70,cA,0.4,'"25%  of  80"','25/100 × 80 = 20')}
  ${T(250,138,'"Of" always comes AFTER brackets but BEFORE ÷ × + −',cD,11,'500','middle',0.8)}
  ${BOX(70,155,360,48,cP,0.9,'Example:  ⅓ of 15 + 2  →  (⅓ × 15) + 2  →  5 + 2 =','7')}`,

// S2 — D÷ and M× left-to-right
()=>`${VD}
  ${T(250,22,'D ÷ and M ×  — Left to Right!',cA,15,'800','middle',0.1)}
  ${BOX(15,42,105,55,cP,0.15,'Start','24 ÷ 4 × 3')}
  <polygon points="130,67 144,61 144,73" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.4s" fill="freeze"/></polygon>
  ${T(137,55,'←first',cA,8,'600','middle',0.5)}
  ${BOX(155,42,95,55,cG,0.5,'÷ first','24÷4 = 6')}
  <polygon points="260,67 274,61 274,73" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze"/></polygon>
  ${BOX(285,42,95,55,cG,0.8,'× next','6 × 3 = 18')}
  <polygon points="390,67 404,61 404,73" fill="${cG}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.1s" fill="freeze"/></polygon>
  ${BOX(415,42,70,55,cG,1.1,'','✅ 18')}
  ${BOX(15,115,220,70,cR,1.2,'WRONG: right-to-left','24 ÷ (4×3) = 24÷12 = 2 ✗')}
  ${BOX(260,115,220,70,cG,1.3,'CORRECT: left-to-right','(24÷4) × 3 = 6×3 = 18 ✓')}
  ${T(250,200,'Same priority → always go LEFT to RIGHT',cD,10,'400','middle',1.5)}`,

// S3 — A+ and S− left-to-right
()=>`${VD}
  ${T(250,22,'A + and S −  — Also Left to Right!',cB,15,'800','middle',0.1)}
  ${BOX(15,42,105,55,cP,0.15,'Start','15 − 6 + 4')}
  <polygon points="130,67 144,61 144,73" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.4s" fill="freeze"/></polygon>
  ${BOX(155,42,110,55,cG,0.5,'− first','15 − 6 = 9')}
  <polygon points="275,67 289,61 289,73" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze"/></polygon>
  ${BOX(300,42,100,55,cG,0.8,'+ next','9 + 4 = 13')}
  <polygon points="410,67 424,61 424,73" fill="${cG}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.1s" fill="freeze"/></polygon>
  ${BOX(435,42,50,55,cG,1.1,'','✅ 13')}
  ${BOX(15,115,220,70,cR,1.2,'WRONG:','15 − (6+4) = 15−10 = 5 ✗')}
  ${BOX(260,115,220,70,cG,1.3,'CORRECT:','(15−6) + 4 = 9+4 = 13 ✓')}`,

// S4 — Sign rules
()=>`${VD}
  ${T(250,22,'Sign Rules for × and ÷',cA,16,'800','middle',0.1)}
  ${BOX(30,42,200,48,cG,0.2,'(+) × (+) =','+ (positive)')}
  ${BOX(270,42,200,48,cR,0.3,'(+) × (−) =','− (negative)')}
  ${BOX(30,100,200,48,cR,0.4,'(−) × (+) =','− (negative)')}
  ${BOX(270,100,200,48,cG,0.5,'(−) × (−) =','+ (positive)')}
  ${T(250,170,'Same signs → Positive  |  Different signs → Negative',cD,11,'500','middle',0.8)}
  ${T(250,192,'(−3)×(−4) = +12  |  (−2)×5 = −10  |  (−8)÷(−2) = +4',cA,10,'400','middle',1.0)}`,

// S5 — Place value
()=>`${VD}
  ${T(250,18,'Place Value — Each Position = ×10',cP,14,'800','middle',0.1)}
  ${[['Th',62,'10³'],['H',140,'10²'],['T',218,'10¹'],['O',296,'10⁰'],['.','',''],['t',374,'1/10'],['h',452,'1/100']].map(([n,cx,pw],i)=>cx?`
  <rect x="${cx-32}" y="40" width="60" height="80" rx="8" fill="${i<4?cP:cB}" fill-opacity="0.08" stroke="${i<4?cP:cB}" stroke-opacity="0.3" stroke-width="1.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.25s" begin="${0.1+i*0.08}s" fill="freeze"/></rect>
  ${T(cx,70,'5432'.charAt(Math.min(i,3)),i<4?cP:cB,20,'800','middle',0.2+i*0.08)}
  ${T(cx,98,n,cD,10,'500','middle',0.3+i*0.08)}
  ${T(cx,115,pw,cD,8,'400','middle',0.35+i*0.08)}`:'').join('')}
  <line x1="327" y1="38" x2="327" y2="125" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="4,3"/>
  ${T(180,145,'Integer part',cP,10,'500','middle',0.7)}
  ${T(410,145,'Decimal part',cB,10,'500','middle',0.7)}
  ${T(250,175,'× 10 = shift left  |  ÷ 10 = shift right  |  5432 → 5=Th,4=H,3=T,2=O',cD,10,'400','middle',0.9)}`,

// S6 — Divisibility shortcuts
()=>`${VD}
  ${T(250,18,'Divisibility Quick Checks',cG,15,'800','middle',0.1)}
  ${[['÷2','Last digit even','136→6 even ✓',cP],['÷3','Digit sum ÷ 3','123→1+2+3=6 ✓',cG],['÷5','Ends in 0 or 5','255→5 ✓',cA],['÷9','Digit sum ÷ 9','729→7+2+9=18 ✓',cB],['÷11','Alt sum ÷ 11','847→8−4+7=11 ✓',cR]].map(([rule,check,eg,c],i)=>`
  <rect x="18" y="${35+i*35}" width="464" height="30" rx="6" fill="${c}" fill-opacity="0.07" stroke="${c}" stroke-opacity="0.2" stroke-width="1" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.25s" begin="${0.15+i*0.1}s" fill="freeze"/></rect>
  ${T(48,54+i*35,rule,c,12,'800','middle',0.2+i*0.1)}
  ${T(180,54+i*35,check,cT,10,'500','middle',0.25+i*0.1)}
  ${T(400,54+i*35,eg,cD,9,'400','middle',0.3+i*0.1)}`).join('')}
  ${T(250,215,'Combine rules: ÷6 = ÷2 AND ÷3  |  ÷12 = ÷3 AND ÷4',cD,10,'400','middle',1)}`
];

/* ── Topic 5: Profit & Loss ── */
const SV5=[
// S0 — Identify CP & SP
()=>`${VD}
  ${T(250,18,'Step 1: Identify CP and SP',cP,14,'700','middle',0.1)}
  ${BOX(25,35,200,100,cP,0.15,'Cost Price (CP)','₹200')}
  ${T(125,108,'Jo aapne DIYA',cD,9,'400','middle',0.5)}
  ${BOX(275,35,200,100,cG,0.3,'Selling Price (SP)','₹260')}
  ${T(375,108,'Jo aapne LIYA',cD,9,'400','middle',0.6)}
  <polygon points="232,82 248,75 248,89" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.7s" fill="freeze"/></polygon>
  ${T(242,82,'→',cA,16,'800','middle',0.7)}
  ${T(250,155,'SP > CP  →  PROFIT',cG,13,'700','middle',0.9)}
  ${T(250,175,'SP < CP  →  LOSS',cR,13,'700','middle',1)}
  ${T(250,195,'SP = CP  →  No Profit No Loss',cD,11,'500','middle',1.1)}`,

// S1 — Profit/Loss condition bar chart
()=>`${VD}
  ${T(130,16,'PROFIT Scenario',cG,12,'700','middle',0.1)}
  ${T(380,16,'LOSS Scenario',cR,12,'700','middle',0.1)}
  <line x1="250" y1="10" x2="250" y2="195" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="5,4"/>
  ${AXIS(20,22,210,158)} ${BAR(40,180,70,100,cP,0.15,'CP₹200')} ${BAR(140,180,70,130,cG,0.3,'SP₹260')}
  ${LN(210,50,210,100,cA,0.7,1.5)} ${LN(140,50,210,50,cA,0.8,1)}
  ${T(225,72,'Profit',cA,10,'700','start',0.9)} ${T(225,86,'+₹60',cA,13,'800','start',0.95)}
  ${AXIS(260,22,210,158)} ${BAR(280,180,70,100,cP,0.5,'CP₹300')} ${BAR(380,180,70,70,cR,0.7,'SP₹240')}
  ${LN(450,110,450,180,cR,1.1,1.5)} ${LN(380,110,450,110,cR,1.1,1)}
  ${T(460,145,'Loss',cR,10,'700','start',1.2)} ${T(460,159,'−₹60',cR,13,'800','start',1.25)}`,

// S2 — Profit = SP − CP
()=>`${VD}
  ${T(250,18,'Step 3: Calculate Profit or Loss',cA,14,'700','middle',0.1)}
  <rect x="20" y="38" width="460" height="50" rx="9" fill="${cP}" fill-opacity="0.10" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.15s" fill="freeze"/></rect>
  ${T(250,68,'SP  =  ₹260',cP,18,'800','middle',0.3)}
  <rect x="20" y="98" width="460" height="50" rx="9" fill="${cG}" fill-opacity="0.10" stroke="${cG}" stroke-opacity="0.3" stroke-width="1.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.35s" fill="freeze"/></rect>
  ${T(250,128,'CP  =  ₹200',cG,18,'800','middle',0.5)}
  <line x1="20" y1="155" x2="480" y2="155" stroke="${cA}" stroke-opacity="0.5" stroke-width="2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.7s" fill="freeze"/></line>
  ${BOX(100,162,300,50,cA,0.8,'Profit  =  SP − CP','₹260 − ₹200  =  ₹60')}`,

// S3 — Profit% formula
()=>`${VD}
  ${BOX(20,20,460,75,cA,0.1,'Profit% Formula (ALWAYS on CP!)','')}
  ${T(250,68,'Profit%  =  (Profit ÷ CP) × 100',cA,20,'900','middle',0.2)}
  ${BOX(20,112,140,70,cP,0.4,'Profit','₹60')}
  ${BOX(180,112,140,70,cG,0.55,'CP','₹200')}
  <polygon points="332,145 346,139 346,151" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze"/></polygon>
  ${BOX(355,112,125,70,cA,0.75,'Result','30%')}
  ${T(250,200,'60 ÷ 200 × 100  =  30%  →  Similarly Loss% = (Loss ÷ CP) × 100',cD,10,'400','middle',1.1)}`,

// S4 — SP = CP × (1+P%/100)
()=>`${VD}
  ${T(250,18,'SP from CP when Profit% is known',cG,14,'700','middle',0.1)}
  ${BOX(20,38,460,72,cG,0.15,'Multiplying Factor Method','')}
  ${T(250,78,'SP  =  CP  ×  (1  +  P% / 100)',cG,20,'900','middle',0.3)}
  ${BOX(20,128,130,70,cP,0.5,'CP','₹500')}
  ${BOX(170,128,120,70,cA,0.6,'P%','20%')}
  <polygon points="302,162 316,156 316,168" fill="${cG}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze"/></polygon>
  ${T(310,160,'→',cG,14,'800','middle',0.8)}
  ${BOX(330,128,150,70,cG,0.8,'SP','500×1.2 = ₹600')}
  ${T(250,215,'Factor = 1 + 20/100 = 1.20  |  For Loss: Factor = 1 − L%/100',cD,10,'400','middle',1.2)}`,

// S5 — SP = CP × (1−L%/100)
()=>`${VD}
  ${T(250,18,'SP from CP when Loss% is known',cR,14,'700','middle',0.1)}
  ${BOX(20,38,460,72,cR,0.15,'Loss Multiplying Factor','')}
  ${T(250,78,'SP  =  CP  ×  (1  −  L% / 100)',cR,20,'900','middle',0.3)}
  ${BOX(20,128,130,70,cP,0.5,'CP','₹500')}
  ${BOX(170,128,120,70,cA,0.6,'L%','10%')}
  <polygon points="302,162 316,156 316,168" fill="${cR}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze"/></polygon>
  ${BOX(330,128,150,70,cR,0.8,'SP','500×0.9 = ₹450')}
  ${T(250,215,'Factor = 1 − 10/100 = 0.90  |  SP always less than CP in loss',cD,10,'400','middle',1.2)}`,

// S6 — CP from SP reverse
()=>`${VD}
  ${T(250,18,'Reverse: Find CP from SP',cB,14,'700','middle',0.1)}
  ${BOX(20,38,220,72,cG,0.15,'When Profit%','')}
  ${T(130,78,'CP = SP × 100 / (100 + P%)',cG,13,'700','middle',0.3)}
  ${BOX(260,38,220,72,cR,0.3,'When Loss%','')}
  ${T(370,78,'CP = SP × 100 / (100 − L%)',cR,13,'700','middle',0.45)}
  ${T(250,130,'Example: SP = ₹720, Profit = 20%',cD,12,'500','middle',0.7)}
  ${BOX(80,142,340,55,cA,0.8,'CP = 720 × 100 / 120 =','₹600')}
  ${T(250,215,'Two same SP items: P% & L% same → Always net LOSS = (x/10)²%',cD,10,'400','middle',1.2)}`
];

/* ── Topic 9: Time & Distance ── */
const SV9=[
// S0 — DST Triangle
()=>`${VD}
  <polygon points="250,16 68,190 432,190" fill="${cP}" fill-opacity="0.05" stroke="${cP}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="600" stroke-dashoffset="600"><animate attributeName="stroke-dashoffset" from="600" to="0" dur="0.9s" begin="0.1s" fill="freeze"/></polygon>
  <line x1="78" y1="148" x2="422" y2="148" stroke="${cP}" stroke-opacity="0.28" stroke-width="1.5" stroke-dasharray="6,4" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.9s" fill="freeze"/></line>
  ${BOX(203,16,94,50,cP,0.9,'','')} ${T(250,50,'D',cP,28,'900','middle',1.1)}
  ${BOX(68,148,138,50,cG,1.1,'','')} ${T(137,181,'S',cG,28,'900','middle',1.2)}
  ${BOX(294,148,138,50,cA,1.1,'','')} ${T(363,181,'T',cA,28,'900','middle',1.2)}
  ${T(250,108,'D  =  S  ×  T',cT,14,'600','middle',1.3)}
  ${T(250,128,'S  =  D  ÷  T    |    T  =  D  ÷  S',cD,11,'400','middle',1.4)}`,

// S1 — Unit conversion
()=>`${VD}
  ${T(250,20,'Unit Conversion — MUST remember!',cA,15,'800','middle',0.1)}
  ${BOX(25,40,210,70,cP,0.2,'km/h  →  m/s','× 5 / 18')}
  <polygon points="248,72 262,66 262,78" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.5s" fill="freeze"/></polygon>
  <polygon points="262,72 248,66 248,78" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.55s" fill="freeze"/></polygon>
  ${BOX(275,40,200,70,cG,0.35,'m/s  →  km/h','× 18 / 5')}
  ${T(250,132,'Example:',cD,11,'500','middle',0.7)}
  ${BOX(25,142,210,55,cP,0.75,'72 km/h','72 × 5/18 = 20 m/s')}
  ${BOX(275,142,200,55,cG,0.85,'25 m/s','25 × 18/5 = 90 km/h')}
  ${T(250,215,'Tip: 36 km/h = 10 m/s  (easy reference point)',cD,10,'400','middle',1.1)}`,

// S2 — Relative speed
()=>`${VD}
  ${T(250,16,'Relative Speed — Trains & Objects',cB,14,'800','middle',0.1)}
  ${T(130,40,'Same Direction ↓',cP,11,'700','middle',0.2)}
  <rect x="30" y="52" width="80" height="24" rx="5" fill="${cP}" fill-opacity="0.6"><animate attributeName="x" from="30" to="140" dur="1.2s" begin="0.3s" fill="freeze"/></rect>
  <rect x="30" y="80" width="60" height="24" rx="5" fill="${cB}" fill-opacity="0.5"><animate attributeName="x" from="30" to="100" dur="1.2s" begin="0.3s" fill="freeze"/></rect>
  ${T(130,120,'Relative = S₁ − S₂',cP,11,'700','middle',1)}
  ${T(380,40,'Opposite Direction ↓',cG,11,'700','middle',0.2)}
  <rect x="280" y="52" width="80" height="24" rx="5" fill="${cG}" fill-opacity="0.6"><animate attributeName="x" from="280" to="390" dur="1.2s" begin="0.3s" fill="freeze"/></rect>
  <rect x="480" y="80" width="60" height="24" rx="5" fill="${cR}" fill-opacity="0.5"><animate attributeName="x" from="480" to="370" dur="1.2s" begin="0.3s" fill="freeze"/></rect>
  ${T(380,120,'Relative = S₁ + S₂',cG,11,'700','middle',1)}
  ${T(250,155,'Train problems:',cD,11,'600','middle',1.2)}
  ${T(250,175,'Same dir: gap closes at (S₁−S₂)  |  Opp dir: gap closes at (S₁+S₂)',cD,10,'400','middle',1.3)}`,

// S3 — Train crossing
()=>`${VD}
  ${T(250,16,'Train Crossing — What distance?',cA,14,'800','middle',0.1)}
  <rect x="40" y="45" width="150" height="30" rx="5" fill="${cP}" fill-opacity="0.5" stroke="${cP}" stroke-opacity="0.4" stroke-width="1.5"/>
  ${T(115,64,'Train = 200m',cT,10,'600','middle',0.3)}
  <rect x="190" y="45" width="100" height="30" rx="5" fill="${cG}" fill-opacity="0.3" stroke="${cG}" stroke-opacity="0.3" stroke-width="1.5"/>
  ${T(240,64,'Platform',cT,9,'500','middle',0.4)}
  ${LN(40,90,290,90,cA,0.5,2)}
  ${T(165,105,'Total distance = Train + Platform = 200 + 100 = 300m',cA,10,'600','middle',0.7)}
  ${T(250,132,'Crossing a POLE → distance = train length only',cD,11,'500','middle',0.9)}
  ${T(250,152,'Crossing PLATFORM → distance = train + platform',cP,11,'500','middle',1)}
  ${T(250,172,'Crossing another TRAIN → distance = both trains added',cG,11,'500','middle',1.1)}
  ${T(250,200,'Time = Total distance ÷ Speed',cA,12,'700','middle',1.3)}`,

// S4 — Boats & Streams
()=>`${VD}
  ${T(250,16,'Boats & Streams',cB,15,'800','middle',0.1)}
  <rect x="20" y="104" width="460" height="22" rx="4" fill="${cB}" fill-opacity="0.15" stroke="${cB}" stroke-opacity="0.2" stroke-width="1"/>
  ${T(250,118,'~ ~ ~ ~ ~ River Current (v) ~ ~ ~ ~ ~',cB,9,'400','middle',0.2)}
  ${BOX(25,34,195,62,cG,0.25,'Downstream','Speed = u + v')}
  <polygon points="225,62 240,55 240,69" fill="${cG}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.6s" fill="freeze"/></polygon>
  ${BOX(280,34,195,62,cR,0.4,'Upstream','Speed = u − v')}
  <polygon points="280,62 265,55 265,69" fill="${cR}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze"/></polygon>
  ${T(250,142,'u = boat speed in still water  |  v = current speed',cD,11,'400','middle',1)}
  ${BOX(25,155,210,55,cP,1.1,'Find boat speed','u = (DS + US) / 2')}
  ${BOX(265,155,210,55,cA,1.2,'Find current','v = (DS − US) / 2')}`,

// S5 — Average speed
()=>`${VD}
  ${T(250,18,'Average Speed for EQUAL distances',cA,15,'800','middle',0.1)}
  ${BOX(20,40,460,72,cR,0.15,'Common TRAP — it is NOT (S₁+S₂)/2 !','')}
  ${T(250,80,'Avg Speed  =  2 × S₁ × S₂  /  (S₁ + S₂)',cA,18,'800','middle',0.3)}
  ${T(250,118,'Example: first half at 40 km/h, second half at 60 km/h',cD,11,'500','middle',0.6)}
  ${BOX(25,132,220,55,cR,0.7,'WRONG: simple avg','(40+60)/2 = 50 ✗')}
  ${BOX(260,132,220,55,cG,0.8,'CORRECT: harmonic','2×40×60/100 = 48 ✓')}
  ${T(250,205,'This formula works ONLY for equal distances (not equal times!)',cD,10,'400','middle',1.1)}`,

// S6 — Meeting problems
()=>`${VD}
  ${T(250,18,'Meeting & Chasing Problems',cG,14,'800','middle',0.1)}
  ${DOT(50,80,cP,0.3,8)} ${T(50,68,'A',cP,12,'700','middle',0.3)}
  ${DOT(450,80,cG,0.4,8)} ${T(450,68,'B',cG,12,'700','middle',0.4)}
  ${LN(50,80,450,80,cD,0.5,1.5)}
  ${T(250,74,'← 400 km →',cD,10,'400','middle',0.6)}
  <polygon points="60,80 120,75 120,85" fill="${cP}" fill-opacity="0.6" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.7s" fill="freeze"/></polygon>
  <polygon points="440,80 380,75 380,85" fill="${cG}" fill-opacity="0.6" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.8s" fill="freeze"/></polygon>
  ${T(90,98,'50 km/h →',cP,10,'600','middle',0.75)}
  ${T(410,98,'← 30 km/h',cG,10,'600','middle',0.85)}
  ${DOT(250,80,cA,1.0,8)}
  ${T(250,106,'Meet here!',cA,11,'700','middle',1.1)}
  ${T(250,140,'Opposite dir: Time = Distance / (S₁ + S₂) = 400/80 = 5 hrs',cD,11,'500','middle',1.2)}
  ${T(250,165,'Same dir (chase): Time = Gap / (S₁ − S₂)',cD,11,'500','middle',1.3)}
  ${T(250,190,'In meeting: A covers D₁ = S₁×T  |  B covers D₂ = S₂×T  |  D₁+D₂ = Total',cD,10,'400','middle',1.4)}`
];

/* ── Topic 10: Time & Work ── */
const SV10=[
// S0 — W = T × E
()=>`${VD}
  ${T(250,20,'Work = Time × Efficiency',cP,16,'800','middle',0.1)}
  ${BOX(30,40,130,70,cP,0.2,'Work (W)','= 1 (total)')}
  ${T(170,72,'=',cD,22,'800','middle',0.5)}
  ${BOX(185,40,130,70,cA,0.35,'Time (T)','days / hrs')}
  ${T(325,72,'×',cD,22,'800','middle',0.6)}
  ${BOX(340,40,140,70,cG,0.45,'Efficiency (E)','work per day')}
  ${T(250,132,'If A finishes in 10 days → E = W/T = 1/10 per day',cD,11,'500','middle',0.8)}
  ${T(250,155,'More efficient → Less time (inverse relation)',cA,11,'500','middle',0.9)}
  <rect x="30" y="170" width="440" height="38" rx="7" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1s" fill="freeze"/></rect>
  ${T(250,194,'Key:  E = 1/n  where n = number of days to finish alone',cA,11,'600','middle',1.1)}`,

// S1 — 1-day work
()=>`${VD}
  ${T(250,20,'1-Day Work = 1/n',cG,16,'800','middle',0.1)}
  ${T(250,42,'If someone finishes job in n days → per-day work = 1/n',cD,11,'500','middle',0.25)}
  ${BOX(20,58,140,55,cP,0.3,'A: 10 days','1/10 per day')}
  ${BOX(180,58,140,55,cG,0.4,'B: 15 days','1/15 per day')}
  ${BOX(340,58,140,55,cB,0.5,'C: 20 days','1/20 per day')}
  ${T(250,132,'n days ka kaam = n × (1/n) = 1 (poora)',cD,11,'500','middle',0.7)}
  <rect x="20" y="145" width="460" height="28" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="20" y="145" width="0" height="28" rx="5" fill="${cP}" fill-opacity="0.6"><animate attributeName="width" from="0" to="460" dur="1.5s" begin="0.5s" fill="freeze"/></rect>
  ${T(250,163,'A fills 1/10 every day → full in 10 days',cT,10,'500','middle',1.5)}
  ${T(250,195,'Total days = 1 ÷ efficiency = 1 ÷ (1/10) = 10 days',cA,11,'600','middle',1.7)}`,

// S2 — Combined work
()=>`${VD}
  ${T(250,18,'Combined Work — Add Efficiencies',cA,15,'800','middle',0.1)}
  ${T(30,42,'A: 1/10 per day',cP,12,'600','start',0.2)}
  <rect x="30" y="50" width="440" height="22" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <rect x="30" y="50" width="0" height="22" rx="4" fill="${cP}" fill-opacity="0.65"><animate attributeName="width" from="0" to="440" dur="1.2s" begin="0.3s" fill="freeze"/></rect>
  ${T(30,92,'B: 1/15 per day',cG,12,'600','start',0.4)}
  <rect x="30" y="100" width="440" height="22" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <rect x="30" y="100" width="0" height="22" rx="4" fill="${cG}" fill-opacity="0.6"><animate attributeName="width" from="0" to="440" dur="1.6s" begin="0.5s" fill="freeze"/></rect>
  ${T(30,142,'Together: 1/10 + 1/15 = 1/6 per day',cA,12,'600','start',0.7)}
  <rect x="30" y="150" width="0" height="22" rx="4" fill="${cA}" fill-opacity="0.75"><animate attributeName="width" from="0" to="440" dur="0.8s" begin="0.8s" fill="freeze"/></rect>
  ${BOX(100,180,300,35,cG,1.3,'Days together = ab/(a+b) = 10×15/25 =','6 days')}`,

// S3 — LCM Method
()=>`${VD}
  ${T(250,16,'LCM Method — Fastest!',cA,15,'800','middle',0.1)}
  ${BOX(15,32,140,52,cP,0.15,'A: 10 days','eff?')} ${BOX(180,32,140,52,cG,0.25,'B: 15 days','eff?')} ${BOX(345,32,140,52,cA,0.35,'Total Work','LCM(10,15)=30')}
  ${LN(155,58,180,58,cD,0.4,1.5)} ${LN(320,58,345,58,cD,0.45,1.5)}
  ${BOX(15,100,140,52,cP,0.55,'A eff','30÷10 = 3/day')} ${BOX(180,100,140,52,cG,0.65,'B eff','30÷15 = 2/day')} ${BOX(345,100,140,52,cB,0.75,'Combined','3+2 = 5/day')}
  ${LN(155,126,180,126,cD,0.8,1.5)} ${LN(320,126,345,126,cD,0.85,1.5)}
  ${T(250,175,'Days together = Total ÷ Combined = 30 ÷ 5 =',cD,11,'400','middle',1.1)}
  ${T(450,175,'6',cG,20,'900','middle',1.2)}
  ${T(250,200,'LCM avoids fractions! Integer efficiencies → simple arithmetic',cD,10,'400','middle',1.3)}`,

// S4 — Men-Days
()=>`${VD}
  ${T(250,20,'Men × Days = Constant',cB,16,'800','middle',0.1)}
  ${BOX(20,42,210,70,cP,0.2,'Scenario 1','M₁ × T₁')}
  ${T(250,76,'=',cA,28,'900','middle',0.5)}
  ${BOX(270,42,210,70,cG,0.35,'Scenario 2','M₂ × T₂')}
  ${T(250,132,'5 men × 12 days = 60 man-days of work',cD,11,'500','middle',0.7)}
  ${T(250,155,'Same work → 10 men × ? days → ? = 60/10 = 6 days',cA,11,'500','middle',0.85)}
  ${T(250,185,'Extended: M₁ × T₁ × H₁ = M₂ × T₂ × H₂  (H = hours per day)',cD,10,'400','middle',1)}
  ${T(250,205,'Double workers → Half time  |  Inverse proportion',cD,10,'400','middle',1.1)}`,

// S5 — Efficiency:Time inverse
()=>`${VD}
  ${T(250,18,'Efficiency & Time — Inverse Relation',cP,14,'800','middle',0.1)}
  ${AXIS(30,35,200,140)}
  ${BAR(50,175,55,80,cP,0.2,'E = 3')} ${BAR(130,175,55,120,cG,0.35,'E = 5')}
  ${T(130,36,'Efficiency',cD,10,'600','middle',0.1)}
  ${AXIS(270,35,200,140)}
  ${BAR(290,175,55,120,cP,0.5,'T = 10')} ${BAR(370,175,55,72,cG,0.65,'T = 6')}
  ${T(370,36,'Time (days)',cD,10,'600','middle',0.1)}
  ${T(250,195,'Higher efficiency → Less time  |  E × T = constant work',cD,11,'500','middle',0.9)}
  ${T(250,215,'E_A : E_B = m : n  ↔  T_A : T_B = n : m',cA,11,'700','middle',1.1)}`,

// S6 — Pipes
()=>`${VD}
  ${T(250,18,'Pipes & Cisterns',cB,16,'800','middle',0.1)}
  <rect x="150" y="55" width="200" height="130" rx="8" fill="${cB}" fill-opacity="0.08" stroke="${cB}" stroke-opacity="0.3" stroke-width="2"/>
  ${T(250,130,'Cistern / Tank',cB,11,'500','middle',0.3)}
  <rect x="140" y="40" width="20" height="50" rx="3" fill="${cG}" fill-opacity="0.6" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.4s" fill="freeze"/></rect>
  ${T(125,58,'Inlet',cG,9,'600','middle',0.5)} ${T(125,72,'+1/t₁',cG,10,'700','middle',0.55)}
  <rect x="340" y="140" width="20" height="50" rx="3" fill="${cR}" fill-opacity="0.6" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.6s" fill="freeze"/></rect>
  ${T(385,165,'Outlet',cR,9,'600','middle',0.65)} ${T(385,179,'−1/t₂',cR,10,'700','middle',0.7)}
  ${T(250,205,'Net rate = Σ inlets − Σ outlets  |  Fill time = 1 / net rate',cD,10,'400','middle',1)}
  ${T(250,220,'If net > 0 → fills  |  If net < 0 → empties',cD,10,'400','middle',1.1)}`
];

/* ── Topic 11: Percentage ── */
const SV11=[
// S0 — What is %
()=>`${VD}
  ${T(250,18,'Percentage = "Per Hundred"',cP,16,'800','middle',0.1)}
  ${Array.from({length:100},(_,i)=>{
    const col=i%10,row=Math.floor(i/10),x=30+col*28,y=35+row*14;
    return '<rect x="'+x+'" y="'+y+'" width="25" height="11" rx="2" fill="'+(i<35?cP:'rgba(255,255,255,0.06)')+'" fill-opacity="'+(i<35?0.7:1)+'" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.12s" begin="'+i*0.012+'s" fill="freeze"/></rect>';
  }).join('')}
  ${T(180,188,'35 of 100  =  35%',cP,13,'700','middle',1.3)}
  ${T(400,55,'Fraction → %:',cD,10,'600','middle',0.4)}
  ${T(400,75,'3/4 = 75%',cG,11,'600','middle',0.5)}
  ${T(400,95,'1/5 = 20%',cA,11,'600','middle',0.6)}
  ${T(400,115,'2/3 ≈ 66.7%',cB,11,'600','middle',0.7)}
  ${T(400,145,'Decimal → %:',cD,10,'600','middle',0.8)}
  ${T(400,165,'0.25 = 25%',cP,11,'600','middle',0.9)}`,

// S1 — P% of X
()=>`${VD}
  ${BOX(20,22,460,80,cA,0.1,'P% of X = ?','')}
  ${T(250,72,'P  ×  X  ÷  100',cA,24,'900','middle',0.2)}
  ${BOX(20,118,130,70,cP,0.35,'P','25%')}
  ${T(158,150,'×',cD,18,'800','middle',0.5)}
  ${BOX(170,118,130,70,cG,0.45,'X','200')}
  ${T(308,150,'÷ 100 =',cD,14,'600','middle',0.6)}
  ${BOX(340,118,140,70,cA,0.55,'Answer','50')}
  ${T(250,210,'25% of 200 = 25 × 200 ÷ 100 = 50',cD,11,'400','middle',0.9)}`,

// S2 — X is what% of Y
()=>`${VD}
  ${T(250,22,'X is what % of Y?',cG,16,'800','middle',0.1)}
  ${BOX(20,42,460,75,cG,0.15,'Formula','')}
  ${T(250,82,'% = (X / Y) × 100',cG,22,'900','middle',0.25)}
  ${BOX(20,135,130,65,cP,0.4,'X (part)','45')}
  ${T(160,164,'÷',cD,18,'800','middle',0.55)}
  ${BOX(175,135,130,65,cB,0.5,'Y (whole)','200')}
  ${T(315,164,'× 100 =',cD,13,'600','middle',0.65)}
  ${BOX(345,135,135,65,cA,0.7,'Result','22.5%')}
  ${T(250,218,'45 is 22.5% of 200',cD,10,'400','middle',1)}`,

// S3 — % change
()=>`${VD}
  ${T(250,18,'Percentage Change Formula',cA,15,'800','middle',0.1)}
  ${BOX(20,35,460,72,cA,0.15,'','')}
  ${T(250,75,'% Change = (New − Old) / Old × 100',cA,18,'900','middle',0.25)}
  ${AXIS(25,110,200,88)} ${BAR(45,198,65,65,cP,0.4,'Old=80')} ${BAR(140,198,65,82,cG,0.55,'New=100')}
  ${LN(205,116,205,155,cA,0.75,1.5)} ${LN(140,116,205,116,cA,0.8,1.5)}
  ${T(218,135,'+20',cA,12,'800','start',0.9)}
  ${BOX(265,115,215,75,cG,0.85,'% increase','(100−80)/80 × 100 = 25%')}
  ${T(250,218,'Increase → positive  |  Decrease → negative',cD,10,'400','middle',1.2)}`,

// S4 — Successive %
()=>`${VD}
  ${T(250,18,'Successive Percentage Changes',cR,15,'800','middle',0.1)}
  ${BOX(15,38,130,55,cP,0.15,'Start','₹100')}
  <polygon points="155,62 168,56 168,68" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.35s" fill="freeze"/></polygon>
  ${T(162,50,'+10%',cA,10,'700','middle',0.4)}
  ${BOX(180,38,120,55,cG,0.35,'After 1st','₹110')}
  <polygon points="310,62 323,56 323,68" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.55s" fill="freeze"/></polygon>
  ${T(318,50,'-10%',cR,10,'700','middle',0.6)}
  ${BOX(335,38,150,55,cR,0.55,'After 2nd','110×0.9=₹99')}
  ${BOX(15,108,460,55,cR,0.7,'TRAP: +10% then −10% ≠ 0% change!  Actually = −1%','')}
  ${T(250,142,'Multiply factors:  1.10  ×  0.90  =  0.99  →  1% LOSS',cR,11,'600','middle',0.85)}
  ${T(250,180,'Net effect formula:  a + b + ab/100  (for two successive changes)',cD,11,'400','middle',1)}
  ${T(250,200,'+10% −10%  →  10 + (−10) + (10×−10)/100 = −1%',cA,10,'400','middle',1.1)}`,

// S5 — Quick conversions
()=>`${VD}
  ${T(250,16,'Must-Know % ↔ Fraction Conversions',cB,14,'800','middle',0.1)}
  ${[['10%','1/10',cP],['12.5%','1/8',cG],['20%','1/5',cA],['25%','1/4',cB],['33.3%','1/3','#a78bfa'],['50%','1/2',cP],['66.7%','2/3',cG],['75%','3/4',cA]].map(([p,f,c],i)=>{
    const x=15+(i%4)*120,y=i<4?38:108;
    return BOX(x,y,110,58,c,0.15+i*0.08,p,f);
  }).join('')}
  ${T(250,185,'Knowing these saves 30+ seconds in exams!',cD,11,'500','middle',1)}
  ${T(250,205,'+10% → ×1.1  |  −20% → ×0.8  |  +33.3% → ×4/3  |  −25% → ×3/4',cA,10,'400','middle',1.1)}`,

// S6 — Reverse % calc
()=>`${VD}
  ${T(250,18,'Reverse Percentage — Find Original',cP,14,'800','middle',0.1)}
  ${T(250,42,'If after 20% increase value is 600, what was original?',cD,11,'500','middle',0.25)}
  ${BOX(20,56,140,65,cP,0.3,'Original','= ?')}
  <polygon points="172,86 186,80 186,92" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.55s" fill="freeze"/></polygon>
  ${T(178,76,'+20%',cA,10,'700','middle',0.6)}
  ${BOX(200,56,140,65,cG,0.45,'New value','600')}
  <polygon points="352,86 366,80 366,92" fill="${cA}" fill-opacity="0.7" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.75s" fill="freeze"/></polygon>
  ${BOX(375,56,105,65,cA,0.65,'Original','= 500')}
  ${T(250,142,'Original = New × 100 / (100 + increase%)',cP,12,'700','middle',0.9)}
  ${T(250,165,'= 600 × 100 / 120  =  500',cA,12,'700','middle',1)}
  ${T(250,195,'For decrease: Original = New × 100 / (100 − decrease%)',cD,10,'400','middle',1.15)}`
];

/* ── Topic 12: Ratio & Proportion ── */
const SV12=[
// S0 — What is ratio
()=>`${VD}
  ${T(250,22,'Ratio — Comparing Two Quantities',cP,15,'800','middle',0.1)}
  ${T(250,42,'Ratio a:b means "for every a of first, there are b of second"',cD,11,'400','middle',0.25)}
  <rect x="25" y="60" width="450" height="55" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <rect x="25" y="60" width="0" height="55" rx="10" fill="${cP}" fill-opacity="0.65"><animate attributeName="width" from="0" to="193" dur="0.6s" begin="0.3s" fill="freeze"/></rect>
  ${T(120,90,'A = 3 parts',cT,13,'700','middle',0.8)}
  <rect x="218" y="60" width="0" height="55" rx="10" fill="${cG}" fill-opacity="0.6"><animate attributeName="width" from="0" to="257" dur="0.6s" begin="0.5s" fill="freeze"/></rect>
  ${T(346,90,'B = 4 parts',cT,13,'700','middle',1)}
  <line x1="218" y1="52" x2="218" y2="122" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  ${T(250,135,'Ratio  A : B  =  3 : 4  →  Total = 7 parts',cP,12,'700','middle',1.1)}
  ${T(250,158,'A gets 3/7 of total  |  B gets 4/7 of total',cD,11,'400','middle',1.2)}
  ${T(250,180,'If total = ₹700 → A = ₹300, B = ₹400',cA,12,'700','middle',1.3)}`,

// S1 — Mixed → Improper
()=>`${VD}
  ${T(250,20,'Ratio as Fraction  |  Simplify by HCF',cG,14,'800','middle',0.1)}
  ${BOX(20,42,210,65,cP,0.2,'a : b  written as','a / b')}
  ${BOX(270,42,210,65,cG,0.35,'Always simplify','12 : 8  →  3 : 2')}
  ${T(250,128,'Divide both sides by HCF:',cD,11,'500','middle',0.6)}
  ${BOX(50,140,400,55,cA,0.7,'HCF(12, 8) = 4  →  12÷4 : 8÷4  =  3 : 2','✓ Simplest')}`,

// S2 — Proportion
()=>`${VD}
  ${T(250,18,'Proportion — Two Equal Ratios',cA,15,'800','middle',0.1)}
  ${BOX(20,38,200,65,cP,0.15,'Ratio 1','a / b')}
  ${T(234,68,'=',cA,24,'900','middle',0.4)}
  ${BOX(260,38,220,65,cG,0.3,'Ratio 2','c / d')}
  ${T(250,120,'Cross multiply to check or solve:',cD,12,'500','middle',0.6)}
  ${BOX(50,135,400,55,cA,0.7,'a × d  =  b × c    (product of extremes = product of means)','ad = bc')}
  ${T(250,210,'3/5 = 6/10  →  3×10 = 5×6  →  30 = 30 ✓',cD,11,'400','middle',1)}`,

// S3 — Direct proportion
()=>`${VD}
  ${T(250,20,'Direct & Inverse Proportion',cB,15,'800','middle',0.1)}
  ${BOX(15,40,225,75,cG,0.2,'Direct: a↑ then b↑','More work → More pay')}
  ${BOX(260,40,225,75,cR,0.35,'Inverse: a↑ then b↓','More workers → Less days')}
  ${T(250,135,'Direct: a/b = constant  |  Inverse: a × b = constant',cD,11,'500','middle',0.6)}
  ${T(250,160,'Example: 5 pens cost ₹50 → 10 pens = ₹100 (direct)',cG,10,'400','middle',0.8)}
  ${T(250,180,'Example: 4 workers do job in 12 days → 6 workers = 8 days (inverse)',cR,10,'400','middle',0.9)}`,

// S4 — Third/Fourth proportional
()=>`${VD}
  ${T(250,20,'Third & Fourth Proportional',cP,14,'800','middle',0.1)}
  ${BOX(20,42,460,65,cP,0.15,'Fourth Proportional: a:b :: c:x  →  x = bc/a','')}
  ${T(250,78,'x  =  b × c  ÷  a',cP,18,'800','middle',0.3)}
  ${T(250,125,'Example: 2:3 :: 4:x  →  x = 3×4/2 = 6',cD,11,'500','middle',0.5)}
  ${BOX(20,142,460,55,cG,0.6,'Third Proportional: a:b :: b:x  →  x = b²/a','= b²/a')}
  ${T(250,215,'Mean Proportional of a,b = √(ab)',cA,11,'500','middle',0.9)}`,

// S5 — Dividing in ratio
()=>`${VD}
  ${T(250,18,'Dividing a Quantity in Given Ratio',cA,14,'800','middle',0.1)}
  ${T(250,40,'Divide ₹1000 in ratio 2 : 3',cD,11,'500','middle',0.25)}
  ${T(250,60,'Total parts = 2+3 = 5',cD,11,'400','middle',0.35)}
  <rect x="30" y="72" width="440" height="50" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <rect x="30" y="72" width="0" height="50" rx="10" fill="${cP}" fill-opacity="0.65"><animate attributeName="width" from="0" to="176" dur="0.6s" begin="0.4s" fill="freeze"/></rect>
  ${T(118,100,'2/5 × 1000 = ₹400',cT,11,'600','middle',0.9)}
  <rect x="206" y="72" width="0" height="50" rx="10" fill="${cG}" fill-opacity="0.6"><animate attributeName="width" from="0" to="264" dur="0.6s" begin="0.55s" fill="freeze"/></rect>
  ${T(338,100,'3/5 × 1000 = ₹600',cT,11,'600','middle',1.05)}
  ${T(250,145,'Share = (own ratio / total) × Quantity',cA,12,'700','middle',1.2)}
  ${T(250,170,'3-way: a:b:c → A = a/(a+b+c) × Total',cD,10,'400','middle',1.3)}`,

// S6 — Cross multiply to compare
()=>`${VD}
  ${T(250,20,'Comparing Fractions via Cross Multiply',cG,14,'800','middle',0.1)}
  ${BOX(50,42,160,65,cP,0.2,'Fraction A','3 / 5')}
  ${T(250,72,'vs',cD,14,'700','middle',0.4)}
  ${BOX(290,42,160,65,cG,0.35,'Fraction B','4 / 7')}
  ${T(250,128,'Cross multiply:',cD,12,'600','middle',0.6)}
  ${BOX(30,140,200,55,cA,0.65,'3 × 7','= 21')}
  ${T(250,164,'vs',cD,13,'700','middle',0.85)}
  ${BOX(270,140,200,55,cB,0.75,'4 × 5','= 20')}
  ${T(250,215,'21 > 20  →  3/5 > 4/7    (bigger cross product → bigger fraction)',cG,11,'600','middle',1)}`
];

/* ── Topic 14: Averages ── */
const SV14=[
// S0 — What is average
()=>`${VD}
  ${T(250,18,'Average = Sum ÷ Count',cA,16,'800','middle',0.1)}
  ${AXIS(30,28,430,148)} ${GRID(30,28,430,148,5,4)}
  ${[[50,cP],[80,cP],[65,cP],[40,cP],[95,cP]].map(([h,c],i)=>BAR(48+i*80,176,55,h,c,0.1+i*0.1)).join('')}
  <line x1="30" y1="110" x2="465" y2="110" stroke="${cA}" stroke-width="2" stroke-dasharray="8,5" stroke-dashoffset="450"><animate attributeName="stroke-dashoffset" from="450" to="0" dur="0.6s" begin="1s" fill="freeze"/></line>
  ${T(475,114,'Avg',cA,10,'700','start',1.2)}
  ${T(250,200,'(50+80+65+40+95)/5 = 330/5 = 66',cD,10,'400','middle',1.4)}`,

// rest use auto
];

/* ── Topic 15: Interest ── */
const SV15=[
// S0 — SI vs CI concept
()=>`${VD}
  ${AXIS(30,22,440,158)} ${GRID(30,22,440,158,5,4)}
  ${T(128,18,'Simple Interest (flat)',cB,10,'600','middle',0.1)}
  ${T(378,18,'Compound Interest (grows!)',cP,10,'600','middle',0.1)}
  <line x1="248" y1="12" x2="248" y2="188" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="5,4"/>
  ${[1,2,3].map((_,i)=>BAR(48+i*55,180,40,78,cB,0.1+i*0.15,'₹100')).join('')}
  ${[[78,'₹100'],[86,'₹110'],[96,'₹121']].map(([h,v],i)=>BAR(268+i*55,180,40,h,cP,0.3+i*0.15,v)).join('')}
  ${T(126,198,'Yr1 Yr2 Yr3',cD,9,'400','middle',0.8)}
  ${T(370,198,'Yr1 Yr2 Yr3',cD,9,'400','middle',1)}
  ${T(250,215,'SI = constant | CI grows — interest on interest!',cD,10,'400','middle',1.4)}`,

// S1 — SI formula
()=>`${VD}
  ${T(250,20,'Simple Interest Formula',cB,16,'800','middle',0.1)}
  ${BOX(30,40,440,78,cB,0.15,'','')}
  ${T(250,82,'SI  =  P × R × T  /  100',cB,24,'900','middle',0.3)}
  ${BOX(20,135,105,60,cP,0.4,'P (Principal)','₹1000')}
  ${BOX(140,135,95,60,cG,0.5,'R (Rate)','10%')}
  ${BOX(250,135,90,60,cA,0.6,'T (Time)','3 yrs')}
  ${BOX(360,135,120,60,cB,0.7,'SI','₹300')}
  ${T(250,215,'SI = 1000×10×3/100 = ₹300  |  Amount = P + SI = ₹1300',cD,10,'400','middle',1)}`,

// S2 — CI formula
()=>`${VD}
  ${T(250,20,'Compound Interest Formula',cP,16,'800','middle',0.1)}
  ${BOX(20,40,460,78,cP,0.15,'','')}
  ${T(250,68,'A = P × (1 + R/100)',cP,20,'900','middle',0.25)}
  ${T(385,82,'n',cP,12,'800','middle',0.3)}
  ${T(250,95,'CI = A − P',cD,12,'500','middle',0.35)}
  ${BOX(20,135,105,65,cP,0.45,'P','₹1000')}
  ${BOX(140,135,95,65,cG,0.55,'R','10%')}
  ${BOX(250,135,75,65,cA,0.65,'n','3 yrs')}
  ${BOX(340,135,140,65,cB,0.75,'Amount','₹1331')}
  ${T(250,218,'A = 1000×(1.1)³ = 1331  |  CI = 1331−1000 = ₹331',cD,10,'400','middle',1)}`,
];

/* ── Topic 4: HCF & LCM ── */
const SV4=[
// S0 — Prime factorization
()=>`${VD}
  ${T(250,18,'HCF & LCM via Prime Factorisation',cP,14,'800','middle',0.1)}
  ${T(120,42,'12 =',cP,14,'700','middle',0.2)}
  ${BOX(145,28,38,30,cA,0.3,'','2')} ${T(187,42,'×',cD,12,'600','middle',0.35)} ${BOX(195,28,38,30,cA,0.38,'','2')} ${T(237,42,'×',cD,12,'600','middle',0.4)} ${BOX(245,28,38,30,cG,0.42,'','3')}
  ${T(120,82,'18 =',cG,14,'700','middle',0.5)}
  ${BOX(145,68,38,30,cA,0.55,'','2')} ${T(187,82,'×',cD,12,'600','middle',0.58)} ${BOX(195,68,38,30,cG,0.6,'','3')} ${T(237,82,'×',cD,12,'600','middle',0.63)} ${BOX(245,68,38,30,cG,0.65,'','3')}
  ${T(380,42,'Common:',cD,10,'500','middle',0.7)}
  ${BOX(370,52,100,35,cA,0.75,'HCF','2 × 3 = 6')}
  ${T(380,105,'All factors:',cD,10,'500','middle',0.8)}
  ${BOX(370,110,100,35,cP,0.85,'LCM','2²×3² = 36')}
  ${T(250,162,'HCF = product of COMMON primes (lowest power)',cD,11,'500','middle',1)}
  ${T(250,182,'LCM = product of ALL primes (highest power)',cD,11,'500','middle',1.1)}
  ${T(250,208,'KEY:  HCF × LCM = Product of the two numbers',cA,11,'700','middle',1.2)}`,
];

/* ── Topic 3: Fractions ── */
const SV3=[
// S0 — Types
()=>`${VD}
  ${T(250,18,'Types of Fractions',cP,16,'800','middle',0.1)}
  ${BOX(15,38,145,65,cP,0.15,'Proper (n < d)','3/4')}
  ${BOX(178,38,145,65,cG,0.25,'Improper (n > d)','7/4')}
  ${BOX(340,38,145,65,cA,0.35,'Mixed','1 ¾')}
  ${T(250,125,'Pie:  ¾ shaded',cD,10,'400','middle',0.5)}
  ${CIR(120,170,40,cP,0.5,2)}
  <path d="M120,170 L120,130 A40,40 0 1,1 91.7,198.3 Z" fill="${cP}" fill-opacity="0.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.7s" fill="freeze"/></path>
  ${T(120,175,'3/4',cP,14,'800','middle',0.9)}
  ${T(300,145,'Bar: 3/5',cD,10,'400','middle',0.5)}
  ${[0,1,2,3,4].map(i=>'<rect x="'+(225+i*45)+'" y="155" width="42" height="38" rx="5" fill="'+(i<3?cG:'rgba(255,255,255,0.06)')+'" fill-opacity="'+(i<3?0.3:1)+'" stroke="'+(i<3?cG:'rgba(255,255,255,0.08)')+'" stroke-opacity="0.4" stroke-width="1.2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="'+(0.5+i*0.08)+'s" fill="freeze"/></rect>').join('')}
  ${T(340,215,'3 of 5 shaded',cD,9,'400','middle',1)}`,
];

// ── STEP_SVG map: [topicId][stepIdx] → fn ──────────────────
const STEP_SVG={
  1:  SV1.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  3:  SV3.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  4:  SV4.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  5:  SV5.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  9:  SV9.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  10: SV10.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  11: SV11.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  12: SV12.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  14: SV14.reduce((o,fn,i)=>(o[i]=fn,o),{}),
  15: SV15.reduce((o,fn,i)=>(o[i]=fn,o),{}),
};

function getStepSvg(tid,si,text,eg,total){
  const fn=STEP_SVG[tid]&&STEP_SVG[tid][si];
  return fn?fn():stepAutoSvg(text,eg,si+1,total);
}

// ── Build interactive step-by-step visual section ───────────
function buildStepVisualSection(t){
  if(!t.steps||!t.steps.length) return '';
  const n=t.steps.length;

  const svgs=t.steps.map((s,i)=>`<div class="svb-step${i===0?' active':''}" data-step="${i}"><svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">${getStepSvg(t.id,i,s,t.stepEgs&&t.stepEgs[i],n)}</svg></div>`).join('');

  const txts=t.steps.map((s,i)=>`<div class="svb-step-text${i===0?' active':''}" data-step="${i}"><div class="svb-num">Step ${i+1}</div><div class="svb-rule">${s}</div>${t.stepEgs&&t.stepEgs[i]?`<div class="svb-eg">💡 ${t.stepEgs[i]}</div>`:''}</div>`).join('');

  const dots=t.steps.map((_,i)=>`<div class="svb-dot${i===0?' active':''}" data-step="${i}"></div>`).join('');

  return `<div class="svb-wrapper">
  <div class="svb-header"><span class="svb-icon">${t.emoji}</span><div class="svb-title">Step-by-Step Visual Explanation</div><div class="svb-counter">Step <span class="svb-curr">1</span> of ${n}</div></div>
  <div class="svb-dots">${dots}</div>
  <div class="svb-display">${svgs}</div>
  <div class="svb-text">${txts}</div>
  <div class="svb-controls"><button class="svb-btn svb-prev" disabled>← Previous</button><button class="svb-btn primary svb-next"${n<=1?' disabled':''}>Next Step →</button></div>
</div><hr class="svb-divider"/>`;
}

// ── Export ──────────────────────────────────────────────────
function buildAptVisualHTML(t) {
  const stepSection = buildStepVisualSection(t);
  const fn = VISUALS[t.id];
  const overview = fn ? fn() : `<div class="vis-wrapper"><div class="vis-card">
    <div class="vis-hdr"><span class="vis-icon">🎨</span>
      <div><div class="vis-name">${t.name}</div><div class="vis-sub">Visual coming soon</div></div>
    </div>
    <div style="padding:2rem;text-align:center;color:var(--text-faint);font-size:0.85rem">Diagram will be added here.</div>
  </div></div>`;
  return stepSection + overview;
}
