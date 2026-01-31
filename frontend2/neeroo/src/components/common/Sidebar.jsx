// import { CATEGORIES } from '../../utils/constants';

// const Sidebar = ({ selectedCategory, onCategorySelect }) => {
//   return (
//     <div className="w-64 bg-gray-50 border-r-2 border-gray-300 flex flex-col h-full">
//       <div className="bg-gray-700 text-white text-center py-5 font-bold text-xl flex-shrink-0">
//         MENU
//       </div>
      
//       <div className="flex-1 overflow-y-auto">
//         <ul className="list-none">
//           {CATEGORIES.map((category) => (
//             <li key={category.id} className="border-b border-gray-300">
//               <button
//                 onClick={() => onCategorySelect(category.id)}
//                 className={`w-full flex items-center px-5 py-4 transition-all hover:bg-gray-200 ${
//                   selectedCategory === category.id
//                     ? 'bg-green-100 text-green-800 font-semibold border-l-4 border-green-600'
//                     : 'text-gray-800'
//                 }`}
//               >
//                 <span className="text-2xl mr-4 w-8">{category.emoji}</span>
//                 <span className="text-base">{category.name}</span>
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;




// new start
import { CATEGORIES } from '../../utils/constants';

const Sidebar = ({ selectedCategory, onCategorySelect }) => {
  return (
    <aside className="w-16 sm:w-20 md:w-24 bg-[#2D1810] overflow-y-auto p-2 flex flex-col gap-3 flex-shrink-0">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`
            rounded-xl p-3 text-center cursor-pointer transition-all duration-300
            ${selectedCategory === category.id 
              ? 'bg-[#FF8C00] shadow-lg scale-105' 
              : 'bg-[#3D2415] hover:bg-[#4D3425] hover:scale-105'
            }
          `}
        >
          <span className="text-xl sm:text-2xl block mb-1">{category.emoji}</span>
          <span className="text-white text-[0.5rem] sm:text-[0.65rem] font-semibold uppercase leading-tight">
            {category.name}
          </span>
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;