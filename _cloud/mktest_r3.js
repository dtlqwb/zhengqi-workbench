/* R3 断言：复盘四问门禁 / 结项 / 常设周期复盘 / 完成率剔除运维 / 简报两节 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');
const REAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8'));
REAL.tasks[0].project = '消防短信群发';
REAL.tasks[0].status = '已完成';
REAL.tasks[0].doneAt = '2026-11-08';
REAL.tasks[0].receipt = true;
REAL.projects = [
  {id:'bj1',name:'消防短信群发',clientId:'xmw7vmlucrw1s',created:'2026-11-08',kind:'once',stage:'S5',
   goal:'一周内完成群发并拿回执',why:'消防大队当面提的创城任务',decision:'接',milestones:[],planOk:true,review:{},reviews:[],closedAt:''},
  {id:'bj2',name:'校园监控巡检',clientId:'',created:'2026-11-08',kind:'standing',stage:'S3',
   goal:'51 校摄像头全年不脱管',why:'教育局年度运维委托',decision:'接',milestones:[],planOk:true,review:{},reviews:[],closedAt:''}
];
REAL.projects.push({id:'bj3',name:'政务外网电子围栏',clientId:'',created:'2026-11-01',kind:'once',stage:'S1',goal:'',why:'',decision:'',milestones:[],planOk:false,review:{},reviews:[],closedAt:''});
REAL.tasks.push({id:'t9',title:'校园监控季度巡检',personId:'xmw7vnbjc8hd2',project:'校园监控巡检',projectId:'bj2',
  client:'',prio:'常规',due:'2026-11-20',status:'进行中',note:'',feedback:'',support:[],flow:'',flowNote:'',
  gates:[],deliverable:'',receipt:false,created:'2026-11-08',updated:'2026-11-08'});
const B64 = Buffer.from(JSON.stringify(REAL), 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(e){return e?e.innerText.replace(/\\s+/g,' ').trim():''}
function toastTxt(){return txt(document.getElementById('toast'))}
function set(id,v){var e=document.getElementById(id);if(e)e.value=v}
function st2(p){setTimeout(p,140)}
setTimeout(function(){
  S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
  S.ui.view='project';render();
  out.s5=qa('#view .kcol[data-stage=S5] .bcard').length;
out.s1=qa('#view .kcol[data-stage=S1] .bcard').length;
  out.err0=window.__ERR.slice();
  /* 简报两节（复盘之前查） */
  S.ui.view='brief';render();
  var bt=txt(document.getElementById('briefBox'));
  out.briefKick=bt.indexOf('附三、该立项了')>=0;
  out.briefReview=bt.indexOf('附四、该复盘了')>=0;
  out.briefReviewLine=(bt.match(/附四、该复盘了（[^）]*）/ )||[''])[0];
  /* KPI 是否剔除运维 */
  S.ui.view='flow';render();
  out.kpi=txt(q('#view .kpis')).slice(-90);
  out.kpiExcl=out.kpi.indexOf('不含运维')>=0;
  /* 一次性业务：只填一问就结项 → 应被拒 */
  S.ui.view='project';render();
  var card5=q('#view .kcol[data-stage=S5] .bcard');
  if(card5)card5.click();
  st2(function(){
    var rb=q('#drawerRoot [data-act=bizreview]');
    out.hasReviewBtn=!!rb;
    if(rb)rb.click();
    st2(function(){
      out.reviewForm=['rv_did','rv_gap','rv_why','rv_next'].every(function(id){return !!document.getElementById(id)});
      set('rv_did','完成 3 轮群发，覆盖 1.2 万户，拿到回执');
      q('#modalRoot [data-act=rvclose]').click();
      st2(function(){
        out.msg1=toastTxt();
        out.notClosedEarly=!((S.projects||[]).find(function(p){return p.name==='消防短信群发'}).closedAt);
        out.stillOpen=!!q('#rv_gap');
        /* 补齐四问再结项 */
        set('rv_gap','名单口径反复了一次，多花两天');
        set('rv_why','启动段没确认名单从哪来，按自有用户圈选了');
        set('rv_next','群发类立项时先书面确认名单来源与通道');
        q('#modalRoot [data-act=rvclose]').click();
        st2(function(){
          var b=(S.projects||[]).find(function(p){return p.name==='消防短信群发'});
          out.closedAt=b.closedAt;
          out.stageAfter=b.stage;
          out.reviewDone=!!(b.review&&b.review.did&&b.review.next);
          /* 常设业务：本期复盘 */
          if(q('#drawerRoot .x'))q('#drawerRoot .x').click();
          S.ui.view='project';render();
          var sb=q('#view .kcol[data-stage=S3] .bcard');
          out.s3Card=!!sb;
          if(sb)sb.click();
          st2(function(){
            var rb2=q('#drawerRoot [data-act=bizreview]');
            out.standReviewBtn=!!rb2;
            if(rb2)rb2.click();
            st2(function(){
              out.standModalNoClose=!q('#modalRoot [data-act=rvclose]');
              set('rv_did','本月巡检 51 校，故障 7 处已全部处理');
              q('#modalRoot [data-act=rvsave]').click();
              st2(function(){
                var b2=(S.projects||[]).find(function(p){return p.name==='校园监控巡检'});
                out.standReviews=(b2.reviews||[]).length;
                out.standPeriod=(b2.reviews||[])[0]&&b2.reviews[0].period;
                out.standNotClosed=!b2.closedAt;
                /* 复盘后简报附四应少一条 */
                S.ui.view='brief';render();
                var bt2=txt(document.getElementById('briefBox'));
                out.briefAfter=(bt2.match(/附四、该复盘了（[^）]*）/ )||[''])[0];
                out.logs1=((S.projects||[]).find(function(p){return p.name==='消防短信群发'}).log||[]).map(function(l){return l.text});
                out.errAll=window.__ERR.slice();
                var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
              },150);
            },150);
          },150);
        },150);
      },150);
    },150);
  },160);
},280);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r3.html'), h, 'utf8');
console.log('built', h.length);
