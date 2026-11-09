/* R14 校验：逾期统计、分档、逐条处置（催/改期/关掉）与留痕 */
const T = require('./tseed');
function day(n){const x=new Date();x.setDate(x.getDate()+n);const p=v=>String(v).padStart(2,'0');
  return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())}
const mk=(id,title,pid,due,status)=>({id,title,personId:pid,project:'智慧水务平台',projectId:'b1',client:'c1',
  prio:'重要',due,status,flow:'',support:[],created:day(-30),updated:day(-1),deliverable:'',receipt:false,feedback:'',note:''});

const S = T.baseS({
  ui: { view: 'today', f: {} },
  tasks: [
    mk('t1','财务点位核对','p1',day(-2),'进行中'),
    mk('t2','财评报告送审','p1',day(-10),'进行中'),
    mk('t3','管线探测补测','p2',day(-5),'待接收'),
    mk('t4','物联网设备联调','p3',day(-20),'待接收'),
    mk('t5','下周计划','p2',day(2),'待接收'),
    mk('t6','已交付的活','p3',day(-30),'已完成')
  ]
});

const body = `
S.ui.view='today';render();
out.pExists=!!q('#view .r14p');
out.head=tx('#view .r14p .h b');
out.g=qa('#view .r14p .g>div').map(function(e){return e.textContent.trim()});
/* 已完成的不算逾期 */
out.lateIds=window.__R14__.lateAll().map(function(t){return t.id});
out.lateOk=out.lateIds.join(',')==='t4,t2,t3,t1';
out.d20=window.__R14__.lateDays(S.tasks.find(function(x){return x.id==='t4'}));
out.dDone=window.__R14__.lateDays(S.tasks.find(function(x){return x.id==='t6'}));
/* 派单看板的左色条 */
S.ui.view='board';render();
out.hard=qa('#view .tcard.hard').length;
out.soft=qa('#view .tcard.soft').length;
out.hardOk=out.hard===2&&out.soft===2;
/* 逐条处置清单 */
fire('r14list');
out.rows=qa('.mb .r14row').length;

/* 改期：t2 从 10 天前改到 5 天后 */
fire('r14post',{id:'t2'});
out.formDue=!!document.getElementById('r14_due');
document.getElementById('r14_due').value='${day(5)}';
document.getElementById('r14_note').value='财评报告等甲方盖章';
fire('r14save',{id:'t2',mode:'post'});
var t2=S.tasks.find(function(x){return x.id==='t2'});
out.t2Due=t2.due;
out.t2Ok=t2.due==='${day(5)}';
out.t2Log=(t2.log||[]).map(function(l){return l.text}).join(' | ');
out.t2LateGone=window.__R14__.lateDays(t2)===0;
/* 新期限必须在今天之后 */
fire('r14post',{id:'t3'});
document.getElementById('r14_due').value='${day(-1)}';
fire('r14save',{id:'t3',mode:'post'});
out.pastBlocked=S.tasks.find(function(x){return x.id==='t3'}).due==='${day(-5)}';
/* 关掉：t1 */
fire('r14cut',{id:'t1'});
document.getElementById('r14_reason');
fire('r14save',{id:'t1',mode:'cut'});
var t1=S.tasks.find(function(x){return x.id==='t1'});
out.t1Status=t1.status;
out.t1Done=t1.doneAt==='${day(0)}';
out.t1Log=(t1.log||[]).map(function(l){return l.text}).join(' | ');
out.leftLate=window.__R14__.lateAll().length;
/* 催办不报错 */
try{window.__R14__.urge('t3');out.urgeOk=true}catch(e){out.urgeOk=false;}

function CHECK(out){
  out.panelNow=qa('#view .r14p').length;
  out.noDupPanel=out.panelNow<=1;
}
`;

console.log('built', T.mk('_t_r14.html', S, body));
