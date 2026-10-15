import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  ShoppingBag,
  MapPin,
  X,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { getCustomerOrders } from '@/services/orders/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { formatINR, formatDate } from '@/utils/formatters';
import { EmptyState } from '@/components/common/EmptyState';

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const userOrders = await getCustomerOrders(currentUser.uid);
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser, authLoading, navigate]);

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      Placed: 'bg-blue-50 text-blue-700 border-blue-200',
      Confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Processing: 'bg-purple-50 text-purple-700 border-purple-200',
      Shipped: 'bg-amber-50 text-amber-700 border-amber-200',
      'Out for Delivery': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
          styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        {status}
      </span>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="h-32 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 flex flex-col">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your previous Cash on Delivery purchases and live shipment statuses
        </p>
      </div>

      <div className="pt-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Orders Found"
            description="You have not placed any orders yet. Discover our curated catalog and place your first Cash on Delivery order today!"
            actionText="Start Shopping"
            actionLink="/shop"
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-6 hover:border-slate-300 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-slate-400 font-medium">Order ID</p>
                    <p className="text-sm font-bold text-slate-900 font-mono">{order.orderId}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 font-medium">Placed On</p>
                    <p className="font-semibold text-slate-800">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-400 font-medium">Order Status</p>
                    <div>{getStatusBadge(order.orderStatus)}</div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-slate-400 font-medium">Total Amount</p>
                    <p className="text-base font-extrabold text-slate-900">
                      {formatINR(order.total)}
                    </p>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Quantity: {item.quantity} • {formatINR(item.unitPrice)} each
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {formatINR(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-semibold">Payment:</span>
                    <span className="text-blue-600 font-bold">Cash on Delivery</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        order.paymentStatus === 'Collected'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      Status: {order.paymentStatus}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Details & Tracking</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order #{selectedOrder.orderId}</h3>
                <p className="text-xs text-slate-500">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Order Activity & Status
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                  selectedOrder.statusHistory.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{step.status}</span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(step.timestamp)}
                          </span>
                        </div>
                        {step.notes && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{step.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Order placed and confirmed.</p>
                )}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Delivery Address
              </p>
              <p className="font-semibold text-slate-800">
                {selectedOrder.deliveryAddress.fullName} (+91 {selectedOrder.deliveryAddress.phone})
              </p>
              <p className="text-slate-600">
                {selectedOrder.deliveryAddress.house}, {selectedOrder.deliveryAddress.street}
              </p>
              {selectedOrder.deliveryAddress.landmark && (
                <p className="text-slate-500">Landmark: {selectedOrder.deliveryAddress.landmark}</p>
              )}
              <p className="text-slate-600">
                {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} -{' '}
                {selectedOrder.deliveryAddress.pincode}
              </p>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>{formatINR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Shipping Fee</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatINR(selectedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount Due (COD)</span>
                <span>{formatINR(selectedOrder.total)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
