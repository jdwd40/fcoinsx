import React from 'react';
import FundsDisplay from '../components/FundsDisplay';
import { UserPortfolio } from '../components/UserPortfolio';

const Wallet = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="mt-2 text-gray-600">Manage your fantasy crypto holdings</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FundsDisplay />
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">My Portfolio</h2>
            <UserPortfolio />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;