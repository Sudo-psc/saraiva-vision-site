import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-slate-100', 'text-slate-700')
    
    rerender(<Button variant="destructive">Destructive</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('applies size styles correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'px-4', 'rounded-lg')
    
    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-14', 'px-10', 'rounded-xl')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })
})