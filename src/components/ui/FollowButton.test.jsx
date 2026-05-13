import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowButton from './FollowButton';
import useAuthStore from '../../store/useAuthStore';
import { followService } from '../../services/followService';

// Mock dependencies
jest.mock('../../store/useAuthStore');
jest.mock('../../services/followService', () => ({
  followService: {
    isFollowing: jest.fn()
  }
}));

describe('FollowButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render anything if the user is viewing their own profile', () => {
    // Current user id is '1', target userId is '1'
    useAuthStore.mockReturnValue({ user: { id: '1' } });
    
    const { container } = render(<FollowButton userId="1" />);
    
    // The component returns null when viewing own profile
    expect(container.firstChild).toBeNull();
  });

  it('should render a Follow button when not following the user initially', () => {
    useAuthStore.mockReturnValue({ user: { id: '1' } }); // Current user
    followService.isFollowing.mockResolvedValue(false);
    
    render(<FollowButton userId="2" initialIsFollowing={false} />);
    
    const buttonElement = screen.getByRole('button', { name: /follow/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent('Follow');
  });

  it('should render a Following button when already following the user', () => {
    useAuthStore.mockReturnValue({ user: { id: '1' } }); // Current user
    followService.isFollowing.mockResolvedValue(true);
    
    render(<FollowButton userId="2" initialIsFollowing={true} />);
    
    const buttonElement = screen.getByRole('button', { name: /following/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent('Following');
  });
});
