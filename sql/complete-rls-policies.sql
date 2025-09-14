-- Complete RLS Policies for sogon.vc

-- ========================================
-- 1. profiles 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 사용자가 자신의 프로필을 조회할 수 있도록 허용
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 사용자가 자신의 프로필을 수정할 수 있도록 허용
CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 사용자가 자신의 프로필을 생성할 수 있도록 허용
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. reviews 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view published reviews" ON reviews;
DROP POLICY IF EXISTS "Founders can create reviews" ON reviews;
DROP POLICY IF EXISTS "Authors can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Authors can delete their own reviews" ON reviews;

-- 게시된 후기는 누구나 조회 가능
CREATE POLICY "Anyone can view published reviews" 
ON reviews 
FOR SELECT 
USING (status = 'published');

-- 창업자만 후기 작성 가능
CREATE POLICY "Founders can create reviews" 
ON reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'founder'
  )
);

-- 작성자만 자신의 후기 수정 가능
CREATE POLICY "Authors can update their own reviews" 
ON reviews 
FOR UPDATE 
USING (auth.uid() = author_id);

-- 작성자만 자신의 후기 삭제 가능
CREATE POLICY "Authors can delete their own reviews" 
ON reviews 
FOR DELETE 
USING (auth.uid() = author_id);

-- RLS 활성화
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. credit_transactions 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can insert their own credit transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can view their own credit transactions" ON credit_transactions;

-- 사용자가 자신의 크레딧 거래를 생성할 수 있도록 허용
CREATE POLICY "Users can insert their own credit transactions" 
ON credit_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 크레딧 거래를 조회할 수 있도록 허용
CREATE POLICY "Users can view their own credit transactions" 
ON credit_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS 활성화
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. review_views 테이블 RLS 정책
-- ========================================

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

-- RLS 활성화
ALTER TABLE review_views ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. review_reactions 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can manage their own reactions" ON review_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON review_reactions;

-- 사용자가 자신의 반응을 관리할 수 있도록 허용
CREATE POLICY "Users can manage their own reactions" 
ON review_reactions 
FOR ALL 
USING (auth.uid() = user_id);

-- 누구나 반응 조회 가능
CREATE POLICY "Anyone can view reactions" 
ON review_reactions 
FOR SELECT 
USING (true);

-- RLS 활성화
ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. vcs 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view active VCs" ON vcs;

-- 활성화된 VC는 누구나 조회 가능
CREATE POLICY "Anyone can view active VCs" 
ON vcs 
FOR SELECT 
USING (is_active = true);

-- RLS 활성화
ALTER TABLE vcs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. vc_personnel 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view VC personnel" ON vc_personnel;
DROP POLICY IF EXISTS "Users can insert VC personnel" ON vc_personnel;

-- 누구나 VC 담당자 정보 조회 가능
CREATE POLICY "Anyone can view VC personnel" 
ON vc_personnel 
FOR SELECT 
USING (true);

-- 로그인한 사용자는 담당자 정보 생성 가능
CREATE POLICY "Users can insert VC personnel" 
ON vc_personnel 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS 활성화
ALTER TABLE vc_personnel ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 8. vc_responses 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view VC responses" ON vc_responses;
DROP POLICY IF EXISTS "VC members can create responses" ON vc_responses;

-- 누구나 VC 답변 조회 가능
CREATE POLICY "Anyone can view VC responses" 
ON vc_responses 
FOR SELECT 
USING (true);

-- VC 회원만 답변 작성 가능
CREATE POLICY "VC members can create responses" 
ON vc_responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type IN ('vc_general', 'vc_anonymous')
  )
);

-- RLS 활성화
ALTER TABLE vc_responses ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. comments 테이블 RLS 정책 (있다면)
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Subscribers can view comments" ON comments;
DROP POLICY IF EXISTS "Subscribers can create comments" ON comments;

-- 구독자만 댓글 조회 가능
CREATE POLICY "Subscribers can view comments" 
ON comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.subscription_status = 'active'
  )
);

-- 구독자만 댓글 작성 가능
CREATE POLICY "Subscribers can create comments" 
ON comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.subscription_status = 'active'
  )
);

-- RLS 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;