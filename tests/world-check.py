"""Walk the production collision geometry; QA access exists only in an intercepted local module."""
import os,atexit,json,math,subprocess,time
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
 view(yaw){player.yaw=yaw;resetCameraHistory();render();},routes,landmarks,
 clearance(){let closest=Infinity;for(const route of routes)for(let i=1;i<route.length;i++){
  const [ax,az]=route[i-1],[bx,bz]=route[i],len=Math.hypot(bx-ax,bz-az);
  for(let t=0;t<=1;t+=.25/len)closest=Math.min(closest,collisionWorld.clearance(ax+(bx-ax)*t,az+(bz-az)*t));
 }return {closest};}

};
'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1100,'height':760},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 source=(root/'dist/island.js').read_text()+probe
 page.route('**/island.js?*',lambda route:route.fulfill(status=200,content_type='application/javascript',body=source))
 page.goto('http://127.0.0.1:4174/',wait_until='networkidle');page.wait_for_function('!!window._qa');page.locator('#begin').click()
 page.wait_for_function('getComputedStyle(document.querySelector("#arrival")).visibility === "hidden"')
 assert page.evaluate('nagi.worldVertices')<900000
 assert page.evaluate('nagi.islanders')==18
 assert page.evaluate('nagi.monuments')==5
 clearance=page.evaluate('_qa.clearance()');assert clearance['closest']>.15,clearance
 print('route obstacle clearance:',clearance,'vertices:',page.evaluate('nagi.worldVertices'),flush=True)
 legs=[('umbrella-grove',[[5,22],[0,12],[-3,1],[-9,-6],[-10,-18],[-10,-27],[-10,-34],[-23,-44],[-36,-57]],-.1),
       ('flower-ridge',[[-36,-70],[-18,-81]],-.7),
       ('headland',[[0,-85],[6,-100]],0),
       ('olive-terraces',[[12,-91],[20,-83],[36,-65]],-1.3),
       ('glass-cove',[[19,-57],[29,-55]],-2.1),
       ('wind-ring-approach',[[19,-57],[36,-65],[20,-83],[12,-91],[6,-100],[10,-112],[-10,-137],[-25,-165],[0,-195],[-40,-214]],1.126),
       ('wind-ring',[[-105,-245]],.05),
       ('harbour-town',[[-245,-285],[-310,-335]],1.4),
       ('rice-terraces',[[-265,-425],[-225,-510]],.9),
       ('open-pyramid',[[-120,-580]],.2),
       ('celestial-sphere',[[-110,-690],[-70,-795],[0,-840]],0),
       ('white-quarry',[[95,-730],[220,-650],[315,-525]],-1),
       ('sea-causeway',[[290,-400],[360,-440],[430,-480]],-1.1),
       ('mirror-salt-fields',[[510,-510],[590,-505]],.2),
       ('reed-garden',[[650,-460],[735,-410]],-.5),
       ('windmill-hill',[[820,-435],[910,-520]],.5),
       ('white-lighthouse',[[1020,-575],[1110,-645]],-1.57),
       ('sea-library',[[1075,-755]],0),
       ('starry-sand',[[1075,-795],[980,-820],[865,-850]],0),
       ('salt-shortcut',[[750,-790],[665,-710],[640,-570],[590,-505]],0),
       ('eastern-return',[[640,-570],[665,-710],[590,-650],[510,-600],[430,-570],[395,-600],[340,-590],[315,-570],[315,-525]],1),
       ('spiral-garden',[[290,-400],[175,-305]],0),
       ('layered-gorge',[[65,-240],[0,-195],[-105,-245],[20,-310],[0,-390]],.1),
       ('gorge-return',[[-15,-490],[-35,-570],[-120,-580],[-35,-570],[-15,-490],[0,-390],[20,-310],[-105,-245],[0,-195],[-25,-165],[-10,-137],[10,-112],[6,-100],[12,-91],[20,-83],[36,-65],[19,-57]],0),
       ('return-shrine',[[19,-57],[8,-40],[-10,-34],[-10,-27],[-10,-18],[-9,-6],[-3,1],[0,12],[5,22],[8,30]],.25)]
 for name,points,yaw in legs:
  result=page.evaluate('(points)=>_qa.walk(points)',points)
  page.evaluate('(yaw)=>_qa.view(yaw)',yaw);page.wait_for_timeout(400)
  page.screenshot(path=str(root/(name+'.png')))
  print(name,json.dumps({'position':result['position'],'drawnVertices':page.evaluate('nagi.renderedVertices'),'drawCalls':page.evaluate('nagi.drawCalls')}),flush=True)
 assert {'風環の丘','凪見の港町','重ね石の渓谷','ひかりの棚田','空洞のピラミッド','岬の天球','白い石切り場','ねじれの庭','薄紫の傘の森','風を待つ段々畑','硝子の入江','空に近い岬','花の尾根道','潮を渡る石道','水鏡の塩田','葦と水路の庭','風車の丘','白灯台の岬','海の図書室','星砂の環'}.issubset(set(page.evaluate('nagi.places')))
 assert not errors,errors
 print('whole expanded island loop + gorge shortcut + cove spur + return: production movement, collisions, destination triggers and rendering passed',flush=True)
 browser.close()
