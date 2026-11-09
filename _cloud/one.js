/* 单页断言提取：node _cloud/one.js _t_r12.html [width] */
const path = require('path'), { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const file = process.argv[2] || '_t_r12.html';
const width = Number(process.argv[3]) || 0;
const os = require('os'), fs = require('fs');
/* 独立 profile 目录：用户桌面上还开着浏览器，共用 profile 会互相抢锁导致 headless 卡住 */
const prof = path.join(os.tmpdir(), 'zqwb_test_prof');
const out = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
  '--user-data-dir=' + prof,
  '--window-size=' + (width ? Math.max(900, width) : 1440) + ',900',
  '--virtual-time-budget=40000',
  '--dump-dom', 'file:///' + path.join(dir, file).replace(/\\/g, '/')
], { maxBuffer: 1 << 28, encoding: 'utf8', timeout: 90000 });
const m = out.match(/<div id="TESTOUT">([\s\S]*?)<\/div>/);
if (!m) { console.log('没拿到 TESTOUT'); process.exit(1); }
const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
let o;
try { o = JSON.parse(raw); } catch (e) { console.log('JSON 解析失败：', raw.slice(0, 400)); process.exit(1); }
const bad = [];
Object.keys(o).forEach(k => {
  const v = o[k];
  if (/^errs$/i.test(k)) { if (Array.isArray(v) && v.length) bad.push(k + '=' + JSON.stringify(v).slice(0, 200)); return; }
  if (/fatal|throw|Err$/.test(k) && v) bad.push(k + '=' + String(v).slice(0, 200));
  if (v === false) bad.push(k + '=false');
});
console.log(JSON.stringify(o, null, 1));
console.log(bad.length ? '\n红灯：' + bad.join(' | ') : '\n全部通过');
process.exit(bad.length ? 1 : 0);
