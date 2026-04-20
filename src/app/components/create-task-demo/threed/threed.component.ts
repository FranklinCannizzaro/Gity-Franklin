import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { DataService } from '../../../Services/data.service';
import { DialogService } from '../../../Services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { PropFComponent } from '../prop-f/prop-f.component';
import { PropHComponent } from '../prop-h/prop-h.component';
import { ArticulationComponent } from '../articulation/articulation.component';
import { PropAComponent } from '../prop-a/prop-a.component';
import { PropBComponent } from '../prop-b/prop-b.component';
import { PropPComponent } from '../prop-p/prop-p.component';
import { PropPonticComponent } from '../prop-pontic/prop-pontic.component';
import { PropVComponent } from '../prop-v/prop-v.component';
import { MyBoolean, OrderDetailsNew, ToothData } from '../create-task-demo.component';
import { CommonModule } from '@angular/common';

export interface ThreeDFileNameMap {
  [key: string]: ThreeDFileNameDetails[];
}

export interface ThreeDFileNameDetails {
  name: string;
  x: number;
  y: number;
  z: number;
}

@Component({
  selector: 'app-threed',
  standalone: true,
  imports: [PropHComponent, PropPonticComponent, PropPComponent, PropAComponent, PropVComponent, CommonModule],
  templateUrl: './threed.component.html',
  styleUrl: './threed.component.css'
})
export class ThreedComponent {
  @Input() orderDetailsNew!: OrderDetailsNew;

  showSliderForV: MyBoolean = { value: false };
  showSliderForA: MyBoolean = { value: false };
  showSliderForP: MyBoolean = { value: false };
  showSliderForPontic: MyBoolean = { value: false };
  showSliderForH: MyBoolean = { value: false };

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
  loader = new STLLoader();
  axesHelper: THREE.AxesHelper | undefined;
  
  height = window.innerHeight/1.5;
  width = window.innerWidth/3;

  stlFilesMapping: ThreeDFileNameMap | undefined;
  stlFileNames: string[] = [];

  constructor(private dataService: DataService, private dialogService: DialogService, private matDialog: MatDialog){
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(this.width/-2, this.width/2, this.height/2, this.height/-2, 1, 600);
    this.renderer = new THREE.WebGLRenderer();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoverMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

    this.dataService.getStaticFile<ThreeDFileNameMap>('3d/file-names-mapping.json').subscribe({
      next: (response) => {
        this.stlFilesMapping = response;
        this.stlFileNames = Object.keys(response).flatMap(key => response[key].filter((item: { name: string }) => item.name !== key).map((item: { name: string }) => item.name));
        this.init();
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get 3d files mapping, Please try again.');
      }
    });
  }

  init(): void {
    this.initThreeJS();
    this.loadSTLModel(this.orderDetailsNew.toothData.map(data => data.teeth).flat());
    this.addEventListeners();
    this.animate();
  }

