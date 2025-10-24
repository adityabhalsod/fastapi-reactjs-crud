import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { itemsApi } from '../utils/api';
import type { Item, ItemCreate, ItemUpdate } from '../types';

const ItemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<ItemCreate>({
    name: '',
    description: '',
    category: '',
    price: 0,
    quantity: 0,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingItem, setFetchingItem] = useState(isEditMode);

  // Fetch item if editing
  useEffect(() => {
    if (isEditMode && id) {
      const fetchItem = async () => {
        try {
          setFetchingItem(true);
          const item = await itemsApi.getItem(parseInt(id));
          setFormData({
            name: item.name,
            description: item.description || '',
            category: item.category || '',
            price: item.price,
            quantity: item.quantity,
            is_active: item.is_active,
          });
        } catch (err: any) {
          setError(err.message || 'Failed to fetch item');
        } finally {
          setFetchingItem(false);
        }
      };
      fetchItem();
    }
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'price' || name === 'quantity') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode && id) {
        await itemsApi.partialUpdateItem(parseInt(id), formData as ItemUpdate);
      } else {
        await itemsApi.createItem(formData);
      }
      navigate('/items');
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/items');
  };

  if (fetchingItem) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card">
            <p className="text-gray-700">Loading item...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          {isEditMode ? 'Edit Item' : 'Create New Item'}
        </h1>

        <div className="glass-card">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Enter item name"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows={4}
                placeholder="Enter item description"
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Electronics, Furniture, Office"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  step="1"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Is Active */}
            <div className="form-group">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="form-label mb-0">Active Item</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Inactive items won't be displayed in the items list by default
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;