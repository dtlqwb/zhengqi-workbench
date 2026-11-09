const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{spawnSync}=require('child_process');
const dir=process.cwd();
const qrcode=require('E:/学习/workbuddy/2026-10-24-16-02-08/wb/assets/vendor/qrcode.js');
const BOARD='https://zhengqi-board.app.workbuddy.host/?sharecode=NG6JWK5AWD';
const WB='https://collab-whiteboard-88153.app.workbuddy.host/?sharecode=YUSQKOC4YI';
const INK='#1B1A17',PAPER='#FFFDF8',RED='#D8502F',MUT='#8A847A';

function qrSVG(url){
  const g=qrcode(0,'M');g.addData(url);g.make();
  const n=g.getModuleCount(),pad=3,cell=10,size=(n+pad*2)*cell;
  let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(g.isDark(r,c))d+='M'+(c+pad)*cell+' '+(r+pad)*cell+'h'+cell+'v'+cell+'h-'+cell+'z';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+size+' '+size+'" shape-rendering="crispEdges"><rect width="'+size+'" height="'+size+'" fill="'+PAPER+'"/><path d="'+d+'" fill="'+INK+'"/></svg>';
}
const out=path.join(dir,'output');fs.mkdirSync(out,{recursive:true});
const boardSVG=qrSVG(BOARD),wbSVG=qrSVG(WB);
fs.writeFileSync(path.join(out,'政企看板_二维码.svg'),boardSVG.replace('<svg ','<svg width="1200" height="1200" '));
fs.writeFileSync(path.join(out,'白板反馈_二维码.svg'),wbSVG.replace('<svg ','<svg width="1200" height="1200" '));

const card=`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>政企作战看板 · 团队上手卡</title>
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{width:794px;height:1123px;background:#FBF9F4;color:#1B1A17;padding:50px 56px 40px;display:flex;flex-direction:column;font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif}
.brand{font-size:11.5px;letter-spacing:.3em;color:${MUT}}
h1{font-family:"Songti SC","SimSun",serif;font-size:33px;margin:9px 0 8px;letter-spacing:.02em}
.lead{font-size:13.5px;color:#5F5B54;line-height:1.75;margin:0 0 22px;max-width:640px}
.hero{display:flex;gap:26px;align-items:center;background:#fff;border:1px solid #E7E1D5;border-radius:14px;padding:22px 24px}
.hero .qr{flex:0 0 262px}
.hero .qr svg{width:262px;height:262px;display:block}
.hero .txt h2{font-size:19px;margin:0 0 9px}
.hero .txt p{font-size:13px;line-height:1.85;color:#4A463F;margin:0 0 7px}
.hero .txt .url{font-size:10.5px;color:${MUT};word-break:break-all;line-height:1.6}
.steps{margin-top:20px;display:flex;flex-direction:column;gap:13px}
.step{display:flex;gap:13px;align-items:flex-start;background:#fff;border:1px solid #EFEAE0;border-radius:12px;padding:13px 16px}
.num{width:25px;height:25px;border-radius:50%;background:${INK};color:#FBF9F4;font-size:12.5px;display:flex;align-items:center;justify-content:center;flex:0 0 25px;margin-top:1px;font-family:system-ui}
.step .body{flex:1}
.step h3{font-size:14.5px;margin:0 0 4px}
.step p{font-size:12px;line-height:1.7;color:#5F5B54;margin:0}
.step .mini{flex:0 0 96px;margin-left:8px}
.step .mini svg{width:96px;height:96px;display:block}
.step .mini span{display:block;text-align:center;font-size:9.5px;color:${MUT};margin-top:3px}
.tips{margin-top:17px;background:#F3EFE6;border-left:3px solid ${RED};border-radius:8px;padding:13px 16px;display:flex;flex-direction:column;gap:7px}
.tips div{font-size:11.5px;line-height:1.72;color:#4A463F}
.tips b{color:${INK}}
.foot{margin-top:auto;border-top:1px solid #E7E1D5;padding-top:13px;display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;color:${MUT}}
.foot b{color:${RED};font-weight:600}
</style></head><body>
<div class="brand">示例政企 · 团队看板</div>
<h1>政企作战看板 · 上手卡</h1>
<p class="lead">一张卡说清三件事：手机怎么看进度、一线在哪儿接单反馈、老大在哪儿录入。看板是只读的，改不了数据，放心发。</p>

<div class="hero">
  <div class="qr">${boardSVG}</div>
  <div class="txt">
    <h2>扫这个码看进度</h2>
    <p>全队任务、逾期项、卡在哪个市公司部门、项目完成率，手机上随时翻。</p>
    <p><b>只读</b>：能看不能改，不含电话号码。</p>
    <div class="url">${BOARD}</div>
  </div>
</div>

<div class="steps">
  <div class="step"><div class="num">1</div><div class="body"><h3>一线接单、反馈，走白板</h3><p>扫码进「示例白板」，右键便签 →「指派下一环节」，选受理人、写环节要求、定截止日；接单、办结都在便签上点。</p></div>
  <div class="mini">${wbSVG}<span>示例白板</span></div></div>
  <div class="step"><div class="num">2</div><div class="body"><h3>老大录入，在电脑上</h3><p>打开「政企作战台」派单、改状态、写反馈；白板上新指派的事会自动落到「白板收件箱」，点一下收录成正式任务。</p></div></div>
  <div class="step"><div class="num">3</div><div class="body"><h3>每天两班简报自动出</h3><p>7:00 晨报（今天必须催的、卡住的）、19:00 复盘（今天推进了什么、明天接什么），复制就能发群。</p></div></div>
</div>

<div class="tips">
  <div><b>看板是快照</b>：数据截至发布那一刻，要看最新数据，在本机打开政企作战台。</div>
  <div><b>白板便签要指派人</b>：只有指派了受理人的便签才会进「白板收件箱」；收录后白板上的接单、办结会自动回写任务状态。</div>
  <div><b>链接即权限</b>：二维码可打印、可截图发群，但别转到外部群；卡上已去掉电话号码。</div>
</div>

<div class="foot"><span>内部使用 · 勿外传　｜　看板链接即权限，请勿转发到外部群</span><b>示例移动 · 政企团队</b></div>
</body></html>`;

