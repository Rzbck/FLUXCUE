<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { duplicateFixture, sameScene, sanitizeFixture } from './core/scene-editor.mjs';
import {chooseSelection, editableFixtures, selectionPivot, transformGroup, scenePixelPosition, spatialWave, spatialBlocks} from './core/spatial-selection.mjs';
import { describePatch } from './core/patch.mjs';
import { virtualPixelRows } from './core/pixel-map.mjs';
import { createFixtureArray } from './core/layouts.mjs';
import { fadeFactor, advancePreviewClock } from './core/cue-engine.mjs';
import {CHIP_PROFILES,DENSITY_PRESETS,pixelCountFor,inferredDensity,chipFormat,scaleSelected} from './core/hardware.mjs';
import {parseStudioProject,stringifyStudioProject} from './core/project-store.mjs';
import {cueAppliesTo,layerEnvelope,composeRgb,cueNextAt} from './core/cue-layers.mjs';

type Fx = 'solid' | 'rainbow' | 'chase' | 'gradient' | 'spatial-wave' | 'spatial-blocks';
type Fixture = { id: string; name: string; pixels: number; length: number; x: number; y: number; z: number; angle: number; format: 'RGB' | 'RGBW'; group: string; visible: boolean; locked: boolean; chip:string; density:number; tint:string };
type SceneSnapshot = { fixtures: Fixture[]; cues: Cue[]; selectedId: string; selectedIds: string[]; activeIndex: number; effect:Fx; color:string; speed:number; brightness:number };
type ToolMode = 'translate' | 'rotate' | 'scale';
type Cue = { id: string; name: string; effect: Fx; fade: number; color: string; hold:number; mode:'ADD'|'REPLACE'; targetIds:string[]; speed:number };
type ActiveLayer = {id:string;cueId:string;effect:Fx;color:string;mode:'ADD'|'REPLACE';targetIds:string[];started:number;fade:number;speed:number};
const fixtures = ref<Fixture[]>([
  { id:'s1',name:'STAGE / TOP',pixels:120,length:4,x:0,y:2.7,z:-1.3,angle:0,format:'RGB',group:'STAGE',visible:true,locked:false,chip:'WS2815',density:30,tint:'#ffffff' },
  { id:'s2',name:'LEFT / VERTICAL',pixels:70,length:2.5,x:-2.3,y:1.45,z:0,angle:90,format:'RGB',group:'STAGE',visible:true,locked:false,chip:'WS2815',density:28,tint:'#ffffff' },
  { id:'s3',name:'RIGHT / VERTICAL',pixels:70,length:2.5,x:2.3,y:1.45,z:0,angle:90,format:'RGB',group:'STAGE',visible:true,locked:false,chip:'WS2815',density:28,tint:'#ffffff' },
  { id:'s4',name:'FLOOR / FRONT',pixels:150,length:5,x:0,y:0.1,z:1.5,angle:0,format:'RGB',group:'FLOOR',visible:true,locked:false,chip:'WS2815',density:30,tint:'#ffffff' }
]);
const cues = ref<Cue[]>([
  { id:'c1', name:'01 · INIT / WHITE', effect:'solid',fade:0.4,color:'#bfc8e5',hold:5,mode:'ADD',targetIds:[],speed:.35 },
  { id:'c2', name:'02 · CHROMA FLOW',effect:'rainbow',fade:2,color:'#79b8ff',hold:7,mode:'ADD',targetIds:[],speed:.35 },
  { id:'c3', name:'03 · PULSE / CHASE',effect:'chase',fade:1.2,color:'#ff835e',hold:5,mode:'ADD',targetIds:[],speed:.35 },
  { id:'c4', name:'04 · SOFT GRADIENT',effect:'gradient',fade:2,color:'#99a7ff',hold:6,mode:'ADD',targetIds:[],speed:.35 }
]);
const selectedId = ref('s1');
const selectedIds = ref<string[]>(['s1']);
const contextMenu = ref({visible:false,x:0,y:0});
const bulkGroup = ref('STAGE');
const layoutType = ref<'ROW X'|'ROW Z'|'RING XY'>('ROW X');
const layoutCount = ref(6);
const layoutSpacing = ref(0.6);
const collapsedGroups=ref<string[]>([]);
const collapsedPanels=ref({scene:false,arrays:true,patch:false,cues:false,geometry:false,effects:false,pixel:true});
const editingGroup=ref<string|null>(null);
const groupNameDraft=ref('');
const autoPlay=ref(false);
const saveState=ref<'READY'|'SAVED'|'PENDING'|'ERROR'|'RECOVERED'>('READY');
const activeLayers=ref<ActiveLayer[]>([]);
const blackout=ref(false);
const layerBudget=12;
const selectedTint=ref('#ffffff');
const cueTargetMode=ref<'ALL'|'SELECTION'>('SELECTION');
const runningCueIds=computed(()=>new Set(activeLayers.value.map(l=>l.cueId)));
let hydrated=false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let autoNextTime=Infinity;
let lastClockSaved=0;
const storageKey='fluxcue.studio.project.v02';
const selectedFixtures = computed(() => fixtures.value.filter(f => selectedIds.value.includes(f.id)));
const editableCount = computed(() => selectedFixtures.value.filter(f => f.visible && !f.locked).length);
const selectionCount = computed(() => selectedIds.value.length);
const pixelFocus = ref(0);
const focusedPixelIndex = computed(() => Math.min(Math.max(0,Math.floor(pixelFocus.value)||0),sanitizeFixture(current.value).pixels-1));
const focusedPixel = computed(() => scenePixelPosition(sanitizeFixture(current.value),focusedPixelIndex.value));
const focusedAddress = computed(() => patch.value.assignments[focusedPixelIndex.value]);
const current = computed(() => fixtures.value.find(f=>f.id===selectedId.value) ?? fixtures.value[0]);
const fixtureGroups = computed(() => [...new Set(fixtures.value.map(f => f.group?.trim() || 'STAGE'))]);
const toolMode = ref<ToolMode>('translate');
const positionSnap = ref(0.1);
const angleSnap = ref(15);
const showGrid = ref(true);
const undoStack = ref<SceneSnapshot[]>([]);
const redoStack = ref<SceneSnapshot[]>([]);
const activeIndex = ref(1);
const activeCue = computed(() => cues.value[activeIndex.value] ?? cues.value[0]);
const autoplayCountdown = computed(() => autoPlay.value && Number.isFinite(autoNextTime) ? Math.max(0,autoNextTime-showSeconds.value).toFixed(1)+'s' : 'OFF');
const running = ref(true);
const effect = ref<Fx>('rainbow');
const color = ref('#79b8ff');
const speed = ref(0.35);
const brightness = ref(0.75);
const fps = ref(0);
const showSeconds = ref(0);
const fadeStarted = ref(0);
const fadeSeconds = ref(0);
const fadeProgress = computed(() => fadeFactor(showSeconds.value, fadeStarted.value, fadeSeconds.value));
const timeLabel = computed(() => {
  const mins = Math.floor(showSeconds.value/60);
  const secs = Math.floor(showSeconds.value%60);
  return String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
});
const patch = computed(() => describePatch(sanitizeFixture(current.value).pixels, current.value.format));
const totalPixels = computed(() => fixtures.value.reduce((s,f)=>s+sanitizeFixture(f).pixels,0));
const totalUniverses = computed(() => fixtures.value.reduce((s,f)=>s+describePatch(sanitizeFixture(f).pixels,f.format).universesUsed,0));
const viewport = ref<HTMLElement|null>(null);
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls;
let transform: TransformControls, transformProxy: THREE.Object3D, grid: THREE.GridHelper, coarseGrid: THREE.GridHelper;
let transforming = false, suppressSceneClick = false;
let dragStart: SceneSnapshot | null = null, editStart: SceneSnapshot | null = null;
let dragPivot: {x:number,y:number,z:number} | null = null;
let dragBaseline: Fixture[] = [];
const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2();
const hitLines = new Map<string, THREE.Line>();
let sizeObserver: ResizeObserver | undefined, raf = 0, lastFrame = 0, frameSampleAt = 0, frameCount = 0, lastUiFrame = 0;
// Snapshots freeze the *actual displayed* colour per pixel before a new cue.
// A rapid GO/BACK mid-fade then starts from the existing look, not from the previous target.
let fadeFrom = new Map<string, Float32Array>();
const strips = new Map<string, THREE.InstancedMesh>();
let pixelGeometry: THREE.SphereGeometry;
let showTime = 0;
const dummy = new THREE.Object3D();
const colorA = new THREE.Color();
const colorB = new THREE.Color();
const tmp = new THREE.Color();
const tintColors = new Map<string,{hex:string;value:THREE.Color}>();
function getTintColor(f:Fixture):THREE.Color {
  const hex=f.tint||'#ffffff';
  let cached=tintColors.get(f.id);
  if(!cached||cached.hex!==hex){
    cached={hex,value:new THREE.Color(hex)};
    tintColors.set(f.id,cached);
  }
  return cached.value;
}
const gradientEnd = new THREE.Color('#1b72a7');
function resize() {
  if (!viewport.value || !renderer || !camera) return;
  const w = Math.max(1, viewport.value.clientWidth), h = Math.max(1, viewport.value.clientHeight);
  renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix();
}
function snapshotScene(): SceneSnapshot {
  return { fixtures:fixtures.value.map(f=>({...f})),cues:cues.value.map(c=>({...c,targetIds:[...c.targetIds]})),selectedId:selectedId.value,selectedIds:[...selectedIds.value],activeIndex:activeIndex.value,effect:effect.value,color:color.value,speed:speed.value,brightness:brightness.value };
}
function rememberScene(previous: SceneSnapshot) {
  if (sameScene(previous,snapshotScene())) return;
  undoStack.value=[...undoStack.value.slice(-79),previous];
  redoStack.value=[];
}
function restoreScene(previous: SceneSnapshot) {
  fixtures.value=previous.fixtures.map(f=>({...f}));
  cues.value=previous.cues.map(c=>({...c,targetIds:[...c.targetIds]}));
  activeIndex.value=Math.max(0,Math.min(previous.activeIndex,cues.value.length-1));
  effect.value=previous.effect;color.value=previous.color;speed.value=previous.speed;brightness.value=previous.brightness;
  selectedId.value=fixtures.value.some(f=>f.id===previous.selectedId) ? previous.selectedId : fixtures.value[0].id;
  selectedIds.value=previous.selectedIds?.filter(id=>fixtures.value.some(f=>f.id===id)) || [selectedId.value];
  if(!selectedIds.value.length)selectedIds.value=[selectedId.value];
  // Scene undo changes geometry/data only; never stop a running cue.
  syncTransform();
}
function undoEdit() {
  const previous=undoStack.value.pop();
  if (!previous) return;
  redoStack.value.push(snapshotScene());
  restoreScene(previous);
}
function redoEdit() {
  const next=redoStack.value.pop();
  if (!next) return;
  undoStack.value.push(snapshotScene());
  restoreScene(next);
}
function beginEdit() {
  if (!editStart) editStart=snapshotScene();
}
function commitEdit() {
  if (editStart) rememberScene(editStart);
  editStart=null;
}
function normalizeCurrent() {
  const clean=sanitizeFixture(current.value);
  // Length and density, never a manually guessed total, define physical pixel count.
  Object.assign(current.value,clean);
  current.value.density=inferredDensity(current.value);
  current.value.pixels=pixelCountFor(clean.length,current.value.density);
  commitEdit();
}
function chooseChip(event:Event){
  const chip=(event.target as HTMLSelectElement).value;
  const profile=CHIP_PROFILES.find(p=>p.id===chip);if(!profile)return;
  const before=snapshotScene();
  for(const f of selectedFixtures.value)if(!f.locked){
    f.chip=chip;f.format=profile.format as Fixture['format'];f.density=inferredDensity(f);
    f.pixels=pixelCountFor(f.length,f.density);
  }
  rememberScene(before);
}
function changeDensity(event:Event){
  const n=Number((event.target as HTMLInputElement).value);
  if(!Number.isFinite(n)||n<1||n>600)return;
  const before=snapshotScene();
  for(const f of selectedFixtures.value)if(!f.locked){
    f.density=n;f.pixels=pixelCountFor(f.length,n);
  }
  rememberScene(before);
}
function paintSelection(event:Event){
  const c=(event.target as HTMLInputElement).value;
  if(!/^#[a-f0-9]{6}$/i.test(c))return;
  beginEdit();
  for(const f of selectedFixtures.value)if(!f.locked)f.tint=c;
  selectedTint.value=c;
}
function toggleGroup(name:string){
  collapsedGroups.value=collapsedGroups.value.includes(name)?collapsedGroups.value.filter(x=>x!==name):[...collapsedGroups.value,name];
}
function collapseAllGroups(){collapsedGroups.value=[...fixtureGroups.value];}
function expandAllGroups(){collapsedGroups.value=[];}
function startGroupRename(name:string){editingGroup.value=name;groupNameDraft.value=name;}
function commitGroupRename(){
  const old=editingGroup.value;editingGroup.value=null;
  const name=groupNameDraft.value.trim().slice(0,40);
  if(!old||!name||name===old)return;
  const before=snapshotScene();
  for(const f of fixtures.value)if(f.group===old)f.group=name;
  collapsedGroups.value=collapsedGroups.value.filter(x=>x!==old);
  rememberScene(before);
}
function togglePanel(name:keyof typeof collapsedPanels.value){
  collapsedPanels.value[name]=!collapsedPanels.value[name];
}
function serializableProject(){
  return {fixtures:fixtures.value,cues:cues.value,selectedId:selectedId.value,selectedIds:selectedIds.value,activeIndex:activeIndex.value,collapsedGroups:collapsedGroups.value,
    autoPlay:autoPlay.value,speed:speed.value,brightness:brightness.value,collapsedPanels:collapsedPanels.value,
    activeLayers:activeLayers.value,showTime,running:running.value,blackout:blackout.value};
}
function persistLocal(){
  if(!hydrated)return;
  try {
    localStorage.setItem(storageKey,stringifyStudioProject(serializableProject()));
    saveState.value='SAVED';
  }catch{saveState.value='ERROR';}
}
function scheduleSave(){
  if(!hydrated)return;
  saveState.value='PENDING';
  if(saveTimer)clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{saveTimer=undefined;persistLocal();},650);
}
function restoreLocal(){
  try{
    const raw=localStorage.getItem(storageKey);
    if(!raw)return;
    const parsed=parseStudioProject(raw);
    fixtures.value=parsed.fixtures as Fixture[];
    cues.value=parsed.cues as Cue[];
    selectedId.value=parsed.selectedId;selectedIds.value=parsed.selectedIds;
    activeIndex.value=parsed.activeIndex;
    collapsedGroups.value=parsed.collapsedGroups;
    Object.assign(collapsedPanels.value,parsed.collapsedPanels);
    autoPlay.value=parsed.autoPlay;
    speed.value=parsed.speed;brightness.value=parsed.brightness;
    activeLayers.value=parsed.activeLayers as ActiveLayer[];
    showTime=parsed.showTime;showSeconds.value=parsed.showTime;
    running.value=parsed.running;blackout.value=parsed.blackout;
    autoNextTime=autoPlay.value?cueNextAt(showTime,cues.value[activeIndex.value]?.hold||5):Infinity;
    effect.value=cues.value[activeIndex.value]?.effect||'solid';
    color.value=cues.value[activeIndex.value]?.color||'#ffffff';
    saveState.value='RECOVERED';
  }catch{saveState.value='ERROR'; /* Preserve corrupt local bytes for backup/manual recovery. */ }
}
function forgetLocal(){
  if(!confirm('Reset local project and start from this current session? This deletes ONLY the saved browser copy.'))return;
  try{localStorage.removeItem(storageKey);saveState.value='READY';}catch{saveState.value='ERROR';}
}
function disposeStrips() {
  if (!scene) return;
  for (const mesh of strips.values()) {
    scene.remove(mesh);mesh.dispose();
    (mesh.material as THREE.Material).dispose();
  }
  strips.clear();
  tintColors.clear();
  for (const line of hitLines.values()) {
    scene.remove(line);line.geometry.dispose();
    (line.material as THREE.Material).dispose();
  }
  hitLines.clear();
}
function rebuildScene() {
  if (!scene || !pixelGeometry) return;
  const live=new Set(fixtures.value.filter(f=>f.visible).map(f=>f.id));
  for (const [id,mesh] of strips) {
    if (live.has(id)) continue;
    scene.remove(mesh);mesh.dispose();(mesh.material as THREE.Material).dispose();strips.delete(id);
  }
  for (const [id,line] of hitLines) {
    if (live.has(id)) continue;
    scene.remove(line);line.geometry.dispose();(line.material as THREE.Material).dispose();hitLines.delete(id);
  }
  for (const raw of fixtures.value) {
    const f=sanitizeFixture(raw);
    if (!f.visible) continue;
    const n=f.pixels;
    let mesh=strips.get(f.id);
    if (!mesh || mesh.count!==n) {
      if (mesh) {scene.remove(mesh);mesh.dispose();(mesh.material as THREE.Material).dispose();}
      mesh=new THREE.InstancedMesh(pixelGeometry,new THREE.MeshBasicMaterial({color:0xffffff}),n);
      mesh.frustumCulled=false;mesh.userData.fixtureId=f.id;strips.set(f.id,mesh);scene.add(mesh);
      for(let i=0;i<n;i++) mesh.setColorAt(i,new THREE.Color('#6688aa'));
      if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
    }
    const a=THREE.MathUtils.degToRad(f.angle);
    const dx=Math.cos(a),dy=Math.sin(a);
    for (let i=0;i<n;i++) {
      const t=n<=1?0:(i/(n-1)-0.5)*f.length;
      dummy.position.set(f.x+dx*t,f.y+dy*t,f.z);
      dummy.scale.setScalar(selectedIds.value.includes(f.id)?1.55:1);
      dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
    // Wider invisible raycast line makes a tiny LED strip easy to select by mouse.
    const points=[
      new THREE.Vector3(f.x-dx*f.length/2,f.y-dy*f.length/2,f.z),
      new THREE.Vector3(f.x+dx*f.length/2,f.y+dy*f.length/2,f.z)
    ];
    let line=hitLines.get(f.id);
    if (!line) {
      line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
      line.userData.fixtureId=f.id;scene.add(line);hitLines.set(f.id,line);
    }
    line.geometry.dispose();
    line.geometry=new THREE.BufferGeometry().setFromPoints(points);
  }
}
function syncTransform() {
  if (!transform || !transformProxy || transforming) return;
  const group=editableFixtures(fixtures.value,selectedIds.value);
  const pivot=selectionPivot(group);
  if (!pivot) {transform.detach();return;}
  transformProxy.position.set(pivot.x,pivot.y,pivot.z);
  // Shared selection pivot rotates the whole group, not only the active fixture.
  transformProxy.rotation.set(0,0,0);
  transformProxy.scale.set(1,1,1);
  updateGridAnchor();
  transform.attach(transformProxy);
  transform.setMode(toolMode.value);
  transform.showX=toolMode.value==='translate'||toolMode.value==='scale';
  transform.showY=toolMode.value==='translate';
  transform.showZ=toolMode.value==='translate'||toolMode.value==='rotate';
  // Scale along the red X handle; the group-length scale is applied uniformly.
}
function updateTransformOptions() {
  if (!transform) return;
  transform.setMode(toolMode.value);
  transform.setTranslationSnap(positionSnap.value>0?positionSnap.value:null);
  transform.setRotationSnap(angleSnap.value>0?THREE.MathUtils.degToRad(angleSnap.value):null);
  transform.setScaleSnap(null);
  syncTransform();
}
function updateGridAnchor() {
  if (!grid || !current.value) return;
  const f=sanitizeFixture(current.value);
  const unit=positionSnap.value || 1;
  // Fine grid follows the selected fixture, aligned to a stable world-space step.
  // Recentring by whole snap cells keeps the grid from sliding under the pixels.
  grid.position.set(Math.round(f.x/unit)*unit,0.003,Math.round(f.z/unit)*unit);
}
function updateGrid() {
  if (!scene)return;
  if (grid){scene.remove(grid);grid.geometry.dispose();(grid.material as THREE.Material).dispose();}
  if (coarseGrid){scene.remove(coarseGrid);coarseGrid.geometry.dispose();(coarseGrid.material as THREE.Material).dispose();}
  coarseGrid=new THREE.GridHelper(20,20,'#424242','#222222');
  coarseGrid.visible=showGrid.value;
  scene.add(coarseGrid);
  // 1 cm -> local 1m patch with 100 subdivisions; 5 cm -> 4m/80.
  // Also preserve a 1m major floor grid for spatial orientation.
  const unit=positionSnap.value || 1;
  const size=positionSnap.value>0 ? Math.min(20,Math.max(1,unit*80)) : 20;
  const divisions=Math.min(100,Math.round(size/unit));
  grid=new THREE.GridHelper(size,divisions,'#484848','#303030');
  grid.visible=showGrid.value && positionSnap.value>0 && positionSnap.value<1;
  scene.add(grid);
  updateGridAnchor();
}
function onSceneClick(event: MouseEvent) {
  if (suppressSceneClick) {suppressSceneClick=false;return;}
  if (transforming || !renderer || !camera || !hitLines.size)return;
  const rect=renderer.domElement.getBoundingClientRect();
  if (!rect.width||!rect.height)return;
  cursor.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height*2-1));
  raycaster.setFromCamera(cursor,camera);
  raycaster.params.Line.threshold=0.18;
  const hit=raycaster.intersectObjects([...hitLines.values()],false)[0];
  const id=hit?.object.userData.fixtureId as string|undefined;
  if (id && fixtures.value.some(f=>f.id===id && f.visible)) selectFixture(id,event.ctrlKey||event.metaKey,event.shiftKey);
  else if (!event.ctrlKey&&!event.metaKey&&!event.shiftKey && id===undefined) contextMenu.value.visible=false;
}
function setView(view: 'ISO'|'FRONT'|'TOP'|'RIGHT') {
  if (!controls || !camera)return;
  const center=current.value;
  const target=new THREE.Vector3(center.x,center.y,center.z);
  const distance=Math.max(6,Math.min(30,center.length*2.3));
  controls.target.copy(target);
  camera.up.set(0,1,0);
  if (view==='ISO')camera.position.copy(target).add(new THREE.Vector3(distance*0.7,distance*0.5,distance));
  if (view==='FRONT')camera.position.copy(target).add(new THREE.Vector3(0,0,distance));
  if (view==='RIGHT')camera.position.copy(target).add(new THREE.Vector3(distance,0,0));
  if (view==='TOP'){camera.up.set(0,0,-1);camera.position.copy(target).add(new THREE.Vector3(0,distance,0.001));}
  camera.lookAt(target);controls.update();
}
function orderedFixtureIds(){
  return fixtureGroups.value.flatMap(g => fixtures.value.filter(f => (f.group?.trim() || 'STAGE')===g).map(f=>f.id));
}
function selectFixture(id:string,toggle=false,range=false) {
  contextMenu.value.visible=false;
  const next=chooseSelection(selectedIds.value,id,orderedFixtureIds(),{toggle,range,anchor:selectedId.value});
  selectedIds.value=next;
  selectedId.value=next.includes(id)?id:(next.at(-1) || id);
}
function selectAll() {
  selectedIds.value=fixtures.value.map(f=>f.id);
  selectedId.value=selectedIds.value[0];
  contextMenu.value.visible=false;
}
function selectGroupByName(group:string){
  const ids=fixtures.value.filter(f=>f.group===group).map(f=>f.id);
  if(!ids.length)return;
  selectedIds.value=ids;selectedId.value=ids[0];contextMenu.value.visible=false;
}
function selectGroup() {
  const group=current.value.group;
  selectedIds.value=fixtures.value.filter(f=>f.group===group).map(f=>f.id);
  selectedId.value=selectedIds.value[0] || current.value.id;
  contextMenu.value.visible=false;
}
function selectInverse() {
  const inverse=fixtures.value.filter(f=>!selectedIds.value.includes(f.id)).map(f=>f.id);
  if(inverse.length){selectedIds.value=inverse;selectedId.value=inverse[0];}
  contextMenu.value.visible=false;
}
function generateLayout(){
  const remaining=500-fixtures.value.length;
  if(remaining<2){alert('Limit of 500 fixtures reached');return;}
  const count=Math.min(Math.max(2,Math.round(layoutCount.value)||2),32,remaining);
  try{
    const before=snapshotScene();
    const template=sanitizeFixture(current.value);
    const created=createFixtureArray(template,layoutType.value,count,layoutSpacing.value,()=>'s'+crypto.randomUUID());
    fixtures.value.push(...created);
    selectedIds.value=created.map(f=>f.id);
    selectedId.value=created[0].id;
    rememberScene(before);
    contextMenu.value.visible=false;
  }catch(error){alert('Layout generation failed: '+String(error));}
}
function addDuplicate() {
  const before=snapshotScene(),copies:Fixture[]=[];
  for(const f of selectedFixtures.value){
    if(fixtures.value.length+copies.length>=500)break;
    copies.push(duplicateFixture(f,'s'+crypto.randomUUID(),positionSnap.value));
  }
  if(!copies.length)return;
  fixtures.value.push(...copies);
  selectedIds.value=copies.map(f=>f.id);selectedId.value=copies[0].id;
  rememberScene(before);contextMenu.value.visible=false;
}
function deleteFixture() {
  if(fixtures.value.length<=1)return;
  const deletable=new Set(selectedFixtures.value.filter(f=>!f.locked).map(f=>f.id));
  if(deletable.size===0)return;
  const before=snapshotScene();
  const keep=fixtures.value.filter(f=>!deletable.has(f.id));
  if(!keep.length)keep.push(fixtures.value[0]);
  if(keep.length===fixtures.value.length)return;
  fixtures.value=keep;
  selectedId.value=keep[0].id;selectedIds.value=[selectedId.value];
  rememberScene(before);contextMenu.value.visible=false;
}
function setSelectedVisibility(value:boolean) {
  const before=snapshotScene();
  for(const f of selectedFixtures.value)f.visible=value;
  rememberScene(before);contextMenu.value.visible=false;
}
function toggleSelectedVisibility() {
  setSelectedVisibility(!current.value.visible);
}
function setSelectedLock(value:boolean) {
  const before=snapshotScene();
  for(const f of selectedFixtures.value)f.locked=value;
  rememberScene(before);contextMenu.value.visible=false;
}
function toggleSelectedLock() {setSelectedLock(!current.value.locked);}
function applyBulkGroup() {
  const group=bulkGroup.value.trim().slice(0,40);
  if(!group)return;
  const before=snapshotScene();
  for(const f of selectedFixtures.value)if(!f.locked)f.group=group;
  rememberScene(before);contextMenu.value.visible=false;
}
function alignSelected(axis:'x'|'y'|'z') {
  if(selectedFixtures.value.length<2)return;
  const before=snapshotScene(),value=sanitizeFixture(current.value)[axis];
  for(const f of selectedFixtures.value)if(!f.locked)f[axis]=value;
  rememberScene(before);contextMenu.value.visible=false;
}
function openMenu(event:MouseEvent,id?:string) {
  event.preventDefault();event.stopPropagation();
  if(id && !selectedIds.value.includes(id))selectFixture(id);
  contextMenu.value={visible:true,x:Math.max(8,Math.min(event.clientX,window.innerWidth-225)),
    y:Math.max(8,Math.min(event.clientY,window.innerHeight-380))};
}
function pickFixture(event:MouseEvent):string|undefined {
  if(!renderer || !camera)return;
  const rect=renderer.domElement.getBoundingClientRect();
  if(!rect.width || !rect.height)return;
  cursor.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height*2-1));
  raycaster.setFromCamera(cursor,camera);raycaster.params.Line.threshold=0.18;
  return raycaster.intersectObjects([...hitLines.values()],false)[0]?.object.userData.fixtureId as string|undefined;
}
function onSceneContextMenu(event:MouseEvent){
  const id=pickFixture(event);openMenu(event,id);
}
function onOutsideMenu(event:PointerEvent){
  const element=event.target as Element;
  if(contextMenu.value.visible && !element?.closest?.('.scene-context-menu'))contextMenu.value.visible=false;
}
function sampleFx(mode: Fx, hex: string, index: number, count: number, t: number, result: THREE.Color, fixture: Fixture, cueSpeed=speed.value) {
  const p = count <= 1 ? 0 : index/(count-1);
  if(mode==='spatial-wave' || mode==='spatial-blocks'){
    // Stable physical XYZ coordinates: moving a fixture changes how a wave crosses it.
    const world=scenePixelPosition(sanitizeFixture(fixture),index);
    const amount=mode==='spatial-wave'?spatialWave(world,t,cueSpeed):spatialBlocks(world,t,cueSpeed);
    return result.set(hex).multiplyScalar(.06+amount*.94);
  }
  if (mode==='solid') return result.set(hex);
  if (mode==='rainbow') return result.setHSL((p - t*cueSpeed*0.22 + 1)%1,0.8,0.58);
  if (mode==='chase') {
    const trail = ((p-t*cueSpeed*0.45)%1+1)%1;
    return result.set(hex).multiplyScalar(Math.max(0.025,1-trail*3.6));
  }
  return result.set(hex).lerp(gradientEnd,(Math.sin(p*Math.PI*2-t*cueSpeed*1.5)+1)/2);
}
function sampleCurrentPixel(f: Fixture, index: number, count: number, time: number, output: THREE.Color): THREE.Color {
  const tint=getTintColor(f);
  // Unpatched base look, used when all cues are stopped.
  sampleFx(effect.value,'#ffffff',index,count,time,colorB,f);
  let rgb=activeLayers.value.length ? [0.008,0.008,0.008] : [colorB.r,colorB.g,colorB.b];
  for(const layer of activeLayers.value){
    if(!cueAppliesTo(layer,f.id))continue;
    // The timing of each cue is independent; a later GO never resets prior effects.
    sampleFx(layer.effect,layer.color,index,count,time-layer.started,colorB,f,layer.speed);
    rgb=composeRgb(rgb,[colorB.r,colorB.g,colorB.b],layerEnvelope(time,layer.started,layer.fade),layer.mode);
  }
  return output.setRGB(rgb[0]*tint.r,rgb[1]*tint.g,rgb[2]*tint.b);
}
function drawPixels(){
  for(const f of fixtures.value){
    const mesh=strips.get(f.id);if(!mesh)continue;
    for(let i=0;i<mesh.count;i++){
      if(blackout.value)mesh.setColorAt(i,tmp.setRGB(0,0,0));
      else {sampleCurrentPixel(f,i,mesh.count,showTime,tmp);mesh.setColorAt(i,tmp.multiplyScalar(brightness.value));}
    }
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  }
}
function frame(now:number){
  raf=requestAnimationFrame(frame);
  const dt=lastFrame?Math.max(0,(now-lastFrame)/1000):0;
  lastFrame=now;
  showTime=advancePreviewClock(showTime,dt,running.value);
  if(showTime-lastClockSaved>8){lastClockSaved=showTime;scheduleSave();}
  if(autoPlay.value && running.value && cues.value.length>0 && showTime>=autoNextTime){
    applyCue((activeIndex.value+1)%cues.value.length);
  }
  if(now-lastUiFrame>75){showSeconds.value=showTime;lastUiFrame=now;}
  drawPixels();controls.update();renderer.render(scene,camera);
  frameCount++;
  if(now-frameSampleAt>1000){fps.value=Math.round(frameCount*1000/(now-frameSampleAt));frameSampleAt=now;frameCount=0;}
}
function applyCue(index:number){
  if(index<0||index>=cues.value.length)return;
  const c=cues.value[index];
  blackout.value=false;
  // Only re-triggering the same cue replaces its old instance. Other lanes keep running.
  const layer:ActiveLayer={id:'l'+crypto.randomUUID(),cueId:c.id,effect:c.effect,color:c.color,
    mode:c.mode||'ADD',targetIds:[...(c.targetIds||[])],started:showTime,fade:c.fade,speed:c.speed||.35};
  activeLayers.value=[...activeLayers.value.filter(l=>l.cueId!==c.id).slice(-(layerBudget-1)),layer];
  effect.value=c.effect;color.value=c.color;speed.value=c.speed;
  fadeStarted.value=showTime;fadeSeconds.value=c.fade;
  activeIndex.value=index;showSeconds.value=showTime;
  autoNextTime=cueNextAt(showTime,c.hold||5);
  running.value=true;
}
function stopCue(id:string){activeLayers.value=activeLayers.value.filter(l=>l.cueId!==id);scheduleSave();}
function stopAllCues(){activeLayers.value=[];autoNextTime=Infinity;autoPlay.value=false;blackout.value=true;scheduleSave();}
function toggleAutoPlay(){
  autoPlay.value=!autoPlay.value;
  if(autoPlay.value){
    // Set a fresh cue duration, even if the stack was already playing manually.
    if(cues.value.length)autoNextTime=cueNextAt(showTime,cues.value[activeIndex.value]?.hold||5);
    if(!activeLayers.value.length && cues.value.length)applyCue(activeIndex.value);
  }
}
function captureCueTargets(){return cueTargetMode.value==='ALL'?[]:[...selectedIds.value];}
function addCue(){
  if(cues.value.length>=3000)return;
  const before=snapshotScene();
  const c:Cue={id:'c'+crypto.randomUUID(),name:String(cues.value.length+1).padStart(2,'0')+' · NEW CUE',
    effect:effect.value,fade:1,color:color.value,hold:5,mode:'ADD',targetIds:captureCueTargets(),speed:speed.value};
  cues.value.push(c);activeIndex.value=cues.value.length-1;
  rememberScene(before);
}
function normalizeCue(){
  const c=activeCue.value;
  if(!c)return;
  c.fade=Number.isFinite(c.fade)?Math.min(120,Math.max(0,c.fade)):1;
  c.hold=Number.isFinite(c.hold)?Math.min(3600,Math.max(.1,c.hold)):5;
  commitEdit();
}
function updateCue(){
  const c=activeCue.value;if(!c)return;
  const before=snapshotScene();
  c.effect=effect.value;c.color=color.value;c.speed=speed.value;c.targetIds=captureCueTargets();
  for(const layer of activeLayers.value)if(layer.cueId===c.id){
    layer.effect=c.effect;layer.color=c.color;layer.mode=c.mode;layer.speed=c.speed;
    layer.targetIds=[...c.targetIds];layer.fade=c.fade;
  }
  rememberScene(before);
}
function moveActiveCue(direction:-1|1){
  const from=activeIndex.value,to=from+direction;
  if(to<0||to>=cues.value.length)return;
  const before=snapshotScene();
  const [cue]=cues.value.splice(from,1);cues.value.splice(to,0,cue);
  activeIndex.value=to;rememberScene(before);
}
function removeActiveCue(){
  if(cues.value.length<=1)return;
  const before=snapshotScene(),i=activeIndex.value;
  const [removed]=cues.value.splice(i,1);
  stopCue(removed.id);activeIndex.value=Math.min(i,cues.value.length-1);
  rememberScene(before);
}
function resetClock(){
  showTime=0;showSeconds.value=0;fadeStarted.value=0;fadeSeconds.value=0;
  activeLayers.value=[];autoNextTime=Infinity;blackout.value=true;
  running.value=false;lastFrame=0;
}
function addFixture() {
  const before=snapshotScene();
  const i=fixtures.value.length+1;
  const id='s'+crypto.randomUUID();
  fixtures.value.push({id,name:'STRIP / '+String(i).padStart(2,'0'),pixels:120,length:2,x:0,y:1.2,z:i*0.28,angle:0,format:'RGB',group:current.value.group,visible:true,locked:false,chip:'WS2815',density:60,tint:'#ffffff'});
  selectedId.value=id;selectedIds.value=[id];
  rememberScene(before);
}
function exportPixelCsv() {
  if(totalPixels.value>100000){alert('Pixel export limited to 100,000 virtual LEDs');return;}
  try {
    const csv=virtualPixelRows(fixtures.value.map(f=>sanitizeFixture(f)));
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download='fluxcue-virtual-3d-pixel-map.csv';
    anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  } catch(error){alert('Pixel CSV export failed: '+String(error));}
}
function saveProject() {
  persistLocal();
  const blob=new Blob([JSON.stringify(JSON.parse(stringifyStudioProject(serializableProject())),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download='fluxcue-demo.json';anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function loadProject(event:Event){
  const input=event.target as HTMLInputElement;
  const file=input.files?.[0];if(!file)return;
  if(file.size>2_000_000){alert('File too large (max 2MB)');input.value='';return;}
  file.text().then(raw=>{
    const p=parseStudioProject(raw);
    // Atomic replacement only after every fixture and cue passed validation.
    fixtures.value=p.fixtures as Fixture[];
    cues.value=p.cues as Cue[];
    selectedId.value=p.selectedId;selectedIds.value=p.selectedIds;
    activeIndex.value=p.activeIndex;collapsedGroups.value=p.collapsedGroups;
    speed.value=p.speed;brightness.value=p.brightness;autoPlay.value=p.autoPlay;
    activeLayers.value=[];showTime=0;showSeconds.value=0;autoNextTime=Infinity;blackout.value=false;
    undoStack.value=[];redoStack.value=[];editStart=null;
    effect.value=cues.value[activeIndex.value]?.effect || 'solid';
    color.value=cues.value[activeIndex.value]?.color || '#ffffff';
    scheduleSave();
  }).catch(err=>alert('Import refused, previous project preserved: '+String(err))).finally(()=>{input.value='';});
}
function finishTransformDrag(){
  if(!dragStart)return;
  transforming=false;controls.enabled=true;
  rememberScene(dragStart);
  dragStart=null;dragPivot=null;dragBaseline=[];
  syncTransform();
}
function onKey(e: KeyboardEvent) {
  const target=e.target as HTMLElement|null;
  if (!target || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName)||target.isContentEditable)return;
  if (e.ctrlKey||e.metaKey) {
    if (e.code==='KeyZ'){e.preventDefault();e.shiftKey?redoEdit():undoEdit();}
    else if (e.code==='KeyY'){e.preventDefault();redoEdit();}
    else if (e.code==='KeyS'){e.preventDefault();saveProject();}
    else if (e.code==='KeyA'){e.preventDefault();selectAll();}
    else if (e.code==='KeyD'){e.preventDefault();addDuplicate();}
    return;
  }
  if (e.code==='Escape'){contextMenu.value.visible=false;return;}
  if (e.altKey||transforming)return;
  if (e.code==='Space'){e.preventDefault();running.value=!running.value;}
  if (e.code==='KeyG' && !e.shiftKey){e.preventDefault();applyCue((activeIndex.value+1)%cues.value.length);}
  if (e.code==='KeyG' && e.shiftKey){e.preventDefault();applyCue(Math.max(0,activeIndex.value-1));}
  if (e.code==='KeyM'){e.preventDefault();toolMode.value='translate';}
  if (e.code==='KeyR'){e.preventDefault();toolMode.value='rotate';}
  if (e.code==='KeyS'){e.preventDefault();toolMode.value='scale';}
  if (e.code==='KeyF'){e.preventDefault();setView('ISO');}
  if (e.code==='Digit1'){setView('FRONT');}
  if (e.code==='Digit2'){setView('TOP');}
  if (e.code==='Digit3'){setView('RIGHT');}
  if (e.code==='Delete'){e.preventDefault();deleteFixture();}
}
onMounted(()=>{
  restoreLocal();hydrated=true;
  scene=new THREE.Scene();scene.background=new THREE.Color('#070707');
  camera=new THREE.PerspectiveCamera(48,1,0.02,1000);camera.position.set(7,4.7,8);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  viewport.value!.appendChild(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,1.35,0);controls.enableDamping=true;controls.dampingFactor=0.065;controls.update();
  updateGrid();
  scene.add(new THREE.AxesHelper(0.65));
  const bounds=new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-3,0,-2),new THREE.Vector3(3,3.1,2)),'#383838');
  scene.add(bounds);
  pixelGeometry=new THREE.SphereGeometry(0.038,7,5);
  transformProxy=new THREE.Object3D();scene.add(transformProxy);
  transform=new TransformControls(camera,renderer.domElement);
  scene.add(transform.getHelper());
  updateTransformOptions();
  transform.addEventListener('mouseDown',()=>{
    controls.enabled=false;transforming=true;suppressSceneClick=true;
    dragStart=snapshotScene();
    dragBaseline=dragStart.fixtures.map(f=>({...f}));
    dragPivot=selectionPivot(editableFixtures(dragBaseline,selectedIds.value));
  });
  transform.addEventListener('objectChange',()=>{
    if(!dragPivot || !dragBaseline.length)return;
    const delta={x:transformProxy.position.x-dragPivot.x,
      y:transformProxy.position.y-dragPivot.y,z:transformProxy.position.z-dragPivot.z};
    const degrees=transformProxy.rotation.z*180/Math.PI;
    try {
      const modified=toolMode.value==='scale'
        ?scaleSelected(dragBaseline,selectedIds.value,dragPivot,Math.max(.01,transformProxy.scale.x))
        :transformGroup(dragBaseline,selectedIds.value,dragPivot,
          toolMode.value==='translate'?delta:{x:0,y:0,z:0},
          toolMode.value==='rotate'?degrees:0);
      const byId=new Map<string,Fixture>(modified.map((f: Fixture)=>[f.id,f]));
      for(const f of fixtures.value){
        const next=byId.get(f.id);
        if(next){f.x=next.x;f.y=next.y;f.z=next.z;f.angle=next.angle;f.length=next.length;f.pixels=next.pixels;}
      }
      updateGridAnchor();
    } catch { /* Ignore transient out-of-bounds pointer input; no scene state is written. */ }
  });
  transform.addEventListener('mouseUp',finishTransformDrag);
  window.addEventListener('pointerup',finishTransformDrag);
  window.addEventListener('pointercancel',finishTransformDrag);
  window.addEventListener('blur',finishTransformDrag);
  renderer.domElement.addEventListener('click',onSceneClick);
  renderer.domElement.addEventListener('contextmenu',onSceneContextMenu);
  document.addEventListener('pointerdown',onOutsideMenu);
  rebuildScene();syncTransform();resize();sizeObserver=new ResizeObserver(resize);sizeObserver.observe(viewport.value!);
  frameSampleAt=performance.now();raf=requestAnimationFrame(frame);
  window.addEventListener('keydown',onKey);
  window.addEventListener('beforeunload',persistLocal);
});
onUnmounted(()=>{
  persistLocal();
  if(saveTimer)clearTimeout(saveTimer);
  cancelAnimationFrame(raf);sizeObserver?.disconnect();window.removeEventListener('keydown',onKey);
  window.removeEventListener('beforeunload',persistLocal);
  window.removeEventListener('pointerup',finishTransformDrag);
  window.removeEventListener('pointercancel',finishTransformDrag);
  window.removeEventListener('blur',finishTransformDrag);
  renderer?.domElement.removeEventListener('click',onSceneClick);
  renderer?.domElement.removeEventListener('contextmenu',onSceneContextMenu);
  document.removeEventListener('pointerdown',onOutsideMenu);
  transform?.detach();transform?.dispose();
  if (grid){scene.remove(grid);grid.geometry.dispose();(grid.material as THREE.Material).dispose();}
  if (coarseGrid){scene.remove(coarseGrid);coarseGrid.geometry.dispose();(coarseGrid.material as THREE.Material).dispose();}
  if (scene)disposeStrips();
  pixelGeometry?.dispose();controls?.dispose();renderer?.dispose();renderer?.domElement.remove();
});
watch(()=>fixtures.value.map(f=>[f.id,f.pixels,f.length,f.x,f.y,f.z,f.angle,f.visible,f.locked].join(':')).join('|'),()=>{rebuildScene();syncTransform();});
watch([selectedId,selectedIds],()=>{rebuildScene();syncTransform();});
watch([toolMode,positionSnap,angleSnap],updateTransformOptions);
watch([positionSnap,showGrid],updateGrid);
watch([fixtures,cues,selectedId,selectedIds,activeIndex,collapsedGroups,collapsedPanels,autoPlay,speed,brightness,activeLayers,running,blackout],scheduleSave,{deep:true});
</script>

