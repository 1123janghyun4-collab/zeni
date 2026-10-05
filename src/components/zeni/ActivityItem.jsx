import React from "react";
import { Link } from "react-router-dom";
import { FilePlus, PenLine, TrendingUp } from "lucide-react";

const ACTION_TEXT = {
  create_archive: "님이 아카이브를 작성했어요",
  create_blog: "님이 블로그 글을 발행했어요",
  bump: "님이 아카이브를 끌어올렸어요",
};

const ACTION_ICON = {
  create_archive: FilePlus,
  create_blog: PenLine,
  bump: TrendingUp,
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return `${Math.floor(d / 30)}달 전`;
}

export default function ActivityItem({ activity }) {
  const Icon = ACTION_ICON[activity.action_type] || FilePlus;
  const name = activity.actor_name || "zeni";

  return (
    <article className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm mb-4 px-5 py-4">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0"
          style={{ background: "#1A1A1A" }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px]">
              <span className="font-semibold text-[#1A1A1A]">{name}</span>
              <span className="text-[#8B95A1]">{ACTION_TEXT[activity.action_type]}</span>
            </p>
          </div>
          <p className="text-[12px] text-[#B0B8C1] mt-0.5">
            {timeAgo(activity.created_date)}
          </p>
          <Link
            to={`/project/${activity.project_id}`}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#EBEBEB] px-4 py-2.5 hover:border-[#333] transition-colors max-w-full bg-[#FAFAFA]"
          >
            <Icon className="w-4 h-4 text-[#1A1A1A] flex-shrink-0" />
            <span className="text-[14px] font-medium text-[#1A1A1A] truncate">
              {activity.project_title || "프로젝트"}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}