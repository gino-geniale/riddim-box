/* ================= Riddim Box: Sequencer und Oberfläche ================= */
(function(){
"use strict";
const {Engine,KITS,SLOTS,keyInfo,FX_TYPES}=RB;
// Für die Webseite: shareBase auf die Seiten-URL setzen, z. B. "https://www.planet-sparked.com/riddim"
// shareBase: Adresse, an die geteilte Beats angehängt werden. Läuft die Box als eigene Seite (nicht eingebettet), wird automatisch die eigene Adresse verwendet.
const CONFIG={shareBase:(()=>{try{return window.top===window?location.href.split("#")[0]:null;}catch(e){return null;}})(),ctaUrl:"https://www.planet-sparked.com",storeKey:"riddimbox-v1"};
const PROB=[1,.75,.5,.25];
const $=id=>document.getElementById(id);

/* ---------- Texte (pro = englische Fachbegriffe, easy = erklärend) ---------- */
const T={
  views:{sound:{pro:"sound",easy:"klang"},mix:{pro:"mix",easy:"mischen"},master:{pro:"master",easy:"gesamt"}},
  modes:{drums:{pro:"drums",easy:"schlagzeug"},bass:{pro:"bass",easy:"bass"},skank:{pro:"skank",easy:"akkorde"},fx:{pro:"fx",easy:"effekte"}},
  fxHold:{pro:"fx · hold to play",easy:"effekte · halten zum spielen"},
  slot:{kick:{pro:"kick",easy:"bassdrum"},snare:{pro:"snare",easy:"snare"},rim:{pro:"rim",easy:"klick"},hat:{pro:"hat",easy:"becken"},
        perc:{pro:"perc",easy:"trommel"},bass:{pro:"bass",easy:"bass"},skank:{pro:"skank",easy:"akkord"},siren:{pro:"fx",easy:"effekt"}},
  fxNames:{siren:{pro:"siren",easy:"sirene"},horn:{pro:"air horn",easy:"tröte"},laser:{pro:"laser",easy:"laser"},bomb:{pro:"dub bomb",easy:"bombe"},spring:{pro:"spring",easy:"feder"},riser:{pro:"riser",easy:"aufbau"},rewind:{pro:"rewind",easy:"zurückspulen"},whistle:{pro:"whistle",easy:"pfeife"}},
  minor:{pro:"minor",easy:"moll"},major:{pro:"major",easy:"dur"},keyT:{pro:"key",easy:"tonart"},fxT:{pro:"fx sound",easy:"effekt-klang"},
  pads:{pro:"pads",easy:"tasten"},padsMix:{pro:"tap = mute",easy:"antippen = stumm"},notes:{pro:"notes",easy:"töne"},chords:{pro:"chords",easy:"akkorde"},
  kit:{pro:"kit",easy:"klangwelt"},steps:{pro:"sequence",easy:"rhythmus"},pats:{pro:"pattern",easy:"teile"},fx:{pro:"fx · hold",easy:"effekte · gedrückt halten"},
  page:[{pro:"1–16",easy:"takt 1"},{pro:"17–32",easy:"takt 2"}],len:{16:{pro:"16",easy:"1 takt"},32:{pro:"32",easy:"2 takte"}},copy:{pro:"copy",easy:"kopieren"},
  fxk:{echo:{pro:"echo",easy:"echo"},hall:{pro:"hall",easy:"hall"},filter:{pro:"filter",easy:"dumpf"},stutter:{pro:"stutter",easy:"stottern"}},
  rec:{pro:"rec",easy:"aufnahme"},tap:{pro:"tap",easy:"tempo tippen"},play:{pro:"play",easy:"start"},stop:{pro:"stop",easy:"stopp"},
  demo:{pro:"demo",easy:"beispiel"},clear:{pro:"clear",easy:"löschen"},undo:{pro:"undo",easy:"zurück"},share:{pro:"share",easy:"teilen"},
  sl:{pitch:{pro:"pitch",easy:"tonhöhe"},decay:{pro:"decay",easy:"länge"},tone:{pro:"tone",easy:"dunkel ↔ hell"},echo:{pro:"echo send",easy:"echo"},
      bpm:{pro:"tempo",easy:"tempo"},swing:{pro:"swing",easy:"groove"},drive:{pro:"drive",easy:"wärme"},tape:{pro:"tape",easy:"band"},low:{pro:"low end",easy:"tiefe"},room:{pro:"reverb",easy:"raum"}},
  ed:{step:{pro:"step",easy:"schritt"},acc:{pro:"accent",easy:"betont"},strike:{pro:"strike",easy:"anschlag"},normal:{pro:"normal",easy:"normal"},double:{pro:"double",easy:"doppelt"},
      late:{pro:"late",easy:"versetzt"},strum:{pro:"strum",easy:"gestrummt"},thr:{pro:"echo throw",easy:"echo-wurf"},fx:{pro:"sound",easy:"klang"},close:{pro:"close",easy:"schließen"},len:{pro:"length",easy:"länge"},slide:{pro:"slide",easy:"gleiten"},
      del:{pro:"delete",easy:"entfernen"},done:{pro:"done",easy:"fertig"},on:{pro:"on",easy:"an"},off:{pro:"off",easy:"aus"}},
  hint:{pro:"let's spark some riddims.",easy:"tippen, hören, spielen."},
  toast:{copied:{pro:"link copied",easy:"link kopiert"},hash:{pro:"link updated · copy it from the address bar",easy:"link in der adresszeile aktualisiert"},
    shared:{pro:"shared beat loaded · press play",easy:"geteilter beat geladen · drück start"},trackClr:{pro:"track cleared · hold = whole pattern",easy:"spur gelöscht · halten = alles"},
    patClr:{pro:"pattern cleared",easy:"teil gelöscht"},undo:{pro:"undone",easy:"rückgängig"},nothing:{pro:"nothing to undo",easy:"nichts rückgängig zu machen"},
    demo:{pro:"demo loaded",easy:"beispiel geladen"},tempo:{pro:"tap · drag ↕ or −/+",easy:"ziehen ↕ oder −/+"},copyTo:{pro:"tap target pattern",easy:"ziel antippen"},recOn:{pro:"rec armed · press play",easy:"aufnahme bereit · start drücken"}}
};
let lang="pro";const t=o=>o[lang];
const slotLabel=(s,kitId)=>{const k=KITS[kitId||S.kit];return (k.labels&&k.labels[s]&&k.labels[s][lang])||t(T.slot[s]);};

/* ---------- Zustand ---------- */
const emptyTr=()=>Object.fromEntries(SLOTS.map(s=>[s,new Array(32).fill(0)]));
const emptyPat=(len=16)=>({len,tr:emptyTr()});
function demoPats(kitId){
  const d=KITS[kitId].demo,A=emptyPat(32);
  ["kick","snare","rim","perc"].forEach(s=>d[s].forEach(i=>A.tr[s][i]={v:s==="kick"?1:.9}));
  d.hat.forEach(i=>A.tr.hat[i]={v:i%4===0?.85:(i%2?.45:.6)});
  d.bass.forEach(([i,n,l])=>A.tr.bass[i]={v:.95,n,l:Math.max(1,Math.round(l))});
  d.skank.forEach(([i,n])=>A.tr.skank[i]={v:.9,n});
  const B=JSON.parse(JSON.stringify(A));B.tr.skank=new Array(32).fill(0);B.tr.hat=B.tr.hat.map((x,i)=>i%4===2?{v:.7}:0);
  return [A,B,emptyPat(16),emptyPat(16)];
}
const defTrk=()=>Object.fromEntries(SLOTS.map(s=>[s,{vol:.8,mute:false,pitch:0,decay:1,tone:1,echo:0}]));
function freshState(kitId="roots"){const k=KITS[kitId];
  return{kit:kitId,bpm:k.bpm,swing:k.swing,master:{drive:.45,tape:.3,low:.5,room:.25},key:{pc:9,scale:"minor"},fx:0,trk:defTrk(),pats:demoPats(kitId),cur:0};}
const KN=()=>keyInfo(S.key.pc,S.key.scale);
const keyLabel=()=>KN().root+" "+t(S.key.scale==="minor"?T.minor:T.major);
const fxName=i=>t(T.fxNames[FX_TYPES[i]||"siren"]);
let S=freshState();
// Bedienzustand
let sel=0,mode="drums",view="sound",page=0,curNote=0,curChord=0,rec=false,playing=false,queued=null,chain=[],copyMode=false,editIdx=null,sharedLoaded=false;
let ctx=null,eng=null,timer=null,pos=0,nextT=0,uiQueue=[],lastBass=null,stutter=null,stepLog=[],undoStack=[],recDirty=false,manualPageUntil=0;
const genreOf=k=>KITS[k].genre;let genre=genreOf(S.kit);

/* ---------- Speichern, Teilen ---------- */
function save(){clearTimeout(save.t);save.t=setTimeout(()=>{try{localStorage.setItem(CONFIG.storeKey,JSON.stringify(S));}catch(e){}},400);}
function pushUndo(){undoStack.push(JSON.stringify({pats:S.pats,cur:S.cur}));if(undoStack.length>60)undoStack.shift();}
function undo(){const u=undoStack.pop();if(!u){toast(T.toast.nothing);return;}const o=JSON.parse(u);S.pats=o.pats;S.cur=o.cur;toast(T.toast.undo);renderAll();save();}
const B32="abcdefghijklmnopqrstuvwxyz234567";
function b32enc(bytes){let out="",bits=0,val=0;for(const b of bytes){val=(val<<8)|b;bits+=8;while(bits>=5){out+=B32[(val>>>(bits-5))&31];bits-=5;}}if(bits>0)out+=B32[(val<<(5-bits))&31];return out;}
function b32dec(str){const out=[];let bits=0,val=0;for(const ch of str){const i=B32.indexOf(ch);if(i<0)throw new Error("bad");val=(val<<5)|i;bits+=5;if(bits>=8){out.push((val>>>(bits-8))&255);bits-=8;}}return new Uint8Array(out);}
async function zip(bytes,dir){const CS=dir?window.CompressionStream:window.DecompressionStream;const s=new Blob([bytes]).stream().pipeThrough(new CS("deflate-raw"));return new Uint8Array(await new Response(s).arrayBuffer());}
function compact(){const r=x=>Math.round(x*100);
  return{v:2,y:[S.key.pc,S.key.scale==="major"?1:0],f:S.fx,k:S.kit,b:Math.round(S.bpm),w:r(S.swing),m:[r(S.master.drive),r(S.master.tape),r(S.master.low),r(S.master.room)],c:S.cur,
    t:SLOTS.map(s=>{const q=S.trk[s];return[r(q.vol),q.mute?1:0,q.pitch,r(q.decay),r(q.tone),r(q.echo)];}),
    p:S.pats.map(P=>{const tr={};let any=false;SLOTS.forEach((s,si)=>{const a=[];P.tr[s].forEach((st,i)=>{if(!st)return;any=true;const e=[i,r(st.v??.8),st.a||0,st.n||0,st.l||0,st.s?1:0,st.x?1:0];while(e.length>2&&!e[e.length-1])e.pop();a.push(e);});if(a.length)tr[si]=a;});return any?[P.len,tr]:[P.len];})};}
function expand(o){if(!o||(o.v!==1&&o.v!==2)||!KITS[o.k])throw new Error("bad");const st=freshState(o.k);
  st.bpm=o.b;st.swing=o.w/100;[st.master.drive,st.master.tape,st.master.low,st.master.room]=o.m.map(x=>x/100);st.cur=o.c||0;if(o.y)st.key={pc:o.y[0],scale:o.y[1]?"major":"minor"};st.fx=o.f||0;
  SLOTS.forEach((s,i)=>{const q=o.t[i];st.trk[s]={vol:q[0]/100,mute:!!q[1],pitch:q[2],decay:q[3]/100,tone:q[4]/100,echo:q[5]/100};});
  st.pats=o.p.map(([len,tr])=>{const P=emptyPat(len);if(tr)Object.entries(tr).forEach(([si,arr])=>arr.forEach(e=>{const[i,v,a,n,l,sl,xx]=e;const x={v:v/100};if(a&&o.v===2)x.a=a;if(xx)x.x=1;if(n)x.n=n;if(l)x.l=l;if(sl)x.s=1;P.tr[SLOTS[si]][i]=x;}));return P;});
  return st;}
async function encodeState(){const raw=new TextEncoder().encode(JSON.stringify(compact()));
  if(window.CompressionStream){try{return"rb1z"+b32enc(await zip(raw,true));}catch(e){}}return"rb1u"+b32enc(raw);}
async function decodeState(code){const kind=code.slice(0,4),bytes=b32dec(code.slice(4));
  const raw=kind==="rb1z"?await zip(bytes,false):kind==="rb1u"?bytes:null;if(!raw)throw new Error("bad");return expand(JSON.parse(new TextDecoder().decode(raw)));}
let lastHash="";
async function share(){const code=await encodeState();lastHash=code;
  try{history.replaceState(null,"","#"+code);}catch(e){location.hash=code;}
  if(CONFIG.shareBase){const url=CONFIG.shareBase+"#"+code;try{await navigator.clipboard.writeText(url);toast(T.toast.copied);}catch(e){toast(T.toast.hash);}}
  else toast(T.toast.hash);}
async function loadFromHash(){const h=location.hash.slice(1);if(!h.startsWith("rb1")||h===lastHash)return false;
  try{const st=await decodeState(h);lastHash=h;S=st;genre=genreOf(S.kit);sharedLoaded=true;undoStack=[];syncEngine();renderAll();toast(T.toast.shared,4000);return true;}catch(e){return false;}}
window.addEventListener("hashchange",()=>{loadFromHash();});

/* ---------- Audio ---------- */
function unlock(){
  if(ctx){if(ctx.state!=="running")ctx.resume();return;}
  try{if(navigator.audioSession)navigator.audioSession.type="playback";}catch(e){}
  const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC({latencyHint:"interactive"});
  eng=new Engine(ctx);eng.onHit=(s,when)=>uiQueue.push([s,when]);syncEngine();
  try{const a=new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");a.loop=true;a.volume=0;a.play().catch(()=>{});}catch(e){}
  requestAnimationFrame(uiLoop);
}
function syncEngine(){if(!eng)return;eng.setKit(S.kit);eng.setBpm(S.bpm);const m=S.master;eng.setDrive(m.drive);eng.setTape(m.tape);eng.setLow(m.low);eng.setRoom(m.room);eng.setKey(S.key.pc,S.key.scale);
  SLOTS.forEach(s=>Object.assign(eng.trk[s],S.trk[s]));eng.pcache={};eng.applyTracks();}
const stepDur=()=>60/S.bpm/4;
function tick(){const d=stepDur();
  while(nextT<ctx.currentTime+.12){
    const P=S.pats[S.cur],off=(pos%2)?(S.swing-.5)*2*d:0,tt=nextT+off;
    let q=pos;if(stutter){q=stutter.start+(stutter.n%2);stutter.n++;}
    playStep(P,q,tt,d);stepLog.push({p:pos,t:tt,c:S.cur});if(stepLog.length>12)stepLog.shift();
    uiQueue.push(["step",tt,pos,S.cur]);
    nextT+=d;pos++;
    if(pos>=P.len){pos=0;
      if(queued!==null){S.cur=queued;queued=null;}
      else if(chain.length>1){const i=chain.indexOf(S.cur);S.cur=chain[(i+1)%chain.length];}
      uiQueue.push(["pat",nextT]);}
  }}
// Anschlag st.a: 0 normal, 2–4 Roll/doppelt, 5 versetzt (halber Step später), 6 gestrummt. Echo-Wurf: st.x
function playStep(P,q,tt,d){
  SLOTS.forEach(s=>{const st=P.tr[s][q];if(!st||S.trk[s].mute)return;const v=st.v??.8,a=st.a||0,thr=!!st.x;
    const t0=a===5?tt+d/2:tt,n=(a>=2&&a<=4)?a:1,sub=d/n;
    for(let j=0;j<n;j++){const tj=t0+j*sub,vj=j?v*.78:v;
      if(s==="bass"){const len=n>1?sub*.85:(st.l||2)*d*.92;lastBass=eng.play("bass",tj,vj,{note:st.n||0,len,from:(j===0&&st.s)?lastBass:null,thr});}
      else if(s==="skank")eng.play("skank",tj,vj,{chord:st.n||0,strum:a===6,thr});
      else if(s==="siren"){eng._thr=thr;const h=eng.fxStart(st.n||0,tj);eng._thr=false;h.stop(tj+(st.l||4)*d);}
      else eng.play(s,tj,vj,{thr});}});}
function start(){unlock();if(playing)return;playing=true;pos=0;nextT=ctx.currentTime+.06;lastBass=null;tick();timer=setInterval(tick,25);recDirty=false;renderTransport();renderLcd();}
function stop(){if(!playing)return;playing=false;clearInterval(timer);timer=null;uiQueue=uiQueue.filter(e=>e[0]!=="step"&&e[0]!=="pat");queued=null;stutter=null;
  stopAllFx();eng.panic();reapplyHolds();curPos=-1;renderSteps();renderTransport();renderPats();renderLcd();}
function reapplyHolds(){FX.forEach(f=>{if($("fx-"+f).classList.contains("held"))fxSet(f,true);});}

/* ---------- Live-Spiel ---------- */
const liveFx=new Map();
function stopAllFx(){liveFx.forEach(h=>h.stop());liveFx.clear();}
function startFx(k,pad){if(liveFx.has(pad))liveFx.get(pad).stop();const h=eng.fxStart(k);h.t0=ctx.currentTime;h.rec=record("siren",{n:k});liveFx.set(pad,h);return h;}
function trigger(i){unlock();const now=ctx.currentTime+.003;
  if(view==="mix"){const s=SLOTS[i];S.trk[s].mute=!S.trk[s].mute;eng.setTrack(s,"mute",S.trk[s].mute);renderPads();renderSliders();save();return;}
  if(mode==="bass"){curNote=i;sel=5;eng.play("bass",now,1,{note:i});record("bass",{n:i,l:2});renderPads();renderLcd();renderSteps();return;}
  if(mode==="skank"){curChord=i;sel=6;eng.play("skank",now,1,{chord:i});record("skank",{n:i});renderPads();renderLcd();renderSteps();return;}
  if(mode==="fx"){S.fx=i;sel=7;startFx(i,i);renderPads();renderLcd();renderSteps();save();return;}
  const s=SLOTS[i];sel=i;
  if(s==="bass"){setMode("bass");eng.play("bass",now,1,{note:curNote});return;}
  if(s==="skank"){setMode("skank");eng.play("skank",now,1,{chord:curChord});return;}
  if(s==="siren")startFx(S.fx,i);
  else{eng.play(s,now,1);record(s,{});}
  renderPads();renderLcd();renderSteps();if(view==="sound")renderSliders();}
function release(i){const h=liveFx.get(i);if(!h)return;liveFx.delete(i);const held=ctx.currentTime-h.t0;h.stop();
  if(h.rec){const st=S.pats[h.rec.c].tr.siren[h.rec.p];if(st)st.l=Math.max(1,Math.min(16,Math.round(held/stepDur())));renderSteps();save();}}
function record(s,extra){if(!(rec&&playing))return null;const now=ctx.currentTime;let best=null;
  stepLog.forEach(e=>{if(!best||Math.abs(e.t-now)<Math.abs(best.t-now))best=e;});if(!best)return null;
  if(!recDirty){pushUndo();recDirty=true;}
  const st=Object.assign({v:.9},extra);if(s==="siren")st.l=4;S.pats[best.c].tr[s][best.p]=st;
  if(best.p>=16&&S.pats[best.c].len===16)S.pats[best.c].len=32;save();return{c:best.c,p:best.p};}

/* ---------- Steps bearbeiten ---------- */
const selSlot=()=>SLOTS[sel];
function toggleStep(i){const P=S.pats[S.cur],s=selSlot(),arr=P.tr[s],cur=arr[i];pushUndo();
  if(s==="bass"){arr[i]=(!cur)?{v:.9,n:curNote,l:2}:(cur.n===curNote?0:Object.assign(cur,{n:curNote}));if(arr[i]&&ctx&&!playing)eng.play("bass",ctx.currentTime+.003,.9,{note:curNote});}
  else if(s==="skank"){arr[i]=(!cur)?{v:.9,n:curChord}:(cur.n===curChord?0:Object.assign(cur,{n:curChord}));}
  else if(s==="siren"){arr[i]=(!cur)?{v:.9,l:4,n:S.fx}:((cur.n||0)===S.fx?0:Object.assign(cur,{n:S.fx}));}
  else arr[i]=cur?0:{v:.85};
  renderSteps();renderLcd();renderPats();save();}
function openEdit(i){const st=S.pats[S.cur].tr[selSlot()][i];if(!st)return;editIdx=i;renderEdit();}
const strikeOpts=s=>s==="bass"?[0,2,5]:s==="skank"?[0,2,5,6]:s==="siren"?[0,5]:[0,2,3,4,5];
const strikeLbl=(a,s)=>a===0?t(T.ed.normal):a===5?t(T.ed.late):a===6?t(T.ed.strum):(a===2&&(s==="bass"||s==="skank"))?t(T.ed.double):a+"×";
function renderEdit(){const box=$("edit");if(editIdx===null){box.hidden=true;return;}
  const s=selSlot(),st=S.pats[S.cur].tr[s][editIdx];if(!st){editIdx=null;box.hidden=true;return;}
  const acc=(st.v??.8)>=.99,b=(lbl,act,on)=>`<button type="button" class="k${on?" sel":""}" data-a="${act}" aria-pressed="${!!on}">${lbl}</button>`,row=(l,inner)=>`<div class="er"><span class="lbl">${l}</span><div class="opts">${inner}</div></div>`;
  let h=`<div class="er"><h3>${t(T.ed.step)} ${editIdx+1} · ${slotLabel(s)}${s==="bass"?" · "+KN().notes[st.n||0]:""}${s==="skank"?" · "+KN().chords[st.n||0]:""}${s==="siren"?" · "+fxName(st.n||0):""}</h3><button type="button" class="x" data-a="done" aria-label="${t(T.ed.close)}">×</button></div>`;
  h+=row(t(T.ed.acc),b(t(T.ed.off),"acc0",!acc)+b(t(T.ed.on),"acc1",acc));
  h+=row(t(T.ed.strike),strikeOpts(s).map(a=>b(strikeLbl(a,s),"a"+a,(st.a||0)===a)).join(""));
  if(s==="siren")h+=row(t(T.ed.fx),FX_TYPES.map((f,k)=>b(fxName(k),"f"+k,(st.n||0)===k)).join(""));
  h+=row(t(T.ed.thr),b(t(T.ed.off),"x0",!st.x)+b(t(T.ed.on),"x1",!!st.x));
  if(s==="bass"||s==="siren")h+=row(t(T.ed.len),b("−","l-",false)+`<span class="lbl" style="min-width:2.5em;text-align:center;color:var(--fg)">${st.l||(s==="bass"?2:4)}</span>`+b("+","l+",false));
  if(s==="bass")h+=row(t(T.ed.slide),b(t(T.ed.off),"s0",!st.s)+b(t(T.ed.on),"s1",!!st.s));
  h+=`<div class="er"><span></span>${b(t(T.ed.del),"del",false)}</div>`;
  box.innerHTML=h;box.hidden=false;}
$("edit").addEventListener("click",e=>{const a=e.target.closest("[data-a]");if(!a)return;const s=selSlot(),arr=S.pats[S.cur].tr[s],st=arr[editIdx];const act=a.dataset.a;
  if(act==="done"||!st){editIdx=null;renderEdit();return;}pushUndo();
  if(act==="acc0")st.v=.85;else if(act==="acc1")st.v=1;else if(/^a\d$/.test(act)){const n=+act.slice(1);if(n)st.a=n;else delete st.a;}
  else if(/^f\d$/.test(act)){st.n=+act.slice(1);if(eng){const h=eng.fxStart(st.n);setTimeout(()=>h.stop(),600);}}
  else if(act==="x0")delete st.x;else if(act==="x1")st.x=1;
  else if(act==="l-")st.l=Math.max(1,(st.l||(s==="bass"?2:4))-1);else if(act==="l+")st.l=Math.min(16,(st.l||(s==="bass"?2:4))+1);
  else if(act==="s0")st.s=0;else if(act==="s1")st.s=1;else if(act==="del"){arr[editIdx]=0;editIdx=null;}
  renderEdit();renderSteps();save();});
document.addEventListener("pointerdown",e=>{if(editIdx!==null&&!e.target.closest("#edit")&&!e.target.closest("#steps")){editIdx=null;renderEdit();}},true);

/* ---------- Anzeige ---------- */
let toastTimer=null,toastMsg=null,tempoEdit=false,tempoTimer=null;
function toast(o,ms=2200){toastMsg=o;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toastMsg=null;renderLcd();},ms);renderLcd();}
let curPos=-1;
function renderLcd(){const s=selSlot();let big=(s==="siren"&&view!=="mix")?fxName(S.fx):slotLabel(s);
  if(mode==="bass"&&view!=="mix")big+=" · "+KN().notes[curNote];if(mode==="skank"&&view!=="mix")big+=" · "+KN().chords[curChord];
  $("lcd-big").textContent=big;
  const sub=$("lcd-sub");sub.classList.toggle("toast",!!toastMsg);
  sub.textContent=toastMsg?t(toastMsg):(KITS[S.kit].name+" · "+(KITS[S.kit][s]&&KITS[S.kit][s].name?KITS[S.kit][s].name:slotLabel(s))+(rec?" · ● rec":""));
  const L="ABCD";let pat=L[S.cur];if(chain.length>1)pat=chain.map(i=>L[i]).join("→");if(queued!==null)pat+=" → "+L[queued];
  $("lcd-big").hidden=tempoEdit;sub.hidden=tempoEdit;$("tempo").hidden=!tempoEdit;$("tv").textContent=Math.round(S.bpm);$("tv").setAttribute("aria-valuenow",Math.round(S.bpm));
  $("lcd-meta").innerHTML='<button type="button" class="bpmb" id="bpmb" aria-expanded="'+tempoEdit+'">'+(lang==="pro"?"bpm ":"tempo ")+Math.round(S.bpm)+"</button><br>"+(lang==="pro"?"swing ":"groove ")+Math.round(S.swing*100)+"%<br>"+(lang==="pro"?"pattern ":"teil ")+pat;
  paintBar();}
function paintBar(){const P=S.pats[S.cur],off=page*16;
  [...$("lcd-bar").children].forEach((b,i)=>{const k=i+off;b.classList.toggle("hit",k<P.len&&SLOTS.some(s=>P.tr[s][k]));b.classList.toggle("now",playing&&curPos===k);});}
function renderViews(){$("views").innerHTML=Object.keys(T.views).map(v=>`<button type="button" class="tab" data-v="${v}" aria-pressed="${v===view}">${t(T.views[v])}</button>`).join("");}
function renderModes(){const dis=view==="mix";$("modes").innerHTML=Object.keys(T.modes).map(m=>`<button type="button" class="tab" data-m="${m}" aria-pressed="${m===mode&&!dis}" ${dis?"disabled":""}>${m==="skank"?slotLabel("skank"):t(T.modes[m])}</button>`).join("");
  padsLabel();}
function padsLabel(){const lb=$("pads-lbl");
  if(view==="mix")lb.textContent=t(T.padsMix);
  else if(mode==="bass"||mode==="skank")lb.innerHTML=`<button type="button" class="pick" data-pick="key" aria-expanded="${pickKind==="key"}">${t(mode==="bass"?T.notes:T.chords)} · ${keyLabel()} ▾</button>`;
  else if(mode==="fx")lb.textContent=t(T.fxHold);
  else lb.textContent=t(T.pads);}
function renderPads(){const box=$("pads");if(!box.children.length)for(let i=0;i<8;i++){const b=document.createElement("button");b.type="button";b.className="k pad";b.dataset.i=i;box.appendChild(b);}
  const P=S.pats[S.cur];
  [...box.children].forEach((b,i)=>{const s=SLOTS[i],dn=b.classList.contains("down");b.className="k pad"+(dn?" down":"");
    if(view==="mix"||mode==="drums"){const nm=(s==="siren"&&view!=="mix")?fxName(S.fx):slotLabel(s),kp=KITS[S.kit][s],sub=s==="siren"?"fx":(kp&&kp.name&&kp.name.split(" · ")[1]);
      b.innerHTML=(P.tr[s].some(x=>x)?'<span class="dotm"></span>':"")+nm+(sub&&lang==="pro"?"<small>"+sub+"</small>":"");
      b.classList.toggle("sel",view!=="mix"&&i===sel);b.classList.toggle("muted",view==="mix"&&S.trk[s].mute);
      b.setAttribute("aria-label",nm+(view==="mix"?(S.trk[s].mute?" (stumm)":""):""));b.setAttribute("aria-pressed",view==="mix"?String(!S.trk[s].mute):String(i===sel));}
    else if(mode==="fx"){const lbl=fxName(i);b.classList.add("note","fxp");b.textContent=lbl;b.classList.toggle("sel",i===S.fx);b.setAttribute("aria-label",lbl);b.setAttribute("aria-pressed",String(i===S.fx));}
    else{const lbl=mode==="bass"?KN().notes[i]:KN().chords[i];b.classList.add("note");b.textContent=lbl;b.classList.toggle("sel",i===(mode==="bass"?curNote:curChord));b.setAttribute("aria-label",lbl);b.setAttribute("aria-pressed",String(b.classList.contains("sel")));}});padsLabel();}
function renderSteps(){const P=S.pats[S.cur],s=selSlot(),box=$("steps");if(page===1&&P.len===16)page=0;
  if(!box.children.length)for(let i=0;i<16;i++){const b=document.createElement("button");b.type="button";b.className="k step";box.appendChild(b);}
  [...box.children].forEach((b,i)=>{const k=i+page*16,st=P.tr[s][k];b.dataset.k=k;
    b.className="k step"+(Math.floor(i/4)%2?"":" q")+(st?" on":"")+(st&&(st.v??.8)>=.99?" acc":"")+(st&&st.x?" thr":"")+(playing&&curPos===k?" now":"");
    const mk=st?((st.a>=2&&st.a<=4?st.a+"×":st.a===5?"›":st.a===6?"≋":"")+(st.x?"≈":"")):"";
    let inner="";if(st&&s==="bass")inner=`<span class="nt">${KN().notes[st.n||0]}</span>`+(st.s||mk?`<span class="sl2">${st.s?"~":""}${mk}</span>`:"");
    else if(st&&s==="skank")inner=`<span class="nt">${KN().chords[st.n||0]}</span>`+(mk?`<span class="sl2">${mk}</span>`:"");
    else if(st&&s==="siren")inner=`<span class="sl2">${fxName(st.n||0).slice(0,5)}${mk}</span>`;
    else if(mk)inner=`<span class="sl2">${mk}</span>`;
    b.innerHTML=inner;b.setAttribute("aria-label","Step "+(k+1)+(st?" an":" aus"));b.setAttribute("aria-pressed",String(!!st));});
  $("steps-lbl").textContent=t(T.steps)+" · "+slotLabel(s);
  $("pager").innerHTML=(P.len===32?[0,1].map(p=>`<button type="button" class="tab" data-page="${p}" aria-pressed="${p===page}">${t(T.page[p])}</button>`).join(""):"");
  paintBar();renderEdit();}
function renderPats(){const box=$("pats");const L="ABCD";
  box.innerHTML=L.split("").map((l,i)=>`<button type="button" class="k pat${i===S.cur?" sel":""}${queued===i?" queued":""}${chain.length>1&&chain.includes(i)?" chain":""}${S.pats[i].len&&SLOTS.some(s=>S.pats[i].tr[s].some(x=>x))?" has":""}" data-p="${i}">${l}</button>`).join("")+
    `<button type="button" class="k${copyMode?" sel":""}" id="b-copy">${t(T.copy)}</button><button type="button" class="k" id="b-len">${S.pats[S.cur].len===16?"16":"32"}</button>`;
  $("pats-lbl").textContent=t(T.pats);}
function renderKits(){const genres=[...new Set(Object.values(KITS).map(k=>k.genre))];
  $("genres").innerHTML=genres.length>1?genres.map(g=>`<button type="button" class="tab" data-g="${g}" aria-pressed="${g===genre}">${g}</button>`).join(""):"";
  $("kits").innerHTML=Object.keys(KITS).filter(k=>KITS[k].genre===genre).map(k=>`<button type="button" class="k${k===S.kit?" sel":""}" data-kit="${k}">${KITS[k].name}</button>`).join("");
  $("kit-lbl").textContent=t(T.kit);}
const FX=["echo","hall","filter","stutter"];
function renderFx(){const box=$("fx");if(!box.children.length)FX.forEach(f=>{const b=document.createElement("button");b.type="button";b.className="k fxk";b.id="fx-"+f;box.appendChild(b);holdBtn(b,on=>fxSet(f,on));});
  FX.forEach(f=>$("fx-"+f).textContent=t(T.fxk[f]));$("fx-lbl").textContent=t(T.fx);}
function renderTransport(){$("b-play").textContent=playing?t(T.stop):t(T.play);$("b-play").classList.toggle("on",playing);$("b-play").setAttribute("aria-pressed",String(playing));
  $("b-rec").innerHTML='<span class="dot"></span>'+t(T.rec);$("b-rec").classList.toggle("on",rec);$("b-rec").setAttribute("aria-pressed",String(rec));
  $("b-tap").textContent=t(T.tap);["demo","clear","undo","share"].forEach(k=>$("b-"+k).textContent=t(T[k]));
  document.querySelectorAll(".led")[3].classList.toggle("rec",rec);}
function renderHint(){const h=$("hint");if(sharedLoaded){h.innerHTML=(lang==="pro"?"made with the sparked riddim box · ":"gebaut mit der sparked riddim box · ")+`<a href="${CONFIG.ctaUrl}" target="_blank" rel="noopener">let's spark some ideas</a>`;}else h.textContent=t(T.hint);}

/* Regler */
const pct=v=>Math.round(v*100)+"%";
function sliderDefs(){const s=selSlot(),q=S.trk[s];
  if(view==="sound")return{cols:2,list:[
    {id:"pitch",lbl:T.sl.pitch,min:-12,max:12,step:1,val:q.pitch,def:0,fmt:v=>(v>0?"+":"")+v+" st",set:v=>{q.pitch=v;eng&&eng.setTrack(s,"pitch",v);}},
    {id:"decay",lbl:T.sl.decay,min:25,max:200,step:1,val:Math.round(q.decay*100),def:100,fmt:v=>v+"%",set:v=>{q.decay=v/100;eng&&eng.setTrack(s,"decay",v/100);}},
    {id:"tone",lbl:T.sl.tone,min:0,max:100,step:1,val:Math.round(q.tone*100),def:100,fmt:v=>v+"%",set:v=>{q.tone=v/100;eng&&eng.setTrack(s,"tone",v/100);}},
    {id:"echo",lbl:T.sl.echo,min:0,max:100,step:1,val:Math.round(q.echo*100),def:0,fmt:v=>v+"%",set:v=>{q.echo=v/100;eng&&eng.setTrack(s,"echo",v/100);}}]};
  if(view==="mix")return{cols:4,list:SLOTS.map(sl=>({id:"vol-"+sl,lbl:{pro:slotLabel(sl),easy:slotLabel(sl)},min:0,max:100,step:1,val:Math.round(S.trk[sl].vol*100),def:80,muted:S.trk[sl].mute,
    fmt:v=>v+"%",set:v=>{S.trk[sl].vol=v/100;eng&&eng.setTrack(sl,"vol",v/100);}}))};
  const m=S.master,k=KITS[S.kit];
  return{cols:3,list:[
    {id:"bpm",lbl:T.sl.bpm,min:60,max:160,step:1,val:Math.round(S.bpm),def:k.bpm,fmt:v=>v,set:v=>{S.bpm=v;eng&&eng.setBpm(v);renderLcd();}},
    {id:"swing",lbl:T.sl.swing,min:50,max:75,step:1,val:Math.round(S.swing*100),def:Math.round(k.swing*100),fmt:v=>v+"%",set:v=>{S.swing=v/100;renderLcd();}},
    {id:"drive",lbl:T.sl.drive,min:0,max:100,step:1,val:Math.round(m.drive*100),def:45,fmt:v=>v+"%",set:v=>{m.drive=v/100;eng&&eng.setDrive(v/100);}},
    {id:"tape",lbl:T.sl.tape,min:0,max:100,step:1,val:Math.round(m.tape*100),def:30,fmt:v=>v+"%",set:v=>{m.tape=v/100;eng&&eng.setTape(v/100);}},
    {id:"low",lbl:T.sl.low,min:0,max:100,step:1,val:Math.round(m.low*100),def:50,fmt:v=>v+"%",set:v=>{m.low=v/100;eng&&eng.setLow(v/100);}},
    {id:"room",lbl:T.sl.room,min:0,max:100,step:1,val:Math.round(m.room*100),def:25,fmt:v=>v+"%",set:v=>{m.room=v/100;eng&&eng.setRoom(v/100);}}]};}
let curDefs=null;
function renderSliders(){const D=sliderDefs();curDefs=D;const box=$("sliders");box.style.setProperty("--cols",D.cols);
  box.innerHTML=D.list.map(d=>`<div class="sl${d.muted?" muted":""}"><label for="sl-${d.id}"><span>${t(d.lbl)}</span><b></b></label><input type="range" id="sl-${d.id}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.val}"></div>`).join("");
  [...box.querySelectorAll("input")].forEach((inp,i)=>paintSlider(inp,D.list[i]));}
function paintSlider(inp,d){const v=+inp.value;inp.style.setProperty("--p",((v-d.min)/(d.max-d.min)*100)+"%");inp.parentNode.querySelector("b").textContent=d.fmt(v);}
$("sliders").addEventListener("input",e=>{const inp=e.target;if(!inp.matches("input"))return;const i=[...$("sliders").querySelectorAll("input")].indexOf(inp),d=curDefs.list[i];d.set(+inp.value);paintSlider(inp,d);save();});
let lastSliderTap={id:null,t:0};
$("sliders").addEventListener("pointerdown",e=>{const inp=e.target.closest("input");if(!inp)return;const now=Date.now();
  if(lastSliderTap.id===inp.id&&now-lastSliderTap.t<320){const i=[...$("sliders").querySelectorAll("input")].indexOf(inp),d=curDefs.list[i];inp.value=d.def;d.set(d.def);paintSlider(inp,d);save();e.preventDefault();}
  lastSliderTap={id:inp.id,t:now};});

function renderAll(){renderHead();renderLcd();renderViews();renderModes();renderSliders();renderPads();renderKits();renderSteps();renderPats();renderFx();renderTransport();renderHint();}
function renderHead(){$("lang-pro").setAttribute("aria-pressed",String(lang==="pro"));$("lang-easy").setAttribute("aria-pressed",String(lang==="easy"));}

/* Bildschirm-Takt: Lauflicht, LEDs, Pad-Blitze */
const LEDMAP={kick:0,snare:1,rim:1,hat:2,perc:2,bass:3,skank:3,siren:3};
function uiLoop(){const now=ctx.currentTime;let stepChanged=false,patChanged=false;
  uiQueue=uiQueue.filter(ev=>{if(ev[1]>now)return true;
    if(ev[0]==="step"){curPos=ev[2];stepChanged=true;
      if(S.pats[S.cur].len===32&&Date.now()>manualPageUntil){const pg=curPos>=16?1:0;if(pg!==page){page=pg;patChanged=true;}}}
    else if(ev[0]==="pat"){patChanged=true;}
    else{const l=document.querySelectorAll(".led")[LEDMAP[ev[0]]];if(l&&!(LEDMAP[ev[0]]===3&&rec)){l.classList.add("on");setTimeout(()=>l.classList.remove("on"),70);}
      if(view==="mix"||mode==="drums"){const p=$("pads").children[SLOTS.indexOf(ev[0])];if(p){p.classList.add("flash");setTimeout(()=>p.classList.remove("flash"),90);}}}
    return false;});
  if(patChanged){renderSteps();renderPats();renderLcd();renderPads();}
  else if(stepChanged){[...$("steps").children].forEach(b=>b.classList.toggle("now",playing&&+b.dataset.k===curPos));paintBar();}
  requestAnimationFrame(uiLoop);}

/* ---------- Bedienung ---------- */
function setMode(m){mode=m;pickKind=null;$("picker").hidden=true;if(m==="bass")sel=5;else if(m==="skank")sel=6;else if(m==="fx")sel=7;else if(sel===5||sel===6)sel=0;editIdx=null;renderModes();renderPads();renderSteps();renderLcd();if(view==="sound")renderSliders();}
function setView(v){view=v;renderViews();renderModes();renderSliders();renderPads();renderLcd();}
function setKit(k){S.kit=k;genre=genreOf(k);S.bpm=KITS[k].bpm;S.swing=KITS[k].swing;if(eng){eng.setKit(k);eng.setBpm(S.bpm);}renderKits();renderLcd();renderPads();renderModes();renderSteps();if(view!=="mix")renderSliders();save();}
function fxSet(f,on){unlock();
  if(f==="echo")eng.echoHold(on);else if(f==="hall")eng.hallHold(on);else if(f==="filter")eng.filterHold(on);
  else if(f==="stutter"){if(on&&playing){const P=S.pats[S.cur];stutter={start:pos%2?(pos-1+P.len)%P.len:pos,n:0};}else stutter=null;}}
function holdBtn(b,fn){
  const on=e=>{if(e&&e.preventDefault)e.preventDefault();if(b.classList.contains("held"))return;b.classList.add("held");fn(true);};
  const off=()=>{if(!b.classList.contains("held"))return;b.classList.remove("held");fn(false);};
  b.addEventListener("pointerdown",e=>{try{b.setPointerCapture(e.pointerId);}catch(_){}on(e);});
  ["pointerup","pointercancel","lostpointercapture"].forEach(ev=>b.addEventListener(ev,off));
  b.addEventListener("keydown",e=>{if((e.key===" "||e.key==="Enter")&&!e.repeat){e.stopPropagation();on(e);}});
  b.addEventListener("keyup",e=>{if(e.key===" "||e.key==="Enter"){e.stopPropagation();off();}});
  b._hold={on,off};}

// Pads
const padPtr=new Map();
$("pads").addEventListener("pointerdown",e=>{const b=e.target.closest(".pad");if(!b)return;e.preventDefault();const i=+b.dataset.i;padPtr.set(e.pointerId,i);b.classList.add("down");try{b.setPointerCapture(e.pointerId);}catch(_){}trigger(i);});
["pointerup","pointercancel","lostpointercapture"].forEach(ev=>$("pads").addEventListener(ev,e=>{if(!padPtr.has(e.pointerId))return;const i=padPtr.get(e.pointerId);padPtr.delete(e.pointerId);const b=$("pads").children[i];if(b)b.classList.remove("down");release(i);}));
window.addEventListener("blur",stopAllFx);
$("pads").addEventListener("keydown",e=>{const b=e.target.closest(".pad");if(b&&(e.key===" "||e.key==="Enter")&&!e.repeat){e.preventDefault();e.stopPropagation();trigger(+b.dataset.i);}});
$("pads").addEventListener("keyup",e=>{const b=e.target.closest(".pad");if(b&&(e.key===" "||e.key==="Enter")){e.stopPropagation();release(+b.dataset.i);}});
// Steps: Tippen schaltet, Halten öffnet den Editor
let lp=null;
$("steps").addEventListener("pointerdown",e=>{const b=e.target.closest(".step");if(!b)return;e.preventDefault();unlock();if(editIdx!==null){editIdx=null;renderEdit();return;}b.classList.add("down");const k=+b.dataset.k;
  lp={k,fired:false,b,timer:setTimeout(()=>{lp.fired=true;b.classList.remove("down");if(!S.pats[S.cur].tr[selSlot()][k])toggleStep(k);openEdit(k);},450)};});
["pointerup","pointercancel"].forEach(ev=>$("steps").addEventListener(ev,e=>{if(!lp)return;clearTimeout(lp.timer);lp.b.classList.remove("down");if(ev==="pointerup"&&!lp.fired){editIdx=null;toggleStep(lp.k);}lp=null;}));
$("steps").addEventListener("pointerleave",()=>{if(lp){clearTimeout(lp.timer);lp.b.classList.remove("down");lp=null;}});
$("steps").addEventListener("keydown",e=>{const b=e.target.closest(".step");if(!b)return;if(e.key===" "||e.key==="Enter"){e.preventDefault();e.stopPropagation();toggleStep(+b.dataset.k);}else if(e.key==="e"||e.key==="E"){e.stopPropagation();openEdit(+b.dataset.k);}});
$("steps").addEventListener("contextmenu",e=>e.preventDefault());
$("pager").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.page!==undefined){page=+b.dataset.page;manualPageUntil=Date.now()+4000;renderSteps();}else if(b.dataset.len)toggleLen();});
function toggleLen(){const P=S.pats[S.cur];pushUndo();
  if(P.len===16){P.len=32;SLOTS.forEach(s=>{const a=P.tr[s];if(a.slice(16).every(x=>!x))for(let i=0;i<16;i++)a[16+i]=a[i]?JSON.parse(JSON.stringify(a[i])):0;});}
  else{P.len=16;page=0;}
  if(pos>=P.len)pos=0;renderSteps();renderPats();save();}