<template>
  <div class="shell">
    <header class="top">
      <div class="brand"><span class="brand-mark">F</span><b>FLUXCUE</b><span class="studio-tag">STUDIO <small>0.1 ALPHA</small></span></div>
      <div class="top-center"><span class="project-name">DEMO INSTALLATION</span><span class="separator"></span><span class="muted">SHOW A</span></div>
      <div class="top-tools"><span class="save-status" :class="{error:saveState==='ERROR'}" :title="saveState==='ERROR'?'Browser storage error: export a JSON backup':'Autosaved only in this browser'">● {{saveState==='PENDING'?'SAVING…':saveState==='RECOVERED'?'RESTORED':saveState==='ERROR'?'SAVE ERROR':saveState==='READY'?'LOCAL READY':'LOCAL SAVED'}}</span><span class="pill simulate">● SIMULATOR</span><button class="top-button" title="Export project JSON" @click="saveProject">BACKUP JSON</button><label class="top-button import">IMPORT<input accept=".json,application/json" type="file" @change="loadProject"/></label></div>
    </header>
    <div class="workspace">
      <aside class="sidebar left">
        <div class="panel-title"><span>SCENE / PATCH</span><span class="mono muted">01</span></div>
        <div class="search"><span>⌕ FIXTURES · {{fixtures.length}}</span><div class="group-actions"><button @click="collapseAllGroups" title="Collapse all groups">COLLAPSE</button><button @click="expandAllGroups" title="Expand all groups">EXPAND</button></div></div>
        <div class="tree-heading">⌄ &nbsp; DEMO INSTALLATION <span class="site-dot"></span></div>
        <template v-for="group in fixtureGroups" :key="group">
          <div class="group-header">
            <button class="group-toggle" @click="toggleGroup(group)" :aria-expanded="!collapsedGroups.includes(group)" :title="collapsedGroups.includes(group)?'Expand group':'Collapse group'">{{collapsedGroups.includes(group)?'▸':'▾'}} &nbsp; /</button>
            <input v-if="editingGroup===group" v-model="groupNameDraft" class="group-rename-input" maxlength="40" aria-label="Rename group" @keydown.enter="commitGroupRename" @keydown.esc="editingGroup=null" @blur="commitGroupRename"/>
            <button v-else class="group-name" @click="selectGroupByName(group)" :title="'Select all strips in '+group">{{group}}</button>
            <button class="group-rename" title="Rename group" @click="startGroupRename(group)">✎</button>
          </div>
          <button v-if="!collapsedGroups.includes(group)" v-for="f in fixtures.filter(item=>(item.group?.trim()||'STAGE')===group)" :key="f.id" class="tree-item"
            :class="{selected:selectedIds.includes(f.id),primary:selectedId===f.id,hidden:!f.visible}"
            @click="selectFixture(f.id,$event.ctrlKey||$event.metaKey,$event.shiftKey)"
            @contextmenu.prevent="openMenu($event,f.id)">
            <span class="fixture-mark"></span><span class="fixture-name">{{ f.name }}</span>
            <small>{{ f.locked?'LOCK · ':'' }}{{ f.visible?'':'HIDE · ' }}{{ f.pixels }}px</small>
          </button>
        </template>
        <div class="selection-toolbar"><b>{{ selectionCount }} SELECTED</b>
          <button @click="selectAll" title="Select all (Ctrl+A)">ALL</button>
          <button @click="selectInverse" title="Invert selection">INVERT</button>
          <button @click="selectGroup" title="Select active group">GROUP</button>
        </div>
        <button class="add-entity" @click="addFixture">＋ ADD LED STRIP</button>
        <button class="section-collapse" @click="togglePanel('arrays')" :aria-expanded="!collapsedPanels.arrays">{{collapsedPanels.arrays?'▸':'▾'}} PARAMETRIC LED ARRAY</button>
        <div v-if="!collapsedPanels.arrays" class="layout-builder">
          <span>PARAMETRIC LED ARRAY</span>
          <select aria-label="Array layout" v-model="layoutType"><option>ROW X</option><option>ROW Z</option><option>RING XY</option></select>
          <div><label>COUNT <input type="number" v-model.number="layoutCount" min="2" max="32" step="1"/></label>
            <label>STEP m <input type="number" v-model.number="layoutSpacing" min=".05" max="10" step=".05"/></label></div>
          <button @click="generateLayout" :disabled="fixtures.length>498">＋ GENERATE & SELECT</button>
        </div>
        <button class="export-pixel-map" :disabled="totalPixels>100000" @click="exportPixelCsv" title="Download an offline CSV of every LED world position and virtual DMX slots">↓ PIXEL MAP CSV</button>
        <div class="sidebar-bottom">
          <button class="section-collapse" @click="togglePanel('patch')" :aria-expanded="!collapsedPanels.patch">{{collapsedPanels.patch?'▸':'▾'}} OUTPUT PATCH <span class="dim-label">SIM</span></button>
          <template v-if="!collapsedPanels.patch"><div class="metric-row"><span>Pixel count</span><b>{{ totalPixels }}</b></div>
          <div class="metric-row"><span>Virtual universes</span><b>{{ totalUniverses }}</b></div>
          <div class="metric-row"><span>Protocol</span><b class="accent-text">OFFLINE</b></div>
          <div class="panel-note">No Art-Net or sACN network packets are sent in this prototype.</div></template>
        </div>
      </aside>
      <main class="main">
        <div class="viewport-head">
          <span>◈ &nbsp; 3D EDITOR <small class="selection-counter"> / {{selectionCount}} SELECTED</small></span>
          <div class="viewport-head-actions"><button title="Isometric focus (F)" @click="setView('ISO')">ISO</button><button title="Front (1)" @click="setView('FRONT')">FRONT</button><button title="Top (2)" @click="setView('TOP')">TOP</button><button title="Right (3)" @click="setView('RIGHT')">RIGHT</button></div>
        </div>
        <div class="editor-tools">
          <button :class="{active:toolMode==='translate'}" title="Move selected LED strip (M)" @click="toolMode='translate'">✥ MOVE <kbd>M</kbd></button>
          <button :class="{active:toolMode==='rotate'}" title="Rotate selected LED strip (R)" @click="toolMode='rotate'">◌ ROTATE <kbd>R</kbd></button>
          <button :class="{active:toolMode==='scale'}" title="Scale selected LED strip (S)" @click="toolMode='scale'">⬔ SCALE <kbd>S</kbd></button>
          <span class="tool-separator"></span>
          <label>GRID SNAP <select v-model.number="positionSnap" title="Translation snap in meters">
            <option :value="0">FREE</option><option :value="0.01">1 cm</option><option :value="0.05">5 cm</option><option :value="0.1">10 cm</option><option :value="0.25">25 cm</option><option :value="0.5">50 cm</option><option :value="1">1 m</option>
          </select></label>
          <label>ANGLE <select v-model.number="angleSnap" title="Rotation snap">
            <option :value="0">FREE</option><option :value="1">1°</option><option :value="5">5°</option><option :value="15">15°</option><option :value="30">30°</option><option :value="45">45°</option><option :value="90">90°</option>
          </select></label>
          <label class="grid-checkbox"><input type="checkbox" v-model="showGrid"/> GRID</label>
          <span class="tool-separator"></span>
          <button title="Undo (Ctrl+Z)" :disabled="!undoStack.length" @click="undoEdit">↶ UNDO</button>
          <button title="Redo (Ctrl+Shift+Z)" :disabled="!redoStack.length" @click="redoEdit">↷ REDO</button>
        </div>
        <div class="viewport" ref="viewport">
          <div class="viewport-overlay"><b>3D TRANSFORM</b><span>CTRL/SHIFT + CLICK MULTI SELECT · RIGHT CLICK MENU · DRAG GROUP GIZMO</span></div>
          <div class="viewport-details">Z UP? <b>Y UP</b> &nbsp; · &nbsp; <b>{{ totalPixels }}</b> LEDS</div>
          <div class="viewport-axis">X <span>Y</span> Z</div>
        </div>
        <section class="cue-panel" :class="{compact:collapsedPanels.cues}">
          <div class="cue-toolbar"><button class="cue-collapse" @click="togglePanel('cues')" :aria-expanded="!collapsedPanels.cues">{{collapsedPanels.cues?'▸':'▾'}} CUE STACK <small>{{cues.length}} CUES / {{activeLayers.length}} RUNNING</small></button><span class="muted">INDEPENDENT LAYERS · SIM</span></div>
          <div v-if="!collapsedPanels.cues" class="cue-content">
            <div class="transport">
              <button class="transport-btn" @click="applyCue(Math.max(0,activeIndex-1))">← BACK</button>
              <button class="transport-btn" @click="running=!running">{{running?'Ⅱ PAUSE':'▶ PLAY'}}</button>
              <button class="go-btn" @click="applyCue((activeIndex+1)%cues.length)">GO →</button>
              <button class="transport-btn" :class="{autoactive:autoPlay}" @click="toggleAutoPlay">AUTO {{autoPlay?autoplayCountdown:'OFF'}}</button>
              <button class="transport-btn danger" @click="stopAllCues">■ STOP ALL</button>
              <span class="clock mono">{{timeLabel}}</span>
              <button class="transport-btn reset-clock" @click="resetClock">↺ RESET</button>
            </div>
            <div class="cue-fade-bar" role="progressbar" :aria-valuenow="Math.round(fadeProgress*100)" aria-valuemin="0" aria-valuemax="100" aria-label="Active cue transition progress"><span :style="{width:(fadeProgress*100)+'%'}"></span></div>
            <div class="cue-list">
              <div v-for="(c,i) in cues" :key="c.id" class="cue-row" :class="{playing:activeIndex===i,layerOn:runningCueIds.has(c.id)}">
                <button class="cue-select" @click="applyCue(i)" :title="'GO '+c.name">
                  <span class="cue-number">{{String(i+1).padStart(2,'0')}}</span><span class="cue-caret">{{runningCueIds.has(c.id)?'●':'·'}}</span>
                  <span class="cue-name">{{c.name}}</span><span class="cue-effect">{{c.effect.toUpperCase()}}</span>
                  <span class="cue-fade">{{Number(c.fade).toFixed(1)}}s</span>
                  <span class="cue-target">{{c.targetIds.length?c.targetIds.length+' LED STRIPS':'ALL'}}</span>
                </button>
                <button v-if="runningCueIds.has(c.id)" class="cue-stop" :title="'Stop only '+c.name" @click="stopCue(c.id)">■</button>
              </div>
            </div>
            <div class="cue-edit">
              <label class="cue-edit-name">CUE <input aria-label="Cue name" v-model="activeCue.name" maxlength="100" @focus="beginEdit" @change="commitEdit"/></label>
              <label class="cue-edit-fade">FADE <input aria-label="Fade seconds" v-model.number="activeCue.fade" type="number" min="0" max="120" step=".1" @focus="beginEdit" @change="normalizeCue"/></label>
              <label class="cue-edit-fade">HOLD <input aria-label="Autoplay hold seconds" v-model.number="activeCue.hold" type="number" min=".1" max="3600" step=".5" @focus="beginEdit" @change="normalizeCue"/></label>
              <label class="cue-edit-fade">MIX <select v-model="activeCue.mode" @focus="beginEdit" @change="commitEdit"><option>ADD</option><option>REPLACE</option></select></label>
              <button class="cue-edit-button" :disabled="activeIndex===0" @click="moveActiveCue(-1)">↑</button>
              <button class="cue-edit-button" :disabled="activeIndex===cues.length-1" @click="moveActiveCue(1)">↓</button>
              <button class="cue-edit-button danger" :disabled="cues.length<2" @click="removeActiveCue">✕</button>
            </div>
            <div class="cue-actions">
              <label>TARGET <select v-model="cueTargetMode"><option value="SELECTION">SELECTED FIXTURES</option><option value="ALL">ALL FIXTURES</option></select></label>
              <span class="cue-hint">CUE DRAFT FX + COLOR →</span>
              <button class="cue-update" @click="updateCue" title="Overwrite selected cue's effect/color/targets, without stopping other running cues">↻ UPDATE CUE</button>
              <button class="cue-new" @click="addCue">＋ NEW CUE</button>
            </div>
          </div>
        </section>
      </main>
      <aside class="sidebar inspector">
        <div class="panel-title">INSPECTOR <span class="muted">01</span></div>
        <div class="inspector-heading"><span class="fixture-mark"></span>
          <input aria-label="Fixture name" class="fixture-name-input" v-model="current.name" maxlength="100" @focus="beginEdit" @change="commitEdit" />
          <span class="select-total">{{selectionCount}}</span></div>
        <div class="multi-description" v-if="selectionCount>1">GROUP TRANSFORM · {{editableCount}} movable · {{selectionCount-editableCount}} locked/hidden</div>
        <div class="inspector-actions">
          <button title="Duplicate selected strip" @click="addDuplicate">⊞ DUPLICATE</button>
          <button title="Delete selected unlocked strips" :disabled="fixtures.length<=1||!selectedFixtures.some(f=>!f.locked)" @click="deleteFixture">✕ DELETE</button>
        </div>
        <div class="inspector-switches">
          <label><input type="checkbox" :checked="current.visible" @change="toggleSelectedVisibility" /> VISIBLE</label>
          <label><input type="checkbox" :checked="current.locked" @change="toggleSelectedLock" /> LOCK</label>
        </div>
        <label class="field"><span>Group</span><input class="group-input" v-model="current.group" maxlength="40" @focus="beginEdit" @change="normalizeCurrent" @blur="commitEdit"/></label>
        <div class="multi-ops">
          <label>GROUP SELECTED <input v-model="bulkGroup" maxlength="40" aria-label="Batch group name" /></label>
          <button @click="applyBulkGroup" :disabled="!editableCount">APPLY</button>
        </div>
        <div class="multi-align"><span>ALIGN TO ACTIVE</span>
          <button :disabled="selectionCount<2" @click="alignSelected('x')">X</button>
          <button :disabled="selectionCount<2" @click="alignSelected('y')">Y</button>
          <button :disabled="selectionCount<2" @click="alignSelected('z')">Z</button>
        </div>
        <button class="section-collapse inspector-section" @click="togglePanel('geometry')" :aria-expanded="!collapsedPanels.geometry">{{collapsedPanels.geometry?'▸':'▾'}} GEOMETRY / FIXTURE</button>
        <template v-if="!collapsedPanels.geometry">
        <label class="field"><span>Length</span><div class="control"><input v-model.number="current.length" type="range" min="0.2" max="10" step="0.1" :disabled="current.locked" @focus="beginEdit" @change="normalizeCurrent" @blur="commitEdit"/><input v-model.number="current.length" class="num" type="number" min="0.1" max="100" step="0.1" :disabled="current.locked" @focus="beginEdit" @change="normalizeCurrent" @blur="commitEdit"/><em>m</em></div></label>
        <label class="field"><span>LED / metre</span><div class="control">
            <select class="density-preset" title="Common strip LED density" :value="DENSITY_PRESETS.includes(current.density)?current.density:'custom'" @change="changeDensity"><option v-for="d in DENSITY_PRESETS" :key="d" :value="d">{{d}} LED/m</option><option value="custom" disabled>CUSTOM</option></select>
            <input :value="current.density" class="num" aria-label="Custom LEDs per meter" type="number" min="1" max="600" step="1" :disabled="current.locked" @change="changeDensity"/>
          </div></label>
        <label class="field"><span>Pixels total</span><b class="value mono">{{current.pixels}} px</b></label>
        <label class="field"><span>LED chip</span><select :value="current.chip" :disabled="current.locked" @change="chooseChip"><option v-for="profile in CHIP_PROFILES" :key="profile.id" :value="profile.id">{{profile.label}}</option></select></label>
        <label class="field"><span>Pixel channels</span><b class="value">{{current.format}}</b></label>
        <label class="field"><span>Position Y</span><input v-model.number="current.y" type="number" step="0.01" class="number-wide" :disabled="current.locked" @focus="beginEdit" @change="normalizeCurrent" @blur="commitEdit"/></label>
        <label class="field"><span>Position X</span><input v-model.number="current.x" type="number" step="0.01" class="number-wide" :disabled="current.locked" @focus="beginEdit" @change="normalizeCurrent" @blur="commitEdit"/></label>
        <label class="field"><span>Position Z</span><input v-model.number="current.z" type="number" step="0.01" class="number-wide" :disabled="current.locked" @focus="beginEdit" @change="normalizeCurrent" @blur="commitEdit"/></label>
        <label class="field"><span>Angle Z</span><input v-model.number="current.angle" type="number" step="1" class="number-wide" :disabled="current.locked" @focus="beginEdit" @change="normalizeCurrent" @blur="commitEdit"/></label>
        <div class="panel-note">Drag move / rotate / scale gizmos. Strip pixel count derives from length × density.</div></template>
        <button class="section-collapse inspector-section" @click="togglePanel('effects')" :aria-expanded="!collapsedPanels.effects">{{collapsedPanels.effects?'▸':'▾'}} CUE DRAFT / COLOUR</button>
        <template v-if="!collapsedPanels.effects">
        <label class="field"><span>Pattern</span><select v-model="effect"><option value="solid">Solid Color</option><option value="rainbow">Rainbow Flow</option><option value="chase">Chase / Trail</option><option value="gradient">Strip Gradient</option><option value="spatial-wave">World-space Wave</option><option value="spatial-blocks">3D Blocks</option></select></label>
        <label class="field"><span>Selected LED filter</span><div class="control"><input type="color" :value="current.tint" @input="paintSelection" @change="commitEdit"/><b class="hex mono">{{current.tint.toUpperCase()}}</b></div></label>
        <label class="field"><span>Cue draft color</span><div class="control"><input v-model="color" type="color"/><b class="hex mono">{{color.toUpperCase()}}</b></div></label>
        <label class="field"><span>Speed</span><div class="control"><input v-model.number="speed" type="range" min="0" max="3" step="0.01"/><span class="value">{{ speed.toFixed(2) }}</span></div></label>
        <label class="field"><span>Brightness</span><div class="control"><input v-model.number="brightness" type="range" min="0" max="1" step="0.01"/><span class="value">{{ Math.round(brightness*100) }}%</span></div></label>
        </template><button class="section-collapse inspector-section" @click="togglePanel('pixel')" :aria-expanded="!collapsedPanels.pixel">{{collapsedPanels.pixel?'▸':'▾'}} PIXEL / VIRTUAL PATCH</button>
        <template v-if="!collapsedPanels.pixel">
        <div class="section-label">PATCH INFORMATION</div>
        <div class="metric-row"><span>Channels required</span><b>{{ patch.channels }}</b></div>
        <div class="metric-row"><span>Virtual universes</span><b>{{ patch.universesUsed }}</b></div>
        <div class="section-label">PIXEL INSPECT / WORLD SPACE</div>
        <label class="field"><span>Index</span><div class="control"><input type="range" v-model.number="pixelFocus" :max="Math.max(0,sanitizeFixture(current).pixels-1)" min="0" step="1"/><input type="number" class="num" v-model.number="pixelFocus" min="0" :max="Math.max(0,sanitizeFixture(current).pixels-1)" step="1"/></div></label>
        <div class="metric-row"><span>World XYZ (m)</span><b>{{focusedPixel.x.toFixed(3)}}, {{focusedPixel.y.toFixed(3)}}, {{focusedPixel.z.toFixed(3)}}</b></div>
        <div class="metric-row"><span>Virtual universe offset</span><b>{{focusedAddress?.universeOffset ?? '—'}}</b></div>
        <div class="metric-row"><span>Virtual slot (1-512)</span><b>{{focusedAddress?.slot ?? '—'}}</b></div>
        <div class="panel-note">All pixel coordinates are in meters. The CSV and channel addresses are simulated fixture-local data, not a physical controller patch.</div></template>
      </aside>
    </div>
    <footer class="status"><span class="live-dot"></span><span>PREVIEW ENGINE</span><span class="separator"></span><span><b>{{ fps||'—' }}</b> FPS</span><span class="separator"></span><span>{{ totalPixels }} PIXELS</span><div class="status-spacer"></div><span>OUTPUT DISABLED</span><span class="separator"></span><span>3D: {{ toolMode.toUpperCase() }} · {{ positionSnap ? positionSnap+'m' : 'FREE' }}</span><span class="separator"></span><span>NO SERVER</span><span class="version">FLUXCUE / V0.1</span></footer>
    <div v-if="contextMenu.visible" class="scene-context-menu" role="menu"
      :style="{left:contextMenu.x+'px',top:contextMenu.y+'px'}" @contextmenu.prevent>
      <div class="context-title">{{selectionCount}} FIXTURE{{selectionCount===1?'':'S'}} SELECTED</div>
      <button @click="selectAll">SELECT ALL <kbd>Ctrl+A</kbd></button>
      <button @click="selectGroup">SELECT GROUP</button>
      <button @click="selectInverse">INVERT SELECTION</button>
      <div class="context-rule"></div>
      <button @click="toolMode='translate';contextMenu.visible=false">MOVE <kbd>M</kbd></button>
      <button @click="toolMode='rotate';contextMenu.visible=false">ROTATE <kbd>R</kbd></button>
      <button @click="addDuplicate">DUPLICATE <kbd>Ctrl+D</kbd></button>
      <button @click="setSelectedVisibility(false)">HIDE</button>
      <button @click="setSelectedVisibility(true)">SHOW</button>
      <button @click="setSelectedLock(true)">LOCK</button>
      <button @click="setSelectedLock(false)">UNLOCK</button>
      <div class="context-rule"></div>
      <button class="context-danger" @click="deleteFixture">DELETE <kbd>Del</kbd></button>
    </div>
  </div>
</template>
