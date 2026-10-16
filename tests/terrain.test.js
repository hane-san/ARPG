import test from 'node:test';import assert from 'node:assert/strict';import {height,walkable,pointerInput,dragInput,moveOnIsland,routes,landmarks} from '../dist/terrain.js';
test('one-thumb horizontal strokes steer without any lateral translation',()=>{
 for(let x=-1;x<=1;x+=.02){const p=pointerInput(x,0);assert.equal(p.strafe,0);assert.equal(p.forward,0);assert.ok(Math.abs(p.turn)<=1);assert.ok(Math.abs(p.turn+pointerInput(-x,0).turn)<1e-10);}
 assert.equal(pointerInput(1,0).turn,1);assert.equal(pointerInput(-1,0).turn,-1);
});
test('throttle and steering stay independent on diagonal strokes',()=>{
 assert.equal(pointerInput(0,-1).forward,1);assert.equal(pointerInput(0,1).forward,-1);
 for(let x=-1;x<=1;x+=.05){assert.equal(pointerInput(x,-1).forward,1);assert.equal(pointerInput(x,1).forward,-1);assert.equal(pointerInput(x,-1).strafe,0);}
 assert.equal(pointerInput(.02,-.02).turn<.01,true);assert.equal(pointerInput(9,-9).forward,1);
});
test('landmarks and starting beach are dry; deep sea is blocked',()=>{for(const [x,z] of [[8,30],[3.3,18.2],[23,8],[-4,-13],[-24,22],[-48,22]])assert.ok(walkable(x,z),`${x},${z}`);assert.equal(walkable(80,80),false);});
test('sandbar stays connected to the far islet',()=>{for(let x=-48;x<=-17;x+=.25)assert.ok(walkable(x,22),`sandbar at ${x}`);});
test('island elevation is finite and continuous along walking paths',()=>{for(let z=-45;z<45;z++)for(let x=-55;x<45;x++){const y=height(x,z);assert.ok(Number.isFinite(y));assert.ok(Math.abs(height(x+.05,z)-y)<.2);}});
test('thumb travel has a straight-running corridor and gradual, independent steering',()=>{
 for(let dx=-12;dx<=12;dx++)assert.equal(dragInput(dx,-85,390,844).x,0);
 assert.equal(dragInput(30,-85,390,844).y,-1);
 assert.ok(dragInput(30,-85,390,844).x>0);
 assert.deepEqual(dragInput(30,-85,390,844),dragInput(30,-85,390,700));
 assert.ok(Math.abs(pointerInput(0,dragInput(0,-17,390,844).y).forward)*7.8<3);
 assert.deepEqual(dragInput(0,0,390,844),{x:0,y:0});
});
test('every section of the loop and its cove spur has a dry walking corridor',()=>{
 for(const path of routes)for(let i=1;i<path.length;i++){
  const [ax,az]=path[i-1],[bx,bz]=path[i],len=Math.hypot(bx-ax,bz-az),nx=-(bz-az)/len,nz=(bx-ax)/len;
  for(let t=0;t<=1;t+=.25/len)for(const offset of [-.65,0,.65]){
   const x=ax+(bx-ax)*t+nx*offset,z=az+(bz-az)*t+nz*offset;
   assert.ok(height(x,z)>.25,`dry corridor ${x},${z}`);
  }
 }
});
test('all old and new destinations connect to the starting beach, including the sandbar',()=>{
 const key=(x,z)=>`${x},${z}`,seen=new Set(['8,30']),queue=[[8,30]];
 for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=z+dz,k=key(a,b);if(!seen.has(k)&&walkable(a,b)){seen.add(k);queue.push([a,b]);}}}
 for(const [name,,x,z] of landmarks)assert.ok(seen.has(key(x,z)),name);
 assert.ok(seen.size>9500,'the expanded island has substantial explorable land');
 assert.equal(walkable(47,-44),false,'cove is connected to the sea');
 assert.equal(walkable(6,-128),false,'cape ends at the sea');
});
test('contact slides along round obstacles without favoring a world axis',()=>{
 const a=moveOnIsland(8,20,.16,-.15,[[8.5,19.5,.43]]);
 const b=moveOnIsland(8,20,.15,.16,[[8.5,20.5,.43]]);
 assert.ok(Math.hypot(a.x-8,a.z-20)>.01);
 assert.ok(Math.abs((a.x-8)-(b.z-20))<1e-9);
 assert.ok(Math.abs((a.z-20)+(b.x-8))<1e-9);
 let p={x:8,z:20};for(let i=0;i<100;i++)p=moveOnIsland(p.x,p.z,0,-.15,[[8,19,.5]]);
 assert.ok(Math.hypot(p.x-8,p.z-19)>=.73);
});
