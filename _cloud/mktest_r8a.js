/* R8 体检：深色模式下仍是浅底的元素 / chip 规格差异 / 每屏主按钮数量 / 空状态文案 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8'));
const S0 = raw.payload || raw;
S0.meta = Object.assign({}, S0.meta, { ver: 3, theme: 'dark' });
const CID = (S0.ext[0] || {}).id || '';
const PID = (S0.people[0] || {}).id || '';
S0.projects = [
  { id: 'p1', name: '示例县智慧水务平台建设', clientId: CID, kind: 'once', stage: 'S3', goal: '上线', why: '资金到位', decision: '接', deliverTarget: 1, planOk: true, closedAt: '', milestones: [{ id: 'm1', name: '硬件到货', due: '2026-11-20', done: false }], review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] },
  { id: 'p2', name: '沿街商铺明厨亮灶', clientId: CID, kind: 'once', stage: 'S1', goal: '', why: '', decision: '', deliverTarget: 0, planOk: false, closedAt: '', milestones: [], review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] },
  { id: 'p3', name: '校园监控常态运维', clientId: CID, kind: 'standing', stage: 'S3', goal: '在线率 98%', why: '合同内', decision: '接', deliverTarget: 1, planOk: true, closedAt: '', milestones: [{ id: 'm3', name: '季度巡检', due: '2026-12-01', done: false }], review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] }
];
S0.tasks = (S0.tasks || []).map((t, i) => Object.assign({}, t, { projectId: i % 2 ? 'p1' : 'p3', stage: 'S3' }));
S0.ui = Object.assign({}, S0.ui, { view: 'board' });
const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function lum(c){
  var m=c.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;
  var p=m[1].split(',').map(function(x){return parseFloat(x)});
  if(p.length>3&&p[3]===0)return null;
  function f(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}
  return 0.2126*f(p[0])+0.7152*f(p[1])+0.0722*f(p[2]);
}
function cls(e){return (e.tagName.toLowerCase()+'.'+String(e.className||'').replace(/\\s+/g,'.')).slice(0,54)}
var lightInDark=[],chipSpec={},emptyTxt=[],views=[];
var step=0;
function next(){
  var keys=VIEWS.map(function(v){return v[0]});
  if(step>=keys.length){finish();return}
  var k=keys[step];
  try{S.ui.view=k;render()}catch(e){out['e_'+k]=String(e&&e.message||e)}
  setTimeout(function(){
    /* 深色下仍是浅底（亮度>0.7 且面积够大） */
    qa('#view *, .topbar *, .tabs *').forEach(function(e){
      var r=e.getBoundingClientRect();if(r.width*r.height<900)return;
      var L=lum(getComputedStyle(e).backgroundColor);
      if(L!==null&&L>0.7)lightInDark.push(k+' | '+cls(e)+' | L='+L.toFixed(2));
    });
    /* chip 规格 */
    qa('#view .chip, #view .pill, #view .due, #view .ck').forEach(function(e){
      var cs=getComputedStyle(e);
      var key=cs.fontSize+'/'+cs.paddingTop+'/'+cs.borderTopLeftRadius;
      chipSpec[key]=(chipSpec[key]||0)+1;
    });
    /* 空状态文案 */
    qa('#view .empty').forEach(function(e){emptyTxt.push(k+' | '+e.innerText.replace(/\\s+/g,' ').slice(0,30))});
    /* 每屏主按钮 */
    var prim=qa('#view .btn.pri, #view .btn.primary').length;
    var all=qa('#view .btn').length;
    views.push({v:k,pri:prim,btn:all});
    step++;next();
  },130);
}
function finish(){
  out.lightInDark=lightInDark.slice(0,40);
  out.lightN=lightInDark.length;
  out.chipSpec=chipSpec;
  out.chipKinds=Object.keys(chipSpec).length;
  out.empty=emptyTxt;
  out.vagueEmpty=emptyTxt.filter(function(t){return /暂无|没有匹配结果/.test(t)});
  out.views=views;
  out.noPri=views.filter(function(x){return x.btn>0&&x.pri===0}).map(function(x){return x.v});
  out.tooManyPri=views.filter(function(x){return x.pri>2}).map(function(x){return x.v+':'+x.pri});
  out.errs=window.__ERR.slice();
  var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
}
setTimeout(function(){
  try{S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))))}catch(e){out.threw=String(e&&e.message||e)}
  try{document.body.classList.add('dark')}catch(e){}
  try{render()}catch(e){out.rt=String(e&&e.message||e)}
  next();
},340);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r8.html'), h, 'utf8');
console.log('built', h.length);
