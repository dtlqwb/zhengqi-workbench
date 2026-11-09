/* ================= 云端版：登录后可编辑 / 不登录只读 ================= */
(function(){
  var CFG=window.__CLOUD__||{};
  var TBL=CFG.table||'workbench', RK=CFG.key||'main';
  /* 同一张表存两行：RK=完整版（仅本人可读）｜PK=脱敏公开版（不登录可读，给领导看） */
  var PK='public';
  var cloud=null, sess=null, signedIn=false, foreign=false, owner=false, hasRow=false;
  var tmr=null, busy=false, pend=false, otpPending=null;
  var state='init', errMsg='', lastAt='';
  var rowOwnerId='', rowOwnerName='';   /* 云端那一行的归属，用于精确判定 owner / 备份展示名 */

  function $(id){return document.getElementById(id)}
  function mail(){return (sess&&sess.user&&(sess.user.email||sess.user.name))||''}
  function uidOf(){return String((sess&&sess.user&&sess.user.id)||'')}
  function hm(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}

  /* ---------------- 首屏：先本地渲染，云端到了再换 ---------------- */
  var _loadPrev=load;
  var _savePrev=save;

  function loadFrom(obj){
    var d=JSON.parse(JSON.stringify(obj||{}));
    if(!owner)maskPhones(d);
    var keep=(S&&S.ui&&S.ui.view)||'';
    try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}
    S=null;
    _loadPrev();                       // 走原始链路：读缓存 + V10 的 ensure()
    if(S&&S.ui&&keep)S.ui.view=keep;
    var m=String(location.hash||'').match(/v=([a-z]+)/);
    if(S&&S.ui&&m&&VIEWS.some(function(x){return x[0]===m[1]}))S.ui.view=m[1];
  }
  function seed(){return window.__EMBED__||{}}
  function maskPhones(o){
    (o.people||[]).forEach(function(p){
      if(p.phone)p.phone=String(p.phone).replace(/^(\d{3})\d{4}(\d{4})$/,'$1****$2');
    });
  }
  /* 公开版：把 11 位手机号一律打码（连备注、任务反馈里的也一起处理），别的手工字段不动 */
  function maskForPublic(src){
    var d;
    try{d=JSON.parse(JSON.stringify(src||{}))}catch(e){return {people:[],tasks:[]}}
    try{
      var s=JSON.stringify(d).replace(/([^\d])(1[3-9]\d)\d{4}(\d{4})(?!\d)/g,'$1$2****$3');
      d=JSON.parse(s);
    }catch(e){}
    maskPhones(d);
    return d;
  }

  load=function(){
    var has=false;
    try{has=!!localStorage.getItem(KEY)}catch(e){}
    if(has){_loadPrev();var m=String(location.hash||'').match(/v=([a-z]+)/);if(S&&S.ui&&m&&VIEWS.some(function(x){return x[0]===m[1]}))S.ui.view=m[1];}
    else {loadFrom(seed());}
  };
  save=function(){
    _savePrev();
    if(owner){state='dirty';paintStatus();clearTimeout(tmr);tmr=setTimeout(pushNow,700);}
    else {paintStatus();}
  };

  /* ---------------- 云端读写 ---------------- */
  async function pull(k){
    if(!cloud)return null;
    try{
      var r=await cloud.database.from(TBL).select('payload,updated_at,owner_id,owner_name').eq('key',k||RK).maybeSingle();
      if(r&&r.error)return null;
      return (r&&r.data)||null;
    }catch(e){return null}
  }

  async function pushNow(){
    if(!owner||!cloud)return;
    if(busy){pend=true;return}
    busy=true;pend=false;state='dirty';paintStatus();
    try{
      var nowIso=new Date().toISOString();
      var body={key:RK,payload:JSON.parse(JSON.stringify(S)),updated_at:nowIso,owner_name:mail()||rowOwnerName||null};
      var r=await cloud.database.from(TBL).upsert(body).select();
      if(r&&r.error){state='err';errMsg=String(r.error.message||r.error.code||'未知错误').slice(0,70);}
      else{
        var rows=(r&&Array.isArray(r.data))?r.data:[];
        if(rows.length){
          state='ok';lastAt=hm();
          /* 完整版落地后再刷一份脱敏公开版给不登录的人看；这份失败只影响分享，不影响你编辑 */
          try{await cloud.database.from(TBL).upsert({key:PK,payload:maskForPublic(S),updated_at:nowIso,owner_name:'public'})}catch(e2){}
        }
        else{state='deny';errMsg='这行数据不属于当前账号';}
      }
    }catch(e){state='err';errMsg=String((e&&e.message)||e).slice(0,70)}
    busy=false;paintStatus();
    if(pend)pushNow();
  }

  async function refreshFromCloud(){
    var row=null,tsIso='';
    if(signedIn){
      row=await pull(RK);
      hasRow=!!row;
      if(row){
        rowOwnerId=String(row.owner_id||'');rowOwnerName=String(row.owner_name||'');
        /* 归属判定以 owner_id 为准；老数据没有 owner_id 才退回比展示名 */
        foreign=rowOwnerId
          ? !!(uidOf()&&rowOwnerId!==uidOf())
          : !!(rowOwnerName&&mail()&&rowOwnerName.toLowerCase()!==mail().toLowerCase());
      }else{
        foreign=false;rowOwnerId='';rowOwnerName='';recalc();
        if(owner)await pushNow();      // 云端还没有数据：把种子写上去，占住这一行
      }
    }
    if(signedIn&&!foreign){
      /* 本人：完整数据，可编辑 */
      recalc();
      if(row&&row.payload){
        var keep=(S&&S.ui&&S.ui.view)||'';
        loadFrom(row.payload);
        if(S&&S.ui&&keep)S.ui.view=keep;
      }
      tsIso=(row&&row.updated_at)||'';
      state='ok';
    }else{
      /* 未登录 / 登录了但不是本人：只给脱敏公开版，纯只读 */
      var pub=await pull(PK);
      hasRow=hasRow||!!pub;
      recalc();
      if(pub&&pub.payload){
        var keep2=(S&&S.ui&&S.ui.view)||'';
        loadFrom(pub.payload);
        if(S&&S.ui&&keep2)S.ui.view=keep2;
      }
      tsIso=(pub&&pub.updated_at)||'';
      state='ro';
    }
    if(tsIso){
      var d=new Date(tsIso);
      if(!isNaN(d.getTime()))lastAt=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    }
    render();
  }

  function setSess(s){sess=s||null;signedIn=!!(sess&&sess.user);recalc();}
  function recalc(){owner=signedIn&&!foreign;paintAccount();}

  /* ---------------- 顶栏账号 ---------------- */
  function mountAccount(){
    var box=document.querySelector('.top-actions');
    if(!box)return;
    if(!$('accBtn')){
      var b=document.createElement('button');
      b.id='accBtn';b.type='button';b.className='tbtn';
      b.addEventListener('click',function(e){e.stopPropagation();if(owner)doSignOut();else if(signedIn)toast('当前账号只读：这个工作台已绑定其他账号');else openLogin(hasRow?'login':'activate');});
      box.insertBefore(b,box.firstChild);
      var p=document.createElement('button');
      p.id='pwdBtn';p.type='button';p.className='tbtn ghost';p.textContent='改密';
      p.addEventListener('click',function(e){e.stopPropagation();openPwd();});
      box.insertBefore(p,b.nextSibling);
    }
    paintAccount();
  }
  function paintAccount(){
    var b=$('accBtn');if(!b)return;
    var em=mail();
    if(owner)b.textContent='已登录 '+String(em||'').split('@')[0];
    else if(signedIn)b.textContent='只读（他人账号）';
    else b.textContent='登录';
    b.title=owner?'点击退出登录':'登录后可编辑';
    var p=$('pwdBtn');if(p)p.style.display=owner?'':'none';
  }

  /* ---------------- 状态条 ---------------- */
  function paintStatus(){
    var t=$('syncTip');if(!t)return;
    var map={init:'连接云端…',ro:'只读模式 · 登录后可编辑',dirty:'有改动，保存中…',
      ok:'已保存到云端'+(lastAt?' '+lastAt:''),err:'保存失败：'+errMsg,deny:'无写入权限：'+(errMsg||'账号不匹配'),off:'云端未连接 · 当前只读'};
    t.textContent=map[state]||map.init;
    t.classList.toggle('off',state==='ro'||state==='off'||state==='err'||state==='deny');
  }

  /* ---------------- 只读拦截样式 ---------------- */
  function css(){
    if($('cloudCss'))return;
    var hide=['newtask','savetask','savetask2','deltask','newperson','editperson','saveperson2','delperson',
      'neworg','editorg','delorg','newext','editext','delext','saveext','addgate','delgate','applygate','receipt',
      'data','importjson','restoredemo','cleardemo','wbadopt','wbadoptall','wbimport','wbbind','wbpaste','rollback'];
    var hideCss=hide.map(function(a){return 'body.ro [data-act="'+a+'"]'}).join(',');
    var s=document.createElement('style');s.id='cloudCss';
    s.textContent=hideCss+'{display:none!important}'+
      'body.ro .tcard{user-select:none}'+
      '.c-mask{position:fixed;inset:0;background:rgba(10,20,36,.5);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px}'+
      '.c-box{background:var(--panel,#fff);color:var(--ink,#1a2233);border:1px solid var(--line,#dbe3ef);border-radius:14px;width:100%;max-width:392px;padding:20px;box-shadow:0 24px 64px rgba(10,20,36,.28);font:13px/1.6 system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;max-height:92vh;overflow:auto}'+
      '.c-box h3{margin:0 0 3px;font-size:16px}'+
      '.c-box .c-sub{font-size:11.5px;color:var(--muted,#7b8798);margin-bottom:14px;line-height:1.6}'+
      '.c-tabs{display:flex;gap:6px;margin-bottom:12px}'+
      '.c-tab{flex:1;text-align:center;padding:7px 0;border-radius:8px;border:1px solid var(--line,#dbe3ef);cursor:pointer;font-size:12px;background:var(--panel2,#f4f7fb);color:var(--ink2,#42506a)}'+
      '.c-tab.on{background:var(--brand,#2563d9);border-color:var(--brand,#2563d9);color:#fff;font-weight:600}'+
      '.c-lab{display:block;font-size:11.5px;color:var(--muted,#7b8798);margin:9px 0 4px;font-weight:600}'+
      '.c-in{width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid var(--line,#dbe3ef);border-radius:8px;background:var(--panel2,#f4f7fb);color:var(--ink,#1a2233);font-size:13px;outline:none}'+
      '.c-in:focus{border-color:var(--brand,#2563d9)}'+
      '.c-row{display:flex;gap:8px;align-items:flex-end}.c-row>div{flex:1}'+
      '.c-btn{padding:9px 12px;border-radius:8px;border:1px solid var(--line,#dbe3ef);background:var(--panel2,#f4f7fb);cursor:pointer;font-size:12.5px;white-space:nowrap;color:var(--ink,#1a2233)}'+
      '.c-btn.pri{background:var(--brand,#2563d9);border-color:var(--brand,#2563d9);color:#fff;font-weight:600}'+
      '.c-btn:disabled{opacity:.55;cursor:default}'+
      '.c-full{width:100%;margin-top:13px;padding:10px;font-size:13px}'+
      '.c-msg{font-size:11.5px;margin-top:9px;min-height:16px;color:var(--danger,#c62f2f);line-height:1.5}'+
      '.c-msg.ok{color:#12905f}'+
      '.c-foot{margin-top:11px;font-size:11px;color:var(--muted,#7b8798);display:flex;justify-content:space-between;gap:8px}'+
      '.c-link{cursor:pointer;color:var(--brand,#2563d9);text-decoration:underline}'+
      '.c-bar{background:#b45309;color:#fff;font:12px/1.7 system-ui,-apple-system,sans-serif;text-align:center;padding:7px 12px;letter-spacing:.02em}'+
      '.c-bar b{font-weight:700}';
    document.head.appendChild(s);
  }

  /* ---------------- 登录框 ---------------- */
  function openLogin(mode){
    css();
    var old=$('cMask');if(old)old.remove();
    var m=document.createElement('div');m.id='cMask';m.className='c-mask';
    m.innerHTML='<div class="c-box" id="cBox"></div>';
    m.addEventListener('click',function(e){if(e.target===m)m.remove()});
    document.body.appendChild(m);
    drawBox(mode||'login');
  }
  function openPwd(){
    if(!owner){toast('请先登录');return}
    css();
    var old=$('cMask');if(old)old.remove();
    var m=document.createElement('div');m.id='cMask';m.className='c-mask';
    m.innerHTML='<div class="c-box" id="cBox"></div>';
    m.addEventListener('click',function(e){if(e.target===m)m.remove()});
    document.body.appendChild(m);
    drawBox('pwd');
  }
  function msg(t,ok){var e=$('cMsg');if(!e)return;e.textContent=t||'';e.className='c-msg'+(ok?' ok':'')}
  function btn(el,dis,txt){if(!el)return;el.disabled=!!dis;if(txt)el.textContent=txt}
  function friendly(e){
    if(!e)return '操作失败，请重试';
    var k=e.kind||e.code||'';
    if(k==='invalid_grant'||k==='unauthenticated')return '邮箱或密码不正确';
    if(k==='network'||k==='backend-unavailable')return '网络或服务暂时不可用，请稍后再试';
    return e.message||String(k)||'操作失败';
  }
  var okMail=function(v){return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)};

  function drawBox(mode){
    var box=$('cBox');if(!box)return;
    var tabs='<div class="c-tabs"><div class="c-tab '+(mode==='login'?'on':'')+'" data-m="login">登录</div>'+
      '<div class="c-tab '+(mode==='activate'?'on':'')+'" data-m="activate">首次激活</div></div>';

    if(mode==='login'){
      box.innerHTML='<h3>登录后可编辑</h3><div class="c-sub">不登录只能看，不能改。这份口令只给你自己。</div>'+tabs+
        '<label class="c-lab">邮箱</label><input class="c-in" id="cEmail" type="email" autocomplete="username" placeholder="你注册用的邮箱">'+
        '<label class="c-lab">密码</label><input class="c-in" id="cPwd" type="password" autocomplete="current-password" placeholder="••••••">'+
        '<div class="c-msg" id="cMsg"></div>'+
        '<button class="c-btn pri c-full" id="cGo" type="button">登录</button>'+
        '<div class="c-foot"><span class="c-link" id="cForgot">忘记密码？</span><span class="c-link" id="cClose">关闭</span></div>';
      bindTabs();
      $('cClose').onclick=function(){var m=$('cMask');if(m)m.remove()};
      $('cForgot').onclick=function(){drawBox('reset')};
      $('cPwd').addEventListener('keydown',function(e){if(e.key==='Enter')$('cGo').click()});
      $('cGo').onclick=async function(){
        var em=($('cEmail').value||'').trim().toLowerCase(),pw=$('cPwd').value||'';
        if(!okMail(em)){msg('请输入正确的邮箱地址');return}
        if(pw.length<6){msg('密码至少 6 位');return}
        btn($('cGo'),true,'登录中…');msg('');
        var r=await cloud.auth.signInWithPassword({email:em,password:pw});
        btn($('cGo'),false,'登录');
        if(r.error){msg(friendly(r.error));return}
        await afterSignIn(r.data);
      };
      return;
    }

    if(mode==='activate'){
      box.innerHTML='<h3>首次激活账号</h3><div class="c-sub">只有第一次用：验证邮箱 → 自己设一个密码。之后都用邮箱+密码登录。</div>'+tabs+
        '<label class="c-lab">邮箱</label><div class="c-row"><div><input class="c-in" id="cEmail" type="email" autocomplete="username" placeholder="你的邮箱，用来收验证码"></div>'+
        '<button class="c-btn" id="cSend" type="button">获取验证码</button></div>'+
        '<label class="c-lab">验证码（查邮箱）</label><input class="c-in" id="cCode" inputmode="numeric" autocomplete="one-time-code" placeholder="6 位数字">'+
        '<label class="c-lab">设置密码</label><input class="c-in" id="cPwd" type="password" autocomplete="new-password" placeholder="至少 6 位，自己记住">'+
        '<div class="c-msg" id="cMsg"></div>'+
        '<button class="c-btn pri c-full" id="cGo" type="button">创建并登录</button>'+
        '<div class="c-foot"><span>验证码由平台邮件发送，可能进垃圾箱</span><span class="c-link" id="cClose">关闭</span></div>';
      bindTabs();
      $('cClose').onclick=function(){var m=$('cMask');if(m)m.remove()};
      $('cSend').onclick=async function(){
        var em=($('cEmail').value||'').trim().toLowerCase();
        if(!okMail(em)){msg('请输入正确的邮箱地址');return}
        btn($('cSend'),true,'发送中…');msg('');
        try{
          var r=await cloud.auth.sendOtp({email:em});
          if(r.error){msg(friendly(r.error));btn($('cSend'),false,'重发');return}
          otpPending={email:em,verificationId:r.data.verificationId,isExistingUser:!!r.data.isExistingUser};
          msg('验证码已发到 '+em+'，5 分钟内有效'+(otpPending.isExistingUser?'（该邮箱已注册，可切到「登录」）':''),true);
          btn($('cSend'),false,'重发');
        }catch(e){msg(String(e&&e.message||e));btn($('cSend'),false,'重发')}
      };
      $('cGo').onclick=async function(){
        var em=($('cEmail').value||'').trim().toLowerCase(),code=($('cCode').value||'').trim(),pw=$('cPwd').value||'';
        if(!okMail(em)){msg('请输入正确的邮箱地址');return}
        if(!otpPending||otpPending.email!==em){msg('请先点「获取验证码」，用当前邮箱收码');return}
        if(!/^\d{4,8}$/.test(code)){msg('请输入邮件里的验证码');return}
        if(pw.length<6){msg('密码至少 6 位');return}
        btn($('cGo'),true,'处理中…');msg('');
        var r=await cloud.auth.verifyOtp({email:otpPending.email,verificationId:otpPending.verificationId,
          isExistingUser:otpPending.isExistingUser,token:code,password:otpPending.isExistingUser?undefined:pw});
        btn($('cGo'),false,'创建并登录');
        if(r.error){msg(friendly(r.error));return}
        otpPending=null;
        await afterSignIn(r.data);
      };
      return;
    }

    if(mode==='reset'){
      box.innerHTML='<h3>重设密码</h3><div class="c-sub">用邮箱验证码重设，重设后自动登录。</div>'+
        '<label class="c-lab">邮箱</label><div class="c-row"><div><input class="c-in" id="cEmail" type="email" placeholder="你注册用的邮箱"></div>'+
        '<button class="c-btn" id="cSend" type="button">发送验证码</button></div>'+
        '<label class="c-lab">验证码</label><input class="c-in" id="cCode" inputmode="numeric" placeholder="6 位数字">'+
        '<label class="c-lab">新密码</label><input class="c-in" id="cPwd" type="password" placeholder="至少 6 位">'+
        '<div class="c-msg" id="cMsg"></div>'+
        '<button class="c-btn pri c-full" id="cGo" type="button">重设并登录</button>'+
        '<div class="c-foot"><span class="c-link" id="cBack">返回登录</span><span class="c-link" id="cClose">关闭</span></div>';
      var ch=null;
      $('cClose').onclick=function(){var m=$('cMask');if(m)m.remove()};
      $('cBack').onclick=function(){drawBox('login')};
      $('cSend').onclick=async function(){
        var em=($('cEmail').value||'').trim().toLowerCase();
        if(!okMail(em)){msg('请输入正确的邮箱地址');return}
        btn($('cSend'),true,'发送中…');msg('');
        var r=await cloud.auth.resetPasswordForEmail(em);
        if(r.error){msg(friendly(r.error));btn($('cSend'),false,'重发');return}
        ch=r.data;msg('验证码已发到 '+em,true);btn($('cSend'),false,'重发');
      };
      $('cGo').onclick=async function(){
        var code=($('cCode').value||'').trim(),pw=$('cPwd').value||'';
        if(!ch){msg('请先发送验证码');return}
        if(!/^\d{4,8}$/.test(code)){msg('请输入邮件里的验证码');return}
        if(pw.length<6){msg('新密码至少 6 位');return}
        btn($('cGo'),true,'处理中…');msg('');
        var r=await ch.updateUser({nonce:code,password:pw});
        btn($('cGo'),false,'重设并登录');
        if(r.error){msg(friendly(r.error));return}
        await afterSignIn(r.data);
      };
      return;
    }

    if(mode==='pwd'){
      box.innerHTML='<h3>修改密码</h3><div class="c-sub">当前账号：'+esc(mail())+'</div>'+
        '<label class="c-lab">原密码</label><input class="c-in" id="cOld" type="password" autocomplete="current-password">'+
        '<label class="c-lab">新密码</label><input class="c-in" id="cNew" type="password" autocomplete="new-password" placeholder="至少 6 位">'+
        '<div class="c-msg" id="cMsg"></div>'+
        '<button class="c-btn pri c-full" id="cGo" type="button">保存新密码</button>'+
        '<div class="c-foot"><span></span><span class="c-link" id="cClose">关闭</span></div>';
      $('cClose').onclick=function(){var m=$('cMask');if(m)m.remove()};
      $('cGo').onclick=async function(){
        var o=$('cOld').value||'',n=$('cNew').value||'';
        if(!o){msg('请输入原密码');return}
        if(n.length<6){msg('新密码至少 6 位');return}
        btn($('cGo'),true,'保存中…');msg('');
        var r=await cloud.auth.resetPasswordForOld({oldPassword:o,newPassword:n});
        btn($('cGo'),false,'保存新密码');
        if(r.error){msg(friendly(r.error));return}
        msg('密码已更新',true);
        setTimeout(function(){var m=$('cMask');if(m)m.remove()},900);
      };
      return;
    }
  }
  function bindTabs(){
    var box=$('cBox');if(!box)return;
    Array.prototype.forEach.call(box.querySelectorAll('.c-tab'),function(t){
      t.onclick=function(){drawBox(t.getAttribute('data-m'))};
    });
  }

  async function afterSignIn(s){
    setSess(s);
    var m=$('cMask');if(m)m.remove();
    try{await refreshFromCloud()}catch(e){}
    applyMode();
    if(owner){state='ok';paintStatus();toast('已登录，现在改的东西会自动存到云端');}
    else{toast('这个工作台已绑定其他账号，你只能查看');}
  }

  async function doSignOut(){
    if(!confirm('退出后只能查看，不能编辑。确定退出？'))return;
    try{await cloud.auth.signOut()}catch(e){}
    setSess(null);foreign=false;recalc();
    applyMode();state='ro';paintStatus();
    /* 退出后立刻把内存里的完整数据换成脱敏版，别留在屏幕上 */
    try{await refreshFromCloud()}catch(e){}
    toast('已退出，当前为只读');
  }

  /* ---------------- 模式切换 ---------------- */
  function applyMode(){
    document.body.classList.toggle('ro',!owner);
    var bar=$('cBar');
    var txt=signedIn
      ? '当前账号只读 · 这个工作台已绑定其他账号'
      : (hasRow
        ? '<b>只读</b> · 点右上角「登录」后即可编辑 · 数据实时来自云端'
        : '<b>首次使用</b> · 点右上角「登录」→「首次激活」，验证邮箱后设一个密码就能改');
    if(!owner){
      if(!bar){
        bar=document.createElement('div');bar.id='cBar';bar.className='c-bar';
        document.body.insertBefore(bar,document.body.firstChild);
      }
      bar.innerHTML=txt;
    }else if(bar){bar.remove();}
    mountAccount();paintStatus();
  }

  var _renderPrev=render;
  render=function(){_renderPrev();paintStatus();};

  /* ---------------- 启动 ---------------- */
  async function boot(){
    css();mountAccount();
    if(!window.WorkBuddyCloud){state='off';paintStatus();applyMode();return}
    try{
      cloud=WorkBuddyCloud.createWorkBuddyCloud({endpoint:CFG.endpoint,oauthRelayBaseUrl:CFG.oauthRelayBaseUrl,publishableKey:CFG.publishableKey});
    }catch(e){state='off';errMsg=String(e&&e.message||e);paintStatus();applyMode();return}
    /* 白板镜像读取口：读作战台自己库里的 wb_mirror（同源，不受白板侧来源白名单限制） */
    window.__MIRROR__=async function(){
      const r=await cloud.database.from('wb_mirror').select('payload,synced_at,source').eq('key','main').maybeSingle();
      if(r&&r.error)throw new Error(r.error.message||r.error.code||'读取镜像失败');
      return (r&&r.data)||null;
    };
    try{
      var g=await cloud.auth.getSession();
      setSess(g&&g.data?g.data:null);
    }catch(e){setSess(null)}
    try{await refreshFromCloud()}catch(e){state='err';errMsg=String(e&&e.message||e).slice(0,70)}
    applyMode();
    /* 云端数据装载完之后再拉白板，否则刚同步进来的便签会被云端 payload 覆盖 */
    setTimeout(function(){
      try{if(window.__WB_SYNC__)window.__WB_SYNC__(true)}catch(e){}
    },400);
    try{
      cloud.auth.onAuthStateChange(function(ev,s){
        var was=signedIn;
        setSess(s||null);
        if(signedIn!==was){
          applyMode();
          /* 登录后要换成完整版、退出后要换回脱敏版，否则看到的一直是刚才那份 */
          refreshFromCloud().catch(function(){});
        } else paintAccount();
      });
    }catch(e){}
    if(location.hash==='#dump'){document.getElementById('view').innerHTML='<pre id="dumpBox">'+esc(JSON.stringify(S))+'</pre>'}
  }

  window.__CLOUD_API__={boot:boot,push:pushNow,pull:pull,state:function(){return state}};
  boot();
})();
/* ================= 云端版结束 ================= */
