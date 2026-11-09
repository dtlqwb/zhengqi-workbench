/* 生成「收录补录表单 + 画板默认值记忆」的无头测试副本 */
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
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function click(el){if(!el)return false;el.click();return true}
function seed(){
  S.orgs=JSON.parse(JSON.stringify(S.orgs||[]));
  if(!S.orgs.length)S.orgs=[{id:'o1',name:'市公司网络部',short:'网络部'},{id:'o2',name:'市公司政企部',short:'政企部'}];
  var pid=S.people[0]?S.people[0].id:'';
  S.wbInbox=[
    {nodeId:'n1',boardId:'b1',boardTitle:'示例县政企作战板',title:'智慧水务对账清单复核',stage:'planned',stageLabel:'拟定待接',assignee:'',author:'苏文清',due:'',note:'',updatedAt:'',state:'new',demo:false},
    {nodeId:'n2',boardId:'b1',boardTitle:'示例县政企作战板',title:'明厨亮灶点位踏勘',stage:'accepted',stageLabel:'已受理',assignee:'苏文清',author:'苏文清',due:'',note:'',updatedAt:'',state:'new',demo:false}
  ];
  S.wbBoardDefaults={};
  out.task0=S.tasks.length;out.person0=S.people.length;
  S.ui.view='wbinbox';render();
}
setTimeout(function(){
 out.err0=window.__ERR.slice();
 seed();
 out.btnFound=q('[data-act=wbadopt]')?true:false;
 click(q('[data-act=wbadopt]'));
 setTimeout(function(){
  out.hasProject=!!document.getElementById('wa_project');
  out.hasPrio=!!document.getElementById('wa_prio');
  out.hasPerson=!!document.getElementById('wa_person');
  out.hasDue=!!document.getElementById('wa_due');
  out.supCount=qa('.wa_support').length;
  out.hasRemember=!!document.getElementById('wa_remember');
  out.title=(document.querySelector('.modal h3')||document.querySelector('.modal .mh')||{}).innerText||'';
  /* 填表：项目=智慧水务项目，优先级=紧急，勾网络部，指定主责人=第一人 */
  if(document.getElementById('wa_project'))document.getElementById('wa_project').value='智慧水务项目';
  if(document.getElementById('wa_prio'))document.getElementById('wa_prio').value='紧急';
  if(document.getElementById('wa_person'))document.getElementById('wa_person').value=(S.people[0]||{}).id||'';
  var sup=qa('.wa_support');if(sup[0])sup[0].checked=true;
  click(q('[data-act=wbadoptok]'));
  setTimeout(function(){
   out.modalGone=!document.getElementById('wa_project');
   out.task1=S.tasks.length;
   var t=S.tasks[S.tasks.length-1]||{};
   out.newTask={title:t.title,project:t.project,prio:t.prio,support:(t.support||[]).length,personId:t.personId,src:t.src,status:t.status};
   out.inboxState=(S.wbInbox[0]||{}).state;
   out.defaults=JSON.parse(JSON.stringify(S.wbBoardDefaults||{}));
   /* 再收录第二条：应自动带出默认项目与优先级 */
   var btn=qa('[data-act=wbadopt]')[0];
   click(btn);
   setTimeout(function(){
    out.prefillProject=(document.getElementById('wa_project')||{}).value;
    out.prefillPrio=(document.getElementById('wa_prio')||{}).value;
    out.prefillSup=qa('.wa_support').filter(function(x){return x.checked}).length;
    click(q('[data-act=wbadoptok]'));
    setTimeout(function(){
     out.task2=S.tasks.length;
     out.inboxState2=(S.wbInbox[1]||{}).state;
     out.err1=window.__ERR.slice();
     var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
    },400);
   },400);
  },400);
 },400);
},1500)})()</script>`;
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(dir, '_t_adopt.html'), h, 'utf8');
console.log('_t_adopt.html', h.length);
