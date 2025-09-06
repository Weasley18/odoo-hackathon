import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../services/api';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      data-testid="product-card"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.image_urls.length > 0 ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {product.eco_rating && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.eco_rating}/5
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-primary-dark font-bold text-xl mt-1" data-testid="product-price">
          ${product.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          by {product.seller_name}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
          <span className="text-xs text-gray-500">
            {product.condition}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
