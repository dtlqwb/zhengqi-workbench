/* V13 闭环：未归项目 → 补项目名 → 保存 → 项目卡长出来、未归项目卡消失 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');
const REAL = fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8');
const B64 = Buffer.from(REAL, 'utf8').toString('base64');

h = h.replace('</head>', '<script>window.__ERR=[];window.addEventListener("error",function(e){window.__ERR.push(String(e.message||e))});</' + 'script>\n</head>');
h = h.replace('</body>', `<script>(function(){
var out={};function q(s){return document.querySelector(s)}
function txt(e){return e?e.innerText.replace(/\\s+/g,' '):''}
setTimeout(function(){
  S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
  S.ui.view='project';render();
  out.before_noProjCard=txt(q('#view')).indexOf('未归项目')>=0;
  out.before_projCards=q('#view').querySelectorAll('.proj').length;
  q('[data-act=projnone]').click();
  out.modalHasTask=txt(q('#modalRoot .mb')).indexOf('消防队发送短信')>=0;
  q('#modalRoot .mb [data-act=task]').click();
  setTimeout(function(){
    out.formOpen=!!q('#f_project');
    out.formProjectVal=q('#f_project')?q('#f_project').value:'(none)';
    out.formClientSel=q('#f_client')?q('#f_client').value:'(none)';
    if(q('#f_project'))q('#f_project').value='消防短信群发';
    var sv=q('[data-act=savetask2]');
    out.saveBtn=!!sv;
    if(sv)sv.click();
    setTimeout(function(){
      S.ui.view='project';render();
      var pv=txt(q('#view'));
      out.after_projCards=q('#view').querySelectorAll('.proj').length;
      out.after_noProjCardGone=pv.indexOf('未归项目')<0;
      out.after_newCard=pv.indexOf('消防短信群发')>=0;
      out.after_projClientLine=pv.indexOf('委托方：示例县应急管理局')>=0;
      out.savedProject=(S.tasks[0]||{}).project||'';
      out.savedProjectId=(S.tasks[0]||{}).projectId||'';
      out.projectsLen=(S.projects||[]).length;
      S.ui.view='client';render();
      out.clientCardNoHint=txt(q('#view .org-grid')).indexOf('未归项目')<0;
      out.errAll=window.__ERR.slice();
      var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
    },160);
  },160);
},220);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_loop.html'), h, 'utf8');
console.log('built', h.length);
