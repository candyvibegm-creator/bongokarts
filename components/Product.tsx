
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, X, Search, Check, Eye, ArrowRight } from 'lucide-react';
import { Product } from '../types';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { AnimatedButton } from './Common';
import { useStore } from '../App';

// Fix framer-motion type errors by casting to any
const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;
const MotionButton = motion.button as any;
const MotionSpan = motion.span as any;

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onToggleWishlist, onQuickView, isInWishlist }) => {
  // Use short description if available, otherwise truncate the long one
  const displayDesc = product.shortDescription || product.description.substring(0, 60) + '...';

  return (
    <MotionDiv 
      className="group relative bg-dark-card border border-white/5 rounded-xl overflow-hidden hover:border-bango-500/50 transition-colors duration-500 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-900 shrink-0">
        <Link to={`/product/${product.id}`}>
          <MotionImg
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
        </Link>
        
        {/* Overlay Actions */}
        <div className="absolute top-4 left-0 flex flex-col gap-2 -translate-x-full group-hover:translate-x-4 transition-transform duration-300 ease-out z-10">
          <button 
            onClick={(e) => { e.preventDefault(); onToggleWishlist(product); }}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors ${isInWishlist ? 'bg-bango-500 text-white' : 'bg-white/10 text-white hover:bg-bango-500'}`}
            title="উইশলিস্টে যোগ করুন"
          >
            <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onQuickView(product); }}
            className="p-2 bg-white/10 text-white rounded-full shadow-lg backdrop-blur-sm hover:bg-bango-500 transition-colors"
            title="দ্রুত দেখুন"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
            className="p-2 bg-white/10 text-white rounded-full shadow-lg backdrop-blur-sm hover:bg-bango-500 transition-colors"
            title="কার্টে যোগ করুন"
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {product.isNew && (
          <span className="absolute top-4 right-4 bg-bango-600 text-white text-xs font-bold px-2 py-1 rounded">
            নতুন
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2 flex items-center gap-1 text-yellow-500 text-xs">
           <Star size={12} fill="currentColor" />
           <span>{product.rating}</span>
           <span className="text-gray-500">({product.reviews})</span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-bango-500 transition-colors">{product.title}</h3>
        </Link>
        
        <p className="text-xs text-bango-500 font-medium mb-1 truncate">{product.tagline}</p>
        
        {/* Short Description */}
        <p className="text-xs text-gray-400 mb-4 line-clamp-2 h-8 leading-relaxed">
          {displayDesc}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs line-through decoration-red-500">
              {product.oldPrice ? `৳${product.oldPrice.toLocaleString()}` : ''}
            </span>
            <MotionSpan 
              key={product.price}
              className="text-xl font-bold text-white"
            >
              ৳{product.price.toLocaleString()}
            </MotionSpan>
          </div>
          
          <MotionButton
            onClick={() => onAddToCart(product)}
            className="bg-white text-dark-bg text-xs font-bold px-4 py-2 rounded-full hover:bg-bango-500 hover:text-white transition-colors"
          >
            কিনুন
          </MotionButton>
        </div>
      </div>
    </MotionDiv>
  );
};

// --- Quick View Modal ---
export const QuickViewModal = ({ product, isOpen, onClose, onAddToCart }: { product: Product | null, isOpen: boolean, onClose: () => void, onAddToCart: (p: Product) => void }) => {
  const navigate = useNavigate();
  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e: any) => e.stopPropagation()}
            className="bg-dark-card border border-white/10 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row relative shadow-2xl"
          >
             <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10 bg-black/20 rounded-full p-1 transition-colors"><X size={24} /></button>
             
             {/* Image */}
             <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-900 relative">
               <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
               {product.isNew && <span className="absolute top-4 left-4 bg-bango-600 text-white text-xs font-bold px-2 py-1 rounded">নতুন</span>}
             </div>

             {/* Content */}
             <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                <div className="mb-2 text-bango-500 font-bold text-sm uppercase tracking-wider">{product.category}</div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{product.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                   <div className="flex text-yellow-500"><Star size={16} fill="currentColor"/> <span className="ml-1 text-white">{product.rating}</span></div>
                   <span className="text-gray-500">({product.reviews} রিভিউ)</span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">৳{product.price.toLocaleString()} 
                  {product.oldPrice && <span className="text-lg text-gray-500 line-through ml-2 font-normal">৳{product.oldPrice.toLocaleString()}</span>}
                </h3>

                <p className="text-gray-400 leading-relaxed mb-6">{product.shortDescription || product.description}</p>
                
                <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
                  <AnimatedButton primary onClick={() => { onAddToCart(product); onClose(); }} className="w-full flex items-center justify-center gap-2">
                     <ShoppingCart size={18} /> কার্টে যোগ করুন
                  </AnimatedButton>
                  <button 
                    onClick={() => { navigate(`/product/${product.id}`); onClose(); }}
                    className="w-full py-3 text-sm font-bold text-white hover:text-bango-500 underline"
                  >
                    বিস্তারিত দেখুন
                  </button>
                </div>
             </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

// --- Search Overlay (Updated for Amazon-style dynamic filtering) ---
export const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Product[]>([]);
  const navigate = useNavigate();
  const { products } = useStore(); // Use dynamic products from store

  React.useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    
    // Improved "Amazon-like" Fuzzy Matching
    const lowerQuery = query.toLowerCase();
    
    const filtered = products.filter(p => {
      const titleMatch = p.title.toLowerCase().includes(lowerQuery);
      const categoryMatch = p.category.toLowerCase().includes(lowerQuery);
      const tagMatch = p.tagline.toLowerCase().includes(lowerQuery);
      
      // Match even if characters are disjointed but in order (Simple fuzzy logic)
      // e.g., "bgo" matches "Bongo"
      // Note: Full fuzzy libraries are heavier, so we stick to robust includes + letter checking for now
      // for strict single letter matching requests:
      const matchesLetters = lowerQuery.split('').every(char => p.title.toLowerCase().includes(char));

      return titleMatch || categoryMatch || tagMatch || (lowerQuery.length > 2 && matchesLetters);
    });

    setResults(filtered);
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-dark-bg/95 backdrop-blur-xl flex flex-col items-center pt-24 px-4"
    >
      <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-bango-500">
        <X size={32} />
      </button>
      
      <div className="w-full max-w-3xl relative">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন..."
          className="w-full bg-transparent border-b-2 border-gray-700 text-3xl font-bold text-white py-4 focus:outline-none focus:border-bango-500 placeholder-gray-600"
        />
        <Search className="absolute right-0 top-6 text-gray-500" size={24} />
      </div>

      <div className="w-full max-w-3xl mt-8 overflow-y-auto max-h-[60vh]">
        {results.length > 0 ? (
          <div className="bg-dark-card border border-white/10 rounded-lg overflow-hidden">
            {results.map((product, idx) => (
              <div 
                key={product.id} 
                onClick={() => { navigate(`/product/${product.id}`); onClose(); }}
                className={`flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer group transition-colors ${idx !== results.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <img src={product.image} alt="" className="w-12 h-12 object-cover rounded bg-gray-800" />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-lg group-hover:text-bango-500 transition-colors">{product.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                     <span>{product.category}</span>
                     <span>•</span>
                     <span className="text-bango-500 font-bold">৳{product.price.toLocaleString()}</span>
                  </div>
                </div>
                <ArrowRight className="text-gray-600 group-hover:text-bango-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" size={20} />
              </div>
            ))}
          </div>
        ) : query && (
          <p className="text-gray-500 text-center mt-10">"{query}" এর জন্য কোন পণ্য পাওয়া যায়নি</p>
        )}
      </div>
    </MotionDiv>
  );
};
