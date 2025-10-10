import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-vr-driving',
  templateUrl: './vr-driving.page.html',
  styleUrls: ['./vr-driving.page.scss'],
})
export class VrDrivingPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private steeringGroup!: THREE.Group;
  private steeringAngle: number = 0;

  speed: number = 0;
  gear: number = 0;
  rpm: number = 800;

  public gameState = {
    speed: 0,
    acceleration: 0,
    steering: 0,
    brake: 0,
    gear: 0,
    position: new THREE.Vector3(0, 1.5, 0),
    rotation: 0,
    keys: {} as { [key: string]: boolean },
    gasPressed: false,
    brakePressed: false,
  };

  private animationFrameId: number | null = null;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initScene();
    this.createScene();
    this.setupEventListeners();
    this.animate();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initScene() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 10, 200);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  private createScene() {
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    this.scene.add(sunLight);

    // Ground/Road
    const roadGeometry = new THREE.PlaneGeometry(20, 1000);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    this.scene.add(road);

    // Road lines
    for (let i = -250; i < 250; i += 10) {
      const lineGeometry = new THREE.PlaneGeometry(0.5, 5);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.01, i);
      this.scene.add(line);
    }

    // Grass on sides
    const grassGeometry = new THREE.PlaneGeometry(100, 1000);
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });

    const grassLeft = new THREE.Mesh(grassGeometry, grassMaterial);
    grassLeft.rotation.x = -Math.PI / 2;
    grassLeft.position.x = -60;
    grassLeft.receiveShadow = true;
    this.scene.add(grassLeft);

    const grassRight = new THREE.Mesh(grassGeometry, grassMaterial);
    grassRight.rotation.x = -Math.PI / 2;
    grassRight.position.x = 60;
    grassRight.receiveShadow = true;
    this.scene.add(grassRight);

    // Buildings
    const buildingPositions = [
      [-30, 0, -100],
      [-30, 0, -50],
      [-30, 0, 50],
      [-30, 0, 100],
      [30, 0, -80],
      [30, 0, 0],
      [30, 0, 80],
      [30, 0, 150],
      [-35, 0, -150],
      [35, 0, -150],
      [-35, 0, 200],
      [35, 0, 180],
    ];

    buildingPositions.forEach(([x, y, z]) => {
      const height = Math.random() * 20 + 10;
      const width = Math.random() * 8 + 5;
      const buildingGeometry = new THREE.BoxGeometry(width, height, width);
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(x, height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);
    });

    // Trees
    const treePositions = [
      [-25, 0, -120],
      [-25, 0, -60],
      [-25, 0, 20],
      [-25, 0, 80],
      [25, 0, -100],
      [25, 0, -40],
      [25, 0, 40],
      [25, 0, 120],
      [-28, 0, -180],
      [28, 0, -160],
      [-28, 0, 160],
      [28, 0, 220],
    ];

    treePositions.forEach(([x, y, z]) => {
      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.6, 5, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 2.5, z);
      trunk.castShadow = true;
      this.scene.add(trunk);

      // Foliage
      const foliageGeometry = new THREE.SphereGeometry(3, 8, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5016,
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(x, 6, z);
      foliage.castShadow = true;
      this.scene.add(foliage);
    });

    // Car Interior (Dashboard & Steering Wheel)
    const dashboardGeometry = new THREE.BoxGeometry(3, 0.3, 1);
    const dashboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
    });
    const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
    dashboard.position.set(0, 0.5, -1.2);
    this.camera.add(dashboard);

    // Steering Wheel
    this.steeringGroup = new THREE.Group();
    const wheelRingGeometry = new THREE.TorusGeometry(0.3, 0.03, 16, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const wheelRing = new THREE.Mesh(wheelRingGeometry, wheelMaterial);
    wheelRing.rotation.x = Math.PI / 6;

    const wheelSpokes = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const spokeGeometry = new THREE.BoxGeometry(0.03, 0.25, 0.02);
      const spoke = new THREE.Mesh(spokeGeometry, wheelMaterial);
      spoke.rotation.z = (i * Math.PI * 2) / 3;
      wheelSpokes.add(spoke);
    }
    wheelSpokes.rotation.x = Math.PI / 6;

    this.steeringGroup.add(wheelRing);
    this.steeringGroup.add(wheelSpokes);
    // Adjusting the steering wheel position to be lower (y-coordinate reduced from 0.3 to -0.3)
    this.steeringGroup.position.set(0, -0.3, -0.8);
    this.camera.add(this.steeringGroup);

    this.scene.add(this.camera);
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.onWindowResize);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.gameState.keys[e.key.toLowerCase()] = true;

    // Gear shifting
    if (e.key >= '0' && e.key <= '5') {
      this.gameState.gear = parseInt(e.key);
      this.gear = parseInt(e.key);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.gameState.keys[e.key.toLowerCase()] = false;
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.updateGameState();
    this.renderer.render(this.scene, this.camera);
  }

  private updateGameState() {
    const state = this.gameState;

    // Gas pedal (W or ArrowUp)
    if (state.keys['w'] || state.keys['arrowup']) {
      state.gasPressed = true;
      const maxSpeed = 5 + state.gear * 10;
      if (state.speed < maxSpeed) {
        state.acceleration = 2 + state.gear * 0.5;
      }
    } else {
      state.gasPressed = false;
      state.acceleration = 0;
    }

    // Brake pedal (S or ArrowDown)
    if (state.keys['s'] || state.keys['arrowdown']) {
      state.brakePressed = true;
      state.brake = 5;
      state.acceleration = -state.brake;
    } else {
      state.brakePressed = false;
      state.brake = 0;
    }

    // Steering (A/D or Arrow Left/Right)
    const maxSteeringAngle = Math.PI / 4; // 45 degrees
    const steeringSpeed = 0.08;
    const steeringReturnSpeed = 0.1;

    if (state.keys['a'] || state.keys['arrowleft']) {
      // Rotate steering wheel to the left
      this.steeringAngle = Math.min(this.steeringAngle + steeringSpeed, maxSteeringAngle);
    } else if (state.keys['d'] || state.keys['arrowright']) {
      // Rotate steering wheel to the right
      this.steeringAngle = Math.max(this.steeringAngle - steeringSpeed, -maxSteeringAngle);
    } else {
      // Gradually return steering wheel to center when no keys are pressed
      if (Math.abs(this.steeringAngle) > 0.01) {
        this.steeringAngle *= 0.9;
      } else {
        this.steeringAngle = 0;
      }
    }

    // Apply steering wheel rotation
    this.steeringGroup.rotation.z = this.steeringAngle;

    // Physics
    const deltaTime = 0.016; // Assuming 60fps
    state.speed += state.acceleration * deltaTime;
    state.speed = Math.max(0, state.speed); // Can't go backward

    // Natural deceleration
    if (state.acceleration <= 0 && state.brake === 0) {
      state.speed *= Math.pow(0.9, deltaTime * 10); // Smoother deceleration
    }

    // Update rotation based on steering and speed
    if (state.speed > 0.5) {
      // More realistic steering that depends on speed
      // Slower speeds = more responsive steering, higher speeds = less responsive
      const steeringFactor = Math.min(state.speed / 30, 1);
      const turnRate = 0.02 * (1 - 0.8 * steeringFactor);
      state.rotation += this.steeringAngle * turnRate * (state.speed * 0.1);
    }

    // Update position
    const moveX = Math.sin(state.rotation) * state.speed * 0.08;
    const moveZ = Math.cos(state.rotation) * state.speed * 0.08;

    state.position.x += moveX;
    state.position.z -= moveZ;

    // Keep car on road (boundaries)
    state.position.x = Math.max(-8, Math.min(8, state.position.x));

    // Update camera position and rotation
    this.camera.position.x = state.position.x;
    this.camera.position.z = state.position.z;
    this.camera.rotation.y = state.rotation;

    // Loop environment
    if (state.position.z < -100) {
      state.position.z += 200;
    }

    // Update UI
    this.speed = Math.round(state.speed * 10);

    // RPM simulation
    const targetRpm = 800 + state.speed * 100 + (state.gasPressed ? 500 : 0);
    this.rpm = Math.round(targetRpm);
  }

  private cleanup() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(
          this.renderer.domElement
        );
      }
    }
  }
}
