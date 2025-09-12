# sogon.vc - VC 후기 공유 플랫폼

창업자들이 VC와의 실제 투자 경험을 공유하여, 다른 창업자들이 자신의 스타일과 맞는 VC를 선별할 수 있도록 돕는 플랫폼입니다.

## 🚀 기술 스택

- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS
- **백엔드**: Supabase (PostgreSQL + Auth + Edge Functions)
- **호스팅**: Netlify (프론트엔드) + Supabase (백엔드)
- **상태 관리**: Zustand, React Query
- **스타일링**: Tailwind CSS + Headless UI

## 📋 주요 기능

- **검증된 후기 시스템**: 사업자등록번호 기반 창업자 인증
- **익명화 시스템**: 회사명 자동 익명화 (A사, B사 등)
- **크레딧 시스템**: 후기 작성으로 열람 권한 획득
- **VC 평가 태그**: 13개 항목의 세밀한 VC 평가
- **구독 시스템**: 4가지 회원 유형별 차별화된 서비스
- **품질 관리**: 자동/수동 검증을 통한 고품질 콘텐츠 유지

## 🛠 개발 환경 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/kevinoh87/sogon-vc.git
cd sogon-vc
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참조하여 `.env.local` 파일을 생성하세요:

```bash
cp .env.example .env.local
```

필수 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 역할 키

### 3. Supabase 데이터베이스 설정

Supabase 프로젝트에서 SQL Editor를 열고 `supabase/schema.sql` 파일의 내용을 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # UI 기본 컴포넌트
│   └── ...
├── lib/                # 라이브러리 설정 및 유틸리티
├── types/              # TypeScript 타입 정의
├── hooks/              # 커스텀 React 훅
├── utils/              # 유틸리티 함수
└── stores/             # 상태 관리 (Zustand)
```

## 🚀 배포

### Netlify 배포

1. Netlify에 레포지토리 연결
2. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. 환경 변수 설정
4. 배포 실행

### Supabase 설정

1. Supabase 프로젝트 생성
2. 데이터베이스 스키마 적용
3. Auth 설정 및 RLS 정책 확인
4. Edge Functions 배포 (필요시)

## 📚 문서

- [PRD (Product Requirements Document)](PRD.md)
- [API 문서](docs/api.md) (예정)
- [배포 가이드](docs/deployment.md) (예정)

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트 관련 문의: [이메일 주소]

프로젝트 링크: [https://github.com/kevinoh87/sogon-vc](https://github.com/kevinoh87/sogon-vc)