import { CATEGORIES } from '../../utils/constants';

const Sidebar = ({ selectedCategory, onCategorySelect }) => {
  return (
    <div className="w-64 bg-gray-50 border-r-2 border-gray-300 flex flex-col h-full">
      <div className="bg-gray-700 text-white text-center py-5 font-bold text-xl flex-shrink-0">
        MENU
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="list-none">
          {CATEGORIES.map((category) => (
            <li key={category.id} className="border-b border-gray-300">
              <button
                onClick={() => onCategorySelect(category.id)}
                className={`w-full flex items-center px-5 py-4 transition-all hover:bg-gray-200 ${
                  selectedCategory === category.id
                    ? 'bg-green-100 text-green-800 font-semibold border-l-4 border-green-600'
                    : 'text-gray-800'
                }`}
              >
                <span className="text-2xl mr-4 w-8">{category.emoji}</span>
                <span className="text-base">{category.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;