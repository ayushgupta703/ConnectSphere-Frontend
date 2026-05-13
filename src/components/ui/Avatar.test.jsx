import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Avatar from './Avatar';

describe('Avatar Component', () => {
  it('should render initials when no src is provided', () => {
    render(<Avatar name="John Doe" size="md" />);
    
    // Check if the initials "J" are rendered
    const initialsElement = screen.getByText('J');
    expect(initialsElement).toBeInTheDocument();
  });

  it('should apply the correct size classes based on size prop', () => {
    const { container } = render(<Avatar name="Alice" size="lg" />);
    
    // The wrapper div is the first child
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('h-12', 'w-12', 'text-lg');
  });
});
