import { Component, HostListener, ViewChild, ViewChildren, QueryList, ChangeDetectorRef, TemplateRef, ElementRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpHeaders } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { environment } from '../../../environments/environment';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { MatChipInput, MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { FileDetails, FilesComponent } from '../files/files.component';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropHComponent } from './prop-h/prop-h.component';
import { PropPComponent } from './prop-p/prop-p.component';
import { PropPFrameComponent } from './prop-p-frame/prop-p-frame.component';
import { PropAComponent } from './prop-a/prop-a.component';
import { PropCollarsComponent } from './prop-collars/prop-collars.component';
import { PropCutbackComponent } from './prop-cutback/prop-cutback.component';
import { PropPonticComponent } from './prop-pontic/prop-pontic.component';
import { MatRadioModule } from '@angular/material/radio';
import { BiteTypeComponent } from './bite-type/bite-type.component';
import { ArticulationComponent } from './articulation/articulation.component';
import { DesignerSearchComponent } from '../designer-search/designer-search.component';
import { PropVComponent } from './prop-v/prop-v.component';
import { MatSliderModule } from '@angular/material/slider';
import { ThreedComponent } from './threed/threed.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatTab, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';


import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';

export interface MyBoolean {
  value: boolean;
}

type UploadState = 'uploading' | 'processing' | 'done' | 'error' | 'waiting';
interface FileProgress {
  percent: number;
  state: UploadState;
  size: number;
  sizeLabel: string;
  loaded: number;
  lastLoaded: number;
  lastTs: number;
  speedBps: number;         // smoothed B/s
  etaSeconds?: number;      // computed
  etaLabel?: string;        // "2 seconds left"
  intervalId?: any;         // for trickle near the end
}

export interface OrderDetailsNew {
  amount?: number;
  showAi: boolean;
  showHuman: boolean;
  taskId: number;
  refNum: string;
  tier: string;
  remainingCorrections: number;
  deliveryTime: string;
  designer: string;
  isFav: boolean;
  rating: number;
  experience: number;
  skill: string;
  software: string;
  articulationDetails: articulationDetails;
  biteType: string;
  toothData: ToothDataNew[];
  props: { [key: string]: any };
  bridges: { bridgedTeeth: number[], start: number; end: number; bridgeConnectionType: string }[];
}

export interface OrderDetails {
  showAi: boolean;
  showHuman: boolean;
  taskId: number;
  refNum: string;
  tier: string;
  deliveryTime: string;
  designer: string;
  articulationDetails: articulationDetails;
  biteType: string;
  toothData: ToothData[];
  props: { [key: string]: any };
}

export interface articulationDetails {
  articulator: string;
  props: { [key: string]: any };
}

export interface ToothDataNew {
  teeth: number;
  selected: boolean;
  id: number;
  type: string;
  subType: string;
  minimalThickness: number;
  cementGap: number;
  marginGap: number;
  horizontalBorder: number;
  radiusCompensation: number;
  bridgeConnectionType: string;
  props: { [key: string]: any };
  [key: string]: any;
}

export interface ToothData {
  teeth: number[];
  type: string;
  subType: string;
  minimalThickness: number;
  cementGap: number;
  marginGap: number;
  horizontalBorder: number;
  radiusCompensation: number;
  bridgeConnectionType: string;
  props: { [key: string]: any };
}

@Component({
  selector: 'app-create-task-demo',
  standalone: true,
  imports: [TaskDetailsComponent, MatChipsModule, PropAComponent, PropPComponent, PropHComponent, PropPonticComponent, PropVComponent, MatTabsModule, ThreedComponent, BiteTypeComponent, ArticulationComponent, MatSliderModule, FilesComponent, ReactiveFormsModule, MatRadioModule, MatListModule, MatMenuModule, MatStepperModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatInputModule, FormsModule, MatIconModule, MatSelectModule, CommonModule, MatButtonModule, MatTooltipModule, MatSidenavModule, PropCollarsComponent, PropCutbackComponent, PropPFrameComponent],
  templateUrl: './create-task-demo.component.html',
  styleUrls: ['./create-task-demo.component.css', './create-task-demo.design-level.css', './create-task-demo.designer-type.css', '../../../style-custom.css'],
})


export class CreateTaskDemoComponent {
  @ViewChild('stepper') stepper!: MatStepper;
  activeTooltip = '';

  apiUrl = environment.apiUrl;

  showSlider: MyBoolean = { value: false };
  showSliderForArticulation: MyBoolean = { value: false };
  showSliderForToothType: MyBoolean = { value: false };
  showSliderForBiteType: MyBoolean = { value: false };

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  validated: boolean = false;

  constructor(private http: HttpClient, private router: Router, public cdRef: ChangeDetectorRef, private dialog: MatDialog, public dataService: DataService, private dialogService: DialogService, private location: Location, private _formBuilder: FormBuilder,
    private route: ActivatedRoute) {
    this.firstFormGroup = this._formBuilder.group({});
    this.secondFormGroup = this._formBuilder.group({});
    this.thirdFormGroup = this._formBuilder.group({});
  }

  fileDetailsScan: FileDetails[] = [];
  fileDetailsImages: FileDetails[] = [];
  fileDetailsImagesContent: string[] = [];

  updateFileCounts(filesData: any) {
    this.fileDetailsScan = filesData.fileDetailsScan;
    this.fileDetailsImages = filesData.fileDetailsImages;
    this.fileDetailsImagesContent = filesData.fileDetailsImagesContent;
  }

  selectDesignerError: string = '';

  goToNextStep(): boolean {
    this.selectDesignerError = '';
    if (!this.orderDetailsNew.showAi && !this.orderDetailsNew.showHuman) {
      this.selectDesignerError = 'Please select AI or Human designer.';
      return false;
    }

    this.validated = true;
    if (this.orderDetailsNew.refNum && (this.orderDetailsNew.showAi || this.orderDetailsNew.tier) && (this.orderDetailsNew.showAi || this.orderDetailsNew.deliveryTime) && this.fileDetailsScan.length > 0) {
      this.stepper.next();
      return true;
    }
    return false;
  }

  get getAllToothCountFromOrderDetails(): number {
    return this.orderDetailsNew.toothData.reduce((acc, data) => acc + 1, 0);
  }

  // bridges: { bridgedTeeth: number[], start: number; end: number; bridgeConnectionType: string }[] = [];

  showBridge(toothIdA: number, toothIdB: number): boolean {

    var returnVal = false;

    this.orderDetailsNew.bridges.forEach(bridge => {


      var bridgeStarted = false;
      var bridgeEnded = false;
      this.teethList.forEach(teeth => {

        if (teeth == bridge.start) {
          bridgeStarted = true;
        }

        if (teeth == bridge.end) {
          bridgeEnded = true;
        }

        if (bridgeStarted && !bridgeEnded) {
          if (teeth == toothIdA) {
            returnVal = true;
          }
        }


      });

    });


    return returnVal;


  }

  showBridgeDot(toothId: number): boolean {
    return this.orderDetailsNew.toothData.length > 0 && this.orderDetailsNew.toothData.some(data => data.teeth == toothId && data.bridgeConnectionType != '');
  }

  showEmpty(toothId: number): boolean {

    if (this.orderDetailsNew.toothData.some(data => data.teeth == toothId && data.bridgeConnectionType != '')) {
      return false;
    }

    var returnVal = false;

    this.orderDetailsNew.bridges.forEach(bridge => {


      var bridgeStarted = false;
      var bridgeEnded = false;
      this.teethList.forEach(teeth => {

        if (teeth == bridge.end) {
          bridgeEnded = true;
        }

        if (bridgeStarted && !bridgeEnded) {
          if (teeth == toothId) {
            returnVal = true;
          }
        }

        if (teeth == bridge.start) {
          bridgeStarted = true;
        }

      });

    });


    return returnVal;


  }




