/** Informational chip family presets; NO electrical/timing validation or real output. */
export const CHIP_PROFILES=[
 {id:'WS2812B',label:'WS2812B · 5V RGB',format:'RGB'},
 {id:'WS2813',label:'WS2813 · 5V RGB',format:'RGB'},
 {id:'WS2815',label:'WS2815 · 12V RGB',format:'RGB'},
 {id:'SK6812',label:'SK6812 · RGBW',format:'RGBW'},
 {id:'APA102',label:'APA102 · clocked RGB',format:'RGB'},
 {id:'SK9822',label:'SK9822 · clocked RGB',format:'RGB'},
 {id:'GENERIC_RGB',label:'Generic addressable RGB',format:'RGB'},
 {id:'GENERIC_RGBW',label:'Generic RGBW',format:'RGBW'}
];
export const DENSITY_PRESETS=[30,60,72,96,120,140,144,160,240];
export function pixelCountFor(length,density){
 if(!Number.isFinite(length)||!Number.isFinite(density)||length<=0||length>100||density<1||density>600)throw new RangeError('Invalid strip length/density');
 return Math.max(1,Math.min(2000,Math.round(length*density)));
}
export function inferredDensity(f){
 if(Number.isFinite(f.density)&&f.density>=1&&f.density<=600)return f.density;
 const v=Number(f.pixels)/Number(f.length);
 return Number.isFinite(v)&&v>=1&&v<=600?Math.round(v*10000)/10000:60;
}
export function normalizedChip(f){
 const candidate=CHIP_PROFILES.find(p=>p.id===f.chip);
 return candidate&&candidate.format===f.format?candidate.id:(f.format==='RGBW'?'GENERIC_RGBW':'GENERIC_RGB');
}
export function chipFormat(id){
 return CHIP_PROFILES.find(p=>p.id===id)?.format || 'RGB';
}
export function scaleSelected(fixtures,ids,pivot,factor){
 if(!pivot||!Number.isFinite(factor)||factor<=0||factor>10 || [pivot.x,pivot.y,pivot.z].some(v=>!Number.isFinite(v)))throw new RangeError('Invalid scale');
 return fixtures.map(f=>{
  if(!ids.includes(f.id)||f.locked||!f.visible)return {...f};
  const length=f.length*factor;
  if(length<.1||length>100)throw new RangeError('Scaled strip out of range');
  const density=inferredDensity(f);
  // SCALE is strip LENGTH, not object spacing. Preserve every fixture centre;
  // moving the group apart is a separate layout/translate operation.
  return {...f,length,pixels:pixelCountFor(length,density)};
 });
}
