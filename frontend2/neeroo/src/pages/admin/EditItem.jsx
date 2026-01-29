import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useMenu } from '../../hooks/useMenu';
import { CATEGORIES } from '../../utils/constants';
import { menuService } from '../../services/menuService;
import { getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateItem, getItemById } = useMenu();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'indian',
    halfPrice: '',
    fullPrice: '',
    description: '',
  });
  const [currentImage, setCurrentImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await menuService.getItemById(id);
        const item = response.data;
        
        setFormData({
          name: item.name,
          category: item.category,
          halfPrice: item.halfPrice || '',
          fullPrice: item.fullPrice || '',
          description: item.description || '',
        });
        setCurrentImage(item.image);
      } catch (error) {
        toast.error('Failed to load item details');
        navigate('/admin/manage-items');
      } finally {
        setFetchingItem(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewImage = () => {
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
      let imageUrl = currentImage;
      let cloudinaryId = null;

      // Upload new image if selected
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

      const itemData = {
        name: formData.name.trim(),
        category: formData.category,
        halfPrice: formData.halfPrice ? parseFloat(formData.halfPrice) : null,
        fullPrice: formData.fullPrice ? parseFloat(formData.fullPrice) : null,
        description: formData.description.trim() || undefined,
        image: imageUrl,
      };

      if (cloudinaryId) {
        itemData.cloudinaryId = cloudinaryId;
      }

      await updateItem(id, itemData);
      toast.success('Item updated successfully!');
      navigate('/admin/manage-items');
    } catch (error) {
      // Error already handled
    } finally {
      setLoading(false);
    }
  };

  if (fetchingItem) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="card mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              ✏️ Edit Menu Item
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="card">
            {/* Current Image */}
            {currentImage && !imagePreview && (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Current Image
                </label>
                <img
                  src={getImageUrl(currentImage)}
                  alt="Current"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* New Image Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                {imagePreview ? 'New Image' : 'Upload New Image (Optional)'}
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
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
                    <Upload size={48} className="text-gray-400 mb-2" />
                    <span className="text-gray-600 font-medium">Click to upload new image</span>
                    <span className="text-sm text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Item Name */}
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

            {/* Category */}
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

            {/* Prices */}
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

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
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
              <p className="text-sm text-gray-600 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="btn-primary flex-1"
              >
                {uploadingImage ? 'Uploading Image...' : loading ? 'Updating...' : 'Update Item'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/manage-items')}
                className="btn-secondary flex-1"
                disabled={loading}
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

export default EditItem;