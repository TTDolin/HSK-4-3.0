/* Khẩu ngữ HSK (3.0) · Tiếng Trung Dolin — thi thử + ôn luyện, chấm bằng nhận dạng giọng nói của trình duyệt */
(function(){
const D=window.KN_DATA,G=window.DOLIN;if(!D||!G)return;
const {$,esc,stopClip,beep}=G,L=G.L,LV=D.lv;
const playClip=(src,seg)=>{let t;return Promise.race([G.playClip(src,seg).then(r=>{clearTimeout(t);return r}),new Promise(r=>{t=setTimeout(()=>{r(false)},((seg?seg[1]-seg[0]:3)*1000)+6000)})])};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* ---------- lưu điểm ---------- */
const SK=G.KEY+'_kn';let ST={ex:{},pr:{}};
try{const r=JSON.parse(localStorage.getItem(SK)||'null');if(r&&typeof r==='object')ST=Object.assign(ST,r)}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(ST))}catch(e){}};
const best=(o,k,v)=>{const x=o[k]||(o[k]={best:0,n:0});x.n++;x.last=v;x.date=Date.now();if(v>x.best)x.best=v;save()};
let tok=0;const alive=m=>m===tok;const sleep=(ms,m)=>new Promise(r=>setTimeout(()=>r(m===undefined||m===tok),ms));
/* ---------- CSS ---------- */
document.head.appendChild($(`<style>
.kn-hero{background:linear-gradient(135deg,var(--brand),#7A2A13);color:#FFF6EE;border-radius:18px;padding:20px 22px;margin-bottom:16px}
.kn-hero h2{color:#FFF6EE;margin:0 0 4px}.kn-hero p{margin:4px 0;color:#FCE3C2}
.kn-hero .fmt{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.kn-hero .fmt span{background:rgba(255,240,220,.14);border:1px solid rgba(255,214,150,.35);border-radius:999px;padding:4px 12px;font-size:13px}
.kn-note{border-radius:12px;padding:10px 14px;margin:0 0 14px;font-size:14px;line-height:1.5}
.kn-note.ok{background:var(--okbg);color:var(--ok)}.kn-note.warn{background:var(--badbg);color:var(--bad)}
.kn-sec{margin:22px 0 10px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.kn-sec h3{margin:0;font-size:19px}.kn-sec small{color:var(--mute)}
.kn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.kn-card{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border-radius:14px;background:var(--card);border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:transform .15s,border-color .15s}
.kn-card:hover{transform:translateY(-2px);border-color:var(--brand)}
.kn-card b{font-size:16px}.kn-card small{color:var(--mute);line-height:1.4}.kn-card .zh{font-family:var(--han);color:var(--brand)}
.kn-card .ico{font-size:26px;line-height:1}.kn-card.off{border:2px solid var(--gold);background:linear-gradient(180deg,color-mix(in srgb,var(--gold) 14%,var(--card)),var(--card))}
.kn-badge{display:inline-block;font-size:12px;font-weight:700;border-radius:999px;padding:2px 9px;background:var(--line);color:var(--ink);align-self:flex-start}
.kn-badge.g{background:var(--okbg);color:var(--ok)}.kn-badge.r{background:var(--badbg);color:var(--bad)}
.kn-box{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;margin:12px 0}
.kn-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}.kn-top .sp{flex:1}
.kn-prog{height:6px;background:var(--line);border-radius:6px;overflow:hidden;margin:6px 0 14px}.kn-prog i{display:block;height:100%;background:var(--brand);transition:width .3s}
.kn-big{font-family:var(--han);font-size:clamp(34px,8vw,56px);text-align:center;color:var(--ink);margin:10px 0 2px}
.kn-py{text-align:center;color:var(--rose);font-style:italic;font-size:17px}
.kn-zh{font-family:var(--han);font-size:22px;line-height:1.7}
.kn-vi{color:var(--mute);font-size:15px;line-height:1.5}
.kn-q{font-family:var(--han);font-size:24px;line-height:1.6;text-align:center;margin:6px 0}
.kn-img{display:block;max-width:100%;max-height:340px;margin:8px auto;border-radius:12px;border:1px solid var(--line);background:#fff}
.kn-imgs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kn-imgs figure{margin:0;text-align:center}.kn-imgs img{width:100%;border-radius:10px;border:1px solid var(--line);background:#fff}
.kn-imgs figcaption{font-size:12.5px;color:var(--mute)}
@media (max-width:560px){.kn-imgs{grid-template-columns:1fr}}
.kn-rec{display:flex;flex-direction:column;align-items:center;gap:10px;margin:14px 0}
.kn-mic{position:relative;width:96px;height:96px;border-radius:50%;border:0;background:var(--brand);color:#fff;font-size:34px;cursor:pointer;box-shadow:0 6px 18px rgba(168,57,27,.35)}
.kn-mic svg{position:absolute;inset:-6px;width:108px;height:108px;transform:rotate(-90deg)}
.kn-mic.on{animation:knp 1.2s ease-in-out infinite}@keyframes knp{50%{box-shadow:0 0 0 12px rgba(168,57,27,.15)}}
.kn-mic:disabled{opacity:.5;cursor:default}
.kn-live{min-height:48px;width:100%;box-sizing:border-box;border:1px dashed var(--line);border-radius:12px;padding:10px 12px;font-family:var(--han);font-size:19px;color:var(--ink);background:color-mix(in srgb,var(--card) 70%,transparent)}
.kn-live:empty::before{content:attr(data-ph);color:var(--mute);font-family:var(--ui);font-size:14px}
.kn-time{font-variant-numeric:tabular-nums;font-weight:700;color:var(--brand);font-size:18px}
.kn-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.kn-res{border-radius:14px;padding:14px;margin-top:12px;background:var(--card);border:1px solid var(--line)}
.kn-score{display:inline-grid;place-items:center;width:64px;height:64px;border-radius:50%;font-weight:800;font-size:20px;color:#fff;background:var(--ok);flex:none}
.kn-score.mid{background:var(--gold)}.kn-score.low{background:var(--bad)}
.kn-diff{font-family:var(--han);font-size:22px;line-height:1.8}.kn-diff .h{color:var(--ok)}.kn-diff .m{color:var(--bad);text-decoration:underline wavy;text-underline-offset:5px}
.kn-said{font-family:var(--han);font-size:17px;color:var(--ink);background:var(--bg);border-radius:10px;padding:8px 10px;margin:6px 0}
.kn-met{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.kn-met span{font-size:13px;border-radius:999px;padding:3px 10px;background:var(--bg);border:1px solid var(--line)}
.kn-met .y{background:var(--okbg);border-color:transparent;color:var(--ok)}.kn-met .n{background:var(--badbg);border-color:transparent;color:var(--bad)}
.kn-sample{border-left:4px solid var(--gold);padding:8px 12px;margin-top:10px;background:color-mix(in srgb,var(--gold) 10%,var(--card));border-radius:0 10px 10px 0}
.kn-sample .kn-zh{font-size:19px}
.kn-hint{margin:8px 0;padding-left:20px}.kn-hint li{margin:3px 0}
.kn-words{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.kn-words span{font-family:var(--han);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:2px 8px}
.kn-opts{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}.kn-opts button{font-size:19px;padding:12px;font-style:italic}
.kn-opts button.y{background:var(--okbg);border-color:var(--ok);color:var(--ok)}.kn-opts button.n{background:var(--badbg);border-color:var(--bad);color:var(--bad)}
.kn-les{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
.kn-les a{display:block;text-align:center;padding:10px 6px;border-radius:12px;border:1px solid var(--line);background:var(--card);text-decoration:none;color:var(--ink);font-weight:600}
.kn-les a small{display:block;font-weight:400;color:var(--mute);font-size:12px}
.kn-list{display:flex;flex-direction:column;gap:8px}.kn-list a{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);text-decoration:none;color:var(--ink)}
.kn-list a .zh{font-family:var(--han);font-size:17px;flex:1}
.kn-part{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--brand);font-weight:800}
.kn-tot{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.kn-tot .kn-score{width:96px;height:96px;font-size:30px}
details.kn-d{border:1px solid var(--line);border-radius:12px;background:var(--card);margin:8px 0}details.kn-d>summary{cursor:pointer;padding:10px 14px;font-weight:600;display:flex;gap:10px;align-items:center}
details.kn-d>div{padding:0 14px 14px}
.kn-howto li{margin:4px 0;line-height:1.5}
audio.kn-au{width:100%;max-width:420px;height:36px;margin-top:6px}
</style>`));
/* ---------- pinyin + chấm ---------- */
const PY=D.py,NUM='零一二三四五六七八九';
function num2zh(s){if(s.length>4||(s[0]==='0'&&s.length>1))return[...s].map(d=>NUM[d]).join('');
  const u=['','十','百','千'],ds=[...s];let out='',z=false;
  ds.forEach((d,i)=>{const p=ds.length-1-i;if(d==='0'){z=true;return}if(z&&out)out+='零';z=false;out+=NUM[d]+u[p]});
  if(!out)out='零';if(out.startsWith('一十'))out=out.slice(1);return out}
