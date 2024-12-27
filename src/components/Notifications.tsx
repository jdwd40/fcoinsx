import React from 'react';
import { Bell, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    title: 'Price Alert',
    message: 'FBTC is up 5% in the last hour',
    time: '5 minutes ago',
    icon: TrendingUp,
    type: 'success'
  },
  {
    id: 2,
    title: 'Transaction Complete',
    message: 'Successfully purchased 0.5 FETH',
    time: '1 hour ago',
    icon: DollarSign,
    type: 'info'
  },
  {
    id: 3,
    title: 'Security Alert',
    message: 'New login detected from Chrome browser',
    time: '2 hours ago',
    icon: AlertCircle,
    type: 'warning'
  }
];

interface NotificationsProps {
  isOpen: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-screen sm:w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-600 bg-indigo-100 rounded-full">
            {mockNotifications.length} New
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {mockNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-green-100 text-green-500' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-500' :
                  'bg-blue-100 text-blue-500'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default Notifications;