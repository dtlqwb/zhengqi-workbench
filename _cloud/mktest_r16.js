/* R16 校验：业务档案「对手与打法」段的空态、编辑、回显 */
const T = require('./tseed');
const S = T.baseS({ ui: { view: 'project', f: {} } });

const body = `
S.ui.view='project';render();
fire('bizopen',{p:'智慧水务平台'});

function CHECK(out){
  /* 空态 */
  out.boxExists=!!q('#drawerRoot .r16box');
  out.emptyHint=/还没写/.test(tx('#drawerRoot .r16box'));
  out.editBtn=!!q('#drawerRoot [data-act=r16edit]');
  out.btnTxt=q('#drawerRoot [data-act=r16edit]')?q('#drawerRoot [data-act=r16edit]').textContent.trim():'';
  out.noOdds=!q('#drawerRoot .r16odds');
  /* 位置：应在「目标」之后、「里程碑」之前 */
  var secs=qa('#drawerRoot .db > .sec-t').map(function(e){return e.textContent.trim()});
  out.secs=secs;
  var boxIdx=-1;
  var kids=[].slice.call(q('#drawerRoot .db').children);
  out.boxAfterGoal=boxIdx=kids.indexOf(q('#drawerRoot .r16box'))>kids.indexOf(qa('#drawerRoot .db > .sec-t').find(function(e){return e.textContent.trim()==='目标'}));
  /* 编辑 */
  fire('r16edit',{p:'智慧水务平台'});
  out.formOpen=!!document.getElementById('r16_r')&&!!document.getElementById('r16_o');
  document.getElementById('r16_r').value='中国电信（千里眼）、本地集成商';
  document.getElementById('r16_s').value='先拿市监局背书打 3 家样板店，用 45 条线路案例压价';
  document.getElementById('r16_o').value='高';
  fire('r16save',{p:'智慧水务平台'});
  var p=S.projects.find(function(x){return x.name==='智慧水务平台'});
  out.savedRivals=p.rivals;
  out.savedStrategy=p.strategy;
  out.savedOdds=p.odds;
  out.logOk=(p.log||[]).some(function(l){return /对手与打法/.test(l.text)});
  /* 回显（要等下一拍，抽屉补丁是异步的） */
  fire('bizopen',{p:'智慧水务平台'});
}
function CHECK2(out){
  var box2=q('#drawerRoot .r16box');
  out.filled=!!box2&&/中国电信/.test(box2.textContent)&&/样板店/.test(box2.textContent);
  out.oddsChip=tx('#drawerRoot .r16odds');
  out.oddsOk=/赢面 高/.test(out.oddsChip);
  out.noDup=qa('#drawerRoot .r16box').length===1;
  out.btnNow=q('#drawerRoot [data-act=r16edit]')?q('#drawerRoot [data-act=r16edit]').textContent.trim():'';
  /* 另一条业务没被串改 */
  fire('bizopen',{p:'AI广播运维'});
  var o=S.projects.find(function(x){return x.name==='AI广播运维'});
  out.otherClean=!o.rivals&&!o.strategy;
}
`;

console.log('built', T.mk('_t_r16.html', S, body));
