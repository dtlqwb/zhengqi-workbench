/* R9：压测 40 人 / 20 客户 / 300 业务 / 1500 任务，量 13 个视图切换耗时 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const ROLES = ['客户经理', '网格长', '装维', '业务管理', '集客支撑'];
const ORGS = ['示例县销售中心', '市公司集客部', '网络部', '政企部', '渠道中心'];
const ST = ['待接收', '进行中', '待验收', '已完成'];
const PR = ['紧急', '重要', '常规'];
const CNAMES = ['应急管理局', '市政公用局', '市监局', '农业农村局', '工信局', '教育局', '卫健委', '乡村振兴公司'];

function pick(a, i) { return a[i % a.length] }
const people = [], orgs = [], ext = [], projects = [], tasks = [];
ORGS.forEach((n, i) => orgs.push({ id: 'o' + i, name: n, short: n.slice(-3) }));
for (let i = 0; i < 40; i++) people.push({ id: 'pe' + i, name: '成员' + (i + 1), role: pick(ROLES, i), org: pick(ORGS, i), rel: '直管', color: '#2563d9', phone: '139000000' + (10 + i), tags: '', note: '' });
for (let i = 0; i < 20; i++) ext.push({ id: 'c' + i, name: '示例县' + pick(CNAMES, i) + (i > 7 ? i : ''), type: '政府部门', duty: '', contact: '联系人' + i, title: '负责人', phone: '138000000' + (10 + i), color: '#0f6b8a', pay: '财政直付' });
for (let i = 0; i < 300; i++) {
  const stage = pick(['S1', 'S2', 'S3', 'S3', 'S3', 'S5'], i);
  const kind = i % 7 === 0 ? 'standing' : 'once';
  projects.push({
    id: 'p' + i, name: '业务' + (i + 1) + '·' + pick(CNAMES, i), clientId: 'c' + (i % 20),
    kind, stage, goal: i % 3 ? '目标' + i : '', why: i % 4 ? '理由' + i : '', decision: i % 5 ? '接' : '',
    deliverTarget: i % 2, planOk: i % 3 === 0, closedAt: '',
    milestones: i % 4 ? [{ id: 'm' + i, name: '节点' + i, due: '2026-12-0' + (i % 9 + 1), done: i % 2 === 0 }] : [],
    review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: []
  });
}
for (let i = 0; i < 1500; i++) {
  const st = pick(ST, i + (i % 3));
  tasks.push({
    id: 't' + i, title: '任务' + (i + 1) + '：' + pick(['发短信给目标用户', '整理台账', '现场勘察', '设备巡检', '方案编制', '对接厂家', '催回执', '开协调会'], i),
    personId: 'pe' + (i % 40), projectId: 'p' + (i % 300), project: '业务' + ((i % 300) + 1) + '·' + pick(CNAMES, i),
    client: 'c' + (i % 20), prio: pick(PR, i), due: '2026-11-' + String(10 + (i % 20)).padStart(2, '0'),
    status: st, stage: pick(['S1', 'S2', 'S3', 'S3', 'S4', 'S5'], i), created: '2026-11-01', updated: '2026-11-08',
    deliverable: i % 3 ? '回执' : '', receipt: i % 6 === 0, support: i % 5 === 0 ? ['o1'] : [],
    flow: i % 9 === 0 ? '集客部' : '', blockedSince: i % 9 === 0 ? '2026-11-05' : '', gates: [], feedback: i % 7 === 0 ? '已沟通' : '', note: ''
  });
}
const S0 = {
  ui: { view: 'board' }, meta: { ver: 3, theme: 'light' }, roles: ROLES,
  orgs, people, ext, projects, tasks, wbSync: null, wbInbox: [], dataDate: '2026-11-08'
};
const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
/* 同步测：不用 setTimeout，避免虚拟时钟把 performance.now 冻住 */
var out={};function q(s){return document.querySelector(s)}
function n(){return performance.now()}
try{S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))))}catch(e){out.threw=String(e&&e.message||e)}
var t0=n();
try{render()}catch(e){out.firstRenderErr=String(e&&e.message||e)}
out.firstRenderMs=Math.round(n()-t0);
var res=[];
var keys=VIEWS.map(function(v){return v[0]});
keys.forEach(function(k){
  var a=n();S.ui.view=k;try{render()}catch(e){out['e_'+k]=String(e&&e.message||e)}var b=n();
  var c=n();try{render()}catch(e){}var d=n();
  res.push({v:k,first:Math.round(b-a),warm:Math.round(d-c)});
});
out.views=res;
res.slice().sort(function(x,y){return y.first-x.first}).slice(0,3).forEach(function(x){out['slow'+x.v]=x.first});
out.worstFirst=res.slice().sort(function(x,y){return y.first-x.first})[0];
var a2=n();try{window.cmdModal()}catch(e){out.cmdErr=String(e&&e.message||e)}out.cmdOpenMs=Math.round(n()-a2);
var t=n();try{window.cmdRender('整理')}catch(e){}out.cmdQueryMs=Math.round(n()-t);
out.cmdRows=document.querySelectorAll('#cmd_res .cmdrow').length;
if(document.querySelector('#modalRoot [data-act=close]'))document.querySelector('#modalRoot [data-act=close]').click();
var e2=n();try{briefText()}catch(x){out.briefErr=String(x&&x.message||x)}out.briefMs=Math.round(n()-e2);
var e3=n();try{stats()}catch(x){}out.statsMs=Math.round(n()-e3);
/* 大数据的存储体检：save 是否落地、快照能存几份 */
try{localStorage.setItem('__probe','x');localStorage.removeItem('__probe');out.lsOk=true}catch(e){out.lsOk=false}
var sv=localStorage.getItem('zq_workbench_v2');
out.saveKB=sv?Math.round(sv.length/1024):0;
try{dataModal()}catch(e){out.dmErr=String(e&&e.message||e)}
for(var ii=0;ii<5;ii++){var sb=document.querySelector('#modalRoot [data-act=snapnow]');if(sb)sb.click()}
var sn=localStorage.getItem('zq_wb_snap_v3');
try{out.snapN=sn?JSON.parse(sn).length:0}catch(e){out.snapN=-1}
out.snapKB=sn?Math.round(sn.length/1024):0;
out.errs=window.__ERR.slice();
var dv=document.createElement('div');dv.id='TESTOUT';dv.textContent=JSON.stringify(out);document.body.appendChild(dv);
})();</scr` + `ipt>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r9.html'), h, 'utf8');
console.log('built', h.length);
