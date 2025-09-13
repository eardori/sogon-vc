# Sogon.vc 프로젝트 컨텍스트

## 프로젝트 개요
Sogon.vc는 창업자들이 VC(벤처캐피털) 투자 경험을 공유하고, 자신에게 맞는 VC를 선별할 수 있도록 돕는 정보 공유 플랫폼입니다.

### 핵심 가치 제안
- **창업자**: 다른 창업자의 실제 투자 경험을 통해 VC를 사전에 파악
- **VC**: 익명 피드백을 통한 개선 기회 및 브랜드 관리
- **커뮤니티**: 투명하고 건전한 투자 생태계 구축

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 커스텀 컴포넌트 + shadcn/ui
- **Hosting**: Netlify (https://sogonvc.multiful.ai)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payment**: Stripe (USD 결제)
- **Email**: 추후 설정 예정

### External APIs
- **국세청 API**: 사업자등록번호 상태 확인
- **비즈노 API**: 회사명 조회 (일일 200건 무료)

## 주요 기능

### 1. 사용자 시스템
#### 사용자 유형
- **예비창업자** (`prospective_founder`): 투자 준비 중, 제한적 기능
- **창업자** (`founder`): 후기 작성 가능, 사업자등록번호 검증 필수
- **일반 VC** (`vc_general`): 실명 답변 가능, 이메일 화이트리스트 검증
- **익명 VC** (`vc_anonymous`): 익명 답변 가능

#### 인증 시스템
- **창업자**: 사업자등록번호 2단계 검증
  1. 국세청 API: 유효성 및 상태 확인
  2. 비즈노 API: 실제 회사명 조회
- **VC**: 이메일 도메인 화이트리스트 검증

### 2. 크레딧 시스템
- 신규 가입 시 1크레딧 제공
- 후기 작성 시 +5크레딧 획득
- 후기 조회 시 -1크레딧 사용
- 후기 삭제 시 -3크레딧 차감
- 본인 작성 후기는 크레딧 없이 조회 가능

### 3. 구독 시스템 (Stripe)
- **예비창업자**: $4.99/월
- **창업자**: $9.99/월 
- **일반 VC**: $49.99/월
- **익명 VC**: $299.99/월
- 베타 기간 중 무료 가입 가능

### 4. 후기 시스템
- 13가지 평가 태그 (긍정/부정)
- 투자 라운드 및 시기 기록
- VC 답변 기능
- 댓글 시스템 (구독자 전용)
- 좋아요/싫어요 기능

## 환경 변수 설정

### 필수 환경 변수 (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# External APIs
NTS_API_KEY=                    # 국세청 API (공공데이터포털)
BIZNO_API_KEY=                   # 비즈노 API (회사명 조회)
BUSINESS_VERIFICATION_TEST_MODE=false

# Stripe
STRIPE_SECRET_KEY=               # Restricted key 사용 권장
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=           # Webhook 설정 시

# Email
EMAIL_FROM=noreply@sogon.vc
```

## 프로젝트 구조
```
sogon.vc/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── verify-business/  # 사업자등록번호 검증
│   │   │   ├── verify-vc-email/  # VC 이메일 검증
│   │   │   └── stripe/           # Stripe 웹훅
│   │   ├── auth/               # 인증 페이지
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/          # 대시보드
│   │   ├── reviews/            # 후기 페이지
│   │   └── page.tsx           # 메인 페이지
│   ├── components/             # React 컴포넌트
│   ├── lib/                    # 유틸리티 함수
│   └── styles/                 # 전역 스타일
├── supabase/
│   └── schema.sql             # 데이터베이스 스키마
├── docs/                       # 문서
│   ├── DATABASE_SCHEMA.md     # DB 스키마 문서
│   └── DEPLOYMENT.md          # 배포 가이드
├── PRD.md                     # 제품 요구사항 문서
├── PROJECT_CONTEXT.md         # 이 문서
└── README.md                  # 프로젝트 소개

```

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example`을 참고하여 `.env.local` 파일 생성

### 3. Supabase 설정
1. Supabase 프로젝트 생성
2. `supabase/schema.sql` 실행하여 DB 스키마 구성
3. 환경 변수에 Supabase 키 추가

### 4. 외부 API 설정
- **국세청 API**: [공공데이터포털](https://www.data.go.kr/data/15081808/openapi.do)에서 발급
- **비즈노 API**: [비즈노](https://bizno.net)에서 가입 후 API 키 발급

### 5. 개발 서버 실행
```bash
npm run dev
```

## 배포

### Netlify 배포
1. GitHub 저장소 연결 (eardori 계정)
2. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. 환경 변수 설정 (Netlify Dashboard)
4. 커스텀 도메인 설정: sogonvc.multiful.ai

### 환경 변수 체크리스트
- [ ] Supabase 키 3개
- [ ] 국세청 API 키
- [ ] 비즈노 API 키
- [ ] Stripe 키 2개 (+ Webhook Secret)
- [ ] 기타 설정값

## 주요 이슈 및 해결 방법

### 1. TypeScript 타입 오류
- Supabase 클라이언트: `createClient` 사용 (not `createServerClient`)
- Enum 타입: 명시적 타입 캐스팅 필요

### 2. 사업자등록번호 검증
- 체크섬 알고리즘 구현
- 국세청 API 실패 시 폴백 모드
- 테스트 모드: `123`으로 시작하는 번호 자동 승인

### 3. VC 이메일 검증
- `vcs` 테이블의 `email_domain` 필드 활용
- 화이트리스트에 없으면 관리자 승인 필요

## 보안 고려사항

### 1. API 키 관리
- Stripe Restricted Key 사용 (프로젝트별 격리)
- 환경 변수로 관리, 절대 커밋하지 않음
- `.env.local`은 `.gitignore`에 포함

### 2. 데이터베이스 보안
- Row Level Security (RLS) 활성화
- Service Role Key는 서버 사이드에서만 사용
- 사용자별 권한 정책 적용

### 3. 인증 보안
- 이메일 인증 필수
- 사업자등록번호 실시간 검증
- VC 이메일 화이트리스트

## 향후 계획

### Phase 1 (현재)
- [x] 기본 회원가입/로그인
- [x] 사업자등록번호 검증
- [x] VC 이메일 화이트리스트
- [x] 기본 UI 구성
- [ ] 후기 작성/조회 기능
- [ ] 크레딧 시스템 구현

### Phase 2
- [ ] Stripe 결제 구현
- [ ] 댓글 시스템
- [ ] VC 답변 기능
- [ ] 신고 시스템

### Phase 3
- [ ] 검색 및 필터링
- [ ] 통계 대시보드
- [ ] 모바일 앱
- [ ] 국제화 (i18n)

## 문의 및 지원

### GitHub Repository
- Main: https://github.com/eardori/sogon.vc
- Issues: 버그 리포트 및 기능 요청

### 관련 문서
1. **PRD.md**: 제품 요구사항 명세
2. **DATABASE_SCHEMA.md**: 데이터베이스 구조 상세
3. **DEPLOYMENT.md**: 배포 가이드
4. **.env.example**: 환경 변수 템플릿

### 테스트 계정
- 예비창업자: 일반 이메일로 가입 가능
- 창업자: 사업자등록번호 `123-45-67890` 사용 (테스트 모드)
- VC: `@abc-ventures.com` 도메인 이메일 사용

## 트러블슈팅

### 빌드 실패
```bash
# TypeScript 타입 체크
npm run type-check

# 린트 확인
npm run lint
```

### API 연결 실패
1. 환경 변수 확인
2. API 키 유효성 확인
3. 네트워크 연결 확인
4. 폴백 모드 동작 확인

### 데이터베이스 오류
1. Supabase 대시보드 확인
2. RLS 정책 검토
3. 마이그레이션 상태 확인

---

*Last Updated: 2025-01-13*
*Version: 1.0.0*
*Maintainer: eardori@github*