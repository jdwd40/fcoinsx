import React, { useEffect, useState } from 'react';
import { DollarSign, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/supabase';
import Spinner from './Spinner';

interface FundsDisplayProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const FundsDisplay: React.FC<FundsDisplayProps> = ({ 
  variant = 'full',
  className = ''
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funds, setFunds] = useState<{
    available: number;
    pending: number;
  }>({
    available: 0,
    pending: 0
  });

  useEffect(() => {
    const loadFunds = async () => {
      if (!user) return;

      try {
        // Get available funds
        const { data: fundsData, error: fundsError } = await supabase
          .from('funds')
          .select('amount')
          .eq('user_id', user.id)
          .eq('currency', 'USD')
          .single();

        if (fundsError) {
          const handledError = handleSupabaseError(fundsError);
          throw new Error(handledError.message);
        }

        // Get pending transactions total
        const { data: pendingData, error: pendingError } = await supabase
          .from('transactions')
          .select('quantity, price_per_coin, transaction_type')
          .eq('user_id', user.id)
          .eq('status', 'pending');

        if (pendingError) {
          const handledError = handleSupabaseError(pendingError);
          throw new Error(handledError.message);
        }

        const pendingAmount = (pendingData || []).reduce((total, tx) => {
          const amount = tx.quantity * tx.price_per_coin;
          return total + (tx.transaction_type === 'BUY' ? amount : -amount);
        }, 0);

        setFunds({
          available: fundsData?.amount || 0,
          pending: pendingAmount
        });
      } catch (err) {
        console.error('Error loading funds:', err);
        setError(err instanceof Error ? err.message : 'Failed to load funds');
      } finally {
        setLoading(false);
      }
    };

    loadFunds();
  }, [user]);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Available</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            ${funds.available.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Balance</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Available Funds</p>
              <p className="text-sm text-gray-500">Ready to trade</p>
            </div>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            ${funds.available.toLocaleString()}
          </span>
        </div>

        {funds.pending > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Pending</p>
                <p className="text-sm text-gray-500">Processing transactions</p>
              </div>
            </div>
            <span className="text-lg text-gray-600">
              ${funds.pending.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundsDisplay;