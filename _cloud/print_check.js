/* 打印实测：把一页纸填满，导出 PDF 数页数。node _cloud/print_check.js [项目数] [逾期数] */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const T = require('./tseed');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const dir = path.join(__dirname, '..');

const NP = Number(process.argv[2] || 3);
const NL = Number(process.argv[3] || 4);
function day(n) { const x = new Date(); x.setDate(x.getDate() + n); const p = v => String(v).padStart(2, '0'); return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate()) }

const projects = [], tasks = [];
for (let i = 0; i < NP; i++) {
  projects.push({ id: 'b' + i, name: '业务项目名称第' + (i + 1) + '号（含说明文字）', clientId: 'c1', stage: ['S1', 'S2', 'S3', 'S5'][i % 4], kind: 'once',
    goal: 'g', why: 'w', decision: '接', amt: 3000000 + i * 500000, paid: 1000000 + i * 200000, cost: 2000000,
    strategy: '先打样板店再复制，用现成案例压价，避开价格战', milestones: [], planOk: true, log: [] });
}
for (let i = 0; i < NL; i++) {
  tasks.push({ id: 't' + i, title: '逾期任务标题第' + (i + 1) + '条（带一些说明性的文字内容）', personId: 'p1',
    project: projects[i % NP].name, projectId: projects[i % NP].id, client: 'c1', prio: '紧急',
    due: day(-(i + 2)), status: '进行中', flow: i % 3 ? '' : '集客部', support: [],
    created: day(-30), updated: day(-1), deliverable: '', receipt: false, feedback: '', note: '' });
}
for (let i = 0; i < 5; i++) {
  tasks.push({ id: 'd' + i, title: '未来七天内到期的任务第' + (i + 1) + '条', personId: 'p1',
    project: projects[0].name, projectId: projects[0].id, client: 'c1', prio: '重要',
    due: day(i + 1), status: '待接收', flow: '', support: [], created: day(-10), updated: day(-1),
    deliverable: '', receipt: false, feedback: '', note: '' });
}

const S = T.baseS({ ui: { view: 'today', f: {} }, projects, tasks });
const body = `window.__R18__.doPrint();`;
const page = '_t_print.html';
T.mk(page, S, body);

const prof = path.join(os.tmpdir(), 'zqwb_test_prof');
const pdf = path.join(dir, '_t_print.pdf');
try { fs.unlinkSync(pdf) } catch (e) { }
execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
  '--user-data-dir=' + prof, '--no-pdf-header-footer',
  '--virtual-time-budget=8000',
  '--print-to-pdf=' + pdf,
  'file:///' + path.join(dir, page).replace(/\\/g, '/')
], { maxBuffer: 1 << 28, encoding: 'utf8', timeout: 90000 });

const buf = fs.readFileSync(pdf);
const txt = buf.toString('latin1');
const pages = (txt.match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log('项目 ' + NP + ' 个 / 逾期 ' + NL + ' 条 → 打印页数 ' + pages + '，PDF ' + Math.round(buf.length / 1024) + ' KB');
try { fs.unlinkSync(pdf) } catch (e) { }
try { fs.unlinkSync(path.join(dir, page)) } catch (e) { }
process.exit(pages === 1 ? 0 : 1);
