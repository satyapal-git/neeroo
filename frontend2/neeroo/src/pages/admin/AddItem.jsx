import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useMenu } from '../../hooks/useMenu';
import { CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const AddItem = () => {
  const navigate = useNavigate();
  const { addItem } = useMenu();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'indian',
    halfPrice: '',
    fullPrice: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter item name');
      return;
    }

    if (!formData.halfPrice && !formData.fullPrice) {
      toast.error('Please enter at least one price');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name.trim(),
        category: formData.category,
        halfPrice: formData.halfPrice ? parseFloat(formData.halfPrice) : null,
        fullPrice: formData.fullPrice ? parseFloat(formData.fullPrice) : null,
        image: formData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
        inStock: true,
      };

      await addItem(itemData);
      
      // Reset form
      setFormData({
        name: '',
        category: 'indian',
        halfPrice: '',
        fullPrice: '',
        image: '',
      });
      
      toast.success('Item added successfully! Add another or go to Manage Items.');
    } catch (error) {
      // Error already handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="card mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              ➕ Add New Menu Item
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="card">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                disabled={loading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Half Price (₹)
                </label>
                <input
                  type="number"
                  name="halfPrice"
                  value={formData.halfPrice}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="0"
                  step="1"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Full Price (₹)
                </label>
                <input
                  type="number"
                  name="fullPrice"
                  value={formData.fullPrice}
                  onChange={handleChange}
                  placeholder="e.g., 170"
                  min="0"
                  step="1"
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg (optional)"
                className="input-field"
                disabled={loading}
              />
              <p className="text-sm text-gray-600 mt-1">
                Leave empty to use default image
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Adding Item...' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/manage-items')}
                className="btn-secondary flex-1"
              >
                Go to Manage Items
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;