import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard = ({ title, value, icon, color, change }: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold">{value}</p>
            {change && (
              <span className={`ml-2 text-xs font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;