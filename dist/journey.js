// Presentation only: no terrain, input, collision, persistence or DOM state.
export const journeyScenes=Object.freeze([
 {id:'boat',kind:'boat',x:17,z:26,radius:9,name:'帰りを待つ舟',words:'舟は陸に上がったまま。\n櫂だけが、海のほうを向いている。'},
 {id:'chairs',kind:'chairs',x:30,z:-87,radius:10,name:'ふたり分の椅子',words:'片方だけ、少し海に近い。\n誰かの座り方を、まだ覚えている。'},
 {id:'post',kind:'post',x:-34,z:-177,radius:12,name:'ほどけた道しるべ',words:'消えかけた文字の下に、小さな矢印。\n誰かもここで、道を選んだ。'},
 {id:'harbour',kind:'washing',x:-309,z:-365,radius:13,name:'風に残る暮らし',words:'取り込まれない白い布。\n風が吹くたび、家に人がいるようだ。'},
 {id:'fields',kind:'chairs',x:-245,z:-504,radius:12,name:'畑の休み時間',words:'湯のみがふたつ。\n話のつづきは、風の中にある。'},
 {id:'waiting',kind:'shelter',x:480,z:-481,radius:15,name:'潮待ちの待合',words:'時刻表のない、小さな待合。\nここでは、海が帰る時間を決める。'},
 {id:'window',kind:'window',x:1050,z:-723,radius:15,name:'海へ開く窓',words:'壁はなくなり、窓だけが残った。\n眺めていた海は、今もここにある。'},
 {id:'shells',kind:'shells',x:884,z:-824,radius:12,name:'置き手紙のかわりに',words:'平たい石に、小さな貝が三つ。\n持ち帰らずに、もう少し見ていた。'}
]);

// Smooth regional colour washes, with low-frequency variation between landmarks.
// The existing height field remains the single source of the walking surface.
const landscapeWashes=[
  [-35,-61,43,52,[.63,.57,.68]],
  [-226,-505,115,125,[.72,.73,.50]],
  [0,-425,58,175,[.50,.59,.59]],
  [590,-514,110,100,[.80,.79,.66]],
  [735,-405,100,100,[.48,.65,.61]],
  [910,-520,110,120,[.68,.60,.69]],
  [1080,-750,110,100,[.65,.71,.73]],
  [865,-850,100,100,[.82,.72,.67]]
 ];
export function landscapeColor(x,z,base){
 let r=base[0],g=base[1],b=base[2];
 for(const [cx,cz,rx,rz,tint] of landscapeWashes){
  const d=((x-cx)/rx)**2+((z-cz)/rz)**2;
  if(d>=3)continue;
  const amount=Math.exp(-d*1.6)*.5;
  r+=(tint[0]-r)*amount;g+=(tint[1]-g)*amount;b+=(tint[2]-b)*amount;
 }
 const patch=Math.sin(x*.075+Math.sin(z*.039)*2)*Math.sin(z*.064+x*.018)*.025;
 return [r+patch,g+patch,b+patch];
}

export function readingSeconds(words){return Math.min(9,Math.max(5,Array.from(words).length*.16));}

// All transient text shares a single channel. Greeting can interrupt a place name;
// places never interrupt speech. Requests are local, not a stale notification queue.
export class JourneyNotices {
 constructor(){this.active=null;this.until=-Infinity;this.enabled=true;}
 show(kind,key,now,duration){
  if(!this.enabled)return false;
  const current=this.current(now);
  if(current&&(kind!=='greeting'||current.kind==='greeting'))return false;
  this.active={kind,key};this.until=now+duration;return true;
 }
 current(now){if(now>=this.until)this.active=null;return this.active;}
 clear(){this.active=null;this.until=-Infinity;}
 setEnabled(enabled){this.enabled=enabled;this.clear();}
}
