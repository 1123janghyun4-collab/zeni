import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/zeni/Header";
import FeedItem from "@/components/zeni/FeedItem";
import { Loader2 } from "lucide-react";

export default function MyPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);
  const [myLikedIds, setMyLikedIds] = useState(new Set());

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data: prjs } = await supabase
        .from("projects")
        .select("*")
        .or(`created_by.eq.${user.id},created_by_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);
      setProjects(prjs || []);

      const { data: likes } = await supabase
        .from("likes")
        .select("project_id")
        .eq("user_id", user.id);
      setMyLikedIds(new Set((likes || []).map((l) => l.project_id)));
    } catch (err) {
      console.warn("MyPage load error:", err);
      setProjects([]);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async (project) => {
    const liked = myLikedIds.has(project.id);
    try {
      if (liked) {
        await supabase.from("likes").delete().match({ project_id: project.id, user_id: user.id });
        const newLikes = Math.max((project.likes_count || 0) - 1, 0);
        await supabase.from("projects").update({ likes_count: newLikes }).eq("id", project.id);
        setMyLikedIds((prev) => {
          const next = new Set(prev);
          next.delete(project.id);
          return next;
        });
        setProjects((prev) =>
          (prev || []).map((p) => (p.id === project.id ? { ...p, likes_count: newLikes } : p))
        );
      } else {
        await supabase.from("likes").insert({ project_id: project.id, user_id: user.id });
        const newLikes = (project.likes_count || 0) + 1;
        await supabase.from("projects").update({ likes_count: newLikes }).eq("id", project.id);
        setMyLikedIds((prev) => new Set(prev).add(project.id));
        setProjects((prev) =>
          (prev || []).map((p) => (p.id === project.id ? { ...p, likes_count: newLikes } : p))
        );
      }
    } catch (err) {
      console.error("MyPage toggleLike error:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F4F2] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#1A1A1A]">
      <Header />
      <div className="max-w-[640px] mx-auto px-5 pt-8">
        {/* Profile card */}
        <div className="flex flex-col items-center gap-2 py-8 border-b border-black/5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[24px] font-semibold"
            style={{ background: "#3D5A25" }}
          >
            {(user.full_name || user.email || "Z").charAt(0).toUpperCase()}
          </div>
          <p className="text-[18px] font-bold mt-1">{user.full_name || (user.email ? user.email.split("@")[0] : "zeni")}</p>
          <p className="text-[13px] text-[#6C757D]">@{user.handle || (user.email ? user.email.split("@")[0] : "zeni")}</p>
          {user.bio && <p className="text-[14px] text-[#444] mt-1 text-center max-w-md">{user.bio}</p>}
        </div>

        <h3 className="text-[15px] font-bold mt-6 mb-2">내 아카이브</h3>
        {projects === null ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
          </div>
        ) : projects.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-[#999]">작성한 아카이브가 없어요.</p>
        ) : (
          projects.map((p) => (
            <FeedItem key={p.id} project={p} isLiked={myLikedIds.has(p.id)} onToggleLike={toggleLike} />
          ))
        )}
      </div>
    </div>
  );
}