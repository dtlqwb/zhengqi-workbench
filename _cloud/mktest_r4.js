/* R4 断言：任务段标可选可存 / 卡片显示段标 / 业务档案段分布 / 图表段位分布 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');
const REAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8'));
REAL.tasks[0].project = '消防短信群发';
REAL.projects = [{id:'bj1',name:'消防短信群发',clientId:'xmw7vmlucrw1s',created:'2026-11-08',kind:'once',stage:'S3',goal:'g',why:'w',decision:'接',milestones:[],planOk:true,review:{},reviews:[],closedAt:''}];
const B64 = Buffer.from(JSON.stringify(REAL), 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(e){return e?e.innerText.replace(/\\s+/g,' ').trim():''}
function st2(f){setTimeout(f,150)}
setTimeout(function(){
  S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
  /* 1) 看板卡片带段标 */
  S.ui.view='board';render();
  out.cardChip=txt(q('#view .tcard .tm'));
  out.cardHasChip=(q('#view .tcard .tm')||{innerText:''}).innerText.indexOf('段')>=0;
  /* 2) 任务表单有段位下拉 */
  q('#view [data-act=newtask]').click();
  st2(function(){
    out.stageSel=!!document.getElementById('f_stage');
    out.stageOpts=document.getElementById('f_stage')?[].slice.call(document.getElementById('f_stage').options).map(function(o){return o.value+':'+o.text}):[];
    out.defaultS3=document.getElementById('f_stage').value;
    var s=document.getElementById('f_stage');s.value='S2';s.dispatchEvent(new Event('change',{bubbles:true}));
    q('#modalRoot [data-act=close]').click();
    /* 3) 编辑已有任务，改成计划段并保存 */
    setTimeout(function(){
      var card=q('#view .tcard');card.click();
      st2(function(){
        var s2=document.getElementById('f_stage');
        out.editDefault=s2?s2.value:'(none)';
        if(s2){s2.value='S2';s2.dispatchEvent(new Event('change',{bubbles:true}))}
        q('#modalRoot [data-act=savetask2]').click();
        st2(function(){
          out.savedStage=(S.tasks.find(function(t){return t.id==='xmw7vq313xn59'})||{}).stage;
          S.ui.view='board';render();
          out.chipAfter=txt(q('#view .tcard .tm'));
          /* 4) 业务档案段分布 */
          S.ui.view='project';render();
          var c=q('#view .kcol[data-stage=S3] .bcard');
          out.s3card=!!c;
          if(c)c.click();
          st2(function(){
            var db=q('#drawerRoot .db');
            out.distBlock=!!(db&&db.querySelector('[data-tdist]'));
            out.distTxt=db&&db.querySelector('[data-tdist]')?txt(db.querySelector('[data-tdist]')):'';
            if(q('#drawerRoot .x'))q('#drawerRoot .x').click();
            /* 5) 图表段位分布 */
            S.ui.view='chart';render();
            out.chartTxt=txt(document.getElementById('view'));
            out.chartHasBlock=out.chartTxt.indexOf('业务段位分布')>=0;
            out.errAll=window.__ERR.slice();
            var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
          },160);
        },170);
      },170);
    },120);
  },160);
},280);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r4.html'), h, 'utf8');
console.log('built', h.length);