const norm=t=>String(t||'').replace(/(\d+)[:：](\d+)/g,(m,a,b)=>a+'点'+(b==='00'?'':b+'分')).replace(/(\d+)%/g,'百分之$1').replace(/\d+/g,num2zh).replace(/(?<=[一-鿿])儿/g,'');
const pyOf=c=>c==='两'||c==='二'?['liang','er']:(PY[c]||c).split('|');
function syl(t){const a=[];for(const c of norm(t))if(/[一-鿿]/.test(c))a.push({c,p:pyOf(c)});return a}
const eq=(x,y)=>x.c===y.c||x.p.some(p=>y.p.includes(p));
function lcs(A,B){const n=A.length,m=B.length;if(!n||!m)return{n:0,hit:new Array(n).fill(false)};
  const T=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)T[i][j]=eq(A[i],B[j])?T[i+1][j+1]+1:Math.max(T[i+1][j],T[i][j+1]);
  const hit=new Array(n).fill(false);let i=0,j=0;while(i<n&&j<m){if(eq(A[i],B[j])){hit[i]=true;i++;j++}else if(T[i+1][j]>=T[i][j+1])i++;else j++}
  return{n:T[0][0],hit}}
function sim(target,said){const A=syl(target),B=syl(said);const r=lcs(A,B);
  const extra=Math.max(0,B.length-A.length-2);const sc=A.length?Math.max(0,(r.n-extra*0.5)/A.length):0;return{score:Math.round(Math.min(1,sc)*100),hit:r.hit,A,B}}
function diffHTML(target,hit){let k=0,h='';for(const c of norm(target)){if(/[一-鿿]/.test(c)){h+=`<span class="${hit[k]?'h':'m'}">${esc(c)}</span>`;k++}else h+=esc(c)}return h}
function kwHit(kw,B){const parts=kw.split(/……|…|\/|／|、/).map(s=>s.trim()).filter(Boolean);
  return parts.every(p=>{const A=syl(p);if(!A.length)return true;const w=A.length*2+1;
    for(let i=0;i<B.length;i++){if(!eq(A[0],B[i])&&!(A[1]&&eq(A[1],B[i])))continue;if(lcs(A,B.slice(i,i+w)).n>=Math.ceil(A.length*0.75))return true}return false})}
const CONN=['因为','所以','但是','可是','不过','而且','然后','首先','其次','最后','另外','虽然','如果','比如','总之','总的来说','一方面','另一方面','不但','于是','后来','接着','只要','只有','为了','除了','不管','即使','既然','与其','甚至','因此','同时','而是','还有','我觉得','我认为'];
const STOPC=new Set([...'的了吗呢吧你我他她们是在有和也都很就不这那个一什么怎么为请说一下样哪些会']);
function openScore(said,o){/* o:{target:chars,words:[],q:'',sample:''} */
  const B=syl(said),n=B.length,txt=norm(said);
  const len=Math.min(1,n/o.target);
  const conns=CONN.filter(c=>txt.includes(c));const cs=Math.min(1,conns.length/(o.target>100?(LV===3?3:5):1));
  const wl=(o.words||[]).map(w=>({w,ok:kwHit(w,B)}));const ws=wl.length?wl.filter(x=>x.ok).length/wl.length:1;
  const qc=[...new Set(syl(o.q||'').filter(x=>!STOPC.has(x.c)))];const rel=qc.length?Math.min(1,qc.filter(x=>B.some(y=>eq(x,y))).length/Math.max(1,Math.min(qc.length,4))):1;
  if(o.quick){const m=qc.filter(x=>B.some(y=>eq(x,y))).length;const r2=qc.length?Math.min(1,m/(qc.length*.5)):1;return{score:n?Math.round((len*.4+r2*.6)*100):0,n,conns,wl,len,rel:r2}}
  const sc=n?Math.round((len*.5+(cs*.2+ws*.2+rel*.1)*Math.min(1,len*2+.1))*100):0;
  return{score:sc,n,conns,wl,len,rel}}
const cls=s=>s>=80?'':s>=55?'mid':'low';
const badge=s=>`<span class="kn-score ${cls(s)}">${s}</span>`;
/* ---------- micro + nhận dạng ---------- */
const SRC_=()=>window.SpeechRecognition||window.webkitSpeechRecognition;let stream=null,srBlocked=false,curRec=null;
async function mic(){if(stream&&stream.active)return stream;stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});return stream}
function stopAll(){tok++;stopClip();if(curRec){try{curRec.stop()}catch(e){}curRec=null}}
function listen(ms,onText,onTick){/* trả {stop, done:Promise<{text,url,blob,dur}>} */
  let ended=false,finals='',interim='',sr=null,rec=null,chunks=[],t0=Date.now(),iv=null,resolve;const done=new Promise(r=>resolve=r);
  const st=stream;try{if(window.MediaRecorder&&st){rec=new MediaRecorder(st);rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};rec.start(250)}}catch(e){rec=null}
  const startSR=()=>{const SRC=SRC_();if(!SRC||ended||srBlocked)return;sr=new SRC();sr.lang='zh-CN';sr.continuous=true;sr.interimResults=true;sr.maxAlternatives=1;
    sr.onresult=e=>{interim='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)finals+=r[0].transcript;else interim+=r[0].transcript}onText&&onText(finals+interim)};
    sr.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'||e.error==='language-not-supported')srBlocked=true};
    sr.onend=()=>{if(interim){finals+=interim;interim=''}if(!ended)setTimeout(startSR,60);else if(sr._fin)sr._fin()};
    try{sr.start()}catch(e){}};
  startSR();
  iv=setInterval(()=>{const left=ms-(Date.now()-t0);onTick&&onTick(Math.max(0,left),ms);if(left<=0)stop()},200);
  async function stop(){if(ended)return;ended=true;clearInterval(iv);const dur=(Date.now()-t0)/1000;
    const srDone=sr?new Promise(r=>{sr._fin=r;setTimeout(r,1500);try{sr.stop()}catch(e){r()}}):Promise.resolve();
    const recDone=rec&&rec.state!=='inactive'?new Promise(r=>{rec.onstop=r;setTimeout(r,1500);try{rec.stop()}catch(e){r()}}):Promise.resolve();
    await Promise.all([srDone,recDone]);const text=(finals+interim).trim();
    let blob=null,url=null;if(chunks.length){blob=new Blob(chunks,{type:chunks[0].type||'audio/webm'});url=URL.createObjectURL(blob)}
    if(curRec===ctl)curRec=null;resolve({text,url,blob,dur})}
  const ctl={stop,done};curRec=ctl;return ctl}
