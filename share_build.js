const fs=require('fs'),path=require('path');
const dir=process.cwd();
let html=fs.readFileSync(path.join(dir,'政企作战台.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(dir,'政企作战台_数据.json'),'utf8'));

data.people=(data.people||[]).map(p=>Object.assign({},p,{phone:''}));
if(!Array.isArray(data.wbInbox))data.wbInbox=[];
if(!data.wbSync)data.wbSync={at:'',count:0};
if(!data.ui)data.ui={view:'room',f:{}};
if(!data.meta)data.meta={};
const d=new Date();
const pad=n=>String(n).padStart(2,'0');
const at=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());
const payload=JSON.stringify(data).replace(/</g,'\\u003c');

const inject=`/* ---- 只读快照注入（分享版） ---- */
;
window.__EMBED__=${payload};
window.__EMBED_AT__=${JSON.stringify(at)};
(function(){
  if(!window.__EMBED__)return;
  if(location.hash.indexOf('share')<0){try{history.replaceState(null,'','#share')}catch(e){}}
  load=function(){
    S=JSON.parse(JSON.stringify(window.__EMBED__));
    if(!S.ui)S.ui={view:'room',f:{}};
    if(!S.ui.f)S.ui.f={};
    if(!S.meta)S.meta={};
    if(!Array.isArray(S.wbInbox))S.wbInbox=[];
    if(!S.wbSync)S.wbSync={at:'',count:0};
    (S.tasks||[]).forEach(function(t){if(!t.support)t.support=[];if(!t.flow)t.flow='';});
    var m=String(location.hash||'').match(/v=([a-z]+)/);
    S.ui.view=m?m[1]:'room';
  };
  save=function(){};
  initAuto=function(){render()};
  document.body.classList.add('ro');
  var css=document.createElement('style');
  css.textContent='body.ro [data-act="newtask"],body.ro [data-act="savetask"],body.ro [data-act="savetask2"],body.ro [data-act="deltask"],body.ro [data-act="newperson"],body.ro [data-act="editperson"],body.ro [data-act="saveperson2"],body.ro [data-act="delperson"],body.ro [data-act="neworg"],body.ro [data-act="editorg"],body.ro [data-act="delorg"],body.ro [data-act="newext"],body.ro [data-act="editext"],body.ro [data-act="delext"],body.ro [data-act="saveext"],body.ro [data-act="addgate"],body.ro [data-act="delgate"],body.ro [data-act="applygate"],body.ro [data-act="receipt"],body.ro [data-act="data"],body.ro [data-act="importjson"],body.ro [data-act="restoredemo"],body.ro [data-act="cleardemo"],body.ro [data-act="wbadopt"],body.ro [data-act="wbadoptall"],body.ro [data-act="wbimport"],body.ro [data-act="wbbind"],body.ro [data-act="wbpaste"],body.ro [data-act="rollback"]{display:none!important}body.ro .tcard{user-select:none}';
  document.head.appendChild(css);
  var bar=document.createElement('div');
  bar.style.cssText='background:#b45309;color:#fff;font:12px/1.7 system-ui,-apple-system,sans-serif;text-align:center;padding:7px 12px;letter-spacing:.02em';
  bar.textContent='只读快照 · 数据截至 '+window.__EMBED_AT__+' · 不能修改；完整操作请在本机打开政企作战台';
  document.body.insertBefore(bar,document.body.firstChild);
})();
/* ---- 注入结束 ---- */
`;

if(html.indexOf('load();initAuto();')<0)throw new Error('未找到注入点');
html=html.replace('load();initAuto();',inject+'load();initAuto();');
html=html.replace('<title>政企作战台</title>','<title>政企作战台 · 团队看板（只读快照）</title>');
html=html.replace(/1[3-9]\d{9}/g,'***');
html=html.split('2026-11-08-17-00-04').join('本机目录');
const out=path.join(dir,'share');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'index.html'),html,'utf8');
console.log('share/index.html',html.length,'bytes | data',data.people.length,'people',data.orgs.length,'orgs',data.tasks.length,'tasks | phones cleared');
