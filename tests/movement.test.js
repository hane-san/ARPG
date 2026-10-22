import test from 'node:test';
import assert from 'node:assert/strict';
import {CollisionWorld,circleCollider,boxCollider,GestureInput,createMotionState,resetMotion,stepMotion,readMovementInput,CRUISE_SPEED,MAX_TRAVEL_SPEED,footStride} from '../dist/movement.js';
const forward={forward:1,strafe:0,turn:0,sprint:false};
const empty=()=>new CollisionWorld();
const tick=(state,input,world,seconds)=>{for(let i=0;i<Math.round(seconds*60);i++)stepMotion(state,input,1/60,world);};
const bounds={left:0,top:0,width:390,height:844};
const touch=(id,x=195,y=705)=>({pointerId:id,pointerType:'touch',button:0,isPrimary:true,clientX:x,clientY:y});
test('continuous forward travel builds speed only after two seconds and reaches a modest cap',()=>{
 const s=createMotionState(0,0),world=empty();tick(s,forward,world,2);assert.ok(s.actualSpeed<=CRUISE_SPEED+.001);assert.equal(s.surge,0);
 tick(s,forward,world,2);assert.ok(s.actualSpeed>14.5&&s.actualSpeed<15.5);
 tick(s,forward,world,4);assert.ok(s.actualSpeed>MAX_TRAVEL_SPEED-.001&&s.actualSpeed<=MAX_TRAVEL_SPEED+.001);
 resetMotion(s);assert.equal(s.actualSpeed,0);assert.equal(s.runSeconds,0);assert.equal(s.surge,0);
});
test('close-up walking, backing up, sidesteps and in-place turns never charge a speed boost',()=>{
 for(const input of [{...forward,forward:.4},{...forward,forward:-1},{...forward,forward:0,strafe:1},{...forward,forward:0,turn:1}]){
  const s=createMotionState(0,0);tick(s,input,empty(),8);assert.equal(s.surge,0);assert.equal(s.runSeconds,0);
  if(input.forward===0&&input.strafe===0)assert.equal(s.actualSpeed,0);
 }
});
test('a blocked run cannot charge acceleration and can immediately reverse',()=>{
 const wall=new CollisionWorld([boxCollider(0,-3,5,.5)]),s=createMotionState(0,0);
 tick(s,forward,wall,8);assert.equal(s.surge,0);assert.equal(s.runSeconds,0);assert.ok(s.blockedFor>5);assert.equal(s.actualSpeed,0);
 const z=s.z;stepMotion(s,{...forward,forward:-1},1/60,wall);assert.ok(s.z>z);assert.equal(s.surge,0);
});
test('sharp steering sheds the extra speed smoothly; release removes all momentum',()=>{
 const s=createMotionState(0,0),world=empty();tick(s,forward,world,8);const speed=s.actualSpeed;
 tick(s,{...forward,turn:1},world,.1);assert.ok(s.actualSpeed<speed&&s.actualSpeed>CRUISE_SPEED);assert.equal(s.runSeconds,0);
 tick(s,{...forward,turn:1},world,1);assert.equal(s.surge,0);
 stepMotion(s,{...forward,forward:0,turn:0},1/60,world);assert.equal(s.actualSpeed,0);assert.equal(s.yawRate,0);
});
test('manual keyboard sprint keeps its existing ceiling and does not stack with auto acceleration',()=>{
 const s=createMotionState(0,0);tick(s,{...forward,sprint:true},empty(),10);
 assert.ok(Math.abs(s.actualSpeed-18)<1e-8);assert.equal(s.surge,0);
});
test('swept contact stops a high speed crossing of a thin post',()=>{
 const world=new CollisionWorld([circleCollider(0,0,.045,'signpost')]);
 const p=world.move(-10,0,40,0);assert.ok(p.x<-.275&&p.x>-.276);assert.equal(p.z,0);assert.ok(world.clearance(p.x,p.z)>0);
 const away=world.move(p.x,p.z,-1,0);assert.ok(away.x<p.x-.99);
});
test('building faces permit a parallel slide without invisible seams',()=>{
 const world=new CollisionWorld([boxCollider(0,0,2,3,'house')]);let p={x:2.24,z:-6};
 for(let i=0;i<120;i++){p=world.move(p.x,p.z,0,.1);assert.ok(world.clearance(p.x,p.z)>=-1e-8);}
 assert.ok(p.z>5.99);assert.equal(p.x,2.24);
});
test('rounded building corners do not behave like an oversized square',()=>{
 const world=new CollisionWorld([boxCollider(0,0,2,2)]),p=world.move(2.16,2.20,.04,-.04);
 assert.ok(Math.abs(p.x-2.20)<1e-10&&Math.abs(p.z-2.16)<1e-10);
});
test('simultaneous contacts are stable regardless of insertion order',()=>{
 const shapes=[boxCollider(0,0,.5,5),boxCollider(0,0,5,.5)];
 const a=new CollisionWorld(shapes).move(-3,-3,5,5),b=new CollisionWorld([...shapes].reverse()).move(-3,-3,5,5);
 assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.001);assert.ok(a.x<=-.73&&a.z<=-.73);
});
test('a partly embedded spawn can walk outward without a camera-popping displacement',()=>{
 const world=new CollisionWorld([circleCollider(0,0,1)]),out=world.move(.9,0,.05,0),inward=world.move(.9,0,-.05,0);
 assert.ok(Math.abs(out.x-.95)<1e-10);assert.ok(Math.abs(inward.x-.9)<1e-10);
});
test('spatial candidates agree with a full scan across negative cells, corners and long sweeps',()=>{
 class FlatWorld extends CollisionWorld {query(){this.candidates.length=0;for(let i=0;i<this.obstacles.length;i++)this.candidates.push(i);return this.candidates;}}
 const shapes=[];let seed=92;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<160;i++){const x=rnd()*80-40,z=rnd()*80-40;shapes.push(i%2?circleCollider(x,z,rnd()+.03):boxCollider(x,z,rnd()+.1,rnd()+.1));}
 const a=new CollisionWorld(shapes),b=new FlatWorld(shapes);
 for(let i=0;i<160;i++){const x=rnd()*90-45,z=rnd()*90-45,dx=rnd()*20-10,dz=rnd()*20-10,p=a.move(x,z,dx,dz),q=b.move(x,z,dx,dz);assert.ok(Math.hypot(p.x-q.x,p.z-q.z)<1e-7);}
});
test('far away scene props do not increase local narrow-phase work',()=>{
 const shapes=[circleCollider(0,0,.1)];for(let i=0;i<10000;i++)shapes.push(circleCollider(100+i%100*10,100+Math.floor(i/100)*10,.1));
 const world=new CollisionWorld(shapes);world.move(-1,0,2,0);assert.ok(world.checks<10,world.checks);
});
test('touch origin is neutral and a short held stroke stays active without additional move events',()=>{
 const g=new GestureInput();assert.equal(g.begin(touch(1,195,200),bounds),false);g.end(touch(1));
 assert.ok(g.begin(touch(2),bounds));assert.deepEqual(g.value,{x:0,y:0});g.move(touch(2,195,693));const value={...g.value};assert.ok(value.y<0);
 assert.deepEqual(g.value,value);g.end(touch(2));assert.equal(g.held,false);assert.deepEqual(g.value,{x:0,y:0});
});
test('a second finger blocks gestures until both fingers have lifted',()=>{
 const g=new GestureInput();g.begin(touch(1),bounds);g.move(touch(1,195,660));g.begin({...touch(2),isPrimary:false},bounds);
 assert.equal(g.held,false);assert.equal(g.blocked,true);g.end(touch(1));assert.equal(g.blocked,true);g.end(touch(2));assert.equal(g.blocked,false);
 assert.ok(g.begin(touch(3),bounds));g.reset();assert.equal(g.contacts.size,0);assert.ok(g.begin(touch(4),bounds));
});
test('mouse button loss clears the owner and mixed keyboard input stays bounded',()=>{
 const g=new GestureInput(),m={...touch(1),pointerType:'mouse',buttons:1};g.begin(m,bounds);g.move({...m,clientY:660});assert.ok(g.held);
 g.move({...m,buttons:0});assert.equal(g.held,false);
 const i=readMovementInput({x:1,y:-1},new Set(['KeyW','KeyE']));assert.equal(i.forward,1);assert.equal(i.turn,1);
 assert.equal(readMovementInput(null,new Set(['KeyW','KeyS'])).forward,0);
});
test('releasing the walking mouse button stops the drag while another button stays held',()=>{
 // Chromium reports a chorded release as pointermove with the remaining buttons, not pointerup.
 for(const other of [2,4]){
  const g=new GestureInput(),m={...touch(1),pointerType:'mouse',buttons:1};g.begin(m,bounds);g.move({...m,clientY:657});assert.ok(g.held);
  g.move({...m,clientY:657,buttons:1|other});assert.ok(g.held,'pressing another button keeps the walk');
  assert.equal(g.move({...m,clientY:657,buttons:other}),false);assert.equal(g.held,false,`buttons=${other}`);assert.deepEqual(g.value,{x:0,y:0});
  assert.equal(g.move({...m,clientY:600,buttons:other}),false);assert.deepEqual(g.value,{x:0,y:0});
 }
 // Touch and pen keep their existing pointerup/cancel ownership.
 const pen=new GestureInput(),p={...touch(1),pointerType:'pen',buttons:1};pen.begin(p,bounds);pen.move({...p,clientY:657,buttons:2});assert.ok(pen.held);
});

