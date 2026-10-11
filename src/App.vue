<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { describePatch } from './core/patch.mjs';
import { fadeFactor, blendChannel, advancePreviewClock } from './core/cue-engine.mjs';

type Fx = 'solid' | 'rainbow' | 'chase' | 'gradient';
type Fixture = { id: string; name: string; pixels: number; length: number; x: number; y: number; z: number; angle: number; format: 'RGB' | 'RGBW' };
type Cue = { id: string; name: string; effect: Fx; fade: number; color: string };
const fixtures = ref<Fixture[]>([
  { id:'s1',name:'STAGE / TOP',pixels:120,length:4,x:0,y:2.7,z:-1.3,angle:0,format:'RGB' },
  { id:'s2',name:'LEFT / VERTICAL',pixels:70,length:2.5,x:-2.3,y:1.45,z:0,angle:90,format:'RGB' },
  { id:'s3',name:'RIGHT / VERTICAL',pixels:70,length:2.5,x:2.3,y:1.45,z:0,angle:90,format:'RGB' },
  { id:'s4',name:'FLOOR / FRONT',pixels:150,length:5,x:0,y:0.1,z:1.5,angle:0,format:'RGB' }
]);
const cues = ref<Cue[]>([
  { id:'c1', name:'01 · INIT / WHITE', effect:'solid',fade:0.4,color:'#bfc8e5' },
  { id:'c2', name:'02 · CHROMA FLOW',effect:'rainbow',fade:2,color:'#79b8ff' },
  { id:'c3', name:'03 · PULSE / CHASE',effect:'chase',fade:1.2,color:'#ff835e' },
  { id:'c4', name:'04 · SOFT GRADIENT',effect:'gradient',fade:2,color:'#99a7ff' }
]);
const selectedId = ref('s1');
const current = computed(() => fixtures.value.find(f=>f.id===selectedId.value) ?? fixtures.value[0]);
const activeIndex = ref(1);
const activeCue = computed(() => cues.value[activeIndex.value] ?? cues.value[0]);
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
const patch = computed(() => describePatch(current.value.pixels, current.value.format));
const totalPixels = computed(() => fixtures.value.reduce((s,f)=>s+f.pixels,0));
const totalUniverses = computed(() => fixtures.value.reduce((s,f)=>s+describePatch(f.pixels,f.format).universesUsed,0));
const viewport = ref<HTMLElement|null>(null);
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls;
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
const gradientEnd = new THREE.Color('#1b72a7');
function resize() {
  if (!viewport.value || !renderer || !camera) return;
  const w = Math.max(1, viewport.value.clientWidth), h = Math.max(1, viewport.value.clientHeight);
  renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix();
}
function disposeStrips() {
  if (!scene) return;
  for (const mesh of strips.values()) { scene.remove(mesh); mesh.dispose(); }
  strips.clear();
}
function rebuildScene() {
  if (!scene || !pixelGeometry) return;
  disposeStrips();
  for (const f of fixtures.value) {
    const n = Math.max(1, Math.floor(f.pixels));
    const mat = new THREE.MeshBasicMaterial({ color:0xffffff });
    const mesh = new THREE.InstancedMesh(pixelGeometry, mat, n);
    const angle = f.angle * Math.PI/180;
    for (let i=0;i<n;i++) {
      const t = n<=1 ? 0 : (i/(n-1)-0.5)*f.length;
      dummy.position.set(f.x+Math.cos(angle)*t, f.y+Math.sin(angle)*t, f.z);
      dummy.scale.setScalar(f.id===selectedId.value ? 1.16 : 1);
      dummy.updateMatrix(); mesh.setMatrixAt(i,dummy.matrix);
      mesh.setColorAt(i,new THREE.Color(0x6688aa));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
    mesh.userData.fixtureId = f.id; scene.add(mesh); strips.set(f.id,mesh);
  }
}
function sampleFx(mode: Fx, hex: string, index: number, count: number, t: number, result: THREE.Color) {
  const p = count <= 1 ? 0 : index/(count-1);
  if (mode==='solid') return result.set(hex);
  if (mode==='rainbow') return result.setHSL((p - t*speed.value*0.22 + 1)%1,0.8,0.58);
  if (mode==='chase') {
    const trail = ((p-t*speed.value*0.45)%1+1)%1;
    return result.set(hex).multiplyScalar(Math.max(0.025,1-trail*3.6));
  }
  return result.set(hex).lerp(gradientEnd,(Math.sin(p*Math.PI*2-t*speed.value*1.5)+1)/2);
}
function sampleCurrentPixel(f: Fixture, index: number, count: number, time: number, output: THREE.Color): THREE.Color {
  sampleFx(effect.value,color.value,index,count,time,colorB);
  const start = fadeFrom.get(f.id);
  const blend = fadeFactor(time,fadeStarted.value,fadeSeconds.value);
  const slot = index * 3;
  if (start && slot+2<start.length && blend<1) {
    // Snapshots are pre-brightness, so changing brightness cannot apply it twice.
    return output.setRGB(
      blendChannel(start[slot],colorB.r,blend),
      blendChannel(start[slot+1],colorB.g,blend),
      blendChannel(start[slot+2],colorB.b,blend)
    );
  }
  return output.copy(colorB);
}
function captureLook(time: number): Map<string,Float32Array> {
  const snapshot = new Map<string,Float32Array>();
  for (const f of fixtures.value) {
    const count = Math.max(1,Math.floor(f.pixels));
    const values = new Float32Array(count*3);
    for (let i=0;i<count;i++) {
      sampleCurrentPixel(f,i,count,time,tmp);
      values[i*3]=tmp.r; values[i*3+1]=tmp.g; values[i*3+2]=tmp.b;
    }
    snapshot.set(f.id,values);
  }
  return snapshot;
}
function drawPixels() {
  for (const f of fixtures.value) {
    const mesh = strips.get(f.id);
    if (!mesh) continue;
    for (let i=0;i<mesh.count;i++) {
      sampleCurrentPixel(f,i,mesh.count,showTime,tmp);
      mesh.setColorAt(i,tmp.multiplyScalar(brightness.value));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
  if (fadeSeconds.value && fadeFactor(showTime,fadeStarted.value,fadeSeconds.value)===1) {
    fadeFrom.clear(); fadeSeconds.value=0;
  }
}
function frame(now: number) {
  raf=requestAnimationFrame(frame);
  const dt=lastFrame ? Math.max(0,(now-lastFrame)/1000):0;
  lastFrame=now;
  showTime=advancePreviewClock(showTime,dt,running.value);
  if (now-lastUiFrame>75) { showSeconds.value=showTime; lastUiFrame=now; }
  drawPixels(); controls.update(); renderer.render(scene,camera);
  frameCount++;
  if (now-frameSampleAt>1000) {fps.value=Math.round(frameCount*1000/(now-frameSampleAt)); frameSampleAt=now;frameCount=0;}
}
function applyCue(index: number) {
  if (index<0||index>=cues.value.length) return;
  const c=cues.value[index];
  const fade = Number.isFinite(c.fade) ? Math.max(0,Math.min(120,c.fade)) : 0;
  // Capture at the exact logical start time, even if this event interrupts another fade.
  fadeFrom = fade>0 ? captureLook(showTime) : new Map();
  effect.value=c.effect;
  color.value=c.color;
  fadeStarted.value=showTime;
  fadeSeconds.value=fade;
  activeIndex.value=index;
  showSeconds.value=showTime;
  running.value=true;
}
function addCue() {
  cues.value.push({id:'c'+Date.now().toString(36),name:String(cues.value.length+1).padStart(2,'0')+' · NEW CUE',effect:effect.value,fade:1,color:color.value});
}
function moveActiveCue(direction: -1 | 1) {
  const from=activeIndex.value;
  const to=from+direction;
  if (to<0||to>=cues.value.length)return;
  const [selected]=cues.value.splice(from,1);
  cues.value.splice(to,0,selected);
  activeIndex.value=to;
}
function removeActiveCue() {
  if (cues.value.length<=1)return;
  const index=activeIndex.value;
  cues.value.splice(index,1);
  // Keep the rendered scene consistent with the remaining active cue.
  applyCue(Math.min(index,cues.value.length-1));
}
function resetClock() {
  showTime=0;
  showSeconds.value=0;
  fadeStarted.value=0;
  fadeSeconds.value=0;
  fadeFrom.clear();
  running.value=false;
  lastFrame=0;
}
function addFixture() {
  const i=fixtures.value.length+1;
  const id='s'+Date.now().toString(36);
  fixtures.value.push({id,name:'STRIP / '+String(i).padStart(2,'0'),pixels:60,length:2,x:0,y:1.2,z:i*0.28,angle:0,format:'RGB'});
  selectedId.value=id;
}
function saveProject() {
  const data={schemaVersion:'0.1.0',project:{name:'FLUXCUE Demo'},fixtures:fixtures.value,cues:cues.value,selectedId:selectedId.value};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download='fluxcue-demo.json';anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function loadProject(event: Event) {
  const file=(event.target as HTMLInputElement).files?.[0];
  if (!file||file.size>2_000_000) { alert('Invalid or oversized project file (max 2MB)');return; }
  file.text().then(text=>{
    const data=JSON.parse(text);
    if (data.schemaVersion!=='0.1.0'||!Array.isArray(data.fixtures)||!Array.isArray(data.cues)||data.fixtures.length>500||data.cues.length>3000)throw new Error('Invalid project');
    const restored:Fixture[]=data.fixtures.map((f:Fixture)=>{
      if (!f||typeof f.id!=='string'||typeof f.name!=='string'||!Number.isInteger(f.pixels)||f.pixels<1||f.pixels>2000||!Number.isFinite(f.length)||f.length<=0||f.length>100||!['RGB','RGBW'].includes(f.format)||![f.x,f.y,f.z,f.angle].every(x=>Number.isFinite(x)))throw new Error('Invalid fixture');
      return {id:f.id.slice(0,80),name:f.name.slice(0,100),pixels:f.pixels,length:f.length,x:f.x,y:f.y,z:f.z,angle:f.angle,format:f.format};
    });
    const restoredCues:Cue[]=data.cues.map((c:Cue)=>{
      if (!c||typeof c.id!=='string'||typeof c.name!=='string'||!['solid','rainbow','chase','gradient'].includes(c.effect)||!Number.isFinite(c.fade)||c.fade<0||c.fade>120||typeof c.color!=='string'||!/^#[a-fA-F0-9]{6}$/.test(c.color))throw new Error('Invalid cue');
      return {id:c.id.slice(0,80),name:c.name.slice(0,100),effect:c.effect,fade:c.fade,color:c.color};
    });
    if (!restored.length)throw new Error('Project needs at least one fixture');
    if (!restoredCues.length)throw new Error('Project needs at least one cue');
    fixtures.value=restored;cues.value=restoredCues;selectedId.value=restored[0].id;resetClock();applyCue(0);
  }).catch(err=>alert('Import failed: '+String(err))).finally(()=>{(event.target as HTMLInputElement).value='';});
}
function onKey(e: KeyboardEvent) {
  const target=e.target as HTMLElement;
  if (['INPUT','TEXTAREA','SELECT'].includes(target.tagName)||target.isContentEditable||e.ctrlKey||e.metaKey||e.altKey)return;
  if (e.code==='Space'){e.preventDefault();running.value=!running.value;}
  if (e.code==='KeyG' && !e.shiftKey){e.preventDefault();applyCue((activeIndex.value+1)%cues.value.length);}
  if (e.code==='KeyG' && e.shiftKey){e.preventDefault();applyCue(Math.max(0,activeIndex.value-1));}
}
onMounted(()=>{
  scene=new THREE.Scene();scene.background=new THREE.Color('#10151d');
  camera=new THREE.PerspectiveCamera(48,1,0.02,1000);camera.position.set(7,4.7,8);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  viewport.value!.appendChild(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,1.35,0);controls.enableDamping=true;controls.dampingFactor=0.065;controls.update();
  scene.add(new THREE.GridHelper(14,28,'#35424f','#202a35'));
  scene.add(new THREE.AxesHelper(0.65));
  const bounds=new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-3,0,-2),new THREE.Vector3(3,3.1,2)),'#35404c');
  scene.add(bounds);
  pixelGeometry=new THREE.SphereGeometry(0.038,7,5);
  rebuildScene();resize();sizeObserver=new ResizeObserver(resize);sizeObserver.observe(viewport.value!);
  frameSampleAt=performance.now();raf=requestAnimationFrame(frame);
  window.addEventListener('keydown',onKey);
});
onUnmounted(()=>{
  cancelAnimationFrame(raf);sizeObserver?.disconnect();window.removeEventListener('keydown',onKey);
  if (scene) disposeStrips();pixelGeometry?.dispose();controls?.dispose();renderer?.dispose();renderer?.domElement.remove();
});
watch(fixtures,rebuildScene,{deep:true});
watch(selectedId,rebuildScene);
</script>

<template>
  <div class="shell">
    <header class="top">
      <div class="brand"><span class="brand-mark">F</span><b>FLUXCUE</b><span class="studio-tag">STUDIO <small>0.1 ALPHA</small></span></div>
      <div class="top-center"><span class="project-name">DEMO INSTALLATION</span><span class="separator"></span><span class="muted">SHOW A</span></div>
      <div class="top-tools"><span class="pill simulate">● SIMULATOR</span><button class="top-button" title="Export project JSON" @click="saveProject">EXPORT</button><label class="top-button import">IMPORT<input accept=".json,application/json" type="file" @change="loadProject"/></label></div>
    </header>
    <div class="workspace">
      <aside class="sidebar left">
        <div class="panel-title"><span>SCENE / PATCH</span><span class="mono muted">01</span></div>
        <div class="search">⌕ &nbsp; FIXTURES <span class="muted">{{ fixtures.length }}</span></div>
        <div class="tree-heading">⌄ &nbsp; DEMO INSTALLATION <span class="site-dot"></span></div>
        <div class="tree-group">⌄ &nbsp; / STAGE</div>
        <button v-for="f in fixtures" :key="f.id" class="tree-item" :class="{selected:selectedId===f.id}" @click="selectedId=f.id">
          <span class="fixture-mark"></span><span class="fixture-name">{{ f.name }}</span><small>{{ f.pixels }}px</small>
        </button>
        <button class="add-entity" @click="addFixture">＋ ADD LED STRIP</button>
        <div class="sidebar-bottom">
          <div class="panel-title">OUTPUT PATCH <span class="dim-label">SIM</span></div>
          <div class="metric-row"><span>Pixel count</span><b>{{ totalPixels }}</b></div>
          <div class="metric-row"><span>Virtual universes</span><b>{{ totalUniverses }}</b></div>
          <div class="metric-row"><span>Protocol</span><b class="accent-text">OFFLINE</b></div>
          <div class="panel-note">No Art-Net or sACN network packets are sent in this prototype.</div>
        </div>
      </aside>
      <main class="main">
        <div class="viewport-head"><span>◈ &nbsp; 3D STAGE VIEW</span><div><span class="muted">ORBIT · PAN · ZOOM</span><span class="pipe">│</span><b>PIXELS</b></div></div>
        <div class="viewport" ref="viewport">
          <div class="viewport-overlay"><b>PREVISUALIZATION</b><span>LIVE PREVIEW · SOFTWARE ONLY</span></div>
          <div class="viewport-details">Z UP? <b>Y UP</b> &nbsp; · &nbsp; <b>{{ totalPixels }}</b> LEDS</div>
          <div class="viewport-axis">X <span>Y</span> Z</div>
        </div>
        <section class="cue-panel">
          <div class="cue-toolbar"><div class="tabs"><button class="tab active">CUE STACK</button><button class="tab" disabled>EFFECT GRAPH · NEXT</button></div><span class="muted">SHOW A &nbsp; / &nbsp; {{ cues.length }} CUES</span></div>
          <div class="transport"><button class="transport-btn" @click="applyCue(Math.max(0,activeIndex-1))">← BACK</button><button class="transport-btn" @click="running=!running">{{ running?'Ⅱ PAUSE':'▶ PLAY' }}</button><button class="go-btn" @click="applyCue((activeIndex+1)%cues.length)">GO →</button><span class="clock mono">{{ timeLabel }}</span><button class="transport-btn reset-clock" title="Reset simulated show clock" @click="resetClock">↺ RESET</button><span class="muted transport-mode">CLOCK · SIMULATOR</span></div>
          <div class="cue-fade-bar" role="progressbar" :aria-valuenow="Math.round(fadeProgress*100)" aria-valuemin="0" aria-valuemax="100" aria-label="Active cue transition progress"><span :style="{ width: (fadeProgress*100)+'%' }"></span></div>
          <div class="cue-list"><button v-for="(c,i) in cues" :key="c.id" class="cue-row" :class="{playing:activeIndex===i}" @click="applyCue(i)">
            <span class="cue-number">{{ String(i+1).padStart(2,'0') }}</span><span class="cue-caret">{{ activeIndex===i?'▶':'·' }}</span><span class="cue-name">{{ c.name }}</span><span class="cue-effect">{{ c.effect.toUpperCase() }}</span><span class="cue-fade">{{ c.fade.toFixed(1) }}s</span>
          </button></div>
          <div class="cue-edit">
            <label class="cue-edit-name">CUE <input aria-label="Active cue name" v-model="activeCue.name" maxlength="100" /></label>
            <label class="cue-edit-fade">FADE <input aria-label="Active cue fade seconds" v-model.number="activeCue.fade" type="number" min="0" max="120" step="0.1" /><span>s</span></label>
            <button class="cue-edit-button" title="Move cue up" :disabled="activeIndex===0" @click="moveActiveCue(-1)">↑</button>
            <button class="cue-edit-button" title="Move cue down" :disabled="activeIndex===cues.length-1" @click="moveActiveCue(1)">↓</button>
            <button class="cue-edit-button danger" title="Remove active cue" :disabled="cues.length<2" @click="removeActiveCue">DELETE</button>
          </div>
          <button class="new-cue" @click="addCue">＋ NEW CUE FROM CURRENT LOOK</button>
        </section>
      </main>
      <aside class="sidebar inspector">
        <div class="panel-title">INSPECTOR <span class="muted">01</span></div>
        <div class="inspector-heading"><span class="fixture-mark"></span><b>{{ current.name }}</b></div>
        <div class="section-label">GEOMETRY / FIXTURE</div>
        <label class="field"><span>Length</span><div class="control"><input v-model.number="current.length" type="range" min="0.2" max="10" step="0.1"/><input v-model.number="current.length" class="num" type="number" min="0.1" max="100" step="0.1"/><em>m</em></div></label>
        <label class="field"><span>Pixel count</span><div class="control"><input v-model.number="current.pixels" type="range" min="1" max="600" step="1"/><input v-model.number="current.pixels" class="num" type="number" min="1" max="2000" step="1"/></div></label>
        <label class="field"><span>Channel format</span><select v-model="current.format"><option>RGB</option><option>RGBW</option></select></label>
        <label class="field"><span>Position Y</span><input v-model.number="current.y" type="number" step="0.1" class="number-wide"/></label>
        <label class="field"><span>Position X</span><input v-model.number="current.x" type="number" step="0.1" class="number-wide"/></label>
        <label class="field"><span>Angle</span><input v-model.number="current.angle" type="number" step="5" class="number-wide"/></label>
        <div class="section-label">EFFECT / PARAMETERS</div>
        <label class="field"><span>Pattern</span><select v-model="effect"><option value="solid">Solid Color</option><option value="rainbow">Rainbow Flow</option><option value="chase">Chase / Trail</option><option value="gradient">Spatial Gradient</option></select></label>
        <label class="field"><span>Color</span><div class="control"><input v-model="color" type="color"/><b class="hex mono">{{ color.toUpperCase() }}</b></div></label>
        <label class="field"><span>Speed</span><div class="control"><input v-model.number="speed" type="range" min="0" max="3" step="0.01"/><span class="value">{{ speed.toFixed(2) }}</span></div></label>
        <label class="field"><span>Brightness</span><div class="control"><input v-model.number="brightness" type="range" min="0" max="1" step="0.01"/><span class="value">{{ Math.round(brightness*100) }}%</span></div></label>
        <div class="section-label">PATCH INFORMATION</div>
        <div class="metric-row"><span>Channels required</span><b>{{ patch.channels }}</b></div>
        <div class="metric-row"><span>Virtual universes</span><b>{{ patch.universesUsed }}</b></div>
        <div class="panel-note">Selected fixture uses virtual channel allocation. Real controller mapping is not implemented.</div>
      </aside>
    </div>
    <footer class="status"><span class="live-dot"></span><span>PREVIEW ENGINE</span><span class="separator"></span><span><b>{{ fps||'—' }}</b> FPS</span><span class="separator"></span><span>{{ totalPixels }} PIXELS</span><div class="status-spacer"></div><span>OUTPUT DISABLED</span><span class="separator"></span><span>NO SERVER CONNECTED</span><span class="version">FLUXCUE / V0.1</span></footer>
  </div>
</template>
