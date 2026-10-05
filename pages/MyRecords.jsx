import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/zeni/Header";
import FeedItem from "@/components/zeni/FeedItem";
import { Loader2 } from "lucide-react";

export default function MyRecords() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data: likes } = await supabase
        .from("likes")
        .select("project_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);

      const ids = (likes || []).map((l) => l.project_id);
      if (ids.length === 0) {
        setProjects([]);
        return;
      }
      const { data: prjs } = await supabase
        .from("projects")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false })
        .limit(50);

      setProjects(prjs || []);
    } catch (err) {
      console.warn("MyRecords load error:", err);
      setProjects([]);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async (project) => {
    try {
      await supabase.from("likes").delete().match({ project_id: project.id, user_id: user.id });
      const newLikes = Math.max((project.likes_count || 0) - 1, 0);
      await supabase.from("projects").update({ likes_count: newLikes }).eq("id", project.id);
      setProjects((prev) => (prev || []).filter((p) => p.id !== project.id));
    } catch (err) {
      console.error("MyRecords toggleLike error:", err);
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
        <h3 className="text-[15px] font-bold mb-2">내 기록 — 좋아요한 아카이브</h3>
        {projects === null ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
          </div>
        ) : projects.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-[#999]">좋아요한 아카이브가 없어요.</p>
        ) : (
          projects.map((p) => (
            <FeedItem key={p.id} project={p} isLiked={true} onToggleLike={toggleLike} />
          ))
        )}
      </div>
    </div>
  );
}