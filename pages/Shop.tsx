
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProductCard, QuickViewModal } from '../components/Product';
import { useStore } from '../App';
import { Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
// @ts-ignore
import { useSearchParams } from 'react-router-dom';

const MotionButton = motion.button as any;

export const Shop = () => {
  const { addToCart, toggleWishlist, wishlist, products, siteSettings } = useStore();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [visibleProducts, setVisibleProducts] = useState(8);
  const [filter, setFilter] = useState('all'); // Basic preset filter
  const [sort, setSort] = useState('newest');
  
  // Advanced Filters
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [showFilters, setShowFilters] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filtering Logic
  let filteredProducts = products;

  // 1. Category
  if (categoryParam) {
    filteredProducts = filteredProducts.filter(p => p.category === categoryParam);
  }

  // 2. Preset Price Tag (Optional, keeping for legacy UI)
  if (filter === 'low') {
    filteredProducts = filteredProducts.filter(p => p.price < 5000);
  } else if (filter === 'high') {
    filteredProducts = filteredProducts.filter(p => p.price >= 5000);
  }

  // 3. Exact Range Filter
  filteredProducts = filteredProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);

  // 4. Sorting
  if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
     filteredProducts.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
  }

  const loadMore = () => setVisibleProducts(prev => prev + 4);

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
           <h1 className="text-4xl font-bold text-white mb-2">{categoryParam ? `${categoryParam} কালেকশন` : 'সব পণ্য'}</h1>
           <p className="text-gray-400">মোট {filteredProducts.length} টির মধ্যে {Math.min(visibleProducts, filteredProducts.length)} টি পণ্য দেখানো হচ্ছে</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Price Range Toggle */}
          <div className="relative">
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-bango-600 border-bango-600 text-white' : 'bg-dark-card border-white/10 hover:border-bango-500'}`}
             >
               <SlidersHorizontal size={16} /> বাজেট
             </button>
             {showFilters && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-dark-card border border-white/10 rounded-xl shadow-2xl p-4 z-20">
                   <h4 className="text-sm font-bold text-white mb-3">দামের সীমা (৳)</h4>
                   <div className="flex items-center gap-2 mb-4">
                      <input type="number" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white" placeholder="Min" />
                      <span className="text-gray-400">-</span>
                      <input type="number" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white" placeholder="Max" />
                   </div>
                   <button onClick={() => { setMinPrice(0); setMaxPrice(100000); }} className="text-xs text-bango-500 hover:underline">রিসেট করুন</button>
                </div>
             )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative group">
             <button className="flex items-center gap-2 bg-dark-card border border-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:border-bango-500 transition-colors">
               সাজান <ChevronDown size={16} />
             </button>
             <div className="absolute top-full right-0 mt-2 w-45 bg-dark-card border border-white/10 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-20">
               <button onClick={() => setSort('newest')} className="block w-full text-left px-4 py-2 hover:bg-white/5 text-sm">নতুন আগমন</button>
               <button onClick={() => setSort('price-asc')} className="block w-full text-left px-4 py-2 hover:bg-white/5 text-sm">দাম: কম থেকে বেশি</button>
               <button onClick={() => setSort('price-desc')} className="block w-full text-left px-4 py-2 hover:bg-white/5 text-sm">দাম: বেশি থেকে কম</button>
             </div>
          </div>
        </div>
      </div>

      {/* Products Grid - Dynamic Columns */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${siteSettings.shopGridCols || 4} gap-6`}>
        {filteredProducts.slice(0, visibleProducts).map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            onQuickView={setQuickViewProduct}
            isInWishlist={wishlist.some(item => item.id === product.id)}
          />
        ))}
      </div>

      {visibleProducts < filteredProducts.length && (
        <div className="mt-16 text-center">
          <MotionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadMore} className="bg-transparent border border-white/20 text-white hover:border-bango-500 hover:text-bango-500 px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all">
            আরও পণ্য দেখুন
          </MotionButton>
        </div>
      )}

      {filteredProducts.length === 0 && (
         <div className="text-center py-20 text-gray-500">দুঃখিত, এই ক্যাটাগরিতে বা ফিল্টারে কোন পণ্য পাওয়া যায়নি।</div>
      )}

      <QuickViewModal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} product={quickViewProduct} onAddToCart={addToCart} />
    </div>
  );
};
