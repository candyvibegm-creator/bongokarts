
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../App';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { Check, Download, ShoppingBag } from 'lucide-react';

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

export const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useStore();
  const navigate = useNavigate();
  const [showThankYou, setShowThankYou] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    bkash: ''
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setShowThankYou(true);
  };

  const closeThankYou = () => {
    setShowThankYou(false);
    clearCart();
    navigate('/shop');
  };

  const total = getTotalPrice();

  if (cart.length === 0 && !showThankYou) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">আপনার ঝুড়ি খালি</h2>
        <button onClick={() => navigate('/shop')} className="text-bango-500 hover:underline">কেনাকাটা চালিয়ে যান</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen relative">
      <h1 className="text-4xl font-bold mb-10 text-white border-l-4 border-bango-500 pl-4">চেকআউট</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-300">বিলিং তথ্য</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">পুরো নাম</label>
              <input required type="text" className="w-full bg-dark-card border border-white/10 rounded p-3 text-white focus:border-bango-500 outline-none" 
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">ইমেইল ঠিকানা</label>
              <input required type="email" className="w-full bg-dark-card border border-white/10 rounded p-3 text-white focus:border-bango-500 outline-none" 
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">ডেলিভারি ঠিকানা</label>
              <textarea required rows={3} className="w-full bg-dark-card border border-white/10 rounded p-3 text-white focus:border-bango-500 outline-none" 
                value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-bango-500 font-bold mb-1">বিকাশ নম্বর (পার্সোনাল)</label>
              <input required type="tel" placeholder="01XXXXXXXXX" className="w-full bg-dark-card border border-bango-500/30 rounded p-3 text-white focus:border-bango-500 outline-none" 
                value={form.bkash} onChange={e => setForm({...form, bkash: e.target.value})} />
            </div>
            
            <MotionButton 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full bg-bango-600 text-white font-bold py-4 rounded-lg mt-6 shadow-[0_0_20px_rgba(225,29,72,0.4)]"
            >
              অর্ডার নিশ্চিত করুন (৳{total.toLocaleString()})
            </MotionButton>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-dark-card p-6 rounded-xl h-fit border border-white/5">
          <h2 className="text-xl font-bold mb-6 text-gray-300">অর্ডার সারাংশ</h2>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={item.image} alt="" className="w-12 h-12 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.quantity} x ৳{item.price.toLocaleString()}</p>
                </div>
                <div className="text-sm font-bold">৳{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xl font-bold text-white">
            <span>মোট</span>
            <span>৳{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Thank You Modal / Invoice */}
      <AnimatePresence>
        {showThankYou && (
          <MotionDiv 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionDiv 
              className="bg-dark-card border border-white/10 rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              {/* Confetti effect background (simplified with CSS gradient) */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-bango-500" />
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">অর্ডার নিশ্চিত হয়েছে!</h2>
                <p className="text-gray-400 text-sm">বঙ্গকার্টে কেনাকাটার জন্য ধন্যবাদ।</p>
              </div>

              <div className="bg-black/40 rounded-lg p-4 mb-6 text-sm border border-dashed border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">অর্ডার আইডি:</span>
                  <span className="text-white font-mono">#BK-{Math.floor(Math.random()*10000)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">তারিখ:</span>
                  <span className="text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-2 font-bold text-lg text-bango-500">
                  <span>মোট পরিমাণ:</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => alert("ইনভয়েস ডাউনলোড হয়েছে!")}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors font-medium text-sm"
                >
                  <Download size={16} /> ইনভয়েস
                </button>
                <button 
                  onClick={closeThankYou}
                  className="flex-1 bg-bango-600 hover:bg-bango-700 text-white py-3 rounded-lg transition-colors font-bold text-sm"
                >
                  কেনাকাটা চালিয়ে যান
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};
