import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/zeni/Header";
import Footer from "@/components/zeni/Footer";
import FeedItem from "@/components/zeni/FeedItem";
import ActivityItem from "@/components/zeni/ActivityItem";
import FeedPostItem from "@/components/zeni/FeedPostItem";
import FeedPostModal from "@/components/zeni/FeedPostModal";
import { Loader2, Pencil, PlusCircle, Search } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "feed";
  const q = searchParams.get("q") || "";
  const [projects, setProjects] = useState(null);
  const [activities, setActivities] = useState(null);
  const [myLikedIds, setMyLikedIds] = useState(new Set());
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(q);

  const loadFeed = useCallback(async () => {
    try {
      if (tab === "feed") {
        setProjects(null);
        let actQuery = supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(50);
        let postQuery = supabase.from("feed_posts").select("*").order("created_at", { ascending: false }).limit(50);

        if (q) {
          actQuery = actQuery.ilike("project_title", `%${q}%`);
          postQuery = postQuery.ilike("content", `%${q}%`);
        }

        const [actRes, postRes] = await Promise.all([actQuery, postQuery]);
        const acts = (actRes.data || []).map((a) => ({
          ...a,
          created_date: a.created_at,
          _kind: "activity",
        }));
        const posts = (postRes.data || []).map((p) => ({
          ...p,
          created_date: p.created_at,
          _kind: "post",
        }));
        const merged = [...acts, ...posts].sort((a, b) =>
          (b.created_date || "").localeCompare(a.created_date || "")
        );
        setActivities(merged);
      } else {
        setActivities(null);
        let query = supabase
          .from("projects")
          .select("*")
          .eq("type", tab)
          .order("created_at", { ascending: false })
          .limit(50);

        if (q) {
          query = query.ilike("title", `%${q}%`);
        }

        const { data, error } = await query;
        if (error) {
          console.warn("Supabase projects query warning:", error);
          setProjects([]);
        } else {
          setProjects(data || []);
        }
      }
    } catch (err) {
      console.warn("Error loading data from Supabase:", err);
      if (tab === "feed") setActivities([]);
      else setProjects([]);
    }
  }, [tab, q]);

  const loadMyLikes = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setMyLikedIds(new Set());
      return;
    }
    try {
      const { data } = await supabase.from("likes").select("project_id").eq("user_id", user.id);
      setMyLikedIds(new Set((data || []).map((l) => l.project_id)));
    } catch (err) {
      console.warn("Error loading likes:", err);
      setMyLikedIds(new Set());
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    loadMyLikes();
  }, [loadMyLikes]);

  const toggleLike = async (project) => {
    if (!isAuthenticated) return navigate("/login");
    const liked = myLikedIds.has(project.id);
    try {
      if (liked) {
        await supabase.from("likes").delete().match({ project_id: project.id, user_id: user.id });
        const newCount = Math.max((project.likes_count || 0) - 1, 0);
        await supabase.from("projects").update({ likes_count: newCount }).eq("id", project.id);
        setMyLikedIds((prev) => {
          const next = new Set(prev);
          next.delete(project.id);
          return next;
        });
        setProjects((prev) =>
          (prev || []).map((p) => (p.id === project.id ? { ...p, likes_count: newCount } : p))
        );
      } else {
        await supabase.from("likes").insert({ project_id: project.id, user_id: user.id });
        const newCount = (project.likes_count || 0) + 1;
        await supabase.from("projects").update({ likes_count: newCount }).eq("id", project.id);
        setMyLikedIds((prev) => new Set(prev).add(project.id));
        setProjects((prev) =>
          (prev || []).map((p) => (p.id === project.id ? { ...p, likes_count: newCount } : p))
        );
      }
    } catch (err) {
      console.error("Toggle like error:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?tab=${tab}&q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/?tab=${tab}`);
    }
  };

  const getTabTitle = () => {
    switch (tab) {
      case "showcase": return "메이커들의 아카이브";
      case "blog": return "메이커들의 인사이트";
      default: return null;
    }
  };

  const getTabSubtitle = () => {
    switch (tab) {
      case "showcase": return "프로젝트를 아카이빙하고 피드백을 나눠보세요.";
      case "blog": return "메이커들의 경험과 인사이트를 나눠보세요.";
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A1A1A]">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 pb-12 flex gap-8 items-start">

        {/* ── Left Sidebar: Write buttons ── */}
        <aside className="hidden lg:flex flex-col gap-3 w-[200px] shrink-0 sticky top-[80px]">
          <p className="text-[11px] font-semibold text-[#B0B8C1] uppercase tracking-wider mb-1">작성하기</p>
          <button
            onClick={() => {
              if (!isAuthenticated) return navigate("/login");
              setShowFeedModal(true);
            }}
            className="w-full inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#EBEBEB] bg-white text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F0F1F3] transition-colors"
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-[#555]" />
            인덱스 작성하기
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) return navigate("/login");
              navigate("/archive/new");
            }}
            className="w-full inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#EBEBEB] bg-white text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F0F1F3] transition-colors"
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-[#555]" />
            아카이브 작성하기
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) return navigate("/login");
              navigate("/blog/new");
            }}
            className="w-full inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#EBEBEB] bg-white text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F0F1F3] transition-colors"
          >
            <Pencil className="w-4 h-4 shrink-0 text-[#555]" />
            블로그 글쓰기
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          {/* Tab header section */}
          {tab !== "feed" && (
            <div className="mb-6">
              <h1 className="text-[22px] font-bold text-[#1A1A1A]">{getTabTitle()}</h1>
              <p className="text-[14px] text-[#8B95A1] mt-1">{getTabSubtitle()}</p>
            </div>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B8C1]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tab === "feed" ? "인덱스 검색" : tab === "showcase" ? "아카이브 검색" : "검색"}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EBEBEB] bg-white text-[14px] placeholder:text-[#B0B8C1] focus:outline-none focus:border-[#333] transition-colors"
              />
            </div>
          </form>

          {/* Mobile write buttons (shown only on small screens) */}
          <div className="flex lg:hidden gap-2 mb-5 overflow-x-auto pb-1">
            <button
              onClick={() => { if (!isAuthenticated) return navigate("/login"); setShowFeedModal(true); }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EBEBEB] bg-white text-[12px] font-medium text-[#1A1A1A]"
            >
              <PlusCircle className="w-3.5 h-3.5" /> 인덱스
            </button>
            <button
              onClick={() => { if (!isAuthenticated) return navigate("/login"); navigate("/archive/new"); }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EBEBEB] bg-white text-[12px] font-medium text-[#1A1A1A]"
            >
              <PlusCircle className="w-3.5 h-3.5" /> 아카이브
            </button>
            <button
              onClick={() => { if (!isAuthenticated) return navigate("/login"); navigate("/blog/new"); }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EBEBEB] bg-white text-[12px] font-medium text-[#1A1A1A]"
            >
              <Pencil className="w-3.5 h-3.5" /> 블로그
            </button>
          </div>

          {/* Content */}
          <div>
            {tab === "feed" ? (
              activities === null ? (
                <div className="py-24 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#B0B8C1]" />
                </div>
              ) : activities.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F0F1F3] flex items-center justify-center mx-auto mb-4">
                    <PlusCircle className="w-7 h-7 text-[#B0B8C1]" />
                  </div>
                  <p className="text-[15px] text-[#8B95A1] font-medium">아직 등록된 인덱스가 없어요.</p>
                  <p className="text-[13px] text-[#B0B8C1] mt-1">zeni에서 첫 인덱스를 남겨보세요.</p>
                </div>
              ) : (
                activities.map((item) =>
                  item._kind === "post" ? (
                    <FeedPostItem key={item.id} post={item} />
                  ) : (
                    <ActivityItem key={item.id} activity={item} />
                  )
                )
              )
            ) : projects === null ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#B0B8C1]" />
              </div>
            ) : projects.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F0F1F3] flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="w-7 h-7 text-[#B0B8C1]" />
                </div>
                <p className="text-[15px] text-[#8B95A1] font-medium">아직 등록된 아카이브가 없어요.</p>
                <p className="text-[13px] text-[#B0B8C1] mt-1">zeni에서 첫 아카이브를 등록해보세요.</p>
              </div>
            ) : (
              projects.map((p) => (
                <FeedItem key={p.id} project={p} isLiked={myLikedIds.has(p.id)} onToggleLike={toggleLike} />
              ))
            )}
          </div>
        </main>
      </div>
      <Footer />
      <FeedPostModal open={showFeedModal} onClose={() => setShowFeedModal(false)} onCreated={loadFeed} />
    </div>
  );
}