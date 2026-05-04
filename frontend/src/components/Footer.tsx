import React from 'react';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// Safe icon extraction
const getIcon = (name: string) => (Icons as any)[name] || null;

const Rocket = getIcon("Rocket");
const Mail = getIcon("Mail");
const Phone = getIcon("Phone");
const MapPin = getIcon("MapPin");
const Facebook = getIcon("Facebook");
const Linkedin = getIcon("Linkedin");
const Twitter = getIcon("Twitter");
const Github = getIcon("Github");
const Globe = getIcon("Globe");
const Instagram = getIcon("Instagram");

// Logo URL
import logoMain from "../assets/logo-icon.png";

export const Footer = () => {
  return (
    <footer className="bg-secondary-foreground text-white py-24 border-t border-white/5" dir="rtl">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="bg-white p-2 rounded-xl transition-transform duration-500 group-hover:scale-110">
                <img src={logoMain} alt="صناع الفرص" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-extrabold text-xl tracking-tighter">صُناع الفرص</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Opportunities Makers</span>
              </div>
            </div>
            <p className="text-white/50 font-sans leading-relaxed text-sm max-w-xs">
              المنصة الوطنية الرائدة لتمكين الشباب وتأهيلهم لسوق العمل من خلال برامج نوعية وشراكات استراتيجية عالمية.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, link: "https://www.facebook.com/TheOpportunitiesMakers" },
                { Icon: Twitter, link: "https://x.com/TheOppMakersOrg" },
                { Icon: Linkedin, link: "https://www.linkedin.com/company/theopportunities-makers" },
                { Icon: Globe, link: "#" }
              ].map((item, i) => {
                if (!item.Icon) return null;
                return (
                  <a
                    key={i}
                    href={item.link}
                    target={item.link !== "#" ? "_blank" : undefined}
                    rel={item.link !== "#" ? "noopener noreferrer" : undefined}
                    className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all duration-300"
                  >
                    <item.Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary border-r-2 border-primary pr-4">روابط سريعة</h4>
            <ul className="space-y-4 font-sans text-sm text-white/50">
              {['عن المنصة', 'الوحدات التنظيمية', 'الفعاليات القادمة', 'الشركاء الاستراتيجيين'].map((item, i) => (
                <li key={i}>
                  <Link to={i === 1 ? "/departments" : "/"} className="hover:text-white hover:translate-x-[-8px] inline-block transition-all duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary border-r-2 border-primary pr-4">المصادر</h4>
            <ul className="space-y-4 font-sans text-sm text-white/50">
              {['المكتبة الرقمية', 'دليل المستخدم', 'الأسئلة الشائعة', 'سياسة الخصوصية'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-white hover:translate-x-[-8px] inline-block transition-all duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary border-r-2 border-primary pr-4">اتصل بنا</h4>
            <ul className="space-y-5 font-sans text-sm text-white/50">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  {MapPin && <MapPin className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex flex-col gap-1.5 pt-2">
                  <span>القاهرة، جمهورية مصر العربية - الحي الحكومي</span>
                  <span>المنصورة، المشاية - برج القصر (المقابل لبرج السوسن) - الدور الأول علوي - شركة سندك</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  {Phone && <Phone className="w-5 h-5 text-primary" />}
                </div>
                <span className="pt-2" dir="ltr">+20 100 843 0628</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  {Mail && <Mail className="w-5 h-5 text-primary" />}
                </div>
                <a href="mailto:a75318643@gmail.com" className="pt-2 hover:text-white transition-colors">a75318643@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p>© {new Date().getFullYear()} صُناع الفرص. جميع الحقوق محفوظة.</p>
          </div>
          <div className="flex gap-8">
            {['شروط الاستخدام', 'إمكانية الوصول', 'خريطة الموقع'].map((item, i) => (
              <a key={i} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
