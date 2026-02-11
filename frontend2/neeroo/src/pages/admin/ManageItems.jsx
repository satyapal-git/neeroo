import { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ItemManagementCard from '../../components/admin/ItemManagementCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useMenu } from '../../hooks/useMenu';
import { CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const ManageItems = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 p-4 sm:p-6 overflow-x-hidden w-full">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden mb-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">Manage Items</h1>
        </div>

        <div className="card mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-4 hidden lg:block">
            📝 Manage Menu Items
          </h1>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-black'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-black'
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
            <p className="text-gray-500 text-base sm:text-lg">
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