const canASR=()=>!!SRC_()&&!srBlocked;
const RING=`<svg viewBox="0 0 108 108"><circle cx="54" cy="54" r="50" fill="none" stroke="rgba(168,57,27,.15)" stroke-width="5"/><circle class="arc" cx="54" cy="54" r="50" fill="none" stroke="#F2C46D" stroke-width="5" stroke-linecap="round" stroke-dasharray="314" stroke-dashoffset="0"/></svg>`;
/* widget ghi âm: trả Promise kết quả; auto=true thì bắt đầu ngay */
function recorder(host,ms,{auto=false,label='Bấm micro để nói',ph='Lời em nói sẽ hiện ở đây…'}={}){
  const w=$(`<div class="kn-rec"><button class="kn-mic" aria-label="Ghi âm">🎙${RING}</button><div class="kn-time">${fmt(ms)}</div>
    <div class="kn-live" data-ph="${esc(ph)}"></div><div class="kn-btns"><button class="btn kn-stop" hidden>Xong ✓</button></div><small class="kn-lab" style="color:var(--mute)">${esc(label)}</small></div>`);
  host.replaceChildren(w);const btn=w.querySelector('.kn-mic'),tm=w.querySelector('.kn-time'),live=w.querySelector('.kn-live'),sb=w.querySelector('.kn-stop'),arc=w.querySelector('.arc'),lab=w.querySelector('.kn-lab');
  if(!canASR())live.dataset.ph='Trình duyệt này không chấm tự động được – vẫn ghi âm để em nghe lại.';
  return new Promise(res=>{const go=async()=>{btn.disabled=true;try{await mic()}catch(e){lab.textContent='Không mở được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.';btn.disabled=false;return}
      beep();await sleep(250);btn.classList.add('on');sb.hidden=false;lab.textContent='Đang ghi âm… nói to, rõ ràng';
      const c=listen(ms,t=>{live.textContent=t},(left,all)=>{tm.textContent=fmt(left);arc.style.strokeDashoffset=String(314*(1-left/all))});
      sb.onclick=()=>c.stop();const r=await c.done;btn.classList.remove('on');sb.hidden=true;lab.textContent='Đã ghi xong';res(r)};
    btn.onclick=go;if(auto)go()})}
const fmt=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const auTag=r=>r&&r.url?`<audio class="kn-au" controls src="${r.url}"></audio> <a class="btn" style="font-size:13px;padding:4px 10px" href="${r.url}" download="khau-ngu-${Date.now()}.webm">Tải bản ghi</a>`:'';
const saidTag=r=>`<div class="kn-said">${r&&r.text?esc(r.text):'<i style="color:var(--mute)">(không nhận được lời nói – em nói to hơn hoặc dùng Chrome / Edge / Safari)</i>'}</div>`;
function playBtn(src,seg,label='🔊 Nghe mẫu'){const b=$(`<button class="btn">${label}</button>`);b.onclick=()=>playClip(src,seg);return b}
function countdown(host,ms,title){/* chờ chuẩn bị, có nút bỏ qua */const my=tok;
  const w=$(`<div class="kn-rec"><div class="kn-part">${esc(title)}</div><div class="kn-time" style="font-size:34px">${fmt(ms)}</div><button class="btn">Đã sẵn sàng – nói ngay</button></div>`);host.replaceChildren(w);
  return new Promise(res=>{const t0=Date.now();const iv=setInterval(()=>{if(!alive(my)){clearInterval(iv);res(false);return}const l=ms-(Date.now()-t0);w.querySelector('.kn-time').textContent=fmt(Math.max(0,l));if(l<=0){clearInterval(iv);res(true)}},250);
    w.querySelector('button').onclick=()=>{clearInterval(iv);res(true)}})}
/* ---------- dữ liệu dùng chung ---------- */
const EXS=D.exams,au=e=>(k)=>[e.au,e.idx[k]];
const lpad=n=>String(n).padStart(2,'0');const lsrc=n=>'audio/L'+lpad(n)+'.mp3';
const T3={rep:10000,pic:15000,prep:180000,ans:90000},T4={rep:40000,prep:180000,prep3:210000,ans:120000};
const TYPES=[
 {k:'tu',ico:'🀄',name:'Đọc từ vựng',zh:'词语朗读',d:'Nhìn từ, đọc to – máy nhận diện đúng/sai từng chữ.',src:'les'},
 {k:'thanh',ico:'🎵',name:'Luyện thanh điệu',zh:'声调练习',d:'Nghe từ, chọn pinyin đúng thanh điệu rồi đọc lại.',src:'les'},
 {k:'lap',ico:'🔁',name:'Nghe – nhắc lại',zh:'听后重复',d:'Nghe một câu, nhắc lại y hệt. Máy so từng âm tiết.',src:'les'},
 {k:'doc',ico:'📖',name:'Đọc to đoạn văn',zh:'朗读短文',d:'Đọc cả bài nghe của bài học, đo độ chính xác và tốc độ.',src:'les'},
 {k:'tranh',ico:'🖼️',name:LV===3?'Nhìn tranh nói câu':'Kể chuyện theo tranh',zh:'看图说话',d:LV===3?'Nhìn tranh, nói 1 câu trong 15 giây.':'Nhìn 3 tranh, kể một câu chuyện trong 2 phút.',src:'bank'},
 {k:'nhanh',ico:'⚡',name:'Trả lời nhanh',zh:'快速问答',d:'Nghe câu hỏi, trả lời thành câu trong '+(LV===3?'10':'15')+' giây.',src:'les'},
 {k:'cautruc',ico:'🧩',name:'Nói theo cấu trúc',zh:'句型表达',d:'Nhìn câu tiếng Việt, nói câu tiếng Trung dùng đúng cấu trúc.',src:LV===3?'les':'bank'},
 {k:'dich',ico:'🔄',name:'Dịch nói Việt → Trung',zh:'口头翻译',d:'Nhìn câu tiếng Việt, dịch miệng sang tiếng Trung.',src:'les'},
 {k:'ke',ico:'👂',name:'Nghe – kể lại',zh:'听后复述',d:'Nghe một đoạn, kể lại bằng lời của em. Máy kiểm tra các ý chính.',src:LV===4?'bank':'les'},
 {k:'chude',ico:'💬',name:'Nói theo chủ đề',zh:'话题表达',d:'Câu hỏi kiểu phần 3: có dàn ý, từ gợi ý, bài mẫu.',src:'bank'},
];
const TY=Object.fromEntries(TYPES.map(t=>[t.k,t]));
/* ---------- trang chính ---------- */
function hub(){
  const fm=LV===3?['Phần 1 · 听后重复 · 8 câu','Phần 2 · 看图说话 · 5 tranh','Phần 3 · 回答问题 · 2 câu','≈ 15 phút']:['Phần 1 · 听后复述 · 2 đoạn','Phần 2 · 看图说话 · 3 tranh','Phần 3 · 回答问题 · 2 câu','≈ 20 phút'];
  const v=$(`<div><div class="kn-hero"><h2>Khẩu ngữ HSK ${LV} (3.0) · 口语</h2><p>Thi thử đúng cấu trúc và thời gian như đề thật, máy tự chấm, có bài mẫu và ghi âm để nghe lại.</p>
    <div class="fmt">${fm.map(x=>`<span>${x}</span>`).join('')}</div></div><div id="sup"></div>
    <div class="kn-sec"><h3>📝 Thi thử khẩu ngữ</h3><small>1 đề mẫu chính thức + ${EXS.length-1} đề luyện</small></div><div class="kn-grid" id="ex"></div>
    <div class="kn-sec"><h3>🎯 Ôn luyện khẩu ngữ</h3><small>10 dạng bài, luyện theo bài học hoặc theo kho đề</small></div><div class="kn-grid" id="ty"></div>
    <details class="kn-d"><summary>ℹ️ Máy chấm như thế nào? Có chính xác không?</summary><div><ul class="kn-howto">
      <li><b>Nghe – nhắc lại, đọc to, dịch nói, đọc từ:</b> máy chuyển giọng nói thành chữ rồi so <b>từng âm tiết</b> với câu gốc → khá chính xác. Chữ xanh là em nói đúng, chữ đỏ là thiếu hoặc sai.</li>
      <li><b>Nhìn tranh, kể lại, trả lời câu hỏi, nói chủ đề:</b> máy chấm <b>ước tính</b> theo độ dài, ý chính / từ khoá, từ nối và mức độ đúng chủ đề. Máy <b>chưa</b> đánh giá được ngữ pháp và độ hay của nội dung – em hãy so với bài mẫu, hoặc tải bản ghi gửi giáo viên.</li>
      <li><b>Thanh điệu:</b> máy chỉ biết em nói ra chữ gì, nên nếu bị nhận sai chữ thường là do sai âm hoặc sai thanh. Dạng “Luyện thanh điệu” giúp luyện riêng phần này.</li>
      <li>Nên dùng <b>Chrome, Edge</b> (máy tính, Android) hoặc <b>Safari</b> (iPhone), có mạng, nói ở nơi yên tĩnh. Bản ghi chỉ nằm trên máy em, không gửi đi đâu ngoài dịch vụ nhận dạng giọng nói của trình duyệt.</li></ul></div></details></div>`);
  const sup=v.querySelector('#sup');
  sup.append(canASR()?$(`<div class="kn-note ok">✅ Trình duyệt hỗ trợ chấm tự động. <button class="btn" id="mt" style="margin-left:6px;font-size:13px;padding:3px 10px">Kiểm tra micro</button><span id="mtr"></span></div>`)
    :$(`<div class="kn-note warn">⚠️ Trình duyệt này chưa hỗ trợ nhận dạng giọng nói tiếng Trung, nên chỉ ghi âm được, không chấm tự động. Hãy mở bằng <b>Chrome / Edge</b> hoặc <b>Safari</b> trên iPhone.</div>`));
  const mt=sup.querySelector('#mt');if(mt)mt.onclick=async()=>{const box=$(`<div class="kn-box"><b>Kiểm tra micro:</b> bấm micro rồi nói “你好，我是越南人。”<div id="r"></div></div>`);sup.append(box);mt.disabled=true;
    const r=await recorder(box.querySelector('#r'),5000,{label:'Nói: 你好，我是越南人。'});const s=sim('你好，我是越南人。',r.text);
    box.append($(`<div class="kn-res">${saidTag(r)}${auTag(r)}<p>${r.text?(s.score>=70?'✅ Micro và nhận dạng hoạt động tốt!':'Máy đã nghe được, nhưng chưa khớp lắm – thử nói chậm và to hơn.'):'Chưa nghe được gì. Kiểm tra quyền micro của trình duyệt.'}</p></div>`));mt.disabled=false};
  const ex=v.querySelector('#ex');
  EXS.forEach(e=>{const b=ST.ex[e.id];ex.append($(`<a class="kn-card ${e.id==='off'?'off':''}" href="#khau-ngu/thi/${e.id}"><span class="ico">${e.id==='off'?'🏅':'🗒️'}</span><b>${esc(e.title)}</b>
    <small>${e.id==='off'?'HSK（'+(LV===3?'三':'四')+'级）口语 样卷':'Đúng cấu trúc đề thật'}</small>${b?`<span class="kn-badge ${b.best>=60?'g':'r'}">Cao nhất ${b.best}/100</span>`:'<span class="kn-badge">Chưa làm</span>'}</a>`))});
  const ty=v.querySelector('#ty');
  TYPES.forEach(t=>{const b=ST.pr[t.k];ty.append($(`<a class="kn-card" href="#khau-ngu/luyen/${t.k}"><span class="ico">${t.ico}</span><b>${esc(t.name)}</b><span class="zh">${t.zh}</span><small>${esc(t.d)}</small>${b?`<span class="kn-badge g">Đã luyện ${b.n} lần · ${b.best}%</span>`:''}</a>`))});
  return v}
