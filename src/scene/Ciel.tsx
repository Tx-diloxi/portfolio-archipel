import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ambiance, mettreAJourCycle } from './cycle'
import { meteo, mettreAJourMeteo } from './meteo'

// Dôme céleste dégradé (horizon → zénith) avec soleil, lune et halo.
const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  uniform vec3 uSoleil;
  uniform vec3 uLumiere;
  uniform float uNuit;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = max(d.y, 0.0);
    vec3 couleur = mix(uHorizon, uZenith, pow(h, 0.55));
    // soleil : disque + halo
    float s = max(dot(d, uSoleil), 0.0);
    couleur += uLumiere * (pow(s, 900.0) * 3.0 + pow(s, 12.0) * 0.35) * (1.0 - uNuit);
    // lune à l'opposé du soleil
    float l = max(dot(d, -uSoleil), 0.0);
    couleur += vec3(0.85, 0.9, 1.0) * (smoothstep(0.9993, 0.9996, l) * 1.6 + pow(l, 40.0) * 0.12) * uNuit;
    // sous l'horizon : on prolonge la couleur d'horizon (cachée par l'océan et le brouillard)
    gl_FragColor = vec4(couleur, 1.0);
    #include <colorspace_fragment>
  }
`

function Etoiles() {
  const geometrie = useMemo(() => {
    const n = 1400
    const pos = new Float32Array(n * 3)
    let s = 3
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    for (let i = 0; i < n; i++) {
      const theta = rnd() * Math.PI * 2
      const y = 0.05 + rnd() * 0.95 // hémisphère supérieur
      const r = Math.sqrt(1 - y * y)
      pos.set([Math.cos(theta) * r * 240, y * 240, Math.sin(theta) * r * 240], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  const materiau = useRef<THREE.PointsMaterial>(null)
  useFrame(({ clock }) => {
    if (materiau.current) materiau.current.opacity = ambiance.nuit * (0.85 + Math.sin(clock.elapsedTime * 2) * 0.05)
  })
  return (
    <points geometry={geometrie} frustumCulled={false}>
      <pointsMaterial ref={materiau} color="#ffffff" size={1.6} sizeAttenuation={false} transparent depthWrite={false} fog={false} />
    </points>
  )
}

// Fait avancer le temps et applique l'ambiance au ciel, au brouillard et à la lumière d'ambiance.
export function Ciel() {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const dome = useRef<THREE.Mesh>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const voute = useRef<THREE.Group>(null)
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new THREE.Color() },
      uZenith: { value: new THREE.Color() },
      uSoleil: { value: ambiance.soleilVrai },
      uLumiere: { value: new THREE.Color() },
      uNuit: { value: 0 },
    }),
    [],
  )

  useFrame((_, delta) => {
    mettreAJourMeteo(Math.min(delta, 0.1))
    mettreAJourCycle(Math.min(delta, 0.1))
    uniforms.uHorizon.value.copy(ambiance.horizon)
    uniforms.uZenith.value.copy(ambiance.zenith)
    uniforms.uLumiere.value.copy(ambiance.lumiere)
    uniforms.uNuit.value = ambiance.nuit
    if (scene.background instanceof THREE.Color) scene.background.copy(ambiance.horizon)
    if (scene.fog instanceof THREE.Fog) {
      // la pluie bouche l'horizon
      scene.fog.color.copy(ambiance.horizon)
      scene.fog.near = 50 - meteo.pluie * 32
      scene.fog.far = 135 - meteo.pluie * 60 - meteo.couverture * 10
    }
    if (hemi.current) {
      hemi.current.color.copy(ambiance.cielAmbiant)
      hemi.current.groundColor.copy(ambiance.solAmbiant)
      hemi.current.intensity = ambiance.ambiant
    }
    // le dôme suit la caméra : il paraît infiniment loin
    dome.current?.position.copy(camera.position)
    voute.current?.position.copy(camera.position)
  })

  return (
    <>
      <hemisphereLight ref={hemi} />
      <mesh ref={dome} renderOrder={-1}>
        <sphereGeometry args={[260, 32, 16]} />
        <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <group ref={voute}>
        <Etoiles />
      </group>
    </>
  )
}
