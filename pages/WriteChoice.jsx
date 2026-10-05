import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/zeni/Header";
import { PlusCircle, Pencil, ArrowLeft } from "lucide-react";

export default function WriteChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#1A1A1A]">
      <Header />
      <div className="max-w-[640px] mx-auto px-5 pt-10">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#999] hover:text-[#1A1A1A] mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> 뒤로
        </button>

        <h1 className="text-[24px] font-bold tracking-tight mb-2">무엇을 작성할까요?</h1>
        <p className="text-[14px] text-[#999] mb-8">작성할 항목을 선택해주세요.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/archive/new")}
            className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl text-white hover:opacity-90 transition-opacity"
            style={{ background: "#051930" }}
          >
            <PlusCircle className="w-7 h-7" />
            <span className="text-[16px] font-semibold">내 프로젝트 등록하기</span>
            <span className="text-[12px] opacity-70">아카이브</span>
          </button>

          <button
            onClick={() => navigate("/blog/new")}
            className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl text-white hover:opacity-90 transition-opacity"
            style={{ background: "#041f3b" }}
          >
            <Pencil className="w-7 h-7" />
            <span className="text-[16px] font-semibold">글쓰기</span>
            <span className="text-[12px] opacity-70">블로그</span>
          </button>
        </div>
      </div>
    </div>
  );
}