/* ---------- chọn nội dung luyện ---------- */
function pick(t){
  const v=$(`<div><div class="kn-top"><a class="btn" href="#khau-ngu">← Khẩu ngữ</a></div><h2>${t.ico} ${esc(t.name)} <span class="han" style="color:var(--brand)">${t.zh}</span></h2><p class="sub">${esc(t.d)}</p><div id="c"></div></div>`);
  const c=v.querySelector('#c');
  if(t.src==='les'){c.append($(`<p><b>Chọn bài học:</b></p>`));const g=$(`<div class="kn-les"></div>`);
    L.forEach(l=>{const b=ST.pr[t.k+':'+l.n];g.append($(`<a href="#khau-ngu/luyen/${t.k}/${l.n}">Bài ${l.n}<small class="han">${esc(l.zh)}</small>${b?`<small>✓ ${b.best}%</small>`:''}</a>`))});
    c.append(g);c.append($(`<p style="margin-top:12px"><a class="btn" href="#khau-ngu/luyen/${t.k}/tron">🔀 Trộn ngẫu nhiên tất cả các bài</a></p>`));return v}
  const items=bank(t.k);c.append($(`<p><a class="btn" href="#khau-ngu/luyen/${t.k}/tron">🔀 Luyện ngẫu nhiên</a></p>`));
  const lst=$(`<div class="kn-list"></div>`);items.forEach((it,i)=>{lst.append($(`<a href="#khau-ngu/luyen/${t.k}/${i}"><span class="kn-badge">${i+1}</span><span class="zh">${esc(it.label)}</span><small>${esc(it.src||'')}</small></a>`))});c.append(lst);return v}
function bank(k){const out=[];
  if(k==='chude')EXS.forEach(e=>e.qa.forEach((q,j)=>out.push({label:q.q,src:e.title,e,q,j})));
  if(k==='tranh'){if(LV===3)EXS.forEach(e=>e.pics.forEach((p,j)=>out.push({label:p.vi,src:e.title,e,p,j})));else EXS.forEach(e=>out.push({label:e.story.cap.join(' → '),src:e.title,e,s:e.story}))}
  if(k==='ke')EXS.forEach(e=>e.rep.forEach((r,j)=>out.push({label:r.kw.slice(0,3).join(' · '),src:e.title,e,r,j})));
  if(k==='cautruc')D.struct.forEach((s,i)=>out.push({label:s.t+' — '+s.vi,src:'',s,i}));
  return out}
function lessonItems(k,n){const ls=n==='tron'?L:[L[n-1]].filter(Boolean);let out=[];
  ls.forEach(l=>{const N=l.n;
    if(k==='tu'||k==='thanh')l.words.forEach((w,i)=>out.push({l:N,w,seg:l.idx['w'+i]}));
    if(k==='lap')l.units.forEach((u,i)=>out.push({l:N,t:u,seg:l.idx['u'+i]}));
    if(k==='doc')out.push({l:N,t:l.sz.join(''),seg:l.idx.pf,title:l.zh});
    if(k==='nhanh')l.q.forEach((q,i)=>out.push({l:N,q:q[0],vi:q[1],seg:l.idx['q'+i]}));
    if(k==='dich')l.sz.forEach((s,i)=>out.push({l:N,zh:s,vi:l.sv[i],seg:l.idx['s'+i]}));
    if(k==='ke')out.push({l:N,t:l.sz.join(''),seg:l.idx.pf,kw:l.words.map(w=>w.h).filter(h=>h.length>=2&&l.sz.join('').includes(h)).slice(0,8)});
    if(k==='cautruc')D.struct.forEach((s,i)=>{if(s.n===N)out.push({s,i})})});
  if(k==='thanh')out=out.filter(x=>/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(x.w.p));
  if(n==='tron')out=shuffle(out).slice(0,k==='doc'||k==='ke'?3:15);else if(k!=='doc'&&k!=='ke'&&k!=='lap')out=shuffle(out);
  return out}
/* ---------- phiên luyện ---------- */
function practice(k,arg){const t=TY[k];if(!t)return hub();
  let items;if(t.src==='les'||(k==='ke'&&LV===3))items=lessonItems(k,arg);else{const b=bank(k);items=arg==='tron'?shuffle(b).slice(0,k==='chude'||k==='tranh'&&LV===4?3:10):[b[+arg]].filter(Boolean);
    if(k==='cautruc')items=items.map(x=>({s:x.s,i:x.i}))}
  if(k==='ke'&&LV===4&&arg!=='tron'&&!items.length)return pick(t);
  const key=k+(t.src==='les'&&arg!=='tron'?':'+arg:'');
  const v=$(`<div><div class="kn-top"><a class="btn" href="#khau-ngu/luyen/${k}">← ${esc(t.name)}</a><span class="sp"></span><span id="pg" style="color:var(--mute)"></span></div>
    <div class="kn-prog"><i id="pb" style="width:0"></i></div><div id="w"></div></div>`);
  const w=v.querySelector('#w'),pg=v.querySelector('#pg'),pb=v.querySelector('#pb');const scores=[];let i=0;
  if(!items.length){w.append($(`<p>Không có nội dung cho mục này.</p>`));return v}
  const next=()=>{stopAll();if(i>=items.length){finish();return}pg.textContent=`Câu ${i+1}/${items.length}`;pb.style.width=(i/items.length*100)+'%';
    const box=$(`<div class="kn-box"></div>`);w.replaceChildren(box);const it=items[i];
    H[k](box,it,sc=>{scores[i]=sc},()=>{i++;next()})};
  const finish=()=>{pb.style.width='100%';const ok=scores.filter(x=>x!=null);const avg=ok.length?Math.round(ok.reduce((a,b)=>a+b,0)/ok.length):0;best(ST.pr,k,avg);if(key!==k)best(ST.pr,key,avg);
    w.replaceChildren($(`<div class="kn-box" style="text-align:center"><div class="kn-tot" style="justify-content:center">${badge(avg)}<div style="text-align:left"><h3 style="margin:0">Hoàn thành!</h3><p class="kn-vi">Điểm trung bình ${ok.length} câu: <b>${avg}%</b>${avg>=80?' – Rất tốt! 太棒了！':avg>=55?' – Khá, luyện thêm nhé! 加油！':' – Cần luyện thêm. 加油！'}</p></div></div>
      <div class="kn-btns" style="margin-top:12px"><a class="btn" href="#khau-ngu/luyen/${k}">Chọn nội dung khác</a><button class="btn" id="ag">Luyện lại</button></div></div>`));
    w.querySelector('#ag').onclick=()=>{i=0;scores.length=0;next()}};
  next();return v}
