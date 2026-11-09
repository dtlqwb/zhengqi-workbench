/* R15 校验：看板多选、批量改状态/改人/改期限、批量删除、撤销 */
const T = require('./tseed');
function day(n){const x=new Date();x.setDate(x.getDate()+n);const p=v=>String(v).padStart(2,'0');
  return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())}
const mk=(id,title,pid,due,status)=>({id,title,personId:pid,project:'智慧水务平台',projectId:'b1',client:'c1',
  prio:'重要',due,status,flow:'',support:[],created:day(-30),updated:day(-1),deliverable:'',receipt:false,feedback:'',note:''});

const S = T.baseS({
  ui: { view: 'board', f: {} },
  tasks: [
    mk('t1','财务点位核对','p1',day(-2),'进行中'),
    mk('t2','财评报告送审','p1',day(2),'待接收'),
    mk('t3','管线探测补测','p2',day(3),'待接收'),
    mk('t4','物联网设备联调','p3',day(4),'待验收')
  ]
});

const body = `
S.ui.view='board';render();
out.barExists=!!q('#view .r15bar');
out.barTxt=tx('#view .r15bar');
out.cards=qa('#view .tcard').length;
out.ckBefore=qa('#view .r15ck').length;
fire('r15mode');
out.mode=window.__R15__.mode();
out.ckAfter=qa('#view .r15ck').length;
out.ckOk=out.ckAfter===out.cards;
out.draggableOff=qa('#view .tcard').every(function(c){return c.draggable===false});
/* 多选态下点卡片＝勾选，不打开任务 */
q('#view .tcard').click();
out.selAfterClick=window.__R15__.sel().length;
out.noDrawer=!q('#drawerRoot .drawer');
q('#view .tcard').click();
out.selAfterSecond=window.__R15__.sel().length;
/* 全选 */
fire('r15all');
out.selAll=window.__R15__.sel().length;
out.selAllOk=out.selAll===out.cards;
/* 批量改：状态→进行中、负责人→p2、期限→7 天后 */
fire('r15go');
out.formOpen=!!document.getElementById('r15_st')&&!!document.getElementById('r15_ps')&&!!document.getElementById('r15_due');
document.getElementById('r15_st').value='进行中';
document.getElementById('r15_ps').value='p2';
document.getElementById('r15_due').value='${day(7)}';
fire('r15save');
out.afterSt=S.tasks.map(function(t){return t.status}).join(',');
out.afterPs=S.tasks.map(function(t){return t.personId}).join(',');
out.afterDue=S.tasks.map(function(t){return t.due}).join(',');
out.logHasBatch=S.tasks.every(function(t){return (t.log||[]).some(function(l){return /批量改/.test(l.text)})});
out.selCleared=window.__R15__.sel().length===0&&window.__R15__.mode()===false;
/* 撤销 */
fire('r15undo');
out.undoSt=S.tasks.map(function(t){return t.status}).join(',');
out.undoPs=S.tasks.map(function(t){return t.personId}).join(',');
out.undoDue=S.tasks.map(function(t){return t.due}).join(',');
out.undoOk=out.undoSt==='进行中,待接收,待接收,待验收'&&out.undoPs==='p1,p1,p2,p3'&&out.undoDue==='${day(-2)},${day(2)},${day(3)},${day(4)}';
out.undoLogClean=S.tasks.every(function(t){return !(t.log||[]).some(function(l){return /批量改/.test(l.text)})});
/* 批量删除 + 撤销删除 */
window.confirm=function(){return true};
fire('r15mode');fire('r15all');fire('r15go');
fire('r15del');
out.afterDel=(S.tasks||[]).length;
fire('r15undo');
out.afterUndoDel=(S.tasks||[]).length;
out.restoredIds=S.tasks.map(function(t){return t.id}).join(',');
window.confirm=function(){return false};

function CHECK(out){
  out.barAfter=qa('#view .r15bar').length;
  out.ckAfterExit=qa('#view .r15ck').length;
}
`;

console.log('built', T.mk('_t_r15.html', S, body));
