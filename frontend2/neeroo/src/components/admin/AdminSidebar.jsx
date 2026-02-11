import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, List, X } from 'lucide-react';

const AdminSidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/add-item', icon: Plus, label: 'Add Item' },
    { path: '/admin/manage-items', icon: List, label: 'Manage Items' },
  ];

  const handleMenuClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen">
      <div className="p-6">
        {/* Header with close button for mobile */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          {/* Close button - only visible on mobile */}
          {onClose && (
            <button
              onClick={handleCloseClick}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              type="button"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;