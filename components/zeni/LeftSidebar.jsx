import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Image } from "@/components/ui/image";

export default function LeftSidebar() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "feed";

  return (
    <aside className="hidden lg:block w-[260px] flex-shrink-0">
      <div className="sticky top-[112px] space-y-6">
        {/* Weekly Pick Card */}
        <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#EBEBEB]">
            <p className="text-[13px] font-bold text-[#1A1A1A]">이 주의 zeni Pick</p>
          </div>
          <Link to="/?tab=showcase" className="block group">
            <div className="aspect-[4/3] bg-[#F7F8FA] relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center mb-3">
                  <img src="/logo.png" alt="" className="w-6 h-6 invert" />
                </div>
                <p className="text-[15px] font-bold text-[#1A1A1A] text-center">zeni</p>
                <p className="text-[12px] text-[#8B95A1] mt-1 text-center">메이커들의 사이드프로젝트</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Tagline */}
        <div className="px-1">
          <p className="text-[13px] text-[#8B95A1] leading-relaxed">
            주체적인 삶으로 가득한 세상,
            <br />
            zeni 메이커들과 함께해요.
          </p>
          <p className="text-[11px] text-[#B0B8C1] mt-3">ⓒ 2026. zeni</p>
        </div>
      </div>
    </aside>
  );
}