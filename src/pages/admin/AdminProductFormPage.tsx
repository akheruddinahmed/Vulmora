import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { productSchema, ProductFormData } from '@/schemas/product';
import { Category } from '@/types/product';
import { createProduct, updateProduct, getProductById } from '@/services/products/productService';
import { getAllCategories } from '@/services/categories/categoryService';
import { CloudinaryImageUploader } from '@/components/admin/CloudinaryImageUploader';
import { slugify } from '@/utils/formatters';
import { useToast } from '@/contexts/ToastContext';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      categoryId: '',
      brand: 'VULMORA',
      size: '',
      price: 0,
      originalPrice: null,
      sku: '',
      stock: 25,
      lowStockThreshold: 5,
      featured: false,
      status: 'active',
      images: [],
      specifications: [
        { key: 'Brand', value: 'VULMORA' },
        { key: 'Product Type', value: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  const watchImages = watch('images') || [];
  const watchName = watch('name');

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);

        if (isEditing && id) {
          const existing = await getProductById(id);
          if (existing) {
            setValue('name', existing.name);
            setValue('slug', existing.slug);
            setValue('shortDescription', existing.shortDescription);
            setValue('description', existing.description);
            setValue('categoryId', existing.categoryId);
            setValue('brand', existing.brand || 'VULMORA');
            setValue('size', existing.size || '');
            setValue('price', existing.price);
            setValue('originalPrice', existing.originalPrice || null);
            setValue('sku', existing.sku);
            setValue('stock', existing.stock);
            setValue('lowStockThreshold', existing.lowStockThreshold || 5);
            setValue('featured', Boolean(existing.featured));
            setValue('status', existing.status);
            setValue('images', existing.images || []);
            setValue('specifications', existing.specifications || []);
          } else {
            error('Not Found', 'Product does not exist.');
            navigate('/admin/products');
          }
        }
      } catch (err: any) {
        error('Initialization Error', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [id, isEditing, setValue, navigate]);

  const handleNameBlur = () => {
    const currentSlug = watch('slug');
    if (!currentSlug && watchName) {
      setValue('slug', slugify(watchName));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === data.categoryId);
      const categoryName = selectedCat ? selectedCat.name : '';

      const payload = {
        ...data,
        categoryName,
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      };

      if (isEditing && id) {
        await updateProduct(id, payload);
        success('Product Updated', `"${data.name}" was updated successfully.`);
      } else {
        await createProduct(payload);
        success('Product Created', `"${data.name}" has been published to your store.`);
      }

      navigate('/admin/products');
    } catch (err: any) {
      error('Save Failed', err.message || 'Failed to save product record.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {isEditing ? 'Edit VULMORA Product' : 'Create VULMORA Product'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure product details, pack size, verified pricing, and Cloudinary packaging images
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            1. Brand & Product Identification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Product Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. VULMORA White Phenyl Floor Cleaner"
                {...register('name')}
                onBlur={handleNameBlur}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.name ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-400">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="vulmora-white-phenyl-1l"
                {...register('slug')}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.slug ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.slug && (
                <p className="text-[11px] text-rose-400">{errors.slug.message}</p>
              )}
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. VULMORA"
                {...register('brand')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Size / Volume */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Pack Size / Net Volume (e.g. 1 L, 50 g, 100 g)
              </label>
              <input
                type="text"
                placeholder="e.g. 1 L or 50 g"
                {...register('size')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                {...register('categoryId')}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.categoryId ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-[11px] text-rose-400">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Visibility Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active (Visible to Shoppers)</option>
                <option value="inactive">Inactive (Hidden from Customers)</option>
              </select>
            </div>

            {/* Featured */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300 select-none">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Feature this product on VULMORA homepage spotlight</span>
              </label>
            </div>

            {/* Short Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">
                Short Summary (Card preview) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Brief summary for listings..."
                {...register('shortDescription')}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.shortDescription ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.shortDescription && (
                <p className="text-[11px] text-rose-400">{errors.shortDescription.message}</p>
              )}
            </div>

            {/* Full Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">
                Full Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Detailed description, usage directions, packaging notes..."
                {...register('description')}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.description ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500 resize-none`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-400">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            2. Verified Selling Price & Available Stock
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Selling Price */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Selling Price (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="139"
                {...register('price')}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.price ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.price && (
                <p className="text-[11px] text-rose-400">{errors.price.message}</p>
              )}
            </div>

            {/* MRP */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Printed MRP (₹)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="160"
                {...register('originalPrice')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                SKU Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="VLM-WP-1L"
                {...register('sku')}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.sku ? 'border-rose-500' : 'border-slate-700'
                } text-white font-mono focus:outline-none focus:border-blue-500`}
              />
              {errors.sku && (
                <p className="text-[11px] text-rose-400">{errors.sku.message}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Available Stock <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="35"
                {...register('stock')}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border ${
                  errors.stock ? 'border-rose-500' : 'border-slate-700'
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.stock && (
                <p className="text-[11px] text-rose-400">{errors.stock.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Cloudinary Packaging Photos */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span>3. Product & Packaging Photographs (Cloudinary)</span>
            </h3>
            <span className="text-xs text-slate-400">
              {watchImages.length} image(s) attached
            </span>
          </div>

          <CloudinaryImageUploader
            images={watchImages}
            onChange={(imgs) => setValue('images', imgs, { shouldValidate: true })}
            folder="vulmora_products"
            maxImages={6}
          />
          {errors.images && (
            <p className="text-[11px] text-rose-400">{errors.images.message}</p>
          )}
        </div>

        {/* Section 4: Specifications */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">4. Verified Specifications</h3>
            <button
              type="button"
              onClick={() => append({ key: '', value: '' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Key (e.g. Net Volume / Fragrance)"
                  {...register(`specifications.${index}.key` as const)}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 1 L / Lavender & Floral Fresh)"
                  {...register(`specifications.${index}.value` as const)}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove specification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Bottom Save Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Publish VULMORA Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
