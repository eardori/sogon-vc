-- review_views 테이블 RLS 정책 수정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can insert their own review views" ON review_views;
DROP POLICY IF EXISTS "Users can view their own review views" ON review_views;

-- 사용자가 자신의 조회 기록을 생성할 수 있도록 허용
CREATE POLICY "Users can insert their own review views" 
ON review_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 조회 기록을 조회할 수 있도록 허용
CREATE POLICY "Users can view their own review views" 
ON review_views 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS 활성화 확인
ALTER TABLE review_views ENABLE ROW LEVEL SECURITY;