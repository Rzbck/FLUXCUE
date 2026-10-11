/** Pure deterministic cue helpers, independent of requestAnimationFrame and network output. */
export function fadeFactor(at, start, duration) {
  if (![at,start,duration].every(Number.isFinite) || duration<0) throw new RangeError('Invalid cue timing');
  if (duration===0) return at>=start ? 1 : 0;
  return Math.max(0,Math.min(1,(at-start)/duration));
}
export function blendChannel(from, to, progress) {
  if (![from,to,progress].every(Number.isFinite)) throw new RangeError('Invalid cue blend');
  const t=Math.max(0,Math.min(1,progress));
  return from+(to-from)*t;
}
export function advancePreviewClock(time, delta, running) {
  if (![time,delta].every(Number.isFinite) || time<0 || delta<0) throw new RangeError('Invalid preview clock');
  // Browser preview only: cap large background-tab frame deltas. NOT the future headless show clock.
  return running ? time+Math.min(delta,0.1) : time;
}
