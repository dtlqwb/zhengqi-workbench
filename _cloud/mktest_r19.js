/* R19 校验：焦点环与跳转链接、tabindex/role、回车激活、弹层焦点锁定与 Esc、减弱动效 */
const T = require('./tseed');
const S = T.baseS({ ui: { view: 'project', f: {} } });

const body = `
S.ui.view='project';render();
var sk=q('a.skiplink');
out.skipExists=!!sk;
out.skipHref=sk?sk.getAttribute('href'):'';
out.viewTabindex=document.getElementById('view').getAttribute('tabindex');
out.focusCss=qa('style').some(function(s){var t=s.textContent||'';
  return t.indexOf(':focus-visible')>=0&&t.indexOf('outline:2px solid var(--brand)')>=0});
out.reduceMotion=qa('style').some(function(s){return (s.textContent||'').indexOf('prefers-reduced-motion')>=0});
var card=q('#view .bcard');
out.cardFound=!!card;
out.cardTab=card?card.getAttribute('tabindex'):'';
out.cardRole=card?card.getAttribute('role'):'';
out.cardTabOk=out.cardTab==='0'&&out.cardRole==='button';
var cmd=q('.top-actions [data-act=cmd]');
out.cmdLabel=cmd?cmd.getAttribute('aria-label'):'';
out.cmdOk=out.cmdLabel==='全局搜索';
var r17=q('.top-actions [data-act=r17]');
out.r17Label=r17?r17.getAttribute('aria-label'):'';
S.ui.view='room';render();
var svg=document.getElementById('roomSvg');
out.svgRole=svg?svg.getAttribute('role'):'';
out.svgLabel=svg?String(svg.getAttribute('aria-label')||'').slice(0,12):'';
out.svgOk=out.svgRole==='img'&&out.svgLabel.length>4;
out.toastLive=document.getElementById('toast').getAttribute('aria-live');
/* 回车激活：焦点在一张业务卡上按 Enter = 打开档案 */
S.ui.view='project';render();
var c2=q('#view .bcard');
c2.focus();
out.focusSet=document.activeElement===c2;
c2.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));

function CHECK(out){
  out.enterOpenedDrawer=!!q('#drawerRoot .drawer');
  /* 收起抽屉，开一个带输入框的弹层 */
  fire('closedrawer');
  /* 用真实按钮触发（fire 造的那个临时按钮点完就删，会把焦点带走，属于测试假象） */
  var real=q('.top-actions [data-act=r18]');
  c2.focus();
  window.__preFocus=document.activeElement;
  real.click();
  out.modalOpen=!!q('#modalRoot .modal');
}

function CHECK2(out){
  var m=q('#modalRoot .modal');
  out.focusInModal=!!m&&m.contains(document.activeElement);
  if(m){
    var pool=[].slice.call(m.querySelectorAll('button,input,select,textarea,[tabindex="0"]')).filter(function(x){return !x.disabled});
    out.poolN=pool.length;
    pool[pool.length-1].focus();
    out.lastFocused=document.activeElement===pool[pool.length-1];
    m.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
    out.wrapToFirst=document.activeElement===pool[0];
    pool[0].focus();
    m.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));
    out.wrapToLast=document.activeElement===pool[pool.length-1];
  }
}

function CHECK3(out){
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  out.modalClosedByEsc=!q('#modalRoot .modal');
}

function CHECK4(out){
  var ae=document.activeElement;
  out.focusRestored=!!ae&&ae===window.__preFocus;
  out.focusRestoredTag=ae?ae.tagName+':'+(ae.className||''):'';
}
`;

console.log('built', T.mk('_t_r19.html', S, body));
