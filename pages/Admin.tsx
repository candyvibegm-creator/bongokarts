
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../App';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Plus, Trash2, TrendingUp, DollarSign, Image as ImageIcon, Edit3, Grid, Settings, Upload, Save, X, Bell } from 'lucide-react';
import { Product, Category } from '../types';

const MotionDiv = motion.div as any;

export const Admin = () => {
  const { 
    isAdmin, loginAdmin, products, addProduct, removeProduct, updateProduct,
    setIsEditing, categories, addCategory, removeCategory,
    siteSettings, updateSiteSettings, brands, updateBrands, notifications, clearNotifications
  } = useStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'add' | 'categories' | 'settings' | 'brands' | 'notifications'>('dashboard');

  // --- Add/Edit Product State ---
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '', price: 0, category: '', shortDescription: '', description: '', 
    stock: 0, isFeatured: false, images: [], colors: [], sizes: []
  });
  // Temp inputs for arrays
  const [tempColor, setTempColor] = useState('');
  const [tempSize, setTempSize] = useState('');

  // --- Add Category State ---
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);

  // --- Brand State ---
  const [newBrand, setNewBrand] = useState({ name: '', logo: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(username, password)) setError('');
    else setError('ভুল ইউজারনেম বা পাসওয়ার্ড');
  };

  // Image Handlers
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
           setNewProduct(prev => ({
             ...prev,
             images: [...(prev.images || []), reader.result as string],
             image: prev.image || (reader.result as string) // Set first as main
           }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSetMainImage = (img: string) => {
    setNewProduct(prev => ({ ...prev, image: img }));
  };

  const removeProductImage = (index: number) => {
    setNewProduct(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages, image: newImages[0] || '' };
    });
  };

  // Variation Handlers
  const addColor = () => { if(tempColor) { setNewProduct(p => ({...p, colors: [...(p.colors||[]), tempColor]})); setTempColor(''); }};
  const addSize = () => { if(tempSize) { setNewProduct(p => ({...p, sizes: [...(p.sizes||[]), tempSize]})); setTempSize(''); }};

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    if (editingProductId) {
       // Update Existing
       const productToUpdate = products.find(p => p.id === editingProductId);
       if(productToUpdate) {
         updateProduct({
           ...productToUpdate,
           ...newProduct,
           price: Number(newProduct.price),
           stock: Number(newProduct.stock)
         } as Product);
       }
       setEditingProductId(null);
    } else {
      // Create New
      const product: Product = {
        id: 'p-' + Date.now(),
        title: newProduct.title!,
        tagline: 'Latest',
        shortDescription: newProduct.shortDescription || '',
        description: newProduct.description || '',
        price: Number(newProduct.price),
        rating: 0, reviews: 0,
        category: newProduct.category || categories[0]?.name || 'Uncategorized',
        brand: 'BongoKart',
        image: newProduct.image || 'https://via.placeholder.com/400',
        images: newProduct.images || [],
        sizes: newProduct.sizes || [],
        colors: newProduct.colors || [],
        isNew: true,
        stock: Number(newProduct.stock) || 0,
        isFeatured: newProduct.isFeatured,
        dateAdded: new Date().toISOString()
      };
      addProduct(product);
    }
    
    setActiveTab('products');
    setNewProduct({ title: '', price: 0, category: '', shortDescription: '', description: '', stock: 0, isFeatured: false, images: [], colors: [], sizes: [] });
  };

  const handleEditClick = (p: Product) => {
    setEditingProductId(p.id);
    setNewProduct(p);
    setActiveTab('add');
  };

  // Category Handlers
  const handleCatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setCatImagePreview(reader.result as string); setNewCategory({ ...newCategory, image: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.image) return;
    addCategory({ id: 'cat-' + Date.now(), name: newCategory.name, image: newCategory.image, productCount: 0 });
    setNewCategory({ name: '', image: '' });
    setCatImagePreview(null);
  };

  // Brand Handlers
  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setNewBrand({ ...newBrand, logo: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };
  const handleAddBrand = () => {
    if(newBrand.name && newBrand.logo) {
      updateBrands([...brands, newBrand]);
      setNewBrand({name: '', logo: ''});
    }
  };

  const enterEditMode = () => { setIsEditing(true); navigate('/'); };

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-dark-bg px-4">
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-card border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">অ্যাডমিন লগইন</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-bango-600 hover:bg-bango-700 text-white font-bold py-3 rounded-lg">লগইন</button>
          </form>
        </MotionDiv>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 container mx-auto px-4 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex flex-col gap-2">
        {['Dashboard', 'Products', 'Add Product', 'Categories', 'Brands', 'Global Settings', 'Notifications'].map((tab) => {
           const id = tab.toLowerCase().split(' ')[0] as any;
           return (
             <button key={id} onClick={() => { setActiveTab(id); if(id === 'add' && activeTab !== 'add') { setEditingProductId(null); setNewProduct({}); } }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === id ? 'bg-bango-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}>
                {id === 'dashboard' && <LayoutDashboard size={18} />}
                {id === 'products' && <Package size={18} />}
                {id === 'add' && <Plus size={18} />}
                {id === 'categories' && <Grid size={18} />}
                {id === 'global' && <Settings size={18} />}
                {id === 'brands' && <DollarSign size={18} />}
                {id === 'notifications' && <Bell size={18} />}
                {tab}
                {id === 'notifications' && notifications.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 rounded-full">{notifications.length}</span>}
             </button>
           );
        })}
        <div className="mt-8 pt-8 border-t border-white/10">
          <button onClick={enterEditMode} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg transition-colors">
            <Edit3 size={18} /> সাইট এডিট করুন
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-dark-card border border-white/5 rounded-2xl p-6 min-h-[600px]">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/20 p-6 rounded-xl border border-white/5"><h3 className="text-3xl font-bold text-white">{products.length}</h3><p className="text-gray-400">Products</p></div>
            <div className="bg-black/20 p-6 rounded-xl border border-white/5"><h3 className="text-3xl font-bold text-white">{products.reduce((a,b)=>a+b.stock,0)}</h3><p className="text-gray-400">Stock</p></div>
            <div className="bg-black/20 p-6 rounded-xl border border-white/5"><h3 className="text-3xl font-bold text-white">{categories.length}</h3><p className="text-gray-400">Categories</p></div>
          </div>
        )}

        {/* --- Global Settings --- */}
        {activeTab === 'global' && (
           <div className="space-y-6 max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">সাইট সেটিংস</h2>
              
              <div>
                <label className="block text-gray-400 mb-2">সাইট লোগো (টেক্সট)</label>
                <input type="text" value={siteSettings.logoText} onChange={e => updateSiteSettings({logoText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">শপ গ্রিড কলাম (ডেস্কটপ)</label>
                <select value={siteSettings.shopGridCols} onChange={e => updateSiteSettings({shopGridCols: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white">
                  <option value={3} className="text-black">3 Columns</option>
                  <option value={4} className="text-black">4 Columns</option>
                  <option value={5} className="text-black">5 Columns</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={siteSettings.enableCOD} onChange={e => updateSiteSettings({enableCOD: e.target.checked})} className="accent-bango-500 w-5 h-5"/>
                <label className="text-white">ক্যাশ অন ডেলিভারি চালু করুন</label>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Gemini AI Instruction</label>
                <textarea rows={5} value={siteSettings.aiSystemInstruction} onChange={e => updateSiteSettings({aiSystemInstruction: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
              </div>
           </div>
        )}

        {/* --- Notifications --- */}
        {activeTab === 'notifications' && (
           <div>
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-white">নোটিফিকেশন</h2>
               <button onClick={clearNotifications} className="text-red-400 hover:text-red-300 text-sm">সব মুছুন</button>
             </div>
             <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((n, i) => (
                   <div key={i} className="bg-black/20 p-4 rounded border border-white/5 flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-bango-600 flex items-center justify-center shrink-0"><Bell size={14}/></div>
                      <div>
                         <p className="text-white text-sm">{n.message}</p>
                         <p className="text-gray-500 text-xs mt-1">{n.date}</p>
                      </div>
                   </div>
                )) : <p className="text-gray-500">কোন নোটিফিকেশন নেই।</p>}
             </div>
           </div>
        )}

        {/* --- Products List --- */}
        {activeTab === 'products' && (
           <table className="w-full text-left text-sm text-gray-400">
             <thead className="bg-black/20 text-white"><tr><th className="p-3">Img</th><th className="p-3">Name</th><th className="p-3">Price</th><th className="p-3">Action</th></tr></thead>
             <tbody>
               {products.map(p => (
                 <tr key={p.id} className="border-b border-white/5">
                   <td className="p-3"><img src={p.image} className="w-10 h-10 rounded"/></td>
                   <td className="p-3">{p.title}</td>
                   <td className="p-3">৳{p.price}</td>
                   <td className="p-3 flex gap-2">
                      <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-400"><Edit3 size={16}/></button>
                      <button onClick={() => removeProduct(p.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}

        {/* --- Add/Edit Product --- */}
        {activeTab === 'add' && (
          <form onSubmit={handleSaveProduct} className="space-y-6 max-w-2xl mx-auto">
             <h2 className="text-2xl font-bold text-white">{editingProductId ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যোগ করুন'}</h2>
             <div className="grid grid-cols-2 gap-4">
               <input required placeholder="Name" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="bg-black/20 border border-white/10 p-3 rounded text-white w-full"/>
               <input required type="number" placeholder="Price" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="bg-black/20 border border-white/10 p-3 rounded text-white w-full"/>
             </div>
             
             {/* Images */}
             <div className="border border-dashed border-white/20 p-4 rounded">
                <input type="file" multiple onChange={handleProductImageUpload} className="text-white mb-2"/>
                <div className="flex gap-2 flex-wrap">
                   {newProduct.images?.map((img, i) => (
                     <div key={i} className="relative w-20 h-20 group">
                        <img src={img} className={`w-full h-full object-cover rounded ${newProduct.image === img ? 'border-2 border-bango-500' : ''}`} onClick={() => handleSetMainImage(img)}/>
                        <button type="button" onClick={() => removeProductImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X size={10}/></button>
                     </div>
                   ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Click image to set as main.</p>
             </div>

             {/* Variations */}
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-gray-400 text-sm">Colors</label>
                  <div className="flex gap-1 mb-2">{newProduct.colors?.map(c => <span key={c} className="bg-white/10 px-2 rounded text-xs text-white">{c}</span>)}</div>
                  <div className="flex"><input value={tempColor} onChange={e=>setTempColor(e.target.value)} className="bg-black/20 border border-white/10 p-1 text-white w-full"/><button type="button" onClick={addColor} className="bg-bango-600 px-2 text-white">+</button></div>
               </div>
               <div>
                  <label className="text-gray-400 text-sm">Sizes</label>
                  <div className="flex gap-1 mb-2">{newProduct.sizes?.map(s => <span key={s} className="bg-white/10 px-2 rounded text-xs text-white">{s}</span>)}</div>
                  <div className="flex"><input value={tempSize} onChange={e=>setTempSize(e.target.value)} className="bg-black/20 border border-white/10 p-1 text-white w-full"/><button type="button" onClick={addSize} className="bg-bango-600 px-2 text-white">+</button></div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded p-3 text-white">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.name} className="bg-dark-card text-white">{c.name}</option>)}
                </select>
                <input type="number" placeholder="Stock" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="bg-black/20 border border-white/10 p-3 rounded text-white w-full"/>
             </div>

             <textarea placeholder="Description" rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded p-3 text-white"/>
             
             <button type="submit" className="w-full bg-bango-600 hover:bg-bango-700 text-white font-bold py-3 rounded-lg">
                {editingProductId ? 'আপডেট করুন' : 'সেভ করুন'}
             </button>
          </form>
        )}
        
        {activeTab === 'categories' && (
           <div>
             <div className="mb-6 flex gap-4 items-end">
                <input value={newCategory.name} onChange={e=>setNewCategory({...newCategory, name: e.target.value})} placeholder="Category Name" className="bg-black/20 border border-white/10 p-2 rounded text-white"/>
                <input type="file" onChange={handleCatImageUpload} className="text-white text-xs"/>
                <button onClick={handleAddCategory} className="bg-bango-600 px-4 py-2 rounded text-white font-bold">Add</button>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {categories.map(c => (
                   <div key={c.id} className="bg-black/20 p-4 rounded border border-white/5 text-center relative group">
                      <img src={c.image} className="w-12 h-12 rounded-full mx-auto mb-2"/>
                      <p className="text-white font-bold">{c.name}</p>
                      <button onClick={() => removeCategory(c.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                   </div>
                ))}
             </div>
           </div>
        )}
      </main>
    </div>
  );
};
