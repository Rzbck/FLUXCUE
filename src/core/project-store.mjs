import {inferredDensity,normalizedChip} from './hardware.mjs';
const effects=new Set(['solid','rainbow','chase','gradient','spatial-wave','spatial-blocks']);
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
   format:f.format,group:typeof f.group==='string'&&f.group.trim()?f.group.trim().slice(0,40):'STAGE',
   visible:f.visible!==false,locked:f.locked===true,
   chip:normalizedChip(f),density:inferredDensity(f),tint:hex(f.tint)?f.tint:'#ffffff'};
 });
 const cueIds=new Set();
 const cues=d.cues.map(c=>{
  if(!c||typeof c.id!=='string'||!c.id||cueIds.has(c.id)||typeof c.name!=='string'||!effects.has(c.effect)||
    !finite(c.fade,0,120)||!hex(c.color))throw new RangeError('Invalid cue');
  cueIds.add(c.id);
  const targets=Array.isArray(c.targetIds)?c.targetIds.filter(id=>ids.has(id)).slice(0,500):[];
  return {id:c.id,name:c.name.slice(0,100),effect:c.effect,fade:c.fade,color:c.color,
   hold:finite(c.hold,.1,3600)?c.hold:5,mode:c.mode==='REPLACE'?'REPLACE':'ADD',
   targetIds:[...new Set(targets)]};
 });
 const selectedId=typeof d.selectedId==='string'&&ids.has(d.selectedId)?d.selectedId:fixtures[0].id;
 const selectedIds=Array.isArray(d.selectedIds)?d.selectedIds.filter(id=>ids.has(id)).slice(0,500):[selectedId];
 return {fixtures,cues,selectedId,selectedIds:selectedIds.length?selectedIds:[selectedId],
  activeIndex:Number.isInteger(d.activeIndex)?Math.max(0,Math.min(cues.length-1,d.activeIndex)):0,
  collapsedGroups:Array.isArray(d.collapsedGroups)?d.collapsedGroups.filter(s=>typeof s==='string').slice(0,100):[],
  autoPlay:d.autoPlay===true,speed:finite(d.speed,0,3)?d.speed:.35,
  brightness:finite(d.brightness,0,1)?d.brightness:.75};
}
export function stringifyStudioProject(state){
 return JSON.stringify({schemaVersion:'0.1.0',project:{name:'FLUXCUE Studio Local'},...state});
}
