import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
// @ts-ignore
import EmojiPicker, { Theme } from "emoji-picker-react";

interface ChatRoomProps {
  isAdmin?: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ isAdmin = false }) => {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentChannel, setCurrentChannel] = useState<"general" | "department">("general");
  const [msgContent, setMsgContent] = useState("");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChatStatus = async () => {
    try {
      const res = await api.get("/chat/status");
      setChatEnabled(res.data.enabled);
    } catch {}
  };

  const fetchMessages = async () => {
    try {
      const channelId = currentChannel === "department" ? user?.departmentId : "general";
      const res = await api.get(`/chat/${channelId}`);
      setChatMessages(res.data.messages || []);
      fetchChatStatus();
    } catch {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentChannel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    try {
      const channelId = currentChannel === "department" ? user?.departmentId : "general";
      const res = await api.post(`/chat/${channelId}`, { content: msgContent });
      setChatMessages(prev => [...prev, res.data.message]);
      setMsgContent("");
    } catch (e: any) {
      alert("❌ " + (e.response?.data?.message || "Failed to send message"));
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6" dir="ltr">
      <div className="flex items-end justify-between shrink-0">
        <div>
          <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Team Communication</p>
          <h1 className="text-4xl font-bold text-white">Chat</h1>
        </div>
        <div className="flex items-center gap-6">
          {isAdmin && (
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <span className={`w-2 h-2 rounded-full ${chatEnabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Chat: {chatEnabled ? "Enabled" : "Muted"}</span>
              <button 
                onClick={async () => {
                  try {
                    const res = await api.post("/chat/status", { enabled: !chatEnabled });
                    setChatEnabled(res.data.enabled);
                  } catch {}
                }}
                className={`ml-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  chatEnabled ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                }`}
              >
                {chatEnabled ? "Mute All" : "Unmute All"}
              </button>
            </div>
          )}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setCurrentChannel("general")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${currentChannel === "general" ? "bg-primary text-white shadow-glow" : "text-slate-400 hover:text-white"}`}
          >
            General
          </button>
          <button 
            onClick={() => setCurrentChannel("department")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${currentChannel === "department" ? "bg-primary text-white shadow-glow" : "text-slate-400 hover:text-white"}`}
          >
            {user?.role === "ADMIN" ? "Committee Chat" : "My Department"}
          </button>
        </div>
        </div>
      </div>

      <div className="flex-1 bg-white/5 border border-white/5 rounded-[40px] flex flex-col overflow-hidden backdrop-blur-md">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col scroll-smooth">
          {chatMessages.map((msg) => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 shrink-0 overflow-hidden">
                  {msg.user?.profilePicture ? (
                    <img src={`${api.defaults.baseURL?.replace("/api", "")}${msg.user.profilePicture}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">{msg.user?.name?.charAt(0)}</div>
                  )}
                </div>
                <div className={`max-w-[70%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400">{msg.user?.name} {msg.user?.role === "ADMIN" && "👑"}</span>
                    <span className="text-[10px] font-bold text-slate-600">{new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-white rounded-tr-none shadow-glow" : "bg-white/5 text-foreground rounded-tl-none border border-white/5"}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div className="relative p-6 bg-slate-900/50 border-t border-white/5">
          {showEmojiPicker && (
            <div className="absolute bottom-full right-6 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
              <EmojiPicker 
                onEmojiClick={(emojiData: any) => {
                  setMsgContent(prev => prev + emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
                theme={Theme.DARK}
              />
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
            <button 
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-14 h-14 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-all"
            >
              <Icons.Smile className="w-6 h-6" />
            </button>
            <input 
              type="text" 
              value={msgContent}
              onChange={e => setMsgContent(e.target.value)}
              disabled={!chatEnabled && !isAdmin}
              placeholder={chatEnabled || isAdmin ? "Type your message here..." : "🚫 Chat is disabled by admin"}
              className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              className="w-14 h-14 bg-primary hover:bg-primary-light text-white rounded-2xl flex items-center justify-center shadow-glow transition-all active:scale-90"
            >
              <Icons.Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
