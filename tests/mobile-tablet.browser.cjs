const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.SCREENSHOT_DIR,key='sentence-workshop-testing-v1';
const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){response.writeHead(404).end();return;}
  response.setHeader('Content-Type',{'.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream');
  response.end(fs.readFileSync(file));
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{channel:'chrome'})}),errors=[],images=[],results=[];
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('/lesson-images/'))images.push(request.url());});
    await page.goto(base);await page.locator('#intro-infographic').evaluate(image=>image.decode());
    assert.equal(await page.evaluate(()=>SENTENCE_WORKSHOP.VERSION),'0.7.6');
    assert.equal(await page.locator('#lesson-menu').evaluate(menu=>menu.open),false);
    assert(images.every(url=>url.includes('/introduction-noun-')),images.join('\n'));
    assert.equal(new Set(images).size,1,'Only the current teaching image loads initially');
    const pick=async(chapter,lesson)=>{
      const menu=page.locator('#lesson-menu');if(!await menu.evaluate(x=>x.open))await menu.locator(':scope > summary').tap();
      const section=page.locator('#lessons .chapter').nth(chapter+1);if(!await section.evaluate(x=>x.open))await section.locator(':scope > summary').tap();
      await section.locator('button').nth(lesson).tap();
      assert.equal(await menu.evaluate(x=>x.open),page.viewportSize().width>1000);
    };
    let releaseImage;
    const imageHold=new Promise(resolve=>{releaseImage=resolve;});
    await page.route('**/lesson-images/introduction-verb-*',async route=>{await imageHold;await route.continue().catch(()=>{});});
    const verbRequest=page.waitForRequest(request=>request.url().includes('/introduction-verb-'));
    await pick(-1,1);await verbRequest;
    if(output)await page.screenshot({path:path.join(output,'Image switch while loading.png')});
    assert.equal(await page.locator('#intro-infographic').evaluate(image=>getComputedStyle(image).visibility),'hidden','The previous Nouns artwork must disappear while Verbs loads');
    assert(await page.locator('#intro-infographic-status').isVisible());
    releaseImage();await page.locator('#intro-infographic').evaluate(image=>image.decode());
    await page.locator('#intro-infographic-status').waitFor({state:'hidden'});
    assert((await page.locator('#intro-infographic').evaluate(image=>image.currentSrc)).includes('/introduction-verb-'));
    await page.unroute('**/lesson-images/introduction-verb-*');
    // Check displayed artwork after real lesson selection, not just standalone image decodes.
    for(const [index,lesson] of ['noun','verb','pronoun','determiner','adjective','adverb','preposition','conjunction'].entries()){
      await pick(-1,index);await page.locator('#intro-infographic').evaluate(image=>image.decode());await page.locator('#intro-infographic-status').waitFor({state:'hidden'});
      const displayed=await page.locator('#intro-infographic').evaluate(image=>({src:image.currentSrc,visibility:getComputedStyle(image).visibility}));
      assert(displayed.src.includes('/introduction-'+lesson+'-'));assert.equal(displayed.visibility,'visible');
      await page.locator('#intro-art-open').tap();await page.locator('#art-image').evaluate(image=>image.decode());await page.locator('#art-image-status').waitFor({state:'hidden'});
      assert.equal(await page.locator('#art-image').evaluate(image=>image.currentSrc),displayed.src);await page.keyboard.press('Escape');
    }
    await page.route('**/lesson-images/introduction-verb-*',route=>route.fulfill({status:503,body:'Unavailable'}));
    await pick(-1,1);await page.waitForFunction(()=>document.querySelector('#intro-infographic-status').textContent.includes('could not load'));
    assert.equal(await page.locator('#intro-infographic').evaluate(image=>getComputedStyle(image).visibility),'hidden');
    await page.unroute('**/lesson-images/introduction-verb-*');await pick(-1,1);await page.locator('#intro-infographic').evaluate(image=>image.decode());await page.locator('#intro-infographic-status').waitFor({state:'hidden'});
    if(output)await page.screenshot({path:path.join(output,'Verbs lesson corrected.png')});
    const tokens=()=>page.evaluate(()=>SENTENCE_WORKSHOP.UI.snapshot().tokens);
    const option=label=>page.locator('#word-options').getByRole('button',{name:label,exact:true});
    const select=async index=>{const tile=page.locator('#workspace button').nth(index);if(await tile.getAttribute('aria-expanded')!=='true')await tile.tap();await page.locator('#word-options').waitFor({state:'visible'});};
    const undo=()=>page.locator('#undo').tap();
    await pick(0,0);let before=await tokens();await select(0);assert(await option('Move left').isDisabled());await option('Move right').tap();assert.deepEqual(await tokens(),[before[1],before[0]]);await undo();assert.deepEqual(await tokens(),before);
    await select(1);await option('Remove').tap();assert.deepEqual(await tokens(),[before[0]]);await undo();assert.deepEqual(await tokens(),before);
    await select(0);await option('Insert before').tap();await page.getByRole('button',{name:/^Add the(?:;|$)/}).first().tap();assert.deepEqual(await tokens(),['the',...before]);await undo();assert.deepEqual(await tokens(),before);
    await select(1);await option('Insert before').tap();await page.getByRole('button',{name:/^Add the(?:;|$)/}).first().tap();assert.deepEqual(await tokens(),[before[0],'the',before[1]]);await undo();
    await page.locator('#period').tap();before=await tokens();await select(before.length-1);assert(await option('Move right').isDisabled());await option('Move left').tap();assert.deepEqual(await tokens(),[before[0],'.',before[1]]);await undo();await select(before.length-1);await option('Remove').tap();assert.deepEqual(await tokens(),before.slice(0,-1));await undo();assert.deepEqual(await tokens(),before);
    const draft=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).students[0].view,key);await page.reload();assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).students[0].view,key),draft);
    // Repeated identical articles must move/remove by position, not by word text.
    await pick(5,5);await page.locator('#clear').tap();for(let i=0;i<2;i++)await page.getByRole('button',{name:/^Add the(?:;|$)/}).first().tap();before=await tokens();await select(1);await option('Remove').tap();assert.equal((await tokens()).length,1);await undo();assert.deepEqual(await tokens(),before);
    await pick(0,0);await pick(5,5);
    for(const width of [320,390,600,768,820,1000,1024,1180,1440]){
      await page.setViewportSize({width,height:width===320?568:1000});
      await page.waitForFunction(()=>document.querySelector('#lesson-menu').open===(innerWidth>1000));
      const m=await page.evaluate(()=>{
        const tiles=[...document.querySelectorAll('#workspace button,#word-bank button,.punctuation button')],rows=[];
        for(const tile of document.querySelectorAll('#workspace button')){
          const style=getComputedStyle(tile,'::after'),label=document.createElement('span');label.textContent=tile.getAttribute('data-pos-name');
          for(const name of ['position','top','left','width','transform','whiteSpace','textAlign','font','letterSpacing','lineHeight','display'])label.style[name]=style[name];
          tile.append(label);const range=document.createRange();range.selectNodeContents(label);const r=range.getBoundingClientRect(),t=tile.getBoundingClientRect();rows.push({left:r.left,right:r.right,top:r.top,delta:(r.left+r.right-t.left-t.right)/2,size:parseFloat(style.fontSize)});label.remove();
        }
        return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,navOpen:document.querySelector('#lesson-menu').open,cardWidth:document.querySelector('#sentence-card').getBoundingClientRect().width,targets:tiles.map(tile=>({width:tile.getBoundingClientRect().width,height:tile.getBoundingClientRect().height})),rows};
      });
      assert(!m.overflow,'Page fits '+width);assert.equal(m.navOpen,width>1000);
      for(const target of m.targets){assert(target.width>=44);assert(target.height>=44);}
      for(const [i,row] of m.rows.entries()){assert(row.size>=12);assert(Math.abs(row.delta)<.75);const previous=m.rows[i-1];if(previous&&Math.abs(previous.top-row.top)<2)assert(row.left-previous.right>=4);}
      results.push({width,cardWidth:m.cardWidth});
    }
    assert(results.find(x=>x.width===820).cardWidth>results.find(x=>x.width===768).cardWidth,'Wider portrait tablet gets more working room');
    await page.setViewportSize({width:390,height:844});await select(0);assert(await option('Move right').isVisible());
    if(output){fs.mkdirSync(output,{recursive:true});await page.locator('#workspace').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'Phone touch controls.png')});}
    await page.keyboard.press('Escape');await page.locator('#lesson-art-open').tap();assert(await page.locator('#art-dialog').isVisible());await page.locator('#art-image').evaluate(image=>image.decode());await page.keyboard.press('Escape');assert(await page.locator('#art-dialog').isHidden());
    await pick(5,6);assert(await page.locator('#lesson-card').isHidden());const review=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).students[0].view,key);await page.reload();assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).students[0].view,key),review);
    await pick(5,5);await page.setViewportSize({width:820,height:1180});await page.waitForFunction(()=>matchMedia('(any-pointer:coarse)').matches && !document.querySelector('#lesson-menu').open);if(output){await page.locator('#workspace').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'Tablet layout.png')});}
    // Every external image must still decode; hosted and offline catalogs keep the same metadata.
    const appSource=fs.readFileSync(path.join(root,'index.html'),'utf8'),offlineSource=fs.readFileSync(path.join(root,'Sentence Workshop v0.7.6.html'),'utf8');
    const withoutImageCatalogs=source=>source.replace(/const (LESSON_INFOGRAPHICS|INTRO_INFOGRAPHICS) = .*;\r?\n/g,'').replace(/\r\n/g,'\n');
    assert.equal(withoutImageCatalogs(appSource),withoutImageCatalogs(offlineSource),'Hosted and offline application code stays identical');
    for(const name of ['LESSON_INFOGRAPHICS','INTRO_INFOGRAPHICS']){
      const read=source=>JSON.parse(source.match(new RegExp('const '+name+' = (.*);\\r?\\n'))[1]),a=read(appSource),b=read(offlineSource);
      const entries=name==='LESSON_INFOGRAPHICS'?Object.entries(a).flatMap(([chapter,lessons])=>Object.entries(lessons).map(([lesson,poster])=>[poster,b[chapter][lesson]])):Object.entries(a).map(([lesson,poster])=>[poster,b[lesson]]);
      for(const [poster,original] of entries){assert.deepEqual({...poster,src:original.src},original);assert(fs.readFileSync(path.join(root,poster.src)).equals(Buffer.from(original.src.split(',')[1],'base64')));await page.evaluate(async src=>{const image=new Image();image.src=src;await image.decode();},poster.src);}
    }
    const desktop=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:false}),mouse=await desktop.newPage();mouse.on('pageerror',error=>errors.push(error.message));await mouse.goto(base);const section=mouse.locator('#lessons .chapter').nth(1);await section.locator('summary').click();await section.locator('button').first().click();await mouse.locator('#workspace button').first().click();assert.equal(await mouse.locator('.touch-edit').count(),0);assert(await mouse.getByRole('button',{name:'Toggle capital letter'}).isVisible());assert(await mouse.locator('.touch-help').isHidden());assert(await mouse.locator('.desktop-help').isVisible());
    await mouse.locator('#workspace').focus();await mouse.keyboard.press('Home');await mouse.getByRole('button',{name:/^Add the(?:;|$)/}).first().click();assert.equal((await mouse.evaluate(()=>SENTENCE_WORKSHOP.UI.snapshot().tokens))[0],'the');await mouse.locator('#undo').click();
    await mouse.locator('#lesson-infographic').evaluate(image=>image.decode());await mouse.locator('#lesson-infographic-status').waitFor({state:'hidden'});
    const mouseTokens=()=>mouse.evaluate(()=>SENTENCE_WORKSHOP.UI.snapshot().tokens),priorDrag=await mouseTokens(),target=mouse.locator('#workspace button').nth(1),box=await target.boundingBox();await mouse.locator('#workspace button').first().dragTo(target,{targetPosition:{x:box.width-4,y:box.height/2}});assert.deepEqual(await mouseTokens(),[priorDrag[1],priorDrag[0]]);await mouse.locator('#undo').click();assert.deepEqual(await mouseTokens(),priorDrag);
    const offline=await context.newPage();offline.on('pageerror',error=>errors.push(error.message));await offline.goto(require('node:url').pathToFileURL(path.join(root,'Sentence Workshop v0.7.6.html')).href);
    await offline.locator('#intro-infographic').evaluate(image=>image.decode());await offline.locator('#intro-infographic-status').waitFor({state:'hidden'});await offline.locator('#lesson-menu > summary').tap();await offline.getByRole('button',{name:/^I\.2 Verbs:/}).tap();
    await offline.locator('#intro-infographic').evaluate(image=>image.decode());await offline.locator('#intro-infographic-status').waitFor({state:'hidden'});assert(await offline.locator('#intro-infographic').evaluate(image=>image.currentSrc===SENTENCE_WORKSHOP.INTRO_INFOGRAPHICS.verb.src&&getComputedStyle(image).visibility==='visible'),'Offline Verbs artwork loads correctly');
    assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,widths:results,hostedBytes:Buffer.byteLength(appSource),offlineBytes:Buffer.byteLength(offlineSource),initialImageRequests:1,checks:'Delayed lesson image switch, all eight Introduction lesson/larger-view images, failed-image retry; touch movement/removal/insertion/Undo, duplicates, punctuation, draft/review reload, centered labels and targets, navigation rotation, art viewer, all 44 image bytes/decodes, desktop menu/keyboard/drag'}));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
