/* 生成「方向约束：只前进不倒退」的无头测试副本 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const catcher = '<script>window.__ERR=[];'
  + 'window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});'
  + 'window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});'
  + '</' + 'script>';
h = h.replace('</head>', catcher + '\n</head>');

const probe = `<script>(function(){
var out={};
window.addEventListener('error',function(e){var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify({fatal:String(e.message||e),stack:String(e.error&&e.error.stack||'')});document.body.appendChild(d)});
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function click(el){if(!el)return false;el.click();return true}
function paste(json){
  click(q('[data-act=wbpaste]'));
  var t=document.getElementById('wbPaste');
  if(!t){out.pasteFail=(out.pasteFail||0)+1;return false}
  t.value=JSON.stringify(json);
  click(q('[data-act=wbpasteok]'));
  return true;
}
function snap(stage){
  return {syncedAt:new Date().toISOString(),source:'test',tasks:[
    {nodeId:'n1',boardId:'b1',boardTitle:'示例县政企作战板',title:'方向测试便签',stage:stage,stageLabel:stage,assignee:'',author:'苏文清'}
  ]};
}
function task(){return S.tasks.filter(function(t){return t.wbNode==='n1'})[0]}
function inbox(){return S.wbInbox.filter(function(x){return x.nodeId==='n1'})[0]}

setTimeout(function(){
  out.err0=window.__ERR.slice();
  if(!S.orgs||!S.orgs.length)S.orgs=[{id:'o1',name:'市公司网络部',short:'网络部'}];
  S.wbInbox=[{nodeId:'n1',boardId:'b1',boardTitle:'示例县政企作战板',title:'方向测试便签',stage:'planned',stageLabel:'拟定待接',assignee:'',author:'苏文清',due:'',note:'',updatedAt:'',state:'new',demo:false}];
  S.wbBoardDefaults={};S.ui.view='wbinbox';render();
  click(q('[data-act=wbadopt]'));
  setTimeout(function(){
    // 空表单直接确认：项目留空、优先级默认常规
    click(q('[data-act=wbadoptok]'));
    setTimeout(function(){
      out.s1={status:(task()||{}).status,lastStage:(inbox()||{}).lastStage,state:(inbox()||{}).state};

      // ① 白板前进 planned -> accepted：应跟随到「进行中」
      paste(snap('accepted'));
      setTimeout(function(){
        out.s2={status:(task()||{}).status,lastStage:(inbox()||{}).lastStage,regress:S.wbSync.regress};

        // ② 白板没变（还是 accepted）：应一点不动
        paste(snap('accepted'));
        setTimeout(function(){
          out.s3={status:(task()||{}).status,regress:S.wbSync.regress};

          // ③ 工作台手工推到「已完成」，白板却退回收受：应保持已完成、只标黄
          task().status='已完成';
          paste(snap('accepted'));
          setTimeout(function(){
            out.s4={status:(task()||{}).status,wbBack:!!(inbox()||{}).wbBack,regress:S.wbSync.regress};

            // ④ 白板终于办结 done：状态已是已完成，不再重复写；标黄应清除
            paste(snap('done'));
            setTimeout(function(){
              out.s5={status:(task()||{}).status,wbBack:!!(inbox()||{}).wbBack,doneAt:(task()||{}).doneAt,lastStage:(inbox()||{}).lastStage};

              // ⑤ 白板 done 之后再收到一个更早的阶段：仍不回退
              paste(snap('planned'));
              setTimeout(function(){
                out.s6={status:(task()||{}).status,wbBack:!!(inbox()||{}).wbBack};
                out.viewHasFlow=(document.getElementById('view')||{}).innerText.indexOf('白板在前')>=0;
                out.err1=window.__ERR.slice();
                var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
              },300);
            },300);
          },300);
        },300);
      },300);
    },400);
  },400);
},1500)})()</script>`;
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(dir, '_t_dir.html'), h, 'utf8');
console.log('_t_dir.html', h.length);
