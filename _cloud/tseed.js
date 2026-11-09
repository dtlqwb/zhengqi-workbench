/* 测试页构建器：把一份 S 注入主页面，跑一段断言代码，输出 TESTOUT
   用法：const T=require('./tseed'); T.mk('_t_r12.html', S, bodyCode);
   body 里同步写交互与 out.xxx；需要等 MutationObserver 刷完的断言写进 CHECK(out)，
   CHECK 会在一个宏任务后执行，之后才输出 TESTOUT，所以能拿到异步补丁的结果。 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');

function mk(outFile, S, body) {
  let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');
  const B64 = Buffer.from(JSON.stringify(S), 'utf8').toString('base64');
  const js = `(function(){
var out={};window.__ERR=window.__ERR||[];
/* headless 里 confirm/alert 会挂住页面，统一改成立即返回 false */
window.confirm=function(){return false};window.alert=function(){};window.prompt=function(){return ''};
window.print=function(){};
function fire(act,ds){var b=document.createElement('button');b.setAttribute('data-act',act);
  Object.keys(ds||{}).forEach(function(k){b.dataset[k]=ds[k]});b.style.display='none';
  document.body.appendChild(b);b.click();b.remove();}
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function tx(s){var e=q(s);return e?e.textContent.replace(/\\s+/g,' ').trim():''}
function show(){try{out.errs=(window.__ERR||[]).slice()}catch(e){out.errs=['__ERR 读取失败']}
  var d=document.getElementById('TESTOUT');
  if(!d){d=document.createElement('div');d.id='TESTOUT';document.body.appendChild(d)}
  d.textContent=JSON.stringify(out)}
try{
S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
${body}
}catch(e){out.fatal=String((e&&e.stack)||e).slice(0,500)}
setTimeout(function(){
  try{if(typeof CHECK==='function')CHECK(out)}catch(e){out.checkThrow=String((e&&e.stack)||e).slice(0,500)}
  setTimeout(function(){
    try{if(typeof CHECK2==='function')CHECK2(out)}catch(e){out.check2Throw=String((e&&e.stack)||e).slice(0,500)}
    setTimeout(function(){
      try{if(typeof CHECK3==='function')CHECK3(out)}catch(e){out.check3Throw=String((e&&e.stack)||e).slice(0,500)}
      setTimeout(function(){
        try{if(typeof CHECK4==='function')CHECK4(out)}catch(e){out.check4Throw=String((e&&e.stack)||e).slice(0,500)}
        show();
      },0);
    },0);
  },0);
},0);
})();`;
  h = h.replace('</body>', '<script>' + js + '</script></body>');
  fs.writeFileSync(path.join(dir, outFile), h, 'utf8');
  return h.length;
}

/* 常用种子：3 个业务（含金额）+ 1 个未填金额 + 2 个客户 + 3 条任务 */
function baseS(o) {
  o = o || {};
  const ext = [
    { id: 'c1', name: '示例县住建局', type: '政府部门', pay: '财政直付', contact: '张科长', title: '科长', phone: '', color: '#0f6b8a' },
    { id: 'c2', name: '示例县消防大队', type: '政府部门', pay: '财政直付', contact: '周建平', title: '副主任', phone: '', color: '#c0507a' }
  ];
  const people = [
    { id: 'p1', name: '苏文清', role: '客户经理', org: '政企部', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
    { id: 'p2', name: '聂婉清', role: '客户经理', org: '政企部', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
    { id: 'p3', name: '汪全胜', role: '客户经理', org: '政企部', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' }
  ];
  const orgs = [
    { id: 'o1', name: '市公司集客部', short: '集客部', duty: '方案与报批', contact: '待填', color: '#c0507a' },
    { id: 'o2', name: '市公司财务部', short: '财务部', duty: '预算与回款', contact: '待填', color: '#d98324' }
  ];
  const projects = [
    { id: 'b1', name: '智慧水务平台', clientId: 'c1', stage: 'S3', kind: 'once', goal: '年底验收回款', why: '专项债', decision: '接', amt: 7300000, paid: 3000000, cost: 5000000, milestones: [{ name: '财评定稿', due: '2026-11-20', done: false }], planOk: true, log: [] },
    { id: 'b2', name: '治超不停车检测', clientId: 'c1', stage: 'S5', kind: 'once', goal: '验收归档', why: '省补', decision: '接', amt: 1900000, paid: 1900000, cost: 1400000, milestones: [], planOk: true, closedAt: '2026-10-01', review: { did: '按期交付', gap: '备件不足', why: '采购慢', next: '提前备货' }, log: [] },
    { id: 'b3', name: 'AI广播运维', clientId: 'c2', stage: 'S3', kind: 'standing', goal: '131 台在线', why: '存量运维', decision: '接', amt: 0, paid: 0, cost: 0, milestones: [], planOk: true, reviews: [], log: [] }
  ];
  const tasks = [
    { id: 't1', title: '财务点位核对', personId: 'p1', project: '智慧水务平台', projectId: 'b1', client: 'c1', prio: '紧急', due: '2026-11-01', status: '进行中', flow: '', support: [], created: '2026-11-01', updated: '2026-11-08', deliverable: '', receipt: false, feedback: '', note: '' },
    { id: 't2', title: '验收材料归档', personId: 'p2', project: '治超不停车检测', projectId: 'b2', client: 'c1', prio: '常规', due: '2026-09-20', status: '已完成', doneAt: '2026-09-18', flow: '', support: [], created: '2026-09-01', updated: '2026-09-18', deliverable: '', receipt: true, feedback: '', note: '' },
    { id: 't3', title: '云喇叭固件升级', personId: 'p3', project: 'AI广播运维', projectId: 'b3', client: 'c2', prio: '重要', due: '2026-11-20', status: '待接收', flow: '', support: [], created: '2026-11-05', updated: '2026-11-05', deliverable: '', receipt: false, feedback: '', note: '' }
  ];
  return Object.assign({
    ui: { view: 'project', f: {} }, meta: { ver: 3, theme: 'light', briefNote: '' },
    roles: ['客户经理', '网格长', '合伙公司负责人', '个体技工', '业务管理'],
    orgs, people, ext, projects, tasks,
    wbSync: { at: '', count: 0, err: '', source: '', regress: 0 }, wbInbox: [], dataDate: '2026-11-08'
  }, o);
}

module.exports = { mk, baseS, dir };
