import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

interface Transaction {
  id: string;
  user_id: string;
  coin_symbol: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price_per_coin: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  total_amount: number;
}

interface TransactionContextType {
  executeTransaction: (params: {
    type: 'BUY' | 'SELL';
    coinSymbol: string;
    quantity: number;
    pricePerCoin: number;
  }) => Promise<{ error?: string }>;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Load initial transactions
    loadTransactions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTransactions(data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(handleSupabaseError(err as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        setTransactions(prev => [newRecord, ...prev]);
        break;
      case 'UPDATE':
        setTransactions(prev =>
          prev.map(tx => tx.id === oldRecord.id ? newRecord : tx)
        );
        break;
      case 'DELETE':
        setTransactions(prev =>
          prev.filter(tx => tx.id !== oldRecord.id)
        );
        break;
    }
  };

  const executeTransaction = async ({
    type,
    coinSymbol,
    quantity,
    pricePerCoin
  }: {
    type: 'BUY' | 'SELL';
    coinSymbol: string;
    quantity: number;
    pricePerCoin: number;
  }) => {
    if (!user) {
      console.error('No user found in context');
      return { error: 'User not authenticated' };
    }

    const totalAmount = quantity * pricePerCoin;
    console.log('Transaction details:', { type, coinSymbol, quantity, pricePerCoin, totalAmount });

    try {
      // Get current user to ensure we have the latest session
      const { data, error: userError } = await supabase.auth.getUser();
      
      if (userError || !data.user) {
        console.error('Failed to get user:', userError);
        throw new Error('Authentication error');
      }

      const userId = data.user.id;
      console.log('Current user:', userId);
      console.log('Transaction amount:', totalAmount);

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          coin_symbol: coinSymbol,
          transaction_type: type,
          quantity,
          price_per_coin: pricePerCoin,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Failed to create transaction:', transactionError);
        throw new Error('Failed to create transaction');
      }

      console.log('Transaction created:', transaction);

      // Update funds
      const { data: fundsResult, error: fundsUpdateError } = await supabase
        .rpc(type === 'BUY' ? 'decrement_funds' : 'increment_funds', {
          p_user_id: userId,
          p_amount: type === 'BUY' ? -totalAmount : totalAmount
        });

      console.log('Funds update result:', fundsResult);

      if (fundsUpdateError) {
        console.error('Funds update error:', fundsUpdateError);
        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);
        throw new Error(`Failed to update funds: ${fundsUpdateError.message}`);
      }

      if (!fundsResult?.success) {
        console.error('Funds update failed:', fundsResult?.error);
        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);
        throw new Error(fundsResult?.error || 'Insufficient funds');
      }

      // Update portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolio')
        .select('quantity')
        .eq('user_id', userId)
        .eq('coin_symbol', coinSymbol)
        .single();

      // It's okay if the portfolio doesn't exist for a buy
      if (portfolioError && type === 'BUY' && portfolioError.code === 'PGRST116') {
        console.log('No existing portfolio entry - will create new one');
      } else if (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError);
        throw new Error('Failed to fetch portfolio data');
      }

      console.log('Current portfolio:', portfolio);

      let portfolioOperation;
      if (type === 'BUY') {
        // Handle buy operation
        if (portfolio) {
          // Update existing portfolio entry
          const newQuantity = (portfolio.quantity || 0) + quantity;
          portfolioOperation = supabase
            .from('portfolio')
            .update({ 
              quantity: newQuantity,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('coin_symbol', coinSymbol);
        } else {
          // Create new portfolio entry
          portfolioOperation = supabase
            .from('portfolio')
            .insert({
              user_id: userId,
              coin_symbol: coinSymbol,
              quantity: quantity,
              cost_basis: pricePerCoin,
              last_updated: new Date().toISOString()
            });
        }
      } else {
        // Handle sell operation
        if (!portfolio) {
          throw new Error('No coins available to sell');
        }

        const currentQuantity = portfolio.quantity || 0;
        console.log('Current portfolio state:', {
          currentQuantity,
          requestedQuantity: quantity,
          coinSymbol,
          userId
        });

        if (currentQuantity < quantity) {
          throw new Error('Insufficient coins to sell');
        }

        const newQuantity = currentQuantity - quantity;
        console.log('Sell operation:', { 
          currentQuantity, 
          quantity, 
          newQuantity,
          isSellingAll: currentQuantity === quantity 
        });

        // Add funds from sale first
        const saleAmount = totalAmount;
        console.log('Processing sale amount:', saleAmount);
        
        const { data: fundsResult, error: fundsUpdateError } = await supabase
          .rpc('increment_funds', {
            p_user_id: userId,
            p_amount: saleAmount
          });

        console.log('Funds update result:', fundsResult);

        if (fundsUpdateError) {
          console.error('Funds update error:', fundsUpdateError);
          throw new Error(`Failed to update funds: ${fundsUpdateError.message}`);
        }

        if (!fundsResult?.success) {
          console.error('Funds update failed:', fundsResult?.error);
          throw new Error(fundsResult?.error || 'Failed to update funds');
        }

        // Handle portfolio update based on whether we're selling all or part
        if (Math.abs(currentQuantity - quantity) < 0.00000001) {
          // Selling all coins - delete the entry
          console.log('Selling all coins - deleting portfolio entry');
          const { error: deleteError } = await supabase
            .from('portfolio')
            .delete()
            .eq('user_id', userId)
            .eq('coin_symbol', coinSymbol);

          if (deleteError) {
            console.error('Portfolio delete error:', deleteError);
            throw new Error('Failed to delete portfolio entry');
          }
        } else {
          // Selling part of holdings - update quantity
          console.log('Updating portfolio quantity to:', newQuantity);
          const { error: updateError } = await supabase
            .from('portfolio')
            .update({ 
              quantity: newQuantity,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('coin_symbol', coinSymbol);

          if (updateError) {
            console.error('Portfolio update error:', updateError);
            throw new Error('Failed to update portfolio quantity');
          }
        }

        // Verify the final state
        const { data: verifyData } = await supabase
          .from('portfolio')
          .select('quantity')
          .eq('user_id', userId)
          .eq('coin_symbol', coinSymbol)
          .single();

        console.log('Final portfolio state:', verifyData);

        // Update transaction status to completed
        const { error: transactionError } = await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);

        if (transactionError) {
          console.error('Transaction update error:', transactionError);
          throw new Error('Failed to update transaction status');
        }

        // Emit an event for portfolio updates
        window.dispatchEvent(new CustomEvent('portfolioUpdate', {
          detail: {
            type: 'sell',
            coinSymbol,
            quantity,
            timestamp: new Date().toISOString()
          }
        }));

        console.log('Sale completed successfully');
        return {};
      }

      const { data: updatedPortfolio, error: portfolioUpdateError } = await portfolioOperation;
      console.log('Portfolio update result:', { updatedPortfolio, portfolioUpdateError });

      if (portfolioUpdateError) {
        console.error('Portfolio update error:', portfolioUpdateError);
        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);
        throw new Error('Failed to update portfolio');
      }

      // Update transaction status to completed
      await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      return {};
    } catch (err) {
      console.error('Transaction error:', err);
      return { 
        error: err instanceof Error 
          ? err.message 
          : 'Transaction failed'
      };
    }
  };

  return (
    <TransactionContext.Provider value={{
      executeTransaction,
      transactions,
      loading,
      error
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}