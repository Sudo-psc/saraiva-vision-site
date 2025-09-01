import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, X } from 'lucide-react';
import { swManager } from '../utils/serviceWorkerManager.js';

export default function ServiceWorkerUpdateNotification() {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [showNotification, setShowNotification] = useState(false);

	useEffect(() => {
		// Listener para updates disponíveis
		swManager.on('updateAvailable', () => {
			setUpdateAvailable(true);
			setShowNotification(true);
		});

		// Listener para quando controller muda (update aplicado)
		swManager.on('controllerChanged', () => {
			setIsUpdating(false);
			// Página será recarregada automaticamente
		});

		return () => {
			// Cleanup seria necessário se tivéssemos método de remove listeners
		};
	}, []);

	const handleUpdate = async () => {
		setIsUpdating(true);
		try {
			await swManager.applyUpdate();
			// Aguarda um pouco e recarrega se não acontecer automaticamente
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		} catch (error) {
			console.error('Erro ao aplicar update:', error);
			setIsUpdating(false);
		}
	};

	const handleDismiss = () => {
		setShowNotification(false);
		// Update ainda está disponível, apenas oculta a notificação
	};

	if (!showNotification || !updateAvailable) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
			<div className="flex items-start space-x-3">
				<div className="flex-shrink-0">
					<Download className="w-5 h-5 text-blue-600" />
				</div>

				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-gray-900 dark:text-white">
						Nova versão disponível
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Uma atualização do site está pronta para ser instalada.
					</p>
				</div>

				<button
					onClick={handleDismiss}
					className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			<div className="mt-3 flex space-x-2">
				<button
					onClick={handleUpdate}
					disabled={isUpdating}
					className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs px-3 py-2 rounded-md transition-colors"
				>
					{isUpdating ? (
						<RefreshCw className="w-3 h-3 animate-spin" />
					) : (
						<Download className="w-3 h-3" />
					)}
					<span>{isUpdating ? 'Atualizando...' : 'Atualizar'}</span>
				</button>

				<button
					onClick={handleDismiss}
					className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md transition-colors"
				>
					Depois
				</button>
			</div>
		</div>
	);
}
