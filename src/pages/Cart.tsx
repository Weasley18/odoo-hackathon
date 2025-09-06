import React from 'react';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    seller: string;
  };
  price: number;
  quantity: number;
}

const Cart: React.FC = () => {
  // This would be replaced with actual API calls and state management
  const cartItems: CartItem[] = [];
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.99;
  const total = subtotal + shipping;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {cartItems.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.product.name}</h3>
                        <p className="ml-4">${item.price.toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Seller: {item.product.seller}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center">
                        <label htmlFor={`quantity-${item.id}`} className="mr-2 text-gray-500">Qty</label>
                        <select
                          id={`quantity-${item.id}`}
                          className="rounded-md border border-gray-300 text-base"
                          defaultValue={item.quantity}
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="button" className="font-medium text-red-600 hover:text-red-500">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <a
                href="/"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg"
              >
                Continue Shopping
              </a>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p>${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Shipping</p>
                <p>${shipping.toFixed(2)}</p>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </div>
            <button
              className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg"
              disabled={cartItems.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
      
      {/* TODO: Add ability to update quantities, apply promo codes */}
    </div>
  );
};

export default Cart;
