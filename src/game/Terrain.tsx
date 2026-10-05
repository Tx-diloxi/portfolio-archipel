import { useMemo } from 'react'
import * as THREE from 'three'
import type { Ile } from './monde'

// Terrain low-poly d'une île : contours irréguliers et facettes de couleurs variées,
// au lieu de cylindres parfaits. Déterministe (même forme à chaque chargement).

const aleatoire = (graine: string) => {
  let h = 2166136261
  for (const c of graine) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

// Déforme radialement les sommets d'un cylindre selon un profil d'angle, puis colore
// chaque facette avec une teinte légèrement différente.
function terrain(
  geo: THREE.CylinderGeometry,
  profil: (angle: number) => number,
  teintes: string[],
  rnd: () => number,
  bosses = 0,
) {
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const r = Math.hypot(v.x, v.z)
    if (r > 1e-3) {
      const k = profil(Math.atan2(v.x, v.z))
      v.x *= k
      v.z *= k
    }
    if (bosses && v.y > 0) v.y += Math.sin(v.x * 1.3) * Math.cos(v.z * 1.1) * bosses
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  const plat = geo.toNonIndexed()
  const couleurs = teintes.map((t) => new THREE.Color(t))
  const tab = new Float32Array(plat.attributes.position.count * 3)
  for (let f = 0; f < tab.length / 9; f++) {
    const c = couleurs[Math.floor(rnd() * couleurs.length)]
    for (let s = 0; s < 3; s++) c.toArray(tab, f * 9 + s * 3)
  }
  plat.setAttribute('color', new THREE.BufferAttribute(tab, 3))
  plat.computeVertexNormals()
  geo.dispose()
  return plat
}

export function Terrain({ ile }: { ile: Ile }) {
  const r = ile.rayon
  const { roche, plage, sableMouille, herbe } = useMemo(() => {
    const rnd = aleatoire(`terrain-${ile.id}`)
    // profil de côte : quelques harmoniques aléatoires
    const a1 = rnd() * 6
    const a2 = rnd() * 6
    const cote = (a: number) => 1 + 0.04 * Math.sin(3 * a + a1) + 0.025 * Math.sin(5 * a + a2)
    return {
      roche: terrain(new THREE.CylinderGeometry(r * 0.95, r * 0.5, 2.6, 20, 2), cote, ['#8f7a62', '#9c866c', '#7f6c56'], rnd),
      sableMouille: terrain(new THREE.CylinderGeometry(r * 1.1, r * 1.08, 0.3, 32), cote, ['#cdb37d', '#c4a970'], rnd),
      plage: terrain(new THREE.CylinderGeometry(r * 1.02, r * 1.0, 0.45, 32), cote, ['#f2deaa', '#ead39a', '#f6e6b8'], rnd),
      herbe: terrain(
        new THREE.CylinderGeometry(r * 0.86, r * 0.89, 0.32, 32, 1),
        (a) => 0.97 + 0.03 * Math.sin(4 * a + a1),
        ['#69b34c', '#76c058', '#5ea544', '#80c75e'],
        rnd,
        0.04,
      ),
    }
  }, [ile.id, r])

  return (
    <group>
      {/* fond du lagon, visible à travers l'eau translucide */}
      <mesh position-y={-2.2} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[r + 12, 40]} />
        <meshStandardMaterial color="#d8c48e" roughness={1} />
      </mesh>
      <mesh geometry={roche} position-y={-1.3} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
      <mesh geometry={sableMouille} position-y={-0.25} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.6} />
      </mesh>
      <mesh geometry={plage} position-y={0} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
      <mesh geometry={herbe} position-y={0.3} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </mesh>
    </group>
  )
}
