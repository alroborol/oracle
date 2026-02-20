// Ported logic from divination.py (simplified for client-side)
const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const trigrams = {
  1:["乾","金","开创、领导、决断"],2:["兑","金","沟通、喜悦、社交"],3:["离","火","表达、曝光、考试"],
  4:["震","木","行动、启动、突破"],5:["巽","木","谈判、营销、渗透"],6:["坎","水","风险、压力、财务"],
  7:["艮","土","停止、守成、收尾"],8:["坤","土","配合、执行、稳定"]
};
const generate = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
const control  = {"木":"土","土":"水","水":"火","火":"金","金":"木"};
const color_map = {"木":"绿色/青色","火":"红色/橙色","土":"土色/米色/卡其","金":"白色/金色/灰色","水":"蓝色/黑色"};
const _BITS = {1:[1,1,1],2:[0,1,1],3:[1,0,1],4:[0,0,1],5:[1,1,0],6:[0,1,0],7:[1,0,0],8:[0,0,0]};
const _BITS_INV = Object.fromEntries(Object.entries(_BITS).map(([k,v])=>[v.join(','),Number(k)]));

const BRANCH_STARS = /* copied from Python file */ [];
const _BRANCH_STARS = [
  ["桃花",{"申":"子","子":"酉","辰":"酉","寅":"午","午":"卯","戌":"卯","巳":"酉","酉":"午","丑":"午","亥":"卯","卯":"子","未":"子"}],
  ["驿马",{"申":"寅","子":"寅","辰":"寅","寅":"申","午":"申","戌":"申","巳":"亥","酉":"亥","丑":"亥","亥":"巳","卯":"巳","未":"巳"}],
  ["华盖",{"申":"辰","子":"辰","辰":"辰","寅":"戌","午":"戌","戌":"戌","巳":"丑","酉":"丑","丑":"丑","亥":"未","卯":"未","未":"未"}],
  ["将星",{"申":"酉","子":"子","辰":"辰","寅":"卯","午":"午","戌":"戌","巳":"午","酉":"酉","丑":"丑","亥":"子","卯":"卯","未":"未"}],
  ["劫煞",{"申":"巳","子":"巳","辰":"巳","寅":"亥","午":"亥","戌":"亥","巳":"寅","酉":"寅","丑":"寅","亥":"申","卯":"申","未":"申"}],
  ["灾煞",{"申":"午","子":"午","辰":"午","寅":"子","午":"子","戌":"子","巳":"酉","酉":"酉","丑":"酉","亥":"卯","卯":"卯","未":"卯"}],
  ["红鸾",{"子":"卯","丑":"寅","寅":"丑","卯":"子","辰":"亥","巳":"戌","午":"酉","未":"申","申":"未","酉":"午","戌":"巳","亥":"辰"}],
  ["天喜",{"子":"酉","丑":"申","寅":"未","卯":"午","辰":"巳","巳":"辰","午":"卯","未":"寅","申":"丑","酉":"子","戌":"亥","亥":"戌"}],
  ["孤辰",{"亥":"寅","子":"寅","丑":"寅","寅":"巳","卯":"巳","辰":"巳","巳":"申","午":"申","未":"申","申":"亥","酉":"亥","戌":"亥"}],
  ["寡宿",{"亥":"戌","子":"戌","丑":"戌","寅":"丑","卯":"丑","辰":"丑","巳":"辰","午":"辰","未":"辰","申":"未","酉":"未","戌":"未"}],
  ["亡神",{"申":"亥","子":"亥","辰":"亥","寅":"巳","午":"巳","戌":"巳","巳":"申","酉":"申","丑":"申","亥":"寅","卯":"寅","未":"寅"}],
  ["丧门",{"子":"寅","丑":"卯","寅":"辰","卯":"巳","辰":"午","巳":"未","午":"申","未":"酉","申":"戌","酉":"亥","戌":"子","亥":"丑"}],
  ["吊客",{"子":"戌","丑":"亥","寅":"子","卯":"丑","辰":"寅","巳":"卯","午":"辰","未":"巳","申":"午","酉":"未","戌":"申","亥":"酉"}],
  ["天医",{"子":"亥","丑":"子","寅":"丑","卯":"寅","辰":"卯","巳":"辰","午":"巳","未":"午","申":"未","酉":"申","戌":"酉","亥":"戌"}],
];
const _STEM_STARS = [
  ["天乙贵人",{"甲":["丑","未"],"乙":["子","申"],"丙":["亥","酉"],"丁":["酉","亥"],"戊":["丑","未"],"己":["子","申"],"庚":["丑","未"],"辛":["子","申"],"壬":["卯","巳"],"癸":["巳","卯"]}],
  ["文昌",{"甲":"巳","乙":"午","丙":"申","丁":"酉","戊":"申","己":"酉","庚":"亥","辛":"子","壬":"寅","癸":"卯"}],
  ["天德",{"甲":"丁","乙":"申","丙":"寅","丁":"亥","戊":"巳","己":"酉","庚":"亥","辛":"子","壬":"寅","癸":"卯"}],
  ["月德",{"甲":"丙","乙":"甲","丙":"壬","丁":"庚","戊":"丙","己":"甲","庚":"壬","辛":"庚","壬":"丙","癸":"甲"}],
  ["禄神",{"甲":"寅","乙":"卯","丙":"巳","丁":"午","戊":"巳","己":"午","庚":"申","辛":"酉","壬":"亥","癸":"子"}],
  ["羊刃",{"甲":"卯","乙":"辰","丙":"午","丁":"未","戊":"午","己":"未","庚":"酉","辛":"戌","壬":"子","癸":"丑"}],
  ["金舆",{"甲":"辰","乙":"巳","丙":"未","丁":"申","戊":"未","己":"申","庚":"戌","辛":"亥","壬":"丑","癸":"寅"}],
];
const STAR_DESC = {
  "桃花":"主感情、人缘、异性缘。遇之多有社交、恋爱机缘。",
  "驿马":"主迁动、变动、出行和机会。遇之宜把握外出、面试机会。",
  "华盖":"主独立、思考、学术与孤独。遇之宜静心学习与创作。",
  "将星":"主权威、支援与贵人，利于行动与领导。",
  "劫煞":"主争夺、冲突、损耗，遇之宜守势防损。",
  "灾煞":"主意外、灾厄，谨慎出行与投资。",
  "红鸾":"主喜庆、婚姻、良缘，遇之多有喜事。",
  "天喜":"主吉祥喜悦、庆事与好运。",
  "孤辰":"主孤独、独处、易生寂寞。",
  "寡宿":"与孤辰相近，偏向清冷、少伴。",
  "亡神":"主失落、遗漏、失物与不利之事。",
  "丧门":"主丧事、哀戚，不利重大变动与庆典。",
  "吊客":"主变故、奔丧或出行奔波。",
  "天医":"主健康、治愈与吉祥，利于康复与医疗。",
  "天乙贵人":"主贵人扶持、化险为夷。",
  "文昌":"主文书、学业、考试与才智。",
  "天德":"主助力与福德，遇之多吉。",
  "月德":"主月令之助，吉利之星。",
  "禄神":"主俸禄、财物与职位便利。",
  "羊刃":"主冲动、锐利、争执与锋芒，宜谨慎。",
  "金舆":"主出行、车马与顺利迁移。"
};

