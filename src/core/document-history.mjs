/**
 * FLUXCUE document history. The pure project snapshot is the single authority
 * for undo/redo; focus, selection and playback cursors are not editing commands.
 * No Vue, Three.js, keyboard or DOM state is stored here.
 */
const deepCopy=value=>JSON.parse(JSON.stringify(value));
const nav=new Set(['selectedId','selectedIds','activeIndex','editIndex']);
export function documentFingerprint(state){
  return JSON.stringify(Object.fromEntries(Object.entries(state||{}).filter(([k])=>!nav.has(k))));
}
export function createDocumentHistory({capacity=80}={}){
  if(!Number.isInteger(capacity)||capacity<1||capacity>500)throw new RangeError('History capacity');
  let undo=[],redo=[],pending=null,baseline=null;
  let label=null;
  const equal=(a,b)=>documentFingerprint(a)===documentFingerprint(b);
  const checkpoint=(before,after,description='Edit')=>{
    if(equal(before,after)){baseline=deepCopy(after);return false;}
    undo=[...undo.slice(-(capacity-1)),{before:deepCopy(before),after:deepCopy(after),label:description}];
    redo=[];
    baseline=deepCopy(after);
    return true;
  };
  return {
    reset(state){undo=[];redo=[];pending=null;label=null;baseline=deepCopy(state);},
    begin(state,description='Edit'){
      if(!pending){pending=deepCopy(state);label=description;}
    },
    commit(state){
      if(!pending){this.observe(state);return false;}
      const before=pending,description=label;
      pending=null;label=null;
      return checkpoint(before,state,description);
    },
    push(before,after,description='Edit'){
      if(pending)throw new Error('Cannot push while another edit is open');
      return checkpoint(before,after,description);
    },
    observe(state){
      if(pending)return false;
      if(!baseline){baseline=deepCopy(state);return false;}
      if(equal(baseline,state)){baseline=deepCopy(state);return false;}
      return checkpoint(baseline,state,'Input change');
    },
    undo(current){
      if(pending)this.commit(current);
      if(!undo.length)return null;
      const op=undo.pop();
      redo.push(op);
      baseline=deepCopy(op.before);
      return deepCopy(op.before);
    },
    redo(current){
      if(pending)this.commit(current);
      if(!redo.length)return null;
      const op=redo.pop();
      undo.push(op);
      baseline=deepCopy(op.after);
      return deepCopy(op.after);
    },
    get depth(){return undo.length;},
    get redoDepth(){return redo.length;},
    get inTransaction(){return pending!==null;},
    get operations(){return undo.map(({label})=>label);},
    get baseline(){return baseline===null?null:deepCopy(baseline);}
  };
}
