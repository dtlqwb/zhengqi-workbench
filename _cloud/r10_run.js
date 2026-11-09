/* R10：全量回归跑批 —— 依次执行 mktest_r1..r9d，汇总每个断言的成败 */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const TESTS = [
  ['R1 业务成为一级对象', 'mktest_r1', '_t_r1.html'],
  ['R2 五段状态机+门禁+看板', 'mktest_r2', '_t_r2.html'],
  ['R3 总结段复盘四问+结项', 'mktest_r3', '_t_r3.html'],
  ['R4 任务段标+段分布+图表', 'mktest_r4', '_t_r4.html'],
  ['R5 数据健壮性+快照', 'mktest_r5', '_t_r5.html'],
  ['R6 移动端 375/320/414', 'mktest_r6', '_t_r6_frame.html', [375]],
  ['R7 搜索与快捷键', 'mktest_r7', '_t_r7.html'],
  ['R8 视觉与文案一致性', 'mktest_r8a', '_t_r8.html'],
  ['R9 大数据压测', 'mktest_r9', '_t_r9.html'],
  ['R9b 配额兜底+面板', 'mktest_r9b', '_t_r9b.html'],
  ['R9c 面板操作无报错', 'mktest_r9c', '_t_r9c.html'],
  ['R9d 快照预算裁剪', 'mktest_r9d', '_t_r9d.html'],
  ['R11 作战室几何不裁人', 'mktest_room', '_t_room.html'],
  ['R12 项目金额三处显示', 'mktest_r12', '_t_r12.html'],
  ['R13 客户沉默与跟进', 'mktest_r13', '_t_r13.html'],
  ['R14 逾期处置与留痕', 'mktest_r14', '_t_r14.html'],
  ['R15 批量操作与撤销', 'mktest_r15', '_t_r15.html'],
  ['R16 对手与打法', 'mktest_r16', '_t_r16.html'],
  ['R17 数据体检', 'mktest_r17', '_t_r17.html'],
  ['R18 一页纸汇报', 'mktest_r18', '_t_r18.html'],
  ['R19 键盘与无障碍', 'mktest_r19', '_t_r19.html'],
  ['R20 首次引导与演示数据', 'mktest_r20', '_t_r20.html'],
  ['M1 移动端 375 真视口', 'mktest_mob', '_t_mob.html', [375]],
  ['M2 移动端 320 真视口', 'mktest_mob', '_t_mob.html', [320]]
];
/* 打印实测：不是 TESTOUT 页，单独跑，要求页数＝1 */
const PRINT_CASES = [['3', '4'], ['10', '12'], ['16', '16'], ['30', '40']];

function build(mod, width) {
  const env = Object.assign({}, process.env);
  if (width) { env.R6W = String(width); env.W = String(width); }
  execFileSync('node', [path.join(__dirname, mod + '.js')], { cwd: dir, env, stdio: 'pipe' });
}
function dump(htmlFile, width) {
  const out = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--window-size=' + (width ? Math.max(900, width) : 1440) + ',900',
    '--virtual-time-budget=40000',
    '--dump-dom', 'file:///' + path.join(dir, htmlFile).replace(/\\/g, '/')
  ], { maxBuffer: 1 << 28, encoding: 'utf8' });
  const m = out.match(/<div id="TESTOUT">([\s\S]*?)<\/div>/);
  if (!m) return null;
  const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function badKeys(o) {
  const bad = [];
  Object.keys(o || {}).forEach(k => {
    const v = o[k];
    if (/^(errs|err)$/i.test(k) && Array.isArray(v) && v.length) bad.push(k + '=' + JSON.stringify(v).slice(0, 160));
    if (/throw|fatal|stepErr|renderThrew|Err$/.test(k) && v) bad.push(k + '=' + String(v).slice(0, 120));
    if (v === false && !/^(hasBtn|draggable|over|tbcard|seg|C_sameAsBefore|newestFirst)$/.test(k) && !/^A_|^B_/.test(k)) bad.push(k + '=false');
  });
  return bad;
}

let totalBad = 0;
const report = [];
TESTS.forEach(([name, mod, file, extra]) => {
  let line = { name, ok: true, note: '' };
  try {
    build(mod, extra && extra[0]);
    const o = dump(file, extra && extra[0]);
    if (!o) { line.ok = false; line.note = '没拿到 TESTOUT（页面可能报错或超时）'; }
    else {
      const bad = badKeys(o);
      if (bad.length) { line.ok = false; line.note = bad.join(' | '); }
      else line.note = Object.keys(o).filter(k => k[0] === 'v' && o[k].view).length ? '13 视图全查' : '断言通过';
    }
  } catch (e) {
    line.ok = false; line.note = '执行失败：' + String(e.message || e).slice(0, 160);
  }
  if (!line.ok) totalBad++;
  report.push(line);
  console.log((line.ok ? 'PASS  ' : 'FAIL  ') + name.padEnd(30) + ' ' + line.note);
});
console.log('\n合计 ' + TESTS.length + ' 组，失败 ' + totalBad + ' 组');

/* 打印实测：一页纸必须真的一页 */
PRINT_CASES.forEach(([np, nl]) => {
  let ok = true, note = '';
  try {
    const out = execFileSync('node', [path.join(__dirname, 'print_check.js'), np, nl], { cwd: dir, encoding: 'utf8', stdio: 'pipe', timeout: 90000 });
    note = String(out).trim().split('\n').pop();
  } catch (e) {
    ok = false;
    note = '页数不是 1 页：' + String((e.stdout || e.message || '')).trim().slice(0, 120);
  }
  if (!ok) totalBad++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + ('P 打印一页纸 ' + np + '项目/' + nl + '逾期').padEnd(30) + ' ' + note);
});
console.log('\n含打印共 ' + (TESTS.length + PRINT_CASES.length) + ' 项，失败 ' + totalBad + ' 项');

/* 收尾：把测试页删掉，别往交接包里留一堆 1MB 的临时文件 */
let cleaned = 0;
TESTS.forEach(([, , file]) => {
  const p = path.join(dir, file);
  try { if (fs.existsSync(p)) { fs.unlinkSync(p); cleaned++; } } catch (e) {}
});
/* 再扫一遍兜底：R6 还会生成 _t_r6_frame.html 这类附属页 */
fs.readdirSync(dir).filter(f => /^_t_.*\.html$/.test(f)).forEach(f => {
  try { fs.unlinkSync(path.join(dir, f)); cleaned++; } catch (e) {}
});
if (cleaned) console.log('已清理 ' + cleaned + ' 个临时测试页');
process.exit(totalBad ? 1 : 0);