// 十二时辰：name, numeric representative hour, human-readable range
const SHICHEN = [
  ['子',23,'23:00-00:59'],
  ['丑',1,'01:00-02:59'],
  ['寅',3,'03:00-04:59'],
  ['卯',5,'05:00-06:59'],
  ['辰',7,'07:00-08:59'],
  ['巳',9,'09:00-10:59'],
  ['午',11,'11:00-12:59'],
  ['未',13,'13:00-14:59'],
  ['申',15,'15:00-16:59'],
  ['酉',17,'17:00-18:59'],
  ['戌',19,'19:00-20:59'],
  ['亥',21,'21:00-22:59']
];
const GOOD_STARS = new Set(["天乙贵人","文昌","天德","月德","将星","红鸾","天喜","天医","禄神","金舆"]);
const BAD_STARS  = new Set(["劫煞","灾煞","孤辰","寡宿","亡神","丧门","吊客","羊刃"]);

// --- simple obfuscation helpers (string decoder + junk functions) ---
const _STRS = [
  '本卦','互卦','变卦','体五行','用五行','体用','体用提示',
  '✅ 宜穿：','🚫 忌穿：','无特别禁忌','<h2>当日神煞</h2>'
];
function _S(i){ return _STRS[i]; }
function __junk(n){ let r=0; for(let i=0;i<3;i++){ r += (n+i)*(Math.sin(i+1)+Math.cos(i+2)); } return Math.abs(Math.floor(r))%7; }
function __noop(){ return null; }

