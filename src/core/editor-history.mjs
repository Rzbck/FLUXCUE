/** Stateless, browser-independent scene history transactions. */
export function commitHistory(undo,redo,before,after,limit=100){
 if(!Array.isArray(undo)||!Array.isArray(redo)||!Number.isInteger(limit)||limit<1)throw new RangeError('Invalid history');
 if(JSON.stringify(before)===JSON.stringify(after))return {undo,redo,changed:false};
 return {undo:[...undo.slice(-(limit-1)),before],redo:[],changed:true};
}
export function stepHistory(undo,redo,current,direction){
 if(direction!=='undo'&&direction!=='redo')throw new RangeError('Invalid history direction');
 const source=direction==='undo'?undo:redo;
 if(!source.length)return {undo,redo,current,changed:false};
 const previous=source.at(-1);
 return direction==='undo'
  ?{undo:undo.slice(0,-1),redo:[...redo,current],current:previous,changed:true}
  :{undo:[...undo,current],redo:redo.slice(0,-1),current:previous,changed:true};
}
