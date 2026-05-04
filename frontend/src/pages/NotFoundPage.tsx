import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Rocket, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans" dir="rtl">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 gradient-mesh pointer-events-none opacity-40" />
      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center animate-fade-up">
        {/* Animated icon */}
        <div className="w-32 h-32 mb-10 relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-full h-full glass rounded-3xl border border-white/10 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
             <Rocket className="w-14 h-14 text-primary animate-bounce-slow" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tracking-tighter mb-4" style={{ fontFamily: 'system-ui' }}>
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
          عذراً، لم نتمكن من العثور على هذه الصفحة!
        </h2>
        
        <p className="text-slate-400 text-lg mb-10 max-w-md leading-relaxed">
          يبدو أن الرابط الذي تبحث عنه قد تم نقله أو حذفه، أو ربما أخطأت في كتابة العنوان.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link 
            to="/" 
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-light transition-all duration-300 shadow-lg shadow-primary/30 flex items-center justify-center gap-3 group"
          >
            <Home className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-full hover:bg-white/10 border border-white/10 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span>الرجوع للخلف</span>
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
