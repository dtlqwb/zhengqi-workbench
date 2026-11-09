/* 抽取主内联脚本做语法检查（node --check） */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const file = process.argv[2] || path.join(__dirname, '..', '政企作战台.html');
const html = fs.readFileSync(file, 'utf8');
const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
if (!blocks.length) { console.error('没有内联脚本'); process.exit(1); }
blocks.sort((a, b) => b.length - a.length);
const out = path.join(__dirname, '_check_tmp.js');
fs.writeFileSync(out, blocks[0], 'utf8');
// 顶层 await / return 会误报，包一层函数更稳
try {
  cp.execFileSync(process.execPath, ['--check', out], { stdio: 'inherit' });
  console.log('语法检查通过 ·', file, '| 主脚本', blocks[0].length, 'chars |', blocks.length, '个内联块');
} finally {
  try { fs.unlinkSync(out); } catch (e) {}
}
