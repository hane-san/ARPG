export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
// A continuous loop connects the old shrine to four different northern landscapes.
export const routes=[[[8,32],[5,22],[0,12],[-3,1],[-4,-11]],[[0,12],[14,14],[23,14],[23,8]],[[-3,1],[-9,-6],[-10,-18],[-10,-27],[-10,-34],[-23,-44],[-36,-57],[-36,-70],[-18,-81],[0,-85],[6,-100],[12,-91],[20,-83],[36,-65],[19,-57],[8,-40],[-10,-34]],[[19,-57],[29,-55]]];
export const landmarks=[['浜の入口','THE LANDING',8,27,7],['オリーブの小径','OLIVE PATH',0,8,6],['潮見の鳥居','THE TIDE GATE',23,8,6],['名のない祠','THE HILL SHRINE',-4,-13,6],['潮待ちの砂州','THE TIDAL PATH',-31,22,8],['夢のつづき','THE OTHER SHORE',-48,22,5],['薄紫の傘の森','THE UMBRELLA GROVE',-36,-57,9],['風を待つ段々畑','THE OLIVE TERRACES',36,-65,8],['硝子の入江','THE GLASS COVE',29,-55,6],['空に近い岬','THE QUIET HEADLAND',6,-100,7],['花の尾根道','THE FLOWER RIDGE',-18,-81,7]];
export function distanceToRoute(x,z,paths=routes){let d=Infinity;for(const points of paths)for(let i=1;i<points.length;i++){const [ax,az]=points[i-1],[bx,bz]=points[i],t=clamp(((x-ax)*(bx-ax)+(z-az)*(bz-az))/((bx-ax)**2+(bz-az)**2),0,1);d=Math.min(d,Math.hypot(x-ax-t*(bx-ax),z-az-t*(bz-az)));}return d;}
export function height(x,z){
 const a=Math.atan2(z/39,x/35),r=Math.hypot(x/35,z/39),edge=1+.07*Math.sin(3*a)+.055*Math.cos(5*a)-r;
 const main=Math.min(1.45,edge*9)+smooth(0,.3,edge)*(5.2*Math.exp(-((x+12)**2/145+(z+16)**2/170))+2.8*Math.exp(-((x-15)**2/90+(z+15)**2/135)));
 const bar=.34-((z-22)/3.2)**2*.5-Math.max(0,-x-47)*.4-Math.max(0,x+17)*.3;
 const islet=1.3-Math.hypot((x+48)/5,(z-22)/6)*1.5;
 const lobe=(cx,cz,rx,rz,level,rise)=>{const r=Math.hypot((x-cx)/rx,(z-cz)/rz),edge=1-r+.025*Math.sin(x*.16+z*.12);return Math.min(level,edge*9)+smooth(0,.38,edge)*rise*Math.exp(-r*r*3);};
 let north=Math.max(lobe(-3,-43,22,27,1.9,1),lobe(-28,-61,29,28,2.1,4.5),lobe(27,-67,34,28,1.8,3),lobe(6,-94,20,25,2.7,5));
 // An opening to the sea, rather than a closed pool: pale sand curves around its rim.
 const cove=Math.hypot((x-47)/24,(z+44)/13);
 north=Math.min(north,(cove-1)*6);
 return Math.max(-3,main,bar,islet,north);
}
// One thumb: independent throttle and steering, never an implicit strafe/turn switch.
export function pointerInput(x,y){
 x=clamp(x,-1,1);y=clamp(y,-1,1);
 return {forward:y===0?0:-Math.sign(y)*Math.pow(Math.abs(y),.8),strafe:0,turn:Math.sign(x)*Math.pow(Math.abs(x),1.35)};
}
export function walkable(x,z){return height(x,z)>.12;}
// Identical travel at either side of the screen; a little more horizontal forgiveness while running.
export function dragInput(dx,dy,width,height){
 const radius=clamp(Math.min(width,height)*.19,64,96);
 const axis=(d,dead)=>Math.abs(d)<=dead?0:Math.sign(d)*clamp((Math.abs(d)-dead)/(radius-dead),0,1);
 const y=axis(dy,9),x=axis(dx,9+4*Math.abs(y));
 return {x,y};
}
// Resolve a full vector first, then slide along the contact tangent. No preferred world X/Z axis.
export function moveOnIsland(x,z,dx,dz,obstacles=[]){
 const blocked=(a,b)=>!walkable(a,b)||obstacles.some(([ox,oz,r])=>Math.hypot(a-ox,b-oz)<r+.23);
 let nx=x+dx,nz=z+dz;
 if(!blocked(nx,nz))return {x:nx,z:nz};
 let normal=null;
 for(const [ox,oz,r] of obstacles)if(Math.hypot(nx-ox,nz-oz)<r+.23){normal=[nx-ox,nz-oz];break;}
 if(!normal)normal=[height(nx-.15,nz)-height(nx+.15,nz),height(nx,nz-.15)-height(nx,nz+.15)];
 const length=Math.hypot(...normal);if(length<.0001)return {x,z};
 const [ax,az]=normal.map(n=>n/length),dot=dx*ax+dz*az;
 if(dot<0){dx-=dot*ax;dz-=dot*az;}
 nx=x+dx;nz=z+dz;
 return blocked(nx,nz)?{x,z}:{x:nx,z:nz};
}
