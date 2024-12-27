import React from 'react';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

const MarketInsights = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">24h Volume</p>
            <p className="text-xl font-semibold">$48.2B</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Market Cap</p>
            <p className="text-xl font-semibold">$1.2T</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Active Pairs</p>
            <p className="text-xl font-semibold">2,481</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;