function toLunar(d){
  // Prefer vendored `solar2lunar` (provided by lunar.js). If unavailable,
  // fallback to the earlier approximation.
  if (typeof solar2lunar === 'function'){
    const r = solar2lunar(d.getFullYear(), d.getMonth()+1, d.getDate());
    return { year: r.lYear || r.lunarYear || r.year, month: r.lMonth || r.lunarMonth || r.month, day: r.lDay || r.lunarDay || r.day };
  }
  // Fallback approximation
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const LICHUN_MONTH = 2; const LICHUN_DAY = 4;
  const lunarYear = (month < LICHUN_MONTH || (month === LICHUN_MONTH && day < LICHUN_DAY)) ? year - 1 : year;
  return { year: lunarYear, month: month, day: day };
}
function getGanzhi(year){
  const o = year - 1900;
  return [stems[(6+o)%10], branches[o%12]];
}
function hourBranch(h){ return (h===23||h<1) ? '子' : branches[Math.floor((h+1)/2)%12]; }
function calcShensha(stem, branch, day_branch){
  const stars = [];
  for (const [name,m] of _BRANCH_STARS){ if (m[branch]===day_branch) stars.push(name); }
  for (const [name,m] of _STEM_STARS){ const v=m[stem]; if (Array.isArray(v)){ if (v.includes(day_branch)) stars.push(name);} else if (v===day_branch) stars.push(name); }
  return stars;
}
function mod(n,b){ const r = n % b; return r===0?b:r; }
function meihua(dt){
  const lunar = toLunar(dt);
  const ly = lunar.year, lm=lunar.month, ld=lunar.day;
  const yn = branches.indexOf(branches[(ly-1900)%12]) +1;
  const hn = branches.indexOf(hourBranch(dt.getHours()))+1;
  const t1 = yn+lm+ld; const t2 = t1+hn;
  const ui = mod(t1,8), li=mod(t2,8), mv=mod(t2,6);
  const lo = _BITS[li], up = _BITS[ui]; const lines = lo.concat(up);
  const mu_lo = _BITS_INV[[lines[1],lines[2],lines[3]].join(',')] || 8;
  const mu_up = _BITS_INV[[lines[2],lines[3],lines[4]].join(',')] || 8;
  const cl = lines.slice(); cl[mv-1] ^=1;
  const ch_lo = _BITS_INV[[cl[0],cl[1],cl[2]].join(',')] || 8;
  const ch_up = _BITS_INV[[cl[3],cl[4],cl[5]].join(',')] || 8;
  const [tag,tip] = elementRelation(trigrams[ui][1], trigrams[li][1]);
  // use decoder keys to obfuscate object property names
  const obj = {};
  obj[_S(0)] = `${trigrams[ui][0]}上${trigrams[li][0]}下`;
  obj[_S(1)] = `${trigrams[mu_up][0]}上${trigrams[mu_lo][0]}下`;
  obj[_S(2)] = `${trigrams[ch_up][0]}上${trigrams[ch_lo][0]}下`;
  obj[_S(3)] = trigrams[ui][1];
  obj[_S(4)] = trigrams[li][1];
  obj['动爻'] = mv;
  obj[_S(5)] = tag;
  obj[_S(6)] = tip;
  // add a small junk call (harmless) to confuse static readers
  __junk(mv);
  return obj;
}
function elementRelation(body,use){ if (generate[use]===body) return ['用生体','顺势而为，可主动']; if (generate[body]===use) return ['体生用','自己消耗大，宜谨慎']; if (control[use]===body) return ['用克体','受压制，不宜冒进']; if (control[body]===use) return ['体克用','可掌控，可行动']; return ['同气相扶','平稳发展']; }
const CONTROLLED_BY = Object.fromEntries(Object.entries(control).map(([k,v])=>[v,k]));
function recommendColor(body,use){ const p=color_map[body]||'中性色'; const s=color_map[use]||''; const [tag,] = elementRelation(body,use); const tips={ '用生体':`首选${p}（体色），辅以${s}助力`, '体生用':`首选${p}（体色），${s}小面积以免消耗`, '用克体':`首选${p}（体色），${s}仅作点缀`, '体克用':`可用${s}作强调色主动出击`, '同气相扶':`主色${p}` }; const good=tips[tag]||`主色${p}`; const ke_body = CONTROLLED_BY[body]; const xie_body = generate[body]; const avoid=[]; if (ke_body) avoid.push(`${color_map[ke_body]}（${ke_body}克${body}，受克不利）`); if (xie_body && xie_body!==use) avoid.push(`${color_map[xie_body]}（${body}生${xie_body}，泄气消耗）`); const bad = avoid.length?avoid.join('；'):'无特别禁忌'; return [good,bad]; }

