/* Skills Observatory: progressive WebGL scene. All six original HTML skill
   buttons and script.js descriptions remain the source of truth. Orbital speeds
   follow Kepler's relative periods; this is an illustrative model, not physics. */
(() => {
  const galaxy = document.querySelector('#skills .galaxy');
  if (!galaxy) return;
  const section = galaxy.closest('#skills');
  const buttons = [...galaxy.querySelectorAll('.skill-node')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const worlds = [
    {id:'python',name:'Python',color:'#bce9cd',a:1.7,e:.035,r:.21,phase:1.6,kind:'earth',category:'Programación'},
    {id:'java',name:'Java',color:'#ff977e',a:2.32,e:.045,r:.25,phase:4.3,kind:'rock',category:'Programación'},
    {id:'postgres',name:'PostgreSQL',color:'#a8bdff',a:2.98,e:.06,r:.3,phase:2.9,kind:'gas',category:'Bases de datos'},
    {id:'docker',name:'Docker',color:'#76d4ed',a:3.7,e:.035,r:.28,phase:5.6,kind:'ice',category:'Contenedores'},
    {id:'micro',name:'Microservicios',color:'#dfc5fa',a:4.4,e:.04,r:.34,phase:.75,kind:'gas',category:'Arquitectura de software'},
    {id:'ai',name:'IA',color:'#ffcd88',a:5.12,e:.035,r:.29,phase:3.9,kind:'gold',category:'Inteligencia artificial'}
  ];
  let selected = 'python';
  const setPalette = id => {
    const data = worlds.find(world => world.id === id);
    if (data) section.style.setProperty('--skill-color', data.color);
  };
  worlds.forEach(world => buttons.find(button => button.dataset.skill === world.id)?.style.setProperty('--world-color', world.color));
  // Nothing is replaced until a WebGL renderer succeeds. No-JS and module-load
  // failures leave the existing semantic, working galaxy in place.
  if (location.protocol === 'file:') return;
  let startObserver;
  const start = () => {
    startObserver?.disconnect();
    import('./assets/vendor/three.module.min.js').then(build).catch(() => galaxy.classList.add('skills-orbit-fallback'));
  };
  if ('IntersectionObserver' in window) {
    startObserver = new IntersectionObserver(entries => {if (entries.some(entry => entry.isIntersecting)) start();}, {rootMargin:'350px'});
    startObserver.observe(galaxy);
  } else start();

  function build(THREE) {
    let renderer;
    try {renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}
    catch (_) {galaxy.classList.add('skills-orbit-fallback');return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.6));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    const viewport = document.createElement('div');
    viewport.className = 'skills-orbit-viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('role','group');
    viewport.setAttribute('aria-label','Sistema solar de conocimientos. Arrastra o usa las flechas para cambiar la perspectiva. Los botones inferiores permiten seleccionar cada habilidad.');
    const canvas = renderer.domElement;
    canvas.className = 'skills-orbit-canvas';
    canvas.setAttribute('aria-hidden','true');
    viewport.append(canvas);
    const labelLayer = document.createElement('div');
    labelLayer.className = 'skills-orbit-labels';labelLayer.setAttribute('aria-hidden','true');
    viewport.append(labelLayer);
    const coreLabel = document.createElement('span');
    coreLabel.className = 'skills-orbit-core';coreLabel.textContent = 'RG';coreLabel.setAttribute('aria-hidden','true');
    viewport.append(coreLabel);
    const head = document.createElement('div');head.className = 'skills-orbit-head';
    head.innerHTML = '<div><span class="skills-observatory">Observatorio de conocimientos</span><span class="skills-orbit-signal">Python · Programación</span></div>';
    const signal = head.querySelector('.skills-orbit-signal');
    signal.setAttribute('aria-hidden','true');
    const toggle = document.createElement('button');
    toggle.className = 'skills-orbit-toggle';toggle.type = 'button';
    toggle.setAttribute('aria-label','Pausar órbitas de conocimientos');toggle.setAttribute('aria-pressed','false');
    toggle.innerHTML = '<span aria-hidden="true">Ⅱ</span>';head.append(toggle);viewport.append(head);
    const meta = document.createElement('div');meta.className = 'skills-orbit-meta';meta.setAttribute('aria-hidden','true');
    meta.innerHTML = '<span>Arrastra para explorar · Selecciona un planeta</span><span><i></i> Órbitas conectadas</span>';
    viewport.append(meta);
    const dock = document.createElement('div');dock.className = 'skills-orbit-dock';
    buttons.forEach(button => dock.append(button));
    galaxy.append(viewport,dock);galaxy.classList.add('skills-orbit-ready');section.classList.add('is-orbit-enhanced');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43,1,.1,80);
    const system = new THREE.Group();system.rotation.z = -.08;scene.add(system);
    scene.add(new THREE.AmbientLight(0x8fa7c7,.7));
    scene.add(new THREE.HemisphereLight(0xc4dbff,0x10111c,.65));
    const sunlight = new THREE.PointLight(0xffdfba,55,28,1.6);scene.add(sunlight);
    const rim = new THREE.DirectionalLight(0xc6e5f7,1.2);rim.position.set(-4,6,-4);scene.add(rim);
    let seed = 81727;
    const random = () => {seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
    // Local, procedural surfaces keep the scene self-contained and give each
    // material terrain, cloud belts and illuminated relief rather than flat dots.
    function surface(world,sun=false) {
      const map = document.createElement('canvas');map.width=512;map.height=256;
      const context = map.getContext('2d');
      const pixels = context.createImageData(map.width,map.height);
      const base = new THREE.Color(world.color);
      for (let y=0;y<256;y++) for (let x=0;x<512;x++) {
        const lat=y/256*Math.PI,lon=x/512*Math.PI*2;
        const noise=(random()-.5)*.12;
        const n=Math.sin(lon*4.2+Math.cos(lat*6)*1.3)+Math.cos(lon*7-lat*9)*.4+Math.sin(lat*15+lon*2)*.6;
        const band=Math.sin(lat*45+Math.sin(lon*3)*.6)+Math.sin(lat*85+lon*.5)*.3;
        let f=.75+noise, r=base.r,g=base.g,b=base.b;
        if (sun) {f=1.0+n*.13+noise*2;}
        else if (world.kind==='earth') {
          const land=n>.35;
          r=land?.38:.10;g=land?.65:.34;b=land?.39:.47;
          const cloud=Math.max(0,Math.sin(lon*6+Math.sin(lat*11))+Math.cos(lat*23+lon*2)-1.2)*.47;
          r+=cloud;g+=cloud;b+=cloud;
          const ice=Math.max(0,(Math.abs(Math.cos(lat))-.87)*4);r+=ice;g+=ice;b+=ice;
          f=.9+noise;
        } else if (world.kind==='gas') {f=.82+band*.11+n*.035+noise*.45;}
        else if (world.kind==='ice') {f=.85+n*.065+noise;const ice=Math.max(0,n-.6)*.3;r+=ice;g+=ice;b+=ice;}
        else if (world.kind==='gold') {f=.9+band*.07+n*.07+noise;}
        else f=.75+n*.1+noise*1.8;
        const offset=(y*512+x)*4;
        pixels.data[offset]=Math.min(255,Math.max(0,r*f*255));
        pixels.data[offset+1]=Math.min(255,Math.max(0,g*f*255));
        pixels.data[offset+2]=Math.min(255,Math.max(0,b*f*255));pixels.data[offset+3]=255;
      }
      context.putImageData(pixels,0,0);
      if(world.kind==='rock')for(let i=0;i<45;i++){
        const x=random()*512,y=random()*256,r=2+random()*9;
        context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fillStyle='#301a1220';context.fill();
        context.beginPath();context.arc(x-.5,y-.8,r*.83,0,Math.PI*2);context.strokeStyle='#ffdeba2a';context.lineWidth=1;context.stroke();
      }
      const texture=new THREE.CanvasTexture(map);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      return texture;
    }
    const sunMap=surface({color:'#ffbc68'},true);
    const sun=new THREE.Mesh(new THREE.SphereGeometry(.66,40,28),new THREE.MeshStandardMaterial({map:sunMap,emissive:0xffa94f,emissiveMap:sunMap,emissiveIntensity:1.5,roughness:1}));system.add(sun);
    const glowMap=document.createElement('canvas');glowMap.width=glowMap.height=256;
    const glowContext=glowMap.getContext('2d');
    const gradient=glowContext.createRadialGradient(128,128,5,128,128,128);
    gradient.addColorStop(0,'rgba(255,210,145,.7)');gradient.addColorStop(.22,'rgba(255,180,90,.32)');gradient.addColorStop(.5,'rgba(255,143,59,.07)');gradient.addColorStop(1,'rgba(255,124,47,0)');
    glowContext.fillStyle=gradient;glowContext.fillRect(0,0,256,256);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowMap),color:0xffd19a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.8}));glow.scale.set(3.8,3.8,1);system.add(glow);
    const geometry=new THREE.SphereGeometry(1,36,24);
    const hitMeshes=[];
    const bodies=[];
    const ringTextureCanvas=document.createElement('canvas');ringTextureCanvas.width=256;ringTextureCanvas.height=1;
    const ringContext=ringTextureCanvas.getContext('2d');
    for(let x=0;x<256;x++){ringContext.fillStyle='rgba(210,215,232,'+(random()>.2?.18+random()*.6:.05)+')';ringContext.fillRect(x,0,1,1);}
    const ringTexture=new THREE.CanvasTexture(ringTextureCanvas);
    function satellite() {
      const group=new THREE.Group();
      const metal=new THREE.MeshStandardMaterial({color:0xc5d3de,roughness:.32,metalness:.7});
      const panelMaterial=new THREE.MeshStandardMaterial({color:0x315eac,roughness:.45,metalness:.42,emissive:0x10274d,emissiveIntensity:.35,side:THREE.DoubleSide});
      const body=new THREE.Mesh(new THREE.BoxGeometry(.08,.1,.085),metal);group.add(body);
      const panels=new THREE.Mesh(new THREE.BoxGeometry(.32,.006,.105),panelMaterial);group.add(panels);
      const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.11,5),metal);antenna.position.y=.08;group.add(antenna);
      const dish=new THREE.Mesh(new THREE.SphereGeometry(.035,10,6,0,Math.PI*2,0,Math.PI*.4),metal);dish.position.set(0,.08,.045);dish.rotation.x=Math.PI/2;group.add(dish);
      return group;
    }
    worlds.forEach((world,index)=>{
      const trackPoints=[];
      for(let i=0;i<=180;i++){const angle=i/180*Math.PI*2;trackPoints.push(new THREE.Vector3(world.a*(Math.cos(angle)-world.e),0,world.a*Math.sqrt(1-world.e*world.e)*Math.sin(angle)));}
      const track=new THREE.Line(new THREE.BufferGeometry().setFromPoints(trackPoints),new THREE.LineBasicMaterial({color:world.color,transparent:true,opacity:world.id===selected?.35:.14}));system.add(track);
      const texture=surface(world);
      const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:world.kind==='rock'?.025:.012,roughness:.9,metalness:.04}));mesh.scale.setScalar(world.r);mesh.rotation.z=.15+index*.09;mesh.userData.skill=world.id;system.add(mesh);hitMeshes.push(mesh);
      const atmosphere=new THREE.Mesh(geometry,new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,uniforms:{glowColor:{value:new THREE.Color(world.color)}},vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 glowColor;varying vec3 n;varying vec3 v;void main(){float f=pow(1.0-abs(dot(normalize(n),normalize(v))),2.4);gl_FragColor=vec4(glowColor,f*0.24);}'}));atmosphere.scale.setScalar(world.r*1.13);system.add(atmosphere);
      const label=document.createElement('span');label.className='skills-orbit-label';label.dataset.skill=world.id;label.textContent=world.name;label.style.setProperty('--world-color',world.color);labelLayer.append(label);
      const body={...world,mesh,atmosphere,label,track,world:new THREE.Vector3(),index};
      if(world.id==='postgres'||world.id==='micro'){
        const ring=new THREE.Mesh(new THREE.RingGeometry(1.3,1.85,90),new THREE.MeshStandardMaterial({map:ringTexture,color:world.color,side:THREE.DoubleSide,transparent:true,opacity:world.id==='micro'?.7:.45,roughness:1,depthWrite:false}));
        // Polar UVs map the one-dimensional striped texture across ring radius.
        const pos=ring.geometry.attributes.position,uv=ring.geometry.attributes.uv;
        for(let i=0;i<pos.count;i++){uv.setXY(i,(Math.hypot(pos.getX(i),pos.getY(i))-1.3)/.55,.5);}uv.needsUpdate=true;
        ring.rotation.x=Math.PI/2-.22;ring.rotation.z=.22;mesh.add(ring);
      }
      if(world.id==='docker'||world.id==='python'||world.id==='ai'){
        const moon=new THREE.Mesh(new THREE.SphereGeometry(world.id==='docker'?.05:.037,14,10),new THREE.MeshStandardMaterial({color:0xa8b4bc,roughness:1}));system.add(moon);body.moon=moon;
      }
      if(world.id==='micro'||world.id==='docker') {body.satellite=satellite();system.add(body.satellite);}
      bodies.push(body);
    });
    // One draw call for the thin belt; no DOM particles or unbounded allocations.
    const belt=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.012,0),new THREE.MeshStandardMaterial({color:0x9c9b8b,roughness:1}),250);
    const dummy=new THREE.Object3D();
    for(let i=0;i<250;i++){const angle=random()*Math.PI*2,radius=3.3+random()*.13;dummy.position.set(Math.cos(angle)*radius,(random()-.5)*.06,Math.sin(angle)*radius);dummy.rotation.set(random()*6,random()*6,random()*6);dummy.scale.setScalar(.7+random()*1.8);dummy.updateMatrix();belt.setMatrixAt(i,dummy.matrix);}system.add(belt);
    const starPositions=new Float32Array(190*3);
    for(let i=0;i<190;i++){starPositions[i*3]=(random()-.5)*30;starPositions[i*3+1]=-2-random()*5;starPositions[i*3+2]=(random()-.5)*30;}
    const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xb7cbdc,size:.018,transparent:true,opacity:.5,depthWrite:false})));
    const halo=new THREE.Mesh(new THREE.RingGeometry(1,1.025,80),new THREE.MeshBasicMaterial({color:0xbce9cd,side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false}));halo.rotation.x=-Math.PI/2;system.add(halo);
    let active=true,alive=true,paused=false,raf=0,last=0,time=0,width=1,height=1,settle=0;
    let yaw=.06,pitch=.77,targetYaw=.06,targetPitch=.77,drag=null;
    const projection=new THREE.Vector3(),pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster(),origin=new THREE.Vector3();
    const select = id => {
      selected=id;galaxy.dataset.activeSkill=id;setPalette(id);
      const item=worlds.find(world=>world.id===id);
      signal.textContent=item.name+' · '+item.category;
      bodies.forEach(body=>{body.label.classList.toggle('is-active',body.id===id);body.track.material.opacity=body.id===id?.43:.13;body.mesh.material.emissive.set(body.id===id?body.color:0x000000);body.mesh.material.emissiveIntensity=body.id===id?.1:0;});
      halo.material.color.set(item.color);settle=performance.now()+500;requestFrame();
    };
    buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.skill)));
    selected=buttons.find(button=>button.getAttribute('aria-pressed')==='true')?.dataset.skill || selected;
    function requestFrame(){if(!raf&&alive&&active&&!document.hidden)raf=requestAnimationFrame(render);}
    function synchronizeSize(force=false){
      // Layout dimensions, rather than transformed screen bounds, keep the
      // camera and WebGL drawing buffer aligned after scroll/resize animation.
      const nextWidth=Math.max(1,viewport.clientWidth),nextHeight=Math.max(1,viewport.clientHeight);
      if(force||nextWidth!==width||nextHeight!==height){width=nextWidth;height=nextHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);}
    }
    function cameraPosition(){
      const aspect=width/height;
      const distance=Math.max(14.2,5.7/(Math.tan(43*Math.PI/360)*aspect));
      camera.position.set(Math.sin(yaw)*Math.sin(pitch)*distance,Math.cos(pitch)*distance,Math.cos(yaw)*Math.sin(pitch)*distance);camera.lookAt(origin);camera.updateMatrixWorld(true);
    }
    function updateBodies(){
      bodies.forEach(body=>{
        const mean=body.phase+time*1.8/Math.pow(body.a,1.5);let eccentric=mean;
        for(let i=0;i<4;i++)eccentric-=(eccentric-body.e*Math.sin(eccentric)-mean)/(1-body.e*Math.cos(eccentric));
        body.mesh.position.set(body.a*(Math.cos(eccentric)-body.e),Math.sin(mean*.8+body.index)*.035,body.a*Math.sqrt(1-body.e*body.e)*Math.sin(eccentric));body.atmosphere.position.copy(body.mesh.position);body.mesh.rotation.y=time*(.22+body.index*.025);
        if(body.moon){const angle=time*(.7+body.index*.04)+body.index;body.moon.position.copy(body.mesh.position);body.moon.position.x+=Math.cos(angle)*(body.r+.23);body.moon.position.z+=Math.sin(angle)*(body.r+.23);body.moon.position.y+=Math.sin(angle)*.12;}
        if(body.satellite){const angle=time*.67+body.index;body.satellite.position.copy(body.mesh.position);body.satellite.position.x+=Math.cos(angle)*(body.r+.36);body.satellite.position.z+=Math.sin(angle)*(body.r+.36);body.satellite.position.y+=Math.sin(angle)*.21;body.satellite.rotation.set(.2,angle+.6,.3);}
      });
      const body=bodies.find(body=>body.id===selected);halo.position.copy(body.mesh.position);halo.scale.setScalar(body.r*1.6);halo.position.y-=body.r*.05;halo.rotation.z=Math.sin(time*.2)*.08;
      sun.rotation.y=time*.05;glow.material.opacity=.8+Math.sin(time*.4)*.03;belt.rotation.y=time*.012;
    }
    function labels(){
      bodies.forEach(body=>{
        body.mesh.getWorldPosition(body.world);projection.copy(body.world).project(camera);
        const depth=camera.position.distanceTo(body.world),scale=Math.max(.8,Math.min(1.08,14/depth));
        const offset=(body.r+.12)*height/(2*Math.tan(43*Math.PI/360)*depth)+7;
        body.label.style.transform='translate('+((projection.x*.5+.5)*width).toFixed(1)+'px,'+((-projection.y*.5+.5)*height+offset).toFixed(1)+'px) translate(-50%,-50%) scale('+scale.toFixed(3)+')';
        body.label.style.opacity=body.id===selected?'1':'.7';body.label.style.zIndex=String(Math.round(100-depth));
      });
      projection.set(0,0,0).project(camera);coreLabel.style.left=(projection.x*.5+.5)*width+'px';coreLabel.style.top=(-projection.y*.5+.5)*height+'px';
    }
    function draw(){synchronizeSize();cameraPosition();updateBodies();scene.updateMatrixWorld(true);renderer.render(scene,camera);labels();}
    function render(now){
      raf=0;if(!alive||!active||document.hidden){last=0;return;}
      const delta=last?Math.min((now-last)/1000,.04):0;last=now;
      if(!paused&&!reduced.matches)time+=delta;
      const ease=reduced.matches?1:Math.min(1,delta*7+.03);yaw+=(targetYaw-yaw)*ease;pitch+=(targetPitch-pitch)*ease;
      draw();
      if((!paused&&!reduced.matches)||now<settle)requestFrame();else last=0;
    }
    function pick(event){const box=viewport.getBoundingClientRect();pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(hitMeshes,false)[0]?.object.userData.skill;}
    viewport.addEventListener('pointerdown',event=>{
      if(event.target.closest('button')||event.button!==0)return;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:targetYaw,pitch:targetPitch,moved:false,touch:event.pointerType==='touch'};
      if(!drag.touch)viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove',event=>{
      if(drag&&drag.id===event.pointerId){
        const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
        if(drag.touch&&!drag.moved&&Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
        if(Math.abs(dx)+Math.abs(dy)>6){drag.moved=true;viewport.classList.add('is-dragging');if(drag.touch&&!viewport.hasPointerCapture(event.pointerId))viewport.setPointerCapture(event.pointerId);}
        if(drag.moved){targetYaw=drag.yaw-dx*.006;targetPitch=Math.max(.42,Math.min(1.28,drag.pitch-dy*.004));settle=performance.now()+600;requestFrame();}
      } else if(event.pointerType!=='touch') viewport.classList.toggle('has-world',Boolean(pick(event)));
    });
    function release(event){
      if(!drag||drag.id!==event.pointerId)return;
      const state=drag;drag=null;viewport.classList.remove('is-dragging');
      if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
      if(!state.moved&&event.type==='pointerup'){const id=pick(event);if(id)buttons.find(button=>button.dataset.skill===id)?.click();}
    }
    viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);
    viewport.addEventListener('pointerleave',()=>viewport.classList.remove('has-world'));
    function updateToggle(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Reanudar órbitas de conocimientos':'Pausar órbitas de conocimientos');toggle.firstElementChild.textContent=paused?'▶':'Ⅱ';meta.lastElementChild.innerHTML=paused?'<i></i> Órbitas en pausa':'<i></i> Órbitas conectadas';}
    toggle.addEventListener('click',()=>{paused=!paused;last=0;updateToggle();settle=performance.now()+50;requestFrame();});
    viewport.addEventListener('keydown',event=>{
      if(event.target!==viewport)return;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)){
        event.preventDefault();if(event.key==='ArrowLeft')targetYaw-=.15;if(event.key==='ArrowRight')targetYaw+=.15;if(event.key==='ArrowUp')targetPitch=Math.max(.42,targetPitch-.12);if(event.key==='ArrowDown')targetPitch=Math.min(1.28,targetPitch+.12);if(event.key==='Home'){targetYaw=.06;targetPitch=.77;}settle=performance.now()+1000;requestFrame();
      }else if(event.code==='Space'&&!reduced.matches){event.preventDefault();toggle.click();}
    });
    const resize=new ResizeObserver(()=>{synchronizeSize(true);settle=performance.now()+100;if(active&&!document.hidden)draw();requestFrame();});resize.observe(viewport);
    const visibility=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active){last=0;synchronizeSize(true);draw();requestFrame();}else{cancelAnimationFrame(raf);raf=0;last=0;}},{threshold:.02});visibility.observe(viewport);
    const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else if(active){synchronizeSize(true);draw();requestFrame();}};document.addEventListener('visibilitychange',onVisibility);
    const onReduced=()=>{last=0;toggle.hidden=reduced.matches;meta.firstElementChild.textContent=reduced.matches?'Selecciona una habilidad para explorar':'Arrastra para explorar · Selecciona un planeta';settle=performance.now()+40;requestFrame();};reduced.addEventListener('change',onReduced);
    canvas.addEventListener('webglcontextlost',event=>{
      event.preventDefault();alive=false;cancelAnimationFrame(raf);visibility.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);
      buttons.forEach(button=>galaxy.append(button));viewport.remove();dock.remove();galaxy.classList.remove('skills-orbit-ready');galaxy.classList.add('skills-orbit-fallback');section.classList.remove('is-orbit-enhanced');
    });
    toggle.hidden=reduced.matches;onReduced();select(selected);requestFrame();
  }
})();
