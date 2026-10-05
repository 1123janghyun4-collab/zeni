-- 1. feed_posts 테이블에 likes_count, upvotes_count 컬럼 추가 (없으면)
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS upvotes_count integer DEFAULT 0;

-- 2. projects 테이블에 upvotes_count 컬럼 추가 (없으면)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS upvotes_count integer DEFAULT 0;

-- 3. feed_post_comments 테이블 생성 (인덱스 댓글용)
CREATE TABLE IF NOT EXISTS feed_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_name text NOT NULL DEFAULT '',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. RLS 활성화
ALTER TABLE feed_post_comments ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책: 누구나 읽기 가능
DROP POLICY IF EXISTS "feed_post_comments_read_all" ON feed_post_comments;
CREATE POLICY "feed_post_comments_read_all"
  ON feed_post_comments FOR SELECT USING (true);

-- 6. RLS 정책: 로그인한 사용자만 작성 가능
DROP POLICY IF EXISTS "feed_post_comments_insert_auth" ON feed_post_comments;
CREATE POLICY "feed_post_comments_insert_auth"
  ON feed_post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. RLS 정책: 본인 댓글만 삭제 가능
DROP POLICY IF EXISTS "feed_post_comments_delete_own" ON feed_post_comments;
CREATE POLICY "feed_post_comments_delete_own"
  ON feed_post_comments FOR DELETE
  USING (auth.uid() = user_id);
