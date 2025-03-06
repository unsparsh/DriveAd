import { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const ChartContainer = ({ title, children, className = '' }: ChartContainerProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-gray-700 font-medium mb-4">{title}</h3>
      <div className="w-full h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;