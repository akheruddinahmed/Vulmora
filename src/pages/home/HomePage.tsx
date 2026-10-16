import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Layers,
  ChevronRight,
  Database,
  Sparkle,
} from 'lucide-react';
import { Product, Category } from '@/types/product';
import { getFeaturedProducts, getActiveProducts } from '@/services/products/productService';
import { getActiveCategories } from '@/services/categories/categoryService';
import { seedInitialFirestoreData } from '@/services/seed/seedDataService';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { SKLogo } from '@/components/common/SKLogo';

export const HomePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [featured, latest, cats] = await Promise.all([
        getFeaturedProducts(8),
        getActiveProducts({ sortBy: 'newest' }).then((res) => res.slice(0, 8)),
        getActiveCategories(),
      ]);
      setFeaturedProducts(featured);
      setLatestProducts(latest);
      setCategories(cats);
    } catch (err: any) {
      console.error('Error loading homepage data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await seedInitialFirestoreData();
      success(
        'VULMORA Catalog Initialized!',
        `Created ${res.categoriesCount} categories and ${res.productsCount} initial products in Firestore.`
      );
      await loadData();
    } catch (err: any) {
      error('Seed Error', err.message || 'Failed to populate database.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Only display products in "Catalog Additions" that are not already shown in "Featured Selections"
  const additionalProducts = latestProducts.filter(
    (lp) => !featuredProducts.some((fp) => fp.id === lp.id)
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* VULMORA Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-purple-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Glow Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-fuchsia-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                Trusted Household Cleaning & Personal Care
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Brighter Homes.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-fuchsia-300">
                  Everyday Care.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 max-w-xl font-normal leading-relaxed">
                Discover authentic <strong>VULMORA</strong> cleaning powders, white phenyl floor cleaners, and pure pharmaceutical-grade Glycerin I.P. Delivered directly across India with 100% Cash on Delivery.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-lg active:scale-[0.98]"
                >
                  <span>Shop VULMORA Products</span>
                  <ArrowRight className="w-4 h-4 text-blue-900" />
                </Link>

                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all backdrop-blur-sm"
                >
                  <Layers className="w-4 h-4 text-fuchsia-300" />
                  <span>Shop by Category</span>
                </Link>
              </div>

              {/* Indian Consumer Trust Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/15 text-xs">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white">COD Only</p>
                  <p className="text-slate-300 mt-0.5">Pay at Doorstep</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white">Guwahati</p>
                  <p className="text-slate-300 mt-0.5">Direct Manufacturer</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white">7 Days</p>
                  <p className="text-slate-300 mt-0.5">Hassle-Free Return</p>
                </div>
              </div>
            </div>

            {/* Right: Authentic Packaging Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/15 p-4 shadow-2xl backdrop-blur-sm">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-900/60 flex items-center justify-center">
                  <img
                    src="/images/products/vulmora-white-phenyl-1l.jpg"
                    alt="VULMORA White Phenyl Floor Cleaner 1L"
                    className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-6 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
                      Signature Product
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      VULMORA White Phenyl Floor Cleaner
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      1 L Bottle • Lavender & Floral Fresh
                    </p>
                    <Link
                      to="/product/vulmora-white-phenyl-floor-cleaner-1l"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-300 mt-3 hover:underline"
                    >
                      View Details & Order COD <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official S K Research Laboratories Manufacturer Trust Bar */}
      <section className="bg-slate-900 border-b border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2 py-1 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
              <SKLogo variant="logo-only" size="xs" className="h-6" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Formulated & Manufactured by <strong className="text-white font-bold">S K Research Laboratories</strong> • Guwahati, Assam
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="text-emerald-400 flex items-center gap-1.5">✓ Drug License Standard</span>
            <span className="text-blue-400 flex items-center gap-1.5">✓ Direct Lab Dispatch</span>
            <Link to="/about" className="text-white hover:text-blue-300 transition-colors underline underline-offset-4">
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Database Blank Notice & 1-Click Seeder for Admin */}
      {!isLoading && featuredProducts.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="p-8 rounded-3xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-subtle">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-extrabold flex items-center gap-2 justify-center sm:justify-start text-blue-950">
                <Database className="w-5 h-5 text-blue-900" />
                VULMORA Catalog Ready for Initialization
              </h3>
              <p className="text-xs text-blue-800 max-w-xl">
                Load the initial VULMORA product catalog (VULMORA Washing Powder, VULMORA White Phenyl 1L, and Glycerin I.P. 50g & 100g) directly into your Cloud Firestore database with one click.
              </p>
            </div>
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-2 disabled:opacity-60"
            >
              <Database className="w-4 h-4" />
              {isSeeding ? 'Seeding VULMORA Catalog...' : 'Initialize VULMORA Products'}
            </button>
          </div>
        </div>
      )}

      {/* Shop by Category: Laundry Care, Floor Cleaning, Personal Care */}
      {categories.length > 0 && (
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Shop by Department
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Targeted household cleaning and skincare essentials
                </p>
              </div>
              <Link
                to="/categories"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline"
              >
                All Departments <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-200 shadow-card hover:shadow-float transition-all"
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                      {cat.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-fuchsia-300">
                      <span>Explore products</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured VULMORA Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-900" /> Featured Selections
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Available VULMORA Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline"
            >
              View Full Catalog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Products Published"
              description="Initial products can be populated using the seed button above or created via the Admin Dashboard."
              actionText="Open Admin Dashboard"
              actionLink="/admin/products"
            />
          )}
        </div>
      </section>

      {/* Cash on Delivery Feature Highlight Banner */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-card">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-fuchsia-300 text-xs font-bold">
                <Truck className="w-3.5 h-3.5 text-fuchsia-400" /> 100% Cash on Delivery
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Inspect your package at your doorstep. Pay cash upon delivery.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Enjoy complete peace of mind with VULMORA. No advance online transactions or card details needed. Check the parcel seal when the delivery courier arrives and hand over the exact cash amount.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-950 text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Browse Catalog Now <ArrowRight className="w-4 h-4 text-blue-950" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section (Only displays non-featured products to eliminate duplicates) */}
      {additionalProducts.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Catalog Additions
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Active VULMORA stock available for Cash on Delivery
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline"
              >
                All Products <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {additionalProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
