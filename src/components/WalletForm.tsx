import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface WalletFormProps {
  onAddCoin: (coin: { name: string; quantity: number }) => void;
}

const WalletForm: React.FC<WalletFormProps> = ({ onAddCoin }) => {
  const [coinName, setCoinName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coinName && quantity) {
      onAddCoin({
        name: coinName,
        quantity: parseFloat(quantity),
      });
      setCoinName('');
      setQuantity('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="coinName" className="block text-sm font-medium text-gray-700 mb-1">
            Coin Name
          </label>
          <input
            type="text"
            id="coinName"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Fantasy Bitcoin"
            required
          />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
            step="any"
            min="0"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add to Wallet
      </button>
    </form>
  );
};

export default WalletForm;