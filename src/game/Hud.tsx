import { useEffect, useRef, useState } from 'react'
import { appuyer, declencherAction } from './controles'
import { etat, useJeu } from './etat'
import { iles, LIMITE_MONDE } from './monde'
import { activerSon, jouerTonnerre } from './sons'
import { choisirTemps, ecouterTonnerre, meteo, ORDRE, TEMPS, type Temps } from '../scene/meteo'
import { cycle, estNuit, formaterHeure } from '../scene/cycle'

function Meteo() {
  const [temps, setTemps] = useState<Temps>(meteo.temps)
  useEffect(() => {
    const id = window.setInterval(() => setTemps(meteo.temps), 300)
    const fin = ecouterTonnerre(jouerTonnerre)
    return () => {
      window.clearInterval(id)
      fin()
    }
  }, [])
  const suivant = ORDRE[(ORDRE.indexOf(temps) + 1) % ORDRE.length]
  return (
    <div className="horloge">
      <span>
        {TEMPS[temps].icone} {TEMPS[temps].nom}
      </span>
      <button
        className="btn petit"
        onClick={() => {
          choisirTemps(suivant)
          setTemps(suivant)
        }}
        aria-label={`Passer à la météo : ${TEMPS[suivant].nom}`}
      >
        {TEMPS[suivant].icone} {TEMPS[suivant].nom}
      </button>
    </div>
  )
}

function Horloge() {
  const [heure, setHeure] = useState(cycle.heure)
  useEffect(() => {
    const id = window.setInterval(() => setHeure(cycle.heure), 250)
    return () => window.clearInterval(id)
  }, [])
  const nuit = estNuit(heure)
  return (
    <div className="horloge">
      <span aria-label={`Heure du jeu : ${formaterHeure(heure)}`}>
        {nuit ? '🌙' : '☀️'} {formaterHeure(heure)}
      </span>
      {/* avance rapide jusqu'au matin ou au soir */}
      <button className="btn petit" onClick={() => (cycle.cible = nuit ? 8 : 21)}>
        {nuit ? 'Passer au jour' : 'Passer à la nuit'}
      </button>
    </div>
  )
}

const TAILLE = 132
const ech = (v: number) => (v / LIMITE_MONDE) * (TAILLE / 2 - 6) + TAILLE / 2

function MiniCarte() {
  const point = useRef<SVGGElement>(null)
  const visitees = useJeu((s) => s.visitees)

  useEffect(() => {
    let id = 0
    const boucle = () => {
      const g = point.current
      if (g) {
        const apied = useJeu.getState().phase === 'apied'
        const { x, z } = apied ? etat.joueur : etat.bateau
        const rot = apied ? 0 : (-etat.bateau.cap * 180) / Math.PI + 180
        g.setAttribute('transform', `translate(${ech(x)} ${ech(z)}) rotate(${rot})`)
      }
      id = requestAnimationFrame(boucle)
    }
    id = requestAnimationFrame(boucle)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <svg className="mini-carte" width={TAILLE} height={TAILLE} viewBox={`0 0 ${TAILLE} ${TAILLE}`} aria-label="Carte de l'archipel">
      <circle cx={TAILLE / 2} cy={TAILLE / 2} r={TAILLE / 2 - 2} className="mer" />
      {iles.map((i) => (
        <circle
          key={i.id}
          cx={ech(i.x)}
          cy={ech(i.z)}
          r={(i.rayon / LIMITE_MONDE) * (TAILLE / 2) + 2}
          fill={i.id === 'moi' ? '#fdf6e3' : i.couleur}
          stroke={visitees.includes(i.id) ? '#13222e' : 'none'}
          strokeWidth={1.5}
        />
      ))}
      <g ref={point}>
        <path d="M0 -5 L3.5 4 L-3.5 4 Z" fill="#e05d5d" stroke="#fff" strokeWidth={1} />
      </g>
    </svg>
  )
}

function Bouton({ code, label }: { code: string; label: string }) {
  return (
    <button
      className="pad-btn"
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        appuyer(code, true)
      }}
      onPointerUp={() => appuyer(code, false)}
      onPointerCancel={() => appuyer(code, false)}
    >
      {label}
    </button>
  )
}

export function Hud() {
  const { invite, phase, visitees, coffresOuverts, message, son, basculerSon } = useJeu()
  const [tactile] = useState(() => window.matchMedia?.('(pointer: coarse)').matches ?? false)
  const nbCoffres = iles.filter((i) => i.coffre).length

  useEffect(() => activerSon(son), [son])

  return (
    <div className="hud">
      <div className="hud-haut">
        <MiniCarte />
        <p className="compteur">
          Îles visitées : <strong>{visitees.length}</strong> / {iles.length}
        </p>
        <p className="compteur">
          Coffres ouverts : <strong>{coffresOuverts.length}</strong> / {nbCoffres}
        </p>
      </div>

      <div className="hud-droite">
        <button className="btn-son" onClick={basculerSon} aria-pressed={son}>
          {son ? '🔊 Son activé' : '🔇 Son coupé'}
        </button>
        <Horloge />
        <Meteo />
      </div>

      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}

      {invite && (
        <button className="invite" onClick={declencherAction}>
          <kbd>E</kbd> {invite}
        </button>
      )}

      {!tactile && (
        <p className="aide">
          {phase === 'bateau' ? 'Z Q S D / flèches : naviguer' : 'Z Q S D / flèches : marcher'} · <kbd>E</kbd> : interagir
        </p>
      )}

      {tactile && (
        <div className="pad" aria-hidden>
          <span />
          <Bouton code="ArrowUp" label="▲" />
          <span />
          <Bouton code="ArrowLeft" label="◀" />
          <Bouton code="ArrowDown" label="▼" />
          <Bouton code="ArrowRight" label="▶" />
        </div>
      )}
    </div>
  )
}