// Patterns
let patHeld=[];
$("pats").addEventListener("pointerdown",e=>{const b=e.target.closest("button");if(!b)return;unlock();
  if(b.id==="b-copy"){copyMode=!copyMode;if(copyMode)toast(T.toast.copyTo);renderPats();return;}
  if(b.id==="b-len"){toggleLen();return;}
  const i=+b.dataset.p;
  if(copyMode){pushUndo();S.pats[i]=JSON.parse(JSON.stringify(S.pats[S.cur]));copyMode=false;toast({pro:"copied to "+"ABCD"[i],easy:"kopiert nach "+"ABCD"[i]});renderPats();save();return;}
  if(e.shiftKey&&i!==S.cur){const a=Math.min(S.cur,i),z=Math.max(S.cur,i);chain=[];for(let k=a;k<=z;k++)chain.push(k);queued=null;if(!playing)S.cur=a;editIdx=null;renderPats();renderSteps();renderLcd();renderPads();save();return;}
  patHeld.push(i);
  if(patHeld.length>=2){const a=Math.min(...patHeld),z=Math.max(...patHeld);chain=[];for(let k=a;k<=z;k++)chain.push(k);if(!playing){S.cur=a;}queued=null;}
  else{chain=[];if(playing&&i!==S.cur)queued=i;else{queued=null;S.cur=i;pos=pos%S.pats[i].len;page=0;}}
  editIdx=null;renderPats();renderSteps();renderLcd();renderPads();save();});