test('clear starts never penetrate scene props after a swept slide',()=>{
 const shapes=[boxCollider(0,0,2,3),circleCollider(-4,-3,.3),circleCollider(4,2,.045),boxCollider(-4,4,1,.6)];
 const world=new CollisionWorld(shapes);let seed=771;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<600;i++){const x=rnd()*20-10,z=rnd()*20-10;if(world.clearance(x,z)<.001)continue;const p=world.move(x,z,rnd()*16-8,rnd()*16-8);assert.ok(world.clearance(p.x,p.z)>=-1e-7,JSON.stringify(p));}
});
test('collision snapshots reject invalid dimensions and cannot be desynchronised by caller mutation',()=>{
 const shape=circleCollider(0,0,1),world=new CollisionWorld([shape]);shape.x=100;
 assert.ok(world.move(-2,0,4,0).x<-1.23);
 assert.throws(()=>new CollisionWorld([circleCollider(0,0,NaN)]),TypeError);
 assert.throws(()=>new CollisionWorld([],{cellSize:0}),TypeError);
 const s=createMotionState(0,0);stepMotion(s,forward,0,world);assert.equal(s.x,0);assert.equal(s.z,0);
});

test('extra travel speed does not turn footsteps into a rapid click loop',()=>{
 for(let speed=.1;speed<=18;speed+=.1)assert.ok(speed/footStride(speed)<4.2);
 assert.ok(CRUISE_SPEED/footStride(CRUISE_SPEED)>3);
});
