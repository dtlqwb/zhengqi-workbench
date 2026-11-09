/* 交互探针：登录框、切 tab、只读拦截 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, 'share', 'index.html'), 'utf8');

const catcher = '<script>window.__ERR=[];'
  + 'window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});'
  + 'window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});'
  + '</' + 'script>';
h = h.replace('</head>', catcher + '\n</head>');

const probe = '<script>(function(){'
  + 'var out={steps:[]};function log(k,v){out[k]=v}'
  + 'function q(s){return document.querySelector(s)}'
  + 'setTimeout(function(){'
  + '  log("err0",window.__ERR.slice());'
  + '  log("roHide", getComputedStyle(document.querySelector("[data-act=\\"newtask\\"]")).display);'
  + '  document.getElementById("accBtn").click();'
  + '  setTimeout(function(){'
  + '    var m=document.getElementById("cMask");'
  + '    log("mask", !!m);'
  + '    log("hasEmail", !!(m&&m.querySelector("#cEmail")));'
  + '    log("hasPwd", !!(m&&m.querySelector("#cPwd")));'
  + '    var t=m&&m.querySelector(".c-tab[data-m=\\"activate\\"]");'
  + '    if(t)t.click();'
  + '    setTimeout(function(){'
  + '      var m2=document.getElementById("cMask");'
  + '      log("hasSend", !!(m2&&m2.querySelector("#cSend")));'
  + '      log("hasCode", !!(m2&&m2.querySelector("#cCode")));'
  + '      log("title", m2?m2.querySelector("h3").textContent:"");'
  + '      var f=m2&&m2.querySelector("#cForgot");'
  + '      if(m2&&m2.querySelector(".c-tab[data-m=\\"login\\"]")){m2.querySelector(".c-tab[data-m=\\"login\\"]").click();}'
  + '      setTimeout(function(){'
  + '        var m3=document.getElementById("cMask");'
  + '        var fg=m3&&m3.querySelector("#cForgot");'
  + '        if(fg)fg.click();'
  + '        setTimeout(function(){'
  + '          var m4=document.getElementById("cMask");'
  + '          log("resetTitle", m4?m4.querySelector("h3").textContent:"");'
  + '          log("err1",window.__ERR.slice());'
  + '          var d=document.createElement("div");d.id="TESTOUT";d.textContent=JSON.stringify(out);document.body.appendChild(d);'
  + '        },300);'
  + '      },300);'
  + '    },300);'
  + '  },400);'
  + '},4200)})()</' + 'script>';
h = h.replace('</body>', probe + '\n</body>');

fs.writeFileSync(path.join(__dirname, 'test_login.html'), h, 'utf8');
console.log('test_login.html', h.length);
