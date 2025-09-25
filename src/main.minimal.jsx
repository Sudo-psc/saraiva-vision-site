import React from 'react';
import ReactDOM from 'react-dom/client';

// Componente mínimo para teste
function MinimalApp() {
  return (
    <div>
      <h1>Teste Mínimo</h1>
      <p>Se você está vendo isso, o build básico funciona.</p>
    </div>
  );
}

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(<MinimalApp />);