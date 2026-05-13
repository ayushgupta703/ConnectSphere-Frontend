import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from './Input';

describe('Input Component', () => {
  it('should render the input field correctly', () => {
    render(<Input placeholder="Enter text here" />);
    
    const inputElement = screen.getByPlaceholderText('Enter text here');
    expect(inputElement).toBeInTheDocument();
  });

  it('should render a label when the label prop is provided', () => {
    render(<Input label="Email Address" id="email-input" />);
    
    const labelElement = screen.getByText('Email Address');
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', 'email-input');
  });

  it('should display an error message and apply error styles when error prop is provided', () => {
    render(<Input error="Invalid email address" id="error-input" />);
    
    const errorMessage = screen.getByText('Invalid email address');
    expect(errorMessage).toBeInTheDocument();
    
    // Test for error class
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('border-red-500');
  });
});
