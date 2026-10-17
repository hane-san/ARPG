export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
// A continuous loop connects the old shrine to four different northern landscapes.
export const routes=[[[8,32],[5,22],[0,12],[-3,1],[-4,-11]],[[0,12],[14,14],[23,14],[23,8]],[[-3,1],[-9,-6],[-10,-18],[-10,-27],[-10,-34],[-23,-44],[-36,-57],[-36,-70],[-18,-81],[0,-85],[6,-100],[12,-91],[20,-83],[36,-65],[19,-57],[8,-40],[-10,-34]],[[19,-57],[29,-55]]];
export const landmarks=[['浜の入口','THE LANDING',8,27,7],['オリーブの小径','OLIVE PATH',0,8,6],['潮見の鳥居','THE TIDE GATE',23,8,6],['名のない祠','THE HILL SHRINE',-4,-13,6],['潮待ちの砂州','THE TIDAL PATH',-31,22,8],['夢のつづき','THE OTHER SHORE',-48,22,5],['薄紫の傘の森','THE UMBRELLA GROVE',-36,-57,9],['風を待つ段々畑','THE OLIVE TERRACES',36,-65,8],['硝子の入江','THE GLASS COVE',29,-55,6],['空に近い岬','THE QUIET HEADLAND',6,-100,7],['花の尾根道','THE FLOWER RIDGE',-18,-81,7]];
export function distanceToRoute(x,z,paths=routes){let d=Infinity;for(const points of paths)for(let i=1;i<points.length;i++){const [ax,az]=points[i-1],[bx,bz]=points[i],t=clamp(((x-ax)*(bx-ax)+(z-az)*(bz-az))/((bx-ax)**2+(bz-az)**2),0,1);d=Math.min(d,Math.hypot(x-ax-t*(bx-ax),z-az-t*(bz-az)));}return d;}
function originalHeight(x,z){
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
// A compressed, kilometre-wide Setouchi-inspired island, not a real-world replica.
export const WORLD_BOUNDS={minX:-512,maxX:512,minZ:-1024,maxZ:64};
export const expeditionRoute=[[6,-100],[10,-112],[-10,-137],[-25,-165],[0,-195],[-105,-245],[-245,-285],[-310,-335],[-265,-425],[-225,-510],[-120,-580],[-110,-690],[-70,-795],[0,-840],[95,-730],[220,-650],[315,-525],[290,-400],[175,-305],[65,-240],[0,-195]];
export const valleyRoute=[[-105,-245],[20,-310],[0,-390],[-15,-490],[-35,-570],[-120,-580]];
routes.push(expeditionRoute,valleyRoute);
landmarks.push(['風環の丘','THE WIND RING',-105,-245,25],['凪見の港町','NAGIMI HARBOUR',-310,-335,30],['重ね石の渓谷','THE LAYERED GORGE',0,-390,25],['ひかりの棚田','THE TERRACED FIELDS',-225,-510,28],['空洞のピラミッド','THE OPEN PYRAMID',-120,-580,28],['岬の天球','THE CELESTIAL SPHERE',0,-840,28],['白い石切り場','THE WHITE QUARRY',315,-525,28],['ねじれの庭','THE SPIRAL GARDEN',175,-305,25]);
export const monuments=[{kind:'ring',x:-105,z:-245,size:22},{kind:'pyramid',x:-120,z:-580,size:28},{kind:'sphere',x:0,z:-840,size:14},{kind:'cube',x:338,z:-535,size:22},{kind:'spiral',x:175,z:-305,size:20}];
function rawHeight(x,z){
 const old=z<-128?-3:originalHeight(x,z);
 if(z>-112)return old;
 const lobe=(cx,cz,rx,rz,level,rise)=>{const r=Math.hypot((x-cx)/rx,(z-cz)/rz),edge=1-r+.025*Math.sin(x*.026+z*.019);return Math.min(level,edge*25)+smooth(0,.36,edge)*rise*Math.exp(-r*r*2.2);};
 let land=Math.max(lobe(-25,-160,68,92,4,7),lobe(-130,-335,245,235,8,42),lobe(170,-430,270,270,7,38),lobe(-50,-665,245,250,9,48),lobe(240,-660,145,170,5,18));
 const valleyX=.15*(z+400),valley=25*Math.exp(-(((x-valleyX)/39)**2))*smooth(-620,-540,z)*(1-smooth(-310,-260,z));
 land=Math.max(3,land-valley)*smooth(-2,3,land)+Math.min(0,land);
 land=Math.min(land,(-112-z)*.6);
 // A large eastern bay and a southern inlet give the coastline several distinct silhouettes.
 const bay=Math.hypot((x-420)/100,(z+370)/100);
 const inlet=Math.hypot((x+240)/65,(z+720)/105);
 land=Math.min(land,(bay-1)*28,(inlet-1)*20);
 return Math.max(old,land,-3);
}
// The collision surface uses the same triangles as the mesh. Camera height never chases a different floor.
export function terrainStep(x,z){return x>=-64&&x<=64&&z>=-128&&z<=64?2:8;}
function vertexHeight(x,z){
 if(z===-128&&x>=-64&&x<=64){const a=Math.floor(x/8)*8,t=(x-a)/8;return rawHeight(a,z)*(1-t)+rawHeight(a+8,z)*t;}
 if((x===-64||x===64)&&z>=-128&&z<=64){const a=Math.floor(z/8)*8,t=(z-a)/8;return rawHeight(x,a)*(1-t)+rawHeight(x,a+8)*t;}
 return rawHeight(x,z);
}
export function height(x,z){
 const step=terrainStep(x,z),ax=Math.floor(x/step)*step,az=Math.floor(z/step)*step,u=(x-ax)/step,v=(z-az)/step;
 const a=vertexHeight(ax,az),b=vertexHeight(ax+step,az),c=vertexHeight(ax,az+step);
 if(u+v<=1)return a+(b-a)*u+(c-a)*v;
 const d=vertexHeight(ax+step,az+step);return d+(c-d)*(1-u)+(b-d)*(1-v);
}
export const MOON_DIRECTION=(()=>{const v=[-.3,.31,-.9],n=Math.hypot(...v);return v.map(x=>x/n)})();
export function skyRay(u,v,yaw,aspect,fov=68){const t=Math.tan(fov*Math.PI/360),x=(u*2-1)*aspect*t,y=(v*2-1)*t,z=-1,c=Math.cos(yaw),s=Math.sin(yaw),ray=[c*x+s*z,y,-s*x+c*z],n=Math.hypot(...ray);return ray.map(a=>a/n);}
export function turnVelocity(current,input,speed,dt){
 if(Math.abs(input)<.00001)return 0;
 const target=clamp(input,-1,1)*(1.25-.3*smooth(0,7.8,speed));
 const delta=(target-current)*(1-Math.exp(-dt*9));return current+clamp(delta,-2.8*dt,2.8*dt);
}
// One thumb: independent throttle and steering, never an implicit strafe/turn switch.
export function pointerInput(x,y){
 x=clamp(x,-1,1);y=clamp(y,-1,1);
 return {forward:y===0?0:-Math.sign(y)*Math.pow(Math.abs(y),.8),strafe:0,turn:Math.sign(x)*Math.pow(Math.abs(x),1.35)};
}
export function walkable(x,z){return height(x,z)>.12;}
// Identical travel at either side of the screen; a little more horizontal forgiveness while running.
export function dragInput(dx,dy,width,height){
 const throttleTravel=clamp(Math.min(width,height)*.08,28,36),steeringTravel=clamp(Math.min(width,height)*.19,64,96);
 const axis=(d,dead,travel)=>Math.abs(d)<=dead?0:Math.sign(d)*clamp((Math.abs(d)-dead)/(travel-dead),0,1);
 const y=axis(dy,3,throttleTravel),x=axis(dx,7+6*Math.abs(y),steeringTravel);
 return {x,y};
}
// Resolve a full vector first, then slide along the contact tangent. No preferred world X/Z axis.
export function moveOnIsland(x,z,dx,dz,obstacles=[]){
 const blocked=(a,b)=>!walkable(a,b)||obstacles.some(([ox,oz,r])=>Math.hypot(a-ox,b-oz)<r+.23);
 let nx=x+dx,nz=z+dz;
 if(!blocked(nx,nz))return {x:nx,z:nz};
 let normal=null;
 for(const [ox,oz,r] of obstacles)if(Math.hypot(nx-ox,nz-oz)<r+.23){normal=[nx-ox,nz-oz];break;}
 const shore=!normal;
 if(shore)normal=[height(nx-.15,nz)-height(nx+.15,nz),height(nx,nz-.15)-height(nx,nz+.15)];
 const length=Math.hypot(...normal);if(length<.0001)return {x,z};
 const [ax,az]=normal.map(n=>n/length),dot=dx*ax+dz*az;
 const intended=Math.hypot(dx,dz);
 if(dot<0){dx-=dot*ax;dz-=dot*az;}
 // A head-on shoreline contact should stop, rather than quietly carrying the player sideways.
 if(shore&&Math.hypot(dx,dz)<intended*.55)return {x,z};
 nx=x+dx;nz=z+dz;
 return blocked(nx,nz)?{x,z}:{x:nx,z:nz};
}
