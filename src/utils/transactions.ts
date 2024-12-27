import { supabase } from '../lib/supabase';
import { handleSupabaseError } from './supabase';

export async function verifyFunds(userId: string, amount: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('funds')
      .select('amount')
      .eq('user_id', userId)
      .eq('currency', 'USD')
      .single();

    if (error) throw error;
    
    return (data?.amount || 0) >= amount;
  } catch (err) {
    console.error('Error verifying funds:', err);
    throw handleSupabaseError(err);
  }
}

export async function getPortfolioBalance(userId: string, coinSymbol: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('quantity')
      .eq('user_id', userId)
      .eq('coin_symbol', coinSymbol)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return data?.quantity || 0;
  } catch (err) {
    console.error('Error getting portfolio balance:', err);
    throw handleSupabaseError(err);
  }
}