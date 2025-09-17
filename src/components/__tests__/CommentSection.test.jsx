import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CommentSection from '../CommentSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'comments.title': 'Comentários',
        'comments.no_comments': 'Ainda não há comentários',
        'comments.name_label': 'Nome',
        'comments.message_label': 'Comentário',
        'comments.submit': 'Adicionar Comentário'
      }
      return translations[key] || key
    }
  })
}))

beforeEach(() => {
  localStorage.clear()
})

describe('CommentSection', () => {
  it('allows users to add comments', () => {
    render(<CommentSection postSlug="post" />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Comentário'), { target: { value: 'Ótimo post!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Comentário' }))

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Ótimo post!')).toBeInTheDocument()
  })
})
