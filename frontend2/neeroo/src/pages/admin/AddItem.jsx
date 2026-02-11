import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Menu } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useMenu } from '../../hooks/useMenu';
import { CATEGORIES } from '../../utils/constants';
import { menuService } from '../../services/menuService';
import toast from 'react-hot-toast';

const AddItem = () => {
  const navigate = useNavigate();
  const { addItem } = useMenu();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'indian',
    halfPrice: '',
    fullPrice: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
      let imageUrl = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop';
      let cloudinaryId = null;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        const formDataImage = new FormData();
        formDataImage.append('image', imageFile);

        try {
          const uploadResponse = await menuService.uploadImage(formDataImage);
          imageUrl = uploadResponse.data.url;
          cloudinaryId = uploadResponse.data.publicId;
          toast.success('Image uploaded successfully');
        } catch (error) {
          toast.error('Failed to upload image');
          setUploadingImage(false);
          setLoading(false);
          return;
        }
        setUploadingImage(false);
      }

      // Create item data
      const itemData = {
        name: formData.name.trim(),
        category: formData.category,
        halfPrice: formData.halfPrice ? parseFloat(formData.halfPrice) : null,
        fullPrice: formData.fullPrice ? parseFloat(formData.fullPrice) : null,
        description: formData.description.trim() || undefined,
        image: imageUrl,
        cloudinaryId: cloudinaryId,
      };

      await addItem(itemData);
      
      // Reset form
      setFormData({
        name: '',
        category: 'indian',
        halfPrice: '',
        fullPrice: '',
        description: '',
      });
      setImageFile(null);
      setImagePreview(null);
      
      toast.success('Item added successfully! Add another or go to Manage Items.');
    } catch (error) {
      // Error already handled by hook
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl font-bold">Add New Item</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card mb-4 sm:mb-6 hidden lg:block">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              ➕ Add New Menu Item
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="card">
            {/* Image Upload */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Item Image
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={40} className="sm:w-12 sm:h-12 text-gray-400 mb-2" />
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Click to upload image</span>
                    <span className="text-xs sm:text-sm text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                {imageFile ? `Selected: ${imageFile.name}` : 'No image selected (will use default)'}
              </p>
            </div>

            {/* Item Name */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
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

            {/* Category */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
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

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
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
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
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

            {/* Description */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description"
                rows="3"
                maxLength="500"
                className="input-field resize-none"
                disabled={loading}
              />
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="btn-primary flex-1 text-sm sm:text-base"
              >
                {uploadingImage ? 'Uploading Image...' : loading ? 'Adding Item...' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/manage-items')}
                className="btn-secondary flex-1 text-sm sm:text-base"
                disabled={loading}
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