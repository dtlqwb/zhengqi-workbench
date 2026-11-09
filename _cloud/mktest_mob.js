/* 移动端真视口回归：headless 窗口有最小宽度，外层 iframe 顶住 375/320 */
const fs = require('fs'), path = require('path');
const T = require('./tseed');
const dir = path.join(__dirname, '..');
const W = Number(process.env.W || 375);

const S = T.baseS({ ui: { view: 'today', f: {} }, people: [], ext: [], projects: [], tasks: [] });

T.mk('_t_mob_in.html', S, `
window.__R20__.loadDemo();
document.getElementById('modalRoot').innerHTML='';
out.winW=window.innerWidth;
function over(sel){var e=document.querySelector(sel);if(!e)return {missing:1};
  return {sw:e.scrollWidth,cw:e.clientWidth,over:e.scrollWidth>e.clientWidth+2}}
out.top=over('.topbar');
out.view=over('#view');
/* 九个视图逐个扫横向溢出（看板/五段本来就要横向滑动，算设计内的不算溢出） */
var bad=[];
['room','today','board','flow','people','project','client','urge','brief'].forEach(function(v){
  S.ui.view=v;render();
  var d=document.documentElement;
  if(d.scrollWidth>window.innerWidth+2)bad.push(v+'@'+d.scrollWidth);
});
out.badViews=bad;
out.noPageOverflow=document.documentElement.scrollWidth<=window.innerWidth+2;
out.topNoOverflow=!out.top.over;
out.viewNoOverflow=!out.view.over;
out.allViewsOk=bad.length===0;
/* 点开一个弹层，看弹层是否超宽 */
fire('r18');
var m=document.querySelector('#modalRoot .modal');
out.modalW=m?Math.round(m.getBoundingClientRect().width):0;
out.modalFits=!!m&&out.modalW<=window.innerWidth;
out.modalNoOver=m?m.scrollWidth<=m.clientWidth+2:true;
`);

const frame = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{width:${W}px;height:820px;border:0;display:block}</style></head>
<body><iframe id="fr" src="_t_mob_in.html"></iframe>
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
    }else if(tries>60){
      clearInterval(t);
      var x=document.createElement('div');x.id='TESTOUT';
      x.textContent=JSON.stringify({innerTimeout:tries});
      document.body.appendChild(x);
    }
  }catch(e){
    clearInterval(t);
    var x=document.createElement('div');x.id='TESTOUT';
    x.textContent=JSON.stringify({frameErr:String(e&&e.message||e)});document.body.appendChild(x);
  }
},200);
</` + `script></body></html>`;
fs.writeFileSync(path.join(dir, '_t_mob.html'), frame, 'utf8');
console.log('built mobile frame', W);