const tmp=path.join(dir,'_qr_card.html');fs.writeFileSync(tmp,card,'utf8');
const pngWrap=(svg,name)=>'<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:'+PAPER+'}svg{display:block;width:1400px;height:1400px}</style></head><body>'+svg+'</body></html>';
fs.writeFileSync(path.join(dir,'_qr_p1.html'),pngWrap(boardSVG,'board'),'utf8');
fs.writeFileSync(path.join(dir,'_qr_p2.html'),pngWrap(wbSVG,'wb'),'utf8');

const exe='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const prof=path.join(dir,'_q10');
function shot(src,outPng,w,h,scale){
  spawnSync(exe,['--headless=new','--disable-gpu','--no-sandbox','--hide-scrollbars','--user-data-dir='+prof,'--window-size='+w+','+h,'--force-device-scale-factor='+scale,'--screenshot='+outPng,pathToFileURL(src).href],{encoding:'utf8',timeout:90000});
  return fs.existsSync(outPng)?fs.statSync(outPng).size:0;
}
const s1=shot(path.join(dir,'_qr_p1.html'),path.join(out,'政企看板_二维码.png'),1400,1400,1);
const s2=shot(path.join(dir,'_qr_p2.html'),path.join(out,'白板反馈_二维码.png'),1400,1400,1);
const s3=shot(tmp,path.join(out,'政企作战看板_上手卡_A4.png'),794,1123,2);
fs.writeFileSync(path.join(out,'政企作战看板_团队上手卡.html'),card,'utf8');
fs.writeFileSync(path.join(out,'政企看板.url'),'[InternetShortcut]\r\nURL='+BOARD+'\r\nIconIndex=0\r\n','utf8');
console.log('PNG sizes: board',s1,'wb',s2,'card',s3);
console.log('modules: board',(boardSVG.match(/M/g)||[]).length,'wb',(wbSVG.match(/M/g)||[]).length);
