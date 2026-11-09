/* R6 断言：375px 窄屏 —— 13 个视图不横溢 / 看板横滑+段位条 / 表格转卡片 / 触屏降级 / 点击区放大 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8'));
const S0 = raw.payload || raw;
S0.meta = Object.assign({}, S0.meta, { ver: 3 });
S0.projects = [
  { id: 'p1', name: '示例县智慧水务平台建设', clientId: (S0.ext[0] || {}).id || '', kind: 'once', stage: 'S3',
    goal: '老城区管网漏损治理上线', why: '专项债资金已到位', decision: '接',
    deliverTarget: 1, planOk: true, closedAt: '',
    milestones: [{ id: 'm1', name: '硬件到货', due: '2026-11-20', done: false }],
    review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] },
  { id: 'p2', name: '沿街商铺明厨亮灶', clientId: (S0.ext[0] || {}).id || '', kind: 'once', stage: 'S1',
    goal: '', why: '', decision: '', deliverTarget: 0, planOk: false, closedAt: '',
    milestones: [], review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] },
  { id: 'p3', name: '校园监控常态运维', clientId: (S0.ext[0] || {}).id || '', kind: 'stand', stage: 'S3',
    goal: '51 校 6400 路在线率不低于 98%', why: '合同内服务', decision: '接',
    deliverTarget: 1, planOk: true, closedAt: '',
    milestones: [{ id: 'm2', name: '季度巡检', due: '2026-12-01', done: false }],
    review: { at: '', did: '', gap: '', why: '', next: '' }, reviews: [] }
];
S0.tasks = (S0.tasks || []).map((t, i) => Object.assign({}, t, { projectId: i % 2 ? 'p1' : 'p3', stage: 'S3' }));
S0.tasks.push({ id: 'tk2', title: '整理漏损分区计量台账', personId: (S0.people[0] || {}).id, project: '示例县智慧水务平台建设',
  projectId: 'p1', client: (S0.ext[0] || {}).id, prio: '紧急', due: '2026-11-05', status: '进行中', stage: 'S3',
  created: '2026-11-01', updated: '2026-11-08', deliverable: '台账', receipt: false, support: [], flow: '', gates: [] });
S0.tasks.push({ id: 'tk3', title: '明厨亮灶训战打板方案', personId: (S0.people[0] || {}).id, project: '沿街商铺明厨亮灶',
  projectId: 'p2', client: (S0.ext[0] || {}).id, prio: '常规', due: '2026-11-25', status: '待接收', stage: 'S1',
  created: '2026-11-06', updated: '2026-11-08', deliverable: '', receipt: false, support: [], flow: '', gates: [] });
S0.ui = Object.assign({}, S0.ui, { view: 'project' });

const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
var W=window.innerWidth;out.winW=W;
function offenders(){
  var bad=[];
  qa('body *').forEach(function(e){
    var r=e.getBoundingClientRect();if(r.width<=0)return;
    if(r.right<=W+1)return;
    /* 祖先里带横向滚动容器的，跳过（这是合法的局部滚动） */
    var p=e.parentElement,ok=false;
    while(p&&p!==document.body){var cs=getComputedStyle(p);
      if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&p.scrollWidth>p.clientWidth){ok=true;break}
      p=p.parentElement}
    if(ok)return;
    bad.push((e.tagName.toLowerCase())+'.'+String(e.className||'').replace(/\\s+/g,'.').slice(0,42)+'@'+Math.round(r.right));
  });
  return bad.slice(0,4);
}
var step=0;
function nextView(){
  var keys=VIEWS.map(function(v){return v[0]});
  if(step>=keys.length){finish();return}
  var k=keys[step];
  try{S.ui.view=k;render()}catch(e){out['err_'+k]=String(e&&e.message||e)}
  setTimeout(function(){
    var sw=document.documentElement.scrollWidth;
    var o={view:k,sw:sw,over:sw>W+1,off:offenders()};
    if(k==='project'||k==='board'){
      var box=q('#view .bkan')||q('#view .kanban');
      o.box=!!box;
      if(box){var cs=getComputedStyle(box);
        o.snap=cs.scrollSnapType;o.ovx=cs.overflowX;
        o.cols=box.children.length;
        o.colW=box.children[0]?Math.round(box.children[0].getBoundingClientRect().width):0;
      }
      var seg=q('#view .mseg');o.seg=!!seg;
      o.segN=seg?seg.children.length:0;
      o.segTxt=seg?seg.innerText.replace(/\\s+/g,'|'):'';
    }
    if(k==='board'){
      var tc=q('#view .tcard');
      o.drag=tc?tc.getAttribute('draggable'):'none';
      o.hint=tc?!!tc.querySelector('.mhint'):false;
      var b=q('#view .btn.sm')||q('#view .btn');
      o.btnH=b?Math.round(b.getBoundingClientRect().height):0;
      var fld=q('#view input,#view select');
      o.fldH=fld?Math.round(fld.getBoundingClientRect().height):0;
    }
    if(k==='people'){
      var tb=q('#view table');o.tbcard=tb?tb.classList.contains('tbcard'):false;
      o.tbDisplay=tb?getComputedStyle(tb).display:'';
      o.theadDisp=tb&&q('#view thead')?getComputedStyle(q('#view thead')).display:'';
      o.dlN=tb?qa('#view td[data-l]').length:0;
      o.tdDisp=tb&&q('#view tbody td')?getComputedStyle(q('#view tbody td')).display:'';
      o.firstL=tb&&q('#view tbody td')?q('#view tbody td').getAttribute('data-l'):'';
    }
    out['v_'+k]=o;step++;nextView();
  },140);
}
function finish(){
  out.views=Object.keys(out).filter(function(k){return k.indexOf('v_')===0}).length;
  out.overflowViews=Object.keys(out).filter(function(k){return k.indexOf('v_')===0&&out[k].over});
  out.errs=window.__ERR.slice();
  /* 点卡片 → 状态行闪一下 */
  S.ui.view='board';render();
  setTimeout(function(){
    var tc=q('#view .tcard');
    if(tc){tc.click();
      setTimeout(function(){
        o2=!!document.getElementById('f_status');
        out.modalStatus=o2;
        var w=o2?document.getElementById('f_status').closest('div'):null;
        out.flash=w?w.classList.contains('r6fl'):false;
        if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
        setTimeout(function(){
          out.finalSW=document.documentElement.scrollWidth;
          out.finalOff=offenders();
          var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
        },260);
      },300);
    }else{
      var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
    }
  },200);
}
setTimeout(function(){
  try{S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))))}catch(e){out.threw=String(e&&e.message||e)}
  try{render()}catch(e){out.renderThrew=String(e&&e.message||e)}
  setTimeout(nextView,200);
},320);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r6.html'), h, 'utf8');

/* 外层：真 375px 视口（headless 窗口有最小宽度限制，用 iframe 顶住） */
const frame = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}iframe{width:${process.env.R6W||375}px;height:780px;border:0;display:block}</style></head>
<body><iframe id="fr" src="_t_r6.html"></iframe>
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
      o.frameSW=fr.contentDocument.documentElement.scrollWidth;
      var x=document.createElement('div');x.id='TESTOUT';x.textContent=JSON.stringify(o);document.body.appendChild(x);
    }else if(tries>90){
      clearInterval(t);
      var x=document.createElement('div');x.id='TESTOUT';
      x.textContent=JSON.stringify({timeout:1,tries:tries,err:(fr.contentWindow.__ERR||[]).slice(0,3)});
      document.body.appendChild(x);
    }
  }catch(e){
    clearInterval(t);
    var x=document.createElement('div');x.id='TESTOUT';
    x.textContent=JSON.stringify({frameErr:String(e&&e.message||e)});document.body.appendChild(x);
  }
},200);
</` + `script></body></html>`;
fs.writeFileSync(path.join(dir, '_t_r6_frame.html'), frame, 'utf8');
console.log('built', h.length, '+frame', frame.length);
