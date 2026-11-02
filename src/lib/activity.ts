let hostPaused = false;
const ACTIVITY_EVENT = 'ryo:activity';

export function isPageActive() {
  return document.visibilityState !== 'hidden' && !hostPaused;
}

export function setHostPaused(paused: boolean) {
  if (hostPaused === paused) return;
  hostPaused = paused;
  document.documentElement.toggleAttribute('data-host-paused', paused);
  window.dispatchEvent(new Event(ACTIVITY_EVENT));
}

export function subscribeActivity(listener: () => void) {
  document.addEventListener('visibilitychange', listener);
  window.addEventListener(ACTIVITY_EVENT, listener);
  return () => {
    document.removeEventListener('visibilitychange', listener);
    window.removeEventListener(ACTIVITY_EVENT, listener);
  };
}
