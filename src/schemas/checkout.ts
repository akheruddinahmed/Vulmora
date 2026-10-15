import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address'),
  house: z
    .string()
    .trim()
    .min(1, 'House / Flat / Building number is required'),
  street: z
    .string()
    .trim()
    .min(3, 'Street, colony or locality must be at least 3 characters'),
  landmark: z
    .string()
    .trim()
    .optional(),
  city: z
    .string()
    .trim()
    .min(2, 'City is required'),
  state: z
    .string()
    .trim()
    .min(2, 'State is required'),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian PIN code'),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
