/* 用线上真实数据（1 客户 / 1 部门 / 2 人 / 1 条无项目任务 / 1 条 demo 便签）逐视图渲染，验 V13 修正 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');
const REAL = fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8');

const catcher = '<script>window.__ERR=[];'
  + 'window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});'
  + 'window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});'
  + '</' + 'script>';
h = h.replace('</head>', catcher + '\n</head>');

const REAL_B64 = Buffer.from(REAL, 'utf8').toString('base64');
const probe = `<script>(function(){
var out={};
function q(s){return document.querySelector(s)}
function txt(el){return el?el.innerText.replace(/\\s+/g,' '):''}
setTimeout(function(){
  S=JSON.parse(decodeURIComponent(escape(atob('${REAL_B64}'))));
  out.errLoad=window.__ERR.slice();
  out.viewKeys=VIEWS.map(function(v){return v[0]});
  /* 1) 13 视图逐个渲染 + 零报错 */
  var errs={},lens={};
  out.viewKeys.forEach(function(k){
    var before=window.__ERR.length;
    try{S.ui.view=k;render();}catch(e){errs[k]='THROW:'+String(e&&e.message||e)}
    lens[k]=txt(document.getElementById('view')).length;
    if(window.__ERR.length>before)errs[k]='ERR:'+window.__ERR[window.__ERR.length-1];
  });
  out.viewErr=errs;out.lens=lens;
  /* 2) 项目视角：未归项目卡 + 任务可见 */
  S.ui.view='project';render();
  var pv=txt(document.getElementById('view'));
  out.projHasCard=pv.indexOf('未归项目')>=0;
  out.projTaskVisible=pv.indexOf('消防队发送短信')>=0;
  out.projCardBtn=!!q('[data-act=projnone]');
  /* 3) 点开未归项目卡 */
  if(q('[data-act=projnone]'))q('[data-act=projnone]').click();
  var mt=txt(document.querySelector('#modalRoot .mb'));
  out.projModalOpen=mt.indexOf('消防队发送短信')>=0;
  out.projModalHasBtn=!!document.querySelector('#modalRoot [data-act=task]');
  if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
  /* 4) 客户卡补字 */
  S.ui.view='client';render();
  var card=txt(q('#view .org-grid .orgbox'));
  out.clientCard=card.slice(0,240);
  out.clientCardHint=card.indexOf('未归项目')>=0;
  /* 5) 客户抽屉补字 */
  if(q('[data-act=clientview]'))q('[data-act=clientview]').click();
  setTimeout(function(){
    var dr=txt(document.querySelector('#drawerRoot .db'));
    out.drawerHint=dr.indexOf('未归项目')>=0;
    out.drawerTxt=dr.slice(0,220);
    if(q('#drawerRoot .x'))q('#drawerRoot .x').click();
    /* 6) 收件箱 demo 已被剔掉 */
    S.ui.view='wbinbox';render();
    var wb=txt(document.getElementById('view'));
    out.wbDemoGone=wb.indexOf('示例受理人')<0;
    out.wbInboxLen=(S.wbInbox||[]).length;
    /* 7) 作战室图例含新角色 */
    S.ui.view='room';render();
    var lg=txt(q('#view .legend'));
    out.legend=lg;
    out.legendHasNewRole=lg.indexOf('业务管理')>=0;
    out.legendHasOldRoles=['客户经理','网格长','合伙公司负责人','个体技工'].every(function(r){return lg.indexOf(r)>=0});
    /* 8) KPI 文案（kpis 只在流程/态势等视图里） */
    S.ui.view='flow';render();
    var kp=txt(q('#view .kpis'));
    out.kpis=kp;
    out.kpiOk=kp.indexOf('四类角色')<0 && kp.indexOf('共 ')>-1;
    out.flowRoleLineHasNew=((document.querySelector('#view svg')||{}).textContent||'').indexOf('业务管理')>=0;
    S.ui.view='today';render();
    out.todayHasWangquan=txt(document.getElementById('view')).indexOf('汪全胜')>=0;
    /* 9) 简报：本地口径 / 云端口径 */
    S.ui.view='brief';render();
    var bl=txt(document.getElementById('briefBox'));
    out.briefLocal=bl.slice(-160);
    out.briefLocalOk=bl.indexOf('数据仅存本机')>=0;
    window.__CLOUD__={};
    S.ui.view='brief';render();
    var bl2=txt(document.getElementById('briefBox'));
    out.briefCloud=bl2.slice(-160);
    out.briefCloudOk=bl2.indexOf('数据已同步云端')>=0;
    var dv=txt(document.getElementById('view'));
    out.vBriefCloudNote=dv.indexOf('数据只存当前浏览器')<0 && dv.indexOf('已连云端')>=0;
    /* 10) 流程视图角色行 */
    out.errAll=window.__ERR.slice();
    var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);
    document.body.appendChild(d);
  },120);
},200);
})();</script>`;
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(__dirname, 'real_dom.html'), h, 'utf8');
console.log('built real_dom.html', h.length);