["pointerup","pointercancel","pointerleave"].forEach(ev=>$("pats").addEventListener(ev,e=>{const b=e.target.closest("[data-p]");if(b)patHeld=patHeld.filter(x=>x!==+b.dataset.p);if(ev==="pointerleave")patHeld=[];}));
$("pats").addEventListener("keydown",e=>{const b=e.target.closest("[data-p]");if(b&&(e.key===" "||e.key==="Enter")){e.preventDefault();e.stopPropagation();b.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));patHeld=[];}});
// Tabs, Kits
$("views").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(b)setView(b.dataset.v);});
$("modes").addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b)setMode(b.dataset.m);});
$("kits").addEventListener("click",e=>{const b=e.target.closest("[data-kit]");if(b){unlock();setKit(b.dataset.kit);}});
$("genres").addEventListener("click",e=>{const b=e.target.closest("[data-g]");if(b){genre=b.dataset.g;renderKits();}});
// Transport
$("b-play").addEventListener("click",()=>{playing?stop():start();});
$("b-rec").addEventListener("click",()=>{rec=!rec;if(rec&&!playing)toast(T.toast.recOn);renderTransport();renderLcd();});
let taps=[];
$("b-tap").addEventListener("pointerdown",()=>{const n=performance.now();if(taps.length&&n-taps[taps.length-1]>2000)taps=[];taps.push(n);if(taps.length>5)taps.shift();
  if(taps.length>=2){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1);setBpm(Math.round(60000/iv));toast({pro:"tap · "+Math.round(S.bpm)+" bpm",easy:"tippen · tempo "+Math.round(S.bpm)});}});
