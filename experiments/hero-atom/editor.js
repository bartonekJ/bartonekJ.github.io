import { cloneConfig, CONTROL_GROUPS, validateConfig, importConfig } from './config.js';

let config=cloneConfig();
let atom=null;
const stage=document.querySelector('#atom-stage');
const status=document.querySelector('#lab-status');
const configStatus=document.querySelector('#config-status');
const pause=document.querySelector('#pause');
const tune=document.querySelector('#tune');
const panel=document.querySelector('#controls');
const fields=new Map();
let changeFrame=0;
let pendingPath='';

function reportState(state) {
  const paused=atom?.paused ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
  pause.textContent=paused ? 'Spustit pohyb' : 'Pozastavit';
  pause.setAttribute('aria-pressed',String(paused));
  if(state==='lost') { status.textContent='Grafika byla pozastavena prohlížečem. Čekám na obnovení.'; return; }
  const performanceState=atom?.snapshot().performance;
  const qualityLabel={full:'FULL',balanced:'BALANCED',reduced:'REDUCED'}[performanceState?.quality] || 'FULL';
  const fps=performanceState?.fps>0 ? `${Math.round(performanceState.fps)} FPS` : 'měřím FPS';
  status.textContent=paused ? 'Pohyb pozastavený · nastavení zůstává aktivní'
    : `Kurzor + dotyk · ${fps} · ${qualityLabel}`;
}
function update(path) {
  // Preserve a required geometry rebuild if several controls change in one frame.
  if(!pendingPath || /^(inner|outer|seed)/.test(path)) pendingPath=path;
  if(changeFrame) return;
  changeFrame=requestAnimationFrame(()=>{
    changeFrame=0; atom?.update(config,pendingPath); pendingPath='';
  });
}
for(const [group,title,definitions] of CONTROL_GROUPS) {
  const details=document.createElement('details');
  const summary=document.createElement('summary'); summary.textContent=title; details.append(summary);
  if(group==='inner') details.open=true;
  for(const [key,labelText,min,max,step,unit=''] of definitions) {
    const path=`${group}.${key}`;
    const row=document.createElement('div'); row.className='control';
    const label=document.createElement('label'); label.textContent=labelText; label.htmlFor=path;
    const isSelect=min==='select';
    const input=document.createElement(isSelect ? 'select' : 'input'); input.id=path;
    if(!isSelect) input.type=typeof min==='string' ? min : 'range';
    if(isSelect) for(const [value,text] of max) {
      const option=document.createElement('option'); option.value=value; option.textContent=text; input.append(option);
    }
    row.append(label);
    let output;
    if(input.type==='range') {
      input.min=min; input.max=max; input.step=step;
      output=document.createElement('output'); output.htmlFor=path; row.append(output);
    }
    const help=isSelect ? document.createElement('p') : null;
    if(help) help.className='control-help';
    const refresh=()=>{
      if(input.type==='checkbox') input.checked=config[group][key];
      else input.value=config[group][key];
      if(group==='nebulaColor' && (key==='warm' || key==='cool')) input.disabled=config.nebulaColor.linked;
      if(group==='innerCompanion' && key!=='enabled') input.disabled=!config.innerCompanion.enabled || (key==='repeats' && config.innerCompanion.style==='solid');
      if(output) output.textContent=`${config[group][key]} ${unit}`.trim();
      if(help) help.textContent=max.find(([id])=>id===config[group][key])?.[2] || '';
    };
    input.addEventListener('input',()=>{
      config[group][key]=input.type==='checkbox' ? input.checked : isSelect || input.type==='color' ? input.value : Number(input.value);
      refresh(); if(['nebulaColor.linked','innerCompanion.enabled','innerCompanion.style'].includes(path)) refreshFields(); update(path);
    });
    refresh(); row.append(input); if(help) row.append(help);
    if(key==='elementImpulseMultiplier') {
      const impulseHelp=document.createElement('p'); impulseHelp.className='control-help';
      impulseHelp.textContent='Oba násobiče: 1 = beze změny, 1,1 = +10 % při maximálním impulzu. Slabší impulz má menší efekt; při uklidnění se vrací základní délka i jas.';
      row.append(impulseHelp);
    }
    details.append(row); fields.set(path,refresh);
  }
  if(group==='innerCompanion') {
    const help=document.createElement('p'); help.className='control-help';
    help.textContent='Jedna soustředná dráha ke každé vnitřní orbitě. Odstup je v % jejího poloměru: mínus dovnitř, plus ven. Barvu a náklon přebírá od rodiče; vlastní elementy ani stopy nemá.';
    details.append(help);
  }
  if(group==='burst') {
    const preview=document.createElement('button'); preview.type='button'; preview.id='preview-burst';
    preview.textContent='Vyzkoušet výbuch'; preview.addEventListener('click',()=>atom?.previewBurst());
    const help=document.createElement('p'); help.className='control-help';
    help.textContent='Radius je násobek vnějšího obalu. Náhled spustí jeden výbuch a pohyb scény, bez karty.';
    details.append(preview,help);
  }
  if(group==='cameraShake') {
    const help=document.createElement('p'); help.className='control-help';
    help.textContent='Klid skládá dvě vrstvy hladkého noise; jeho posun B není periodický úhel. Výbuch skládá dvě skutečné sinusové vrstvy, proto je jeho fáze B ve stupních. Obě výbuchové vrstvy sdílejí exponenciální doznění.';
    details.append(help);
  }
  if(group==='nebulaColor' || group==='inner' || group==='outer' || group==='cards') {
    const help=document.createElement('p'); help.className='control-help';
    help.textContent=group==='nebulaColor'
      ? 'Vlastní paleta mlhoviny a gridu. Čas a poměr barev sdílí s cyklem soustavy; sytost zůstává nezávislá i při sdílení palety.'
      : group==='cards' ? 'Jádro nabíjí pouze vnitřní obal. Vnější elementy lze rozhýbat bez výboje.'
      : 'Pro výraznější barvu sniž bílý střed, bílé příměsi a podíl bílých elementů. Sytost 1 zachová původní barvy; vyšší hodnoty je zvýrazní.';
    details.append(help);
  }
  document.querySelector('#control-groups').append(details);
}
function refreshFields() {
  fields.forEach(refresh=>refresh()); document.querySelector('#seed').value=config.seed;
}
function togglePanel(open) {
  panel.hidden=!open; tune.setAttribute('aria-expanded',String(open));
  if(open) document.querySelector('#close-controls').focus(); else tune.focus();
}
tune.addEventListener('click',()=>togglePanel(panel.hidden));
document.querySelector('#close-controls').addEventListener('click',()=>togglePanel(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape' && !panel.hidden) togglePanel(false);});
pause.addEventListener('click',()=>atom?.setPaused(!atom.paused));
document.querySelector('#seed').addEventListener('change',event=>{
  const seed=Number(event.target.value);
  if(!Number.isSafeInteger(seed) || seed<0 || seed>4294967295) {
    event.target.value=config.seed; configStatus.textContent='Seed musí být celé číslo od 0 do 4294967295.'; return;
  }
  config.seed=seed; update('seed');
});
document.querySelector('#new-seed').addEventListener('click',()=>{
  config.seed=crypto.getRandomValues(new Uint32Array(1))[0]; refreshFields(); update('seed');
});
document.querySelector('#reset').addEventListener('click',()=>{
  config=cloneConfig(); refreshFields(); atom?.update(config,'seed');
  configStatus.textContent='Obnoveno výchozí nastavení. Čas animace pokračuje.';
});
document.querySelector('#export').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({version:9,config},null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url; link.download=`bybartonek-hero-atom-${config.seed}.json`; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  configStatus.textContent='Nastavení exportováno. Obsahuje i texty a směry karet.';
});
const fileInput=document.querySelector('#import-file');
document.querySelector('#import').addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',async()=>{
  try {
    const file=fileInput.files[0]; if(!file) return;
    if(file.size>100000) throw new Error('Soubor je příliš velký.');
    const data=JSON.parse(await file.text());
    config=importConfig(data); refreshFields(); atom?.update(config,'seed');
    configStatus.textContent='Nastavení načteno.';
  } catch(error) { configStatus.textContent=`Import se nepodařil: ${error.message}`; }
  finally { fileInput.value=''; }
});

try {
  const { AtomScene }=await import('./atom.js');
  const qualityParam=new URLSearchParams(location.search).get('quality');
  const qualityTier=['full','balanced','reduced'].includes(qualityParam) ? qualityParam : undefined;
  atom=new AtomScene(stage,config,reportState,qualityTier ? {qualityTier,adaptiveQuality:false} : {});
  reportState(atom.paused ? 'paused' : 'running');
  // Prototype-only inspection for visual and interaction regression checks.
  window.heroAtom={
    snapshot:()=>atom.snapshot(),
    getConfig:()=>structuredClone(config),
    setConfig:input=>{config=validateConfig(input);refreshFields();atom.update(config,'seed');},
    pause:value=>atom.setPaused(value),
    previewBurst:()=>atom.previewBurst(),
    setQualityTier:tier=>atom.setQualityTier(tier),
  };
  window.addEventListener('pagehide',event=>{if(!event.persisted) atom.dispose();});
} catch(error) {
  console.error('Hero atom could not start:',error);
  stage.querySelector('canvas').hidden=true;
  document.querySelector('#atom-fallback').hidden=false;
  status.textContent='3D náhled není dostupný. Zkus prohlížeč s podporou WebGL 2.';
  pause.disabled=true; tune.disabled=true;
}
