"""Walk the production collision geometry; QA access exists only in an intercepted local module."""
import atexit,json,math,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=subprocess.Popen(['python3','-m','http.server','4174','--bind','127.0.0.1','--directory',str(root)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
atexit.register(server.terminate);time.sleep(.3)
# Inject test access in memory, never into the shipped game or its diagnostic object.
probe='''
window._qa={
 walk(points){keys.clear();keys.add('KeyW');let steps=0;
  for(const [x,z] of points){let stuck=0;while(Math.hypot(x-player.x,z-player.z)>.19){
   const oldX=player.x,oldZ=player.z;player.yaw=Math.atan2(player.x-x,player.z-z);player.yawRate=0;
   time+=1/60;update(1/60);steps++;
   if(Math.hypot(player.x-oldX,player.z-oldZ)<.0001)stuck++;else stuck=0;
   if(stuck>15||steps>16000){keys.clear();throw Error('Blocked en route to '+[x,z]+' at '+[player.x,player.z]);}
  }}keys.clear();update(1/60);return {steps,position:{...player}};
 },
 view(yaw){player.yaw=yaw;render();},routes,landmarks,
 clearance(){let closest=Infinity,at=null;for(const route of routes)for(let i=1;i<route.length;i++){
  const [ax,az]=route[i-1],[bx,bz]=route[i],len=Math.hypot(bx-ax,bz-az);
  for(let t=0;t<=1;t+=.25/len)for(const [x,z,r] of obstacles){const d=Math.hypot(ax+(bx-ax)*t-x,az+(bz-az)*t-z)-r-.23;if(d<closest){closest=d;at=[x,z];}}
 }return {closest,at};}
};
'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1100,'height':760},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 source=(root/'dist/island.js').read_text()+probe
 page.route('**/island.js?*',lambda route:route.fulfill(status=200,content_type='application/javascript',body=source))
 page.goto('http://127.0.0.1:4174/',wait_until='networkidle');page.wait_for_function('!!window._qa');page.locator('#begin').click()
 page.wait_for_function('getComputedStyle(document.querySelector("#arrival")).visibility === "hidden"')
 assert page.evaluate('nagi.worldVertices')<550000
 assert page.evaluate('nagi.islanders')==7
 clearance=page.evaluate('_qa.clearance()');assert clearance['closest']>.15,clearance
 print('route obstacle clearance:',clearance,'vertices:',page.evaluate('nagi.worldVertices'),flush=True)
 legs=[('umbrella-grove',[[5,22],[0,12],[-3,1],[-9,-6],[-10,-18],[-10,-27],[-10,-34],[-23,-44],[-36,-57]],-.1),
       ('flower-ridge',[[-36,-70],[-18,-81]],-.7),
       ('headland',[[0,-85],[6,-100]],0),
       ('olive-terraces',[[12,-91],[20,-83],[36,-65]],-1.3),
       ('glass-cove',[[19,-57],[29,-55]],-2.1),
       ('return-shrine',[[19,-57],[8,-40],[-10,-34],[-10,-27],[-10,-18],[-9,-6],[-3,1],[0,12],[5,22],[8,30]],.25)]
 for name,points,yaw in legs:
  result=page.evaluate('(points)=>_qa.walk(points)',points)
  page.evaluate('(yaw)=>_qa.view(yaw)',yaw);page.wait_for_timeout(400)
  page.screenshot(path=str(root/(name+'.png')))
  print(name,json.dumps(result['position']),flush=True)
 assert {'薄紫の傘の森','風を待つ段々畑','硝子の入江','空に近い岬','花の尾根道'}.issubset(set(page.evaluate('nagi.places')))
 assert not errors,errors
 print('whole northern loop + cove spur + return: production movement, collisions, destination triggers and rendering passed',flush=True)
 browser.close()
