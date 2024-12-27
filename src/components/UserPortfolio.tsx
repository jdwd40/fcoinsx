import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Coins } from 'lucide-react';
import SellModal from './SellModal';

interface Portfolio {
  coin_symbol: string;
  quantity: number;
  current_price?: number;
  total_value?: number;
}

export function UserPortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<{
    symbol: string;
    name: string;
    price: number;
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        if (!user) return;

        setLoading(true);
        setError(null);
        console.log('Loading portfolio for user:', user.id);

        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('coin_symbol, quantity')
          .eq('user_id', user.id)
          .gt('quantity', 0.00000001); // Only get meaningful quantities

        console.log('Raw portfolio data:', portfolioData);

        if (portfolioError) {
          console.error('Portfolio load error:', portfolioError);
          throw portfolioError;
        }

        if (!portfolioData || portfolioData.length === 0) {
          console.log('No portfolio data found');
          setPortfolio([]);
          return;
        }

        // Get current prices for all coins
        const uniqueSymbols = [...new Set(portfolioData.map(item => item.coin_symbol))];
        const prices: Record<string, number> = {};
        
        uniqueSymbols.forEach(symbol => {
          prices[symbol] = Math.random() * 50000; // Placeholder price
        });

        // Calculate total values
        const portfolioWithValues = portfolioData.map(item => ({
          ...item,
          current_price: prices[item.coin_symbol],
          total_value: prices[item.coin_symbol] * item.quantity
        }));

        console.log('Setting portfolio with values:', portfolioWithValues);
        setPortfolio(portfolioWithValues);
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [user, refreshTrigger]);

  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('Portfolio update event received');
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('portfolioUpdate', handlePortfolioUpdate);
    return () => window.removeEventListener('portfolioUpdate', handlePortfolioUpdate);
  }, []);

  const getCoinName = (symbol: string) => {
    switch (symbol) {
      case 'FBTC':
        return 'Fantasy Bitcoin';
      case 'FETH':
        return 'Fantasy Ethereum';
      case 'FSOL':
        return 'Fantasy Solana';
      default:
        return symbol;
    }
  };

  const handleSellClick = (coin: Portfolio) => {
    console.log('Initiating sell for coin:', coin);
    setSelectedCoin({
      symbol: coin.coin_symbol,
      name: getCoinName(coin.coin_symbol),
      price: coin.current_price || 0
    });
  };

  const handleSellComplete = () => {
    console.log('Sale completed, refreshing portfolio');
    setSelectedCoin(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please log in to view your portfolio
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No coins in your portfolio yet
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {portfolio.map((item) => (
              <tr key={item.coin_symbol}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getCoinName(item.coin_symbol)} ({item.coin_symbol})
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.quantity.toFixed(8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${item.current_price?.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${item.total_value?.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleSellClick(item)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Coins className="h-4 w-4 mr-1" />
                    Sell
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={4}>
                Total Portfolio Value
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${portfolio.reduce((sum, item) => sum + (item.total_value || 0), 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {selectedCoin && (
        <SellModal
          isOpen={true}
          onClose={() => setSelectedCoin(null)}
          coinSymbol={selectedCoin.symbol}
          coinName={selectedCoin.name}
          currentPrice={selectedCoin.price}
          onSellComplete={handleSellComplete}
        />
      )}
    </>
  );
}
