const stage=document.querySelector('#hero-atom');
const DESKTOP_ATOM_REFERENCE_WIDTH=684;

if(stage) {
  const canvas=stage.querySelector('#atom-canvas');
  const fallback=stage.querySelector('#atom-fallback');
  try {
    const [{AtomScene},{importConfig},response]=await Promise.all([
      import('./experiments/hero-atom/atom.js'),
      import('./experiments/hero-atom/config.js'),
      fetch('./experiments/bybartonek-hero-atom-2645671074.json'),
    ]);
    if(!response.ok) throw new Error(`Hero configuration returned ${response.status}.`);
    const config=importConfig(await response.json());
    const hero=stage.closest('.hero'),copy=hero.querySelector('.hero-copy');
    const heroColor=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1d1d1c';
    const layout=({width,height})=>{
      if(matchMedia('(max-width: 760px)').matches)
        return {focusWidth:width,focusHeight:380,centerX:width/2,centerY:height-190};
      const copyWidth=copy.getBoundingClientRect().width;
      const columnWidth=Math.max(1,width-copyWidth);
      // Keep the atom at its 1440px desktop size when the right column narrows.
      // Its center remains in that column, so the full-size scene can pass under the copy.
      const focusWidth=Math.max(DESKTOP_ATOM_REFERENCE_WIDTH,columnWidth);
      return {focusWidth,focusHeight:height,centerX:copyWidth+columnWidth/2,centerY:height/2};
    };
    const atom=new AtomScene(stage,config,state=>stage.dataset.state=state,{
      backgroundColor:'#0b1011',edgeBackgroundColor:heroColor,backgroundFade:[0.08,0.68],layout,
    });
    stage.classList.add('hero-atom-ready');
    // Kept intentionally small: useful for production smoke checks, not an editor API.
    window.heroAtom={snapshot:()=>atom.snapshot(),pause:value=>atom.setPaused(value)};
    window.addEventListener('pagehide',event=>{if(!event.persisted) atom.dispose();},{once:true});
  } catch(error) {
    console.error('Homepage hero atom could not start:',error);
    canvas.hidden=true; fallback.hidden=false; stage.classList.add('hero-atom-fallback-visible');
  }
}
