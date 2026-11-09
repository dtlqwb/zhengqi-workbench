/* 构建产物冒烟：把断言注进 share/index.html 的副本，跑完自清。node _cloud/smoke_share.js [width] */
const path = require('path'), fs = require('fs'), os = require('os');
const { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const width = Number(process.argv[2]) || 1440;
const tmpName = '_t_share_' + width + '.html';
const tmp = path.join(dir, tmpName);

let h = fs.readFileSync(path.join(dir, 'share', 'index.html'), 'utf8');

const js = `(function(){
var out={};window.__ERR=window.__ERR||[];
window.confirm=function(){return false};window.alert=function(){};window.prompt=function(){return ''};
window.print=function(){};
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function tx(s){var e=q(s);return e?e.textContent.replace(/\\s+/g,' ').trim():''}
function fire(act,ds){
  var b=document.createElement('button');b.setAttribute('data-act',act);
  Object.keys(ds||{}).forEach(function(k){b.dataset[k]=ds[k]});
  b.style.display='none';document.body.appendChild(b);b.click();b.remove();
}
function goView(v){fire('view',{v:v})}
function measureRoom(){
  var svg=document.getElementById('roomSvg');
  if(!svg)return {found:false};
  var vb=svg.getAttribute('viewBox')||'',box=svg.getBoundingClientRect();
  var p=vb.split(/\\s+/),w=+p[2],hgt=+p[3];
  var actors=qa('#roomSvg g.actor');
  var clipped=[],maxY=0;
  actors.forEach(function(a){
    var r=a.getBoundingClientRect();
    if(!r.width||!r.height)return;
    var sy=hgt/box.height;
    var bottom=(r.bottom-box.top)*sy,right=(r.right-box.left)*(w/box.width);
    if(bottom>hgt+2||right>w+2)clipped.push(Math.round(bottom)+'/'+Math.round(right));
    if(bottom>maxY)maxY=bottom;
  });
  return {found:true,vbW:w,vbH:hgt,actorN:actors.length,clipped:clipped,
    clippedSample:clipped.slice(0,4),maxActorBottom:Math.round(maxY),heightEnough:maxY<=hgt+2};
}
function show(){
  var d=document.getElementById('TESTOUT');
  if(!d){d=document.createElement('div');d.id='TESTOUT';d.style.display='none';document.body.appendChild(d);}
  d.textContent=JSON.stringify(out);
}
try{
  out.title=document.title;
  out.hasCloudCfg=!!window.__CLOUD__;
  out.hasEmbed=!!window.__EMBED__;
  out.embedPeople=(window.__EMBED__&&window.__EMBED__.people||[]).length;
  out.embedPhoneMasked=(function(){
    var ps=(window.__EMBED__&&window.__EMBED__.people)||[];
    var bad=0;ps.forEach(function(p){if(p.phone&&/^1[3-9]\\d{9}$/.test(p.phone))bad++});
    return bad===0;
  })();
  out.glueLoaded=!!document.querySelector('[class*=cloud],[id*=cloud],#wbBar,.wbbar');
  out.topbar=tx('.topbar').slice(0,90);
  /* 作战室画布：人是否都被框住（默认视图不是作战室，先切过去） */
  out.defaultView=(window.S&&S.ui&&S.ui.view)||'?';
  goView('room');
  var rm=measureRoom();
  out.svgFound=rm.found;
  out.room=rm;
  if(rm.found){
    out.viewBox=rm.vbW+'x'+rm.vbH;
    out.heightEnough=rm.heightEnough;
    out.clipped=rm.clipped.length;
    var svgEl=document.getElementById('roomSvg');
    out.hasPlusOverflow=/\\+\\d+/.test(svgEl.textContent||'');
    out.roomText=svgEl.textContent.replace(/\\s+/g,' ').slice(0,120);
  }
  /* 业务五段 */
  goView('project');
  out.fiveSegTitle=tx('.sec-t');
  var segHeads=qa('.bkan .kh .n').map(function(x){return x.textContent.trim()});
  out.segHeads=segHeads;
  out.segCols=qa('.kcol').length;
  var rc=q('.r12sum');
  out.segSum=rc?rc.textContent.replace(/\\s+/g,' ').trim().slice(0,100):'(无)';
  out.fiveEmpty=/还没有业务|先把第一件要干的事立起来/.test(tx('#view'));
  /* 今日态势 */
  goView('today');
  out.todayTxt=tx('#view').slice(0,100);
  /* 派单看板 */
  goView('board');
  out.boardTxt=tx('#view').slice(0,100);
  out.cardN=qa('.tcard').length;
  var hb=q('.hbadge');
  out.healthBadge=hb?hb.textContent.trim():'(无)';
  out.hasR17=!!window.__R17__;
  out.hasR18=!!window.__R18__;
  out.hasR19=!!window.__R19__;
  out.hasR20=!!window.__R20__;
  out.emptyState=(window.__R20__&&typeof window.__R20__.isEmpty==='function')?window.__R20__.isEmpty():null;
  if(window.__R17__&&typeof window.__R17__.scan==='function'){
    var sc=window.__R17__.scan();
    out.healthRed=sc.filter(function(x){return x.lv==='red'}).length;
    out.healthAmber=sc.filter(function(x){return x.lv==='amber'}).length;
    out.healthTitles=sc.map(function(x){return x.lv+':'+x.txt+'('+x.items.length+')'});
  }
  out.errs=window.__ERR.slice(0,6);
}catch(e){out.fatal=String(e&&e.stack||e).slice(0,300)}
setTimeout(function(){
  try{
    /* 换回作战室复核：异步渲染后高度是否仍够 */
    goView('room');
    var r2=measureRoom();
    out.roomLate=r2;
    out.topbarLate=tx('.topbar').slice(0,90);
  }catch(e){out.lateErr=String(e)}
  show();
},600);
})();`;

h = h.replace('</body>', '<script>' + js + '</script></body>');
fs.writeFileSync(tmp, h, 'utf8');

const prof = path.join(os.tmpdir(), 'zqwb_test_prof');
let dom = '';
try {
  dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--user-data-dir=' + prof,
    '--window-size=' + width + ',900',
    '--virtual-time-budget=30000',
    '--dump-dom', 'file:///' + tmp.replace(/\\/g, '/')
  ], { maxBuffer: 1 << 28, encoding: 'utf8', timeout: 90000 });
} catch (e) {
  console.log('Chrome 失败：', String(e.message).slice(0, 200));
  try { fs.unlinkSync(tmp) } catch (_) { }
  process.exit(1);
}
try { fs.unlinkSync(tmp) } catch (_) { }

