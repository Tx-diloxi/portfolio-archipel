import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { iles } from '../game/monde'
import { ambiance } from './cycle'
import { meteo } from './meteo'

// Eau stylisée low-poly : facettes (normales par dérivées), lagon turquoise près des
// îles, écume animée sur les rivages, reflets du soleil et fresnel vers le ciel.
const NB_ILES = iles.length

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  uniform float uTemps;
  uniform float uHoule;
  varying float vHauteur;
  varying vec3 vMonde;
  void main() {
    vec3 p = position;
    float h = sin(p.x * 0.18 + uTemps * 0.8) * 0.25
            + sin(p.y * 0.23 + uTemps * 0.6) * 0.2
            + sin((p.x + p.y) * 0.4 + uTemps * 1.3) * 0.08;
    h *= uHoule;
    p.z += h;
    vHauteur = h;
    vec4 monde = modelMatrix * vec4(p, 1.0);
    vMonde = monde.xyz;
    vec4 mvPosition = viewMatrix * monde;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const fragmentShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform float uTemps;
  uniform vec3 uIles[${NB_ILES}];
  uniform vec3 uSoleil;
  uniform vec3 uProfond;
  uniform vec3 uMoyen;
  uniform vec3 uLagon;
  uniform vec3 uCiel;
  uniform vec3 uReflet;
  uniform float uNuit;
  uniform float uPluie;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // ronds de gouttes : un impact par cellule, à une phase aléatoire
  float ronds(vec2 p) {
    vec2 cellule = floor(p);
    vec2 local = fract(p) - 0.5;
    float h = hash(cellule);
    float t = fract(uTemps * (0.9 + h * 0.6) + h * 7.0);
    vec2 centre = vec2(hash(cellule + 3.1), hash(cellule + 7.7)) * 0.5 - 0.25;
    float r = length(local - centre);
    return (1.0 - smoothstep(0.0, 0.04, abs(r - t * 0.45))) * (1.0 - t);
  }
  varying float vHauteur;
  varying vec3 vMonde;

  void main() {
    // distance au rivage le plus proche
    float d = 1e4;
    for (int i = 0; i < ${NB_ILES}; i++) {
      d = min(d, length(vMonde.xz - uIles[i].xy) - uIles[i].z);
    }

    vec3 couleur = mix(uProfond, uMoyen, smoothstep(-0.35, 0.4, vHauteur));
    float peuProfond = 1.0 - smoothstep(0.0, 10.0, d);
    couleur = mix(couleur, uLagon, peuProfond * 0.85);

    // écume : liseré irrégulier contre la plage + vaguelettes qui s'éloignent
    float bruit = sin(vMonde.x * 1.7 + uTemps * 1.1) * sin(vMonde.z * 1.3 - uTemps * 0.9);
    float lisere = 1.0 - smoothstep(0.0, 1.1 + 0.35 * sin(uTemps * 1.6 + vMonde.x * 0.3), d + bruit * 0.35);
    float cycle = fract(uTemps * 0.22);
    float vaguelette = (1.0 - smoothstep(0.0, 0.25, abs(d - 0.6 - cycle * 3.2))) * (1.0 - cycle) * step(0.0, bruit + 0.3);
    float cretes = smoothstep(0.47, 0.53, vHauteur) * 0.3;
    float ecume = clamp(max(lisere, max(vaguelette * 0.8, cretes)), 0.0, 1.0);

    // éclairage facetté
    vec3 n = normalize(cross(dFdx(vMonde), dFdy(vMonde)));
    if (n.y < 0.0) n = -n;
    vec3 v = normalize(cameraPosition - vMonde);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    couleur = mix(couleur, uCiel, fresnel * 0.45);
    couleur *= 0.82 + 0.18 * max(dot(n, uSoleil), 0.0);
    float reflet = pow(max(dot(reflect(-uSoleil, n), v), 0.0), 80.0);
    couleur += uReflet * reflet * 0.9;

    vec3 blancEcume = mix(vec3(1.0), uCiel * 1.6, 0.35) * (1.0 - uNuit * 0.7);
    couleur = mix(couleur, blancEcume, ecume * (0.9 - uNuit * 0.35));
    if (uPluie > 0.01) {
      float impacts = ronds(vMonde.xz * 0.9) + ronds(vMonde.xz * 1.3 + 11.0);
      couleur = mix(couleur, uCiel * 1.3, clamp(impacts, 0.0, 1.0) * uPluie * 0.5);
    }
    // lagons translucides : on devine le fond de sable et les poissons près des îles
    float alpha = mix(1.0, 0.6, peuProfond * peuProfond);
    alpha = max(alpha, ecume * 0.9);
    gl_FragColor = vec4(couleur, alpha);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

export function Ocean() {
  const uniforms = useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uTemps: { value: 0 },
          uIles: { value: iles.map((i) => new THREE.Vector3(i.x, i.z, i.rayon * 1.08)) },
          uSoleil: { value: ambiance.soleil },
          uProfond: { value: new THREE.Color('#0b4f7d') },
          uMoyen: { value: new THREE.Color('#1c87b8') },
          uLagon: { value: new THREE.Color('#3fd0c4') },
          uCiel: { value: new THREE.Color('#bfe8f7') },
          uReflet: { value: new THREE.Color() },
          uNuit: { value: 0 },
          uPluie: { value: 0 },
          uHoule: { value: 1 },
        },
      ]),
    [],
  )

  useFrame((_, delta) => {
    uniforms.uTemps.value += delta
    uniforms.uProfond.value.copy(ambiance.profond)
    uniforms.uMoyen.value.copy(ambiance.moyen)
    uniforms.uLagon.value.copy(ambiance.lagon)
    uniforms.uCiel.value.copy(ambiance.horizon).lerp(ambiance.zenith, 0.3)
    uniforms.uNuit.value = ambiance.nuit
    uniforms.uPluie.value = meteo.pluie
    uniforms.uHoule.value = meteo.houle
    uniforms.uReflet.value.copy(ambiance.lumiere).multiplyScalar(Math.min(1, ambiance.direct / 1.5 + 0.25))
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.4} renderOrder={-1}>
      <planeGeometry args={[320, 320, 200, 200]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} fog transparent />
    </mesh>
  )
}
