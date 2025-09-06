import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import { apiService } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  apiService: {
    getProduct: jest.fn(),
    addToCart: jest.fn(),
    getCart: jest.fn(),
    removeFromCart: jest.fn(),
  },
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' }),
}));

describe('Cart Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('user can add product to cart from product detail page', async () => {
    // Mock product data
    const mockProduct = {
      id: 1,
      seller_id: 1,
      name: 'Test Product',
      description: 'This is a test product',
      price: 99.99,
      category: 'Electronics',
      condition: 'New',
      eco_rating: 4,
      eco_details: 'Eco-friendly materials',
      status: 'active',
      views: 10,
      created_at: '2023-06-01T12:00:00Z',
      updated_at: '2023-06-01T12:00:00Z',
      image_urls: ['https://example.com/image.jpg'],
      seller_name: 'Test Seller'
    };

    // Mock API responses
    (apiService.getProduct as jest.Mock).mockResolvedValue(mockProduct);
    (apiService.addToCart as jest.Mock).mockResolvedValue({ message: 'Product added to cart successfully' });
    
    // Render product detail page
    render(
      <BrowserRouter>
        <ProductDetail />
      </BrowserRouter>
    );
    
    // Wait for product to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    // Select quantity
    const quantitySelect = screen.getByLabelText(/quantity/i);
    fireEvent.change(quantitySelect, { target: { value: '2' } });
    
    // Click add to cart button
    const addToCartButton = screen.getByText(/add to cart/i);
    fireEvent.click(addToCartButton);
    
    // Verify API was called with correct parameters
    await waitFor(() => {
      expect(apiService.addToCart).toHaveBeenCalledWith({
        product_id: 1,
        quantity: 2,
      });
    });
    
    // Mock cart data
    const mockCart = {
      id: 1,
      items: [
        {
          id: 1,
          product_id: 1,
          quantity: 2,
          added_at: '2023-06-01T12:00:00Z',
          product_name: 'Test Product',
          product_price: 99.99,
          product_image_url: 'https://example.com/image.jpg',
          total_price: 199.98
        }
      ],
      total_items: 2,
      total_amount: 199.98
    };
    
    (apiService.getCart as jest.Mock).mockResolvedValue(mockCart);
    
    // Render cart page
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    
    // Wait for cart to load
    await waitFor(() => {
      expect(screen.getByText(/your cart/i)).toBeInTheDocument();
    });
    
    // Verify cart displays correct items
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
    expect(screen.getByText('Total: $199.98')).toBeInTheDocument();
    
    // Mock removeFromCart API call
    (apiService.removeFromCart as jest.Mock).mockResolvedValue({ message: 'Product removed from cart' });
    (apiService.getCart as jest.Mock).mockResolvedValue({
      id: 1,
      items: [],
      total_items: 0,
      total_amount: 0
    });
    
    // Remove item from cart
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);
    
    // Verify API was called with correct parameters
    await waitFor(() => {
      expect(apiService.removeFromCart).toHaveBeenCalledWith(1);
    });
    
    // Verify empty cart message is displayed
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });
});
