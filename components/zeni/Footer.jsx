import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/zeni/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] border-t border-[#EBEBEB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="select-none">
              <Logo size="sm" />
            </Link>
            <p className="text-[13px] text-[#8B95A1] leading-relaxed max-w-[320px]">
              주체적인 삶으로 가득한 세상,
              <br />
              zeni 메이커들과 함께해요.
            </p>
          </div>

          {/* Links columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-6">
            {/* Column 1 */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[12px] font-semibold text-[#333] uppercase tracking-wider mb-1">서비스</p>
              <Link to="/legal/about" className="text-[13px] text-[#666] hover:text-[#1A1A1A] transition-colors">
                zeni 소개
              </Link>
              <Link to="/legal/contact" className="text-[13px] text-[#666] hover:text-[#1A1A1A] transition-colors">
                문의하기
              </Link>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[12px] font-semibold text-[#333] uppercase tracking-wider mb-1">정책</p>
              <Link to="/legal/guidelines" className="text-[13px] text-[#666] hover:text-[#1A1A1A] transition-colors">
                커뮤니티 가이드라인
              </Link>
              <Link to="/legal/collab" className="text-[13px] text-[#666] hover:text-[#1A1A1A] transition-colors">
                협업문의
              </Link>
              <Link to="/legal/terms" className="text-[13px] text-[#666] hover:text-[#1A1A1A] transition-colors">
                이용약관
              </Link>
              <Link to="/legal/privacy" className="text-[13px] text-[#666] hover:text-[#1A1A1A] transition-colors">
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-[#EBEBEB]">
          <p className="text-[12px] text-[#B0B8C1]">© 2026 zeni. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}