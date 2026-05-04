import React, { useState, useEffect } from 'react';
import { 
  ArrowDown, Calendar, Clock, User, ChevronLeft, Users, ArrowLeft,
  Target, Sparkles, Handshake, MessageSquare, ArrowRight, Building2, Loader2,
  Crown, UserCheck, ShieldCheck, Shield, X
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';
import api from "../lib/api";
import { Department } from "../types";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

import eidImg from "../assets/عيدالفطر.jpg";
import totDakahliaImg from "../assets/tot دقهليه.jpg";
import totCairoImg from "../assets/tot قاهره.jpg";

const heroBanner = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-secondary-foreground/70 backdrop-blur-[1px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center mt-20">
        <div className="animate-fade-up space-y-8">
          <h1 className="text-5xl md:text-8xl font-sans font-light text-white mb-6 tracking-tight leading-tight">
            نصنع الفرص لـ <span className="font-bold text-accent">مستقبل مشرق</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-sans font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة "صُناع الفرص" تهدف إلى تمكين الشباب وتأهيلهم لسوق العمل من خلال برامج نوعية وشراكات استراتيجية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/signup" className="px-10 py-4 rounded-full text-white font-sans font-bold text-sm uppercase tracking-widest bg-primary hover:bg-primary-light transition-all shadow-xl hover:scale-105 w-full sm:w-auto">
              اكتشف المزيد
            </Link>
            <Link to="/login" className="px-10 py-4 rounded-full text-white font-sans font-bold text-sm uppercase tracking-widest border-2 border-white hover:bg-white hover:text-primary transition-all w-full sm:w-auto">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-slow text-white/70">
        <ArrowDown className="w-8 h-8" />
      </div>
    </section>
  );
};

