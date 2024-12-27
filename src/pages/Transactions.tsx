import React, { useState, useMemo } from 'react';
import TransactionTable from '../components/TransactionTable';
import TransactionFilters from '../components/TransactionFilters';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 5;

// Mock transaction data
const mockTransactions = Array.from({ length: 20 }, (_, i) => ({
  id: `tx-${i + 1}`,
  type: Math.random() > 0.5 ? 'buy' : 'sell',
  coin: ['FBTC', 'FETH', 'FSOL'][Math.floor(Math.random() * 3)],
  amount: parseFloat((Math.random() * 10).toFixed(4)),
  price: parseFloat((Math.random() * 50000).toFixed(2)),
  total: parseFloat((Math.random() * 100000).toFixed(2)),
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
} as const));

const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [coinFilter, setCoinFilter] = useState('');

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((tx) => {
      if (typeFilter && tx.type !== typeFilter) return false;
      if (coinFilter && tx.coin !== coinFilter) return false;
      return true;
    });
  }, [typeFilter, coinFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="mt-2 text-gray-600">View and filter your trading activity</p>
      </div>

      <TransactionFilters
        typeFilter={typeFilter}
        coinFilter={coinFilter}
        onTypeFilterChange={setTypeFilter}
        onCoinFilterChange={setCoinFilter}
      />

      <TransactionTable transactions={currentTransactions} />
      
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Transactions;