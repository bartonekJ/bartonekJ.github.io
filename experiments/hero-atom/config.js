// All angles are degrees; speeds are degrees/second; durations are seconds.
// World units: the initial inner orbit radius is 1.52. Spread is ± the value.
// Orbit randomness is sampled on rebuild; card randomness on emission, never every frame.
// Zero spread disables the corresponding random variation.
function orientationFromDegrees(x, y, z) {
  const [a,b,c]=[x,y,z].map(angle=>angle*Math.PI/360);
  const [s1,s2,s3]=[a,b,c].map(Math.sin), [c1,c2,c3]=[a,b,c].map(Math.cos);
  return [s1*c2*c3+c1*s2*s3, c1*s2*c3-s1*c2*s3, c1*c2*s3+s1*s2*c3, c1*c2*c3-s1*s2*s3];
}
export const DEFAULT_CONFIG = {
  seed: 2718,
  scene: { scale: 1, orientation: orientationFromDegrees(9,-14,-9), precession: 0.45, pixelRatio: 1.5 },
  core: { size: 0.048, glow: 0.65 },
  burst: {
    intensity: 8, startRadius: 0.04, radius: 2,
    expansionSeconds: 1.2, decaySeconds: 0.55, falloff: 5,
  },
  inner: {
    orbitCount: 7, elementCount: 11, radius: 1.52, radiusSpread: 0.16,
    angle: 58, angleSpread: 37, azimuth: 0, azimuthSpread: 15, orbitOpacity: 0.43, lineWidth: 0.009,
    elementSize: 0.072, sizeSpread: 0.4, speed: 4.5, speedSpread: 0.45,
    glow: 0.85, trailDegrees: 24, trailOpacity: 1.6, trailWidth: 1.25, whiteFraction: 0.35,
    trailImpulseMultiplier: 2, elementImpulseMultiplier: 1.15,
    saturation: 1, coreWhiteness: 1, lineWhiteness: 0.42, trailWhiteness: 0.12,
  },
  outer: {
    orbitCount: 15, elementCount: 34, radius: 2.05, radiusSpread: 0.18,
    angle: 64, angleSpread: 58, azimuth: 0, azimuthSpread: 15, orbitOpacity: 0.105, lineWidth: 0.005,
    elementSize: 0.024, sizeSpread: 0.55, speed: 1.9, speedSpread: 0.6,
    glow: 0.36, trailDegrees: 12, trailOpacity: 0.14, trailWidth: 1.25, whiteFraction: 0.5,
    trailImpulseMultiplier: 2, elementImpulseMultiplier: 1.15,
    saturation: 1, coreWhiteness: 1, lineWhiteness: 0.22, trailWhiteness: 0.12,
  },
  innerCompanion: { enabled: true, radiusOffset: 5, style: 'dash-dot', repeats: 24, intensity: 0.24, lineWidth: 0.004 },
  background: {
    noiseType: 'value', octaves: 5, warp: 2.6,
    gridSpacing: 24, gridOpacity: 0.14, dotSize: 0.6,
    nebulaIntensity: 0.32, nebulaScale: 3.4, nebulaSpeed: 0.018,
    lightX: 1.06, lightY: 0.72,
  },
  color: { warm: '#ff9309', cool: '#63bddf', cycle: true, cycleSeconds: 120, mix: 0 },
  nebulaColor: { linked: false, warm: '#ff9309', cool: '#63bddf', saturation: 1 },
  interaction: { enabled: true, radius: 160, strength: 1.4, decay: 1.7, maxBoost: 5 },
  cards: {
    enabled: true, count: 3, cycleSeconds: 12, travelRadius: 2.05,
    birthScale: 0.58, fontSize: 11, opacity: 0.96,
    triggerEnergy: 1.1, energyDecay: 1.3, cooldown: 2.5,
    directionSpread: 9,
    // A random complete phrase is picked per interaction-triggered emission.
    messages: [
      { from: 'PROBLEM', to: 'TOOL', direction: 145 },
      { from: 'IDEA', to: 'TOOL', direction: 24 },
      { from: 'PRACTICE', to: 'TOOL', direction: -58 },
      { from: 'IDEA', to: 'PROTOTYPE', direction: 24 },
      { from: 'NEED', to: 'SOLUTION', direction: 145 },
      { from: 'EXPERIENCE', to: 'TOOL', direction: -58 },
    ],
  },
};

export const cloneConfig = () => structuredClone(DEFAULT_CONFIG);

