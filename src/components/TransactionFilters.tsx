import React from 'react';

interface TransactionFiltersProps {
  typeFilter: string;
  coinFilter: string;
  onTypeFilterChange: (value: string) => void;
  onCoinFilterChange: (value: string) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  typeFilter,
  coinFilter,
  onTypeFilterChange,
  onCoinFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          id="typeFilter"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      
      <div className="flex-1">
        <label htmlFor="coinFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Coin
        </label>
        <select
          id="coinFilter"
          value={coinFilter}
          onChange={(e) => onCoinFilterChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Coins</option>
          <option value="FBTC">Fantasy Bitcoin</option>
          <option value="FETH">Fantasy Ethereum</option>
          <option value="FSOL">Fantasy Solana</option>
        </select>
      </div>
    </div>
  );
};

export default TransactionFilters;