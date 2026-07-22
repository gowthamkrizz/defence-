// Programmatic 3D Hybrid VTOL Drone using Three.js
// Designed to look like a premium industrial schematic vector model (white/grey faces with clean black outlines)

class TechnicalDrone {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.droneGroup = new THREE.Group();
    this.propellers = [];
    
    // Mouse interaction variables
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    
    this.scrollProgress = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Create Scene
    this.scene = new THREE.Scene();
    
    // Create Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.z = 8;

    // Create Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.container.appendChild(this.renderer.domElement);

    // Build Drone Model
    this.buildDrone();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    // Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Start Animation Loop
    this.animate();
  }

  // Helper to create a technical/vector style mesh (white face, black edges)
  createTechnicalMesh(geometry, faceColor = 0xfafafa, lineColor = 0x050505) {
    // Face material (slightly offset to avoid z-fighting with edges)
    const faceMaterial = new THREE.MeshBasicMaterial({
      color: faceColor,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      transparent: true,
      opacity: 0.95
    });
    
    const mesh = new THREE.Mesh(geometry, faceMaterial);

    // Outline edges
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, linewidth: 1 });
    const line = new THREE.LineSegments(edges, lineMaterial);
    
    mesh.add(line);
    return mesh;
  }

  buildDrone() {
    // 1. Central Fuselage
    const fuselageGeom = new THREE.CylinderGeometry(0.3, 0.2, 1.8, 8);
    fuselageGeom.rotateX(Math.PI / 2); // align forward
    const fuselage = this.createTechnicalMesh(fuselageGeom);
    this.droneGroup.add(fuselage);

    // Fuselage Core/Sensor Pod (glowing visual)
    const coreGeom = new THREE.SphereGeometry(0.22, 16, 16);
    coreGeom.translate(0, -0.15, 0.5);
    const core = this.createTechnicalMesh(coreGeom, 0xffffff, 0x000000);
    this.droneGroup.add(core);

    // 2. Wings (VTOL Aerodynamic structures)
    const wingGeom = new THREE.BoxGeometry(3.6, 0.04, 0.4);
    wingGeom.translate(0, 0.1, -0.1);
    const wings = this.createTechnicalMesh(wingGeom);
    this.droneGroup.add(wings);

    // Vertical Stabilizers (wing tips)
    const stabLeftGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    stabLeftGeom.translate(-1.8, 0.2, -0.1);
    const stabLeft = this.createTechnicalMesh(stabLeftGeom);
    
    const stabRightGeom = new THREE.BoxGeometry(0.04, 0.4, 0.3);
    stabRightGeom.translate(1.8, 0.2, -0.1);
    const stabRight = this.createTechnicalMesh(stabRightGeom);
    
    this.droneGroup.add(stabLeft);
    this.droneGroup.add(stabRight);

    // 3. Rotor Arms (Carbon Fiber shafts)
    const armPositions = [
      [-0.8, 0, 0.6],  // Front Left
      [0.8, 0, 0.6],   // Front Right
      [-0.8, 0, -0.6], // Back Left
      [0.8, 0, -0.6]   // Back Right
    ];

    armPositions.forEach((pos, idx) => {
      // Shaft geometry extending diagonally
      const armGeom = new THREE.BoxGeometry(0.06, 0.06, 1.4);
      
      // Rotated to form X-structure
      const arm = this.createTechnicalMesh(armGeom);
      arm.position.set(pos[0]/2, pos[1], pos[2]/2);
      arm.rotation.y = (idx === 0 || idx === 3) ? Math.PI / 4 : -Math.PI / 4;
      this.droneGroup.add(arm);

      // Motor pods
      const motorGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
      const motor = this.createTechnicalMesh(motorGeom);
      motor.position.set(pos[0], pos[1] + 0.1, pos[2]);
      this.droneGroup.add(motor);

      // Propeller (two thin blade boxes)
      const propGroup = new THREE.Group();
      propGroup.position.set(pos[0], pos[1] + 0.23, pos[2]);

      const bladeGeom = new THREE.BoxGeometry(0.7, 0.01, 0.04);
      const blade = this.createTechnicalMesh(bladeGeom);
      propGroup.add(blade);
      
      this.droneGroup.add(propGroup);
      this.propellers.push(propGroup);
    });

    // 4. Rear Propulsion Fan (Hybrid Engine)
    const rearFanShroudGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12);
    rearFanShroudGeom.rotateX(Math.PI / 2);
    const shroud = this.createTechnicalMesh(rearFanShroudGeom);
    shroud.position.set(0, 0, -0.95);
    this.droneGroup.add(shroud);

    const rearPropGroup = new THREE.Group();
    rearPropGroup.position.set(0, 0, -0.95);
    
    const rearBladeGeom = new THREE.BoxGeometry(0.48, 0.01, 0.03);
    rearBladeGeom.rotateX(Math.PI / 2);
    const rearBlade = this.createTechnicalMesh(rearBladeGeom);
    
    rearPropGroup.add(rearBlade);
    this.droneGroup.add(rearPropGroup);
    this.propellers.push(rearPropGroup);

    // Initial scale and rotation
    this.droneGroup.scale.set(1.4, 1.4, 1.4);
    this.droneGroup.rotation.x = 0.15;
    
    this.scene.add(this.droneGroup);
  }

  onMouseMove(event) {
    // Normalize mouse position between -1 and 1
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setScroll(progress) {
    this.scrollProgress = progress;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Pause WebGL rendering when hero section is out of viewport to save GPU/CPU
    const currentY = window.scrollY || window.pageYOffset || 0;
    if (currentY > window.innerHeight * 1.2) return;

    // Spin Propellers
    this.propellers.forEach((prop, idx) => {
      // Rear engine rotates differently
      if (idx === 4) {
        prop.rotation.z += 0.45;
      } else {
        // Alternating directions for VTOL stability
        prop.rotation.y += (idx % 2 === 0 ? 0.35 : -0.35);
      }
    });

    // Handle mouse hover rotation (smooth lerping)
    this.targetRotationY = this.mouseX * 0.4;
    this.targetRotationX = -this.mouseY * 0.2 + 0.15; // baseline tilt

    // Handle Scroll effects
    // Section 1 (Hero): baseline position
    // Section 2: Fly up / transition out
    let targetX = 1.6;
    let targetY = 0;
    let targetZ = 0;
    let targetScale = 1.4;

    if (this.scrollProgress > 0) {
      // Translate up, move to center, and rotate on scroll
      targetX = 1.6 - (this.scrollProgress * 1.6);
      targetY = this.scrollProgress * 2.5;
      targetZ = -this.scrollProgress * 3;
      targetScale = 1.4 - (this.scrollProgress * 0.3);
      this.droneGroup.rotation.z = Math.sin(Date.now() * 0.003) * 0.02 + (this.scrollProgress * 0.2);
    } else {
      // Hover bobbing effect when idle on the right side
      targetX = 1.6;
      targetY = Math.sin(Date.now() * 0.0015) * 0.1;
      this.droneGroup.rotation.z = Math.sin(Date.now() * 0.002) * 0.015;
    }

    // Apply Lerping for premium smooth physics
    this.droneGroup.rotation.y += (this.targetRotationY - this.droneGroup.rotation.y) * 0.05;
    this.droneGroup.rotation.x += (this.targetRotationX - this.droneGroup.rotation.x) * 0.05;
    
    this.droneGroup.position.y += (targetY - this.droneGroup.position.y) * 0.08;
    this.droneGroup.position.x += (targetX - this.droneGroup.position.x) * 0.08;
    this.droneGroup.position.z += (targetZ - this.droneGroup.position.z) * 0.08;
    
    const scaleLerp = this.droneGroup.scale.x + (targetScale - this.droneGroup.scale.x) * 0.05;
    this.droneGroup.scale.set(scaleLerp, scaleLerp, scaleLerp);

    this.renderer.render(this.scene, this.camera);
  }
}

// Initializer helper
window.initGlobalDrone = function(containerId) {
  return new TechnicalDrone(containerId);
};
