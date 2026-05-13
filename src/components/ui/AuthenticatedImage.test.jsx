import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthenticatedImage from './AuthenticatedImage';

describe('AuthenticatedImage Component', () => {
  it('should render a loading skeleton/placeholder initially while fetching', () => {
    const { container } = render(
      <AuthenticatedImage url="http://example.com/image.jpg" />
    );
    
    // Initially, it renders a div with animate-pulse class before image loads
    const placeholder = container.firstChild;
    expect(placeholder.nodeName.toLowerCase()).toBe('div');
    expect(placeholder).toHaveClass('animate-pulse', 'bg-gray-100');
  });

  it('should pass custom className to the element', () => {
    const { container } = render(
      <AuthenticatedImage url="http://example.com/image.jpg" className="custom-img-class" />
    );
    
    const placeholder = container.firstChild;
    expect(placeholder).toHaveClass('custom-img-class');
  });
});
