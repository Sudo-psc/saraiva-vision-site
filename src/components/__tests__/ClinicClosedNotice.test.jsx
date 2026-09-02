import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ClinicClosedNotice from '@/components/ClinicClosedNotice';

describe('ClinicClosedNotice', () => {
  it('renders the closed clinic message without schedule CTAs', () => {
    render(<ClinicClosedNotice variant="hero" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Clínica encerrada \/ em reforma/i)).toBeInTheDocument();
    expect(screen.getByText(/Sem agenda no momento/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /agendar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/99860-1427/)).not.toBeInTheDocument();
  });

  it('links to the author site for books, not appointments', () => {
    render(<ClinicClosedNotice variant="page" />);

    const authorLink = screen.getByRole('link', { name: /Livros e textos do Dr. Philipe Saraiva/i });
    expect(authorLink).toHaveAttribute('href', 'https://drphilipesaraiva.com.br');
    expect(screen.getByText(/não é agenda médica/i)).toBeInTheDocument();
    expect(screen.getByText(/RQE 71.903/)).toBeInTheDocument();
    expect(screen.getByText(/CRM-MG 69.870/)).toBeInTheDocument();
  });
});
