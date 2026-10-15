import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, PackageOpen } from 'lucide-react';
import { Category } from '@/types/product';
import { getActiveCategories } from '@/services/categories/categoryService';
import { EmptyState } from '@/components/common/EmptyState';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getActiveCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex flex-col">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" /> Department Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Product Categories
        </h1>
        <p className="text-sm text-slate-500">
          Find exactly what you are looking for across our curated departments with Cash on Delivery.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-card hover:shadow-float transition-all duration-300"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 max-w-sm">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>Browse department</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PackageOpen}
          title="No Categories Configured"
          description="Categories will appear here once created through the Admin Dashboard."
          actionText="Explore All Products"
          actionLink="/shop"
        />
      )}
    </div>
  );
};
