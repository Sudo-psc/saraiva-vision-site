// Component scenario testing for ReviewCard
// Tests various data scenarios to ensure component robustness

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewCard from '../ReviewCard.jsx';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon">★</div>,
  Clock: () => <div data-testid="clock-icon">⏰</div>,
  MessageSquare: () => <div data-testid="message-icon">💬</div>,
  ThumbsUp: () => <div data-testid="thumbsup-icon">👍</div>,
  Share2: () => <div data-testid="share-icon">📤</div>,
  ChevronDown: () => <div data-testid="chevron-down">▼</div>,
  ChevronUp: () => <div data-testid="chevron-up">▲</div>,
}));

// Mock navigator.share and clipboard
Object.assign(navigator, {
  share: jest.fn().mockResolvedValue(),
  clipboard: {
    writeText: jest.fn().mockResolvedValue(),
  },
});

describe('ReviewCard Component Scenarios', () => {

  // Test Case 1: Perfect data scenario
  describe('Perfect Data Scenario', () => {
    const perfectReview = {
      id: 'perfect1',
      reviewer: {
        displayName: 'Dr. Ana Silva',
        profilePhotoUrl: 'https://example.com/ana.jpg',
        isAnonymous: false
      },
      starRating: 5,
      comment: 'Excelente atendimento oftalmológico. Equipa muito profissional.',
      createTime: '2024-01-15T10:30:00Z',
      isRecent: true,
      hasResponse: true,
      wordCount: 8,
      reviewReply: {
        comment: 'Agradecemos a sua confiança na Saraiva Vision!',
        updateTime: '2024-01-16T09:00:00Z'
      }
    };

    test('should render perfect review data correctly', () => {
      render(<ReviewCard review={perfectReview} />);

      expect(screen.getByText('Dr. Ana Silva')).toBeInTheDocument();
      expect(screen.getByText('Excelente atendimento oftalmológico.')).toBeInTheDocument();
      expect(screen.getByText('Agradecemos a sua confiança na Saraiva Vision!')).toBeInTheDocument();

      // Should show recent badge
      expect(screen.getByText(' recente')).toBeInTheDocument();

      // Should show 5 stars
      const stars = screen.getAllByTestId('star-icon');
      expect(stars).toHaveLength(5); // 5 rating stars + others
    });

    test('should handle interaction actions', () => {
      render(<ReviewCard review={perfectReview} />);

      // Test like button
      const likeButton = screen.getByText('Útil');
      fireEvent.click(likeButton);
      expect(likeButton).toHaveClass('text-red-600');

      // Test share button
      const shareButton = screen.getByText('Compartilhar');
      fireEvent.click(shareButton);
      expect(navigator.share).toHaveBeenCalled();
    });
  });

  // Test Case 2: Missing reviewer scenario
  describe('Missing Reviewer Scenario', () => {
    const noReviewerReview = {
      id: 'no-reviewer',
      starRating: 4,
      comment: 'Bom serviço'
    };

    test('should render with fallback reviewer info', () => {
      render(<ReviewCard review={noReviewerReview} />);

      expect(screen.getByText('Anônimo')).toBeInTheDocument();

      // Should show avatar with initial 'A'
      const avatar = screen.getByText('A');
      expect(avatar).toBeInTheDocument();
    });
  });

  // Test Case 3: Null/undefined review scenario
  describe('Null/Undefined Review Scenario', () => {
    test('should render fallback UI for null review', () => {
      render(<ReviewCard review={null} />);

      expect(screen.getByText('Avaliação não disponível')).toBeInTheDocument();
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    });

    test('should render fallback UI for undefined review', () => {
      render(<ReviewCard review={undefined} />);

      expect(screen.getByText('Avaliação não disponível')).toBeInTheDocument();
    });

    test('should render fallback UI for non-object review', () => {
      render(<ReviewCard review="invalid" />);

      expect(screen.getByText('Avaliação não disponível')).toBeInTheDocument();
    });
  });

  // Test Case 4: Partial data scenario
  describe('Partial Data Scenario', () => {
    const partialReview = {
      id: 'partial',
      reviewer: {
        displayName: '', // Empty name
        profilePhotoUrl: null // No photo
      },
      starRating: 3,
      comment: '', // Empty comment
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should handle partial data gracefully', () => {
      render(<ReviewCard review={partialReview} />);

      expect(screen.getByText('Anônimo')).toBeInTheDocument();

      // Should show avatar with initial 'A' (from Anônimo)
      const avatar = screen.getByText('A');
      expect(avatar).toBeInTheDocument();
    });
  });

  // Test Case 5: Long comment scenario
  describe('Long Comment Scenario', () => {
    const longComment = 'Lorem ipsum '.repeat(50); // Very long comment

    const longReview = {
      id: 'long',
      reviewer: { displayName: 'Verbose User' },
      starRating: 5,
      comment: longComment,
      wordCount: 100
    };

    test('should truncate long comments and show expand button', () => {
      render(<ReviewCard review={longReview} maxTextLength={100} />);

      // Should show truncated text with "..."
      const comment = screen.getByText(/Lorem ipsum.*\.\.\./);
      expect(comment).toBeInTheDocument();

      // Should show "Ler mais" button
      const expandButton = screen.getByText('Ler mais');
      expect(expandButton).toBeInTheDocument();

      // Click to expand
      fireEvent.click(expandButton);

      // Should now show "Mostrar menos" button
      const collapseButton = screen.getByText('Mostrar menos');
      expect(collapseButton).toBeInTheDocument();
    });
  });

  // Test Case 6: No comment scenario
  describe('No Comment Scenario', () => {
    const noCommentReview = {
      id: 'no-comment',
      reviewer: { displayName: 'Silent User' },
      starRating: 4,
      comment: '',
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should render without comment section', () => {
      render(<ReviewCard review={noCommentReview} />);

      expect(screen.getByText('Silent User')).toBeInTheDocument();

      // Should not have empty comment text
      expect(screen.queryByText('')).not.toBeInTheDocument();
    });
  });

  // Test Case 7: Featured review scenario
  describe('Featured Review Scenario', () => {
    const featuredReview = {
      id: 'featured',
      reviewer: { displayName: 'VIP User' },
      starRating: 5,
      comment: 'Amazing service!',
      isFeatured: true,
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should show featured badge and styling', () => {
      render(<ReviewCard review={featuredReview} />);

      expect(screen.getByText('Destaque')).toBeInTheDocument();

      // Should have featured styling (yellow border)
      const card = screen.getByText('VIP User').closest('div');
      expect(card).toHaveClass('border-yellow-200');
    });
  });

  // Test Case 8: Anonymous reviewer scenario
  describe('Anonymous Reviewer Scenario', () => {
    const anonymousReview = {
      id: 'anonymous',
      reviewer: {
        displayName: 'Anonymous User',
        isAnonymous: true
      },
      starRating: 4,
      comment: 'Good service',
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should show anonymous indicator', () => {
      render(<ReviewCard review={anonymousReview} />);

      expect(screen.getByText('(Anônimo)')).toBeInTheDocument();
    });
  });

  // Test Case 9: Business reply scenarios
  describe('Business Reply Scenarios', () => {
    const withReply = {
      id: 'with-reply',
      reviewer: { displayName: 'User' },
      starRating: 5,
      comment: 'Great service!',
      reviewReply: {
        comment: 'Thank you for your feedback!',
        updateTime: '2024-01-16T09:00:00Z'
      },
      createTime: '2024-01-15T10:30:00Z'
    };

    const withoutReply = {
      id: 'without-reply',
      reviewer: { displayName: 'User' },
      starRating: 4,
      comment: 'Good service',
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should show business reply when present', () => {
      render(<ReviewCard review={withReply} showReply={true} />);

      expect(screen.getByText('Resposta do estabelecimento')).toBeInTheDocument();
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });

    test('should not show business reply when disabled', () => {
      render(<ReviewCard review={withReply} showReply={false} />);

      expect(screen.queryByText('Resposta do estabelecimento')).not.toBeInTheDocument();
    });

    test('should not show reply section when no reply', () => {
      render(<ReviewCard review={withoutReply} showReply={true} />);

      expect(screen.queryByText('Resposta do estabelecimento')).not.toBeInTheDocument();
    });
  });

  // Test Case 10: Action buttons scenarios
  describe('Action Buttons Scenarios', () => {
    const basicReview = {
      id: 'actions',
      reviewer: { displayName: 'Test User' },
      starRating: 4,
      comment: 'Test comment',
      wordCount: 3,
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should show action buttons when enabled', () => {
      render(<ReviewCard review={basicReview} showActions={true} />);

      expect(screen.getByText('Útil')).toBeInTheDocument();
      expect(screen.getByText('Compartilhar')).toBeInTheDocument();
      expect(screen.getByText('3 palavras')).toBeInTheDocument();
    });

    test('should not show action buttons when disabled', () => {
      render(<ReviewCard review={basicReview} showActions={false} />);

      expect(screen.queryByText('Útil')).not.toBeInTheDocument();
      expect(screen.queryByText('Compartilhar')).not.toBeInTheDocument();
    });

    test('should not show word count when zero', () => {
      const noWordCountReview = { ...basicReview, wordCount: 0 };
      render(<ReviewCard review={noWordCountReview} showActions={true} />);

      expect(screen.queryByText(/\d+ palavras/)).not.toBeInTheDocument();
    });
  });

  // Test Case 11: Image loading scenarios
  describe('Image Loading Scenarios', () => {
    const withImageReview = {
      id: 'with-image',
      reviewer: {
        displayName: 'User with Image',
        profilePhotoUrl: 'https://example.com/image.jpg',
        isAnonymous: false
      },
      starRating: 4,
      comment: 'Has profile image',
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should show profile image when available', () => {
      const { container } = render(<ReviewCard review={withImageReview} />);

      const img = container.querySelector('img[src="https://example.com/image.jpg"]');
      expect(img).toBeInTheDocument();
    });

    test('should show fallback avatar on image error', () => {
      const { container } = render(<ReviewCard review={withImageReview} />);

      const img = container.querySelector('img');

      // Simulate image error
      fireEvent.error(img);

      // Fallback avatar should be visible
      expect(screen.getByText('U')).toBeInTheDocument(); // First letter of "User"
    });
  });

  // Test Case 12: Date formatting scenarios
  describe('Date Formatting Scenarios', () => {
    const formatDateTest = (dateString, expectedText) => {
      const review = {
        id: 'date-test',
        reviewer: { displayName: 'Date User' },
        starRating: 4,
        comment: 'Date test',
        createTime: dateString
      };

      render(<ReviewCard review={review} showDate={true} />);
      return screen.getByText(expectedText);
    };

    test('should format recent dates correctly', () => {
      const today = new Date().toISOString();
      expect(() => formatDateTest(today, /hoje|ontem|há \d+ dias/)).not.toThrow();
    });

    test('should handle invalid dates gracefully', () => {
      expect(() => formatDateTest('invalid-date', '')).not.toThrow();
    });

    test('should not show date when disabled', () => {
      const review = {
        id: 'no-date',
        reviewer: { displayName: 'No Date User' },
        starRating: 4,
        comment: 'No date',
        createTime: '2024-01-15T10:30:00Z'
      };

      render(<ReviewCard review={review} showDate={false} />);

      expect(screen.queryByText(/hoje|ontem|há \d+ dias/)).not.toBeInTheDocument();
    });
  });

  // Test Case 13: Custom styling scenarios
  describe('Custom Styling Scenarios', () => {
    const baseReview = {
      id: 'styled',
      reviewer: { displayName: 'Styled User' },
      starRating: 4,
      comment: 'Styled review',
      createTime: '2024-01-15T10:30:00Z'
    };

    test('should apply custom className', () => {
      const { container } = render(<ReviewCard review={baseReview} className="custom-class" />);

      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    test('should apply different max text lengths', () => {
      const longComment = 'This is a very long comment that should be truncated based on the maxTextLength prop provided to the component.';

      const review = {
        ...baseReview,
        comment: longComment
      };

      render(<ReviewCard review={review} maxTextLength={20} />);

      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
    });
  });

  // Test Case 14: Rating display scenarios
  describe('Rating Display Scenarios', () => {
    const ratingTestCases = [
      { rating: 0, expectedFilled: 0 },
      { rating: 1, expectedFilled: 1 },
      { rating: 2, expectedFilled: 2 },
      { rating: 3, expectedFilled: 3 },
      { rating: 4, expectedFilled: 4 },
      { rating: 5, expectedFilled: 5 },
      { rating: 5.5, expectedFilled: 5 }, // Should cap at 5
    ];

    test.each(ratingTestCases)('should display $rating stars correctly', ({ rating, expectedFilled }) => {
      const review = {
        id: `rating-${rating}`,
        reviewer: { displayName: 'Rating User' },
        starRating: rating,
        comment: 'Rating test',
        createTime: '2024-01-15T10:30:00Z'
      };

      render(<ReviewCard review={review} />);

      const allStars = screen.getAllByTestId('star-icon');
      const filledStars = allStars.filter(star =>
        star.parentElement.classList.contains('fill-yellow-400')
      );

      expect(filledStars.length).toBe(expectedFilled);
    });
  });

  // Test Case 15: Callback handlers scenarios
  describe('Callback Handlers Scenarios', () => {
    const mockOnShare = jest.fn();
    const mockOnLike = jest.fn();

    const review = {
      id: 'callbacks',
      reviewer: { displayName: 'Callback User' },
      starRating: 4,
      comment: 'Callback test',
      createTime: '2024-01-15T10:30:00Z'
    };

    beforeEach(() => {
      mockOnShare.mockClear();
      mockOnLike.mockClear();
    });

    test('should call onShare callback when provided', () => {
      render(<ReviewCard review={review} onShare={mockOnShare} />);

      const shareButton = screen.getByText('Compartilhar');
      fireEvent.click(shareButton);

      expect(mockOnShare).toHaveBeenCalledWith(review);
    });

    test('should call onLike callback when provided', () => {
      render(<ReviewCard review={review} onLike={mockOnLike} />);

      const likeButton = screen.getByText('Útil');
      fireEvent.click(likeButton);

      expect(mockOnLike).toHaveBeenCalledWith(review, true); // Second param is the new like state
    });

    test('should handle navigator.share failure gracefully', () => {
      navigator.share.mockRejectedValue(new Error('Share failed'));

      render(<ReviewCard review={review} />);

      const shareButton = screen.getByText('Compartilhar');
      fireEvent.click(shareButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(review.comment);
    });
  });
});

export default ReviewCard;