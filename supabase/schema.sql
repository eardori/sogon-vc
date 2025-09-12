-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_type AS ENUM ('prospective_founder', 'founder', 'vc_general', 'vc_anonymous');
CREATE TYPE investment_round AS ENUM ('angel', 'seed', 'pre_a', 'series_a', 'series_b', 'series_c', 'series_d', 'other');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete');
CREATE TYPE review_status AS ENUM ('published', 'screened', 'deleted');

-- User profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_type user_type NOT NULL,
    company_name VARCHAR(255),
    anonymous_company_name VARCHAR(10), -- A사, B사 등
    business_registration_number VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    credits INTEGER DEFAULT 1, -- 신규 가입자는 1 크레딧 제공
    subscription_status subscription_status DEFAULT NULL,
    subscription_plan VARCHAR(50),
    subscription_expires_at TIMESTAMPTZ,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VCs table
CREATE TABLE vcs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    aum BIGINT, -- Assets Under Management
    email_domain VARCHAR(100), -- 화이트리스트용 도메인
    main_investment_stages investment_round[],
    website VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VC personnel table (담당자 관리)
CREATE TABLE vc_personnel (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vc_id UUID REFERENCES vcs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE, -- NULL이면 현직
    current_company VARCHAR(255), -- 이직한 경우 현재 회사
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VC addition requests table
CREATE TABLE vc_addition_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vc_name VARCHAR(255) NOT NULL,
    email_domain VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vc_id UUID REFERENCES vcs(id) ON DELETE CASCADE,
    personnel_id UUID REFERENCES vc_personnel(id),
    
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    investment_round investment_round NOT NULL,
    investment_year INTEGER NOT NULL,
    investment_month INTEGER NOT NULL,
    
    -- Evaluation tags (13개 항목)
    tag_communication BOOLEAN, -- true: 긍정, false: 부정
    tag_consistency BOOLEAN,
    tag_understanding BOOLEAN,
    tag_leadership BOOLEAN,
    tag_philosophy BOOLEAN,
    tag_support BOOLEAN,
    tag_empathy BOOLEAN,
    tag_portfolio_interest BOOLEAN,
    tag_openness BOOLEAN, -- 개방적 vs 보수적
    tag_optimism BOOLEAN, -- 낙관적 vs 비관적
    tag_honesty BOOLEAN,
    tag_politeness BOOLEAN,
    tag_intelligence BOOLEAN,
    
    status review_status DEFAULT 'published',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VC responses table
CREATE TABLE vc_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT TRUE, -- 공식 답변 여부
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT one_response_per_review UNIQUE(review_id, author_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 대댓글용
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes/Dislikes table
CREATE TABLE review_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL, -- true: like, false: dislike
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_reaction UNIQUE(review_id, user_id)
);

-- Reports table
CREATE TABLE reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    evidence TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT report_target CHECK (
        (review_id IS NOT NULL AND comment_id IS NULL) OR
        (review_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Credit transactions table
CREATE TABLE credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- +1 for earning, -1 for spending
    transaction_type VARCHAR(50) NOT NULL, -- 'earned_write', 'spent_read', 'deducted_delete'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review views table (크레딧 사용 기록)
CREATE TABLE review_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_view UNIQUE(user_id, review_id)
);

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_views ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for reviews
CREATE POLICY "Anyone can view published reviews" ON reviews FOR SELECT USING (status = 'published');
CREATE POLICY "Founders can create reviews" ON reviews FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'founder')
);
CREATE POLICY "Authors can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = author_id);

-- Policies for VC responses
CREATE POLICY "Anyone can view VC responses" ON vc_responses FOR SELECT USING (true);
CREATE POLICY "VCs can create responses" ON vc_responses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('vc_general', 'vc_anonymous'))
);

-- Policies for comments
CREATE POLICY "Subscribers can view comments" ON comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_status = 'active')
);
CREATE POLICY "Subscribers can create comments" ON comments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_status = 'active')
);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vcs_updated_at BEFORE UPDATE ON vcs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to generate anonymous company names
CREATE OR REPLACE FUNCTION generate_anonymous_company_name()
RETURNS TEXT AS $$
DECLARE
    base_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    result TEXT;
    counter INTEGER := 1;
    exists_check BOOLEAN := TRUE;
BEGIN
    -- Single letter names first (A사, B사, ..., Z사)
    FOR i IN 1..26 LOOP
        result := substr(base_chars, i, 1) || '사';
        SELECT EXISTS(SELECT 1 FROM profiles WHERE anonymous_company_name = result) INTO exists_check;
        IF NOT exists_check THEN
            RETURN result;
        END IF;
    END LOOP;
    
    -- Double letter names (AA사, AB사, ...)
    FOR i IN 1..26 LOOP
        FOR j IN 1..26 LOOP
            result := substr(base_chars, i, 1) || substr(base_chars, j, 1) || '사';
            SELECT EXISTS(SELECT 1 FROM profiles WHERE anonymous_company_name = result) INTO exists_check;
            IF NOT exists_check THEN
                RETURN result;
            END IF;
        END LOOP;
    END LOOP;
    
    -- Fallback to numbered format
    LOOP
        result := 'Company' || counter::TEXT;
        SELECT EXISTS(SELECT 1 FROM profiles WHERE anonymous_company_name = result) INTO exists_check;
        IF NOT exists_check THEN
            RETURN result;
        END IF;
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign anonymous company names
CREATE OR REPLACE FUNCTION assign_anonymous_company_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_type = 'founder' AND NEW.anonymous_company_name IS NULL THEN
        NEW.anonymous_company_name := generate_anonymous_company_name();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_anonymous_name_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_anonymous_company_name();

-- Insert sample data
INSERT INTO vcs (name, aum, email_domain, main_investment_stages, website) VALUES
('ABC 벤처스', 50000000000, 'abc-ventures.com', ARRAY['seed', 'series_a']::investment_round[], 'https://abc-ventures.com'),
('XYZ 캐피털', 30000000000, 'xyz-capital.com', ARRAY['pre_a', 'series_a', 'series_b']::investment_round[], 'https://xyz-capital.com'),
('DEF 인베스트먼츠', 100000000000, 'def-investments.com', ARRAY['series_a', 'series_b', 'series_c']::investment_round[], 'https://def-investments.com');

-- Insert sample VC personnel
INSERT INTO vc_personnel (vc_id, name, position, start_date) 
SELECT id, '김대표', 'Managing Partner', '2020-01-01' FROM vcs WHERE name = 'ABC 벤처스';

INSERT INTO vc_personnel (vc_id, name, position, start_date)
SELECT id, '박이사', 'Principal', '2021-03-01' FROM vcs WHERE name = 'XYZ 캐피털';