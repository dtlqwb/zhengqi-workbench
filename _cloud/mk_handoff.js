/* 生成「交给外部 AI」的交接包：带行号地图的 HANDOFF.md + 脱敏源码 + 回归脚本
   用法：node _cloud/mk_handoff.js   → 产出 交接包_给外部AI/ */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
const OUT = path.join(dir, '交接包_给外部AI');
const SRC = path.join(dir, '政企作战台.html');

const html = fs.readFileSync(SRC, 'utf8');
const lines = html.split('\n');
const lineOf = (needle, from = 0) => {
  for (let i = from; i < lines.length; i++) if (lines[i].indexOf(needle) >= 0) return i + 1;
  return 0;
};

/* ---- 1. 扒出补丁层地图（行号现算，源码改了也不会过期） ---- */
const MARKS = [
  ['主程序', 'const VIEWS=[', '视图表 / 状态模型 / render / 各视图渲染函数（V1 骨架，后面全是它的补丁）'],
  ['V3', 'V3：批量录入', '批量粘贴导入人员与任务；状态变更留痕；记录完成时间'],
  ['V4', 'V4：周计划日历', '周计划日历视图，拖任务改期限；卡点按等待天数分档老化'],
  ['V5', 'V5：催办中心', '催办中心：逾期与卡协调任务按人聚合成可复制的话术'],
  ['V6', 'V6：态势图表', '态势图表：手写 SVG 六张图，零外部图表库'],
  ['V7', 'V7：撤销重做', '撤销/重做、本地快照回滚、Ctrl+K 命令面板、快捷键'],
  ['V8+V9', 'V8：白板收件箱', '白板收件箱（只读单向）；V9 在其后段做「白板状态回写本地任务」'],
  ['V10', 'V10：关系网放开', '角色自由输入；外部委托方实体；前置条件清单硬拦；交付与回执视图'],
  ['V12', 'V12：客户视角', '客户视图 + 客户抽屉；项目实体化并绑定客户（projectId）'],
  ['V13', 'V13（2026-11-08 21:50）', '真实数据反查出的 6 处修正（未归项目兜底、角色表重算等）'],
  ['R1', 'V14 · R1：业务成为一级对象', '业务升级为一级对象：goal/why/decision/kind/clientId 五件套 + 新建业务表单'],
  ['R2', 'V14 · R2：五段状态机', '五段状态机 + 门禁 gateMiss + 五段看板 .bkan + 业务档案抽屉（本层内还含 R3/R4/R5）'],
  ['R3', 'R3：总结段（复盘四问', '〔在 R2 层内部〕复盘四问、结项、常设按月复盘、简报附三/附四'],
  ['R4', 'R4：任务段标', '〔在 R2 层内部〕任务段标 chip、档案段分布、图表段位分布'],
  ['R5', 'R5：数据体检', '〔在 R2 层内部〕sanitize 脏数据自愈、数据体检面板、本地快照'],
  ['R6', 'R6（2026-11-08）：移动端', '移动端：窄屏看板横滑+段位条、表格转卡片、点击区放大、拖拽降级'],
  ['R7', 'R7（2026-11-08）：全局搜索', '全局搜索七类（业务/客户/段位/复盘…）+ 键盘操作 + 快捷键表'],
  ['R8', 'R8（2026-11-08）：视觉', '视觉与文案一致性：空状态、chip 规格、深色补齐'],
  ['R9', 'R9（2026-11-08）：大数据量', '大数据量压测结论 + 快照配额兜底 + 存储面板'],
  ['R12', 'R12（2026-11-08）：项目金额', '项目金额三件套（amt/paid/cost）：业务卡回款条、五段顶部汇总、档案金额段'],
  ['R13', 'R13（2026-11-08）：客户跟进', '客户最近一次联系 touch/touchLog，沉默天数分四档，「该联系了」清单'],
  ['R14', 'R14（2026-11-08）：逾期处置', '逾期三条出路：催（复制话术）/ 改期 / 关掉，全部写进任务 log'],
  ['R15', 'R15（2026-11-08）：批量操作', '看板多选：批量改状态/改人/改期限/删除，带一次性撤销'],
  ['R16', 'R16（2026-11-08）：业务档案补', '业务档案补「对手与打法」rivals/strategy/odds，空态提示补全'],
  ['R17', 'R17（2026-11-08）：数据体检', '15 类脏数据扫描（负责人丢失、金额为负、段位非法、S5 无复盘…），条目可点击直达'],
  ['R18', 'R18（2026-11-08）：一页纸汇报', 'buildReport 生成 A4 一页纸（条目多了自动 dense 压缩）+ buildText 纯文本发微信'],
  ['R19', 'R19（2026-11-08）：键盘能走完', '焦点环、跳转链接、[data-act] 补 tabindex/role/aria-label、弹层焦点锁定与归还'],
  ['R20', 'R20（2026-11-08）：第一次打开', '空数据三步引导卡 + loadDemo（带 8 家客户并把项目绑上客户）']
];
const marks = MARKS.map(([tag, needle, desc]) => ({ tag, desc, line: lineOf(needle) }))
  .filter(m => m.line)
  .sort((a, b) => a.line - b.line);
