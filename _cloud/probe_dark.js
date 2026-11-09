/* 对构建产物做「深色模式计算样式」体检：读 getComputedStyle 的实际颜色
 * 用法：node _cloud/probe_dark.js */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const target = fs.existsSync(path.join(dir, 'share', 'index.html'))
  ? path.join(dir, 'share', 'index.html') : path.join(dir, '政企作战台.html');

const JS = `
(function(){
  var out={};
  function chan(v){ if(!v) return null; var i=v.indexOf('('),j=v.indexOf(')'); if(i<0||j<0) return null;
    var p=v.slice(i+1,j).split(','); return [parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])]; }
  function dark(v){var c=chan(v);return !!c&&(c[0]+c[1]+c[2])<330;}
  function light(v){var c=chan(v);return !!c&&(c[0]+c[1]+c[2])>520;}
  function cs(sel,prop){var e=document.querySelector(sel);return e?getComputedStyle(e)[prop]:'(无)';}
  function force(){ try{ document.body.classList.add('dark'); }catch(e){} }
  /* render() 里会按 S.meta.theme 重置 body 的 dark 类，所以必须钩住它而不是直接加类 */
  try{
    var _r = window.render;
    window.render = function(){ var o=_r.apply(this,arguments); force(); return o; };
  }catch(e){}
  force();
  setTimeout(function(){
    /* 切到作战室，再切到协调流程，让两个 SVG 都渲染出来 */
    try{
      var b=document.createElement('button'); b.setAttribute('data-act','view'); b.dataset.v='room';
      b.style.display='none'; document.body.appendChild(b); b.click(); b.remove();
    }catch(e){}
    setTimeout(function(){
      out.darkOn = document.body.classList.contains('dark');
      out.roomFill  = cs('#roomSvg rect[fill="#fff"][opacity=".55"]','fill');
      out.roomDark  = dark(out.roomFill);
      out.plateFill = cs('#roomSvg text[fill="#33445c"]','fill');
      out.plateLight= light(out.plateFill);
      out.bigFill   = cs('#roomSvg text[fill="#ffffff"]','fill');
      out.bigKept   = (function(){var c=chan(out.bigFill);return !!c&&c[0]>245&&c[1]>245&&c[2]>245;})();
      out.cardFill  = cs('#roomSvg rect[fill="#fff"]:not([opacity])','fill');
      out.cardDark  = dark(out.cardFill);
      try{
        var b2=document.createElement('button'); b2.setAttribute('data-act','view'); b2.dataset.v='flow';
        b2.style.display='none'; document.body.appendChild(b2); b2.click(); b2.remove();
      }catch(e){}
      setTimeout(function(){
        out.flowId    = !!document.getElementById('flowSvg');
        out.flowLeft  = cs('#flowSvg rect[fill="#eaf1ff"]','fill');
        out.flowDark  = dark(out.flowLeft);
        out.flowRight = cs('#flowSvg rect[fill="#fdeef5"]','fill');
        out.flowRightDark = dark(out.flowRight);
        out.errs=(window.__ERR||[]).slice(0,5);
        var d=document.createElement('div');d.id='PROBE';d.textContent=JSON.stringify(out);document.body.appendChild(d);
      },600);
    },600);
  },600);
})();`;
let h = fs.readFileSync(target, 'utf8');
h = h.replace('</body>', '<script>' + JS + '</script></body>');
const f = path.join(dir, '_dark_probe.html');
fs.writeFileSync(f, h, 'utf8');
const prof = path.join(os.tmpdir(), 'zqwb_dark_prof');
let dom = '';
try {
  dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--user-data-dir=' + prof, '--window-size=1440,900', '--virtual-time-budget=20000', '--dump-dom',
    'file:///' + path.join(dir, '_dark_probe.html').replace(/\\/g, '/')],
    { maxBuffer: 1 << 28, encoding: 'utf8', timeout: 90000 });
} catch (e) { console.error('跑失败：', String(e.message).slice(0, 200)); }
try { fs.unlinkSync(f); } catch (_) { }
const m = /<div id="PROBE">([\s\S]*?)<\/div>/.exec(dom);
if (!m) { console.log('没拿到结果'); process.exit(1); }
console.log('对象：', path.relative(dir, target));
console.log(JSON.stringify(JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')), null, 1));
