/** Explicit groups: never auto-create groups from names or parametric layouts. */
export function createNamedGroup(groups,name) {
 const clean=typeof name==='string'?name.trim().slice(0,40):'';
 if(!clean || clean.toUpperCase()==='UNGROUPED' || groups.includes(clean) || groups.length>=100)
   throw new RangeError('Invalid or duplicate group');
 return [...groups,clean];
}
export function renameNamedGroup(groups,fixtures,oldName,newName){
 const clean=typeof newName==='string'?newName.trim().slice(0,40):'';
 if(!groups.includes(oldName)||!clean||clean.toUpperCase()==='UNGROUPED'||
    (clean!==oldName&&groups.includes(clean)))throw new RangeError('Invalid group rename');
 return {groups:groups.map(name=>name===oldName?clean:name),
   fixtures:fixtures.map(f=>f.group===oldName?{...f,group:clean}:{...f})};
}
export function moveToGroup(fixtures,ids,group,groups){
 if(group!==''&&!groups.includes(group))throw new RangeError('Group must be created first');
 return fixtures.map(f=>ids.includes(f.id)?{...f,group}:{...f});
}
export function removeNamedGroup(groups,fixtures,name){
 if(!groups.includes(name))throw new RangeError('Unknown group');
 return {groups:groups.filter(g=>g!==name),
   fixtures:fixtures.map(f=>f.group===name?{...f,group:''}:{...f})};
}
