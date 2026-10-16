"""Gameplay regression checks: native touch gestures, motion, sound, and desktop keys."""
import atexit,json,math,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=subprocess.Popen(['python3','-m','http.server','4173','--bind','127.0.0.1','--directory',str(root/'dist')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
atexit.register(server.terminate)
time.sleep(.5)

def distance(a,b):return math.hypot(a['x']-b['x'],a['z']-b['z'])
def moved(page,start,amount):
 page.wait_for_function(f'Math.hypot(nagi.position.x-({start["x"]}),nagi.position.z-({start["z"]})) > {amount}',timeout=45000)
def stopped(page):
 a=page.evaluate('nagi.position');steps=page.evaluate('nagi.footsteps');page.wait_for_timeout(600)
 assert distance(a,page.evaluate('nagi.position'))<.002
 assert page.evaluate('nagi.footsteps')==steps

audio_probe="""window._footBuffers=[];const AC=window.AudioContext||window.webkitAudioContext;const create=AC.prototype.createBuffer;AC.prototype.createBuffer=function(...args){const buffer=create.apply(this,args);if(buffer.duration<.3)window._footBuffers.push(buffer);return buffer;};"""
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script(audio_probe)
 page.goto('http://127.0.0.1:4173/',wait_until='networkidle')
 assert page.evaluate('!!window.nagi'),errors
 page.screenshot(path=str(root/'arrival.png'))
 page.locator('#begin').click()
 page.wait_for_function("getComputedStyle(document.querySelector('#arrival')).visibility === 'hidden'",timeout=15000)
 assert page.evaluate("getComputedStyle(document.querySelector('canvas')).cursor")=='none'
 assert page.locator('#arrival').evaluate("e=>getComputedStyle(e).visibility")=='hidden'
 before=page.evaluate('nagi.position');initial_steps=page.evaluate('nagi.footsteps')
 page.keyboard.down('w');moved(page,before,3)
 assert page.evaluate('nagi.speed')>5.8
 page.keyboard.up('w');page.wait_for_timeout(300)
 after=page.evaluate('nagi.position')
 assert after['z']<before['z']-2 and after['yaw']==before['yaw']
 assert page.evaluate('nagi.footsteps')>initial_steps
 page.keyboard.down('s');moved(page,after,1.5);page.keyboard.up('s');page.wait_for_timeout(300)
 back=page.evaluate('nagi.position')
 assert back['z']>after['z']+1 and back['yaw']==after['yaw']
 page.keyboard.down('ArrowRight');page.wait_for_function(f'nagi.position.yaw < {back["yaw"]-.4}',timeout=30000);page.keyboard.up('ArrowRight')
 # Mouse uses the same origin-relative gesture: pressing alone is neutral.
 page.mouse.move(720,750);page.mouse.down();stopped(page)
 right=page.evaluate('nagi.position')
 page.mouse.move(870,750);page.wait_for_function(f'nagi.position.yaw < {right["yaw"]-.4}',timeout=30000);page.mouse.up()
 stopped(page)
 # Check the actual generated PCM rather than only an audio callback counter.
 stats=page.evaluate('window._footBuffers.map(b=>{let peak=0,energy=0;for(const v of b.getChannelData(0)){peak=Math.max(peak,Math.abs(v));energy+=v*v;}return {peak,rms:Math.sqrt(energy/b.length)};})')
 assert len(stats)==6 and all(.01<s['peak']<1 and s['rms']>.005 for s in stats),stats
 assert page.evaluate('nagi.audioState')=='running'
 page.reload(wait_until='networkidle');page.locator('#begin').click();page.keyboard.down('w');page.wait_for_function('nagi.greeted > 0',timeout=90000);page.keyboard.up('w');page.wait_for_timeout(1500)
 page.screenshot(path=str(root/'greeting.png'));assert page.locator('#words').inner_text()
 print('desktop: fast forward, backward without turning, origin-relative mouse, greetings, and non-clipping footstep PCM passed',flush=True)
 page.close()
 # Real CDP touch events exercise pointer capture and cancellation on a mobile viewport.
 context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 mobile=context.new_page();mobile.on('pageerror',lambda e:errors.append(str(e)))
 mobile.goto('http://127.0.0.1:4173/',wait_until='networkidle');mobile.screenshot(path=str(root/'mobile.png'))
 mobile.locator('#begin').tap();mobile.wait_for_function("getComputedStyle(document.querySelector('#arrival')).visibility === 'hidden'",timeout=15000)
 cdp=context.new_cdp_session(mobile)
 def touch(kind,x=0,y=0):
  points=[] if kind in ['touchEnd','touchCancel'] else [{'x':x,'y':y,'id':1,'radiusX':8,'radiusY':8,'force':1}]
  cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':points})
 # Touching the upper half does not claim the movement gesture.
 start=mobile.evaluate('nagi.position');touch('touchStart',195,250);touch('touchMove',195,160);mobile.wait_for_timeout(400);touch('touchEnd')
 assert distance(start,mobile.evaluate('nagi.position'))<.002
 # Lower-half contact is neutral; an upward slide runs without reaching the top half.
 touch('touchStart',195,705);stopped(mobile);touch('touchMove',195,620);moved(mobile,start,3)
 assert mobile.evaluate('nagi.speed')>5.8
 assert mobile.evaluate('nagi.footsteps')>0 and mobile.evaluate('nagi.audioState')=='running'
 touch('touchEnd');stopped(mobile)
 forward=mobile.evaluate('nagi.position')
 assert forward['z']<start['z']-2 and forward['yaw']==start['yaw']
 # Downward drag backs up without changing facing; cancel also stops immediately.
 touch('touchStart',190,600);touch('touchMove',190,700);moved(mobile,forward,1.6)
 assert mobile.evaluate('nagi.position.yaw')==forward['yaw']
 touch('touchCancel');assert not mobile.evaluate('nagi.dragging');stopped(mobile)
 # A small side stroke strafes; a large one turns in place without footsteps.
 side_start=mobile.evaluate('nagi.position');touch('touchStart',150,700);touch('touchMove',181,700);moved(mobile,side_start,.7)
 assert mobile.evaluate('nagi.position.yaw')==side_start['yaw']
 touch('touchEnd');stopped(mobile)
 turn_start=mobile.evaluate('nagi.position');steps=mobile.evaluate('nagi.footsteps');touch('touchStart',190,700);touch('touchMove',310,700)
 mobile.wait_for_function(f'nagi.position.yaw < {turn_start["yaw"]-.4}',timeout=30000)
 assert distance(turn_start,mobile.evaluate('nagi.position'))<.002
 assert mobile.evaluate('nagi.footsteps')==steps
 touch('touchEnd');stopped(mobile)
 edge_start=mobile.evaluate('nagi.position');touch('touchStart',340,720);stopped(mobile);touch('touchMove',378,720);mobile.wait_for_function(f'nagi.position.yaw < {edge_start["yaw"]-.4}',timeout=30000);touch('touchEnd');stopped(mobile)
 mobile.screenshot(path=str(root/'touch-playing.png'))
 assert not errors,errors
 print('mobile: lower-half origin, slide to run, backward, strafe/turn, release/cancel, and silent idle/turn passed',flush=True)
 print('audio buffer peak/RMS:',json.dumps(stats),flush=True)
 browser.close()
