
import React, { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Search, Heart, User, Menu, X, ShoppingCart, LayoutDashboard, LogOut, Globe, ArrowUp, Bell } from 'lucide-react';
// @ts-ignore
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../App';
import { EditableText } from './CMS';

// Fix framer-motion type errors by casting to any
const MotionDiv = motion.div as any;
const MotionNav = motion.nav as any;
const MotionSpan = motion.span as any;
const MotionH1 = motion.h1 as any;
const MotionButton = motion.button as any;

// --- Advanced Custom Cursor ---
export const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = (e: MouseEvent) => {
      const id = Date.now();
      setRipples((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 800);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <MotionDiv
          key={ripple.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            left: ripple.x,
            top: ripple.y,
            pointerEvents: 'none',
          }}
          className="fixed z-[9998] w-8 h-8 rounded-full border border-bango-500 -translate-x-1/2 -translate-y-1/2"
        />
      ))}

      {/* Main Cursor */}
      <MotionDiv
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePos.x - (isHovering ? 24 : 8),
          y: mousePos.y - (isHovering ? 24 : 8),
          height: isHovering ? 48 : 16,
          width: isHovering ? 48 : 16,
          backgroundColor: isHovering ? '#f43f5e' : '#ffffff',
          borderRadius: '50%',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <AnimatePresence>
          {isHovering && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
            >
              <MotionDiv
                animate={{ x: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="w-full h-[1px] bg-black absolute top-1/2"
              />
              <MotionDiv
                animate={{ x: [2, -2, 2] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                className="w-full h-[1px] bg-black absolute top-1/3"
              />
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>
    </>
  );
};

// --- Preloader ---
export const Preloader = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <MotionDiv
      className="fixed inset-0 bg-dark-bg z-[10000] flex flex-col items-center justify-center text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <MotionDiv
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShoppingBag size={64} className="text-bango-500" />
      </MotionDiv>
      <MotionH1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-3xl font-bold font-sans tracking-widest"
      >
        বঙ্গ<span className="text-bango-500">কার্ট</span>
      </MotionH1>
      <MotionDiv 
        className="mt-2 w-48 h-1 bg-gray-800 rounded-full overflow-hidden"
      >
        <MotionDiv 
          className="h-full bg-bango-500" 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.3 }}
        />
      </MotionDiv>
    </MotionDiv>
  );
};

// --- Back To Top Button ---
export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionButton
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ y: -5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-40 bg-white text-dark-bg p-3 rounded-full shadow-lg border-2 border-bango-500 hover:bg-bango-500 hover:text-white transition-colors"
        >
          <ArrowUp size={24} />
        </MotionButton>
      )}
    </AnimatePresence>
  );
};

