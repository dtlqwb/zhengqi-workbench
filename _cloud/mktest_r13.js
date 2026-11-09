/* R13 校验：客户沉默天数分档、「该联系了」清单、记联系（含抽屉） */
const T = require('./tseed');
function day(n){const x=new Date();x.setDate(x.getDate()+n);const p=v=>String(v).padStart(2,'0');
  return x.getFullYear()+'-'+p(x.getMonth()+1)+'-'+p(x.getDate())}
const TODAY = day(0);

const S = T.baseS({
  ui: { view: 'client', f: {} },
  ext: [
    { id: 'c1', name: '示例县住建局', type: '政府部门', pay: '财政直付', contact: '张科长', title: '科长', phone: '', color: '#0f6b8a', touch: day(-3), touchLog: [{ at: day(-3), way: '电话', text: '问了财评进度' }] },
    { id: 'c2', name: '示例县消防大队', type: '政府部门', pay: '财政直付', contact: '周建平', title: '副主任', phone: '', color: '#c0507a', touch: day(-20) },
    { id: 'c3', name: '示例县农业农村局', type: '政府部门', pay: '财政直付', contact: '李局', title: '局长', phone: '', color: '#0f9b96' },
    { id: 'c4', name: '示例县市监局', type: '政府部门', pay: '财政直付', contact: '王科', title: '科长', phone: '', color: '#7a5cd6', touch: day(-45) }
  ]
});

const body = `
S.ui.view='client';render();
out.sumExists=!!q('#view .r13sum');
out.head=tx('#view .r13sum .h');
out.listN=qa('#view .r13sum .it').length;
out.listNames=qa('#view .r13sum .it').map(function(e){return (e.querySelector('span')||{}).textContent});
/* 卡上的沉默文案：c1 3 天 / c2 20 天 / c3 未记录 / c4 45 天 */
out.cardT=qa('#view .orgbox .r13t').map(function(e){return e.textContent.replace(/\\s+/g,' ').trim()});
out.cardN=qa('#view .orgbox .r13t').length;
out.touchBtns=qa('#view .orgbox [data-act=touch]').length;
/* 一键记今天 */
var i2=window.__R13__.info(S.ext.find(function(x){return x.id==='c2'}));
out.beforeDays=i2.d;
fire('touchnow',{id:'c2'});
out.c2Touch=S.ext.find(function(x){return x.id==='c2'}).touch;
out.c2Today=out.c2Touch==='${TODAY}';
out.afterListN=qa('#view .r13sum .it').length;
out.c2LogLen=(S.ext.find(function(x){return x.id==='c2'}).touchLog||[]).length;
/* 打开客户抽屉 */
fire('clientview',{id:'c1'});

function CHECK(out){
  out.dwExists=!!q('#drawerRoot .r13dw');
  out.dwTxt=tx('#drawerRoot .r13dw');
  out.dwBtn=!!q('#drawerRoot [data-act=touch]');
  out.dwDup=qa('#drawerRoot .r13dw').length===1;
  /* 写一句：把 c3（从未记录）记成 2 天前 */
  fire('touch',{id:'c3'});
  out.formOpen=!!document.getElementById('tc_at');
  document.getElementById('tc_at').value='${day(-2)}';
  document.getElementById('tc_txt').value='约了周三看现场';
  fire('tcsave',{id:'c3'});
  var c3=S.ext.find(function(x){return x.id==='c3'});
  out.c3Touch=c3.touch;
  out.c3Ok=c3.touch==='${day(-2)}';
  out.c3Log=(c3.touchLog||[])[0]&&(c3.touchLog||[])[0].text;
  /* 未来日期拦截 */
  fire('touch',{id:'c3'});
  document.getElementById('tc_at').value='${day(3)}';
  fire('tcsave',{id:'c3'});
  out.futureBlocked=S.ext.find(function(x){return x.id==='c3'}).touch==='${day(-2)}';
  /* 分档函数 */
  out.bk=[
    window.__R13__.info({touch:'${day(-1)}'}).txt,
    window.__R13__.info({touch:'${day(-10)}'}).pri,
    window.__R13__.info({touch:'${day(-20)}'}).txt,
    window.__R13__.info({touch:'${day(-45)}'}).txt,
    window.__R13__.info({}).txt
  ];
  out.bkOk=out.bk[0]==='1 天前联系'&&out.bk[1]===1&&out.bk[2]==='20 天前联系'&&out.bk[3]==='45 天前联系'&&out.bk[4]==='从未记录';
  out.finalList=window.__R13__.needList().map(function(x){return x.c.name});
}
`;

console.log('built', T.mk('_t_r13.html', S, body), 'TODAY=' + TODAY);
