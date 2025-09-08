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

// Classes responsivas padronizadas para widgets (evita inline @media incompatível)
export const POSITION_CLASSES = {
  BOTTOM_RIGHT: 'bottom-20 right-4 sm:bottom-28 sm:right-6',
  BOTTOM_LEFT: 'bottom-20 left-4 sm:bottom-28 sm:left-6',
  // Mantém o botão de acessibilidade acima do WhatsApp
  ACCESSIBILITY: 'bottom-24 left-4 sm:bottom-32 sm:left-6',
  // STICKY_CTA é tratado no próprio componente (precisa de left e right simultâneos)
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

		const zIndexClass = `z-[${WIDGET_LAYERS[layerKey]}]`;
		const positionClass = POSITION_CLASSES[positionKey] || '';

		return {
			zIndexClass,
			positionClass,
			className: `${WIDGET_CLASSES.BASE} ${WIDGET_CLASSES.SMOOTH} ${WIDGET_CLASSES.ISOLATED} widget-${widgetType}`
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
