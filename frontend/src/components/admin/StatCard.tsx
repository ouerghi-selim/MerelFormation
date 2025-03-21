import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-50 p-3 rounded-full">
          {icon}
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {trend && (
        <p className={`text-sm mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      )}
    </div>
  );
};

export default StatCard;