const m = dom.match(/<div id="TESTOUT"[^>]*>([\s\S]*?)<\/div>/);
if (!m) { console.log('没拿到 TESTOUT（页面可能在注入前就挂了）'); process.exit(1); }
const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
let o;
try { o = JSON.parse(raw); } catch (e) { console.log('JSON 解析失败：', raw.slice(0, 400)); process.exit(1); }

console.log(JSON.stringify(o, null, 1));
const bad = [];
if (o.fatal) bad.push('fatal=' + String(o.fatal).slice(0, 160));
if (o.errs && o.errs.length) bad.push('errs=' + JSON.stringify(o.errs).slice(0, 200));
if (o.svgFound === false) bad.push('svgFound=false');
if (o.heightEnough === false) bad.push('heightEnough=false（人超出画布）');
if (o.clipped) bad.push('clipped=' + o.clipped);
if (o.roomLate && o.roomLate.heightEnough === false) bad.push('roomLate 裁人 maxBottom=' + o.roomLate.maxActorBottom + ' vbH=' + o.roomLate.vbH);
if (o.hasCloudCfg === false) bad.push('hasCloudCfg=false');
if (o.hasEmbed === false) bad.push('hasEmbed=false');
if (o.embedPhoneMasked === false) bad.push('embedPhoneMasked=false（明文手机号）');
['hasR17', 'hasR18', 'hasR19', 'hasR20'].forEach(k => { if (o[k] === false) bad.push(k + '=false'); });
if (o.segCols !== undefined && o.segCols !== 5) bad.push('segCols=' + o.segCols + '（应为 5）');
console.log(bad.length ? '\n红灯：' + bad.join(' | ') : '\n冒烟通过');
process.exit(bad.length ? 1 : 0);
