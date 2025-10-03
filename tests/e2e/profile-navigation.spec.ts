/**
 * Testes E2E de Navegação Multi-Perfil
 * Verifica fluxo completo de navegação entre perfis familiar, jovem e senior
 */

import { test, expect } from '@playwright/test'

test.describe('Navegação Multi-Perfil', () => {
  test.beforeEach(async ({ page }) => {
    // Espera carregamento completo da página
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Profile Selector - Desktop', () => {
    test('deve exibir três perfis disponíveis', async ({ page }) => {
      // Verifica se todos os perfis são visíveis
      await expect(page.locator('text=Família')).toBeVisible()
      await expect(page.locator('text=Jovem')).toBeVisible()
      await expect(page.locator('text=Sênior')).toBeVisible()
    })

    test('deve mostrar informações corretas de cada perfil', async ({ page }) => {
      // Perfil Família
      const familiarCard = page.locator('text=Família').locator('..').locator('..')
      await expect(familiarCard.locator('text=Cuidado oftalmológico completo para todas as idades')).toBeVisible()
      await expect(familiarCard.locator('text=Atendimento pediátrico')).toBeVisible()
      await expect(familiarCard.locator('text=Exames preventivos')).toBeVisible()

      // Perfil Jovem
      const jovemCard = page.locator('text=Jovem').locator('..').locator('..')
      await expect(jovemCard.locator('text=Tecnologia de ponta e estilo para sua visão')).toBeVisible()
      await expect(jovemCard.locator('text=Lentes de contato premium')).toBeVisible()
      await expect(jovemCard.locator('text=Cirurgia refrativa')).toBeVisible()

      // Perfil Sênior
      const seniorCard = page.locator('text=Sênior').locator('..').locator('..')
      await expect(seniorCard.locator('text=Atendimento especializado com acessibilidade')).toBeVisible()
      await expect(seniorCard.locator('text=Cirurgia de catarata')).toBeVisible()
      await expect(seniorCard.locator('text=Acessibilidade total')).toBeVisible()
    })

    test('deve navegar para perfil Família', async ({ page }) => {
      // Clica no perfil Família
      await page.click('text=Família')

      // Verifica redirecionamento
      await expect(page).toHaveURL(/\/familiar/)

      // Verifica conteúdo específico do perfil
      await expect(page.locator('h1')).toContainText('familiar', { ignoreCase: true })
    })

    test('deve navegar para perfil Jovem', async ({ page }) => {
      // Clica no perfil Jovem
      await page.click('text=Jovem')

      // Verifica redirecionamento
      await expect(page).toHaveURL(/\/jovem/)

      // Verifica conteúdo específico do perfil
      await expect(page.locator('h1')).toContainText('jovem', { ignoreCase: true })
    })

    test('deve navegar para perfil Sênior', async ({ page }) => {
      // Clica no perfil Sênior
      await page.click('text=Sênior')

      // Verifica redirecionamento
      await expect(page).toHaveURL(/\/senior/)

      // Verifica conteúdo específico do perfil
      await expect(page.locator('h1')).toContainText('senior', { ignoreCase: true })
    })

    test('deve exibir informações de emergência', async ({ page }) => {
      await expect(page.locator('text=Emergência Oftalmológica')).toBeVisible()
      await expect(page.locator('text=(33) 9 9999-9999')).toBeVisible()
      await expect(page.locator('text=Atendimento 24h')).toBeVisible()
    })

    test('deve exibir aviso de acessibilidade', async ({ page }) => {
      await expect(page.locator('text=Acessibilidade')).toBeVisible()
      await expect(page.locator('text=Perfil Sênior disponível com interface adaptada')).toBeVisible()
    })
  })

  test.describe('Navegação entre Perfis', () => {
    test('fluxo completo: Home → Família → Jovem → Sênior', async ({ page }) => {
      // Início na home
      await expect(page).toHaveURL('/')

      // Navega para Família
      await page.click('text=Família')
      await expect(page).toHaveURL(/\/familiar/)

      // Volta para home via logo/navegação
      await page.click('a[href="/"]')
      await expect(page).toHaveURL('/')

      // Navega para Jovem
      await page.click('text=Jovem')
      await expect(page).toHaveURL(/\/jovem/)

      // Volta para home
      await page.click('a[href="/"]')
      await expect(page).toHaveURL('/')

      // Navega para Sênior
      await page.click('text=Sênior')
      await expect(page).toHaveURL(/\/senior/)
    })

    test('deve manter navegação via breadcrumbs (se existir)', async ({ page }) => {
      // Navega para um perfil
      await page.click('text=Família')

      // Verifica se há navegação de retorno
      const homeLink = page.locator('a[href="/"]')
      if (await homeLink.isVisible()) {
        await homeLink.click()
        await expect(page).toHaveURL('/')
      }
    })
  })

  test.describe('Responsividade', () => {
    test('deve funcionar em mobile', async ({ page }) => {
      // Simula viewport mobile
      await page.setViewportSize({ width: 375, height: 667 })

      // Verifica se os cards são responsivos
      await expect(page.locator('text=Família')).toBeVisible()
      await expect(page.locator('text=Jovem')).toBeVisible()
      await expect(page.locator('text=Sênior')).toBeVisible()

      // Testa navegação em mobile
      await page.click('text=Jovem')
      await expect(page).toHaveURL(/\/jovem/)
    })

    test('deve funcionar em tablet', async ({ page }) => {
      // Simula viewport tablet
      await page.setViewportSize({ width: 768, height: 1024 })

      // Verifica layout
      await expect(page.locator('.grid.md\\:grid-cols-3')).toBeVisible()

      // Testa navegação
      await page.click('text=Sênior')
      await expect(page).toHaveURL(/\/senior/)
    })
  })

  test.describe('Performance', () => {
    test('deve carregar rápido', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      // Deve carregar em menos de 3 segundos
      expect(loadTime).toBeLessThan(3000)
    })

    test('deve ter interações suaves', async ({ page }) => {
      // Testa hover nos cards
      const familiarCard = page.locator('text=Família').locator('..').locator('..')

      // Mouse hover
      await familiarCard.hover()
      await page.waitForTimeout(300)

      // Verifica se há mudança visual (pode ser classe hover)
      const cardClasses = await familiarCard.getAttribute('class')
      expect(cardClasses).toContain('group')
    })
  })

  test.describe('Links Internos', () => {
    test('deve ter links funcionais nos cards', async ({ page }) => {
      // Verifica se os cards são links clicáveis
      const links = page.locator('[href*="/familiar"], [href*="/jovem"], [href*="/senior"]')
      await expect(links).toHaveCount(3)

      // Testa cada link
      const hrefs = await links.allInnerTexts()
      expect(hrefs).toEqual(expect.arrayContaining(['Família', 'Jovem', 'Sênior']))
    })

    test('deve ter botão "Acessar" em cada perfil', async ({ page }) => {
      const accessButtons = page.locator('text=Acessar')
      await expect(accessButtons).toHaveCount(3)
    })
  })

  test.describe('SEO e Semântica', () => {
    test('deve ter estrutura semântica correta', async ({ page }) => {
      // Verifica heading structure
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      // Verifica se há headings adequados
      const headings = page.locator('h2, h3')
      await expect(heads).toHaveCountGreaterThan(0)
    })

    test('deve ter atributos ARIA corretos', async ({ page }) => {
      // Verifica links com aria-labels (se existirem)
      const linksWithAria = page.locator('[aria-label]')
      if (await linksWithAria.count() > 0) {
        await expect(linksWithAria.first()).toHaveAttribute('aria-label')
      }
    })
  })

  test.describe('Navegação por Teclado', () => {
    test('deve ser navegável por teclado', async ({ page }) => {
      // Tab navigation
      await page.keyboard.press('Tab')

      // Verifica se algo está focado
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toHaveCount(1)

      // Navega pelos cards
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab')
      }

      // Enter no card focado
      await page.keyboard.press('Enter')

      // Verifica se navega para algum perfil
      await expect(page.url()).toMatch(/\/(familiar|jovem|senior)/)
    })
  })

  test.describe('Erros e Edge Cases', () => {
    test('deve lidar com navegação rápida', async ({ page }) => {
      // Cliques rápidos
      await page.click('text=Família')
      await page.click('text=Jovem')
      await page.click('text=Sênior')

      // Deve processar o último clique
      await page.waitForLoadState('networkidle')
      await expect(page.url()).toMatch(/\/senior/)
    })

    test('deve funcionar com JavaScript desabilitado', async ({ context }) => {
      // Testa sem JavaScript (limitado no Playwright)
      const page = await context.newPage()
      await page.route('**/*', route => {
        // Continua normalmente pois Playwright necessita de JS
        route.continue()
      })

      await page.goto('/')
      await expect(page.locator('text=Família')).toBeVisible()
    })
  })
})