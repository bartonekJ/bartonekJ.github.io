import * as THREE from './vendor/three.module.min.js';
import { NOISE_TYPES, ORBIT_STYLES } from './config.js';
import { createOrbitGeometry, companionRadius } from './orbit-geometry.js';
import { backgroundVertex, backgroundFragment, burstFragment, orbitVertex, orbitFragment, ribbonVertex, ribbonFragment, pointsVertex, pointsFragment } from './shaders.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const FRAME_INTERVAL=1000/60;
const QUALITY_WARMUP=2000;
const QUALITY_WINDOW=2000;
const QUALITY_MIN_FPS=50;
const TOUCH_ROTATE_THRESHOLD=8;
const TOUCH_TAP_DISTANCE=10;
const TOUCH_TAP_DURATION=500;
const CORE_TOUCH_SIZE=56;
const QUALITY_PROFILES=[
  {name:'full',orbitSegments:192,tubeSegments:8,minTrailSegments:28},
  {name:'balanced',orbitSegments:192,tubeSegments:8,minTrailSegments:28},
  {name:'reduced',orbitSegments:128,tubeSegments:6,minTrailSegments:20},
];
const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
const smooth = (a, b, x) => { const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const mixNumber = (a,b,t) => a+(b-a)*t;
function noiseHash(index,seed) {
  let value=Math.imul((index|0)^(seed|0),0x45d9f3b);
  value=Math.imul(value^(value>>>16),0x45d9f3b); value^=value>>>16;
  return (value>>>0)/2147483648-1;
}
function smoothNoise1D(value,seed) {
  const index=Math.floor(value),fraction=value-index;
  const eased=fraction*fraction*(3-2*fraction);
  return mixNumber(noiseHash(index,seed),noiseHash(index+1,seed),eased);
}
function randomGenerator(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function positionOnOrbit(orbit, phase, target, radiusOffset=0) {
  return target.set(Math.cos(phase)*(orbit.radius+radiusOffset), Math.sin(phase)*(orbit.radius+radiusOffset), 0).applyQuaternion(orbit.rotation);
}
function createRibbonGeometry(count, segments) {
  const vertices = count*(segments+1)*2;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(vertices*3),3));
  geometry.setAttribute('across',new THREE.BufferAttribute(new Float32Array(vertices),1));
  geometry.setAttribute('strength',new THREE.BufferAttribute(new Float32Array(vertices),1));
  const indices=[];
  for (let n=0;n<count;n++) for (let j=0;j<segments;j++) {
    const a=n*(segments+1)*2+j*2;
    indices.push(a,a+1,a+2,a+1,a+3,a+2);
  }
  geometry.setIndex(indices);
  return geometry;
}
function segmentDistance(px,py,ax,ay,bx,by) {
  const dx=bx-ax,dy=by-ay;
  const t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy || 1),0,1);
  return Math.hypot(px-ax-t*dx,py-ay-t*dy);
}

