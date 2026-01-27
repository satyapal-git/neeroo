import { useState } from 'react';
import { Edit, Trash2, Power } from 'lucide-react';
import { getImageUrl, formatCurrency } from '../../utils/helpers';

const ItemManagementCard = ({ item, onEdit, onDelete, onToggleStock }) => {
  const [loading, setLoading] = useState(false);

  const handleToggleStock = async () => {
    setLoading(true);
    try {
      await onToggleStock(item._id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card ${!item.inStock ? 'opacity-60 bg-gray-100' : ''}`}>
      <div className="flex gap-4">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleStock}
                disabled={loading}
                className={`p-2 rounded-lg transition-all ${
                  item.inStock
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
                title={item.inStock ? 'In Stock' : 'Out of Stock'}
              >
                <Power size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-3">
            {item.halfPrice && (
              <div>
                <span className="text-xs text-gray-600">Half: </span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(item.halfPrice)}
                </span>
              </div>
            )}
            {item.fullPrice && (
              <div>
                <span className="text-xs text-gray-600">Full: </span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(item.fullPrice)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemManagementCard;