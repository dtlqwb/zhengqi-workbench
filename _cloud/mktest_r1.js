/* R1 断言：新建业务 → 立项三件套落库 → 卡片标「已立项」→ 派单可选到新业务 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');
const REAL = fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8');
const B64 = Buffer.from(REAL, 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(e){return e?e.innerText.replace(/\\s+/g,' ').trim():''}
function set(id,v){var e=document.getElementById(id);if(e)e.value=v}
setTimeout(function(){
  S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
  S.ui.view='project';render();
  out.v14=!!window.__V14_READY__;
  out.err0=window.__ERR.slice();
  out.newBtn=!!q('[data-act=biznew]');
  out.cardCount=qa('#view .proj').length;
  out.pendingLine=txt(q('#view')).indexOf('待立项')>=0;
  /* 打开新建业务 */
  q('[data-act=biznew]').click();
  out.formHas=[ 'b_name','b_client','b_kind','b_goal','b_why','b_dec','b_budget' ].every(function(id){return !!document.getElementById(id)});
  set('b_name','智慧水务平台建设');
  var cl=q('#b_client');if(cl&&cl.options.length>1)cl.selectedIndex=1;
  set('b_goal','年底前完成管网漏损治理验收并回款');
  set('b_why','市政公用局提报，专项债资金已批');
  set('b_dec','接');
  set('b_budget','专项债 730 万，财评口径待定');
  q('#modalRoot [data-act=bizsave]').click();
  setTimeout(function(){
    var p=(S.projects||[]).find(function(x){return x.name==='智慧水务平台建设'});
    out.created=!!p;
    out.fields=p?[p.kind,p.goal,p.why,p.decision,p.budget,p.stage,p.clientId?'set':'empty'].join('|'):'';
    S.ui.view='project';render();
    out.cardCount2=qa('#view .proj').length;
    out.pendingGone=txt(q('#view')).indexOf('还差')<0;out.approvedLine=!!q('#view [data-act=bizadv]');
    /* 派单表单能选到新业务 */
    S.ui.view='board';render();
    var nb=q('[data-act=newtask]');
    out.newTaskBtn=!!nb;
    if(nb)nb.click();
    setTimeout(function(){
      var dl=document.getElementById('projlist');
      out.datalist=dl?[].slice.call(dl.querySelectorAll('option')).map(function(o){return o.value}):[];
      out.datalistHasNew=out.datalist.indexOf('智慧水务平台建设')>=0;
      if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
      /* 老业务仍应显示待立项（它没有 goal） */
      var old=(S.projects||[]).find(function(x){return x.name!=='智慧水务平台建设'});
      out.oldPending=old?(!old.goal||!old.decision):'(no old)';
      out.errAll=window.__ERR.slice();
      var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
    },150);
  },180);
},260);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir,'_t_r1.html'), h, 'utf8');
console.log('built', h.length);