$("b-demo").addEventListener("click",()=>{pushUndo();S.pats=demoPats(S.kit);S.cur=0;queued=null;chain=[];page=0;toast(T.toast.demo);renderAll();save();});
let clrT=null,clrHeld=false;
$("b-clear").addEventListener("pointerdown",()=>{clrHeld=false;clrT=setTimeout(()=>{clrHeld=true;pushUndo();S.pats[S.cur]=emptyPat(S.pats[S.cur].len);toast(T.toast.patClr);renderSteps();renderPats();renderPads();save();},600);});
$("b-clear").addEventListener("pointerup",()=>{clearTimeout(clrT);if(clrHeld)return;pushUndo();S.pats[S.cur].tr[selSlot()]=new Array(32).fill(0);toast(T.toast.trackClr);renderSteps();renderPats();renderPads();save();});
$("b-clear").addEventListener("pointerleave",()=>clearTimeout(clrT));
$("b-undo").addEventListener("click",undo);
$("b-share").addEventListener("click",()=>{share();});
["demo","clear","undo","share","tap"].forEach(k=>{const b=$("b-"+k);b.addEventListener("pointerdown",()=>b.classList.add("down"));["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>b.classList.remove("down")));});
// Sprache
$("lang-pro").addEventListener("click",()=>{lang="pro";renderAll();});
$("lang-easy").addEventListener("click",()=>{lang="easy";renderAll();});
// Erste Berührung startet Audio (Browser-Regel)
$("dev").addEventListener("pointerdown",()=>unlock(),{capture:true});
// Tastatur
const FXKEY={e:"echo",h:"hall",f:"filter",s:"stutter"};
document.addEventListener("keydown",e=>{
  if(e.target.closest("input")&&!(e.key===" "))return;if(e.target.closest("button")&&(e.key===" "||e.key==="Enter"))return;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="z"){e.preventDefault();undo();return;}
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.shiftKey&&/^Digit[1-4]$/.test(e.code)){if(!e.repeat){$("pats").querySelector('[data-p="'+(+e.code.slice(5)-1)+'"]').dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));patHeld=[];}return;}
  const k=e.key.toLowerCase(),n=parseInt(e.key,10);
  if(n>=1&&n<=8&&!e.repeat){$("pads").children[n-1].classList.add("down");trigger(n-1);}
  else if(e.key===" "){e.preventDefault();if(!e.repeat)playing?stop():start();}
  else if(e.key==="ArrowRight"||e.key==="ArrowLeft"){const ks=Object.keys(KITS).filter(x=>KITS[x].genre===genre);let i=ks.indexOf(S.kit)+(e.key==="ArrowRight"?1:-1);unlock();setKit(ks[(i+ks.length)%ks.length]);}
  else if(FXKEY[k]&&!e.repeat)$("fx-"+FXKEY[k])._hold.on();
  else if(k==="r"&&!e.repeat)$("b-rec").click();
  else if(k==="t"&&!e.repeat)$("b-tap").dispatchEvent(new PointerEvent("pointerdown"));
  else if(k==="z"&&!e.repeat)undo();
  else if(e.key==="Escape"){editIdx=null;copyMode=false;tempoEdit=false;pickKind=null;renderEdit();renderPats();renderLcd();renderPicker();}});
