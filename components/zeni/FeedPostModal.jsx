import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadPublicFile } from "@/lib/storage";
import { useAuth } from "@/lib/AuthContext";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function FeedPostModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const name = user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni");

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadPublicFile(file);
      setImageUrl(publicUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!content.trim() && !imageUrl) return;
    setSubmitting(true);
    try {
      await supabase.from("feed_posts").insert({
        content: content.trim(),
        image_url: imageUrl,
        actor_name: name,
        user_id: user?.id || null,
      });
      setContent("");
      setImageUrl("");
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Feed post submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#EBEBEB]">
          <p className="text-[16px] font-bold text-[#1A1A1A]">새 인덱스 작성</p>
          <button onClick={onClose} className="text-[#8B95A1] hover:text-[#333]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[15px] font-semibold flex-shrink-0"
              style={{ background: "#1A1A1A" }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              rows={4}
              placeholder="무슨 생각을 하고 계신가요?"
              className="flex-1 resize-none text-[15px] placeholder:text-[#B0B8C1] focus:outline-none pt-2 leading-relaxed"
            />
          </div>
          {imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[#EBEBEB] bg-[#F7F8FA] max-w-sm relative">
              <Image src={imageUrl} alt="미리보기" className="w-full" fittingType="fit" />
              <button
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#EBEBEB]">
          <label className="cursor-pointer text-[#8B95A1] hover:text-[#333] transition-colors">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" disabled={uploading} />
          </label>
          <button
            onClick={submit}
            disabled={submitting || uploading || (!content.trim() && !imageUrl)}
            className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold disabled:opacity-40 flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333] transition-colors"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} 게시하기
          </button>
        </div>
      </div>
    </div>
  );
}