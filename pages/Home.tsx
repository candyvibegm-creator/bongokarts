
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Play } from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from '../components/Common';
import { ProductCard, QuickViewModal } from '../components/Product';
import { useStore } from '../App';
import { Product } from '../types';
import { EditableText, EditableImage } from '../components/CMS';

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;

export const Home = () => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, products, categories, brands } = useStore(); // Brands from store
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const featuredProducts = products.filter(p => p.isFeatured).length > 0 
    ? products.filter(p => p.isFeatured) 
    : products.slice(0, 4);

  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    productCount: products.filter(p => p.category === cat.name).length
  }));

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="w-full">
      {/* --- Advanced Responsive Hero Slider --- */}
      <section className="relative h-[100dvh] w-full overflow-hidden bg-dark-bg">
        <div className="absolute inset-0 w-full h-full">
            <EditableImage 
               id="hero_bg_1" 
               defaultSrc="https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?q=80&w=2071&auto=format&fit=crop"
               alt="Hero Background"
               className="w-full h-full"
            />
            <div className="absolute inset-0 bg-black/60 md:bg-black/40 mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-90 pointer-events-none" />
        </div>
        <div className="absolute inset-0 flex items-center z-10 pointer-events-none">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 pt-20 pointer-events-auto">
            <div className="max-w-4xl overflow-hidden">
              <MotionDiv initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3 mb-6">
                <EditableText id="hero_badge" defaultText="নতুন কালেকশন ২০২৪" className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-[0.3em] font-sans" />
              </MotionDiv>
              <MotionH1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                <EditableText id="hero_title" defaultText="ঐতিহ্যের সাথে আধুনিকতা" />
              </MotionH1>
              <div className="text-base sm:text-lg md:text-xl text-gray-300/90 mb-10 max-w-xl leading-relaxed border-l-2 border-white/20 pl-6">
                 <EditableText id="hero_subtitle" tag="p" defaultText="সেরা জামদানি এবং হ্যান্ডলুম শাড়ি আবিষ্কার করুন। বাঙালি কারুশিল্পের এক অনন্য নিদর্শন।" />
              </div>
              <MotionDiv initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                <AnimatedButton primary onClick={() => navigate('/shop')}>
                   <EditableText id="hero_btn" defaultText="কালেকশন দেখুন" />
                </AnimatedButton>
              </MotionDiv>
            </div>
          </div>
        </div>
      </section>

      {/* --- Categories --- */}
      <section className="py-24 bg-dark-bg container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div className="flex items-center gap-4">
             <div className="h-12 w-1.5 bg-gradient-to-b from-bango-500 to-orange-500 rounded-full"></div>
             <div>
               <h2 className="text-3xl font-bold text-white tracking-tight"><EditableText id="cat_title" defaultText="ক্যাটাগরি অনুযায়ী কিনুন" /></h2>
               <p className="text-gray-500 text-sm mt-1"><EditableText id="cat_subtitle" defaultText="আমাদের বিশাল কালেকশন ঘুরে দেখুন" /></p>
             </div>
           </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {categoriesWithCounts.map((cat, idx) => (
            <MotionDiv key={cat.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -10, scale: 1.02 }} className="relative bg-dark-card border border-white/5 rounded-2xl p-6 text-center cursor-pointer group overflow-hidden" onClick={() => handleCategoryClick(cat.name)}>
              <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full overflow-hidden bg-gray-900 ring-4 ring-gray-800 group-hover:ring-bango-500 transition-all duration-300 shadow-xl">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="relative font-bold text-sm md:text-lg text-white group-hover:text-bango-500 transition-colors">{cat.name}</h3>
              <p className="relative text-xs text-gray-500 mt-1">{cat.productCount} টি আইটেম</p>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* --- Featured Products --- */}
      <section className="py-24 bg-dark-card/30 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
             <div className="flex items-center gap-4">
                <div className="h-12 w-1.5 bg-gradient-to-b from-purple-500 to-bango-500 rounded-full"></div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight"><EditableText id="feat_title" defaultText="জনপ্রিয় পণ্য" /></h2>
                  <p className="text-gray-500 text-sm mt-1"><EditableText id="feat_subtitle" defaultText="আপনার স্টাইলের জন্য বাছাই করা" /></p>
                </div>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} isInWishlist={wishlist.some(item => item.id === product.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* --- Brand Collaborations (Dynamic) --- */}
      <section className="py-20 bg-dark-bg border-y border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-bango-500 font-bold uppercase tracking-widest text-xs mb-8">আমাদের পার্টনার</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-60">
            {brands.map((brand, idx) => (
              <MotionDiv key={idx} whileHover={{ scale: 1.1, opacity: 1, filter: 'grayscale(0%)' }} className="filter grayscale transition-all duration-300 flex flex-col items-center gap-3 cursor-pointer">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center p-4 shadow-lg">
                   <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* --- Minimal CTA (Requested Update) --- */}
      <section className="py-24 bg-dark-bg flex items-center justify-center">
         <div className="text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-bango-500/20 blur-3xl rounded-full pointer-events-none"></div>
            <MotionDiv 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
            >
               <AnimatedButton primary onClick={() => navigate('/shop')} className="relative z-10 shadow-[0_0_40px_rgba(225,29,72,0.4)] px-10 py-4 text-base">
                 <EditableText id="cta_btn" defaultText="সব পণ্য দেখুন" /> <ArrowRight className="inline ml-2" size={16} />
               </AnimatedButton>
            </MotionDiv>
         </div>
      </section>

      <QuickViewModal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} product={quickViewProduct} onAddToCart={addToCart} />
    </div>
  );
};
