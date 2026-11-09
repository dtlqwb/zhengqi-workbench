const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..');
let h=fs.readFileSync(path.join(dir,'政企作战台.html'),'utf8');
h=h.replace('</head>','<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});</scr'+'ipt>\n</head>');
const probe=`<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(){var v=document.getElementById('view');return v?v.innerText:''}
setTimeout(function(){
  out.err0=window.__ERR.slice();
  S.ext=[];S.projects=[];S.tasks=[];S.people=[];S.orgs=[];S.ui.view='client';render();
  var v=txt();
  out.emptyHint=v.indexOf('还没有客户')>=0;
  out.headOk=v.indexOf('客户')>=0;
  out.err1=window.__ERR.slice();
  S.ui.view='project';render();
  var p=txt();
  out.projEmpty=p.indexOf('还没有项目')>=0;
  out.err2=window.__ERR.slice();
  S.ui.view='board';render();
  out.boardOk=txt().length>20;
  out.err3=window.__ERR.slice();
  var o=document.createElement('div');o.id='TESTOUT';o.textContent=JSON.stringify(out);document.body.appendChild(o);
},1800)})()</script>`;
h=h.replace('</body>',probe+'\n</body>');
fs.writeFileSync(path.join(dir,'_t_cempty.html'),h,'utf8');
console.log('ok');
