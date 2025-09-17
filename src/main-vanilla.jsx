// Teste básico sem React para verificar se JavaScript está executando
console.log('🔍 main-vanilla.jsx carregado!');

// Testar se consegue manipular DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM carregado');
  const root = document.getElementById('root');
  if (root) {
    console.log('✅ Elemento root encontrado');
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif; background: #f8fafc;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px;">
          <h1 style="color: #1e293b; margin-bottom: 1rem; font-size: 2rem;">🎯 JavaScript Funcionando!</h1>
          <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 1.5rem;">
            Esta mensagem confirma que o JavaScript está executando corretamente.
          </p>
          <div style="padding: 1rem; background: #dcfce7; border-radius: 0.5rem; color: #166534; margin-bottom: 1rem;">
            <strong>✅ Status: DOM Manipulation OK</strong>
          </div>
          <div style="padding: 1rem; background: #dbeafe; border-radius: 0.5rem; color: #1d4ed8;">
            <strong>🔍 Testando Vanilla JavaScript</strong>
          </div>
          <button onclick="alert('JavaScript eventos funcionando!')" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
            Testar Evento
          </button>
        </div>
      </div>
    `;
    console.log('✅ HTML inserido no root');
  } else {
    console.error('❌ Elemento root não encontrado');
  }
});

// Teste adicional: aguardar um pouco e verificar
setTimeout(() => {
  console.log('⏱️ Timeout executado - JavaScript está ativo');
}, 1000);