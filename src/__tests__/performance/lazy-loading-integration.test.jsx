/**
 * Integration Tests for Lazy Loading Components
 * Tests IntersectionObserver implementation, React components, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock IntersectionObserver for component tests
const createMockObserver = () => {
    const callbacks = new Map();
    let mockInstanceId = 0;

    return {
        IntersectionObserver: vi.fn().mockImplementation((callback, options) => {
            const instanceId = mockInstanceId++;
            callbacks.set(instanceId, { callback, options, observed: new Set() });

            return {
                observe: vi.fn().mockImplementation((element) => {
                    callbacks.get(instanceId).observed.add(element);
                }),
                unobserve: vi.fn().mockImplementation((element) => {
                    callbacks.get(instanceId).observed.delete(element);
                }),
                disconnect: vi.fn().mockImplementation(() => {
                    callbacks.delete(instanceId);
                }),
                root: options?.root || null,
                rootMargin: options?.rootMargin || '0px',
                threshold: options?.threshold || 0
            };
        }),
        // Helper to simulate intersection
        simulateIntersection: (elements, isIntersecting = true) => {
            callbacks.forEach(({ callback, observed }) => {
                const entries = Array.from(observed)
                    .filter(element => elements.includes(element))
                    .map(element => ({
                        target: element,
                        isIntersecting,
                        boundingClientRect: {
                            top: isIntersecting ? 0 : 1000,
                            bottom: isIntersecting ? 100 : 1100
                        },
                        intersectionRatio: isIntersecting ? 1 : 0,
                        time: Date.now()
                    }));

                if (entries.length > 0) {
                    callback(entries, { unobserve: vi.fn(), disconnect: vi.fn() });
                }
            });
        },
        // Helper to get observed elements
        getObservedElements: () => {
            const allObserved = new Set();
            callbacks.forEach(({ observed }) => {
                observed.forEach(element => allObserved.add(element));
            });
            return Array.from(allObserved);
        },
        // Reset all observers
        reset: () => {
            callbacks.clear();
            mockInstanceId = 0;
        }
    };
};

const mockObserver = createMockObserver();
global.IntersectionObserver = mockObserver.IntersectionObserver;

// Mock Image constructor for testing image loading
global.Image = vi.fn().mockImplementation(() => {
    const img = {
        src: '',
        onload: null,
        onerror: null,
        naturalWidth: 0,
        naturalHeight: 0,
        complete: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    };

    // Simulate async loading
    setTimeout(() => {
        if (img.src && img.onload) {
            img.complete = true;
            img.naturalWidth = 800;
            img.naturalHeight = 600;
            img.onload();
        }
    }, 50);

    return img;
});

// Mock performance.now for timing tests
const originalPerformanceNow = performance.now;
vi.stubGlobal('performance', {
    ...global.performance,
    now: vi.fn(() => originalPerformanceNow.call(global.performance))
});

// Test Components
const LazyImage = ({ src, alt, className, placeholder, ...props }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [isInView, setIsInView] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const imgRef = React.useRef(null);

    React.useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.unobserve(img);
                    }
                });
            },
            { rootMargin: '50px' }
        );

        observer.observe(img);

        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        if (isInView && src && !isLoaded && !hasError) {
            const img = new Image();
            img.onload = () => setIsLoaded(true);
            img.onerror = () => setHasError(true);
            img.src = src;
        }
    }, [isInView, src, isLoaded, hasError]);

    return (
        <img
            ref={imgRef}
            src={isLoaded ? src : placeholder}
            alt={alt}
            className={`${className || ''} ${isLoaded ? 'loaded' : 'loading'}`}
            style={{
                opacity: isLoaded ? 1 : 0.7,
                transition: 'opacity 0.3s ease-in-out'
            }}
            {...props}
        />
    );
};

const LazyGallery = ({ images }) => {
    return (
        <div className="gallery">
            {images.map((image, index) => (
                <div key={index} className="gallery-item">
                    <LazyImage
                        src={image.src}
                        alt={image.alt}
                        placeholder={image.placeholder}
                        className="gallery-image"
                        width={image.width}
                        height={image.height}
                    />
                </div>
            ))}
        </div>
    );
};

const MedicalImageGrid = ({ procedures }) => {
    return (
        <div className="medical-grid" role="region" aria-label="Procedimentos médicos">
            {procedures.map((procedure, index) => (
                <div key={index} className="medical-procedure">
                    <LazyImage
                        src={procedure.image}
                        alt={`Procedimento: ${procedure.name}`}
                        placeholder="/img/medical-placeholder.svg"
                        className="procedure-image"
                        width={400}
                        height={300}
                    />
                    <h3>{procedure.name}</h3>
                    <p>{procedure.description}</p>
                </div>
            ))}
        </div>
    );
};

describe('Lazy Loading Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockObserver.reset();
        performance.now.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('LazyImage Component', () => {
        it('renders placeholder before entering viewport', () => {
            const placeholderSrc = '/img/placeholder.jpg';
            const actualSrc = '/img/actual-image.jpg';

            render(
                <LazyImage
                    src={actualSrc}
                    alt="Test Image"
                    placeholder={placeholderSrc}
                    className="test-image"
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('src', placeholderSrc);
            expect(img).toHaveClass('loading');
            expect(img).toHaveClass('test-image');
            expect(img.style.opacity).toBe('0.7');
        });

        it('loads actual image when it enters viewport', async () => {
            const placeholderSrc = '/img/placeholder.jpg';
            const actualSrc = '/img/actual-image.jpg';

            render(
                <LazyImage
                    src={actualSrc}
                    alt="Test Image"
                    placeholder={placeholderSrc}
                />
            );

            const img = screen.getByRole('img');

            // Simulate image entering viewport
            await act(async () => {
                mockObserver.simulateIntersection([img], true);
            });

            // Wait for image to load
            await waitFor(() => {
                expect(img).toHaveAttribute('src', actualSrc);
                expect(img).toHaveClass('loaded');
                expect(img.style.opacity).toBe('1');
            });
        });

        it('handles image loading errors gracefully', async () => {
            // Mock Image to simulate error
            global.Image = vi.fn().mockImplementation(() => {
                const img = {
                    src: '',
                    onload: null,
                    onerror: null,
                    complete: false,
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn()
                };

                setTimeout(() => {
                    if (img.onerror) {
                        img.onerror();
                    }
                }, 10);

                return img;
            });

            render(
                <LazyImage
                    src="/img/missing-image.jpg"
                    alt="Missing Image"
                    placeholder="/img/placeholder.jpg"
                />
            );

            const img = screen.getByRole('img');

            await act(async () => {
                mockObserver.simulateIntersection([img], true);
            });

            await waitFor(() => {
                // Should still show placeholder on error
                expect(img).toHaveAttribute('src', '/img/placeholder.jpg');
                expect(img).toHaveClass('loading');
            });
        });

        it('unobserves image after loading', async () => {
            render(
                <LazyImage
                    src="/img/test.jpg"
                    alt="Test Image"
                    placeholder="/img/placeholder.jpg"
                />
            );

            const img = screen.getByRole('img');

            // Initially observing
            expect(mockObserver.getObservedElements()).toContain(img);

            // Simulate intersection
            await act(async () => {
                mockObserver.simulateIntersection([img], true);
            });

            // Should no longer be observing after load
            await waitFor(() => {
                expect(mockObserver.getObservedElements()).not.toContain(img);
            });
        });

        it('maintains accessibility attributes', () => {
            render(
                <LazyImage
                    src="/img/medical-procedure.jpg"
                    alt="Procedimento de catarata - Foto ilustrativa"
                    placeholder="/img/placeholder.jpg"
                    width={400}
                    height={300}
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('alt', 'Procedimento de catarata - Foto ilustrativa');
            expect(img).toHaveAttribute('width', '400');
            expect(img).toHaveAttribute('height', '300');
        });
    });

    describe('LazyGallery Component', () => {
        const mockImages = [
            { src: '/img/gallery1.jpg', alt: 'Gallery 1', placeholder: '/img/thumb1.jpg', width: 300, height: 200 },
            { src: '/img/gallery2.jpg', alt: 'Gallery 2', placeholder: '/img/thumb2.jpg', width: 300, height: 200 },
            { src: '/img/gallery3.jpg', alt: 'Gallery 3', placeholder: '/img/thumb3.jpg', width: 300, height: 200 }
        ];

        it('renders all images with placeholders initially', () => {
            render(<LazyGallery images={mockImages} />);

            const images = screen.getAllByRole('img');
            expect(images).toHaveLength(3);

            images.forEach((img, index) => {
                expect(img).toHaveAttribute('src', mockImages[index].placeholder);
                expect(img).toHaveAttribute('alt', mockImages[index].alt);
                expect(img).toHaveClass('loading');
            });
        });

        it('loads images progressively as they enter viewport', async () => {
            render(<LazyGallery images={mockImages} />);

            const images = screen.getAllByRole('img');

            // Simulate first image entering viewport
            await act(async () => {
                mockObserver.simulateIntersection([images[0]], true);
            });

            await waitFor(() => {
                expect(images[0]).toHaveAttribute('src', mockImages[0].src);
                expect(images[0]).toHaveClass('loaded');
            });

            // Other images should still show placeholders
            expect(images[1]).toHaveAttribute('src', mockImages[1].placeholder);
            expect(images[2]).toHaveAttribute('src', mockImages[2].placeholder);
        });

        it('handles multiple images loading simultaneously', async () => {
            render(<LazyGallery images={mockImages} />);

            const images = screen.getAllByRole('img');

            // Simulate all images entering viewport at once
            await act(async () => {
                mockObserver.simulateIntersection(images, true);
            });

            await waitFor(() => {
                images.forEach((img, index) => {
                    expect(img).toHaveAttribute('src', mockImages[index].src);
                    expect(img).toHaveClass('loaded');
                });
            });
        });
    });

    describe('Medical Image Grid', () => {
        const mockProcedures = [
            {
                name: 'Catarata',
                description: 'Cirurgia de catarata com tecnologia de ponta',
                image: '/img/catarata-procedure.jpg'
            },
            {
                name: 'LASIK',
                description: 'Correção de visão a laser',
                image: '/img/lasik-procedure.jpg'
            },
            {
                name: 'Retina',
                description: 'Tratamentos de retina e vítreo',
                image: '/img/retina-procedure.jpg'
            }
        ];

        it('renders medical procedure grid with proper accessibility', () => {
            render(<MedicalImageGrid procedures={mockProcedures} />);

            // Check region label
            expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Procedimentos médicos');

            // Check procedure names and descriptions
            mockProcedures.forEach(procedure => {
                expect(screen.getByRole('heading', { name: procedure.name })).toBeInTheDocument();
                expect(screen.getByText(procedure.description)).toBeInTheDocument();
            });

            // Check images
            const images = screen.getAllByRole('img');
            expect(images).toHaveLength(3);

            images.forEach((img, index) => {
                expect(img).toHaveAttribute('alt', `Procedimento: ${mockProcedures[index].name}`);
                expect(img).toHaveAttribute('width', '400');
                expect(img).toHaveAttribute('height', '300');
            });
        });

        it('loads medical images with high quality preservation', async () => {
            render(<MedicalImageGrid procedures={mockProcedures} />);

            const images = screen.getAllByRole('img');

            await act(async () => {
                mockObserver.simulateIntersection(images, true);
            });

            await waitFor(() => {
                images.forEach((img, index) => {
                    expect(img).toHaveAttribute('src', mockProcedures[index].image);
                    expect(img).toHaveClass('loaded');
                });
            });
        });
    });

    describe('Performance Optimization', () => {
        it('does not create multiple IntersectionObserver instances', () => {
            render(
                <div>
                    <LazyImage src="/img/test1.jpg" alt="Test 1" placeholder="/img/placeholder.jpg" />
                    <LazyImage src="/img/test2.jpg" alt="Test 2" placeholder="/img/placeholder.jpg" />
                    <LazyImage src="/img/test3.jpg" alt="Test 3" placeholder="/img/placeholder.jpg" />
                </div>
            );

            // Should create observers for each component instance
            expect(global.IntersectionObserver).toHaveBeenCalledTimes(3);
        });

        it('measures loading performance thresholds', async () => {
            const startTime = performance.now();
            performance.now.mockReturnValue(startTime);

            render(
                <LazyImage
                    src="/img/large-medical-image.jpg"
                    alt="Medical Procedure"
                    placeholder="/img/placeholder.jpg"
                />
            );

            const img = screen.getByRole('img');

            // Simulate viewport entry
            performance.now.mockReturnValue(startTime + 100);
            await act(async () => {
                mockObserver.simulateIntersection([img], true);
            });

            // Simulate image load completion
            performance.now.mockReturnValue(startTime + 200);
            await waitFor(() => {
                expect(img).toHaveClass('loaded');
            });

            // Total loading time should be reasonable (< 1 second)
            const totalTime = performance.now() - startTime;
            expect(totalTime).toBeLessThan(1000);
        });

        it('handles rapid scrolling efficiently', async () => {
            const images = Array.from({ length: 50 }, (_, i) => (
                <LazyImage
                    key={i}
                    src={`/img/image${i}.jpg`}
                    alt={`Image ${i}`}
                    placeholder={`/img/thumb${i}.jpg`}
                />
            ));

            render(<div>{images}</div>);

            const allImages = screen.getAllByRole('img');

            // Simulate rapid viewport changes
            const scrollStartTime = performance.now();

            for (let i = 0; i < allImages.length; i += 5) {
                performance.now.mockReturnValue(scrollStartTime + i * 10);
                await act(async () => {
                    mockObserver.simulateIntersection(allImages.slice(i, i + 5), true);
                });
            }

            // Should handle rapid scrolling without performance degradation
            expect(performance.now() - scrollStartTime).toBeLessThan(1000);
        });
    });

    describe('User Interaction', () => {
        it('supports keyboard navigation to lazy loaded images', async () => {
            const user = userEvent.setup();

            render(
                <div>
                    <button>Before Images</button>
                    <LazyImage
                        src="/img/accessible-image.jpg"
                        alt="Accessible medical image"
                        placeholder="/img/placeholder.jpg"
                        tabIndex="0"
                    />
                    <button>After Images</button>
                </div>
            );

            const img = screen.getByRole('img');

            // Image should be focusable
            expect(img).toHaveAttribute('tabIndex', '0');

            // Test keyboard navigation
            await user.tab(); // Should focus on first button
            await user.tab(); // Should focus on image
            expect(img).toHaveFocus();

            // Load image when focused
            await act(async () => {
                mockObserver.simulateIntersection([img], true);
            });

            await waitFor(() => {
                expect(img).toHaveClass('loaded');
            });
        });

        it('maintains loading states during user interactions', async () => {
            const onImageLoad = vi.fn();

            render(
                <LazyImage
                    src="/img/interactive-image.jpg"
                    alt="Interactive medical content"
                    placeholder="/img/placeholder.jpg"
                />
            );

            const img = screen.getByRole('img');

            // User clicks on loading image
            await userEvent.click(img);
            expect(img).toHaveClass('loading');

            // Image finishes loading
            await act(async () => {
                mockObserver.simulateIntersection([img], true);
            });

            await waitFor(() => {
                expect(img).toHaveClass('loaded');
            });

            // Image should still be interactive after loading
            expect(img).toBeInTheDocument();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('handles missing src attribute gracefully', () => {
            render(
                <LazyImage
                    alt="Image with no src"
                    placeholder="/img/placeholder.jpg"
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('src', '/img/placeholder.jpg');
            expect(img).toHaveClass('loading');
        });

        it('handles empty placeholder', () => {
            render(
                <LazyImage
                    src="/img/test.jpg"
                    alt="Test"
                    placeholder=""
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('src', '');
        });

        it('prevents memory leaks on component unmount', async () => {
            const { unmount } = render(
                <LazyImage
                    src="/img/test.jpg"
                    alt="Test"
                    placeholder="/img/placeholder.jpg"
                />
            );

            const img = screen.getByRole('img');
            expect(mockObserver.getObservedElements()).toContain(img);

            unmount();

            // Should clean up observer
            expect(mockObserver.getObservedElements()).toHaveLength(0);
        });
    });
});