import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Product } from '@/types/product';
import { getProductBySlug, getActiveProducts } from '@/services/products/productService';
import { getOptimizedImageUrl } from '@/services/cloudinary/cloudinaryService';
import { formatINR, calculateDiscountPercentage } from '@/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { ProductCard } from '@/components/common/ProductCard';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, setBuyNow } = useCart();
  const { success, warning } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const prod = await getProductBySlug(slug);
        setProduct(prod);
        setSelectedImageIndex(0);
        setQuantity(1);

        if (prod) {
          const related = await getActiveProducts({
            category: prod.categoryId,
          });
          setRelatedProducts(related.filter((p) => p.id !== prod.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Available</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested product may have been modified or deactivated.
        </p>
        <Link
          to="/shop"
          className="inline-flex px-6 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-bold"
        >
          Browse VULMORA Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;
  const discount = calculateDiscountPercentage(product.price, product.originalPrice);

  const images = product.images && product.images.length > 0
    ? product.images
    : [
        {
          url: '/images/products/vulmora-white-phenyl-1l.jpg',
          altText: product.name,
        },
      ];

  const currentImage = images[selectedImageIndex] || images[0];

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else {
      warning('Stock Limit', `Only ${product.stock} items currently available in inventory.`);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const ok = setBuyNow(product, quantity);
    if (ok) {
      navigate('/checkout?buyNow=true');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link Copied', 'Product link copied to clipboard.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-blue-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/shop" className="hover:text-blue-900 transition-colors">
          All Products
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              to={`/shop?category=${product.categoryId}`}
              className="hover:text-blue-900 transition-colors"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Product Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/90 shadow-subtle group">
            <img
              src={getOptimizedImageUrl(currentImage.url, {
                width: 1000,
                height: 1000,
                crop: 'fill',
              })}
              alt={currentImage.altText || product.name}
              className="w-full h-full object-contain p-4 object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md">
                  {discount}% OFF
                </span>
              )}
              {product.size && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900 text-white shadow-md">
                  {product.size}
                </span>
              )}
            </div>

            {/* Stock Badge */}
            <div className="absolute top-4 right-4">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-md">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-md">
                  Only {product.stock} units left
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                  In Stock ({product.stock})
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === index
                      ? 'border-blue-900 ring-2 ring-blue-100 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img.url, { width: 160, height: 160, crop: 'fill' })}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                  {product.brand || 'VULMORA'}
                </span>
                {product.size && (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    Pack: {product.size}
                  </span>
                )}
              </div>

              <button
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Save {formatINR(product.originalPrice - product.price)} ({discount}% off)
                  </span>
                </>
              )}
            </div>

            {/* COD Guaranteed Notification */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 leading-relaxed">
                <span className="font-bold">100% Cash on Delivery (COD):</span> No online card/UPI payment required. Inspect your order packaging at doorstep upon courier arrival.
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Select Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white shadow-sm">
                  <button
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-slate-500">
                  {isOutOfStock ? 'Currently out of stock' : `Max ${product.stock} units available`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-900 to-indigo-900 text-white hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-900/25 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-current text-fuchsia-300" />
                <span>Buy Now (Cash on Delivery)</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-[11px] text-slate-600 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 mx-auto mb-1 text-blue-900" />
                <span>Doorstep Inspection</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-700" />
                <span>Guaranteed Quality</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <RotateCcw className="w-4 h-4 mx-auto mb-1 text-fuchsia-700" />
                <span>7-Day Easy Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Section */}
      <div className="mt-16 pt-12 border-t border-slate-200 space-y-12">
        <div className="max-w-4xl space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Product Details & Usage</h3>
          <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* Specifications Table */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="max-w-4xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Packaging & Product Specifications</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <tbody className="divide-y divide-slate-100">
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="px-5 py-3 font-bold text-slate-700 w-1/3">
                        {spec.key}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Explore More From VULMORA</h3>
            <Link
              to={`/shop?category=${product.categoryId}`}
              className="text-xs font-bold text-blue-900 hover:underline"
            >
              View Department Catalog →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
