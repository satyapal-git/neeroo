import { useState, useEffect, useCallback } from 'react';
import { menuService } from '../services/menuService';
import toast from 'react-hot-toast';

export const useMenu = (category = null) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Memoized fetch function that can be called manually
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (category) {
        response = await menuService.getItemsByCategory(category);
      } else {
        response = await menuService.getAllItems();
      }
      
      setItems(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load menu items';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Auto-fetch on mount and when category changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ✅ Add item with auto-refetch
  const addItem = async (itemData) => {
    try {
      const response = await menuService.addItem(itemData);
      
      // Automatically refetch to update the list
      await fetchItems();
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item';
      toast.error(errorMessage);
      throw err;
    }
  };

  // ✅ Update item with auto-refetch
  const updateItem = async (itemId, itemData) => {
    try {
      const response = await menuService.updateItem(itemId, itemData);
      
      // Automatically refetch to update the list
      await fetchItems();
      
      toast.success('Item updated successfully');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update item';
      toast.error(errorMessage);
      throw err;
    }
  };

  // ✅ Delete item with auto-refetch
  const deleteItem = async (itemId) => {
    try {
      await menuService.deleteItem(itemId);
      
      // Automatically refetch to update the list
      await fetchItems();
      
      toast.success('Item deleted successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete item';
      toast.error(errorMessage);
      throw err;
    }
  };

  // ✅ Toggle stock with auto-refetch
  const toggleStock = async (itemId) => {
    try {
      await menuService.toggleStockStatus(itemId);
      
      // Automatically refetch to update the list
      await fetchItems();
      
      toast.success('Stock status updated');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update stock status';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    fetchItems, // ✅ Export this so components can manually refetch
    addItem,
    updateItem,
    deleteItem,
    toggleStock,
  };
};