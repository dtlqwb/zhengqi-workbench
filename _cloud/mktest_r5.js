/* R5 断言：脏数据自愈 / 数据体检面板 / 快照存取与回滚 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const DIRTY = {
  people: [{ name: '没有id的人', role: '客户经理' }],
  orgs: null,
  ext: '坏数据',
  tasks: [
    { id: 'a', title: '', personId: 'nobody' },
    { id: 'y', title: '正常任务', personId: 'nope', status: '' },
    { id: 'y', title: '重复id的任务' }
  ],
  projects: [{ id: 'p1', name: '有问题的业务', clientId: 'gone', stage: 'SX' }],
  meta: { theme: 'light' },
  ui: { view: 'project' }
};
const B64 = Buffer.from(JSON.stringify(DIRTY), 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(e){return e?e.innerText.replace(/\\s+/g,' ').trim():''}
setTimeout(function(){
  try{
    S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
    S.ui.view='project';render();
  }catch(e){out.threw=String(e&&e.message||e)}
  out.err0=window.__ERR.slice();
  out.ver=S.meta&&S.meta.ver;
  out.peopleN=S.people.length;
  out.orgsN=S.orgs.length;
  out.extIsArr=Array.isArray(S.ext);
  out.tasksN=S.tasks.length;
  out.titles=S.tasks.map(function(t){return t.title});
  out.ids=S.tasks.map(function(t){return t.id});
  out.statusFixed=S.tasks[0]&&S.tasks[0].status;
  out.personCleared=S.tasks.every(function(t){return !t.personId});
  out.projClientCleared=(S.projects[0]||{}).clientId==='';
  out.health=S.meta.health?S.meta.health.fixed:[];
  out.healthN=(out.health||[]).length;
  out.viewOk=!!q('#view .bkan');
  /* 数据管理面板 */
  var dm=q('[data-act=data]');
  out.dmBtn=!!dm;
  if(dm)dm.click();
  setTimeout(function(){
    var mbt=txt(q('#modalRoot .mb'));
    out.panelHasHealth=mbt.indexOf('数据体检')>=0;
    out.panelHasSnap=mbt.indexOf('本地快照')>=0;
    out.panelVer=mbt.indexOf('v3')>=0;
    /* 存档 then 检查条数 */
    var sn=q('#modalRoot [data-act=snapnow]');
    out.snapBtn=!!sn;
    if(sn)sn.click();
    setTimeout(function(){
      var raw=localStorage.getItem('zq_wb_snap_v3');
      var list=raw?JSON.parse(raw):[];
      out.snapN=list.length;
      out.snapReason=list.length?list[0].reason:'';
      out.hasRestore=!!q('#modalRoot [data-act=snaprestore]');
      if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
      out.errAll=window.__ERR.slice();
      var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
    },220);
  },220);
},300);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r5.html'), h, 'utf8');
console.log('built', h.length);
