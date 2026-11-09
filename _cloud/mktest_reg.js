/* 发布前全量回归：13 个视图逐个渲染 + 任务表单 + 客户派活预选 + 删客户清归属 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const catcher = '<script>window.__ERR=[];'
  + 'window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});'
  + 'window.addEventListener("unhandledrejection",function(e){window.__ERR.push("rej:"+String(e.reason&&e.reason.message||e.reason))});'
  + '</' + 'script>';
h = h.replace('</head>', catcher + '\n</head>');

const probe = `<script>(function(){
var out={},views={},lens={};
function q(s){return document.querySelector(s)}
function click(el){if(!el)return false;el.click();return true}
function seedData(){
  var p0=(S.people[0]||{}).id;
  S.people=S.people.length?S.people:[{id:'p1',name:'张三',role:'客户经理',org:'政企部',color:'#2563d9'}];
  p0=S.people[0].id;
  S.orgs=S.orgs.length?S.orgs:[{id:'o1',name:'市公司网络部',short:'网络部',duty:'网络',contact:'待填',color:'#3b7ddd'}];
  S.ext=[
    {id:'c1',name:'示例县市政公用局',type:'事业单位',contact:'张局',title:'副局长',phone:'',pay:'专项债',duty:'智慧水务',color:'#0f6b8a'},
    {id:'c2',name:'示例县应急管理局',type:'政府部门',contact:'赵队长',title:'大队长',phone:'',pay:'财政直付',duty:'消防短信',color:'#8a3b4a'}
  ];
  S.tasks=[
    {id:'t1',title:'智慧水务对价清单复核',personId:p0,project:'智慧水务平台',client:'c1',prio:'紧急',due:'2026-11-20',status:'进行中',note:'',feedback:'已核一轮',support:['o1'],flow:'网络部',flowNote:'等资源',blockedSince:'2026-11-06',gates:[],deliverable:'清单',receipt:false,created:'2026-11-08',updated:'2026-11-08',log:[]},
    {id:'t2',title:'专项债付款节点对接',personId:p0,project:'智慧水务平台',client:'c1',prio:'重要',due:'2026-11-22',status:'待接收',note:'',feedback:'',support:[],flow:'',flowNote:'',gates:[],deliverable:'',receipt:false,created:'2026-11-08',updated:'2026-11-08',log:[]},
    {id:'t3',title:'消防短信文案定稿',personId:p0,project:'消防短信群发',client:'c2',prio:'常规',due:'2026-11-25',status:'已完成',doneAt:'2026-11-08',note:'',feedback:'',gates:[],support:[],flow:'',flowNote:'',deliverable:'文案',receipt:false,created:'2026-11-08',updated:'2026-11-08',log:[]}
  ];
  S.projects=[];S.wbInbox=[];S.meta.theme='light';
}
setTimeout(function(){
  out.err0=window.__ERR.slice();
  seedData();
  /* 1) 13 个视图逐个渲染 */
  var keys=VIEWS.map(function(v){return v[0]});
  out.viewKeys=keys.length;
  keys.forEach(function(k){
    var before=window.__ERR.length;
    try{S.ui.view=k;render();}catch(e){views[k]='THROW:'+String(e&&e.message||e)}
    var v=document.getElementById('view');
    lens[k]=v?v.innerText.length:0;
    if(window.__ERR.length>before)views[k]='ERR:'+window.__ERR[window.__ERR.length-1];
  });
  out.viewErr=views;
  out.viewLens=lens;
  out.allViewsOk=Object.keys(views).length===0;
  /* 2) 任务表单可打开（V12 包过 taskForm） */
  S.ui.view='board';render();
  click(q('[data-act=newtask]'));
  setTimeout(function(){
    out.formTitleIn=!!document.getElementById('f_title');
    out.formProjectIn=!!document.getElementById('f_project');
    out.formClientIn=!!document.getElementById('f_client');
    click(q('[data-act=close]'));
    /* 3) 客户抽屉 → 给这家派活，应预选客户 c1 */
    S.ui.view='client';render();
    click(q('[data-act=clientview]'));
    setTimeout(function(){
      var d=document.getElementById('drawerRoot');
      out.drawerHasClientBtn=!!(d&&d.querySelector('[data-act=newtask][data-client]'));
      var btn=d?d.querySelector('[data-act=newtask][data-client]'):null;
      click(btn);
      setTimeout(function(){
        var sel=document.getElementById('f_client');
        out.pickClient=sel?sel.value:'(no field)';
        out.formOpened=!!document.getElementById('f_title');
        click(q('[data-act=close]'));
        /* 4) 项目视角卡片上「设委托方」可打开 */
        S.ui.view='project';render();
        click(q('[data-act=projclient]'));
        out.projClientForm=!!document.getElementById('pc_sel');
        click(q('[data-act=close]'));
        out.err1=window.__ERR.slice();
        var o=document.createElement('div');o.id='TESTOUT';o.textContent=JSON.stringify(out);document.body.appendChild(o);
      },350);
    },350);
  },350);
},1800)})()</script>`;
h = h.replace('</body>', probe + '\n</body>');
fs.writeFileSync(path.join(dir, '_t_reg.html'), h, 'utf8');
console.log('_t_reg.html', h.length);
