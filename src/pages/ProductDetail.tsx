import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, Product } from '../services/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const productData = await apiService.getProduct(parseInt(id));
        setProduct(productData);
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await apiService.addToCart({
        product_id: product.id,
        quantity: quantity,
      });
      
      // Show success message (you could use a toast notification here)
      alert('Product added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // First add to cart, then navigate to cart
    try {
      await apiService.addToCart({
        product_id: product.id,
        quantity: quantity,
      });
      navigate('/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
        <p className="text-gray-500 mb-4">
          {error || 'The product you are looking for does not exist or has been removed.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.image_urls.length > 0 ? (
              <img
                src={product.image_urls[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {product.image_urls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.image_urls.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary-dark">${product.price.toFixed(2)}</p>
          </div>

          {/* Product Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="text-gray-900">{product.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Condition</h3>
              <p className="text-gray-900">{product.condition}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Seller</h3>
              <p className="text-gray-900">{product.seller_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Listed</h3>
              <p className="text-gray-900">{formatDate(product.created_at)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Sustainability Details */}
          {product.eco_rating && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Sustainability Details</h3>
              <div className="flex items-center mb-2">
                <span className="text-sm text-green-700 mr-2">Eco Rating:</span>
                <div className="flex items-center">
                  {renderStars(product.eco_rating)}
                  <span className="ml-2 text-sm text-green-700">({product.eco_rating}/5)</span>
                </div>
              </div>
              {product.eco_details && (
                <p className="text-green-800 text-sm">{product.eco_details}</p>
              )}
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="border-t pt-6">
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t text-sm text-gray-500">
            <p>Views: {product.views}</p>
            <p>Last updated: {formatDate(product.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
