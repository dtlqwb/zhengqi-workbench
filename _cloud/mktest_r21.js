/* R21 UI 体检修复的断言 */
const T = require('./tseed');

const S = T.baseS({ ui: { view: 'client', f: {} } });

T.mk('_t_r21.html', S, `
out.hasR21 = !!window.__R21__;

/* 1) 版本标签：此前停在 V7 */
out.verTag = (document.getElementById('verTag')||{}).textContent || '(无)';
out.verOk = /政企作战台 R20/.test(out.verTag);

/* 2) 切到协调流程：那里是市公司部门，不该出现客户跟进清单 */
fire('view', {v:'flow'});

function CHECK(out){
  /* 客户视图：清单该在，且是横排（全局 .list 是竖排，这里必须显式改回 row） */
  fire('view', {v:'client'});
}
function CHECK2(out){
  out.clientHasPanel = !!document.querySelector('#view .r13sum');
  var lst = document.querySelector('#view .r13sum .list');
  out.listDir = lst ? getComputedStyle(lst).flexDirection : '(无)';
  out.listRow = out.listDir === 'row';
  /* 协调流程：不该有 */
  fire('view', {v:'flow'});
}
function CHECK3(out){
  /* 注意：断言值要写成「期望为真」的形式，one.js 见 false 就报红 */
  out.flowPanelAbsent = !document.querySelector('#view .r13sum');
  /* 项目视角：填了金额 → 汇总条与进度条都该在 */
  fire('view', {v:'project'});
}
function CHECK4(out){
  var box = document.querySelector('#view .r12sum');
  out.sumExists = !!box;
  out.sumHasBar = !!(box && box.querySelector('.bar'));
  out.sumFoot = box ? (box.querySelector('.foot')||{}).textContent : '';
  out.localNoMask = !document.querySelector('.r21mask');
  out.verAfter = (document.getElementById('verTag')||{}).textContent || '(无)';
  out.errs = (window.__ERR||[]).slice(0,5);
}
`);
console.log('built _t_r21.html');