export const NOISE_TYPES = [
  ['value', 'Value fBm · původní', 'Původní vrstvený value noise s deformací souřadnic.'],
  ['perlin', 'Perlin · hladký', 'Gradientní šum s jemnými souvislými přechody.'],
  ['ridged', 'Ridged · vlákna', 'Hřebeny gradientního šumu zvýrazní tenké prameny.'],
  ['billow', 'Billow · oblaka', 'Absolutní hodnota gradientního šumu vytváří oblé shluky.'],
  ['worley', 'Worley · buňky', 'Vzdálenosti k náhodným bodům vytvářejí buněčnou strukturu.'],
];

export const ORBIT_STYLES = [
  ['solid', 'Plná čára', 'Souvislá kružnice bez přerušení.'],
  ['dashed', 'Čárkovaná', 'Pravidelně se střídají čárky a mezery.'],
  ['dotted', 'Tečkovaná', 'Krátké světelné značky oddělené mezerami.'],
  ['dash-dot', 'Čerchovaná', 'Dlouhá čárka, mezera, tečka a mezera.'],
  ['dash-dot-dot', 'Dvojitě čerchovaná', 'Dlouhá čárka následovaná dvěma tečkami.'],
];

// Shared by the editor and import validation. UI values use the same units as above.
const layerFields = [
  ['orbitCount', 'Počet drah', 0, 32, 1],
  ['elementCount', 'Počet elementů', 0, 80, 1],
  ['radius', 'Poloměr', 0.5, 2.6, 0.01],
  ['radiusSpread', 'Odchylka poloměru ±', 0, 0.5, 0.01],
  ['angle', 'Náklon dráhy', 0, 180, 1, '°'],
  ['angleSpread', 'Odchylka náklonu ±', 0, 90, 1, '°'],
  ['azimuth', 'Natočení vějíře drah', 0, 180, 1, '°'],
  ['azimuthSpread', 'Odchylka natočení ±', 0, 90, 1, '°'],
  ['orbitOpacity', 'Jas drah', 0, 1, 0.01],
  ['lineWidth', 'Tloušťka drah', 0.003, 0.025, 0.001],
  ['elementSize', 'Velikost elementu', 0.01, 0.16, 0.001],
  ['sizeSpread', 'Odchylka velikosti ±', 0, 0.8, 0.01, '×'],
  ['speed', 'Úhlová rychlost', 0, 18, 0.1, '°/s'],
  ['speedSpread', 'Odchylka rychlosti ±', 0, 0.8, 0.01, '×'],
  ['glow', 'Záře elementů', 0, 1.5, 0.01],
  ['trailDegrees', 'Délka stopy', 0, 70, 1, '°'],
  ['trailOpacity', 'Intenzita stopy', 0, 12, 0.05, '×'],
  ['trailWidth', 'Šířka stopy', 0.5, 8, 0.05, '×'],
  ['trailImpulseMultiplier', 'Prodloužení stopy při impulzu', 1, 5, 0.01, '×'],
  ['elementImpulseMultiplier', 'Intenzita elementu při impulzu', 1, 5, 0.01, '×'],
  ['whiteFraction', 'Podíl bílých elementů', 0, 1, 0.01],
  ['saturation', 'Sytost barev obalu', 0, 3, 0.05, '×'],
  ['coreWhiteness', 'Bílý střed barevných elementů', 0, 1, 0.01],
  ['lineWhiteness', 'Bílá příměs drah', 0, 1, 0.01],
  ['trailWhiteness', 'Bílá příměs stop', 0, 1, 0.01],
];
export const CONTROL_GROUPS = [
  ['scene', 'Kompozice', [
    ['scale', 'Měřítko atomu', 0.6, 1.2, 0.01],
    ['precession', 'Otáčení celé soustavy', 0, 2, 0.01, '°/s'],
    ['pixelRatio', 'Limit rozlišení', 0.75, 2, 0.25, '×'],
  ]],
  ['inner', 'Vnitřní · výrazné dráhy', layerFields],
  ['innerCompanion', 'Vnitřní · druhé dráhy', [
    ['enabled', 'Zdvojit vnitřní dráhy', 'checkbox'],
    ['radiusOffset', 'Odstup od rodičovské dráhy', -40, 40, 0.5, '% R'],
    ['style', 'Styl druhé dráhy', 'select', ORBIT_STYLES],
    ['repeats', 'Počet opakování vzoru', 4, 64, 1],
    ['intensity', 'Intenzita druhé dráhy', 0, 1, 0.01],
    ['lineWidth', 'Tloušťka druhé dráhy', 0.001, 0.025, 0.001],
  ]],
  ['outer', 'Vnější · jemný obal', layerFields],
  ['core', 'Jádro', [
    ['size', 'Velikost jádra', 0.02, 0.15, 0.001],
    ['glow', 'Záře jádra', 0, 2, 0.01],
  ]],
  ['burst', 'Výbuch jádra', [
    ['intensity', 'Počáteční intenzita', 0, 40, 0.1],
    ['startRadius', 'Počáteční radius', 0.01, 0.3, 0.01, '× obal'],
    ['radius', 'Cílový radius', 0.5, 4, 0.05, '× obal'],
    ['expansionSeconds', 'Doba rozpínání (95 %)', 0.2, 4, 0.05, 's'],
    ['decaySeconds', 'Čas exponenciálního útlumu', 0.1, 3, 0.05, 's'],
    ['falloff', 'Prostorový falloff', 2, 12, 0.1],
  ]],
  ['background', 'Pozadí', [
    ['noiseType', 'Typ šumu mlhoviny', 'select', NOISE_TYPES],
    ['octaves', 'Počet vrstev šumu', 1, 6, 1],
    ['warp', 'Deformace souřadnic', 0, 5, 0.05],
    ['gridSpacing', 'Rozestup bodového gridu', 12, 60, 1, 'px'],
    ['gridOpacity', 'Jas bodového gridu', 0, 0.6, 0.01],
    ['dotSize', 'Velikost bodu', 0.3, 1.5, 0.05, 'px'],
    ['nebulaIntensity', 'Intenzita mlhoviny', 0, 1.3, 0.01],
    ['nebulaScale', 'Detail mlhoviny', 1, 7, 0.1],
    ['nebulaSpeed', 'Pohyb mlhoviny', 0, 0.07, 0.001],
    ['lightX', 'Světlo · pozice X', 0, 1.4, 0.01],
    ['lightY', 'Světlo · pozice Y', 0, 1, 0.01],
  ]],
  ['color', 'Barvy soustavy a cyklus', [
    ['warm', 'Teplá barva', 'color'], ['cool', 'Studená barva', 'color'],
    ['cycle', 'Plynulý barevný cyklus', 'checkbox'],
    ['cycleSeconds', 'Délka cyklu', 20, 240, 1, 's'],
    ['mix', 'Výchozí tint · teplý → studený', 0, 1, 0.01],
  ]],
  ['nebulaColor', 'Barvy mlhoviny', [
    ['linked', 'Sdílet paletu s drahami', 'checkbox'],
    ['warm', 'Vlastní teplá barva', 'color'], ['cool', 'Vlastní studená barva', 'color'],
    ['saturation', 'Sytost mlhoviny', 0, 3, 0.05, '×'],
  ]],
  ['interaction', 'Reakce na kurzor', [
    ['enabled', 'Předávání energie', 'checkbox'],
    ['radius', 'Dosah kurzoru', 40, 350, 1, 'px'],
    ['strength', 'Síla impulzu', 0, 40, 0.05],
    ['decay', 'Čas útlumu', 0.3, 5, 0.1, 's'],
    ['maxBoost', 'Maximální přídavná rychlost', 1, 100, 0.1, '×'],
  ]],
  ['cards', 'Karty vznikající v jádru', [
    ['enabled', 'Zobrazit karty', 'checkbox'],
    ['count', 'Maximum současných karet', 1, 3, 1],
    ['triggerEnergy', 'Práh energie pro kartu / výbuch', 0.1, 100, 0.1],
    ['energyDecay', 'Doba uchování energie', 0.3, 5, 0.1, 's'],
    ['cooldown', 'Rozestup mezi výboji', 1.5, 10, 0.1, 's'],
    ['directionSpread', 'Odchylka směru odletu ±', 0, 25, 1, '°'],
    ['cycleSeconds', 'Životnost jedné karty', 3, 60, 1, 's'],
    ['travelRadius', 'Vzdálenost odletu', 1, 2.6, 0.01],
    ['birthScale', 'Měřítko při vzniku', 0.3, 0.9, 0.01],
    ['fontSize', 'Velikost textu', 9, 14, 1, 'px'],
    ['opacity', 'Krytí karet', 0.3, 1, 0.01],
  ]],
];

