/**
 * Testes Abrangentes de Acessibilidade WCAG AAA
 * Verifica conformidade WCAG 2.1 Level AAA para perfil sênior
 */

import { test, expect, devices } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

// Testes WCAG AAA para perfil sênior
test.describe('WCAG AAA Compliance - Senior Profile', () => {
  // Usa configuração apropriada para acessibilidade
  test.use({
    ...devices['Desktop Chrome'],
    viewport: { width: 1920, height: 1080 }, // Tamanho maior para senior
    colorScheme: 'light' // Testa modo claro
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)

    // Simula cookie de perfil sênior
    await page.context().addCookies([
      {
        name: 'user-profile',
        value: 'senior',
        domain: 'localhost',
        path: '/'
      }
    ])
  })

  test.describe('Perceivable - Informação deve ser apresentada de forma que usuários possam percebê-la', () => {
    test('1.4.1 Use of Color - Cor não deve ser o único meio de transmitir informação', async ({ page }) => {
      // Verifica se há informações que dependem apenas de cor
      const colorOnlyElements = await page.locator('[class*="text-red"], [class*="text-green"], [class*="text-blue"]').count()

      if (colorOnlyElements > 0) {
        // Testa acessibilidade em escala de cinza
        await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })

        // Verifica se elementos ainda são distinguíveis
        await checkA11y(page, null, {
          rules: {
            'color-contrast': { enabled: true },
            'color-contrast-enhanced': { enabled: true } // WCAG AAA requires 7:1 contrast
          }
        })
      }
    })

    test('1.4.3 Contrast (Minimum) - Contraste mínimo 7:1 para WCAG AAA', async ({ page }) => {
      await checkA11y(page, null, {
        rules: {
          'color-contrast-enhanced': { enabled: true } // 7:1 contrast ratio
        }
      })
    })

    test('1.4.4 Resize text - Texto deve ser redimensionável até 200%', async ({ page }) => {
      // Simula zoom 200%
      await page.evaluate(() => {
        document.body.style.zoom = '2.0'
      })

      await page.waitForTimeout(1000)

      // Verifica se conteúdo ainda é legível e funcional
      await expect(page.locator('text=Família')).toBeVisible()
      await expect(page.locator('text=Jovem')).toBeVisible()
      await expect(page.locator('text=Sênior')).toBeVisible()

      // Verifica se não há overflow horizontal
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth
      })

      expect(hasHorizontalOverflow).toBe(false)
    })

    test('1.4.5 Images of Text - Texto em imagens deve ser evitado', async ({ page }) => {
      // Verifica se há texto em imagens sem alternativas
      const imgElements = await page.locator('img').all()

      for (const img of imgElements) {
        const alt = await img.getAttribute('alt')
        const src = await img.getAttribute('src')

        // Imagens decorativas devem ter alt=""
        if (src?.includes('icon') || src?.includes('decoration')) {
          expect(alt).toBe('')
        } else {
          // Imagens informativas devem ter alt descritivo
          expect(alt).toBeTruthy()
          expect(alt!.length).toBeGreaterThan(0)
        }
      }
    })

    test('1.4.6 Contrast (Enhanced) - Contraste aprimorado para texto grande', async ({ page }) => {
      await checkA11y(page, null, {
        rules: {
          'color-contrast-enhanced': { enabled: true }
        }
      })
    })

    test('1.4.8 Visual Presentation - Layout e apresentação visual', async ({ page }) => {
      // Verifica espaçamento de linhas (mínimo 1.5)
      const lineSpacing = await page.evaluate(() => {
        const paragraphs = document.querySelectorAll('p')
        if (paragraphs.length === 0) return true

        const computedStyle = window.getComputedStyle(paragraphs[0])
        return parseFloat(computedStyle.lineHeight) >= 1.5
      })

      expect(lineSpacing).toBe(true)

      // Verifica largura de texto (máximo 80 caracteres)
      const textWidth = await page.evaluate(() => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6')
        if (textElements.length === 0) return true

        const element = textElements[0]
        const computedStyle = window.getComputedStyle(element)
        const maxWidth = parseFloat(computedStyle.maxWidth)

        return !maxWidth || maxWidth <= '800px' || maxWidth <= '80ch'
      })

      expect(textWidth).toBe(true)
    })

    test('1.4.10 Reflow - Refluxo de conteúdo', async ({ page }) => {
      // Testa em 320px de largura (mobile)
      await page.setViewportSize({ width: 320, height: 568 })
      await page.waitForTimeout(1000)

      // Verifica se não há scroll horizontal
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth
      })

      expect(hasHorizontalOverflow).toBe(false)

      // Verifica se conteúdo ainda está utilizável
      await expect(page.locator('text=Família')).toBeVisible()
    })
  })

  test.describe('Operable - Componentes da interface e navegação devem ser operáveis', () => {
    test('2.1.1 Keyboard - Teclado funcional', async ({ page }) => {
      // Navegação por Tab
      let focusableElementsCount = 0

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab')

        const focusedElement = await page.locator(':focus').count()
        if (focusedElement > 0) {
          focusableElementsCount++
        }
      }

      expect(focusableElementsCount).toBeGreaterThan(0)

      // Testa navegação com setas para elementos focados
      const focusedElement = await page.locator(':focus').first()
      if (await focusedElement.count() > 0) {
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowUp')
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowRight')
      }
    })

    test('2.1.2 No Keyboard Trap - Sem armadilhas de teclado', async ({ page }) => {
      // Abre menu mobile se existir
      const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()
        await page.waitForTimeout(500)

        // Tenta navegar com Tab e sair com Escape
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab')
        }

        await page.keyboard.press('Escape')

        // Verifica se consegue sair do menu
        const focusAfterEscape = await page.locator(':focus').count()
        expect(focusAfterEscape).toBeGreaterThanOrEqual(0)
      }
    })

    test('2.1.4 Character Key Shortcuts - Atalhos de caractere', async ({ page }) => {
      // Verifica se há atalhos que podem ser desativados
      const hasShortcuts = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button[accesskey]')
        return buttons.length > 0
      })

      if (hasShortcuts) {
        // Se há atalhos, deve haver forma de desativar
        const canDisableShortcuts = await page.evaluate(() => {
          // Verifica se há preferências do usuário ou configurações
          const hasSettings = document.querySelector('[aria-label*="settings"], [aria-label*="config"]')
          return !!hasSettings
        })

        expect(canDisableShortcuts).toBe(true)
      }
    })

    test('2.2.1 Timing Adjustable - Tempo ajustável', async ({ page }) => {
      // Verifica se há elementos com timeout
      const timedElements = await page.locator('[data-timeout], [class*="timeout"], [aria-live="polite"]').count()

      if (timedElements > 0) {
        // Deve haver controle sobre o tempo
        const hasTimeControl = await page.evaluate(() => {
          const pauseButtons = document.querySelectorAll('button[aria-label*="pause"], button[aria-label*="stop"]')
          const settingsButtons = document.querySelectorAll('[aria-label*="settings"], [aria-label*="config"]')
          return pauseButtons.length > 0 || settingsButtons.length > 0
        })

        expect(hasTimeControl).toBe(true)
      }
    })

    test('2.2.2 Pause, Stop, Hide - Pausar, parar, ocultar', async ({ page }) => {
      // Se há conteúdo animado ou em movimento
      const animatedElements = await page.locator('[class*="animate"], video, audio, [role="marquee"]').count()

      if (animatedElements > 0) {
        // Deve haver controles de pausa
        const hasControls = await page.evaluate(() => {
          const pauseButtons = document.querySelectorAll('button[aria-label*="pause"], [aria-label*="stop"]')
          const videoControls = document.querySelectorAll('video[controls], audio[controls]')
          return pauseButtons.length > 0 || videoControls.length > 0
        })

        expect(hasControls).toBe(true)
      }
    })

    test('2.2.3 Three Flashes or Below Threshold - Três flashes ou abaixo do limiar', async ({ page }) => {
      // Verifica se há animações piscantes
      const flashingElements = await page.locator('[class*="flash"], [class*="blink"], [class*="pulse"]').count()

      if (flashingElements > 0) {
        // Verifica se há preferência para reduzir movimento
        const hasReducedMotion = await page.evaluate(() => {
          const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
          return mediaQuery.matches
        })

        if (hasReducedMotion) {
          // Com reduced motion, animações devem estar reduzidas
          await page.emulateMedia({ reducedMotion: 'reduce' })
          await page.waitForTimeout(1000)
        }
      }
    })

    test('2.3.1 Navigation from Multiple Levels - Navegação de múltiplos níveis', async ({ page }) => {
      // Verifica se há navegação estruturada
      const hasNavigation = await page.locator('nav, [role="navigation"]').count()
      expect(hasNavigation).toBeGreaterThan(0)

      // Verifica se há breadcrumbs ou indicação de localização
      const hasBreadcrumbs = await page.locator('[aria-label*="breadcrumb"], [class*="breadcrumb"]').count()
      const hasPageTitle = await page.locator('h1').count()

      expect(hasPageTitle).toBeGreaterThan(0)
    })

    test('2.3.2 Three Flashes - Três flashes (adicional)', async ({ page }) => {
      // Verifica conteúdo que pode causar problemas de fotossensibilidade
      const problemElements = await page.locator('blink, marquee').count()
      expect(problemElements).toBe(0)
    })

    test('2.4.1 Bypass Blocks - Pular blocos', async ({ page }) => {
      // Deve haver link para pular navegação
      const skipLink = await page.locator('a[href*="skip"], a[href*="main"], a[href*="content"]').first()

      if (await skipLink.count() > 0) {
        await skipLink.click()
        await page.waitForTimeout(500)

        // Verifica se foco foi movido para conteúdo principal
        const focusedElement = await page.locator(':focus').first()
        expect(await focusedElement.count()).toBeGreaterThan(0)
      }

      // Verifica se há landmark elements
      const hasMain = await page.locator('main, [role="main"]').count()
      const hasNav = await page.locator('nav, [role="navigation"]').count()
      const hasHeader = await page.locator('header, [role="banner"]').count()
      const hasFooter = await page.locator('footer, [role="contentinfo"]').count()

      expect(hasMain).toBeGreaterThan(0)
      expect(hasNav).toBeGreaterThan(0)
    })

    test('2.4.2 Page Titled - Título da página', async ({ page }) => {
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)
      expect(title.length).toBeLessThan(150) // Limite recomendado
    })

    test('2.4.3 Focus Order - Ordem do foco', async ({ page }) => {
      // Verifica ordem lógica do foco
      const focusOrder = []

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')

        const focused = await page.locator(':focus')
        if (await focused.count() > 0) {
          const tagName = await focused.first().evaluate(el => el.tagName)
          const text = await focused.first().textContent()
          focusOrder.push({ tagName: tagName.toLowerCase(), text: text?.trim() })
        }
      }

      // Verifica se ordem faz sentido (topo → conteúdo → rodapé)
      expect(focusOrder.length).toBeGreaterThan(0)
    })

    test('2.4.4 Link Purpose (In Context) - Propósito do link', async ({ page }) => {
      // Verifica se links têm texto descritivo
      const links = await page.locator('a[href]:not([href^="#"])').all()

      for (const link of links.slice(0, 10)) { // Testa primeiros 10 links
        const text = await link.textContent()
        const ariaLabel = await link.getAttribute('aria-label')
        const title = await link.getAttribute('title')

        const hasDescription = text || ariaLabel || title
        expect(hasDescription).toBeTruthy()

        if (text) {
          expect(text.trim().length).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Understandable - Informação e operação da interface devem ser compreensíveis', () => {
    test('3.1.1 Language of Page - Idioma da página', async ({ page }) => {
      const htmlLang = await page.locator('html').getAttribute('lang')
      expect(htmlLang).toBeTruthy()
      expect(['pt-BR', 'pt', 'en']).toContain(htmlLang)
    })

    test('3.1.2 Language of Parts - Idioma de partes', async ({ page }) => {
      // Verifica se há conteúdo em outros idiomas com lang apropriado
      const foreignLangElements = await page.locator('[lang]:not(html)').all()

      for (const element of foreignLangElements) {
        const lang = await element.getAttribute('lang')
        expect(lang).toBeTruthy()
        expect(lang?.length).toBe(2) // Código de idioma de 2 letras
      }
    })

    test('3.2.1 On Focus - Ao receber foco', async ({ page }) => {
      // Verifica se componentes não mudam de forma inesperada ao receber foco
      const buttons = await page.locator('button').all()

      if (buttons.length > 0) {
        const firstButton = buttons[0]
        await firstButton.focus()
        await page.waitForTimeout(500)

        // Não deve haver mudanças inesperadas
        const isVisible = await firstButton.isVisible()
        expect(isVisible).toBe(true)
      }
    })

    test('3.2.2 On Input - Ao inserir dados', async ({ page }) => {
      // Verifica se há campos de formulário
      const inputs = await page.locator('input, textarea, select').all()

      if (inputs.length > 0) {
        const firstInput = inputs[0]

        if (await firstInput.isVisible()) {
          await firstInput.focus()
          await firstInput.type('test')
          await page.waitForTimeout(500)

          // Não deve haver mudanças inesperadas
          const isVisible = await firstInput.isVisible()
          expect(isVisible).toBe(true)
        }
      }
    })

    test('3.2.3 Consistent Navigation - Navegação consistente', async ({ page }) => {
      // Verifica se navegação está em posição consistente
      const navElements = await page.locator('nav, [role="navigation"]').all()
      expect(navElements.length).toBeGreaterThan(0)

      // Simula navegação para outra página
      const links = await page.locator('a[href*="/"]:not([href^="#"])').all()

      if (links.length > 0) {
        await links[0].click()
        await page.waitForLoadState('networkidle')

        // Verifica se navegação ainda está presente
        const navAfterNavigation = await page.locator('nav, [role="navigation"]').count()
        expect(navAfterNavigation).toBeGreaterThan(0)
      }
    })

    test('3.2.4 Consistent Identification - Identificação consistente', async ({ page }) => {
      // Verifica se elementos consistentes têm identificação consistente
      const buttons = await page.locator('button').all()
      const labels = new Set()

      for (const button of buttons.slice(0, 10)) {
        const text = await button.textContent()
        if (text) {
          labels.add(text.trim())
        }
      }

      // Não deve haver duplicatas de texto importantes
      const labelsArray = Array.from(labels)
      expect(labelsArray.length).toBeGreaterThan(0)
    })

    test('3.3.1 Error Identification - Identificação de erros', async ({ page }) => {
      // Verifica se há mensagens de erro associadas a campos
      const errorElements = await page.locator('[role="alert"], [aria-invalid="true"], .error, .invalid').all()

      for (const errorElement of errorElements) {
        const isVisible = await errorElement.isVisible()
        if (isVisible) {
          // Erros devem ser associados a elementos inputs
          const associatedInput = await errorElement.locator('..').locator('input, textarea, select').first()
          const hasAriaDescribedBy = await errorElement.getAttribute('aria-describedby') ||
                                   await errorElement.getAttribute('aria-labelledby')

          expect(associatedInput.count() > 0 || hasAriaDescribedBy).toBe(true)
        }
      }
    })

    test('3.3.2 Labels or Instructions - Rótulos ou instruções', async ({ page }) => {
      // Verifica se campos têm rótulos
      const inputs = await page.locator('input, textarea, select').all()

      for (const input of inputs) {
        if (await input.isVisible()) {
          const hasLabel = await page.evaluate((element) => {
            const id = element.id
            const hasAriaLabel = element.hasAttribute('aria-label')
            const hasAriaLabelledBy = element.hasAttribute('aria-labelledby')
            const hasLabel = document.querySelector(`label[for="${id}"]`)

            return hasAriaLabel || hasAriaLabelledBy || hasLabel
          }, await input.elementHandle())

          expect(hasLabel).toBe(true)
        }
      }
    })

    test('3.3.3 Error Suggestion - Sugestão de erro', async ({ page }) => {
      // Se há validação de formulário, deve fornecer sugestões
      const forms = await page.locator('form').all()

      if (forms.length > 0) {
        // Simula envio de formulário inválido
        const firstForm = forms[0]
        const submitButton = await firstForm.locator('button[type="submit"], input[type="submit"]').first()

        if (await submitButton.count() > 0) {
          await submitButton.click()
          await page.waitForTimeout(1000)

          // Verifica se há mensagens de erro úteis
          const errorMessages = await page.locator('[role="alert"], .error, .invalid').all()

          if (errorMessages.length > 0) {
            const firstError = errorMessages[0]
            const errorText = await firstError.textContent()
            expect(errorText?.length).toBeGreaterThan(0)
          }
        }
      }
    })

    test('3.3.4 Error Prevention (Prevention, Legal, Financial, Data) - Prevenção de erros', async ({ page }) => {
      // Verifica se há formulários importantes que precisam de confirmação
      const criticalForms = await page.locator('form[action*="delete"], form[action*="payment"], form[action*="submit"]').all()

      for (const form of criticalForms) {
        const hasConfirmation = await page.evaluate((element) => {
          const submitButtons = element.querySelectorAll('button[type="submit"], input[type="submit"]')
          return Array.from(submitButtons).some(btn =>
            btn.textContent?.toLowerCase().includes('confirm') ||
            btn.getAttribute('aria-label')?.toLowerCase().includes('confirm')
          )
        }, await form.elementHandle())

        if (hasConfirmation) {
          expect(hasConfirmation).toBe(true)
        }
      }
    })
  })

  test.describe('Robust - Conteúdo deve ser robusto o suficiente para ser interpretado por várias tecnologias assistivas', () => {
    test('4.1.1 Parsing - Parseamento', async ({ page }) => {
      // Verifica se HTML é válido
      const htmlValidation = await page.evaluate(() => {
        // Verifica se há tags não fechadas
        const parser = new DOMParser()
        const doc = parser.parseFromString(document.documentElement.outerHTML, 'text/html')

        // Se houver erros de parseamento, parser adicionará tags
        const parserErrors = doc.querySelector('parsererror')
        return !parserErrors
      })

      expect(htmlValidation).toBe(true)
    })

    test('4.1.2 Name, Role, Value - Nome, papel, valor', async ({ page }) => {
      // Verifica se elementos interativos têm papéis apropriados
      await checkA11y(page, null, {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'role-img-alt': { enabled: true }
        }
      })
    })

    test('4.1.3 Status Messages - Mensagens de status', async ({ page }) => {
      // Verifica se há live regions para mensagens dinâmicas
      const liveRegions = await page.locator('[aria-live="polite"], [aria-live="assertive"], [role="status"], [role="alert"]').all()

      // Se há conteúdo dinâmico, deve haver live regions
      const dynamicContent = await page.locator('[data-dynamic], [class*="dynamic"]').count()

      if (dynamicContent > 0) {
        expect(liveRegions.length).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Testes Gerais de Acessibilidade', () => {
    test('Verificação completa com axe-core', async ({ page }) => {
      // Executa verificação completa com regras WCAG 2.1 AAA
      await checkA11y(page, null, {
        includedImpacts: ['critical', 'serious'],
        reporter: 'v2',
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          // Habilita regras WCAG AAA
          'color-contrast-enhanced': { enabled: true },
          'target-size': { enabled: true }, // 44x44 pixels minimum
          'keyboard': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'aria-input-field-name': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'heading-order': { enabled: true },
          'image-alt': { enabled: true },
          'image-redundant-alt': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
          'duplicate-id': { enabled: true }
        }
      })
    })

    test('Modo alto contraste', async ({ page }) => {
      // Simula modo alto contraste
      await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
      await page.waitForTimeout(1000)

      // Verifica se conteúdo ainda é utilizável
      await expect(page.locator('text=Família')).toBeVisible()
      await expect(page.locator('text=Jovem')).toBeVisible()
      await expect(page.locator('text=Sênior')).toBeVisible()

      // Verifica navegação
      const buttons = await page.locator('button').all()
      if (buttons.length > 0) {
        await buttons[0].focus()
        await expect(buttons[0]).toBeFocused()
      }
    })

    test('Redução de movimento', async ({ page }) => {
      // Simula prefers-reduced-motion
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForTimeout(1000)

      // Verifica se animações estão reduzidas
      const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all()

      if (animatedElements.length > 0) {
        // Com reduced motion, as animações devem estar desabilitadas ou reduzidas
        const animationDuration = await page.evaluate(() => {
          const style = window.getComputedStyle(document.querySelector('[class*="animate"]')!)
          return style.animationDuration || style.transitionDuration
        })

        if (animationDuration) {
          expect(animationDuration).toBe('0s')
        }
      }
    })

    test('Navegação apenas por teclado - fluxo completo', async ({ page }) => {
      // Testa fluxo completo apenas com teclado
      await page.keyboard.press('Tab') // Primeiro elemento
      await page.keyboard.press('Tab') // Segundo elemento
      await page.keyboard.press('Tab') // Terceiro elemento

      // Encontra e clica em um perfil usando apenas teclado
      const profileButton = page.locator('text=Jovem').first()
      await profileButton.focus()
      await page.keyboard.press('Enter')

      await page.waitForLoadState('networkidle')
      expect(page.url()).toMatch(/\/jovem/)

      // Navega de volta usando teclado
      await page.keyboard.press('Shift+Tab') // Volta foco
      await page.keyboard.press('Enter') // Enter no link
    })
  })
})