let motionCache = null;
let animatePresenceCache = null;

export const loadMotion = async () => {
  if (!motionCache) {
    const module = await import('framer-motion');
    motionCache = module.motion;
  }
  return motionCache;
};

export const loadAnimatePresence = async () => {
  if (!animatePresenceCache) {
    const module = await import('framer-motion');
    animatePresenceCache = module.AnimatePresence;
  }
  return animatePresenceCache;
};

export const loadFramerMotion = async () => {
  if (!motionCache || !animatePresenceCache) {
    const module = await import('framer-motion');
    motionCache = module.motion;
    animatePresenceCache = module.AnimatePresence;
  }
  return { motion: motionCache, AnimatePresence: animatePresenceCache };
};

export const preloadFramerMotion = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('framer-motion');
    });
  } else {
    setTimeout(() => {
      import('framer-motion');
    }, 1000);
  }
};
