import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Bell, Heart, MessageCircle, Check } from "lucide-react";

export default function NotificationsMenu() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!error && data) {
        setNotifications(data);
        setUnread(data.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.warn("Notifications load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_id", user.id)
        .eq("read", false);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) {
      console.warn("Mark all read error:", err);
    }
  };

  const handleClick = async (n) => {
    try {
      if (!n.read) {
        await supabase.from("notifications").update({ read: true }).eq("id", n.id);
      }
    } catch (err) {
      console.warn("Notification read update error:", err);
    }
    setOpen(false);
    navigate(`/project/${n.project_id}`);
    load();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="알림"
        onClick={() => setOpen((s) => !s)}
        className="relative text-[#333] hover:text-[#1A1A1A] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#FF4D4F] text-white text-[10px] font-semibold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] rounded-2xl border border-[#EBEBEB] bg-white shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 h-12 border-b border-[#EBEBEB]">
            <p className="text-[14px] font-bold text-[#1A1A1A]">알림</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[12px] text-[#333] hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> 모두 읽음
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-[#B0B8C1]">새 알림이 없어요.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#F7F8FA] transition-colors border-b border-[#F0F1F3] ${
                    !n.read ? "bg-[#F7F8FA]" : ""
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: n.read ? "#F0F1F3" : "#1A1A1A" }}
                  >
                    {n.type === "like" ? (
                      <Heart className={`w-4 h-4 ${n.read ? "text-[#B0B8C1]" : "text-white"}`} fill="currentColor" />
                    ) : (
                      <MessageCircle className={`w-4 h-4 ${n.read ? "text-[#B0B8C1]" : "text-white"}`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[#333]">
                      <span className="font-semibold text-[#1A1A1A]">{n.actor_name || "zeni"}</span>
                      님이 회원님의 프로젝트에{" "}
                      {n.type === "like" ? "하트를 눌렀어요" : "댓글을 남겼어요"}.
                    </p>
                    <p className="text-[12px] text-[#B0B8C1] mt-0.5 truncate">{n.project_title}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#FF4D4F] flex-shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}