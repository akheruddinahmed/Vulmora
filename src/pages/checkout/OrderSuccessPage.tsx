import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { Order } from '@/types/order';
import { getOrderById } from '@/services/orders/orderService';
import { formatINR, formatDate } from '@/utils/formatters';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fire celebratory confetti on page mount
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const fetchOrder = async () => {
      if (!id) return;
      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order confirmation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
        <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          Could not locate the requested order confirmation.
        </p>
        <Link
          to="/"
          className="inline-flex px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex flex-col">
      {/* Confirmation Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 sm:p-10 space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Your Cash on Delivery order has been successfully placed. Our dispatch team is preparing your parcel.
          </p>
        </div>

        {/* Order Reference Strip */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Order Number</p>
            <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{order.orderId}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Order Date</p>
            <p className="font-semibold text-slate-900 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Payment Mode</p>
            <p className="font-semibold text-blue-600 mt-0.5">Cash on Delivery (Pending)</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Total Payable</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatINR(order.total)}</p>
          </div>
        </div>

        {/* COD Reminder Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Payment Instructions:</span> Please prepare exactly{' '}
            <strong className="font-bold">{formatINR(order.total)}</strong> in cash when our delivery executive arrives. You are welcome to inspect the package seal prior to handover.
          </div>
        </div>

        {/* Ordered Products Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Purchased Items ({order.items.length})
          </h3>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center gap-4 bg-white">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Qty: {item.quantity} × {formatINR(item.unitPrice)}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {formatINR(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Delivery Destination</span>
          </div>
          <p className="font-semibold text-slate-800">{order.deliveryAddress.fullName}</p>
          <p className="text-slate-600">
            {order.deliveryAddress.house}, {order.deliveryAddress.street}
          </p>
          {order.deliveryAddress.landmark && (
            <p className="text-slate-500">Landmark: {order.deliveryAddress.landmark}</p>
          )}
          <p className="text-slate-600">
            {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
          </p>
          <p className="text-slate-600 mt-1">
            Contact Phone: +91 {order.deliveryAddress.phone}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>View All My Orders</span>
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
