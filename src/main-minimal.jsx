import React from 'react';
import ReactDOM from 'react-dom/client';

// Versão mínima para debug
function MinimalApp() {
    return (
        <div style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f0f0f0',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#333' }}>🏥 Clínica Saraiva Vision</h1>
            <p style={{ color: '#666' }}>Site funcionando - Versão de Debug</p>
            <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <h2>Status do Sistema:</h2>
                <ul>
                    <li>✅ React carregado</li>
                    <li>✅ DOM renderizado</li>
                    <li>✅ Estilos aplicados</li>
                </ul>
            </div>
        </div>
    );
}

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
    document.body.innerHTML = '<h1>Erro: Elemento root não encontrado</h1>';
} else {
    const root = ReactDOM.createRoot(rootElement);

    try {
        root.render(<MinimalApp />);
        console.log('✅ App mínima renderizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao renderizar app mínima:', error);
        document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial;">
        <h1>Erro de Renderização</h1>
        <p>Erro: ${error.message}</p>
        <button onclick="window.location.reload()">Recarregar</button>
      </div>
    `;
    }
}