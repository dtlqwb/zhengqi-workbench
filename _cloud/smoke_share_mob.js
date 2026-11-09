/* 构建产物移动端真视口：外层 375px iframe 顶住，内层量横向溢出。node _cloud/smoke_share_mob.js [width] */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const W = Number(process.argv[2]) || 375;
const inner = '_s_mob_in.html';
const frame = '_s_mob.html';

let h = fs.readFileSync(path.join(dir, 'share', 'index.html'), 'utf8');
const js = `(function(){
var out={};window.__ERR=window.__ERR||[];
window.confirm=function(){return false};window.alert=function(){};window.prompt=function(){return ''};
window.print=function(){};
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function fire(act,ds){
  var b=document.createElement('button');b.setAttribute('data-act',act);
  Object.keys(ds||{}).forEach(function(k){b.dataset[k]=ds[k]});
  b.style.display='none';document.body.appendChild(b);b.click();b.remove();
}
function over(sel){var e=q(sel);if(!e)return {missing:1};return {sw:e.scrollWidth,cw:e.clientWidth,over:e.scrollWidth>e.clientWidth+2}}
function show(){var d=document.getElementById('TESTOUT');
  if(!d){d=document.createElement('div');d.id='TESTOUT';d.style.display='none';document.body.appendChild(d);}
  d.textContent=JSON.stringify(out);}
setTimeout(function(){
 try{
  out.winW=window.innerWidth;
  out.top=over('.topbar');
  out.viewOv=over('#view');
  var bad=[];
  ['room','today','board','flow','people','project','brief'].forEach(function(v){
    fire('view',{v:v});
    var d=document.documentElement;
    if(d.scrollWidth>window.innerWidth+2)bad.push(v+'@'+d.scrollWidth);
  });
  out.badViews=bad;
  out.noPageOverflow=document.documentElement.scrollWidth<=window.innerWidth+2;
  out.topNoOverflow=!out.top.over;
  out.viewNoOverflow=!out.viewOv.over;
  /* 弹层宽度（导出报告 / 体检 / 逾期处置） */
  fire('r18');
  var m=q('#modalRoot .modal');
  out.modalW=m?Math.round(m.getBoundingClientRect().width):0;
  out.modalFits=!!m&&out.modalW<=window.innerWidth;
  out.errs=window.__ERR.slice(0,4);
 }catch(e){out.fatal=String(e&&e.stack||e).slice(0,260)}
 show();
},900);
})();`;
h = h.replace('</body>', '<script>' + js + '</script></body>');
fs.writeFileSync(path.join(dir, inner), h, 'utf8');

fs.writeFileSync(path.join(dir, frame),
`<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{width:${W}px;height:820px;border:0;display:block}</style></head>
<body><iframe id="fr" src="${inner}"></iframe>
<script>
var tries=0;
var t=setInterval(function(){
  tries++;
  try{
    var fr=document.getElementById('fr'),d=fr.contentDocument;
    var el=d&&d.getElementById('TESTOUT');
    if(el){
      clearInterval(t);
      var o=JSON.parse(el.textContent);
      o.frameW=fr.contentWindow.innerWidth;
      var x=document.createElement('div');x.id='TESTOUT';
      x.textContent=JSON.stringify(o);document.body.appendChild(x);
    }else if(tries>80){
      clearInterval(t);
      var x=document.createElement('div');x.id='TESTOUT';
      x.textContent=JSON.stringify({innerTimeout:tries});document.body.appendChild(x);
    }
  }catch(e){
    clearInterval(t);
    var x=document.createElement('div');x.id='TESTOUT';
    x.textContent=JSON.stringify({frameErr:String(e&&e.message||e)});document.body.appendChild(x);
  }
},200);
</` + `script></body></html>`, 'utf8');

const prof = path.join(os.tmpdir(), 'zqwb_test_prof');
let dom = '';
try {
  dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--user-data-dir=' + prof,
    '--window-size=' + Math.max(W + 120, 900) + ',900',
    '--virtual-time-budget=40000',
    '--dump-dom', 'file:///' + path.join(dir, frame).replace(/\\/g, '/')
  ], { maxBuffer: 1 << 28, encoding: 'utf8', timeout: 90000 });
} catch (e) {
  console.log('Chrome 失败：', String(e.message).slice(0, 160));
}
[inner, frame].forEach(f => { try { fs.unlinkSync(path.join(dir, f)) } catch (_) { } });

const m = dom.match(/<div id="TESTOUT"[^>]*>([\s\S]*?)<\/div>/);
if (!m) { console.log('没拿到 TESTOUT'); process.exit(1); }
const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
let o; try { o = JSON.parse(raw) } catch (e) { console.log('JSON 失败：', raw.slice(0, 300)); process.exit(1) }
console.log(JSON.stringify(o, null, 1));
const bad = [];
if (o.fatal) bad.push('fatal=' + String(o.fatal).slice(0, 160));
if (o.errs && o.errs.length) bad.push('errs=' + JSON.stringify(o.errs).slice(0, 160));
if (o.innerTimeout) bad.push('innerTimeout');
if (o.frameErr) bad.push('frameErr=' + o.frameErr);
if (o.noPageOverflow === false) bad.push('页面横向溢出');
if (o.topNoOverflow === false) bad.push('顶栏溢出');
if (o.viewNoOverflow === false) bad.push('视图溢出');
if (o.badViews && o.badViews.length) bad.push('badViews=' + o.badViews.join(','));
if (o.modalFits === false) bad.push('弹层超宽 ' + o.modalW);
console.log(bad.length ? '\n红灯：' + bad.join(' | ') : '\n移动端通过（' + (o.frameW || W) + 'px）');
process.exit(bad.length ? 1 : 0);
