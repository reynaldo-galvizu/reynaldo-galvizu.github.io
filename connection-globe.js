/* Original dotted Earth. Geographic source: Natural Earth, public domain.
   Connections are illustrative; they do not represent visitor data or employment. */
(() => {
  "use strict";
  const host = document.querySelector(".connection-globe");
  if (!host) return;
  const viewport = host.querySelector("#connection-viewport");
  const toggle = host.querySelector(".connection-toggle");
  const hint = host.querySelector(".connection-hint-text");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let started = false;
  let active = false;
  let wake = () => {};
  function fallback() {
    host.classList.remove("connection-ready");
    host.classList.add("connection-failed");
    toggle.hidden = true;
    viewport.removeAttribute("tabindex");
    viewport.setAttribute("aria-label", "Ilustración de la Tierra y sus conexiones.");
    if (hint) hint.textContent = "Ideas que conectan.";
  }
  async function initialise() {
    if (started) return;
    started = true;
    if (location.protocol === "file:") { fallback(); return; }
    try {
      const [THREE, map] = await Promise.all([
        import("./assets/vendor/three.module.min.js"),
        fetch("./assets/world-land.geojson").then(response => {
          if (!response.ok) throw Error("Geography unavailable");
          return response.json();
        })
      ]);
      build(THREE, map);
    } catch (_) { fallback(); }
  }
  const observer = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
    if (active) { initialise(); wake(); }
  }, { rootMargin: "120px 0px", threshold: 0 });
  observer.observe(host);

  function build(THREE, map) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
    catch (_) { fallback(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.className = "connection-canvas";
    canvas.setAttribute("aria-hidden", "true");
    viewport.prepend(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, .1, 40);
    camera.position.set(0, 0, 8.8);
    const earth = new THREE.Group();
    earth.rotation.set(.12, -.42, -.13);
    scene.add(earth);
    const RADIUS = 2.27;
    function position(lon, lat, radius = RADIUS) {
      const p = lat * Math.PI / 180;
      const t = lon * Math.PI / 180;
      return new THREE.Vector3(Math.cos(p) * Math.sin(t) * radius, Math.sin(p) * radius, Math.cos(p) * Math.cos(t) * radius);
    }
    const globe = new THREE.Mesh(new THREE.SphereGeometry(RADIUS - .016, 64, 40), new THREE.MeshBasicMaterial({ color: 0x0b1920 }));
    earth.add(globe);
    // A quiet geodesic network gives the dots a connected, physical surface.
    // The opaque Earth still hides all lines on the far hemisphere.
    const networkSurface = new THREE.IcosahedronGeometry(RADIUS + .005, 3);
    const network = new THREE.LineSegments(new THREE.WireframeGeometry(networkSurface), new THREE.LineBasicMaterial({
      color: 0x91d4c1, transparent: true, opacity: .075, depthWrite: false
    }));
    networkSurface.dispose();
    earth.add(network);
    // Polygon bounding boxes avoid thousands of unnecessary point-in-ring tests.
    const polygons = [];
    for (const feature of map.features || []) {
      const geometry = feature.geometry;
      const list = geometry?.type === "MultiPolygon" ? geometry.coordinates : geometry?.type === "Polygon" ? [geometry.coordinates] : [];
      for (const rings of list) {
        const outer = rings[0];
        const xs = outer.map(p => p[0]), ys = outer.map(p => p[1]);
        polygons.push({ rings, west: Math.min(...xs), east: Math.max(...xs), south: Math.min(...ys), north: Math.max(...ys) });
      }
    }
    if (!polygons.length) { renderer.dispose(); canvas.remove(); fallback(); return; }
    function inRing(x, y, ring) {
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const a = ring[i], b = ring[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
      return inside;
    }
    function isLand(lon, lat) {
      return polygons.some(p => lon >= p.west && lon <= p.east && lat >= p.south && lat <= p.north && inRing(lon, lat, p.rings[0]) && !p.rings.slice(1).some(hole => inRing(lon, lat, hole)));
    }
    const land = [], sea = [];
    // Equal-area Fibonacci distribution remains uniform around the poles.
    const N = 14200, golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - 2 * (i + .5) / N;
      const latitude = Math.asin(y) * 180 / Math.PI;
      const longitude = ((i * golden * 180 / Math.PI) % 360) - 180;
      const onLand = isLand(longitude, latitude);
      if (!onLand && i % 3 !== 0) continue;
      const point = position(longitude, latitude);
      (onLand ? land : sea).push(point.x, point.y, point.z);
    }
    function dots(coordinates, color, size, opacity) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(coordinates, 3));
      const material = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { tint: { value: new THREE.Color(color) }, dotSize: { value: size }, alpha: { value: opacity }, pixelRatio: { value: renderer.getPixelRatio() } },
        vertexShader: "uniform float dotSize; uniform float pixelRatio; varying float facing; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vec3 n=normalize(mat3(modelViewMatrix)*normalize(position));facing=smoothstep(-0.1,0.9,n.z);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(dotSize*pixelRatio*9.0/-mv.z,1.0,5.0);}",
        fragmentShader: "uniform vec3 tint; uniform float alpha; varying float facing; void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;float edge=1.0-smoothstep(0.26,0.5,d);gl_FragColor=vec4(tint,edge*alpha*(0.26+0.74*facing));\n#include <colorspace_fragment>\n}"
      });
      earth.add(new THREE.Points(geometry, material));
    }
    dots(land, "#bce9cd", 1.9, .95);
    dots(sea, "#6c99aa", 1.05, .23);
    // Hairline graticule: physical depth occlusion hides the far side.
    const guides = new THREE.Group();
    const guideMaterial = new THREE.LineBasicMaterial({ color: 0x7fbaac, transparent: true, opacity: .12 });
    for (const latitude of [-60, -30, 0, 30, 60]) {
      const points = [];
      for (let i = 0; i <= 160; i++) points.push(position(i / 160 * 360 - 180, latitude, RADIUS + .002));
      guides.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), guideMaterial));
    }
    for (let longitude = -180; longitude < 180; longitude += 45) {
      const points = [];
      for (let i = 0; i <= 90; i++) points.push(position(longitude, i * 2 - 90, RADIUS + .002));
      guides.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), guideMaterial));
    }
    earth.add(guides);
    // Fresnel rim; the sphere stays legible without an opaque atmospheric shell.
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.023, 64, 40), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 n; varying vec3 view; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);view=normalize(-p.xyz);gl_Position=projectionMatrix*p;}",
      fragmentShader: "varying vec3 n; varying vec3 view; void main(){float glow=pow(1.0-abs(dot(n,view)),3.0);gl_FragColor=vec4(0.52,0.85,0.76,glow*0.27);}"
    }));
    earth.add(atmosphere);
    const cities = [
      [-3.7, 40.42], [-74.01, 40.71], [-122.42, 37.77], [139.69, 35.68],
      [103.82, 1.35], [151.21, -33.87], [-46.63, -23.55], [18.42, -33.93]
    ].map(([lon, lat]) => position(lon, lat, RADIUS + .025));
    const nodeGeometry = new THREE.SphereGeometry(.028, 10, 8);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffb093 });
    const nodeRings = [];
    const ringGeometry = new THREE.RingGeometry(.045, .055, 24);
    const axis = new THREE.Vector3(0, 0, 1);
    cities.forEach((point, index) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(point); earth.add(node);
      const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({
        color: 0xffb093, transparent: true, opacity: .36, depthWrite: false, side: THREE.DoubleSide
      }));
      ring.position.copy(point).setLength(RADIUS + .028);
      ring.quaternion.setFromUnitVectors(axis, point.clone().normalize());
      earth.add(ring);
      nodeRings.push({ mesh: ring, offset: index * .147 });
    });
    const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [0, 7], [0, 4], [6, 1]];
    const pulses = [];
    const pulseGeometry = new THREE.SphereGeometry(.023, 8, 6);
    const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xd9ffef });
    links.forEach(([from, to], index) => {
      const a = cities[from].clone().normalize(), b = cities[to].clone().normalize();
      const angle = a.angleTo(b), sinAngle = Math.sin(angle);
      function arc(t, point = new THREE.Vector3()) {
        point.copy(a).multiplyScalar(Math.sin((1 - t) * angle) / sinAngle).addScaledVector(b, Math.sin(t * angle) / sinAngle);
        return point.normalize().multiplyScalar(RADIUS + .03 + Math.sin(Math.PI * t) * (.25 + angle * .13));
      }
      const points = Array.from({ length: 73 }, (_, i) => arc(i / 72));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: index % 3 === 0 ? 0xff977e : 0xbce9cd, transparent: true, opacity: index % 3 === 0 ? .51 : .35 }));
      earth.add(line);
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xbce9cd, transparent: true, opacity: .13, depthWrite: false }));
      pulse.add(halo); earth.add(pulse);
      // A tapered trail makes movement readable at a glance, rather than a lone dot.
      const samples = 22;
      const trailGeometry = new THREE.BufferGeometry();
      trailGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(samples * 3), 3).setUsage(THREE.DynamicDrawUsage));
      trailGeometry.setAttribute("strength", new THREE.Float32BufferAttribute(Array.from({ length: samples }, (_, i) => Math.pow(i / (samples - 1), 1.6)), 1));
      const trail = new THREE.Line(trailGeometry, new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { tint: { value: new THREE.Color(index % 3 === 0 ? 0xffb093 : 0xd9ffef) } },
        vertexShader: "attribute float strength; varying float glow; void main(){glow=strength;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: "uniform vec3 tint; varying float glow; void main(){gl_FragColor=vec4(tint,glow*.95);\n#include <colorspace_fragment>\n}"
      }));
      // The changing trail may cross its original bounding sphere as the Earth turns.
      trail.frustumCulled = false;
      earth.add(trail);
      pulses.push({ mesh: pulse, arc, trail, samples, offset: index * .127, speed: .075 + index * .004 });
    });
    let paused = reduced.matches;
    let explicitChoice = false;
    let raf = 0, previous = 0, elapsed = 0, lost = false;
    let drag = null, drift = 0;
    let targetX = .12, targetY = -.42;
    const trailPoint = new THREE.Vector3();
    function updateToggle() {
      toggle.setAttribute("aria-pressed", String(paused));
      const label = toggle.querySelector(".connection-toggle-label");
      if (label) label.textContent = paused ? "Activar giro" : "Pausar giro";
      toggle.setAttribute("aria-label", paused ? "Activar el giro y las conexiones del globo" : "Pausar el giro y las conexiones del globo");
    }
    toggle.hidden = false; updateToggle();
    viewport.tabIndex = 0;
    viewport.setAttribute("aria-label", "Globo terrestre 3D con conexiones ilustrativas. Arrastra para girar o utiliza las flechas. Espacio pausa el movimiento.");
    function resize() {
      const width = viewport.clientWidth, height = viewport.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix();
      requestFrame();
    }
    function requestFrame() {
      if (!raf && !lost && active && !document.hidden) raf = requestAnimationFrame(render);
    }
    function render(timestamp) {
      raf = 0;
      if (lost || !active || document.hidden) { previous = 0; return; }
      const delta = previous ? Math.min((timestamp - previous) / 1000, .055) : 0;
      previous = timestamp;
      if (!paused) {
        elapsed += delta;
        if (!drag) {
          targetY += delta * .075;
          if (!reduced.matches) { targetY += drift; drift *= .94; }
        }
      }
      const ease = reduced.matches ? 1 : Math.min(delta * 7 + .035, 1);
      earth.rotation.y += (targetY - earth.rotation.y) * ease;
      earth.rotation.x += (targetX - earth.rotation.x) * ease;
      nodeRings.forEach(({ mesh, offset }) => {
        const wave = (elapsed * .31 + offset) % 1;
        mesh.scale.setScalar(1 + wave * 1.25);
        mesh.material.opacity = .35 * (1 - wave);
      });
      pulses.forEach(({ mesh, arc, trail, samples, offset, speed }) => {
        const phase = (elapsed * speed + offset) % 1;
        mesh.position.copy(arc(phase, trailPoint));
        const positions = trail.geometry.attributes.position;
        for (let i = 0; i < samples; i++) {
          // Clamp the tail at the source, so a new pulse never draws a chord through Earth.
          arc(Math.max(0, phase - .13 * (1 - i / (samples - 1))), trailPoint);
          positions.setXYZ(i, trailPoint.x, trailPoint.y, trailPoint.z);
        }
        positions.needsUpdate = true;
      });
      renderer.render(scene, camera);
      const easing = Math.abs(targetY - earth.rotation.y) + Math.abs(targetX - earth.rotation.x) > .0001;
      if (!paused || drag || easing) requestFrame();
      else previous = 0;
    }
    wake = () => { previous = 0; requestFrame(); };
    toggle.addEventListener("click", () => { explicitChoice = true; paused = !paused; updateToggle(); wake(); });
    viewport.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) return;
      event.preventDefault();
      if (event.key === " ") { explicitChoice = true; paused = !paused; updateToggle(); }
      else if (event.key === "ArrowLeft") targetY -= .18;
      else if (event.key === "ArrowRight") targetY += .18;
      else targetX = THREE.MathUtils.clamp(targetX + (event.key === "ArrowUp" ? -.12 : .12), -.55, .55);
      wake();
    });
    viewport.addEventListener("pointerdown", event => {
      if (event.button !== 0 || !event.isPrimary) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moving: false };
      drift = 0;
    });
    viewport.addEventListener("pointermove", event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.lastX, dy = event.clientY - drag.lastY;
      if (!drag.moving && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5) {
        if (event.pointerType === "touch" && Math.abs(event.clientY - drag.y) > Math.abs(event.clientX - drag.x)) { drag = null; return; }
        drag.moving = true;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add("is-dragging");
      }
      if (drag.moving) {
        targetY += dx * .006;
        targetX = THREE.MathUtils.clamp(targetX + dy * .0035, -.55, .55);
        drift = dx * .00017;
      }
      drag.lastX = event.clientX; drag.lastY = event.clientY;
      wake();
    });
    function release(event) {
      if (!drag || event.pointerId !== drag.id) return;
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      drag = null; viewport.classList.remove("is-dragging"); wake();
    }
    viewport.addEventListener("pointerup", release);
    viewport.addEventListener("pointercancel", release);
    viewport.addEventListener("lostpointercapture", () => { drag = null; viewport.classList.remove("is-dragging"); });
    window.addEventListener("pointerup", release);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("pageshow", wake);
    reduced.addEventListener("change", () => { if (!explicitChoice) paused = reduced.matches; updateToggle(); wake(); });
    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0;
      fallback();
    });
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(viewport);
    host.classList.add("connection-ready");
    resize(); wake();
  }
})();
