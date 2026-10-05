import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { meteo } from '../scene/meteo'
import { iles } from './monde'

// Bancs de poissons low-poly qui tournent dans le lagon de chaque île de compétence,
// aux couleurs de l'île (visibles grâce à l'eau translucide près des côtes).
const PAR_BANC = 12

interface Poisson {
  cx: number
  cz: number
  rayon: number
  angle: number
  vitesse: number
  profondeur: number
  phase: number
  taille: number
}

const geometriePoisson = () => {
  const corps = new THREE.SphereGeometry(0.5, 6, 4).toNonIndexed()
  corps.scale(0.32, 0.45, 1)
  const queue = new THREE.ConeGeometry(0.3, 0.45, 3).toNonIndexed()
  queue.rotateX(-Math.PI / 2)
  queue.scale(0.25, 1, 1)
  queue.translate(0, 0, -0.62)
  const g = mergeGeometries([corps, queue])!
  g.computeVertexNormals()
  return g
}

export function Poissons() {
  const maillage = useRef<THREE.InstancedMesh>(null)
  const geometrie = useMemo(geometriePoisson, [])
  const bancs = useMemo(() => iles.filter((i) => i.coffre), [])
  const poissons = useMemo<Poisson[]>(
    () =>
      bancs.flatMap((ile, b) =>
        Array.from({ length: PAR_BANC }, (_, k) => ({
          cx: ile.x,
          cz: ile.z,
          rayon: ile.rayon * 1.08 + 2.2 + Math.random() * 2.5,
          angle: (b * 1.3 + k * 0.18 + Math.random() * 0.15) % (Math.PI * 2),
          vitesse: (b % 2 ? 1 : -1) * (0.22 + Math.random() * 0.05),
          profondeur: 0.75 + Math.random() * 0.6,
          phase: Math.random() * 10,
          taille: 0.55 + Math.random() * 0.3,
        })),
      ),
    [bancs],
  )
  const outil = useMemo(() => new THREE.Object3D(), [])

  // une couleur par banc (celle de l'île), légèrement variée d'un poisson à l'autre
  const couleursPosees = useRef(false)

  useFrame(({ clock }, delta) => {
    const m = maillage.current
    if (!m) return
    if (!couleursPosees.current) {
      const c = new THREE.Color()
      poissons.forEach((_, i) => {
        c.set(bancs[Math.floor(i / PAR_BANC)].couleur).offsetHSL(0, 0, (Math.random() - 0.5) * 0.15)
        m.setColorAt(i, c)
      })
      if (m.instanceColor) m.instanceColor.needsUpdate = true
      couleursPosees.current = true
    }
    const dt = Math.min(delta, 0.05)
    const t = clock.elapsedTime
    // par gros temps, les poissons descendent un peu
    const plongee = (meteo.houle - 1) * 0.5
    poissons.forEach((p, i) => {
      p.angle += (p.vitesse * 8 * dt) / p.rayon // ~2 unités / s
      const ondulation = Math.sin(t * 1.3 + p.phase) * 0.4
      const r = p.rayon + ondulation
      const x = p.cx + Math.cos(p.angle) * r
      const z = p.cz + Math.sin(p.angle) * r
      outil.position.set(x, -0.4 - p.profondeur - plongee + Math.sin(t * 2 + p.phase) * 0.08, z)
      // orienté selon la tangente du cercle, avec un frétillement de la queue
      const cap = p.vitesse > 0 ? -p.angle : Math.PI - p.angle
      outil.rotation.set(0, cap + Math.sin(t * 9 + p.phase) * 0.18, 0)
      outil.scale.setScalar(p.taille)
      outil.updateMatrix()
      m.setMatrixAt(i, outil.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={maillage} args={[geometrie, undefined, poissons.length]} frustumCulled={false}>
      <meshStandardMaterial flatShading roughness={0.5} />
    </instancedMesh>
  )
}
