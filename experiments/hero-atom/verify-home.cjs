// Production homepage integration smoke test. Run while serve.cjs is listening on 4173.
const { chromium }=require('playwright');
const assert=require('node:assert/strict');

const url='http://127.0.0.1:4173/';
const executablePath=process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const projectedExtent=state=>{
  const points=state.layers.flatMap(layer=>layer.positions);
  const xs=points.map(point=>point.x),ys=points.map(point=>point.y);
  return {minX:Math.min(...xs),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
};

(async()=>{
  const browser=await chromium.launch({executablePath,headless:true,args:['--enable-unsafe-swiftshader']});
  const errors=[];
  try {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error') errors.push(message.text());});
    const requests=[];page.on('request',request=>requests.push(request.url()));
    await page.goto(url);await page.waitForFunction(()=>window.heroAtom);
    const layout=await page.evaluate(()=>{
      const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
      return {hero:box('.hero'),copy:box('.hero-copy'),visual:box('#hero-atom'),canvas:box('#atom-canvas'),overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.equal(layout.hero.height,780,'existing desktop hero height');
    assert.deepEqual(layout.canvas,layout.hero,'canvas expands across the full hero');
    assert.deepEqual(layout.visual,layout.hero);
    assert.equal(layout.overflow,0);assert.equal(await page.locator('.orbit').count(),0);
    assert.equal(await page.locator('#atom-fallback').isHidden(),true);
    let state=await page.evaluate(()=>heroAtom.snapshot());
    assert.deepEqual(state.layers.map(layer=>[layer.orbits,layer.elements]),[[7,33],[5,7]],'production preset is loaded');
    assert.equal(await page.evaluate(()=>heroAtom.snapshot().shake && heroAtom.snapshot().shake.events>=0),true);
    assert.equal(await page.evaluate(async()=>{
      const response=await fetch('./experiments/bybartonek-hero-atom-2645671074.json');
      const preset=await response.json();
      return preset.version===9 && preset.config.cameraShake.enabled
        && preset.config.cameraShake.idleAmplitudeA===5.4 && preset.config.cameraShake.burstAmplitudeA===36;
    }),true,'production uses the approved v9 ShakyCam preset');
    assert.equal(state.drawCalls,9);assert.equal(state.cards.length,0);
    assert.ok(Math.abs(state.center.x-(layout.copy.width+(layout.hero.width-layout.copy.width)/2))<0.01,'atom stays centered in the former right column');
    assert.ok(Math.abs(state.center.y-layout.hero.height/2)<0.01);
    assert.equal(await page.evaluate(()=>{
      const copy=getComputedStyle(document.querySelector('.hero-copy'));
      const visual=getComputedStyle(document.querySelector('#hero-atom'));
      return copy.position!=='static' && Number(copy.zIndex)>Number(visual.zIndex);
    }),true,'hero copy remains above the full-width scene');
    assert.ok(requests.every(request=>request.startsWith(url)),'production has no external runtime requests');

    const stage=await page.locator('#hero-atom').boundingBox();
    for(let pass=0;pass<5 && (await page.evaluate(()=>heroAtom.snapshot().emissions))===0;pass++) {
      const positions=await page.evaluate(()=>heroAtom.snapshot().layers[1].positions);
      for(const point of positions) {
        await page.mouse.move(stage.x+point.x-90,stage.y+point.y);
        await page.mouse.move(stage.x+point.x+90,stage.y+point.y,{steps:3});
      }
      await page.waitForTimeout(60);
    }
    state=await page.evaluate(()=>heroAtom.snapshot());
    assert.equal(state.emissions,1,'real homepage interaction emits a card and burst');
    const card=await page.locator('.atom-card:visible').first().boundingBox();
    assert.ok(card.x>=stage.x && card.x+card.width<=stage.x+stage.width && card.y>=stage.y && card.y+card.height<=stage.y+stage.height);
    const orientation=state.orientation;
    const core=await page.evaluate(()=>{const s=heroAtom.snapshot();return{x:s.center.x+s.shake.x,y:s.center.y+s.shake.y};});
    await page.mouse.move(stage.x+core.x,stage.y+core.y);await page.mouse.down();
    await page.mouse.move(stage.x+core.x+80,stage.y+core.y+40,{steps:4});await page.mouse.up();
    assert.notDeepEqual((await page.evaluate(()=>heroAtom.snapshot())).orientation,orientation,'core drag works in production');
    assert.deepEqual(errors,[]);await page.close();

    const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await mobile.goto(url);await mobile.waitForFunction(()=>window.heroAtom);
    const mobileLayout=await mobile.evaluate(()=>{
      const hero=document.querySelector('.hero').getBoundingClientRect(),copy=document.querySelector('.hero-copy').getBoundingClientRect(),visual=document.querySelector('#hero-atom').getBoundingClientRect();
      const center=heroAtom.snapshot().center;
      return {heroHeight:hero.height,copyHeight:copy.height,visualHeight:visual.height,visualWidth:visual.width,center,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.ok(Math.abs(mobileLayout.heroHeight-mobileLayout.copyHeight-380)<0.01,'existing mobile hero height is copy plus the original 380px visual region');
    assert.equal(mobileLayout.visualHeight,mobileLayout.heroHeight,'background scene covers the full mobile hero');
    assert.equal(mobileLayout.visualWidth,390);assert.equal(mobileLayout.overflow,0);
    assert.ok(Math.abs(mobileLayout.center.x-195)<0.01);
    assert.ok(Math.abs(mobileLayout.center.y-(Math.round(mobileLayout.heroHeight)-190))<0.01,'atom stays in its former 380px mobile region');
    assert.equal((await mobile.evaluate(()=>heroAtom.snapshot().performance.pixelRatio)),1.25,'phone keeps the existing sharpness cap');
    const touchClient=await mobile.context().newCDPSession(mobile);
    const scrollStart=Math.min(760,68+mobileLayout.center.y);
    const scrollBefore=await mobile.evaluate(()=>scrollY);
    await touchClient.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:20,y:scrollStart}]});
    await touchClient.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:22,y:scrollStart-260}]});
    await touchClient.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await mobile.waitForTimeout(150);
    assert.ok((await mobile.evaluate(()=>scrollY))>scrollBefore,'vertical touch outside the core scrolls the page');
    assert.ok(await mobile.evaluate(()=>heroAtom.snapshot().layers.flatMap(layer=>layer.boosts).every(value=>value<0.001)),
      'vertical scroll does not add impulse');
    await mobile.evaluate(()=>scrollTo(0,0));await mobile.waitForFunction(()=>heroAtom.snapshot().running);
    const mobileOrientation=await mobile.evaluate(()=>heroAtom.snapshot().orientation);
    await mobile.evaluate(()=>{
      const stage=document.querySelector('#hero-atom'),r=stage.getBoundingClientRect(),point=heroAtom.snapshot().layers[1].positions[0],id=31;
      const fire=(type,x,y)=>stage.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:r.left+x,clientY:r.top+y,
        pointerId:id,pointerType:'touch',isPrimary:true,button:0,buttons:type==='pointerup' ? 0 : 1}));
      fire('pointerdown',point.x,point.y);fire('pointerup',point.x,point.y);
    });
    await mobile.waitForTimeout(80);
    assert.ok(await mobile.evaluate(()=>Math.max(...heroAtom.snapshot().layers[1].boosts)>0),'production touch tap adds physical impulse');
    await mobile.evaluate(()=>{
      const stage=document.querySelector('#hero-atom'),r=stage.getBoundingClientRect(),s=heroAtom.snapshot(),id=32;
      const x=r.left+s.center.x+s.shake.x,y=r.top+s.center.y+s.shake.y;
      const fire=(type,cx,cy)=>stage.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:cx,clientY:cy,
        pointerId:id,pointerType:'touch',isPrimary:true,button:0,buttons:type==='pointerup' ? 0 : 1}));
      fire('pointerdown',x,y);fire('pointermove',x+42,y+24);fire('pointerup',x+42,y+24);
    });
    assert.notDeepEqual((await mobile.evaluate(()=>heroAtom.snapshot().orientation)),mobileOrientation,'production touch core drag rotates');
    await mobile.close();

    const tablet=await browser.newPage({viewport:{width:1000,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await tablet.goto(url);await tablet.waitForFunction(()=>window.heroAtom);
    const tabletStart=await tablet.evaluate(()=>heroAtom.snapshot());
    await tablet.waitForTimeout(1200);
    const tabletEnd=await tablet.evaluate(()=>heroAtom.snapshot());
    assert.equal(tabletEnd.performance.pixelRatio,2,'tablet preserves the production pixel ratio');
    assert.ok(tabletEnd.frames-tabletStart.frames<=80,'render loop is capped near 60 FPS on a high-refresh tablet');
    await tablet.close();

    const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    await reduced.goto(url);await reduced.waitForFunction(()=>window.heroAtom);
    const frozen=await reduced.evaluate(()=>heroAtom.snapshot());await reduced.waitForTimeout(250);
    assert.equal(frozen.paused,true);assert.equal((await reduced.evaluate(()=>heroAtom.snapshot().time)),frozen.time);await reduced.close();

    const narrow=await browser.newPage({viewport:{width:800,height:760},reducedMotion:'reduce'});
    await narrow.goto(url);await narrow.waitForFunction(()=>window.heroAtom);
    const narrowResult=await narrow.evaluate(()=>({
      state:heroAtom.snapshot(),copyWidth:document.querySelector('.hero-copy').getBoundingClientRect().width,
    }));
    const wideExtent=projectedExtent(frozen),narrowExtent=projectedExtent(narrowResult.state);
    assert.ok(Math.abs(narrowExtent.width/wideExtent.width-1)<0.04 && Math.abs(narrowExtent.height/wideExtent.height-1)<0.04,'desktop atom keeps its visual size as the browser narrows');
    assert.ok(narrowExtent.minX<narrowResult.copyWidth,'full-size desktop atom can extend beneath the hero copy');
    await narrow.close();

    const fallback=await browser.newPage();
    await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl') ? null : original.call(this,type,...args);};});
    await fallback.goto(url);await fallback.locator('#atom-fallback').waitFor({state:'visible'});
    assert.equal(await fallback.locator('#atom-canvas').isHidden(),true);await fallback.close();
    console.log('PASS: full-width scene, fixed desktop atom size and right alignment, preserved mobile layout and hero dimensions, optimized procedural background, touch tap/core drag, approved v9 ShakyCam preset, local assets, interaction, reduced motion and fallback.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
