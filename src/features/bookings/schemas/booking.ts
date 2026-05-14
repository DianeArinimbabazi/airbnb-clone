import { z } from 'zod';

export const datesSchema = z
  .object({
    checkIn:  z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
    guests:   z.number().min(1, 'At least 1 guest required').max(16, 'Maximum 16 guests'),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

export const personalSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
});

export const paymentSchema = z.object({
  card:   z.string().regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Use format MM/YY'),
  cvv:    z.string().regex(/^\d{3}$/, 'CVV must be 3 digits'),
});

export type DatesData    = z.infer<typeof datesSchema>;
export type PersonalData = z.infer<typeof personalSchema>;
export type PaymentData  = z.infer<typeof paymentSchema>;
export type BookingFormData = DatesData & PersonalData & PaymentData;

// Aliases for old files that import the old names
export type DatesFormData    = DatesData;
export type PersonalFormData = PersonalData;
export type PaymentFormData  = PaymentData;
