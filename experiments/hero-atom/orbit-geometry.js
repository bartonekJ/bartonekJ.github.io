import * as THREE from './vendor/three.module.min.js';

export const ORBIT_SEGMENTS=192;
export const TUBE_SEGMENTS=8;

// Offset is a percentage of each parent's actual (seeded) radius.
export const companionRadius=(radius,offset)=>radius*(1+offset/100);

// One batch of real, circular tube sections; trails keep their separate flat ribbons.
export function createOrbitGeometry(orbits,width,{offset=0,subtleBreaks=false}={}) {
  const stride=TUBE_SEGMENTS+1, perOrbit=(ORBIT_SEGMENTS+1)*stride;
  const positions=new Float32Array(orbits.length*perOrbit*3);
  const normals=new Float32Array(positions.length);
  const progress=new Float32Array(orbits.length*perOrbit);
  const strength=new Float32Array(progress.length);
  const dotHalfWidth=new Float32Array(progress.length);
  const indices=[],point=new THREE.Vector3(),normal=new THREE.Vector3();
  orbits.forEach((orbit,i)=>{
    const radius=companionRadius(orbit.radius,offset);
    for(let j=0;j<=ORBIT_SEGMENTS;j++) {
      const angle=j/ORBIT_SEGMENTS*Math.PI*2,cos=Math.cos(angle),sin=Math.sin(angle);
      for(let k=0;k<=TUBE_SEGMENTS;k++) {
        const section=k/TUBE_SEGMENTS*Math.PI*2,radial=Math.cos(section),axial=Math.sin(section);
        const v=i*perOrbit+j*stride+k;
        point.set((radius+width*radial)*cos,(radius+width*radial)*sin,width*axial)
          .applyQuaternion(orbit.rotation).toArray(positions,v*3);
        normal.set(radial*cos,radial*sin,axial).applyQuaternion(orbit.rotation).toArray(normals,v*3);
        progress[v]=j/ORBIT_SEGMENTS;
        dotHalfWidth[v]=width/(radius*Math.PI*2);
        strength[v]=subtleBreaks && j%8===0 ? 0.3 : 1;
        if(j<ORBIT_SEGMENTS && k<TUBE_SEGMENTS) {
          const a=v,b=v+stride;
          indices.push(a,b,a+1,b,b+1,a+1);
        }
      }
    }
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  geometry.setAttribute('orbitProgress',new THREE.BufferAttribute(progress,1));
  geometry.setAttribute('strength',new THREE.BufferAttribute(strength,1));
  geometry.setAttribute('dotHalfWidth',new THREE.BufferAttribute(dotHalfWidth,1));
  geometry.setIndex(indices);
  return geometry;
}
