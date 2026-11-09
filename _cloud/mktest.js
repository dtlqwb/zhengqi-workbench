/* 生成带错误捕获的本地测试副本 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, 'share', 'index.html'), 'utf8');

const catcher = '<script>window.__ERR=[];'
  + 'window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});'
  + 'window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});'
  + '</' + 'script>';
h = h.replace('</head>', catcher + '\n</head>');

const probe = '<script>setTimeout(function(){'
  + 'var d=document.createElement("div");d.id="TESTOUT";'
  + 'd.textContent=JSON.stringify({'
  + 'err:window.__ERR,'
  + 'acc:!!document.getElementById("accBtn"),'
  + 'accTxt:(document.getElementById("accBtn")||{}).textContent,'
  + 'bar:!!document.getElementById("cBar"),'
  + 'sync:(document.getElementById("syncTip")||{}).textContent,'
  + 'tabs:(document.getElementById("tabs")||{}).children.length,'
  + 'viewLen:(document.getElementById("view")||{}).innerHTML.length,'
  + 'ro:document.body.className,'
  + 'state:(window.__CLOUD_API__?window.__CLOUD_API__.state():"none"),'
  + 'tasks:(window.S&&window.S.tasks?window.S.tasks.length:-1)'
  + '});document.body.appendChild(d)},4500)</' + 'script>';
h = h.replace('</body>', probe + '\n</body>');

const out = path.join(__dirname, 'test_local.html');
fs.writeFileSync(out, h, 'utf8');
console.log('test_local.html', h.length);
