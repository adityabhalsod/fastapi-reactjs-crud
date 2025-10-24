import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

export const ItemDetailSkeleton: React.FC = () => {
  return (
    <div className="glass-card animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="h-20 bg-gray-300 rounded"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="glass-card animate-pulse">
      <div className="space-y-6">
        <div>
          <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-24 bg-gray-300 rounded w-full"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <div className="h-10 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

const Skeletons = {
  CardSkeleton,
  TableRowSkeleton,
  ItemDetailSkeleton,
  FormSkeleton,
};

export default Skeletons;
