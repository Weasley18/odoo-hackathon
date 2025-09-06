import React from 'react';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    imageUrl: string;
    seller: string;
  }[];
  shipping: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const Orders: React.FC = () => {
  // This would be replaced with actual API calls and state
  const orders: Order[] = [];
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Order placed</p>
                  <p className="font-medium">{order.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order # {order.id}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.productName}</h3>
                          <p className="ml-4">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Seller: {item.seller}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                        {order.status === 'delivered' && (
                          <button
                            type="button"
                            className="font-medium text-secondary hover:text-secondary-dark"
                          >
                            Write a Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium">Shipping Address</h4>
                <address className="not-italic text-sm text-gray-500 mt-1">
                  {order.shipping.address}<br />
                  {order.shipping.city}, {order.shipping.state} {order.shipping.zip}<br />
                  {order.shipping.country}
                </address>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
          <a
            href="/"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg"
          >
            Start Shopping
          </a>
        </div>
      )}
      
      {/* TODO: Add order tracking, cancellation, returns */}
    </div>
  );
};

export default Orders;
