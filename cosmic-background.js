/* Cached 2D star field + a few subtle live stars. No external images or tracking. */
(() => {
  const sky=document.querySelector(".cosmic-sky");
  const canvas=document.querySelector("#cosmic-background");
  if(!sky||!canvas)return;
  const ctx=canvas.getContext("2d",{alpha:false});
  if(!ctx)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const staticLayer=document.createElement("canvas");
  const starctx=staticLayer.getContext("2d");
  let width=1,height=1,dpr=1,stars=[],twinkles=[],frame=0,last=0,time=0,nextMeteor=6,meteor=null,resizeTimer;
  let seed=91827,meteorCount=0;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(.0001,random())))*Math.cos(Math.PI*2*random());
  function dot(context,x,y,radius,alpha,color){
    context.globalAlpha=alpha;context.fillStyle=color;context.beginPath();context.arc(x,y,radius,0,Math.PI*2);context.fill();
  }
  function cache() {
    seed=91827;
    width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,1.35);
    canvas.width=staticLayer.width=Math.round(width*dpr);
    canvas.height=staticLayer.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);starctx.setTransform(dpr,0,0,dpr,0,0);
    starctx.globalAlpha=1;starctx.fillStyle="#0c121b";starctx.fillRect(0,0,width,height);
    // Nebulae follow a broad diagonal band, with a darker dust lane through its core.
    for(let i=0;i<24;i++){
      const t=i/23,x=width*(t*1.25-.08),y=height*(.92-t*.88);
      const radius=Math.max(width,height)*(.12+random()*.1);
      const glow=starctx.createRadialGradient(x,y,0,x,y,radius);
      const hue=i%3===0?"106,119,177":i%3===1?"73,139,148":"146,110,159";
      glow.addColorStop(0,"rgba("+hue+",.025)");
      glow.addColorStop(.45,"rgba("+hue+",.014)");
      glow.addColorStop(1,"rgba("+hue+",0)");
      starctx.fillStyle=glow;starctx.fillRect(x-radius,y-radius,radius*2,radius*2);
    }
    stars=[];twinkles=[];
    const count=width<600?650:Math.min(1800,Math.round(width*height/800));
    const colors=["#cbd7ec","#dce7e3","#b7d1f2","#e7d7bf","#b7e1d7"];
    for(let i=0;i<count;i++){
      const band=i<count*.64;
      const t=random();
      let x,y;
      if(band){
        x=t*width; y=height*(.9-t*.76)+gaussian()*height*.08;
      }else{x=random()*width;y=random()*height;}
      if(y<0||y>height)continue;
      const star={x,y,radius:.25+Math.pow(random(),3)*.95,alpha:.12+random()*.37,color:colors[i%colors.length]};
      stars.push(star);
      dot(starctx,x,y,star.radius,star.alpha,star.color);
      if(i%37===0)twinkles.push({...star,phase:random()*Math.PI*2,speed:.3+random()*.4});
    }
    starctx.globalAlpha=1;
    sky.dataset.starCount=String(stars.length);
    sky.dataset.skyReady="true";
    meteor=null;draw();start();
  }
  function draw(){
    ctx.globalAlpha=1;ctx.drawImage(staticLayer,0,0,width,height);
    for(const star of twinkles){
      const brightness=.14+(.5+.5*Math.sin(time*star.speed+star.phase))*.28;
      const glow=ctx.createRadialGradient(star.x,star.y,0,star.x,star.y,star.radius*6);
      glow.addColorStop(0,"rgba(206,231,238,"+brightness.toFixed(3)+")");
      glow.addColorStop(1,"rgba(206,231,238,0)");
      ctx.fillStyle=glow;ctx.fillRect(star.x-star.radius*6,star.y-star.radius*6,star.radius*12,star.radius*12);
    }
    if(meteor){
      const p=Math.min(1,(time-meteor.start)/meteor.duration);
      const x=meteor.x+meteor.dx*p,y=meteor.y+meteor.dy*p;
      const tail=meteor.length*Math.min(1,p*6);
      const length=Math.hypot(meteor.dx,meteor.dy),ux=meteor.dx/length,uy=meteor.dy/length;
      const gradient=ctx.createLinearGradient(x-tail*ux,y-tail*uy,x,y);
      gradient.addColorStop(0,"rgba(162,214,223,0)");
      gradient.addColorStop(.8,"rgba(178,228,233,.22)");
      gradient.addColorStop(1,"rgba(239,254,246,.85)");
      ctx.globalAlpha=Math.sin(p*Math.PI)*.8;
      ctx.strokeStyle=gradient;ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(x-tail*ux,y-tail*uy);ctx.lineTo(x,y);ctx.stroke();
      dot(ctx,x,y,1.3,Math.sin(p*Math.PI)*.8,"#eafff1");
      ctx.globalAlpha=1;
      if(p>=1)meteor=null;
    }
  }
  function render(now){
    frame=0;
    if(document.hidden||reduced.matches){last=0;return;}
    if(last&&now-last<40){frame=requestAnimationFrame(render);return;}
    const dt=last?Math.min((now-last)/1000,.1):.04;last=now;time+=dt;
    if(!meteor&&time>=nextMeteor){
      const size=width<600?.7:1;
      meteor={x:width*(.15+random()*.65),y:height*(.06+random()*.35),dx:(360+random()*220)*size,dy:(160+random()*160)*size,length:(130+random()*110)*size,duration:1.2+random()*.6,start:time};
      nextMeteor=time+10+random()*9;
      sky.dataset.meteors=String(++meteorCount);
    }
    draw();frame=requestAnimationFrame(render);
  }
  function start(){
    const stop=document.hidden||reduced.matches;
    sky.classList.toggle("is-paused",stop);
    if(stop){cancelAnimationFrame(frame);frame=0;last=0;meteor=null;draw();}
    else if(!frame){last=0;frame=requestAnimationFrame(render);}
  }
  addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(cache,140);});
  reduced.addEventListener("change",start);
  document.addEventListener("visibilitychange",start);
  cache();
})();