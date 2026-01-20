
import React, { createContext, useContext, useState, useEffect } from 'react';
// @ts-ignore
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CartItem, Product, CMSContent, Category, SiteSettings, Notification, Review } from './types';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from './constants';

// Components
import { Preloader, Navbar, Footer, BackToTop } from './components/Common';
import { SearchOverlay } from './components/Product';
import { Chatbot } from './components/Chatbot';
import { CMSToolbar } from './components/CMS';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { SingleProduct } from './pages/SingleProduct';

// --- State Management (Store Context) ---
interface StoreContextType {
  cart: CartItem[];
  wishlist: Product[];
  products: Product[]; 
  categories: Category[];
  siteSettings: SiteSettings;
  brands: { name: string; logo: string }[];
  notifications: Notification[]; // New
  isAdmin: boolean;
  isEditing: boolean;
  cmsContent: CMSContent;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  toggleWishlist: (product: Product) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  loginAdmin: (u: string, p: string) => boolean;
  logoutAdmin: () => void;
  addProduct: (p: Product) => void;
  removeProduct: (id: string) => void;
  updateProduct: (p: Product) => void;
  addReview: (productId: string, review: Review) => void; // New
  clearNotifications: () => void; // New
  addCategory: (c: Category) => void;
  removeCategory: (id: string) => void;
  updateSiteSettings: (s: Partial<SiteSettings>) => void;
  updateBrands: (b: { name: string; logo: string }[]) => void;
  setIsEditing: (val: boolean) => void;
  updateCMSContent: (id: string, type: 'text' | 'image', value: string) => void;
  saveCMS: () => void;
  cancelCMS: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};

// --- Main Layout ---
const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { cart, wishlist, isEditing } = useStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        wishlistCount={wishlist.length}
        onSearchOpen={() => setIsSearchOpen(true)}
      />
      <CMSToolbar />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <main className={`min-h-screen ${isEditing ? 'border-4 border-bango-500 rounded-xl m-2' : ''}`}>
        {children}
      </main>
      {!isEditing && <Chatbot />}
      <BackToTop />
      <Footer />
    </>
  );
};

// --- App Root ---
const App = () => {
  const [loading, setLoading] = useState(true);
  
  // -- Data States (Persisted) --
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bongokart_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('bongokart_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Brands (Dynamic)
  const [brands, setBrands] = useState<{name: string, logo: string}[]>(() => {
    const saved = localStorage.getItem('bongokart_brands');
    if (saved) return JSON.parse(saved);
    return [
      { name: 'আড়ং', logo: 'https://picsum.photos/100/100?random=10' },
      { name: 'ওয়ালটন', logo: 'https://picsum.photos/100/100?random=11' },
      { name: 'প্রাণ', logo: 'https://picsum.photos/100/100?random=12' },
      { name: 'এপেক্স', logo: 'https://picsum.photos/100/100?random=13' },
      { name: 'ইয়েলো', logo: 'https://picsum.photos/100/100?random=14' },
    ];
  });

  // CMS Content
  const [cmsContent, setCmsContent] = useState<CMSContent>(() => {
    const saved = localStorage.getItem('bongokart_cms');
    return saved ? JSON.parse(saved) : {};
  });

  // Global Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('bongokart_settings');
    return saved ? JSON.parse(saved) : {
      logoText: 'বঙ্গকার্ট',
      currency: 'BDT',
      shopGridCols: 4,
      enableCOD: true,
      aiSystemInstruction: "You are the BongoKart Sales Assistant. Be friendly, use emojis, and help users buy products. Keep answers concise."
    };
  });

  // Auth & Mode States
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempCMS, setTempCMS] = useState<CMSContent>({});

  // Sync data to local storage
  useEffect(() => { localStorage.setItem('bongokart_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('bongokart_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('bongokart_brands', JSON.stringify(brands)); }, [brands]);
  useEffect(() => { localStorage.setItem('bongokart_settings', JSON.stringify(siteSettings)); }, [siteSettings]);

  // --- Security: Prevent View Source ---
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };

    if (process.env.NODE_ENV === 'production' || true) { 
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const getTotalPrice = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Wishlist Logic
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  };

  // -- Admin Logic --
  const loginAdmin = (u: string, p: string) => {
    if (u === 'bongokarts' && p === 'bongokarts') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };
  
  const logoutAdmin = () => {
    setIsAdmin(false);
    setIsEditing(false);
  };

  const addProduct = (p: Product) => setProducts(prev => [p, ...prev]);
  const updateProduct = (p: Product) => {
    setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));
  };
  const removeProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  // -- Review Logic --
  const addReview = (productId: string, review: Review) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newReviewList = [...(p.reviewList || []), review];
        const newRating = ((p.rating * p.reviews) + review.rating) / (p.reviews + 1);
        return {
          ...p,
          reviewList: newReviewList,
          reviews: p.reviews + 1,
          rating: parseFloat(newRating.toFixed(1))
        };
      }
      return p;
    }));

    // Add Notification for Admin
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: 'review',
      message: `${review.user} reviewed a product: "${review.comment.substring(0, 20)}..."`,
      date: new Date().toLocaleString(),
      read: false
    }, ...prev]);
  };

  const clearNotifications = () => setNotifications([]);

  const addCategory = (c: Category) => setCategories(prev => [...prev, c]);
  const removeCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  const updateSiteSettings = (s: Partial<SiteSettings>) => setSiteSettings(prev => ({...prev, ...s}));
  const updateBrands = (b: {name: string, logo: string}[]) => setBrands(b);

  // -- CMS Logic --
  useEffect(() => { if (isEditing) setTempCMS(cmsContent); }, [isEditing]);
  
  const updateCMSContent = (id: string, type: 'text' | 'image', value: string) => {
    setTempCMS(prev => ({ ...prev, [id]: { type, value } }));
  };

  const saveCMS = () => {
    setCmsContent(tempCMS);
    localStorage.setItem('bongokart_cms', JSON.stringify(tempCMS));
    setIsEditing(false);
  };

  const cancelCMS = () => {
    setTempCMS({});
    setIsEditing(false);
  };

  const displayContent = isEditing ? tempCMS : cmsContent;

  return (
    <StoreContext.Provider value={{ 
      cart, wishlist, products, categories, siteSettings, brands, notifications, isAdmin, isEditing, cmsContent: displayContent,
      addToCart, removeFromCart, updateQuantity, toggleWishlist, clearCart, getTotalPrice,
      loginAdmin, logoutAdmin, addProduct, removeProduct, updateProduct, addReview, clearNotifications,
      addCategory, removeCategory, updateSiteSettings, updateBrands,
      setIsEditing, updateCMSContent, saveCMS, cancelCMS
    }}>
      <Router>
        <AnimatePresence>
          {loading && <Preloader onFinish={() => setLoading(false)} />}
        </AnimatePresence>
        {!loading && (
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Checkout />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/product/:id" element={<SingleProduct />} />
              <Route path="/wishlist" element={<Shop />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        )}
      </Router>
    </StoreContext.Provider>
  );
};

export default App;
