import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';

describe('Button Component', () => {
  // 1. Component Rendering Test
  it('should render the button with default props', () => {
    render(<Button>Click Me</Button>);
    
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
    // Check for default classes (primary variant and md size)
    expect(buttonElement).toHaveClass('bg-primary-600', 'h-10');
  });

  // 2. Props Rendering Test
  it('should render correct variant and size classes based on props', () => {
    render(
      <Button variant="danger" size="lg">
        Delete
      </Button>
    );
    
    const buttonElement = screen.getByRole('button', { name: /delete/i });
    expect(buttonElement).toHaveClass('bg-red-500', 'h-12');
  });

  // 3. User Interaction Test
  it('should call onClick handler exactly once when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    
    const buttonElement = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(buttonElement);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 4. Custom Class Name Merging Test
  it('should merge custom className with default classes', () => {
    render(<Button className="custom-class-name">Custom</Button>);
    
    const buttonElement = screen.getByRole('button', { name: /custom/i });
    expect(buttonElement).toHaveClass('custom-class-name');
    expect(buttonElement).toHaveClass('inline-flex'); // one of the default classes
  });

  // 5. Loading State Test
  it('should display loading spinner and disable button when isLoading is true', () => {
    render(<Button isLoading={true}>Save</Button>);
    
    const buttonElement = screen.getByRole('button', { name: /save/i });
    
    // The button should be disabled
    expect(buttonElement).toBeDisabled();
    
    // The SVG spinner should be present (finding by role or SVG element)
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  // 6. Forward Ref Test
  it('should correctly forward the ref to the native button element', () => {
    const ref = React.createRef();
    render(<Button ref={ref}>Ref Button</Button>);
    
    const buttonElement = screen.getByRole('button', { name: /ref button/i });
    expect(ref.current).toBe(buttonElement);
  });
});
