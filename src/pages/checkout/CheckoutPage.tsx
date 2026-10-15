import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { checkoutSchema, CheckoutFormData } from '@/schemas/checkout';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { useToast } from '@/contexts/ToastContext';
import { placeOrder } from '@/services/orders/orderService';
import { formatINR } from '@/utils/formatters';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isBuyNow = searchParams.get('buyNow') === 'true';

  const { currentUser, profile } = useAuth();
  const { items, subtotal, shippingFee, total, clearCart, buyNowItem, clearBuyNow } = useCart();
  const { settings } = useStoreSettings();
  const { error, success } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Determine items being purchased: strictly buyNowItem OR cart items
  const activeItems = isBuyNow
    ? buyNowItem
      ? [
          {
            productId: buyNowItem.productId,
            name: buyNowItem.name,
            slug: buyNowItem.slug,
            price: buyNowItem.price,
            image: buyNowItem.image,
            sku: buyNowItem.sku,
            quantity: buyNowItem.quantity,
          },
        ]
      : []
    : items;

  // Compute checkout totals
  const checkoutSubtotal = isBuyNow
    ? buyNowItem
      ? buyNowItem.price * buyNowItem.quantity
      : 0
    : subtotal;

  const checkoutShippingFee =
    checkoutSubtotal === 0 || checkoutSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFee;

  const checkoutTotal = checkoutSubtotal + checkoutShippingFee;

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: profile?.fullName || currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: profile?.phone || '',
      house: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      notes: '',
    },
  });

  // Prefill details from profile
  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) setValue('email', currentUser.email);
      if (profile?.fullName) setValue('fullName', profile.fullName);
      if (profile?.phone) setValue('phone', profile.phone);
    }
  }, [currentUser, profile, setValue]);

  // If no items are selected, redirect to cart or shop
  useEffect(() => {
    if (isBuyNow && !buyNowItem) {
      navigate('/shop');
    } else if (!isBuyNow && items.length === 0) {
      navigate('/cart');
    }
  }, [isBuyNow, buyNowItem, items, navigate]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (activeItems.length === 0) {
      error('Empty Order', 'Please select at least one item to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute trusted atomic order placement
      const createdOrder = await placeOrder({
        items: activeItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          house: data.house,
          street: data.street,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          notes: data.notes,
        },
        userId: currentUser.uid,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        configuredShippingFee: settings.shippingFee,
        freeShippingThreshold: settings.freeShippingThreshold,
      });

      // Clear purchased items
      if (isBuyNow) {
        clearBuyNow();
      } else {
        clearCart();
      }

      success(
        'Order Placed Successfully!',
        `Your Cash on Delivery order #${createdOrder.orderId} has been confirmed.`
      );

      navigate(`/order-success/${createdOrder.id}`);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      error(
        'Order Submission Failed',
        err.message || 'An error occurred while confirming your order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 flex flex-col">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Delivery
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isBuyNow ? '⚡ Express Direct Checkout' : 'Standard Shopping Cart Checkout'} • 100% Cash on Delivery
        </p>
      </div>

      {/* Main Grid: Checkout Form (7 cols) vs Order Summary (5 cols) */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
        {/* Left: Customer Address & Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Authentication Status Notice */}
          {!currentUser ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Sign in to complete your order</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    An authenticated account is required so you can track your shipment and view order history.
                  </p>
                </div>
              </div>
              <Link
                to={`/login?redirect=${encodeURIComponent(isBuyNow ? '/checkout?buyNow=true' : '/checkout')}`}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
              >
                Sign In / Register
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Logged in as <strong className="text-slate-900">{currentUser.email}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Verified Account</span>
            </div>
          )}

          {/* Delivery Address Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span>1. Customer & Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  {...register('fullName')}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Mobile Number (India) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    {...register('phone')}
                    className={`w-full pl-12 pr-4 py-2.5 rounded-xl text-xs border ${
                      errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } focus:outline-none focus:border-blue-500`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border ${
                    errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500">{errors.email.message}</p>
                )}
              </div>

              {/* House/Flat */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Flat, House no., Building, Company, Apartment <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Royal Palms Residency"
                  {...register('house')}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border ${
                    errors.house ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.house && (
                  <p className="text-[11px] text-rose-500">{errors.house.message}</p>
                )}
              </div>

              {/* Street/Locality */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Area, Street, Sector, Village <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14th Main Road, Indiranagar"
                  {...register('street')}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border ${
                    errors.street ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.street && (
                  <p className="text-[11px] text-rose-500">{errors.street.message}</p>
                )}
              </div>

              {/* Landmark */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Metro Station / Behind City Hospital"
                  {...register('landmark')}
                  className="w-full px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Town / City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  {...register('city')}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border ${
                    errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.city && (
                  <p className="text-[11px] text-rose-500">{errors.city.message}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  {...register('state')}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border ${
                    errors.state ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.state && (
                  <p className="text-[11px] text-rose-500">{errors.state.message}</p>
                )}
              </div>

              {/* PIN Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  6-Digit PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="560100"
                  {...register('pincode')}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border ${
                    errors.pincode ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.pincode && (
                  <p className="text-[11px] text-rose-500">{errors.pincode.message}</p>
                )}
              </div>

              {/* Order Notes */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Delivery Instructions / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please call before arriving or deliver between 2 PM - 6 PM"
                  {...register('notes')}
                  className="w-full px-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section (Strictly Cash on Delivery) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              2. Payment Method
            </h3>

            {/* Selected COD Card */}
            <div className="p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/40 flex items-start gap-4">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0 mt-0.5 bg-blue-600">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Cash on Delivery (COD)
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    No Upfront Fee
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pay in cash directly to our delivery courier when your order arrives at your address. Please keep exact change ready for a swift doorstep handover.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Note: We exclusively support Cash on Delivery to guarantee complete buyer security and delivery inspection.
            </p>
          </div>
        </div>

        {/* Right: Order Items & Submit Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6 sticky top-28">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-blue-600">
                {activeItems.length} item{activeItems.length === 1 ? '' : 's'}
              </span>
            </h3>

            {/* Items list */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
              {activeItems.map((item) => (
                <div key={item.productId} className="py-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200/80 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Qty: {item.quantity} × {formatINR(item.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatINR(checkoutSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Delivery Shipping
                  {checkoutShippingFee === 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-semibold text-slate-900">
                  {checkoutShippingFee === 0 ? '₹0' : formatINR(checkoutShippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="font-bold text-slate-900">Cash on Delivery</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatINR(checkoutTotal)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!currentUser && false)}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating & Placing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm Cash on Delivery Order</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              By confirming, you agree to inspect and pay {formatINR(checkoutTotal)} in cash upon doorstep delivery.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