const nextBtn=(fn,l='Câu tiếp →')=>{const b=$(`<button class="btn" style="background:var(--brand);color:#fff;border-color:var(--brand)">${l}</button>`);b.onclick=fn;return b};
function resBox(sc,html){return $(`<div class="kn-res"><div style="display:flex;gap:14px;align-items:flex-start">${sc==null?'':badge(sc)}<div style="flex:1;min-width:0">${html}</div></div></div>`)}
function metTags(o){let h=`<div class="kn-met"><span>${o.n} chữ</span>`;if(o.rate)h+=`<span>${o.rate} chữ/phút</span>`;
  (o.conns||[]).forEach(c=>h+=`<span class="y">${esc(c)}</span>`);(o.wl||[]).forEach(x=>h+=`<span class="${x.ok?'y':'n'}">${x.ok?'✓':'✗'} ${esc(x.w)}</span>`);return h+'</div>'}
const H={
 tu(box,it,setS,nx){const l=L[it.l-1];box.append($(`<div><div class="kn-big">${esc(it.w.h)}</div><div class="kn-py">${esc(it.w.p)}</div><p class="kn-vi" style="text-align:center">${esc(it.w.m)}${it.w.t?' · '+esc(it.w.t):''}</p></div>`));
   const bt=$(`<div class="kn-btns"></div>`);bt.append(playBtn(lsrc(it.l),it.seg));box.append(bt);const r=$(`<div></div>`);box.append(r);const out=$(`<div></div>`);box.append(out);
   const go=async()=>{const x=await recorder(r,4500,{label:'Bấm micro, đọc từ trên'});const s=canASR()?sim(it.w.h,x.text):{score:null,hit:[]};setS(s.score);
     out.replaceChildren(resBox(s.score,`<div class="kn-diff">${diffHTML(it.w.h,s.hit)}</div>${saidTag(x)}${auTag(x)}`));const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);
     const rt=$(`<button class="btn">Đọc lại</button>`);rt.onclick=go;b.append(rt,nextBtn(nx));out.append(b)};go()},
 thanh(box,it,setS,nx){const opts=shuffle([it.w.p,...toneVars(it.w.p,3)]);
   box.append($(`<div><p class="kn-vi" style="text-align:center">Nghe và chọn pinyin đúng thanh điệu</p><div class="kn-big">${esc(it.w.h)}</div></div>`));
   const bt=$(`<div class="kn-btns"></div>`);bt.append(playBtn(lsrc(it.l),it.seg,'🔊 Nghe lại'));box.append(bt);
   const og=$(`<div class="kn-opts"></div>`);box.append(og);const after=$(`<div></div>`);box.append(after);playClip(lsrc(it.l),it.seg);
   opts.forEach(o=>{const b=$(`<button class="btn">${esc(o)}</button>`);b.onclick=()=>{const ok=o===it.w.p;setS(ok?100:0);og.querySelectorAll('button').forEach(x=>{x.disabled=true;if(x.textContent===it.w.p)x.classList.add('y')});if(!ok)b.classList.add('n');
     after.replaceChildren($(`<p style="text-align:center">${ok?'✅ Đúng rồi!':'❌ Chưa đúng.'} <b>${esc(it.w.h)}</b> <i>${esc(it.w.p)}</i> – ${esc(it.w.m)}</p>`));playClip(lsrc(it.l),it.seg);
     const r=$(`<div></div>`);const b2=$(`<div class="kn-btns"></div>`);const say=$(`<button class="btn">🎙 Đọc lại từ này</button>`);
     say.onclick=async()=>{const x=await recorder(r,4500,{auto:true});const s=sim(it.w.h,x.text);r.append(resBox(canASR()?s.score:null,`<div class="kn-diff">${diffHTML(it.w.h,s.hit)}</div>${saidTag(x)}${auTag(x)}`))};
     b2.append(say,nextBtn(nx));after.append(b2,r)};og.append(b)})},
 lap(box,it,setS,nx){box.append($(`<p class="kn-vi" style="text-align:center">Nghe câu, sau tiếng bíp nhắc lại thật chính xác.</p>`));const bt=$(`<div class="kn-btns"></div>`);
   const show=$(`<button class="btn">👁 Hiện câu</button>`);const txt=$(`<div class="kn-q" hidden>${esc(it.t)}</div>`);show.onclick=()=>{txt.hidden=!txt.hidden};
   bt.append(playBtn(lsrc(it.l),it.seg,'🔊 Nghe lại'),show);box.append(bt,txt);const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);const ms=3500+syl(it.t).length*420;
   const go=async(first)=>{const my=tok;if(first){await playClip(lsrc(it.l),it.seg);if(!alive(my))return}const x=await recorder(r,ms,{auto:!!first});const s=sim(it.t,x.text);setS(canASR()?s.score:null);
     out.replaceChildren(resBox(canASR()?s.score:null,`<div class="kn-diff">${diffHTML(it.t,s.hit)}</div>${saidTag(x)}${auTag(x)}`));const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);
     const rt=$(`<button class="btn">Nhắc lại lần nữa</button>`);rt.onclick=()=>go(true);b.append(rt,nextBtn(nx));out.append(b)};go(true)},
 doc(box,it,setS,nx){box.append($(`<div><p class="kn-part">Bài ${it.l} · ${esc(it.title||'')}</p><div class="kn-zh">${esc(it.t)}</div></div>`));const bt=$(`<div class="kn-btns" style="margin-top:10px"></div>`);bt.append(playBtn(lsrc(it.l),it.seg,'🔊 Nghe giáo viên đọc'));box.append(bt);
   const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);const n=syl(it.t).length;const ms=Math.max(30000,n*450+8000);
   const go=async()=>{const x=await recorder(r,ms,{label:'Bấm micro rồi đọc to cả đoạn. Đọc xong bấm “Xong”.'});const s=sim(it.t,x.text);const rate=x.dur?Math.round(syl(x.text).length/x.dur*60):0;setS(canASR()?s.score:null);
     out.replaceChildren(resBox(canASR()?s.score:null,`<div class="kn-met"><span>Chính xác ${s.score}%</span><span>Tốc độ ${rate} chữ/phút</span><span>${Math.round(x.dur)} giây</span></div><div class="kn-diff" style="font-size:19px">${diffHTML(it.t,s.hit)}</div>${auTag(x)}`));
     const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);const rt=$(`<button class="btn">Đọc lại</button>`);rt.onclick=go;b.append(rt,nextBtn(nx));out.append(b)};go()},
 tranh(box,it,setS,nx){if(LV===4)return story(box,it.e,it.s,setS,nx,false);const p=it.p,A=au(it.e);
   box.append($(`<div><p class="kn-vi" style="text-align:center">Nhìn tranh, nói một câu hoàn chỉnh (15 giây)</p><img class="kn-img" src="${p.img}" alt=""></div>`));const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);
   const go=async()=>{const x=await recorder(r,T3.pic,{label:'Bấm micro rồi nói về bức tranh'});const B=syl(x.text);const wl=p.kw.map(w=>({w,ok:kwHit(w,B)}));
     const sc=canASR()?Math.round(((wl.filter(z=>z.ok).length/wl.length)*.6+Math.min(1,B.length/Math.max(6,syl(p.ans).length*.8))*.4)*100):null;setS(sc);
     out.replaceChildren(resBox(sc,`${saidTag(x)}${metTags({n:B.length,wl})}${auTag(x)}<div class="kn-sample"><b>Câu mẫu:</b> <span class="kn-zh">${esc(p.ans)}</span><div class="kn-vi"><i>${esc(p.py)}</i></div></div>`));
     const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);b.append(playBtn(...A('a'+it.j),'🔊 Nghe câu mẫu'));const rt=$(`<button class="btn">Nói lại</button>`);rt.onclick=go;b.append(rt,nextBtn(nx));out.append(b)};go()},
 nhanh(box,it,setS,nx){const tl=LV===3?10000:15000;box.append($(`<p class="kn-vi" style="text-align:center">Nghe câu hỏi rồi trả lời thành câu đầy đủ trong ${tl/1000} giây.</p>`));
   const txt=$(`<div hidden><div class="kn-q">${esc(it.q)}</div><p class="kn-vi" style="text-align:center">${esc(it.vi)}</p></div>`);const bt=$(`<div class="kn-btns"></div>`);const show=$(`<button class="btn">👁 Hiện câu hỏi</button>`);show.onclick=()=>{txt.hidden=!txt.hidden};
   bt.append(playBtn(lsrc(it.l),it.seg,'🔊 Nghe lại'),show);box.append(bt,txt);const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);
   const go=async()=>{const my=tok;await playClip(lsrc(it.l),it.seg);if(!alive(my))return;const x=await recorder(r,tl,{auto:true});const o=openScore(x.text,{target:LV===3?10:16,q:it.q,quick:1});setS(canASR()?o.score:null);txt.hidden=false;
     out.replaceChildren(resBox(canASR()?o.score:null,`${saidTag(x)}${metTags({n:o.n})}<p class="kn-vi">Máy kiểm tra: trả lời đủ dài, đúng chủ đề câu hỏi. Hãy tự kiểm tra ngữ pháp nhé.</p>${auTag(x)}`));
     const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);const rt=$(`<button class="btn">Trả lời lại</button>`);rt.onclick=go;b.append(rt,nextBtn(nx));out.append(b)};go()},
 cautruc(box,it,setS,nx){const s=it.s;box.append($(`<div><p class="kn-part">${esc(s.t)}${s.n?` · Bài ${s.n}`:''}</p>${s.f?`<p class="kn-vi">Công thức: <b>${esc(s.f)}</b></p>`:''}<p style="font-size:19px;font-weight:600">🇻🇳 ${esc(s.vi)}</p><p class="kn-vi">Nói câu này bằng tiếng Trung, dùng đúng cấu trúc.</p></div>`));
   const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);
   const go=async()=>{const x=await recorder(r,4000+syl(s.zh).length*550,{label:'Bấm micro rồi nói câu tiếng Trung'});const m=sim(s.zh,x.text);const B=syl(x.text);
     const parts=s.t.split(/……|…|\/|／|\s+/).map(z=>z.replace(/[“”"A-Za-z+VS]/g,'').trim()).filter(z=>/[一-鿿]/.test(z));const used=parts.length?parts.every(p=>kwHit(p,B)):true;
     const sc=canASR()?Math.round(m.score*(used?1:.8)):null;setS(sc);
     out.replaceChildren(resBox(sc,`${saidTag(x)}<div class="kn-met"><span>Giống câu mẫu ${m.score}%</span>${parts.length?`<span class="${used?'y':'n'}">${used?'✓ Đã dùng':'✗ Chưa dùng'} cấu trúc</span>`:''}</div>${auTag(x)}
       <div class="kn-sample"><b>Câu mẫu:</b> <span class="kn-diff">${diffHTML(s.zh,m.hit)}</span><div class="kn-vi"><i>${esc(s.py)}</i></div><small class="kn-vi">Câu của em có thể khác câu mẫu mà vẫn đúng.</small></div>`));
     const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);b.append(playBtn(D.sau,D.sidx['c'+it.i],'🔊 Nghe câu mẫu'));const rt=$(`<button class="btn">Nói lại</button>`);rt.onclick=go;b.append(rt,nextBtn(nx));out.append(b)};go()},
 dich(box,it,setS,nx){box.append($(`<div><p class="kn-part">Bài ${it.l} · Dịch miệng sang tiếng Trung</p><p style="font-size:20px;font-weight:600">🇻🇳 ${esc(it.vi)}</p></div>`));const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);
   const go=async()=>{const x=await recorder(r,5000+syl(it.zh).length*550,{label:'Bấm micro rồi nói câu tiếng Trung'});const m=sim(it.zh,x.text);setS(canASR()?m.score:null);
     out.replaceChildren(resBox(canASR()?m.score:null,`${saidTag(x)}${auTag(x)}<div class="kn-sample"><b>Đáp án:</b> <span class="kn-diff">${diffHTML(it.zh,m.hit)}</span><br><small class="kn-vi">Cách dịch khác vẫn có thể đúng – điểm chỉ so với đáp án.</small></div>`));
     const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);b.append(playBtn(lsrc(it.l),it.seg,'🔊 Nghe đáp án'));const rt=$(`<button class="btn">Nói lại</button>`);rt.onclick=go;b.append(rt,nextBtn(nx));out.append(b)};go()},
 ke(box,it,setS,nx){let src,seg,text,kw,ans=null,sam=null,ms;
   if(it.e){const A=au(it.e);[src,seg]=A('p'+it.j);text=it.r.t;kw=it.r.kw;ans=it.r.ans;sam=A('k'+it.j);ms=T4.rep}else{src=lsrc(it.l);seg=it.seg;text=it.t;kw=it.kw;ms=LV===3?45000:60000}
   box.append($(`<p class="kn-vi" style="text-align:center">Nghe đoạn văn (có thể nghe 1 lần như thi thật), sau đó kể lại bằng lời của em trong ${ms/1000} giây.</p>`));
   const bt=$(`<div class="kn-btns"></div>`);bt.append(playBtn(src,seg,'🔊 Nghe đoạn văn'));const st=$(`<button class="btn" style="background:var(--brand);color:#fff">🎙 Bắt đầu kể lại</button>`);bt.append(st);box.append(bt);
   const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);
   st.onclick=async()=>{stopClip();const x=await recorder(r,ms,{auto:true});const B=syl(x.text);const wl=kw.map(w=>({w,ok:kwHit(w,B)}));const cov=wl.length?wl.filter(z=>z.ok).length/wl.length:0;
     const tgt=ans?syl(ans).length*.8:Math.min(60,syl(text).length*.4);const sc=canASR()?Math.round((cov*.7+Math.min(1,B.length/tgt)*.3)*100):null;setS(sc);
     out.replaceChildren(resBox(sc,`${saidTag(x)}<p class="kn-vi" style="margin:4px 0">Ý chính / từ khoá em đã nói:</p>${metTags({n:B.length,wl})}${auTag(x)}
       <details class="kn-d"><summary>📄 Xem đoạn gốc${ans?' và bài kể lại mẫu':''}</summary><div><div class="kn-zh" style="font-size:18px">${esc(text)}</div>${ans?`<div class="kn-sample"><b>Kể lại mẫu:</b> <span class="kn-zh">${esc(ans)}</span></div>`:''}</div></details>`));
     const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);if(sam)b.append(playBtn(...sam,'🔊 Nghe kể lại mẫu'));const rt=$(`<button class="btn">Kể lại lần nữa</button>`);rt.onclick=st.onclick;b.append(rt,nextBtn(nx));out.append(b)}},
 chude(box,it,setS,nx){topic(box,it.e,it.q,it.j,setS,nx,false)},
};
function topic(box,e,q,j,setS,nx,exam){const A=au(e);const ms=LV===3?T3.ans:T4.ans;
  box.append($(`<div><div class="kn-q">${esc(q.q)}</div><p class="kn-vi" style="text-align:center">${esc(q.vi)}</p></div>`));
  const hint=$(`<details class="kn-d"><summary>🧭 Dàn ý gợi ý & từ nên dùng</summary><div><ol class="kn-hint">${q.hint.map(h=>`<li>${esc(h)}</li>`).join('')}</ol><div class="kn-words">${q.words.map(w=>`<span>${esc(w)}</span>`).join('')}</div></div></details>`);
  box.append(hint);const bt=$(`<div class="kn-btns"></div>`);bt.append(playBtn(...A('q'+j),'🔊 Nghe câu hỏi'));const prep=$(`<button class="btn">⏱ Chuẩn bị 1 phút</button>`);bt.append(prep);box.append(bt);
  const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);
  prep.onclick=async()=>{prep.disabled=true;await countdown(r,60000,'Chuẩn bị');prep.disabled=false;go(true)};
  const go=async(auto)=>{const x=await recorder(r,ms,{auto,label:`Bấm micro, nói ${ms/60000} phút. Nói xong bấm “Xong”.`});const o=openScore(x.text,{target:LV===3?150:230,words:q.words,q:q.q});o.rate=x.dur?Math.round(o.n/x.dur*60):0;setS(canASR()?o.score:null);
    out.replaceChildren(resBox(canASR()?o.score:null,`${saidTag(x)}${metTags(o)}<p class="kn-vi">Điểm ước tính theo độ dài (${o.n}/${LV===3?150:230} chữ), từ nối, từ gợi ý và mức độ đúng chủ đề.</p>${auTag(x)}
      <div class="kn-sample"><b>Bài mẫu:</b><div class="kn-zh">${esc(q.ans)}</div></div>`));
    const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);b.append(playBtn(...A('s'+j),'🔊 Nghe bài mẫu'));const rt=$(`<button class="btn">Nói lại</button>`);rt.onclick=()=>go(false);b.append(rt,nextBtn(nx));out.append(b)};
  go(false)}
