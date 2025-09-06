import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, CreateProductData } from '../services/api';

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  eco_rating: string;
  eco_details: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  condition?: string;
  eco_rating?: string;
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    eco_rating: '',
    eco_details: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (formData.eco_rating) {
      const rating = parseInt(formData.eco_rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        newErrors.eco_rating = 'Eco rating must be between 1 and 5';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 5) {
      alert('You can only upload up to 5 images');
      return;
    }

    setImageFiles(files);
    
    // Convert files to data URLs for preview
    const urls: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        urls.push(e.target?.result as string);
        if (urls.length === files.length) {
          setImageUrls(urls);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const productData: CreateProductData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        eco_rating: formData.eco_rating ? parseInt(formData.eco_rating) : undefined,
        eco_details: formData.eco_details.trim() || undefined,
        image_urls: imageUrls, // For now, using data URLs. In production, upload to S3
      };

      await apiService.createProduct(productData);
      
      // Redirect to product feed or user's listings
      navigate('/my-listings');
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Failed to create product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">List a New Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe your product in detail..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        
        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary ${
              errors.price ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
        
        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
            Condition *
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary ${
              errors.condition ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select condition</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
          {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
        </div>
        
        {/* Eco Rating */}
        <div>
          <label htmlFor="eco_rating" className="block text-sm font-medium text-gray-700">
            Eco Rating (Optional)
          </label>
          <select
            id="eco_rating"
            name="eco_rating"
            value={formData.eco_rating}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary ${
              errors.eco_rating ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Star{rating !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
          {errors.eco_rating && <p className="mt-1 text-sm text-red-600">{errors.eco_rating}</p>}
        </div>
        
        {/* Eco Details */}
        <div>
          <label htmlFor="eco_details" className="block text-sm font-medium text-gray-700">
            Sustainability Details (Optional)
          </label>
          <textarea
            id="eco_details"
            name="eco_details"
            value={formData.eco_details}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Describe what makes this product eco-friendly..."
          />
        </div>
        
        {/* Product Images */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Product Images (Optional)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            className="mt-1 block w-full"
            multiple
            accept="image/*"
          />
          <p className="mt-1 text-xs text-gray-500">Upload up to 5 images (JPEG, PNG, or WebP)</p>
          
          {/* Image Previews */}
          {imageUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Product...' : 'List Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
