import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import api from "../../lib/api";

interface CommitteeTasksProps {
  committeeId: string;
  primaryColor: string;
}

const CommitteeTasks: React.FC<CommitteeTasksProps> = ({ committeeId, primaryColor }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitNotes, setSubmitNotes] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (taskId: number) => {
    if (!submitFile) return;
    setSubmitting(taskId);
    const fd = new FormData();
    fd.append("file", submitFile);
    fd.append("notes", submitNotes);
    try {
      await api.post(`/tasks/${taskId}/submit`, fd, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      alert("✅ تم تسليم المهمة بنجاح");
      setSubmitFile(null);
      setSubmitNotes("");
      fetchTasks();
    } catch (e: any) {
      alert("❌ " + (e.response?.data?.message || "فشل التسليم"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا التسليم؟")) return;
    try {
      await api.delete(`/tasks/submissions/${submissionId}`);
      alert("✅ تم حذف التسليم");
      fetchTasks();
    } catch (e: any) {
      alert("❌ " + (e.response?.data?.message || "فشل الحذف"));
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Icons.RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-700 mb-4" />
        <p className="text-slate-500">جاري تحميل المهام...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-bold uppercase tracking-[0.3em] text-[10px] mb-2" style={{ color: primaryColor }}>التكليفات والمهام</p>
          <h1 className="text-4xl font-bold text-slate-100">المهام المركزية</h1>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center">
          <Icons.CheckSquare className="w-16 h-16 text-slate-700 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-200 mb-2">لا توجد مهام حالياً</h3>
          <p className="text-slate-500">سيتم عرض المهام المسندة إليك هنا فور إضافتها من قبل الإدارة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tasks.map((task: any, i: number) => {
            const submitted = task.submissions?.length > 0;
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/5 rounded-[40px] p-8 hover:bg-white/10 transition-all group">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-3 mb-4">
                      {task.deadline && (
                        <span className="bg-white/5 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
                          تنتهي في: {new Date(task.deadline).toLocaleDateString("en-US")}
                        </span>
                      )}
                      <span className="text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest"
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}>
                        {task.points} نقطة
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200 mb-3 group-hover:opacity-80 transition-colors">{task.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{task.description}</p>
                  </div>
                </div>

                {!submitted ? (
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl p-6 hover:border-white/20 cursor-pointer transition-colors group/upload">
                        <Icons.UploadCloud className="w-8 h-8 text-slate-600 mb-2 transition-colors" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover/upload:text-white uppercase">
                          {submitFile ? submitFile.name : "اختر ملف الحل"}
                        </span>
                        <input type="file" onChange={e => setSubmitFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                      <textarea value={submitNotes} onChange={e => setSubmitNotes(e.target.value)}
                        placeholder="ملاحظات التسليم..." className="flex-1 bg-white/5 border border-white/5 text-slate-200 text-sm p-4 rounded-2xl placeholder:text-slate-500 focus:outline-none resize-none text-right" />
                    </div>
                    <button onClick={() => handleSubmit(task.id)} disabled={!submitFile || submitting === task.id}
                      className="w-full text-white py-4 rounded-2xl font-bold transition-all shadow-lg disabled:opacity-30 disabled:shadow-none"
                      style={{ backgroundColor: primaryColor }}>
                      {submitting === task.id ? "جاري الإرسال..." : "تسليم المهمة الآن"}
                    </button>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <div className="flex items-center gap-4">
                        <span>تاريخ التسليم: {new Date(task.submissions[0].createdAt).toLocaleDateString("en-US")}</span>
                        {task.submissions[0].isOnTime !== false ? <span className="text-emerald-400">✓ في الموعد</span> : <span className="text-rose-400">⚠ تسليم متأخر</span>}
                      </div>
                      {!task.submissions[0].letterGrade && (
                        <button 
                          onClick={() => handleDeleteSubmission(task.submissions[0].id)}
                          className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                        >
                          <Icons.Trash2 className="w-3 h-3" />
                          حذف التسليم
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommitteeTasks;
