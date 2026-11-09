/* 构建产物（线上版）V13 断言：脱敏 / 只读 / 未归项目兜底 / 角色图例 / 云端口径文案 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'share');
let h = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const catcher = '<script>window.__ERR=[];'
  + 'window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});'
  + 'window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});'
  + '</' + 'script>';
h = h.replace('</head>', catcher + '\n</head>');

const probe = `<script>(function(){
var out={};
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(el){return el?el.innerText.replace(/\\s+/g,' ').trim():''}
setTimeout(function(){
  var b=document.body;
  out.ro=b.classList.contains('ro');
  out.err0=window.__ERR.slice();
  out.cloudKeys=window.__CLOUD__?Object.keys(window.__CLOUD__).sort().join(','):'';
  out.tabs=qa('.tab').length;
  out.v13=!!window.__V13_READY__;
  out.v12=!!window.__V12_READY__;
  /* 项目视角：未归项目兜底卡 */
  try{S.ui.view='project';render();}catch(e){out.e1=String(e)}
  var pv=txt(q('#view'));
  out.projHasCard=pv.indexOf('未归项目')>=0;
  out.projBtn=!!q('[data-act=projnone]');
  /* 客户视角 */
  try{S.ui.view='client';render();}catch(e){out.e2=String(e)}
  var cv=txt(q('#view'));
  out.clientHint=cv.indexOf('未归项目')>=0;
  out.clientName=cv.indexOf('应急管理局')>=0;
  /* 作战室图例 */
  try{S.ui.view='room';render();}catch(e){out.e3=String(e)}
  out.legend=txt(q('#view .legend'));
  /* 简报只读态 + 云端口径 */
  try{S.ui.view='brief';render();}catch(e){out.e4=String(e)}
  var bl=txt(document.getElementById('briefBox'));
  out.briefCloud=bl.indexOf('数据已同步云端')>=0;
  out.briefNoLocal=bl.indexOf('数据仅存本机')<0;
  out.dataNote=txt(q('#view')).indexOf('数据只存当前浏览器')<0;
  /* 未登录不得有编辑入口 */
  out.editBtns=qa('[data-act=newtask]').length;
  out.errAll=window.__ERR.slice();
  var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);
  document.body.appendChild(d);
},2500);
})();</script>`;
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(__dirname, '..', '_t_share13.html'), h, 'utf8');
console.log('built _t_share13.html', h.length);
