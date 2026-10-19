/* RG Observatory — local Three.js renderer with a semantic, static fallback.
   Orbital motion follows idealised two-body Kepler ellipses, not an N-body model. */
(() => {
  const root = document.querySelector(".solar-system");
  if (!root) return;
  const viewport = root.querySelector("#solar-viewport");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = root.querySelector("#solar-toggle");
  const reset = root.querySelector("#solar-reset");
  const status = root.querySelector("#solar-status");
  const infoLink = root.querySelector("#solar-open");
  const choices = [...root.querySelectorAll(".solar-choice")];
  const data = {
    ai: { title:"Herramientas de IA", category:"Inteligencia artificial", text:"Una de las capacidades que aporto a mi siguiente etapa profesional.", href:"#skills", skill:"ai", color:"#ffbd78", a:1.85, e:.07, phase:.3, radius:.16 },
    python: { title:"Python", category:"Programación", text:"Conocimientos adquiridos durante el Grado en Ingeniería Informática de la UOC.", href:"#skills", skill:"python", color:"#bce9cd", a:2.5, e:.05, phase:2.1, radius:.22 },
    java: { title:"Java", category:"Programación", text:"Formación y práctica académica en Java durante el grado.", href:"#skills", skill:"java", color:"#ff977e", a:3.13, e:.04, phase:4.1, radius:.24 },
    postgres: { title:"PostgreSQL", category:"Bases de datos", text:"Mi formación en datos también tiene su órbita: conocimientos de PostgreSQL.", href:"#skills", skill:"postgres", color:"#a8bdff", a:3.8, e:.06, phase:5.65, radius:.26 },
    docker: { title:"Docker y microservicios", category:"Contenedores y arquitectura", text:"Conocimientos de Docker y arquitectura de microservicios adquiridos durante el grado.", href:"#skills", skill:"docker", color:"#76d4ed", a:4.44, e:.04, phase:1.2, radius:.29 },
    projects: { title:"Proyectos en órbita", category:"Mis proyectos", text:"Explora mi portfolio y rg-toolkit, con sus repositorios y código.", href:"#proyectos", color:"#dfc5fa", a:5.28, e:.04, phase:3.6, radius:.33 }
  };
  let selected = "ai";
  let selectScene = () => {};
  let renderingReady = false;
  function select(id) {
    const item = data[id];
    if (!item) return;
    selected = id;
    choices.forEach(button => {
      const active = button.dataset.body === id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    root.style.setProperty("--selected-world", item.color);
    root.querySelector("#solar-title").textContent = item.title;
    root.querySelector("#solar-category").textContent = item.category.toUpperCase();
    root.querySelector("#solar-description").textContent = item.text;
    infoLink.href = item.href;
    infoLink.setAttribute("aria-label", "Explorar " + item.title);
    if (item.skill) infoLink.dataset.solarSkill = item.skill;
    else delete infoLink.dataset.solarSkill;
    selectScene(id);
  }
  choices.forEach(button => button.addEventListener("click", () => select(button.dataset.body)));
  infoLink.addEventListener("click", () => {
    const skill = infoLink.dataset.solarSkill;
    if (skill) document.querySelector('.skill-node[data-skill="' + skill + '"]')?.click();
    // Destination focus follows keyboard navigation without disturbing pointer scrolling.
    if (infoLink.matches(":focus-visible")) {
      const target = skill ? document.querySelector('.skill-node[data-skill="' + skill + '"]') : document.querySelector("#proyectos h2");
      if (target) {
        if (!skill) target.tabIndex = -1;
        setTimeout(() => target.focus({preventScroll:true}), reduced.matches ? 0 : 450);
      }
    }
  });
  function fallback() {
    renderingReady = false;
    root.classList.remove("solar-ready");
    root.classList.add("solar-static");
    toggle.hidden = true;
    reset.hidden = true;
    viewport.removeAttribute("tabindex");
    viewport.setAttribute("aria-label", "Ilustración del sistema solar. Usa los botones inferiores para explorar los contenidos.");
    root.querySelector(".solar-drag-hint").textContent = "";
    status.textContent = "Vista simplificada. Puedes explorar todos los contenidos con los botones de los planetas.";
  }
  // A local module keeps the published site independent of external CDNs.
  // file:// restricts modules in browsers; the semantic fallback still works.
  if (location.protocol === "file:") { fallback(); return; }
  import("./assets/vendor/three.module.min.js").then(buildScene).catch(fallback);

  function buildScene(THREE) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:"low-power" });
    } catch (_) { fallback(); return; }
    renderingReady = true;
    root.classList.add("solar-ready");
    root.classList.remove("solar-static");
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x10151c, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const canvas = renderer.domElement;
    canvas.className = "solar-canvas";
    canvas.setAttribute("aria-hidden", "true");
    viewport.prepend(canvas);
    viewport.tabIndex = 0;
    viewport.setAttribute("aria-label", "Sistema solar 3D. Arrastra para girar la perspectiva o usa las flechas del teclado. Espacio pausa las órbitas.");
    toggle.hidden = false;
    reset.hidden = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 80);
    const system = new THREE.Group();
    system.rotation.z = -.16;
    scene.add(system);
    scene.add(new THREE.AmbientLight(0xadc0db, .62));
    const sunlight = new THREE.PointLight(0xffdbad, 65, 30, 1.7);
    scene.add(sunlight);
    const rim = new THREE.DirectionalLight(0xa4dcca, 1.65);
    rim.position.set(-5, 7, 4);
    scene.add(rim);
    let seed = 4172;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    function surface(color, sun = false) {
      const c = document.createElement("canvas");
      c.width = 256; c.height = 128;
      const ctx = c.getContext("2d");
      const base = new THREE.Color(color);
      const image = ctx.createImageData(c.width, c.height);
      for (let y=0; y<c.height; y++) for (let x=0; x<c.width; x++) {
        const i = (y*c.width+x)*4;
        const wave = Math.sin(y*.23 + Math.sin(x*.065)*1.5) * (sun ? .14 : .09);
        const noise = (random()-.5)*(sun ? .42 : .17);
        const f = .82 + wave + noise;
        image.data[i] = Math.min(255,base.r*255*f);
        image.data[i+1] = Math.min(255,base.g*255*f);
        image.data[i+2] = Math.min(255,base.b*255*f);
        image.data[i+3] = 255;
      }
      ctx.putImageData(image,0,0);
      const texture = new THREE.CanvasTexture(c);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }
    const sunMap = surface("#ffbc78", true);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(.81, 48, 32),
      new THREE.MeshStandardMaterial({map:sunMap,emissive:0xffad63,emissiveMap:sunMap,emissiveIntensity:1.3,roughness:1}));
    system.add(sun);
    const coronaCanvas = document.createElement("canvas");
    coronaCanvas.width = coronaCanvas.height = 128;
    const cx = coronaCanvas.getContext("2d");
    const gradient = cx.createRadialGradient(64,64,10,64,64,64);
    gradient.addColorStop(0,"rgba(255,194,113,.65)");
    gradient.addColorStop(.3,"rgba(255,169,81,.2)");
    gradient.addColorStop(.65,"rgba(255,146,65,.05)");
    gradient.addColorStop(1,"rgba(255,146,65,0)");
    cx.fillStyle=gradient;cx.fillRect(0,0,128,128);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(coronaCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.75}));
    glow.scale.set(4.9,4.9,1); system.add(glow);

    // Sparse stars; deterministic positions avoid a noisy or flashing backdrop.
    const stars = new Float32Array(270*3);
    for(let i=0;i<270;i++){
      stars[i*3]=(random()-.5)*36;
      stars[i*3+1]=(random()-.5)*12-3;
      stars[i*3+2]=(random()-.5)*26-6;
    }
    const starGeometry=new THREE.BufferGeometry();
    starGeometry.setAttribute("position",new THREE.BufferAttribute(stars,3));
    scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xa6c5ba,size:.023,sizeAttenuation:true,transparent:true,opacity:.65,depthWrite:false})));

    const labelLayer = root.querySelector(".solar-labels");
    const bodies = [];
    const spacecraft = [];
    const panelCanvas = document.createElement("canvas");
    panelCanvas.width=64; panelCanvas.height=64;
    const panelContext=panelCanvas.getContext("2d");
    panelContext.fillStyle="#13376d"; panelContext.fillRect(0,0,64,64);
    panelContext.strokeStyle="#71b5d4"; panelContext.lineWidth=1;
    for(let x=1;x<64;x+=10){panelContext.beginPath();panelContext.moveTo(x,0);panelContext.lineTo(x,64);panelContext.stroke();}
    for(let y=1;y<64;y+=16){panelContext.beginPath();panelContext.moveTo(0,y);panelContext.lineTo(64,y);panelContext.stroke();}
    const panelTexture=new THREE.CanvasTexture(panelCanvas);
    panelTexture.colorSpace=THREE.SRGBColorSpace;
    const panelMaterial=new THREE.MeshStandardMaterial({map:panelTexture,metalness:.45,roughness:.38,side:THREE.DoubleSide});
    const chassisMaterial=new THREE.MeshStandardMaterial({color:0xf0d39b,metalness:.7,roughness:.35});
    function createSatellite(body, phase, orbitRadius) {
      const satellite=new THREE.Group();
      const chassis=new THREE.Mesh(new THREE.BoxGeometry(.13,.12,.13),chassisMaterial);
      satellite.add(chassis);
      for(const sign of [-1,1]){
        const panel=new THREE.Mesh(new THREE.BoxGeometry(.24,.012,.19),panelMaterial);
        panel.position.x=sign*.22;
        satellite.add(panel);
        const arm=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.13,6),chassisMaterial);
        arm.rotation.z=Math.PI/2;arm.position.x=sign*.1;satellite.add(arm);
      }
      const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.14,6),chassisMaterial);
      antenna.position.y=.11;satellite.add(antenna);
      const dish=new THREE.Mesh(new THREE.SphereGeometry(.065,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xdce6e4,side:THREE.DoubleSide,metalness:.5,roughness:.4}));
      dish.position.y=.17;dish.rotation.z=.35;dish.scale.y=.4;satellite.add(dish);
      system.add(satellite);
      const trail=[];
      for(let i=0;i<=70;i++){const angle=i/70*Math.PI*2;trail.push(new THREE.Vector3(Math.cos(angle)*orbitRadius,Math.sin(angle)*orbitRadius*.32,Math.sin(angle)*orbitRadius));}
      const track=new THREE.Line(new THREE.BufferGeometry().setFromPoints(trail),new THREE.LineBasicMaterial({color:0xa9d0d5,transparent:true,opacity:.13}));
      system.add(track);
      spacecraft.push({satellite,body,phase,orbitRadius,track});
    }
    const selectableMeshes = [];
    const sphereGeometry = new THREE.SphereGeometry(1, 28, 20);
    const pointsForOrbit = (item,count=160) => {
      const points=[];
      for(let i=0;i<=count;i++){
        const angle=i/count*Math.PI*2;
        points.push(new THREE.Vector3(item.a*(Math.cos(angle)-item.e),0,item.a*Math.sqrt(1-item.e*item.e)*Math.sin(angle)));
      }
      return points;
    };
    for (const [id,item] of Object.entries(data)) {
      const track = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsForOrbit(item)),
        new THREE.LineBasicMaterial({color:item.color,transparent:true,opacity:id === selected ? .3 : .13}));
      system.add(track);
      const material = new THREE.MeshStandardMaterial({map:surface(item.color),color:0xffffff,roughness:.85,metalness:.05});
      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.scale.setScalar(item.radius);
      mesh.userData.bodyId=id;
      system.add(mesh); selectableMeshes.push(mesh);
      const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(item.radius*1.13,24,16),
        new THREE.MeshBasicMaterial({color:item.color,transparent:true,opacity:.065,side:THREE.BackSide,depthWrite:false}));
      system.add(atmosphere);
      const label=document.createElement("span");
      label.className="solar-planet-label";
      label.dataset.body = id;
      label.addEventListener("click", () => select(id));
      label.textContent=id==="ai"?"IA":id==="postgres"?"Datos":id==="projects"?"Proyectos":item.title.split(" ")[0];
      labelLayer.append(label);
      const body={id,...item,mesh,atmosphere,track,label,world:new THREE.Vector3()};
      if(id==="projects") {
        const ring = new THREE.Mesh(new THREE.RingGeometry(1.45,2.05,64),new THREE.MeshStandardMaterial({color:0xd9c4ef,transparent:true,opacity:.6,side:THREE.DoubleSide,roughness:1}));
        ring.rotation.x=Math.PI/2-.35;ring.rotation.y=.3;mesh.add(ring);
      }
      if(id==="docker") {
        const moon = new THREE.Mesh(new THREE.SphereGeometry(.065,12,10),new THREE.MeshStandardMaterial({color:0xb7cbcc,roughness:1}));
        system.add(moon);body.moon=moon;
      }
      if(id==="docker" || id==="python") createSatellite(body,id==="docker"?1.7:4,.62+item.radius*.5);
      bodies.push(body);
    }
    root.dataset.satelliteCount=String(spacecraft.length);
    // A quiet asteroid belt gives scale without extra planet labels.
    const asteroidGeometry = new THREE.IcosahedronGeometry(.012,0);
    const belt=new THREE.InstancedMesh(asteroidGeometry,new THREE.MeshBasicMaterial({color:0x647b70,transparent:true,opacity:.55}),220);
    const dummy=new THREE.Object3D();
    for(let i=0;i<220;i++){
      const angle=random()*Math.PI*2,radius=4.85+(random()-.5)*.16;
      dummy.position.set(Math.cos(angle)*radius,(random()-.5)*.05,Math.sin(angle)*radius);
      dummy.rotation.set(random()*3,random()*3,random()*3);
      dummy.scale.setScalar(.6+random()*1.5);dummy.updateMatrix();belt.setMatrixAt(i,dummy.matrix);
    }
    system.add(belt);
    const ripple=new THREE.Mesh(new THREE.RingGeometry(.98,1,96),new THREE.MeshBasicMaterial({color:0xffcf92,side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false}));
    ripple.rotation.x=-Math.PI/2;system.add(ripple);
    const raycaster=new THREE.Raycaster();
    const pointer=new THREE.Vector2();
    let width=1,height=1,simulationTime=0,last=0,frameId=0,visible=true,paused=false;
    let yaw=.12,targetYaw=.12,pitch=.9,targetPitch=.9,pointerLeanX=0,pointerLeanY=0,drag=null,pulse=2;
    const coreLabel=root.querySelector(".solar-core-label");
    const projection=new THREE.Vector3();
    const baseCameraDistance=14.3;
    function setCamera(){
      camera.position.set(Math.sin(yaw)*Math.sin(pitch)*baseCameraDistance,Math.cos(pitch)*baseCameraDistance,Math.cos(yaw)*Math.sin(pitch)*baseCameraDistance);
      camera.lookAt(0,0,0);
      camera.updateMatrixWorld();
    }
    function updatePauseButton() {
      root.dataset.motionPaused=String(paused);
      toggle.setAttribute("aria-pressed",String(paused));
      toggle.setAttribute("aria-label",paused?"Reanudar órbitas":"Pausar órbitas");
      toggle.firstElementChild.textContent=paused?"▶":"Ⅱ";
    }
    function requestFrame() {
      if(!frameId && visible && !document.hidden && renderingReady) frameId=requestAnimationFrame(render);
    }
    function positionBodies() {
      for(const b of bodies) {
        // Kepler's third law controls relative periods. Newton solves E - e sin(E) = M.
        const mean=b.phase + simulationTime*1.65/Math.pow(b.a,1.5);
        let eccentric=mean;
        for(let j=0;j<4;j++)eccentric-=(eccentric-b.e*Math.sin(eccentric)-mean)/(1-b.e*Math.cos(eccentric));
        b.mesh.position.set(b.a*(Math.cos(eccentric)-b.e),0,b.a*Math.sqrt(1-b.e*b.e)*Math.sin(eccentric));
        b.atmosphere.position.copy(b.mesh.position);
        b.mesh.rotation.y=simulationTime*(.26+b.radius*.3);
        if(b.moon)b.moon.position.copy(b.mesh.position).add(new THREE.Vector3(Math.cos(simulationTime*.7)*.52,.08,Math.sin(simulationTime*.7)*.52));
      }
      belt.rotation.y=simulationTime*.013;
      sun.rotation.y=simulationTime*.06;
      for(const craft of spacecraft){
        const angle=simulationTime*.7+craft.phase;
        craft.satellite.position.copy(craft.body.mesh.position).add(new THREE.Vector3(Math.cos(angle)*craft.orbitRadius,Math.sin(angle)*craft.orbitRadius*.32,Math.sin(angle)*craft.orbitRadius));
        craft.satellite.lookAt(craft.body.mesh.position);
        craft.satellite.rotation.z+=.3;
        craft.track.position.copy(craft.body.mesh.position);
      }
    }
    function projectLabels() {
      for(const b of bodies) {
        b.mesh.getWorldPosition(b.world);
        projection.copy(b.world).project(camera);
        const x=(projection.x*.5+.5)*width,y=(-projection.y*.5+.5)*height;
        const depth=camera.position.distanceTo(b.world);
        const size=Math.max(.8,Math.min(1.12,14/depth));
        const offset=(b.radius+.18)*height/(2*Math.tan(43*Math.PI/360)*depth)+9;
        b.label.style.transform="translate("+x.toFixed(1)+"px,"+(y+offset).toFixed(1)+"px) translate(-50%,-50%) scale("+size.toFixed(3)+")";
        b.label.style.opacity=(b.id===selected?1:.75).toFixed(2);
        b.label.style.zIndex=String(Math.round(100-depth));
      }
      projection.set(0,0,0).project(camera);
      coreLabel.style.left=(projection.x*.5+.5)*width+"px";
      coreLabel.style.top=(-projection.y*.5+.5)*height+"px";
    }
    function draw() {
      setCamera();positionBodies();
      scene.updateMatrixWorld(true);
      renderer.render(scene,camera);
      projectLabels();
    }
    function render(now) {
      frameId=0;
      if(!visible||document.hidden||!renderingReady){last=0;return;}
      const dt=last?Math.min((now-last)/1000,.045):.016;last=now;
      const motion=!reduced.matches && !paused;
      // Browsing a planet never slows down the rest of the system. Only the
      // explicit pause control, reduced motion or visibility suspend its clock.
      if(motion) simulationTime+=dt;
      const damping=1-Math.exp(-dt*8);
      const desiredYaw=targetYaw+(reduced.matches?0:pointerLeanX);
      const desiredPitch=targetPitch+(reduced.matches?0:pointerLeanY);
      yaw+=(desiredYaw-yaw)*damping;pitch+=(desiredPitch-pitch)*damping;
      if(pulse<1&&!reduced.matches){
        pulse+=dt*1.3;ripple.scale.setScalar(.9+pulse*5);ripple.material.opacity=Math.max(0,(1-pulse)*.3);
      }else ripple.material.opacity=0;
      const movingCamera=Math.abs(yaw-desiredYaw)+Math.abs(pitch-desiredPitch)>.0003;
      draw();
      if(motion||movingCamera||pulse<1)requestFrame();
      else last=0;
    }
    selectScene = id => {
      const item=data[id];
      bodies.forEach(b=>{
        const active=b.id===id;
        b.track.material.opacity=active ? .38 : .13;
        b.label.classList.toggle("active",active);
        b.atmosphere.material.opacity=active ? .2 : .065;
      });
      if(!reduced.matches)pulse=0;
      ripple.material.color.set(item.color);
      requestFrame();
    };
    toggle.addEventListener("click",()=>{paused=!paused;updatePauseButton();requestFrame();});
    reset.addEventListener("click",()=>{targetYaw=.12;targetPitch=.9;pointerLeanX=pointerLeanY=0;if(reduced.matches){yaw=targetYaw;pitch=targetPitch;}requestFrame();});
    function hitTest(event) {
      const rect=canvas.getBoundingClientRect();
      pointer.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
      raycaster.setFromCamera(pointer,camera);
      return raycaster.intersectObjects([sun, ...selectableMeshes],false)[0]?.object.userData.bodyId || null;
    }
    canvas.addEventListener("pointerdown",event=>{
      if(event.button!==0)return;
      drag={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:0};
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove",event=>{
      if(drag) {
        const dx=event.clientX-drag.lastX,dy=event.clientY-drag.lastY;
        drag.moved+=Math.abs(dx)+Math.abs(dy);
        // On touch, vertical scrolling stays native. Horizontal dragging rotates the system.
        if(event.pointerType!=="touch"||Math.abs(event.clientX-drag.x)>Math.abs(event.clientY-drag.y)){
          targetYaw-=dx*.006;
          targetPitch=Math.max(.35,Math.min(1.28,targetPitch+dy*.004));
        }
        drag.lastX=event.clientX;drag.lastY=event.clientY;
        requestFrame();
      } else {
        const hit=hitTest(event);
        canvas.style.cursor=hit?"pointer":"grab";
        if(event.pointerType==="mouse"&&!reduced.matches){
          const rect=canvas.getBoundingClientRect();
          pointerLeanX=(event.clientX-rect.left-rect.width/2)/rect.width*.1;
          pointerLeanY=(event.clientY-rect.top-rect.height/2)/rect.height*.065;
          requestFrame();
        }
      }
    });
    canvas.addEventListener("pointerup",event=>{
      if(drag&&drag.moved<7){const hit=hitTest(event);if(hit)select(hit);}
      drag=null;
      if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointercancel",()=>{drag=null;});
    canvas.addEventListener("pointerleave",()=>{pointerLeanX=pointerLeanY=0;requestFrame();});
    viewport.addEventListener("keydown",event=>{
      if(event.key.startsWith("Arrow")){
        event.preventDefault();
        if(event.key==="ArrowLeft")targetYaw-=.15;
        if(event.key==="ArrowRight")targetYaw+=.15;
        if(event.key==="ArrowUp")targetPitch=Math.max(.35,targetPitch-.1);
        if(event.key==="ArrowDown")targetPitch=Math.min(1.28,targetPitch+.1);
        if(reduced.matches){yaw=targetYaw;pitch=targetPitch;}
        requestFrame();
      }else if(event.code==="Space"){event.preventDefault();toggle.click();}
      else if(event.key==="Home"){event.preventDefault();reset.click();}
    });
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible){last=0;requestFrame();}
      else {cancelAnimationFrame(frameId);frameId=0;last=0;}
    },{threshold:.02});
    observer.observe(viewport);
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden){cancelAnimationFrame(frameId);frameId=0;last=0;}
      else requestFrame();
    });
    function updateViewportDescription() {
      viewport.setAttribute("aria-label", reduced.matches ? "Sistema solar 3D estático. Usa las flechas para cambiar de perspectiva o los botones inferiores para explorar cada planeta." : "Sistema solar 3D. Arrastra para girar la perspectiva o usa las flechas del teclado. Espacio pausa las órbitas.");
    }
    reduced.addEventListener("change",()=>{
      updateViewportDescription();
      pointerLeanX=pointerLeanY=0;
      pulse=2;last=0;
      toggle.hidden=reduced.matches;
      root.querySelector(".solar-drag-hint").textContent=reduced.matches?"":"Arrastra para cambiar de perspectiva";
      requestFrame();
    });
    const resize=new ResizeObserver(()=>{
      const rect=viewport.getBoundingClientRect();
      width=Math.max(1,rect.width);height=Math.max(1,rect.height);
      camera.aspect=width/height;camera.updateProjectionMatrix();
      renderer.setSize(width,height,false);requestFrame();
    });
    resize.observe(viewport);
    canvas.addEventListener("webglcontextlost",event=>{
      event.preventDefault();cancelAnimationFrame(frameId);frameId=0;
      observer.disconnect();resize.disconnect();canvas.remove();labelLayer.replaceChildren();fallback();
    });
    updateViewportDescription();
    toggle.hidden=reduced.matches;
    updatePauseButton();selectScene(selected);requestFrame();
  }
})();
