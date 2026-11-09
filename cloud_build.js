/* 构建「线上可登录编辑版」：政企作战台.html + 云端 SDK + 登录层 → share/index.html */
const fs = require('fs'), path = require('path');
const dir = __dirname;
const R = f => fs.readFileSync(path.join(dir, f), 'utf8');

let html = R('政企作战台.html');
/* 配置：仓库里只有示例，真实 cloud_config.json 不入库；缺了就退回示例（发布方需自备） */
const cfgFile = fs.existsSync(path.join(dir, 'cloud_config.json')) ? 'cloud_config.json' : 'cloud_config.example.json';
const cfg = JSON.parse(R(cfgFile));
/* 数据种子：优先真实数据文件，缺失时退回仓库里的示例（演示数据） */
const dataFile = fs.existsSync(path.join(dir, '政企作战台_数据.json')) ? '政企作战台_数据.json' : '政企作战台_数据.example.json';
const data = JSON.parse(R(dataFile));
const sdk = R(path.join('_cloud', 'package', 'lib', 'index.global.js'));
const glue = R('cloud_glue.js');

/* 数据补齐（与旧快照同口径） */
if (!Array.isArray(data.wbInbox)) data.wbInbox = [];
if (!data.wbSync) data.wbSync = { at: '', count: 0, err: '' };
if (!data.ui) data.ui = { view: 'room', f: {} };
if (!data.meta) data.meta = {};

/* 对外产物一律脱敏：内嵌种子和 __EMBED__ 都是公开可见的明文，不能留真实手机号。
   登录后从云端 main 读到的是完整数据，不受这里影响。 */
const maskPhone = s => String(s).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
(() => {
  (data.people || []).forEach(p => { if (p.phone) p.phone = maskPhone(p.phone); });
  (data.ext || []).forEach(x => { if (x.phone) x.phone = maskPhone(x.phone); });
})();
/* 页面自带的 seed() 里也有号码，同规则替换（只动 phone 字段，不碰其它数字） */
html = html.replace(/"phone":"(1[3-9]\d)\d{4}(\d{4})"/g, '"phone":"$1****$2"');
/* seed() 里还有以位置参数传入的号码（P('苏文清',...,'134xxxxxxxx')），换成打码 */
html = html.replace(/'1([3-9]\d)\d{4}(\d{4})'/g, "'1$1****$2'");

const d = new Date();
const pad = n => String(n).padStart(2, '0');
const at = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
const payload = JSON.stringify(data).replace(/</g, '\\u003c');

/* SDK 内联：避免 CDN 不可达导致登录直接不可用；转义 </script 防截断 */
const sdkSafe = sdk.replace(/<\/script/gi, '<\\/script');

const bootScript = `/* ---- 云端配置 + 首屏种子 ---- */
/* 只注入本应用自己的库；白板侧的 endpoint / key 一律不进页面（只读白板走 wb_mirror 镜像表） */
window.__CLOUD__=${JSON.stringify({ endpoint: cfg.endpoint, oauthRelayBaseUrl: cfg.oauthRelayBaseUrl, publishableKey: cfg.publishableKey, table: cfg.table, key: cfg.key })};
window.__EMBED__=${payload};
window.__EMBED_AT__=${JSON.stringify(at)};
`;

/* 1) 在 head 末尾插 noindex */
html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow">\n</head>');

/* 2) 主脚本之前插配置与 SDK */
if (html.indexOf('\n<script>\nconst KEY=') < 0) throw new Error('未找到主脚本入口');
html = html.replace('\n<script>\nconst KEY=',
  '\n<script>\n' + bootScript + '</script>\n<script>\n' + sdkSafe + '\n</script>\n<script>\nconst KEY=');

/* 3) 注入登录/读写层 */
if (html.indexOf('load();initAuto();') < 0) throw new Error('未找到注入点');
html = html.replace('load();initAuto();', glue + '\nload();initAuto();');

/* 4) 标题：源文件标题会随迭代改，这里用正则兜住，避免静默不生效 */
const titleOut = '<title>政企作战台 · 登录后可编辑</title>';
if (!/<title>[^<]*<\/title>/.test(html)) throw new Error('未找到 title');
html = html.replace(/<title>[^<]*<\/title>/, titleOut);
if (html.indexOf(titleOut) < 0) throw new Error('标题替换失败');

const out = path.join(dir, 'share');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html, 'utf8');
console.log('share/index.html', html.length, 'bytes | sdk', sdk.length, '| glue', glue.length,
  '| data', data.people.length, '人', data.orgs.length, '部门', data.tasks.length, '任务 | seed at', at);
console.log('  配置用：', cfgFile, '｜数据种子用：', dataFile);
if (cfgFile.indexOf('example') >= 0) console.log('  ⚠ 当前是示例配置，发布后云端登录不可用，请自备 cloud_config.json');
if (dataFile.indexOf('example') >= 0) console.log('  ⚠ 当前是演示数据种子，发布的首屏会是示例数据');
