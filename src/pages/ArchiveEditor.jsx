import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { uploadPublicFile } from "@/lib/storage";
import { useAuth } from "@/lib/AuthContext";
import RichTextEditor from "@/components/zeni/RichTextEditor";
import { Image } from "@/components/ui/image";
import { ArrowLeft, Loader2, X, Globe, Play, Apple, Search, ImagePlus, Box } from "lucide-react";

const STATUS_OPTIONS = ["서비스 중", "개발 중", "기획 중", "종료"];

export default function ArchiveEditor() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [status, setStatus] = useState("서비스 중");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [detailImages, setDetailImages] = useState([]);
  const [websiteLink, setWebsiteLink] = useState("");
  const [playLink, setPlayLink] = useState("");
  const [appLink, setAppLink] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingDetails, setUploadingDetails] = useState(false);
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
          setSubtitle(p.subtitle || "");
          setStatus(p.status || "서비스 중");
          setImageUrl(p.image_url || "");
          setContent(p.content || "");
          setDetailImages(p.detail_images || []);
          setWebsiteLink(p.website_link || "");
          setPlayLink(p.play_link || "");
          setAppLink(p.app_link || "");
          setMembers(p.members || []);
        }
      } catch (err) {
        console.warn("Archive fetch error:", err);
      }
    })();
  }, [editing, id]);

  const uploadMain = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const publicUrl = await uploadPublicFile(file);
      setImageUrl(publicUrl);
    } catch (err) {
      console.error("Main image upload failed:", err);
    } finally {
      setUploadingMain(false);
    }
  };

  const uploadDetails = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - detailImages.length;
    const toUpload = files.slice(0, remaining);
    setUploadingDetails(true);
    try {
      const urls = [];
      for (const f of toUpload) {
        const url = await uploadPublicFile(f);
        urls.push(url);
      }
      setDetailImages((prev) => [...prev, ...urls].slice(0, 5));
    } catch (err) {
      console.error("Detail images upload failed:", err);
    } finally {
      setUploadingDetails(false);
    }
  };

  const addMember = (e) => {
    e.preventDefault();
    const v = memberInput.trim().replace(/^@/, "");
    if (!v || members.includes(v)) return;
    setMembers([...members, v]);
    setMemberInput("");
  };

  const submit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: subtitle.trim(),
        image_url: imageUrl,
        content,
        type: "showcase",
        status,
        detail_images: detailImages,
        website_link: websiteLink.trim(),
        play_link: playLink.trim(),
        app_link: appLink.trim(),
        members,
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
            action_type: "create_archive",
            project_id: projectId,
            project_title: title.trim(),
          });
        }
      }
      navigate(`/project/${projectId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const links = [
    { url: websiteLink, icon: Globe, label: "웹사이트" },
    { url: playLink, icon: Play, label: "Google Play" },
    { url: appLink, icon: Apple, label: "App Store" },
  ].filter((l) => l.url);

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-black/10">
        <div className="max-w-[860px] mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[14px] text-[#333] hover:text-black">
            <ArrowLeft className="w-4 h-4" /> 나가기
          </button>
          <p className="text-[15px] font-semibold">{editing ? "프로젝트 수정하기" : "프로젝트 등록하기"}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(true)}
              className="px-3 py-1.5 rounded-lg border border-[#ccc] text-[13px] text-[#333] hover:bg-[#f7f7f7]"
            >
              미리보기
            </button>
            <button
              onClick={submit}
              disabled={submitting || !title.trim()}
              className="px-4 py-1.5 rounded-lg text-white text-[13px] font-medium disabled:opacity-50 flex items-center gap-1.5"
              style={{ background: "#001933" }}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {editing ? "수정하기" : "등록하기"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-5 py-8 space-y-7">
        {/* Title */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">
            프로젝트 이름 <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="프로젝트 이름을 적어주세요."
            className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-[#ccc] text-[15px] focus:outline-none focus:border-[#3E49FB]"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">
            한 줄 소개 <span className="text-red-500">*</span>
          </label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="프로젝트 한 줄로 소개해주세요."
            className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-[#ccc] text-[15px] focus:outline-none focus:border-[#3E49FB]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">진행 상태</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-[#ccc] text-[15px] bg-white focus:outline-none focus:border-[#3E49FB]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Representative image */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">대표 이미지</label>
          <p className="text-[12px] text-[#999] mt-0.5">프로덕트의 얼굴! 대표 이미지를 설정해주세요.</p>
          <div className="mt-2 flex items-start gap-3">
            <label className="shrink-0 px-4 py-2 rounded-lg text-white text-[13px] font-medium cursor-pointer" style={{ background: "#001933" }}>
              사진 선택
              <input type="file" accept="image/*" onChange={uploadMain} className="hidden" disabled={uploadingMain} />
            </label>
            <div className="flex-1 aspect-[16/9] rounded-lg border border-[#ccc] bg-[#f7f7f7] overflow-hidden flex items-center justify-center">
              {uploadingMain ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
              ) : imageUrl ? (
                <Image src={imageUrl} alt="대표 이미지" className="w-full h-full" fittingType="fill" />
              ) : (
                <Box className="w-10 h-10 text-[#ccc]" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">상세 설명</label>
          <div className="mt-1.5">
            <RichTextEditor value={content} onChange={setContent} placeholder="프로젝트에 대한 자세한 설명을 적어주세요..." minHeight={260} />
          </div>
        </div>

        {/* Detail images */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">상세 설명 이미지</label>
          <p className="text-[12px] text-[#999] mt-0.5">
            프로덕트의 스크린샷 또는 관련 설명 이미지가 있다면 추가해주세요. (최대 5장) 추천 사이즈 : 1600 x 900
          </p>
          <label className="mt-2 flex flex-col items-center justify-center gap-1.5 py-8 rounded-lg border border-dashed border-[#ccc] cursor-pointer hover:border-[#3E49FB] transition-colors">
            {uploadingDetails ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#999]" />
            ) : (
              <ImagePlus className="w-6 h-6 text-[#999]" />
            )}
            <span className="text-[13px] text-[#999]">{uploadingDetails ? "업로드 중..." : "이미지 업로드"}</span>
            <input type="file" accept="image/*" multiple onChange={uploadDetails} className="hidden" disabled={uploadingDetails || detailImages.length >= 5} />
          </label>
          {detailImages.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {detailImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#ccc] bg-[#f7f7f7]">
                  <Image src={img} alt={`상세 ${i + 1}`} className="w-full h-full" fittingType="fill" />
                  <button
                    type="button"
                    onClick={() => setDetailImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project links */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">프로젝트 링크</label>
          <div className="mt-1.5 space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ccc]">
              <Globe className="w-4 h-4 text-[#999]" />
              <input value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="웹사이트 링크" className="flex-1 text-[14px] focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ccc]">
              <Play className="w-4 h-4 text-[#999]" />
              <input value={playLink} onChange={(e) => setPlayLink(e.target.value)} placeholder="Google Play 링크" className="flex-1 text-[14px] focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ccc]">
              <Apple className="w-4 h-4 text-[#999]" />
              <input value={appLink} onChange={(e) => setAppLink(e.target.value)} placeholder="App Store 링크" className="flex-1 text-[14px] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Team members */}
        <div>
          <label className="text-[13px] font-medium text-[#333]">팀원 등록</label>
          <p className="text-[12px] text-[#999] mt-0.5">프로젝트를 같이 만든 팀원이 있다면 추가해주세요.</p>
          <form onSubmit={addMember} className="mt-1.5 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ccc]">
            <Search className="w-4 h-4 text-[#999]" />
            <input
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              placeholder="닉네임 또는 프로필네임을 검색해보세요."
              className="flex-1 text-[14px] focus:outline-none"
            />
          </form>
          {members.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((m) => (
                <span key={m} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f7f7f7] border border-[#ccc] text-[13px] text-[#333]">
                  @{m}
                  <button type="button" onClick={() => setMembers((prev) => prev.filter((x) => x !== m))} className="text-[#999] hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-white border-t border-black/10">
        <div className="max-w-[860px] mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2.5 rounded-lg border border-[#ccc] text-[14px] text-[#333] hover:bg-[#f7f7f7]">
            취소
          </button>
          <button
            onClick={submit}
            disabled={submitting || !title.trim()}
            className="flex-1 py-2.5 rounded-lg text-white text-[14px] font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ background: "#001933" }}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {editing ? "수정하기" : "등록하기"}
          </button>
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
            <div className="px-6 py-6">
              {imageUrl && (
                <div className="rounded-xl overflow-hidden mb-4 aspect-[16/9] bg-[#f7f7f7]">
                  <Image src={imageUrl} alt={title} className="w-full h-full" fittingType="fill" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ background: "#EAEFF7", color: "#001933" }}>
                  {status}
                </span>
                <span className="text-[12px] text-[#999]">아카이브</span>
              </div>
              <h1 className="text-[26px] font-bold">{title || "제목 없음"}</h1>
              {subtitle && <p className="text-[16px] text-[#555] mt-2">{subtitle}</p>}
              {content && (
                <div className="ql-snow mt-4">
                  <div className="ql-editor px-0 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}
              {detailImages.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {detailImages.map((img, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-[#f7f7f7]">
                      <Image src={img} alt={`상세 ${i + 1}`} className="w-full" fittingType="fit" />
                    </div>
                  ))}
                </div>
              )}
              {links.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {links.map((l) => (
                    <span key={l.label} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#ccc] text-[13px] text-[#333]">
                      <l.icon className="w-4 h-4" /> {l.label}
                    </span>
                  ))}
                </div>
              )}
              {members.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {members.map((m) => (
                    <span key={m} className="px-3 py-1 rounded-full bg-[#f7f7f7] border border-[#ccc] text-[13px]">@{m}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}