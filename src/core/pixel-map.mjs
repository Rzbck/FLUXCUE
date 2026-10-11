/** Portable offline pixel mapping export for simulated fixtures. No controller/output mapping. */
import {describePatch} from './patch.mjs';
import {scenePixelPosition} from './spatial-selection.mjs';
const safeId=id=>String(id).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,80);
export function virtualPixelRows(fixtures,limit=100000){
  if(!Array.isArray(fixtures)||!Number.isSafeInteger(limit)||limit<1||limit>100000)throw new RangeError('Invalid pixel export');
  const total=fixtures.reduce((s,f)=>s+f.pixels,0);
  if(total>limit)throw new RangeError('Pixel map exceeds export limit');
  const lines=['fixture_id,pixel_index,world_x_m,world_y_m,world_z_m,format,virtual_universe_offset,virtual_dmx_slot'];
  for(const f of fixtures){
    if(!Number.isSafeInteger(f.pixels)||f.pixels<1||f.pixels>2000||!['RGB','RGBW'].includes(f.format))throw new RangeError('Invalid fixture map');
    const slots=describePatch(f.pixels,f.format).assignments;
    for(let index=0;index<f.pixels;index++){
      const p=scenePixelPosition(f,index),slot=slots[index];
      lines.push([safeId(f.id),index,p.x.toFixed(4),p.y.toFixed(4),p.z.toFixed(4),f.format,slot.universeOffset,slot.slot].join(','));
    }
  }
  return lines.join('\n')+'\n';
}
