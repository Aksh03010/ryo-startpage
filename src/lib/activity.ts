export function isPageActive() {
  return document.visibilityState !== 'hidden';
}

export function subscribeActivity(listener: () => void) {
  document.addEventListener('visibilitychange', listener);
  return () => {
    document.removeEventListener('visibilitychange', listener);
  };
}
