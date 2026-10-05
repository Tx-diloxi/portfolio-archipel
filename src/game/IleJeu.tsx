import { Html } from '@react-three/drei'
import { Landmark } from '../scene/Landmarks'
import { Coffre } from './Coffre'
import { Decor } from './Decor'
import { Lanterne } from './Lanterne'
import { Terrain } from './Terrain'
import { useJeu } from './etat'
import { HAUTEUR_SOL, type Ile } from './monde'

function Ponton({ ile }: { ile: Ile }) {
  const { ux, uz } = ile.ponton
  const longueur = 3.6
  const debut = ile.rayon * 0.75
  const centre = debut + longueur / 2 + 0.3
  const angle = Math.atan2(ux, uz)
  return (
    <group position={[ile.x + ux * centre, 0, ile.z + uz * centre]} rotation-y={angle}>
      <mesh position-y={HAUTEUR_SOL - 0.08} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.16, longueur + 1.2]} />
        <meshStandardMaterial color="#a0703c" />
      </mesh>
      {[-1, 1].map((cote) =>
        [-0.5, 0.5].map((pos) => (
          <mesh key={`${cote}${pos}`} position={[cote * 0.7, -0.2, pos * (longueur + 0.6)]}>
            <cylinderGeometry args={[0.1, 0.1, 1.5]} />
            <meshStandardMaterial color="#5a3a1a" />
          </mesh>
        )),
      )}
      {/* lanterne au bout du ponton : repère pour accoster la nuit */}
      <Lanterne position={[0.72, HAUTEUR_SOL, (longueur + 1.2) / 2 - 0.25]} />
    </group>
  )
}

function Pancarte({ ile, index }: { ile: Ile; index: number }) {
  const p = ile.panneaux[index]
  const ici = useJeu((s) => s.ile === ile.id)
  return (
    <group position={[p.x, HAUTEUR_SOL, p.z]} rotation-y={p.angle}>
      <mesh position-y={0.6} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
      <mesh position-y={1.3} castShadow>
        <boxGeometry args={[1.1, 0.6, 0.08]} />
        <meshStandardMaterial color="#f5ecd7" />
      </mesh>
      <mesh position={[0, 1.3, 0.045]}>
        <planeGeometry args={[0.9, 0.12]} />
        <meshStandardMaterial color={ile.couleur} />
      </mesh>
      <Html
        position={[0, 2.1, 0]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'none', visibility: ici ? 'visible' : 'hidden' }}
      >
        <span className="etiquette-ile petite" style={{ borderColor: ile.couleur }}>
          {p.ac.code}
        </span>
      </Html>
    </group>
  )
}

export function IleJeu({ ile }: { ile: Ile }) {
  const r = ile.rayon
  const ici = useJeu((s) => s.ile === ile.id)
  const echelle = ile.niveau === 3 ? 1.35 : ile.niveau === 2 ? 1.1 : 1

  return (
    <group>
      <group position={[ile.x, 0, ile.z]}>
        <Terrain ile={ile} />
        <mesh position-y={0.26} rotation-x={Math.PI / 2}>
          <torusGeometry args={[r * 0.88, 0.06, 4, 48]} />
          <meshStandardMaterial color={ile.couleur} emissive={ile.couleur} emissiveIntensity={0.4} />
        </mesh>
        <group position-y={HAUTEUR_SOL} scale={echelle}>
          <Landmark id={ile.id} couleur={ile.couleur} />
        </group>
        {/* repère visible depuis la mer, masqué quand on est sur l'île */}
        <Html
          position={[0, r * 0.5 + 5, 0]}
          center
          zIndexRange={[10, 0]}
          style={{ pointerEvents: 'none', visibility: ici ? 'hidden' : 'visible' }}
        >
          <span className="etiquette-ile" style={{ borderColor: ile.couleur }}>
            {ile.nom}
            {ile.niveau && <span className={`badge-niveau n${ile.niveau}`}>Niv. {ile.niveau}</span>}
          </span>
        </Html>
      </group>
      <Ponton ile={ile} />
      <Decor ile={ile} />
      <Coffre ile={ile} />
      {ile.panneaux.map((p, i) => (
        <Pancarte key={p.ac.code} ile={ile} index={i} />
      ))}
    </group>
  )
}
