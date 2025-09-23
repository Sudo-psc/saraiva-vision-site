import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import AnimationErrorBoundary from '../AnimationErrorBoundary';

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }) => {
    if (shouldThrow) {
        throw new Error('Animation test error');
    }
    return <div>Working component</div>;
};

describe('AnimationErrorBoundary', () => {
    // Suppress console.error for cleaner test output
    const originalError = console.error;
    beforeAll(() => {
        console.error = vi.fn();
    });

    afterAll(() => {
        console.error = originalError;
    });

    it('should render children when no error occurs', () => {
        render(
            <AnimationErrorBoundary>
                <ThrowError shouldThrow={false} />
            </AnimationErrorBoundary>
        );

        expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should render fallback UI when error occurs', () => {
        render(
            <AnimationErrorBoundary>
                <ThrowError shouldThrow={true} />
            </AnimationErrorBoundary>
        );

        expect(screen.getByText(/Animation Error/)).toBeInTheDocument();
        expect(screen.getByText(/Retry Animation/)).toBeInTheDocument();
    });

    it('should call onError callback when error occurs', () => {
        const onError = vi.fn();

        render(
            <AnimationErrorBoundary onError={onError}>
                <ThrowError shouldThrow={true} />
            </AnimationErrorBoundary>
        );

        expect(onError).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                componentStack: expect.any(String)
            })
        );
    });
});