import React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import EnhancedFooter from '../EnhancedFooter';

describe('EnhancedFooter', () => {
  it('renders without crashing when schedule is not provided', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <EnhancedFooter />
      </I18nextProvider>
    );
    // If the component renders without crashing, the test passes.
  });

  it('renders with schedule data', () => {
    const schedule = {
      weekdays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      open: '08:00',
      close: '18:00',
    };

    render(
      <I18nextProvider i18n={i18n}>
        <EnhancedFooter schedule={schedule} />
      </I18nextProvider>
    );

    // Check if the weekdays are rendered
    expect(screen.getByText('Segunda')).toBeInTheDocument();
    expect(screen.getByText('Terça')).toBeInTheDocument();
    expect(screen.getByText('Quarta')).toBeInTheDocument();
    expect(screen.getByText('Quinta')).toBeInTheDocument();
    expect(screen.getByText('Sexta')).toBeInTheDocument();
  });
});
