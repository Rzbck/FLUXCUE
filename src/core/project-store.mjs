import {inferredDensity,normalizedChip} from './hardware.mjs';
import {optics} from './led-optics.mjs';
const effects=new Set(['solid','rainbow','chase','gradient','spatial-wave','spatial-blocks',
 'breath','pulse','comet','scanner','theater','sparkle','fire','plasma','spatial-ripple','spatial-orbit','strobe']);
const hex=v=>typeof v==='string'&&/^#[a-f0-9]{6}$/i.test(v);
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
/** Validate saved data before applying ANY imported state; migration keeps old LED counts. */
export function parseStudioProject(json){
 if(typeof json!=='string'||json.length>2_000_000)throw new RangeError('Project file must be <= 2 MB');
 const d=JSON.parse(json);
 if(d?.schemaVersion!=='0.1.0'||!Array.isArray(d.fixtures)||!d.fixtures.length||d.fixtures.length>500||
  !Array.isArray(d.cues)||!d.cues.length||d.cues.length>3000)throw new RangeError('Unsupported project');
 const ids=new Set();
 const fixtures=d.fixtures.map(f=>{
  if(!f||typeof f.id!=='string'||!f.id||f.id.length>80||ids.has(f.id)||typeof f.name!=='string'||
   !Number.isInteger(f.pixels)||f.pixels<1||f.pixels>2000||!finite(f.length,.1,100)||
   ![f.x,f.y,f.z,f.angle].every(v=>finite(v,-1000,1000))||
   !['RGB','RGBW'].includes(f.format))throw new RangeError('Invalid fixture');
  ids.add(f.id);
  return {id:f.id,name:f.name.slice(0,100),pixels:f.pixels,length:f.length,x:f.x,y:f.y,z:f.z,angle:f.angle,
   format:f.format,group:typeof f.group==='string'?f.group.trim().slice(0,40):'',
   visible:f.visible!==false,locked:f.locked===true,
   chip:normalizedChip(f),density:inferredDensity(f),tint:hex(f.tint)?f.tint:'#ffffff',
   ...optics(f)};
 });
 const cueIds=new Set();
 const cues=d.cues.map(c=>{
  if(!c||typeof c.id!=='string'||!c.id||cueIds.has(c.id)||typeof c.name!=='string'||!effects.has(c.effect)||
    !finite(c.fade,0,120)||!hex(c.color))throw new RangeError('Invalid cue');
  cueIds.add(c.id);
  const targets=Array.isArray(c.targetIds)?c.targetIds.filter(id=>ids.has(id)).slice(0,500):[];
  return {id:c.id,name:c.name.slice(0,100),effect:c.effect,fade:c.fade,color:c.color,
   hold:finite(c.hold,.1,3600)?c.hold:5,mode:c.mode==='REPLACE'?'REPLACE':'ADD',
   targetIds:[...new Set(targets)],speed:finite(c.speed,0,3)?c.speed:.35,
   looks:Object.fromEntries(Object.entries(c.looks&&typeof c.looks==='object'&&!Array.isArray(c.looks)?c.looks:{})
     .filter(([id,value])=>ids.has(id)&&hex(value)).slice(0,500)),
   fixtureEffects:Object.fromEntries(Object.entries(c.fixtureEffects&&typeof c.fixtureEffects==='object'&&!Array.isArray(c.fixtureEffects)?c.fixtureEffects:{})
     .filter(([id,fx])=>ids.has(id)&&effects.has(fx)).slice(0,500))};
 });
 const showTime=finite(d.showTime,0,10_000_000)?d.showTime:0;
 const activeLayers=Array.isArray(d.activeLayers)?d.activeLayers.slice(-12).filter(layer=>
   layer && typeof layer.id==='string' && typeof layer.cueId==='string' &&
   cueIds.has(layer.cueId) && effects.has(layer.effect) && hex(layer.color) &&
   finite(layer.fade,0,120) && finite(layer.started,0,10_000_000) &&
   ['ADD','REPLACE'].includes(layer.mode)
 ).map(layer=>({
   id:layer.id.slice(0,80),cueId:layer.cueId,effect:layer.effect,color:layer.color,
   fade:layer.fade,started:layer.started,mode:layer.mode,speed:finite(layer.speed,0,3)?layer.speed:.35,
   targetIds:Array.isArray(layer.targetIds)?layer.targetIds.filter(id=>ids.has(id)).slice(0,500):[],
   looks:Object.fromEntries(Object.entries(layer.looks&&typeof layer.looks==='object'&&!Array.isArray(layer.looks)?layer.looks:{})
     .filter(([id,value])=>ids.has(id)&&hex(value)).slice(0,500)),
   fixtureEffects:Object.fromEntries(Object.entries(layer.fixtureEffects&&typeof layer.fixtureEffects==='object'&&!Array.isArray(layer.fixtureEffects)?layer.fixtureEffects:{})
     .filter(([id,fx])=>ids.has(id)&&effects.has(fx)).slice(0,500))
 })):[];
 // New files have explicit, user-owned groups. Old 0.1 projects without this
 // list are migrated once, retaining historical STAGE/FLOOR group assignments.
 // Only ungroup the FOUR known old demo placements. Other group names
 // (including user-built legacy STAGE groups) are preserved on import.
 if(!Array.isArray(d.groups)){
  const demoNames=new Map([
   ['s1',['STAGE / TOP','STAGE']],['s2',['LEFT / VERTICAL','STAGE']],
   ['s3',['RIGHT / VERTICAL','STAGE']],['s4',['FLOOR / FRONT','FLOOR']]
  ]);
  for(const f of fixtures){
   const legacy=demoNames.get(f.id);
   if(legacy && f.name===legacy[0] && f.group===legacy[1])f.group='';
  }
 }
 const groups=Array.isArray(d.groups)
  ?d.groups.filter(g=>typeof g==='string'&&g.trim()&&g.trim().length<=40&&g.trim().toUpperCase()!=='UNGROUPED').slice(0,100)
  :fixtures.map(f=>f.group).filter(Boolean);
 const distinctGroups=[...new Set(groups)];
 for(const f of fixtures)if(f.group && !distinctGroups.includes(f.group)) f.group='';
 const draftIndex=Number.isInteger(d.editorDraft?.cueIndex)?
  Math.max(0,Math.min(cues.length-1,d.editorDraft.cueIndex)):
  (Number.isInteger(d.activeIndex)?Math.max(0,Math.min(cues.length-1,d.activeIndex)):0);
 const draftCue=cues[draftIndex];
 const draft=d.editorDraft&&typeof d.editorDraft==='object'&&!Array.isArray(d.editorDraft)?d.editorDraft:{};
 const draftLooks=Object.fromEntries(Object.entries(draft.looks&&typeof draft.looks==='object'&&!Array.isArray(draft.looks)?draft.looks:draftCue.looks)
   .filter(([id,value])=>ids.has(id)&&hex(value)).slice(0,500));
 const editorDraft={cueIndex:draftIndex,
   effect:effects.has(draft.effect)?draft.effect:draftCue.effect,
   color:hex(draft.color)?draft.color:draftCue.color,
   speed:finite(draft.speed,0,3)?draft.speed:draftCue.speed,
   targetMode:draft.targetMode==='ALL'||(!draft.targetMode&&!draftCue.targetIds.length)?'ALL':'SELECTION',
   targetIds:Array.isArray(draft.targetIds)?[...new Set(draft.targetIds.filter(id=>ids.has(id)))].slice(0,500):[...draftCue.targetIds],
   looks:draftLooks,
   fixtureEffects:Object.fromEntries(Object.entries(draft.fixtureEffects&&typeof draft.fixtureEffects==='object'&&!Array.isArray(draft.fixtureEffects)?draft.fixtureEffects:draftCue.fixtureEffects)
     .filter(([id,fx])=>ids.has(id)&&effects.has(fx)).slice(0,500))};
 const selectedId=typeof d.selectedId==='string'&&ids.has(d.selectedId)?d.selectedId:fixtures[0].id;
 const selectedIds=Array.isArray(d.selectedIds)?d.selectedIds.filter(id=>ids.has(id)).slice(0,500):[selectedId];
 return {projectName:typeof d.project?.name==='string' && d.project.name.trim()?d.project.name.trim().slice(0,80):'UNTITLED PROJECT',
  fixtures,cues,groups:distinctGroups,editorDraft,selectedId,selectedIds:selectedIds.length?selectedIds:[selectedId],
  activeIndex:Number.isInteger(d.activeIndex)?Math.max(0,Math.min(cues.length-1,d.activeIndex)):0,
  collapsedGroups:Array.isArray(d.collapsedGroups)?d.collapsedGroups.filter(s=>typeof s==='string').slice(0,100):[],
  collapsedPanels:Object.fromEntries(['scene','arrays','patch','cues','geometry','effects','pixel'].map(k=>[k,d.collapsedPanels?.[k]===true])),
  autoPlay:d.autoPlay===true,speed:finite(d.speed,0,3)?d.speed:.35,
  brightness:finite(d.brightness,0,1)?d.brightness:.75,
  activeLayers,showTime,running:d.running!==false,blackout:d.blackout===true};
}
export function stringifyStudioProject(state){
 return JSON.stringify({schemaVersion:'0.1.0',project:{name:'FLUXCUE Studio Local'},...state});
}
