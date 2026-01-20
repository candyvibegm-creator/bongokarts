
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Save, X, Upload, Check } from 'lucide-react';
import { useStore } from '../App';

const MotionDiv = motion.div as any;

// --- CMS Toolbar ---
export const CMSToolbar = () => {
  const { isEditing, setIsEditing, saveCMS, cancelCMS } = useStore();

  if (!isEditing) return null;

  return (
    <MotionDiv
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] bg-dark-card border border-bango-500 rounded-full shadow-[0_0_30px_rgba(225,29,72,0.4)] px-6 py-3 flex items-center gap-4"
    >
      <span className="text-white font-bold text-sm uppercase tracking-wider animate-pulse">
        এডিটিং মোড চালু আছে
      </span>
      <div className="h-4 w-[1px] bg-white/20" />
      <button
        onClick={saveCMS}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
      >
        <Save size={14} /> সংরক্ষণ করুন
      </button>
      <button
        onClick={cancelCMS}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
      >
        <X size={14} /> বাতিল
      </button>
    </MotionDiv>
  );
};

// --- Editable Text Component ---
interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({ id, defaultText, className = '', tag = 'span' }) => {
  const { isEditing, cmsContent, updateCMSContent } = useStore();
  const content = cmsContent[id]?.value || defaultText;

  if (isEditing) {
    return (
      <textarea
        value={content}
        onChange={(e) => updateCMSContent(id, 'text', e.target.value)}
        className={`bg-bango-500/20 border border-bango-500 border-dashed rounded p-1 text-white focus:outline-none resize-none overflow-hidden hover:bg-bango-500/30 transition-colors w-full ${className}`}
        style={{ minHeight: '1.5em' }}
      />
    );
  }

  const Tag = tag as any;
  return <Tag className={className}>{content}</Tag>;
};

// --- Editable Image Component ---
interface EditableImageProps {
  id: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({ id, defaultSrc, alt, className = '' }) => {
  const { isEditing, cmsContent, updateCMSContent } = useStore();
  const src = cmsContent[id]?.value || defaultSrc;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCMSContent(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      
      {isEditing && (
        <div className="absolute inset-0 bg-black/50 border-2 border-dashed border-bango-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-bango-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"
          >
            <Upload size={14} /> ছবি পরিবর্তন
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