const DiscoverImpact = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUnits, setShowUnits] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/departments");
      setDepartments(data.departments);
    } catch (err) {
      console.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset global dashboard styles when on home page
    const root = document.documentElement;
    root.classList.remove("theme-bw", "theme-professional");
    root.style.removeProperty("--primary-color");
    root.style.removeProperty("--primary-color-light");
    root.style.removeProperty("--primary-color-lighter");
    
    if (showUnits && departments.length === 0) {
      fetchDepartments();
    }
  }, [showUnits]);

  return (
    <section id="units" className="py-32 bg-white" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-border pb-10">
          <div className="max-w-2xl text-right animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-sans font-light text-primary mb-6">اكتشف أثرنا</h2>
            <p className="text-xl text-muted-foreground font-sans leading-relaxed">
              بالتعاون مع وزارة الشباب والرياضة، نركز على تمكين الشباب لمواجهة متطلبات سوق العمل العالمي.
            </p>
          </div>
          <div className="mt-8 md:mt-0">
             <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
               <span>كل المبادرات</span>
               <ArrowLeft className="w-4 h-4" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 max-w-7xl mx-auto">
          {[
            { title: "عن المنصة", desc: "تعرف على فريق القيادة ومهمتنا وقيمنا الجوهرية", icon: Users, href: "#about" },
            { title: "الوحدات التنظيمية", desc: "استكشف وحداتنا التنظيمية المتخصصة وبرامجها", icon: Target, action: () => setShowUnits(!showUnits), active: showUnits, href: "#units" },
            { title: "الفعاليات والأنشطة", desc: "اكتشف برامج التدريب وورش العمل والمسابقات", icon: Sparkles, href: "#activities" },
          ].map((item, idx) => (
            <div 
              key={idx}
              onClick={item.action}
              className={cn(
                "group bg-white p-12 text-right transition-all duration-500 border-t-4 hover:shadow-2xl cursor-pointer",
                item.active ? "border-primary shadow-xl" : "border-muted shadow-sm hover:border-primary"
              )}
            >
              <div className="w-16 h-16 bg-muted flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-sans font-bold text-foreground mb-4">{item.title}</h3>
              <p className="text-muted-foreground font-sans leading-relaxed mb-8 h-20">{item.desc}</p>
              <a 
                href={item.href}
                onClick={(e) => {
                  if (item.action) {
                    e.preventDefault();
                    item.action();
                  }
                }}
                className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:underline"
              >
                <span>اقرأ المزيد</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
              </a>
            </div>
          ))}
        </div>

        <div className={`overflow-hidden transition-all duration-1000 ease-in-out ${showUnits ? 'max-h-[5000px] opacity-100 mt-20' : 'max-h-0 opacity-0'}`}>
          <div className="p-10 md:p-20 bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-16">
               <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary flex items-center justify-center text-white">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-sans font-bold">الوحدات التنظيمية</h2>
                  <p className="text-muted-foreground font-sans">يوجد لدينا {departments.length} أقسام متخصصة</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-sans">جاري تحميل الوحدات...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {departments.map((dept) => (
                  <Card key={dept.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white overflow-hidden">
                    <div className="h-2 w-full bg-muted group-hover:bg-primary transition-colors" />
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-2xl font-sans font-bold text-primary">{dept.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8 pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">رئيس القسم</span>
                          <span className="font-sans font-bold text-foreground">{dept.headName}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">نائب الرئيس</span>
                          <span className="font-sans font-bold text-foreground">{dept.viceName}</span>
                        </div>
                      </div>
                      <Button className="w-full rounded-none bg-muted text-primary hover:bg-primary hover:text-white transition-all font-bold uppercase tracking-widest text-xs py-6">
                        عرض التفاصيل
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const AnimatedGallery = () => {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await api.get("/images");
        setImages(data.images);
      } catch (err) {
        console.error("Failed to load gallery images");
      }
    };
    fetchImages();
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-32 overflow-hidden bg-muted/20">
      <div className="container mx-auto px-4 text-right mb-16" dir="rtl">
        <h2 className="text-4xl md:text-5xl font-sans font-light text-primary mb-6">لحظات صُناع الفرص</h2>
        <p className="text-xl text-muted-foreground font-sans">جولة مصورة في أبرز أنشطتنا وفعالياتنا</p>
      </div>
      <div className="relative flex overflow-x-hidden w-full group">
        <div className="py-4 animate-marquee whitespace-nowrap flex gap-10 px-3">
          {[...images, ...images].map((img, i) => (
            <div key={i} className="relative w-[350px] sm:w-[500px] h-[300px] sm:h-[350px] overflow-hidden shadow-sm flex-shrink-0 transition-all duration-700 hover:shadow-2xl grayscale hover:grayscale-0">
              <img 
                src={img.url} 
                alt={img.description || `Gallery ${i}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect fill='%2300629b' width='200' height='150'/%3E%3Ctext fill='%23fff' x='100' y='80' text-anchor='middle' font-size='14'%3EIEEE Image%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ActivitiesSection = () => {
  const [visibleCount, setVisibleCount] = React.useState(8);
  
  const activities = [
    {
      title: "تهنئة عيد الفطر المبارك",
      date: "19 مارس 2024",
      img: eidImg,
      desc: "كيان صناع الفرص يتقدم بأحر التهاني والتبريكات لجميع الأمة الإسلامية بمناسبة حلول عيد الفطر المبارك، أعاده الله علينا وعليكم بالخير واليمن والبركات."
    },
    {
      title: "اختتام برنامج تدريب المدربين (TOT) بالدقهلية",
      date: "10 مارس 2024",
      img: totDakahliaImg,
      desc: "شهدت محافظة الدقهلية ختام فعاليات برنامج تدريب المدربين (TOT) لتمكين الشباب وتأهيلهم لسوق العمل بمهارات تدريبية احترافية."
    },
    {
      title: "اختتام برنامج تدريب المدربين (TOT) بالقاهرة",
      date: "9 مارس 2024",
      img: totCairoImg,
      desc: "نجاح كبير لختام برنامج TOT بمحافظة القاهرة، حيث تم تقييم المشروعات التدريبية للمشاركين وتوزيع شهادات الاجتياز."
    },
    {
      title: "حفل الإفطار السنوي لأعضاء الكيان بالمنصورة",
      date: "8 مارس 2024",
      img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
      desc: "نظم كيان صناع الفرص الإفطار السنوي لأعضاء الكيان في مدينة المنصورة، في لقاء جمع الفريق في أجواء سادتها المودة والسعادة."
    },
    {
      title: "جلسة خيمة صناع - الرابعة",
      date: "7 مارس 2024",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
      desc: "انعقاد الجلسة الرابعة من مبادرة 'خيمة صناع' الرمضانية، والتي تهدف لتبادل الخبرات وتطوير المهارات الشخصية للأعضاء."
    },
    {
      title: "قمة صُنّاع الفرص (Summit)",
      date: "10 أكتوبر 2023",
      img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      desc: "إطلاق قمة صناع الفرص، الحدث الشبابي الأكبر بمشاركة نخبة من الخبراء والمتحدثين في مجالات التدريب والتوظيف والإعلام."
    },
    {
      title: "ورشة 'عين المشاهد' الإعلامية",
      date: "15 مارس 2024",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      desc: "ختام الورشة التدريبية المتخصصة في صناعة المحتوى الإعلامي التي نظمتها وحدة الإعلام المركزية بالكيان."
    },
    {
      title: "دورة مهارات العمل الحر (Freelancing)",
      date: "1 أكتوبر 2023",
      img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      desc: "بالتعاون مع مؤسس منصة فريلانزاوية، نظم الكيان ورشة عمل مكثفة لتدريب الشباب على كيفية البدء والنجاح في العمل الحر."
    },
    {
      title: "مبادرة دعم وتأهيل المواهب الشابة",
      date: "12 يناير 2024",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
      desc: "إعلان فتح باب التسجيل للمواهب في مختلف المجالات لتقديم الدعم الفني والتدريبي اللازم لتأهيلهم لسوق العمل."
    },
    {
      title: "خيمة رمضان.. مش بس قعدة وشاي",
      date: "20 مارس 2024",
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      desc: "فعاليات رمضانية تجمع بين الترفيه والتعلم، حيث نستغل الأجواء المباركة في تطوير الذات وبناء علاقات اجتماعية مثمرة."
    },
    {
      title: "برنامج 'صناع القادة' بالغربية",
      date: "5 ديسمبر 2023",
      img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      desc: "إطلاق برنامج تدريبي جديد يهدف لبناء جيل من القادة الشباب القادرين على إحداث تغيير إيجابي في مجتمعاتهم المحلية."
    },
    {
      title: "زيارة تفقدية لمراكز الشباب بالدقهلية",
      date: "18 نوفمبر 2023",
      img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80",
      desc: "جولة ميدانية لمتابعة الأنشطة والفعاليات التي ينظمها الكيان بالتعاون مع مديريات الشباب والرياضة."
    },
    {
      title: "مسابقة 'أفضل فكرة مشروع مجتمعي'",
      date: "10 سبتمبر 2023",
      img: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80",
      desc: "إعلان نتائج المسابقة التي تهدف لتشجيع الشباب على ابتكار حلول إبداعية للمشكلات المجتمعية الملحة."
    },
    {
      title: "ندوة 'التحول الرقمي وأثره على الشباب'",
      date: "25 يناير 2024",
      img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      desc: "جلسة حوارية ناقشت الفرص والتحديات التي يفرضها العصر الرقمي والذكاء الاصطناعي على مستقبل الوظائف."
    },
    {
      title: "احتفالية يوم الشباب العالمي",
      date: "12 أغسطس 2023",
      img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
      desc: "تنظيم فعالية كبرى للاحتفاء بإنجازات الشباب المتميزين في مختلف المجالات التطوعية والمهنية."
    },
    {
      title: "إطلاق منصة 'صناع ديجيتال' التعليمية",
      date: "5 فبراير 2024",
      img: "https://scontent.fcai19-3.fna.fbcdn.net/v/t39.30808-6/449110954_494199409800252_844906705841418457_n.jpg",
      desc: "تدشين منصة إلكترونية توفر دورات تدريبية مجانية ومصادر تعليمية للشباب لتعزيز مهاراتهم التقنية والناعمة."
    }
  ];

  const hasMore = visibleCount < activities.length;

  return (
    <section id="activities" className="py-32 bg-secondary-foreground" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-20 text-right">
          <h2 className="text-4xl md:text-5xl font-sans font-light text-white mb-6 animate-fade-up">الفعاليات والأنشطة</h2>
          <p className="text-xl text-white/60 font-sans leading-relaxed animate-fade-up">
            اكتشف برامج التدريب وورش العمل والمسابقات التي نقوم بها لتمكين الشباب وتأهيلهم. اقرأ المزيد بالصور والتاريخ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {activities.slice(0, visibleCount).map((act, i) => (
            <div key={i} className="group bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="relative h-48 overflow-hidden">
                <img src={act.img} alt={act.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {act.date}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-white font-sans font-bold text-lg leading-tight group-hover:text-primary transition-colors h-14 line-clamp-2">
                  {act.title}
                </h3>
                <p className="text-white/50 text-sm font-sans leading-relaxed line-clamp-3 h-18">
                  {act.desc}
                </p>
                <div className="pt-4 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest cursor-pointer group/btn">
                  <span>اقرأ المزيد</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-2" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-20 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 4)}
              className="px-12 py-4 rounded-full text-white font-sans font-bold text-sm uppercase tracking-widest border border-white/20 hover:bg-primary hover:border-primary transition-all duration-300"
            >
              عرض المزيد من الفعاليات
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-background relative overflow-hidden" dir="rtl">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>هويتنا ورسالتنا</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-sans font-light text-foreground leading-tight">
              نحن <span className="font-bold text-primary">صُناع الفرص</span>، نبني جيلاً من القادة المبدعين.
            </h2>
            <p className="text-xl text-muted-foreground font-sans leading-relaxed">
              منصة "صُناع الفرص" هي مبادرة شبابية تطوعية رائدة، تهدف إلى ردم الفجوة بين التعليم الأكاديمي ومتطلبات سوق العمل. نحن نؤمن بأن التطوع هو أرقى أشكال العطاء، ومن خلاله ننمي مهارات القيادة والابتكار لدى الشباب المصري.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
              <div className="p-6 bg-muted/50 border border-border rounded-2xl">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">رؤيتنا</h4>
                <p className="text-sm text-muted-foreground">أن نكون المنصة الأولى في مصر لتأهيل الشباب تقنياً ومهارياً.</p>
              </div>
              <div className="p-6 bg-muted/50 border border-border rounded-2xl">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent mb-4">
                  <Handshake className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">قيمنا</h4>
                <p className="text-sm text-muted-foreground">الشفافية، الالتزام، الابتكار، والعمل الجماعي بروح واحدة.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const JoinUsSection = () => {
  return (
    <section id="join" className="py-32 bg-white relative overflow-hidden" dir="rtl">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-sans font-light text-primary mb-6 animate-fade-up">انضم إلى عائلة صناع الفرص</h2>
          <p className="text-xl text-muted-foreground font-sans leading-relaxed animate-fade-up delay-100">
            نحن نبحث دائماً عن المبدعين والشغوفين بالتطوع. انضم إلينا في رحلة تمكين الشباب المصري وتطوير مهاراتهم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          {[
            { step: "01", title: "تقديم الطلب", desc: "املأ استمارة الانضمام ببياناتك الصحيحة", icon: "📝" },
            { step: "02", title: "التقييمات", desc: "اختبارات اللغة والمهارات الشخصية", icon: "🧠" },
            { step: "03", title: "المقابلة", desc: "مقابلة شخصية مع لجنة الموارد البشرية", icon: "🎤" },
            { step: "04", title: "المحاكاة", desc: "تجربة عملية داخل اللجنة المختارة", icon: "🚀" },
          ].map((item, i) => (
            <div key={i} className="relative group p-10 bg-muted/30 border border-border rounded-[40px] text-center hover:bg-primary transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-primary font-mono font-bold text-xs tracking-widest mb-4 block group-hover:text-white/70">STEP {item.step}</span>
              <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="text-sm text-muted-foreground group-hover:text-white/80 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/signup" className="inline-flex items-center gap-4 px-12 py-5 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary-light transition-all shadow-glow hover:scale-105 group">
            قدم الآن وانضم إلينا
            <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
          </Link>
          <p className="mt-8 text-sm text-muted-foreground font-sans">
            * يتم مراجعة جميع الطلبات بعناية لضمان اختيار الكفاءات المناسبة.
          </p>
        </div>
      </div>
    </section>
  );
};

const PublicAiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'مرحباً بك في صناع الفرص! ✨ أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم في التعرف على العمل التطوعي والانضمام إلينا؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/public-chat', { message: input, history: messages });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، واجهت مشكلة في الاتصال. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[350px] md:w-[400px] h-[500px] md:h-[600px] bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[32px] overflow-hidden mb-6 flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">سفير صناع الفرص</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-white/70">متصل الآن</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowDown className="w-5 h-5 rotate-180" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-white mr-auto rounded-bl-none" 
                      : "bg-white text-slate-800 ml-auto rounded-br-none border border-slate-100"
                  )}
                >
                  {msg.content}
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>المساعد يفكر...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 bg-slate-100 rounded-2xl p-1 pr-4 focus-within:ring-2 ring-primary/20 transition-all">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="اسألني عن التطوع..."
                  className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none text-slate-700"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-glow transition-all duration-500 hover:scale-110 active:scale-90 relative",
          isOpen ? "bg-white text-primary rotate-90" : "bg-primary text-white"
        )}
      >
        <MessageSquare className={cn("w-7 h-7 transition-all", isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100")} />
        <X className={cn("w-7 h-7 absolute transition-all", isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
      </button>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <AboutSection />
      <DiscoverImpact />
      <JoinUsSection />
      <ActivitiesSection />
      <AnimatedGallery />
      <PublicAiChat />
    </div>
  );
};

export default HomePage;
