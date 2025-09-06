import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../services/api';

// Mock product data
const mockProduct: Product = {
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

// Wrapper component for router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('ProductCard Component', () => {
  test('renders product information correctly', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    // Check if product name is displayed
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    // Check if price is displayed correctly
    expect(screen.getByTestId('product-price')).toHaveTextContent('$99.99');
    
    // Check if seller name is displayed
    expect(screen.getByText(/by Test Seller/i)).toBeInTheDocument();
    
    // Check if category is displayed
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    
    // Check if condition is displayed
    expect(screen.getByText('New')).toBeInTheDocument();
    
    // Check if eco rating is displayed
    expect(screen.getByText('4/5')).toBeInTheDocument();
    
    // Check if the link points to the correct product detail page
    const cardLink = screen.getByTestId('product-card');
    expect(cardLink).toHaveAttribute('href', '/product/1');
    
    // Check if image is rendered
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
  
  test('renders placeholder when no image is available', () => {
    const productWithoutImage = { ...mockProduct, image_urls: [] };
    renderWithRouter(<ProductCard product={productWithoutImage} />);
    
    // Check if SVG placeholder is rendered
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
  
  test('does not render eco rating badge when eco_rating is not provided', () => {
    const productWithoutEcoRating = { ...mockProduct, eco_rating: undefined };
    renderWithRouter(<ProductCard product={productWithoutEcoRating} />);
    
    // Check that eco rating badge is not rendered
    expect(screen.queryByText('4/5')).not.toBeInTheDocument();
  });
});
