
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../App';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ArrowLeft, Share2, CheckCircle, Package, User } from 'lucide-react';
import { ProductCard } from '../components/Product';
import { AnimatedButton } from '../components/Common';

export const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, wishlist, addReview } = useStore();
  const [product, setProduct] = useState<any>(null);
  
  // Selection States
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  // Review State
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  
  // Image Zoom State
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  useEffect(() => {
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.image);
      if (found.sizes?.length) setSelectedSize(found.sizes[0]);
      if (found.colors?.length) setSelectedColor(found.colors[0]);
      setReviewSubmitted(false); // Reset on new product
    }
  }, [id, products]);

  if (!product) {
    return <div className="min-h-screen pt-32 text-center text-white">পণ্যটি লোড হচ্ছে...</div>;
  }

  // Related Products (Same Category)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Image Zoom Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ ...zoomStyle, display: 'none' });
  };

  const handleAddToCart = () => {
    addToCart({ 
        ...product, 
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewText) return;
    
    addReview(product.id, {
      id: Date.now().toString(),
      user: reviewerName,
      rating: userRating,
      comment: reviewText,
      date: new Date().toLocaleDateString()
    });

    setReviewSubmitted(true);
    setReviewText('');
    setReviewerName('');
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      {/* Breadcrumb / Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} /> ফিরে যান
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Left: Images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3 w-16">
            {(product.images?.length ? product.images : [product.image]).map((img: string, i: number) => (
              <div 
                key={i} 
                onMouseEnter={() => setActiveImage(img)}
                className={`w-16 h-16 border rounded cursor-pointer overflow-hidden ${activeImage === img ? 'border-bango-500' : 'border-white/10'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Main Image with Zoom */}
          <div 
            className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden h-[500px] border border-white/5 group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img src={activeImage} alt={product.title} className="w-full h-full object-contain" />
            
            {/* Magnifier Lens / Zoom View */}
            <div 
              className="absolute inset-0 pointer-events-none z-10 hidden md:block"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${activeImage})`,
                backgroundSize: '250%', // 2.5x Zoom
                backgroundColor: '#000'
              }}
            />
          </div>
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
          <p className="text-bango-500 font-medium mb-4">{product.tagline}</p>
          
          {/* Ratings */}
          <div className="flex items-center gap-4 mb-6 text-sm border-b border-white/10 pb-6">
            <div className="flex text-yellow-500">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "" : "text-gray-600"} />
               ))}
            </div>
            <span className="text-blue-400 hover:underline cursor-pointer">{product.reviews}টি রেটিং</span>
            <div className="w-[1px] h-4 bg-gray-700" />
            <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14}/> স্টকে আছে ({product.stock})</span>
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-end gap-3">
               <span className="text-4xl font-bold text-white">৳{product.price.toLocaleString()}</span>
               {product.oldPrice && <span className="text-xl text-gray-500 line-through mb-1">৳{product.oldPrice.toLocaleString()}</span>}
            </div>
            <p className="text-gray-400 text-xs mt-1">সব ট্যাক্স অন্তর্ভুক্ত</p>
          </div>

          {/* Variations */}
          <div className="space-y-6 mb-8">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="text-gray-300 text-sm font-bold block mb-2">সাইজ: {selectedSize}</span>
                <div className="flex gap-2">
                  {product.sizes.map((s: string) => (
                    <button 
                      key={s} 
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${selectedSize === s ? 'bg-bango-600 border-bango-600 text-white' : 'border-white/20 text-gray-400 hover:border-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="text-gray-300 text-sm font-bold block mb-2">রঙ: {selectedColor}</span>
                <div className="flex gap-3">
                  {product.colors.map((c: string) => (
                    <button 
                      key={c} 
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${selectedColor === c ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400 hover:border-white'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
             <div className="w-32 flex items-center border border-white/20 rounded-full px-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-white">-</button>
                <input type="text" value={quantity} readOnly className="w-full bg-transparent text-center text-white font-bold focus:outline-none" />
                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-white">+</button>
             </div>
             <AnimatedButton primary onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2">
               <ShoppingCart size={20} /> কার্টে যোগ করুন
             </AnimatedButton>
             <button onClick={() => toggleWishlist(product)} className="p-3 border border-white/20 rounded-full hover:bg-white/10 text-white transition-colors">
               <Heart size={20} fill={wishlist.some(p => p.id === product.id) ? "currentColor" : "none"} className={wishlist.some(p => p.id === product.id) ? "text-bango-500" : ""} />
             </button>
          </div>

          {/* Details Tabs */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-white mb-3">পণ্যের বিবরণ</h3>
            <p className="text-gray-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="border-t border-white/5 pt-12 mb-16">
        <h2 className="text-2xl font-bold text-white mb-8">রিভিউ এবং রেটিং</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {/* Write Review */}
           <div className="bg-dark-card border border-white/5 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">আপনার মতামত দিন</h3>
              {reviewSubmitted ? (
                 <div className="bg-green-500/10 border border-green-500/50 p-4 rounded text-green-400 text-center">
                    ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।
                 </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                     <label className="block text-gray-400 text-xs mb-1">আপনার নাম</label>
                     <input required value={reviewerName} onChange={e=>setReviewerName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                  </div>
                  <div>
                     <label className="block text-gray-400 text-xs mb-1">রেটিং</label>
                     <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                           <button type="button" key={star} onClick={() => setUserRating(star)}>
                              <Star size={24} className={star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"} />
                           </button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="block text-gray-400 text-xs mb-1">মন্তব্য</label>
                     <textarea required rows={3} value={reviewText} onChange={e=>setReviewText(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                  </div>
                  <button type="submit" className="bg-bango-600 text-white px-6 py-2 rounded font-bold hover:bg-bango-700">জমা দিন</button>
                </form>
              )}
           </div>

           {/* Review List */}
           <div className="space-y-4">
              {product.reviewList && product.reviewList.length > 0 ? (
                 product.reviewList.map((r: any, idx: number) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5">
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><User size={14}/></div>
                             <span className="font-bold text-white text-sm">{r.user}</span>
                          </div>
                          <span className="text-xs text-gray-500">{r.date}</span>
                       </div>
                       <div className="flex text-yellow-500 mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-600"}/>)}
                       </div>
                       <p className="text-gray-300 text-sm">{r.comment}</p>
                    </div>
                 ))
              ) : (
                 <div className="text-gray-500 text-center py-10">এখনও কোন রিভিউ নেই। আপনিই প্রথম রিভিউ দিন!</div>
              )}
           </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-white/5 pt-12">
          <h2 className="text-2xl font-bold text-white mb-8">সম্পর্কিত পণ্য</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
               <ProductCard 
                 key={p.id} 
                 product={p} 
                 onAddToCart={addToCart} 
                 onToggleWishlist={toggleWishlist} 
                 onQuickView={() => {}} 
                 isInWishlist={wishlist.some(i => i.id === p.id)} 
               />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
