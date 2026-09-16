// Run with the local preview server on port 4173. Requires Playwright for development only.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const url = 'http://127.0.0.1:4173/experiments/hero-atom/';
const executablePath = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
(async () => {
  const browser = await chromium.launch({ executablePath, headless: true, args: ['--enable-unsafe-swiftshader'] });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const requests=[]; page.on('request', request=>requests.push(request.url()));
  const snapshot = () => page.evaluate(() => heroAtom.snapshot());
  try {
    await page.goto(url); await page.waitForFunction(() => window.heroAtom);
    assert.equal((await snapshot()).paused, true, 'reduced motion starts frozen');
    const frozen = await snapshot(); await page.waitForTimeout(350);
    assert.equal((await snapshot()).time, frozen.time);
    assert.equal((await snapshot()).cards.length,0,'no cards before interaction');
    assert.ok(requests.every(request=>request.startsWith('http://127.0.0.1:4173/')), 'all runtime assets are local');
    assert.ok(!requests.some(request=>/\.(png|jpe?g|webp)(\?|$)/i.test(request)), 'no raster assets in the scene');

    // Changing speed in the editor must preserve phase; counts and zero-orbit layers must work.
    await page.locator('#tune').click();
    assert.equal(await page.locator('[id="inner.trailOpacity"]').getAttribute('max'),'12');
    assert.equal(await page.locator('[id="interaction.strength"]').getAttribute('max'),'40');
    assert.equal(await page.locator('[id="interaction.maxBoost"]').getAttribute('max'),'100');
    assert.equal(await page.locator('[id="cards.triggerEnergy"]').getAttribute('max'),'100');
    assert.equal(await page.locator('[id="cameraShake.idleAmplitudeA"]').getAttribute('max'),'8');
    assert.equal(await page.locator('[id="cameraShake.idleAmplitudeB"]').getAttribute('max'),'8');
    assert.equal(await page.locator('[id="cameraShake.idlePhaseB"]').getAttribute('min'),'-50');
    assert.equal(await page.locator('[id="cameraShake.burstAmplitudeA"]').getAttribute('max'),'60');
    assert.equal(await page.locator('[id="cameraShake.burstAmplitudeB"]').getAttribute('max'),'60');
    assert.equal(await page.locator('[id="cameraShake.burstPhaseB"]').getAttribute('max'),'180');
    assert.equal(await page.locator('[id^="scene.tilt"]').count(),0,'global tilt sliders are replaced by direct dragging');
    await page.locator('summary').filter({hasText:'Pozadí'}).click();
    const noiseImages=[];
    for(const noise of ['value','perlin','ridged','billow','worley']) {
      await page.locator('[id="background.noiseType"]').selectOption(noise);
      await page.waitForTimeout(80);
      assert.equal((await snapshot()).noiseType,noise);
      noiseImages.push(await page.locator('#atom-canvas').screenshot());
    }
    for(let i=0;i<noiseImages.length;i++) for(let j=i+1;j<noiseImages.length;j++)
      assert.notDeepEqual(noiseImages[i],noiseImages[j],'noise selection changes rendered pixels');
    await page.locator('#reset').click();
    const trailImages=[];
    for(const intensity of [1,4,12]) {
      await page.locator('[id="inner.trailOpacity"]').evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},String(intensity));
      await page.waitForTimeout(80);trailImages.push(await page.locator('#atom-canvas').screenshot());
    }
    assert.notDeepEqual(trailImages[0],trailImages[1],'trails increase beyond intensity 1');
    assert.notDeepEqual(trailImages[1],trailImages[2],'trails still increase from 4 to 12');
    await page.locator('#reset').click();
    const phase=(await snapshot()).layers[1].phases[0];
    await page.locator('[id="inner.speed"]').evaluate(input=>{input.value='7';input.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.waitForTimeout(100);
    assert.equal((await snapshot()).layers[1].phases[0],phase);
    await page.locator('[id="inner.orbitCount"]').evaluate(input=>{input.value='0';input.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.waitForTimeout(100);
    assert.equal((await snapshot()).layers[1].elements,0);
    await page.locator('#reset').click();
    const seeded=(await snapshot()).layers.map(layer=>layer.phases);
    await page.locator('#new-seed').click(); await page.waitForTimeout(100);
    assert.notDeepEqual((await snapshot()).layers.map(layer=>layer.phases),seeded);
    await page.locator('#reset').click();
    assert.deepEqual((await snapshot()).layers.map(layer=>layer.phases),seeded, 'seed reproduces geometry and starting phases');

    // Separate palettes and white/saturation controls must change actual pixels.
    await page.locator('summary').filter({hasText:'Barvy mlhoviny'}).click();
    const originalColors=await snapshot();
    const originalImage=await page.locator('#atom-canvas').screenshot();
    await page.locator('[id="color.warm"]').evaluate(input=>{input.value='#ee2266';input.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.waitForTimeout(100);
    assert.notEqual((await snapshot()).tint,originalColors.tint);
    assert.equal((await snapshot()).nebulaTint,originalColors.nebulaTint,'unlinked nebula ignores the atom palette');
    assert.notDeepEqual(await page.locator('#atom-canvas').screenshot(),originalImage);
    await page.locator('[id="nebulaColor.warm"]').fill('#2255ee');await page.waitForTimeout(100);
    const separate=await snapshot();assert.notEqual(separate.nebulaTint,originalColors.nebulaTint);
    assert.equal(separate.tint,'ee2266','nebula changes leave the atom palette alone');
    await page.locator('[id="nebulaColor.linked"]').check();await page.waitForTimeout(100);
    assert.equal((await snapshot()).tint,(await snapshot()).nebulaTint);
    assert.equal(await page.locator('[id="nebulaColor.warm"]').isDisabled(),true);
    await page.locator('[id="nebulaColor.linked"]').uncheck();await page.waitForTimeout(100);
    assert.equal((await snapshot()).nebulaTint,separate.nebulaTint,'unlink restores the independent palette');
    const colorImages=[];
    for(const [key,value] of [['saturation',2],['coreWhiteness',0],['lineWhiteness',0],['trailWhiteness',0]]) {
      colorImages.push(await page.locator('#atom-canvas').screenshot());
      await page.locator(`[id="inner.${key}"]`).evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
      await page.waitForTimeout(80);
      assert.notDeepEqual(await page.locator('#atom-canvas').screenshot(),colorImages.at(-1),`${key} affects rendered light`);
      assert.equal((await snapshot()).nebulaTint,separate.nebulaTint);
    }
    await page.locator('#reset').click();

    // ShakyCam moves the complete rendered scene with irregular idle noise and a decaying burst impulse.
    await page.locator('summary').filter({hasText:'ShakyCam'}).click();
    await page.evaluate(()=>{
      const c=heroAtom.getConfig();Object.assign(c.cameraShake,{enabled:true,idleAmplitudeA:2.5,idleFrequencyA:0.35,idleAmplitudeB:4,idleFrequencyB:2.7,idlePhaseB:23.4,
        burstAmplitudeA:18,burstFrequencyA:9,burstAmplitudeB:8,burstFrequencyB:27,burstPhaseB:83,burstDecay:0.35});
      heroAtom.setConfig(c);
    });
    const shiftedShake=await snapshot();
    assert.ok(Math.hypot(shiftedShake.shake.x,shiftedShake.shake.y)>0.1,'idle shake offsets the camera while paused');
    const shiftedScene=await page.locator('#atom-canvas').screenshot();
    await page.evaluate(()=>{const c=heroAtom.getConfig();c.cameraShake.enabled=false;heroAtom.setConfig(c);});
    const stillShake=await snapshot();
    assert.deepEqual(stillShake.shake,{x:0,y:0,burst:0,events:0});
    assert.notDeepEqual(await page.locator('#atom-canvas').screenshot(),shiftedScene,'camera offset changes the complete rendered canvas');
    await page.evaluate(()=>{const c=heroAtom.getConfig();c.cameraShake.enabled=true;heroAtom.setConfig(c);heroAtom.pause(false);});
    const idleSamples=[];
    for(let i=0;i<6;i++) {await page.waitForTimeout(90);idleSamples.push((await snapshot()).shake);}
    assert.ok(new Set(idleSamples.map(({x,y})=>`${x.toFixed(2)},${y.toFixed(2)}`)).size>4,'idle shake changes irregularly over time');
    await page.evaluate(()=>heroAtom.previewBurst());
    const burstSamples=[];
    for(let i=0;i<5;i++) {await page.waitForTimeout(45);burstSamples.push((await snapshot()).shake);}
    assert.ok(Math.max(...burstSamples.map(sample=>sample.burst))>0.5,'burst adds a strong shake envelope');
    assert.ok(Math.max(...burstSamples.map(({x,y})=>Math.hypot(x,y)))>8,'burst shake is visibly stronger than idle motion');
    await page.waitForTimeout(1500);
    assert.ok((await snapshot()).shake.burst<0.03,'burst shake settles back to idle motion');
    await page.evaluate(()=>heroAtom.pause(true));
    await page.locator('#reset').click();await page.locator('#close-controls').click();

    // Real tube sections remain visible when an orbit is exactly edge-on.
    await page.evaluate(()=>{
      const c=heroAtom.getConfig();c.scene.orientation=[0,0,0,1];c.scene.precession=0;
      c.inner.orbitCount=1;c.inner.elementCount=0;c.inner.radiusSpread=0;c.inner.angle=0;c.inner.angleSpread=0;
      c.inner.azimuth=0;c.inner.azimuthSpread=0;c.inner.orbitOpacity=0.8;c.inner.lineWidth=0.015;
      c.outer.orbitCount=0;c.background.nebulaIntensity=0;c.background.gridOpacity=0;
      c.innerCompanion.enabled=false;heroAtom.setConfig(c);
    });
    const cleanOrbit=await page.evaluate(()=>heroAtom.getConfig());
    for(const angle of [0,89.9,90,90.1]) {
      await page.evaluate(({config,angle})=>{const half=angle*Math.PI/360;config.scene.orientation=[Math.sin(half),0,0,Math.cos(half)];heroAtom.setConfig(config);},{config:cleanOrbit,angle});
      const visibleTube=await page.locator('#atom-canvas').screenshot();
      await page.evaluate(()=>{const c=heroAtom.getConfig();c.inner.orbitOpacity=0;heroAtom.setConfig(c);});
      assert.notDeepEqual(await page.locator('#atom-canvas').screenshot(),visibleTube,`orbit remains visible at ${angle} degrees`);
    }
    await page.evaluate(config=>{config.inner.orbitOpacity=0;config.innerCompanion.enabled=true;config.innerCompanion.intensity=0.8;config.innerCompanion.lineWidth=0.008;heroAtom.setConfig(config);},cleanOrbit);
    await page.locator('#tune').click();
    await page.locator('summary').filter({hasText:'Vnitřní · druhé dráhy'}).click();
    const patterns=[];
    for(const style of ['solid','dashed','dotted','dash-dot','dash-dot-dot']) {
      await page.locator('[id="innerCompanion.style"]').selectOption(style);await page.waitForTimeout(80);
      patterns.push(await page.locator('#atom-canvas').screenshot());
    }
    for(let i=0;i<patterns.length;i++) for(let j=i+1;j<patterns.length;j++) assert.notDeepEqual(patterns[i],patterns[j],'line styles produce different rendered patterns');
    const changeCompanion=async(key,value)=>{
      await page.locator(`[id="innerCompanion.${key}"]`).evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
      await page.waitForTimeout(80);
    };
    for(const offset of [-40,0,40]) {
      await changeCompanion('radiusOffset',offset);
      const layer=(await snapshot()).layers[1];
      assert.equal(layer.companionRadii.length,1);
      assert.ok(Math.abs(layer.companionRadii[0]/layer.orbitRadii[0]-(1+offset/100))<1e-8);
    }
    for(const [key,value] of [['lineWidth',0.02],['intensity',0.2],['repeats',10]]) {
      const before=await page.locator('#atom-canvas').screenshot();await changeCompanion(key,value);
      assert.notDeepEqual(await page.locator('#atom-canvas').screenshot(),before,`${key} changes the companion appearance`);
    }
    await page.locator('#reset').click();
    const paired=await snapshot();
    assert.equal(paired.layers[1].companionRadii.length,paired.layers[1].orbits);
    assert.equal(paired.layers[0].companionRadii.length,0,'outer layer is not doubled');
    await changeCompanion('radiusOffset',-8);
    const adjusted=await snapshot();
    for(let i=0;i<2;i++) {
      assert.deepEqual(adjusted.layers[i].positions,paired.layers[i].positions,'companion editing does not move particles');
      assert.deepEqual(adjusted.layers[i].trailDegrees,paired.layers[i].trailDegrees);
      assert.deepEqual(adjusted.layers[i].intensities,paired.layers[i].intensities);
    }
    await page.locator('[id="innerCompanion.enabled"]').uncheck();await page.waitForTimeout(80);
    assert.equal((await snapshot()).layers[1].companionRadii.length,0);
    await page.locator('#reset').click();await page.locator('#close-controls').click();

    // A real captured pointer rotates only from the nucleus, including while paused.
    const dragRect=await page.locator('#atom-stage').boundingBox();
    const center={x:dragRect.x+dragRect.width/2,y:dragRect.y+dragRect.height/2};
    const beforeDrag=await snapshot();
    await page.mouse.move(center.x,center.y);await page.mouse.down();
    assert.equal((await snapshot()).rotating,true);
    await page.mouse.move(center.x+140,center.y+80,{steps:12});
    assert.notDeepEqual((await snapshot()).orientation,beforeDrag.orientation);
    assert.notDeepEqual((await snapshot()).layers[1].positions,beforeDrag.layers[1].positions);
    assert.equal((await snapshot()).time,beforeDrag.time,'drag does not resume a paused animation');
    assert.deepEqual((await snapshot()).layers[1].phases,beforeDrag.layers[1].phases);
    await page.mouse.move(400,40,{steps:10});await page.mouse.up();
    assert.equal((await snapshot()).rotating,false,'capture releases outside the stage');
    const afterDrag=await snapshot();
    await page.mouse.move(center.x+100,center.y);await page.mouse.down();
    await page.mouse.move(center.x+150,center.y+50,{steps:4});await page.mouse.up();
    assert.deepEqual((await snapshot()).orientation,afterDrag.orientation,'clicking outside nucleus does not rotate');
    await page.mouse.move(center.x,center.y);await page.mouse.down();
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();
    assert.equal((await snapshot()).rotating,false,'window blur cancels capture');
    await page.locator('#tune').click();

    const downloadPromise=page.waitForEvent('download'); await page.locator('#export').click();
    const download=await downloadPromise;
    const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));
    assert.equal(exported.version,9);
    assert.deepEqual(exported.config.scene.orientation,afterDrag.orientation,'export keeps the dragged orientation');
    const v8=structuredClone(exported);v8.version=8;
    const layeredBurst=v8.config.cameraShake;
    v8.config.cameraShake={...layeredBurst,burstAmplitude:layeredBurst.burstAmplitudeA+layeredBurst.burstAmplitudeB,burstFrequency:layeredBurst.burstFrequencyA};
    for(const key of ['burstAmplitudeA','burstFrequencyA','burstAmplitudeB','burstFrequencyB','burstPhaseB']) delete v8.config.cameraShake[key];
    await page.locator('#import-file').setInputFiles({name:'v8.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(v8))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent==='Nastavení načteno.');
    const migratedBurst=await page.evaluate(()=>heroAtom.getConfig().cameraShake);
    assert.equal(migratedBurst.burstPhaseB,0);
    assert.ok(Math.abs(migratedBurst.burstAmplitudeA-v8.config.cameraShake.burstAmplitude*0.72)<1e-12,'v8 burst migrates to layer A');
    assert.ok(Math.abs(migratedBurst.burstAmplitudeB-v8.config.cameraShake.burstAmplitude*0.28)<1e-12,'v8 burst migrates to layer B');
    const v7=structuredClone(v8);v7.version=7;
    const currentShake=v7.config.cameraShake;
    v7.config.cameraShake={enabled:currentShake.enabled,idleAmplitude:currentShake.idleAmplitudeA+currentShake.idleAmplitudeB,
      idleSpeed:currentShake.idleFrequencyA,burstAmplitude:currentShake.burstAmplitude,
      burstFrequency:currentShake.burstFrequency,burstDecay:currentShake.burstDecay};
    await page.locator('#import-file').setInputFiles({name:'v7.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(v7))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent==='Nastavení načteno.');
    const migratedShake=await page.evaluate(()=>heroAtom.getConfig().cameraShake);
    assert.equal(migratedShake.enabled,true);assert.equal(migratedShake.idlePhaseB,11.8);
    assert.ok(Math.abs(migratedShake.idleAmplitudeA-v7.config.cameraShake.idleAmplitude/1.45)<1e-12,'v7 idle blend migrates to layer A');
    assert.ok(Math.abs(migratedShake.idleAmplitudeB-v7.config.cameraShake.idleAmplitude*0.45/1.45)<1e-12,'v7 idle blend migrates to layer B');
    const v6=structuredClone(v7);v6.version=6;delete v6.config.cameraShake;
    await page.locator('#import-file').setInputFiles({name:'v6.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(v6))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent==='Nastavení načteno.');
    assert.equal(await page.evaluate(()=>heroAtom.getConfig().cameraShake.enabled),false,'v6 production preset keeps camera shake disabled');
    const v5=structuredClone(v6);v5.version=5;delete v5.config.innerCompanion;
    await page.locator('#import-file').setInputFiles({name:'v5.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(v5))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent==='Nastavení načteno.');
    assert.equal(await page.evaluate(()=>heroAtom.getConfig().innerCompanion.enabled),false,'older presets do not acquire extra orbits automatically');
    assert.equal(await page.evaluate(()=>heroAtom.getConfig().inner.trailImpulseMultiplier),v5.config.inner.trailImpulseMultiplier);
    const v4=structuredClone(v5);v4.version=4;
    for(const group of ['inner','outer']) for(const key of ['trailImpulseMultiplier','elementImpulseMultiplier']) delete v4.config[group][key];
    await page.locator('#import-file').setInputFiles({name:'v4.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(v4))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent==='Nastavení načteno.');
    const restored=await page.evaluate(()=>heroAtom.getConfig());
    for(const group of ['inner','outer']) {
      assert.equal(restored[group].trailImpulseMultiplier,1);assert.equal(restored[group].elementImpulseMultiplier,1);
      assert.deepEqual(restored[group],{...v4.config[group],trailImpulseMultiplier:1,elementImpulseMultiplier:1});
    }
    assert.deepEqual(restored.nebulaColor,v4.config.nebulaColor);
    const v3=structuredClone(v4);v3.version=3;
    delete v3.config.scene.orientation;Object.assign(v3.config.scene,{tiltX:9,tiltY:-14,tiltZ:-9});
    delete v3.config.nebulaColor;
    for(const group of ['inner','outer']) for(const key of ['saturation','coreWhiteness','lineWhiteness','trailWhiteness']) delete v3.config[group][key];
    await page.locator('#import-file').setInputFiles({name:'v3.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(v3))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent==='Nastavení načteno.');
    for(let i=0;i<4;i++) assert.ok(Math.abs((await snapshot()).orientation[i]-beforeDrag.orientation[i])<1e-12,'legacy tilt migrates to the same initial orientation');
    assert.equal(await page.evaluate(()=>heroAtom.getConfig().nebulaColor.linked),true,'legacy palette stays shared');
    const legacy=structuredClone(v3);legacy.version=1;
    delete legacy.config.burst;
    for(const key of ['noiseType','octaves','warp']) delete legacy.config.background[key];
    delete legacy.config.inner.trailWidth;delete legacy.config.outer.trailWidth;
    for(const key of ['triggerEnergy','energyDecay','cooldown','flashStrength','flashDuration','directionSpread']) delete legacy.config.cards[key];
    await page.locator('#import-file').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent==='Nastavení načteno.');
    assert.equal(await page.evaluate(()=>heroAtom.getConfig().background.noiseType),'value');
    const v2=structuredClone(v3);v2.version=2;delete v2.config.burst;
    v2.config.cards.flashStrength=2.8;v2.config.cards.flashDuration=0.65;
    await page.locator('#import-file').setInputFiles({name:'v2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(v2))});
    await page.waitForFunction(()=>Math.abs(heroAtom.getConfig().burst.intensity-7)<0.001);
    assert.equal(await page.evaluate(()=>heroAtom.getConfig().burst.decaySeconds),0.52);
    exported.config.inner.elementCount=17;
    await page.locator('#import-file').setInputFiles({name:'config.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
    await page.waitForFunction(()=>heroAtom.snapshot().layers[1].elements===17);
    for(let i=0;i<4;i++) assert.ok(Math.abs((await snapshot()).orientation[i]-afterDrag.orientation[i])<1e-12,'import restores dragged orientation');
    exported.config.inner.elementCount=-1;
    await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
    await page.waitForFunction(()=>document.querySelector('#config-status').textContent.includes('nepodařil'));
    assert.equal((await snapshot()).layers[1].elements,17,'invalid import leaves active settings intact');
    await page.locator('#reset').click(); await page.locator('#close-controls').click();

    // Peak impulse: 1.1 is exactly +10%, 1 is neutral even with retained boost.
    await page.evaluate(()=>{
      const c=heroAtom.getConfig();c.cards.enabled=false;c.interaction.maxBoost=1;c.interaction.strength=40;
      c.inner.trailImpulseMultiplier=1.1;c.inner.elementImpulseMultiplier=1.1;
      c.outer.trailImpulseMultiplier=1;c.outer.elementImpulseMultiplier=1;heroAtom.setConfig(c);
    });
    const idleImpulse=await snapshot();
    assert.ok(idleImpulse.layers[1].trailDegrees.every(value=>value===24));
    assert.ok(idleImpulse.layers[1].intensities.every(value=>value===1),'multipliers do not change idle brightness');
    await page.evaluate(()=>{
      heroAtom.pause(false);
      const stage=document.querySelector('#atom-stage'),r=stage.getBoundingClientRect();
      for(const x of [r.left+40,r.right-40]) stage.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:r.top+r.height/2,pointerType:'mouse'}));
      requestAnimationFrame(()=>heroAtom.pause(true));
    });
    await page.waitForFunction(()=>heroAtom.snapshot().paused);
    const peakImpulse=await snapshot(),peakIndex=peakImpulse.layers[1].boosts.findIndex(value=>value===1);
    assert.ok(peakIndex>=0,'the gesture reaches maximum boost');
    assert.ok(Math.abs(peakImpulse.layers[1].trailDegrees[peakIndex]-26.4)<1e-6,'24 degree trail grows by exactly 10%');
    assert.ok(Math.abs(peakImpulse.layers[1].intensities[peakIndex]-1.1)<1e-6,'particle radiance grows by exactly 10%');
    assert.ok(peakImpulse.layers[0].intensities.every(value=>value===1),'outer multiplier remains independent');
    assert.ok(peakImpulse.layers[0].trailDegrees.every(value=>value===12));
    const changeInner=async(key,value)=>{
      await page.locator(`[id="inner.${key}"]`).evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
      await page.waitForTimeout(80);
    };
    const extendedPixels=await page.locator('#atom-canvas').screenshot();
    await changeInner('trailImpulseMultiplier',1);
    assert.ok((await snapshot()).layers[1].trailDegrees.every(value=>value===24));
    const shortPixels=await page.locator('#atom-canvas').screenshot();
    assert.notDeepEqual(shortPixels,extendedPixels,'trail length changes actual geometry at a fixed phase');
    await changeInner('elementImpulseMultiplier',1);
    assert.ok((await snapshot()).layers[1].intensities.every(value=>value===1));
    assert.notDeepEqual(await page.locator('#atom-canvas').screenshot(),shortPixels,'intensity changes actual particle pixels');
    assert.deepEqual((await snapshot()).layers[1].boosts,peakImpulse.layers[1].boosts,'editing visual response leaves motion energy intact');
    await changeInner('trailImpulseMultiplier',1.1);await changeInner('elementImpulseMultiplier',1.1);
    await page.evaluate(()=>heroAtom.pause(false));await page.waitForTimeout(650);await page.evaluate(()=>heroAtom.pause(true));
    const fadingImpulse=(await snapshot()).layers[1];
    assert.ok(fadingImpulse.trailDegrees[peakIndex]>24 && fadingImpulse.trailDegrees[peakIndex]<26.4,'trail contracts with impulse decay');
    assert.ok(fadingImpulse.intensities[peakIndex]>1 && fadingImpulse.intensities[peakIndex]<1.1,'particle fades with impulse decay');
    await page.evaluate(async()=>heroAtom.setConfig((await import('./config.js')).cloneConfig()));

    await page.evaluate(()=>heroAtom.pause(false)); await page.waitForTimeout(600);
    const moving=await snapshot();
    assert.equal(moving.emissions,0,'idle animation never emits cards');
    assert.ok(moving.time>frozen.time); assert.notEqual(moving.layers[1].phases[0],phase);
    const rect=await page.locator('#atom-stage').boundingBox();
    const target=moving.layers[1].positions[0];
    await page.mouse.move(rect.x+target.x-90,rect.y+target.y);
    await page.mouse.move(rect.x+target.x+90,rect.y+target.y,{steps:12});
    await page.waitForTimeout(80);
    const boost=(await snapshot()).layers[1].boosts[0];
    assert.ok(boost>0.1,'cursor transfers energy to nearby orbit elements');
    await page.mouse.move(10,10); await page.waitForTimeout(2800);
    const decayed=(await snapshot()).layers[1].boosts[0];
    assert.ok(decayed<boost*0.5,'energy settles toward base angular speed');

    await page.evaluate(()=>heroAtom.pause(true));
    const paused=await snapshot(); await page.waitForTimeout(300);
    assert.deepEqual(await snapshot(),paused,'pause stops all animation frames');
    await page.evaluate(()=>{
      const spacer=document.createElement('div');spacer.id='qa-spacer';spacer.style.height='2500px';document.body.append(spacer);
      heroAtom.pause(false);window.scrollTo(0,document.body.scrollHeight);
    });
    await page.waitForTimeout(200); const offscreen=await snapshot();
    assert.equal(offscreen.running,false);
    await page.waitForTimeout(250); assert.equal((await snapshot()).frames,offscreen.frames);
    await page.evaluate(()=>{document.querySelector('#qa-spacer').remove();window.scrollTo(0,0);});
    await page.waitForTimeout(250); assert.equal((await snapshot()).running,true);

    await page.evaluate(()=>{
      window.qaLoss=document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context');qaLoss.loseContext();
    });
    await page.waitForTimeout(150); assert.equal((await snapshot()).running,false);
    await page.evaluate(()=>qaLoss.restoreContext()); await page.waitForTimeout(400);
    assert.equal((await snapshot()).running,true,'WebGL context restoration resumes the render');
    assert.deepEqual(errors,[]);

    // Triggered cards: insufficient energy, then a real burst, cooldown, pause and expiry.
    await page.evaluate(()=>{
      const c=heroAtom.getConfig();c.cards.triggerEnergy=100;c.cards.cycleSeconds=3;
      c.interaction.strength=0.05;heroAtom.setConfig(c);
    });
    const beforeWeak=(await snapshot()).emissions;
    await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);
    await page.mouse.move(rect.x+rect.width*.5+4,rect.y+rect.height*.5,{steps:4});
    await page.waitForTimeout(100);assert.equal((await snapshot()).emissions,beforeWeak,'weak pass stays below the threshold');
    // Both shells still accelerate, but an outer-only pass cannot charge the nucleus.
    await page.evaluate(()=>{
      const c=heroAtom.getConfig();c.inner.elementCount=0;c.cards.triggerEnergy=0.1;
      c.interaction.strength=40;c.interaction.maxBoost=100;heroAtom.setConfig(c);
    });
    await page.mouse.move(rect.x+80,rect.y+rect.height*.5);
    await page.mouse.move(rect.x+rect.width-80,rect.y+rect.height*.5,{steps:12});
    await page.waitForTimeout(100);
    const outerOnly=await snapshot();
    assert.ok(Math.max(...outerOnly.layers[0].boosts)>10,'outer shell responds strongly');
    assert.equal(outerOnly.energy,0);assert.equal(outerOnly.flash,0);assert.equal(outerOnly.emissions,beforeWeak);
    await page.evaluate(()=>{
      heroAtom.pause(true);const c=heroAtom.getConfig();c.inner.elementCount=11;heroAtom.setConfig(c);heroAtom.pause(false);
    });
    await page.mouse.move(center.x,center.y);await page.mouse.down();
    await page.mouse.move(center.x+130,center.y-100,{steps:12});await page.mouse.up();
    await page.waitForTimeout(100);
    const activeDrag=await snapshot();
    assert.equal(activeDrag.energy,0);assert.equal(activeDrag.emissions,beforeWeak,'rotation does not wake the nucleus');
    assert.ok(activeDrag.layers.every(layer=>layer.boosts.every(boost=>boost===0)),'rotation does not accelerate particles');
    await page.evaluate(()=>{
      const c=heroAtom.getConfig();c.cards.triggerEnergy=0.1;c.cards.cooldown=1.5;
      c.interaction.strength=40;c.interaction.maxBoost=100;heroAtom.setConfig(c);
    });
    await page.mouse.move(rect.x+80,rect.y+rect.height*.5);
    await page.mouse.move(rect.x+rect.width-80,rect.y+rect.height*.5,{steps:12});
    await page.waitForTimeout(80);
    const burst=await snapshot();
    assert.equal(burst.emissions,beforeWeak+1);assert.equal(burst.cards.length,1);
    assert.ok(burst.flash>0,'the nucleus flashes with the emission');
    assert.ok(Math.max(...burst.layers.flatMap(l=>l.boosts))>10,'extended impulse range changes actual speed');
    await page.mouse.move(rect.x+80,rect.y+rect.height*.5,{steps:12});
    await page.waitForTimeout(80);assert.equal((await snapshot()).emissions,burst.emissions,'cooldown prevents immediate repeats');
    await page.mouse.move(0,0);await page.evaluate(()=>heroAtom.pause(true));
    const frozenBurst=await snapshot();await page.waitForTimeout(250);
    assert.deepEqual(await snapshot(),frozenBurst,'flash and emitted cards freeze with pause');
    await page.evaluate(()=>heroAtom.pause(false));
    await page.waitForTimeout(3200);
    assert.equal((await snapshot()).cards.length,0,'cards expire instead of looping');
    assert.equal((await snapshot()).emissions,burst.emissions,'stored energy does not emit without a new gesture');
    await page.mouse.move(rect.x+80,rect.y+rect.height*.5);
    await page.mouse.move(rect.x+rect.width-80,rect.y+rect.height*.5,{steps:12});
    await page.waitForTimeout(100);
    assert.equal((await snapshot()).emissions,burst.emissions+1);
    assert.notEqual((await snapshot()).cards[0].phrase,burst.cards[0].phrase,'consecutive emissions choose different complete phrases');

    // The independent light layer expands beyond the outer orbits while its peak fades.
    await page.evaluate(()=>{
      heroAtom.pause(true);const c=heroAtom.getConfig();c.burst.radius=2;
      c.burst.expansionSeconds=0.8;c.burst.decaySeconds=0.55;heroAtom.setConfig(c);
    });
    await page.locator('#tune').click();
    await page.locator('summary').filter({hasText:'Výbuch jádra'}).click();
    const emissionsBeforePreview=(await snapshot()).emissions;
    await page.locator('#preview-burst').click();await page.waitForTimeout(160);
    const earlyBurst=(await snapshot()).bursts[0];
    await page.waitForTimeout(750);
    const lateBurst=(await snapshot()).bursts[0];
    assert.ok(lateBurst.radius>earlyBurst.radius,'burst expands as it ages');
    assert.ok(lateBurst.intensity<earlyBurst.intensity,'peak intensity decreases during expansion');
    const outerExtent=await page.evaluate(()=>{const c=heroAtom.getConfig();return (c.outer.radius+c.outer.radiusSpread)*c.scene.scale;});
    assert.ok(lateBurst.radius>outerExtent*1.9,'radius can reach twice the outer envelope');
    assert.equal((await snapshot()).emissions,emissionsBeforePreview,'preview makes no card');
    await page.locator('#preview-burst').click();await page.waitForTimeout(100);
    const overlapping=await snapshot();
    assert.equal(overlapping.bursts.length,2);
    assert.ok(overlapping.bursts[0].radius>=lateBurst.radius,'new emission does not collapse an older burst');
    await page.evaluate(()=>heroAtom.pause(true));
    const frozenLight=await snapshot();await page.waitForTimeout(150);
    assert.deepEqual(await snapshot(),frozenLight,'expanded light freezes too');
    const soft=await page.locator('#atom-canvas').screenshot();
    await page.locator('[id="burst.falloff"]').evaluate(input=>{input.value='12';input.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.waitForTimeout(80);
    assert.notDeepEqual(await page.locator('#atom-canvas').screenshot(),soft,'spatial falloff changes rendered light');
    await page.locator('#close-controls').click();

    // A triggered billboard fits a narrow viewport; touch scrolling does not emit cards.
    const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    mobile.on('pageerror',error=>errors.push(error.message));
    await mobile.goto(url);await mobile.waitForFunction(()=>window.heroAtom);await mobile.evaluate(()=>document.fonts.ready);
    await mobile.locator('#atom-stage').scrollIntoViewIfNeeded();
    assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await mobile.evaluate(()=>{
      const c=heroAtom.getConfig();c.cards.triggerEnergy=0.1;c.interaction.strength=40;heroAtom.setConfig(c);heroAtom.pause(false);
      const el=document.querySelector('#atom-stage'),r=el.getBoundingClientRect();
      for(const x of [r.left+20,r.right-20]) el.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:r.top+r.height*.5,pointerType:'touch'}));
    });
    await mobile.waitForTimeout(100);assert.equal(await mobile.evaluate(()=>heroAtom.snapshot().emissions),0);
    const mobileRect=await mobile.locator('#atom-stage').boundingBox();
    await mobile.mouse.move(mobileRect.x+20,mobileRect.y+mobileRect.height*.5);
    await mobile.mouse.move(mobileRect.x+mobileRect.width-20,mobileRect.y+mobileRect.height*.5,{steps:12});
    await mobile.waitForTimeout(900);
    assert.ok(await mobile.locator('.atom-card:visible').count()>0);
    const bounds=await mobile.evaluate(()=>{
      const stage=document.querySelector('#atom-stage').getBoundingClientRect();
      return [...document.querySelectorAll('.atom-card:not([hidden])')].every(card=>{
        const r=card.getBoundingClientRect();return r.left>=stage.left && r.right<=stage.right && r.top>=stage.top && r.bottom<=stage.bottom;
      });
    });
    assert.ok(bounds,'mobile billboard bounds');
    assert.deepEqual(errors,[]);
    await mobile.close();

    const fallback=await browser.newPage();
    await fallback.addInitScript(()=>{
      const getContext=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl') ? null : getContext.call(this,type,...args);};
    });
    await fallback.goto(url); await fallback.locator('#atom-fallback').waitFor({state:'visible'});
    assert.equal(await fallback.locator('#pause').isDisabled(),true);
    await fallback.close();
    console.log('PASS: volumetric orbits at edge-on angles; five companion styles; signed offsets, thickness, intensity and repeat count; independent particles/trails; v1-v8 import; impulse trails and radiance; palettes; dual-layer ShakyCam idle and burst response; core drag; bursts; cards; pause; mobile/touch; context recovery; fallback.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
