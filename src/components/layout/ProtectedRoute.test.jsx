import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '../../store/useAuthStore';
import { Navigate } from 'react-router-dom';

// Mock the external dependencies
jest.mock('../../store/useAuthStore');
jest.mock('react-router-dom', () => ({
  Navigate: jest.fn(() => null)
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true });

    const { getByText } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render Navigate component redirecting to login when not authenticated', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Verify Navigate was called with the correct props
    expect(Navigate).toHaveBeenCalledWith({ to: '/login', replace: true }, {});
  });
});
