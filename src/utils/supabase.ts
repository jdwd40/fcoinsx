import { PostgrestError } from '@supabase/supabase-js';

export interface SupabaseError {
  message: string;
  details?: string;
  code?: string;
}

export const handleSupabaseError = (error: PostgrestError | null): SupabaseError => {
  if (!error) return { message: 'An unknown error occurred' };

  // Handle specific error codes
  switch (error.code) {
    case 'PGRST116':
      return {
        message: 'No data found',
        details: 'The requested data could not be found',
        code: error.code
      };
    case '23505': // Unique violation
      return {
        message: 'Duplicate entry',
        details: 'This record already exists',
        code: error.code
      };
    default:
      return {
        message: error.message || 'An error occurred',
        details: error.details,
        code: error.code
      };
  }
};