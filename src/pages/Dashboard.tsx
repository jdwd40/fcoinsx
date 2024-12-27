import React from 'react';
import BalanceCard from '../components/BalanceCard';
import PortfolioChart from '../components/PortfolioChart';
import FundsDisplay from '../components/FundsDisplay';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
        <p className="mt-2 text-gray-600">Track your fantasy crypto investments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <BalanceCard />
          <div className="mt-6">
            <FundsDisplay />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Value</h2>
            <PortfolioChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;