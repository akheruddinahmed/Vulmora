import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().trim().min(2, 'Slug is required'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  imageUrl: z.string().url('A valid image URL is required'),
  imagePublicId: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