function story(box,e,s,setS,nx){const A=au(e);
  box.append($(`<div><p class="kn-vi" style="text-align:center">Nhìn 3 tranh, kể một câu chuyện hoàn chỉnh (2 phút).</p><div class="kn-imgs">${s.imgs.map((m,i)=>`<figure><img src="${m}" alt=""><figcaption>${i+1}. ${esc(s.cap[i])}</figcaption></figure>`).join('')}</div>
    <div class="kn-words" style="margin-top:8px">${s.words.map(w=>`<span>${esc(w)}</span>`).join('')}</div></div>`));
  const bt=$(`<div class="kn-btns"></div>`);const prep=$(`<button class="btn">⏱ Chuẩn bị 1 phút</button>`);bt.append(prep);box.append(bt);const r=$(`<div></div>`),out=$(`<div></div>`);box.append(r,out);
  prep.onclick=async()=>{prep.disabled=true;await countdown(r,60000,'Chuẩn bị');prep.disabled=false;go(true)};
  const go=async(auto)=>{const x=await recorder(r,T4.ans,{auto,label:'Bấm micro, kể chuyện 2 phút. Kể xong bấm “Xong”.'});const o=openScore(x.text,{target:230,words:s.words,q:s.ans.slice(0,40)});o.rate=x.dur?Math.round(o.n/x.dur*60):0;setS(canASR()?o.score:null);
    out.replaceChildren(resBox(canASR()?o.score:null,`${saidTag(x)}${metTags(o)}${auTag(x)}<div class="kn-sample"><b>Bài mẫu:</b><div class="kn-zh">${esc(s.ans)}</div></div>`));
    const b=$(`<div class="kn-btns" style="margin-top:10px"></div>`);b.append(playBtn(...A('st'),'🔊 Nghe bài mẫu'));const rt=$(`<button class="btn">Kể lại</button>`);rt.onclick=()=>go(false);b.append(rt,nextBtn(nx));out.append(b)};go(false)}
