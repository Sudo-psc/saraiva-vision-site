// Scroll telemetry utility for development diagnostics
// This is a stub implementation to prevent build failures

let preventDefaultCalls = 0;
let wheelBlocked = 0;
let touchBlocked = 0;
let scrollBlocked = 0;
let startTime = Date.now();

export const getScrollMetrics = () => {
  const uptimeMs = Date.now() - startTime;

  return {
    preventDefaultCalls,
    wheelBlocked,
    touchBlocked,
    scrollBlocked,
    avgPreventDefaultPerMinute: Math.round((preventDefaultCalls / (uptimeMs / 60000)) * 100) / 100,
    uptimeMs
  };
};

// Stub functions for scroll event monitoring
export const trackPreventDefault = () => {
  preventDefaultCalls++;
};

export const trackWheelBlocked = () => {
  wheelBlocked++;
};

export const trackTouchBlocked = () => {
  touchBlocked++;
};

export const trackScrollBlocked = () => {
  scrollBlocked++;
};