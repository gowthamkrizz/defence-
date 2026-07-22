// Three.js script to animate three small technical drones flying in solutions-hero section
// Fully responsive for mobile and desktop screens

(function() {
  const container = document.getElementById('solutions-drones-container');
  if (!container) return;

  let scene, camera, renderer;
  const drones = [];

  function init() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create Scene
    scene = new THREE.Scene();

    // Create Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.5);

    // Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Instantiate 3 Drones with unique starting properties
    const droneConfigs = [
      {
        id: 1,
        scale: 0.45,
        basePos: new THREE.Vector3(-3.2, 0.7, -1),
        bobSpeed: 0.0018,
        bobHeight: 0.22,
        bobOffset: 0,
        tiltSpeed: 0.001,
        propSpeed: 0.4,
        rotY: 0.2
      },
      {
        id: 2,
        scale: 0.35,
        basePos: new THREE.Vector3(0.2, 1.4, -3),
        bobSpeed: 0.0014,
        bobHeight: 0.18,
        bobOffset: Math.PI / 3,
        tiltSpeed: 0.0008,
        propSpeed: -0.45,
        rotY: -0.1
      },
      {
        id: 3,
        scale: 0.5,
        basePos: new THREE.Vector3(3.0, 0.5, 0.2),
        bobSpeed: 0.002,
        bobHeight: 0.25,
        bobOffset: Math.PI / 1.5,
        tiltSpeed: 0.0012,
        propSpeed: 0.38,
        rotY: -0.4
      }
    ];

    droneConfigs.forEach(config => {
      const droneData = createTechnicalDrone();
      droneData.mesh.scale.set(config.scale, config.scale, config.scale);
      droneData.mesh.position.copy(config.basePos);
      droneData.mesh.rotation.y = config.rotY;

      scene.add(droneData.mesh);

      drones.push({
        mesh: droneData.mesh,
        propellers: droneData.propellers,
        config: config,
        responsivePos: config.basePos.clone()
      });
    });

    updateResponsiveCamera();
    window.addEventListener('resize', onWindowResize);
    animate();
  }

  // Programmatic technical style drone builder
  function createTechnicalDrone() {
    const droneGroup = new THREE.Group();
    const propellers = [];

    // Helper to create a technical/vector style mesh (white face, black outlines)
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
    const fuselage = createTechnicalMesh(fuselageGeom);
    droneGroup.add(fuselage);

    // Core
    const coreGeom = new THREE.SphereGeometry(0.22, 12, 12);
    coreGeom.translate(0, -0.15, 0.5);
    const core = createTechnicalMesh(coreGeom, 0xffffff, 0x000000);
    droneGroup.add(core);

    // Wings
    const wingGeom = new THREE.BoxGeometry(3.6, 0.04, 0.4);
    wingGeom.translate(0, 0.1, -0.1);
    const wings = createTechnicalMesh(wingGeom);
    droneGroup.add(wings);

    // Vertical Stabilizers (wing tips)
    const stabLeftGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    stabLeftGeom.translate(-1.8, 0.2, -0.1);
    const stabLeft = createTechnicalMesh(stabLeftGeom);
    const stabRightGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    stabRightGeom.translate(1.8, 0.2, -0.1);
    const stabRight = createTechnicalMesh(stabRightGeom);
    droneGroup.add(stabLeft);
    droneGroup.add(stabRight);

    // Rotor Arms & Motor Pods
    const armPositions = [
      [-0.8, 0, 0.6],
      [0.8, 0, 0.6],
      [-0.8, 0, -0.6],
      [0.8, 0, -0.6]
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

      // Propeller Group
      const propGroup = new THREE.Group();
      propGroup.position.set(pos[0], pos[1] + 0.23, pos[2]);
      const bladeGeom = new THREE.BoxGeometry(0.7, 0.01, 0.04);
      const blade = createTechnicalMesh(bladeGeom);
      propGroup.add(blade);
      droneGroup.add(propGroup);
      propellers.push(propGroup);
    });

    // Rear Propulsion Fan
    const rearFanShroudGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12);
    rearFanShroudGeom.rotateX(Math.PI / 2);
    const shroud = createTechnicalMesh(rearFanShroudGeom);
    shroud.position.set(0, 0, -0.95);
    droneGroup.add(shroud);

    const rearPropGroup = new THREE.Group();
    rearPropGroup.position.set(0, 0, -0.95);
    const rearBladeGeom = new THREE.BoxGeometry(0.48, 0.01, 0.03);
    rearBladeGeom.rotateX(Math.PI / 2);
    const rearBlade = createTechnicalMesh(rearBladeGeom);
    rearPropGroup.add(rearBlade);
    droneGroup.add(rearPropGroup);
    propellers.push(rearPropGroup);

    return { mesh: droneGroup, propellers: propellers };
  }

  function updateResponsiveCamera() {
    if (!container || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const isMobile = width < 768;
    if (isMobile) {
      camera.position.set(0, 0.5, 11.5); // Move camera back on mobile
    } else {
      camera.position.set(0, 0.5, 7.5);  // Desktop
    }

    drones.forEach(drone => {
      const cfg = drone.config;
      if (isMobile) {
        // Pull drones closer horizontally and scale down on mobile screens
        drone.responsivePos.x = cfg.basePos.x * 0.42;
        drone.responsivePos.y = cfg.basePos.y * 0.70 + 0.3;
        drone.responsivePos.z = cfg.basePos.z;
        const s = cfg.scale * 0.60;
        drone.mesh.scale.set(s, s, s);
      } else {
        drone.responsivePos.copy(cfg.basePos);
        drone.mesh.scale.set(cfg.scale, cfg.scale, cfg.scale);
      }
    });
  }

  function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    updateResponsiveCamera();
  }

  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    obs.observe(container);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const time = Date.now();
    const isMobile = window.innerWidth < 768;

    drones.forEach(drone => {
      const cfg = drone.config;

      // Spin propellers
      drone.propellers.forEach((prop, idx) => {
        if (idx === 4) {
          prop.rotation.z += cfg.propSpeed * 1.25;
        } else {
          prop.rotation.y += (idx % 2 === 0 ? cfg.propSpeed : -cfg.propSpeed);
        }
      });

      // Bobbing floating height
      const bobY = Math.sin(time * cfg.bobSpeed + cfg.bobOffset) * (isMobile ? cfg.bobHeight * 0.6 : cfg.bobHeight);
      drone.mesh.position.y = drone.responsivePos.y + bobY;

      // Floating drift on X and Z axes
      const driftX = Math.cos(time * 0.001 + cfg.bobOffset) * (isMobile ? 0.06 : 0.15);
      const driftZ = Math.sin(time * 0.0012 + cfg.bobOffset) * 0.1;
      drone.mesh.position.x = drone.responsivePos.x + driftX;
      drone.mesh.position.z = drone.responsivePos.z + driftZ;

      // Autopilot tilting (banking as it drifts)
      drone.mesh.rotation.z = -driftX * 0.25;
      drone.mesh.rotation.x = 0.15 + (bobY * 0.15);
      drone.mesh.rotation.y = cfg.rotY + Math.sin(time * 0.0005) * 0.05;
    });

    renderer.render(scene, camera);
  }

  // Launch when page is ready
  document.addEventListener('DOMContentLoaded', init);
})();
