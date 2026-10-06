/**
 * Suara "cha-ching" mesin kasir — disintesis dengan Web Audio API,
 * jadi tidak perlu file audio.
 *
 * Browser hanya mengizinkan audio setelah ada interaksi pengguna. Pembayaran
 * sukses datang dari polling (bukan tap), jadi panggil `unlockCashierSound()`
 * saat kasir menekan tombol bayar agar AudioContext sudah aktif duluan.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function unlockCashierSound() {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

// Bunyi "klak" mekanis laci kasir: burst noise pendek lewat bandpass
function drawerClack(c: AudioContext, t: number, out: AudioNode) {
  const len = Math.floor(c.sampleRate * 0.06);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.value = 0.55;
  src.connect(bp).connect(g).connect(out);
  src.start(t);
}

// Lonceng: nada dasar + harmonik inharmonis, decay eksponensial
function bell(c: AudioContext, t: number, freq: number, dur: number, vol: number, out: AudioNode) {
  const partials: [number, number][] = [
    [1, 1],
    [2.76, 0.45],
    [5.4, 0.25],
    [8.93, 0.12],
  ];
  for (const [ratio, amp] of partials) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = freq * ratio;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * amp, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur / ratio ** 0.5);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

// Gemerincing koin: beberapa ping tinggi acak
function coins(c: AudioContext, t: number, out: AudioNode) {
  for (let i = 0; i < 6; i++) {
    const at = t + i * 0.045 + Math.random() * 0.02;
    bell(c, at, 3200 + Math.random() * 1600, 0.18, 0.05, out);
  }
}

export function playCashierSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const master = c.createGain();
  master.gain.value = 0.7;
  const comp = c.createDynamicsCompressor();
  master.connect(comp).connect(c.destination);

  const t = c.currentTime + 0.02;
  drawerClack(c, t, master); // "cha-"
  bell(c, t + 0.09, 1318.5, 1.3, 0.35, master); // "-ching" (E6)
  bell(c, t + 0.09, 1975.5, 1.1, 0.22, master); // + B6 biar cerah
  coins(c, t + 0.16, master);
}
