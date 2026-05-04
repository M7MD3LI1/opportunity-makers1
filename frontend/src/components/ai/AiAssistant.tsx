import React, { useState, useRef, useEffect } from "react";
import api from "../../lib/api";

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AiAssistantProps {
  className?: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "أهلاً! أنا مساعدك الذكي في صناع الفرص 🤖\nيمكنني مساعدتك في: درجاتك، المهام، الشارات، ونصائح تحسين الأداء.\nكيف يمكنني مساعدتك؟", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", text: input.trim(), timestamp: new Date().toISOString() };
    setMessages(p => [...p, userMsg]);
    const q = input.trim();
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { message: q });
      setMessages(p => [...p, { role: "ai", text: res.data.response, timestamp: res.data.timestamp }]);
    } catch {
      setMessages(p => [...p, { role: "ai", text: "عذراً، حدث خطأ. حاول مرة أخرى.", timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = ["ما درجتي؟", "كيف أحسن أدائي؟", "ما الشارات المتاحة؟", "معلومات المستويات"];

  return (
    <div className={`fixed bottom-6 left-6 z-50 ${className}`} dir="rtl">
      {/* Chat Window */}
      {open && (
        <div className="mb-4 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="gradient-primary px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-white font-semibold text-sm">المساعد الذكي</p>
              <p className="text-purple-200 text-xs">متصل الآن</p>
            </div>
            <button onClick={() => setOpen(false)} className="mr-auto text-white/70 hover:text-white text-lg">×</button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-purple-600 text-white rounded-tl-none"
                    : "bg-gray-800 text-gray-100 rounded-tr-none border border-gray-700"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl rounded-tr-none">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Quick replies */}
          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {quickReplies.map(q => (
              <button key={q} onClick={() => { setInput(q); }}
                className="text-xs bg-purple-900/60 border border-purple-700/40 text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-800/60 transition-smooth">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="اكتب رسالتك..."
              className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-xl placeholder-gray-500 focus:outline-none focus:border-purple-500" />
            <button onClick={send} disabled={loading || !input.trim()}
              className="gradient-primary text-white px-3 py-2 rounded-xl disabled:opacity-50 text-sm font-semibold">
              إرسال
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(p => !p)}
        className="gradient-primary text-white w-14 h-14 rounded-full shadow-glow flex items-center justify-center text-2xl hover:scale-110 transition-bounce">
        {open ? "×" : "🤖"}
      </button>
    </div>
  );
};

export default AiAssistant;
