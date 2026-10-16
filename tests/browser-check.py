import json
import subprocess, time
from pathlib import Path
root=Path(__file__).resolve().parents[1]
server=subprocess.Popen(["python3","-m","http.server","4173","--bind","127.0.0.1","--directory",str(root/"dist")],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
import atexit
atexit.register(server.terminate)
time.sleep(.5)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:4173/',wait_until='networkidle')
 page.screenshot(path=str(root/'arrival.png'))
 print('initial',page.evaluate('window.nagi && {vertices:nagi.worldVertices,position:nagi.position}'))
 page.locator('#begin').click()
 page.wait_for_timeout(2200)
 page.screenshot(path=str(root/'walking.png'))
 before=page.evaluate('nagi.position')
 page.keyboard.down('w');page.wait_for_timeout(2000);page.keyboard.up('w')
 page.wait_for_timeout(300)
 after=page.evaluate('nagi.position')
 assert after['z']<before['z']-2,(before,after)
 assert after['yaw']==before['yaw']
 page.keyboard.down('s');page.wait_for_timeout(1000);page.keyboard.up('s')
 page.wait_for_timeout(300)
 back=page.evaluate('nagi.position')
 assert back['z']>after['z']+1
 assert back['yaw']==after['yaw']
 page.keyboard.down('ArrowRight');page.wait_for_timeout(700);page.keyboard.up('ArrowRight')
 right=page.evaluate('nagi.position')
 assert right['yaw']<back['yaw']-.3
 page.mouse.move(1430,450);page.mouse.down();page.wait_for_timeout(650);page.mouse.up()
 edge=page.evaluate('nagi.position')
 assert edge['yaw']<right['yaw']-.3
 assert page.evaluate("getComputedStyle(document.querySelector('canvas')).cursor")=='none'
 assert page.locator('#arrival').evaluate("e=>getComputedStyle(e).visibility")=='hidden'
 print('movement',json.dumps({'before':before,'forward':after,'back':back,'right':right,'edge':edge}))
 print('errors',errors)
 assert not errors
 page.set_viewport_size({'width':390,'height':844});page.reload(wait_until='networkidle');page.screenshot(path=str(root/'mobile.png'))
 page.locator('#begin').click();page.wait_for_timeout(1500)
 assert page.evaluate('nagi.started')
 browser.close()
