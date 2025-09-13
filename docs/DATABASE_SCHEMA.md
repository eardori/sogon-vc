# Sogon.vc Database Schema Documentation

## Overview
Sogon.vc는 PostgreSQL 기반의 Supabase를 사용하며, Row Level Security (RLS)를 통해 데이터 보안을 관리합니다.

## Enum Types

### user_type
사용자 유형을 정의합니다.
- `prospective_founder`: 예비창업자
- `founder`: 창업자 (후기 작성 가능)
- `vc_general`: 일반 VC (실명 답변)
- `vc_anonymous`: 익명 VC

### investment_round
투자 라운드 단계를 정의합니다.
- `angel`: 엔젤 투자
- `seed`: 시드 투자
- `pre_a`: Pre-A 라운드
- `series_a`: Series A
- `series_b`: Series B
- `series_c`: Series C
- `series_d`: Series D
- `other`: 기타

### subscription_status
구독 상태를 정의합니다.
- `active`: 활성 구독
- `canceled`: 취소됨
- `past_due`: 연체
- `incomplete`: 미완료

### review_status
후기 상태를 정의합니다.
- `published`: 게시됨
- `screened`: 검토 중
- `deleted`: 삭제됨

## Main Tables

### 1. profiles
사용자 프로필 정보를 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key (auth.users 참조) |
| email | VARCHAR(255) | 이메일 주소 (Unique) |
| user_type | user_type | 사용자 유형 |
| company_name | VARCHAR(255) | 회사명 |
| anonymous_company_name | VARCHAR(10) | 익명 회사명 (A사, B사 등) |
| business_registration_number | VARCHAR(50) | 사업자등록번호 |
| is_verified | BOOLEAN | 인증 여부 |
| credits | INTEGER | 보유 크레딧 (기본값: 1) |
| subscription_status | subscription_status | 구독 상태 |
| subscription_plan | VARCHAR(50) | 구독 플랜 |
| subscription_expires_at | TIMESTAMPTZ | 구독 만료일 |
| is_blacklisted | BOOLEAN | 블랙리스트 여부 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

### 2. vcs
벤처캐피털 정보를 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| name | VARCHAR(255) | VC 이름 (Unique) |
| aum | BIGINT | 운용자산 규모 |
| email_domain | VARCHAR(100) | 이메일 도메인 (화이트리스트용) |
| main_investment_stages | investment_round[] | 주요 투자 단계 |
| website | VARCHAR(255) | 웹사이트 |
| description | TEXT | 설명 |
| is_active | BOOLEAN | 활성 상태 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

**특징:**
- `email_domain` 필드를 통해 VC 직원의 이메일을 화이트리스트로 관리
- 예: 'abc-ventures.com' 도메인이 등록되면 해당 도메인 이메일로 VC 회원가입 가능

### 3. vc_personnel
VC 담당자 정보를 관리합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| vc_id | UUID | VC ID (Foreign Key) |
| name | VARCHAR(100) | 담당자 이름 |
| position | VARCHAR(100) | 직책 |
| start_date | DATE | 입사일 |
| end_date | DATE | 퇴사일 (NULL이면 현직) |
| current_company | VARCHAR(255) | 현재 회사 (이직한 경우) |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

### 4. reviews
투자 후기를 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| author_id | UUID | 작성자 ID (Foreign Key) |
| vc_id | UUID | VC ID (Foreign Key) |
| personnel_id | UUID | 담당자 ID (Foreign Key) |
| title | VARCHAR(255) | 제목 |
| content | TEXT | 내용 |
| investment_round | investment_round | 투자 라운드 |
| investment_year | INTEGER | 투자 연도 |
| investment_month | INTEGER | 투자 월 |
| tag_communication | BOOLEAN | 소통 태그 (긍정/부정) |
| tag_consistency | BOOLEAN | 일관성 태그 |
| tag_understanding | BOOLEAN | 이해도 태그 |
| tag_leadership | BOOLEAN | 리더십 태그 |
| tag_philosophy | BOOLEAN | 철학 태그 |
| tag_support | BOOLEAN | 지원 태그 |
| tag_empathy | BOOLEAN | 공감 태그 |
| tag_portfolio_interest | BOOLEAN | 포트폴리오 관심 태그 |
| tag_openness | BOOLEAN | 개방성 태그 |
| tag_optimism | BOOLEAN | 낙관성 태그 |
| tag_honesty | BOOLEAN | 정직성 태그 |
| tag_politeness | BOOLEAN | 예의 태그 |
| tag_intelligence | BOOLEAN | 지능 태그 |
| status | review_status | 상태 |
| view_count | INTEGER | 조회수 |
| like_count | INTEGER | 좋아요 수 |
| dislike_count | INTEGER | 싫어요 수 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

### 5. vc_responses
VC의 후기 답변을 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| review_id | UUID | 후기 ID (Foreign Key) |
| author_id | UUID | 작성자 ID (Foreign Key) |
| content | TEXT | 답변 내용 |
| is_official | BOOLEAN | 공식 답변 여부 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

**제약사항:**
- `UNIQUE(review_id, author_id)`: 한 후기에 대해 작성자당 하나의 답변만 가능