export class AtomScene {
  constructor(stage, config, onState=()=>{}, options={}) {
    this.stage=stage; this.config=config; this.onState=onState; this.options=options;
    this.canvas=stage.querySelector('canvas');
    this.cardRoot=stage.querySelector('#atom-cards');
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.baseColor=new THREE.Color(options.backgroundColor || '#0b1011');
    this.edgeColor=new THREE.Color(options.edgeBackgroundColor || options.backgroundColor || '#0b1011');
    this.renderer.setClearColor(this.edgeColor);
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(38,1,0.1,50);
    this.root=new THREE.Group(); this.scene.add(this.root);
    this.tint=new THREE.Color(config.color.warm);
    this.nebulaTint=new THREE.Color(config.nebulaColor.warm);
    this.warm=new THREE.Color(); this.cool=new THREE.Color();
    this.viewOrientation=new THREE.Quaternion().fromArray(config.scene.orientation);
    this.precessionRotation=new THREE.Quaternion(); this.dragRotation=new THREE.Quaternion();
    this.rotationAxis=new THREE.Vector3(); this.upAxis=new THREE.Vector3(0,1,0); this.drag=null;
    this.temp=new THREE.Vector3(); this.projected=new THREE.Vector3(); this.shake=new THREE.Vector2();
    this.time=0; this.colorPhase=0; this.precessionPhase=0;
    this.cardEnergy=0; this.lastEmission=-Infinity; this.emissions=0; this.flash=0;
    this.bursts=[]; this.burstFrames=[]; this.lastPreview=-Infinity; this.shakeBursts=[]; this.shakeBurstLevel=0;
    this.cardRandom=randomGenerator(config.seed^0x5EED); this.lastMessage=-1;
    this.shakeRandom=randomGenerator(config.seed^0x5A4ECA7);
    const forcedTier=QUALITY_PROFILES.findIndex(profile=>profile.name===options.qualityTier);
    this.qualityIndex=forcedTier>=0 ? forcedTier : 0;
    this.adaptiveQuality=options.adaptiveQuality!==false && forcedTier<0;
    this.performanceFps=0; this.performanceFrames=0; this.performanceStarted=0; this.performanceWarmupUntil=0;
    this.lastTime=0; this.nextFrameTime=0; this.raf=0; this.frames=0; this.layers=[];
    this.visible=true; this.lost=false; this.disposed=false;
    this.motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
    this.paused=this.motionQuery.matches;
    this.pendingImpulse=[]; this.pointer=null; this.touch=null;
    this.coreHit=document.createElement('div'); this.coreHit.className='atom-core-hit'; this.coreHit.setAttribute('aria-hidden','true');
    stage.append(this.coreHit);
    this.abort=new AbortController();
    const signal=this.abort.signal;
    this.createBackground(); this.createCore(); this.createBurstLayer(); this.rebuild(false); this.createCards();
    this.resizeObserver=new ResizeObserver(()=>{ this.resize(); this.invalidate(); });
    this.resizeObserver.observe(stage);
    this.intersectionObserver=new IntersectionObserver(entries=>{
      this.visible=entries[0].isIntersecting; this.syncLoop();
    },{threshold:0});
    this.intersectionObserver.observe(stage);
    document.addEventListener('visibilitychange',()=>this.syncLoop(),{signal});
    this.motionQuery.addEventListener('change',()=>this.setPaused(this.motionQuery.matches),{signal});
    stage.addEventListener('pointermove',e=>this.onPointerMove(e),{signal});
    stage.addEventListener('pointerdown',e=>this.onPointerDown(e),{signal});
    stage.addEventListener('pointerup',e=>this.onPointerEnd(e,false),{signal});
    for(const name of ['pointercancel','lostpointercapture'])
      stage.addEventListener(name,e=>this.onPointerEnd(e,true),{signal});
    window.addEventListener('blur',()=>this.cancelInteraction(),{signal});
    stage.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch') this.pointer=null;if(!this.drag) stage.style.cursor='';},{signal});
    this.canvas.addEventListener('webglcontextlost',e=>{
      e.preventDefault(); this.lost=true; this.syncLoop(); this.onState('lost');
    },{signal});
    this.canvas.addEventListener('webglcontextrestored',()=>{
      this.lost=false; this.resize(); this.syncLoop(); this.onState('restored');
    },{signal});
    this.resize(); this.render(0); this.syncLoop();
  }
  createBackground() {
    this.backgroundMaterial=new THREE.ShaderMaterial({
      uniforms:{uResolution:{value:new THREE.Vector2()},uTint:{value:this.nebulaTint},uBaseColor:{value:this.baseColor},uEdgeColor:{value:this.edgeColor},
        uBackgroundFade:{value:new THREE.Vector2(...(this.options.backgroundFade || [0,0.12]))},uCameraOffset:{value:new THREE.Vector2()},uTime:{value:0},
        uIntensity:{value:0},uScale:{value:0},uSpeed:{value:0},uSpacing:{value:24},
        uGridOpacity:{value:0},uDotSize:{value:0},uLight:{value:new THREE.Vector2()},
        uNoiseType:{value:0},uCloudOctaves:{value:5},uWarpOctaves:{value:5},uWarp:{value:2.6}},
      vertexShader:backgroundVertex,fragmentShader:backgroundFragment,depthTest:false,depthWrite:false,
    });
    const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.backgroundMaterial);
    quad.frustumCulled=false; quad.renderOrder=-100; this.scene.add(quad);
  }
  pointMaterial(glow,radius,saturation=1,coreWhiteness=1) {
    return new THREE.ShaderMaterial({uniforms:{uTint:{value:this.tint},uGlow:{value:glow},uRadius:{value:radius},uViewportHeight:{value:1},
      uSaturation:{value:saturation},uCoreWhiteness:{value:coreWhiteness}},
      vertexShader:pointsVertex,fragmentShader:pointsFragment,
      transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
  }
  orbitMaterial(opacity,radius,white,saturation,style='solid',repeats=24) {
    return new THREE.ShaderMaterial({
      uniforms:{uTint:{value:this.tint},uOpacity:{value:opacity},uRadius:{value:radius},uWhite:{value:white},
        uSaturation:{value:saturation},uStyle:{value:ORBIT_STYLES.findIndex(([id])=>id===style)},uRepeats:{value:repeats}},
      vertexShader:orbitVertex,fragmentShader:orbitFragment,
      transparent:true,depthTest:false,depthWrite:false,side:THREE.FrontSide,
    });
  }
  ribbonMaterial(opacity,radius,white,emissive=false,saturation=1) {
    return new THREE.ShaderMaterial({uniforms:{uTint:{value:this.tint},uOpacity:{value:opacity},uRadius:{value:radius},uWhite:{value:white},uEmission:{value:emissive ? 1 : 0},uSaturation:{value:saturation}},
      vertexShader:ribbonVertex,fragmentShader:ribbonFragment,transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,
      blending:emissive ? THREE.AdditiveBlending : THREE.NormalBlending});
  }
  createCore() {
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0],3));
    geo.setAttribute('size',new THREE.Float32BufferAttribute([0.063],1));
    geo.setAttribute('whiteness',new THREE.Float32BufferAttribute([0.6],1));
    geo.setAttribute('intensity',new THREE.Float32BufferAttribute([1],1));
    this.core=new THREE.Points(geo,this.pointMaterial(1.0,2)); this.core.renderOrder=4;
    this.root.add(this.core);
  }
  createBurstLayer() {
    this.burstMaterial=new THREE.ShaderMaterial({
      uniforms:{uCenter:{value:new THREE.Vector2()},uViewSize:{value:new THREE.Vector2()},
        uTint:{value:this.tint},uStartRadius:{value:0.1},uFalloff:{value:5},uBurstCount:{value:0},
        uBursts:{value:Array.from({length:48},()=>new THREE.Vector2())}},
      vertexShader:backgroundVertex,fragmentShader:burstFragment,
      transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,
    });
    this.burstLayer=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.burstMaterial);
    this.burstLayer.frustumCulled=false; this.burstLayer.renderOrder=5; this.burstLayer.visible=false;
    this.scene.add(this.burstLayer);
  }
  triggerBurst() {
    // 48 slots cover the longest allowed decay at the shortest emission interval.
    // A separate event retains the older expanding waves instead of restarting them.
    if(this.bursts.length>=48) this.bursts.shift();
    this.bursts.push(this.time);
    if(this.shakeBursts.length>=24) this.shakeBursts.shift();
    this.shakeBursts.push({born:this.time,phaseX:this.shakeRandom()*TAU,phaseY:this.shakeRandom()*TAU});
  }
  previewBurst() {
    if(this.time-this.lastPreview<0.5) return;
    this.lastPreview=this.time;
    if(this.paused) this.setPaused(false);
    this.triggerBurst(); this.invalidate();
  }
  get qualityProfile() { return QUALITY_PROFILES[this.qualityIndex]; }
  effectiveQuality() {
    const configured=Math.max(1,Math.round(this.config.background.octaves));
    if(this.qualityIndex===0) return {cloudOctaves:configured,warpOctaves:configured};
    if(this.qualityIndex===1) {
      const cloudOctaves=Math.max(1,Math.ceil(configured*2/3));
      return {cloudOctaves,warpOctaves:Math.min(3,cloudOctaves)};
    }
    return {cloudOctaves:Math.max(1,Math.ceil(configured/3)),warpOctaves:1};
  }
  setQualityTier(tier,automatic=false) {
    const next=typeof tier==='number' ? tier : QUALITY_PROFILES.findIndex(profile=>profile.name===tier);
    if(next<0 || next>=QUALITY_PROFILES.length || next===this.qualityIndex) return false;
    const geometryChanged=this.qualityProfile.orbitSegments!==QUALITY_PROFILES[next].orbitSegments
      || this.qualityProfile.tubeSegments!==QUALITY_PROFILES[next].tubeSegments
      || this.qualityProfile.minTrailSegments!==QUALITY_PROFILES[next].minTrailSegments;
    this.qualityIndex=next;
    if(geometryChanged) this.rebuild(true);
    this.resetPerformanceWindow(performance.now(),automatic ? QUALITY_WARMUP : 0);
    this.onState('quality'); this.invalidate();
    return true;
  }
  resetPerformanceWindow(timestamp=0,warmup=QUALITY_WARMUP) {
    this.performanceFrames=0; this.performanceStarted=0; this.performanceWarmupUntil=timestamp+warmup;
  }
  measurePerformance(timestamp) {
    if(timestamp<this.performanceWarmupUntil) return;
    if(!this.performanceStarted) {this.performanceStarted=timestamp;this.performanceFrames=1;return;}
    this.performanceFrames++;
    const elapsed=timestamp-this.performanceStarted;
    if(elapsed<QUALITY_WINDOW) return;
    this.performanceFps=(this.performanceFrames-1)*1000/elapsed;
    this.performanceFrames=0; this.performanceStarted=0;
    this.onState('performance');
    if(this.adaptiveQuality && this.performanceFps<QUALITY_MIN_FPS && this.qualityIndex<QUALITY_PROFILES.length-1)
      this.setQualityTier(this.qualityIndex+1,true);
  }
  rebuild(preserve=true) {
    const previous=this.layers;
    this.layers=['outer','inner'].map((name,index)=>{
      const cfg=this.config[name];
      const random=randomGenerator(this.config.seed+(index+1)*1931);
      const spread=value=>(random()*2-1)*value;
      const orbitCount=cfg.orbitCount;
      const orbits=Array.from({length:orbitCount},(_,i)=>({
        radius:Math.max(0.2,cfg.radius+spread(cfg.radiusSpread)),
        rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(
          (cfg.angle+spread(cfg.angleSpread))*DEG,
          spread(cfg.angleSpread*0.45)*DEG,
          (cfg.azimuth+i*180/Math.max(1,orbitCount)+spread(cfg.azimuthSpread))*DEG,'ZXY')),
      }));
      const elements=Array.from({length:orbitCount ? cfg.elementCount : 0},(_,i)=>{
        const phase=random()*TAU;
        return {orbit:orbits[i%orbitCount],phase:preserve ? previous[index]?.elements[i]?.phase ?? phase : phase,
          size:cfg.elementSize*(1+spread(cfg.sizeSpread)),rate:cfg.speed*DEG*(1+spread(cfg.speedSpread)),
          white:random()<cfg.whiteFraction ? 1 : 0, boost:preserve ? previous[index]?.elements[i]?.boost ?? 0 : 0,screen:{x:0,y:0}};
      });
      const profile=this.qualityProfile;
      const geometryOptions={subtleBreaks:name==='outer',orbitSegments:profile.orbitSegments,tubeSegments:profile.tubeSegments};
      const ringGeometry=createOrbitGeometry(orbits,cfg.lineWidth,geometryOptions);
      const rings=new THREE.Mesh(ringGeometry,this.orbitMaterial(cfg.orbitOpacity,cfg.radius,cfg.lineWhiteness,cfg.saturation));
      rings.frustumCulled=false; rings.renderOrder=1;
      const companionConfig=this.config.innerCompanion;
      let companion=null;
      if(name==='inner' && companionConfig.enabled && orbits.length) {
        companion=new THREE.Mesh(createOrbitGeometry(orbits,companionConfig.lineWidth,{...geometryOptions,subtleBreaks:false,offset:companionConfig.radiusOffset}),
          this.orbitMaterial(companionConfig.intensity,cfg.radius,cfg.lineWhiteness,cfg.saturation,companionConfig.style,companionConfig.repeats));
        companion.frustumCulled=false; companion.renderOrder=1;
      }
      const pointGeometry=new THREE.BufferGeometry();
      pointGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(elements.length*3),3).setUsage(THREE.DynamicDrawUsage));
      pointGeometry.setAttribute('size',new THREE.Float32BufferAttribute(elements.map(e=>e.size),1));
      pointGeometry.setAttribute('whiteness',new THREE.Float32BufferAttribute(elements.map(e=>e.white),1));
      pointGeometry.setAttribute('intensity',new THREE.BufferAttribute(new Float32Array(elements.length).fill(1),1).setUsage(THREE.DynamicDrawUsage));
      const points=new THREE.Points(pointGeometry,this.pointMaterial(cfg.glow,cfg.radius,cfg.saturation,cfg.coreWhiteness));
      points.frustumCulled=false; points.renderOrder=3;
      // Keep long accelerated trails smooth, without changing the neutral geometry.
      const trailSegments=Math.max(profile.minTrailSegments,Math.ceil(cfg.trailDegrees*cfg.trailImpulseMultiplier/2.5));
      const trailGeometry=createRibbonGeometry(elements.length,trailSegments);
      trailGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
      for(let i=0;i<elements.length;i++) for(let j=0;j<=trailSegments;j++) for(let side=0;side<2;side++) {
        const v=i*(trailSegments+1)*2+j*2+side;
        trailGeometry.attributes.across.array[v]=side ? 1 : -1;
        trailGeometry.attributes.strength.array[v]=Math.pow(1-j/trailSegments,1.7);
      }
      const trails=new THREE.Mesh(trailGeometry,this.ribbonMaterial(cfg.trailOpacity,cfg.radius,cfg.trailWhiteness,true,cfg.saturation));
      trails.frustumCulled=false; trails.renderOrder=2;
      const group=new THREE.Group(); group.add(rings,points,trails); this.root.add(group);
      if(companion) group.add(companion);
      return {name,orbits,elements,group,rings,companion,points,trails,trailSegments};
    });
    for(const layer of previous) {
      this.root.remove(layer.group);
      layer.group.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});
    }
  }
  createCards() {
    this.cardRoot.replaceChildren();
    this.cards=[]; this.cardEnergy=0; this.lastEmission=-Infinity; this.flash=0;
    this.bursts=[]; this.burstFrames=[]; this.shakeBursts=[]; this.shakeBurstLevel=0;
  }
  emitCard() {
    const cfg=this.config.cards;
    let choices=cfg.messages.map((message,index)=>({message,index})).filter(({index})=>index!==this.lastMessage);
    if(!choices.length) choices=[{message:cfg.messages[0],index:0}];
    const {message,index}=choices[Math.floor(this.cardRandom()*choices.length)];
    this.lastMessage=index;
    // Favor the phrase's direction, using a free sector if another card is there.
    const directions=[message.direction,145,24,-58];
    const separation=angle=>this.cards.reduce((closest,item)=>{
      const d=Math.abs(((angle-item.direction)%360+540)%360-180);
      return Math.min(closest,d);
    },360);
    let direction=directions[0];
    if(separation(direction)<55) direction=directions.reduce((best,a)=>separation(a)>separation(best) ? a : best);
    direction+=(this.cardRandom()*2-1)*cfg.directionSpread;
    const card=document.createElement('div'); card.className='atom-card'; card.hidden=true;
    const from=document.createElement('span'),arrow=document.createElement('strong'),to=document.createElement('span');
    from.textContent=message.from; arrow.textContent='→'; to.textContent=message.to;
    card.append(from,arrow,to); this.cardRoot.append(card);
    this.cards.push({card,direction,born:this.time+0.10,lifetime:cfg.cycleSeconds,phrase:`${message.from} → ${message.to}`});
    this.lastEmission=this.time; this.cardEnergy=0; this.emissions++;
    this.triggerBurst();
  }
  resize() {
    this.endDrag();
    this.width=Math.max(1,this.stage.clientWidth); this.height=Math.max(1,this.stage.clientHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1,this.config.scene.pixelRatio,this.width<600 ? 1.25 : 2));
    this.renderer.setSize(this.width,this.height,false);
    this.camera.aspect=this.width/this.height; this.camera.clearViewOffset();
    const requested=this.options.layout?.({width:this.width,height:this.height,stage:this.stage}) || {};
    const focusWidth=clamp(requested.focusWidth || this.width,1,this.width);
    const focusHeight=clamp(requested.focusHeight || this.height,1,this.height);
    const centerX=clamp(requested.centerX ?? this.width/2,0,this.width);
    const centerY=clamp(requested.centerY ?? this.height/2,0,this.height);
    // The focus rectangle controls scale; the larger stage reveals more scene around it.
    const span=focusWidth<600 ? 5.9 : 5.55;
    const viewHeight=Math.max(span,span/(focusWidth/focusHeight));
    this.camera.position.z=viewHeight/(2*Math.tan(19*DEG));
    this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
    const viewWidth=viewHeight*this.camera.aspect;
    this.root.position.set((centerX/this.width-0.5)*viewWidth,(0.5-centerY/this.height)*viewHeight,0);
    this.centerX=centerX; this.centerY=centerY; this.visualCenterX=centerX; this.visualCenterY=centerY;
    this.fieldRadius=Math.min(focusWidth,focusHeight)*0.53;
    this.shake.set(0,0); this.backgroundMaterial.uniforms.uCameraOffset.value.set(0,0);
    this.coreHit.style.transform=`translate3d(${centerX-CORE_TOUCH_SIZE/2}px,${centerY-CORE_TOUCH_SIZE/2}px,0)`;
    this.backgroundMaterial.uniforms.uResolution.value.set(this.width,this.height);
    this.pointer=null;
  }
  update(config,path='') {
    const oldMessages=JSON.stringify(this.config.cards.messages);
    this.config=config;
    this.viewOrientation.fromArray(config.scene.orientation);
    if(!path || /^(inner|outer|seed)/.test(path)) this.rebuild(path!=='seed');
    if(path==='seed') {this.cardRandom=randomGenerator(config.seed^0x5EED);this.shakeRandom=randomGenerator(config.seed^0x5A4ECA7);this.lastMessage=-1;}
    if(path==='seed' || !config.cards.enabled || oldMessages!==JSON.stringify(config.cards.messages)) this.createCards();
    while(this.cards.length>config.cards.count) this.cards.shift().card.remove();
    if(!config.interaction.enabled) {this.pendingImpulse.length=0;this.cardEnergy=0;}
    this.resize(); this.invalidate();
  }
  isOverCore(x,y,radius=22) {
    return Math.hypot(x-this.visualCenterX,y-this.visualCenterY)<=radius;
  }
  isInsideField(x,y) {
    return Math.hypot(x-this.visualCenterX,y-this.visualCenterY)<=this.fieldRadius;
  }
  relativePointer(event) {
    const rect=this.stage.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top,t:event.timeStamp};
  }
  queueImpulse(a,b,length=Math.hypot(b.x-a.x,b.y-a.y),speed=null) {
    if(this.paused || !this.config.interaction.enabled || length<=0) return;
    const elapsed=clamp((b.t-a.t)/1000,0.008,0.15);
    this.pendingImpulse.push({a,b,length,speed:speed ?? Math.min(2200,length/elapsed)});
    if(this.pendingImpulse.length>32) this.pendingImpulse.shift();
  }
  queueTap(point) {
    const equivalentLength=this.config.interaction.radius;
    this.queueImpulse(point,point,equivalentLength,1100);
  }
  capturePointer(id) {
    try {this.stage.setPointerCapture(id);} catch {}
  }
  releasePointer(id) {
    try {if(this.stage.hasPointerCapture(id)) this.stage.releasePointerCapture(id);} catch {}
  }
  beginDrag(event,x,y) {
    // Fold the current automatic rotation into the pose so an exported drag matches the view.
    this.viewOrientation.copy(this.root.quaternion); this.precessionPhase=0;
    this.config.scene.orientation=this.viewOrientation.toArray();
    this.drag={id:event.pointerId,x,y};
    this.pointer=null; this.pendingImpulse.length=0;
    this.capturePointer(event.pointerId); this.stage.style.cursor='grabbing';
    event.preventDefault();
  }
  onPointerDown(event) {
    if(!event.isPrimary || event.button!==0 || this.drag || this.touch || this.lost) return;
    const point=this.relativePointer(event);
    if(event.pointerType==='touch') {
      const core=this.isOverCore(point.x,point.y,CORE_TOUCH_SIZE/2);
      this.touch={id:event.pointerId,start:point,last:point,mode:core ? 'core' : 'pending'};
      if(core) this.capturePointer(event.pointerId);
      return;
    }
    if(!this.isOverCore(point.x,point.y)) return;
    this.beginDrag(event,event.clientX,event.clientY);
  }
  rotateDrag(event) {
    if(event.pointerId!==this.drag?.id) return;
    const dx=event.clientX-this.drag.x,dy=event.clientY-this.drag.y;
    this.drag.x=event.clientX; this.drag.y=event.clientY;
    const distance=Math.hypot(dx,dy);
    if(distance>0) {
      this.rotationAxis.set(dy,dx,0).normalize();
      this.dragRotation.setFromAxisAngle(this.rotationAxis,distance*Math.PI/Math.min(this.width,this.height));
      this.viewOrientation.premultiply(this.dragRotation).normalize();
      this.config.scene.orientation=this.viewOrientation.toArray();
      this.invalidate();
    }
  }
  endDrag() {
    if(!this.drag) return;
    const id=this.drag.id; this.drag=null; this.pointer=null; this.pendingImpulse.length=0;
    this.stage.style.cursor='';
    this.releasePointer(id);
  }
  cancelInteraction() {
    const touchId=this.touch?.id; this.touch=null; if(touchId!==undefined) this.releasePointer(touchId);
    this.endDrag(); this.pointer=null; this.pendingImpulse.length=0;
  }
  onTouchMove(event) {
    if(this.drag) {this.rotateDrag(event);event.preventDefault();return;}
    if(event.pointerId!==this.touch?.id) return;
    const next=this.relativePointer(event),start=this.touch.start;
    const dx=next.x-start.x,dy=next.y-start.y,distance=Math.hypot(dx,dy);
    if(this.touch.mode==='core') {
      if(distance>=TOUCH_ROTATE_THRESHOLD) {
        this.beginDrag(event,event.clientX-dx,event.clientY-dy);
        this.touch=null; this.rotateDrag(event);
      }
      return;
    }
    if(this.touch.mode==='pending' && distance>=TOUCH_ROTATE_THRESHOLD) {
      if(Math.abs(dy)>Math.abs(dx)*1.2) {this.touch.mode='scroll';this.pointer=null;return;}
      this.touch.mode='impulse';
    }
    if(this.touch.mode==='impulse') {
      const segmentLength=Math.hypot(next.x-this.touch.last.x,next.y-this.touch.last.y);
      if(segmentLength>0.5) this.queueImpulse(this.touch.last,next,segmentLength);
      event.preventDefault();
    }
    this.touch.last=next;
  }
  onPointerEnd(event,cancelled) {
    if(event.pointerId===this.drag?.id) {this.touch=null;this.endDrag();return;}
    if(event.pointerId!==this.touch?.id) return;
    const touch=this.touch,point=this.relativePointer(event);
    this.touch=null;
    this.releasePointer(event.pointerId);
    const distance=Math.hypot(point.x-touch.start.x,point.y-touch.start.y);
    const duration=point.t-touch.start.t;
    if(!cancelled && (touch.mode==='core' || touch.mode==='pending') && distance<=TOUCH_TAP_DISTANCE
      && duration<=TOUCH_TAP_DURATION && this.isInsideField(point.x,point.y)) this.queueTap(point);
  }
  onPointerMove(event) {
    if(event.pointerType==='touch') {this.onTouchMove(event);return;}
    if(this.drag) {
      this.rotateDrag(event);
      return;
    }
    const next=this.relativePointer(event);
    this.stage.style.cursor=this.isOverCore(next.x,next.y) ? 'grab' : '';
    if(this.paused || !this.config.interaction.enabled) return;
    if(this.pointer) {
      const length=Math.hypot(next.x-this.pointer.x,next.y-this.pointer.y);
      if(length>0.5) this.queueImpulse(this.pointer,next,length);
    }
    this.pointer=next;
  }
  updateElements(dt) {
    const interaction=this.config.interaction;
    let depositedEnergy=0, movingCount=0;
    this.root.updateMatrixWorld(true);
    for(const layer of this.layers) {
      const cfg=this.config[layer.name];
      const positions=layer.points.geometry.attributes.position.array;
      const intensities=layer.points.geometry.attributes.intensity.array;
      const trailPositions=layer.trails.geometry.attributes.position.array;
      layer.points.material.uniforms.uViewportHeight.value=this.height*this.renderer.getPixelRatio();
      layer.elements.forEach((element,i)=>{
        element.boost=Math.min(interaction.maxBoost,element.boost*Math.exp(-dt/interaction.decay));
        if(layer.name==='inner' && element.rate>0) movingCount++;
        for(const impulse of interaction.enabled ? this.pendingImpulse : []) {
          const distance=segmentDistance(element.screen.x,element.screen.y,impulse.a.x,impulse.a.y,impulse.b.x,impulse.b.y);
          const proximity=Math.max(0,1-distance/interaction.radius);
          // Distance-based accumulation makes the impulse insensitive to mouse event frequency.
          const before=element.boost;
          element.boost=Math.min(interaction.maxBoost,element.boost+
            proximity*proximity*impulse.length/interaction.radius*(impulse.speed/550)*interaction.strength);
          if(layer.name==='inner' && element.rate>0) depositedEnergy+=element.boost-before;
        }
        element.phase=(element.phase+element.rate*(1+element.boost)*dt)%TAU;
        // Multipliers describe the peak effect at maxBoost; zero impulse is always neutral.
        const impulseLevel=element.rate>0 ? clamp(element.boost/interaction.maxBoost,0,1) : 0;
        element.trailDegrees=cfg.trailDegrees*(1+(cfg.trailImpulseMultiplier-1)*impulseLevel);
        intensities[i]=1+(cfg.elementImpulseMultiplier-1)*impulseLevel;
        positionOnOrbit(element.orbit,element.phase,this.temp).toArray(positions,i*3);
        this.projected.copy(this.temp).applyMatrix4(this.root.matrixWorld).project(this.camera);
        element.screen.x=(this.projected.x*0.5+0.5)*this.width;
        element.screen.y=(-this.projected.y*0.5+0.5)*this.height;
        for(let j=0;j<=layer.trailSegments;j++) for(let side=0;side<2;side++) {
          const v=i*(layer.trailSegments+1)*2+j*2+side;
          const phase=element.phase-j/layer.trailSegments*element.trailDegrees*DEG;
          positionOnOrbit(element.orbit,phase,this.temp,(side ? 1 : -1)*cfg.lineWidth*cfg.trailWidth).toArray(trailPositions,v*3);
        }
      });
      layer.points.geometry.attributes.position.needsUpdate=true;
      layer.points.geometry.attributes.intensity.needsUpdate=true;
      layer.trails.geometry.attributes.position.needsUpdate=true;
    }
    this.pendingImpulse.length=0;
    return depositedEnergy/Math.max(1,Math.sqrt(movingCount));
  }
  updateCameraShake() {
    const cfg=this.config.cameraShake;
    let requestedX=0,requestedY=0;
    if(cfg.enabled) {
      const timeA=this.time*cfg.idleFrequencyA,timeB=this.time*cfg.idleFrequencyB+cfg.idlePhaseB;
      requestedX=smoothNoise1D(timeA,this.config.seed^0x18c31)*cfg.idleAmplitudeA
        +smoothNoise1D(timeB,this.config.seed^0x51ed270b)*cfg.idleAmplitudeB;
      requestedY=smoothNoise1D(timeA+37.2,this.config.seed^0x72ad9)*cfg.idleAmplitudeA
        +smoothNoise1D(timeB+83.7,this.config.seed^0x2be91)*cfg.idleAmplitudeB;
      this.shakeBursts=this.shakeBursts.filter(event=>
        Math.exp(-(this.time-event.born)/cfg.burstDecay)>0.001);
      this.shakeBurstLevel=0;
      for(const event of this.shakeBursts) {
        const age=Math.max(0,this.time-event.born);
        const envelope=(1-Math.exp(-age/0.012))*Math.exp(-age/cfg.burstDecay);
        this.shakeBurstLevel=Math.max(this.shakeBurstLevel,envelope);
        const angleA=age*cfg.burstFrequencyA*TAU,angleB=age*cfg.burstFrequencyB*TAU;
        const phaseB=cfg.burstPhaseB*DEG;
        requestedX+=envelope*(cfg.burstAmplitudeA*Math.sin(angleA+event.phaseX)
          +cfg.burstAmplitudeB*Math.sin(angleB+event.phaseY+phaseB));
        requestedY+=envelope*(cfg.burstAmplitudeA*Math.sin(angleA+event.phaseY)
          +cfg.burstAmplitudeB*Math.sin(angleB+event.phaseX-phaseB));
      }
      const limit=cfg.idleAmplitudeA+cfg.idleAmplitudeB+(cfg.burstAmplitudeA+cfg.burstAmplitudeB)*1.35;
      requestedX=clamp(requestedX,-limit,limit); requestedY=clamp(requestedY,-limit,limit);
    } else {
      this.shakeBursts=[]; this.shakeBurstLevel=0;
    }
    this.camera.clearViewOffset();
    if(requestedX || requestedY)
      this.camera.setViewOffset(this.width,this.height,-requestedX,-requestedY,this.width,this.height);
    this.camera.updateMatrixWorld();
    this.projected.copy(this.root.position).project(this.camera);
    this.visualCenterX=(this.projected.x*0.5+0.5)*this.width;
    this.visualCenterY=(-this.projected.y*0.5+0.5)*this.height;
    this.shake.set(this.visualCenterX-this.centerX,this.visualCenterY-this.centerY);
    this.backgroundMaterial.uniforms.uCameraOffset.value.copy(this.shake);
    this.coreHit.style.transform=`translate3d(${this.visualCenterX-CORE_TOUCH_SIZE/2}px,${this.visualCenterY-CORE_TOUCH_SIZE/2}px,0)`;
  }
  updateCore() {
    this.core.material.uniforms.uViewportHeight.value=this.height*this.renderer.getPixelRatio();
    this.core.material.uniforms.uGlow.value=this.config.core.glow;
    this.core.geometry.attributes.size.array[0]=this.config.core.size;
    this.core.geometry.attributes.size.needsUpdate=true;
    const cfg=this.config.burst;
    const outerRadius=(this.config.outer.radius+this.config.outer.radiusSpread)*this.config.scene.scale;
    const startRadius=cfg.startRadius*outerRadius, targetRadius=cfg.radius*outerRadius;
    // Drop only tails already far below a visible display value.
    this.bursts=this.bursts.filter(born=>cfg.intensity*Math.exp(-(this.time-born)/cfg.decaySeconds)>1e-7);
    this.burstFrames=this.bursts.map(born=>{
      const age=this.time-born;
      const envelope=(1-Math.exp(-age/0.02))*Math.exp(-age/cfg.decaySeconds);
      return {age,radius:startRadius+(targetRadius-startRadius)*(1-Math.exp(-3*age/cfg.expansionSeconds)),
        intensity:cfg.intensity*envelope};
    });
    this.flash=this.burstFrames.reduce((peak,burst)=>Math.max(peak,burst.intensity),0);
    this.burstLayer.visible=this.burstFrames.length>0;
    const u=this.burstMaterial.uniforms;
    this.projected.copy(this.root.position).project(this.camera);
    u.uCenter.value.set(this.projected.x*0.5+0.5,this.projected.y*0.5+0.5);
    const viewHeight=2*this.camera.position.z*Math.tan(this.camera.fov*DEG/2);
    u.uViewSize.value.set(viewHeight*this.camera.aspect,viewHeight);
    u.uStartRadius.value=startRadius; u.uFalloff.value=cfg.falloff; u.uBurstCount.value=this.burstFrames.length;
    this.burstFrames.forEach((burst,i)=>u.uBursts.value[i].set(burst.radius,burst.intensity));
  }
  updateCards(dt,depositedEnergy) {
    const cfg=this.config.cards;
    this.cards=this.cards.filter(item=>{
      if(this.time-item.born<item.lifetime && cfg.enabled) return true;
      item.card.remove(); return false;
    });
    this.cardEnergy=Math.min(cfg.triggerEnergy*2,this.cardEnergy*Math.exp(-dt/cfg.energyDecay)+depositedEnergy);
    // Require fresh energy from pointer movement: stored energy never fires on its own.
    if(dt>0 && depositedEnergy>0 && cfg.enabled && this.config.interaction.enabled
      && this.cardEnergy>=cfg.triggerEnergy && this.time-this.lastEmission>=cfg.cooldown && this.cards.length<cfg.count) this.emitCard();
    this.cards.forEach(item=>{
      const {card}=item;
      const age=(this.time-item.born)/item.lifetime;
      card.hidden=age<0;
      if(card.hidden) return;
      const distanceProgress=1-Math.pow(1-clamp(age/0.6,0,1),3);
      const fade=smooth(0,0.055,age)*(1-smooth(0.82,1,age));
      const direction=item.direction*DEG;
      const radius=(0.035+distanceProgress*cfg.travelRadius)*this.config.scene.scale;
      this.projected.set(Math.cos(direction)*radius,Math.sin(direction)*radius*0.87,0.6).add(this.root.position)
        .project(this.camera);
      card.style.fontSize=`${cfg.fontSize}px`;
      const responsiveScale=this.width<600 ? 0.8 : 1;
      const scale=Math.min((cfg.birthScale+(1-cfg.birthScale)*distanceProgress)*responsiveScale,
        (this.width-24)/Math.max(1,card.offsetWidth));
      // Keep the label inside the stage even on a narrow phone.
      const pad=12, halfW=card.offsetWidth*scale/2,halfH=card.offsetHeight*scale/2;
      const x=clamp((this.projected.x*.5+.5)*this.width,pad+halfW,this.width-pad-halfW);
      const y=clamp((-.5*this.projected.y+.5)*this.height,pad+halfH,this.height-pad-halfH);
      card.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) scale(${scale})`;
      card.style.opacity=(fade*cfg.opacity).toFixed(3);
    });
  }
  render(dt) {
    const cfg=this.config;
    this.time+=dt;
    if(cfg.color.cycle) this.colorPhase=(this.colorPhase+dt/cfg.color.cycleSeconds)%1;
    if(!this.drag) this.precessionPhase=(this.precessionPhase+dt*cfg.scene.precession*DEG)%TAU;
    const mix=cfg.color.cycle ? (1-Math.cos(this.colorPhase*TAU+Math.acos(1-2*cfg.color.mix)))/2 : cfg.color.mix;
    this.warm.set(cfg.color.warm); this.cool.set(cfg.color.cool); this.tint.copy(this.warm).lerp(this.cool,mix);
    const palette=cfg.nebulaColor.linked ? cfg.color : cfg.nebulaColor;
    this.warm.set(palette.warm); this.cool.set(palette.cool); this.nebulaTint.copy(this.warm).lerp(this.cool,mix);
    const luminance=this.nebulaTint.r*0.2126+this.nebulaTint.g*0.7152+this.nebulaTint.b*0.0722;
    for(const channel of ['r','g','b']) this.nebulaTint[channel]=Math.max(0,luminance+(this.nebulaTint[channel]-luminance)*cfg.nebulaColor.saturation);
    this.stage.style.setProperty('--atom-tint',`#${this.tint.getHexString()}`);
    this.precessionRotation.setFromAxisAngle(this.upAxis,this.precessionPhase);
    this.root.quaternion.copy(this.viewOrientation).multiply(this.precessionRotation);
    this.root.scale.setScalar(cfg.scene.scale);
    this.updateCameraShake();
    const bg=this.backgroundMaterial.uniforms,b=cfg.background;
    bg.uTime.value=this.time; bg.uIntensity.value=b.nebulaIntensity; bg.uScale.value=b.nebulaScale;
    bg.uSpeed.value=b.nebulaSpeed; bg.uSpacing.value=b.gridSpacing; bg.uGridOpacity.value=b.gridOpacity;
    bg.uDotSize.value=b.dotSize; bg.uLight.value.set(b.lightX,b.lightY);
    const quality=this.effectiveQuality();
    bg.uNoiseType.value=NOISE_TYPES.findIndex(([id])=>id===b.noiseType);
    bg.uCloudOctaves.value=quality.cloudOctaves; bg.uWarpOctaves.value=quality.warpOctaves; bg.uWarp.value=b.warp;
    const energy=this.updateElements(dt); this.updateCards(dt,energy); this.updateCore();
    this.renderer.render(this.scene,this.camera); this.frames++;
  }
  get running() { return !this.disposed && !this.paused && this.visible && !document.hidden && !this.lost; }
  tick=(timestamp)=>{
    this.raf=0;
    if(!this.running) return;
    if(!this.nextFrameTime) this.nextFrameTime=timestamp;
    if(timestamp+0.5<this.nextFrameTime) {this.raf=requestAnimationFrame(this.tick);return;}
    do this.nextFrameTime+=FRAME_INTERVAL; while(this.nextFrameTime<=timestamp);
    const dt=this.lastTime ? Math.min(0.05,(timestamp-this.lastTime)/1000) : 0;
    this.lastTime=timestamp; this.render(dt); this.measurePerformance(timestamp); this.raf=requestAnimationFrame(this.tick);
  };
  syncLoop() {
    this.cancelInteraction();
    if(this.raf) cancelAnimationFrame(this.raf);
    this.raf=0; this.lastTime=0; this.nextFrameTime=0;
    this.resetPerformanceWindow(performance.now());
    if(this.running) this.raf=requestAnimationFrame(this.tick);
  }
  invalidate() { if(!this.lost && !this.disposed) this.render(0); }
  setPaused(paused) {
    this.paused=paused; this.syncLoop(); this.onState(paused ? 'paused' : 'running');
  }
  snapshot() {
    const quality=this.effectiveQuality(),profile=this.qualityProfile;
    return {time:this.time,paused:this.paused,running:this.running,frames:this.frames,
      tint:this.tint.getHexString(),nebulaTint:this.nebulaTint.getHexString(),drawCalls:this.renderer.info.render.calls,
      orientation:this.viewOrientation.toArray(),rotating:!!this.drag,center:{x:this.centerX,y:this.centerY},
      shake:{x:this.shake.x,y:this.shake.y,burst:this.shakeBurstLevel,events:this.shakeBursts.length},
      performance:{fps:this.performanceFps,quality:profile.name,pixelRatio:this.renderer.getPixelRatio(),
        cloudOctaves:quality.cloudOctaves,warpOctaves:quality.warpOctaves,
        orbitSegments:profile.orbitSegments,tubeSegments:profile.tubeSegments,minTrailSegments:profile.minTrailSegments},
      noiseType:this.config.background.noiseType,energy:this.cardEnergy,flash:this.flash,emissions:this.emissions,
      bursts:this.burstFrames.map(burst=>({...burst})),
      cards:this.cards.map(({phrase,born,direction})=>({phrase,born,direction})),
      layers:this.layers.map(l=>({name:l.name,orbits:l.orbits.length,elements:l.elements.length,
        orbitRadii:l.orbits.map(o=>o.radius),
        companionRadii:l.companion ? l.orbits.map(o=>companionRadius(o.radius,this.config.innerCompanion.radiusOffset)) : [],
        trailDegrees:l.elements.map(e=>e.trailDegrees),intensities:Array.from(l.points.geometry.attributes.intensity.array),
        phases:l.elements.map(e=>e.phase),boosts:l.elements.map(e=>e.boost),positions:l.elements.map(e=>({...e.screen}))}))};
  }
  dispose() {
    this.disposed=true; this.syncLoop(); this.abort.abort();
    this.resizeObserver.disconnect(); this.intersectionObserver.disconnect();
    this.scene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});
    this.renderer.dispose(); this.cardRoot.replaceChildren(); this.coreHit.remove();
  }
}
