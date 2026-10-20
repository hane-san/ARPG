import test from 'node:test';
import assert from 'node:assert/strict';
import {JourneyNotices,readingSeconds,landscapeColor,journeyScenes} from '../dist/journey.js';
import {height,distanceToRoute} from '../dist/terrain.js';

test('speech interrupts a place name, while a passing place never cuts off speech',()=>{
 const notices=new JourneyNotices();
 assert(notices.show('place','landing',0,4));
 assert(notices.show('greeting','islander',1,6));
 assert(!notices.show('place','grove',2,4));
 assert(!notices.show('scene','boat',3,5));
 assert.deepEqual(notices.current(6),{kind:'greeting',key:'islander'});
 assert.equal(notices.current(7),null);
 // Rejected requests are not queued for a place the traveller has already left.
 assert.equal(notices.current(20),null);
});

test('quiet mode clears existing words and prevents notifications until enabled again',()=>{
 const notices=new JourneyNotices();
 notices.show('greeting','islander',0,8);notices.setEnabled(false);
 assert.equal(notices.current(1),null);
 assert(!notices.show('place','grove',2,4));
 notices.setEnabled(true);
 assert(notices.show('place','cove',3,4));
 notices.clear();assert.equal(notices.current(3),null);
});

test('a greeting never replaces a sentence that is still being read',()=>{
 const notices=new JourneyNotices();
 assert(notices.show('greeting','first',0,6));
 assert(!notices.show('greeting','second',5,8));
 assert(notices.show('greeting','second',6,8));
 assert.equal(notices.current(14),null);
 assert.equal(readingSeconds('……ようこそ。'),5);
 assert.equal(readingSeconds('旅'.repeat(100)),9);
});

test('the regional palette varies along the journey without hard colour seams',()=>{
 const base=[.67,.72,.65],grove=landscapeColor(-35,-61,base),reeds=landscapeColor(735,-405,base);
 assert(Math.hypot(...grove.map((v,i)=>v-reeds[i]))>.07);
 for(const scene of journeyScenes){
  const a=landscapeColor(scene.x,scene.z,base),b=landscapeColor(scene.x+.01,scene.z+.01,base);
  assert(a.every(v=>Number.isFinite(v)&&v>0&&v<1));
  assert(a.every((v,i)=>Math.abs(v-b[i])<.001));
 }
});

test('every quiet scene sits on dry land outside the existing walking lane',()=>{
 assert.equal(new Set(journeyScenes.map(s=>s.id)).size,journeyScenes.length);
 for(const scene of journeyScenes){
  assert(height(scene.x,scene.z)>.4,scene.name+' must not be in the sea');
  assert(distanceToRoute(scene.x,scene.z)>10,scene.name+' must leave the path open');
 }
});
