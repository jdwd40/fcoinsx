import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, DollarSign, BarChart3, Coins, ShoppingCart } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import BuyModal from '../components/BuyModal';
import SellModal from '../components/SellModal';
import { getMockPriceHistory } from '../types/coin';

const timeframes = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
];

const CoinDetails = () => {
  const { coinSymbol } = useParams<{ coinSymbol: string }>();
  const [timeframe, setTimeframe] = useState('7d');
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  
  // Mock data - replace with real API data later
  const priceData = getMockPriceHistory(
    timeframe === '24h' ? 1 : 
    timeframe === '7d' ? 7 : 
    timeframe === '30d' ? 30 : 90
  );
  
  const currentPrice = priceData[priceData.length - 1].price;
  const previousPrice = priceData[0].price;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

  const coinName = 
    coinSymbol === 'FBTC' ? 'Fantasy Bitcoin' :
    coinSymbol === 'FETH' ? 'Fantasy Ethereum' :
    coinSymbol === 'FSOL' ? 'Fantasy Solana' : coinSymbol;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {coinName} ({coinSymbol})
            </h1>
            <p className="mt-1 text-gray-500">Real-time price and market data</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">${currentPrice.toLocaleString()}</span>
            <span className={`flex items-center ${
              priceChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {priceChange >= 0 ? (
                <ArrowUp className="h-5 w-5 mr-1" />
              ) : (
                <ArrowDown className="h-5 w-5 mr-1" />
              )}
              {Math.abs(priceChange).toFixed(2)}%
            </span>
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Buy
            </button>
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Coins className="h-5 w-5 mr-2" />
              Sell
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-lg font-semibold">$927.2B</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Volume (24h)</p>
              <p className="text-lg font-semibold">$28.9B</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Coins className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Circulating Supply</p>
              <p className="text-lg font-semibold">19.5M</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Coins className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Supply</p>
              <p className="text-lg font-semibold">21.0M</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Price Chart</h2>
          <div className="flex space-x-2">
            {timeframes.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeframe === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        <PriceChart data={priceData} timeframe={timeframe} />
      </div>
      
      <BuyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        coinSymbol={coinSymbol || ''}
        coinName={coinName}
        currentPrice={currentPrice}
      />
      
      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        coinSymbol={coinSymbol || ''}
        coinName={coinName}
        currentPrice={currentPrice}
      />
    </div>
  );
};

export default CoinDetails;