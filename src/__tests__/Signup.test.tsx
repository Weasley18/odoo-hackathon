import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect } from 'vitest';
import Signup from '../pages/Signup';
import { AuthProvider } from '../contexts/AuthContext';
import * as apiModule from '../services/api';

// Mock the api module
vi.mock('../services/api', () => {
  return {
    auth: {
      signup: vi.fn(),
      login: vi.fn()
    }
  };
});

describe('Signup Component', () => {
  test('renders signup form with all fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Create Your EcoFinds Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
  });

  test('validates form fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const signupButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signupButton);
    
    // Empty form validation (since required attributes handle it in the browser)
    // We'll test specific password validation errors
    
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    // Test short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    // Test password without uppercase
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Password must contain at least one uppercase letter/i)).toBeInTheDocument();
    });
    
    // Test password mismatch
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
    fireEvent.click(signupButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('submits form and calls api.signup', async () => {
    // Mock the signup and login functions
    const mockSignup = vi.spyOn(apiModule.auth, 'signup')
      .mockResolvedValueOnce({ id: 1, email: 'test@example.com', name: 'testuser' });
    const mockLogin = vi.spyOn(apiModule.auth, 'login')
      .mockResolvedValueOnce({ access_token: 'test-token', token_type: 'bearer' });
    
    // Mock navigate function
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    // Verify the API was called with the correct data
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'Password123', 'testuser');
    });
  });
});
