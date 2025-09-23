import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InstagramFeed from '../components/InstagramFeed';

// Mock the Instagram hook
const mockInstagramHook = {
  posts: [],
  loading: false,
  error: null,
  refresh: vi.fn(),
  lastFetch: new Date(),
  cached: false,
  isStale: false
};

vi.mock('../hooks/useInstagramFeed', () => ({
  useInstagramFeed: vi.fn(() => mockInstagramHook)
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    section: 'section',
    div: 'div',
    img: 'img'
  },
  AnimatePresence: ({ children }) => children
}));

describe('InstagramFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state correctly', () => {
    mockInstagramHook.loading = true;
    mockInstagramHook.posts = [];

    render(<InstagramFeed />);

    expect(screen.getByText('Carregando posts do Instagram...')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    mockInstagramHook.loading = false;
    mockInstagramHook.error = 'Failed to fetch posts';
    mockInstagramHook.posts = [];

    render(<InstagramFeed />);

    expect(screen.getByText('Não foi possível carregar os posts')).toBeInTheDocument();
    expect(screen.getByText('Verifique sua conexão ou tente novamente mais tarde')).toBeInTheDocument();
  });

  it('renders posts correctly', () => {
    const mockPosts = [
      {
        id: '1',
        caption: 'Test post 1',
        media_type: 'IMAGE',
        media_url: '/test-image-1.jpg',
        permalink: 'https://instagram.com/p/test1',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'saraivavision'
      },
      {
        id: '2',
        caption: 'Test post 2',
        media_type: 'IMAGE',
        media_url: '/test-image-2.jpg',
        permalink: 'https://instagram.com/p/test2',
        timestamp: '2024-01-02T12:00:00Z',
        username: 'saraivavision'
      }
    ];

    mockInstagramHook.loading = false;
    mockInstagramHook.error = null;
    mockInstagramHook.posts = mockPosts;

    render(<InstagramFeed />);

    expect(screen.getByText('Acompanhe no Instagram')).toBeInTheDocument();
    expect(screen.getByText('Fique por dentro das novidades, dicas de saúde ocular e conteúdos exclusivos')).toBeInTheDocument();
    expect(screen.getByText('Seguir @saraivavision')).toBeInTheDocument();
  });

  it('calls refresh function when refresh button is clicked', async () => {
    mockInstagramHook.loading = false;
    mockInstagramHook.posts = [
      {
        id: '1',
        caption: 'Test post',
        media_type: 'IMAGE',
        media_url: '/test-image.jpg',
        permalink: 'https://instagram.com/p/test',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'saraivavision'
      }
    ];

    render(<InstagramFeed />);

    const refreshButton = screen.getByLabelText('Atualizar posts do Instagram');
    fireEvent.click(refreshButton);

    expect(mockInstagramHook.refresh).toHaveBeenCalledTimes(1);
  });

  it('renders with custom props correctly', () => {
    const customProps = {
      limit: 6,
      className: 'custom-class',
      showHeader: false,
      showRefreshButton: false,
      autoRefresh: false
    };

    mockInstagramHook.posts = [];

    const { container } = render(<InstagramFeed {...customProps} />);

    expect(container.firstChild).toHaveClass('custom-class');
    expect(screen.queryByText('Acompanhe no Instagram')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Atualizar posts do Instagram')).not.toBeInTheDocument();
  });

  it('shows cache indicator when posts are cached', () => {
    mockInstagramHook.cached = true;
    mockInstagramHook.posts = [
      {
        id: '1',
        caption: 'Cached post',
        media_type: 'IMAGE',
        media_url: '/cached-image.jpg',
        permalink: 'https://instagram.com/p/cached',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'saraivavision'
      }
    ];

    render(<InstagramFeed />);

    expect(screen.getByText('Cache ativo')).toBeInTheDocument();
  });

  it('shows stale indicator when posts are stale', () => {
    mockInstagramHook.isStale = true;
    mockInstagramHook.posts = [
      {
        id: '1',
        caption: 'Stale post',
        media_type: 'IMAGE',
        media_url: '/stale-image.jpg',
        permalink: 'https://instagram.com/p/stale',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'saraivavision'
      }
    ];

    render(<InstagramFeed />);

    expect(screen.getByText('Atualizando em breve')).toBeInTheDocument();
  });

  it('handles post click correctly', () => {
    const mockOnPostClick = vi.fn();
    const mockPost = {
      id: '1',
      caption: 'Clickable post',
      media_type: 'IMAGE',
      media_url: '/clickable-image.jpg',
      permalink: 'https://instagram.com/p/clickable',
      timestamp: '2024-01-01T12:00:00Z',
      username: 'saraivavision'
    };

    mockInstagramHook.posts = [mockPost];

    render(<InstagramFeed onPostClick={mockOnPostClick} />);

    const postCard = screen.getByLabelText('Post do Instagram: Clickable post');
    fireEvent.click(postCard);

    expect(mockOnPostClick).toHaveBeenCalledWith(mockPost);
  });

  it('has proper accessibility attributes', () => {
    mockInstagramHook.posts = [
      {
        id: '1',
        caption: 'Accessible post',
        media_type: 'IMAGE',
        media_url: '/accessible-image.jpg',
        permalink: 'https://instagram.com/p/accessible',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'saraivavision'
      }
    ];

    render(<InstagramFeed />);

    expect(screen.getByLabelText('Seguir @saraivavision no Instagram')).toBeInTheDocument();
    expect(screen.getByRole('main', { hidden: true })).toBeInTheDocument();
  });
});