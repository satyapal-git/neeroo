import { CATEGORIES } from '../../utils/constants';

const CategoryList = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`p-4 rounded-xl transition-all duration-300 ${
            selectedCategory === category.id
              ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-xl scale-105'
              : 'bg-white hover:shadow-lg hover:scale-105'
          }`}
        >
          <div className="text-4xl mb-2">{category.emoji}</div>
          <div className="text-sm font-semibold">{category.name}</div>
        </button>
      ))}
    </div>
  );
};

export default CategoryList;