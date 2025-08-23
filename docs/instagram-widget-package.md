# Pacote Completo: Widget Instagram LightWidget

## Visão Geral

Pacote completo para integração de widget Instagram usando LightWidget, otimizado para performance (Core Web Vitals), acessibilidade e compliance CFM/LGPD.

**Perfil:** [@saraiva_vision](https://www.instagram.com/saraiva_vision/)  
**Provedor:** LightWidget (sem necessidade de token)  
**Configuração:** 9 itens, grid 3×3, lazy loading com IntersectionObserver

---

## 1. HTML Puro

### Bloco Copiável

```html
<!-- Instagram Widget - Saraiva Vision -->
<section class="instagram-widget" id="instagram-section" aria-label="Instagram institucional – Saraiva Vision">
  <div class="container">
    <h2 class="instagram-title">Instagram institucional – Saraiva Vision</h2>
    
    <!-- Container com altura fixa para evitar CLS -->
    <div class="instagram-container" style="min-height: 400px;">
      <!-- Skeleton loading -->
      <div class="instagram-skeleton" id="instagram-skeleton">
        <div class="skeleton-grid">
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
      </div>
      
      <!-- Widget placeholder -->
      <div class="lightwidget-widget" 
           data-username="saraiva_vision"
           data-items="9"
           data-layout="grid"
           data-columns="3"
           data-spacing="8"
           data-border-radius="8"
           data-show-captions="true"
           data-caption-length="120"
           style="display: none;">
      </div>
      
      <!-- Fallback estático -->
      <div class="instagram-fallback" id="instagram-fallback" style="display: none;">
        <div class="fallback-grid">
          <a href="https://www.instagram.com/saraiva_vision/?utm_source=site&utm_medium=widget_instagram&utm_campaign=institucional" 
             target="_blank" rel="noopener noreferrer" class="fallback-item">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNlMTE5ODciIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2MzYzNzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+U2FyYWl2YSBWaXNpb248L3RleHQ+Cjwvc3ZnPgo=" 
                 alt="Publicação do Instagram – Saraiva Vision" loading="lazy" decoding="async">
            <div class="overlay">
              <span>Ver no Instagram</span>
            </div>
          </a>
          <!-- Repetir para 9 itens -->
        </div>
        
        <div class="fallback-cta">
          <a href="https://www.instagram.com/saraiva_vision/?utm_source=site&utm_medium=widget_instagram&utm_campaign=institucional" 
             target="_blank" rel="noopener noreferrer" class="instagram-button">
            📷 Ver no Instagram
          </a>
          <a href="https://wa.me/5533998601427?text=Olá!%20Vi%20o%20Instagram%20de%20vocês%20e%20gostaria%20de%20agendar%20uma%20consulta.&utm_source=site&utm_medium=widget_instagram&utm_campaign=institucional" 
             target="_blank" rel="noopener noreferrer" class="whatsapp-button">
            💬 Agendar consulta
          </a>
        </div>
      </div>
    </div>
    
    <!-- Compliance CFM/LGPD -->
    <p class="compliance-text">
      Conteúdo informativo. Consulte um MÉDICO (CRM-MG 69.870) para avaliação individualizada.
    </p>
  </div>
  
  <!-- Noscript fallback -->
  <noscript>
    <div class="container">
      <p>Para ver nosso feed do Instagram, habilite o JavaScript ou 
         <a href="https://www.instagram.com/saraiva_vision/" target="_blank" rel="noopener noreferrer">visite nosso perfil</a>.
      </p>
    </div>
  </noscript>
</section>

<style>
/* Instagram Widget Styles */
.instagram-widget {
  padding: 4rem 0;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.instagram-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 3rem;
  color: #1e293b;
}

.instagram-container {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  max-width: 800px;
}

/* Skeleton Loading */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.skeleton-item {
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Fallback Grid */
.fallback-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 2rem;
}

.fallback-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  display: block;
}

.fallback-item:hover {
  transform: scale(1.05);
}

.fallback-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.875rem;
}

.fallback-item:hover .overlay {
  opacity: 1;
}

/* CTAs */
.fallback-cta {
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.instagram-button, .whatsapp-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.instagram-button {
  background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  color: white;
}

.whatsapp-button {
  background: #25d366;
  color: white;
}

.instagram-button:hover, .whatsapp-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Compliance */
.compliance-text {
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .instagram-widget {
    padding: 2rem 0;
  }
  
  .instagram-title {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .instagram-container {
    padding: 1rem;
  }
  
  .fallback-cta {
    flex-direction: column;
  }
}
</style>

<script>
// Instagram Widget JavaScript
(function() {
  'use strict';
  
  // Verificar consentimento (adapte conforme seu sistema)
  function hasConsent(type) {
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) return false;
      const parsed = JSON.parse(consent);
      return parsed[type] === true;
    } catch {
      return false;
    }
  }
  
  // Preconnect para domínios do LightWidget
  function addPreconnects() {
    const domains = [
      'https://cdn.lightwidget.com',
      'https://lightwidget.com'
    ];
    
    domains.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
  
  // Carregar LightWidget
  function loadLightWidget() {
    const script = document.createElement('script');
    script.src = 'https://cdn.lightwidget.com/widgets/lightwidget.js';
    script.async = true;
    script.defer = true;
    
    script.onload = function() {
      const skeleton = document.getElementById('instagram-skeleton');
      const widget = document.querySelector('.lightwidget-widget');
      
      if (skeleton) skeleton.style.display = 'none';
      if (widget) widget.style.display = 'block';
      
      // Inicializar LightWidget
      if (window.lightwidget) {
        window.lightwidget.init();
      }
    };
    
    script.onerror = function() {
      console.warn('Instagram widget: Falha ao carregar LightWidget');
      showFallback();
    };
    
    document.head.appendChild(script);
  }
  
  // Mostrar fallback
  function showFallback() {
    const skeleton = document.getElementById('instagram-skeleton');
    const fallback = document.getElementById('instagram-fallback');
    
    if (skeleton) skeleton.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }
  
  // IntersectionObserver para lazy loading
  function initLazyLoading() {
    const section = document.getElementById('instagram-section');
    if (!section) return;
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Verificar consentimento
          if (!hasConsent('marketing')) {
            console.warn('Instagram widget: Consentimento de marketing necessário');
            showFallback();
            return;
          }
          
          addPreconnects();
          
          // Carregar widget após delay para performance
          setTimeout(function() {
            loadLightWidget();
          }, 100);
          
          // Fallback após 3 segundos
          setTimeout(function() {
            const skeleton = document.getElementById('instagram-skeleton');
            if (skeleton && skeleton.style.display !== 'none') {
              showFallback();
            }
          }, 3000);
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(section);
  }
  
  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }
})();
</script>
```

---

## 2. Componente Next.js/React

### InstagramWidget.tsx (ou .jsx)

O componente completo está no arquivo `src/components/InstagramWidget.jsx`.

### Uso do Componente

```jsx
import InstagramWidget from '@/components/InstagramWidget';

// Em HomePage.jsx ou qualquer página
function HomePage() {
  return (
    <div>
      {/* ... outros componentes ... */}
      
      <InstagramWidget 
        title="Nosso Instagram"
        profileUrl="https://www.instagram.com/saraiva_vision/"
        items={9}
        columnsMobile={3}
        columnsDesktop={3}
        showTitle={true}
        showCompliance={true}
      />
      
      {/* ... outros componentes ... */}
    </div>
  );
}
```

### Props do Componente

- `title`: Título da seção (opcional)
- `provider`: Provedor do widget (padrão: 'LightWidget')
- `profileUrl`: URL do perfil Instagram
- `items`: Número de posts a exibir (padrão: 9)
- `columnsMobile`: Colunas no mobile (padrão: 3)
- `columnsDesktop`: Colunas no desktop (padrão: 3)
- `className`: Classes CSS adicionais
- `showTitle`: Mostrar título (padrão: true)
- `showCompliance`: Mostrar aviso de compliance (padrão: true)

---

## 3. WordPress (Shortcode)

### functions.php

```php
<?php
// Instagram Widget Shortcode
function saraiva_instagram_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'provider' => 'LightWidget',
        'profile' => 'https://www.instagram.com/saraiva_vision/',
        'items' => '9',
        'columns_mobile' => '3',
        'columns_desktop' => '3',
        'show_title' => 'true',
        'title' => 'Instagram institucional – Saraiva Vision'
    ), $atts);
    
    // Enfileirar scripts apenas quando shortcode é usado
    wp_enqueue_script('saraiva-instagram-widget', get_template_directory_uri() . '/js/instagram-widget.js', array(), '1.0.0', true);
    wp_enqueue_style('saraiva-instagram-widget', get_template_directory_uri() . '/css/instagram-widget.css', array(), '1.0.0');
    
    ob_start();
    
    $utm_params = 'utm_source=site&utm_medium=widget_instagram&utm_campaign=institucional';
    $profile_url = $atts['profile'] . '?' . $utm_params;
    $whatsapp_url = 'https://wa.me/5533998601427?text=' . urlencode('Olá! Vi o Instagram de vocês e gostaria de agendar uma consulta.') . '&' . $utm_params;
    
    ?>
    <section class="instagram-widget" id="instagram-section-<?php echo uniqid(); ?>" aria-label="<?php echo esc_attr($atts['title']); ?>">
        <div class="container">
            <?php if ($atts['show_title'] === 'true'): ?>
                <h2 class="instagram-title"><?php echo esc_html($atts['title']); ?></h2>
            <?php endif; ?>
            
            <div class="instagram-container" style="min-height: 400px;">
                <!-- Skeleton loading -->
                <div class="instagram-skeleton" id="instagram-skeleton">
                    <div class="skeleton-grid">
                        <?php for ($i = 0; $i < intval($atts['items']); $i++): ?>
                            <div class="skeleton-item"></div>
                        <?php endfor; ?>
                    </div>
                </div>
                
                <!-- Widget placeholder -->
                <div class="lightwidget-widget" 
                     data-username="saraiva_vision"
                     data-items="<?php echo esc_attr($atts['items']); ?>"
                     data-layout="grid"
                     data-columns="<?php echo esc_attr($atts['columns_desktop']); ?>"
                     data-spacing="8"
                     data-border-radius="8"
                     data-show-captions="true"
                     data-caption-length="120"
                     style="display: none;">
                </div>
                
                <!-- Fallback estático -->
                <div class="instagram-fallback" style="display: none;">
                    <div class="fallback-grid">
                        <?php for ($i = 0; $i < intval($atts['items']); $i++): ?>
                            <a href="<?php echo esc_url($profile_url); ?>" 
                               target="_blank" rel="noopener noreferrer" class="fallback-item">
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNlMTE5ODciIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2MzYzNzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+U2FyYWl2YSBWaXNpb248L3RleHQ+Cjwvc3ZnPgo=" 
                                     alt="Publicação do Instagram – <?php echo date('d/m/Y'); ?>" loading="lazy" decoding="async">
                                <div class="overlay">
                                    <span>Ver no Instagram</span>
                                </div>
                            </a>
                        <?php endfor; ?>
                    </div>
                    
                    <div class="fallback-cta">
                        <a href="<?php echo esc_url($profile_url); ?>" 
                           target="_blank" rel="noopener noreferrer" class="instagram-button">
                            📷 Ver no Instagram
                        </a>
                        <a href="<?php echo esc_url($whatsapp_url); ?>" 
                           target="_blank" rel="noopener noreferrer" class="whatsapp-button">
                            💬 Agendar consulta
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Compliance CFM/LGPD -->
            <p class="compliance-text">
                Conteúdo informativo. Consulte um MÉDICO (CRM-MG 69.870) para avaliação individualizada.
            </p>
        </div>
        
        <!-- Noscript fallback -->
        <noscript>
            <div class="container">
                <p>Para ver nosso feed do Instagram, habilite o JavaScript ou 
                   <a href="<?php echo esc_url($atts['profile']); ?>" target="_blank" rel="noopener noreferrer">visite nosso perfil</a>.
                </p>
            </div>
        </noscript>
    </section>
    <?php
    
    return ob_get_clean();
}
add_shortcode('instagram_widget', 'saraiva_instagram_widget_shortcode');

// JavaScript inline para configuração específica
function saraiva_instagram_widget_init() {
    if (is_admin()) return;
    
    ?>
    <script>
    // Configuração específica do WordPress
    window.saraivaInstagramConfig = {
        checkConsent: function(type) {
            // Adapte conforme seu plugin de cookies
            // Exemplo: return window.cookieConsent && window.cookieConsent[type];
            return true; // Por padrão, permitir (ajuste conforme necessário)
        }
    };
    </script>
    <?php
}
add_action('wp_head', 'saraiva_instagram_widget_init');
?>
```

### Uso do Shortcode

```
[instagram_widget provider="LightWidget" profile="https://www.instagram.com/saraiva_vision/" items="9"]
```

---

## 4. CSP (Content Security Policy)

### Domínios a Liberar

```
script-src 'self' 'unsafe-inline' https://cdn.lightwidget.com;
style-src 'self' 'unsafe-inline' https://cdn.lightwidget.com;
frame-src 'self' https://lightwidget.com https://*.lightwidget.com;
connect-src 'self' https://lightwidget.com https://cdn.lightwidget.com;
img-src 'self' data: https: https://lightwidget.com https://cdn.lightwidget.com https://scontent.cdninstagram.com;
```

---

## 5. Integração com Banner de Consentimento

### Exemplo de Função hasConsent()

```javascript
// Para banner de cookies personalizado
function hasConsent(type) {
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed[type] === true;
  } catch {
    return false;
  }
}

// Para CookieBot
function hasConsent(type) {
  if (typeof Cookiebot === 'undefined') return false;
  return Cookiebot.consent[type];
}

// Para Google Consent Mode
function hasConsent(type) {
  if (typeof gtag === 'undefined') return false;
  // Adapte conforme sua implementação
  return window.dataLayer && window.dataLayer.find(item => 
    item.event === 'consent' && item.ad_storage === 'granted'
  );
}
```

---

## 6. Instruções de Teste

### Verificar Lazy Loading

1. Abra DevTools (F12)
2. Vá para Network tab
3. Filtre por "lightwidget"
4. Recarregue a página
5. Role até o widget estar visível
6. Verifique se o script só carrega quando visível

### Verificar Consentimento

1. Limpe localStorage
2. Recarregue a página
3. Widget deve mostrar fallback se não houver consentimento
4. Aceite cookies de marketing
5. Widget deve carregar normalmente

### Verificar Fallback

1. Bloqueie domínio `lightwidget.com` no DevTools
2. Recarregue a página
3. Widget deve mostrar fallback estático
4. Links devem funcionar normalmente

---

## 7. Notas de Implementação

### Performance
- ✅ Lazy loading com IntersectionObserver
- ✅ Container com altura fixa (evita CLS)
- ✅ Preconnect para domínios externos
- ✅ Scripts carregados apenas quando necessário
- ✅ Fallback em 3 segundos

### Acessibilidade
- ✅ aria-label no container
- ✅ Alt text descritivo nas imagens
- ✅ Navegação por teclado
- ✅ Foco visível
- ✅ Noscript fallback

### Compliance
- ✅ Verificação de consentimento LGPD
- ✅ Aviso CFM discreto
- ✅ Links com rel="noopener noreferrer"
- ✅ UTMs padronizadas
- ✅ Sem exposição de tokens

### SEO
- ✅ Não renderiza iframe fora do viewport
- ✅ Fallback indexável
- ✅ Links para perfil Instagram
- ✅ Structured data implícito

### Observabilidade
- ✅ Console.warn em caso de bloqueio
- ✅ Fallback automático
- ✅ Tratamento de erros

---

## 8. Próximos Passos

1. **Implementar no projeto atual:**
   - Adicionar `<InstagramWidget />` na HomePage
   - Configurar sistema de consentimento
   - Testar em diferentes dispositivos

2. **Monitoramento:**
   - Configurar Google Analytics para UTMs
   - Monitorar Core Web Vitals
   - Acompanhar taxa de cliques

3. **Otimizações futuras:**
   - Implementar cache de imagens
   - A/B test de posicionamento
   - Integração com pixel do Instagram

---

**Desenvolvido por:** Codebuff  
**Versão:** 1.0.0  
**Compatibilidade:** HTML5, React 16+, WordPress 5.0+  
**Licença:** Conforme projeto Saraiva Vision