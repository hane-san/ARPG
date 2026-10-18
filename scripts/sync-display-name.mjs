import {readFile,writeFile} from 'node:fs/promises';
import {DISPLAY_NAME} from '../display-name.js';

const args=process.argv.slice(2);
if(args.length>1||(args.length===1&&args[0]!=='--check'))throw Error('usage: node scripts/sync-display-name.mjs [--check]');
const check=args[0]==='--check',root=new URL('../',import.meta.url);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function replaceOne(source,pattern,replacement){
 if([...source.matchAll(pattern)].length!==1)throw Error('Expected exactly one display field: '+pattern);
 return source.replace(pattern,replacement);
}
const name=escape(DISPLAY_NAME.shortName),title=escape(DISPLAY_NAME.title);
if(!DISPLAY_NAME.shortName.trim())throw Error('Display name must not be empty');
const outputs=[];
for(const path of ['index.html','dist/index.html']){
 const url=new URL(path,root),before=await readFile(url,'utf8');
 let after=replaceOne(before,/<title>[^<]*<\/title>/g,()=>`<title>${title}</title>`);
 after=replaceOne(after,/<meta name="apple-mobile-web-app-title" content="[^"]*">/g,()=>`<meta name="apple-mobile-web-app-title" content="${name}">`);
 if(path==='index.html'){
  after=replaceOne(after,/<h1>[^<]*<\/h1>/g,()=>`<h1>${name}</h1>`);
  after=replaceOne(after,/<meta name="description" content="[^"]*">/g,()=>`<meta name="description" content="${name} — 瀬戸内の小さな島を歩く探索ゲーム">`);
 }else{
  after=replaceOne(after,/<h1>[\s\S]*?<\/h1>/g,()=>`<h1>${name}${DISPLAY_NAME.wordmark?`<span>${escape(DISPLAY_NAME.wordmark)}</span>`:''}</h1>`);
  after=replaceOne(after,/(<canvas id="world"[^>]* aria-label=")[^。]*。/g,(_,prefix)=>prefix+name+'。');
  after=replaceOne(after,/(<div class="folio">)[^<]*( ／)/g,(_,prefix,suffix)=>prefix+escape(DISPLAY_NAME.folio)+suffix);
 }
 outputs.push({url,before,after});
}
const url=new URL('manifest.webmanifest',root),before=await readFile(url,'utf8'),manifest=JSON.parse(before);
manifest.name=DISPLAY_NAME.title;manifest.short_name=DISPLAY_NAME.shortName;
outputs.push({url,before,after:JSON.stringify(manifest,null,2)+'\n'});
if(check){
 if(outputs.some(item=>item.before!==item.after))throw Error('Display metadata is stale; run npm run build and commit the generated files');
 console.log('Display metadata matches display-name.js');
}else{
 for(const item of outputs)if(item.before!==item.after)await writeFile(item.url,item.after);
 console.log('Synced display labels; entry paths, PWA identity, icons and release are unchanged');
}
