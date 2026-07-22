// Three.js script to animate one small technical drone moving fast back-to-back in industries-hero section

(function() {
  const container = document.getElementById('industries-drone-container');
  if (!container) return;

  let scene, camera, renderer;
  let droneMesh, propellers;
  
  const config = {
    scale: 0.42,
    basePos: new THREE.Vector3(0, 0.6, -1),
    rangeX: 4.8,      // Side to side sweep range
    speedX: 0.0018,   // Slower back-and-forth sweep speed multiplier
    bobSpeed: 0.0035,  // Slower bobbing frequency
    bobHeight: 0.15,  // Bobbing height
    propSpeed: 0.45   // Slower propellers spin
  };

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

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Build the Drone
    const droneData = createTechnicalDrone();
    droneMesh = droneData.mesh;
    propellers = droneData.propellers;
    
    droneMesh.scale.set(config.scale, config.scale, config.scale);
    droneMesh.position.copy(config.basePos);
    scene.add(droneMesh);

    window.addEventListener('resize', onWindowResize);
    animate();
  }

  // Programmatic technical style drone builder
  function createTechnicalDrone() {
    const droneGroup = new THREE.Group();
    const propellersGroup = [];

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
      arm.position.set(pos[0]/2, pos[1], pos[2]/2);
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
      propellersGroup.push(propGroup);
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
    propellersGroup.push(rearPropGroup);

    return { mesh: droneGroup, propellers: propellersGroup };
  }

  function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now();

    // Spin propellers
    propellers.forEach((prop, idx) => {
      if (idx === 4) {
        prop.rotation.z += config.propSpeed * 1.25;
      } else {
        prop.rotation.y += (idx % 2 === 0 ? config.propSpeed : -config.propSpeed);
      }
    });

    // Calculate side-to-side positions and velocities
    const angle = time * config.speedX;
    const posX = Math.sin(angle) * config.rangeX;
    
    // Velocity is proportional to cosine of the angle
    const velocityX = Math.cos(angle);

    // Apply fast positions
    droneMesh.position.x = posX;
    droneMesh.position.y = config.basePos.y + Math.sin(time * config.bobSpeed) * config.bobHeight;
    droneMesh.position.z = config.basePos.z + Math.cos(angle * 2) * 0.4; // slight elliptical depth path

    // Bank sharply in direction of travel (roll / rotation.z)
    // Banking is proportional to velocity
    droneMesh.rotation.z = -velocityX * 0.45; // up to ~25 degrees roll!

    // Pitch forward/backward depending on speed direction (rotation.x)
    droneMesh.rotation.x = 0.15 - Math.abs(velocityX) * 0.12;

    // Face the direction it's flying (yaw / rotation.y)
    // Slowly rotate to face the target edge
    droneMesh.rotation.y = (velocityX > 0) ? 0.3 : -0.3;

    renderer.render(scene, camera);
  }

  // Launch when page is ready
  document.addEventListener('DOMContentLoaded', init);
})();
