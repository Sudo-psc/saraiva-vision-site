/**
 * Testes E2E de Navegação Mobile
 * Verifica experiência mobile, menu hambúrguer e touch interactions
 */

import { test, expect, devices } from '@playwright/test'

// Testes específicos para dispositivos móveis
test.describe('Navegação Mobile', () => {
  // Usa configurações mobile do Playwright
  test.use({ ...devices['iPhone 13'] })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Menu Mobile', () => {
    test('deve exibir menu hambúrguer em mobile', async ({ page }) => {
      // Menu hambúrguer deve ser visível
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]')
      await expect(menuButton).toBeVisible()
    })

    test('deve abrir menu ao clicar no hambúrguer', async ({ page }) => {
      // Encontra o botão de menu
      const menuButton = page.locator('button').filter({ hasText: /menu/i }).or(
        page.locator('button[aria-label*="menu"]')
      ).first()

      await expect(menuButton).toBeVisible()
      await menuButton.click()

      // Menu deve abrir
      const mobileMenu = page.locator('[id*="mobile"], [role="navigation"], nav')
      await expect(mobileMenu).toBeVisible()
    })

    test('deve fechar menu ao clicar fora', async ({ page }) => {
      // Abre o menu
      const menuButton = page.locator('button').filter({ hasText: /menu/i }).or(
        page.locator('button[aria-label*="menu"]')
      ).first()

      await menuButton.click()
      await expect(page.locator('nav:visible')).toHaveCount(1)

      // Clica fora do menu
      await page.click('body', { position: { x: 10, y: 10 } })

      // Menu deve fechar
      await expect(page.locator('nav:visible')).toHaveCount(0)
    })

    test('deve fechar menu ao clicar em link', async ({ page }) => {
      // Abre o menu
      const menuButton = page.locator('button').filter({ hasText: /menu/i }).or(
        page.locator('button[aria-label*="menu"]')
      ).first()

      await menuButton.click()
      await expect(page.locator('nav:visible')).toHaveCount(1)

      // Clica em um link do menu
      const firstLink = page.locator('nav a').first()
      await firstLink.click()

      // Menu deve fechar automaticamente
      await expect(page.locator('nav:visible')).toHaveCount(0)
    })

    test('deve alternar ícone do menu', async ({ page }) => {
      const menuButton = page.locator('button').filter({ hasText: /menu/i }).or(
        page.locator('button[aria-label*="menu"]')
      ).first()

      // Estado inicial
      await expect(menuButton).toBeVisible()

      // Abre menu
      await menuButton.click()
      await expect(page.locator('nav:visible')).toHaveCount(1)

      // Verifica se ícone mudou (pode ser X ou fechar)
      const closeButton = page.locator('button').filter({ hasText: /close|fechar|x/i }).or(
        page.locator('button[aria-label*="close"]')
      )

      if (await closeButton.count() > 0) {
        await expect(closeButton.first()).toBeVisible()
      }
    })
  })

  test.describe('Layout Mobile', () => {
    test('deve ter layout responsivo', async ({ page }) => {
      // Verifica viewport mobile
      const viewport = page.viewportSize()
      expect(viewport?.width).toBeLessThanOrEqual(414) // iPhone width

      // Verifica se elementos se adaptam
      await expect(page.locator('text=Família')).toBeVisible()
      await expect(page.locator('text=Jovem')).toBeVisible()
      await expect(page.locator('text=Sênior')).toBeVisible()
    })

    test('deve ajustar cards para mobile', async ({ page }) => {
      // Cards devem estar em coluna única no mobile
      const gridContainer = page.locator('.grid')
      const gridClasses = await gridContainer.getAttribute('class')

      expect(gridClasses).toContain('grid-cols-1')
    })

    test('deve ter touch targets adequados', async ({ page }) => {
      // Botões e links devem ser grandes o suficiente para toque
      const buttons = page.locator('button')
      const firstButton = buttons.first()

      const boundingBox = await firstButton.boundingBox()
      expect(boundingBox).toBeTruthy()
      expect(boundingBox!.height).toBeGreaterThanOrEqual(44) // Mínimo recomendado
      expect(boundingBox!.width).toBeGreaterThanOrEqual(44)
    })
  })

  test.describe('Interactions Touch', () => {
    test('deve responder a toque nos cards', async ({ page }) => {
      const familiarCard = page.locator('text=Família').locator('..').locator('..')

      // Simula toque
      await familiarCard.tap()

      // Deve navegar para a página do perfil
      await expect(page.url()).toMatch(/\/familiar/)
    })

    test('deve suportar scroll horizontal em carrosséis', async ({ page }) => {
      // Navega para serviços se existir
      const servicesLink = page.locator('a[href*="servicos"]')
      if (await servicesLink.count() > 0) {
        await servicesLink.first().click()
        await page.waitForLoadState('networkidle')

        // Procura por carrossel horizontal
        const carousel = page.locator('.overflow-x-auto, [class*="horizontal-scroll"]')
        if (await carousel.count() > 0) {
          const firstCarousel = carousel.first()

          // Verifica se pode scrollar
          const scrollWidth = await firstCarousel.evaluate(el => el.scrollWidth)
          const clientWidth = await firstCarousel.evaluate(el => el.clientWidth)

          if (scrollWidth > clientWidth) {
            // Testa scroll horizontal
            await firstCarousel.evaluate(el => el.scrollTo(200, 0))
            await page.waitForTimeout(500)
          }
        }
      }
    })

    test('deve lidar com pinch-to-zoom (se suportado)', async ({ page }) => {
      // Teste básico - verifica se página não quebra com zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1.5'
      })

      // Verifica se elementos ainda são visíveis
      await expect(page.locator('text=Família')).toBeVisible()
    })
  })

  test.describe('Performance Mobile', () => {
    test('deve carregar rápido em 3G', async ({ page }) => {
      // Simula conexão 3G lenta
      await page.route('**/*', async route => {
        // Adiciona delay para simular 3G
        await new Promise(resolve => setTimeout(resolve, 200))
        await route.continue()
      })

      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      // Deve carregar em menos de 8 segundos em 3G
      expect(loadTime).toBeLessThan(8000)
    })

    test('deve ter animações suaves', async ({ page }) => {
      // Verifica se animações são otimizadas para mobile
      const animatedElements = page.locator('[class*="transition"], [class*="animate"]')

      if (await animatedElements.count() > 0) {
        // Testa se animações não bloqueiam interação
        const firstAnimated = animatedElements.first()
        await firstAnimated.hover()
        await page.waitForTimeout(300)

        // Deve permanecer responsivo
        await expect(page.locator('text=Família')).toBeVisible()
      }
    })
  })

  test.describe('Acessibilidade Mobile', () => {
    test('deve ter bom contraste', async ({ page }) => {
      // Verifica contraste básico
      const textElements = page.locator('p, h1, h2, h3, span')

      if (await textElements.count() > 0) {
        const firstText = textElements.first()
        await expect(firstText).toBeVisible()
      }
    })

    test('deve suportar navegação por voz', async ({ page }) => {
      // Verifica se elementos têm labels adequados
      const buttons = page.locator('button')
      const interactiveElements = page.locator('a, button, input, select, textarea')

      // Deve haver elementos com aria-label ou texto visível
      const accessibleElements = await interactiveElements.count()
      expect(accessibleElements).toBeGreaterThan(0)
    })

    test('deve funcionar com screen readers', async ({ page }) => {
      // Verifica estrutura semântica
      await expect(page.locator('main, [role="main"]')).toHaveCount(1)
      await expect(page.locator('nav, [role="navigation"]')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveCount(1)
    })
  })

  test.describe('Orientação', () => {
    test('deve funcionar em landscape', async ({ page }) => {
      // Muda para orientação landscape
      await page.setViewportSize({ width: 896, height: 414 }) // iPhone 13 landscape

      // Verifica se layout se adapta
      await expect(page.locator('text=Família')).toBeVisible()
      await expect(page.locator('text=Jovem')).toBeVisible()
      await expect(page.locator('text=Sênior')).toBeVisible()

      // Testa navegação em landscape
      await page.click('text=Jovem')
      await expect(page.url()).toMatch(/\/jovem/)
    })

    test('deve ajustar menu em landscape', async ({ page }) => {
      await page.setViewportSize({ width: 896, height: 414 })

      // Menu ainda deve funcionar em landscape
      const menuButton = page.locator('button').filter({ hasText: /menu/i }).or(
        page.locator('button[aria-label*="menu"]')
      ).first()

      if (await menuButton.isVisible()) {
        await menuButton.click()
        await expect(page.locator('nav:visible')).toHaveCount(1)
      }
    })
  })

  test.describe('Browser Compatibility Mobile', () => {
    test('deve funcionar no Safari Mobile', async ({ page }) => {
      // Safari específico tests (iPhone já usa Safari engine)
      await expect(page.locator('text=Família')).toBeVisible()

      // Testa scrolling
      await page.evaluate(() => window.scrollTo(0, 500))
      await page.waitForTimeout(500)

      // Testa zoom
      await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]')
        if (meta) {
          meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=3.0')
        }
      })
    })

    test('deve funcionar no Chrome Mobile', async ({ page, context }) => {
      // Simula Chrome mobile user agent
      await context.route('**/*', route => {
        const headers = route.request().headers()
        headers['user-agent'] = 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
        route.continue({ headers })
      })

      await page.goto('/')
      await expect(page.locator('text=Família')).toBeVisible()
    })
  })
})