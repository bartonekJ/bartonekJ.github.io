// No image textures: the nebula, dot grid, particles and light falloff are analytic.
export const backgroundVertex = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }
`;
export const backgroundFragment = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec3 uTint, uBaseColor, uEdgeColor;
uniform vec2 uBackgroundFade, uCameraOffset;
uniform float uTime, uIntensity, uScale, uSpeed, uSpacing, uGridOpacity, uDotSize;
uniform int uNoiseType, uOctaves;
uniform float uWarp;
uniform vec2 uLight;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
// Gradient noise with unit gradients and quintic interpolation (Perlin family).
vec2 gradient(vec2 lattice) {
  float angle=hash(lattice+19.17)*6.28318530718;
  return vec2(cos(angle),sin(angle));
}
float perlin(vec2 p) {
  vec2 cell=floor(p), f=fract(p);
  vec2 w=f*f*f*(f*(f*6.0-15.0)+10.0);
  float low=mix(dot(gradient(cell),f),dot(gradient(cell+vec2(1,0)),f-vec2(1,0)),w.x);
  float high=mix(dot(gradient(cell+vec2(0,1)),f-vec2(0,1)),dot(gradient(cell+vec2(1,1)),f-vec2(1,1)),w.x);
  return mix(low,high,w.y)*1.41421356;
}
float worley(vec2 p) {
  vec2 cell=floor(p), f=fract(p);
  float nearest=2.0;
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++) {
    vec2 offset=vec2(float(x),float(y)), id=cell+offset;
    // Bounded jitter keeps the nearest feature within the 3x3 neighborhood.
    vec2 feature=0.25+0.5*vec2(hash(id),hash(id+vec2(31.7,17.2)));
    nearest=min(nearest,length(offset+feature-f));
  }
  return 1.0-clamp(nearest,0.0,1.0);
}
float sampleNoise(vec2 p,int kind) {
  if(kind==0) return noise(p);
  if(kind==4) return worley(p);
  float n=perlin(p);
  if(kind==2) return pow(1.0-abs(n),2.0);
  if(kind==3) return clamp(abs(n)*1.7,0.0,1.0);
  return n*0.5+0.5;
}
float fbm(vec2 p,int kind) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.80,0.60,-0.60,0.80);
  for (int i=0; i<6; i++) {
    if(i>=uOctaves) break;
    v += a*sampleNoise(p,kind); p = r*p*2.03+7.1; a *= 0.5;
  }
  return v;
}
void main() {
  // CSS-pixel camera displacement: X follows screen X, Y is inverted because UV grows upward.
  vec2 uv = vUv + vec2(-uCameraOffset.x,uCameraOffset.y)/uResolution;
  vec2 p = uv * vec2(uResolution.x/uResolution.y, 1.0) * uScale;
  float t = uTime * uSpeed;
  vec2 warp = vec2(fbm(p+vec2(t,0.0),0), fbm(p+vec2(2.8,-t*0.7),0));
  float cloud = fbm(p*1.6 + uWarp*warp + vec2(-t*0.35,t*0.18),uNoiseType);
  float filaments = pow(max(0.0, 1.0-abs(cloud-0.5)*2.0), 9.0);
  float distanceToLight = length((uv-uLight)*vec2(1.5,1.0));
  float light = exp(-distanceToLight*distanceToLight*3.2);
  float plume = exp(-pow((uv.x-uLight.x+0.28*(uv.y-uLight.y)+0.15*(warp.x-0.5))/0.30, 2.0));
  float cloudLight = (pow(cloud,2.4)*0.25 + filaments*0.09) * light * (0.35+plume);
  if(uNoiseType==2) cloudLight=pow(cloud,3.4)*0.55*light*(0.35+plume);
  if(uNoiseType==3) cloudLight=pow(cloud,1.5)*0.34*light*(0.35+plume);
  if(uNoiseType==4) cloudLight=pow(cloud,2.0)*0.34*light*(0.35+plume);
  vec3 color = uBaseColor + uTint * cloudLight * uIntensity;
  vec2 pixel = uv*uResolution;
  vec2 cell = (fract(pixel/uSpacing)-0.5)*uSpacing;
  float dotMask = 1.0-smoothstep(uDotSize*0.35,uDotSize+0.5,length(cell));
  float gridArea = smoothstep(0.04,0.30,uv.x) * (1.0-smoothstep(0.38,0.82,length(uv-0.5)));
  color += mix(vec3(0.10),uTint*0.22,0.35)*dotMask*uGridOpacity*gridArea;
  float backgroundMask=smoothstep(uBackgroundFade.x,uBackgroundFade.y,vUv.x);
  color=mix(uEdgeColor,color,backgroundMask);
  gl_FragColor = vec4(color,1.0);
  #include <colorspace_fragment>
}
`;
// Full-screen analytic light: an exponential tail has no circle/quad cutoff.
// The finite stage bounds are the only clip; large bursts are not point sprites.
export const burstFragment = `
varying vec2 vUv;
uniform vec2 uCenter, uViewSize;
uniform vec3 uTint;
uniform float uStartRadius, uFalloff;
uniform int uBurstCount;
uniform vec2 uBursts[48]; // current world radius, current intensity
void main() {
  float distanceFromCore=length((vUv-uCenter)*uViewSize);
  vec3 light=vec3(0.0);
  vec3 haloTint=mix(uTint,vec3(1.0),0.28);
  for(int i=0;i<48;i++) {
    if(i>=uBurstCount) break;
    float radius=uBursts[i].x, intensity=uBursts[i].y;
    float halo=exp(-uFalloff*distanceFromCore/radius);
    float center=exp(-distanceFromCore/(uStartRadius*0.35));
    light+=intensity*(0.12*haloTint*halo+1.2*vec3(1.0,0.97,0.9)*center);
  }
  gl_FragColor=vec4(light,1.0);
  #include <colorspace_fragment>
}
`;
export const orbitVertex = `
attribute float orbitProgress, strength, dotHalfWidth;
varying float vProgress, vStrength, vDepth, vDotHalfWidth;
varying vec3 vNormal, vView;
void main() {
  vec4 world=modelMatrix*vec4(position,1.0);
  vec4 view=viewMatrix*world;
  vProgress=orbitProgress; vStrength=strength; vDepth=world.z;
  vDotHalfWidth=dotHalfWidth;
  vNormal=normalMatrix*normal; vView=-view.xyz;
  gl_Position=projectionMatrix*view;
}
`;
export const orbitFragment = `
uniform vec3 uTint;
uniform float uOpacity, uRadius, uWhite, uSaturation, uRepeats;
uniform int uStyle;
varying float vProgress, vStrength, vDepth, vDotHalfWidth;
varying vec3 vNormal, vView;
float stroke(float phase,float start,float end,float aa) {
  return smoothstep(start-aa,start+aa,phase)*(1.0-smoothstep(end-aa,end+aa,phase));
}
void main() {
  float progress=vProgress*uRepeats, phase=fract(progress);
  float aa=clamp(fwidth(progress),0.001,0.15);
  // A dot's arc length matches the tube diameter instead of becoming a short dash.
  float dotRadius=min(0.07,vDotHalfWidth*uRepeats);
  float pattern=1.0;
  if(uStyle==1) pattern=stroke(phase,0.08,0.72,aa);
  else if(uStyle==2) pattern=stroke(phase,0.5-dotRadius,0.5+dotRadius,aa);
  else if(uStyle==3) pattern=stroke(phase,0.06,0.57,aa)+stroke(phase,0.8-dotRadius,0.8+dotRadius,aa);
  else if(uStyle==4) pattern=stroke(phase,0.04,0.48,aa)+stroke(phase,0.67-dotRadius,0.67+dotRadius,aa)+stroke(phase,0.89-dotRadius,0.89+dotRadius,aa);
  if(pattern<0.001) discard;
  // A soft silhouette on an actual tube, with no plane-angle visibility gate.
  float facing=abs(dot(normalize(vNormal),normalize(vView)));
  float edge=smoothstep(0.0,0.65,facing);
  float depth=mix(0.16,1.0,smoothstep(-uRadius,uRadius,vDepth));
  vec3 tint=mix(uTint,vec3(0.9,0.94,0.92),uWhite);
  tint=max(vec3(0.0),mix(vec3(dot(tint,vec3(0.2126,0.7152,0.0722))),tint,uSaturation));
  gl_FragColor=vec4(tint,uOpacity*edge*depth*vStrength*min(1.0,pattern));
  #include <colorspace_fragment>
}
`;
export const ribbonVertex = `
attribute float across;
attribute float strength;
varying float vAcross, vStrength, vDepth;
void main() {
  vec4 world = modelMatrix*vec4(position,1.0);
  vAcross=across; vStrength=strength; vDepth=world.z;
  gl_Position=projectionMatrix*viewMatrix*world;
}
`;
export const ribbonFragment = `
uniform vec3 uTint;
uniform float uOpacity, uRadius, uWhite, uEmission, uSaturation;
varying float vAcross, vStrength, vDepth;
void main() {
  float edge=1.0-smoothstep(0.25,1.0,abs(vAcross));
  float depth=mix(0.16,1.0,smoothstep(-uRadius,uRadius,vDepth));
  vec3 tint=mix(uTint,vec3(0.9,0.94,0.92),uWhite);
  tint=max(vec3(0.0),mix(vec3(dot(tint,vec3(0.2126,0.7152,0.0722))),tint,uSaturation));
  // Emissive trails scale radiance, not alpha: values over 1 add actual light.
  if(uEmission>0.5) gl_FragColor=vec4(tint*uOpacity,edge*depth*vStrength);
  else gl_FragColor=vec4(tint,uOpacity*edge*depth*vStrength);
  #include <colorspace_fragment>
}
`;
export const pointsVertex = `
attribute float size;
attribute float whiteness;
attribute float intensity;
uniform float uViewportHeight;
varying float vWhite, vDepth, vIntensity;
void main() {
  vec4 world=modelMatrix*vec4(position,1.0);
  vec4 mv=viewMatrix*world;
  vWhite=whiteness; vDepth=world.z; vIntensity=intensity;
  gl_PointSize=clamp(size*uViewportHeight*projectionMatrix[1][1]/(-mv.z)*3.0,2.0,192.0);
  gl_Position=projectionMatrix*mv;
}
`;
export const pointsFragment = `
uniform vec3 uTint;
uniform float uGlow, uRadius, uSaturation, uCoreWhiteness;
varying float vWhite, vDepth, vIntensity;
void main() {
  float r=length(gl_PointCoord-0.5)*2.0;
  float halo=exp(-r*r*6.0)*(1.0-smoothstep(0.65,1.0,r))*uGlow*0.24;
  float core=1.0-smoothstep(0.08,0.19,r);
  float inner=exp(-r*r*40.0)*0.7;
  float depth=mix(0.32,1.0,smoothstep(-uRadius,uRadius,vDepth));
  vec3 tint=mix(uTint,vec3(0.78,0.88,0.94),vWhite);
  tint=max(vec3(0.0),mix(vec3(dot(tint,vec3(0.2126,0.7152,0.0722))),tint,uSaturation));
  vec3 center=mix(tint,vec3(1.0,0.97,0.89),mix(uCoreWhiteness,1.0,vWhite));
  vec3 light=tint*(halo+inner)+center*core;
  gl_FragColor=vec4(light*depth*vIntensity,1.0);
  #include <colorspace_fragment>
}
`;