  shiftKeyPressed: boolean = false;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.shiftKey) {
      this.shiftKeyPressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (!event.shiftKey) {
      this.shiftKeyPressed = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const toothGroups = document.querySelector('.tooth-group');

    if (toothGroups && !toothGroups.contains(target) && !target.closest('.tooth-group') && !target.closest('.dropdown') && !target.closest('.accordion') && !target.closest('.add-new-material')) {
      this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => this.onToothClick(data.teeth.toString()));
    }

    if (!target.closest('.custom-context-menu')) {
      this.showMenu = false;
    }
  }

  selectedStep = 0;

  onStepChange(event: StepperSelectionEvent) {
    this.selectedStep = event.selectedIndex;

    this.render3d = event.selectedIndex === 2;

    if (event.previouslySelectedIndex == 0 && (event.selectedIndex == 1 || event.selectedIndex == 2 || event.selectedIndex == 3) && !this.goToNextStep()) {
      setTimeout(() => {
        this.stepper.selectedIndex = event.previouslySelectedIndex;
      });
    } else if (event.previouslySelectedIndex == 1 && (event.selectedIndex == 2 || event.selectedIndex == 3) && !this.validateToothSelection()) {
      setTimeout(() => {
        this.stepper.selectedIndex = event.previouslySelectedIndex;
      });
    }

  }

  render3d: boolean = false;


  isHovered: any = { H: false, F: false, A: false, P: false };

  onMouseEnter(group: string): void {
    this.isHovered[group] = true;
  }

  onMouseLeave(group: string): void {
    this.isHovered[group] = false;
  }

  getTeethByComma(teeth: number[]): string {
    return Array.from(teeth).sort((a, b) => a - b).join(', ');
  }

  getTeethLabel(toothData: ToothData): string {
    return toothData.teeth.sort((a, b) => a - b).join('-');
  }

  get getBridgeToothData(): number[][] {

    var toothDataToReturn: number[][] = [];

    this.orderDetailsNew.bridges.forEach(bridge => {

      var bridgeStarted = false;
      var bridgeEnded = false;
      var teethToAdd: number[] = [];
      this.teethList.forEach(teeth => {

        if (teeth == bridge.end) {
          bridgeEnded = true;
        }

        if (bridgeStarted && !bridgeEnded) {
          teethToAdd.push(teeth)
        }

        if (teeth == bridge.start) {
          bridgeStarted = true;
        }

      });

      toothDataToReturn.push(teethToAdd)

    });

    return toothDataToReturn;


    // this.bridges.map(bridge => {
    //   var start = bridge.start;
    //   var end = bridge.end;
    //   this.orderDetailsNew.toothData.forEach(data => {
    //     if(data.teeth.includes(start) && data.teeth.includes(end)){
    //       data.bridgeConnectionType = 'Strong connection';
    //     }
    //   });
    // }
    // return this.orderDetailsNew.toothData.filter(data => data.bridgeConnectionType);
  }

  get getToothDataForVisualisation(): ToothData[] {
    var toothDataToReturn: ToothData[] = [];
    // toothDataToReturn.push(...this.getBridgeToothData);
    // toothDataToReturn.push(...this.orderDetailsNew.toothData.filter(data => !data.bridgeConnectionType && !this.getBridgeToothData.some(bts => bts.teeth == data.teeth)));
    return toothDataToReturn;
  }

  checkTwoSetIntersect(array1: number[], array2: number[]): boolean {
    return array1.some(tooth => array2.includes(tooth));
  }

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @ViewChildren(MatTab) tabs!: QueryList<MatTab>;

  selectTabByLabel(tabLabel: string): void {
    const tabIndex = this.getTabIndexByLabel(tabLabel);
    if (tabIndex !== -1) {
      this.tabGroup.selectedIndex = tabIndex;
    }
  }

  private getTabIndexByLabel(tabLabel: string): number {
    const tabsArray = this.tabs.toArray();
    this.orderDetailsNew.toothData.forEach(data => {
      if (data.teeth == Number(tabLabel) && data.type == 'Bridge') {
        // tabLabel = this.getTeethLabel(data);
      }
    });

    for (let i = 0; i < tabsArray.length; i++) {
      if (tabsArray[i].ariaLabel.includes(tabLabel)) {
        return i;
      }
    }
    return -1;
  }


  openBiteTypeSelection(value: string) {
    if (value == 'yes') {
      this.biteType = 'normal bite';
      this.pushCurrentQuesAns({ ques: 'Bite Type', ans: 'normal bite' })
      return;
    }
  }

  pushCurrentQuesAns(qaNew: any) {
    var updated: boolean = false;
    this.currentQuesAns.forEach(qa => {
      if (qa.ques == qaNew.ques) {
        qa.ans = qaNew.ans;
        updated = true;
        return;
      }
    });
    if (!updated) {
      this.currentQuesAns.push(qaNew);
    }
  }

  // getSubTypes(): string{
  //   return this.selectedSubTypes.filter(subType => this.availableSubTypes.includes(subType)).join();
  // }

  isOpen = false;
  toothData: any[] = [];
  types: any[] = [];
  subTypes: any[] = [];
  props: any[] = [];
  biteType: string = 'normal bite';

  currentTeethSet: Set<number> = new Set();
  currentType: string = '';
  currentSubType: string = '';
  currentProps: any[] = [];
  currentQuesAns: any[] = [];

  selectedTeethSet: Set<number> = new Set();
  selectedTypes: string[] = [];
  selectedSubTypes: string[] = [];

  summary: string[] = [];

  availableTypes: string[] = [];
  availableSubTypes: any[] = [];

  taskId: number = 0;

  clearAll() {

    var showAiOldValue = this.orderDetailsNew.showAi;
    var showHumanOldValue = this.orderDetailsNew.showHuman;

    this.orderDetailsNew = {
      showHuman: showHumanOldValue,
      showAi: showAiOldValue,
      taskId: this.taskId,
      refNum: '',
      tier: '',
      deliveryTime: '',
      designer: '',
      isFav: false,
      rating: 0,
      experience: 0,
      skill: '',
      software: '',
      articulationDetails: {
        articulator: 'Artex von Amann Girrbach',
        props: { 'Protrusion Angle': '30', 'Bennett Angle': '15', 'Immediate Side Shift (ISS)': '0.5', 'Incisal Guidance': '10', 'Raising or lowering the articulator': '-0.2' }
      },
      biteType: 'normal bite',
      toothData: [],
      props: {
        'Crown wear-front': 'Regular',
        'Crown wear-side': 'Regular',
        'undercuts': 'Yes',
        'ceramic-veneering-anterior': 1.5,
        'ceramic-veneering-posterior': 1.5,
        'ceramic-veneering-bridge': 1.5,
        'bridgeConnectionType-anterior-frame': 'Strong connection',
        'bridgeConnectionType-posterior-frame': 'Strong connection'
      },
      bridges: [],
      remainingCorrections: 0
    };
    this.showMenu = false;
  }

  clear() {
    this.orderDetailsNew.toothData = this.orderDetailsNew.toothData.filter(data => data.teeth !== this.rightClickedTooth);
    this.showMenu = false;
    this.removeToothFromBridge(this.rightClickedTooth);
  }

  //init order details
  orderDetailsNew: OrderDetailsNew = {
    showAi: false,
    showHuman: false,
    taskId: this.taskId,
    refNum: '',
    tier: '',
    deliveryTime: '',
    designer: '',
    isFav: false,
    rating: 0,
    experience: 0,
    skill: '',
    software: '',
    articulationDetails: {
      articulator: 'Artex von Amann Girrbach',
      props: { 'Protrusion Angle': '30', 'Bennett Angle': '15', 'Immediate Side Shift (ISS)': '0.5', 'Incisal Guidance': '10', 'Raising or lowering the articulator': '-0.2' }
    },
    biteType: 'normal bite',
    toothData: [],
    props: {
      'Crown wear-front': 'Regular',
      'Crown wear-side': 'Regular',
      'undercuts': 'Yes',
      'ceramic-veneering-anterior': 1.5,
      'ceramic-veneering-posterior': 1.5,
      'ceramic-veneering-bridge': 1.5,
      'bridgeConnectionType-anterior-frame': 'Strong connection',
      'bridgeConnectionType-posterior-frame': 'Strong connection'
    },
    bridges: [],
    remainingCorrections: 0
  };

  currentToothData!: ToothData;

  initCurrentToothData() {
    this.currentToothData = {
      teeth: [],
      type: '',
      subType: '',
      minimalThickness: 0.5,
      cementGap: 0.015,
      marginGap: 0.5,
      horizontalBorder: 0.015,
      radiusCompensation: 0.5,
      bridgeConnectionType: '',
      props: this.props.reduce((map, prop) => { map[prop.name] = prop.value; return map; }, {})
    };
  }

  clearCurrentToothSelection() {
    this.initCurrentToothData();
    this.refreshAvailableTypes();
  }

  checkToothIndexStartOrEnd(tooth: number, teeth: Set<number>): boolean {
    return Math.min(...Array.from(teeth)) === tooth || Math.max(...Array.from(teeth)) === tooth;
  }

  getToothColorForVisual(tooth: string): string {
    var color = "#ffffff";
    if (this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Crown')) {
      color = '#397EAC';
    } else if (this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Pontic')) {
      color = '#3939AC';
    } else if (this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Inlay/Onlay')) {
      color = '#7E39AC';
    } else if (this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Veneer')) {
      color = '#AC3995';
    }
    return color;
  }

  getTextColorForVisual(tooth: string): string {
    return this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth)) ? '#000000' : '#979797';
  }

  numbersAsString(numbers: number[]): string {
    return numbers.join(', ');
  }




  showMenu: boolean = false;
  menuPosition = { x: 0, y: 0 };
  rightClickedTooth: number = 0;



  refreshBridges() {
    var selectedTeeth = this.orderDetailsNew.toothData.filter(data => data.bridgeConnectionType != '' && data.selected).map(data => data.teeth).flat();
    var selectedTeethUpper = this.teethList.filter(teeth => selectedTeeth.includes(teeth));
    // selectedTeethUpper.sort((a, b) => this.teethList.indexOf(a) - this.teethList.indexOf(b));
    if (selectedTeethUpper.length > 0) {
      var bridgesToRemove: any[] = [];
      this.orderDetailsNew.bridges.forEach(bridge => {
        var isSame = bridge.bridgedTeeth.every(teeth => selectedTeethUpper.includes(teeth)) && selectedTeethUpper.every(teeth => bridge.bridgedTeeth.includes(teeth));
        if (!isSame && bridge.bridgedTeeth.some(teeth => selectedTeethUpper.includes(teeth))) {
          selectedTeethUpper = Array.from(new Set([...bridge.bridgedTeeth, ...selectedTeethUpper]));
          bridgesToRemove.push(bridge);
        }
      });

      bridgesToRemove.forEach(bridge => {
        this.orderDetailsNew.bridges.splice(this.orderDetailsNew.bridges.indexOf(bridge), 1);
      });

      selectedTeethUpper.sort((a, b) => this.teethList.indexOf(a) - this.teethList.indexOf(b));
      this.orderDetailsNew.bridges.push({ bridgedTeeth: selectedTeethUpper, start: selectedTeethUpper[0], end: selectedTeethUpper[selectedTeethUpper.length - 1], bridgeConnectionType: 'Strong connection' });
    }
  }

  removeToothFromBridge(toothId: number) {
    this.orderDetailsNew.bridges.forEach(bridge => {
      if (bridge.bridgedTeeth.includes(toothId)) {
        var index = bridge.bridgedTeeth.indexOf(toothId);
        if (index == 0) {
          bridge.start = bridge.bridgedTeeth[1];
        } else if (index == bridge.bridgedTeeth.length - 1) {
          bridge.end = bridge.bridgedTeeth[bridge.bridgedTeeth.length - 2];
        }
        bridge.bridgedTeeth.splice(index, 1);
        if (bridge.bridgedTeeth.length == 1) {
          this.orderDetailsNew.toothData.filter(data => data.teeth == bridge.bridgedTeeth[0]).forEach(data => {
            data.bridgeConnectionType = '';
          });
          this.orderDetailsNew.bridges.splice(this.orderDetailsNew.bridges.indexOf(bridge), 1);
        }
      }
    });

    var ponticTeeths = this.orderDetailsNew.toothData.filter(data => data.subType == 'Pontic').map(data => data.teeth).flat();

    this.orderDetailsNew.bridges.forEach(bridge => {
      if (bridge.bridgedTeeth.every(teeth => ponticTeeths.includes(teeth))) {
        this.orderDetailsNew.bridges.splice(this.orderDetailsNew.bridges.indexOf(bridge), 1);
        bridge.bridgedTeeth.forEach(teeth => {
          this.orderDetailsNew.toothData.filter(data => data.teeth == teeth).forEach(data => {
            data.bridgeConnectionType = '';
          });
        });
      }
    });
  }

  onRightClick(event: MouseEvent, tooth: number): void {
    event.preventDefault();
    const targetElement = event.target instanceof HTMLElement ? event.target : event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();

    this.menuPosition = {
      x: (rect.x + event.clientX) / 2 - 320,
      y: (rect.y + event.clientY) / 2 - 216
    };

    this.rightClickedTooth = tooth;
    this.showMenu = true;
  }

  id: number = Date.now();

  teethList = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
  ];
  teethListUpper: number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  teethListLower: number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  currentViewPage: String = "first"

  selectedEventNext: Boolean = false

  onToothClick(toothIdStr: string, recursiveCall: boolean = false): void {

    var toothId = Number(toothIdStr);

    if (this.orderDetailsNew.showAi) {
      var invalidAiToothSelection = false;

      var leftToothUpper = this.teethListUpper[this.teethListUpper.indexOf(toothId) - 1];
      var rightToothUpper = this.teethListUpper[this.teethListUpper.indexOf(toothId) + 1];

      var leftToothLower = this.teethListLower[this.teethListLower.indexOf(toothId) - 1];
      var rightToothLower = this.teethListLower[this.teethListLower.indexOf(toothId) + 1];

      this.orderDetailsNew.toothData.filter(data => data.selected || data.type != '').some(data => {
        if (data.teeth == toothId) {
          return false;
        } else if (data.teeth == leftToothUpper || data.teeth == rightToothUpper || data.teeth == leftToothLower || data.teeth == rightToothLower) {
          invalidAiToothSelection = true;
          return true;
        } else {
          return false;
        }
      });

      if (invalidAiToothSelection) {
        this.dialogService.openMessageDialog('Warning', 'A tooth can only be selected if it has neighboring teeth mesially and distally.').subscribe();
        return;
      }
    }

    var selectedTeeth = this.orderDetailsNew.toothData.filter(data => data.selected).map(data => data.teeth).flat();

    if (this.shiftKeyPressed && !recursiveCall && selectedTeeth.length > 0) {


      //upper start
      var selectedTeethUpper = this.teethListUpper.filter(teeth => selectedTeeth.includes(teeth));

      selectedTeethUpper.sort((a, b) => this.teethListUpper.indexOf(a) - this.teethListUpper.indexOf(b));


      var start = false;
      var toothAdded = false;

      this.teethListUpper.forEach(teeth => {

        if (selectedTeethUpper.includes(teeth) && !start) {
          if (!toothAdded) {
            start = true;
          }
        } else if (teeth == toothId && !start) {
          this.onToothClick(teeth.toString(), true);
          start = true;
        } else if (start && selectedTeethUpper.includes(teeth)) {
          if (toothAdded) {
            start = false;
          }
        } else if (teeth == toothId && start) {
          this.onToothClick(teeth.toString(), true);
          start = false;
        } else if (start && !selectedTeethUpper.includes(teeth)) {
          this.onToothClick(teeth.toString(), true);
        }

        if (teeth == toothId) {
          toothAdded = true;
        }

      });
      //upper end



      //lower start
      var selectedTeethLower = this.teethListLower.filter(teeth => selectedTeeth.includes(teeth));

      selectedTeethLower.sort((a, b) => this.teethListLower.indexOf(a) - this.teethListLower.indexOf(b));


      var start = false;
      var toothAdded = false;

      this.teethListLower.forEach(teeth => {

        if (selectedTeethLower.includes(teeth) && !start) {
          if (!toothAdded) {
            start = true;
          }
        } else if (teeth == toothId && !start) {
          this.onToothClick(teeth.toString(), true);
          start = true;
        } else if (start && selectedTeethLower.includes(teeth)) {
          if (toothAdded) {
            start = false;
          }
        } else if (teeth == toothId && start) {
          this.onToothClick(teeth.toString(), true);
          start = false;
        } else if (start && !selectedTeethLower.includes(teeth)) {
          this.onToothClick(teeth.toString(), true);
        }

        if (teeth == toothId) {
          toothAdded = true;
        }

      });
      //lower end



      return;
    }

    const index = this.orderDetailsNew.toothData.findIndex(data => data.teeth == Number(toothIdStr));
    if (index === -1) {
      // this.orderDetailsNew.toothData.filter(data => data.selected && data.id != this.id).forEach(data => data.selected = false);
      this.orderDetailsNew.toothData.push({
        teeth: Number(toothIdStr),
        selected: true,
        id: this.id,
        type: '',
        subType: '',
        minimalThickness: 0.5,
        cementGap: 0.015,
        marginGap: 0.5,
        horizontalBorder: 0.015,
        radiusCompensation: 0.5,
        bridgeConnectionType: '',
        props: this.props.reduce((map, prop) => { map[prop.name] = prop.value; return map; }, {})
      });
    } else if (this.orderDetailsNew.toothData[index].subType == '') {
      this.orderDetailsNew.toothData.splice(index, 1);

      this.removeToothFromBridge(toothId);
    } else {
      this.orderDetailsNew.toothData[index].selected = !this.orderDetailsNew.toothData[index].selected;
    }
    this.refreshAvailableTypes();

    var selectedTeethType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].type;
    if (selectedTeethType != 'Bridge') {
      this.availableSubTypes = this.subTypes.filter((subType: any) => subType.parent == selectedTeethType);
    }

  }

  redCircle(toothId: number): boolean {
    return this.orderDetailsNew.toothData.some(data => data.teeth == toothId && data.selected);
  }

  changeVIewType(lable: String) {
    this.currentViewPage = lable
  }


  get checkSelectedToothSubTypeNotEmpty(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.selected && data.subType != '');
  }

  // onSubTypeNextButton(){

  //   this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
  //     if(data.subType != ''){
  //       this.onSubTypeChange(data.subType, true)
  //     }
  //   });

  // }


  onTypeChange(typeName: string) {
    // this.currentToothData.type = typeName;
    if (typeName != 'Bridge') {
      this.availableSubTypes = this.subTypes.filter((subType: any) => subType.parent == typeName);
    }

    if (this.orderDetailsNew.showAi) {
      this.availableSubTypes = this.availableSubTypes.filter((subType: any) => subType.name == 'Crown');
    }

    if (typeName == 'Anatomy') {
      var selectedSubType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].subType;
      var selectedType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].type;
      var allSelectedSameSubType = this.orderDetailsNew.toothData.filter(data => data.selected).every(data => data.subType == selectedSubType);

      this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
        if (data.subType == '') {
          data.subType = selectedSubType ? selectedSubType : 'Crown';
          data.type = selectedType ? selectedType : 'Anatomy';
        } else if (selectedSubType != '' && !allSelectedSameSubType) {
          data.subType = selectedSubType;
          data.type = selectedType;
        } else {
          data.subType = '';
          data.type = '';
          data.bridgeConnectionType = '';
          this.removeToothFromBridge(data.teeth);
        }
      });
    }


    if (typeName == 'Frame') {
      var selectedSubType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].subType;
      var selectedType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].type;
      var allSelectedSameSubType = this.orderDetailsNew.toothData.filter(data => data.selected).every(data => data.subType == selectedSubType);

      this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
        if (data.subType == '') {
          data.subType = selectedSubType ? selectedSubType : 'Crown';
          data.type = selectedType ? selectedType : 'Frame';
        } else if (selectedSubType != '' && !allSelectedSameSubType) {
          data.subType = selectedSubType;
          data.type = selectedType;
        } else {
          data.subType = '';
          data.type = '';
          data.bridgeConnectionType = '';
          this.removeToothFromBridge(data.teeth);
        }
      });
    }


    // if(typeName == 'Frame'){
    //   var selectedSubType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].subType;
    //   var selectedType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].type;
    //   var allSelectedSameSubType = this.orderDetailsNew.toothData.filter(data => data.selected).every(data => data.subType == selectedSubType);

    //   this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
    //     if(data.subType == ''){
    //       data.subType = selectedSubType ? selectedSubType : 'Zirkon coping';
    //       data.type = selectedType ? selectedType : 'Frame';
    //     }else if (selectedSubType != '' && !allSelectedSameSubType){
    //       data.subType = selectedSubType;
    //       data.type = selectedType;
    //     }else{
    //       data.subType = '';
    //       data.type = '';
    //       // data.bridgeConnectionType = '';
    //       // this.removeToothFromBridge(data.teeth);
    //     }
    //   });
    // }

    //alert if teeth between selected teeth as per the teeth list are already having type
    var selectedTeeth = this.orderDetailsNew.toothData.filter(data => data.selected).map(data => data.teeth).flat();
    var selectedTeethUpper = this.teethListUpper.filter(teeth => selectedTeeth.includes(teeth));
    selectedTeethUpper.sort((a, b) => this.teethListUpper.indexOf(a) - this.teethListUpper.indexOf(b));
    var selectedTeethLower = this.teethListLower.filter(teeth => selectedTeeth.includes(teeth));
    selectedTeethLower.sort((a, b) => this.teethListLower.indexOf(a) - this.teethListLower.indexOf(b));
    var selectedTeethUpperStart = selectedTeethUpper[0];
    var selectedTeethUpperEnd = selectedTeethUpper[selectedTeethUpper.length - 1];
    var selectedTeethLowerStart = selectedTeethLower[0];
    var selectedTeethLowerEnd = selectedTeethLower[selectedTeethLower.length - 1];
    var selectedTeethUpperBetween = this.teethListUpper.filter(teeth => teeth > selectedTeethUpperStart && teeth < selectedTeethUpperEnd);
    var selectedTeethLowerBetween = this.teethListLower.filter(teeth => teeth > selectedTeethLowerStart && teeth < selectedTeethLowerEnd);
    var selectedTeethUpperBetweenData = this.orderDetailsNew.toothData.filter(data => selectedTeethUpperBetween.includes(data.teeth) && data.type != '' && typeName == 'Bridge' && !data.selected);
    var selectedTeethLowerBetweenData = this.orderDetailsNew.toothData.filter(data => selectedTeethLowerBetween.includes(data.teeth) && data.type != '' && typeName == 'Bridge' && !data.selected);
    if (selectedTeethUpperBetweenData.length > 0 || selectedTeethLowerBetweenData.length > 0) {
      var selectedTeethUpperBetweenDataStr = selectedTeethUpperBetweenData.map(data => data.teeth).join(', ');
      var selectedTeethLowerBetweenDataStr = selectedTeethLowerBetweenData.map(data => data.teeth).join(', ');
      // var selectedTeethUpperBetweenDataStr = selectedTeethUpperBetweenDataStr == '' ? '' : 'Upper: ' + selectedTeethUpperBetweenDataStr;
      // var selectedTeethLowerBetweenDataStr = selectedTeethLowerBetweenDataStr == '' ? '' : 'Lower: ' + selectedTeethLowerBetweenDataStr;
      this.dialogService.openMessageDialog('Warning', 'The following teeth should be selected for bridge: ' + selectedTeethUpperBetweenDataStr + selectedTeethLowerBetweenDataStr).subscribe();
      return;
    }

    var toothToRemoveFromBridge: number[] = [];

    var allSelectedBridge = this.orderDetailsNew.toothData.filter(data => data.selected).every(data => data.bridgeConnectionType != '');

    this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
      if (typeName == 'Bridge') {

        if (data.bridgeConnectionType == '') {
          data.bridgeConnectionType = 'Strong connection';
          if (this.dataService.anteriorTeeth.includes(data.teeth)) {
            this.orderDetailsNew.props['bridgeConnectionType-anterior'] = 'Strong connection';
          } else {
            this.orderDetailsNew.props['bridgeConnectionType-posterior'] = 'Strong connection';
          }
        } else if (allSelectedBridge && data.bridgeConnectionType != '') {
          data.bridgeConnectionType = '';
          // data.type = '';
          toothToRemoveFromBridge.push(data.teeth);
        }
        // else{
        //   data.bridgeConnectionType = '';
        //   // data.type = '';
        //   toothToRemoveFromBridge.push(data.teeth);
        // }
      }
      // else{
      //   data.bridgeConnectionType = '';

      //   if(data.type == ''){
      //     data.type = typeName;
      //   }else{
      //     data.type = '';
      //     data.subType = '';
      //   }
      // }
    });


    toothToRemoveFromBridge.forEach(toothId => this.removeToothFromBridge(toothId));

    this.refreshBridges();
    this.refreshProps();
    this.refreshAvailableTypes();
  }


  get bridgeConnectionTypeBySelectedTeeth(): string {
    return this.orderDetailsNew.toothData
      .filter(data => data.selected && data.bridgeConnectionType)
      .map(data => data.bridgeConnectionType)[0] || '';
  }

  showAnatomyCircle(tooth: number): boolean {
    // return this.orderDetailsNew.toothData.some(data => data.teeth == tooth && data.type == 'Anatomy');
    return false;
  }

  onSubTypeChange(subTypeName: string) {
    // if(subTypeName == 'Bridge'){
    //   return;
    // }


    var selectedSubType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].subType;
    var allSelectedSameSubType = this.orderDetailsNew.toothData.filter(data => data.selected).every(data => data.subType == selectedSubType);

    this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
      // if(data.subType != subTypeName){
      //   data.subType = subTypeName;
      //   this.subTypes.filter((subType: any) => subType.name == subTypeName).forEach((subType: any) => {
      //     data.type = subType.parent;
      //   });
      // }else{
      //   data.subType = '';
      // }

      // if(data.subType != subTypeName){
      //   data.subType = subTypeName;
      // }else 
      if (data.subType == '') {
        data.subType = subTypeName;
      } else if (selectedSubType != '' && !allSelectedSameSubType) {
        data.subType = subTypeName;
      } else if (data.subType != subTypeName) {
        data.subType = subTypeName;
      } else {
        data.subType = '';
      }

    });
    this.refreshProps();
    this.id = Date.now();
    this.refreshAvailableTypes();
  }

  isTypeSelected(typeName: string): boolean {
    return this.orderDetailsNew.toothData.some(data => data.selected && data.type == typeName);
  }

  isSubTypeSelected(subTypeName: string): boolean {
    return this.orderDetailsNew.toothData.some(data => data.selected && data.subType == subTypeName);
  }

  get checkToothSelectedIsBridge(): boolean {
    const selectedToothData = this.orderDetailsNew.toothData.filter(data => data.selected);
    return selectedToothData.length > 0 && selectedToothData.some(data => data.bridgeConnectionType != '');
  }

  get checkToothAndTypeSelected(): boolean {
    return this.orderDetailsNew.toothData.filter(data => data.selected && data.type != '').length > 0;
  }

  getToothColor(tooth: string): string {
    var color = "#F9F9F9";

    this.orderDetailsNew.toothData.filter(data => data.teeth == Number(tooth)).forEach(data => {
      if (data.subType == 'Crown') {
        color = '#397EAC';
      } else if (data.subType == 'Pontic') {
        color = '#3939AC';
      } else if (data.subType == 'Inlay/Onlay') {
        color = '#7E39AC';
      } else if (data.subType == 'Veneer') {
        color = '#AC3995';
      } else if (data.subType == 'Zirkon coping') {
        color = '#b3c3c3';
      } else if (data.subType == 'Zirkon pontic') {
        color = '#b3b3b3';
      } else if (data.subType == 'Zirkon (WAX up -2r)') {
        color = '#b3b3d3';
      }
    }
    );

    // if(this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType.includes('Crown'))){
    //   color = '#C5E2DA';
    // }else if(this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType.includes('Pontic'))){
    //   color = '#63D3B6';
    // }
    return color;
  }

  isToothSelected(tooth: string): boolean {
    let toothTypeByTooth = this.orderDetailsNew.toothData.filter(data => data.teeth == Number(tooth)).map(data => data.subType)[0] || '';

    const toothDataWithSameType = this.orderDetailsNew.toothData.filter(data => data.subType == toothTypeByTooth);

    if (toothDataWithSameType.length == 0) {
      return false;
    } else if (toothDataWithSameType[0].teeth == Number(tooth) && toothTypeByTooth != '') {
      return true;
    } else {
      return false;
    }

  }

  getSubTypeByTooth(tooth: string): string {
    return this.orderDetailsNew.toothData.filter(data => data.teeth == Number(tooth)).map(data => data.subType)[0] || '';
  }

  refreshAvailableTypes() {
    const selectedTeethCount = this.orderDetailsNew.toothData.filter(data => data.selected).length;
    this.availableTypes = selectedTeethCount == 0 ? [] : this.types.map((type: any) => type.name)
      .filter((typeName: string) => typeName == 'Anatomy' || typeName == 'Bridge' || typeName == 'Frame')
      .filter((typeName: string) => this.checkBridgeCondition() ? true : typeName != 'Bridge');

    var selectedType = this.orderDetailsNew.toothData.filter(data => data.selected)[0].type;
    if (selectedType == 'Anatomy') {
      this.availableTypes = this.availableTypes.filter((type: any) => type != 'Frame');
    } else if (selectedType == 'Frame') {
      this.availableTypes = this.availableTypes.filter((type: any) => type != 'Anatomy');
    }

    if (this.orderDetailsNew.showAi) {
      this.availableTypes = this.availableTypes.filter((type: any) => type == 'Anatomy');
    }

    // this.showSliderForToothType.value = !this.showSliderForToothType.value;
  }

  checkAnyBridgeSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.bridgeConnectionType != '');
  }

  checkBridgeCondition(): boolean {
    const selectedToothData = this.orderDetailsNew.toothData.filter(data => data.selected);
    const hasCrown = selectedToothData.some(data => data.subType === 'Crown');
    const hasCrownOrPontic = selectedToothData.every(data => data.subType === 'Pontic' || data.subType === 'Crown');
    return (selectedToothData.length >= 2 && hasCrown && hasCrownOrPontic) || (hasCrownOrPontic && this.orderDetailsNew.bridges.some(bridge => bridge.bridgedTeeth.some(teeth => selectedToothData.some(data => data.teeth == teeth))));
  }

  checkTwoArrayMatch(array1: number[], array2: number[]): boolean {
    return array1.length == array2.length && array1.every((value, index) => value === array2[index]);
  }

  // editDetail(detail: ToothData): void {
  //   this.currentToothData = detail;
  //   this.refreshAvailableTypes();
  //   this.showSliderForToothType.value = !this.showSliderForToothType.value
  // }

  dialogRef!: MatDialogRef<any>;

  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  openDialog(): void {
    this.dialogRef = this.dialog.open(this.dialogTemplate, { width: '300px' });
  }

  editTaskFlag: boolean = false;

  ngOnInit() {

    this.route.queryParamMap.subscribe(params => {
      this.taskId = Number(params.get('taskId'));
    });

    if (this.taskId > 0) {
      this.editTaskFlag = true;
      this.dataService.updateTitle('Edit Task');
      this.dataService.updateProgressBarSubject(true);
      this.dataService.get('/tasks/' + this.taskId).subscribe({
        next: (response) => {
          this.orderDetailsNew = JSON.parse(response.jsonData);
          this.getTypesFromBackend();
          this.getSubTypesFromBackend();
          this.getPropsFromBackend();
          this.fileDetailsScan.push({ fileId: 0, fileType: '', fileName: '', fileSize: 0 }); // insert dummy file to avoid validation error
        },
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to get Task Details, Please try again.');
        }
      });
    } else {
      this.dataService.updateTitle('Create New Task');
      this.initCurrentToothData();
      this.createNewTaskId();
      this.getTypesFromBackend();
      this.getSubTypesFromBackend();
      this.getPropsFromBackend();

      const navigation = this.router.getCurrentNavigation();
      this.route.queryParams.subscribe(params => {
        if (params['designer']) {
          this.orderDetailsNew.designer = params['designer'];
          this.orderDetailsNew.isFav = params['isFav'] === 'true';
          this.orderDetailsNew.rating = params['rating'] ? Number(params['rating']) : 0;
          this.orderDetailsNew.experience = params['experience'] ? params['experience'] : '';
          this.orderDetailsNew.skill = params['skill'] ? params['skill'] : '';
          this.orderDetailsNew.software = params['software'] ? params['software'] : '';
        }
      });
      this.orderDetailsNew.showHuman = true;
    }



  }

  createNewTaskId() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/tasks', {}).subscribe({
      next: (response) => {
        this.taskId = response.taskId;
        this.orderDetailsNew.taskId = response.taskId;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Create a New Task, Please try again.').subscribe(result => this.location.back());
      }
    });
  }

  getTypesFromBackend() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/tasks/types').subscribe({
      next: (response) => {
        this.types = response;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Types information, Please try again.').subscribe(result => this.location.back());
      }
    });
  }

  getSubTypesFromBackend() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/tasks/sub-types').subscribe({
      next: (response) => {
        this.subTypes = response;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Sub Types information, Please try again.').subscribe(result => this.location.back());
      }
    });
  }

  getPropsFromBackend() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/tasks/props').subscribe({
      next: (response) => {
        this.props = response;
        // this.initCurrentToothData();
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Properties information, Please try again.').subscribe(result => this.location.back());
      }
    });
  }

  newMaterial: string = '';

  addNewMaterial() {
    if (this.newMaterial == '') {
      return;
    }
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/tasks/props', { propName: 'Material', valueToAdd: this.newMaterial }).subscribe({
      next: (response) => {
        this.props = response;
        this.currentToothData.props['Material'] = this.newMaterial;
        this.refreshProps();
        this.dataService.updateProgressBarSubject(false);
        this.dialogRef.close();
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Properties information, Please try again.').subscribe(result => this.location.back());
      }
    });
  }


  toothDetailsArray: { tooth: string, indication: string, material: string }[] = [];



  propComponentsDefaultValues: any = {
    'F': { q1Value: 'Deep (standard)', q2Value: 'Slight wear' },
    'H': { q1Value: 'Normal', q2Value: 'Slight wear', q3Value: '0.03 mm light occlusion (standard)' },
    'P': { q1Value: '0.7 mm standard' },
    'A': { q1Value: '1/3 of the surface', q2Value: '0.03 mm light occlusion (standard)', q3Value: 'Buccal light equator, approx. 1.6 mm distance cervical (Standard)' },
    'B': { q1Value: 'Oral light equator, approx. 1.6 mm distance cervical (Standard)' },
    'PONTIC': { q1Value: '0.01 mm: Lightly resting on the gingiva', q2Value: 'Pontic extension 1', q3Value: 'Tangential' },
    'articulation': { articulator: 'Artex von Amann Girrbach', protrusionAngle: 30, bennettAngle: 15, iss: 0.5, incisalGuidance: 10, q2Value: -0.2 },
    'V': { medianValue: 129, mesialValue: 0, q1Value: 'default buccal/labial convexity' }
  };

  refreshProps() {
    // this.currentProps = this.props.filter(prop => prop.parent == this.currentToothData.type);
    this.currentProps = this.props.filter(prop => this.orderDetailsNew.toothData.some(data => data.selected && data.type == prop.parent));
  }

  onPropChange(name: string, parent: string, event: Event) {
    var value = (event.target as HTMLSelectElement).value;
    if (value === 'add-new' && name == 'Material') {
      this.openDialog();
    }

    this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
      data.props[name] = value;
    }
    );

    var selectedTeeth = this.orderDetailsNew.toothData.filter(data => data.selected).map(data => data.teeth).flat();
    this.orderDetailsNew.bridges.forEach(bridge => {
      if (bridge.bridgedTeeth.some(teeth => selectedTeeth.includes(teeth))) {
        bridge.bridgedTeeth.forEach(teeth => {
          this.orderDetailsNew.toothData.filter(data => data.teeth == teeth).forEach(data => {
            data.props[name] = value;
          });
        });
      }
    }
    );

  }

  getPropValue(name: string): string {
    var retnValue = this.currentProps.filter(prop => prop.name == name)[0].value;
    this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
      if (data.props[name]) {
        retnValue = data.props[name];
      }
    }
    );
    return retnValue;
  }



  onParamChange(name: string, event: Event) {
    var value = (event.target as HTMLSelectElement).value;

    this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
      data[name] = value;
    }
    );

    var selectedTeeth = this.orderDetailsNew.toothData.filter(data => data.selected).map(data => data.teeth).flat();
    this.orderDetailsNew.bridges.forEach(bridge => {
      if (bridge.bridgedTeeth.some(teeth => selectedTeeth.includes(teeth))) {
        bridge.bridgedTeeth.forEach(teeth => {
          this.orderDetailsNew.toothData.filter(data => data.teeth == teeth).forEach(data => {
            data[name] = value;
          });
        });
      }
    }
    );

  }

  getParamValue(name: string): string {
    var retnValue = '';
    this.orderDetailsNew.toothData.filter(data => data.selected).forEach(data => {
      if (data[name]) {
        retnValue = data[name];
      }
    }
    );
    return retnValue;
  }


  containsSelectedTeeth(input: string): number[] {
    const teethNumbers = this.invertToothNumbers(input);
    if (teethNumbers.some(toothNumber => this.selectedTeethSet.has(toothNumber))) {
      return teethNumbers;
    } else {
      return [];
    }
  }

  combineToothNumbers(input: number[]): string {
    return this.dataService.combineToothNumbers(input);
  }

  invertToothNumbers(input: string): number[] {
    return this.dataService.invertToothNumbers(input);
  }

  getProcDesc(data: any) {
    var desc = this.combineToothNumbers(Array.from(data.teeth)).concat(', ').concat(data.type).concat(', ').concat(data.subType);
    data.props.forEach((prop: any) => desc += ', <b>' + prop.name + '</b>: ' + prop.value);
    data.quesAns.forEach((qa: any) => desc += ', <b>' + qa.ques + '</b>: ' + qa.ans);
    return desc;
  }


  async saveTask() {
    this.dataService.updateProgressBarSubject(true);

    const formData = new FormData();

    const pdfBlob: Blob = await this.taskDetails.generatePDF(this.taskId.toString());

    formData.append('file', pdfBlob, `orderform_${this.taskId}.pdf`);

    // Convert OrderDetails object to JSON string
    if (this.orderDetailsNew.showAi) {
      this.orderDetailsNew.tier = 'ai';
      this.orderDetailsNew.designer = 'ai';
      this.orderDetailsNew.remainingCorrections = 4;
    }
    formData.append('orderDetails', JSON.stringify(this.orderDetailsNew));

    this.dataService.post(`/tasks/${this.taskId}/save`, formData).subscribe({
      next: (response) => {
        this.dataService.updateCartCount();
        this.dialogService.openMessageDialog('Info', 'Item added successfully in Cart.')
          .subscribe(() => window.location.href = '#/dashboard');
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Save, Please try again.');
      }
    });
  }


  async editTask() {
    this.dataService.updateProgressBarSubject(true);

    const formData = new FormData();
    const pdfBlob: Blob = await this.taskDetails.generatePDF(this.taskId.toString());

    // Append PDF file
    formData.append('file', pdfBlob, `orderform_${this.taskId}.pdf`);

    // Convert OrderDetails object to JSON string
    if (this.orderDetailsNew.showAi) {
      this.orderDetailsNew.tier = 'ai';
      this.orderDetailsNew.designer = 'ai';
      this.orderDetailsNew.remainingCorrections = 4;
    }
    formData.append('orderDetails', JSON.stringify(this.orderDetailsNew));

    this.dataService.post(`/tasks/${this.taskId}/edit`, formData).subscribe({
      next: (response) => {
        this.dataService.updateCartCount();
        this.dialogService.openMessageDialog('Info', 'Item updated successfully.')
          .subscribe(() => window.location.href = '#/dashboard');
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Save, Please try again.');
      }
    });
  }


  deleteTask() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.delete('/tasks/' + this.taskId).subscribe({
      next: (response) => {
        this.dataService.updateProgressBarSubject(false);
        this.location.back();
      },
      error: (err) => {
        this.dataService.updateProgressBarSubject(false);
        this.location.back();
      }
    });
  }


  openUsersModal() {
    const dialogRef = this.dialog.open(
      DesignerSearchComponent,
      {
        width: '95%',
        maxWidth: '1100px',
        height: '80%',
        maxHeight: '80vh',
        data: {
          designer: this.orderDetailsNew.designer,
          isFav: this.orderDetailsNew.isFav,
          rating: this.orderDetailsNew.rating,
          experience: this.orderDetailsNew.experience,
          skill: this.orderDetailsNew.skill,
          software: this.orderDetailsNew.software
        },
        disableClose: true
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.designer) {
        this.orderDetailsNew.designer = result.designer;
        this.orderDetailsNew.isFav = result.isFav;
        this.orderDetailsNew.rating = result.rating;
        this.orderDetailsNew.experience = result.experience;
        this.orderDetailsNew.skill = result.skill;
        this.orderDetailsNew.software = result.software;

      }
    });
  }
  @ViewChild(TaskDetailsComponent) taskDetails!: TaskDetailsComponent;


  deliveryTimeAsperDesignLevel = new Map<string, string[]>([
    ['silver', ['24']],
    ['gold', ['24', '12']],
    ['platinum', ['24', '12', '8']]
  ]);

  timePriceMap = new Map<string, string>([
    ['silver-24', ''],
    ['gold-24', ''],
    ['gold-12', '(€ +2.99 / Unit)'],
    ['platinum-24', ''],
    ['platinum-12', '(€ +2.99 / Unit)'],
    ['platinum-8', '(€ +4.99 / Unit)']
  ]);

  onTierChange(selectedTier: string) {
    this.orderDetailsNew.tier = selectedTier;
    this.orderDetailsNew.remainingCorrections = this.orderDetailsNew.tier == 'silver' ? 1 : this.orderDetailsNew.tier == 'gold' ? 2 : 4;
    this.orderDetailsNew.deliveryTime = '24';
  }

  get anteriorSelectedTeeth(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.selected).map(data => data.teeth)).anterior;
  }
  get posteriorSelectedTeeth(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.selected).map(data => data.teeth)).posterior;
  }


  get anteriorBridgedTeethFrame_1(): number[] {
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if (bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))) {
      return this.dataService.groupByAnteriorAndPosterior_1(bridgedTeeth).anterior;
    } else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).anterior;
  }

  get posteriorBridgedTeethFrame_1(): number[] {
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if (bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))) {
      return this.dataService.groupByAnteriorAndPosterior_1(bridgedTeeth).posterior;
    } else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).posterior;
  }


  get anteriorBridgedTeethFrame(): number[] {
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if (bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))) {
      return this.dataService.groupByAnteriorAndPosterior(bridgedTeeth).anterior;
    } else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).anterior;
  }

  get posteriorBridgedTeethFrame(): number[] {
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if (bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))) {
      return this.dataService.groupByAnteriorAndPosterior(bridgedTeeth).posterior;
    } else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).posterior;
  }

  get bridgedTeethFrame(): number[] {
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if (bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))) {
      return bridgedTeeth;
    } else {
      return [];
    }
  }

  get anteriorBridgedTeeth(): number[] {
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if (bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Anatomy'))) {
      return this.dataService.groupByAnteriorAndPosterior(bridgedTeeth).anterior;
    } else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).anterior;
  }

  get posteriorBridgedTeeth(): number[] {
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if (bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Anatomy'))) {
      return this.dataService.groupByAnteriorAndPosterior(bridgedTeeth).posterior;
    } else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).posterior;
  }

  get anteriorPonticTeeth(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.subType == 'Pontic' && data.type == 'Anatomy').map(data => data.teeth)).anterior;
  }

  get posteriorPonticTeeth(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.subType == 'Pontic' && data.type == 'Anatomy').map(data => data.teeth)).posterior;
  }


  get anteriorTeeth(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.map(data => data.teeth)).anterior;
  }

  get posteriorTeeth(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.map(data => data.teeth)).posterior;
  }

  get anteriorTeethForCrownOrPonticFrame(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => (data.subType == 'Crown' || data.subType == 'Pontic') && data.type == 'Frame').map(data => data.teeth)).anterior;
  }

  get posteriorTeethForCrownOrPonticFrame(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => (data.subType == 'Crown' || data.subType == 'Pontic') && data.type == 'Frame').map(data => data.teeth)).posterior;
  }

  get anteriorTeethForFrame_1(): number[] {
    return this.dataService.groupByAnteriorAndPosterior_1(this.orderDetailsNew.toothData.filter(data => data.type == 'Frame').map(data => data.teeth)).anterior;
  }

  get posteriorTeethForFrame_1(): number[] {
    return this.dataService.groupByAnteriorAndPosterior_1(this.orderDetailsNew.toothData.filter(data => data.type == 'Frame').map(data => data.teeth)).posterior;
  }

  get anteriorTeethForCrownOrPontic(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => (data.subType == 'Crown' || data.subType == 'Pontic') && data.type == 'Anatomy').map(data => data.teeth)).anterior;
  }

  get posteriorTeethForCrownOrPontic(): number[] {
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => (data.subType == 'Crown' || data.subType == 'Pontic') && data.type == 'Anatomy').map(data => data.teeth)).posterior;
  }

  get isAnatomyCrownSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Crown' && data.type == 'Anatomy');
  }
  get isAnatomyPonticSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Pontic' && data.type == 'Anatomy');
  }
  get isAnatomyInlayOnlaySelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Inlay/Onlay' && data.type == 'Anatomy');
  }
  get isAnatomyVeneerSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Veneer' && data.type == 'Anatomy');
  }


  get isFrameCrownSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Crown' && data.type == 'Frame');
  }
  get isFramePonticSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Pontic' && data.type == 'Frame');
  }
  get isFrameInlayOnlaySelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Inlay/Onlay' && data.type == 'Frame');
  }
  get isFrameVeneerSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Veneer' && data.type == 'Frame');
  }


  get isBridgeSelected(): boolean {
    return this.orderDetailsNew.bridges.length > 0;
  }

  validateToothSelection() {

    var noPonticWithoutBridge: boolean = this.orderDetailsNew.toothData.filter(data => data.subType == 'Pontic' && data.bridgeConnectionType == '').length == 0;
    if (!noPonticWithoutBridge) {
      this.dialogService.openMessageDialog('Warning!', 'Only Pontic is not allowed.').subscribe();
      return false;
    }

    if (this.orderDetailsNew.toothData.filter(data => data.type != '' && data.subType != '').length == 0) {
      this.dialogService.openMessageDialog('Warning!', 'Please select at least one tooth and type to proceed.').subscribe();
      return false;
    }

    if (noPonticWithoutBridge) {
      this.stepper.next();
      return true;
    }

    return false;
  }

  openFilesModalForDownload() {
    this.dialog.open(FilesComponent, { disableClose: true, width: '60%', height: '80%', data: { taskId: this.taskId, refNum: this.orderDetailsNew.refNum } }).afterClosed()
      .subscribe(result => {
        this.fileDetailsScan = result.fileDetailsScan;
        this.fileDetailsImages = result.fileDetailsImages;
        this.fileDetailsImagesContent = result.fileDetailsImagesContent;
      });
  }

  openVideoDialog(): void {
    this.dialog.open(VideoDialogComponent, { minWidth: '60vw', minHeight: '60vh' });
  }



  move(index: number) {
    this.stepper.selectedIndex = index;
  }



  @ViewChild('scanFile') fileInput!: ElementRef<HTMLInputElement>;

  // --- Drag and Drop Handlers ---
  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevent default browser behavior
    event.stopPropagation();
    // Add a class for visual feedback (e.g., this.isDragging = true;)
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Remove visual feedback class (e.g., this.isDragging = false;)
  }

  // @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   // Remove visual feedback class

  //   if (event.dataTransfer && event.dataTransfer.files.length > 0) {
  //     Array.from(event.dataTransfer.files).forEach(file => this.uploadSingleFile(file, ''));
  //   }
  // }


  // addFileDetails(event: any, fileType: string = '') {
  //   var fileList: FileList = event.target.files;
  //   if (fileList.length == 0) {
  //     this.dialogService.openMessageDialog('Error', 'Select a file to Upload.');
  //   } else {
  //     Array.from(fileList).forEach(file => this.uploadSingleFile(file, fileType));
  //   }
  // }

  // progress: { [fileName: string]: number } = {}; // name -> 0..100

  @ViewChild('scanFile') scanFile!: ElementRef<HTMLInputElement>;
  openScanPicker() {
    this.scanFile.nativeElement.click();
  }
  uploadSingleFile(file: File, fileType: string) {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.postFile('/tasks/' + this.taskId + '/files', file).subscribe({
      next: (response) => {
        this.fileDetailsScan.push({ fileId: 0, fileType: fileType, fileName: file.name, fileSize: file.size });
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        if (err.status == 400) {
          this.dialogService.openMessageDialog('Error', 'File already exists, please try uploading a different file.');
        } else {
          this.dialogService.openMessageDialog('Error', 'File Size Limit Exceeded.');
        }
      }
    });
  }


  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    Array.from(e.dataTransfer?.files ?? []).forEach(f => this.uploadWithProgress(f));
    e.dataTransfer?.clearData();
  }

  addFileDetails(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) {
      this.dialogService.openMessageDialog('Error', 'Select a file to Upload.');
      return;
    }
    files.forEach(f => this.uploadWithProgress(f));
    input.value = '';
  }


  private sanitizeName(name: string) {
    return name.replace(/[^a-zA-Z0-9.]/g, '_');
  }
  keepOrder = (_a: KeyValue<string, number>, _b: KeyValue<string, number>) => 0;
  trackByFileName = (_: number, f: { fileName: string }) => f.fileName;


  // progress map: { [safeName]: { percent, state } }
  progress: Record<string, FileProgress> = {};

  private formatBytes(b: number): string {
    if (!isFinite(b)) return '';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0; let n = b;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(i ? 2 : 0)}${units[i]}`;
  }

  private formatDuration(sec: number): string {
    if (!isFinite(sec) || sec < 0) return '';
    if (sec < 1) return '1 second left';
    if (sec < 60) return `${Math.max(1, Math.round(sec))} seconds left`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return s > 0 ? `${m}m ${s}s left` : `${m}m left`;
  }

  private startTrickle(name: string, to = 99, step = 1, ms = 500) {
    const entry = this.progress[name];
    if (!entry) return;
    this.stopTrickle(name);
    entry.intervalId = setInterval(() => {
      const e = this.progress[name];
      if (!e || e.state === 'done' || e.state === 'error') return this.stopTrickle(name);
      if (e.percent < to) e.percent += step;
    }, ms);
  }

  private stopTrickle(name: string) {
    const entry = this.progress[name];
    if (entry?.intervalId) { clearInterval(entry.intervalId); entry.intervalId = undefined; }
  }

  private updateEta(entry: FileProgress, total: number) {
    // Exponential moving average for speed
    const now = performance.now();
    if (entry.lastTs) {
      const dt = (now - entry.lastTs) / 1000;
      const dbytes = Math.max(0, entry.loaded - entry.lastLoaded);
      const inst = dbytes / Math.max(0.001, dt);
      const alpha = 0.25; // smoothing (0..1)
      entry.speedBps = entry.speedBps ? (alpha * inst + (1 - alpha) * entry.speedBps) : inst;
    }
    entry.lastTs = now;
    entry.lastLoaded = entry.loaded;

    if (total && entry.speedBps > 0) {
      const remain = Math.max(0, total - entry.loaded);
      entry.etaSeconds = remain / entry.speedBps;
      entry.etaLabel = this.formatDuration(entry.etaSeconds);
    } else {
      entry.etaSeconds = undefined;
      entry.etaLabel = 'calculating…';
    }
  }

  private uploadWithProgress(file: File) {
    const apiBase = environment.apiUrl;
    const url = `${apiBase}/tasks/${this.taskId}/files`;

    const form = new FormData();
    form.append('file', file);

    const safe = this.sanitizeName(file.name);
    const headers = new HttpHeaders().set('X-Digital-FileName', safe);

    // init
    this.progress[safe] = {
      percent: 0,
      state: 'uploading',
      size: file.size,
      sizeLabel: this.formatBytes(file.size),
      loaded: 0,
      lastLoaded: 0,
      lastTs: 0,
      speedBps: 0
    };

    const req = new HttpRequest('POST', url, form, {
      reportProgress: true,
      responseType: 'text',
      headers
    });

    this.http.request(req).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && (event as any).total) {
          const { loaded, total } = event as any;
          const e = this.progress[safe];
          if (!e) return;

          e.loaded = loaded;
          // Real percent up to 92%, then keep it creeping; jump to 100 on response
          const realPct = Math.round((loaded / total) * 100);
          e.percent = Math.min(realPct, 92);
          this.updateEta(e, total);

          if (loaded >= total && e.state !== 'waiting') {
            // bytes sent; wait for server
            e.state = 'waiting';
            this.startTrickle(safe, 99, 1, 400);
            // ETA now represents server time ~uncertain; you can clear or keep last known
          }
        } else if (event.type === HttpEventType.Response) {
          // finished
          const e = this.progress[safe];
          if (e) {
            this.stopTrickle(safe);
            e.percent = 100;
            e.state = 'done';
            e.etaLabel = 'Completed';
          }
          this.fileDetailsScan.push({
            fileId: 0,
            fileType: '',
            fileName: file.name,
            fileSize: file.size
          });
        }
      },
      error: (err) => {
        console.error('Upload failed:', err?.status, err?.error);
        this.dialogService.openMessageDialog('Error', err?.error?.message || 'Upload failed.');
        const e = this.progress[safe];
        if (e) { this.stopTrickle(safe); e.state = 'error'; }
      }
    });
  }

  // private uploadWithProgress(file: File) {
  //   const apiBase = environment.apiUrl;
  //   const url = `${apiBase}/tasks/${this.taskId}/files`;

  //   const form = new FormData();
  //   form.append('file', file);

  //   const safe = this.sanitizeName(file.name);
  //   const headers = new HttpHeaders().set('X-Digital-FileName', safe);

  //   // init state
  //   this.progress[safe] = { percent: 0, state: 'uploading' };

  //   const req = new HttpRequest('POST', url, form, {
  //     reportProgress: true,
  //     responseType: 'text',
  //     headers
  //   });

  //   this.http.request(req).subscribe({
  //     next: (event) => {
  //       if (event.type === HttpEventType.UploadProgress && (event as any).total) {
  //         const { loaded, total } = event as any;
  //         // cap at 99% to keep UI active until server response arrives
  //         const pct = Math.min(99, Math.round((loaded / total) * 100));
  //         this.progress[safe] = { percent: pct, state: 'uploading' };

  //         // if bytes are fully sent but no response yet, show "processing"
  //         if (loaded === total && pct >= 99) {
  //           this.progress[safe] = { percent: 99, state: 'processing' };
  //         }
  //       } else if (event.type === HttpEventType.Response) {
  //         // final server response → mark done
  //         this.progress[safe] = { percent: 100, state: 'done' };
  //         this.fileDetailsScan.push({
  //           fileId: 0,
  //           fileType: '',
  //           fileName: file.name,
  //           fileSize: file.size
  //         });
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Upload failed:', err?.status, err?.error);
  //       this.dialogService.openMessageDialog('Error', err?.error?.message || 'Upload failed.');
  //       this.progress[safe] = { percent: 0, state: 'error' };
  //       // optional: remove after a moment or keep visible for retry
  //       // delete this.progress[safe];
  //     }
  //   });
  // }



  // private uploadWithProgress(file: File) {
  //   const apiBase = environment.apiUrl; 
  //   const url = `${apiBase}/tasks/${this.taskId}/files`; 

  //   const form = new FormData();
  //   form.append('file', file);

  //   const safe = this.sanitizeName(file.name);
  //   const headers = new HttpHeaders().set('X-Digital-FileName', safe); 

  //   this.progress[safe] = 0;
  //   // this.dataService.updateProgressBarSubject(true);

  //   const req = new HttpRequest('POST', url, form, {
  //     reportProgress: true,
  //     responseType: 'text',   
  //     headers
  //   });

  //   this.http.request(req).subscribe({
  //     next: (event) => {
  //       if (event.type === HttpEventType.UploadProgress && (event as any).total) {
  //         const { loaded, total } = event as any;
  //         this.progress[safe] = Math.round((loaded / total) * 100);
  //       } else if (event.type === HttpEventType.Response) {
  //         this.progress[safe] = 100;
  //         this.fileDetailsScan.push({ fileId: 0, fileType: '', fileName: file.name, fileSize: file.size });
  //         // this.dataService.updateProgressBarSubject(false);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Upload failed:', err.status, err.error);
  //       this.dialogService.openMessageDialog('Error', err?.error?.message || 'Upload failed.');
  //       delete this.progress[safe];
  //       // this.dataService.updateProgressBarSubject(false);
  //     }
  //   });
  // }
  removeProgress(name: string) {
    delete this.progress[name]; // removes it from the progress grid
  }



  removeFileByName(fileName: string) {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.delete('/tasks/' + this.taskId + '/files?file-name=' + fileName.replace(/[^a-zA-Z0-9.]/g, '_')).subscribe({
      next: (response) => {
        var index = this.fileDetailsScan.findIndex((file) => file.fileName === fileName);
        if (index > -1) {
          this.fileDetailsScan.splice(index, 1);
        }
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Remove File, Please try again.');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === null || bytes === undefined || isNaN(bytes)) {
      return '';
    }

    const MB = 1048576; // 1024 * 1024
    const KB = 1024;

    if (bytes >= MB) {
      return `${(bytes / MB).toFixed(2)} MB`;
    } else {
      return `${(bytes / KB).toFixed(2)} KB`;
    }
  }



  articulationErrMsg: string | null = null;

  validateArticulatorRange() {
    var q2Value = this.orderDetailsNew.articulationDetails.props['Raising or lowering the articulator'];
    this.articulationErrMsg = null;

    if (isNaN(q2Value)) {
      this.articulationErrMsg = 'Invalid Value';
    }

    if (q2Value < -50.0 || q2Value > 50.0) {
      this.articulationErrMsg = 'Value out of range, should be between -50 mm to +50 mm';
    }

    const incrementValid = (q2Value * 100) % 1 === 0;
    if (!incrementValid) {
      this.articulationErrMsg = 'Invalid value, should be in increments of 0.01 mm';
    }
  }


  protrusionAngleRange: any = {
    'Artex von Amann Girrbach': [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    'SAM': [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    'KaVo PROTAR evo': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    'Whip Mix DENAR Mark 330': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
  }

  bennettAngleRange: any = {
    'Artex von Amann Girrbach': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    'SAM': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    'KaVo PROTAR evo': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    'Whip Mix DENAR Mark 330': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
  }

  issRange: any = {
    'Artex von Amann Girrbach': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2],
    'SAM': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2],
    'KaVo PROTAR evo': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3],
    'Whip Mix DENAR Mark 330': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5]
  }

  incisalGuidanceRange: any = {
    'Artex von Amann Girrbach': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    'SAM': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    'KaVo PROTAR evo': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    'Whip Mix DENAR Mark 330': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  }


  biteTypes: string[] = ['normal-bite', 'overbite', 'underbite', 'excessive-spacing', 'deep-bite', 'crossbite', 'crowding', 'open-bite'];

  changeBiteType(biteType: string): void {
    this.orderDetailsNew.biteType = biteType;
    this.showSlider.value = false;
  }




  get calculateAmountOnTimeAndTier(): number {
    let amount = 0.0;

    if (this.orderDetailsNew.showAi) {
      if (this.orderDetailsNew.deliveryTime == "10") {
        amount = 3.87;
      }

      if (this.orderDetailsNew.deliveryTime == "4") {
        amount = 4.78;
      }
    }

    if (this.orderDetailsNew.tier == 'silver') {
      amount = 6.99;
    }

    if (this.orderDetailsNew.tier == 'gold') {
      amount = 12.99;
      if (this.orderDetailsNew.deliveryTime === "12") {
        amount += 2.99;
      }
    }

    if (this.orderDetailsNew.tier == 'platinum') {
      amount = 31.99;
      if (this.orderDetailsNew.deliveryTime === "12") {
        amount += 2.99;
      }
      if (this.orderDetailsNew.deliveryTime === "8") {
        amount += 4.99;
      }
    }

    return amount * this.orderDetailsNew.toothData.length; // Multiply by number of teeth selected
  }





}
