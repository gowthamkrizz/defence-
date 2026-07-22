// Three.js script to animate a drone flying in about-hero and exploding.
// Runs reliably across desktop and mobile devices.

(function() {
  const container = document.getElementById('about-drone-container');
  if (!container || typeof THREE === 'undefined') return;

  let scene, camera, renderer;
  const droneParts = [];
  const particleGroup = new THREE.Group();
  let mainGroup = new THREE.Group();

  // Timing states
  let lastStateChange = Date.now();
  let state = 'flying'; // 'flying' or 'exploded'
  const FLY_DURATION = 3500;     // 3.5 seconds flight before explosion
  const EXPLODE_DURATION = 2600; // 2.6 seconds explosion effect

  function init() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // Create Scene
    scene = new THREE.Scene();

    // Create Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    // Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    scene.add(particleGroup);

    // Build the Explodable Drone
    buildExplodableDrone();
    scene.add(mainGroup);

    updateResponsiveCamera();
    window.addEventListener('resize', onWindowResize);
    
    lastStateChange = Date.now();
    animate();
  }

  function updateResponsiveCamera() {
    if (!container || !camera) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const isMobile = width < 768;
    if (isMobile) {
      camera.position.set(0, 0.3, 9.5);
      mainGroup.scale.set(0.65, 0.65, 0.65);
    } else {
      camera.position.set(0, 0.5, 7.5);
      mainGroup.scale.set(1.0, 1.0, 1.0);
    }
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

  function buildExplodableDrone() {
    const addPart = (mesh, defaultPos, defaultRot = new THREE.Euler(), isPropeller = false, propAxis = 'y') => {
      const partGroup = new THREE.Group();
      partGroup.position.copy(defaultPos);
      partGroup.rotation.copy(defaultRot);
      partGroup.add(mesh);
      mainGroup.add(partGroup);

      droneParts.push({
        group: partGroup,
        mesh: mesh,
        defaultPos: defaultPos.clone(),
        defaultRot: defaultRot.clone(),
        currentPos: defaultPos.clone(),
        currentRot: defaultRot.clone(),
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        isPropeller: isPropeller,
        propAxis: propAxis
      });
      return partGroup;
    };

    // 1. Central Fuselage
    const fuselageGeom = new THREE.CylinderGeometry(0.3, 0.2, 1.8, 8);
    fuselageGeom.rotateX(Math.PI / 2);
    addPart(createTechnicalMesh(fuselageGeom), new THREE.Vector3(0, 0, 0));

    // Core Pod
    const coreGeom = new THREE.SphereGeometry(0.22, 12, 12);
    addPart(createTechnicalMesh(coreGeom, 0xffffff, 0x000000), new THREE.Vector3(0, -0.15, 0.5));

    // 2. Wings
    const wingGeom = new THREE.BoxGeometry(3.6, 0.04, 0.4);
    addPart(createTechnicalMesh(wingGeom), new THREE.Vector3(0, 0.1, -0.1));

    // Vertical Stabilizers
    const stabLeftGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    addPart(createTechnicalMesh(stabLeftGeom), new THREE.Vector3(-1.8, 0.2, -0.1));
    const stabRightGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    addPart(createTechnicalMesh(stabRightGeom), new THREE.Vector3(1.8, 0.2, -0.1));

    // 3. Rotor Arms & Motor Pods
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
      addPart(propGroup, new THREE.Vector3(pos[0], pos[1] + 0.23, pos[2]), new THREE.Euler(), true, 'y');
    });

    // 4. Rear Propulsion Fan
    const rearShroudGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12);
    rearShroudGeom.rotateX(Math.PI / 2);
    addPart(createTechnicalMesh(rearShroudGeom), new THREE.Vector3(0, 0, -0.95));

    const rearPropGroup = new THREE.Group();
    const rearBladeGeom = new THREE.BoxGeometry(0.48, 0.01, 0.03);
    rearBladeGeom.rotateX(Math.PI / 2);
    rearPropGroup.add(createTechnicalMesh(rearBladeGeom));
    addPart(rearPropGroup, new THREE.Vector3(0, 0, -0.95), new THREE.Euler(), true, 'z');
  }

  function triggerExplosion() {
    state = 'exploded';
    lastStateChange = Date.now();

    droneParts.forEach(part => {
      part.vel.set(
        (Math.random() - 0.5) * 6.0,
        Math.random() * 5.0 + 1.5,
        (Math.random() - 0.5) * 6.0
      );
      part.rotVel.set(
        (Math.random() - 0.5) * 9.0,
        (Math.random() - 0.5) * 9.0,
        (Math.random() - 0.5) * 9.0
      );
    });

    particleGroup.clear();
    const particleCount = 48;
    const geom = new THREE.BoxGeometry(0.07, 0.07, 0.07);

    for (let i = 0; i < particleCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.4 ? 0xff3300 : 0xffaa00,
        transparent: true,
        opacity: 0.95
      });
      const p = new THREE.Mesh(geom, mat);
      p.position.set(
        mainGroup.position.x + (Math.random() - 0.5) * 0.4,
        mainGroup.position.y + (Math.random() - 0.5) * 0.4,
        mainGroup.position.z + (Math.random() - 0.5) * 0.4
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 7.5,
        Math.random() * 6.0 + 2.5,
        (Math.random() - 0.5) * 7.5
      );

      particleGroup.add(p);
      p.userData = { vel: vel, gravity: -9.8 };
    }
  }

  function resetDrone() {
    state = 'flying';
    lastStateChange = Date.now();
    particleGroup.clear();

    droneParts.forEach(part => {
      part.group.position.copy(part.defaultPos);
      part.group.rotation.copy(part.defaultRot);
      part.currentPos.copy(part.defaultPos);
      part.currentRot.copy(part.defaultRot);
      if (part.mesh.material) part.mesh.material.opacity = 0.95;
    });

    const isMobile = window.innerWidth < 768;
    mainGroup.position.set(isMobile ? -2.2 : -4.5, 0.3, 0);
    mainGroup.rotation.set(0, 0, 0);
  }

  function onWindowResize() {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;
    renderer.setSize(width, height);
    updateResponsiveCamera();
  }

  function animate() {
    requestAnimationFrame(animate);

    const now = Date.now();
    const elapsed = now - lastStateChange;
    const isMobile = window.innerWidth < 768;

    if (state === 'flying') {
      const sweepProgress = Math.min(1, elapsed / FLY_DURATION);

      let posX, velocityX;
      if (isMobile) {
        // Mobile: flies smoothly from left (-2.2) to exact middle (0.0) in 3.5s and blasts in middle!
        const sweepAngle = sweepProgress * (Math.PI / 2);
        posX = -2.2 + 2.2 * Math.sin(sweepAngle);
        velocityX = Math.cos(sweepAngle) * 0.5;
      } else {
        // Desktop: flies across screen
        const sweepAngle = sweepProgress * Math.PI;
        posX = -4.5 + 9.0 * (1 - Math.cos(sweepAngle)) / 2;
        velocityX = Math.sin(sweepAngle);
      }

      const bobY = Math.sin(now * 0.002) * (isMobile ? 0.12 : 0.18);

      mainGroup.position.x = posX;
      mainGroup.position.y = 0.3 + bobY;

      mainGroup.rotation.z = -velocityX * 0.25;
      mainGroup.rotation.x = 0.12 - bobY * 0.15;
      mainGroup.rotation.y = velocityX * 0.20;

      droneParts.forEach((part, idx) => {
        if (part.isPropeller) {
          if (part.propAxis === 'y') {
            part.group.rotation.y += (idx % 2 === 0 ? 0.40 : -0.40);
          } else {
            part.group.rotation.z += 0.50;
          }
        }
      });

      if (elapsed >= FLY_DURATION) {
        triggerExplosion();
      }

    } else if (state === 'exploded') {
      const t = elapsed / 1000;

      droneParts.forEach(part => {
        const gravity = -3.2;
        part.currentPos.x = part.defaultPos.x + part.vel.x * t;
        part.currentPos.y = part.defaultPos.y + part.vel.y * t + 0.5 * gravity * t * t;
        part.currentPos.z = part.defaultPos.z + part.vel.z * t;

        part.group.rotation.x = part.defaultRot.x + part.rotVel.x * t;
        part.group.rotation.y = part.defaultRot.y + part.rotVel.y * t;
        part.group.rotation.z = part.defaultRot.z + part.rotVel.z * t;

        part.group.position.copy(part.currentPos);
        if (part.mesh.material) part.mesh.material.opacity = Math.max(0, 0.95 - (elapsed / EXPLODE_DURATION));
      });

      particleGroup.children.forEach(p => {
        const pVel = p.userData.vel;
        const g = p.userData.gravity;

        p.position.x += pVel.x * 0.016;
        p.position.y += (pVel.y + 0.5 * g * t) * 0.016;
        p.position.z += pVel.z * 0.016;

        const scl = Math.max(0, 1 - (elapsed / 1200));
        p.scale.set(scl, scl, scl);
      });

      if (elapsed >= EXPLODE_DURATION) {
        resetDrone();
      }
    }

    renderer.render(scene, camera);
  }

  // Dual initialization trigger (DOMContentLoaded + immediate fallback)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
