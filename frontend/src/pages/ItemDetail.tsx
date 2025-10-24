import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemsApi } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import type { Item } from '../types';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await itemsApi.getItem(parseInt(id));
        setItem(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    
    try {
      setDeleting(true);
      await itemsApi.deleteItem(item.id);
      navigate('/items');
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card">
            <p className="text-gray-700">Loading item...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card">
            <p className="text-red-500">{error}</p>
            <Link to="/items" className="btn btn-secondary mt-4 inline-block">
              Back to Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card">
            <p className="text-gray-700">Item not found</p>
            <Link to="/items" className="btn btn-secondary mt-4 inline-block">
              Back to Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Item Details</h1>
          <Link to="/items" className="btn btn-secondary">
            ← Back to Items
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Item Details Card */}
        <div className="glass-card">
          <div className="space-y-6">
            {/* Name and Status */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {item.name}
                  </h2>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  DESCRIPTION
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  CATEGORY
                </h3>
                <p className="text-gray-900">
                  {item.category || 'Uncategorized'}
                </p>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  PRICE
                </h3>
                <p className="text-2xl font-bold text-primary-600">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  QUANTITY
                </h3>
                <p className="text-gray-900 text-xl font-semibold">
                  {item.quantity}
                </p>
              </div>

              {/* Total Value */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  TOTAL VALUE
                </h3>
                <p className="text-gray-900 text-xl font-semibold">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Owner Info */}
            {item.owner && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  OWNER
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {item.owner.full_name?.[0] || item.owner.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">
                      {item.owner.full_name || item.owner.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{item.owner.username}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(item.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <Link
                to={`/items/${item.id}/edit`}
                className="btn btn-primary flex-1"
              >
                Edit Item
              </Link>
              <button
                onClick={() => setDeleteModal(true)}
                className="btn btn-danger flex-1"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
        type="danger"
      />
    </div>
  );
};

export default ItemDetail;