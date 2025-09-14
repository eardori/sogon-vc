-- credit_transactions 테이블 RLS 정책 수정

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

-- RLS 활성화 확인
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;