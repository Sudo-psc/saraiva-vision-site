import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogPage from '../BlogPage';
import { vi } from 'vitest';

// Mock the WordPress hooks
vi.mock('@/hooks/useWordPress', () => ({
  usePosts: vi.fn(() => ({
    data: [
      {
        id: 1,
        slug: 'test-post',
        title: { rendered: 'Test Post Title' },
        excerpt: { rendered: 'Test post excerpt' },
        date: '2024-01-01T00:00:00.000Z',
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://example.com/image.jpg',
            alt_text: 'Test image'
          }],
          author: [{ name: 'Test Author' }]
        }
      }
    ],
    loading: false,
    error: null
  })),
  useCategories: vi.fn(() => ({
    data: [
      { id: 1, name: 'Test Category', slug: 'test-category' }
    ],
    loading: false
  })),
  usePostSearch: vi.fn(() => ({
    results: [],
    loading: false
  }))
}));

// Mock Navbar and Footer to avoid framer-motion AnimatePresence dependency in layout
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar" />
}));
vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer" />
}));

// Mock the WordPress lib functions used by BlogPage
vi.mock('@/lib/wordpress', () => ({
  fetchPosts: vi.fn(() => Promise.resolve([
    {
      id: 1,
      slug: 'test-post',
      title: { rendered: 'Test Post Title' },
      excerpt: { rendered: 'Test post excerpt' },
      date: '2024-01-01T00:00:00.000Z',
      _embedded: {
        'wp:featuredmedia': [{
          source_url: 'https://example.com/image.jpg',
          alt_text: 'Test image',
          media_details: { sizes: { large: { source_url: 'https://example.com/image-large.jpg' } } }
        }],
        author: [{ name: 'Test Author' }],
        'wp:term': [[{ name: 'Test Category' }]]
      }
    }
  ])),
  fetchCategories: vi.fn(() => Promise.resolve([
    { id: 1, name: 'Test Category', slug: 'test-category' }
  ])),
  checkWordPressConnection: vi.fn(() => Promise.resolve(true)),
  extractPlainText: vi.fn((html) => html?.replace(/<[^>]*>/g, '') || ''),
  getFeaturedImageUrl: vi.fn(() => 'https://example.com/image.jpg'),
  getAuthorInfo: vi.fn(() => ({ name: 'Test Author' }))
}));

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => {
      const map = {
        'blog.page_title': 'Blog',
        'blog.page_subtitle': 'Artigos e novidades sobre saúde ocular',
        'blog.search_placeholder': 'Buscar artigos...',
        'blog.all_categories': 'Todas as categorias',
        'blog.read_more': 'Ler mais'
      };
      return map[key] || defaultValue || key;
    },
    i18n: { language: 'pt' }
  })
}));

// Mock framer-motion used inside the page
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    article: ({ children, ...props }) => <article {...props}>{children}</article>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

const TestWrapper = ({ children }) => (
  <MemoryRouter>
    <HelmetProvider>
      {children}
    </HelmetProvider>
  </MemoryRouter>
);

describe('BlogPage', () => {
  it('renders blog page with title and subtitle', async () => {
    render(
      <TestWrapper>
        <BlogPage />
      </TestWrapper>
    );

    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Artigos e novidades sobre saúde ocular')).toBeInTheDocument();
  });

  it('displays posts when loaded', async () => {
    render(
      <TestWrapper>
        <BlogPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });
  });

  it('shows search input', () => {
    render(
      <TestWrapper>
        <BlogPage />
      </TestWrapper>
    );

    return waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar artigos...')).toBeInTheDocument();
    });
  });

  it('displays category filter', () => {
    render(
      <TestWrapper>
        <BlogPage />
      </TestWrapper>
    );

    return waitFor(() => {
      expect(screen.getByText('Todas as categorias')).toBeInTheDocument();
      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });
  });

  it('renders proper meta tags', () => {
    render(
      <TestWrapper>
        <BlogPage />
      </TestWrapper>
    );

    // Check that Helmet is setting the title
    return waitFor(() => {
      expect(document.title).toContain('Blog');
    });
  });
});