/* biến thể thanh điệu */
const TM={a:'āáǎà',e:'ēéěè',i:'īíǐì',o:'ōóǒò',u:'ūúǔù',v:'ǖǘǚǜ'};const RV={};Object.entries(TM).forEach(([b,s])=>[...s].forEach((c,t)=>RV[c]=[b,t]));
function toneVars(p,n){const pos=[];[...p].forEach((c,i)=>{if(RV[c])pos.push(i)});const out=new Set();let g=0;
  while(out.size<n&&g++<60){const a=[...p];let ch=false;pos.forEach(i=>{if(Math.random()<.6||pos.length===1){const [b,t]=RV[a[i]];let nt=Math.floor(Math.random()*4);if(nt===t)nt=(t+1+Math.floor(Math.random()*3))%4;a[i]=TM[b][nt];ch=true}});const s=a.join('');if(ch&&s!==p)out.add(s)}
  return[...out]}
/* ---------- thi thử ---------- */
function exam(id){const e=EXS.find(x=>x.id===id);if(!e)return hub();const A=au(e);
  const v=$(`<div><div class="kn-top"><a class="btn" href="#khau-ngu">← Khẩu ngữ</a><span class="sp"></span><b id="ph"></b></div><div class="kn-prog"><i id="pb" style="width:0"></i></div><div id="w"></div></div>`);
  const w=v.querySelector('#w'),ph=v.querySelector('#ph'),pb=v.querySelector('#pb');
  const plan=LV===3?[...e.rep.map((x,k)=>({p:1,k})),...e.pics.map((x,k)=>({p:2,k})),...e.qa.map((x,k)=>({p:3,k}))]:[...e.rep.map((x,k)=>({p:1,k})),{p:2,k:0},...e.qa.map((x,k)=>({p:3,k}))];
  const res=[];
  w.append($(`<div class="kn-box"><h2 style="margin-top:0">${esc(e.title)} · HSK ${LV} 口语</h2>
    <ul class="kn-howto">${LV===3?`<li><b>Phần 1 – 听后重复 (8 câu):</b> nghe mỗi câu 1 lần, sau tiếng bíp nhắc lại trong 10 giây.</li><li><b>Phần 2 – 看图说话 (5 tranh):</b> mỗi tranh nói 1 câu trong 15 giây.</li><li><b>Phần 3 – 回答问题 (2 câu):</b> chuẩn bị 3 phút, trả lời 1,5 phút.</li>`
      :`<li><b>Phần 1 – 听后复述 (2 đoạn):</b> nghe mỗi đoạn 1 lần, sau tiếng bíp kể lại trong 40 giây.</li><li><b>Phần 2 – 看图说话:</b> nhìn 3 tranh, chuẩn bị 3 phút, kể chuyện 2 phút.</li><li><b>Phần 3 – 回答问题 (2 câu):</b> chuẩn bị 3,5 phút, trả lời 2 phút.</li>`}
      <li>Có thể bấm <b>“Đã sẵn sàng”</b> để bỏ qua thời gian chuẩn bị, bấm <b>“Xong ✓”</b> khi nói xong. Đeo tai nghe sẽ ghi âm rõ hơn.</li></ul>
    ${canASR()?'':'<div class="kn-note warn">Trình duyệt này không chấm tự động được – em vẫn làm bài và nghe lại bản ghi.</div>'}<div class="kn-btns"><button class="btn" id="go" style="background:var(--brand);color:#fff;font-size:18px;padding:12px 26px">Bắt đầu thi</button></div></div>`));
  w.querySelector('#go').onclick=async()=>{try{await mic()}catch(err){alert('Cần cho phép dùng micro để làm bài thi khẩu ngữ.');return}run()};
  async function run(){const my=tok;let lastP=0;
    for(let i=0;i<plan.length;i++){if(!alive(my))return;const s=plan[i];pb.style.width=(i/plan.length*100)+'%';
      const box=$(`<div class="kn-box"></div>`);w.replaceChildren(box);const ttl=['','第一部分','第二部分','第三部分'][s.p];
      if(s.p!==lastP){lastP=s.p;ph.textContent=ttl;box.append($(`<div class="kn-rec"><div class="kn-part">${ttl}</div><p class="kn-vi">${esc(['','Nghe và nhắc lại / kể lại','Nhìn tranh nói','Trả lời câu hỏi'][s.p])}</p></div>`));await playClip(...A('i'+(s.p-1)));if(!alive(my))return;await sleep(400,my);box.replaceChildren()}
      const no=i+1;const hd=$(`<p class="kn-part">${ttl} · 第${no}题</p>`);box.append(hd);const area=$(`<div></div>`);const rr=$(`<div></div>`);box.append(area,rr);let r;
      if(s.p===1){area.append($(`<div class="kn-rec"><div style="font-size:44px">🎧</div><p class="kn-vi">Đang phát… hãy nghe kỹ</p></div>`));await playClip(...A((LV===3?'r':'p')+s.k));if(!alive(my))return;area.replaceChildren();
        r=await recorder(rr,LV===3?T3.rep:T4.rep,{auto:true,label:LV===3?'Nhắc lại câu vừa nghe':'Kể lại đoạn vừa nghe'})}
      else if(s.p===2&&LV===3){area.append($(`<img class="kn-img" src="${e.pics[s.k].img}" alt="">`));await sleep(1500,my);if(!alive(my))return;r=await recorder(rr,T3.pic,{auto:true,label:'Nói một câu về bức tranh'})}
      else if(s.p===2){area.append($(`<div class="kn-imgs">${e.story.imgs.map((m,j)=>`<figure><img src="${m}" alt=""><figcaption>${j+1}</figcaption></figure>`).join('')}</div>`));
        if(!await countdown(rr,T4.prep,'Thời gian chuẩn bị'))return;r=await recorder(rr,T4.ans,{auto:true,label:'Kể câu chuyện theo 3 tranh'})}
      else{const q=e.qa[s.k];area.append($(`<div class="kn-q">${esc(q.q)}</div>`));await playClip(...A('q'+s.k));if(!alive(my))return;
        if(!await countdown(rr,LV===3?T3.prep:T4.prep3,'Thời gian chuẩn bị'))return;r=await recorder(rr,LV===3?T3.ans:T4.ans,{auto:true,label:'Trả lời câu hỏi'})}
      if(!alive(my))return;res[i]=r;await sleep(500,my)}
    pb.style.width='100%';ph.textContent='Kết quả';report()}
  function report(){const items=plan.map((s,i)=>grade(e,s,res[i]||{text:''}));
    const W=LV===3?{1:40,2:30,3:30}:{1:30,2:30,3:40};const parts={1:[],2:[],3:[]};items.forEach(x=>parts[x.p].push(x.score));
    const ps={};let tot=0;[1,2,3].forEach(p=>{const a=parts[p];ps[p]=a.length?Math.round(a.reduce((s,x)=>s+x,0)/a.length*W[p]/100):0;tot+=ps[p]});
    if(canASR())best(ST.ex,e.id,tot);
    const v2=$(`<div><div class="kn-box"><div class="kn-tot">${badge(tot)}<div><h2 style="margin:0">Tổng điểm ước tính: ${tot}/100</h2><p class="kn-vi">${tot>=60?'Đạt mức qua bài (≥ 60). 很好！':'Chưa đạt 60 điểm – luyện thêm các dạng ở mục Ôn luyện nhé. 加油！'}</p>
      <div class="kn-met">${[1,2,3].map(p=>`<span>Phần ${p}: ${ps[p]}/${W[p]}</span>`).join('')}</div></div></div>
      <p class="kn-vi" style="margin-bottom:0">Phần 1 chấm theo độ khớp âm tiết. Phần 2, 3 là điểm ước tính của máy (độ dài, ý chính, từ nối, đúng chủ đề) – hãy nghe lại bản ghi và so với bài mẫu.</p>
      <div class="kn-btns" style="margin-top:12px"><a class="btn" href="#khau-ngu">Về trang Khẩu ngữ</a><button class="btn" id="again">Làm lại đề này</button></div></div><div id="det"></div></div>`);
    const det=v2.querySelector('#det');
    items.forEach((x,i)=>{const d=$(`<details class="kn-d" ${i===0?'open':''}><summary>${badge(x.score).replace('kn-score','kn-score" style="width:40px;height:40px;font-size:14px')}<span>${['','Phần 1','Phần 2','Phần 3'][x.p]} · 第${i+1}题</span></summary><div>${x.html}</div></details>`);
      if(x.sam){const b=$(`<div class="kn-btns" style="justify-content:flex-start;margin-top:8px"></div>`);x.sam.forEach(([l,k])=>b.append(playBtn(...A(k),l)));d.lastElementChild.append(b)}det.append(d)});
    v2.querySelector('#again').onclick=()=>{location.hash='#khau-ngu';setTimeout(()=>location.hash='#khau-ngu/thi/'+e.id,30)};w.replaceChildren(v2)}
  return v}
