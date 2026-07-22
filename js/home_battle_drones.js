// js/home_battle_drones.js
// Three technical drones fly in circular paths around the page while dogfighting.
// 1st Drone blasts in Section 5 (Process Section).
// 2nd Drone blasts in Section 8 (Global Operations Section).

(function () {
  const container = document.getElementById('home-battle-container');
  if (!container || typeof THREE === 'undefined') return;

  let scene, camera, renderer;
  let dA, dB, dC;
  const bolts = [];
  let shotTimer = 0;
  const clock = new THREE.Clock();

  function init() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Build 3 Technical Drones with circular orbiting flight params
    dA = buildTechnicalDroneData(-2.5, 0.8, -0.5, 0.38, 0.0014, 1.8, 1.2, 0);          // Drone 1 (Sec 5 blast)
    dB = buildTechnicalDroneData(2.5, 0.4, 0.2, 0.36, 0.0012, 2.0, 1.4, Math.PI / 1.5); // Drone 2 (Sec 8 blast)
    dC = buildTechnicalDroneData(0.0, -0.8, -0.8, 0.40, 0.0016, 2.2, 1.0, Math.PI);    // Drone 3 (Survivor)

    scene.add(dA.mainGroup);
    scene.add(dB.mainGroup);
    scene.add(dC.mainGroup);

    window.addEventListener('resize', onWindowResize);
    animate();
  }

  function createTechnicalMesh(geometry, faceColor = 0xfafafa, lineColor = 0x050505) {
    const faceMaterial = new THREE.MeshBasicMaterial({
      color: faceColor,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      transparent: true,
      opacity: 0.95
    });

    const mesh = new THREE.Mesh(geometry, faceMaterial);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, linewidth: 1 });
    const line = new THREE.LineSegments(edges, lineMaterial);

    mesh.add(line);
    return mesh;
  }

  function buildTechnicalDroneData(x, y, z, scale, orbitSpeed, radiusX, radiusY, phaseOffset) {
    const mainGroup = new THREE.Group();
    const parts = [];
    const propellers = [];

    const addPart = (mesh, defaultPos, defaultRot = new THREE.Euler()) => {
      const partGroup = new THREE.Group();
      partGroup.position.copy(defaultPos);
      partGroup.rotation.copy(defaultRot);
      partGroup.add(mesh);
      mainGroup.add(partGroup);

      parts.push({
        group: partGroup,
        mesh: mesh,
        defaultPos: defaultPos.clone(),
        defaultRot: defaultRot.clone(),
        currentPos: defaultPos.clone(),
        currentRot: defaultRot.clone(),
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3()
      });
      return partGroup;
    };

    // 1. Fuselage
    const fuselageGeom = new THREE.CylinderGeometry(0.3, 0.2, 1.8, 8);
    fuselageGeom.rotateX(Math.PI / 2);
    addPart(createTechnicalMesh(fuselageGeom), new THREE.Vector3(0, 0, 0));

    // 2. Core
    const coreGeom = new THREE.SphereGeometry(0.22, 12, 12);
    addPart(createTechnicalMesh(coreGeom, 0xffffff, 0x000000), new THREE.Vector3(0, -0.15, 0.5));

    // 3. Wings
    const wingGeom = new THREE.BoxGeometry(3.6, 0.04, 0.4);
    addPart(createTechnicalMesh(wingGeom), new THREE.Vector3(0, 0.1, -0.1));

    // 4. Vertical Stabilizers
    const stabLGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    addPart(createTechnicalMesh(stabLGeom), new THREE.Vector3(-1.8, 0.2, -0.1));
    const stabRGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    addPart(createTechnicalMesh(stabRGeom), new THREE.Vector3(1.8, 0.2, -0.1));

    // 5. Rotor Arms & Motor Pods
    const armPositions = [
      [-0.8, 0, 0.6], [0.8, 0, 0.6],
      [-0.8, 0, -0.6], [0.8, 0, -0.6]
    ];
    armPositions.forEach((pos, idx) => {
      const armGeom = new THREE.BoxGeometry(0.06, 0.06, 1.4);
      const rotY = (idx === 0 || idx === 3) ? Math.PI / 4 : -Math.PI / 4;
      addPart(createTechnicalMesh(armGeom), new THREE.Vector3(pos[0] / 2, pos[1], pos[2] / 2), new THREE.Euler(0, rotY, 0));

      const motorGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
      addPart(createTechnicalMesh(motorGeom), new THREE.Vector3(pos[0], pos[1] + 0.1, pos[2]));

      const propGroup = new THREE.Group();
      const bladeGeom = new THREE.BoxGeometry(0.7, 0.01, 0.04);
      propGroup.add(createTechnicalMesh(bladeGeom));
      addPart(propGroup, new THREE.Vector3(pos[0], pos[1] + 0.23, pos[2]));
      propellers.push({ group: propGroup, isRear: false, idx });
    });

    // 6. Rear Fan
    const shroudGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12);
    shroudGeom.rotateX(Math.PI / 2);
    addPart(createTechnicalMesh(shroudGeom), new THREE.Vector3(0, 0, -0.95));

    const rearPropGroup = new THREE.Group();
    const rearBladeGeom = new THREE.BoxGeometry(0.48, 0.01, 0.03);
    rearBladeGeom.rotateX(Math.PI / 2);
    rearPropGroup.add(createTechnicalMesh(rearBladeGeom));
    addPart(rearPropGroup, new THREE.Vector3(0, 0, -0.95));
    propellers.push({ group: rearPropGroup, isRear: true, idx: 4 });

    const basePos = new THREE.Vector3(x, y, z);
    mainGroup.position.copy(basePos);
    mainGroup.scale.setScalar(scale);

    return {
      mainGroup,
      parts,
      propellers,
      basePos,
      scale,
      orbitSpeed,
      radiusX,
      radiusY,
      phaseOffset,
      state: 'flying', // 'flying', 'exploding', 'exploded'
      explodeElapsed: 0,
      sparkParticles: []
    };
  }

  function spawnBolt(from, to, color) {
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    const geo = new THREE.CylinderGeometry(0.025, 0.025, 0.65, 5);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(from);

    const dummy = new THREE.Object3D();
    dummy.position.copy(from);
    dummy.lookAt(to);
    mesh.rotation.copy(dummy.rotation);

    scene.add(mesh);
    bolts.push({ mesh, dir, speed: 7.0, life: 1.0 });
  }

  function triggerExplosion(drone) {
    if (drone.state !== 'flying') return;
    drone.state = 'exploding';
    drone.explodeElapsed = 0;

    drone.parts.forEach(part => {
      part.vel.set(
        (Math.random() - 0.5) * 5.5,
        Math.random() * 4.5 + 1.2,
        (Math.random() - 0.5) * 5.5
      );
      part.rotVel.set(
        (Math.random() - 0.5) * 9.0,
        (Math.random() - 0.5) * 9.0,
        (Math.random() - 0.5) * 9.0
      );
    });

    const pColors = [0xff3300, 0xff7700, 0xffcc00, 0xffffff];
    for (let i = 0; i < 50; i++) {
      const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 5, 5);
      const mat = new THREE.MeshBasicMaterial({
        color: pColors[Math.floor(Math.random() * pColors.length)],
        transparent: true,
        opacity: 0.95
      });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(drone.mainGroup.position).add(
        new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5)
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8.5,
        Math.random() * 7.0 + 1.5,
        (Math.random() - 0.5) * 8.5
      );
      scene.add(p);
      drone.sparkParticles.push({ mesh: p, vel });
    }
  }

  function resetDrone(drone) {
    drone.state = 'flying';
    drone.explodeElapsed = 0;
    drone.mainGroup.visible = true;

    drone.parts.forEach(part => {
      part.group.position.copy(part.defaultPos);
      part.group.rotation.copy(part.defaultRot);
      part.currentPos.copy(part.defaultPos);
      part.currentRot.copy(part.defaultRot);
      if (part.mesh.material) part.mesh.material.opacity = 0.95;
    });

    drone.sparkParticles.forEach(p => scene.remove(p.mesh));
    drone.sparkParticles = [];
    drone.mainGroup.position.copy(drone.basePos);
    drone.mainGroup.rotation.set(0, 0, 0);
  }

  function getScrollY() {
    if (window.lenis && typeof window.lenis.scroll === 'number') {
      return window.lenis.scroll;
    }
    return window.scrollY || window.pageYOffset || 0;
  }

  // Get absolute scroll position of DOM element
  function getSectionScrollTop(selector, defaultPx) {
    const el = document.querySelector(selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      return rect.top + getScrollY() - (window.innerHeight * 0.3);
    }
    return defaultPx;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();
    const now = Date.now();
    const scrollY = getScrollY();

    // Visibility toggle: show battle layer past Hero section (scrollY > 300px)
    if (scrollY > 300) {
      container.style.opacity = '1';
    } else {
      container.style.opacity = '0';
      if (dA.state !== 'flying' || dB.state !== 'flying' || dC.state !== 'flying') {
        [dA, dB, dC].forEach(resetDrone);
      }
      return; // Skip rendering overhead while in hero section!
    }

    // Dynamic section scroll targets
    // Section 5: #process-section
    const sec5Scroll = getSectionScrollTop('#process-section', 2200);
    // Section 8: #global-operations-section
    const sec8Scroll = getSectionScrollTop('#global-operations-section', 4200);

    // 1st Explosion: Drone 1 (dA) blasts at Section 5
    if (scrollY >= sec5Scroll && dA.state === 'flying') {
      spawnBolt(dB.mainGroup.position.clone(), dA.mainGroup.position.clone(), 0xff3300);
      triggerExplosion(dA);
    }

    // 2nd Explosion: Drone 2 (dB) blasts at Section 8 (Global Operations)
    if (scrollY >= sec8Scroll && dB.state === 'flying') {
      spawnBolt(dC.mainGroup.position.clone(), dB.mainGroup.position.clone(), 0x00ccff);
      triggerExplosion(dB);
    }

    // ── Spin propellers ──
    [dA, dB, dC].forEach(drone => {
      drone.propellers.forEach(p => {
        if (p.isRear) p.group.rotation.z += 0.45;
        else p.group.rotation.y += (p.idx % 2 === 0 ? 0.40 : -0.40);
      });
    });

    // ── Circular Orbiting Flight Motion around page ──
    [dA, dB, dC].forEach(drone => {
      if (drone.state === 'flying') {
        const angle = (now * drone.orbitSpeed) + drone.phaseOffset;
        
        // Circular / elliptical orbit around page center
        const posX = drone.basePos.x + Math.cos(angle) * drone.radiusX;
        const posY = drone.basePos.y + Math.sin(angle * 1.2) * drone.radiusY;
        const posZ = drone.basePos.z + Math.sin(angle * 0.8) * 0.4;

        drone.mainGroup.position.set(posX, posY, posZ);

        // Bank into circular turns (roll & pitch & yaw)
        const tangentX = -Math.sin(angle);
        drone.mainGroup.rotation.z = -tangentX * 0.35; // Bank roll
        drone.mainGroup.rotation.y = tangentX * 0.30;  // Yaw direction
        drone.mainGroup.rotation.x = 0.12 + (Math.sin(angle * 1.2) * 0.10); // Pitch
      }
    });

    // ── Random Dogfight Laser Shooting ──
    if (scrollY > 300) {
      shotTimer += dt;
      if (shotTimer >= 0.50) {
        shotTimer = 0;
        if (dA.state === 'flying' && dB.state === 'flying') {
          spawnBolt(dA.mainGroup.position.clone(), dB.mainGroup.position.clone(), 0x00ccff);
        }
        if (dB.state === 'flying' && dC.state === 'flying' && Math.random() > 0.3) {
          spawnBolt(dB.mainGroup.position.clone(), dC.mainGroup.position.clone(), 0xff6600);
        }
      }
    }

    // ── Explosion Physics & Fade out ──
    [dA, dB, dC].forEach(drone => {
      if (drone.state === 'exploding') {
        drone.explodeElapsed += dt;
        const t = drone.explodeElapsed;
        const gravity = -3.5;

        drone.parts.forEach(part => {
          part.currentPos.x = part.defaultPos.x + part.vel.x * t;
          part.currentPos.y = part.defaultPos.y + part.vel.y * t + 0.5 * gravity * t * t;
          part.currentPos.z = part.defaultPos.z + part.vel.z * t;

          part.group.position.copy(part.currentPos);
          part.group.rotation.x = part.defaultRot.x + part.rotVel.x * t;
          part.group.rotation.y = part.defaultRot.y + part.rotVel.y * t;
          part.group.rotation.z = part.defaultRot.z + part.rotVel.z * t;

          const op = Math.max(0, 0.95 - (t / 2.0));
          if (part.mesh.material) part.mesh.material.opacity = op;
        });

        drone.sparkParticles.forEach(p => {
          p.mesh.position.x += p.vel.x * dt;
          p.mesh.position.y += (p.vel.y + 0.5 * gravity * t) * dt;
          p.mesh.position.z += p.vel.z * dt;

          const scale = Math.max(0, 1.0 - (t / 1.5));
          p.mesh.scale.set(scale, scale, scale);
          p.mesh.material.opacity = scale;
        });

        if (t > 2.2) {
          drone.state = 'exploded';
          drone.mainGroup.visible = false;
        }
      }
    });

    // ── Advance Laser Bolts ──
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.mesh.position.addScaledVector(b.dir, b.speed * dt);
      b.life -= dt;
      if (b.life <= 0) {
        scene.remove(b.mesh);
        bolts.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
