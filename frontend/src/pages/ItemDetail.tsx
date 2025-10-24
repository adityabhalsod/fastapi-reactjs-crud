import React from 'react';

const ItemDetail: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Item Detail</h1>
        <div className="glass-card">
          <p className="text-gray-700">Item details will be shown here.</p>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;