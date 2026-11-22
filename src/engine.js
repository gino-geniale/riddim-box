/* ================= Sound-Engine =================
   Bibliothek erweitern: Ein neues Kit ist ein weiterer Eintrag in KITS mit name, genre, bpm, swing,
   den Parametern der 8 Spuren (kick, snare, rim, hat, perc, bass, skank, siren), send und demo.
   Klang-Typen (z. B. bass.type "string" / "808", skank.type "organ" / "keys" / "chop") sind wiederverwendbar.
   Mit labels lassen sich Spurnamen pro Kit überschreiben (z. B. skank -> "chord" für Hip-Hop).
   Taucht ein zweites genre auf, zeigt die Oberfläche automatisch eine Genre-Auswahl. */
(function(G){
const KITS={
  roots:{name:"roots",genre:"reggae",bpm:76,swing:.54,lowSoft:9,
    kick:{f0:112,f1:47,sweep:.085,decay:.58,att:.004,click:.16,clickF:1100,drive:2.2,lp:850,body:.22,lvl:1},
    snare:{t1:185,t2:300,tdec:.11,tl:.55,noise:.6,ndec:.17,nf:3000,nq:.7,hp:700,lvl:.83,name:"snare"},
    rim:{type:"rim",f:1650,f2:800,dec:.05,ring:[2380,3470,5150],ringDec:.09,ringLvl:.38,lvl:.65,name:"rim"},
    hat:{dec:.045,bp:10000,hp:7000,lp:16000,metal:1,noise:.35,lvl:.6,name:"hat"},
    perc:{f:330,drop:1.07,dropT:.03,dec:.24,modes:[[1,1,1],[1.59,.45,.6],[2.14,.25,.42],[2.3,.18,.36],[2.65,.12,.3]],skin:.9,slap:.32,slapF:2400,lvl:.7,name:"hand drum"},
    bass:{type:"string",soft:.18,pick:.3,damp:.997,bright:.42,cut:520,post:900,sub:.45,boost:5,drive:1.25,dec:.5,sus:.9,rel:.08,thump:.1,lvl:.46,name:"bass · fingered"},
    skank:{type:"organ",dec:.13,cut:2400,lvl:.3,oct:12,name:"skank · organ"},
    siren:{wave:"triangle",lfo:"triangle",rate:4,depth:170,base:560,lvl:.07,name:"siren"},
    send:{echo:{rim:.12,skank:.1,siren:.45},room:{skank:.15,snare:.08,perc:.1}}},
  dancehall:{name:"dancehall",genre:"reggae",labels:{rim:{pro:"clap",easy:"klatschen"}},bpm:92,swing:.5,
    kick:{f0:160,f1:50,sweep:.05,decay:.42,att:.002,click:.3,clickF:2200,drive:3.4,lp:1500,body:.15,lvl:1},
    snare:{t1:215,t2:380,tdec:.06,tl:.34,noise:1,ndec:.11,nf:3600,nq:.5,hp:1000,lvl:.72,name:"snare · tight"},
    rim:{type:"clap",lvl:.84,name:"clap"},
    hat:{dec:.034,bp:10500,hp:8000,lp:15000,metal:.45,noise:1,lvl:.44,name:"hat · tight"},
    perc:{f:520,drop:1.02,dropT:.02,dec:.3,modes:[[1,1,1],[1.58,.6,.8],[2.31,.35,.7],[3.1,.2,.9],[6.2,.1,1.3]],skin:.7,slap:.5,slapF:4500,lvl:.45,name:"timbale"},
    bass:{type:"808",boom:2.2,cut:1400,drive:4.5,click:.25,dec:.34,sus:.85,rel:.12,lvl:.26,name:"bass · 808"},
    skank:{type:"keys",dec:.16,cut:4200,lvl:.32,oct:12,name:"skank · keys"},
    siren:{wave:"square",lfo:"square",rate:7,depth:220,base:640,lvl:.05,name:"siren · alarm"},
    send:{echo:{skank:.06,siren:.35},room:{rim:.05,skank:.1,perc:.08}}},
  dub:{name:"dub",genre:"reggae",bpm:70,swing:.56,
    kick:{f0:105,f1:41,sweep:.095,decay:.8,click:.1,drive:2.6,lvl:1},
    snare:{t1:165,t2:260,tdec:.14,tl:.5,noise:.55,ndec:.26,nf:2100,nq:.9,hp:500,lvl:.88,name:"snare · dark"},
    rim:{type:"rim",f:1250,f2:640,dec:.065,ring:[1920,2910,4330],ringDec:.12,ringLvl:.34,lvl:.6,name:"rim · tin"},
    hat:{dec:.065,bp:8500,hp:5500,lp:7500,metal:1,noise:.35,lvl:.48,name:"hat · dark"},
    perc:{f:122,drop:1.28,dropT:.1,dec:.46,modes:[[1,1,1],[1.5,.35,.5],[2.1,.2,.4],[2.75,.1,.3]],skin:.7,slap:.2,slapF:1500,drive:2.2,lvl:.68,name:"tom"},
    bass:{wave:"triangle",saw:.25,sub:1.1,cut:240,env:160,res:3,dec:.75,drive:3.2,lvl:.32,name:"bass · deep"},
    skank:{type:"chop",dec:.085,cut:1500,lvl:.34,oct:12,name:"skank · chop"},
    siren:{wave:"sine",lfo:"sawtooth",rate:2.6,depth:320,base:500,lvl:.09,name:"siren · dub"},
    send:{echo:{snare:.28,rim:.38,skank:.35,siren:.6,perc:.2},room:{snare:.2,skank:.3,rim:.15}}}
};
const SCALE=[0,2,3,5,7,8,10,12], NOTE_NAMES=["A","B","C","D","E","F","G","A'"];
const CHORDS=[[57,60,64],[55,60,64],[57,62,65],[55,59,64],[57,60,65],[55,59,62],[56,59,64],[60,64,69]];
const CHORD_NAMES=["Am","C","Dm","Em","F","G","E","Am'"];
/* Tonarten: off = Halbtöne relativ zu A (−6…+5), scale "minor" oder "major". Die 8 Töne/Akkorde sind Stufen, darum transponiert ein Beat beim Tonartwechsel mit. */
const SCALES={minor:[0,2,3,5,7,8,10,12],major:[0,2,4,5,7,9,11,12]};
const CHORD_IV={minor:[[0,3,7],[3,7,10],[5,8,12],[7,10,14],[8,12,15],[10,14,17],[7,11,14],[0,3,7]],
                major:[[0,4,7],[2,5,9],[4,7,11],[5,9,12],[7,11,14],[9,12,16],[10,14,17],[0,4,7]]};
const PC_SHARP=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],PC_FLAT=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const FLAT_KEYS={minor:[2,7,0,5,10,3],major:[5,10,3,8,1,6]};
const pcToOff=pc=>((pc-9+18)%12)-6;
function chordSet(off,scale){const root=57+off;return CHORD_IV[scale].map((iv,k)=>{const lo=k===7?60:55,hi=lo+12;
  return iv.map(x=>{let m=root+x;while(m<lo)m+=12;while(m>=hi)m-=12;return m;}).sort((a,b)=>a-b);});}
function keyInfo(pc,scale){const names=FLAT_KEYS[scale].includes(pc)?PC_FLAT:PC_SHARP,sc=SCALES[scale];
  const notes=sc.map((x,i)=>names[(pc+x)%12]+(i===7?"'":""));
  const chords=CHORD_IV[scale].map((iv,k)=>(scale==="major"&&k===6?PC_FLAT:names)[(pc+iv[0])%12]+(iv[1]-iv[0]===3?"m":"")+(k===7?"'":""));
  return{notes,chords,root:names[pc],scale};}
const FX_TYPES=["siren","horn","laser","bomb","spring","riser","rewind","whistle"];
const SLOTS=["kick","snare","rim","hat","perc","bass","skank","siren"];
const FREQ=["f0","f1","t1","t2","f","f2","nf","bp","hp","lp","base","clickF","slapF"],DEC=["decay","dec","tdec","ndec","ringDec","rel"];
const mtof=m=>440*Math.pow(2,(m-69)/12);
const rnd=(a)=>1+(Math.random()-.5)*a;

class Engine{
  constructor(ctx){
    const c=this.ctx=ctx; this.kitName="roots"; this.kit=KITS.roots; this.curves={}; this.onHit=null; this.bpm=76;
    const n=c.sampleRate*2, b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1; this.noise=b;
    // Hauptweg
    this.bus=c.createGain();
    this.tapeD=c.createDelay(.05); this.tapeD.delayTime.value=.006;
    this.tapeLP=c.createBiquadFilter(); this.tapeLP.type="lowpass"; this.tapeLP.Q.value=.5;
    this.pre=c.createGain(); this.shape=c.createWaveShaper(); this.shape.oversample="4x"; this.post=c.createGain();
    this.low=c.createBiquadFilter(); this.low.type="lowshelf"; this.low.frequency.value=85;
    this.mud=c.createBiquadFilter(); this.mud.type="peaking"; this.mud.frequency.value=320; this.mud.Q.value=1; this.mud.gain.value=-2;
    this.comp=c.createDynamicsCompressor(); this.comp.threshold.value=-18; this.comp.knee.value=8; this.comp.ratio.value=3.2; this.comp.attack.value=.008; this.comp.release.value=.2;
    this.makeup=c.createGain(); this.makeup.gain.value=1.25;
    this.lim=c.createDynamicsCompressor(); this.lim.threshold.value=-2.5; this.lim.knee.value=0; this.lim.ratio.value=20; this.lim.attack.value=.002; this.lim.release.value=.08;
    this.out=c.createGain(); this.out.gain.value=.9;
    this.bus.connect(this.tapeD); this.tapeD.connect(this.tapeLP); this.emDown=c.createBiquadFilter(); this.emDown.type="lowshelf"; this.emDown.frequency.value=140;
    this.emUp=c.createBiquadFilter(); this.emUp.type="lowshelf"; this.emUp.frequency.value=140;
    this.tapeLP.connect(this.emDown); this.emDown.connect(this.pre); this.pre.connect(this.shape); this.shape.connect(this.emUp); this.emUp.connect(this.post);
    this.low.frequency.value=110; this.fxLP=c.createBiquadFilter(); this.fxLP.type="lowpass"; this.fxLP.frequency.value=20000; this.fxLP.Q.value=.7;
    this.post.connect(this.mud); this.mud.connect(this.fxLP); this.fxLP.connect(this.comp); this.comp.connect(this.low); this.low.connect(this.makeup); this.makeup.connect(this.lim); this.lim.connect(this.out); this.out.connect(c.destination);
    // Band-Schwankung und Rauschen
    this.wow=c.createOscillator(); this.wow.frequency.value=.55; this.wowG=c.createGain(); this.wow.connect(this.wowG); this.wowG.connect(this.tapeD.delayTime);
    this.flut=c.createOscillator(); this.flut.frequency.value=6.3; this.flutG=c.createGain(); this.flut.connect(this.flutG); this.flutG.connect(this.tapeD.delayTime);
    this.hiss=c.createBufferSource(); this.hiss.buffer=this.noise; this.hiss.loop=true; const hhp=c.createBiquadFilter(); hhp.type="highpass"; hhp.frequency.value=2500;
    this.hissG=c.createGain(); this.hiss.connect(hhp); hhp.connect(this.hissG); this.hissG.connect(this.lim);
    this.wow.start(); this.flut.start(); this.hiss.start();
    this.irBuf=this.ir(2.6); this.roomBase=.1; this.hallHeld=false; this.hissOn=false;
    // Weiche Sättigung mit Steigung 1, damit die Echo-Schleife immer ausklingt
    this.soft=new Float32Array(1024); for(let i=0;i<1024;i++){const x=i/1023*2-1; this.soft[i]=Math.tanh(1.5*x)/1.5;}
    this.setKey(9,"minor");
    this.trk={}; SLOTS.forEach(k=>this.trk[k]={vol:.8,mute:false,pitch:0,decay:1,tone:1,echo:0}); this.pcache={};
    this.bus.disconnect(); this.buildFx();
    this.setDrive(.45); this.setTape(.3); this.setLow(.5); this.setRoom(.25); this.setBpm(76);
  }
  // Eingangsbus, Echo und Hall. Wird bei "stop" neu gebaut: alle laufenden und vorgemerkten Klänge
  // und alle Echo-/Hall-Fahnen hängen dann am alten, stummgeschalteten Bus und verstummen sofort.
  buildFx(){
    const c=this.ctx;
    this.bus=c.createGain(); this.bus.connect(this.tapeD);
    this.dIn=c.createGain(); this.delay=c.createDelay(2); this.delay.delayTime.value=60/this.bpm*.75; this.fb=c.createGain(); this.fb.gain.value=.5;
    const dhp=c.createBiquadFilter(); dhp.type="highpass"; dhp.frequency.value=380; const dlp=c.createBiquadFilter(); dlp.type="lowpass"; dlp.frequency.value=2600;
    this.dShape=c.createWaveShaper(); this.dShape.curve=this.soft; this.dRet=c.createGain(); this.dRet.gain.value=.85;
    this.dIn.connect(this.delay); this.delay.connect(dhp); dhp.connect(dlp); dlp.connect(this.dShape); this.dShape.connect(this.fb); this.fb.connect(this.delay); this.dShape.connect(this.dRet); this.dRet.connect(this.pre);
    this.throwG=c.createGain(); this.throwG.gain.value=0; this.bus.connect(this.throwG); this.throwG.connect(this.dIn);
    this.rIn=c.createGain(); this.conv=c.createConvolver(); this.conv.buffer=this.irBuf; this.rRet=c.createGain(); this.rRet.gain.value=.9;
    const rhp=c.createBiquadFilter(); rhp.type="highpass"; rhp.frequency.value=250;
    this.rIn.connect(rhp); rhp.connect(this.conv); this.conv.connect(this.rRet); this.rRet.connect(this.post);
    this.roomG=c.createGain(); this.roomG.gain.value=this.hallHeld?.9:this.roomBase; this.bus.connect(this.roomG); this.roomG.connect(this.rIn);
    // Mischpult: ein Kanal pro Spur mit Klangfilter, Lautstärke/Stumm, Echo- und Hall-Send
    this.ch={}; SLOTS.forEach(k=>{const i=c.createGain(),tn=c.createBiquadFilter();tn.type="lowpass";tn.Q.value=.6;const v=c.createGain(),e=c.createGain(),r=c.createGain();
      i.connect(tn);tn.connect(v);v.connect(this.bus);v.connect(e);e.connect(this.dIn);v.connect(r);r.connect(this.rIn);this.ch[k]={in:i,tone:tn,vol:v,echo:e,room:r};});
    this.applyTracks(true);
  }
  applyTracks(now){const t=this.ctx.currentTime,sd=this.kit.send;
    SLOTS.forEach(k=>{const tr=this.trk[k],ch=this.ch[k],set=(prm,val)=>now?prm.value=val:prm.setTargetAtTime(val,t,.02);
      set(ch.vol.gain,tr.mute?0:Math.pow(tr.vol/.8,2));set(ch.tone.frequency,200*Math.pow(100,tr.tone));
      set(ch.echo.gain,(sd.echo[k]||0)+tr.echo*.8);set(ch.room.gain,sd.room[k]||0);});}
  setKey(pc,scale){this.keyOff=pcToOff(pc);this.scale=SCALES[scale];this.chords=chordSet(this.keyOff,scale);}
  setTrack(k,key,val){this.trk[k][key]=val;this.pcache={};this.applyTracks();}
  // Kit-Parameter einer Spur, angepasst an die Regler "pitch" und "decay"
  P(k){const key=k+"|"+this.kitName;if(this.pcache[key])return this.pcache[key];
    const tr=this.trk[k],r=(k==="bass"||k==="skank")?1:Math.pow(2,tr.pitch/12),p=Object.assign({},this.kit[k]);
    FREQ.forEach(f=>{if(typeof p[f]==="number")p[f]*=r;});if(p.ring)p.ring=p.ring.map(x=>x*r);
    DEC.forEach(f=>{if(typeof p[f]==="number")p[f]*=tr.decay;});return this.pcache[key]=p;}
  filterHold(on){const t=this.ctx.currentTime;this.fxLP.frequency.cancelScheduledValues(t);this.fxLP.frequency.setTargetAtTime(on?380:20000,t,on?.18:.06);this.fxLP.Q.setTargetAtTime(on?5:.7,t,.05);}
  panic(){
    const c=this.ctx,t=c.currentTime,old=[this.bus,this.dRet,this.rRet];
    old.forEach(g=>{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+.025);});
    setTimeout(()=>old.forEach(g=>{try{g.disconnect();}catch(e){}}),120);
    this.hallHeld=false; this.buildFx();
    this.hissOn=false; this.hissG.gain.setTargetAtTime(0,t,.05);
  }
  wake(){if(!this.hissOn){this.hissOn=true;this.hissG.gain.setTargetAtTime(this.tape*.012,this.ctx.currentTime,.05);}}
  curve(k){k=Math.round(k*20)/20; if(this.curves[k])return this.curves[k]; const n=2048,a=new Float32Array(n),t=Math.tanh(k);
    for(let i=0;i<n;i++){const x=i/(n-1)*2-1; a[i]=Math.tanh(k*x)/t;} return this.curves[k]=a;}
  ir(sec){const c=this.ctx,len=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,len,c.sampleRate);
    for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<len;i++){const t=i/len;lp=lp*.55+(Math.random()*2-1)*.45;
      d[i]=lp*Math.pow(1-t,2.6)*(1+.35*Math.sin(i/c.sampleRate*2*Math.PI*(9+ch)));}} return b;}
  setKit(k){this.kitName=k;this.kit=KITS[k];this.pcache={};if(this.ch)this.applyTracks();const e=this.kit.lowSoft||0;this.emDown.gain.value=-e;this.emUp.gain.value=e;}
  setBpm(b){this.bpm=b;const t=this.ctx.currentTime;this.delay.delayTime.setTargetAtTime(60/b*.75,t,.05);}
  setDrive(v){this.drive=v;if(!this.tube){this.tube=new Float32Array(2048);for(let i=0;i<2048;i++){const x=i/2047*2-1;this.tube[i]=Math.tanh(2*x+.08*x*x)/2;}this.shape.curve=this.tube;}this.pre.gain.value=.6+v*1.8;this.post.gain.value=2/(.6+v*1.8)*(1-v*.25);}
  setTape(v){this.tape=v;this.wowG.gain.value=v*.0011;this.flutG.gain.value=v*.00012;this.hissG.gain.value=this.hissOn?v*.012:0;this.tapeLP.frequency.value=19000-v*10500;}
  setLow(v){this.low.gain.value=-8+v*17;}
  setRoom(v){this.roomBase=v*.45;if(!this.hallHeld)this.roomG.gain.setTargetAtTime(this.roomBase,this.ctx.currentTime,.03);}
  echoHold(on){const t=this.ctx.currentTime;this.throwG.gain.setTargetAtTime(on?.85:0,t,.02);this.fb.gain.setTargetAtTime(on?.64:.5,t,.05);}
  hallHold(on){this.hallHeld=on;this.roomG.gain.setTargetAtTime(on?.9:this.roomBase,this.ctx.currentTime,.04);}
  // Ausgang eines Sounds mit festen Sends pro Kit
  route(node,s){node.connect(this.ch[s].in);if(this._thr){const g=this.ctx.createGain();g.gain.value=.9;node.connect(g);g.connect(this.dIn);}}
  env(p,t,a,peak,d){p.setValueAtTime(0,t);p.linearRampToValueAtTime(peak,t+a);p.exponentialRampToValueAtTime(.0001,t+a+d);}
  nz(t,dur){const s=this.ctx.createBufferSource();s.buffer=this.noise;s.start(t,Math.random()*1.4,dur+.05);return s;}
  hit(s,t){if(this.onHit)this.onHit(s,t);}
  // opt.thr: nur dieser Schlag geht ins Echo (Echo-Wurf); opt.strum: Akkord wird gestrummt
  play(s,t,v=1,opt={}){this._thr=!!opt.thr;try{return this._play(s,t,v,opt);}finally{this._thr=false;}}
  _play(s,t,v=1,opt={}){t=Math.max(t,this.ctx.currentTime);this.wake();
    if(s==="bass")return this.bassNote(opt.note||0,t,v,opt.len,opt.from);
    if(s==="skank")return this.skankChord(opt.chord||0,t,v,opt.strum);
    this[s](t,v*rnd(.12));this.hit(s,t);}
  kick(t,v){const c=this.ctx,p=this.P("kick"),h=rnd(.025),att=p.att||.002;
    const o=c.createOscillator();o.type="sine";o.frequency.setValueAtTime(p.f0*h,t);o.frequency.exponentialRampToValueAtTime(p.f1*h,t+p.sweep);o.frequency.setTargetAtTime(p.f1*h*.9,t+p.sweep,p.decay);
    const sh=c.createWaveShaper();sh.curve=this.curve(p.drive);const g=c.createGain();this.env(g.gain,t,att,.95*v*p.lvl,p.decay);
    o.connect(sh);let last=sh;
    if(p.lp){const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=p.lp;lp.Q.value=.6;sh.connect(lp);last=lp;}
    last.connect(g);this.route(g,"kick");o.start(t);o.stop(t+p.decay+.1);
    if(p.body){const b=c.createOscillator();b.type="sine";b.frequency.setValueAtTime(p.f1*h*2.3,t);b.frequency.exponentialRampToValueAtTime(p.f1*h*1.6,t+.05);
      const bg=c.createGain();this.env(bg.gain,t,.003,p.body*v,.07);b.connect(bg);bg.connect(g);b.start(t);b.stop(t+.12);}
    const n=this.nz(t,.02),bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=p.clickF||3200;bp.Q.value=.8;const ng=c.createGain();this.env(ng.gain,t,.0008,p.click*v,.012);
    n.connect(bp);bp.connect(ng);ng.connect(this.ch.kick.in);}
  snare(t,v){const c=this.ctx,p=this.P("snare"),h=rnd(.03),g=c.createGain();this.env(g.gain,t,.001,p.tl*v*p.lvl,p.tdec);
    [p.t1,p.t2].forEach((f,i)=>{const o=c.createOscillator();o.type="triangle";o.frequency.setValueAtTime(f*h*1.12,t);o.frequency.exponentialRampToValueAtTime(f*h,t+.03);
      const og=c.createGain();og.gain.value=i?.5:1;o.connect(og);og.connect(g);o.start(t);o.stop(t+p.tdec+.05);});
    const n=this.nz(t,p.ndec+.05),hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=p.hp;const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=p.nf*rnd(.08);bp.Q.value=p.nq;
    const ng=c.createGain();this.env(ng.gain,t,.001,p.noise*v*p.lvl,p.ndec*rnd(.15));n.connect(hp);hp.connect(bp);bp.connect(ng);
    const sh=c.createWaveShaper();sh.curve=this.curve(2);g.connect(sh);ng.connect(sh);this.route(sh,"snare");}
  rim(t,v){const c=this.ctx,p=this.P("rim");
    if(p.type==="clap"){const n=this.nz(t,.4),bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1150*rnd(.1);bp.Q.value=1.1;const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=550;
      const g=c.createGain(),a=p.lvl*v;g.gain.setValueAtTime(0,t);let o=0;
      for(let k=0;k<4;k++){const amp=a*(k===3?1:.55+Math.random()*.3);g.gain.setValueAtTime(amp,t+o);g.gain.exponentialRampToValueAtTime(amp*.1,t+o+.008);o+=.007+Math.random()*.007;}
      g.gain.setValueAtTime(a*.85,t+o);g.gain.exponentialRampToValueAtTime(.0001,t+o+.2*rnd(.2));n.connect(hp);hp.connect(bp);bp.connect(g);this.route(g,"rim");return;}
    const h=rnd(.03),g=c.createGain();g.gain.value=p.lvl*v;
    const body=c.createGain();this.env(body.gain,t,.0008,1,p.dec);const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=p.f*h;bp.Q.value=2.5;
    [[p.f,"triangle"],[p.f2,"square"]].forEach(([f,w])=>{const o=c.createOscillator();o.type=w;o.frequency.value=f*h;o.connect(bp);o.start(t);o.stop(t+p.dec+.05);});
    bp.connect(body);body.connect(g);
    // Blech-Anteil: unharmonische Teiltöne, die nachklingen
    (p.ring||[]).forEach((f,i)=>{const o=c.createOscillator();o.type=i?"sine":"triangle";o.frequency.value=f*h;const rg=c.createGain();const d=p.ringDec*(1-i*.18);
      this.env(rg.gain,t,.0006,p.ringLvl*(1-i*.22),d);o.connect(rg);rg.connect(g);o.start(t);o.stop(t+d+.05);});
    const n=this.nz(t,.03),nh=c.createBiquadFilter();nh.type="highpass";nh.frequency.value=2800;const ng=c.createGain();this.env(ng.gain,t,.0003,.35,.018);n.connect(nh);nh.connect(ng);ng.connect(g);
    this.route(g,"rim");}
  hat(t,v){const c=this.ctx,p=this.P("hat"),bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=p.bp;bp.Q.value=.9;const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=p.hp;
    const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=p.lp;const g=c.createGain();const d=p.dec*rnd(.25);this.env(g.gain,t,.0008,p.lvl*v,d);
    const mg=c.createGain();mg.gain.value=p.metal;mg.connect(bp);
    const base=40*rnd(.01);[2,3,4.16,5.43,6.79,8.21].forEach(r=>{const o=c.createOscillator();o.type="square";o.frequency.value=base*r;o.connect(mg);o.start(t);o.stop(t+d+.05);});
    const n=this.nz(t,d),ng=c.createGain();ng.gain.value=p.noise;n.connect(ng);ng.connect(bp);bp.connect(hp);hp.connect(lp);lp.connect(g);this.route(g,"hat");}
  // Handtrommel als Membran: unharmonische Schwingungsmoden, Fell-Rauschen und Schlaggeräusch
  perc(t,v){const c=this.ctx,p=this.P("perc"),h=rnd(.035),f=p.f*h,g=c.createGain();g.gain.value=p.lvl*v;
    p.modes.forEach(([r,l,dm],i)=>{const o=c.createOscillator();o.type="sine";const fr=f*r*(i?rnd(.01):1);
      o.frequency.setValueAtTime(fr*p.drop,t);o.frequency.setTargetAtTime(fr,t,p.dropT);
      const mg=c.createGain();const d=p.dec*dm*rnd(.12);this.env(mg.gain,t,.0012,l,d);o.connect(mg);mg.connect(g);o.start(t);o.stop(t+d+.05);});
    const ex=this.nz(t,.012),eg=c.createGain();this.env(eg.gain,t,.0005,1,.006);ex.connect(eg);
    [[1,14],[1.59,10],[2.14,8]].forEach(([r,q])=>{const b=c.createBiquadFilter();b.type="bandpass";b.frequency.value=f*r;b.Q.value=q;const bg=c.createGain();bg.gain.value=p.skin*3.2/r;eg.connect(b);b.connect(bg);bg.connect(g);});
    const s=this.nz(t,.04),sb=c.createBiquadFilter();sb.type="bandpass";sb.frequency.value=p.slapF*rnd(.1);sb.Q.value=.9;const sg=c.createGain();this.env(sg.gain,t,.0004,p.slap,.02*rnd(.3));s.connect(sb);sb.connect(sg);sg.connect(g);
    if(p.drive){const sh=c.createWaveShaper();sh.curve=this.curve(p.drive);g.connect(sh);this.route(sh,"perc");}else this.route(g,"perc");}
  bassNote(i,t,v=1,len,from){const c=this.ctx,p=this.P("bass"),f=55*Math.pow(2,(this.scale[i]+this.keyOff+this.trk.bass.pitch)/12)*rnd(.004),d=Math.max(.05,len?len*this.trk.bass.decay:p.dec);v*=rnd(.08);
    const g=c.createGain(),L=p.lvl*v;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(L,t+(p.att||.006));g.gain.setTargetAtTime(L*(p.sus||.75),t+.03,.12);g.gain.setValueAtTime(L*(p.sus||.75)*.93,t+d);g.gain.exponentialRampToValueAtTime(.0001,t+d+(p.rel||.08));
    const end=t+d+(p.rel||.08)+.05,oscs=[];
    const osc=(type,fr,det=0)=>{const o=c.createOscillator();o.type=type;o.detune.value=det;
      if(from){o.frequency.setValueAtTime(from*fr/f,t);o.frequency.setTargetAtTime(fr,t,.045);}else if(p.pluck){o.frequency.setValueAtTime(fr*p.pluck,t);o.frequency.setTargetAtTime(fr,t,p.pluckT||.025);}else o.frequency.value=fr;oscs.push(o);return o;};
    const sh=c.createWaveShaper();sh.curve=this.curve(p.drive);
    if(p.type==="growl"){// knarzender Bass: zwei leicht verstimmte Sägezähne, resonantes Filter mit "Wah"-Hüllkurve, Mitten-Nase
      const mix=c.createGain();[[0,.5],[9,.42]].forEach(([dt,l])=>{const o=osc("sawtooth",f,dt),og=c.createGain();og.gain.value=l;o.connect(og);og.connect(mix);});
      const lp=c.createBiquadFilter();lp.type="lowpass";lp.Q.value=p.res;lp.frequency.setValueAtTime(p.cut+p.env*v,t);lp.frequency.setTargetAtTime(p.cut,t+.005,.09);
      const lp2=c.createBiquadFilter();lp2.type="lowpass";lp2.frequency.value=p.cut*3;lp2.Q.value=.5;
      const honk=c.createBiquadFilter();honk.type="peaking";honk.frequency.value=780;honk.Q.value=1.3;honk.gain.value=6;
      mix.connect(lp);lp.connect(lp2);lp2.connect(sh);sh.connect(honk);
      const sub=osc("sine",f),sg=c.createGain();sg.gain.value=p.sub;sub.connect(sg);
      const post=c.createBiquadFilter();post.type="lowpass";post.frequency.value=2600;honk.connect(post);post.connect(g);sg.connect(g);}
    else if(p.type==="string"){// gezupfte Saite (Karplus-Strong), dazu etwas Sinus für das Fundament und ein Bass-Amp-artiges Klangbild
      const src=c.createBufferSource();src.buffer=this.pluckBuf(f,p,v);if(from){src.playbackRate.setValueAtTime(from/f,t);src.playbackRate.setTargetAtTime(1,t,.045);}
      const body=c.createBiquadFilter();body.type="peaking";body.frequency.value=110;body.Q.value=.8;body.gain.value=p.boost||3.5;body.frequency.value=95;
      const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=p.cut;lp.Q.value=.55;
      const sub=c.createOscillator();sub.type="sine";sub.frequency.value=f;oscs.push(sub);const sg=c.createGain();sg.gain.value=p.sub;
      src.connect(body);body.connect(lp);lp.connect(sh);sub.connect(sg);sg.connect(sh);const pl=c.createBiquadFilter();pl.type="lowpass";pl.frequency.value=p.post||20000;pl.Q.value=.5;sh.connect(pl);pl.connect(g);src.start(t);src.stop(end);}
    else if(p.type==="808"){// Sub-Boom: Sinus mit kurzem Tonhöhen-Sturz, kräftig gesättigt, damit er auch auf kleinen Boxen hörbar ist
      const o=c.createOscillator();o.type="sine";if(from){o.frequency.setValueAtTime(from,t);o.frequency.setTargetAtTime(f,t,.045);}else{o.frequency.setValueAtTime(f*p.boom,t);o.frequency.setTargetAtTime(f,t,.018);}oscs.push(o);
      const pre=c.createGain();pre.gain.value=1.4;const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=p.cut;lp.Q.value=.7;
      o.connect(pre);pre.connect(sh);sh.connect(lp);lp.connect(g);
      const n=this.nz(t,.02),nb=c.createBiquadFilter();nb.type="bandpass";nb.frequency.value=1800;const ng=c.createGain();this.env(ng.gain,t,.0005,p.click*v,.008);n.connect(nb);nb.connect(ng);ng.connect(g);}
    else{// rund und tief (dub)
      const o1=osc(p.wave,f),o2=osc("sine",f);const g1=c.createGain();g1.gain.value=p.saw;const g2=c.createGain();g2.gain.value=p.sub;
      const f1=c.createBiquadFilter();f1.type="lowpass";f1.Q.value=p.res;f1.frequency.setValueAtTime(p.cut+p.env*v,t);f1.frequency.setTargetAtTime(p.cut,t+.005,.07);
      const f2=c.createBiquadFilter();f2.type="lowpass";f2.frequency.value=p.cut*1.8;f2.Q.value=.6;
      o1.connect(g1);g1.connect(f1);f1.connect(f2);o2.connect(g2);g2.connect(f2);f2.connect(sh);sh.connect(g);}
    if(p.thump){const n=this.nz(t,.03),nl=c.createBiquadFilter();nl.type="lowpass";nl.frequency.value=650;const ng=c.createGain();this.env(ng.gain,t,.001,p.thump*v,.018);n.connect(nl);nl.connect(ng);ng.connect(g);}
    this.route(g,"bass");oscs.forEach(o=>{o.start(t);o.stop(end);});this.hit("bass",t);return f;}
  pluckBuf(f,p,v){const sr=this.ctx.sampleRate,len=Math.floor(sr*1.6),b=this.ctx.createBuffer(1,len,sr),y=b.getChannelData(0);
    const D=sr/f-.5,N=Math.ceil(D)+2,ex=new Float32Array(N);let lp=0;
    for(let i=0;i<N;i++){lp+=(Math.random()*2-1-lp)*p.soft;ex[i]=lp;}
    const pk=Math.floor(N*p.pick);for(let i=N-1;i>=pk;i--)ex[i]-=ex[i-pk];
    let prev=0,mx=0;const g=p.damp,br=p.bright;
    for(let n=0;n<len;n++){let s=n<N?ex[n]:0;const r=n-D;
      if(r>=1){const i=Math.floor(r),fr=r-i,x=y[i]*(1-fr)+y[i+1]*fr;const filt=br*x+(1-br)*prev;prev=filt;s+=g*filt;}
      y[n]=s;const a=Math.abs(s);if(a>mx)mx=a;}
    const k=1/(mx||1);for(let n=0;n<len;n++)y[n]*=k;return b;}
  skankChord(i,t,v=1,strum){const c=this.ctx,p=this.P("skank"),notes=this.chords[i];v*=rnd(.1);
    const g=c.createGain(),lvl=p.lvl*v/Math.sqrt(notes.length);const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=p.type==="chop"?420:260;
    const lp=c.createBiquadFilter();lp.type="lowpass";lp.Q.value=.9;lp.frequency.value=p.cut;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl,t+.003);g.gain.setTargetAtTime(lvl*.35,t+.01,p.dec*.5);g.gain.setValueAtTime(lvl*.3,t+p.dec);g.gain.exponentialRampToValueAtTime(.0001,t+p.dec+.05);
    const end=t+p.dec+.1;
    notes.forEach((m,ni)=>{const f=mtof(m+p.oct+this.trk.skank.pitch)*rnd(.003),tn=t+(strum?ni*.026:ni*.004*Math.random());
      if(p.type==="organ"){[[f,"square",.45],[f*2,"sine",.5],[f*.5,"sine",.35]].forEach(([fr,w,l])=>{const o=c.createOscillator();o.type=w;o.frequency.value=fr;const og=c.createGain();og.gain.value=l;o.connect(og);og.connect(lp);o.start(tn);o.stop(end);});}
      else if(p.type==="keys"){// E-Piano per FM: Anschlag hell, klingt weich aus
        const car=c.createOscillator();car.type="sine";car.frequency.value=f;const mod=c.createOscillator();mod.type="sine";mod.frequency.value=f;
        const mi=c.createGain();mi.gain.setValueAtTime(f*2.6,tn);mi.gain.setTargetAtTime(f*.35,tn,.04);mod.connect(mi);mi.connect(car.frequency);
        const tine=c.createOscillator();tine.type="sine";tine.frequency.value=f*7.02;const tg=c.createGain();this.env(tg.gain,tn,.001,.12,.05);tine.connect(tg);tg.connect(lp);
        const cg=c.createGain();cg.gain.value=.8;car.connect(cg);cg.connect(lp);[car,mod,tine].forEach(o=>{o.start(tn);o.stop(end);});}
      else{const o=c.createOscillator();o.type="sawtooth";o.frequency.value=f;const o2=c.createOscillator();o2.type="square";o2.frequency.value=f*1.002;const og=c.createGain();og.gain.value=.5;o.connect(lp);o2.connect(og);og.connect(lp);o.start(tn);o2.start(tn);o.stop(end);o2.stop(end);}});
    if(p.type==="chop"){const bp=c.createBiquadFilter();bp.type="peaking";bp.frequency.value=1300;bp.Q.value=1.4;bp.gain.value=7;lp.connect(bp);bp.connect(hp);
      const n=this.nz(t,.02),nf=c.createBiquadFilter();nf.type="bandpass";nf.frequency.value=2500;const ng=c.createGain();this.env(ng.gain,t,.0005,.12*v,.012);n.connect(nf);nf.connect(ng);ng.connect(g);}
    else lp.connect(hp);
    hp.connect(g);this.route(g,"skank");this.hit("skank",t);}
  // FX-Spur: "siren" (pro Kit) und weitere Dub-/Dancehall-Effekte. Halten-Effekte (siren, horn, riser) klingen bis stop().
  fxStart(type,t0){const c=this.ctx,t=Math.max(t0||0,c.currentTime+.005);type=FX_TYPES[type]||type;
    if(!type||type==="siren")return this.sirenStart(t);this.wake();
    const g=c.createGain(),tr=this.trk.siren,pr=Math.pow(2,tr.pitch/12),dm=tr.decay,nodes=[],N=o=>{nodes.push(o);return o;};
    this.route(g,"siren");this.hit("siren",t);let sustain=false,dur=1;
    if(type==="horn"){sustain=true;const sh=c.createWaveShaper();sh.curve=this.curve(3);const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1500;bp.Q.value=.6;
      const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=180;
      [[466,.5],[349,.45],[233,.4],[587,.25]].forEach(([f,l],i)=>{const o=N(c.createOscillator());o.type="sawtooth";o.frequency.setValueAtTime(f*pr*.94,t);o.frequency.setTargetAtTime(f*pr,t,.025);o.detune.value=(i-1.5)*7;
        const og=c.createGain();og.gain.value=l;o.connect(og);og.connect(sh);});
      sh.connect(hp);hp.connect(bp);bp.connect(g);const L=.13;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(L,t+.015);g.gain.setValueAtTime(L,t+.1);g.gain.linearRampToValueAtTime(.01,t+.12);
      g.gain.linearRampToValueAtTime(L,t+.15);g.gain.setValueAtTime(L,t+.24);g.gain.linearRampToValueAtTime(.01,t+.26);g.gain.linearRampToValueAtTime(L,t+.29);}
    else if(type==="laser"){dur=.5*dm;const o=N(c.createOscillator());o.type="square";o.frequency.setValueAtTime(2600*pr,t);o.frequency.exponentialRampToValueAtTime(160*pr,t+.3*dm);
      const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=3200;lp.Q.value=4;o.connect(lp);lp.connect(g);this.env(g.gain,t,.002,.13,.32*dm);}
    else if(type==="bomb"){dur=1.8*dm;const sh=c.createWaveShaper();sh.curve=this.curve(3.5);const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=900;
      [[1,1],[2,.35]].forEach(([m,l])=>{const o=N(c.createOscillator());o.type="sine";o.frequency.setValueAtTime(170*pr*m,t);o.frequency.exponentialRampToValueAtTime(30*pr*m,t+1.4*dm);
        const og=c.createGain();og.gain.value=l;o.connect(og);og.connect(sh);});sh.connect(lp);lp.connect(g);
      const n=this.nz(t,1.6*dm),nl=c.createBiquadFilter();nl.type="lowpass";nl.frequency.value=180;const ng=c.createGain();this.env(ng.gain,t,.01,.8,1.3*dm);n.connect(nl);nl.connect(ng);ng.connect(g);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.28,t+.02);g.gain.setTargetAtTime(0,t+.2,.5*dm);}
    else if(type==="spring"){dur=1.6*dm;const n=this.nz(t,.05),ng=c.createGain();this.env(ng.gain,t,.0005,1,.025);n.connect(ng);
      [[380,9,.9],[950,10,.6],[2100,8,.35],[3300,6,.2]].forEach(([f,q,l])=>{const b=c.createBiquadFilter();b.type="bandpass";b.Q.value=q;b.frequency.setValueAtTime(f*pr*1.7,t);b.frequency.setTargetAtTime(f*pr,t,.06);
        const bg=c.createGain();bg.gain.value=l*3;ng.connect(b);b.connect(bg);bg.connect(g);});
      g.gain.setValueAtTime(.85,t);const rs=c.createGain();rs.gain.value=2;g.connect(rs);rs.connect(this.rIn);const ds=c.createGain();ds.gain.value=.25;g.connect(ds);ds.connect(this.dIn);}
    else if(type==="riser"){sustain=true;const n=N(c.createBufferSource());n.buffer=this.noise;n.loop=true;const bp=c.createBiquadFilter();bp.type="bandpass";bp.Q.value=3.5;
      bp.frequency.setValueAtTime(280*pr,t);bp.frequency.setTargetAtTime(7000*pr,t,1.5*dm);n.connect(bp);bp.connect(g);
      const o=N(c.createOscillator());o.type="triangle";o.frequency.setValueAtTime(180*pr,t);o.frequency.setTargetAtTime(1400*pr,t,1.6*dm);const og=c.createGain();og.gain.value=.08;o.connect(og);og.connect(g);
      g.gain.setValueAtTime(.005,t);g.gain.setTargetAtTime(.22,t,1.1*dm);}
    else if(type==="rewind"){dur=1.25*dm;// Platte zurückdrehen: Tonhöhe flattert und steigt, Rauschen läuft mit
      const o=N(c.createOscillator());o.type="sawtooth";o.frequency.setValueAtTime(110*pr,t);o.frequency.exponentialRampToValueAtTime(520*pr,t+1.1*dm);
      const l=N(c.createOscillator());l.type="sine";l.frequency.setValueAtTime(7,t);l.frequency.linearRampToValueAtTime(22,t+1.1*dm);const lg=c.createGain();lg.gain.setValueAtTime(70*pr,t);lg.gain.linearRampToValueAtTime(260*pr,t+1.1*dm);l.connect(lg);lg.connect(o.frequency);
      const n=N(c.createBufferSource());n.buffer=this.noise;n.loop=true;const bp=c.createBiquadFilter();bp.type="bandpass";bp.Q.value=2.2;bp.frequency.setValueAtTime(500*pr,t);bp.frequency.exponentialRampToValueAtTime(3200*pr,t+1.1*dm);
      const ng=c.createGain();ng.gain.value=.55;n.connect(bp);bp.connect(ng);ng.connect(g);
      const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2600;const og=c.createGain();og.gain.value=.5;o.connect(lp);lp.connect(og);og.connect(g);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.14,t+.05);g.gain.setValueAtTime(.16,t+1.05*dm);g.gain.linearRampToValueAtTime(0,t+1.2*dm);}
    else if(type==="whistle"){sustain=true;// Trillerpfeife: hoher Ton mit schnellem Flattern, dazu Luftgeräusch
      const o=N(c.createOscillator());o.type="sine";o.frequency.value=2750*pr;const l=N(c.createOscillator());l.type="triangle";l.frequency.value=31;const lg=c.createGain();lg.gain.value=190*pr;l.connect(lg);lg.connect(o.frequency);
      const am=c.createGain();am.gain.value=.75;const al=c.createGain();al.gain.value=.25;l.connect(al);al.connect(am.gain);o.connect(am);am.connect(g);
      const n=N(c.createBufferSource());n.buffer=this.noise;n.loop=true;const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=2900*pr;bp.Q.value=2;const ng=c.createGain();ng.gain.value=.18;n.connect(bp);bp.connect(ng);ng.connect(g);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.085,t+.012);}
    nodes.forEach(o=>o.start(t));const end=e=>nodes.forEach(o=>{try{o.stop(e+.6);}catch(_){}});
    if(!sustain){end(t+dur);return{stop(){}};}
    return{stop:(at)=>{const now=c.currentTime,e=Math.max(at||0,now);if(e>now+.01){g.gain.cancelScheduledValues(e);g.gain.setTargetAtTime(0,e,.07);}
      else{g.gain.cancelScheduledValues(now);g.gain.setValueAtTime(g.gain.value,now);g.gain.setTargetAtTime(0,now,.07);}end(e);}};}
  sirenStart(t0){const c=this.ctx,p=this.P("siren"),t=Math.max(t0||0,c.currentTime+.005);this.wake();
    const o=c.createOscillator();o.type=p.wave;o.frequency.setValueAtTime(p.base,t);o.frequency.setTargetAtTime(p.base*1.6,t,1.6);
    const l=c.createOscillator();l.type=p.lfo;l.frequency.value=p.rate;const lg=c.createGain();lg.gain.value=p.depth;l.connect(lg);lg.connect(o.frequency);
    const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2800;const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(p.lvl,t+.04);
    o.connect(lp);lp.connect(g);this.route(g,"siren");o.start(t);l.start(t);this.hit("siren",t);
    return{stop:(at)=>{const now=c.currentTime,e=Math.max(at||0,now);if(e>now+.01)g.gain.setTargetAtTime(0,e,.08);else{g.gain.cancelScheduledValues(now);g.gain.setValueAtTime(g.gain.value,now);g.gain.setTargetAtTime(0,now,.08);}o.stop(e+.6);l.stop(e+.6);}};}
}
// Demo-Grooves, je 2 Takte à 16 Steps
const rep=(a)=>a.concat(a.map(s=>s+16));
const DEMOS={
  roots:{kick:rep([8]),snare:rep([8]),rim:[],hat:rep([0,2,4,6,8,10,12,14]),perc:[6,15,22,29,31],
    bass:[[0,0,2.6],[3,0,1],[6,2,1.8],[10,4,1.8],[14,3,1],[16,3,2.6],[19,3,1],[22,5,1.8],[26,4,1.8],[30,6,1]],
    skank:[[4,0],[12,0],[20,2],[28,2]]},
  dancehall:{kick:rep([0,4,8,12]),snare:rep([3,6,11,14]),rim:rep([4,12]),hat:rep([0,2,4,6,7,8,10,12,14,15]),perc:[10,26,30],
    bass:[[0,0,.8],[3,0,.8],[6,0,.8],[8,2,.8],[11,3,.8],[14,4,.8],[16,5,.8],[19,5,.8],[22,5,.8],[24,4,.8],[27,3,.8],[30,2,.8]],
    skank:[[2,0],[6,0],[10,0],[14,0],[18,4],[22,4],[26,5],[30,5]]},
  dub:{kick:rep([0,4,8,12]),snare:[8,24],rim:[8,24,30],hat:rep([2,6,10,14]),perc:[15,29,31],
    bass:[[0,0,3.6],[6,0,1.6],[8,4,3.6],[14,3,1.6],[16,3,3.6],[22,3,1.6],[24,5,3.6],[30,4,1.6]],
    skank:[[4,0],[12,0],[20,2],[28,2]]}
};
Object.keys(DEMOS).forEach(k=>KITS[k].demo=DEMOS[k]);
G.RB={Engine,KITS,DEMOS,SLOTS,NOTE_NAMES,CHORD_NAMES,keyInfo,FX_TYPES,
  // plant die Events eines Steps ein (wird vom Live-Scheduler und vom Offline-Test genutzt)
  scheduleStep(eng,demo,step,t,stepDur){
    ["kick","snare","rim","perc"].forEach(s=>{if(demo[s].includes(step))eng.play(s,t,s==="kick"?1:.9);});
    if(demo.hat.includes(step))eng.play("hat",t,step%4===0?.85:(step%2?.45:.6));
    demo.bass.forEach(([st,n,len])=>{if(st===step)eng.play("bass",t,.95,{note:n,len:len*stepDur});});
    demo.skank.forEach(([st,ch])=>{if(st===step)eng.play("skank",t,.9,{chord:ch});});
  }};
})(window);