// UI wiring
const dateEl = document.getElementById('date');
const calendarContainer = document.getElementById('calendar-container');
const runBtn = document.getElementById('run');
const dayInfo = document.getElementById('day-info');
const tableEl = document.getElementById('table');
const adviceEl = document.getElementById('advice');
const themeToggle = document.getElementById('theme-toggle');

let _systemListener = null;
let currentThemeMode = 'system';
function applySystemTheme(){
  const isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  if (isLight) {
    document.body.setAttribute('data-theme','light');
    if (themeToggle){ themeToggle.textContent='☀️'; themeToggle.setAttribute('aria-pressed','true'); }
  } else {
    document.body.removeAttribute('data-theme');
    if (themeToggle){ themeToggle.textContent='🌙'; themeToggle.setAttribute('aria-pressed','false'); }
  }
}

function setTheme(t){
  // t: 'light' | 'dark' | 'system'
  // store current mode in-memory only; do NOT persist to localStorage
  currentThemeMode = t;
  // remove existing system listener when user picks explicit theme
  if (_systemListener && t !== 'system'){
    try{ window.matchMedia('(prefers-color-scheme: light)').removeEventListener('change', _systemListener); }catch(e){}
    _systemListener = null;
  }
  if (t === 'light'){
    document.body.setAttribute('data-theme','light'); if (themeToggle){ themeToggle.textContent='☀️'; themeToggle.setAttribute('aria-pressed','true'); }
  } else if (t === 'dark'){
    document.body.removeAttribute('data-theme'); if (themeToggle){ themeToggle.textContent='🌙'; themeToggle.setAttribute('aria-pressed','false'); }
  } else {
    // follow system
    applySystemTheme();
    if (window.matchMedia){
      const m = window.matchMedia('(prefers-color-scheme: light)');
      _systemListener = (e)=> applySystemTheme();
      try{ m.addEventListener('change', _systemListener); }catch(e){ try{ m.addListener(_systemListener); }catch(e){} }
    }
  }
}

// initialize theme: follow system by default (do not read saved preferences)
setTheme('system');

// hide result cards initially to avoid empty shadowed boxes
if (dayInfo) dayInfo.style.display = 'none';
if (tableEl) tableEl.style.display = 'none';
if (adviceEl) adviceEl.style.display = 'none';

themeToggle && themeToggle.addEventListener('click', ()=>{
  // toggle between explicit light/dark; if currently following system, switch to explicit opposite of current
  const current = currentThemeMode || 'system';
  if (current === 'system'){
    const appliedLight = document.body.getAttribute('data-theme')==='light';
    const next = appliedLight ? 'dark' : 'light';
    setTheme(next);
  } else if (current === 'light') setTheme('dark'); else setTheme('light');
});

