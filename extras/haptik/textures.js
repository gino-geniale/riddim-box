/* Material-Texturen: Höhenkarte aus gefiltertem Rauschen, beleuchtet von oben links (Mikro-Relief wie erodierter Spritzguss).
   Ergebnis ist ein helles Graustufenbild um ~240, das per background-blend-mode:multiply über die Grundfarbe gelegt wird. */
(function(){
  function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function blur(a,N,r){const o=new Float32Array(a.length),w=2*r+1;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=0;for(let k=-r;k<=r;k++)s+=a[y*N+((x+k+N)%N)];o[y*N+x]=s/w;}
    const p=new Float32Array(a.length);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=0;for(let k=-r;k<=r;k++)s+=o[((y+k+N)%N)*N+x];p[y*N+x]=s/w;}return p;}
  function smoothNoise(N,cells,rand){const g=new Float32Array(cells*cells).map(()=>rand()),o=new Float32Array(N*N);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const fx=x/N*cells,fy=y/N*cells,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
      const a=g[(y0%cells)*cells+x0%cells],b=g[(y0%cells)*cells+(x0+1)%cells],c=g[((y0+1)%cells)*cells+x0%cells],d=g[((y0+1)%cells)*cells+(x0+1)%cells];
      o[y*N+x]=(a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy;}return o;}
  function make(N,o){const rand=rng(o.seed||7);let h=new Float32Array(N*N).map(()=>rand());
    h=blur(h,N,o.blur);
    const m=smoothNoise(N,o.cells||8,rand);for(let i=0;i<h.length;i++)h[i]=h[i]+(m[i]-.5)*o.mottle;
    const cv=document.createElement("canvas");cv.width=cv.height=N;const cx=cv.getContext("2d"),img=cx.createImageData(N,N),D=img.data;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,hl=h[((y-1+N)%N)*N+(x-1+N)%N],hr=h[((y+1)%N)*N+(x+1)%N];
      let v=o.base+o.relief*(hl-hr)*255+(m[i]-.5)*o.tone*255+(rand()-.5)*o.grain;v=Math.max(0,Math.min(255,v));
      D[i*4]=v;D[i*4+1]=v*.995;D[i*4+2]=v*.985;D[i*4+3]=255;}
    cx.putImageData(img,0,0);return"url("+cv.toDataURL("image/png")+")";}
  try{const r=document.documentElement.style;
    r.setProperty("--tx-body",make(220,{seed:11,blur:1,mottle:.5,cells:6,base:242,relief:.11,tone:.04,grain:6}));
    r.setProperty("--tx-key",make(120,{seed:23,blur:1,mottle:.3,cells:4,base:246,relief:.07,tone:.03,grain:4}));
    r.setProperty("--tx-rubber",make(90,{seed:5,blur:0,mottle:.4,cells:3,base:240,relief:.04,tone:.05,grain:9}));
    r.setProperty("--tx-paper",make(200,{seed:3,blur:2,mottle:1,cells:5,base:238,relief:.3,tone:.12,grain:6}));
  }catch(e){}
})();
