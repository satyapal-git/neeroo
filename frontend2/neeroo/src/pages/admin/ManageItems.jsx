import { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ItemManagementCard from '../../components/admin/ItemManagementCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useMenu } from '../../hooks/useMenu';
import { CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const ManageItems = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { items, loading, deleteItem, toggleStock, fetchItems } = useMenu(
    selectedCategory === 'all' ? null : selectedCategory
  );

  const handleEdit = (item) => {
    // For now, just show alert. You can implement edit modal later
    toast('Edit functionality - implement a modal with pre-filled form', {
      icon: 'ℹ️',
    });
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem(itemId);
    }
  };

  const handleToggleStock = async (itemId) => {
    await toggleStock(itemId);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📝 Manage Menu Items
          </h1>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading items..." />
        ) : items.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">
              No items found in this category
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <ItemManagementCard
                key={item._id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStock={handleToggleStock}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageItems;