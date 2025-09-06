/**
 * Sistema Centralizado de Gerenciamento de Widgets Flutuantes
 * Previne conflitos de z-index e posicionamento entre widgets
 */

// Z-index layers centralizados
export const WIDGET_LAYERS = {
	BASE: 50,
	WHATSAPP: 80,
	ACCESSIBILITY: 90,
	CONSENT: 95,
	MODAL: 100,
	TOAST: 110
};

// Posições padronizadas para widgets
export const WIDGET_POSITIONS = {
	BOTTOM_RIGHT: {
		bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))', // 20px + safe-area
		right: '1rem',     // 16px
		'@media (min-width: 640px)': {
			bottom: 'calc(1.75rem + env(safe-area-inset-bottom, 0px))', // 28px + safe-area
			right: '1.5rem'    // 24px
		}
	},
	BOTTOM_LEFT: {
		bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
		left: '1rem',
		'@media (min-width: 640px)': {
			bottom: 'calc(1.75rem + env(safe-area-inset-bottom, 0px))',
			left: '1.5rem'
		}
	},
	ACCESSIBILITY: {
		bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',     // Above WhatsApp
		left: '1rem',
		'@media (min-width: 640px)': {
			bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
			left: '1.5rem'
		}
	},
	STICKY_CTA: {
		bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
		left: '1rem',
		right: '1rem',
		'@media (min-width: 768px)': {
			left: 'auto',
			right: '1rem',
			maxWidth: '24rem'
		}
	}
};

// Classes CSS para widgets
export const WIDGET_CLASSES = {
	BASE: 'fixed pointer-events-auto',
	SMOOTH: 'transition-transform duration-200 ease-out',
	ISOLATED: 'isolation-isolate',
	GPU_OPTIMIZED: 'transform-gpu will-change-transform backface-visibility-hidden'
};

/**
 * Hook para gerenciar posicionamento e z-index de widgets
 */
export const useWidgetManager = () => {
	const getWidgetProps = (widgetType) => {
		const typeMap = {
			'whatsapp': 'WHATSAPP',
			'accessibility': 'ACCESSIBILITY',
			'sticky_cta': 'BASE',
			'consent': 'CONSENT'
		};

		const layerKey = typeMap[widgetType] || 'BASE';
		const positionKey = widgetType === 'whatsapp' ? 'BOTTOM_RIGHT' :
			widgetType === 'accessibility' ? 'ACCESSIBILITY' :
				widgetType === 'sticky_cta' ? 'STICKY_CTA' : 'BOTTOM_RIGHT';

		return {
			zIndex: WIDGET_LAYERS[layerKey],
			position: WIDGET_POSITIONS[positionKey],
			className: `${WIDGET_CLASSES.BASE} ${WIDGET_CLASSES.SMOOTH} ${WIDGET_CLASSES.ISOLATED}`
		};
	};

	return { getWidgetProps };
};

/**
 * Componente Provider para contexto de widgets
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const WidgetContext = createContext({});

export const useWidgetContext = () => useContext(WidgetContext);

export const WidgetProvider = ({ children }) => {
	const [activeWidgets, setActiveWidgets] = useState(new Set());
	const [widgetStates, setWidgetStates] = useState({});

	const registerWidget = useCallback((widgetId, config) => {
		setActiveWidgets(prev => new Set([...prev, widgetId]));
		setWidgetStates(prev => ({
			...prev,
			[widgetId]: config
		}));
	}, []);

	const unregisterWidget = useCallback((widgetId) => {
		setActiveWidgets(prev => {
			const newSet = new Set(prev);
			newSet.delete(widgetId);
			return newSet;
		});
		setWidgetStates(prev => {
			const newState = { ...prev };
			delete newState[widgetId];
			return newState;
		});
	}, []);

	const updateWidgetState = useCallback((widgetId, state) => {
		setWidgetStates(prev => ({
			...prev,
			[widgetId]: { ...prev[widgetId], ...state }
		}));
	}, []);

	return (
		<WidgetContext.Provider value={{
			activeWidgets,
			widgetStates,
			registerWidget,
			unregisterWidget,
			updateWidgetState
		}}>
			{children}
		</WidgetContext.Provider>
	);
};