const tailLine = lineOf('load();initAuto();');
const NLAYER = marks.length - 1;   /* 除主程序外的补丁层数 */
marks.forEach((m, i) => { m.to = i + 1 < marks.length ? marks[i + 1].line - 1 : tailLine - 1; });

const mapTable = marks.map(m =>
  `| ${m.tag} | ${m.line}–${m.to} | ${m.desc} |`
).join('\n');

/* ---- 2. 脱敏：手机号一律打码（HANDOFF 里说明保留了什么） ---- */
function maskPhone(s) {
  return s.replace(/\b(1[3-9]\d)\d{4}(\d{4})\b/g, '$1****$2');
}
const maskedHtml = maskPhone(html);
let maskedHit = (html.match(/\b1[3-9]\d{9}\b/g) || []).length;

const payloadPath = path.join(__dirname, 'real_payload.json');
let maskedPayload = '';
try {
  maskedPayload = maskPhone(fs.readFileSync(payloadPath, 'utf8'));
} catch (e) { maskedPayload = '{}'; }

/* ---- 3. 写包 ---- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, '_cloud'), { recursive: true });
fs.writeFileSync(path.join(OUT, '政企作战台.html'), maskedHtml, 'utf8');
fs.writeFileSync(path.join(OUT, '_cloud', 'real_payload.json'), maskedPayload, 'utf8');

const TESTS = ['check.js', 'r10_run.js', 'tseed.js', 'one.js', 'print_check.js',
  'mktest_r1.js', 'mktest_r2.js', 'mktest_r3.js', 'mktest_r4.js',
  'mktest_r5.js', 'mktest_r6.js', 'mktest_r7.js', 'mktest_r8a.js', 'mktest_r9.js', 'mktest_r9b.js',
  'mktest_r9c.js', 'mktest_r9d.js', 'mktest_room.js',
  'mktest_r12.js', 'mktest_r13.js', 'mktest_r14.js', 'mktest_r15.js', 'mktest_r16.js',
  'mktest_r17.js', 'mktest_r18.js', 'mktest_r19.js', 'mktest_r20.js', 'mktest_mob.js'];
let copied = 0;
TESTS.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) { fs.writeFileSync(path.join(OUT, '_cloud', f), maskPhone(fs.readFileSync(p, 'utf8')), 'utf8'); copied++; }
});

/* ---- 4. HANDOFF.md ---- */
const HANDOFF = `# 交接说明 · 政企团队可视化工作台

> 这是一份给「接手优化的 AI / 工程师」的说明书。请**先完整读完第 1–5 节再动手**。
> 本项目不是常规工程：**一个 HTML 文件 + ${NLAYER} 层补丁**，改错位置的概率很高。

## 1. 它是什么

一个政企客户经理一个人管一支队伍用的作战台：派单 → 状态流转 → 一线反馈 → 数据卡在哪个部门 → 日报简报。
单文件 HTML（约 ${Math.round(Buffer.byteLength(maskedHtml, 'utf8') / 1024)} KB），**零依赖、零构建、离线可用**，数据存浏览器 \`localStorage\`。

十三条视图：作战室 / 今日态势 / 派单看板 / 周计划 / 催办中心 / 态势图表 / 协调流程 / 关系网 / 客户 / 项目视角 / 交付与回执 / 白板收件箱 / 每日简报。

## 2. 五分钟跑起来

\`\`\`bash
# 1) 双击 政企作战台.html 就能用（Chrome / Edge，无需服务器、无需 npm install）
# 2) 语法检查（改完必跑）
node _cloud/check.js
# 3) 13 组回归（改完必跑，全绿才算改对）
node _cloud/r10_run.js
\`\`\`

- 回归脚本靠 **Chrome headless \`--dump-dom\`** 跑，不装任何依赖；需要本机有 Chrome。
  脚本里 \`CHROME\` 常量写的是 Windows 路径，换机器要改。
- \`_cloud/r10_run.js\` 会依次跑 R1～R11 共 13 组断言，输出 \`PASS/FAIL\`。

## 3. 文件地图

| 文件 | 要不要读 | 说明 |
| --- | --- | --- |
| \`政企作战台.html\` | **主要读这个** | 唯一产物，UI + 逻辑 + 样式全在里面 |
| \`_cloud/check.js\` | 用 | 抽内联脚本做语法检查 |
| \`_cloud/r10_run.js\` | 用 | 一键跑 13 组回归 |
| \`_cloud/mktest_*.js\` | 看 | 各组断言的测试页生成器（造假数据 → 注入 → 无头断言） |
| \`_cloud/real_payload.json\` | 看 | 真实数据结构样本（手机号已打码） |
| \`HANDOFF.md\` | 就是本文件 | — |

**包里没有的东西**（也不需要）：云端配置、构建脚本、线上产物、真实数据备份。本项目可以完全离线开发。

## 4. 代码结构：一份文件 + ${NLAYER} 层补丁

整个 JS 只有 **一个 \`<script>\`**（第 200 行开始）。后面所有版本都是**尾部追加的 IIFE**，用「取住原函数 → 包一层 → 赋回去」的方式打补丁：

\`\`\`js
(function(){
  const _render = render;          // 取住上一层
  render = function(){ _render(); …新增逻辑… };
  window.__R9_READY__ = true;      // 每层留一个标记，方便断言
})();
\`\`\`

所以**同一件事可能分散在好几层**，读代码要按下面的行号地图走，不要从头顺读。

| 层 | 行号 | 干了什么 |
| --- | --- | --- |
${mapTable}

**注意：V11 不在这张表里。** V11（云端登录 / 双身份读写）是**发布时才注入**的：构建脚本把云端 SDK 与配置拼进产物，本地文件里没有 \`window.__CLOUD__\`，所以本地跑永远是「数据只存本机」。你要改云端相关的东西，得另找构建产物，别在这个文件里翻。

补丁层的三个铁律（违反就会出玄学 bug）：

1. **IIFE 闭包里的函数，外部赋值改不到**。\`vClient\` / \`clientDrawer\` / \`gateGuard\` / \`pushSnap\` 都定义在某一层内部，外层再写 \`vClient = function(){…}\` 只是新建了个外层变量，页面照旧调用闭包里那个。**正确做法：渲染后原地改 DOM，或造一个同 \`data-act\` 的隐藏按钮点一下。**
2. **后一层换掉模板，前一层的可见结果会被悄悄吃掉**。R2 把项目视角从 \`.proj\` 卡换成 \`.bkan .bcard\` 之后，R1 加在 \`.proj\` 上的「待立项/已立项」那行字就再也没渲染过，而且不报错。**改完一轮要回头核对「上一轮显示的东西还在不在」。**
3. **赋值顺序决定包装链**。新的 \`render\` 包装必须加在**最后**，否则后面的层会拿到旧引用，你的逻辑被绕过。

## 5. 数据结构（\`S\`，存 \`localStorage['zq_workbench_v2']\`）

\`\`\`js
S = {
  people:   [{id, name, role, org, rel, color, phone, tags, note}],
  orgs:     [{id, name, short, duty, contact, color}],          // 市公司协调部门
  ext:      [{id, name, type, contact, title, phone, color, pay}], // 外部委托方（客户）
  projects: [{id, name, clientId, kind:'once'|'standing', stage:'S1'|'S2'|'S3'|'S5',
              goal, why, decision, deliverTarget, planOk, closedAt,
              milestones:[{id,name,due,done}], review:{at,did,gap,why,next},
              reviews:[{period,did,gap,why,next}]}],
  tasks:    [{id, title, personId, projectId, project, client, prio, due, status,
              stage, deliverable, receipt, support:[orgId], flow, blockedSince,
              feedback, gates:[], created, updated}],
  meta:     {ver:3, theme:'light'|'dark', health:{at,fixed:[]}, …},
  ui:       {view:'board', f:{}, pq:''},
  roles:    ['客户经理','网格长',…]
}
\`\`\`

- \`status\` 四态：待接收 / 进行中 / 待验收 / 已完成。
- \`stage\` 五段：S1 启动 / S2 计划 / S3 执行 / **S4 监督（虚拟段，不落库）** / S5 总结。
- \`meta.ver\` 不等于 3 时会触发 \`sanitize()\` 自动修复脏数据。

## 6. 设计红线（改之前必须遵守）

1. **每个业务都要能走完「启动→计划→执行→监督→总结」**，这是立项时老板立的规矩。新增字段/视图先回答「补的是哪一段」，答不上就是装饰。
2. **监督不是独立阶段**，是并行长明灯：业务当前段只在 S1/S2/S3/S5 之间推进，S4 只要有逾期或未解卡点就亮红，与停在第几段无关。**别把它做成第五列可停留的状态。**
3. **项目段不许由任务反推**。任务做完 ≠ 业务该结束；验收齐了但复盘没做，照样不算闭环。
4. **一次性项目 / 常设运维必须分型**。常设类没有终点，总结段按月复盘、不进完成率。
5. **门禁只拦推进、不拦保存**：草稿照存，点「进下一段」时提示差哪几项，允许退回且留痕。
6. **白板联动是单向只读**：白板在前、工作台在后，工作台绝不回写白板。
7. **零依赖**。不许引 CDN、不许装图表库——离线、单文件、可打印这三条不能被破坏。

## 7. 怎么验证（别只靠肉眼）

\`\`\`bash
node _cloud/check.js      # 语法
node _cloud/r10_run.js    # 24 组断言 + 4 组打印实测（见下）
\`\`\`

覆盖范围：R1~R5 五段闭环 / R6+R12 移动端 / R7 搜索 / R8 视觉 / R9 大数据与配额 /
R11 作战室几何 / R12 金额 / R13 客户跟进 / R14 逾期处置 / R15 批量与撤销 /
R16 对手打法 / R17 数据体检 / R18 一页纸 / R19 键盘无障碍 / R20 引导与演示数据 /
M1-M2 真 375·320 视口无横向溢出 / P1-P4 打印永远 1 页。

写新断言时的入口：
- \`_cloud/tseed.js\` —— 把一份 S 注入主页面的脚手架。断言写 \`out.xxx\`，
  需要等异步补丁（MutationObserver）时把断言写进 \`CHECK/CHECK2/CHECK3/CHECK4\`，各自隔一个宏任务执行。
- \`_cloud/one.js\` —— 单页跑一次并打印 TESTOUT＋红灯清单。

写新断言时的两个经验：

- **真 375px 视口要用 iframe 顶住**：Chrome headless 的 \`--window-size=375,780\` 实际给的是 526px（有最小窗口宽度），必须外层套一个 \`width:375px\` 的 iframe 才能测准。见 \`mktest_r6.js\`。
- **\`performance.now()\` 在 \`--virtual-time-budget\` 下是被冻住的**，量性能要写同步脚本、不要加那个参数。

## 8. 已知的坑（照抄，别再踩一遍）

| 坑 | 现象 | 解法 |
| --- | --- | --- |
| \`KIND[k] \\|\\| 9\` | 值为 \`0\` 的优先级被当成 undefined → 排序错乱 | 用 \`=== undefined\` 判断 |
| 写死 \`viewBox\` | 角色/部门一多就被裁出画布（作战室踩过） | 画布高度按内容算（\`panelBottom\`） |
| 同类超 6 人 | \`if(i>=6)return\` 静默不画人 | 标 \`+N\` |
| localStorage 约 520 万字符 | 快照整包写失败被 catch 吞掉 → **最新的丢、旧的留** | 按预算从最旧的砍；写不进先腾位只写最新；再不行原样放回，绝不写空 |
| 云端替换 \`S\` | 新角色进不了 \`ROLES\` 图例 | 每次渲染前重算（\`syncRoles13\`） |
| 表格 9 列 | 窄屏横向溢出 | 表头搬进 \`td[data-l]\`，CSS 转卡片 |
| \`innerText\` 断言 | 弹窗里是 \`input.value\`，文字查不到 | 断言 \`document.getElementById('b_name').value\` |
| headless 里的 \`confirm()\` | 不返回、页面直接挂死，dump-dom 永远等不到 | 测试页开头把 \`confirm/alert/prompt/print\` 全部打桩 |
| 抽屉不走 \`render()\` | 业务档案/客户抽屉是直接改 \`innerHTML\`，钩在 render 上的补丁永远不执行 | 加 \`MutationObserver\` 盯 \`#drawerRoot\`，渲染后原地补 DOM |
| 补丁层叠加渲染 | 后一层换掉模板，前一层的可见结果静默失效（R2 换卡后 R1 的整行消失） | 每次加层都回头确认上一层的可见结果还在 |

## 9. 待办（按优先级，都还没做）

1. **多账号分权**：现在只有「本人」和「未登录只读」两种身份，成员不能自助填报。
2. **常设运维的响应及时率**：现在只统计逾期率，运维类真正该看的是响应时长。
3. **里程碑拖期联动**：里程碑过期目前只在档案里显示，没有进入监督段亮红。
4. **简报里「按客户看」与「段位分布」合并**：两节信息有重叠。
5. **简报里还没有「钱」和「客户沉默」两节**：R12/R13 只进了五段看板、客户视图和一页纸，每日简报正文还没接。
6. **批量操作只在派单看板**：周计划、催办中心还没接多选。
7. **里程碑拖期没有进 R14 的逾期面板**：目前只统计任务，里程碑过期只在档案里标红。

## 10. 把这个包交给另一个 AI 时，贴这段开场白

\`\`\`
这个文件夹里是一个单文件 HTML 项目（政企作战台.html），约 ${(html.length/10000).toFixed(0)} 万字符，
尾部叠了 ${NLAYER} 层 IIFE 补丁。请先读 HANDOFF.md 的第 4 节（补丁行号地图）
和第 6 节（设计红线），再读第 8 节（已知的坑）。

要求：
1. 只改 政企作战台.html，不要引入任何外部依赖（CDN / npm 包都不行）。
2. 每次改完必须跑 node _cloud/check.js 和 node _cloud/r10_run.js，13 组必须全绿。
3. 改动前先告诉我你打算动哪一层、为什么，等我确认后再改。
4. 不要重构现有 ${NLAYER} 层补丁结构——它是这个项目能持续迭代的前提。
5. 不确定的地方先问，不要猜。
\`\`\`

---

## 附：这个包里有什么 / 没有什么

**有**：完整可运行的 \`政企作战台.html\`（手机号已打码）、13 组回归脚本、脱敏后的数据样本、本说明。

**没有**：云端配置与密钥、线上发布产物、真实数据备份、构建脚本、历史版本快照。
另外，文件里仍保留**同事姓名**与**客户单位名称**（跑测试要用到），如不希望外传请先告诉我，我出全代号版。
`;

fs.writeFileSync(path.join(OUT, 'HANDOFF.md'), HANDOFF, 'utf8');

/* ---- 5. 汇总 ---- */
const total = fs.readdirSync(OUT).length;
console.log('交接包已生成：' + OUT);
console.log('  HANDOFF.md          ' + HANDOFF.length + ' 字符');
console.log('  政企作战台.html      ' + maskedHtml.length + ' 字符（打码手机号 ' + maskedHit + ' 处）');
console.log('  _cloud/             ' + copied + ' 个脚本');
console.log('  补丁层地图          ' + marks.length + ' 层，末行 ' + tailLine);
