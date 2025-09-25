import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple components
const HomePage = () => (
    <div className="min-h-screen bg-white">
        <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Saraiva Vision</h1>
            <p>Clínica Oftalmológica em Caratinga, MG</p>
        </header>
        <main className="p-8">
            <h2 className="text-xl mb-4">Bem-vindo à Saraiva Vision</h2>
            <p className="mb-4">Dr. Philipe Saraiva Cruz (CRM-MG 69.870)</p>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Nossos Serviços</h3>
                    <ul className="space-y-2">
                        <li>• Consultas Oftalmológicas</li>
                        <li>• Exames de Refração</li>
                        <li>• Lentes de Contato</li>
                        <li>• Tratamentos Especializados</li>
                    </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Contato</h3>
                    <p>📍 Rua Catarina Maria Passos, 97</p>
                    <p>📞 (33) 99860-1427</p>
                    <p>🕒 Seg-Sex: 8h às 18h</p>
                </div>
            </div>
        </main>
    </div>
);

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
}

export default App;