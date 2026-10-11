/** Generate parametric collections of straight fixtures for a show scene. Pure design-space tool. */
export function createFixtureArray(source,kind,count,spacing,makeId){
  if(!source||!['ROW X','ROW Z','RING XY'].includes(kind)||!Number.isSafeInteger(count)||count<2||count>32
     ||!Number.isFinite(spacing)||spacing<.05||spacing>10||typeof makeId!=='function')
    throw new RangeError('Invalid layout parameters');
  const result=[];
  const keys=new Set();
  for(let i=0;i<count;i++){
    const id=makeId();
    if(typeof id!=='string'||!id||keys.has(id))throw new RangeError('Duplicate generated fixture ID');
    keys.add(id);
    let x=source.x,y=source.y,z=source.z,angle=source.angle;
    if(kind==='ROW X')x+=(i-(count-1)/2)*spacing;
    if(kind==='ROW Z')z+=(i-(count-1)/2)*spacing;
    if(kind==='RING XY'){
      const theta=i*2*Math.PI/count, radius=spacing*count/(2*Math.PI);
      x+=radius*Math.cos(theta);y+=radius*Math.sin(theta);
      angle=(theta*180/Math.PI+90)%360;
    }
    result.push({...source,id,name:source.name.slice(0,65)+' / '+String(i+1).padStart(2,'0'),
      x:Math.round(x*1e6)/1e6,y:Math.round(y*1e6)/1e6,z:Math.round(z*1e6)/1e6,
      angle:Math.round(angle*1e6)/1e6,
      group:kind==='RING XY'?'RING':kind==='ROW X'?'ARRAY X':'ARRAY Z',locked:false,visible:true});
  }
  return result;
}
