import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import Header from "@/components/zeni/Header";
import { Eye, MessageCircle, Heart, Loader2, ArrowLeft, Globe, Play, Apple, ExternalLink, Pencil, Trash2, TrendingUp } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function ProjectDetail() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const id = new URLSearchParams(window.location.search).get("id") || window.location.pathname.split("/").pop();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [bumping, setBumping] = useState(false);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const { data: p } = await supabase.from("projects").select("*").eq("id", id).single();
        if (p) {
          const nextViews = (p.views || 0) + 1;
          await supabase.from("projects").update({ views: nextViews }).eq("id", id);
          setProject({ ...p, views: nextViews });
        }
        const { data: c } = await supabase
          .from("comments")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: false })
          .limit(100);
        setComments(c || []);

        if (isAuthenticated && user) {
          const { data: myLike } = await supabase
            .from("likes")
            .select("id")
            .eq("project_id", id)
            .eq("user_id", user.id);
          setIsLiked((myLike || []).length > 0);
        }
      } catch (err) {
        console.warn("ProjectDetail load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated, user]);

  const requireAuth = () => navigate("/login");

  const isAuthor = isAuthenticated && user && (project?.created_by === user.id || project?.created_by_id === user.id);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제할까요?")) return;
    setDeleting(true);
    try {
      await supabase.from("projects").delete().eq("id", id);
      navigate("/");
    } finally {
      setDeleting(false);
    }
  };

  const handleBump = async () => {
    setBumping(true);
    try {
      const now = new Date().toISOString();
      await supabase.from("projects").update({ bumped_at: now }).eq("id", id);
      await supabase.from("activities").insert({
        actor_name: user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni"),
        action_type: "bump",
        project_id: id,
        project_title: project.title,
      });
      setProject({ ...project, bumped_at: now });
    } finally {
      setBumping(false);
    }
  };

  const toggleLike = async () => {
    if (!isAuthenticated) return requireAuth();
    setLiking(true);
    try {
      if (isLiked) {
        await supabase.from("likes").delete().match({ project_id: id, user_id: user.id });
        const newLikes = Math.max((project.likes_count || 0) - 1, 0);
        await supabase.from("projects").update({ likes_count: newLikes }).eq("id", id);
        setIsLiked(false);
        setProject({ ...project, likes_count: newLikes });
      } else {
        await supabase.from("likes").insert({ project_id: id, user_id: user.id });
        const newLikes = (project.likes_count || 0) + 1;
        await supabase.from("projects").update({ likes_count: newLikes }).eq("id", id);
        setIsLiked(true);
        setProject({ ...project, likes_count: newLikes });
        const authorId = project.created_by || project.created_by_id;
        if (authorId && authorId !== user.id) {
          await supabase.from("notifications").insert({
            recipient_id: authorId,
            actor_name: user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni"),
            type: "like",
            project_id: id,
            project_title: project.title,
            read: false,
          });
        }
      }
    } finally {
      setLiking(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) return requireAuth();
    setPosting(true);
    try {
      const { data: created } = await supabase
        .from("comments")
        .insert({
          project_id: id,
          user_id: user.id,
          actor_name: user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni"),
          content: commentText.trim(),
        })
        .select()
        .single();

      if (created) {
        setComments([created, ...comments]);
      }
      setCommentText("");
      const newCommentsCount = (project.comments_count || 0) + 1;
      await supabase.from("projects").update({ comments_count: newCommentsCount }).eq("id", id);
      setProject({ ...project, comments_count: newCommentsCount });

      const authorId = project.created_by || project.created_by_id;
      if (authorId && authorId !== user.id) {
        await supabase.from("notifications").insert({
          recipient_id: authorId,
          actor_name: user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni"),
          type: "comment",
          project_id: id,
          project_title: project.title,
          read: false,
        });
      }
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F2] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F4F4F2] flex items-center justify-center text-[#999]">
        프로젝트를 찾을 수 없어요.
      </div>
    );
  }

  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const lastBump = project.bumped_at ? new Date(project.bumped_at).getTime() : 0;
  const canBump = !lastBump || Date.now() - lastBump >= SEVEN_DAYS;
  const daysLeft = canBump ? 0 : Math.ceil((SEVEN_DAYS - (Date.now() - lastBump)) / (24 * 60 * 60 * 1000));

  const links = [
    { url: project.website_link, icon: Globe, label: "웹사이트" },
    { url: project.play_link, icon: Play, label: "Google Play" },
    { url: project.app_link, icon: Apple, label: "App Store" },
  ].filter((l) => l.url);

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#1A1A1A]">
      <Header />
      <div className="max-w-[760px] mx-auto px-5 pt-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-[#999] hover:text-[#1A1A1A] mb-6">
          <ArrowLeft className="w-4 h-4" /> 목록으로
        </Link>

        {project.image_url && (
          <div className="rounded-xl overflow-hidden border border-black/10 mb-6 bg-black/5 aspect-[16/9]">
            <Image src={project.image_url} alt={project.title} className="w-full h-full" fittingType="fill" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          {project.type === "showcase" && project.status && (
            <span className="px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ background: "#EAEFF7", color: "#001933" }}>
              {project.status}
            </span>
          )}
          <span className="text-[12px] text-[#999]">{project.type === "blog" ? "블로그" : "아카이브"}</span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight">{project.title}</h1>
        {project.subtitle && <p className="text-[16px] text-[#555] mt-2">{project.subtitle}</p>}
        {!project.subtitle && project.description && (
          <p className="text-[15px] text-[#444] mt-3 leading-relaxed whitespace-pre-wrap">{project.description}</p>
        )}

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-6 pb-6 border-b border-black/5">
          <span className="flex items-center gap-1.5 text-[13px] text-[#666]">
            <Eye className="w-4 h-4" /> {project.views || 0}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-[#666]">
            <MessageCircle className="w-4 h-4" /> {project.comments_count || 0}
          </span>
          <button
            onClick={toggleLike}
            disabled={liking}
            className="flex items-center gap-1.5 text-[13px] transition-colors disabled:opacity-50"
            style={{ color: isLiked ? "#3E49FB" : "#666" }}
          >
            <Heart className="w-4 h-4" fill={isLiked ? "#3E49FB" : "none"} /> {project.likes_count || 0}
          </button>
        </div>

        {isAuthor && (
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => navigate(project.type === "blog" ? `/blog/edit/${id}` : `/archive/edit/${id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 text-[13px] text-[#333] hover:border-[#3E49FB] hover:text-[#3E49FB] transition-colors"
            >
              <Pencil className="w-4 h-4" /> 수정
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 text-[13px] text-[#333] hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> {deleting ? "삭제 중..." : "삭제"}
            </button>
            {project.type === "showcase" && (
              <button
                onClick={handleBump}
                disabled={!canBump || bumping}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors disabled:cursor-not-allowed"
                style={{ background: canBump ? "#041f3b" : "#e0e0e0", color: canBump ? "#fff" : "#999" }}
                title={canBump ? "최상단으로 끌어올리기" : `${daysLeft}일 후 가능해요`}
              >
                <TrendingUp className="w-4 h-4" /> {canBump ? "끌어올리기" : `D-${daysLeft}`}
              </button>
            )}
          </div>
        )}

        {/* Rich content */}
        {project.content && (
          <div className="ql-snow mt-6">
            <div className="ql-editor px-0 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: project.content }} />
          </div>
        )}

        {/* Detail images */}
        {project.detail_images && project.detail_images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3">
            {project.detail_images.map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-black/10 bg-black/5">
                <Image src={img} alt={`설명 이미지 ${i + 1}`} className="w-full" fittingType="fit" />
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 text-[13px] text-[#333] hover:border-[#3E49FB] hover:text-[#3E49FB] transition-colors"
              >
                <l.icon className="w-4 h-4" /> {l.label} <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        )}

        {/* Members */}
        {project.members && project.members.length > 0 && (
          <div className="mt-8">
            <p className="text-[13px] font-semibold text-[#666] mb-2">팀원</p>
            <div className="flex flex-wrap gap-2">
              {project.members.map((m, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white border border-black/10 text-[13px] text-[#333]">
                  @{m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <section className="mt-10">
          <h3 className="text-[15px] font-bold mb-4">댓글 {comments.length}</h3>
          <form onSubmit={submitComment} className="mb-6">
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAuthenticated ? "댓글을 입력하세요" : "로그인 후 댓글 작성 가능해요"}
                className="flex-1 px-4 py-3 rounded-lg border border-black/10 text-[14px] focus:outline-none focus:border-[#3E49FB]"
              />
              <button
                type="submit"
                disabled={posting}
                className="px-5 py-3 rounded-lg bg-[#1A1A1A] text-white text-[14px] font-medium hover:bg-[#3E49FB] transition-colors disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "등록"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.length === 0 && <p className="text-[13px] text-[#999] py-4">아직 댓글이 없어요.</p>}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-[12px] flex-shrink-0">
                  {(c.created_by_id || "Z").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-semibold">{(c.created_by_id || "zeni").slice(0, 6)}</p>
                  <p className="text-[14px] text-[#333] mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}