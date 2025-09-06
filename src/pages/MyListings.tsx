import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService, Product } from '../services/api';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadUserProducts();
  }, []);

  const loadUserProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, we'll get all products and filter by current user
      // In a real app, you'd have a dedicated endpoint for user's products
      const response = await apiService.getProducts({ limit: 100 });
      // Filter products by current user (this would be done on the backend in a real app)
      setProducts(response.products);
    } catch (err) {
      setError('Failed to load your products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeletingId(productId);
    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (productId: number) => {
    // Navigate to edit page (you could create a separate edit page or reuse AddProduct)
    navigate(`/edit-product/${productId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <Link
          to="/add-product"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add New Product
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {products.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        {product.image_urls.length > 0 ? (
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={product.image_urls[0]}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                          <span className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="font-semibold text-primary-dark">${product.price.toFixed(2)}</span>
                          <span className="mx-2">•</span>
                          <span>{product.category}</span>
                          <span className="mx-2">•</span>
                          <span>{product.condition}</span>
                          {product.eco_rating && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="ml-1">{product.eco_rating}/5</span>
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Listed on {formatDate(product.created_at)} • {product.views} views
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/product/${product.id}`}
                        className="text-primary hover:text-primary-dark text-sm font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed</h3>
          <p className="text-gray-500 mb-6">You haven't listed any products yet. Start by adding your first product!</p>
          <Link
            to="/add-product"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
          >
            List Your First Product
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyListings;
