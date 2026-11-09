/* V12 客户视角 + 项目绑定客户 的无头测试 */
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
function txt(){var v=document.getElementById('view');return v?v.innerText:''}
setTimeout(function(){
  out.err0=window.__ERR.slice();
  out.ready=!!window.__V12_READY__;
  var p0=(S.people[0]||{}).id;
  S.ext=[
    {id:'c1',name:'示例县市政公用局',type:'事业单位',contact:'张局',title:'分管副局长',phone:'',pay:'专项债',duty:'智慧水务、管网改造',color:'#0f6b8a'},
    {id:'c2',name:'示例县应急管理局',type:'政府部门',contact:'赵队长',title:'大队长',phone:'',pay:'财政直付',duty:'消防宣传短信',color:'#8a3b4a'}
  ];
  S.tasks=[
    {id:'t1',title:'智慧水务 IFPUG 对价清单复核',personId:p0,project:'智慧水务平台',client:'c1',prio:'紧急',due:'2026-11-20',status:'进行中',note:'',feedback:'',support:[],flow:'',flowNote:'',gates:[],deliverable:'清单',receipt:false,created:'2026-11-08',updated:'2026-11-08',log:[]},
    {id:'t2',title:'专项债付款节点对接',personId:p0,project:'智慧水务平台',client:'c1',prio:'重要',due:'2026-11-22',status:'待接收',note:'',feedback:'',support:[],flow:'',flowNote:'',gates:[],deliverable:'',receipt:false,created:'2026-11-08',updated:'2026-11-08',log:[]},
    {id:'t3',title:'消防宣传短信文案定稿',personId:p0,project:'消防短信群发',client:'c2',prio:'常规',due:'2026-11-25',status:'已完成',doneAt:'2026-11-08',note:'',feedback:'',support:[],flow:'',flowNote:'',gates:[],deliverable:'文案',receipt:false,created:'2026-11-08',updated:'2026-11-08',log:[]}
  ];
  S.projects=[];S.ui.view='client';render();
  out.err1=window.__ERR.slice();
  out.hasTab=qa('.tab').some(function(t){return t.innerText.indexOf('客户')>=0});
  out.tabCount=qa('.tab').length;
  var v=txt();
  out.card1=v.indexOf('市政公用局')>=0;
  out.card2=v.indexOf('应急管理局')>=0;
  out.hasProjInCard=v.indexOf('智慧水务平台')>=0;
  out.projectCreated=(S.projects||[]).length;
  out.projClientId=(S.projects[0]||{}).clientId;
  out.taskProjectId=(S.tasks[0]||{}).projectId?'yes':'no';
  /* 打开客户抽屉 */
  click(q('[data-act=clientview]'));
  setTimeout(function(){
    var d=document.getElementById('drawerRoot');
    var dt=d?d.innerText:'';
    out.drawerOpen=!!(d&&d.querySelector('.drawer'));
    out.drawerHasProj=dt.indexOf('智慧水务平台')>=0;
    out.drawerHasTask=dt.indexOf('IFPUG')>=0;
    out.drawerHasContact=dt.indexOf('张局')>=0;
    click(q('[data-act=closedrawer]'));
    /* 项目视角 */
    S.ui.view='project';render();
    var pv=txt();
    out.projHasClient=pv.indexOf('委托方：示例县市政公用局')>=0;
    out.projInternal=(pv.indexOf('内部项目')>=0);
    /* 简报 */
    var b=typeof briefText==='function'?briefText():'';
    out.briefClient=b.indexOf('附二、按客户看')>=0 && b.indexOf('市政公用局')>=0;
    out.err2=window.__ERR.slice();
    var o=document.createElement('div');o.id='TESTOUT';o.textContent=JSON.stringify(out);document.body.appendChild(o);
  },400);
},1800)})()</script>`;
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(dir, '_t_client.html'), h, 'utf8');
console.log('_t_client.html', h.length);
