import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  PackageOpen,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { formatINR } from '@/utils/formatters';
import { EmptyState } from '@/components/common/EmptyState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    freeShippingRemaining,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { settings } = useStoreSettings();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col justify-center">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our curated collections and discover exceptional quality products."
          actionText="Continue Shopping"
          actionLink="/shop"
        />
      </div>
    );
  }

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / settings.freeShippingThreshold) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 flex flex-col">
      {/* Title & Clear Cart */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {itemCount} item{itemCount === 1 ? '' : 's'} in your bag • Cash on Delivery supported
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Main Grid: Items List vs Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert Bar */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                {freeShippingRemaining === 0 ? (
                  <span className="text-emerald-700 font-bold">
                    🎉 Congratulations! You have unlocked FREE Cash on Delivery.
                  </span>
                ) : (
                  <span>
                    Add <strong className="font-bold">{formatINR(freeShippingRemaining)}</strong> more to unlock FREE Cash on Delivery!
                  </span>
                )}
              </span>
              <span>{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-blue-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;

              return (
                <div
                  key={item.productId}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200/80 shrink-0"
                    />
                    <div className="space-y-1">
                      <Link
                        to={`/product/${item.slug}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-400">SKU: {item.sku}</p>
                      <p className="text-xs font-bold text-slate-800 sm:hidden">
                        {formatINR(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Controls */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {/* Stepper */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-2 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[90px]">
                      <p className="text-sm font-bold text-slate-900">
                        {formatINR(lineTotal)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatINR(item.price)} each
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6 sticky top-28">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Delivery Shipping
                  {shippingFee === 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? '₹0' : formatINR(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="font-bold text-blue-600">Cash on Delivery (COD)</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Estimated Total</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatINR(total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero payment risk. Pay cash when handed the parcel.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Verified atomic inventory deduction prevents duplicate orders.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