export function validateConfig(input) {
  if (!input || typeof input !== 'object') throw new Error('Chybí konfigurace.');
  const result = cloneConfig();
  if (!Number.isSafeInteger(input.seed) || input.seed < 0 || input.seed > 4294967295)
    throw new Error('Seed musí být celé číslo od 0 do 4294967295.');
  result.seed = input.seed;
  const orientation=input.scene?.orientation;
  if (!Array.isArray(orientation) || orientation.length!==4 || !orientation.every(Number.isFinite)
    || Math.abs(Math.hypot(...orientation)-1)>0.001) throw new Error('Neplatné natočení soustavy.');
  const norm=Math.hypot(...orientation);
  result.scene.orientation=orientation.map(value=>value/norm);
  for (const [group, , fields] of CONTROL_GROUPS) {
    for (const [key, label, min, max, step] of fields) {
      const value = input[group]?.[key];
      if (min === 'checkbox' ? typeof value !== 'boolean'
        : min === 'select' ? !max.some(([id]) => id === value)
        : min === 'color' ? typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)
        : !Number.isFinite(value) || value < min || value > max || (step === 1 && !Number.isInteger(value)))
        throw new Error(`Neplatná hodnota: ${label}.`);
      result[group][key] = value;
    }
  }
  if (!Array.isArray(input.cards?.messages) || input.cards.messages.length < 1 || input.cards.messages.length > 32)
    throw new Error('Konfigurace musí obsahovat 1 až 32 slovních spojení.');
  result.cards.messages = input.cards.messages.map(message => {
    if (!message || typeof message.from !== 'string' || typeof message.to !== 'string' || !message.from.trim() || !message.to.trim()
      || message.from.length > 24 || message.to.length > 24 || !Number.isFinite(message.direction) || Math.abs(message.direction) > 360)
      throw new Error('Neplatný text nebo směr karty.');
    return { from: message.from, to: message.to, direction: message.direction };
  });
  return result;
}

