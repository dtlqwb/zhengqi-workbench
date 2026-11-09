/* 生成构建产物（线上版）的首屏只读断言副本 */
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
setTimeout(function(){
  var b=document.body;
  out.ro=b.classList.contains('ro');
  out.err0=window.__ERR.slice();
  out.cloudCfg=!!window.__CLOUD__;
  out.cloudKeys=window.__CLOUD__?Object.keys(window.__CLOUD__).sort().join(','):'';
  var acc=q('#accBtn')||q('[id=accBtn]');
  out.accTxt=acc?acc.innerText.replace(/\\s+/g,' ').trim():'(none)';
  out.tabs=qa('.tab').length;
  var names=qa('.tab').map(function(t){return t.innerText.replace(/\\s+/g,'').replace(/\\d+$/,'')});
  out.hasInbox=names.some(function(n){return n.indexOf('白板收件箱')>=0});
  out.hasNet=names.some(function(n){return n.indexOf('关系网')>=0});
  out.hasDeliver=names.some(function(n){return n.indexOf('交付与回执')>=0});
  out.actors=qa('.actor').length;
  var t=q('.tab[data-v="wbinbox"]');
  if(t)t.click();
  setTimeout(function(){
    var v=document.getElementById('view');
    var txt=v?v.innerText:'';
    out.wbLen=txt.length;
    out.hasDirection=txt.indexOf('白板在前')>=0;
    out.hasZeroWrite=txt.indexOf('零写入')>=0;
    out.hasSync=txt.indexOf('立即同步')>=0;
    out.hasSrc=txt.indexOf('云端镜像')>=0;
    var m=txt.match(/本次条数：\\s*(\\d+)/);out.mirrorCount=m?m[1]:'?';
    out.readErr=txt.indexOf('上次读取失败')>=0;
    out.err1=window.__ERR.slice();
    var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
  },6000);
},4000)})()</script>`;
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(dir, '_t_share.html'), h, 'utf8');
console.log('share/_t_share.html', h.length);
