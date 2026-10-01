type RingtoneHandle = {
  stop: () => void;
};

export function startRingtone(): RingtoneHandle {
  if (typeof window === "undefined") return { stop: () => {} };

  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return { stop: () => {} };

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.08;
  master.connect(ctx.destination);

  let stopped = false;
  const oscs: OscillatorNode[] = [];

  const chirp = (when: number) => {
    const freqs = [440, 480];
    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(0.7, when + 0.02);
      gain.gain.setValueAtTime(0.7, when + 0.38);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.42);
      osc.connect(gain);
      gain.connect(master);
      osc.start(when);
      osc.stop(when + 0.45);
      oscs.push(osc);
    }
  };

  const loop = () => {
    if (stopped) return;
    const now = ctx.currentTime;
    chirp(now);
    chirp(now + 0.5);
    timer = window.setTimeout(loop, 2000);
  };

  let timer = window.setTimeout(loop, 0);
  void ctx.resume();

  return {
    stop: () => {
      stopped = true;
      window.clearTimeout(timer);
      for (const osc of oscs) {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      }
      void ctx.close();
    },
  };
}