// Date picker implementation (in-page)
let calState = { year: null, month: null, selected: null };
function pad(n){ return n<10?('0'+n):(''+n); }
function isoFromParts(y,m,d){ return `${y}-${pad(m)}-${pad(d)}`; }
function parseISO(s){ const p = s.split('-'); return {y:Number(p[0]), m:Number(p[1]), d:Number(p[2])}; }
function openCalendar(){
  const cur = dateEl.value ? parseISO(dateEl.value) : (new Date());
  const now = new Date();
  calState.year = cur.y || now.getFullYear(); calState.month = cur.m || (now.getMonth()+1); calState.selected = cur.d || now.getDate();
  renderCalendar(calState.year, calState.month);
}
function renderCalendar(year, month){
  calState.year = year; calState.month = month;
  const first = new Date(year, month-1, 1); const startWeek = first.getDay();
  const days = new Date(year, month, 0).getDate();
  const today = new Date();
  let html = `<div class="cal-header"><div><strong>${year} - ${pad(month)}</strong></div><div class="cal-nav"><button id="prev-month" class="chip">◀</button><button id="next-month" class="chip">▶</button></div></div>`;
  html += '<div class="cal-grid">';
  const wk = ['日','一','二','三','四','五','六']; for(const w of wk) html += `<div class="cal-week">${w}</div>`;
  for(let i=0;i<startWeek;i++) html += '<div></div>';
  for(let d=1; d<=days; d++){
    const classes = ['cal-day'];
    if (year===today.getFullYear() && month===today.getMonth()+1 && d===today.getDate()) classes.push('today');
    // mark past dates (strictly before today) so they can be styled grey
    const dayDate = new Date(year, month-1, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dayDate < todayStart) classes.push('past');
    if (d===calState.selected && year===calState.year && month===calState.month) classes.push('selected');
    html += `<div class="${classes.join(' ')}" data-day="${d}">${d}</div>`;
  }
  html += '</div>';
  calendarContainer.innerHTML = html;
  calendarContainer.querySelector('#prev-month').addEventListener('click',()=>{ let m=month-1,y=year; if(m<1){m=12;y--; } renderCalendar(y,m); });
  calendarContainer.querySelector('#next-month').addEventListener('click',()=>{ let m=month+1,y=year; if(m>12){m=1;y++; } renderCalendar(y,m); });
  calendarContainer.querySelectorAll('.cal-day').forEach(el=> el.addEventListener('click', (ev)=>{ const d = Number(ev.currentTarget.dataset.day); selectDate(year,month,d); }));
}
function selectDate(y,m,d){ dateEl.value = isoFromParts(y,m,d); calState.selected = d; renderCalendar(calState.year, calState.month); performAnalysis(); }
// initialize display and render calendar inline
if(!dateEl.value){ const now=new Date(); dateEl.value = isoFromParts(now.getFullYear(), now.getMonth()+1, now.getDate()); }
// render calendar on load
const initParts = parseISO(dateEl.value);
calState.year = initParts.y; calState.month = initParts.m; calState.selected = initParts.d;
renderCalendar(calState.year, calState.month);

// create spinner element
const _spinner = document.createElement('div'); _spinner.className = 'spinner';
function showSpinner(){ if (!document.body.contains(_spinner)) { tableEl.innerHTML = ''; adviceEl.innerHTML=''; dayInfo.innerHTML=''; tableEl.appendChild(_spinner); } }
function hideSpinner(){ if (document.body.contains(_spinner) || tableEl.contains(_spinner)) { if (_spinner.parentNode) _spinner.parentNode.removeChild(_spinner); } }

