import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';
import { supabase } from '../lib/supabase';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinSymbol: string;
  coinName: string;
  currentPrice: number;
  onSellComplete?: () => void;
}

const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  coinSymbol,
  coinName,
  currentPrice,
  onSellComplete,
}) => {
  const { user } = useAuth();
  const { executeTransaction } = useTransactions();
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadAvailableQuantity();
    }
  }, [user, isOpen, coinSymbol]);

  const loadAvailableQuantity = async () => {
    try {
      if (!user) return;

      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolio')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('coin_symbol', coinSymbol)
        .single();

      if (portfolioError) {
        if (portfolioError.code === 'PGRST116') {
          // No portfolio entry found
          setAvailableQuantity(0);
        } else {
          throw portfolioError;
        }
      } else {
        setAvailableQuantity(portfolio?.quantity || 0);
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError('Failed to load available quantity');
    }
  };

  const totalValue = parseFloat(quantity || '0') * currentPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    try {
      if (!showConfirmation) {
        setShowConfirmation(true);
        return;
      }

      if (!user) {
        throw new Error('Please log in to sell');
      }

      if (!quantity || parseFloat(quantity) <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      const sellQuantity = parseFloat(quantity);
      if (sellQuantity > availableQuantity) {
        throw new Error('Insufficient coins to sell');
      }

      setIsProcessing(true);
      setLoading(true);
      setError('');
      
      const result = await executeTransaction({
        type: 'SELL',
        coinSymbol,
        quantity: sellQuantity,
        pricePerCoin: currentPrice,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setShowSuccess(true);
      // Reset form
      setQuantity('');
      setShowConfirmation(false);
      
      // Call onSellComplete callback
      onSellComplete?.();
      
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
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Sell {coinName}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Current price: ${currentPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Available: {availableQuantity.toFixed(8)} {coinSymbol}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    step="0.00000001"
                    min="0"
                    max={availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0.00000000"
                    disabled={loading || showConfirmation}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">{coinSymbol}</span>
                  </div>
                </div>

                {quantity && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Total value: ${totalValue.toLocaleString()}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-center text-red-500">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {showSuccess && (
                  <div className="mt-4 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Sale successful! Your wallet has been updated.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading || !quantity || parseFloat(quantity) <= 0 || parseFloat(quantity) > availableQuantity}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-300 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {showConfirmation ? 'Confirm Sale' : 'Sell Now'}
                  </button>
                  {showConfirmation && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmation(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellModal;
