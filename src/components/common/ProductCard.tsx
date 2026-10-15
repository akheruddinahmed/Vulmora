import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Eye } from 'lucide-react';
import { Product } from '@/types/product';
import { formatINR, calculateDiscountPercentage } from '@/utils/formatters';
import { getOptimizedImageUrl } from '@/services/cloudinary/cloudinaryService';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem, setBuyNow } = useCart();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    '/images/products/vulmora-white-phenyl-1l.jpg';

  const optimizedImage = getOptimizedImageUrl(primaryImage, {
    width: 600,
    height: 600,
    crop: 'fill',
    quality: 'auto',
  });

  const discount = calculateDiscountPercentage(product.price, product.originalPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = setBuyNow(product, 1);
    if (success) {
      navigate('/checkout?buyNow=true');
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-blue-800/40 transition-all duration-300 hover:shadow-card flex flex-col overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={optimizedImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges on top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.size && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-900 text-white shadow-sm">
              {product.size}
            </span>
          )}
        </div>

        {/* Stock Badge on top right */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 backdrop-blur-sm text-white">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white shadow-sm">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Hover Quick View Link */}
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 bg-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          aria-label={`View ${product.name}`}
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-950 text-xs font-bold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="w-3.5 h-3.5 text-blue-800" /> View Details
          </span>
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider truncate">
              {product.brand || 'VULMORA'}
            </span>
            {product.size && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {product.size}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="text-sm font-bold text-slate-900 hover:text-blue-900 transition-colors line-clamp-2 leading-snug mb-1"
          >
            {product.name}
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div>
          {/* Pricing */}
          <div className="pt-2 flex items-baseline gap-2 mb-4 border-t border-slate-100">
            <span className="text-lg font-black text-slate-900">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
            <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              COD Available
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isOutOfStock
                  ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span>Add</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white hover:opacity-95 active:scale-[0.98] shadow-sm shadow-blue-900/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0 fill-current text-fuchsia-300" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
