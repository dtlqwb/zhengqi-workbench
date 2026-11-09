/* R9c：定位「存快照/清空快照」时 .slice 报错的来源 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_payload.json'), 'utf8'));
const S0 = raw.payload || raw;
S0.meta = Object.assign({}, S0.meta, { ver: 3 });
const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');

h = h.replace('</body>', `<script>(function(){
var out={probes:[]};window.__ERR=window.__ERR||[];function q(s){return document.querySelector(s)}
function P(name,fn){try{fn();out.probes.push(name+':ok')}catch(e){out.probes.push(name+' THREW '+String(e&&e.message||e))}}
S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
render();
P('openPanel',function(){dataModal()});
P('hasHealth',function(){out.health=JSON.stringify(S.meta.health||null)});
P('clickSnapNow',function(){q('#modalRoot [data-act=snapnow]').click()});
P('panelAgain',function(){dataModal()});
P('clearSnap',function(){window.confirm=function(){return true};q('#modalRoot [data-act=snapclear]').click()});
P('panelThird',function(){dataModal()});
out.healthAfter=JSON.stringify(S.meta.health||null);
out.errs=window.__ERR.slice();
var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_r9c.html'), h, 'utf8');
console.log('built');
