/* 生成白板直连的无头测试副本 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, 'share', 'index.html'), 'utf8');

const catcher = '<script>window.__ERR=[];'
  + 'window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});'
  + 'window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});'
  + '</' + 'script>';
h = h.replace('</head>', catcher + '\n</head>');

const probe = '<script>(function(){'
  + 'var out={};function q(s){return document.querySelector(s)}'
  + 'setTimeout(function(){'
  + '  out.err0=window.__ERR.slice();'
  + '  out.wbReady=!!window.__WB_READY__;'
  + '  out.hasSync=!!window.__WB_SYNC__;'
  + '  var t=q(\'.tab[data-v="wbinbox"]\');'
  + '  out.tabFound=!!t;'
  + '  if(t)t.click();'
  + '  setTimeout(function(){'
  + '    var v=document.getElementById("view");'
  + '    var txt=v?v.innerText:"";'
  + '    out.viewLen=txt.length;'
  + '    out.hasBtn=txt.indexOf("立即同步")>=0;'
  + '    out.hasSrc=(txt.indexOf("云端直连")>=0)||(txt.indexOf("云端库")>=0);'
  + '    out.hasDemo=txt.indexOf("演示数据")>=0;'
  + '    out.emptyHint=txt.indexOf("白板上还没有指派出去的便签")>=0;'
  + '    var m=txt.match(/本次条数：\\s*(\\d+)/);out.count=m?m[1]:"?";'
  + '    var m2=txt.match(/待收录：\\s*(\\d+)/);out.fresh=m2?m2[1]:"?";'
  + '    out.snippet=txt.replace(/\\s+/g," ").slice(0,240);'
  + '    out.err1=window.__ERR.slice();'
  + '    var d=document.createElement("div");d.id="TESTOUT";d.textContent=JSON.stringify(out);document.body.appendChild(d);'
  + '  },5000);'
  + '},5000)})()</' + 'script>';
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(dir, 'share', '_t.html'), h, 'utf8');
console.log('share/_t.html', h.length);
