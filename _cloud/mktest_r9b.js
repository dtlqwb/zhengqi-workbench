/* R9b 断言：配额兜底（塞满存储后快照仍能落最新一份）+ 面板配额条 + 清空快照 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const P = [], T = [], E = [], PR = [];
for (let i = 0; i < 40; i++) P.push({ id: 'pe' + i, name: '人' + i, role: '客户经理', org: '政企部', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' });
for (let i = 0; i < 20; i++) E.push({ id: 'c' + i, name: '客户' + i, type: '政府部门', contact: '', title: '', phone: '', color: '#0f6b8a', pay: '' });
for (let i = 0; i < 300; i++) PR.push({ id: 'p' + i, name: '业务' + i, clientId: 'c' + (i % 20), kind: 'once', stage: 'S3', goal: 'g', why: 'w', decision: '接', deliverTarget: 1, planOk: true, closedAt: '', milestones: [], review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] });
for (let i = 0; i < 1500; i++) T.push({ id: 't' + i, title: '任务' + i, personId: 'pe' + (i % 40), projectId: 'p' + (i % 300), project: '业务' + (i % 300), client: 'c' + (i % 20), prio: '常规', due: '2026-11-20', status: '进行中', stage: 'S3', created: '2026-11-01', updated: '2026-11-08', deliverable: '', receipt: false, support: [], flow: '', gates: [] });
const S0 = { ui: { view: 'board' }, meta: { ver: 3, theme: 'light' }, roles: ['客户经理'], orgs: [{ id: 'o0', name: '政企部', short: '政企部' }], people: P, ext: E, projects: PR, tasks: T, wbSync: { at: '', count: 0, err: '', source: '', regress: 0 }, wbInbox: [], dataDate: '2026-11-08' };
const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');

h = h.replace('</body>', `<script>(function(){
var out={};
try{
function q(s){return document.querySelector(s)}
try{S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))))}catch(e){out.threw=String(e&&e.message||e)}
try{render()}catch(e){out.rt=String(e&&e.message||e)}
/* 1. 塞满 localStorage */
var i=0,CH='z'.repeat(200000);
try{for(i=0;i<40;i++){localStorage.setItem('fill'+i,CH)}}catch(e){}
out.fillChunks=i;
out.usedBefore=window.__R9_PERF__.usage();
out.snapBefore=window.__R9_PERF__.snap().n;
try{localStorage.removeItem('fill'+(i-1));localStorage.removeItem('fill'+(i-2))}catch(e){}
/* 2. 面板配额信息 */
try{dataModal()}catch(e){out.dmErr=String(e&&e.message||e)}
var mb=q('#modalRoot .mb');
out.panelHasUsage=!!mb&&mb.innerText.indexOf('存储与配额')>=0;
out.panelHasClear=!!q('#modalRoot [data-act=snapclear]');
out.panelHasBar=!!mb&&mb.innerHTML.indexOf('最新的先保')>=0;
/* 3. 点存快照（同步写） */
var b=q('#modalRoot [data-act=snapnow]');
out.hasSnapBtn=!!b;
if(b)b.click();
var raw=localStorage.getItem('zq_wb_snap_v3');
var list=[];try{list=raw?JSON.parse(raw):[]}catch(e){}
out.snapAfter=list.length;
out.snapKB=raw?Math.round(raw.length/1024):0;
out.snapReason=list[0]?list[0].reason:'';
out.usedAfter=window.__R9_PERF__.usage();
/* 4. 清空快照 */
window.confirm=function(){return true};
var c=q('#modalRoot [data-act=snapclear]');
out.hasClearBtn=!!c;
if(c)c.click();
out.cleared=(localStorage.getItem('zq_wb_snap_v3')||'[]')==='[]';
out.errs=(window.__ERR||[]).slice();
}catch(E){out.fatal=String(E&&E.stack||E)}
var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r9b.html'), h, 'utf8');
console.log('built', h.length);
