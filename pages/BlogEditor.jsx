import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import RichTextEditor from "@/components/zeni/RichTextEditor";
import { ArrowLeft, Loader2, Eye, X } from "lucide-react";

export default function BlogEditor() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const { data: p } = await supabase.from("projects").select("*").eq("id", id).single();
        if (p) {
          setTitle(p.title || "");
          setContent(p.content || "");
        }
      } catch (err) {
        console.warn("Blog fetch error:", err);
      }
    })();
  }, [editing, id]);

  const excerpt = (html) => {
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 120);
  };

  const publish = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: excerpt(content),
        content,
        type: "blog",
        created_by: user?.id,
      };
      let projectId = id;
      if (editing) {
        await supabase.from("projects").update(payload).eq("id", id);
      } else {
        const { data: created } = await supabase
          .from("projects")
          .insert({
            ...payload,
            views: 0,
            likes_count: 0,
            comments_count: 0,
          })
          .select()
          .single();

        projectId = created?.id || "";
        if (projectId) {
          await supabase.from("activities").insert({
            actor_name: user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni"),
            action_type: "create_blog",
            project_id: projectId,
            project_title: title.trim(),
          });
        }
      }
      navigate(`/project/${projectId}`);
    } catch (err) {
      console.error("Blog publish error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-black/10">
        <div className="max-w-[860px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[14px] text-[#333] hover:text-black">
              <ArrowLeft className="w-4 h-4" /> 나가기
            </button>
            <span className="text-[15px] font-semibold">글쓰기</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[12px] text-[#999]">작성 내용은 이 기기에 자동 저장돼요</span>
            <button
              onClick={() => setPreview(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ccc] text-[13px] text-[#333] hover:bg-[#f7f7f7]"
            >
              <Eye className="w-3.5 h-3.5" /> 미리보기
            </button>
            <button
              onClick={publish}
              disabled={submitting || !title.trim()}
              className="px-4 py-1.5 rounded-lg text-white text-[13px] font-medium disabled:opacity-50 flex items-center gap-1.5"
              style={{ background: "#001A33" }}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {editing ? "수정하기" : "발행하기"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-5 py-10">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full text-[36px] font-bold placeholder:text-[#C0C0C0] focus:outline-none"
        />
        <div className="mt-6">
          <RichTextEditor value={content} onChange={setContent} placeholder="오늘 어떤 일이 있었나요? 편하게 적어보세요." minHeight={420} />
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-auto p-4">
          <div className="max-w-[640px] w-full bg-white rounded-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between px-5 h-12 border-b border-black/10">
              <p className="text-[14px] font-semibold">미리보기</p>
              <button onClick={() => setPreview(false)} className="text-[#999] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-8">
              <h1 className="text-[32px] font-bold">{title || "제목 없음"}</h1>
              {content && (
                <div className="ql-snow mt-5">
                  <div className="ql-editor px-0 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}