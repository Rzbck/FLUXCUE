/** Original, deterministic procedural preview patterns; no third-party effect code. */
export const ADVANCED_EFFECTS=['breath','pulse','comet','scanner','theater','sparkle','fire','plasma','spatial-ripple','spatial-orbit','strobe'];
const fract=n=>n-Math.floor(n);
const hash=n=>fract(Math.sin(n*127.1+78.233)*43758.5453);
const clamp=x=>Math.max(0,Math.min(1,x));
const triangle=n=>1-Math.abs(fract(n)*2-1);
export function effectSample(mode,p,world,t,speed){
 if(!Number.isFinite(p)||!Number.isFinite(t)||!Number.isFinite(speed)||!world||
  ![world.x,world.y,world.z].every(Number.isFinite))throw new RangeError('Invalid effect input');
 const s=Math.max(0,Math.min(3,speed)),q=clamp(p),phase=t*s;
 const x=world.x,y=world.y,z=world.z;
 switch(mode){
  case 'breath':return {level:.06+.94*(.5+.5*Math.sin(phase*2.3))**2};
  case 'pulse':return {level:clamp(Math.exp(-Math.max(0,fract(phase*.9+q*.04)) *13))};
  case 'comet':{const d=Math.abs(fract(q-phase*.22+.5)-.5);return {level:clamp(Math.exp(-d*22))};}
  case 'scanner':return {level:clamp(Math.exp(-Math.abs(q-triangle(phase*.16))*12))};
  case 'theater':return {level:Math.floor((q*60+Math.floor(phase*5))%3)===0?1:.02};
  case 'sparkle':{const cell=Math.floor(q*180),frame=Math.floor(phase*9);return {level:hash(cell*17+frame*17011)>.94?1:.025};}
  case 'fire':{const noise=hash(Math.floor(q*150)*47+Math.floor(phase*18)*933);
    return {level:.18+.82*noise,fire:true};}
  case 'plasma':return {level:clamp(.5+.23*Math.sin(q*28+phase*2)+.27*Math.sin(q*11-phase*3))};
  case 'spatial-ripple':{const d=Math.hypot(x,y,z),ring=Math.abs(Math.sin(d*5-phase*3));
    return {level:clamp(Math.pow(ring,12)*.95+.04)};}
  case 'spatial-orbit':{const a=Math.atan2(y,x),arc=Math.cos(a-phase*1.9+z*.3);
    return {level:clamp(Math.pow(Math.max(0,arc),5))};}
  case 'strobe':return {level:fract(phase*6)<.22?1:0};
  default:throw new RangeError('Unknown effect');
 }
}
