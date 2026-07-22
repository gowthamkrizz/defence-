// contact_battle_drones.js
// Two technical drones dogfight in the contact hero section.
// Fully responsive for mobile and desktop screens.

(function () {
  const container = document.getElementById('contact-drone-container');
  if (!container || typeof THREE === 'undefined') return;

  /* ─── Scene ─────────────────────────────────────── */
  const scene = new THREE.Scene();
  const W = () => container.clientWidth || window.innerWidth;
  const H = () => container.clientHeight || 500;

  const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W(), H());
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);
  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  /* ─── Technical Drone Builder ── */
  function createTechnicalDrone() {
    const droneGroup = new THREE.Group();
    const propellers = [];

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

    // Fuselage
    const fuselageGeom = new THREE.CylinderGeometry(0.3, 0.2, 1.8, 8);
    fuselageGeom.rotateX(Math.PI / 2);
    droneGroup.add(createTechnicalMesh(fuselageGeom));

    // Core dome
    const coreGeom = new THREE.SphereGeometry(0.22, 12, 12);
    coreGeom.translate(0, -0.15, 0.5);
    droneGroup.add(createTechnicalMesh(coreGeom, 0xffffff, 0x000000));

    // Wings
    const wingGeom = new THREE.BoxGeometry(3.6, 0.04, 0.4);
    wingGeom.translate(0, 0.1, -0.1);
    droneGroup.add(createTechnicalMesh(wingGeom));

    // Vertical stabilizers
    const stabLG = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    stabLG.translate(-1.8, 0.2, -0.1);
    droneGroup.add(createTechnicalMesh(stabLG));
    const stabRG = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    stabRG.translate(1.8, 0.2, -0.1);
    droneGroup.add(createTechnicalMesh(stabRG));

    // Rotor arms + motor pods + propellers
    const armPositions = [
      [-0.8, 0, 0.6], [0.8, 0, 0.6],
      [-0.8, 0, -0.6], [0.8, 0, -0.6]
    ];
    armPositions.forEach((pos, idx) => {
      const armGeom = new THREE.BoxGeometry(0.06, 0.06, 1.4);
      const arm = createTechnicalMesh(armGeom);
      arm.position.set(pos[0] / 2, pos[1], pos[2] / 2);
      arm.rotation.y = (idx === 0 || idx === 3) ? Math.PI / 4 : -Math.PI / 4;
      droneGroup.add(arm);

      const motorGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
      const motor = createTechnicalMesh(motorGeom);
      motor.position.set(pos[0], pos[1] + 0.1, pos[2]);
      droneGroup.add(motor);

      const propGroup = new THREE.Group();
      propGroup.position.set(pos[0], pos[1] + 0.23, pos[2]);
      const bladeGeom = new THREE.BoxGeometry(0.7, 0.01, 0.04);
      propGroup.add(createTechnicalMesh(bladeGeom));
      droneGroup.add(propGroup);
      propellers.push(propGroup);
    });

    // Rear propulsion fan
    const rearShroudGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12);
    rearShroudGeom.rotateX(Math.PI / 2);
    const shroud = createTechnicalMesh(rearShroudGeom);
    shroud.position.set(0, 0, -0.95);
    droneGroup.add(shroud);

    const rearPropGroup = new THREE.Group();
    rearPropGroup.position.set(0, 0, -0.95);
    const rearBladeGeom = new THREE.BoxGeometry(0.48, 0.01, 0.03);
    rearBladeGeom.rotateX(Math.PI / 2);
    rearPropGroup.add(createTechnicalMesh(rearBladeGeom));
    droneGroup.add(rearPropGroup);
    propellers.push(rearPropGroup);

    return { mesh: droneGroup, propellers };
  }

  /* ─── Build Two Drones ──────────────────────────── */
  const dA = createTechnicalDrone();       // left — attacker
  dA.mesh.rotation.y = 0.25;
  scene.add(dA.mesh);

  const dB = createTechnicalDrone();       // right — victim
  dB.mesh.rotation.y = Math.PI - 0.25;
  scene.add(dB.mesh);

  function getPositions() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return {
        baseA: { x: -1.2, y: 0.4, z: 0 },
        baseB: { x: 1.6, y: 0.4, z: 0 },
        fightA: { x: -0.9, y: 0.4, z: 0 },
        fightB: { x: 1.3, y: 0.4, z: 0 },
        scale: 0.30
      };
    }
    return {
      baseA: { x: -2.0, y: 0.5, z: 0 },
      baseB: { x: 5.0, y: 0.5, z: 0 },
      fightA: { x: -1.7, y: 0.5, z: 0 },
      fightB: { x: 4.7, y: 0.5, z: 0 },
      scale: 0.42
    };
  }

  function updateResponsiveCamera() {
    if (!container || !camera) return;
    const width = W();
    const height = H();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const isMobile = width < 768;
    if (isMobile) {
      camera.position.set(0, 0.4, 11.5);
    } else {
      camera.position.set(0, 0.5, 10.0);
    }

    const pos = getPositions();
    dA.mesh.scale.setScalar(pos.scale);
    dB.mesh.scale.setScalar(pos.scale);
  }

  /* ─── Laser Bolts ───────────────────────────────── */
  const bolts = [];

  function spawnBolt(from, to, col) {
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    const geo = new THREE.CylinderGeometry(0.022, 0.022, 0.6, 5);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: col });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(from);
    
    const dummy = new THREE.Object3D();
    dummy.position.copy(from);
    dummy.lookAt(to);
    mesh.rotation.copy(dummy.rotation);
    scene.add(mesh);
    bolts.push({ mesh, dir, speed: 5.5, life: 1.2 });
  }

  /* ─── Explosion ─────────────────────────────────── */
  const explodeParts = [];
  const explodeParticles = [];
  let exploding = false;
  let explodeElapsed = 0;
  const EXPLODE_DUR = 2800;

  function triggerExplosion() {
    exploding = true;
    explodeElapsed = 0;

    dB.mesh.children.forEach(child => {
      const wp = new THREE.Vector3();
      child.getWorldPosition(wp);
      const clone = child.clone();
      clone.position.copy(wp);
      clone.rotation.copy(child.rotation);
      clone.traverse(o => {
        if (o.material) {
          o.material = o.material.clone();
          o.material.transparent = true;
        }
      });
      scene.add(clone);
      explodeParts.push({
        mesh: clone,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 4.5,
          Math.random() * 3.5 + 0.5,
          (Math.random() - 0.5) * 4.5
        ),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 7
        )
      });
    });
    dB.mesh.visible = false;

    const pColors = [0xff3300, 0xff7700, 0xffcc00, 0xffffff, 0xff5500];
    for (let i = 0; i < 52; i++) {
      const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.09, 5, 5);
      const mat = new THREE.MeshBasicMaterial({
        color: pColors[Math.floor(Math.random() * pColors.length)],
        transparent: true, opacity: 1.0
      });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(dB.mesh.position).add(
        new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6)
      );
      scene.add(p);
      explodeParticles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          Math.random() * 6 + 1,
          (Math.random() - 0.5) * 8
        )
      });
    }
  }

  function clearExplosion() {
    explodeParts.forEach(p => scene.remove(p.mesh));
    explodeParts.length = 0;
    explodeParticles.forEach(p => scene.remove(p.mesh));
    explodeParticles.length = 0;
    dB.mesh.visible = true;

    const pos = getPositions();
    dB.mesh.position.set(pos.baseB.x, pos.baseB.y, pos.baseB.z);
    dB.mesh.rotation.y = Math.PI - 0.25;
    exploding = false;
  }

  /* ─── State Machine ─────────────────────────────── */
  let state      = 'circle';
  let stateStart = Date.now();
  let shotTimer  = 0;
  const CIRCLE_DUR = 3000;
  const FIGHT_DUR  = 4000;
  const RESET_DUR  = 900;
  const dt = 1 / 60;

  window.addEventListener('resize', () => {
    renderer.setSize(W(), H());
    updateResponsiveCamera();
  });

  updateResponsiveCamera();

  /* ─── Animate ───────────────────────────────────── */
  function animate() {
    requestAnimationFrame(animate);
    const now     = Date.now();
    const elapsed = now - stateStart;
    const p       = getPositions();

    // Spin propellers
    [dA, dB].forEach(d => {
      d.propellers.forEach((prop, idx) => {
        if (idx === 4) prop.rotation.z += 0.40;
        else prop.rotation.y += (idx % 2 === 0 ? 0.40 : -0.40);
      });
    });

    /* CIRCLE */
    if (state === 'circle') {
      dA.mesh.position.x = p.baseA.x + Math.sin(now * 0.0009) * 0.3;
      dA.mesh.position.y = p.baseA.y + Math.sin(now * 0.0016) * 0.2;
      dA.mesh.rotation.z = -Math.sin(now * 0.0009) * 0.1;
      dA.mesh.rotation.x = 0.12;

      dB.mesh.position.x = p.baseB.x + Math.sin(now * 0.0009 + Math.PI) * 0.3;
      dB.mesh.position.y = p.baseB.y + Math.sin(now * 0.0016 + 1.2) * 0.2;
      dB.mesh.rotation.z = Math.sin(now * 0.0009 + Math.PI) * 0.1;
      dB.mesh.rotation.x = 0.12;

      if (elapsed > CIRCLE_DUR) { state = 'fight'; stateStart = now; shotTimer = 0; }
    }

    /* FIGHT */
    else if (state === 'fight') {
      dA.mesh.position.y = p.fightA.y + Math.sin(now * 0.002) * 0.12;
      dA.mesh.position.x = p.fightA.x;
      dA.mesh.rotation.x = 0.12;
      dA.mesh.rotation.z = 0;

      dB.mesh.position.y = p.fightB.y + Math.sin(now * 0.002 + 1) * 0.12;
      dB.mesh.position.x = p.fightB.x;
      dB.mesh.rotation.x = 0.12;
      dB.mesh.rotation.z = 0;

      shotTimer += dt;
      if (shotTimer >= 0.50) {
        shotTimer = 0;
        spawnBolt(
          dA.mesh.position.clone().add(new THREE.Vector3(0.4, 0, 0.6)),
          dB.mesh.position.clone(),
          0x00ddff
        );
        if (Math.random() > 0.4) {
          spawnBolt(
            dB.mesh.position.clone().add(new THREE.Vector3(-0.4, 0, -0.6)),
            dA.mesh.position.clone(),
            0xff6600
          );
        }
      }

      if (elapsed > FIGHT_DUR) {
        state = 'explode';
        stateStart = now;
        triggerExplosion();
      }
    }

    /* EXPLODE */
    else if (state === 'explode') {
      explodeElapsed += dt * 1000;
      const t = explodeElapsed / 1000;
      const gravity = -4.0;

      explodeParts.forEach(part => {
        part.mesh.position.x += part.vel.x * dt;
        part.mesh.position.y += (part.vel.y + 0.5 * gravity * t) * dt;
        part.mesh.position.z += part.vel.z * dt;
        part.mesh.rotation.x += part.rotVel.x * dt;
        part.mesh.rotation.y += part.rotVel.y * dt;
        part.mesh.rotation.z += part.rotVel.z * dt;
        const op = Math.max(0, 1 - explodeElapsed / EXPLODE_DUR);
        part.mesh.traverse(o => { if (o.material && o.material.opacity !== undefined) o.material.opacity = op; });
      });

      explodeParticles.forEach(p => {
        p.mesh.position.x += p.vel.x * dt;
        p.mesh.position.y += (p.vel.y + 0.5 * gravity * t) * dt;
        p.mesh.position.z += p.vel.z * dt;
        const s = Math.max(0, 1 - explodeElapsed / 1800);
        p.mesh.scale.setScalar(s);
        p.mesh.material.opacity = s;
      });

      dA.mesh.position.x -= 0.8 * dt;
      dA.mesh.rotation.y -= 0.6 * dt;

      if (elapsed > EXPLODE_DUR) {
        state = 'reset';
        stateStart = now;
        clearExplosion();
        dA.mesh.position.set(p.baseA.x, p.baseA.y, p.baseA.z);
        dA.mesh.rotation.y = 0.25;
        bolts.forEach(b => scene.remove(b.mesh));
        bolts.length = 0;
      }
    }

    /* RESET */
    else if (state === 'reset') {
      if (elapsed > RESET_DUR) { state = 'circle'; stateStart = now; }
    }

    /* Advance bolts */
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.mesh.position.addScaledVector(b.dir, b.speed * dt);
      b.life -= dt;
      if (b.life <= 0) { scene.remove(b.mesh); bolts.splice(i, 1); }
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animate);
  } else {
    animate();
  }
})();
