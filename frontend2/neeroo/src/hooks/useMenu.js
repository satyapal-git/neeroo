import { useState, useEffect } from 'react';
import { menuService } from '../services/menuService';
import toast from 'react-hot-toast';

export const useMenu = (category = null) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (category) {
        data = await menuService.getItemsByCategory(category);
      } else {
        data = await menuService.getAllItems();
      }
      
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      const data = await menuService.addItem(itemData);
      setItems(prev => [...prev, data.item]);
      toast.success('Item added successfully!');
      return data.item;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const updateItem = async (itemId, itemData) => {
    try {
      const data = await menuService.updateItem(itemId, itemData);
      setItems(prev =>
        prev.map(item => (item._id === itemId ? data.item : item))
      );
      toast.success('Item updated successfully!');
      return data.item;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await menuService.deleteItem(itemId);
      setItems(prev => prev.filter(item => item._id !== itemId));
      toast.success('Item deleted successfully!');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const toggleStock = async (itemId) => {
    try {
      const data = await menuService.toggleStockStatus(itemId);
      setItems(prev =>
        prev.map(item =>
          item._id === itemId ? { ...item, inStock: data.inStock } : item
        )
      );
      toast.success(`Item marked as ${data.inStock ? 'in stock' : 'out of stock'}`);
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    toggleStock,
  };
};