import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader, PerformanceMonitor } from '@react-three/drei'
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Bateau } from '../game/Bateau'
import { CameraSuivi } from '../game/CameraSuivi'
import { IleJeu } from '../game/IleJeu'
import { Jeu } from '../game/Jeu'
import { Dauphins } from '../game/Dauphins'
import { Joueur } from '../game/Joueur'
import { Mouettes } from '../game/Mouettes'
import { Poissons } from '../game/Poissons'
import { Sillage } from '../game/Sillage'
import { iles } from '../game/monde'
import { usePortfolio } from '../store'
import { Nuages } from './Nuages'
import { Ciel } from './Ciel'
import { Ocean } from './Ocean'
import { Pluie } from './Pluie'

const HORIZON = '#b4e0f0' // valeur initiale, ensuite pilotée par le cycle jour / nuit

export function Experience({ bloque }: { bloque: boolean }) {
  const [dpr, setDpr] = useState(1.5)
  // les effets de post-traitement sautent en premier si l'appareil peine
  const [effets, setEffets] = useState(true)
  const replierPourPerf = usePortfolio((s) => s.replierPourPerf)

  return (
    <>
      <Canvas className="canvas-3d" dpr={dpr} shadows camera={{ position: [0, 12, 30], fov: 50, near: 0.1, far: 300 }} aria-hidden>
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1)
            setEffets(false)
          }}
          onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
          flipflops={3}
          onFallback={replierPourPerf}
        />
        <color attach="background" args={[HORIZON]} />
        <fog attach="fog" args={[HORIZON, 50, 135]} />
        <Ciel />
        <Ocean />
        <Nuages />
        <Suspense fallback={null}>
          {iles.map((ile) => (
            <IleJeu key={ile.id} ile={ile} />
          ))}
          <Bateau />
          <Joueur />
        </Suspense>
        <Sillage />
        <Mouettes />
        <Poissons />
        <Dauphins />
        <Pluie />
        <Jeu bloque={bloque} />
        <CameraSuivi />
        {effets && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.88} luminanceSmoothing={0.25} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <HueSaturation saturation={0.12} />
            <BrightnessContrast brightness={0.02} contrast={0.06} />
            <Vignette offset={0.28} darkness={0.5} />
            <SMAA />
          </EffectComposer>
        )}
      </Canvas>
      <Loader dataInterpolation={(p) => `Chargement de l'archipel… ${p.toFixed(0)} %`} />
    </>
  )
}
