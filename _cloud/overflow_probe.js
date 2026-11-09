/* 375 真视口下逐个元素定位横向溢出（iframe 顶住，绕开 Chrome 最小窗口宽度限制）
 * 用法：node _cloud/overflow_probe.js
 * 输出：文档级滚动宽 + 超出右边界的元素清单 */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const W = Number(process.argv[2]) || 375;
const H = Number(process.argv[3]) || 780;

const productPath = path.join(dir, 'share', 'index.html');
const TARGET = fs.existsSync(productPath) ? productPath : path.join(dir, '政企作战台.html');

const PROBE = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0}#box{width:${W}px;height:${H}px;overflow:hidden;border:0}
iframe{width:${W}px;height:${H}px;border:0;display:block}</style>
<div id="box"><iframe id="f" src="APPURL"></iframe></div>
<script>
window.addEventListener('load',function(){
  setTimeout(function(){
    var out={err:[],doc:{},els:[]};
    try{
      var d=document.getElementById('f').contentDocument, w=document.getElementById('f').contentWindow;
      var de=d.documentElement;
      out.doc={clientWidth:de.clientWidth,scrollWidth:de.scrollWidth,
               bodyScroll:d.body?d.body.scrollWidth:0,innerWidth:w.innerWidth};
      var vw=de.clientWidth;
      var all=d.querySelectorAll('body *');
      for(var i=0;i<all.length;i++){
        var e=all[i], r=e.getBoundingClientRect();
        if(r.width===0&&r.height===0) continue;
        var over=r.right-vw;
        /* 只报「自己超出视口右边」的元素，并标注它所在的滚动容器 */
        if(over>2){
          var cs=w.getComputedStyle(e);
          var par=e.parentElement, scroller=null;
          while(par&&par!==d.body){
            var ps=w.getComputedStyle(par);
            if(ps.overflowX==='auto'||ps.overflowX==='scroll'||ps.overflow==='auto'||ps.overflow==='scroll'){scroller=par;break;}
            par=par.parentElement;
          }
          out.els.push({tag:e.tagName.toLowerCase(),
            cls:(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||'').toString().slice(0,48),
            id:e.id||'', over:Math.round(over),
            txt:(e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,26),
            inScroller:!!scroller,
            scrollerCls:scroller?((scroller.className&&scroller.className.baseVal!==undefined?scroller.className.baseVal:scroller.className||'').toString().slice(0,40)+'#'+scroller.id):'',
            ovx:cs.overflowX});
        }
      }
      out.els.sort(function(a,b){return b.over-a.over;});
      out.els=out.els.slice(0,40);
    }catch(e){out.err=[String(e&&e.message||e)];}
    document.title='PROBE:'+JSON.stringify(out);
  },3000);
});
</script>`;

let probe = PROBE.replace('APPURL', path.join(TARGET).replace(/\\/g, '/'));
probe = probe.replace('<iframe id="f" src="APPURL">', '<iframe id="f" src="' + path.join(TARGET).replace(/\\/g, '/') + '">');
const f = path.join(dir, '_ovf_probe.html');
fs.writeFileSync(f, probe, 'utf8');

const prof = path.join(os.tmpdir(), 'zqwb_ovf_prof');
let dom = '';
try {
  dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--user-data-dir=' + prof, '--window-size=' + (W + 60) + ',' + (H + 60),
    '--virtual-time-budget=15000', '--dump-dom', 'file:///' + path.join(dir, '_ovf_probe.html').replace(/\\/g, '/')],
    { maxBuffer: 1 << 28, encoding: 'utf8', timeout: 90000 });
} catch (e) { console.error('跑失败：', String(e.message).slice(0, 200)); }
try { fs.unlinkSync(f); } catch (_) { }

const m = /PROBE:(\{[\s\S]*?\})<\/title>/.exec(dom);
if (!m) { console.log('没拿到探针结果，dom 前 800 字：\n', dom.slice(0, 800)); process.exit(1); }
const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
if (r.err && r.err.length) console.log('探针异常：', r.err);
console.log('视口宽 =', W);
console.log('documentElement.clientWidth =', r.doc.clientWidth, ' scrollWidth =', r.doc.scrollWidth,
  ' body.scrollWidth =', r.doc.bodyScroll, ' iframe.innerWidth =', r.doc.innerWidth);
console.log('文档级横向溢出：', (r.doc.scrollWidth > r.doc.clientWidth + 1) ? '有 (' + (r.doc.scrollWidth - r.doc.clientWidth) + 'px)' : '无');
console.log('--- 超出右边界的元素（top 40）---');
if (!r.els.length) console.log('  没有元素超出右边界');
r.els.forEach(e => {
  console.log('  +' + String(e.over).padStart(4) + 'px  ' + e.tag + (e.id ? '#' + e.id : '') +
    (e.cls ? '.' + e.cls.split(/\s+/).join('.') : '') +
    '  overflowX=' + e.ovx + (e.inScroller ? '  ⊂可横滑容器:' + e.scrollerCls : '  ⚠无横滑容器') +
    '  「' + e.txt + '」');
});
