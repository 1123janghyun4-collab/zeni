import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, User, LogOut, Settings, BookmarkCheck, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import ProfileEditDialog from "@/components/zeni/ProfileEditDialog";
import NotificationsMenu from "@/components/zeni/NotificationsMenu";
import Logo from "@/components/zeni/Logo";

const NAV_TABS = [
  { key: "feed", label: "인덱스" },
  { key: "showcase", label: "아카이브" },
  { key: "blog", label: "블로그" },
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const active = searchParams.get("tab") || "feed";
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleProfile = () => {
    if (isAuthenticated) setShowMenu((s) => !s);
    else navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#EBEBEB]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Top row: logo + actions */}
          <div className="flex items-center justify-between h-[56px]">
            {/* Left: hamburger (mobile) + logo */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-[#333] hover:text-black"
                onClick={() => setShowMobileMenu(true)}
                aria-label="메뉴"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button onClick={() => navigate("/")} className="select-none">
                <Logo />
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <NotificationsMenu />
              {/* Profile */}
              <div className="relative" ref={menuRef}>
                {isAuthenticated ? (
                  <button
                    aria-label="프로필"
                    onClick={handleProfile}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-semibold"
                    style={{ background: "#1A1A1A" }}
                  >
                    {(user?.full_name || user?.email || "Z").charAt(0).toUpperCase()}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-1.5 rounded-full bg-[#1A1A1A] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
                  >
                    로그인
                  </button>
                )}
                {isAuthenticated && showMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#EBEBEB] bg-white shadow-xl overflow-hidden z-50">
                    {/* Profile card */}
                    <div className="flex flex-col items-center gap-1.5 py-5">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[20px] font-semibold"
                        style={{ background: "#1A1A1A" }}
                      >
                        {(user?.full_name || user?.email || "Z").charAt(0).toUpperCase()}
                      </div>
                      <p className="text-[15px] font-bold text-[#1A1A1A] mt-1">
                        {user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni")}
                      </p>
                      <p className="text-[12px] text-[#8B95A1]">
                        @{user?.handle || (user?.email ? user.email.split("@")[0] : "zeni")}
                      </p>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate("/archive/new");
                        }}
                        className="mt-2 px-5 py-2 rounded-lg text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
                        style={{ background: "#1A1A1A" }}
                      >
                        아카이브 작성하기
                      </button>
                    </div>
                    {/* Menu items */}
                    <div className="border-t border-[#EBEBEB] py-1">
                      <button
                        onClick={() => { setShowMenu(false); navigate("/mypage"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#333] hover:bg-[#F7F8FA] transition-colors"
                      >
                        <User className="w-4 h-4" /> 마이페이지
                      </button>
                      <button
                        onClick={() => { setShowMenu(false); setShowEdit(true); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#333] hover:bg-[#F7F8FA] transition-colors"
                      >
                        <Settings className="w-4 h-4" /> 프로필 관리
                      </button>
                      <button
                        onClick={() => { setShowMenu(false); navigate("/records"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#333] hover:bg-[#F7F8FA] transition-colors"
                      >
                        <BookmarkCheck className="w-4 h-4" /> 내 기록
                      </button>
                    </div>
                    <div className="border-t border-[#EBEBEB] py-1">
                      <button
                        onClick={() => { logout(); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#333] hover:bg-[#F7F8FA] transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> 로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation tabs - desktop */}
          <nav className="hidden sm:flex items-center gap-0">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => navigate(`/?tab=${tab.key}`)}
                className={`relative px-4 py-3 text-[15px] font-medium transition-colors ${
                  active === tab.key ? "text-[#1A1A1A]" : "text-[#8B95A1] hover:text-[#333]"
                }`}
              >
                {tab.label}
                {active === tab.key && (
                  <span className="absolute left-4 right-4 -bottom-px h-[2px] bg-[#1A1A1A] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Navigation tabs - mobile */}
          <nav className="sm:hidden flex items-center overflow-x-auto scrollbar-hide -mx-4 px-4">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => navigate(`/?tab=${tab.key}`)}
                className={`relative flex-shrink-0 px-3 py-3 text-[14px] font-medium transition-colors ${
                  active === tab.key ? "text-[#1A1A1A]" : "text-[#8B95A1]"
                }`}
              >
                {tab.label}
                {active === tab.key && (
                  <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-[#1A1A1A] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-xl">
            <div className="flex items-center justify-between h-14 px-4 border-b border-[#EBEBEB]">
              <Logo />
              <button onClick={() => setShowMobileMenu(false)} className="text-[#666]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2">
              {NAV_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setShowMobileMenu(false); navigate(`/?tab=${tab.key}`); }}
                  className={`w-full text-left px-5 py-3 text-[15px] font-medium ${
                    active === tab.key ? "text-[#1A1A1A] bg-[#F7F8FA]" : "text-[#666]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProfileEditDialog open={showEdit} onClose={() => setShowEdit(false)} />
    </>
  );
}