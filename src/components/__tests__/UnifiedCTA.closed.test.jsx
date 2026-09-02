import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UnifiedCTA from '@/components/UnifiedCTA';

describe('UnifiedCTA when clinic is closed', () => {
  it('replaces the hero schedule CTAs with a closed notice', () => {
    render(<UnifiedCTA variant="hero" />);

    expect(screen.getByText(/Clínica encerrada \/ em reforma/i)).toBeInTheDocument();
    expect(screen.getByText(/Sem agenda no momento/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agendar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/99860-1427/)).not.toBeInTheDocument();
  });
});