document.addEventListener("keyup",e=>{const k=e.key.toLowerCase(),n=parseInt(e.key,10);
  if(n>=1&&n<=8){$("pads").children[n-1].classList.remove("down");release(n-1);}
  else if(FXKEY[k])$("fx-"+FXKEY[k])._hold.off();});

/* ---------- Auswahlfeld über den Pads: Tonart (bass/skank) oder FX-Klang ---------- */
let pickKind=null;
function renderPicker(){const box=$("picker");if(!pickKind){box.hidden=true;padsLabel();return;}
  const x=`<button type="button" class="x" data-close="1" aria-label="${t(T.ed.close)}">×</button>`;let h="";
  if(pickKind==="key"){const names=[...Array(12).keys()].map(pc=>keyInfo(pc,S.key.scale).root);
    h=`<div class="er"><h3>${t(T.keyT)} · ${keyLabel()}</h3>${x}</div><div class="pgrid">`+[0,1,2,3,4,5,6,7,8,9,10,11].map(pc=>`<button type="button" class="k${pc===S.key.pc?" sel":""}" data-pc="${pc}">${names[pc]}</button>`).join("")+`</div>`+
      `<div class="pgrid2">`+["minor","major"].map(sc=>`<button type="button" class="k${sc===S.key.scale?" sel":""}" data-sc="${sc}">${t(T[sc])}</button>`).join("")+`</div>`;}
  else{h=`<div class="er"><h3>${t(T.fxT)}</h3>${x}</div><div class="pgrid3">`+FX_TYPES.map((f,k)=>`<button type="button" class="k${k===S.fx?" sel":""}" data-fx="${k}">${fxName(k)}</button>`).join("")+`</div>`;}
  box.innerHTML=h;box.hidden=false;padsLabel();}
