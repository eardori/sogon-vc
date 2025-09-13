-- profiles 테이블의 RLS 정책 수정
-- 사용자가 자신의 프로필을 생성할 수 있도록 허용

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- 새로운 정책 생성

-- 1. 사용자는 자신의 프로필을 생성할 수 있음
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. 사용자는 자신의 프로필을 조회할 수 있음
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. 사용자는 자신의 프로필을 수정할 수 있음
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS 활성화 확인
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;