import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { Heart, MessageCircle, TrendingUp, ChevronDown, ChevronUp, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

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

export default function FeedPostItem({ post }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const name = post.actor_name || "zeni";

  const [likes, setLikes] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes_count || 0);
  const [upvoted, setUpvoted] = useState(false);
  const [liking, setLiking] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [loadedComments, setLoadedComments] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login");
    if (liking) return;
    setLiking(true);
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      const newCount = newLiked ? likes + 1 : Math.max(likes - 1, 0);
      setLikes(newCount);
      await supabase
        .from("feed_posts")
        .update({ likes_count: newCount })
        .eq("id", post.id);
    } catch (err) {
      console.warn("Like error:", err);
    } finally {
      setLiking(false);
    }
  };

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login");
    if (upvoting) return;
    setUpvoting(true);
    try {
      const newUpvoted = !upvoted;
      setUpvoted(newUpvoted);
      const newCount = newUpvoted ? upvotes + 1 : Math.max(upvotes - 1, 0);
      setUpvotes(newCount);
      await supabase
        .from("feed_posts")
        .update({ upvotes_count: newCount })
        .eq("id", post.id);
    } catch (err) {
      console.warn("Upvote error:", err);
    } finally {
      setUpvoting(false);
    }
  };

  const loadComments = async () => {
    if (loadedComments) return;
    try {
      const { data } = await supabase
        .from("feed_post_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true })
        .limit(50);
      setComments(data || []);
    } catch {
      setComments([]);
    } finally {
      setLoadedComments(true);
    }
  };

  const toggleComments = async () => {
    if (!showComments) await loadComments();
    setShowComments((v) => !v);
  };

  const postComment = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (!commentText.trim() || posting) return;
    setPosting(true);
    try {
      const actor = user?.full_name || (user?.email ? user.email.split("@")[0] : "zeni");
      const { data } = await supabase
        .from("feed_post_comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          actor_name: actor,
          content: commentText.trim(),
        })
        .select()
        .single();
      if (data) setComments((prev) => [...prev, data]);
      setCommentText("");
    } catch (err) {
      console.warn("Comment error:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm mb-4">
      <div className="px-5 pt-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0"
            style={{ background: "#1A1A1A" }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-[#1A1A1A]">{name}</p>
              <span className="text-[12px] text-[#B0B8C1]">· {timeAgo(post.created_date)}</span>
            </div>
            {post.content && (
              <p className="mt-2 text-[14px] text-[#333] whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            )}
            {post.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden border border-[#EBEBEB] bg-[#F7F8FA] max-w-sm">
                <Image src={post.image_url} alt="피드 이미지" className="w-full" fittingType="fit" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-5 py-3 border-t border-[#F3F4F6] mt-3">
        {/* Upvote */}
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
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50 ${
            liked
              ? "text-[#FF4D4F]"
              : "bg-[#F7F8FA] text-[#555] hover:bg-[#EBEBEB]"
          }`}
          aria-label="하트"
        >
          <Heart className="w-3.5 h-3.5" fill={liked ? "#FF4D4F" : "none"} stroke={liked ? "#FF4D4F" : "currentColor"} />
          {likes > 0 && <span>{likes}</span>}
        </button>

        {/* Comments toggle */}
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#F7F8FA] text-[#555] hover:bg-[#EBEBEB] transition-colors ml-auto"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          댓글
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-[#F3F4F6] px-5 pb-4 pt-3">
          {comments.length === 0 ? (
            <p className="text-[13px] text-[#B0B8C1] py-2">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
          ) : (
            <div className="space-y-3 mb-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                    style={{ background: "#555" }}
                  >
                    {(c.actor_name || "Z").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-[#1A1A1A]">{c.actor_name}</span>
                    <span className="text-[11px] text-[#B0B8C1] ml-1.5">{timeAgo(c.created_at)}</span>
                    <p className="text-[13px] text-[#333] mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex gap-2 items-center mt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && postComment()}
              placeholder="댓글을 입력하세요..."
              className="flex-1 px-3 py-2 text-[13px] border border-[#EBEBEB] rounded-lg bg-[#F7F8FA] focus:outline-none focus:border-[#333] transition-colors"
            />
            <button
              onClick={postComment}
              disabled={posting || !commentText.trim()}
              className="p-2 rounded-lg bg-[#1A1A1A] text-white disabled:opacity-40 transition-opacity hover:opacity-80"
            >
              {posting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}