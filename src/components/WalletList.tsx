import React from 'react';
import { Coins } from 'lucide-react';

interface WalletCoin {
  name: string;
  quantity: number;
}

interface WalletListProps {
  coins: WalletCoin[];
}

const WalletList: React.FC<WalletListProps> = ({ coins }) => {
  if (coins.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Coins className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Your wallet is empty. Add some coins to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coins.map((coin, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{coin.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-gray-900">{coin.quantity.toLocaleString()}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WalletList;