// Migrate legacy flash, fixed Euler tilt and shared palettes without changing their initial look.
export function importConfig(data) {
  if (!data || ![1, 2, 3, 4, 5, 6].includes(data.version)) throw new Error('Nepodporovaná verze konfigurace.');
  if (data.version === 6) return validateConfig(data.config);
  const input = structuredClone(data.config);
  if (!input || typeof input !== 'object') throw new Error('Chybí konfigurace.');
  input.innerCompanion={...DEFAULT_CONFIG.innerCompanion,enabled:false};
  if (data.version === 5) return validateConfig(input);
  for (const group of ['inner','outer']) {
    if (!input[group] || typeof input[group]!=='object') throw new Error(`Chybí skupina ${group}.`);
    // Older presets retain their original fixed trails and particle brightness.
    input[group].trailImpulseMultiplier=1; input[group].elementImpulseMultiplier=1;
  }
  if (data.version === 4) return validateConfig(input);
  const additions = {
    background: ['noiseType', 'octaves', 'warp'], inner: ['trailWidth'], outer: ['trailWidth'],
    cards: ['triggerEnergy', 'energyDecay', 'cooldown', 'directionSpread'],
  };
  for (const [group, keys] of data.version === 1 ? Object.entries(additions) : []) {
    if (!input[group] || typeof input[group] !== 'object') throw new Error(`Chybí skupina ${group}.`);
    for (const key of keys) if (!(key in input[group])) input[group][key] = DEFAULT_CONFIG[group][key];
  }
  if (data.version<3) input.burst = structuredClone(DEFAULT_CONFIG.burst);
  for (const [oldKey, newKey, multiplier, min, max] of [
    ['flashStrength', 'intensity', 2.5, 0, 8], ['flashDuration', 'decaySeconds', 0.8, 0.2, 1.5],
  ]) {
    const oldValue = input.cards?.[oldKey];
    if (data.version<3 && oldValue !== undefined) {
      if (!Number.isFinite(oldValue) || oldValue < min || oldValue > max) throw new Error(`Neplatná hodnota: ${oldKey}.`);
      input.burst[newKey] = oldValue * multiplier;
    }
  }
  for (const group of ['inner','outer']) {
    if (!input[group] || typeof input[group]!=='object') throw new Error(`Chybí skupina ${group}.`);
    for (const key of ['saturation','coreWhiteness','lineWhiteness','trailWhiteness']) input[group][key]=DEFAULT_CONFIG[group][key];
  }
  input.nebulaColor={...DEFAULT_CONFIG.nebulaColor,linked:true,warm:input.color?.warm,cool:input.color?.cool};
  const tilts=['tiltX','tiltY','tiltZ'].map(key=>input.scene?.[key]);
  if (!tilts.every(value=>Number.isFinite(value) && value>=-90 && value<=90)) throw new Error('Neplatný původní náklon soustavy.');
  input.scene.orientation=orientationFromDegrees(...tilts);
  return validateConfig(input);
}
