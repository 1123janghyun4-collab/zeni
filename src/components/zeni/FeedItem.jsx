import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, MessageCircle, Heart, TrendingUp } from "lucide-react";
import { Image } from "@/components/ui/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

export default function FeedItem({ project, isLiked, onToggleLike }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [liking, setLiking] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(project.upvotes_count || 0);
  const [upvoting, setUpvoting] = useState(false);

  const handleHeart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    try {
      await onToggleLike(project);
    } finally {
      setLiking(false);
    }
  };

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate("/login");
    if (upvoting) return;
    setUpvoting(true);
    try {
      const newUpvoted = !upvoted;
      setUpvoted(newUpvoted);
      const newCount = newUpvoted ? upvotes + 1 : Math.max(upvotes - 1, 0);
      setUpvotes(newCount);
      await supabase
        .from("projects")
        .update({ upvotes_count: newCount })
        .eq("id", project.id);
    } catch (err) {
      console.warn("Upvote error:", err);
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4">
      <Link to={`/project/${project.id}`} className="block group">
        {project.image_url && (
          <div className="aspect-[16/9] bg-[#F7F8FA] overflow-hidden">
            <Image src={project.image_url} alt={project.title} className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300" fittingType="fill" />
          </div>
        )}
        <div className="px-5 py-4">
          <h3 className="text-[16px] font-bold text-[#1A1A1A] group-hover:text-[#333] transition-colors line-clamp-1">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-[13px] text-[#8B95A1] mt-1.5 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
      </Link>

      {/* Stats + Actions row */}
      <div className="flex items-center gap-2 px-5 pb-4">
        {/* Upvote button */}
        <button
          onClick={handleUpvote}
          disabled={upvoting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50 ${
            upvoted
              ? "bg-[#1A1A1A] text-white"
              : "bg-[#F7F8FA] text-[#555] hover:bg-[#EBEBEB]"
          }`}
          aria-label="업보트"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          업보트 {upvotes > 0 && <span>{upvotes}</span>}
        </button>

        {/* Heart */}
        <button
          onClick={handleHeart}
          disabled={liking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50 ${
            isLiked
              ? "text-[#FF4D4F]"
              : "bg-[#F7F8FA] text-[#555] hover:bg-[#EBEBEB]"
          }`}
          aria-label="좋아요"
        >
          <Heart className="w-3.5 h-3.5" fill={isLiked ? "#FF4D4F" : "none"} stroke={isLiked ? "#FF4D4F" : "currentColor"} />
          {(project.likes_count || 0) > 0 && <span>{project.likes_count}</span>}
        </button>

        {/* Comments link */}
        <Link
          to={`/project/${project.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#F7F8FA] text-[#555] hover:bg-[#EBEBEB] transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          댓글 {(project.comments_count || 0) > 0 && <span>{project.comments_count}</span>}
        </Link>

        {/* Views - pushed right */}
        <span className="flex items-center gap-1 text-[12px] text-[#B0B8C1] ml-auto">
          <Eye className="w-3.5 h-3.5" /> {project.views || 0}
        </span>
      </div>
    </article>
  );
}