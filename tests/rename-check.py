"""Local old/current/planned Pages paths; no GitHub mutation or real iOS claims."""
import html,json,os,subprocess,threading
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit,urljoin
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
prefixes=['/Koitototsukuru/','/ARPG/','/hane-no-ARPG01/']
labels=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {DISPLAY_NAME} from './display-name.js'; console.log(JSON.stringify(DISPLAY_NAME));"],cwd=root,text=True))
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def log_message(self,*args):pass
 def do_GET(self):
  parsed=urlsplit(self.path);prefix=next((p for p in prefixes if parsed.path.startswith(p)),None)
  if not prefix:self.send_error(404);return
  self.path=urlunsplit(('','', '/'+parsed.path[len(prefix):],parsed.query,''));super().do_GET()

server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  page=context.new_page();errors=[];bad=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.on('response',lambda r:bad.append(f'{r.status} {r.url}') if r.status>=400 else None)
  for prefix in prefixes:
   response=page.goto(base+prefix,wait_until='networkidle');assert response.ok
   page.wait_for_function('!!window.nagi')
   assert page.url==base+prefix+'dist/index.html',page.url
   assert page.title()==labels['title']
   assert page.locator('.intro h1').evaluate('e=>e.firstChild.textContent')==labels['shortName']
   assert page.locator('#world').get_attribute('aria-label').startswith(labels['shortName']+'。')
   assert page.locator('meta[name="apple-mobile-web-app-title"]').get_attribute('content')==labels['shortName']
   assert page.evaluate('nagi.release')=='2026-10-18-movement-core'
   root_html=context.request.get(base+prefix).text();assert '<title>'+html.escape(labels['title'])+'</title>' in root_html
   for location,start in [('manifest.webmanifest','dist/index.html'),('dist/manifest.webmanifest','dist/index.html')]:
    manifest_url=base+prefix+location;response=context.request.get(manifest_url);assert response.ok
    manifest=response.json();assert manifest['name']==labels['title'];assert manifest['short_name']==labels['shortName'];assert 'id' not in manifest
    assert urljoin(manifest_url,manifest['start_url'])==base+prefix+start
    assert urlsplit(urljoin(manifest_url,manifest['scope'])).path.startswith(prefix)
    for icon in manifest['icons']:
     url=urljoin(manifest_url,icon['src']);assert urlsplit(url).path.startswith(prefix);assert context.request.get(url).ok
   for selector in ['link[rel="icon"]','link[rel="apple-touch-icon"]']:
    url=page.locator(selector).evaluate('e=>e.href');assert urlsplit(url).path.startswith(prefix);assert context.request.get(url).ok
   storage=page.evaluate('({...localStorage})')
   page.locator('#begin').tap();page.wait_for_function('nagi.started')
   page.wait_for_function('getComputedStyle(document.querySelector("#arrival")).visibility === "hidden"')
   anchor=page.evaluate('nagi.position');page.keyboard.down('w')
   page.wait_for_function('(a)=>Math.hypot(nagi.position.x-a.x,nagi.position.z-a.z)>.3',arg=anchor,timeout=45000)
   page.keyboard.up('w');page.wait_for_function('nagi.speed===0')
   assert page.evaluate('({...localStorage})')==storage
   page.goto(base+prefix+'dist/nagi-standalone.html',wait_until='networkidle');page.wait_for_function('!!window.nagi')
   assert page.title()==labels['title'];assert page.evaluate('nagi.release')=='2026-10-18-movement-core'
   page.locator('#begin').tap();page.wait_for_function('nagi.started')
  assert not errors,errors
  assert not bad,bad
  page.screenshot(path=str(root/'rename-new-path.png'))
  print(json.dumps({'paths':prefixes,'rootRedirect':True,'standalone':True,'manifestAndIcons':True,'releaseUnchanged':True,'noNewLocalStorage':True,'errors':errors}),flush=True)
  browser.close()
finally:
 server.shutdown();server.server_close();thread.join(timeout=5)
