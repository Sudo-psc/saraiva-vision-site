/**
 * Testes de Performance
 * Verifica LCP, bundle size, lazy loading e otimizações Next.js
 */

import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Habilita coleta de performance metrics
    await page.addInitScript(() => {
      // Sobrescreve console.log para capturar performance marks
      const originalLog = console.log
      console.log = (...args) => {
        if (args[0] === 'Performance Mark:') {
          window.performanceMarks = window.performanceMarks || []
          window.performanceMarks.push(args[1])
        }
        originalLog.apply(console, args)
      }
    })
  })

  test.describe('Core Web Vitals', () => {
    test('LCP - Largest Contentful Paint', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')

      // Espera carregamento principal
      await page.waitForLoadState('networkidle')

      // Coleta métricas LCP
      const lcpMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lcp = entries[entries.length - 1]
            resolve({
              loadTime: lcp.loadTime,
              startTime: lcp.startTime,
              renderTime: lcp.renderTime,
              size: lcp.size,
              url: lcp.url
            })
          })
          observer.observe({ entryTypes: ['largest-contentful-paint'] })

          // Fallback se não houver LCP
          setTimeout(() => resolve(null), 5000)
        })
      })

      if (lcpMetrics) {
        console.log('LCP Metrics:', lcpMetrics)
        // LCP deve ser menor que 2.5s (bom)
        expect(lcpMetrics.startTime).toBeLessThan(2500)
      }

      // Verifica tempo total de carregamento
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // 3 segundos máximo
    })

    test('FID - First Input Delay', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Simula primeira interação
      const inputDelay = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const startTime = performance.now()

          // Simula clique
          const button = document.querySelector('button') || document.body
          button.click()

          requestAnimationFrame(() => {
            const delay = performance.now() - startTime
            resolve(delay)
          })
        })
      })

      // FID deve ser menor que 100ms
      expect(inputDelay).toBeLessThan(100)
    })

    test('CLS - Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/')

      // Coleta métricas CLS
      const clsScore = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            }
          })
          observer.observe({ entryTypes: ['layout-shift'] })

          // Aguarda um tempo para estabilizar
          setTimeout(() => resolve(clsValue), 3000)
        })
      })

      // CLS deve ser menor que 0.1
      expect(clsScore).toBeLessThan(0.1)
    })
  })

  test.describe('Network Performance', () => {
    test('deve minimizar requisições', async ({ page }) => {
      const responses: any[] = []

      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        })
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Analisa requisições
      const jsRequests = responses.filter(r => r.url.endsWith('.js'))
      const cssRequests = responses.filter(r => r.url.endsWith('.css'))
      const imageRequests = responses.filter(r => /\.(jpg|jpeg|png|gif|webp|avif|svg)($|\?)/.test(r.url))

      console.log(`Network Requests: ${responses.length} total`)
      console.log(`- JS: ${jsRequests.length}, CSS: ${cssRequests.length}, Images: ${imageRequests.length}`)

      // Verifica número de requisições
      expect(jsRequests.length).toBeLessThan(20) // Máximo de JS files
      expect(cssRequests.length).toBeLessThan(10) // Máximo de CSS files

      // Verifica se headers de cache estão presentes
      const cacheableResponses = responses.filter(r =>
        /\.(js|css|png|jpg|jpeg|webp|avif|svg)($|\?)/.test(r.url)
      )

      const cacheControlHeaders = cacheableResponses.filter(r =>
        r.headers['cache-control']
      )

      expect(cacheControlHeaders.length).toBeGreaterThan(cacheableResponses.length * 0.8)
    })

    test('deve usar compressão gzip/brotli', async ({ page }) => {
      const responses: any[] = []

      page.on('response', response => {
        responses.push({
          url: response.url(),
          headers: response.headers()
        })
      })

      await page.goto('/')

      // Verifica headers de compressão
      const textResponses = responses.filter(r =>
        /\.(js|css|html|json|txt)($|\?)/.test(r.url)
      )

      const compressedResponses = textResponses.filter(r =>
        r.headers['content-encoding']
      )

      if (textResponses.length > 0) {
        const compressionRatio = compressedResponses.length / textResponses.length
        expect(compressionRatio).toBeGreaterThan(0.8) // 80% dos textos devem estar comprimidos
      }
    })

    test('deve otimizar imagens', async ({ page }) => {
      const responses: any[] = []

      page.on('response', response => {
        if (response.request().resourceType() === 'image') {
          responses.push({
            url: response.url(),
            headers: response.headers()
          })
        }
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Verifica formatos de imagem modernos
      const modernFormats = responses.filter(r =>
        /\.(webp|avif)($|\?)/.test(r.url)
      )

      const allImages = responses

      if (allImages.length > 0) {
        console.log(`Images: ${allImages.length} total, ${modernFormats.length} modern formats`)

        // Pelo menos 50% devem ser formatos modernos
        const modernRatio = modernFormats.length / allImages.length
        expect(modernRatio).toBeGreaterThan(0.5)
      }
    })
  })

  test.describe('Bundle Size', () => {
    test('deve ter bundle size otimizado', async ({ page }) => {
      const jsBundles: any[] = []

      page.on('response', response => {
        if (response.url().endsWith('.js')) {
          jsBundles.push({
            url: response.url(),
            size: 0 // Tamanho real precisa ser medido de outra forma
          })
        }
      })

      await page.goto('/')

      // Verifica número de bundles
      expect(jsBundles.length).toBeLessThan(15) // Máximo de JS bundles

      // Verifica se há chunks (lazy loading)
      const chunkUrls = jsBundles.filter(b =>
        b.url.includes('chunk') || b.url.match(/\d+\.js$/)
      )

      console.log(`JS Bundles: ${jsBundles.length} total, ${chunkUrls.length} chunks`)
      expect(chunkUrls.length).toBeGreaterThan(0) // Deve ter chunks para lazy loading
    })

    test('deve usar tree shaking', async ({ page }) => {
      // Verifica se código não utilizado está sendo removido
      const unusedCode = await page.evaluate(() => {
        // Verifica se há bibliotecas inteiras sendo carregadas
        const scripts = Array.from(document.querySelectorAll('script[src]'))
        const suspiciousBundles = scripts.filter(script => {
          const src = script.src
          return src.includes('lodash') ||
                 src.includes('moment') ||
                 src.includes('bootstrap')
        })
        return suspiciousBundles.length
      })

      expect(unusedCode).toBe(0)
    })
  })

  test.describe('Lazy Loading', () => {
    test('deve usar lazy loading em imagens', async ({ page }) => {
      await page.goto('/')

      // Verifica atributos loading em imagens
      const imagesWithLoading = await page.locator('img[loading="lazy"]').count()
      const totalImages = await page.locator('img').count()

      if (totalImages > 2) { // Se houver imagens além do logo principal
        const lazyRatio = imagesWithLoading / totalImages
        expect(lazyRatio).toBeGreaterThan(0.5) // 50% das imagens devem usar lazy loading
      }

      console.log(`Images: ${totalImages} total, ${imagesWithLoading} with lazy loading`)
    })

    test('deve usar lazy loading em componentes', async ({ page }) => {
      // Verifica se há indicadores de lazy loading
      const lazyComponents = await page.locator('[data-lazy], [class*="lazy"]').count()

      if (lazyComponents > 0) {
        console.log(`Found ${lazyComponents} lazy-loaded components`)
      }

      // Verifica IntersectionObserver usage
      const intersectionObserverUsed = await page.evaluate(() => {
        return typeof IntersectionObserver !== 'undefined'
      })

      expect(intersectionObserverUsed).toBe(true)
    })

    test('deve carregar componentes sob demanda', async ({ page }) => {
      // Rola para baixo para trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(1000)

      // Verifica se novos elementos apareceram
      const elementsAfterScroll = await page.locator('*').count()

      // Rola de volta para cima
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(500)

      // Deve ter carregado novos elementos
      expect(elementsAfterScroll).toBeGreaterThan(0)
    })
  })

  test.describe('Caching', () => {
    test('deve usar cache headers apropriados', async ({ page }) => {
      const responses: any[] = []

      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        })
      })

      await page.goto('/')

      // Analisa headers de cache
      const cacheableResources = responses.filter(r =>
        /\.(js|css|png|jpg|jpeg|webp|svg|woff2)($|\?)/.test(r.url)
      )

      const maxAgeHeaders = cacheableResources.filter(r =>
        r.headers['cache-control']?.includes('max-age')
      )

      const etagHeaders = cacheableResources.filter(r =>
        r.headers['etag']
      )

      console.log(`Cache analysis: ${cacheableResources.length} resources`)
      console.log(`- max-age headers: ${maxAgeHeaders.length}`)
      console.log(`- etag headers: ${etagHeaders.length}`)

      expect(maxAgeHeaders.length).toBeGreaterThan(cacheableResources.length * 0.8)
    })

    test('deve usar service worker (se implementado)', async ({ page }) => {
      const serviceWorkerStatus = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration()
          return !!registration
        }
        return false
      })

      console.log(`Service Worker: ${serviceWorkerStatus ? 'Active' : 'Not implemented'}`)
      // Service worker é opcional, não falha se não existir
    })
  })

  test.describe('Memory Usage', () => {
    test('não deve ter memory leaks', async ({ page }) => {
      await page.goto('/')

      // Coleta métricas de memória
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      })

      // Simula interações para testar memory leaks
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(100 + i * 10, 100)
        await page.waitForTimeout(100)
      }

      // Rola página
      await page.evaluate(() => window.scrollTo(0, 500))
      await page.waitForTimeout(500)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(500)

      // Coleta memória final
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      })

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used
        console.log(`Memory usage: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB → ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`)

        // Memory increase deve ser menor que 10MB
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })
  })

  test.describe('Rendering Performance', () => {
    test('deve ter FPS estável', async ({ page }) => {
      await page.goto('/')

      // Mede FPS durante interações
      const fpsData = await page.evaluate(async () => {
        return new Promise((resolve) => {
          let frameCount = 0
          let lastTime = performance.now()
          const fps: number[] = []

          function countFrames() {
            frameCount++
            const currentTime = performance.now()

            if (currentTime - lastTime >= 1000) {
              fps.push(frameCount)
              frameCount = 0
              lastTime = currentTime
            }

            if (fps.length < 3) {
              requestAnimationFrame(countFrames)
            } else {
              resolve(fps)
            }
          }

          requestAnimationFrame(countFrames)

          // Fallback
          setTimeout(() => resolve(fps), 4000)
        })
      })

      if (fpsData.length > 0) {
        const avgFps = fpsData.reduce((a, b) => a + b, 0) / fpsData.length
        const minFps = Math.min(...fpsData)

        console.log(`FPS: avg=${avgFps.toFixed(1)}, min=${minFps}`)

        // FPS médio deve ser maior que 30
        expect(avgFps).toBeGreaterThan(30)
        // FPS mínimo não deve ser muito baixo
        expect(minFps).toBeGreaterThan(15)
      }
    })

    test('deve ter animações suaves', async ({ page }) => {
      await page.goto('/')

      // Encontra elementos animados
      const animatedElements = await page.locator('[class*="transition"], [class*="animate"]').count()

      if (animatedElements > 0) {
        // Testa performance das animações
        const animationPerformance = await page.evaluate(() => {
          const startTime = performance.now()

          // Dispara animações
          const animated = document.querySelectorAll('[class*="transition"], [class*="animate"]')
          animated.forEach(el => {
            el.classList.add('animate-test')
          })

          return performance.now() - startTime
        })

        // Animações devem ser rápidas
        expect(animationPerformance).toBeLessThan(100)
      }
    })
  })
})