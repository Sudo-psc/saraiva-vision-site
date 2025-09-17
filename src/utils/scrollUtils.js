/**
 * Scroll Utils Normalizado - Conforme Especificações
 * Sistema que permite scroll nativo fluido sem interferências globais
 */

/**
 * Implementação de smooth scroll que coopera com scroll nativo
 * @param {Element|string} target - Element or selector to scroll to
 * @param {Object} options - Scroll options
 */
export const smoothScrollTo = (target, options = {}) => {
	const {
		behavior = 'smooth',
		block = 'start',
		inline = 'nearest',
		offset = 0
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

	// USA SCROLL NATIVO - mais fluido e sem interferências
	const targetPosition = element.getBoundingClientRect().top + window.pageYOffset + offset;

	window.scrollTo({
		top: targetPosition,
		behavior: behavior
	});

	return Promise.resolve();
};

/**
 * Smooth scroll to hash anchor - usa scroll nativo
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
 * Horizontal scroll para carrosséis - SEM interferir no scroll global
 * @param {Element} container - Container element
 * @param {number} position - Target scroll position
 * @param {Object} options - Scroll options
 */
export const smoothScrollHorizontal = (container, position, options = {}) => {
	if (!container) return Promise.resolve();

	// USA SCROLL NATIVO HORIZONTAL - mais eficiente
	container.scrollTo({
		left: position,
		behavior: 'smooth'
	});

	return Promise.resolve();
};

/**
 * REMOVIDO: Sistema de prevenção que interferia no scroll
 * Agora usa scroll nativo sem interferências
 */
export const cancelScrollAnimations = () => {
	// Função mantida para compatibilidade mas não faz nada
	// O scroll nativo se gerencia sozinho
};

/**
 * Sistema simplificado - permite scroll nativo
 */
export const initScrollSystem = () => {
	// Sistema minimalista que não interfere no scroll nativo
	console.log('🎯 Scroll system: Using native browser scrolling');
};

/**
 * Cleanup simplificado
 */
export const cleanupScrollSystem = () => {
	// Cleanup minimalista - o browser gerencia o scroll nativo
};
