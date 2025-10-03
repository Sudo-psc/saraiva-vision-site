/**
 * Testes para o componente ProfileSelector
 * Verifica funcionalidade, acessibilidade e renderização
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileSelector from '@/components/ProfileSelector'

// Mock do Next.js Link
vi.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock do Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref) => (
      <div ref={ref} {...props}>{children}</div>
    ))
  }
}))

describe('ProfileSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza os três perfis disponíveis', () => {
    render(<ProfileSelector />)

    // Verifica se os três perfis são renderizados
    expect(screen.getByText('Família')).toBeInTheDocument()
    expect(screen.getByText('Jovem')).toBeInTheDocument()
    expect(screen.getByText('Sênior')).toBeInTheDocument()
  })

  it('exibe descrições corretas para cada perfil', () => {
    render(<ProfileSelector />)

    expect(screen.getByText('Cuidado oftalmológico completo para todas as idades')).toBeInTheDocument()
    expect(screen.getByText('Tecnologia de ponta e estilo para sua visão')).toBeInTheDocument()
    expect(screen.getByText('Atendimento especializado com acessibilidade')).toBeInTheDocument()
  })

  it('renderiza features específicas de cada perfil', () => {
    render(<ProfileSelector />)

    // Features Família
    expect(screen.getByText('Atendimento pediátrico')).toBeInTheDocument()
    expect(screen.getByText('Exames preventivos')).toBeInTheDocument()
    expect(screen.getByText('Cuidado com idosos')).toBeInTheDocument()
    expect(screen.getByText('Acompanhamento familiar')).toBeInTheDocument()

    // Features Jovem
    expect(screen.getByText('Lentes de contato premium')).toBeInTheDocument()
    expect(screen.getByText('Cirurgia refrativa')).toBeInTheDocument()
    expect(screen.getByText('Tecnologia avançada')).toBeInTheDocument()
    expect(screen.getByText('Assinatura de lentes')).toBeInTheDocument()

    // Features Sênior
    expect(screen.getByText('Cirurgia de catarata')).toBeInTheDocument()
    expect(screen.getByText('Tratamento de glaucoma')).toBeInTheDocument()
    expect(screen.getByText('Acessibilidade total')).toBeInTheDocument()
    expect(screen.getByText('Cuidados geriátricos')).toBeInTheDocument()
  })

  it('possui links corretos para cada perfil', () => {
    render(<ProfileSelector />)

    const familiarLink = screen.getByText('Família').closest('a')
    const jovemLink = screen.getByText('Jovem').closest('a')
    const seniorLink = screen.getByText('Sênior').closest('a')

    expect(familiarLink).toHaveAttribute('href', '/familiar')
    expect(jovemLink).toHaveAttribute('href', '/jovem')
    expect(seniorLink).toHaveAttribute('href', '/senior')
  })

  it('exibe informações de emergência', () => {
    render(<ProfileSelector />)

    expect(screen.getByText('Emergência Oftalmológica')).toBeInTheDocument()
    expect(screen.getByText('Para casos urgentes, ligue: (33) 9 9999-9999')).toBeInTheDocument()
    expect(screen.getByText('Atendimento 24h')).toBeInTheDocument()
  })

  it('exibe aviso de acessibilidade', () => {
    render(<ProfileSelector />)

    expect(screen.getByText('Acessibilidade')).toBeInTheDocument()
    expect(screen.getByText('Perfil Sênior disponível com interface adaptada para melhor experiência')).toBeInTheDocument()
  })

  it('possui badges de informações em cada perfil', () => {
    render(<ProfileSelector />)

    // Verifica se todos os perfis têm os badges informativos
    const badges24h = screen.getAllByText('24h')
    const badgesEspecialista = screen.getAllByText('Especialista')
    const badgesCFM = screen.getAllByText('CFM')

    expect(badges24h).toHaveLength(3)
    expect(badgesEspecialista).toHaveLength(3)
    expect(badgesCFM).toHaveLength(3)
  })

  it('tem botão de acesso em cada perfil', () => {
    render(<ProfileSelector />)

    const accessButtons = screen.getAllByText('Acessar')
    expect(accessButtons).toHaveLength(3)
  })

  it('estrutura semântica e acessibilidade', () => {
    const { container } = render(<ProfileSelector />)

    // Verifica se há estrutura de grid responsiva
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('md:grid-cols-3')

    // Verifica se os cards têm estrutura adequada
    const profileCards = container.querySelectorAll('.group')
    expect(profileCards).toHaveLength(3)
  })

  it('testa interação hover nos cards', async () => {
    const { container } = render(<ProfileSelector />)

    const profileCards = container.querySelectorAll('.group')
    const firstCard = profileCards[0]

    // Simula hover
    fireEvent.mouseEnter(firstCard)

    await waitFor(() => {
      // Verifica se elementos com animação hover aparecem
      const arrowIcons = firstCard.querySelectorAll('.opacity-0')
      expect(arrowIcons.length).toBeGreaterThan(0)
    })
  })

  it('renderiza ícones corretamente', () => {
    render(<ProfileSelector />)

    // Verifica se os ícones são renderizados (representados por SVGs)
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('cores e gradientes aplicados corretamente', () => {
    const { container } = render(<ProfileSelector />)

    // Verifica se os gradientes são aplicados
    const gradientElements = container.querySelectorAll('[class*="bg-gradient-to-r"]')
    expect(gradientElements.length).toBe(3) // Um para cada perfil

    // Verifica cores específicas
    expect(container.querySelector('.from-blue-500')).toBeInTheDocument()
    expect(container.querySelector('.from-purple-500')).toBeInTheDocument()
    expect(container.querySelector('.from-green-500')).toBeInTheDocument()
  })

  it('informações de contato e emergência têm destaque correto', () => {
    const { container } = render(<ProfileSelector />)

    // Verifica seção de emergência
    const emergencySection = container.querySelector('.bg-red-50')
    expect(emergencySection).toBeInTheDocument()

    // Verifica seção de acessibilidade
    const accessibilitySection = container.querySelector('.bg-blue-50')
    expect(accessibilitySection).toBeInTheDocument()
  })

  it('testa responsividade da estrutura', () => {
    const { container } = render(<ProfileSelector />)

    const gridContainer = container.querySelector('.grid')

    // Verifica classes de responsividade
    expect(gridContainer).toHaveClass('gap-8')
    expect(gridContainer).toHaveClass('max-w-6xl')
    expect(gridContainer).toHaveClass('mx-auto')

    // Verifica se as seções de informação ocupam 3 colunas em desktop
    const infoSections = container.querySelectorAll('.md\\:col-span-3')
    expect(infoSections.length).toBe(2) // Emergência e acessibilidade
  })
})