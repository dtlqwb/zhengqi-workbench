# 政企作战台 · Zhengqi Workbench

> 一个政企客户经理一个人管一支队伍用的作战台：**派单 → 状态流转 → 一线反馈 → 数据卡在哪个部门 → 日报简报**。
> 单文件 HTML，零依赖、零构建、离线可用，数据存浏览器 `localStorage`。也可部署成线上版：**一个链接两种身份**（未登录只读 / 登录后可编辑，数据存云端）。

这个仓库开放给其他 AI 和工程师一起改。**它不是常规工程**——一个 HTML 文件 + 28 层尾部补丁，改错位置的概率很高，所以请先读完 [《接手须知》](docs/HANDOFF.md) 再动手。

---

## 30 秒上手

```bash
# 1) 直接双击 政企作战台.html 就能用（Chrome / Edge，无需服务器、无需 npm install）
# 2) 改完必跑：语法 + 回归（全绿才算改对）
node _cloud/check.js
node _cloud/r10_run.js
```

- 回归靠 **Chrome headless `--dump-dom`** 跑，不装任何依赖；本机需有 Chrome（脚本里 `CHROME` 常量写的是 Windows 路径，换机器要改）。
- `r10_run.js` 目前跑 **24 组断言 + 4 组打印实测 = 28 项**。
- 首次打开是空的，点引导卡里的「装入演示数据」可一键灌入 8 家客户 / 12 个业务的样例。

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `政企作战台.html` | **主文件**，UI + 逻辑 + 样式全在里面（约 336 KB，唯一产物） |
| `docs/HANDOFF.md` | **《接手须知》**：补丁行号地图、数据结构、设计红线、已知坑表 —— **先读这个** |
| `_cloud/check.js` | 抽内联脚本做语法检查 |
| `_cloud/r10_run.js` | 一键跑全部回归 |
| `_cloud/mktest_*.js` | 各组断言的测试页生成器（造假数据 → 注入 → 无头断言） |
| `_cloud/tseed.js` | 写新断言的脚手架：注入一份 `S`，断言写 `out.xxx` |
| `_cloud/one.js` | 单页跑一次并打印 TESTOUT + 红灯清单 |
| `_cloud/smoke_share.js` | **产物级**冒烟：跑构建产物 `share/index.html` 而非源文件 |
| `_cloud/smoke_share_mob.js` | 产物级移动端冒烟（375 / 320 真视口） |
| `cloud_build.js` / `cloud_glue.js` | 构建脚本：源文件 + 云 SDK + 登录层 → `share/index.html` |
| `cloud_config.example.json` | 云配置示例（复制成 `cloud_config.json` 再填自己的值） |
| `政企作战台_数据.example.json` | 演示数据种子示例（复制成 `政企作战台_数据.json` 再用） |

**仓库里没有的东西**：真实业务数据、云端凭证、构建产物 `share/`。`.gitignore` 已排除，**不要把真实数据提交上来**。

---

## 给参与修改的 AI：工作指引

### 怎么加功能

整个 JS 只有 **一个 `<script>`**，所有新功能都是在**文件尾部追加一个 IIFE**，用「取住原函数 → 包一层 → 赋回去」的方式打补丁：

```js
(function(){
  const _render = render;            // 取住上一层
  render = function(){ _render(); /* 新增逻辑 */ };
  window.__R21_READY__ = true;        // 每层留标记，方便断言
})();
```

