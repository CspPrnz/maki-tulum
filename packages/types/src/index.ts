import { z } from 'zod';

// Standard API envelope (lesson: every response uses { data, meta, pagination? })
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  pagination?: Pagination;
}

// Booking statuses — canonical values, defined once.
// Lesson from Civion Safe: never let one client transform an enum value;
// always test all clients against the actual API response.
export const BookingStatus = z.enum([
  'pending',
  'confirmed',
  'deposit_paid',
  'balance_due',
  'paid',
  'checked_in',
  'completed',
  'cancelled',
  'refunded',
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const BookingChannel = z.enum(['direct', 'airbnb', 'booking', 'vrbo', 'other']);
export type BookingChannel = z.infer<typeof BookingChannel>;

// Roles
export const Role = z.enum(['guest', 'owner', 'manager', 'housekeeping', 'maintenance', 'admin']);
export type Role = z.infer<typeof Role>;

// Health endpoints
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  version: z.string(),
  timestamp: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ReadyResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  service: z.string(),
  checks: z.record(z.enum(['ok', 'fail', 'skipped'])),
  timestamp: z.string(),
});
export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;
