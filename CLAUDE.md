# Sogon.vc - VC 투자 후기 공유 플랫폼

## 프로젝트 개요
창업자들이 VC 투자 경험을 공유하고, 자신에게 맞는 VC를 선별할 수 있도록 돕는 정보 공유 플랫폼입니다.

## 현재 작업 디렉토리
```
/Users/kevin/Codes/01_Multiful/sogon.vc
```

## GitHub 정보
- **Repository**: eardori/sogon.vc (kevinoh87 계정에서 이전됨)
- **배포 URL**: https://sogonvc.multiful.ai (Netlify)

## 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payment**: Stripe (USD 결제, Restricted Key 사용)
- **External APIs**: 국세청 API, 비즈노 API
- **Hosting**: Netlify

## 중요 환경 변수 (이미 설정됨)
```bash
# .env.local에 모두 설정되어 있음
- Supabase 키 3개 (URL, Anon Key, Service Role Key)
- NTS_API_KEY: 국세청 API (사업자등록번호 상태 확인)
- BIZNO_API_KEY: 비즈노 API (회사명 조회, 일일 200건 무료)
- Stripe 키 2개 (Restricted Key 사용)
```

## 핵심 기능 구현 현황

### ✅ 완료된 기능
1. **사업자등록번호 2단계 검증**
   - 1단계: 국세청 API로 상태 확인
   - 2단계: 비즈노 API로 회사명 조회
   - 위치: `/src/app/api/verify-business/route.ts`

2. **VC 이메일 화이트리스트 검증**
   - `vcs` 테이블의 `email_domain` 필드 활용
   - 위치: `/src/app/api/verify-vc-email/route.ts`

3. **회원가입 개선**
   - 창업자/VC는 회사 이메일 필수 안내
   - 위치: `/src/app/auth/signup/page.tsx`

4. **TypeScript 타입 오류 해결**
   - Stripe webhook route 수정 완료
   - `createClient` 사용 (not `createServerClient`)

### ⏳ 구현 예정
- 후기 작성/조회 기능
- 크레딧 시스템 (작성 +5, 조회 -1)
- 댓글 시스템
- VC 답변 기능

## 사용자 유형
1. **예비창업자** (`prospective_founder`): 제한적 기능
2. **창업자** (`founder`): 후기 작성 가능, 사업자등록번호 필수
3. **일반 VC** (`vc_general`): 실명 답변, 이메일 화이트리스트
4. **익명 VC** (`vc_anonymous`): 익명 답변

## 데이터베이스 구조
- 11개 테이블 (profiles, vcs, reviews, comments 등)
- Row Level Security (RLS) 활성화
- 상세 내용: `/docs/DATABASE_SCHEMA.md`

## 프로젝트 구조
```
sogon.vc/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── verify-business/  # 사업자등록번호 검증
│   │   │   ├── verify-vc-email/  # VC 이메일 검증
│   │   │   └── stripe/           # Stripe 웹훅
│   │   └── auth/               # 인증 페이지
│   └── components/             # React 컴포넌트
├── supabase/
│   └── schema.sql             # DB 스키마
├── docs/                       # 문서
│   ├── DATABASE_SCHEMA.md     # DB 구조 상세
│   ├── DEPLOYMENT.md          # 배포 가이드
│   └── README.md              # 문서 인덱스
├── CLAUDE.md                  # 이 파일 (AI 컨텍스트)
└── PRD.md                     # 제품 요구사항
```

## 테스트 정보
- **사업자등록번호**: `123`으로 시작하는 번호 자동 승인 (테스트 모드)
- **VC 이메일**: `@abc-ventures.com`, `@xyz-capital.com` 도메인 허용

## 현재 개발 서버
- 개발 서버 실행 중일 수 있음 (포트 3000)
- 확인: `npm run dev`

## 주의사항
1. **환경 변수**: `.env.local`에 실제 API 키 포함 (절대 커밋 금지)
2. **GitHub 계정**: eardori 계정 사용 (kevinoh87 아님)
3. **Stripe**: Restricted Key 사용으로 프로젝트 격리
4. **비즈노 API**: 일일 200건 제한

## 빠른 명령어
```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 트러블슈팅
- **TypeScript 오류**: `createClient` 사용 (Supabase)
- **빌드 실패**: 환경 변수 확인
- **API 실패**: 폴백 모드 동작 확인

## 다음 작업 제안
1. 후기 CRUD 기능 구현
2. 크레딧 시스템 통합
3. Stripe 결제 플로우 완성
4. 모바일 반응형 개선

---
*최종 업데이트: 2025-01-13*
*유지보수: eardori@github*