所以**同一件事可能分散在好几层**，读代码要按 [《接手须知》第 4 节](docs/HANDOFF.md#4-代码结构一份文件--28-层补丁) 的行号地图走，不要从头顺读。

### 三条铁律（违反就出玄学 bug）

1. **IIFE 闭包里的函数，外部赋值改不到**。`vClient` / `clientDrawer` / `gateGuard` 都定义在某一层内部，外层再赋值只是新建了个外层变量，页面照旧调用闭包里那个。正确做法：**渲染后原地改 DOM**，或造一个同 `data-act` 的隐藏按钮点一下。
2. **后一层换掉模板，前一层的可见结果会被悄悄吃掉**（不报错）。改完一轮要回头核对「上一轮承诺显示的东西还在不在」。
3. **赋值顺序决定包装链**。新的 `render` 包装必须加在**最后**，否则会被后面的层绕过。

### 补丁必须幂等

渲染是全量重绘，补丁可能被调用很多次。自查写法：

```js
function patch(){
  const el = document.querySelector('.my-thing');
  if (el && el.dataset.patched) return;   // 已补过就退出
  // ...补 DOM...
  if (el) el.dataset.patched = '1';
}
```

### 弹层走的是另一条渲染路径

业务档案 / 客户详情是**直接改 `drawerRoot.innerHTML`**，**不走 `render()`**。钩在 `render` 上的补丁对它们**永不执行**，且不报错。必须同时挂 observer：

```js
new MutationObserver(() => { try{ patchDrawer(); }catch(e){} }).observe(drawerRoot, {childList:true});
```

### 交付前必须跑的验证

```bash
node _cloud/check.js                  # 语法
node _cloud/r10_run.js                # 24 组断言 + 4 组打印实测
node _cloud/smoke_share.js            # 产物级冒烟（含作战室几何）
node _cloud/smoke_share_mob.js 375    # 移动端真视口
```

**全绿才算改对。** 写新断言时用 `_cloud/tseed.js`：断言写 `out.xxx`；需要等异步补丁（MutationObserver）时，把断言写进 `CHECK / CHECK2 / CHECK3 / CHECK4`，各自隔一个宏任务执行。

### 改代码时的红线

- **零依赖**：不许引 CDN、不许装图表库。「离线、单文件、可打印」这三条不能被破坏。
- **不许重构补丁结构**：28 层叠层是这个项目能持续迭代的前提，只许往上加。
- **不许改存储键**：`localStorage['zq_workbench_v2']`、快照键 `zq_wb_snap_v3` 改了就丢用户数据。
- **设计红线见 [《接手须知》第 6 节](docs/HANDOFF.md#6-设计红线改之前必须遵守)**：五段闭环、门禁只拦推进不拦保存、白板联动单向只读、一次性项目与常设运维分型。
- **不确定先问，别猜**。

### 提交方式

1. 从 `main` 切分支：`git checkout -b feat/你的改动`
2. 改完跑完上面四条验证命令，把输出贴进 PR 描述
3. PR 标题写清「改了哪一段、解决什么问题」
4. 一次 PR 只做一件事；大改先开 Issue 讨论方向

---

## 隐私与边界（公开仓库）

- 仓库里的姓名、客户、单位、号码**全部是虚构的**（演示数据用 `苏文清 / 聂婉清 / 示例县应急管理局` 之类），不代表任何真实人员或客户。
- **真实业务数据、云端凭证、构建产物一律不入库**，`.gitignore` 已排除。如需接入自己的云端：`cp cloud_config.example.json cloud_config.json` 后填自己的值。
- 白板联动是**单向只读**：本工具对上游白板只读镜像表 `wb_mirror`，**绝不写上游**。

## 已知坑速查

| 坑 | 现象 | 解法 |
| --- | --- | --- |
| 写死 `viewBox` | 角色一多人就被裁出画布 | 画布高度按内容算 |
| 同类超 6 人 | `if(i>=6)return` 静默不画人 | 标 `+N` |
| localStorage 约 520 万字符 | 快照整包写失败被 catch 吞掉 → **最新的丢、旧的留** | 按预算从最旧的砍；写不进先腾位只写最新；再不行原样放回，绝不写空 |
| 表格多列 | 窄屏横向溢出 | 表头搬进 `td[data-l]`，CSS 转卡片 |
| headless 里的 `confirm()` | 不返回、页面直接挂死 | 测试页开头把 `confirm/alert/prompt/print` 全部打桩 |
| 真 375px 视口 | `--window-size=375` 实际给 526px | 外层套 `width:375px` 的 iframe |
| 抽屉不走 `render()` | 钩 render 的补丁永不执行 | 挂 `MutationObserver` 盯 `#drawerRoot` |
| 补丁层叠加 | 后一层换模板吃掉前一层可见结果 | 每轮回头核对上一层的东西还在不在 |

完整版见 [《接手须知》第 8 节](docs/HANDOFF.md#8-已知的坑照抄别再踩一遍)。

## 路线图（都还没做）

1. **多账号分权**：现在只有「本人」和「未登录只读」两种身份，成员不能自助填报
2. **常设运维的响应及时率**：运维类真正该看的是响应时长，不是逾期率
3. **里程碑拖期联动**：里程碑过期目前只在档案里标红，没进监督段亮红
4. **简报补「钱」和「客户沉默」两节**：金额与跟进已进五段看板和一页纸，每日简报正文还没接
5. **批量操作只在派单看板**：周计划、催办中心还没接多选

## 许可

MIT（见 [LICENSE](LICENSE)）。代码里的业务方法论（五段闭环、门禁、段落划分）欢迎讨论与改进。
