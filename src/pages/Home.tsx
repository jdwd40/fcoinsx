import React from 'react';
import MarketInsights from '../components/MarketInsights';
import TrendingCoins from '../components/TrendingCoins';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Overview</h1>
        <p className="mt-2 text-gray-600">Real-time insights into the fantasy crypto market</p>
      </div>
      
      <div className="space-y-8">
        <MarketInsights />
        
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Trending Coins</h2>
          <TrendingCoins />
        </div>
      </div>
    </div>
  );
};

export default Home;