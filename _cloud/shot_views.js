/* 逐视图截图：node _cloud/shot_views.js [宽] [高] [标签]
 *   产物：_shots/v_<标签>_<视图>.png
 *   深色：DARK=1 node _cloud/shot_views.js 1440 1100 dark
 *   有真实数据的 profile（可选）：PROF=<chrome user-data-dir> node _cloud/shot_views.js
 * 说明：优先截构建产物 share/index.html；没构建过就退回源文件 政企作战台.html。
 *      源文件没有云端登录层，所以截出来的是本地数据。 */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const W = Number(process.argv[2]) || 1440;
const H = Number(process.argv[3]) || 1100;
const TAG = process.argv[4] || 'd';

const VIEWS = ['room', 'today', 'board', 'week', 'urge', 'chart', 'flow',
  'people', 'deliver', 'wbinbox', 'client', 'project', 'brief'];

/* 有产物就截产物，没产物就截源文件 */
const productPath = path.join(dir, 'share', 'index.html');
const sourcePath = path.join(dir, '政企作战台.html');
const TARGET = fs.existsSync(productPath) ? productPath : sourcePath;
if (!fs.existsSync(TARGET)) {
  console.error('找不到 share/index.html，也没有 政企作战台.html，先跑 node cloud_build.js 或把源文件放回工作区');
  process.exit(1);
}
console.log('截图对象：', path.relative(dir, TARGET));

const outDir = path.join(dir, '_shots');
fs.mkdirSync(outDir, { recursive: true });

/* 每个视图生成一份临时副本：先写 localStorage 标记（跳过欢迎弹窗），再用 hash 指定视图
 * 深色模式：主题存在 S.meta.theme 里（没有独立 storage 键），所以钩住 render，
 * 每次渲染后强制加 body.dark —— 这是最稳的做法，切换主题后也不会被覆盖掉。 */
const DARK_PRE = `<script>try{localStorage.setItem('zq_welcome_v8','1');}catch(e){}</script>`;
const DARK_POST = `<script>
(function(){
  function force(){ try{ document.body.classList.add('dark'); }catch(e){} }
  window.addEventListener('load', function(){
    force();
    var _r = window.render;
    window.render = function(){ var o = _r.apply(this, arguments); force(); return o; };
    setInterval(force, 500);
  });
})();
</script>`;

const files = [];
VIEWS.forEach(v => {
  let h = fs.readFileSync(TARGET, 'utf8');
  h = h.replace('<head>', '<head>' + DARK_PRE);
  if (process.env.DARK) h = h.replace('</body>', DARK_POST + '</body>');
  const f = `_shot_${v}.html`;
  fs.writeFileSync(path.join(dir, f), h, 'utf8');
  files.push([v, f]);
});

const prof = process.env.PROF ? process.env.PROF : path.join(os.tmpdir(), 'zqwb_shot_prof');
files.forEach(([v, f]) => {
  const shot = path.join(outDir, `v_${TAG}_${v}.png`).replace(/\\/g, '/');
  try {
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
      '--user-data-dir=' + prof,
      '--window-size=' + W + ',' + H,
      '--virtual-time-budget=12000',
      '--screenshot=' + shot,
      'file:///' + path.join(dir, f).replace(/\\/g, '/') + '#v=' + v
    ], { maxBuffer: 1 << 28, encoding: 'utf8', timeout: 60000, stdio: 'ignore' });
    const kb = Math.round(fs.statSync(shot).size / 1024);
    console.log(v.padEnd(9), kb + ' KB', fs.existsSync(shot) ? 'OK' : '缺图');
  } catch (e) {
    console.log(v.padEnd(9), '失败：', String(e.message).slice(0, 80));
  }
});
/* 清理临时副本 */
files.forEach(([, f]) => { try { fs.unlinkSync(path.join(dir, f)) } catch (_) { } });
console.log('截图目录：', outDir);
