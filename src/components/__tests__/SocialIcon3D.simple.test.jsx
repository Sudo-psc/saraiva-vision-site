import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <div>{children}</div>,
}));

// Import the component directly
import SocialIcon3D from '../SocialIcon3D.jsx';

describe('SocialIcon3D Simple Test', () => {
    const mockSocial = {
        name: 'Facebook',
        href: 'https://facebook.com/test',
        image: '/icons_social/facebook_icon.png',
        color: '#1877f2'
    };

    const mockOnHover = vi.fn();
    const defaultProps = {
        social: mockSocial,
        index: 0,
        isHovered: false,
        onHover: mockOnHover
    };

    it('renders without crashing', () => {
        expect(() => {
            render(<SocialIcon3D {...defaultProps} />);
        }).not.toThrow();
    });

    it('renders social icon name', () => {
        render(<SocialIcon3D {...defaultProps} />);
        expect(screen.getByText('Facebook')).toBeInTheDocument();
    });
});