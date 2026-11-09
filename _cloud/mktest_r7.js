/* R7 断言：全局搜索覆盖 业务/客户/段位/复盘 + 键盘走完 + 快捷键一览 + 顶栏入口 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8'));
const S0 = raw.payload || raw;
S0.meta = Object.assign({}, S0.meta, { ver: 3 });
const CID = (S0.ext[0] || {}).id || '';
const PID = (S0.people[0] || {}).id || '';
S0.projects = [
  { id: 'p1', name: '示例县智慧水务平台建设', clientId: CID, kind: 'once', stage: 'S3',
    goal: '老城区管网漏损治理上线', why: '专项债资金已到位', decision: '接',
    deliverTarget: 1, planOk: true, closedAt: '',
    milestones: [{ id: 'm1', name: '硬件到货', due: '2026-11-20', done: false }],
    review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] },
  { id: 'p2', name: '沿街商铺明厨亮灶', clientId: CID, kind: 'once', stage: 'S5',
    goal: '训战打板跑通', why: '市监局背书', decision: '接',
    deliverTarget: 1, planOk: true, closedAt: '',
    milestones: [{ id: 'm2', name: '打板试点', due: '2026-11-10', done: true }],
    review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] },
  { id: 'p3', name: '校园监控常态运维', clientId: CID, kind: 'standing', stage: 'S3',
    goal: '51 校 6400 路在线率不低于 98%', why: '合同内服务', decision: '接',
    deliverTarget: 1, planOk: true, closedAt: '',
    milestones: [{ id: 'm3', name: '季度巡检', due: '2026-12-01', done: false }],
    review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] }
];
S0.tasks = (S0.tasks || []).map((t, i) => Object.assign({}, t, { projectId: i % 2 ? 'p1' : 'p3', stage: 'S3' }));
S0.tasks.push({ id: 'tk2', title: '整理漏损分区计量台账', personId: PID, project: '示例县智慧水务平台建设',
  projectId: 'p1', client: CID, prio: '紧急', due: '2026-11-05', status: '进行中', stage: 'S3',
  created: '2026-11-01', updated: '2026-11-08', deliverable: '台账', receipt: false, support: [], flow: '', gates: [] });
S0.ui = Object.assign({}, S0.ui, { view: 'board' });

const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');
h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(e){return e?e.innerText.replace(/\\s+/g,' ').trim():''}
function key(el,k){el.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}))}
function type(v){var i=q('#cmd_q');i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))}
function rows(){return qa('#cmd_res .cmdrow')}
function kinds(){return rows().map(function(r){return txt(r.querySelector('.ck'))})}
function titles(){return rows().map(function(r){return txt(r.querySelector('.ct'))})}
var steps=[];
function step(fn,ms){steps.push([fn,ms||160])}
function run(i){
  if(i>=steps.length){done();return}
  try{steps[i][0]()}catch(e){out['stepErr'+i]=String(e&&e.message||e)}
  setTimeout(function(){run(i+1)},steps[i][1]);
}
function done(){
  out.errs=window.__ERR.slice();
  var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
}
setTimeout(function(){
  try{S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))))}catch(e){out.threw=String(e&&e.message||e)}
  try{render()}catch(e){out.renderThrew=String(e&&e.message||e)}

  /* 0. 顶栏入口 */
  step(function(){
    out.topCmd=!!q('.top-actions [data-act=cmd]');
    out.topHelp=!!q('.top-actions [data-act=help]');
  });

  /* 1. Ctrl+K 开面板 + 空查询首条是视图 */
  step(function(){
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}));
  },260);
  step(function(){
    out.panelOpen=!!q('#cmd_q');
    out.emptyKinds=kinds().slice(0,3);
    out.emptyFirst=out.emptyKinds[0];
    out.emptyN=rows().length;
    out.footHelp=!!q('#modalRoot [data-act=help]');
  });

  /* 2. 搜业务 → 首条是业务 → Enter 直开业务档案 */
  step(function(){type('智慧水务')});
  step(function(){
    out.bizKinds=kinds();out.bizTitles=titles().slice(0,3);
    out.bizFirst=out.bizKinds[0];
    out.bizHit=out.bizTitles.indexOf('示例县智慧水务平台建设')>=0;
    key(q('#cmd_q'),'Enter');
  },240);
  step(function(){
    var mb=txt(q('#modalRoot .mb'));
    var nmb=document.getElementById('b_name');
    out.bizModal=nmb?nmb.value==='示例县智慧水务平台建设':false;
    out.bizModalTxt=mb.indexOf('业务')>=0;
    out.bizModalHasSave=!!q('#modalRoot [data-act=bizsave]');
    out.bizModalHasGoal=!!q('#modalRoot #b_goal');
    if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
  },200);

  /* 3. 搜客户 → 点开客户抽屉 */
  step(function(){key(document.body,'k');document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}))},260);
  step(function(){type('应急')});
  step(function(){
    out.cliKinds=kinds();out.cliFirst=out.cliKinds[0];
    var r=rows()[0];if(r)r.click();
  },260);
  step(function(){
    var dr=q('#drawerRoot');
    out.drawerOpen=!!(dr&&dr.innerText.trim());
    out.drawerHas=dr?dr.innerText.indexOf('示例县应急管理局')>=0:false;
    document.getElementById('drawerRoot').innerHTML='';
  },200);

  /* 4. 搜段位 → 跳到五段看板并定位到那一列 */
  step(function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}))},260);
  step(function(){type('总结')});
  step(function(){
    out.stgKinds=kinds();out.stgFirst=out.stgKinds[0];
    var r=rows()[0];if(r)r.click();
  },320);
  step(function(){
    out.stgView=S.ui.view;
    out.stgHasBoard=!!q('#view .bkan');
    out.stgFlash=!!q('#view .bkan .mseg-flash');
  });

  /* 5. 搜复盘 → 列出到总结段未结项的业务 */
  step(function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}))},260);
  step(function(){type('复盘')});
  step(function(){
    out.rvKinds=kinds();out.rvTitles=titles().slice(0,4);
    out.rvHas=out.rvTitles.indexOf('沿街商铺明厨亮灶')>=0;
    var r=rows()[0];if(r)r.click();
  },300);
  step(function(){
    out.rvModal=txt(q('#modalRoot .mb')).indexOf('复盘')>=0;
    out.rvHasFour=['rv_did','rv_gap','rv_why','rv_next'].every(function(k){return !!document.getElementById(k)});
    if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
  },220);

  /* 6. 搜人员 → 抽屉；搜任务 → 任务弹窗带状态 */
  step(function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}))},260);
  step(function(){type('聂婉清')});
  step(function(){
    out.perKinds=kinds();out.perFirst=out.perKinds[0];
    key(q('#cmd_q'),'ArrowDown');
    out.selMoved=rows()[1]?rows()[1].classList.contains('on'):false;
    key(q('#cmd_q'),'ArrowUp');
    out.selBack=rows()[0]?rows()[0].classList.contains('on'):false;
    var r=rows().filter(function(x){return txt(x.querySelector('.ck'))==='任务'})[0];
    if(r)r.click();
  },300);
  step(function(){
    out.taskModal=!!document.getElementById('f_status');
    out.taskStage=!!document.getElementById('f_stage');
    if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
  },220);

  /* 7. 快捷键一览（? 键） */
  step(function(){
    key(document.body,'?');
  },240);
  step(function(){
    var t=txt(q('#modalRoot .mb'));
    out.helpOpen=t.indexOf('快捷键')>=0;
    out.helpRows=qa('#modalRoot .mb tbody tr').length;
    out.helpHasCtrlK=t.indexOf('Ctrl')>=0&&t.indexOf('K')>=0;
    out.helpHasPhone=t.indexOf('手机')>=0;
    if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
  },200);

  /* 8. Esc 关弹窗 */
  step(function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}))},240);
  step(function(){out.escBefore=!!q('#cmd_q');key(q('#cmd_q'),'Escape')},200);
  step(function(){out.escAfter=!q('#cmd_q')});

  setTimeout(function(){run(0)},260);
},340);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r7.html'), h, 'utf8');
console.log('built', h.length);
