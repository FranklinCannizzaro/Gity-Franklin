import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-three-d-model-viewer',
  templateUrl: './three-dmodel-viewer.component.html',
  styleUrls: ['./three-dmodel-viewer.component.css'],
  imports: [FormsModule],
  standalone: true
})
export class ThreeDModelViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('threeCanvas') threeCanvas: ElementRef | undefined;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls | undefined;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  hoverMaterial: THREE.MeshBasicMaterial;
  originalMaterial: THREE.Material | THREE.Material[] | undefined;
  hoveredObject: THREE.Mesh | undefined;

  height = window.innerHeight;
  width = window.innerWidth;

  // height = 600;
  // width = 800;


  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(this.width/-2, this.width/2, this.height/2, this.height/-2, 1, 200);
    this.renderer = new THREE.WebGLRenderer();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoverMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.loadSTLModel();
    this.addEventListeners();
    this.animate();
  }

  initThreeJS(): void {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    if (this.threeCanvas?.nativeElement) {
      this.threeCanvas.nativeElement.appendChild(this.renderer.domElement);
    }
    this.camera.position.set(0, 0, 100);
    this.camera.zoom = 5;
    this.camera.updateProjectionMatrix();
    this.scene.rotation.x = Math.PI / 2;

    // scene helpers for dev
    // this.scene.add(new THREE.CameraHelper(this.camera));
    // this.scene.add(new THREE.GridHelper(100, 5));
    // this.scene.add(new THREE.AxesHelper(5));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    const directions = [
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: -1 }
    ];

    directions.forEach(direction => {
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(direction.x, direction.y, direction.z).normalize();
      this.scene.add(light);
    });

  }

  stlFiles = [
    { name: '3d/11/11_vest_surface.stl', x: 0, y: -.1, z: 0 },
    { name: '3d/11/11_disto_aproximal.stl', x: -.1, y: 0, z: 0 },
    { name: '3d/11/11_mesio_cervical.stl', x: .1, y: 0, z: 0 },
    { name: '3d/11/11_cervical_vest.stl', x: 0, y: -.1, z: 0 },
    { name: '3d/11/11_disto_cervical.stl', x: -.1, y: 0, z: 0 },
    { name: '3d/11/11_incisal.stl', x: 0, y: 0, z: -.1 },
    { name: '3d/11/11_palatinal_surface.stl', x: 0, y: .1, z: 0 },
    { name: '3d/11/11_mesio_aproximal.stl', x: .1, y: 0, z: 0 }
  ];

  loadSTLModel(): void {
    const loader = new STLLoader();
    loader.load('3d/11/11.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));

    this.stlFiles.forEach(stlFile => {
      loader.load(stlFile.name, (geometry) => {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
        mesh.name = stlFile.name;
        mesh.position.set(stlFile.x, stlFile.y, stlFile.z);
        // this.scene.background = new THREE.Color(0xfaf9fd); // change background color
        this.scene.add(mesh);
      });
    });


    loader.load('3d/42/42.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/25/25.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/12/12.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/13/13.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/14/14.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/15/15.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/16/16.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/17/17.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
    loader.load('3d/18/18.stl', (geometry) => this.scene.add(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial())));
  }

  addEventListeners(): void {
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
  }

  onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const object = intersects[0].object as THREE.Mesh;
      if (this.stlFiles.some(stlFile => stlFile.name === object.name) && this.hoveredObject !== object) {
        if (this.hoveredObject) {
          this.hoveredObject.material = this.originalMaterial!;
        }
        this.originalMaterial = object.material;
        object.material = this.hoverMaterial;
        this.hoveredObject = object;
      } 
    } else {
      if (this.hoveredObject) {
        this.hoveredObject.material = this.originalMaterial!;
        this.hoveredObject = undefined;
      }
    }
  }

  onMouseClick(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (this.stlFiles.some(stlFile => stlFile.name === clickedObject.name)) {
        alert(`You clicked on the ${clickedObject.name}!`);
      }
    }
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