  initThreeJS(): void {
    this.renderer.setSize(this.width, this.height);
    this.renderer.domElement.style.borderRadius = '8px';
    this.renderer.domElement.style.border = 'thin solid #d2d2d2';
    this.renderer.setPixelRatio(window.devicePixelRatio);
    if (this.threeCanvas?.nativeElement) {
      this.threeCanvas.nativeElement.appendChild(this.renderer.domElement);
    }

    // Add an AxesHelper to visualize the axes
    this.axesHelper = new THREE.AxesHelper(100); // Length of the axes
    this.scene.add(this.axesHelper);

    this.camera.position.z = 100;
    // this.camera.position.set(0, 0, -100);
    this.camera.zoom = 10;
    this.camera.updateProjectionMatrix();
    
    // this.scene.rotation.x = Math.PI / 2;
    // this.scene.rotation.y = Math.PI;
    this.scene.background = new THREE.Color(0xffffff);

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


    // add a model in the scene
    // async loadSTLModelbyTooth(tooth: string) {
    //   if(!this.stlFilesMapping){
    //     this.dialogService.openMessageDialog('Error', 'Failed to load 3d files mapping, Please try again.');
    //       return;
    //   }

    //   for(let j = 0; j < this.stlFilesMapping[yVal.tooth].length; j++){
    //     const stlFile = this.stlFilesMapping[yVal.tooth][j];
    //   }

    //   const geometry = this.loader.parse(await fetch(`3d/${yVal.tooth}/${stlFile.name}.stl`).then(res => res.arrayBuffer()));


    //   this.stlFilesMapping[tooth].forEach(stlFile => {
    //     this.loader.load(`3d/${tooth}/${stlFile.name}.stl`, (geometry) => {
    //       var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
    //       mesh.name = stlFile.name;
    //       mesh.position.set(stlFile.x, stlFile.y, stlFile.z);
    //       this.scene.add(mesh);
    //     });
    //   });
      
    // }



      // remove a model from the scene
      // unloadSTLModelbyTooth(tooth: string): void {
      //   let childArr: THREE.Object3D[] = [];
      //   this.scene.children.forEach(child => {
      //     if(child.name.startsWith(`${tooth}_`) || child.name == tooth){
      //       childArr.push(child);
      //     }
      //   });
      //   childArr.forEach(c => this.scene.remove(c));
      // }
    
      

      yVals: {tooth: number, rotateY: number, axisX: number, axisY: number, axisZ: number}[] = [
        {tooth: 18, rotateY: 1.7, axisX: 10, axisY: -40, axisZ: -20}, 
        {tooth: 17, rotateY: 1.5, axisX: 10, axisY: -40, axisZ: -20}, 
        {tooth: 16, rotateY: 1.4, axisX: 10, axisY: -40, axisZ: -20}, 
        {tooth: 15, rotateY: 1.1, axisX: 10, axisY: -40, axisZ: -20}, 
        {tooth: 14, rotateY: 0.7, axisX: 10, axisY: -40, axisZ: -20}, 
        {tooth: 13, rotateY: 0.3, axisX: 10, axisY: -40, axisZ: -20}, 
        {tooth: 12, rotateY: 0.1, axisX: 10, axisY: -40, axisZ: -20}, 
        {tooth: 11, rotateY: 0.0, axisX: 10, axisY: -40, axisZ: -20},

        {tooth: 21, rotateY: -0.5, axisX: 10, axisY: -40, axisZ: -30}, 
        {tooth: 22, rotateY: -0.5, axisX: 10, axisY: -40, axisZ: -30}, 
        {tooth: 23, rotateY: -0.7, axisX: 10, axisY: -40, axisZ: -30}, 
        {tooth: 24, rotateY: -1, axisX: 10, axisY: -40, axisZ: -30}, 
        {tooth: 25, rotateY: -1.3, axisX: 10, axisY: -40, axisZ: -30}, 
        {tooth: 26, rotateY: -1.6, axisX: 10, axisY: -40, axisZ: -30}, 
        {tooth: 27, rotateY: -1.9, axisX: 10, axisY: -40, axisZ: -30}, 
        {tooth: 28, rotateY: -2, axisX: 10, axisY: -40, axisZ: -30},

        {tooth: 48, rotateY: -2, axisX: -30, axisY: -35, axisZ: 10}, 
        {tooth: 47, rotateY: -1.7, axisX: -10, axisY: -30, axisZ: 10}, 
        {tooth: 46, rotateY: -1.4, axisX: 10, axisY: -30, axisZ: -20}, 
        {tooth: 45, rotateY: -1.1, axisX: 10, axisY: -30, axisZ: -20}, 
        {tooth: 44, rotateY: -0.7, axisX: 10, axisY: -30, axisZ: -20}, 
        {tooth: 43, rotateY: -0.3, axisX: 10, axisY: -30, axisZ: -20}, 
        {tooth: 42, rotateY: -0.1, axisX: 10, axisY: -30, axisZ: -20}, 
        {tooth: 41, rotateY: 0.0, axisX: 10, axisY: -30, axisZ: -20},

        {tooth: 31, rotateY: 0, axisX: 10, axisY: -30, axisZ: -20},
        {tooth: 32, rotateY: -0.5, axisX: 10, axisY: -30, axisZ: -20},
        {tooth: 33, rotateY: -0.7, axisX: 10, axisY: -30, axisZ: -20},
        {tooth: 34, rotateY: -1, axisX: 10, axisY: -30, axisZ: -20},
        {tooth: 35, rotateY: -1.3, axisX: 10, axisY: -30, axisZ: -20},
        {tooth: 36, rotateY: -1.6, axisX: 10, axisY: -30, axisZ: -20},
        {tooth: 37, rotateY: -1.9, axisX: 10, axisY: -30, axisZ: -20},
        {tooth: 38, rotateY: -2, axisX: 10, axisY: -30, axisZ: -20}
      ];

      teethToDisplay: Set<number> = new Set<number>();
      get getStringFromSet(): string {
        return Array.from(this.teethToDisplay).join(', ');
      } 

      async loadSTLModel(allTeethNumbers: number[]) {
        if(!this.stlFilesMapping){
          this.dialogService.openMessageDialog('Error', 'Failed to load 3d files mapping, Please try again.');
          return;
        }

        const rotateYValue = this.yVals.filter(yVal => allTeethNumbers.includes(yVal.tooth)).map(yVal => yVal.rotateY).reduce((sum, y) => sum + y, 0) / allTeethNumbers.length;
        const axisYValue = this.yVals.filter(yVal => allTeethNumbers.includes(yVal.tooth)).map(yVal => yVal.axisY).reduce((sum, y) => sum + y, 0) / allTeethNumbers.length;
        const axisZValue = this.yVals.filter(yVal => allTeethNumbers.includes(yVal.tooth)).map(yVal => yVal.axisZ).reduce((sum, y) => sum + y, 0) / allTeethNumbers.length;
        const axisXValue = this.yVals.filter(yVal => allTeethNumbers.includes(yVal.tooth)).map(yVal => yVal.axisX).reduce((sum, y) => sum + y, 0) / allTeethNumbers.length;

        for(let i = 0; i < this.yVals.length; i++){
          const yVal = this.yVals[i];
          if(!allTeethNumbers.includes(yVal.tooth)){
            continue
          }

          for(let j = 0; j < this.stlFilesMapping[yVal.tooth].length; j++){
            const stlFile = this.stlFilesMapping[yVal.tooth][j];
            try {
              const geometry = this.loader.parse(await fetch(`3d/${yVal.tooth}/${stlFile.name}.stl`).then(res => res.arrayBuffer()));
              geometry.rotateX(-Math.PI / 2);
              geometry.rotateY(rotateYValue);
              var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
              mesh.position.set(axisXValue+stlFile.x, axisYValue+stlFile.y, axisZValue+stlFile.z);
              mesh.name = stlFile.name;
              this.scene.add(mesh);
              this.teethToDisplay.add(yVal.tooth); 

              if(this.orderDetailsNew.toothData.some(tooth => tooth.teeth == yVal.tooth && tooth.subType == 'Pontic')){
                this.pontics.push(yVal.tooth);
                break;
              }

            } catch (error) {
              console.log(`Failed to load ${stlFile.name}.stl file`);
            }
          }

        }

      }

      pontics: number[] = [];

      addEventListeners(): void {
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
      }
    
      onMouseMove(event: MouseEvent): void {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
        if (intersects.length > 0) {
          const object = intersects[0].object as THREE.Mesh;
          if (this.hoveredObject !== object) {
            if (this.hoveredObject) {
              // this.hoveredObject.material = this.originalMaterial!;
              
              if(this.pontics.includes(parseInt(this.hoveredObject.name))){
                this.scene.children.map(child => child as THREE.Mesh).filter(child => child.isMesh && child.name.length == 2 && this.pontics.includes(parseInt(child.name)))
                .forEach(matchingObject => matchingObject.material = this.originalMaterial!);
              }else{
                this.scene.children.map(child => child as THREE.Mesh).filter(child => child.isMesh && child.name.length > 2).filter(child => child.name.slice(3) == this.hoveredObject!.name.slice(3))
                .forEach(matchingObject => matchingObject.material = this.originalMaterial!);
              }

            }
            this.originalMaterial = object.material;
            
            // object.material = this.hoverMaterial;
            if(this.pontics.includes(parseInt(object.name))){
              this.scene.children.map(child => child as THREE.Mesh).filter(child => child.isMesh && child.name.length == 2 && this.pontics.includes(parseInt(child.name)))
                .forEach(matchingObject => matchingObject.material = this.hoverMaterial);
            }else{
              this.scene.children.map(child => child as THREE.Mesh).filter(child => child.isMesh && child.name.length > 2).filter(child => child.name.slice(3) == object.name.slice(3))
                .forEach(matchingObject => matchingObject.material = this.hoverMaterial);
            }

            

            this.renderer.domElement.style.cursor = 'pointer';
            this.hoveredObject = object;
          } 
        } else {
          if (this.hoveredObject) {
            //this.hoveredObject.material = this.originalMaterial!;
            // this.scene.children.map(child => child as THREE.Mesh).filter(child => child.isMesh && child.name.length > 2).filter(child => child.name.slice(3) == this.hoveredObject!.name.slice(3))
            //     .forEach(matchingObject => matchingObject.material = this.originalMaterial!);

            // object.material = this.hoverMaterial;
            if(this.pontics.includes(parseInt(this.hoveredObject.name))){
              this.scene.children.map(child => child as THREE.Mesh).filter(child => child.isMesh && child.name.length == 2 && this.pontics.includes(parseInt(child.name)))
                .forEach(matchingObject => matchingObject.material = this.originalMaterial!);
            }else{
              this.scene.children.map(child => child as THREE.Mesh).filter(child => child.isMesh && child.name.length > 2).filter(child => child.name.slice(3) == this.hoveredObject!.name.slice(3))
                .forEach(matchingObject => matchingObject.material = this.originalMaterial!);
            }


            this.hoveredObject = undefined;
            this.renderer.domElement.style.cursor = 'default';
          }
        }
      }
    
      onMouseClick(): void {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          // if (this.stlFileNames.includes(clickedObject.name)) {
          //   alert(`You clicked on the ${clickedObject.name}!`);
          // }
          if(clickedObject.name.slice(3) == 'vest_surface'){
            this.showSliderForV.value = !this.showSliderForV.value;
          }else if (clickedObject.name.slice(3) == 'mesio_cervical' || clickedObject.name.slice(3) == 'disto_cervical'){
            this.showSliderForP.value = !this.showSliderForP.value;
          }else if (clickedObject.name.slice(3) == 'mesio_aproximal' || clickedObject.name.slice(3) == 'disto_aproximal'){
            this.showSliderForA.value = !this.showSliderForA.value;
          }else if (this.pontics.includes(parseInt(clickedObject.name)) && clickedObject.name.length == 2){
            this.showSliderForPontic.value = !this.showSliderForPontic.value;
          }
        }

        // 11_vest_surface - front
        // 11_disto_aproximal - left side below
        // 11_mesio_cervical - right side top
        // 11_cervical_vest - front top
        // 11_disto_cervical - left side top
        // 11_incisal - bottom
        // 11_palatinal_surface - 
        // 11_mesio_aproximal - right side below

      }
    
      
      animate(): void {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
      }





