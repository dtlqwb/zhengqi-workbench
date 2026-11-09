/* R18 校验：一页纸汇报的数据、HTML 结构、print 样式与纯文本版 */
const T = require('./tseed');
function day(n){const x=new Date();x.setDate(x.getDate()+n);const p=v=>String(v).padStart(2,'0');
  return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())}
const mk=(id,title,pid,project,due,status)=>({id,title,personId:pid,project,projectId:'',client:'c1',
  prio:'重要',due,status,flow:'',support:[],created:day(-20),updated:day(-1),deliverable:'',receipt:false,feedback:'',note:''});

const S = T.baseS({
  ui: { view: 'today', f: {} },
  projects: [
    { id: 'b1', name: '智慧水务平台', clientId: 'c1', stage: 'S3', kind: 'once', goal: 'g', why: 'w', decision: '接', amt: 7300000, paid: 3000000, cost: 5000000, strategy: '市监局背书打样板', milestones: [], planOk: true, log: [] },
    { id: 'b2', name: '治超不停车检测', clientId: 'c1', stage: 'S5', kind: 'once', goal: 'g', why: 'w', decision: '接', amt: 1900000, paid: 1900000, cost: 1400000, milestones: [], planOk: true, closedAt: day(-30), review: { did: 'a', gap: 'b', why: 'c', next: 'd' }, log: [] },
    { id: 'b3', name: 'AI广播运维', clientId: 'c2', stage: 'S3', kind: 'standing', goal: 'g', why: 'w', decision: '接', amt: 0, paid: 0, cost: 0, milestones: [], planOk: true, reviews: [], log: [] }
  ],
  tasks: [
    mk('t1', '财评报告送审', 'p1', '智慧水务平台', day(-10), '进行中'),
    mk('t2', '财评补充材料', 'p2', '智慧水务平台', day(-3), '进行中'),
    mk('t3', '固件升级', 'p3', 'AI广播运维', day(2), '待接收'),
    mk('t4', '验收归档', 'p2', '治超不停车检测', day(-40), '已完成')
  ]
});

const body = `
S.ui.view='today';render();
out.api=!!window.__R18__;
out.topBtn=!!q('.top-actions [data-act=r18]');
var d=window.__R18__.data();
out.nProj=d.ps.length;
out.nTask=d.ts.length;
out.nLate=d.late.length;
out.amt=d.amt;
out.paid=d.paid;
out.rate=d.rate;
out.dataOk=d.ps.length===3&&d.ts.length===4&&d.late.length===2&&d.amt===9200000&&d.paid===4900000;
var h=window.__R18__.buildReport();
out.hasTitle=/政企 ICT 工作汇报/.test(h);
out.hasDate=new RegExp('${day(0)}').test(h);
out.hasSec1=/一、业务进度/.test(h);
out.hasSec2=/二、逾期未收口（2 项）/.test(h);
out.tableRows=(h.match(/<tr>/g)||[]).length;
out.hasProj=/智慧水务平台/.test(h);
out.hasMoney=/730万/.test(h);
out.hasStrategy=/市监局背书打样板/.test(h);
out.hasLateName=/财评报告送审/.test(h);
out.lateDays=/10 天/.test(h);
out.hasFoot=/只统计本机已录入的数据/.test(h);
/* 未来 7 天：t3 在 2 天后到期，应出现在第三节 */
out.hasDue7=/未来 7 天到期（1 项）/.test(h);
/* print 样式 */
out.printCss=qa('style').some(function(s){
  var t=s.textContent||'';return t.indexOf('@media print')>=0&&t.indexOf('body>*:not(#printRoot)')>=0});
/* 纯文本版 */
var t=window.__R18__.buildText();
out.textHead=t.split('\\n')[0];
out.textHasLate=/【逾期 2 项】/.test(t);
out.textHasMoney=/合同 920万/.test(t);
out.textLines=t.split('\\n').length;
/* 导出弹层 */
fire('r18');
out.modalOpen=!!q('.mb [data-act=r18print]')&&!!q('.mb [data-act=r18copy]');
out.modalTxt=/当前数据/.test(tx('.mb'));
fire('r18print');
out.printRoot=!!q('#printRoot');
out.printHtml=q('#printRoot')?q('#printRoot').innerHTML.length:0;
out.printFilled=out.printHtml>1200;

function CHECK(out){
  out.printRootRows=q('#printRoot')?qa('#printRoot tr').length:0;
  out.chipAfterClose=!q('.mb [data-act=r18print]');
}
`;

console.log('built', T.mk('_t_r18.html', S, body));
