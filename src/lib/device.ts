type DeviceInfo = Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'> & {
  userAgentData?: { mobile: boolean };
};

/** Device hints gate the desktop notice; window width never does. */
export function isMobileDevice(device: DeviceInfo = navigator): boolean {
  return (
    device.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(device.userAgent) ||
    (device.platform === 'MacIntel' && device.maxTouchPoints > 1)
  );
}
