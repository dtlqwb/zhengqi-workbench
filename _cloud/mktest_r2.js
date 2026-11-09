/* R2 断言：五段看板 + 门禁拦截 + 里程碑 + 推进/退回留痕 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');
const REAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8'));
REAL.tasks[0].project = '消防短信群发';
const B64 = Buffer.from(JSON.stringify(REAL), 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}function qa(s){return [].slice.call(document.querySelectorAll(s))}
function txt(e){return e?e.innerText.replace(/\\s+/g,' ').trim():''}
function toastTxt(){return txt(document.getElementById('toast'))}
function set(id,v){var e=document.getElementById(id);if(e)e.value=v}
function step2(fn,ms){setTimeout(fn,ms||130)}
setTimeout(function(){
  S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
  S.ui.view='project';render();
  out.cols=qa('#view .kcol').length;
  out.stageNames=qa('#view .kcol .kh .n').map(function(e){return e.innerText.replace(/\\s+/g,'')});
  out.s1Count=qa('#view .kcol[data-stage=S1] .bcard').length;
  out.s4Count=qa('#view .kcol[data-stage=S4] .bcard').length;
  out.bizStage=(S.projects[0]||{}).stage;
  out.err0=window.__ERR.slice();
  /* 1) 门禁：缺立项三件套时点「进计划」应被拦 */
  var adv=q('#view .kcol[data-stage=S1] [data-act=bizadv]');
  out.noAdvWhenPending=!adv;
  if(adv)adv.click();
  step2(function(){
    out.blockMsg1=toastTxt();
    out.stageAfterBlock=(S.projects[0]||{}).stage;
    /* 2) 打开档案补立项 */
    q('#view .kcol[data-stage=S1] [data-act=bizedit]').click();
    set('b_goal','一周内完成消防队短信群发并拿到回执');
    set('b_why','消防大队周建平副主任当面提的，创城宣传任务');
    set('b_dec','接');
    var cl=q('#b_client');if(cl&&cl.options.length>1)cl.selectedIndex=1;
    q('#modalRoot [data-act=bizsave]').click();
    step2(function(){
      out.afterSaveStage=(S.projects[0]||{}).stage;
      out.hasAdv2=!!q('#view .kcol[data-stage=S1] [data-act=bizadv]');
      if(out.hasAdv2)q('#view .kcol[data-stage=S1] [data-act=bizadv]').click();
      step2(function(){
        out.stageS2=(S.projects[0]||{}).stage;
        out.s2Count=qa('#view .kcol[data-stage=S2] .bcard').length;
        /* 3) S2 门禁：没有里程碑应被拦 */
        var a3=q('#view .kcol[data-stage=S2] [data-act=bizadv]');
        out.s2NoAdvWithoutMilestone=!a3;
        if(a3)a3.click();
        step2(function(){
          out.blockMsg2=toastTxt();
          out.stillS2=(S.projects[0]||{}).stage;
          /* 4) 打开业务档案 → 维护里程碑 */
          q('#view .kcol[data-stage=S2] [data-act=bizopen]').click();
          step2(function(){
            out.dossierOpen=!!q('#drawerRoot .drawer');
            out.dossierFlow=txt(q('#drawerRoot .drawer')).indexOf('五段进度')>=0;
            var mb=q('#drawerRoot [data-act=msadd]');
            out.msBtn=!!mb;
            if(mb)mb.click();
            step2(function(){
              set('ms_name','群发名单与文案定稿');set('ms_due','2026-11-09');
              q('#modalRoot [data-act=msadd2]').click();
              step2(function(){
                out.msLen=((S.projects[0]||{}).milestones||[]).length;
                if(q('#modalRoot [data-act=close]'))q('#modalRoot [data-act=close]').click();
                if(q('#drawerRoot .x'))q('#drawerRoot .x').click();
                step2(function(){
                  /* 交付物：任务本身带 deliverable，应已满足 */
                  var a4=q('#view .kcol[data-stage=S2] [data-act=bizadv]');
                  out.s2NoAdvWithoutPlanOk=!a4;
                  if(a4)a4.click();
                  step2(function(){
                    out.blockMsg3=toastTxt();
                    out.stillS2b=(S.projects[0]||{}).stage;
                    /* 5) 勾计划评审 → 应可进执行 */
                    var cb=q('#view .kcol[data-stage=S2] [data-act=bizplan]');
                    out.planBox=!!cb;
                    if(cb){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));}
                    step2(function(){
                      out.planOk=(S.projects[0]||{}).planOk;
                      var a5=q('#view .kcol[data-stage=S2] [data-act=bizadv]');
                      out.s2HasAdv3=!!a5;
                      if(a5)a5.click();
                      step2(function(){
                        out.stageS3=(S.projects[0]||{}).stage;
                        out.s3Count=qa('#view .kcol[data-stage=S3] .bcard').length;
                        /* 6) 退回 */
                        var bk=q('#view .kcol[data-stage=S3] [data-act=bizback]');
                        out.hasBack=!!bk;
                        if(bk)bk.click();
                        step2(function(){
                          out.stageBack=(S.projects[0]||{}).stage;
                          out.logs=((S.projects[0]||{}).log||[]).map(function(l){return l.text});
                          out.errAll=window.__ERR.slice();
                          var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
                        },140);
                      },140);
                    },140);
                  },140);
                },120);
              },150);
            },150);
          },150);
        },140);
      },150);
    },150);
  },150);
},260);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r2.html'), h, 'utf8');
console.log('built', h.length);