function performAnalysis(dateValue){
  const d = dateValue ? new Date(dateValue) : new Date(dateEl.value);
  if (isNaN(d)) return alert('请选择有效日期');
  showSpinner();
  setTimeout(()=>{
    try{
      const lunar = toLunar(d);
      const [stem,branch] = getGanzhi(lunar.year);
      const db = branches[(lunar.day-1)%12];
      const dayStars = calcShensha(stem,branch,db);
      const iso = d.toISOString().slice(0,10);
      const headerHtml = '<h2>当日神煞</h2><p class="small">公历 ' + iso + ' → 农历 ' + lunar.year + '年' + lunar.month + '月' + lunar.day + '日<br>年干支: ' + stem + branch + ' 日支: ' + db + '</p>';
      const starsHtml = dayStars.length ? ('<ul>' + dayStars.map(s=>'<li>' + s + '</li>').join('') + '</ul>') : '<p class="small">无神煞触发</p>';
      dayInfo.className='card'; dayInfo.innerHTML = headerHtml + starsHtml;
      if (dayInfo) dayInfo.style.display = '';

      // build table HTML in-memory
      const rows=[];
      const tbodyRows = [];
      for (const [name,h,tr] of SHICHEN){
        const dt_h = new Date(d); dt_h.setHours(h);
        const m=meihua(dt_h);
        const stars = calcShensha(stem,branch,db);
        const [tag,reasons] = classifyHour(stars,m);
        rows.push({name,tr,tag,m,stars,reasons});
        const g = m[_S(0)];
        const t = m[_S(5)];
        const bodyEl = m[_S(3)];
        const useEl = m[_S(4)];
        const colorMapHex = { '木':'#16a34a','火':'#ef4444','土':'#fcd284','金':'#f8fafc','水':'#0ea5e9' };
        const swBody = '<span class="swatch" style="background:' + (colorMapHex[bodyEl]||'#999') + '"></span>';
        const swUse = '<span class="swatch" style="background:' + (colorMapHex[useEl]||'#999') + '"></span>';
        let rowClass = 'row-neutral';
        if (tag === '吉') rowClass = 'row-good'; else if (tag === '凶') rowClass = 'row-bad'; else if (String(tag).indexOf('平')!==-1) rowClass = 'row-mixed';
        tbodyRows.push('<tr class="enter ' + rowClass + '"><td>' + name + '</td><td>' + tr + '</td><td>' + tag + '</td><td>' + g + '</td><td>' + t + '</td><td>' + (stars.join(',')||'—') + '</td><td class="table-swatch">' + swBody + bodyEl + '<span class="small muted">/</span>' + swUse + useEl + '</td></tr>');
      }

      const tableHtml = '<h2>十二时辰分析</h2><table><thead><tr><th>时辰</th><th>时段</th><th>吉凶</th><th>本卦</th><th>体用</th><th>神煞</th><th>色彩</th></tr></thead><tbody>' + tbodyRows.join('') + '</tbody></table>';
      tableEl.className='card'; tableEl.innerHTML = tableHtml;
      if (tableEl) tableEl.style.display = '';
      // trigger enter animations
      requestAnimationFrame(()=>{ const trs = tableEl.querySelectorAll('tbody tr.enter'); trs.forEach((r,i)=> setTimeout(()=> r.classList.add('show'), i*40)); });

      // advice with color swatches
      const bodies = rows.map(r=>r.m[_S(3)]); const uses = rows.map(r=>r.m[_S(4)]);
      const mb = mode(bodies) || '土'; const mu = mode(uses) || '土'; const [good,bad]=recommendColor(mb,mu);
      const colorMapHex = { '木':'#16a34a','火':'#ef4444','土':'#fcd284','金':'#f8fafc','水':'#0ea5e9' };
      const makeSwatch = (el)=> '<span class="swatch" style="background:' + (colorMapHex[el]||'#999') + '"></span>';
      const adviceHtml = '<h2>穿着建议</h2><div class="advice-row"><div><strong>体主</strong> ' + makeSwatch(mb) + mb + '</div><div><strong>用主</strong> ' + makeSwatch(mu) + mu + '</div></div>' + '<p class="small">' + _S(7) + good + '</p><p class="small">' + _S(8) + bad + '</p>';
      adviceEl.className='card'; adviceEl.innerHTML = adviceHtml;
      if (adviceEl) adviceEl.style.display = '';
    }catch(e){ alert('错误: '+e.message); }
    hideSpinner();
  },20);
}

if (runBtn) runBtn.addEventListener('click', ()=> performAnalysis());
function classifyHour(stars,m){
  const good = stars.filter(s=>GOOD_STARS.has(s));
  const bad = stars.filter(s=>BAD_STARS.has(s));
  const rel = m[_S(5)];
  if (['用生体','体克用','同气相扶'].includes(rel)) good.push(`体用[${rel}]`);
  if (rel==='用克体') bad.push(`体用[${rel}]`);
  if (bad.length && !good.length) return ['凶',bad];
  if (good.length && !bad.length) return ['吉',good];
  if (bad.length && good.length) return ['平（吉凶参半）',good.concat(bad)];
  return ['平',[]];
}
function mode(arr){
  if(!arr || arr.length===0) return null;
  const c={};
  for(const x of arr){ c[x]=(c[x]||0)+1; }
  return Object.keys(c).reduce((a,b)=> c[a]>=c[b]?a:b);
}
