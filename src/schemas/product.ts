import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().trim().min(2, 'Slug is required'),
  shortDescription: z.string().trim().min(5, 'Short description must be at least 5 characters'),
  description: z.string().trim().min(10, 'Full description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().trim().optional(),
  size: z.string().trim().optional(),
  price: z.coerce.number().positive('Selling price must be greater than 0'),
  originalPrice: z.coerce.number().optional().nullable(),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters'),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().int().nonnegative('Threshold must be non-negative').default(5),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
  images: z
    .array(
      z.object({
        url: z.string().min(1, 'Image path or URL is required'),
        publicId: z.string().optional(),
        altText: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
    )
    .min(1, 'At least one product image is required'),
  specifications: z
    .array(
      z.object({
        key: z.string().trim().min(1, 'Specification name cannot be empty'),
        value: z.string().trim().min(1, 'Specification value cannot be empty'),
      })
    )
    .default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;
