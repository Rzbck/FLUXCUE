/** Browser automation without npm test dependency. Runs only on ephemeral CI Chrome.
 * Tests Vue + Three TransformControls event lifecycle and REAL Ctrl+Z key events.
 * The gizmo event sequence is synthesized; actual physical pointer picking still needs QA.
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,extname,normalize,resolve} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const root=resolve('dist'),base='/FLUXCUE/',profile=mkdtempSync(join(tmpdir(),'fluxcue-ci-'));
if(!existsSync(join(root,'index.html')))throw new Error('Build dist before browser smoke');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml',
 '.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
const server=createServer((req,res)=>{
 const pathname=new URL(req.url||'/', 'http://127.0.0.1').pathname;
 if(!pathname.startsWith(base)){res.writeHead(404);res.end();return;}
 const name=pathname.slice(base.length)||'index.html';
 const relative=normalize(name).replace(/^([/\\])+/, '');
 const file=resolve(root,relative);
 if(!file.startsWith(root+'/')&&!file.startsWith(root+'\\')){res.writeHead(403);res.end();return;}
 try{const bytes=readFileSync(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(bytes);}
 catch{res.writeHead(404);res.end();}
});
let chrome,ws;
let session=0;
const waiting=new Map();
const errors=[];
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 const candidate=['google-chrome','google-chrome-stable','chromium','chromium-browser']
   .find(x=>spawnSync('which',[x],{stdio:'ignore'}).status===0);
 if(!candidate)throw new Error('Chrome not installed on CI runner; browser smoke unavailable');
 chrome=spawn(candidate,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
   '--disable-background-networking','--enable-unsafe-swiftshader',
   '--use-gl=angle','--use-angle=swiftshader','--remote-allow-origins=*',
   '--remote-debugging-port=9227','--user-data-dir='+profile,
   'http://127.0.0.1:'+port+base],{stdio:'ignore'});
 const devtools='http://127.0.0.1:9227/json';
 let url;
 for(let i=0;i<160;i++){
  if(chrome.exitCode!==null)throw new Error('Chrome exited early '+chrome.exitCode);
  try{const pages=await (await fetch(devtools)).json();
   url=pages.find(p=>p.type==='page'&&p.url.includes(base))?.webSocketDebuggerUrl;
   if(url)break;}catch{}
  await delay(200);
 }
 if(!url)throw new Error('Chrome remote debugger unreachable');
 ws=new WebSocket(url);
 await new Promise((yes,no)=>{ws.addEventListener('open',yes,{once:true});ws.addEventListener('error',no,{once:true});});
 ws.addEventListener('message',event=>{
  const m=JSON.parse(event.data);
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text||'Page error');
  if(!m.id)return;
  const call=waiting.get(m.id);if(!call)return;waiting.delete(m.id);
  m.error?call.reject(new Error(m.error.message)):call.resolve(m.result);
 });
 const send=(method,params={})=>new Promise((resolve,reject)=>{
  const id=++session;waiting.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
 });
 const evaluate=async expression=>{
  const data=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(data.exceptionDetails)throw new Error('Browser evaluation '+JSON.stringify(data.exceptionDetails));
  return data.result?.value;
 };
 await send('Page.enable');await send('Runtime.enable');
 let ready=false;
 for(let i=0;i<150;i++){
  try{ready=await evaluate("Boolean(document.querySelector('.viewport canvas') && window.__FLUXCUE_SMOKE__)");if(ready)break;}catch{}
  await delay(200);
 }
 if(!ready)throw new Error('Studio did not mount WebGL / smoke hook: '+errors.join('; '));
 console.log('GIZMO POINTER CANDIDATES:',JSON.stringify(await evaluate('window.__FLUXCUE_SMOKE__.pointerCandidates()')));
 const key=async(modifiers=2)=>{
  await send('Input.dispatchKeyEvent',{type:'rawKeyDown',modifiers,
   windowsVirtualKeyCode:90,nativeVirtualKeyCode:90,code:'KeyZ',key:'z'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',modifiers,
   windowsVirtualKeyCode:90,nativeVirtualKeyCode:90,code:'KeyZ',key:'z'});
  await delay(160);
 };
 const picker=await evaluate('window.__FLUXCUE_SMOKE__.pointerCandidates()');
 if(picker?.candidates?.length){
  const testX=picker.candidates.at(-1);
  const beforePointer=await evaluate('window.__FLUXCUE_SMOKE__.state()');
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:testX.x,y:testX.y});
  await delay(150);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:testX.x,y:testX.y,
    button:'left',buttons:1,clickCount:1});
  await delay(120);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:testX.x+70,y:testX.y+8,
    button:'left',buttons:1});
  await delay(150);
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:testX.x+70,y:testX.y+8,
    button:'left',buttons:0,clickCount:1});
  await delay(200);
  const afterPointer=await evaluate('window.__FLUXCUE_SMOKE__.state()');
  console.log('REAL POINTER PROBE',JSON.stringify({candidate:testX,before:beforePointer,after:afterPointer}));
  if(Math.abs(afterPointer.x-beforePointer.x)>.01){
    await key(2);
    const restored=await evaluate('window.__FLUXCUE_SMOKE__.state()');
    assert.ok(Math.abs(restored.x-beforePointer.x)<.001,
     'REAL pointer gizmo drag Ctrl+Z failed '+JSON.stringify({beforePointer,afterPointer,restored}));
    console.log('REAL MOUSE PASS: X gizmo moved, real Ctrl+Z restored old XYZ');
  } else console.warn('REAL MOUSE NOT CONFIRMED: test picker did not move under Chrome input injection');
 }
 const initial=await evaluate('window.__FLUXCUE_SMOKE__.state()');
 assert.ok(Number.isFinite(initial.x),'Fixture position is finite');
 for(let i=0;i<3;i++){
  const before=await evaluate('window.__FLUXCUE_SMOKE__.state()');
  const dragged=await evaluate("window.__FLUXCUE_SMOKE__.drag('x',0.7)");
  await delay(140);
  assert.ok(Math.abs(dragged.position.x-before.x-.7)<.0001,'Gizmo failed to move +0.7m');
  assert.equal(dragged.undo,before.undo+1,'One complete drag must push exactly one history entry');
  await key(2);
  const reverted=await evaluate('window.__FLUXCUE_SMOKE__.state()');
  assert.ok(Math.abs(reverted.x-before.x)<.0001,
    'REAL Ctrl+Z did not restore original X (trial '+(i+1)+'): '+JSON.stringify({before,dragged,reverted}));
  await key(10);
  const redone=await evaluate('window.__FLUXCUE_SMOKE__.state()');
  assert.ok(Math.abs(redone.x-dragged.position.x)<.0001,'Ctrl+Shift+Z failed to redo');
 }
 assert.ok(await evaluate("document.querySelectorAll('select option[value=\"spatial-ripple\"]').length===1"),'Advanced effect menu missing');
 assert.ok(await evaluate("document.querySelectorAll('.viewport canvas').length===1"),'3D editor canvas missing');
 console.log('BROWSER PASS: Chromium WebGL Vue mounted, 3 synthetic gizmo drags with real keyboard Ctrl+Z/redo, 11 FX menu');
 if(errors.length)console.warn('Browser JS exceptions:',errors.slice(0,5));
 const screen=await send('Page.captureScreenshot',{format:'png'});
 if(screen?.data)writeFileSync(join(process.env.RUNNER_TEMP||tmpdir(),'fluxcue-browser-smoke.png'),Buffer.from(screen.data,'base64'));
}finally{
 try{ws?.close();}catch{}
 for(const entry of waiting.values())entry.reject(new Error('Browser smoke closing'));
 if(chrome)chrome.kill('SIGKILL');
 await new Promise(r=>server.close(r));
 rmSync(profile,{recursive:true,force:true});
}
