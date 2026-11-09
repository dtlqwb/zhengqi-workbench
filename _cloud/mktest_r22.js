/* R22 深色模式适配（作战室 / 协调流程 两块 SVG）的断言
 * 注意：tseed 会把 body 塞进模板字符串，所以这里不能用 ${} 和反斜杠转义。 */
const T = require('./tseed');

const S = T.baseS({ ui: { view: 'room', f: {} } });
S.meta.theme = 'dark';

T.mk('_t_r22.html', S, `
out.hasR22 = !!window.__R22__;

/* 种子是 app 渲染之后才注入的，必须先触发一次重渲染才会用上新 S（深色 + 作战室） */
fire('view',{v:'room'});

/* 取计算后的颜色并判断明暗（不写正则，避开模板字符串的转义坑） */
function chan(v){
  if(!v) return null;
  var i=v.indexOf('('), j=v.indexOf(')');
  if(i<0||j<0) return null;
  var p=v.slice(i+1,j).split(',');
  return [parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])];
}
function dark(v){ var c=chan(v); return !!c && (c[0]+c[1]+c[2])<330; }
function light(v){ var c=chan(v); return !!c && (c[0]+c[1]+c[2])>520; }
function whiteish(v){ var c=chan(v); return !!c && c[0]>245 && c[1]>245 && c[2]>245; }
function cs(sel,prop){ var e=document.querySelector(sel); return e?getComputedStyle(e)[prop]:'(无)'; }

function CHECK(out){
  out.darkOn = document.body.classList.contains('dark');
  out.svgExists = !!document.getElementById('roomSvg');
  if(!out.svgExists) return;

  /* 作战室三块面板底 + 名牌/部门卡底：深色下都必须是深色 */
  out.pSeatDark   = dark(cs('#roomSvg rect[fill="#fff"][opacity=".55"]','fill'));
  out.pTeamDark   = dark(cs('#roomSvg rect[fill="#fff"][opacity=".34"]','fill'));
  out.pOrgDark    = dark(cs('#roomSvg rect[fill="#fff"][opacity=".42"]','fill'));
  out.cardDark    = dark(cs('#roomSvg rect[fill="#fff"]:not([opacity])','fill'));
  /* 描边不能还是浅色 */
  out.strokeDark  = dark(cs('#roomSvg [stroke="#dbe3ef"]','stroke'));
  /* 地面渐变的上半截不能还是白色 */
  out.floorDark   = dark(cs('#roomSvg stop[stop-color="#ffffff"]','stopColor'));
  /* 文字要变浅色 */
  out.txtPlateLight = light(cs('#roomSvg text[fill="#33445c"]','fill'));
  out.txtRoleLight  = light(cs('#roomSvg text[fill="#42536e"]','fill'));
  out.txtSeatLight  = light(cs('#roomSvg text[fill="#22314a"]','fill'));
  /* 战报卡是深蓝底白字 —— 白字不能被误改（这是最容易踩的坑） */
  out.bigTextKept   = whiteish(cs('#roomSvg text[fill="#ffffff"]','fill'));
  out.topCardKept   = whiteish(cs('#roomSvg text[fill="#fff"]','fill'));

  fire('view',{v:'flow'});
}
function CHECK2(out){}
function CHECK3(out){
  out.flowSvgExists = !!document.getElementById('flowSvg');
  if(!out.flowSvgExists) return;
  out.flowLeftDark  = dark(cs('#flowSvg rect[fill="#eaf1ff"]','fill'));
  out.flowRightDark = dark(cs('#flowSvg rect[fill="#fdeef5"]','fill'));
  out.flowLeftTxt   = light(cs('#flowSvg text[fill="#1b4fa8"]','fill'));
  out.flowRightTxt  = light(cs('#flowSvg text[fill="#a03c68"]','fill'));
  out.flowTopKept   = whiteish(cs('#flowSvg text[fill="#fff"]','fill'));
}
function CHECK4(out){
  /* 切回浅色，确认深色覆盖没有残留（CSS 是 body.dark 限定，撤主题即恢复） */
  S.meta.theme='light';
  fire('view',{v:'room'});
  out.lightBack      = !document.body.classList.contains('dark');
  out.seatBackToLight = whiteish(cs('#roomSvg rect[fill="#fff"][opacity=".55"]','fill'));
  /* 浅色主题下名牌文字本来就该是深蓝灰 #33445c（不是白色） */
  out.plateBackToLight = dark(cs('#roomSvg text[fill="#33445c"]','fill'));
  out.errs = (window.__ERR||[]).slice(0,5);
}
`);
console.log('built _t_r22.html');