      propComponentsDefaultValues: any = {
        'F': { q1Value: 'Deep (standard)', q2Value: 'Slight wear' }, 
        'H': { q1Value: 'Normal', q2Value: 'Slight wear', q3Value: '0.03 mm light occlusion (standard)' }, 
        'P': { q1Value: '0.7 mm standard' },
        'A': { q1Value: '1/3 of the surface', q2Value: '0.03 mm light occlusion (standard)', q3Value: 'Buccal light equator, approx. 1.6 mm distance cervical (Standard)' }, 
        'B': { q1Value: 'Oral light equator, approx. 1.6 mm distance cervical (Standard)' }, 
        'PONTIC': { q1Value: '0.01 mm: Lightly resting on the gingiva', q2Value: 'Pontic extension 1', q3Value: 'Tangential' }, 
        'articulation': {articulator: 'Artex von Amann Girrbach', protrusionAngle: 30, bennettAngle: 15, iss: 0.5, incisalGuidance: 10, q2Value: -0.2},
        'V': { medianValue: 129, mesialValue: 0, q1Value: 'default buccal/labial convexity' }
      };
    
      propComponentsQuesAns: any = {
        'F': [{ques: 'Fissure depth', ans: this.propComponentsDefaultValues['F'].q1Value}, {ques: 'Crown wear', ans: this.propComponentsDefaultValues['F'].q2Value}],
        'H': [{ques: 'Cusp Tip', ans: this.propComponentsDefaultValues['H'].q1Value}, {ques: 'Occlusal contact', ans: this.propComponentsDefaultValues['H'].q2Value}, {ques: 'Distance to the antagonist', ans: this.propComponentsDefaultValues['H'].q3Value}],
        'P': [{ques: 'Interdental papilla absence', ans: this.propComponentsDefaultValues['P'].q1Value}],
        'A': [{ques: 'Mesial and distal contact point', ans: this.propComponentsDefaultValues['A'].q1Value}, {ques: 'Occlusal contact', ans: this.propComponentsDefaultValues['A'].q2Value}, {ques: 'Occlusal contactAnatomical equator for the buccal surface', ans: this.propComponentsDefaultValues['A'].q3Value}],
        'B': [{ques: 'Anatomical equator for the oral surface', ans: this.propComponentsDefaultValues['B'].q1Value}],
        'PONTIC': [{ques: 'Basal between the bridge component and the gingiva', ans: this.propComponentsDefaultValues['PONTIC'].q1Value}, {ques: 'Pontic extension', ans: this.propComponentsDefaultValues['PONTIC'].q2Value}, {ques: 'Standard', ans: this.propComponentsDefaultValues['PONTIC'].q3Value}],
        'articulation': [{ques: 'Articulation', ans: this.propComponentsDefaultValues['articulation'].articulator}, {ques: 'Protrusion Angle', ans: this.propComponentsDefaultValues['articulation'].protrusionAngle}, {ques: 'Bennett Angle', ans: this.propComponentsDefaultValues['articulation'].bennettAngle}, {ques: 'Immediate Side Shift (ISS)', ans: this.propComponentsDefaultValues['articulation'].iss}, {ques: 'Incisal Guidance', ans: this.propComponentsDefaultValues['articulation'].incisalGuidance}, {ques: 'Raising or lowering the articulator', ans: this.propComponentsDefaultValues['articulation'].q2Value}],
        'V': [{ques: 'Median inclination angle', ans: this.propComponentsDefaultValues['V'].medianValue}, {ques: 'Mesial distal rotation', ans: this.propComponentsDefaultValues['V'].mesialValue}, {ques: 'Buccal/labial convexity', ans: this.propComponentsDefaultValues['V'].q1Value}]
      };
    
    
      propComponents: any = {
          'F': PropFComponent, 
          'H': PropHComponent, 
          'P': PropPComponent, 
          'A': PropAComponent, 
          'B': PropBComponent, 
          'PONTIC': PropPonticComponent,
          'articulation': ArticulationComponent,
          'V': PropVComponent
        };
    
      onClick(group: string){
        if(group == 'F' || group == 'H' || group == 'P' || group == 'A' || group == 'B' || group == 'PONTIC' || group == 'articulation' || group == 'V'){
          this.matDialog.open(this.propComponents[group], { width: '95%', maxWidth: '1100px', maxHeight: '80vh', data: this.propComponentsDefaultValues[group] }).afterClosed().subscribe((response: any[]) => {
            // response.forEach(qa => this.pushCurrentQuesAns(qa));
            // this.updateSummary();
          });
        }
      }



}
