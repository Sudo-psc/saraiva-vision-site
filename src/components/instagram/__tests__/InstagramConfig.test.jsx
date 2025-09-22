import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import InstagramConfigInterface from '../InstagramConfigInterface';
import InstagramConfigPreview from '../InstagramConfigPreview';
import { useInstagramConfigStandalone, getDefaultConfig } from '../../../hooks/useInstagramConfig';

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

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Instagram Configuration System', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('useInstagramConfigStandalone Hook', () => {
        it('should initialize with default configuration', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            expect(result.current.config).toEqual(getDefaultConfig());
            expect(result.current.isDirty).toBe(false);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should load configuration from localStorage', () => {
            const savedConfig = { maxPosts: 6, layout: 'carousel' };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(savedConfig));

            const { result } = renderHook(() => useInstagramConfigStandalone());

            expect(result.current.config.maxPosts).toBe(6);
            expect(result.current.config.layout).toBe('carousel');
        });

        it('should update configuration and mark as dirty', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            act(() => {
                result.current.updateConfig({ maxPosts: 8 });
            });

            expect(result.current.config.maxPosts).toBe(8);
            expect(result.current.isDirty).toBe(true);
        });

        it('should reset configuration to defaults', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            act(() => {
                result.current.updateConfig({ maxPosts: 8 });
            });

            expect(result.current.config.maxPosts).toBe(8);
            expect(result.current.isDirty).toBe(true);

            act(() => {
                result.current.resetConfig();
            });

            expect(result.current.config.maxPosts).toBe(4); // default
            expect(result.current.isDirty).toBe(false);
        });

        it('should validate configuration correctly', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            // Valid configuration
            let validation = result.current.validateConfig();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);

            // Invalid configuration
            act(() => {
                result.current.updateConfig({ maxPosts: 25 }); // exceeds max
            });

            validation = result.current.validateConfig();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Number of posts must be between 1 and 20');
        });

        it('should save configuration to localStorage', async () => {
            const { result } = renderHook(() =>
                useInstagramConfigStandalone({}, { persistConfig: true })
            );

            act(() => {
                result.current.updateConfig({ maxPosts: 6 });
            });

            // Wait for localStorage save
            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalledWith(
                    'instagram-config',
                    expect.stringContaining('"maxPosts":6')
                );
            });
        });

        it('should handle save function', async () => {
            const mockSave = vi.fn().mockResolvedValue();
            const { result } = renderHook(() => useInstagramConfigStandalone());

            act(() => {
                result.current.updateConfig({ maxPosts: 6 });
            });

            await act(async () => {
                await result.current.saveConfig(mockSave);
            });

            expect(mockSave).toHaveBeenCalledWith(
                expect.objectContaining({ maxPosts: 6 })
            );
            expect(result.current.isDirty).toBe(false);
        });
    });

    describe('InstagramConfigInterface Component', () => {
        const mockOnConfigChange = vi.fn();
        const mockOnSave = vi.fn();
        const mockOnReset = vi.fn();

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should render configuration interface', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            expect(screen.getByText('Instagram Configuration')).toBeInTheDocument();
            expect(screen.getByText('Display')).toBeInTheDocument();
            expect(screen.getByText('Content')).toBeInTheDocument();
            expect(screen.getByText('Appearance')).toBeInTheDocument();
        });

        it('should switch between tabs', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            // Click on Content tab
            fireEvent.click(screen.getByText('Content'));
            expect(screen.getByText('Content Filtering')).toBeInTheDocument();

            // Click on Appearance tab
            fireEvent.click(screen.getByText('Appearance'));
            expect(screen.getByText('Theme')).toBeInTheDocument();
        });

        it('should update number of posts', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            const postsInput = screen.getByLabelText('Number of Posts');
            fireEvent.change(postsInput, { target: { value: '6' } });

            expect(mockOnConfigChange).toHaveBeenCalledWith(
                expect.objectContaining({ maxPosts: 6 })
            );
        });

        it('should update layout selection', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            const layoutSelect = screen.getByLabelText('Layout Style');
            fireEvent.change(layoutSelect, { target: { value: 'carousel' } });

            expect(mockOnConfigChange).toHaveBeenCalledWith(
                expect.objectContaining({ layout: 'carousel' })
            );
        });

        it('should toggle display options', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            const showStatsCheckbox = screen.getByLabelText('Show engagement statistics');
            fireEvent.click(showStatsCheckbox);

            expect(mockOnConfigChange).toHaveBeenCalledWith(
                expect.objectContaining({ showStats: false })
            );
        });

        it('should add and remove hashtags', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            // Switch to Content tab
            fireEvent.click(screen.getByText('Content'));

            // Add hashtag
            const hashtagInput = screen.getByPlaceholderText('Enter hashtag (without #)');
            fireEvent.change(hashtagInput, { target: { value: 'sunset' } });
            fireEvent.click(screen.getByText('Add'));

            expect(mockOnConfigChange).toHaveBeenCalledWith(
                expect.objectContaining({ hashtags: ['sunset'] })
            );
        });

        it('should handle save action', async () => {
            mockOnSave.mockResolvedValue();

            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            // Make a change to enable save button
            const postsInput = screen.getByLabelText('Number of Posts');
            fireEvent.change(postsInput, { target: { value: '6' } });

            // Click save
            const saveButton = screen.getByText('Save Changes');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalled();
            });
        });

        it('should handle reset action', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            // Make a change to enable reset button
            const postsInput = screen.getByLabelText('Number of Posts');
            fireEvent.change(postsInput, { target: { value: '6' } });

            // Click reset
            const resetButton = screen.getByText('Reset');
            fireEvent.click(resetButton);

            expect(mockOnReset).toHaveBeenCalled();
        });

        it('should export configuration', () => {
            // Mock URL.createObjectURL and document.createElement
            const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
            const mockRevokeObjectURL = vi.fn();
            const mockClick = vi.fn();
            const mockAppendChild = vi.fn();
            const mockRemoveChild = vi.fn();

            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;

            const mockLink = {
                href: '',
                download: '',
                click: mockClick
            };

            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
            vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            const exportButton = screen.getByText('Export');
            fireEvent.click(exportButton);

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockClick).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalled();
        });

        it('should be accessible', () => {
            render(
                <InstagramConfigInterface
                    onConfigChange={mockOnConfigChange}
                    onSave={mockOnSave}
                    onReset={mockOnReset}
                />
            );

            // Check for proper ARIA attributes
            const tabList = screen.getByRole('navigation', { name: 'Configuration tabs' });
            expect(tabList).toBeInTheDocument();

            // Check for proper form labels
            expect(screen.getByLabelText('Number of Posts')).toBeInTheDocument();
            expect(screen.getByLabelText('Layout Style')).toBeInTheDocument();
        });
    });

    describe('InstagramConfigPreview Component', () => {
        const mockConfig = {
            ...getDefaultConfig(),
            maxPosts: 4,
            layout: 'grid',
            showStats: true,
            showCaptions: true
        };

        it('should render preview component', () => {
            render(
                <InstagramConfigPreview
                    config={mockConfig}
                    previewMode="desktop"
                />
            );

            expect(screen.getByText(/Preview:/)).toBeInTheDocument();
            expect(screen.getByText('Desktop')).toBeInTheDocument();
        });

        it('should switch preview modes', () => {
            const mockOnPreviewModeChange = vi.fn();

            render(
                <InstagramConfigPreview
                    config={mockConfig}
                    previewMode="desktop"
                    onPreviewModeChange={mockOnPreviewModeChange}
                />
            );

            const mobileButton = screen.getByTitle('Mobile');
            fireEvent.click(mobileButton);

            expect(mockOnPreviewModeChange).toHaveBeenCalledWith('mobile');
        });

        it('should show configuration summary', () => {
            render(
                <InstagramConfigPreview
                    config={mockConfig}
                    previewMode="desktop"
                />
            );

            expect(screen.getByText('4 max')).toBeInTheDocument();
            expect(screen.getByText('Grid')).toBeInTheDocument();
            expect(screen.getByText('Light')).toBeInTheDocument();
        });

        it('should handle refresh action', async () => {
            render(
                <InstagramConfigPreview
                    config={mockConfig}
                    previewMode="desktop"
                />
            );

            const refreshButton = screen.getByTitle('Refresh preview');
            fireEvent.click(refreshButton);

            expect(screen.getByText('Refreshing preview...')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText('Refreshing preview...')).not.toBeInTheDocument();
            });
        });

        it('should filter posts based on configuration', () => {
            const configWithFilters = {
                ...mockConfig,
                hashtags: ['sunset'],
                minLikes: 100
            };

            render(
                <InstagramConfigPreview
                    config={configWithFilters}
                    previewMode="desktop"
                />
            );

            // Should show filtered posts count
            expect(screen.getByText(/posts/)).toBeInTheDocument();
        });

        it('should show no posts message when filters exclude all posts', () => {
            const configWithStrictFilters = {
                ...mockConfig,
                hashtags: ['nonexistent'],
                minLikes: 10000
            };

            render(
                <InstagramConfigPreview
                    config={configWithStrictFilters}
                    previewMode="desktop"
                />
            );

            expect(screen.getByText('No posts to display')).toBeInTheDocument();
        });
    });

    describe('Configuration Validation', () => {
        it('should validate maxPosts range', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            // Test invalid values
            const invalidConfigs = [
                { maxPosts: 0 },
                { maxPosts: 25 },
                { maxPosts: -1 }
            ];

            invalidConfigs.forEach(config => {
                const validation = result.current.validateConfig({
                    ...getDefaultConfig(),
                    ...config
                });
                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Number of posts must be between 1 and 20');
            });
        });

        it('should validate caption length range', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            const invalidConfigs = [
                { captionLength: 30 },
                { captionLength: 400 }
            ];

            invalidConfigs.forEach(config => {
                const validation = result.current.validateConfig({
                    ...getDefaultConfig(),
                    ...config
                });
                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('Caption length must be between 50 and 300 characters');
            });
        });

        it('should validate refresh interval', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            const validation = result.current.validateConfig({
                ...getDefaultConfig(),
                refreshInterval: 30000 // less than 1 minute
            });

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Refresh interval must be at least 1 minute');
        });

        it('should validate custom colors format', () => {
            const { result } = renderHook(() => useInstagramConfigStandalone());

            const validation = result.current.validateConfig({
                ...getDefaultConfig(),
                colorScheme: 'custom',
                customColors: {
                    primary: 'invalid-color',
                    secondary: '#6B7280',
                    background: '#FFFFFF',
                    text: '#111827',
                    border: '#E5E7EB'
                }
            });

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Invalid color format for primary: invalid-color');
        });
    });

    describe('Configuration Persistence', () => {
        it('should save to localStorage when persistConfig is true', () => {
            const { result } = renderHook(() =>
                useInstagramConfigStandalone({}, { persistConfig: true })
            );

            act(() => {
                result.current.updateConfig({ maxPosts: 6 });
            });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'instagram-config',
                expect.stringContaining('"maxPosts":6')
            );
        });

        it('should not save to localStorage when persistConfig is false', () => {
            const { result } = renderHook(() =>
                useInstagramConfigStandalone({}, { persistConfig: false })
            );

            act(() => {
                result.current.updateConfig({ maxPosts: 6 });
            });

            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

        it('should handle localStorage errors gracefully', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const { result } = renderHook(() =>
                useInstagramConfigStandalone({}, { persistConfig: true })
            );

            act(() => {
                result.current.updateConfig({ maxPosts: 6 });
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to save Instagram config to localStorage:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });
});

// Helper function to render hooks (simplified version)
function renderHook(hook) {
    let result;
    function TestComponent() {
        result = hook();
        return null;
    }
    const utils = render(<TestComponent />);
    return { result, ...utils };
}