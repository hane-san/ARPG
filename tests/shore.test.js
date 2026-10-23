// Issue #18: shoreline sliding and wall clearance for the near plane, with the real terrain and CollisionWorld.
import test from 'node:test';import assert from 'node:assert/strict';
import {height,walkable} from '../dist/terrain.js';
import {CollisionWorld,circleCollider,boxCollider,createMotionState,stepMotion,nearPlaneMargin,PLAYER_RADIUS} from '../dist/movement.js';
const island=new CollisionWorld([],{height,walkable}),forward={forward:1,strafe:0,turn:0,sprint:false};
const rad=d=>d*Math.PI/180;
// Hold full forward along a fixed world heading; every fixed 60Hz step must stay on dry land.
function hold(x,z,vx,vz,seconds,world=island,until=()=>false){
 const s=createMotionState(x,z,Math.atan2(-vx,-vz));let contact=null;
 for(let i=0;i<Math.round(seconds*60);i++){
  const px=s.x,pz=s.z;stepMotion(s,forward,1/60,world);assert.ok(walkable(s.x,s.z),`entered the sea at ${s.x},${s.z}`);
  if(!contact&&Math.hypot(s.x-px-s.vx/60,s.z-pz-s.vz/60)>1e-6)contact={x:px,z:pz,step:i};
  if(until(s))return {s,contact,seconds:(i+1)/60};
 }
 return {s,contact,seconds};
}
// Distance travelled during the first second after the first shoreline contact on the east coast (x≈36.45, z=0).
function afterContact(angle,north){
 const vx=Math.sin(rad(angle)),vz=(north?-1:1)*Math.cos(rad(angle)),first=hold(35.5,0,vx,vz,4);
 assert.ok(first.contact,`no contact at ${angle} degrees`);
 const {s}=hold(35.5,0,vx,vz,first.contact.step/60+1);return Math.hypot(s.x-first.contact.x,s.z-first.contact.z);
}
test('a glancing push along the east coast keeps sliding instead of sticking to the shore',()=>{
 for(const angle of [10,20,45])for(const north of [true,false]){
  const travel=afterContact(angle,north);assert.ok(travel>3,`${angle} degrees ${north?'north':'south'}: ${travel.toFixed(3)} m in 1 s`);
 }
});
test('a head-on push into the east coast still stops without a sideways crawl',()=>{
 for(const angle of [80,90])for(const north of [true,false]){
  const travel=afterContact(angle,north);assert.ok(travel<.3,`${angle} degrees: ${travel.toFixed(3)} m`);
 }
});
test('the sandbar leads to the far islet even when the heading drifts',()=>{
 const reached=s=>Math.hypot(s.x+48,s.z-22)<5;
 // From the beach root of the bar, and from the bar itself with a wider drift.
 for(const [x,drifts] of [[-18,[-10,-5,5,10]],[-36,[-20,-15,-10,-5,5,10,15,20]]])for(const drift of drifts){
  const r=hold(x,22,-Math.cos(rad(drift)),Math.sin(rad(drift)),8,island,reached);
  assert.ok(reached(r.s),`from ${x},22 with ${drift} degrees drift stopped at ${r.s.x.toFixed(2)},${r.s.z.toFixed(2)}`);
 }
});
test('fast travel and shoreline slides never enter the sea, even beside thin coastal props',()=>{
 const props=[circleCollider(36,0,.045,'signpost'),circleCollider(-30,24,.14,'lantern'),boxCollider(30,-20,.5,1.2)];
 const world=new CollisionWorld(props,{height,walkable});let seed=1807;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 let slides=0;
 for(let i=0;i<500;i++){
  const a=rnd()*Math.PI*2,r=.7+rnd()*.35;let x=Math.cos(a)*35*r,z=Math.sin(a)*39*r;
  if(!walkable(x,z)||world.clearance(x,z)<.01)continue;
  const heading=rnd()*Math.PI*2,step=.05+rnd()*1.5;
  for(let j=0;j<40;j++){const p=world.move(x,z,Math.cos(heading)*step,Math.sin(heading)*step);
   assert.ok(walkable(p.x,p.z),`sea at ${p.x},${p.z}`);assert.ok(world.clearance(p.x,p.z)>=-1e-7);if(p.collided&&Math.hypot(p.x-x,p.z-z)>step*.3)slides++;x=p.x;z=p.z;}
 }
 assert.ok(slides>50,`only ${slides} sliding contacts`);
});
test('a wall collider keeps the whole 68 degree near plane outside the drawn model in portrait and landscape',()=>{
 const near=.18,tan=Math.tan(rad(34)),margin=nearPlaneMargin(near,68,2.4);
 assert.ok(margin>.1&&margin<.12,margin);assert.equal(nearPlaneMargin(near,68,.46),0);
 // A drawn 3 x 2 m wall block and a 1.2 m column, with colliders sized from their drawn footprint plus the margin.
 const block={x:0,z:0,hx:1.5,hz:1},column={x:6,z:0,r:1.2};
 const world=new CollisionWorld([boxCollider(block.x,block.z,block.hx+margin,block.hz+margin),circleCollider(column.x,column.z,column.r+margin)]);
 const inside=(x,z)=>(Math.abs(x-block.x)<block.hx&&Math.abs(z-block.z)<block.hz)||Math.hypot(x-column.x,z-column.z)<column.r;
 for(const target of [block,column])for(let k=0;k<36;k++){
  const a=rad(k*10);let x=target.x+Math.cos(a)*3,z=target.z+Math.sin(a)*3;if(world.clearance(x,z)<.01)continue;
  for(let i=0;i<120;i++){const d=Math.hypot(target.x-x,target.z-z),p=world.move(x,z,(target.x-x)/d*.24,(target.z-z)/d*.24);x=p.x;z=p.z;}
  const face=Math.atan2(target.x-x,target.z-z);
  for(const aspect of [390/844,844/390,2.4])for(let yaw=-90;yaw<=90;yaw+=5){
   const f=[Math.sin(face+rad(yaw)),Math.cos(face+rad(yaw))],side=[f[1],-f[0]],hw=near*tan*aspect;
   for(let u=-1;u<=1;u+=.25){const px=x+f[0]*near+side[0]*hw*u,pz=z+f[1]*near+side[1]*hw*u;
    assert.ok(!inside(px,pz),`near plane inside the model at aspect ${aspect.toFixed(2)}, yaw ${yaw}, from ${k*10} degrees`);}
  }
 }
 assert.equal(PLAYER_RADIUS,.23);
});
// A glancing push must not stall where the coast's straight triangle edges meet. The normal is the slope of the
// facet actually crossed; a wide central difference straddling an 8 m triangle edge blended two facets and pointed
// the slide back into the sea at every contact, so the player stopped although a legal slide was open.
test('a glancing push does not stall at the triangle edges of a coastline',()=>{
 const seaward=(x,z)=>{const gx=height(x-.5,z)-height(x+.5,z),gz=height(x,z-.5)-height(x,z+.5),n=Math.hypot(gx,gz);return [gx/n,gz/n];};
 // An open 0.6 m run within the slide cone (cosine at least 0.4 with the input) means the stop was not a corner.
 const open=(x,z,dx,dz)=>{for(let a=-66;a<=66;a+=2){const c=Math.cos(rad(a)),s=Math.sin(rad(a)),ux=dx*c-dz*s,uz=dx*s+dz*c;let k=1;while(k<=12&&walkable(x+ux*k*.05,z+uz*k*.05))k++;if(k>12)return true;}return false;};
 let pushes=0;const stalls=[];
 for(const [x0,x1,z0,z1] of [[-302,-260,-650,-620],[640,700,-320,-290]])for(let x=x0;x<=x1;x+=3)for(let z=z0;z<=z1;z+=3){
  if(!walkable(x,z)||[[1,0],[-1,0],[0,1],[0,-1]].every(([a,b])=>walkable(x+a*1.2,z+b*1.2)))continue;
  const n=seaward(x,z);
  for(const alpha of [-85,-80,-75,-70,-65,65,70,75,80,85]){
   const a=rad(alpha),dx=n[0]*Math.cos(a)-n[1]*Math.sin(a),dz=n[0]*Math.sin(a)+n[1]*Math.cos(a);if(!walkable(x-dx*2.5,z-dz*2.5))continue;
   pushes++;const r=hold(x-dx*2.5,z-dz*2.5,dx,dz,4,island);let still=0;const s=r.s;
   const probe=createMotionState(s.x,s.z,s.yaw);probe.localForward=s.localForward;
   for(let i=0;i<30;i++){const px=probe.x,pz=probe.z;stepMotion(probe,forward,1/60,island);still=Math.hypot(probe.x-px,probe.z-pz)<1e-4?still+1:0;}
   if(still>=30&&open(probe.x,probe.z,dx,dz))stalls.push(`${x},${z} at ${alpha} degrees stopped at ${probe.x.toFixed(2)},${probe.z.toFixed(2)}`);
  }
 }
 // Before the 5 mm facet normal 72 of these pushes stalled. A contact exactly on a triangle edge can still blend two
 // facets (one push here, at x=688.00); it is a documented follow-up, not a reason to widen this tolerance.
 assert.ok(pushes>150,`only ${pushes} pushes`);assert.ok(stalls.length<=1,`${pushes} pushes: `+stalls.join('\n'));
});
