import api from './api';

export const menuService = {
  // Get all menu items
  getAllItems: async () => {
    return await api.get('/menu/items');
  },

  // Get items by category
  getItemsByCategory: async (category) => {
    return await api.get(`/menu/items/category/${category}`);
  },

  // Get single item
  getItemById: async (itemId) => {
    return await api.get(`/menu/items/${itemId}`);
  },

  // Admin: Add new item
  addItem: async (itemData) => {
    return await api.post('/menu/items', itemData);
  },

  // Admin: Update item
  updateItem: async (itemId, itemData) => {
    return await api.put(`/menu/items/${itemId}`, itemData);
  },

  // Admin: Delete item
  deleteItem: async (itemId) => {
    return await api.delete(`/menu/items/${itemId}`);
  },

  // Admin: Toggle stock status
  toggleStockStatus: async (itemId) => {
    return await api.patch(`/menu/items/${itemId}/stock`);
  },

  // Upload image
  uploadImage: async (formData) => {
    return await api.post('/menu/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};