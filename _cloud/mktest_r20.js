/* R20 校验：空数据引导卡、三步入口、装入演示数据（含委托方与项目绑定） */
const T = require('./tseed');

const EMPTY = {
  ui: { view: 'today', f: {} }, meta: { ver: 3, theme: 'light', briefNote: '' },
  roles: ['客户经理', '网格长', '合伙公司负责人', '个体技工', '业务管理'],
  orgs: [], people: [], ext: [], projects: [], tasks: [],
  wbSync: { at: '', count: 0, err: '', source: '', regress: 0 }, wbInbox: [], dataDate: '2026-11-08'
};

const body = `
out.isEmptyApi=window.__R20__.isEmpty();
S.ui.view='today';render();
var c=q('#view .r20');
out.cardExists=!!c;
out.title=c?c.querySelector('h3').textContent.trim():'';
out.steps=c?qa('#view .r20 .steps .s').length:0;
out.stepActs=qa('#view .r20 .steps [data-act]').map(function(e){return e.dataset.act});
out.actsOk=out.stepActs.join(',')==='newext,biznew,newtask';
out.demoBtn=!!q('#view .r20 [data-act=r20demo]');
/* 其它视图也应有引导，不该只有今日态势有 */
S.ui.view='project';render();
out.cardOnProject=!!q('#view .r20');
S.ui.view='client';render();
out.cardOnClient=!!q('#view .r20');
S.ui.view='brief';render();
out.cardOnBrief=!!q('#view .r20');
/* 装入演示数据 */
S.ui.view='today';render();
fire('r20demo');
out.afterExt=(S.ext||[]).length;
out.afterProj=(S.projects||[]).length;
out.afterPeople=(S.people||[]).length;
out.afterTasks=(S.tasks||[]).length;
out.demoOk=out.afterExt===8&&out.afterProj>0&&out.afterPeople>5&&out.afterTasks>10;
out.allCli=(S.projects||[]).every(function(p){return !!p.clientId});
out.allTaskProj=(S.tasks||[]).every(function(t){return !!t.projectId});
out.clientNames=(S.ext||[]).map(function(c){return c.name}).join('、');
out.projClients=(S.projects||[]).map(function(p){
  var c=(S.ext||[]).find(function(x){return x.id===p.clientId});
  return p.name+'→'+(c?c.name:'未绑')});
out.themeKept=S.meta.theme;
out.notEmptyAfter=!window.__R20__.isEmpty();

function CHECK(out){
  out.cardGoneAfterDemo=!q('#view .r20');
  /* 客户视图应真的有客户卡，不是空白 */
  S.ui.view='client';render();
}
function CHECK2(out){
  out.clientCards=qa('#view .orgbox').length;
  out.clientViewOk=out.clientCards===8;
  S.ui.view='today';render();
}
`;

console.log('built', T.mk('_t_r20.html', EMPTY, body));
