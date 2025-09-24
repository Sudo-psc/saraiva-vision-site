// ISR (Incremental Static Regeneration) utilities for WordPress content
import {
    getAllPosts,
    getAllPages,
    getAllServices,
    getAllTeamMembers,
    getPostBySlug,
    getPageBySlug,
    getServiceBySlug,
    getTeamMemberBySlug
} from './wordpress-api.js';

// ISR revalidation intervals (in seconds)
export const ISR_REVALIDATE = {
    POSTS: 300, // 5 minutes
    PAGES: 3600, // 1 hour
    SERVICES: 1800, // 30 minutes
    TEAM_MEMBERS: 3600, // 1 hour
    HOMEPAGE: 300, // 5 minutes
    STATIC_PAGES: 86400, // 24 hours
};

// Generate static paths for posts
export const getPostStaticPaths = async () => {
    try {
        const { posts, error } = await getAllPosts({ first: 100, useCache: false });

        if (error) {
            console.error('Error fetching posts for static paths:', error);
            return {
                paths: [],
                fallback: 'blocking',
            };
        }

        const paths = posts.map((post) => ({
            params: { slug: post.slug },
        }));

        return {
            paths,
            fallback: 'blocking', // Enable ISR for new posts
        };
    } catch (error) {
        console.error('Error generating post static paths:', error);
        return {
            paths: [],
            fallback: 'blocking',
        };
    }
};

// Generate static props for a single post
export const getPostStaticProps = async (slug) => {
    try {
        const { post, error } = await getPostBySlug(slug, false);

        if (error || !post) {
            return {
                notFound: true,
                revalidate: ISR_REVALIDATE.POSTS,
            };
        }

        return {
            props: {
                post,
                lastUpdated: new Date().toISOString(),
            },
            revalidate: ISR_REVALIDATE.POSTS,
        };
    } catch (error) {
        console.error('Error generating post static props:', error);
        return {
            notFound: true,
            revalidate: ISR_REVALIDATE.POSTS,
        };
    }
};

// Generate static paths for pages
export const getPageStaticPaths = async () => {
    try {
        const { pages, error } = await getAllPages(false);

        if (error) {
            console.error('Error fetching pages for static paths:', error);
            return {
                paths: [],
                fallback: 'blocking',
            };
        }

        const paths = pages
            .filter(page => page.slug !== 'home') // Exclude homepage
            .map((page) => ({
                params: { slug: page.slug },
            }));

        return {
            paths,
            fallback: 'blocking',
        };
    } catch (error) {
        console.error('Error generating page static paths:', error);
        return {
            paths: [],
            fallback: 'blocking',
        };
    }
};

// Generate static props for a single page
export const getPageStaticProps = async (slug) => {
    try {
        const { page, error } = await getPageBySlug(slug, false);

        if (error || !page) {
            return {
                notFound: true,
                revalidate: ISR_REVALIDATE.PAGES,
            };
        }

        return {
            props: {
                page,
                lastUpdated: new Date().toISOString(),
            },
            revalidate: ISR_REVALIDATE.PAGES,
        };
    } catch (error) {
        console.error('Error generating page static props:', error);
        return {
            notFound: true,
            revalidate: ISR_REVALIDATE.PAGES,
        };
    }
};

// Generate static paths for services
export const getServiceStaticPaths = async () => {
    try {
        const { services, error } = await getAllServices(false);

        if (error) {
            console.error('Error fetching services for static paths:', error);
            return {
                paths: [],
                fallback: 'blocking',
            };
        }

        const paths = services.map((service) => ({
            params: { slug: service.slug },
        }));

        return {
            paths,
            fallback: 'blocking',
        };
    } catch (error) {
        console.error('Error generating service static paths:', error);
        return {
            paths: [],
            fallback: 'blocking',
        };
    }
};

// Generate static props for a single service
export const getServiceStaticProps = async (slug) => {
    try {
        const { service, error } = await getServiceBySlug(slug, false);

        if (error || !service) {
            return {
                notFound: true,
                revalidate: ISR_REVALIDATE.SERVICES,
            };
        }

        return {
            props: {
                service,
                lastUpdated: new Date().toISOString(),
            },
            revalidate: ISR_REVALIDATE.SERVICES,
        };
    } catch (error) {
        console.error('Error generating service static props:', error);
        return {
            notFound: true,
            revalidate: ISR_REVALIDATE.SERVICES,
        };
    }
};

