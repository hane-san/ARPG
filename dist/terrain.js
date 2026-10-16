export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
export function height(x,z){
 const a=Math.atan2(z/39,x/35),r=Math.hypot(x/35,z/39),edge=1+.07*Math.sin(3*a)+.055*Math.cos(5*a)-r;
 const main=Math.min(1.45,edge*9)+smooth(0,.3,edge)*(5.2*Math.exp(-((x+12)**2/145+(z+16)**2/170))+2.8*Math.exp(-((x-15)**2/90+(z+15)**2/135)));
 const bar=.34-((z-22)/3.2)**2*.5-Math.max(0,-x-47)*.4-Math.max(0,x+17)*.3;
 const islet=1.3-Math.hypot((x+48)/5,(z-22)/6)*1.5;
 return Math.max(-3,main,bar,islet);
}
export function pointerInput(x,y){const turn=smooth(.48,.97,Math.abs(x));return{forward:-y,strafe:x*(1-turn),turn:Math.sign(x)*turn};}
export function walkable(x,z){return height(x,z)>.12;}
