import React from 'react';
import { useParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  category: string;
  condition: string;
  ecoRating: number;
  ecoDetails: string;
  dateAdded: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // This would be replaced with an actual API call using the id
  const product: Product | null = null;
  
  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading product details...</p>
        {/* Or display a "product not found" message */}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {/* Image gallery would go here */}
        <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Product Image Placeholder</span>
        </div>
        
        <div className="mt-4 grid grid-cols-5 gap-2">
          {product.images.map((img, i) => (
            <div key={i} className="bg-gray-100 h-16 rounded-md"></div>
          ))}
        </div>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-xl font-semibold text-primary-dark mt-2">${product.price.toFixed(2)}</p>
        
        <div className="mt-4">
          <h3 className="font-semibold">Description</h3>
          <p className="mt-1 text-gray-700">{product.description}</p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p>{product.category}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Condition</h3>
            <p>{product.condition}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Seller</h3>
            <p>{product.seller.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Listed</h3>
            <p>{product.dateAdded}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">Sustainability Details</h3>
          <div className="flex items-center mt-1">
            <div className="mr-2">
              Eco Rating: {product.ecoRating}/5
            </div>
            {/* TODO: Add rating stars component */}
          </div>
          <p className="mt-2 text-green-800">{product.ecoDetails}</p>
        </div>
        
        <div className="mt-8 flex space-x-4">
          <button className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg">
            Add to Cart
          </button>
          <button className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-50">
            Contact Seller
          </button>
        </div>
      </div>
      
      {/* TODO: Add reviews section, related products */}
    </div>
  );
};

export default ProductDetail;
