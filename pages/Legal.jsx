import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/zeni/Header";

const CONTENT = {
  about: {
    title: "zeni 소개",
    body: [
      "zeni는 크리에이터가 자신의 작업을 기록하고, 서로의 과정을 들여다보는 곳입니다.",
      "아카이브로 프로젝트를 정리하고, 블로그로 생각을 흐르듯 적어요. 화려한 결과보다 진짜 과정이 더 가치 있다고 믿습니다.",
      "누군가의 첫 글에서, 다른 누군가의 열 번째 끌어올리기에서, 영감은 자라납니다. zeni는 그 연결이 일어나는 자리입니다.",
    ],
  },
  contact: {
    title: "문의하기",
    body: [
      "궁금한 점이나 제안이 있다면 편하게 연락해주세요.",
      "연락처: 010-7592-3029",
      "평일 기준 2~3일 내에 답변드리려 합니다.",
    ],
  },
  guidelines: {
    title: "커뮤니티 가이드라인",
    body: [
      "서로의 작업을 존중하세요. 비교보다 응원을 먼저.",
      "과장 없이, 있는 그대로를 기록합니다.",
      "타인의 작업을 무단으로 가져오지 않습니다.",
      "댓글과 하트는 작게지만 큰 응원이 됩니다.",
      "갈등이 생기면 대화로, 그래도 어렵다면 언제든 신고해주세요.",
    ],
  },
  collab: {
    title: "협업문의",
    body: [
      "zeni와 함께 프로젝트를 진행하고 싶다면, 010-7592-3029로 프로젝트 개요와 일정을 문의해주세요.",
      "브랜드 아카이브, 콘텐츠 협업, 크리에이티브 파트너십을 열어둡니다.",
      "간단한 소개서나 참고 링크를 함께 보내주시면 더 빠르게 답변드릴 수 있어요.",
    ],
  },
  terms: {
    title: "이용약관",
    body: [
      "본 약관은 zeni(이하 '서비스')의 이용 조건을 안내합니다.",
      "1. 회원은 자신의 콘텐츠에 대한 권리와 책임을 가집니다.",
      "2. 타인의 콘텐츠를 무단으로 복제·전송하는 행위를 금합니다.",
      "3. 서비스는 운영상 필요한 경우 사전 안내 후 변경할 수 있습니다.",
      "4. 약관 위반 활동은 사전 통보 없이 제한될 수 있습니다.",
      "5. 서비스 이용 중 발생한 문제는 운영 정책에 따라 조정합니다.",
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    body: [
      "zeni는 이용자의 개인정보를 안전하게 다룹니다.",
      "1. 수집 항목: 이메일, 닉네임, 프로필 정보 등 회원가입에 필요한 최소 정보.",
      "2. 이용 목적: 회원 식별, 콘텐츠 제공, 알림 발송.",
      "3. 보관: 회원 탈퇴 시까지 보관하며, 탈퇴 즉시 삭제합니다.",
      "4. 제3자 제공: 이용자 동의 없이 개인정보를 제공하지 않습니다.",
      "5. 문의: 개인정보 관련 문의는 010-7592-3029로 연락해주세요.",
    ],
  },
};

export default function Legal() {
  const { slug } = useParams();
  const content = CONTENT[slug] || { title: "안내", body: ["내용 준비 중입니다."] };

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#1A1A1A]">
      <Header />
      <div className="max-w-[760px] mx-auto px-5 pt-8 pb-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-[#999] hover:text-[#1A1A1A] mb-6">
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>
        <h1 className="text-[28px] font-bold tracking-tight">{content.title}</h1>
        <div className="mt-6 space-y-4">
          {content.body.map((p, i) => (
            <p key={i} className="text-[15px] text-[#444] leading-relaxed whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}