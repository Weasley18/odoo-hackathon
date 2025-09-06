import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, Order } from '../services/api';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError('Failed to load your orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
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
        <button onClick={loadOrders} className="bg-primary text-white px-4 py-2 rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order placed</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
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
                          <p className="ml-4">${item.price_per_unit.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                        <p className="font-medium">
                          Total: ${item.total_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium">Shipping Address</h4>
                <address className="not-italic text-sm text-gray-500 mt-1">
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
                  {order.shipping_country}
                </address>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to place your first order!</p>
          <Link
            to="/"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
