import React from 'react';

const AddProduct: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">List a New Product</h2>
      
      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price ($)
          </label>
          <input
            type="number"
            id="price"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option>Clothing</option>
            <option>Home Goods</option>
            <option>Electronics</option>
            <option>Beauty</option>
            <option>Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Product Images
          </label>
          <input
            type="file"
            id="image"
            className="mt-1 block w-full"
            multiple
          />
          <p className="mt-1 text-xs text-gray-500">Upload up to 5 images (JPEG or PNG)</p>
        </div>
        
        <div>
          <label htmlFor="ecoDetails" className="block text-sm font-medium text-gray-700">
            Sustainability Details
          </label>
          <textarea
            id="ecoDetails"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Describe what makes this product eco-friendly..."
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            List Product
          </button>
        </div>
      </form>
      
      {/* TODO: Add form validation and submission logic */}
    </div>
  );
};

export default AddProduct;