$("pads-lbl").addEventListener("click",e=>{const b=e.target.closest("[data-pick]");if(!b)return;unlock();pickKind=pickKind===b.dataset.pick?null:b.dataset.pick;renderPicker();});
$("picker").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;unlock();const now=ctx.currentTime+.01;
  if(b.dataset.close){pickKind=null;renderPicker();return;}
  if(b.dataset.pc!==undefined||b.dataset.sc){if(b.dataset.pc!==undefined)S.key.pc=+b.dataset.pc;if(b.dataset.sc)S.key.scale=b.dataset.sc;eng.setKey(S.key.pc,S.key.scale);
    if(mode==="skank")eng.play("skank",now,.9,{chord:0});else eng.play("bass",now,.9,{note:0});}
  if(b.dataset.fx!==undefined){S.fx=+b.dataset.fx;const h=eng.fxStart(S.fx);setTimeout(()=>h.stop(),700);}
  renderPicker();renderPads();renderSteps();renderLcd();save();});
document.addEventListener("pointerdown",e=>{if(pickKind&&!e.target.closest("#picker")&&!e.target.closest("[data-pick]")){pickKind=null;renderPicker();}},true);

/* ---------- Tempo im Display: antippen, dann −/+ (halten = schnell), Zahl ziehen oder Mausrad ---------- */
function setBpm(v){v=Math.max(60,Math.min(160,Math.round(v)));if(v===Math.round(S.bpm)&&S.bpm===v)return;S.bpm=v;if(eng)eng.setBpm(v);renderLcd();if(view==="master")renderSliders();save();}
function tempoTouch(){clearTimeout(tempoTimer);tempoTimer=setTimeout(()=>{tempoEdit=false;renderLcd();},5000);}
function openTempo(on){tempoEdit=on;renderLcd();if(on)tempoTouch();}
$("tempo").innerHTML=`<button type="button" class="k tb" data-d="-1" aria-label="langsamer">−</button><span class="tv" id="tv" tabindex="0" role="spinbutton" aria-label="Tempo" aria-valuemin="60" aria-valuemax="160"></span><button type="button" class="k tb" data-d="1" aria-label="schneller">+</button><span class="tu">bpm</span>`;
$("lcd-meta").addEventListener("click",e=>{if(e.target.closest("#bpmb"))openTempo(!tempoEdit);});
let rep_=null;
$("tempo").addEventListener("pointerdown",e=>{const b=e.target.closest(".tb");if(!b)return;e.preventDefault();b.classList.add("down");const dd=+b.dataset.d;setBpm(S.bpm+dd);tempoTouch();
  clearTimeout(rep_);rep_=setTimeout(function r(){setBpm(S.bpm+dd);tempoTouch();rep_=setTimeout(r,60);},380);});
