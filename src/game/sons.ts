// Ambiance sonore entièrement synthétisée (Web Audio) : aucun fichier à charger.
// Démarre seulement après un clic sur le bouton son (pas de lecture automatique).

let ctx: AudioContext | null = null
let maitre: GainNode | null = null
let minuteurMouette = 0
let actif = false
let gainPluie: GainNode | null = null
let niveauPluie = 0

const bruitBrun = (c: AudioContext, secondes: number) => {
  const buffer = c.createBuffer(1, c.sampleRate * secondes, c.sampleRate)
  const data = buffer.getChannelData(0)
  let dernier = 0
  for (let i = 0; i < data.length; i++) {
    const blanc = Math.random() * 2 - 1
    dernier = (dernier + 0.02 * blanc) / 1.02
    data[i] = dernier * 3.5
  }
  return buffer
}

// Une couche de ressac : bruit filtré dont le volume ondule lentement.
const couche = (c: AudioContext, sortie: AudioNode, filtre: BiquadFilterType, freq: number, lfo: number, niveau: number) => {
  const src = c.createBufferSource()
  src.buffer = bruitBrun(c, 6)
  src.loop = true
  const f = c.createBiquadFilter()
  f.type = filtre
  f.frequency.value = freq
  const g = c.createGain()
  g.gain.value = niveau
  const osc = c.createOscillator()
  osc.frequency.value = lfo
  const profondeur = c.createGain()
  profondeur.gain.value = niveau * 0.8
  osc.connect(profondeur).connect(g.gain)
  src.connect(f).connect(g).connect(sortie)
  src.start()
  osc.start()
}

const criMouette = () => {
  if (!ctx || !maitre) return
  const t0 = ctx.currentTime
  const repetitions = 2 + Math.floor(Math.random() * 2)
  for (let k = 0; k < repetitions; k++) {
    const t = t0 + k * 0.32
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    const base = 1500 + Math.random() * 400
    osc.frequency.setValueAtTime(base, t)
    osc.frequency.exponentialRampToValueAtTime(base * 0.62, t + 0.24)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1700
    bp.Q.value = 4
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.05, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
    osc.connect(bp).connect(g).connect(maitre)
    osc.start(t)
    osc.stop(t + 0.3)
  }
}

const planifierMouette = () => {
  minuteurMouette = window.setTimeout(() => {
    criMouette()
    planifierMouette()
  }, 5000 + Math.random() * 9000)
}

export function activerSon(allumer: boolean) {
  actif = allumer
  if (allumer) {
    if (!ctx) {
      ctx = new AudioContext()
      maitre = ctx.createGain()
      maitre.gain.value = 0
      maitre.connect(ctx.destination)
      couche(ctx, maitre, 'lowpass', 420, 0.11, 0.5)
      couche(ctx, maitre, 'bandpass', 1300, 0.07, 0.12)
      // pluie : bruit blanc filtré, volume piloté par la météo
      const src = ctx.createBufferSource()
      const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      src.buffer = buf
      src.loop = true
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 900
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 7000
      gainPluie = ctx.createGain()
      gainPluie.gain.value = niveauPluie * 0.3
      src.connect(hp).connect(lp).connect(gainPluie).connect(maitre)
      src.start()
    }
    void ctx.resume()
    maitre!.gain.setTargetAtTime(0.6, ctx.currentTime, 0.4)
    window.clearTimeout(minuteurMouette)
    planifierMouette()
  } else if (ctx && maitre) {
    maitre.gain.setTargetAtTime(0, ctx.currentTime, 0.2)
    window.clearTimeout(minuteurMouette)
  }
}

export function reglerPluie(niveau: number) {
  if (Math.abs(niveau - niveauPluie) < 0.02) return
  niveauPluie = niveau
  if (ctx && gainPluie) gainPluie.gain.setTargetAtTime(niveau * 0.3, ctx.currentTime, 0.5)
}

// Tonnerre : grondement de bruit brun filtré, plus sourd et plus long quand il est loin.
export function jouerTonnerre(distance: number) {
  if (!ctx || !maitre || !actif) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = bruitBrun(ctx, 5)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 700 / distance + 80
  const g = ctx.createGain()
  const volume = Math.min(1.2, 1 / distance)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(volume, t + 0.08)
  g.gain.exponentialRampToValueAtTime(volume * 0.4, t + 0.6)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5 + distance)
  src.connect(lp).connect(g).connect(maitre)
  src.start(t)
  src.stop(t + 4 + distance)
}

// Petit carillon à l'ouverture d'un coffre.
export function jouerCoffre() {
  if (!ctx || !maitre || !actif) return
  const notes = [1046.5, 1318.5, 1568, 2093]
  notes.forEach((f, i) => {
    const t = ctx!.currentTime + i * 0.09
    const osc = ctx!.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = f
    const g = ctx!.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
    osc.connect(g).connect(maitre!)
    osc.start(t)
    osc.stop(t + 0.65)
  })
}
