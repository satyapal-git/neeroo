// import { useState } from 'react';
// import Navbar from '../../components/common/Navbar';
// import Sidebar from '../../components/common/Sidebar';
// import DishCard from '../../components/user/DishCard';
// import FloatingCart from '../../components/user/FloatingCart';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import ErrorMessage from '../../components/common/ErrorMessage';
// import { useMenu } from '../../hooks/useMenu';
// import { CATEGORIES } from '../../utils/constants';

// const Menu = () => {
//   const [selectedCategory, setSelectedCategory] = useState('indian');
//   const { items, loading, error, fetchItems } = useMenu(selectedCategory);

//   const currentCategory = CATEGORIES.find(cat => cat.id === selectedCategory);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />
      
//       <div className="flex h-[calc(100vh-4rem)]">
//         <Sidebar
//           selectedCategory={selectedCategory}
//           onCategorySelect={setSelectedCategory}
//         />
        
//         <div className="flex-1 overflow-y-auto">
//           <div className="max-w-7xl mx-auto p-6">
//             <div className="mb-8 text-center">
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-teal-500 bg-clip-text text-transparent mb-2">
//                 {currentCategory?.emoji} {currentCategory?.name}
//               </h1>
//               <p className="text-gray-600">Delicious dishes just for you</p>
//             </div>

//             {loading ? (
//               <LoadingSpinner text="Loading menu items..." />
//             ) : error ? (
//               <ErrorMessage message={error} onRetry={fetchItems} />
//             ) : items.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-gray-500 text-lg">No items available in this category</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {items.map((dish) => (
//                   <DishCard key={dish._id} dish={dish} />
//                 ))}
//               </div>
//             )}

//             <div className="mt-12 card text-center">
//               <h2 className="text-2xl font-bold mb-4">Taj Food Bakers & Caterers</h2>
//               <p className="text-gray-600 mb-2">Breakfast, Lunch & Dinner Available</p>
//               <p className="text-gray-600 mb-4">#27, Barwala Road, Palika Bazar, Hisar</p>
//               <a
//                 href="tel:+919896055119"
//                 className="inline-block bg-gradient-to-r from-red-500 to-teal-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
//               >
//                 📞 +91-98-96-05-5119
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>

//       <FloatingCart />
//     </div>
//   );
// };

// export default Menu;




// new start
import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import DishCard from '../../components/user/DishCard';
import FloatingCart from '../../components/user/FloatingCart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useMenu } from '../../hooks/useMenu';
import { CATEGORIES } from '../../utils/constants';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('indian');
  const { items, loading, error, fetchItems } = useMenu(selectedCategory);

  const currentCategory = CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className="flex flex-col bg-[#FAF7F5]" style={{ height: '100vh' }}>
    {/* <div className="flex flex-col h-screen bg-[#FAF7F5]">*/}
      {/* Keep existing Navbar - it has all profile features */}
      <Navbar />
      
      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Keep existing Sidebar component - it's already working */}
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        {/* Content Area - Only UI changes here */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Category Title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {currentCategory?.name} Selection
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">
              {items.length} ITEMS
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingSpinner text="Loading menu items..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchItems} />
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items available in this category</p>
            </div>
          ) : (
            // Changed from grid to vertical list for screenshot-accurate layout
            <div className="space-y-4">
              {items.map((dish) => (
                <DishCard key={dish._id} dish={dish} />
              ))}
            </div>
          )}

          {/* Restaurant Info - Keep it */}
          <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Taj Food Bakers & Caterers</h2>
            <p className="text-gray-600 mb-2">Breakfast, Lunch & Dinner Available</p>
            <p className="text-gray-600 mb-4">#27, Barwala Road, Palika Bazar, Hisar</p>
            <a
              href="tel:+919896055119"
              className="inline-block bg-[#3D2415] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4D3425] transition-all shadow-lg"
            >
              📞 +91-98-96-05-5119
            </a>
          </div>
        </div>
      </div>

      {/* Keep existing FloatingCart - it's already working */}
      <FloatingCart />
    </div>
  );
};

export default Menu;