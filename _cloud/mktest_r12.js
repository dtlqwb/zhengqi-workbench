/* R12 校验：项目金额（合同额 / 已回款 / 成本）在业务卡、五段看板、业务档案三处都显示，能存能改 */
const T = require('./tseed');
const S = T.baseS();

const body = `
S.ui.view='project';render();
out.sumExists=!!q('#view .r12sum');
out.contract=tx('#view .r12sum .g .c:nth-child(1) .v');
out.paid=tx('#view .r12sum .g .c:nth-child(2) .v');
out.dueMoney=tx('#view .r12sum .g .c:nth-child(3) .v');
out.gross=tx('#view .r12sum .g .c:nth-child(4) .v');
out.lackHint=/1 个业务没填金额/.test(tx('#view .r12sum .foot'));
out.sumOk=out.contract==='920万'&&out.paid==='490万'&&out.gross==='280万';
/* 卡片上的回款条条数应与「有金额的业务卡」一致（S4 监督列会重复出现，按实际卡数算） */
out.bars=qa('#view .bcard .r12bar').length;
out.barsExpect=qa('#view .bcard').filter(function(c){
  var p=S.projects.find(function(x){return x.name===c.dataset.p});return p&&p.amt>0}).length;
out.barsOk=out.bars===out.barsExpect&&out.bars>0;
out.barTxt=qa('#view .bcard .r12bar').map(function(e){return e.textContent.replace(/\\s+/g,' ').trim()});
/* 重复渲染不叠加 */
render();render();
out.noDup=qa('#view .r12sum').length===1;
fire('bizopen',{p:'智慧水务平台'});

function CHECK(out){
  /* 抽屉里的金额段（MutationObserver 异步补的，要等一个 tick） */
  out.dwExists=!!q('.drawer .r12dw');
  out.dwTxt=tx('.drawer .r12dw');
  out.moneyBtn=!!q('.drawer [data-act=bizm]');
  out.drawerNoDup=qa('.drawer .r12dw').length===1;

  /* 改金额：730/300/500 → 800/400/520 */
  fire('bizm',{p:'智慧水务平台'});
  out.formAmt=(document.getElementById('m_amt')||{}).value;
  out.formPaid=(document.getElementById('m_paid')||{}).value;
  document.getElementById('m_amt').value='800';
  document.getElementById('m_paid').value='400';
  document.getElementById('m_cost').value='520';
  document.getElementById('m_note').value='验收后付 60%';
  fire('msave',{p:'智慧水务平台'});
  var p1=S.projects.find(function(x){return x.name==='智慧水务平台'});
  out.saved=p1.amt+'/'+p1.paid+'/'+p1.cost;
  out.noteSaved=p1.payNote;
  out.logOk=(p1.log||[]).some(function(l){return /金额/.test(l.text)});
  out.afterSave=tx('#view .r12sum .g .c:nth-child(2) .v');

  /* 负数拦截 */
  fire('bizm',{p:'智慧水务平台'});
  document.getElementById('m_amt').value='-5';
  fire('msave',{p:'智慧水务平台'});
  out.negBlocked=S.projects.find(function(x){return x.name==='智慧水务平台'}).amt===8000000;

  /* 已回款超合同额：confirm 在测试里固定返回 false → 不应写入 */
  fire('bizm',{p:'智慧水务平台'});
  document.getElementById('m_amt').value='100';
  fire('msave',{p:'智慧水务平台'});
  out.overBlocked=S.projects.find(function(x){return x.name==='智慧水务平台'}).amt===8000000;

  /* 金额格式化 */
  out.fWan=window.__R12__.M(7300000);
  out.fYi=window.__R12__.M(123456789);
  out.fZero=window.__R12__.M(0);
  out.fSmall=window.__R12__.M(3500);
  out.fmtOk=out.fWan==='730万'&&out.fZero==='0'&&out.fSmall==='3500'&&/亿$/.test(out.fYi);
}
`;

const n = T.mk('_t_r12.html', S, body);
console.log('built', n);
