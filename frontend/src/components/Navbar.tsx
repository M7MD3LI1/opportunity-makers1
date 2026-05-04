import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { cn } from '../lib/utils';

const { Menu, X } = Icons as any;
import logoMain from "../assets/logo-icon.png";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={cn(
          'transition-all duration-300 border-b',
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-md py-2 border-border'
            : 'bg-black/10 backdrop-blur-sm py-6 border-transparent'
        )}
        dir="rtl"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={cn(
                "p-1.5 transition-all duration-500 overflow-hidden bg-white rounded-xl shadow-lg"
              )}>
                <img src={logoMain} alt="صناع الفرص" className="w-12 h-12 object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className={cn(
                  "font-sans font-extrabold text-lg md:text-xl tracking-tight transition-colors",
                  isScrolled ? "text-primary" : "text-white"
                )}>
                  صُناع الفرص
                </span>
                <span className={cn(
                  "font-sans font-medium text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-colors opacity-90",
                  isScrolled ? "text-muted-foreground" : "text-white/80"
                )}>
                  Opportunities Makers
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Clean links */}
            <div className="hidden lg:flex items-center gap-8">
              {[
                { label: 'عن المنصة', href: '#about' },
                { label: 'الوحدات التنظيمية', href: '#units' },
                { label: 'الفعاليات', href: '#activities' },
                { label: 'الشركاء', href: '#partners' }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "font-sans text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full",
                    isScrolled ? "text-foreground" : "text-white"
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Action Button & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className={cn(
                  "hidden md:inline-flex items-center justify-center px-8 py-2.5 rounded-full font-sans font-bold text-sm uppercase tracking-widest transition-all",
                  isScrolled 
                    ? "bg-primary text-white hover:bg-primary-light shadow-md" 
                    : "bg-white text-primary hover:bg-gray-100"
                )}
              >
                تسجيل الدخول
              </Link>

              <button
                className={cn(
                  "md:hidden p-2 transition-colors",
                  isScrolled ? "text-foreground" : "text-white"
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isScrolled ? (isMobileMenuOpen ? (X && <X />) : (Menu && <Menu />)) : (isMobileMenuOpen ? (X && <X />) : (Menu && <Menu />))}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-2xl py-8 px-6 flex flex-col gap-6 animate-fade-in">
            {[
              { label: 'عن المنصة', href: '#about' },
              { label: 'الوحدات التنظيمية', href: '#units' },
              { label: 'الفعاليات', href: '#activities' },
              { label: 'الشركاء', href: '#partners' }
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-lg font-bold text-foreground border-b border-border pb-2"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 text-center px-6 py-4 rounded-full text-white font-sans font-bold uppercase tracking-widest bg-primary"
            >
              تسجيل الدخول
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