// Generate static paths for team members
export const getTeamMemberStaticPaths = async () => {
    try {
        const { teamMembers, error } = await getAllTeamMembers(false);

        if (error) {
            console.error('Error fetching team members for static paths:', error);
            return {
                paths: [],
                fallback: 'blocking',
            };
        }

        const paths = teamMembers.map((member) => ({
            params: { slug: member.slug },
        }));

        return {
            paths,
            fallback: 'blocking',
        };
    } catch (error) {
        console.error('Error generating team member static paths:', error);
        return {
            paths: [],
            fallback: 'blocking',
        };
    }
};

// Generate static props for a single team member
export const getTeamMemberStaticProps = async (slug) => {
    try {
        const { teamMember, error } = await getTeamMemberBySlug(slug, false);

        if (error || !teamMember) {
            return {
                notFound: true,
                revalidate: ISR_REVALIDATE.TEAM_MEMBERS,
            };
        }

        return {
            props: {
                teamMember,
                lastUpdated: new Date().toISOString(),
            },
            revalidate: ISR_REVALIDATE.TEAM_MEMBERS,
        };
    } catch (error) {
        console.error('Error generating team member static props:', error);
        return {
            notFound: true,
            revalidate: ISR_REVALIDATE.TEAM_MEMBERS,
        };
    }
};

// Generate static props for homepage with all necessary data
export const getHomepageStaticProps = async () => {
    try {
        // Import functions here to avoid circular dependencies
        const { getRecentPosts, getPopularServices, getFeaturedTestimonials } = await import('./wordpress-api.js');

        const [
            { posts: recentPosts, error: postsError },
            { services: popularServices, error: servicesError },
            { testimonials: featuredTestimonials, error: testimonialsError }
        ] = await Promise.all([
            getRecentPosts(3, false),
            getPopularServices(6, false),
            getFeaturedTestimonials(6, false)
        ]);

        // Handle errors gracefully - don't fail the entire page
        const props = {
            recentPosts: postsError ? [] : recentPosts,
            popularServices: servicesError ? [] : popularServices,
            featuredTestimonials: testimonialsError ? [] : featuredTestimonials,
            lastUpdated: new Date().toISOString(),
            errors: {
                posts: postsError,
                services: servicesError,
                testimonials: testimonialsError,
            },
        };

        return {
            props,
            revalidate: ISR_REVALIDATE.HOMEPAGE,
        };
    } catch (error) {
        console.error('Error generating homepage static props:', error);

        // Return empty data rather than failing
        return {
            props: {
                recentPosts: [],
                popularServices: [],
                featuredTestimonials: [],
                lastUpdated: new Date().toISOString(),
                errors: {
                    posts: { type: 'FETCH_ERROR', message: error.message },
                    services: { type: 'FETCH_ERROR', message: error.message },
                    testimonials: { type: 'FETCH_ERROR', message: error.message },
                },
            },
            revalidate: ISR_REVALIDATE.HOMEPAGE,
        };
    }
};

// Utility function to trigger revalidation for specific paths
export const triggerRevalidation = async (paths, revalidateSecret) => {
    if (!revalidateSecret) {
        console.error('Revalidation secret not provided');
        return { success: false, error: 'Missing revalidation secret' };
    }

    const results = [];

    for (const path of paths) {
        try {
            const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revalidate?secret=${revalidateSecret}&path=${encodeURIComponent(path)}`;

            const response = await fetch(url, { method: 'POST' });
            const result = await response.json();

            results.push({
                path,
                success: response.ok,
                result,
            });
        } catch (error) {
            results.push({
                path,
                success: false,
                error: error.message,
            });
        }
    }

    return {
        success: results.every(r => r.success),
        results,
    };
};

// Helper function to determine which paths need revalidation based on content type
export const getRevalidationPaths = (contentType, slug = null) => {
    const paths = ['/'];

    switch (contentType) {
        case 'post':
            paths.push('/blog');
            if (slug) paths.push(`/blog/${slug}`);
            break;

        case 'page':
            if (slug && slug !== 'home') paths.push(`/${slug}`);
            break;

        case 'service':
            paths.push('/servicos');
            if (slug) paths.push(`/servicos/${slug}`);
            break;

        case 'team_member':
            paths.push('/equipe');
            if (slug) paths.push(`/equipe/${slug}`);
            break;

        case 'testimonial':
            paths.push('/depoimentos');
            break;

        default:
            // For unknown content types, just revalidate homepage
            break;
    }

    return paths;
};