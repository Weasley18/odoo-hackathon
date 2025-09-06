import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService, Cart, CartItem, CheckoutData } from '../services/api';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: '',
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const cartData = await apiService.getCart();
      setCart(cartData);
    } catch (err) {
      setError('Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    setRemovingId(productId);
    try {
      await apiService.removeFromCart(productId);
      await loadCart(); // Reload cart
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item from cart');
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setCheckingOut(true);
    try {
      await apiService.createOrder(checkoutData);
      navigate('/orders');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadCart} className="bg-primary text-white px-4 py-2 rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link
          to="/"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Cart ({cart.total_items} items)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {cart.items.map((item) => (
              <div key={item.id} className="p-4 flex">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.product_name}</h3>
                      <p className="ml-4">${item.product_price.toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      Total: ${item.total_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product_id)}
                      disabled={removingId === item.product_id}
                      className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                    >
                      {removingId === item.product_id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <p>Subtotal ({cart.total_items} items)</p>
                <p>${cart.total_amount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-medium text-lg">
                <p>Total</p>
                <p>${cart.total_amount.toFixed(2)}</p>
              </div>
            </div>
            
            {!showCheckoutForm ? (
              <button
                onClick={() => setShowCheckoutForm(true)}
                className="mt-6 w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Shipping Information</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="shipping_address"
                    placeholder="Address"
                    value={checkoutData.shipping_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="shipping_city"
                      placeholder="City"
                      value={checkoutData.shipping_city}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="shipping_state"
                      placeholder="State"
                      value={checkoutData.shipping_state}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="shipping_zip"
                      placeholder="ZIP Code"
                      value={checkoutData.shipping_zip}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="shipping_country"
                      placeholder="Country"
                      value={checkoutData.shipping_country}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || !checkoutData.shipping_address || !checkoutData.shipping_city}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {checkingOut ? 'Processing...' : 'Complete Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
