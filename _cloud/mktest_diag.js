const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..','share');
let h=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const probe=`<script>(function(){
var out={};
setTimeout(async function(){
  try{
    out.state=window.__CLOUD_API__.state&&window.__CLOUD_API__.state();
    out.embedPhone=(window.__EMBED__&&window.__EMBED__.people&&window.__EMBED__.people[0]||{}).phone;
    out.livePhone=(typeof S!=='undefined'&&S&&S.people&&S.people[0]||{}).phone;
    var pub=await window.__CLOUD_API__.pull('public');
    out.pubRow=!!pub;
    out.pubPhone=pub&&pub.payload&&pub.payload.people&&pub.payload.people[0]&&pub.payload.people[0].phone;
    out.pubErr=pub&&pub.error?String(pub.error.message||pub.error.code):'';
  }catch(e){out.fatal=String(e&&e.message||e)}
  var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
},6000)})()</script>`;
h=h.replace('</body>',probe+'\n</body>');
fs.writeFileSync(path.join(dir,'_t_diag.html'),h,'utf8');
console.log('ok');
