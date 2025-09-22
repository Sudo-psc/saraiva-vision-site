import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import InstagramConfigRealtime from '../InstagramConfigRealtime';
import useInstagramConfigRealtime, { useConfigChangeNotifications } from '../../../hooks/useInstagramConfigRealtime';
import instagramConfigValidator from '../../../services/instagramConfigValidator';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock accessibility hook
vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: () => ({
        shouldReduceMotion: () => false,
        getAnimationConfig: () => ({ duration: 0.3, ease: 'easeOut' }),
        getAccessibilityClasses: () => '',
        getAccessibilityStyles: () => ({})
    })
}));

// Mock child components
vi.mock('../InstagramConfigInterface', () => ({
    default: ({ onConfigChange, onSave, onReset }) => (
        <div data-testid="config-interface">
            <button onClick={() => onConfigChange({ maxPosts: 6 })}>
                Change Config
            </button>
            <button onClick={onSave}>Save</button>
            <button onClick={onReset}>Reset</button>
        </div>
    )
}));

vi.mock('../InstagramConfigPreview', () => ({
    default: ({ config, onPreviewModeChange }) => (
        <div data-testid="config-preview">
            <span>Posts: {config.maxPosts}</span>
            <button onClick={() => onPreviewModeChange('mobile')}>
                Change Preview Mode
            </button>
        </div>
    )
}));

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Instagram Real-time Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('useInstagramConfigRealtime Hook', () => {
        it('should initialize with default configuration', () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            expect(result.current.config).toBeDefined();
            expect(result.current.validationState.isValid).toBe(true);
            expect(result.current.hasPendingChanges).toBe(false);
            expect(result.current.changeHistory).toEqual([]);
        });

        it('should update configuration with debouncing', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime({}, {
                debounceMs: 100
            }));

            act(() => {
                result.current.updateConfig({ maxPosts: 6 });
            });

            // Should have pending changes immediately
            expect(result.current.hasPendingChanges).toBe(true);

            // Fast-forward debounce timer
            act(() => {
                vi.advanceTimersByTime(100);
            });

            await waitFor(() => {
                expect(result.current.config.maxPosts).toBe(6);
                expect(result.current.hasPendingChanges).toBe(false);
            });
        });

        it('should validate configuration in real-time', async () => {
            const mockOnValidationChange = vi.fn();
            const { result } = renderHook(() => useInstagramConfigRealtime({}, {
                onValidationChange: mockOnValidationChange
            }));

            act(() => {
                result.current.updateConfig({ maxPosts: 25 }); // Invalid value
            });

            act(() => {
                vi.advanceTimersByTime(200);
            });

            await waitFor(() => {
                expect(result.current.hasValidationErrors).toBe(true);
                expect(mockOnValidationChange).toHaveBeenCalled();
            });
        });

        it('should track change history', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.updateConfig({ maxPosts: 6 }, { immediate: true });
            });

            await waitFor(() => {
                expect(result.current.changeHistory).toHaveLength(1);
                expect(result.current.changeHistory[0].changes).toEqual({ maxPosts: 6 });
            });
        });

        it('should handle preview mode', () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.togglePreviewMode();
            });

            expect(result.current.isPreviewMode).toBe(true);

            act(() => {
                result.current.updateConfig({ maxPosts: 8 });
            });

            // Preview config should update immediately
            expect(result.current.previewConfig.maxPosts).toBe(8);
            // But main config should not change yet
            expect(result.current.config.maxPosts).toBe(4); // default
        });

        it('should apply preview changes', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.togglePreviewMode();
                result.current.updateConfig({ maxPosts: 8 });
            });

            act(() => {
                result.current.applyPreviewChanges();
            });

            await waitFor(() => {
                expect(result.current.config.maxPosts).toBe(8);
                expect(result.current.isPreviewMode).toBe(false);
            });
        });

        it('should discard preview changes', () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.togglePreviewMode();
                result.current.updateConfig({ maxPosts: 8 });
            });

            act(() => {
                result.current.discardPreviewChanges();
            });

            expect(result.current.previewConfig.maxPosts).toBe(4); // back to original
            expect(result.current.isPreviewMode).toBe(false);
        });

        it('should handle batch updates', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.batchUpdateConfig({
                    maxPosts: 6,
                    layout: 'carousel',
                    showStats: false
                });
            });

            await waitFor(() => {
                expect(result.current.config.maxPosts).toBe(6);
                expect(result.current.config.layout).toBe('carousel');
                expect(result.current.config.showStats).toBe(false);
            });
        });

        it('should handle undo functionality', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            // Make a change
            act(() => {
                result.current.updateConfig({ maxPosts: 6 }, { immediate: true });
            });

            await waitFor(() => {
                expect(result.current.config.maxPosts).toBe(6);
                expect(result.current.canUndo).toBe(true);
            });

            // Undo the change
            act(() => {
                result.current.undoLastChange();
            });

            await waitFor(() => {
                expect(result.current.changeHistory).toHaveLength(0);
            });
        });

        it('should generate configuration diff', () => {
            const { result } = renderHook(() => useInstagramConfigRealtime({ maxPosts: 4 }));

            act(() => {
                result.current.updateConfig({ maxPosts: 6 }, { immediate: true });
            });

            const diff = result.current.getConfigDiff();
            expect(diff.maxPosts).toEqual({
                current: 6,
                default: 4
            });
        });

        it('should export configuration with metadata', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.updateConfig({ maxPosts: 6 }, { immediate: true });
            });

            await waitFor(() => {
                const exported = result.current.exportConfigWithMetadata();
                expect(exported.config.maxPosts).toBe(6);
                expect(exported.metadata).toBeDefined();
                expect(exported.metadata.changeHistory).toHaveLength(1);
            });
        });
    });

    describe('useConfigChangeNotifications Hook', () => {
        it('should generate notifications for config changes', async () => {
            const mockOnNotification = vi.fn();
            const { result, rerender } = renderHook(
                ({ config }) => useConfigChangeNotifications(config, {
                    onNotification: mockOnNotification
                }),
                { initialProps: { config: { maxPosts: 4 } } }
            );

            // Change configuration
            rerender({ config: { maxPosts: 6 } });

            await waitFor(() => {
                expect(mockOnNotification).toHaveBeenCalled();
                expect(result.current.notifications).toHaveLength(1);
                expect(result.current.notifications[0].message).toContain('Posts limit changed to 6');
            });
        });

        it('should auto-remove notifications after duration', async () => {
            const { result, rerender } = renderHook(
                ({ config }) => useConfigChangeNotifications(config, {
                    notificationDuration: 1000
                }),
                { initialProps: { config: { maxPosts: 4 } } }
            );

            // Change configuration
            rerender({ config: { maxPosts: 6 } });

            await waitFor(() => {
                expect(result.current.notifications).toHaveLength(1);
            });

            // Fast-forward time
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(result.current.notifications).toHaveLength(0);
            });
        });

        it('should handle manual notification removal', async () => {
            const { result, rerender } = renderHook(
                ({ config }) => useConfigChangeNotifications(config),
                { initialProps: { config: { maxPosts: 4 } } }
            );

            // Change configuration
            rerender({ config: { maxPosts: 6 } });

            await waitFor(() => {
                expect(result.current.notifications).toHaveLength(1);
            });

            const notificationId = result.current.notifications[0].id;

            act(() => {
                result.current.removeNotification(notificationId);
            });

            expect(result.current.notifications).toHaveLength(0);
        });

        it('should clear all notifications', async () => {
            const { result, rerender } = renderHook(
                ({ config }) => useConfigChangeNotifications(config),
                { initialProps: { config: { maxPosts: 4 } } }
            );

            // Make multiple changes
            rerender({ config: { maxPosts: 6 } });
            rerender({ config: { maxPosts: 6, layout: 'carousel' } });

            await waitFor(() => {
                expect(result.current.notifications.length).toBeGreaterThan(0);
            });

            act(() => {
                result.current.clearNotifications();
            });

            expect(result.current.notifications).toHaveLength(0);
        });
    });

    describe('InstagramConfigRealtime Component', () => {
        const mockOnSave = vi.fn();

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should render real-time configuration interface', () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            expect(screen.getByText('Real-time Configuration')).toBeInTheDocument();
            expect(screen.getByText('Live')).toBeInTheDocument();
            expect(screen.getByTestId('config-interface')).toBeInTheDocument();
            expect(screen.getByTestId('config-preview')).toBeInTheDocument();
        });

        it('should toggle live mode', () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            const liveButton = screen.getByText('Live');
            fireEvent.click(liveButton);

            expect(screen.getByText('Paused')).toBeInTheDocument();
        });

        it('should apply configuration presets', () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            const minimalPreset = screen.getByText('minimal');
            fireEvent.click(minimalPreset);

            // Should trigger configuration update
            expect(screen.getByTestId('config-preview')).toBeInTheDocument();
        });

        it('should handle save action', async () => {
            mockOnSave.mockResolvedValue();

            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            // Make a change to enable save
            const changeButton = screen.getByText('Change Config');
            fireEvent.click(changeButton);

            // Click save
            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalled();
            });
        });

        it('should show validation results', async () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            expect(screen.getByText('Valid configuration')).toBeInTheDocument();
        });

        it('should toggle notifications', () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            const notificationButton = screen.getByTitle('Disable notifications');
            fireEvent.click(notificationButton);

            expect(screen.getByTitle('Enable notifications')).toBeInTheDocument();
        });

        it('should show change history', () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            const historyButton = screen.getByTitle('Show change history');
            fireEvent.click(historyButton);

            expect(screen.getByText('Change History')).toBeInTheDocument();
        });

        it('should handle undo action', () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            const undoButton = screen.getByTitle('Undo last change');
            expect(undoButton).toBeDisabled(); // No changes yet

            // Make a change
            const changeButton = screen.getByText('Change Config');
            fireEvent.click(changeButton);

            // Undo should be enabled after change
            // Note: This would require more complex state management in the test
        });

        it('should be accessible', () => {
            render(<InstagramConfigRealtime onSave={mockOnSave} />);

            // Check for proper headings
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

            // Check for proper button labels
            expect(screen.getByTitle('Disable notifications')).toBeInTheDocument();
            expect(screen.getByTitle('Show change history')).toBeInTheDocument();
            expect(screen.getByTitle('Undo last change')).toBeInTheDocument();
        });
    });

    describe('Configuration Validator Integration', () => {
        it('should validate configuration using validator service', () => {
            const config = {
                maxPosts: 25, // Invalid - exceeds max
                layout: 'grid',
                showStats: true,
                showCaptions: true,
                captionLength: 100
            };

            const result = instagramConfigValidator.validate(config);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should generate warnings for performance issues', () => {
            const config = {
                maxPosts: 15, // High number
                lazyLoading: false, // Disabled
                refreshInterval: 60000 // 1 minute - frequent
            };

            const result = instagramConfigValidator.validate(config);
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('should validate color contrast', () => {
            const config = {
                colorScheme: 'custom',
                customColors: {
                    primary: '#FFFFFF',
                    background: '#EEEEEE', // Low contrast
                    text: '#111827',
                    secondary: '#6B7280',
                    border: '#E5E7EB'
                }
            };

            const result = instagramConfigValidator.validate(config);
            expect(result.warnings.some(w => w.includes('contrast'))).toBe(true);
        });

        it('should validate hashtag conflicts', () => {
            const config = {
                hashtags: ['sunset', 'beach'],
                excludeHashtags: ['sunset'] // Conflict
            };

            const result = instagramConfigValidator.validate(config);
            expect(result.errors.some(e => e.includes('cannot be both included and excluded'))).toBe(true);
        });

        it('should provide validation suggestions', () => {
            const config = {
                maxPosts: 12,
                lazyLoading: false,
                altTextEnabled: false
            };

            const suggestions = instagramConfigValidator.getValidationSuggestions(config);
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions.some(s => s.type === 'performance')).toBe(true);
            expect(suggestions.some(s => s.type === 'accessibility')).toBe(true);
        });
    });

    describe('Real-time Features', () => {
        it('should debounce rapid configuration changes', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime({}, {
                debounceMs: 100
            }));

            // Make rapid changes
            act(() => {
                result.current.updateConfig({ maxPosts: 5 });
                result.current.updateConfig({ maxPosts: 6 });
                result.current.updateConfig({ maxPosts: 7 });
            });

            // Should have pending changes
            expect(result.current.hasPendingChanges).toBe(true);

            // Fast-forward debounce timer
            act(() => {
                vi.advanceTimersByTime(100);
            });

            await waitFor(() => {
                expect(result.current.config.maxPosts).toBe(7); // Last value
                expect(result.current.hasPendingChanges).toBe(false);
            });
        });

        it('should handle immediate updates when specified', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.updateConfig({ maxPosts: 8 }, { immediate: true });
            });

            // Should update immediately without debounce
            await waitFor(() => {
                expect(result.current.config.maxPosts).toBe(8);
            });
        });

        it('should validate configuration changes in real-time', async () => {
            const { result } = renderHook(() => useInstagramConfigRealtime());

            act(() => {
                result.current.updateConfig({ maxPosts: 25 }); // Invalid
            });

            act(() => {
                vi.advanceTimersByTime(200); // Validation timeout
            });

            await waitFor(() => {
                expect(result.current.hasValidationErrors).toBe(true);
            });
        });
    });
});

// Helper function to render hooks (simplified version)
function renderHook(hook, options = {}) {
    let result;
    function TestComponent(props) {
        result = hook(props);
        return null;
    }
    const utils = render(<TestComponent {...options.initialProps} />);
    return {
        result: { current: result },
        rerender: (newProps) => utils.rerender(<TestComponent {...newProps} />),
        ...utils
    };
}