### 6. comments
댓글을 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| review_id | UUID | 후기 ID (Foreign Key) |
| parent_id | UUID | 부모 댓글 ID (대댓글용) |
| author_id | UUID | 작성자 ID (Foreign Key) |
| content | TEXT | 댓글 내용 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

### 7. review_reactions
후기에 대한 좋아요/싫어요를 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| review_id | UUID | 후기 ID (Foreign Key) |
| user_id | UUID | 사용자 ID (Foreign Key) |
| is_like | BOOLEAN | true: 좋아요, false: 싫어요 |
| created_at | TIMESTAMPTZ | 생성일시 |

**제약사항:**
- `UNIQUE(review_id, user_id)`: 사용자당 하나의 반응만 가능

### 8. credit_transactions
크레딧 거래 내역을 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | 사용자 ID (Foreign Key) |
| review_id | UUID | 관련 후기 ID |
| amount | INTEGER | 거래량 (+1: 획득, -1: 사용) |
| transaction_type | VARCHAR(50) | 거래 유형 |
| created_at | TIMESTAMPTZ | 생성일시 |

**거래 유형:**
- `earned_write`: 후기 작성으로 획득
- `spent_read`: 후기 조회로 사용
- `deducted_delete`: 후기 삭제로 차감

### 9. review_views
후기 조회 기록 (크레딧 사용)을 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | 사용자 ID (Foreign Key) |
| review_id | UUID | 후기 ID (Foreign Key) |
| created_at | TIMESTAMPTZ | 조회일시 |

**제약사항:**
- `UNIQUE(user_id, review_id)`: 중복 조회 방지

### 10. reports
신고 내역을 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| reporter_id | UUID | 신고자 ID (Foreign Key) |
| review_id | UUID | 신고된 후기 ID |
| comment_id | UUID | 신고된 댓글 ID |
| category | VARCHAR(50) | 신고 카테고리 |
| reason | TEXT | 신고 사유 |
| evidence | TEXT | 증거 자료 |
| status | VARCHAR(20) | 처리 상태 |
| admin_notes | TEXT | 관리자 메모 |
| created_at | TIMESTAMPTZ | 신고일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

### 11. vc_addition_requests
VC 추가 요청을 저장합니다.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| requested_by | UUID | 요청자 ID (Foreign Key) |
| vc_name | VARCHAR(255) | VC 이름 |
| email_domain | VARCHAR(100) | 이메일 도메인 |
| website | VARCHAR(255) | 웹사이트 |
| description | TEXT | 설명 |
| status | VARCHAR(20) | 상태 (pending/approved/rejected) |
| admin_notes | TEXT | 관리자 메모 |
| created_at | TIMESTAMPTZ | 요청일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

## Row Level Security (RLS) Policies

### profiles 테이블
- **SELECT**: 사용자는 자신의 프로필만 조회 가능
- **UPDATE**: 사용자는 자신의 프로필만 수정 가능

### reviews 테이블
- **SELECT**: 게시된 후기는 누구나 조회 가능
- **INSERT**: 창업자(founder)만 작성 가능
- **UPDATE**: 작성자만 수정 가능

### vc_responses 테이블
- **SELECT**: 누구나 조회 가능
- **INSERT**: VC 회원만 작성 가능

### comments 테이블
- **SELECT**: 구독자만 조회 가능
- **INSERT**: 구독자만 작성 가능

## Functions & Triggers

### 1. update_updated_at_column()
레코드 수정 시 `updated_at` 필드를 자동으로 업데이트합니다.

### 2. generate_anonymous_company_name()
창업자 가입 시 익명 회사명(A사, B사...)을 자동 생성합니다.
- 단일 문자 (A-Z) 사용
- 모두 사용 시 이중 문자 (AA, AB...) 사용
- 최종 폴백: Company1, Company2...

### 3. assign_anonymous_company_name()
창업자 프로필 생성 시 자동으로 익명 회사명을 할당합니다.

## 인덱스 및 성능 최적화
- `profiles.email`: UNIQUE 인덱스
- `vcs.name`: UNIQUE 인덱스
- `vcs.email_domain`: 화이트리스트 검색용 인덱스
- `reviews.vc_id`, `reviews.author_id`: 외래키 인덱스
- `review_views(user_id, review_id)`: UNIQUE 복합 인덱스

## 보안 고려사항
1. **RLS 활성화**: 모든 민감한 테이블에 RLS 적용
2. **Service Role Key**: 서버 사이드에서만 사용
3. **이메일 도메인 검증**: VC 회원가입 시 화이트리스트 검증
4. **사업자등록번호 검증**: 창업자 회원가입 시 국세청 API + 비즈노 API 2단계 검증
5. **크레딧 시스템**: 무분별한 조회 방지

## 데이터 무결성
1. **CASCADE 삭제**: 사용자 삭제 시 관련 데이터 자동 삭제
2. **UNIQUE 제약**: 중복 방지 (이메일, VC 이름 등)
3. **CHECK 제약**: 신고 대상은 후기 또는 댓글 중 하나만 가능
4. **트리거**: updated_at 자동 업데이트, 익명 회사명 자동 생성