/* 作战室几何校验：5 类角色（含业务管理）+ 一类超 6 人，截图与断言 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(dir, '政企作战台.html'), 'utf8');

const people = [
  { id: 'p1', name: '聂婉清', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p2', name: '汪全胜', role: '业务管理', org: '示例县销售中心', rel: '直管', color: '#b5651d', phone: '', tags: '', note: '' },
  { id: 'p3', name: '苏文清', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p4', name: '阮雅琳', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p5', name: '汪全胜', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p6', name: '测试六', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p7', name: '测试七', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p8', name: '测试八', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p9', name: '测试九', role: '客户经理', org: '示例县销售中心', rel: '直管', color: '#2563d9', phone: '', tags: '', note: '' },
  { id: 'p10', name: '新华网格', role: '网格长', org: '新华网格', rel: '直管', color: '#12a06a', phone: '', tags: '', note: '' }
];
const orgs = [
  { id: 'o1', name: '市公司集客部', short: '集客部', duty: '集客方案、项目报批、投标与合同支撑', contact: '待填', color: '#c0507a' },
  { id: 'o2', name: '市公司网络部', short: '网络部', duty: '专线开通、网络资源', contact: '待填', color: '#3b7ddd' },
  { id: 'o3', name: '市公司市场部', short: '市场部', duty: '资费政策、训战背书', contact: '待填', color: '#0f9b96' },
  { id: 'o4', name: '市公司财务部', short: '财务部', duty: '预算、财评、付款开票', contact: '待填', color: '#d98324' },
  { id: 'o5', name: '市公司政企部', short: '政企部', duty: '政企统筹', contact: '待填', color: '#7a5cd6' }
];
const ext = [{ id: 'c1', name: '示例县应急管理局', type: '政府部门', contact: '周建平', title: '副主任', phone: '', color: '#0f6b8a', pay: '财政直付' }];
const tasks = [{
  id: 't1', title: '为消防队发送短信给指定目标用户', personId: 'p1', project: '', projectId: '', client: 'c1',
  prio: '紧急', due: '2026-11-09', status: '待接收', flow: '集客部', blockedSince: '2026-11-08',
  created: '2026-11-08', updated: '2026-11-08', deliverable: '发送回执报告', receipt: false, support: ['o1'], gates: [],
  stage: 'S3', feedback: '', note: ''
}];
const ROLES7 = ['客户经理','网格长','合伙公司负责人','个体技工','业务管理','装维','第三方监理'];
const ROLES_ = process.env.R7X ? ROLES7 : ['客户经理','网格长','合伙公司负责人','个体技工','业务管理'];
if(process.env.R7X){ROLES7.slice(5).forEach((r,i)=>people.push({id:'px'+i,name:'多角色'+(i+1),role:r,org:'示例县销售中心',rel:'直管',color:'#0f9b96',phone:'',tags:'',note:''}))}
const S0 = { ui: { view: 'room' }, meta: { ver: 3, theme: 'light' }, roles: ROLES_, orgs, people, ext, projects: [], tasks, wbSync: { at: '', count: 0, err: '', source: '', regress: 0 }, wbInbox: [], dataDate: '2026-11-08' };
const B64 = Buffer.from(JSON.stringify(S0), 'utf8').toString('base64');

h = h.replace('</body>', `<script>(function(){
var out={};window.__ERR=window.__ERR||[];
S=JSON.parse(decodeURIComponent(escape(atob('${B64}'))));
S.ui.view='room';render();
var svg=document.getElementById('roomSvg');
out.hasSvg=!!svg;
if(svg){
  var vb=String(svg.getAttribute('viewBox')).split(/\\s+/).map(Number);
  out.vbW=vb[2];out.vbH=vb[3];
  /* 找出所有角色小人的姓名文字，取其 y，确认都在画布内 */
  var names=[],maxY=0;
  [].slice.call(svg.querySelectorAll('text')).forEach(function(t){
    var v=t.textContent.trim();
    if(v&&/^[\\u4e00-\\u9fa5]{2,4}$/.test(v)&&t.getAttribute('text-anchor')==='middle'&&parseFloat(t.getAttribute('font-size'))===9.5){
      var y=parseFloat(t.getAttribute('y'));names.push(v+'@'+Math.round(y));if(y>maxY)maxY=y;
    }
  });
  out.actorNames=names;
  out.maxNameY=Math.round(maxY);
  out.insideCanvas=maxY<vb[3]-40;
  out.legendY=Math.round(parseFloat([].slice.call(svg.querySelectorAll('text')).filter(function(t){return /红点＝有逾期/.test(t.textContent)})[0].getAttribute('y')));
  out.legendInside=out.legendY<vb[3]-4;
  out.plusN=[].slice.call(svg.querySelectorAll('text')).filter(function(t){return /^\\+\\d+$/.test(t.textContent.trim())}).map(function(t){return t.textContent.trim()});
  /* wrap 实际高度：不应出现内容溢出被裁 */
  var wrap=document.getElementById('roomWrap');
  out.wrapH=Math.round(wrap.getBoundingClientRect().height);
  out.svgH=Math.round(svg.getBoundingClientRect().height);
  out.noClip=out.svgH<=out.wrapH+1;
  out.roleLabels=[].slice.call(svg.querySelectorAll('text')).filter(function(t){return /^\\d+ 人$/.test(t.textContent.trim())}).map(function(t){return t.textContent.trim()});
}
out.errs=window.__ERR.slice();
var d=document.createElement('div');d.id='TESTOUT';d.textContent=JSON.stringify(out);document.body.appendChild(d);
})();</script>
</body>`);
fs.writeFileSync(path.join(dir, '_t_room.html'), h, 'utf8');
console.log('built', h.length);