function grade(e,s,r){const said=saidTag(r)+auTag(r);
  if(s.p===1&&LV===3){const t=e.rep[s.k].t;const m=sim(t,r.text);return{p:1,score:m.score,html:`<div class="kn-diff">${diffHTML(t,m.hit)}</div><div class="kn-vi"><i>${esc(e.rep[s.k].py||'')}</i></div>${said}`,sam:[['🔊 Nghe lại câu gốc','r'+s.k]]}}
  if(s.p===1){const R=e.rep[s.k];const B=syl(r.text);const wl=R.kw.map(w=>({w,ok:kwHit(w,B)}));const cov=wl.filter(z=>z.ok).length/wl.length;const sc=B.length?Math.round((cov*.7+Math.min(1,B.length/(syl(R.ans).length*.8))*.3)*100):0;
    return{p:1,score:sc,html:`${said}${metTags({n:B.length,wl})}<details class="kn-d"><summary>Đoạn gốc</summary><div class="kn-zh" style="font-size:18px">${esc(R.t)}</div></details><div class="kn-sample"><b>Kể lại mẫu:</b> <span class="kn-zh">${esc(R.ans)}</span></div>`,sam:[['🔊 Nghe đoạn gốc','p'+s.k],['🔊 Nghe kể lại mẫu','k'+s.k]]}}
  if(s.p===2&&LV===3){const p=e.pics[s.k];const B=syl(r.text);const wl=p.kw.map(w=>({w,ok:kwHit(w,B)}));const sc=B.length?Math.round(((wl.filter(z=>z.ok).length/wl.length)*.6+Math.min(1,B.length/Math.max(6,syl(p.ans).length*.8))*.4)*100):0;
    return{p:2,score:sc,html:`<img class="kn-img" style="max-height:200px" src="${p.img}" alt="">${said}${metTags({n:B.length,wl})}<div class="kn-sample"><b>Câu mẫu:</b> <span class="kn-zh">${esc(p.ans)}</span><div class="kn-vi"><i>${esc(p.py)}</i></div></div>`,sam:[['🔊 Nghe câu mẫu','a'+s.k]]}}
  if(s.p===2){const st=e.story;const o=openScore(r.text,{target:230,words:st.words,q:''});
    return{p:2,score:o.score,html:`<div class="kn-imgs">${st.imgs.map(m=>`<img src="${m}" alt="">`).join('')}</div>${said}${metTags(o)}<div class="kn-sample"><b>Bài mẫu:</b><div class="kn-zh">${esc(st.ans)}</div></div>`,sam:[['🔊 Nghe bài mẫu','st']]}}
  const q=e.qa[s.k];const o=openScore(r.text,{target:LV===3?150:230,words:q.words,q:q.q});
  return{p:3,score:o.score,html:`<div class="kn-q" style="font-size:20px">${esc(q.q)}</div>${said}${metTags(o)}<details class="kn-d"><summary>Dàn ý gợi ý</summary><div><ol class="kn-hint">${q.hint.map(h=>`<li>${esc(h)}</li>`).join('')}</ol></div></details><div class="kn-sample"><b>Bài mẫu:</b><div class="kn-zh">${esc(q.ans)}</div></div>`,sam:[['🔊 Nghe bài mẫu','s'+s.k]]}}
/* ---------- router ---------- */
function view(h){stopAll();const p=h.split('/');
  if(p[1]==='thi')return exam(p[2]);
  if(p[1]==='luyen'&&TY[p[2]])return p[3]!==undefined?practice(p[2],p[3]==='tron'?'tron':(TY[p[2]].src==='les'||(p[2]==='ke'&&LV===3)?+p[3]:p[3])):pick(TY[p[2]]);
  return hub()}
window.KN={view,stop:stopAll,_t:{sim,syl,kwHit,openScore,norm,toneVars}};
if(location.hash.startsWith('#khau-ngu'))window.dispatchEvent(new HashChangeEvent('hashchange'));
})();
