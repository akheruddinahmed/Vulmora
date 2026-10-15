import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Truck,
  DollarSign,
  FileText,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import {
  getOrderById,
  updateOrderStatus,
  markCODCollected,
  ALLOWED_STATUS_TRANSITIONS,
} from '@/services/orders/orderService';
import { formatINR, formatDate } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export const AdminOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { success, error, warning } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      error('Failed to load order', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || !currentUser) return;

    if (newStatus === 'Cancelled') {
      setIsCancelModalOpen(true);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(
        order.id,
        newStatus,
        currentUser.uid,
        currentUser.email || 'Admin',
        statusNotes || `Status updated to ${newStatus}`
      );
      success('Order Updated', `Status successfully changed to ${newStatus}.`);
      setStatusNotes('');
      await fetchOrder();
    } catch (err: any) {
      error('Update Failed', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!order || !currentUser) return;
    if (!cancelReason.trim()) {
      warning('Reason Required', 'Please provide an administrative reason for order cancellation.');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(
        order.id,
        'Cancelled',
        currentUser.uid,
        currentUser.email || 'Admin',
        cancelReason
      );
      success('Order Cancelled', 'Order was cancelled and inventory restored safely.');
      setIsCancelModalOpen(false);
      setCancelReason('');
      await fetchOrder();
    } catch (err: any) {
      error('Cancellation Failed', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMarkPaymentCollected = async () => {
    if (!order || !currentUser) return;

    if (
      !window.confirm(
        'Confirm that cash payment has physically been received and verified from the delivery courier?'
      )
    ) {
      return;
    }

    try {
      await markCODCollected(order.id, currentUser.uid, currentUser.email || 'Admin');
      success('Payment Verified', 'Cash on Delivery payment marked as Collected.');
      await fetchOrder();
    } catch (err: any) {
      error('Payment Update Failed', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Order Not Found</h3>
        <Link
          to="/admin/orders"
          className="inline-flex px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[order.orderStatus] || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white font-mono tracking-tight">
                Order #{order.orderId}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {formatDate(order.createdAt)} • Firestore Doc ID: {order.id}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Order Details & Workflow Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Customer & Purchased Products (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items Snapshot */}
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Purchased Items Snapshot ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-slate-800">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      SKU: <span className="font-mono text-slate-300">{item.sku}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Qty: {item.quantity} × {formatINR(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-white">
                    {formatINR(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="font-semibold text-white">
                  {order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Grand Total Due (COD)</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {formatINR(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Customer Delivery Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Customer Full Name</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {order.deliveryAddress?.fullName || order.customerName}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Mobile Phone (India)</p>
                <p className="text-sm font-bold text-white mt-0.5 font-mono">
                  +91 {order.deliveryAddress?.phone || order.customerPhone}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Email Address</p>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  {order.deliveryAddress?.email || order.customerEmail}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Customer User ID (UID)</p>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{order.userId}</p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                <p className="text-slate-400 font-medium">Complete Delivery Address</p>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                  {order.deliveryAddress?.house}, {order.deliveryAddress?.street}
                  {order.deliveryAddress?.landmark && ` (Landmark: ${order.deliveryAddress.landmark})`}
                  <br />
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{' '}
                  <strong className="text-white font-mono">{order.deliveryAddress?.pincode}</strong>
                </p>
              </div>

              {order.deliveryAddress?.notes && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <span className="font-bold text-slate-300">Customer Delivery Instructions:</span>
                  <p className="text-slate-400 mt-0.5">{order.deliveryAddress.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Order Transition & Audit History</span>
            </h3>

            <div className="space-y-3">
              {order.statusHistory?.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{entry.status}</span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    {entry.updatedBy && (
                      <p className="text-[11px] text-slate-400 mt-0.5">By: {entry.updatedBy}</p>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-slate-300 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Status Workflow Controls & COD Payment Collection (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* COD Payment Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Cash on Delivery (COD) Collection
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode</span>
                <span className="font-bold text-blue-400">Cash on Delivery</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Collection Status</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    order.paymentStatus === 'Collected'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {order.paymentCollectedAt && (
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <p className="text-[11px] text-slate-400">Collected On:</p>
                  <p className="text-xs font-semibold text-white">
                    {formatDate(order.paymentCollectedAt)}
                  </p>
                  {order.paymentCollectedBy && (
                    <p className="text-[10px] text-slate-400">By: {order.paymentCollectedBy}</p>
                  )}
                </div>
              )}

              {order.paymentStatus === 'Pending' && order.orderStatus !== 'Cancelled' && (
                <div className="pt-2">
                  <button
                    onClick={handleMarkPaymentCollected}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Cash Collected</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Click only when physical cash has actually been verified upon delivery.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Workflow Progression */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Update Order Status
            </h3>

            {allowedTransitions.length === 0 ? (
              <p className="text-xs text-slate-400">
                Order is in final state (<strong>{order.orderStatus}</strong>). No further transitions allowed.
              </p>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-400">
                  Current Status: <strong className="text-white">{order.orderStatus}</strong>
                </p>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Transition To:</label>
                  <div className="space-y-2">
                    {allowedTransitions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusChange(nextStatus)}
                        disabled={isUpdatingStatus}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          nextStatus === 'Cancelled'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        <span>Advance to {nextStatus}</span>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-slate-400 font-semibold">Status Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched via BlueDart AWB 94819"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Inventory Safety Notice */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300">Inventory Guarantee:</span>
            <p>
              Stock was atomically deducted when this order was placed. If cancelled, stock will be safely restored exactly once.
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <span>Cancel Order & Restore Inventory</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Cancelling this order will automatically restore reserved product quantities back to the store inventory.
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-slate-300 font-semibold">Reason for Cancellation *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Customer requested cancellation / Invalid address"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isUpdatingStatus}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-500/25 disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Cancelling...' : 'Confirm Order Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
