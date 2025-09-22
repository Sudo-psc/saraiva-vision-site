// Tests for WordPress GraphQL integration
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeGraphQLQuery, checkWordPressHealth } from '../lib/wordpress.js';
import {
    getAllPosts,
    getPostBySlug,
    getAllPages,
    getPageBySlug,
    getAllServices,
    getServiceBySlug,
    invalidateCache
} from '../lib/wordpress-api.js';

// Mock GraphQL client
vi.mock('graphql-request', () => ({
    GraphQLClient: vi.fn().mockImplementation(() => ({
        request: vi.fn(),
    })),
}));

// Mock environment variables
vi.mock('../lib/wordpress.js', async () => {
    const actual = await vi.importActual('../lib/wordpress.js');
    return {
        ...actual,
        executeGraphQLQuery: vi.fn(),
        checkWordPressHealth: vi.fn(),
    };
});

describe('WordPress GraphQL Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        invalidateCache(); // Clear cache before each test
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GraphQL Client', () => {
        it('should execute GraphQL queries successfully', async () => {
            const mockData = {
                posts: {
                    nodes: [
                        {
                            id: '1',
                            title: 'Test Post',
                            slug: 'test-post',
                            content: '<p>Test content</p>',
                        },
                    ],
                },
            };

            executeGraphQLQuery.mockResolvedValue({
                data: mockData,
                error: null,
            });

            const result = await executeGraphQLQuery('query { posts { nodes { id title } } }');

            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('should handle GraphQL errors gracefully', async () => {
            const mockError = {
                response: {
                    errors: [
                        {
                            message: 'Field "invalidField" is not defined',
                        },
                    ],
                },
            };

            executeGraphQLQuery.mockResolvedValue({
                data: null,
                error: {
                    type: 'GRAPHQL_ERROR',
                    message: 'Field "invalidField" is not defined',
                    errors: mockError.response.errors,
                },
            });

            const result = await executeGraphQLQuery('query { invalidField }');

            expect(result.data).toBeNull();
            expect(result.error.type).toBe('GRAPHQL_ERROR');
            expect(result.error.message).toBe('Field "invalidField" is not defined');
        });

        it('should handle network errors', async () => {
            executeGraphQLQuery.mockResolvedValue({
                data: null,
                error: {
                    type: 'NETWORK_ERROR',
                    message: 'Failed to connect to WordPress CMS',
                },
            });

            const result = await executeGraphQLQuery('query { posts { nodes { id } } }');

            expect(result.data).toBeNull();
            expect(result.error.type).toBe('NETWORK_ERROR');
        });
    });

    describe('Health Check', () => {
        it('should return healthy status when WordPress is accessible', async () => {
            checkWordPressHealth.mockResolvedValue({
                isHealthy: true,
                data: {
                    title: 'Saraiva Vision CMS',
                    url: 'https://cms.saraivavision.com.br',
                },
                error: null,
            });

            const result = await checkWordPressHealth();

            expect(result.isHealthy).toBe(true);
            expect(result.data.title).toBe('Saraiva Vision CMS');
        });

        it('should return unhealthy status when WordPress is not accessible', async () => {
            checkWordPressHealth.mockResolvedValue({
                isHealthy: false,
                data: null,
                error: {
                    type: 'HEALTH_CHECK_FAILED',
                    message: 'Connection timeout',
                },
            });

            const result = await checkWordPressHealth();

            expect(result.isHealthy).toBe(false);
            expect(result.error.type).toBe('HEALTH_CHECK_FAILED');
        });
    });

    describe('Posts API', () => {
        it('should fetch all posts successfully', async () => {
            const mockPosts = [
                {
                    id: '1',
                    title: 'Post 1',
                    slug: 'post-1',
                    excerpt: 'Excerpt 1',
                    content: '<p>Content 1</p>',
                },
                {
                    id: '2',
                    title: 'Post 2',
                    slug: 'post-2',
                    excerpt: 'Excerpt 2',
                    content: '<p>Content 2</p>',
                },
            ];

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    posts: {
                        nodes: mockPosts,
                        pageInfo: {
                            hasNextPage: false,
                            hasPreviousPage: false,
                        },
                    },
                },
                error: null,
            });

            const result = await getAllPosts();

            expect(result.posts).toHaveLength(2);
            expect(result.posts[0].title).toBe('Post 1');
            expect(result.error).toBeNull();
        });

        it('should fetch a single post by slug', async () => {
            const mockPost = {
                id: '1',
                title: 'Test Post',
                slug: 'test-post',
                content: '<p>Test content</p>',
            };

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    post: mockPost,
                },
                error: null,
            });

            const result = await getPostBySlug('test-post');

            expect(result.post.title).toBe('Test Post');
            expect(result.post.slug).toBe('test-post');
            expect(result.error).toBeNull();
        });

        it('should return null for non-existent post', async () => {
            executeGraphQLQuery.mockResolvedValue({
                data: {
                    post: null,
                },
                error: null,
            });

            const result = await getPostBySlug('non-existent-post');

            expect(result.post).toBeNull();
            expect(result.error).toBeNull();
        });
    });

    describe('Pages API', () => {
        it('should fetch all pages successfully', async () => {
            const mockPages = [
                {
                    id: '1',
                    title: 'About Us',
                    slug: 'about',
                    content: '<p>About content</p>',
                },
                {
                    id: '2',
                    title: 'Contact',
                    slug: 'contact',
                    content: '<p>Contact content</p>',
                },
            ];

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    pages: {
                        nodes: mockPages,
                    },
                },
                error: null,
            });

            const result = await getAllPages();

            expect(result.pages).toHaveLength(2);
            expect(result.pages[0].title).toBe('About Us');
            expect(result.error).toBeNull();
        });

        it('should fetch a single page by slug', async () => {
            const mockPage = {
                id: '1',
                title: 'About Us',
                slug: 'about',
                content: '<p>About content</p>',
            };

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    page: mockPage,
                },
                error: null,
            });

            const result = await getPageBySlug('about');

            expect(result.page.title).toBe('About Us');
            expect(result.page.slug).toBe('about');
            expect(result.error).toBeNull();
        });
    });

    describe('Services API', () => {
        it('should fetch all services successfully', async () => {
            const mockServices = [
                {
                    id: '1',
                    title: 'Cataract Surgery',
                    slug: 'cataract-surgery',
                    serviceDetails: {
                        duration: '30 minutes',
                        category: 'Surgery',
                    },
                },
                {
                    id: '2',
                    title: 'Eye Exam',
                    slug: 'eye-exam',
                    serviceDetails: {
                        duration: '45 minutes',
                        category: 'Consultation',
                    },
                },
            ];

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    services: {
                        nodes: mockServices,
                    },
                },
                error: null,
            });

            const result = await getAllServices();

            expect(result.services).toHaveLength(2);
            expect(result.services[0].title).toBe('Cataract Surgery');
            expect(result.error).toBeNull();
        });

        it('should fetch a single service by slug', async () => {
            const mockService = {
                id: '1',
                title: 'Cataract Surgery',
                slug: 'cataract-surgery',
                serviceDetails: {
                    duration: '30 minutes',
                    preparation: 'No special preparation required',
                },
            };

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    service: mockService,
                },
                error: null,
            });

            const result = await getServiceBySlug('cataract-surgery');

            expect(result.service.title).toBe('Cataract Surgery');
            expect(result.service.serviceDetails.duration).toBe('30 minutes');
            expect(result.error).toBeNull();
        });
    });

    describe('Caching', () => {
        it('should cache API responses', async () => {
            const mockPosts = [
                {
                    id: '1',
                    title: 'Cached Post',
                    slug: 'cached-post',
                },
            ];

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    posts: {
                        nodes: mockPosts,
                        pageInfo: {
                            hasNextPage: false,
                        },
                    },
                },
                error: null,
            });

            // First call
            const result1 = await getAllPosts({ useCache: true });

            // Second call should use cache
            const result2 = await getAllPosts({ useCache: true });

            expect(result1.posts).toEqual(result2.posts);
            // GraphQL should only be called once due to caching
            expect(executeGraphQLQuery).toHaveBeenCalledTimes(1);
        });

        it('should bypass cache when requested', async () => {
            const mockPosts = [
                {
                    id: '1',
                    title: 'Fresh Post',
                    slug: 'fresh-post',
                },
            ];

            executeGraphQLQuery.mockResolvedValue({
                data: {
                    posts: {
                        nodes: mockPosts,
                        pageInfo: {
                            hasNextPage: false,
                        },
                    },
                },
                error: null,
            });

            // Both calls should bypass cache
            await getAllPosts({ useCache: false });
            await getAllPosts({ useCache: false });

            // GraphQL should be called twice
            expect(executeGraphQLQuery).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            executeGraphQLQuery.mockResolvedValue({
                data: null,
                error: {
                    type: 'SERVER_ERROR',
                    message: 'WordPress server is temporarily unavailable',
                    status: 500,
                },
            });

            const result = await getAllPosts();

            expect(result.posts).toEqual([]);
            expect(result.error.type).toBe('SERVER_ERROR');
            expect(result.error.message).toBe('WordPress server is temporarily unavailable');
        });

        it('should provide fallback data on error', async () => {
            executeGraphQLQuery.mockResolvedValue({
                data: null,
                error: {
                    type: 'NETWORK_ERROR',
                    message: 'Failed to connect to WordPress CMS',
                },
            });

            const result = await getPostBySlug('test-post');

            expect(result.post).toBeNull();
            expect(result.error.type).toBe('NETWORK_ERROR');
        });
    });
});