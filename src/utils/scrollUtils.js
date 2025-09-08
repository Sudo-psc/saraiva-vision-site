/**
 * Unified Scroll Utilities
 * Solves double scroll and conflict issues by centralizing scroll behavior
 * Compatible with Framer Motion and modern browsers
 */

/**
 * Robust smooth scroll implementation that prevents conflicts
 * @param {Element|string} target - Element or selector to scroll to
 * @param {Object} options - Scroll options
 */
export const smoothScrollTo = (target, options = {}) => {
	const {
		behavior = 'smooth',
		block = 'start',
		inline = 'nearest',
		offset = 0,
		duration = 800,
		easing = 'easeInOutCubic'
	} = options;

	let element;

	if (typeof target === 'string') {
		element = document.querySelector(target);
	} else {
		element = target;
	}

	if (!element) {
		console.warn('smoothScrollTo: Target element not found:', target);
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		// Cancel any ongoing scroll animations
		if (window.scrollAnimation) {
			cancelAnimationFrame(window.scrollAnimation);
		}

		const startPosition = window.pageYOffset;
		const targetPosition = element.getBoundingClientRect().top + startPosition + offset;
		const distance = targetPosition - startPosition;
		const startTime = performance.now();

		// Easing functions
		const easingFunctions = {
			easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
			easeOutQuart: (t) => 1 - (--t) * t * t * t,
			linear: (t) => t
		};

		const easeFn = easingFunctions[easing] || easingFunctions.easeInOutCubic;

		function scrollStep(currentTime) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const ease = easeFn(progress);

			window.scrollTo(0, startPosition + distance * ease);

			if (progress < 1) {
				window.scrollAnimation = requestAnimationFrame(scrollStep);
			} else {
				window.scrollAnimation = null;
				resolve();
			}
		}

		// Start animation
		window.scrollAnimation = requestAnimationFrame(scrollStep);
	});
};

/**
 * Smooth scroll to hash anchor with conflict prevention
 * @param {string} hash - Hash to scroll to (with or without #)
 * @param {Object} options - Scroll options
 */
export const scrollToHash = (hash, options = {}) => {
	const cleanHash = hash.startsWith('#') ? hash : `#${hash}`;
	const element = document.querySelector(cleanHash);

	if (element) {
		return smoothScrollTo(element, options);
	}

	return Promise.resolve();
};

/**
 * Horizontal scroll for carousels without conflicts
 * @param {Element} container - Container element
 * @param {number} position - Target scroll position
 * @param {Object} options - Scroll options
 */
export const smoothScrollHorizontal = (container, position, options = {}) => {
	const { duration = 600, easing = 'easeOutQuart' } = options;

	if (!container) return Promise.resolve();

	return new Promise((resolve) => {
		// Cancel any ongoing horizontal scroll
		if (container.scrollAnimation) {
			cancelAnimationFrame(container.scrollAnimation);
		}

		const startPosition = container.scrollLeft;
		const distance = position - startPosition;
		const startTime = performance.now();

		const easingFunctions = {
			easeOutQuart: (t) => 1 - (--t) * t * t * t,
			easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
		};

		const easeFn = easingFunctions[easing] || easingFunctions.easeOutQuart;

		function scrollStep(currentTime) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const ease = easeFn(progress);

			container.scrollLeft = startPosition + distance * ease;

			if (progress < 1) {
				container.scrollAnimation = requestAnimationFrame(scrollStep);
			} else {
				container.scrollAnimation = null;
				resolve();
			}
		}

		container.scrollAnimation = requestAnimationFrame(scrollStep);
	});
};

/**
 * Prevent scroll conflicts by cancelling ongoing animations
 */
export const cancelScrollAnimations = () => {
	if (window.scrollAnimation) {
		cancelAnimationFrame(window.scrollAnimation);
		window.scrollAnimation = null;
	}

	// Cancel CSS scroll animations
	document.documentElement.style.scrollBehavior = 'auto';
	setTimeout(() => {
		document.documentElement.style.scrollBehavior = '';
	}, 0);
};

/**
 * Initialize scroll conflict prevention
 */
export const initScrollSystem = () => {
	// Detect if we're on desktop
	const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	// Prevent conflicts with CSS scroll-behavior
	const style = document.createElement('style');
	style.textContent = `
    /* Prevent CSS scroll conflicts */
    html, body, * {
      scroll-behavior: auto !important;
    }

    /* Extra desktop-specific fixes */
    ${isDesktop ? `
      html {
        scroll-behavior: auto !important;
        overscroll-behavior: auto !important;
      }

      body {
        scroll-behavior: auto !important;
        overscroll-behavior: auto !important;
      }

      :root {
        scroll-behavior: auto !important;
      }
    ` : ''}

    /* Allow manual smooth scroll only through JS */
    .smooth-scroll-enabled {
      scroll-behavior: smooth;
    }
  `;
	document.head.appendChild(style);

	// Override native scrollIntoView to prevent conflicts
	const originalScrollIntoView = Element.prototype.scrollIntoView;
	Element.prototype.scrollIntoView = function (options = {}) {
		// Force our custom scroll for any smooth behavior
		if (options === true || options.behavior === 'smooth' || !options.behavior) {
			// Use our smooth scroll instead
			return smoothScrollTo(this, {
				block: options.block || 'start',
				inline: options.inline || 'nearest'
			});
		} else {
			// Use native for instant scrolling
			return originalScrollIntoView.call(this, { ...options, behavior: 'auto' });
		}
	};

	console.log(`🎯 Scroll system initialized for ${isDesktop ? 'desktop' : 'mobile'} - conflicts prevented`);
};

/**
 * Cleanup scroll system on unmount
 */
export const cleanupScrollSystem = () => {
	cancelScrollAnimations();

	// Clean up any scroll listeners
	const containers = document.querySelectorAll('[data-scroll-container]');
	containers.forEach(container => {
		if (container.scrollAnimation) {
			cancelAnimationFrame(container.scrollAnimation);
			container.scrollAnimation = null;
		}
	});
};
