/* R9d：正常配额下快照保留份数与预算裁剪（大数据 664KB） */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const P = [], T = [], PR = [], E = [];
for (let i = 0; i < 40; i++) P.push({ id: 'pe' + i, name: '人' + i, role: '客户经理', org: '政企部', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' });
for (let i = 0; i < 20; i++) E.push({ id: 'c' + i, name: '客户' + i, type: '政府部门', contact: '', title: '', phone: '', color: '#0f6b8a', pay: '' });
for (let i = 0; i < 300; i++) PR.push({ id: 'p' + i, name: '业务' + i, clientId: 'c' + (i % 20), kind: 'once', stage: 'S3', goal: 'g', why: 'w', decision: '接', deliverTarget: 1, planOk: true, closedAt: '', milestones: [], review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] });
for (let i = 0; i < 1500; i++) T.push({ id: 't' + i, title: '任务' + i, personId: 'pe' + (i % 40), projectId: 'p' + (i % 300), project: '业务' + (i % 300), client: 'c' + (i % 20), prio: '常规', due: '2026-11-20', status: '进行中', stage: 'S3', created: '2026-11-01', updated: '2026-11-08', deliverable: '', receipt: false, support: [], flow: '', gates: [] });
const S0 = { ui: { view: 'board' }, meta: { ver: 3, theme: 'light' }, roles: ['客户经理'], orgs: [{ id: 'o0', name: '政企部', short: '政企部' }], people: P, ext: E, projects: PR, tasks: T, wbSync: { at: '', count: 0, err: '', source: '', regress: 0 }, wbInbox: [], dataDate: '2026-11-08' };
const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');

h = h.replace('</body>', `<script>(function(){
var out={};window.__ERR=window.__ERR||[];function q(s){return document.querySelector(s)}
S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
render();
var SK='zq_wb_snap_v3';
function mk(n,size){var a=[];for(var i=0;i<n;i++)a.push({stamp:'2026-11-08 2'+i+':00',reason:'第'+i+'份',data:'d'+i+'|'+'p'.repeat(size)});return a}
/* A. 6 份 × 700KB = 4.2MB，超预算 → 应被裁到预算内，且最新那份留在首位 */
try{localStorage.removeItem(SK)}catch(e){}
localStorage.setItem(SK,JSON.stringify(mk(6,700000)));
var raw=localStorage.getItem(SK)||'[]';
var L=JSON.parse(raw);
out.A_n=L.length;
out.A_kb=Math.round(raw.length/1024);
out.A_underBudget=raw.length<=2200000;
out.A_newestFirst=L[0]&&L[0].reason==='第0份';
out.A_kept=L.map(function(x){return x.reason});
/* B. 未超预算时保留 5 份（上限） */
try{localStorage.removeItem(SK)}catch(e){}
localStorage.setItem(SK,JSON.stringify(mk(8,1000)));
var r2=localStorage.getItem(SK)||'[]';
out.B_n=JSON.parse(r2).length;
out.B_kb=Math.round(r2.length/1024);
/* C. 配额真爆：先占满，再写快照 → 旧的必须原样保留，不能被写成空 */
try{localStorage.removeItem(SK)}catch(e){}
var keep=JSON.stringify(mk(1,200000));
localStorage.setItem(SK,keep);
var CH='z'.repeat(200000),k=0;
try{for(k=0;k<40;k++){localStorage.setItem('fill'+k,CH)}}catch(e){}
var before=localStorage.getItem(SK);
var newer=[{stamp:'2026-11-09 09:00',reason:'新第0份',data:'NEW|'+'p'.repeat(200000)},{stamp:'2026-11-09 09:01',reason:'新第1份',data:'NEW2|'+'p'.repeat(200000)}];
try{localStorage.setItem(SK,JSON.stringify(newer))}catch(e){out.C_threw=String(e.name||e)}
var after=localStorage.getItem(SK);
out.C_sameAsBefore=after===before;
out.C_notEmpty=!!after&&after!=='[]';
out.C_n=after?JSON.parse(after).length:0;
out.C_reason=after?JSON.parse(after)[0].reason:'';
out.C_newLanded=after?JSON.parse(after)[0].reason==='新第0份':false;
/* 清场 */
try{for(var j=0;j<k;j++)localStorage.removeItem('fill'+j)}catch(e){}
out.errs=window.__ERR.slice();
var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r9d.html'), h, 'utf8');
console.log('built');
