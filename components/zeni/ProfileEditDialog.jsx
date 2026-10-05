import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { X, Loader2 } from "lucide-react";

export default function ProfileEditDialog({ open, onClose }) {
  const { user, updateProfile, checkUserAuth } = useAuth();
  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setFullName(user.full_name || "");
      setHandle((user.handle || (user.email ? user.email.split("@")[0] : "")).replace(/^@/, ""));
      setBio(user.bio || "");
    }
  }, [open, user]);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanHandle = handle.trim().replace(/^@/, "");
      await updateProfile({
        full_name: fullName.trim(),
        handle: cleanHandle,
        bio: bio.trim(),
      });
      await checkUserAuth();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-[360px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold">프로필 관리</h3>
          <button onClick={onClose} className="text-[#999] hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#666]">이름</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-black/10 text-[14px] focus:outline-none focus:border-[#3E49FB]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#666]">핸들</label>
            <div className="flex items-center mt-1 rounded-lg border border-black/10 focus-within:border-[#3E49FB]">
              <span className="pl-3 text-[14px] text-[#999]">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, ""))}
                placeholder="handle"
                className="flex-1 px-1 py-2.5 text-[14px] focus:outline-none bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#666]">소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="간단한 소개"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-black/10 text-[14px] resize-none focus:outline-none focus:border-[#3E49FB]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-white text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "#051C33" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}