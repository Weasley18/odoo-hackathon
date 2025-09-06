import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the lazy-loaded components
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: () => ({ default: () => <div data-testid="mocked-page">Mocked Page</div> })
  };
});

describe('App', () => {
  it('renders without errors', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('EcoFinds')).toBeInTheDocument();
  });

  // TODO: Add more tests for navigation, routing, etc.
});
