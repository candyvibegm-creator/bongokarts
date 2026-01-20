
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Image as ImageIcon, Sparkles, StopCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { AudioUtils } from '../utils/audio';
// @ts-ignore
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../App';

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  isStreaming?: boolean; 
}

const API_KEY = process.env.API_KEY || ''; 

export const Chatbot = () => {
  const { addToCart, products, siteSettings } = useStore(); // Get Dynamic Products and Settings
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('bongokart_chat_history');
    return saved ? JSON.parse(saved) : [
      { id: '0', role: 'model', text: 'নমস্কার! আমি বঙ্গকার্টের সেলস অ্যাসিস্ট্যান্ট। 😊 আমি আপনাকে কীভাবে সাহায্য করতে পারি? 🛍️' }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Voice Mode State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const [liveInput, setLiveInput] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const liveInputRef = useRef('');
  const liveOutputRef = useRef('');
  
  useEffect(() => {
    localStorage.setItem('bongokart_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isAiSpeaking, liveInput, liveOutput]);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isOpen && !isVoiceMode) {
      idleTimerRef.current = setTimeout(() => {
        if (!isLoading) {
           const idleMsg: Message = {
             id: 'idle-' + Date.now(),
             role: 'model',
             text: 'আপনার কি কোনো বিশেষ পণ্য পছন্দ হয়েছে? 🤔 আমি সাহায্য করতে পারি!'
           };
           setMessages(prev => [...prev, idleMsg]);
        }
      }, 30000); 
    }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [messages, isOpen, isVoiceMode]);

  // Find Product Logic - using dynamic product list
  const findProductInText = (text: string) => {
    const normalizedText = text.toLowerCase();
    return products.find(p => 
      normalizedText.includes(p.title.toLowerCase()) || 
      normalizedText.includes(p.id.toLowerCase())
    );
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    resetIdleTimer();
    setVoiceError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const contentParts: any[] = [];
      
      if (userMsg.image) {
        const base64Data = userMsg.image.split(',')[1];
        contentParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
      }
      
      const inventoryContext = JSON.stringify(products.map(p => ({ 
          id: p.id, 
          title: p.title, 
          price: p.price, 
          category: p.category, 
          brand: p.brand,
          desc: p.shortDescription || p.description 
      })));

      const SYSTEM_INSTRUCTION = `
        ${siteSettings.aiSystemInstruction}
        
        CURRENT INVENTORY DATA:
        ${inventoryContext}
        
        Context: User is on ${location.pathname}.
        Tone: Friendly, Convincing, Emoji-rich.
        Role: BongoKart Sales Assistant.
        
        If user asks for products, list them with prices.
        If user wants to buy, encourage them to add to cart.
      `;

      if (userMsg.text) {
        contentParts.push({ text: userMsg.text });
      } else if (userMsg.image) {
         contentParts.push({ text: "Please analyze this image and suggest similar products from inventory." });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { role: 'user', parts: contentParts },
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });

      const responseText = response.text || "দুঃখিত, আমি বুঝতে পারিনি। আবার বলুন? 🤔";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "সাময়িক ত্রুটি হয়েছে। একটু পরে আবার চেষ্টা করুন। 😔"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceMode = async () => {
    if (isVoiceConnected) return;
    setIsVoiceMode(true);
    setVoiceError(null);
    setLiveInput('');
    setLiveOutput('');
    liveInputRef.current = '';
    liveOutputRef.current = '';
    
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });
      await audioCtx.resume(); 
      audioContextRef.current = audioCtx;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });

      // Live inventory context
      const inventoryShort = JSON.stringify(products.slice(0, 20).map(p => ({ t: p.title, p: p.price })));

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          systemInstruction: `You are BongoKart Sales AI. Be super friendly and concise. Speak Bengali. Inventory samples: ${inventoryShort}`,
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsVoiceConnected(true);
            setVoiceError(null);
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
               const source = inputCtx.createMediaStreamSource(stream);
               inputSourceRef.current = source;
               const processor = inputCtx.createScriptProcessor(2048, 1, 1);
               processorRef.current = processor;
               processor.onaudioprocess = (e) => {
                 const inputData = e.inputBuffer.getChannelData(0);
                 const pcmInt16 = AudioUtils.floatTo16BitPCM(inputData);
                 const base64String = AudioUtils.arrayBufferToBase64(pcmInt16.buffer);
                 sessionPromise.then(session => { try { session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64String } }); } catch (e) {} });
               };
               source.connect(processor);
               processor.connect(inputCtx.destination);
            }).catch(err => {
              stopVoiceMode();
              setVoiceError("মাইক্রোফোন সমস্যা।");
            });
          },
          onmessage: async (msg: LiveServerMessage) => {
             if (msg.serverContent?.interrupted) {
               cancelAudioOutput();
               liveOutputRef.current = '';
               setLiveOutput('');
             }
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData && audioContextRef.current) {
                const audioBytes = AudioUtils.base64ToUint8Array(audioData);
                const audioBuffer = await AudioUtils.decodeAudioData(audioBytes, audioContextRef.current);
                playAudioChunk(audioBuffer);
             }
             const inputT = msg.serverContent?.inputTranscription?.text;
             if (inputT) { liveInputRef.current += inputT; setLiveInput(liveInputRef.current); }
             const outputT = msg.serverContent?.outputTranscription?.text;
             if (outputT) { liveOutputRef.current += outputT; setLiveOutput(liveOutputRef.current); }
             if (msg.serverContent?.turnComplete) {
                 if (liveInputRef.current) { setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: liveInputRef.current }]); liveInputRef.current = ''; setLiveInput(''); }
                 if (liveOutputRef.current) { setMessages(prev => [...prev, { id: Date.now().toString() + '_ai', role: 'model', text: liveOutputRef.current }]); liveOutputRef.current = ''; setLiveOutput(''); }
             }
          },
          onclose: () => stopVoiceMode(),
          onerror: (err) => { }
        }
      });
    } catch (e) {
      stopVoiceMode();
      setVoiceError("সংযোগ সমস্যা।");
    }
  };

  const cancelAudioOutput = () => {
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsAiSpeaking(false);
  };

  const playAudioChunk = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    const now = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < now) nextStartTimeRef.current = now;
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    activeSourcesRef.current.push(source);
    setIsAiSpeaking(true);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      if (activeSourcesRef.current.length === 0) setIsAiSpeaking(false);
    };
  };

  const stopVoiceMode = () => {
    cancelAudioOutput();
    setIsVoiceMode(false);
    setIsVoiceConnected(false);
    setIsAiSpeaking(false);
    if (liveInputRef.current) setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: liveInputRef.current }]);
    if (liveOutputRef.current) setMessages(prev => [...prev, { id: Date.now().toString() + '_ai', role: 'model', text: liveOutputRef.current }]);
    liveInputRef.current = ''; liveOutputRef.current = ''; setLiveInput(''); setLiveOutput('');
    try { audioContextRef.current?.close(); } catch(e) {}
    audioContextRef.current = null;
    try { inputSourceRef.current?.disconnect(); } catch(e) {}
    try { processorRef.current?.disconnect(); } catch(e) {}
  };

  const renderMessageContent = (msg: Message) => {
    const productMatch = msg.role === 'model' ? findProductInText(msg.text) : null;
    return (
      <div className="flex flex-col gap-2">
        {msg.image && <img src={msg.image} alt="Upload" className="w-full h-20 object-cover rounded-lg mb-1" />}
        <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
          {msg.text}
          {msg.isStreaming && <span className="inline-block w-1 h-3 ml-1 bg-white/50 animate-pulse align-middle"/>}
        </p>
        {productMatch && !msg.isStreaming && (
          <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-colors group">
             <div className="flex gap-2 mb-2">
                <img src={productMatch.image} alt={productMatch.title} className="w-10 h-10 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-bold text-white truncate group-hover:text-bango-500">{productMatch.title}</h4>
                  <p className="text-[9px] text-gray-400">৳{productMatch.price.toLocaleString()}</p>
                </div>
             </div>
             <div className="flex gap-1">
               <button onClick={() => { navigate(`/product/${productMatch.id}`); setIsOpen(false); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] py-1 rounded flex items-center justify-center gap-1"><ArrowRight size={8} /> বিস্তারিত</button>
               <button onClick={() => addToCart(productMatch)} className="flex-1 bg-bango-600 hover:bg-bango-700 text-white text-[9px] py-1 rounded flex items-center justify-center gap-1"><ShoppingBag size={8} /> যোগ</button>
             </div>
          </MotionDiv>
        )}
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <MotionButton
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-bango-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] flex items-center justify-center"
          >
            <Sparkles className="animate-pulse" size={20} />
          </MotionButton>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[85vw] md:w-[280px] h-[380px] bg-dark-bg/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10"
          >
            <div className="p-2 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-bango-900/40 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-bango-500 to-purple-600 flex items-center justify-center shadow-lg"><Sparkles size={12} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-white text-xs">সেলস অ্যাসিস্ট্যান্ট</h3>
                  <p className="text-[9px] text-green-400 flex items-center gap-1"><span className={`w-1 h-1 rounded-full ${isVoiceConnected ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}/> {isVoiceConnected ? "কথা বলছে..." : "অনলাইন"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => { setMessages([]); localStorage.removeItem('bongokart_chat_history'); }} title="Clear" className="text-gray-400 hover:text-red-400"><X size={12} className="rotate-45" /></button>
                 <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={14} /></button>
              </div>
            </div>

            {isVoiceMode && (
              <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 bg-dark-bg/95 backdrop-blur-md flex flex-col p-4">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-bango-500/20 flex items-center justify-center mb-4 relative">
                       <MotionDiv animate={{ scale: isAiSpeaking ? [1, 1.3, 1] : 1 }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-bango-500/30 rounded-full" />
                       <Mic size={30} className="text-white relative z-10" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{isAiSpeaking ? "বলছি..." : (isVoiceConnected ? "শুনছি..." : "সংযোগ...")}</h3>
                    {voiceError && <p className="text-red-400 text-xs mb-2">{voiceError}</p>}
                </div>
                <div className="bg-black/40 rounded-xl p-3 min-h-[100px] max-h-[120px] overflow-y-auto mb-4 border border-white/5 space-y-1">
                   {liveInput && <div className="text-white text-xs"><span className="text-bango-400 font-bold block">আপনি:</span>{liveInput}</div>}
                   {liveOutput && <div className="text-white text-xs"><span className="text-purple-400 font-bold block">এআই:</span>{liveOutput}</div>}
                </div>
                <div className="flex justify-center">
                   <button onClick={stopVoiceMode} className="bg-red-500/20 text-red-500 px-6 py-2 rounded-full text-xs font-bold border border-red-500/50 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"><StopCircle size={14} /> বন্ধ</button>
                </div>
              </MotionDiv>
            )}

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
              {messages.map((msg) => (
                <MotionDiv key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-xl p-2 ${msg.role === 'user' ? 'bg-bango-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'}`}>
                    {renderMessageContent(msg)}
                  </div>
                </MotionDiv>
              ))}
              {isLoading && <div className="flex justify-start"><div className="bg-white/10 rounded-xl p-2 rounded-tl-none flex gap-1"><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"/><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></div></div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2 bg-black/20 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button onClick={startVoiceMode} className="p-1.5 bg-white/10 rounded-full text-gray-400 hover:text-white" title="Voice"><Mic size={14} /></button>
                <div className="flex-1 relative">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="লিখুন..." className="w-full bg-white/5 border border-white/10 rounded-full pl-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-bango-500" />
                  <button onClick={handleSendMessage} className="absolute right-1 top-1 p-0.5 bg-bango-600 rounded-full text-white hover:bg-bango-700"><Send size={10} /></button>
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};
