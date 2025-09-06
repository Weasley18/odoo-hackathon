import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, Product } from '../services/api';
import ProductCard from '../components/ProductCard';

const Feed: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load products when search query or category changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getProducts({
          q: searchQuery || undefined,
          category: selectedCategory || undefined,
          limit: 20,
        });
        setProducts(response.products);
        setHasMore(response.has_more);
        setNextCursor(response.next_cursor || null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, selectedCategory]);

  const loadMoreProducts = async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    setLoadingMore(true);
    try {
      const response = await apiService.getProducts({
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        cursor: nextCursor,
        limit: 20,
      });
      setProducts(prev => [...prev, ...response.products]);
      setHasMore(response.has_more);
      setNextCursor(response.next_cursor || null);
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
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
      <h2 className="text-2xl font-bold mb-6">Discover Eco-Friendly Products</h2>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Filtered by: {searchQuery && `"${searchQuery}"`} {searchQuery && selectedCategory && '•'} {selectedCategory}
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary-dark underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMoreProducts}
                disabled={loadingMore}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filter criteria.'
              : 'No products available yet. Check back soon!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;
