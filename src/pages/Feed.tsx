import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  seller: string;
  ecoRating: number;
}

const Feed: React.FC = () => {
  // This would be replaced with actual API call
  const sampleProducts: Product[] = [];
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Discover Eco-Friendly Products</h2>
      
      {sampleProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-primary-dark font-bold">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Seller: {product.seller}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm">Eco Rating: {product.ecoRating}/5</span>
                  {/* TODO: Add star rating component */}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded">
          <p>No products available yet. Check back soon!</p>
        </div>
      )}
      
      {/* TODO: Add pagination, filtering options */}
    </div>
  );
};

export default Feed;
