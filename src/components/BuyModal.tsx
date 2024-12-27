import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';
import { verifyFunds } from '../utils/transactions';
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/supabase';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinSymbol: string;
  coinName: string;
  currentPrice: number;
}

const BuyModal: React.FC<BuyModalProps> = ({
  isOpen,
  onClose,
  coinSymbol,
  coinName,
  currentPrice,
}) => {
  const { user } = useAuth();
  const { executeTransaction } = useTransactions();
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableFunds, setAvailableFunds] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const initializeFunds = async (userId: string) => {
    try {
      const { error: initError } = await supabase
        .from('funds')
        .insert({
          user_id: userId,
          currency: 'USD',
          amount: 10000, // Default starting balance
        });
      
      if (initError) {
        throw initError;
      }
      
      setAvailableFunds(10000);
    } catch (err) {
      console.error('Error initializing funds:', err);
      setError('Failed to initialize funds');
    }
  };

  useEffect(() => {
    const loadFunds = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('funds')
        .select('amount')
        .eq('user_id', user.id)
        .eq('currency', 'USD')
        .single();

      if (error?.code === 'PGRST116') {
        // No funds record found, create one
        await initializeFunds(user.id);
        return;
      }
      
      if (error && error.code !== 'PGRST116') {
        const handledError = handleSupabaseError(error);
        console.error('Error loading funds:', handledError);
        return;
      }

      setAvailableFunds(data?.amount || 0);
    };

    loadFunds();
  }, [user]);

  const totalCost = quantity ? parseFloat(quantity) * currentPrice : 0;
  const insufficientFunds = availableFunds !== null && totalCost > availableFunds;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    try {
      if (!showConfirmation) {
        setShowConfirmation(true);
        return;
      }

      if (!user) {
        throw new Error('Please log in to make a purchase');
      }

      if (!quantity || parseFloat(quantity) <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      setIsProcessing(true);
      setLoading(true);
      setError('');
      
      const result = await executeTransaction({
        type: 'BUY',
        coinSymbol,
        quantity: parseFloat(quantity),
        pricePerCoin: currentPrice,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setShowSuccess(true);
      // Reset form
      setQuantity('');
      setShowConfirmation(false);
      
      // Close modal after showing success message
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Transaction error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Transaction failed. Please try again');
      }
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl max-w-md w-full sm:my-8">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Buy {coinName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {showSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Transaction successful! Updating your portfolio...</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    step="any"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Price
                </label>
                <div className="flex items-center text-lg font-semibold text-gray-900">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
                  {currentPrice.toLocaleString()}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                
                {availableFunds !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available Funds</span>
                    <span className={insufficientFunds ? 'text-red-600' : 'text-gray-900'}>
                      ${availableFunds.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {showConfirmation ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Please confirm your purchase of {quantity} {coinSymbol} for ${totalCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirmation(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || insufficientFunds}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Purchase
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || insufficientFunds || !quantity || parseFloat(quantity) <= 0}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading || insufficientFunds || !quantity || parseFloat(quantity) <= 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : showConfirmation
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </div>
                  ) : showConfirmation ? (
                    'Confirm Purchase'
                  ) : (
                    'Buy Now'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;