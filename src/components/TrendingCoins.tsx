import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const trendingCoins = [
  {
    name: 'Fantasy Bitcoin',
    symbol: 'FBTC',
    price: 42069.88,
    change: 2.5,
    volume: '3.2B',
  },
  {
    name: 'Fantasy Ethereum',
    symbol: 'FETH',
    price: 2845.32,
    change: -1.2,
    volume: '1.8B',
  },
  {
    name: 'Fantasy Solana',
    symbol: 'FSOL',
    price: 123.45,
    change: 5.8,
    volume: '892M',
  },
];

const TrendingCoins = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {trendingCoins.map((coin) => (
        <Link
          to={`/coin/${coin.symbol}`}
          key={coin.symbol}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{coin.name}</h3>
                <p className="text-sm text-gray-500">{coin.symbol}</p>
              </div>
              <span className={`flex items-center ${
                coin.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {coin.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(coin.change)}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="font-medium">${coin.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volume</span>
                <span className="font-medium">${coin.volume}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TrendingCoins;