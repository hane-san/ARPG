import test from 'node:test';import assert from 'node:assert/strict';import {height,walkable,pointerInput} from '../dist/terrain.js';
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