// --- Navbar ---
interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onSearchOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, wishlistCount, onSearchOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAdmin, logoutAdmin, siteSettings, notifications } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'হোম', path: '/' },
    { name: 'সব পণ্য', path: '/shop' },
  ];

  return (
    <MotionNav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-bg/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
          {siteSettings.logoImage ? (
            <img src={siteSettings.logoImage} alt="Logo" className="h-8 object-contain" />
          ) : (
            <>
              {siteSettings.logoText.substring(0, siteSettings.logoText.length - 2)}<span className="text-bango-500">{siteSettings.logoText.substring(siteSettings.logoText.length - 2)}</span>
            </>
          )}
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative text-base font-bold uppercase tracking-wider hover:text-bango-500 transition-colors ${
                location.pathname === link.path ? 'text-bango-500' : 'text-gray-300'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <MotionSpan
                  layoutId="underline"
                  className="absolute left-0 top-full block h-0.5 w-full bg-bango-500 mt-1"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <button onClick={onSearchOpen} className="text-gray-300 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          
          <Link to="/wishlist" className="relative text-gray-300 hover:text-white transition-colors">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-bango-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-bango-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Profile / Admin Dropdown */}
          <div className="relative" onMouseLeave={() => setIsProfileOpen(false)}>
             <button 
               onMouseEnter={() => setIsProfileOpen(true)}
               onClick={() => setIsProfileOpen(!isProfileOpen)}
               className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 relative"
             >
               <User size={20} />
               {isAdmin && <div className="w-2 h-2 bg-green-500 rounded-full" />}
               {isAdmin && notifications.length > 0 && <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">{notifications.length}</span>}
             </button>

             <AnimatePresence>
               {isProfileOpen && (
                 <MotionDiv
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.95 }}
                   className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                 >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-xs text-gray-400">স্বাগতম,</p>
                      <p className="text-sm font-bold text-white">{isAdmin ? 'অ্যাডমিন' : 'গেস্ট ইউজার'}</p>
                    </div>
                    {isAdmin ? (
                      <>
                        <Link to="/admin" className="block px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                           <LayoutDashboard size={14} /> ড্যাশবোর্ড
                        </Link>
                        {notifications.length > 0 && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-yellow-400 hover:bg-white/10 flex items-center gap-2">
                             <Bell size={14} /> {notifications.length} নতুন বিজ্ঞপ্তি
                          </Link>
                        )}
                        <button onClick={() => { logoutAdmin(); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 flex items-center gap-2">
                           <LogOut size={14} /> লগ আউট
                        </button>
                      </>
                    ) : (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-bango-500 transition-colors">
                        অ্যাডমিন প্যানেল
                      </Link>
                    )}
                 </MotionDiv>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionNav>
  );
};

// --- Footer ---
export const Footer = () => {
  const { siteSettings } = useStore();
  
  return (
    <footer className="bg-dark-card border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">{siteSettings.logoText}</h2>
            <div className="text-gray-400 text-sm leading-relaxed">
              <EditableText id="footer_about" defaultText="খাঁটি বাঙালি পণ্যের প্রিমিয়াম গন্তব্য। দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট এবং সাংস্কৃতিক ঐতিহ্যের মেলবন্ধন।" tag="p"/>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white"><EditableText id="footer_link_title" defaultText="দ্রুত লিঙ্ক" /></h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-bango-500 transition-colors"><EditableText id="footer_link_home" defaultText="হোম" /></Link></li>
              <li><Link to="/shop" className="hover:text-bango-500 transition-colors"><EditableText id="footer_link_shop" defaultText="সব পণ্য" /></Link></li>
              <li><Link to="/cart" className="hover:text-bango-500 transition-colors"><EditableText id="footer_link_cart" defaultText="আমার ঝুড়ি" /></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white"><EditableText id="footer_legal_title" defaultText="আইনি তথ্য" /></h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-bango-500 transition-colors"><EditableText id="footer_link_privacy" defaultText="গোপনীয়তা নীতি" /></a></li>
              <li><a href="#" className="hover:text-bango-500 transition-colors"><EditableText id="footer_link_terms" defaultText="সেবার শর্তাবলী" /></a></li>
              <li><a href="#" className="hover:text-bango-500 transition-colors"><EditableText id="footer_link_refund" defaultText="রিফান্ড পলিসি" /></a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white"><EditableText id="footer_contact_title" defaultText="যোগাযোগ" /></h3>
            <div className="text-gray-400 text-sm space-y-2">
              <EditableText id="footer_addr" defaultText="ঢাকা, বাংলাদেশ" tag="p"/>
              <EditableText id="footer_email" defaultText="support@bangokart.com" tag="p"/>
              <EditableText id="footer_phone" defaultText="+৮৮০ ১৭০০ ০০০০০০" tag="p"/>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-600 text-xs border-t border-white/5 pt-8">
          <EditableText id="footer_copy" defaultText={`© ${new Date().getFullYear()} ${siteSettings.logoText}। বাংলাদেশে তৈরি ❤️।`} />
        </div>
      </div>
    </footer>
  );
};

// --- Button ---
export const AnimatedButton = ({ children, onClick, className = "", primary = false }: any) => (
  <MotionButton
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`relative overflow-hidden px-8 py-3 rounded-full font-bold tracking-wide uppercase text-sm transition-all duration-300 ${
      primary 
        ? 'bg-bango-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:bg-bango-700' 
        : 'bg-white text-dark-bg hover:bg-gray-200'
    } ${className}`}
  >
    {children}
  </MotionButton>
);
