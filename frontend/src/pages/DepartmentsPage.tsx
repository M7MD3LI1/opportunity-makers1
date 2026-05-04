import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Department } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Building2, User, UserCheck, Crown, ArrowLeft, Loader2 } from "lucide-react";

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(data.departments);
    } catch (err: any) {
      setError("Failed to load departments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="bg-muted/30 border-b border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-sans font-light text-primary mb-6 animate-fade-in">
            الوحدات <span className="font-bold">التنظيمية</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in font-sans leading-relaxed">
            استكشف الأقسام التي تدفع منظمتنا للأمام. تلعب كل وحدة دوراً حيوياً في نجاحنا وتمكين الشباب.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-sans">جاري تحميل الوحدات...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-6 font-sans font-bold">{error}</p>
            <Button onClick={fetchDepartments} className="rounded-full px-8">
              حاول مرة أخرى
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {departments.map((dept, index) => (
              <Card
                key={dept.id}
                className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-2 w-full bg-muted group-hover:bg-primary transition-colors" />
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-2xl font-sans font-bold text-foreground">{dept.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-8 pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-muted pb-2">
                      <div className="flex items-center gap-2">
                         <Crown className="w-3 h-3 text-primary" />
                         <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">رئيس القسم</span>
                      </div>
                      <span className="font-sans font-bold text-foreground">{dept.headName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-muted pb-2">
                      <div className="flex items-center gap-2">
                         <UserCheck className="w-3 h-3 text-primary" />
                         <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">نائب الرئيس</span>
                      </div>
                      <span className="font-sans font-bold text-foreground">{dept.viceName}</span>
                    </div>
                  </div>
                  <Button className="w-full rounded-none bg-muted text-primary hover:bg-primary hover:text-white transition-all font-bold uppercase tracking-widest text-xs py-6 mt-4">
                    عرض المبادرات
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentsPage;
