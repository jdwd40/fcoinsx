import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';

const BalanceCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Wallet className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Total Balance</h2>
        </div>
        <span className="flex items-center text-sm text-green-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          +14.5%
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-gray-900">$17,245.83</p>
          <p className="text-sm text-gray-500 mt-1">Available Balance</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-500">Invested</p>
            <p className="text-lg font-semibold text-gray-900">$15,000.00</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Profit/Loss</p>
            <p className="text-lg font-semibold text-green-500">+$2,245.83</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;