["pointerup","pointerleave","pointercancel"].forEach(ev=>$("tempo").addEventListener(ev,()=>{clearTimeout(rep_);$("tempo").querySelectorAll(".tb").forEach(b=>b.classList.remove("down"));}));
let drag=null;
$("tv").addEventListener("pointerdown",e=>{e.preventDefault();drag={y:e.clientY,b:S.bpm};try{$("tv").setPointerCapture(e.pointerId);}catch(_){}});
$("tv").addEventListener("pointermove",e=>{if(!drag)return;setBpm(drag.b+(drag.y-e.clientY)/4);tempoTouch();});
["pointerup","pointercancel"].forEach(ev=>$("tv").addEventListener(ev,()=>{drag=null;}));
$("tv").addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key==="ArrowRight"){e.preventDefault();e.stopPropagation();setBpm(S.bpm+1);tempoTouch();}else if(e.key==="ArrowDown"||e.key==="ArrowLeft"){e.preventDefault();e.stopPropagation();setBpm(S.bpm-1);tempoTouch();}});
document.querySelector(".lcd").addEventListener("wheel",e=>{if(!tempoEdit&&!e.target.closest("#bpmb"))return;e.preventDefault();if(!tempoEdit)openTempo(true);setBpm(S.bpm+(e.deltaY<0?1:-1));tempoTouch();},{passive:false});
document.addEventListener("pointerdown",e=>{if(tempoEdit&&!e.target.closest(".lcd")){tempoEdit=false;renderLcd();}},true);

/* ---------- Start ---------- */
for(let i=0;i<28;i++)$("grille").appendChild(document.createElement("i"));
for(let i=0;i<16;i++)$("lcd-bar").appendChild(document.createElement("i"));
(async()=>{
  if(!(await loadFromHash())){try{const raw=localStorage.getItem(CONFIG.storeKey);if(raw){const o=JSON.parse(raw);if(o&&KITS[o.kit]&&o.pats&&o.pats.length===4){S=Object.assign(freshState(o.kit),o);genre=genreOf(S.kit);}}}catch(e){}}
  renderAll();})();
renderAll();
window.RiddimBox={get state(){return S;},start,stop,encodeState,decodeState};
})();
