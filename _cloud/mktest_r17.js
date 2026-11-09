/* R17 校验：数据体检能挑出脏数据，条目可点、数量与顶栏红点一致 */
const T = require('./tseed');
function day(n){const x=new Date();x.setDate(x.getDate()+n);const p=v=>String(v).padStart(2,'0');
  return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())}
const mk=(id,title,pid,project,due,status,created)=>({id,title,personId:pid,project,projectId:'',client:'c1',
  prio:'重要',due,status,flow:'',support:[],created:created||day(-5),updated:day(-1),deliverable:'',receipt:false,feedback:'',note:''});

const S = T.baseS({
  ui: { view: 'project', f: {} },
  ext: [
    { id: 'c1', name: '示例县住建局', type: '政府部门', contact: '张科长', phone: '', color: '#0f6b8a' },
    { id: 'c2', name: '示例县消防大队', type: '政府部门', contact: '周建平', phone: '', color: '#c0507a' },
    { id: 'c3', name: '示例县农业农村局', type: '政府部门', phone: '', color: '#0f9b96' }
  ],
  projects: [
    { id: 'b1', name: '智慧水务平台', clientId: 'c1', stage: 'S3', kind: 'once', goal: 'g', why: 'w', decision: '接', amt: 7300000, paid: 3000000, cost: 5000000, milestones: [], planOk: true, log: [] },
    { id: 'b2', name: '治超不停车检测', clientId: 'c1', stage: 'S5', kind: 'once', goal: 'g', why: 'w', decision: '接', amt: 1900000, paid: 1900000, cost: 1400000, milestones: [], planOk: true, closedAt: '2026-10-01', review: { did: 'a', gap: 'b', why: 'c', next: 'd' }, log: [] },
    { id: 'b3', name: 'AI广播运维', clientId: 'c2', stage: 'S3', kind: 'standing', goal: 'g', why: 'w', decision: '接', amt: 0, paid: 0, cost: 0, milestones: [], planOk: true, reviews: [], log: [] },
    { id: 'b4', name: '脏数据业务', stage: 'S9', kind: 'once', goal: 'g', why: 'w', decision: '接', amt: 1000000, paid: 2000000, cost: 3000000, milestones: [], log: [] },
    { id: 'b5', name: '智慧水务平台', clientId: 'c1', stage: 'S1', kind: 'once', goal: 'g', why: 'w', decision: '接', amt: 0, paid: 0, cost: 0, milestones: [], log: [] },
    { id: 'b6', name: '复盘没填的业务', clientId: 'c1', stage: 'S5', kind: 'once', goal: 'g', why: 'w', decision: '接', amt: 0, paid: 0, cost: 0, milestones: [], review: { did: '只填了一格' }, log: [] }
  ],
  tasks: [
    mk('t1', 'A', 'p1', '智慧水务平台', day(3), '进行中'),
    mk('t2', 'B', 'px', '智慧水务平台', day(3), '进行中'),
    mk('t3', 'C', 'p1', '', day(3), '进行中'),
    mk('t4', 'D', 'p1', '智慧水务平台', day(-10), '进行中'),
    mk('t5', 'E', 'p1', '智慧水务平台', 'abc', '进行中'),
    mk('t6', 'F', 'p1', '智慧水务平台', '', '进行中'),
    mk('t7', 'A', 'p1', '智慧水务平台', day(4), '待接收')
  ]
});

const body = `
S.ui.view='project';render();
var L=window.__R17__.scan();
out.groups=L.length;
out.map={};
L.forEach(function(g){out.map[g.txt]=g.items.length});
out.red=L.filter(function(g){return g.lv==='red'}).reduce(function(n,g){return n+g.items.length},0);
out.amber=L.filter(function(g){return g.lv==='amber'}).reduce(function(n,g){return n+g.items.length},0);
out.total=out.red+out.amber;
out.grpRed=L.filter(function(g){return g.lv==='red'}).length;
out.grpAmber=L.filter(function(g){return g.lv==='amber'}).length;
/* 顶栏红点 */
out.topBtn=!!q('.top-actions [data-act=r17]');
out.badge=tx('.top-actions [data-act=r17] .hbadge');
out.badgeOk=out.badge===String(out.red);
/* 打开体检面板 */
fire('r17');
out.rows=qa('.mb .r17row').length;
out.rowsOk=out.rows===out.groups;
out.chips=qa('.mb .r17row .its span[data-act]').length;
out.kpi=qa('.mb .panel').slice(0,3).map(function(e){return e.textContent.replace(/\\s+/g,' ').trim()});
/* 重新检查 */
fire('r17again');
out.rowsAgain=qa('.mb .r17row').length;
out.againOk=out.rowsAgain===out.groups;
/* 点条目能跳过去：点「没写所属项目」里的任务（放最后，跳转会顶掉体检弹层） */
var chip=qa('.mb .r17row .its span[data-act=task]')[0];
out.chipTxt=chip?chip.textContent.trim():'';
if(chip)chip.click();

function CHECK(out){
  /* 点条目应直接跳到那条任务的编辑表单（data-act=task 走的就是 taskForm） */
  var f=document.getElementById('f_title');
  out.chipOpenedForm=!!f;
  out.chipFormTitle=f?f.value:'';
  out.chipOk=out.chipFormTitle===out.chipTxt;
  out.errs=(window.__ERR||[]).slice();
}
`;

console.log('built', T.mk('_t_r17.html', S, body));
